import { NextRequest, NextResponse } from 'next/server';

interface GeneratePromptsRequest {
  description: string;
  fieldType: 'context_prompt' | 'starting_message' | 'both';
  agentName?: string;
  industry?: string;
}

interface GeneratePromptsResponse {
  success: boolean;
  data?: {
    contextPrompt?: string;
    startingMessage?: string;
  };
  error?: string;
}

// Template-based prompt generation
function generateContextPrompt(
  description: string,
  agentName?: string,
  industry?: string,
): string {
  const agentNameText = agentName ? `${agentName}` : 'your AI Agent';
  const industryText = industry ? `in the ${industry} industry, ` : '';

  let prompt = `You are ${agentNameText}, ${industryText}${description}.\n\n`;

  prompt += `Your Role:\n`;
  prompt += `- Fulfill the primary purpose described above\n`;
  prompt += `- Engage naturally and professionally with users\n`;
  prompt += `- Ask clarifying questions when needed\n`;
  prompt += `- Provide helpful and accurate information\n\n`;

  prompt += `Key Capabilities:\n`;
  prompt += `- Listen carefully to understand user needs\n`;
  prompt += `- Communicate clearly and concisely\n`;
  prompt += `- Handle objections or concerns gracefully\n`;
  prompt += `- Guide conversations toward positive outcomes\n\n`;

  prompt += `Conversation Guidelines:\n`;
  prompt += `- Be professional, warm, and conversational\n`;
  prompt += `- Listen actively and show genuine interest\n`;
  prompt += `- Keep responses clear and actionable\n`;
  prompt += `- If you don't know something, admit it honestly\n`;
  prompt += `- Always prioritize the user's needs and satisfaction\n`;
  prompt += `- Maintain a respectful and empathetic tone\n\n`;

  prompt += `Core Principles:\n`;
  prompt += `- Be authentic and genuine\n`;
  prompt += `- Focus on solving problems\n`;
  prompt += `- Build trust through transparency\n`;
  prompt += `- Respect boundaries and preferences\n`;

  return prompt.trim();
}

function generateStartingMessage(
  description: string,
  agentName?: string,
): string {
  // Extract key words from description for personalization
  const keyWords = extractKeyWords(description);
  const greeting = agentName
    ? `Hi! I'm ${agentName}.`
    : 'Hello! ';

  const firstKeyWord = keyWords[0];
  if (firstKeyWord) {
    return `${greeting} I'm here to help with ${firstKeyWord.toLowerCase()}. How can I assist you today?`;
  }

  return `${greeting} How can I help you today?`;
}

function extractKeyWords(text: string): string[] {
  // Simple keyword extraction from the description
  const commonWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'you', 'i', 'me', 'your', 'my', 'that', 'this', 'these', 'those', 'it',
  ]);

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        !commonWords.has(word) &&
        !/^[^a-z]+$/.test(word),
    )
    .slice(0, 3);

  return [...new Set(words)];
}

export async function POST(request: NextRequest): Promise<NextResponse<GeneratePromptsResponse>> {
  try {
    const body = (await request.json()) as GeneratePromptsRequest;
    const { description, fieldType, agentName, industry } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 },
      );
    }

    const prompts: { contextPrompt?: string; startingMessage?: string } = {};

    // Generate context prompt if requested
    if (fieldType === 'context_prompt' || fieldType === 'both') {
      prompts.contextPrompt = generateContextPrompt(description, agentName, industry);
    }

    // Generate starting message if requested
    if (fieldType === 'starting_message' || fieldType === 'both') {
      prompts.startingMessage = generateStartingMessage(description, agentName);
    }

    return NextResponse.json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
