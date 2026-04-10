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

    const existingUser = usersData.users.find(u => u.email === supabaseEmail);

    if (existingUser) {
       // User exists! If they hit this route, it means they tried to log in without a password.
       // We must explicitly reject this to maintain security - they must provide their password.
       return NextResponse.json({ 
         error: 'E: User already exists. Please provide your password.',
         requiresPassword: true 
       }, { status: 401 });
    }

    // 2. User does not exist, so we Auto-Provision them (First-Time Login Flow)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: sysEmail,
      password: defaultPassword,
      email_confirm: true,
    });

    if (createError) throw createError;

    // 3. Return the default password securely back over HTTPS so the client can establish the session
    return NextResponse.json({ 
      success: true, 
      message: 'I: User provisioned successfully.',
      temporaryKey: defaultPassword 
    });

  } catch (err: any) {
    return NextResponse.json({ error: `E: ${err.message}` }, { status: 500 });
  }
}
