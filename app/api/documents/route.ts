import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient, getCurrentUser } from '@/lib/supabase/server';
import { paginationSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
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

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const validation = paginationSchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.message },
        { status: 400 }
      );
    }

    const { page, limit } = validation.data;
    const offset = (page - 1) * limit;

    // Create Supabase client
    const supabase = createServiceRoleClient();

    // Get total count
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch documents count' },
        { status: 500 }
      );
    }

    // Fetch documents with template info
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(`
        *,
        template:templates(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (documentsError) {
      console.error('Documents error:', documentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documents: documents || [],
        total: count || 0,
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

