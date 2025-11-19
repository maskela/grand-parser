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

    // Fetch document with template and result
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select(`
        *,
        template:templates(*),
        result:results(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

