import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient, getCurrentUser } from '@/lib/supabase/server';
import { createTemplateSchema } from '@/lib/validations';

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

    // Get user from Supabase
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to get user information' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createServiceRoleClient();

    // Fetch public templates and user templates separately, then combine
    // This is more reliable than using .or() which can have syntax issues
    const [publicTemplatesResult, userTemplatesResult] = await Promise.all([
      supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('templates')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (publicTemplatesResult.error || userTemplatesResult.error) {
      console.error('Templates query error:', publicTemplatesResult.error || userTemplatesResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    // Combine and deduplicate templates (in case a user template is also public)
    const publicTemplates = publicTemplatesResult.data || [];
    const userTemplates = (userTemplatesResult.data || []).filter(
      (t) => !publicTemplates.some((pt) => pt.id === t.id)
    );

    // Sort: public templates first, then by created_at
    const allTemplates = [...publicTemplates, ...userTemplates].sort((a, b) => {
      if (a.is_public !== b.is_public) {
        return b.is_public ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        templates: allTemplates,
      },
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Parse request body
    const body = await req.json();

    // Validate request
    const validation = createTemplateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.message },
        { status: 400 }
      );
    }

    const { name, description, level_of_details } = validation.data;

    // Create Supabase client
    const supabase = createServiceRoleClient();

    // Create template (user-created templates are always private)
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        level_of_details,
        created_by: user.id,
        is_public: false,
      })
      .select()
      .single();

    if (templateError || !template) {
      console.error('Template creation error:', templateError);
      return NextResponse.json(
        { success: false, error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

