import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    const debugInfo: any = {
      clerkUserId: userId || 'No userId from Clerk',
      envVarsSet: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
      },
    };

    if (userId) {
      try {
        const supabase = createServiceRoleClient();
        
        // Test connection
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        debugInfo.supabaseConnection = testError ? 'Failed' : 'Success';
        debugInfo.supabaseError = testError?.message || null;
        
        // Try to find user
        if (!testError) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', userId)
            .single();
          
          debugInfo.userInSupabase = !!userData;
          debugInfo.userError = userError?.message || null;
          debugInfo.userErrorCode = userError?.code || null;
        }
      } catch (err: any) {
        debugInfo.supabaseError = err.message;
      }
    }

    return NextResponse.json(debugInfo);
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}


