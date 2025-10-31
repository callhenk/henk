import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Document name is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Validate file type - based on ElevenLabs API requirements
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/html',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'File type not supported. Please upload PDF, DOCX, TXT, HTML, or EPUB files.',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Upload file to ElevenLabs knowledge base
    const uploadFormData = new FormData();

    // Create a new File object with the original file data
    const fileToUpload = new File([file], file.name, { type: file.type });
    uploadFormData.append('file', fileToUpload);
    uploadFormData.append('name', name);

    console.log('Uploading file to ElevenLabs:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      documentName: name,
    });

    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/knowledge-base/file',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: uploadFormData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs file upload error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      // Extract the actual error message from the response
      let errorMessage = response.statusText;
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (errorData.detail.message) {
          errorMessage = errorData.detail.message;
        } else if (errorData.detail.status) {
          errorMessage = `Error: ${errorData.detail.status}`;
        }
      }

      // Provide specific guidance for common errors
      if (
        errorMessage.includes('PdfConversionError') ||
        errorMessage.includes('Failed to convert PDF')
      ) {
        errorMessage =
          'PDF conversion failed. Please ensure the PDF is not corrupted and try again. If the issue persists, try converting the PDF to a different format or use a text file instead.';
      } else if (errorMessage.includes('invalid_file_type')) {
        errorMessage =
          'File type not supported. Please upload PDF, DOCX, TXT, HTML, or EPUB files.';
      }

      throw new Error(`ElevenLabs file upload error: ${errorMessage}`);
    }

    const data = await response.json();

    // Save the knowledge base to our database for business isolation
    // data.id is the ElevenLabs KB ID from the response
    if (!data.id) {
      throw new Error('No knowledge base ID returned from ElevenLabs');
    }

    // Get the user's active business membership
    const { data: teamMembership, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, user_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMembership) {
      throw new Error('No active business membership found');
    }

    const { data: insertedData, error: dbError } = await supabase
      .from('knowledge_bases')
      .upsert(
        {
          business_id: teamMembership.business_id,
          elevenlabs_kb_id: data.id,
          name: name || file.name,
          description: null,
          file_count: 1,
          char_count: file.size,
          status: 'active',
          metadata: {
            document_type: 'file',
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            created_from_api: true,
          },
          created_by: user.id,
          updated_by: user.id,
        },
        {
          onConflict: 'business_id,elevenlabs_kb_id',
        }
      )
      .select('id, name, elevenlabs_kb_id, status, created_at');

    if (dbError) {
      console.error('Failed to save knowledge base to database:', {
        error: dbError,
        input: {
          business_id: teamMembership.business_id,
          elevenlabs_kb_id: data.id,
          name: name || file.name,
        },
      });
      throw new Error(`Failed to save knowledge base to database: ${dbError.message}`);
    }

    if (!insertedData || insertedData.length === 0) {
      console.error('No data returned from knowledge base upsert');
      throw new Error('Failed to save knowledge base: No data returned');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedKBRecord = insertedData[0] as any;
    console.log('Knowledge base file saved to database:', {
      id: savedKBRecord.id,
      name: savedKBRecord.name,
      elevenlabs_kb_id: savedKBRecord.elevenlabs_kb_id,
    });

    return NextResponse.json(
      {
        success: true,
        data: savedKBRecord,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error(
      'POST /api/elevenlabs-agent/knowledge-base/upload error:',
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
