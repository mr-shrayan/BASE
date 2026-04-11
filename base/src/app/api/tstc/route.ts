import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tcode = searchParams.get('tcode')?.toUpperCase();

  if (!tcode) return NextResponse.json({ error: 'TCODE parameter required' }, { status: 400 });

  try {
    const { data: transaction, error } = await supabaseAdmin
      .from('TSTC')
      .select('TCODE, PGMNA, TTEXT')
      .eq('TCODE', tcode)
      .single();

    if (error || !transaction) {
       // Static fallback for non-mapped system base codes since TSTC isn't explicitly seeded with SE11, SPRO, yet
       const baseTcodes: Record<string, string> = {
         'SE11': '/se11',
         'SE16': '/se16',
         'SM30': '/sm30',
         'SPRO': '/spro',
         'SU01': '/su01'
       };

       if (baseTcodes[tcode]) {
         return NextResponse.json({ tcode, path: baseTcodes[tcode] });
       }

       return NextResponse.json({ error: `Transaction ${tcode} does not exist.` }, { status: 404 });
    }

    // Usually PGMNA has the physical path mapping for custom entries
    return NextResponse.json({ tcode: transaction.TCODE, path: transaction.PGMNA || `/${transaction.TCODE.toLowerCase()}` });

  } catch (err: any) {
    return NextResponse.json({ error: `System Error: ${err.message}` }, { status: 500 });
  }
}
