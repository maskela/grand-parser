import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Creates a Supabase client for server-side operations with service role key
 * Use this for admin operations that bypass RLS
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client for server-side operations with user context
 * This respects RLS policies based on the authenticated user
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Gets the current user from Clerk and returns their Supabase user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * Gets the current user's full data from Supabase
 * Auto-creates the user if they don't exist
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.error('getCurrentUser: No userId from Clerk');
      return null;
    }

    const supabase = createServiceRoleClient();
    
    // Try to get existing user
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    // If user doesn't exist, create them
    if (error && error.code === 'PGRST116') {
      console.log('User not found in Supabase, creating new user...');
      
      try {
        // Get user email from Clerk
        const { clerkClient } = await import('@clerk/nextjs/server');
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        
        const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.user`;

        console.log('Creating user with email:', email);

        // Create user in Supabase
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: userId,
            email: email,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user in Supabase:', createError);
          return null;
        }

        console.log('User created successfully:', newUser.id);
        return newUser;
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
        return null;
      }
    }

    if (error) {
      console.error('Error fetching user from Supabase:', error);
      return null;
    }

    if (!data) {
      console.error('No user data returned from Supabase');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
}

