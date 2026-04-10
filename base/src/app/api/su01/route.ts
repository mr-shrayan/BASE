import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { bname, mandt, role, tempPassword } = await req.json();

    if (!bname || !mandt || !tempPassword) {
      return NextResponse.json({ error: 'Username, Client, and Temporary Password are required' }, { status: 400 });
    }

    const sysEmail = `${bname.toUpperCase()}@${mandt}.sys`;

    // 1. Create the user
    // The email_confirm is set to true automatically bypassing email flows
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: sysEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        mandt: mandt,
        role: role || 'user'
      }
    });

    if (createError) {
      return NextResponse.json({ error: `E: Failed to create user: ${createError.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `S: User ${bname.toUpperCase()} successfully provisioned for client ${mandt}.`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: `E: ${err.message}` }, { status: 500 });
  }
}
