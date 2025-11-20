import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    const debugInfo: any = {
      tables: {},
    };

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, clerk_id, email, created_at')
      .limit(10);
    
    debugInfo.tables.users = {
      exists: !usersError,
      error: usersError?.message,
      count: users?.length || 0,
      data: users || [],
    };

    // Check templates table
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('id, name, created_at')
      .limit(10);
    
    debugInfo.tables.templates = {
      exists: !templatesError,
      error: templatesError?.message,
      count: templates?.length || 0,
      data: templates || [],
    };

    // Check documents table
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('id, filename, status, created_at')
      .limit(10);
    
    debugInfo.tables.documents = {
      exists: !documentsError,
      error: documentsError?.message,
      count: documents?.length || 0,
      data: documents || [],
    };

    // Check results table
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('id, document_id, created_at')
      .limit(10);
    
    debugInfo.tables.results = {
      exists: !resultsError,
      error: resultsError?.message,
      count: results?.length || 0,
      data: results || [],
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    
    // Delete all data from tables (in correct order due to foreign keys)
    const results = {
      results: null as any,
      documents: null as any,
      templates: null as any,
      users: null as any,
    };

    // Delete results first
    const { error: resultsError } = await supabase
      .from('results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    results.results = { 
      success: !resultsError, 
      error: resultsError?.message 
    };

    // Delete documents
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    results.documents = { 
      success: !documentsError, 
      error: documentsError?.message 
    };

    // Delete templates
    const { error: templatesError } = await supabase
      .from('templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    results.templates = { 
      success: !templatesError, 
      error: templatesError?.message 
    };

    // Delete users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    results.users = { 
      success: !usersError, 
      error: usersError?.message 
    };

    return NextResponse.json({
      message: 'Database cleaned',
      results,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}





