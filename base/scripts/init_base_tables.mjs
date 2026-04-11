const SE11_API_URL = 'http://localhost:3000/api/se11';

// Mocks the internal table configuration format used in our frontend
const constructTable = (tabname, description, fieldsDef) => {
  return {
    tabname,
    description,
    fields: fieldsDef.map((def, idx) => ({
      fieldname: def[0],
      datatype: def[1],
      leng: def[2] || null,
      decimals: def[3] || null,
      keyflag: def[4] || false,
      ddtext: def[5] || ''
    }))
  };
};

const tables = [
  // 1. GENERAL SETTINGS
  constructTable('T005', 'Countries', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['LAND1', 'CHAR', 3, 0, true, 'Country Key'],
    ['LANDX', 'VARCHAR', 15, 0, false, 'Country Name']
  ]),
  constructTable('TCURC', 'Currency Codes', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['WAERS', 'CHAR', 5, 0, true, 'Currency Key'],
    ['LTEXT', 'VARCHAR', 40, 0, false, 'Long Text']
  ]),
  constructTable('TCURX', 'Decimal Places for Currencies', [
    ['CURRKEY', 'CHAR', 5, 0, true, 'Currency Key'],
    ['CURRDEC', 'INT', 2, 0, false, 'Number of Decimal Places']
  ]),
  constructTable('T006', 'Units of Measure', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['MSEHI', 'CHAR', 3, 0, true, 'Unit of Measurement'],
    ['MSEHL', 'VARCHAR', 30, 0, false, 'Unit of Measurement Text']
  ]),

  // 2. CALENDAR FUNCTIONS
  constructTable('T247', 'Month name and short text', [
    ['SPRAS', 'CHAR', 1, 0, true, 'Language Key'],
    ['MNR', 'CHAR', 2, 0, true, 'Month'],
    ['KTX', 'CHAR', 3, 0, false, 'Short Text'],
    ['LTX', 'VARCHAR', 20, 0, false, 'Long Text']
  ]),
  constructTable('T015M', 'Month Names', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['SPRAS', 'CHAR', 1, 0, true, 'Language Key'],
    ['MONAT', 'CHAR', 2, 0, true, 'Month'],
    ['KTX', 'CHAR', 3, 0, false, 'Short Text'],
    ['LTX', 'VARCHAR', 20, 0, false, 'Long Text']
  ]),
  constructTable('TTZZ', 'Time zones', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['TZONE', 'CHAR', 6, 0, true, 'Time Zone'],
    ['ZONEDEF', 'CHAR', 6, 0, false, 'Zone Definition']
  ]),
  constructTable('TTZ5', 'Time zone texts', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['SPRAS', 'CHAR', 1, 0, true, 'Language Key'],
    ['TZONE', 'CHAR', 6, 0, true, 'Time Zone'],
    ['ZONETXT', 'VARCHAR', 40, 0, false, 'Time Zone Text']
  ]),
  constructTable('TTZ5S', 'System time zones', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['TZONE', 'CHAR', 6, 0, true, 'Time Zone'],
    ['SYSID', 'CHAR', 3, 0, true, 'System ID']
  ]),

  // 3. ENTERPRISE STRUCTURE
  constructTable('T880', 'Global Company Data', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['RCOMP', 'CHAR', 6, 0, true, 'Company'],
    ['NAME1', 'VARCHAR', 30, 0, false, 'Company Name']
  ]),
  constructTable('T001', 'Company Codes', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['BUKRS', 'CHAR', 4, 0, true, 'Company Code'],
    ['BUTXT', 'VARCHAR', 25, 0, false, 'Name of Company Code'],
    ['ORT01', 'VARCHAR', 25, 0, false, 'City'],
    ['LAND1', 'CHAR', 3, 0, false, 'Country Key'],
    ['WAERS', 'CHAR', 5, 0, false, 'Currency Key'],
    ['SPRAS', 'CHAR', 1, 0, false, 'Language Key']
  ]),
  constructTable('TKA01', 'Controlling Areas', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['KOKRS', 'CHAR', 4, 0, true, 'Controlling Area'],
    ['BEZEI', 'VARCHAR', 25, 0, false, 'Name of Controlling Area'],
    ['WAERS', 'CHAR', 5, 0, false, 'Currency']
  ]),
  constructTable('T001W', 'Plants/Branches', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['WERKS', 'CHAR', 4, 0, true, 'Plant'],
    ['NAME1', 'VARCHAR', 30, 0, false, 'Name'],
    ['STRAS', 'VARCHAR', 30, 0, false, 'Street and House Number'],
    ['ORT01', 'VARCHAR', 25, 0, false, 'City'],
    ['LAND1', 'CHAR', 3, 0, false, 'Country Key']
  ]),
  constructTable('TVKO', 'Sales Organizations', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['VKORG', 'CHAR', 4, 0, true, 'Sales Organization'],
    ['VTEXT', 'VARCHAR', 20, 0, false, 'Description'],
    ['BUKRS', 'CHAR', 4, 0, false, 'Company Code of Sales Org']
  ]),
  constructTable('TVTW', 'Distribution Channels', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['VTWEG', 'CHAR', 2, 0, true, 'Distribution Channel'],
    ['VTEXT', 'VARCHAR', 20, 0, false, 'Description']
  ]),
  constructTable('TVBUR', 'Sales Offices', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['VKBUR', 'CHAR', 4, 0, true, 'Sales Office'],
    ['BEZEI', 'VARCHAR', 20, 0, false, 'Description'],
    ['VKORG', 'CHAR', 4, 0, false, 'Sales Organization']
  ]),

  // 4. MASTER DATA (SD, MM, FI)
  constructTable('KNA1', 'General Data in Customer Master', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['KUNNR', 'CHAR', 10, 0, true, 'Customer Number'],
    ['LAND1', 'CHAR', 3, 0, false, 'Country Key'],
    ['NAME1', 'VARCHAR', 35, 0, false, 'Name 1'],
    ['ORT01', 'VARCHAR', 35, 0, false, 'City'],
    ['PSTLZ', 'CHAR', 10, 0, false, 'Postal Code'],
    ['STRAS', 'VARCHAR', 35, 0, false, 'Street/House number'],
    ['TELF1', 'VARCHAR', 16, 0, false, 'First telephone number']
  ]),
  constructTable('LFA1', 'Vendor Master (General Section)', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['LIFNR', 'CHAR', 10, 0, true, 'Account Number of Vendor'],
    ['LAND1', 'CHAR', 3, 0, false, 'Country Key'],
    ['NAME1', 'VARCHAR', 35, 0, false, 'Name 1'],
    ['ORT01', 'VARCHAR', 35, 0, false, 'City'],
    ['PSTLZ', 'CHAR', 10, 0, false, 'Postal Code'],
    ['STRAS', 'VARCHAR', 35, 0, false, 'Street/House number'],
    ['TELF1', 'VARCHAR', 16, 0, false, 'First telephone number']
  ]),
  constructTable('MARA', 'General Material Data', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['MATNR', 'CHAR', 18, 0, true, 'Material Number'],
    ['ERSDA', 'DATS', 0, 0, false, 'Created On'],
    ['MTART', 'CHAR', 4, 0, false, 'Material Type'],
    ['MEINS', 'CHAR', 3, 0, false, 'Base Unit of Measure'],
    ['BRGEW', 'QUAN', 13, 3, false, 'Gross Weight'],
    ['NTGEW', 'QUAN', 13, 3, false, 'Net Weight'],
    ['GEWEI', 'CHAR', 3, 0, false, 'Weight Unit']
  ]),

  // 5. TRANSACTIONAL DATA (SD)
  constructTable('VBAK', 'Sales Document: Header Data', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['VBELN', 'CHAR', 10, 0, true, 'Sales Document Number'],
    ['ERDAT', 'DATS', 0, 0, false, 'Creation Date'],
    ['ERNAM', 'CHAR', 12, 0, false, 'Created Object Person'],
    ['VKORG', 'CHAR', 4, 0, false, 'Sales Organization'],
    ['VTWEG', 'CHAR', 2, 0, false, 'Distribution Channel'],
    ['KUNNR', 'CHAR', 10, 0, false, 'Sold-to party'],
    ['NETWR', 'CURR', 15, 2, false, 'Net Value of the Order'],
    ['WAERK', 'CHAR', 5, 0, false, 'SD Document Currency']
  ]),
  constructTable('VBAP', 'Sales Document: Item Data', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['VBELN', 'CHAR', 10, 0, true, 'Sales Document Number'],
    ['POSNR', 'CHAR', 6, 0, true, 'Sales Document Item'],
    ['MATNR', 'CHAR', 18, 0, false, 'Material Number'],
    ['ZMENG', 'QUAN', 13, 3, false, 'Target quantity in sales units'],
    ['ZIEME', 'CHAR', 3, 0, false, 'Target quantity UoM'],
    ['NETPR', 'CURR', 11, 2, false, 'Net Price'],
    ['WAERK', 'CHAR', 5, 0, false, 'SD Document Currency']
  ]),

  // 6. SYSTEM ADMINISTRATION & ARCHITECTURE
  constructTable('TSTC', 'SAP Transaction Codes', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['TCODE', 'VARCHAR', 20, 0, true, 'Transaction Code'],
    ['PGMNA', 'VARCHAR', 40, 0, false, 'Program'],
    ['TTEXT', 'VARCHAR', 60, 0, false, 'Transaction Text']
  ]),
  constructTable('USER_FAVORITES', 'Launchpad User Favorites', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['UNAME', 'VARCHAR', 12, 0, true, 'User Name'],
    ['TCODE', 'VARCHAR', 20, 0, true, 'Transaction Code'],
    ['TTEXT', 'VARCHAR', 60, 0, false, 'Transaction Text']
  ]),
  constructTable('CDHDR', 'Change document header', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['OBJECTCLAS', 'VARCHAR', 15, 0, true, 'Object class'],
    ['CHANGENR', 'VARCHAR', 10, 0, true, 'Document change number'],
    ['USERNAME', 'VARCHAR', 12, 0, false, 'User name of the person responsible in change document'],
    ['UDATE', 'DATS', 0, 0, false, 'Creation date of the change document'],
    ['UTIME', 'VARCHAR', 6, 0, false, 'Time changed'],
    ['TCODE', 'VARCHAR', 20, 0, false, 'Transaction in which a change was made']
  ]),
  constructTable('CDPOS', 'Change document items', [
    ['MANDT', 'CHAR', 3, 0, true, 'Client'],
    ['CHANGENR', 'VARCHAR', 10, 0, true, 'Document change number'],
    ['TABNAME', 'VARCHAR', 30, 0, true, 'Table Name'],
    ['FNAME', 'VARCHAR', 30, 0, true, 'Field Name'],
    ['VALUE_OLD', 'VARCHAR', 255, 0, false, 'Old contents of changed field'],
    ['VALUE_NEW', 'VARCHAR', 255, 0, false, 'New contents of changed field']
  ])
];

async function initialize() {
  console.log(`[BASE INITIATOR] Starting initialization of ${tables.length} tables...`);
  
  for (const table of tables) {
    console.log(`-> Creating table ${table.tabname} (${table.description})`);
    try {
      const response = await fetch(SE11_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table)
      });
      
      const res = await response.json();
      if (!response.ok) {
         if (res.error && res.error.includes('already exists')) {
             console.log(`   [SKIP] Table ${table.tabname} already exists.`);
         } else {
             console.error(`   [ERROR] ${table.tabname}: ${res.error}`);
         }
      } else {
         console.log(`   [SUCCESS] ${table.tabname} fully activated.`);
      }
    } catch (e) {
       console.error(`   [CRITICAL FATAL ERROR] ${table.tabname}: ${e.message}`);
    }
  }
  
  console.log('[BASE INITIATOR] Setup routine completed.');
}

initialize();
