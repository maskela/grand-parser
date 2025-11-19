import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Create Supabase client
    const supabase = createServiceRoleClient();

    // Fetch document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Download file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (fileError || !fileData) {
      console.error('File download error:', fileError);
      return NextResponse.json(
        { success: false, error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // Determine content type based on file extension
    const extension = document.filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    if (extension === 'pdf') {
      contentType = 'application/pdf';
    } else if (['jpg', 'jpeg'].includes(extension || '')) {
      contentType = 'image/jpeg';
    } else if (extension === 'png') {
      contentType = 'image/png';
    }

    // Return file
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${document.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

