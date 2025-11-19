import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient, getCurrentUser } from '@/lib/supabase/server';

/**
 * TEST UPLOAD ENDPOINT - No n8n required
 * Use this to test file uploads without needing n8n webhook
 * Just uploads file and creates document record with mock results
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from Supabase (auto-creates if doesn't exist)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to get user information' },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const templateId = formData.get('template_id') as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file size and type
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File must be PDF, JPEG, or PNG' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServiceRoleClient();

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Create document record in Supabase
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: uploadData.path,
        template_id: templateId || null,
        status: 'completed', // Mark as completed immediately for testing
      })
      .select()
      .single();

    if (documentError || !document) {
      console.error('Document creation error:', documentError);
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([fileName]);
      return NextResponse.json(
        { success: false, error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    // Create mock results (simulating what n8n would return)
    const { error: resultsError } = await supabase
      .from('results')
      .insert({
        document_id: document.id,
        extracted_json: {
          test: true,
          message: 'This is mock data. Configure n8n webhook for real processing.',
          filename: file.name,
        },
        generated_message: `Successfully uploaded ${file.name}. This is a test upload without n8n processing. Configure N8N_WEBHOOK_URL in .env.local for real document processing.`,
        raw_text: `Mock raw text for ${file.name}. In production, n8n will extract the actual text content from your document.`,
        confidence: 1.0,
        warnings: null,
      });

    if (resultsError) {
      console.error('Results creation error:', resultsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        document_id: document.id,
        status: 'completed',
        result: {
          extracted_json: {
            test: true,
            message: 'This is mock data. Configure n8n webhook for real processing.',
          },
          generated_message: `Successfully uploaded ${file.name}. Configure n8n for real processing.`,
          raw_text: 'Mock raw text',
          confidence: 1.0,
          warnings: null,
        },
      },
      message: '✅ TEST MODE: File uploaded successfully! Configure N8N_WEBHOOK_URL for real processing.',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}


