import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient, getCurrentUser } from '@/lib/supabase/server';
import { N8nWebhookPayload, N8nWebhookResponse } from '@/lib/types';
import axios from 'axios';

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
    const newTemplateName = formData.get('new_template_name') as string | null;
    const newTemplateDescription = formData.get('new_template_description') as string | null;
    const newTemplateLevelOfDetails = formData.get('new_template_level_of_details') as string | null;

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
        status: 'processing',
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

    // Prepare n8n webhook payload
    const webhookPayload: N8nWebhookPayload = {
      document_id: document.id,
      file_path: uploadData.path,
      filename: file.name,
    };

    if (templateId) {
      webhookPayload.template_id = templateId;
    } else if (newTemplateName && newTemplateDescription && newTemplateLevelOfDetails) {
      webhookPayload.new_template = {
        name: newTemplateName,
        description: newTemplateDescription,
        level_of_details: newTemplateLevelOfDetails,
      };
    }

    // Call n8n webhook synchronously
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { success: false, error: 'n8n webhook URL not configured' },
        { status: 500 }
      );
    }

    try {
      const webhookResponse = await axios.post<N8nWebhookResponse>(
        n8nWebhookUrl,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.N8N_WEBHOOK_SECRET && {
              'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
            }),
          },
          timeout: 120000, // 2 minutes timeout
        }
      );

      const n8nResult = webhookResponse.data;

      if (!n8nResult.success) {
        // Update document status to failed
        await supabase
          .from('documents')
          .update({ status: 'failed' })
          .eq('id', document.id);

        return NextResponse.json(
          {
            success: false,
            error: n8nResult.error || 'Processing failed',
            document_id: document.id,
          },
          { status: 500 }
        );
      }

      // n8n has already saved the results to Supabase
      // Return the response with results
      return NextResponse.json({
        success: true,
        data: {
          document_id: document.id,
          status: 'completed',
          result: {
            extracted_json: n8nResult.extracted_json,
            generated_message: n8nResult.generated_message,
            raw_text: n8nResult.raw_text,
            confidence: n8nResult.confidence,
            warnings: n8nResult.warnings,
          },
          template_id: n8nResult.template_id || templateId,
        },
      });
    } catch (webhookError: any) {
      console.error('n8n webhook error:', webhookError);

      // Update document status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed' })
        .eq('id', document.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process document',
          message: webhookError.message,
          document_id: document.id,
        },
        { status: 500 }
      );
    }
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

