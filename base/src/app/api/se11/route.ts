import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Map BASE data types to Postgres Data types
const mapBASETypeToPostgres = (baseType: string, length?: number, decimals?: number) => {
  switch (baseType.toUpperCase()) {
    case 'CHAR':
      return `CHAR(${length || 1})`;
    case 'VARCHAR':
      return `VARCHAR(${length || 255})`;
    case 'NUMC':
      return `CHAR(${length || 10})`; // NUMC is a number string in BASE
    case 'QUAN':
    case 'CURR':
      return `DECIMAL(${length || 13}, ${decimals || 3})`;
    case 'DATS':
      return 'DATE';
    case 'TIMS':
      return 'TIME';
    default:
      return 'TEXT';
  }
};

export async function POST(req: Request) {
  try {
    const { tabname, description, fields } = await req.json();

    if (!tabname || !fields || fields.length === 0) {
      return NextResponse.json({ error: 'Missing table name or fields configuration' }, { status: 400 });
    }

    // 1. Generate the physical DDL (CREATE TABLE)
    let ddlString = `CREATE TABLE "${tabname.toUpperCase()}" (\n`;
    const primaryKeys: string[] = [];

    const fieldDefinitions = fields.map((f: any) => {
      let fieldDef = `  "${f.fieldname.toUpperCase()}" ${mapBASETypeToPostgres(f.datatype, f.leng, f.decimals)}`;
      if (f.keyflag) {
        fieldDef += ' NOT NULL';
        primaryKeys.push(`"${f.fieldname.toUpperCase()}"`);
      }
      return fieldDef;
    });

    // Add Primary Keys block if needed
    if (primaryKeys.length > 0) {
      fieldDefinitions.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    ddlString += fieldDefinitions.join(',\n') + '\n);';

    // 2. Execute DDL via Supabase RPC using Service Role
    const { error: ddlError } = await supabaseAdmin.rpc('execute_se11_ddl', { sql_statement: ddlString });

    if (ddlError) {
      return NextResponse.json({ error: 'DDL Generation Failed: ' + ddlError.message }, { status: 500 });
    }

    // 3. Register in DD02L (Table Header Meta)
    const { error: dd02lError } = await supabaseAdmin.from('DD02L').insert({
      TABNAME: tabname.toUpperCase(),
      DDTEXT: description,
    });

    if (dd02lError) {
       // Ideally we rollback the DDL here, but Postgres DDL cannot be rolled back easily in a separate connection without a block, keeping simple.
       return NextResponse.json({ error: 'DD02L Insert Failed: ' + dd02lError.message }, { status: 500 });
    }

    // 4. Register Fields in DD03L (Table Fields Meta)
    const formattedFields = fields.map((f: any, index: number) => ({
      TABNAME: tabname.toUpperCase(),
      FIELDNAME: f.fieldname.toUpperCase(),
      POSITION: index + 1,
      DATATYPE: f.datatype.toUpperCase(),
      LENG: f.leng || null,
      DECIMALS: f.decimals || null,
      KEYFLAG: f.keyflag || false,
      DDTEXT: f.ddtext || '',
    }));

    const { error: dd03lError } = await supabaseAdmin.from('DD03L').insert(formattedFields);

    if (dd03lError) {
      return NextResponse.json({ error: 'DD03L Insert Failed: ' + dd03lError.message }, { status: 500 });
    }

    // 5. Enable Row Level Security (RLS) automatically to mirror BASE Client Security concept
    const rlsSql = `ALTER TABLE "${tabname.toUpperCase()}" ENABLE ROW LEVEL SECURITY;`;
    await supabaseAdmin.rpc('execute_se11_ddl', { sql_statement: rlsSql });

    return NextResponse.json({ success: true, message: `Table ${tabname.toUpperCase()} active in DDIC.` });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
