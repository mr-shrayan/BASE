import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tabname = searchParams.get('tabname')?.toUpperCase();
  const mandt = searchParams.get('mandt');
  const hitsParam = searchParams.get('maxHits');
  const maxHits = hitsParam ? parseInt(hitsParam, 10) : 500;

  if (!tabname) {
    return NextResponse.json({ error: 'Table name is required.' }, { status: 400 });
  }

  try {
    // 1. Fetch structural metadata from the core dictionary definitions (DD03L)
    let { data: fields, error: metaError } = await supabaseAdmin
      .from('DD03L')
      .select('FIELDNAME, DATATYPE, LENG, DDTEXT')
      .eq('TABNAME', tabname)
      .order('POSITION', { ascending: true });

    if (metaError || !fields || fields.length === 0) {
      // Bootstrapped Core SAP Dictionary Map Defaults (since system tables aren't mapped in DD03L natively)
      if (tabname === 'DD02L') {
        fields = [
          { FIELDNAME: 'TABNAME', DATATYPE: 'CHAR', LENG: 30, DDTEXT: 'Table Name' },
          { FIELDNAME: 'AS4LOCAL', DATATYPE: 'CHAR', LENG: 1, DDTEXT: 'Activation Status' }
        ];
      } else if (tabname === 'DD03L') {
        fields = [
          { FIELDNAME: 'TABNAME', DATATYPE: 'CHAR', LENG: 30, DDTEXT: 'Table Name' },
          { FIELDNAME: 'FIELDNAME', DATATYPE: 'CHAR', LENG: 30, DDTEXT: 'Field Name' },
          { FIELDNAME: 'POSITION', DATATYPE: 'INT', LENG: undefined, DDTEXT: 'Position' },
          { FIELDNAME: 'DATATYPE', DATATYPE: 'CHAR', LENG: 4, DDTEXT: 'Data Type' },
          { FIELDNAME: 'LENG', DATATYPE: 'INT', LENG: undefined, DDTEXT: 'Length' },
          { FIELDNAME: 'DECIMALS', DATATYPE: 'INT', LENG: undefined, DDTEXT: 'Decimals' },
          { FIELDNAME: 'KEYFLAG', DATATYPE: 'CHAR', LENG: 1, DDTEXT: 'Key Flag' },
          { FIELDNAME: 'DDTEXT', DATATYPE: 'CHAR', LENG: 60, DDTEXT: 'Short Text' }
        ];
      } else if (tabname === 'USER_METADATA') {
         fields = [
           { FIELDNAME: 'ID', DATATYPE: 'CHAR', LENG: undefined, DDTEXT: 'Profile Key' },
           { FIELDNAME: 'USER_ID', DATATYPE: 'CHAR', LENG: undefined, DDTEXT: 'UUID reference' },
           { FIELDNAME: 'BNAME', DATATYPE: 'CHAR', LENG: 12, DDTEXT: 'User Name' },
           { FIELDNAME: 'MANDT', DATATYPE: 'CHAR', LENG: 3, DDTEXT: 'Client' },
           { FIELDNAME: 'ROLE', DATATYPE: 'CHAR', LENG: 10, DDTEXT: 'Auth Role' },
         ];
      } else {
        return NextResponse.json({ error: `E: Table ${tabname} does not exist in Data Dictionary.` }, { status: 404 });
      }
    }

    // 2. Fetch native data from the physical database table
    let query = supabaseAdmin.from(tabname).select('*').limit(maxHits > 0 ? maxHits : 500);

    // Enforce SAP Client Architecture natively by ensuring we only show the current MANDT if dependent
    const hasMandt = fields.some((f: any) => f.FIELDNAME === 'MANDT');
    if (hasMandt && mandt) {
      query = query.eq('MANDT', mandt);
    }

    // Process dynamic selection screen filters!
    const filtersParam = searchParams.get('filters');
    if (filtersParam) {
      try {
        const filtersObj = JSON.parse(filtersParam);
        for (const [key, value] of Object.entries(filtersObj)) {
           if (typeof value === 'string' && value.trim() !== '') {
              // Flexible selection match equivalent to SAP's standard CP (Contains Pattern)
              query = query.ilike(key, `%${value.trim()}%`);
           }
        }
      } catch(e) {}
    }

    const { data: records, error: dataError } = await query;

    if (dataError) {
      return NextResponse.json({ error: `Failed to fetch table records: ${dataError.message}` }, { status: 500 });
    }

    return NextResponse.json({ fields, records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
