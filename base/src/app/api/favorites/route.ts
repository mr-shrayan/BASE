import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uname = searchParams.get('uname')?.toUpperCase();

  if (!uname) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  try {
    const { data: favorites, error } = await supabaseAdmin
      .from('USER_FAVORITES')
      .select('TCODE, TTEXT')
      .eq('UNAME', uname)
      .order('TCODE', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ favorites });
  } catch (err: any) {
    return NextResponse.json({ error: `System Error: ${err.message}` }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { uname, tcode, ttext, mandt } = await req.json();
    if (!uname || !tcode) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const { error } = await supabaseAdmin.from('USER_FAVORITES').insert({
      MANDT: mandt || '100',
      UNAME: uname.toUpperCase(),
      TCODE: tcode.toUpperCase(),
      TTEXT: ttext || ''
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { uname, tcode } = await req.json();
    if (!uname || !tcode) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const { error } = await supabaseAdmin.from('USER_FAVORITES')
      .delete()
      .eq('UNAME', uname.toUpperCase())
      .eq('TCODE', tcode.toUpperCase());

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
