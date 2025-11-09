import { NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';

import rateLimiter from '~/lib/simple-rate-limit';
import { getSupabaseServerClient } from '~/lib/supabase/server';

interface ExtractNameRequest {
  prompt: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Check authentication (optional - allows public access)
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Determine rate limit key
    const rateLimitKey = user?.id || 'public';
    const isAuthenticated = !!user;

    // Apply rate limiting (more generous than prompt generation since this is simpler)
    const minuteLimit = rateLimiter.check(
      `name-extract:minute:${rateLimitKey}`,
      isAuthenticated ? 20 : 10, // 20 for authenticated, 10 for public
      60 * 1000, // 1 minute
    );

    if (!minuteLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Please try again in ${Math.ceil((minuteLimit.resetAt - Date.now()) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(isAuthenticated ? 20 : 10),
            'X-RateLimit-Remaining': String(minuteLimit.remaining),
            'X-RateLimit-Reset': new Date(minuteLimit.resetAt).toISOString(),
            'Retry-After': String(
              Math.ceil((minuteLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body = (await request.json()) as ExtractNameRequest;
    const { prompt } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 },
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service configuration error',
          message: 'OpenAI API key is not configured.',
        },
        { status: 503 },
      );
    }

    // Use OpenAI to extract the agent name from the prompt
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that extracts agent names from prompts.
Your task is to identify the name of the AI agent from the given prompt.

Look for patterns like:
- "Your name is [Name]"
- "You are called [Name]"
- "You are [Name]"
- "My name is [Name]"
- Any other indication of what the agent should be called

IMPORTANT RULES:
1. Return ONLY the name, nothing else (e.g., "Sarah" or "Sarah Johnson")
2. If the prompt mentions a role but no specific name (e.g., "You are a sales agent"), return "null"
3. If you cannot find a name, return "null"
4. Do not include titles, roles, or descriptions - ONLY the actual name
5. Capitalize the name properly (e.g., "Sarah" not "sarah")

Examples:
- "Your name is Sarah and you are a helpful assistant" → "Sarah"
- "You are called Alex Johnson" → "Alex Johnson"
- "You are a sales agent for Acme Corp" → "null"
- "Hi, I'm Jamie and I help customers" → "Jamie"`,
        },
        {
          role: 'user',
          content: prompt.trim(),
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 20, // Names are short
    });

    const extractedName = completion.choices[0]?.message?.content?.trim();

    // Return null if no name found or if the model returned "null"
    const name =
      extractedName && extractedName.toLowerCase() !== 'null'
        ? extractedName
        : null;

    return NextResponse.json(
      {
        success: true,
        name,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(isAuthenticated ? 20 : 10),
          'X-RateLimit-Remaining': String(minuteLimit.remaining),
        },
      },
    );
  } catch (error) {
    console.error('Error extracting name:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
