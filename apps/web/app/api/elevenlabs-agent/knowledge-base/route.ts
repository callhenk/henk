import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const pageSize = searchParams.get('page_size') || '30';
    const search = searchParams.get('search');
    const showOnlyOwned =
      searchParams.get('show_only_owned_documents') || 'false';
    const types = searchParams.get('types');

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append('cursor', cursor);
    if (pageSize) queryParams.append('page_size', pageSize);
    if (search) queryParams.append('search', search);
    if (showOnlyOwned)
      queryParams.append('show_only_owned_documents', showOnlyOwned);
    if (types) queryParams.append('types', types);

    // Fetch knowledge base documents from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-base?${queryParams.toString()}`,
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs knowledge base API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `ElevenLabs knowledge base API error: ${errorData.detail || response.statusText}`,
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('GET /api/elevenlabs-agent/knowledge-base error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    const body = await request.json();
    const { type, url, name, text, file } = body;

    let response;

    switch (type) {
      case 'url':
        if (!url) {
          return NextResponse.json(
            { success: false, error: 'URL is required for URL type documents' },
            { status: 400, headers: corsHeaders },
          );
        }

        response = await fetch(
          'https://api.elevenlabs.io/v1/convai/knowledge-base/url',
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              name: name || url,
            }),
          },
        );
        break;

      case 'text':
        if (!text) {
          return NextResponse.json(
            {
              success: false,
              error: 'Text content is required for text type documents',
            },
            { status: 400, headers: corsHeaders },
          );
        }

        response = await fetch(
          'https://api.elevenlabs.io/v1/convai/knowledge-base/text',
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              name: name || 'Text Document',
            }),
          },
        );
        break;

      case 'file':
        if (!file) {
          return NextResponse.json(
            {
              success: false,
              error: 'File is required for file type documents',
            },
            { status: 400, headers: corsHeaders },
          );
        }

        // For file uploads, we need to handle the file data
        // This would typically involve getting the file from Supabase storage
        // and then uploading it to ElevenLabs
        return NextResponse.json(
          { success: false, error: 'File upload not yet implemented' },
          { status: 501, headers: corsHeaders },
        );

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid document type' },
          { status: 400, headers: corsHeaders },
        );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs knowledge base creation error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `ElevenLabs knowledge base creation error: ${errorData.detail || response.statusText}`,
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('POST /api/elevenlabs-agent/knowledge-base error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
