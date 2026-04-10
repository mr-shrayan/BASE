import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { bname, mandt } = await req.json();

    if (!bname || !mandt) {
      return NextResponse.json({ error: 'Username and Client are required' }, { status: 400 });
    }

    const sysEmail = `${bname.toUpperCase()}@${mandt}.sys`;
    const supabaseEmail = sysEmail.toLowerCase();
    const defaultPassword = 'InitialPassword123!'; // Hardcoded enterprise default for new accounts

    // 1. Check if user already exists
    // Because we are using the Admin API, we can query users
    const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    // System Bootstrap Mode: If exact zero users exist, auto-provision first user as Admin.
    if (usersData.users.length === 0) {
       const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
         email: sysEmail,
         password: defaultPassword,
         email_confirm: true,
         user_metadata: { mandt: mandt, role: 'admin' }
       });

       if (createError) throw createError;

       return NextResponse.json({ 
         success: true, 
         message: 'I: System auto-bootstrapped. Proceeding to setup.',
         temporaryKey: defaultPassword 
       });
    }

    const existingUser = usersData.users.find(u => u.email === supabaseEmail);

    if (existingUser) {
       // Check if this user has already logged in previously
       if (existingUser.last_sign_in_at) {
          return NextResponse.json({ 
            error: 'E: Account already initialized. Please provide your permanent password.'
          }, { status: 401 });
       }

       // Temporarily assign the system default password so the frontend can auth and route to /set-password
       const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
         password: defaultPassword
       });

       if (resetError) throw resetError;

       return NextResponse.json({ 
         success: true, 
         message: 'I: Initial logon verified. Proceeding to setup.',
         temporaryKey: defaultPassword 
       });
       
    } else {
       return NextResponse.json({ 
         error: 'E: User account does not exist. Must be provisioned by System Administrator (SU01).'
       }, { status: 403 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: `E: ${err.message}` }, { status: 500 });
  }
}
