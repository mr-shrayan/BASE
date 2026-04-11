import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tabname = searchParams.get('tabname')?.toUpperCase();
  const mandt = searchParams.get('mandt');

  if (!tabname) {
    return NextResponse.json({ error: 'Table name is required for maintenance.' }, { status: 400 });
  }

  try {
    const { data: fields, error: metaError } = await supabaseAdmin
      .from('DD03L')
      .select('FIELDNAME, DATATYPE, LENG, DDTEXT, KEYFLAG')
      .eq('TABNAME', tabname)
      .order('POSITION', { ascending: true });

    if (metaError || !fields || fields.length === 0) {
      return NextResponse.json({ error: `Table ${tabname} is not active in the Dictionary.` }, { status: 404 });
    }

    let query = supabaseAdmin.from(tabname).select('*');
    
    // Automatically isolate to active client
    const hasMandt = fields.some((f: any) => f.FIELDNAME === 'MANDT');
    if (hasMandt && mandt) {
      query = query.eq('MANDT', mandt);
    }

    const { data: records, error: dataError } = await query;
    if (dataError) throw dataError;

    return NextResponse.json({ fields, records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tabname, record, username } = await req.json();
    if (!tabname || !record) return NextResponse.json({ error: 'Missing tabname or record payload' }, { status: 400 });

    const activeUser = username || 'UNKNOWN';

    // 1. Resolve Primary Keys from Dictionary to find the existing row
    const { data: fields } = await supabaseAdmin.from('DD03L').select('FIELDNAME, KEYFLAG').eq('TABNAME', tabname.toUpperCase());
    const pkFields = fields?.filter(f => f.KEYFLAG === 'true' || f.KEYFLAG === true).map(f => f.FIELDNAME) || [];
    
    let existingRecord = null;
    if (pkFields.length > 0) {
       let query = supabaseAdmin.from(tabname.toUpperCase()).select('*');
       for (const pk of pkFields) {
         if (record[pk]) query = query.eq(pk, record[pk]);
       }
       const { data: matched } = await query;
       if (matched && matched.length > 0) existingRecord = matched[0];
    }

    // 2. Diff routine
    const diffs: any[] = [];
    if (existingRecord) {
       for (const key of Object.keys(record)) {
          if (record[key] !== existingRecord[key] && !pkFields.includes(key)) {
             diffs.push({
               FNAME: key,
               VALUE_OLD: String(existingRecord[key] || ''),
               VALUE_NEW: String(record[key] || '')
             });
          }
       }
    } else {
       // It's a brand new insert!
       diffs.push({
          FNAME: 'KEY',
          VALUE_OLD: '',
          VALUE_NEW: 'INSERT'
       });
    }

    // 3. Upsert original database request securely
    const { error } = await supabaseAdmin.from(tabname.toUpperCase()).upsert(record);
    if (error) throw error;

    // 4. Force Change Document Logging if differential was hit
    if (diffs.length > 0 && tabname.toUpperCase() !== 'CDHDR' && tabname.toUpperCase() !== 'CDPOS') {
       const changenr = Math.random().toString(36).substring(2, 12).toUpperCase();
       const udate = new Date().toISOString().split('T')[0];
       const utime = new Date().toISOString().split('T')[1].substring(0, 8).replace(/:/g, ''); // HHMMSS
       
       await supabaseAdmin.from('CDHDR').insert({
         MANDT: record['MANDT'] || '100',
         OBJECTCLAS: tabname.toUpperCase(),
         CHANGENR: changenr,
         USERNAME: activeUser,
         UDATE: udate,
         UTIME: utime,
         TCODE: 'SM30'
       });

       const posPayloads = diffs.map(d => ({
         MANDT: record['MANDT'] || '100',
         CHANGENR: changenr,
         TABNAME: tabname.toUpperCase(),
         FNAME: d.FNAME,
         VALUE_OLD: d.VALUE_OLD,
         VALUE_NEW: d.VALUE_NEW
       }));
       
       await supabaseAdmin.from('CDPOS').insert(posPayloads);
    }

    return NextResponse.json({ success: true, message: 'Record saved successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { tabname, primaryKeys, username } = await req.json();
    if (!tabname || !primaryKeys || Object.keys(primaryKeys).length === 0) {
       return NextResponse.json({ error: 'Missing table or primary key map for deletion' }, { status: 400 });
    }

    // Snapshot deletion targeting Audit
    const activeUser = username || 'UNKNOWN';
    let getQuery = supabaseAdmin.from(tabname.toUpperCase()).select('*');
    for (const [key, value] of Object.entries(primaryKeys)) {
      getQuery = getQuery.eq(key, value);
    }
    const { data: toDelete } = await getQuery;

    let query = supabaseAdmin.from(tabname.toUpperCase()).delete();
    for (const [key, value] of Object.entries(primaryKeys)) {
      query = query.eq(key, value);
    }

    const { error } = await query;
    if (error) throw error;

    // Write CDPOS Delete marker
    if (toDelete && toDelete.length > 0 && tabname.toUpperCase() !== 'CDHDR') {
       const deletedRecord = toDelete[0];
       const changenr = Math.random().toString(36).substring(2, 12).toUpperCase();
       const udate = new Date().toISOString().split('T')[0];
       const utime = new Date().toISOString().split('T')[1].substring(0, 8).replace(/:/g, '');
       
       await supabaseAdmin.from('CDHDR').insert({
         MANDT: deletedRecord['MANDT'] || '100',
         OBJECTCLAS: tabname.toUpperCase(),
         CHANGENR: changenr,
         USERNAME: activeUser,
         UDATE: udate,
         UTIME: utime,
         TCODE: 'SM30'
       });

       await supabaseAdmin.from('CDPOS').insert({
         MANDT: deletedRecord['MANDT'] || '100',
         CHANGENR: changenr,
         TABNAME: tabname.toUpperCase(),
         FNAME: 'KEY',
         VALUE_OLD: 'DELETED',
         VALUE_NEW: ''
       });
    }

    return NextResponse.json({ success: true, message: 'Record deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
