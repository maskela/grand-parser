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

    // Create Supabase client
    const supabase = createServiceRoleClient();

    // Fetch all templates (they're viewable by all authenticated users)
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (templatesError) {
      console.error('Templates error:', templatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        templates: templates || [],
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

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        level_of_details,
        created_by: user.id,
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

