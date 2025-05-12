import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the request is from an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

    if (verifyError) {
      console.error('Token verification error:', verifyError);
      throw new Error('Invalid or expired token');
    }

    if (!authUser) {
      throw new Error('No authenticated user found');
    }

    // Get the user's role from the users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
      throw new Error('Failed to verify user role');
    }

    if (!userData || userData.role !== 'admin') {
      throw new Error('Only administrators can create users');
    }

    // Parse and validate the request body
    const requestData = await req.json();
    const { name, email, password, role, phone, company_id, preferences, metadata } = requestData;

    if (!name || !email || !role) {
      throw new Error('Name, email, and role are required');
    }

    if (role === 'client' && !company_id) {
      throw new Error('Company ID is required for client users');
    }

    if (!['admin', 'technician', 'client'].includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Generate a random password if none provided
    const finalPassword = password || Math.random().toString(36).slice(-8);

    // Create the user in Auth
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        phone,
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!newAuthUser.user) {
      throw new Error('Auth user creation succeeded but no user was returned');
    }

    // Insert the user data into the users table
    const { data: newUserData, error: newUserError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: newAuthUser.user.id,
          name,
          email,
          role,
          phone,
          company_id,
          preferences: preferences || {
            language: 'fr',
            timezone: 'Europe/Paris',
            notifications: { email: true, push: true }
          },
          metadata: metadata || {},
          active: true,
        },
      ])
      .select()
      .single();

    if (newUserError) {
      console.error('Database user creation error:', newUserError);
      // Try to clean up the auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      throw new Error(`Failed to create user in database: ${newUserError.message}`);
    }

    return new Response(
      JSON.stringify({
        ...newUserData,
        password: finalPassword,
        message: 'User created successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred while creating the user',
        details: error.toString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});