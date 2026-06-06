const fs = require('fs');
const content = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');

const sql = [];

// Clean up old wrong tables
sql.push("-- ==========================================");
sql.push("-- 0. CLEANUP WRONG TABLES");
sql.push("-- ==========================================");
const wrongTables = ['system_users', 'members', 'committee_members', 'subscriptions', 'donations', 'income', 'expenses', 'bank_transactions', 'cash_transactions', 'mobile_banking', 'assets', 'inventory', 'events', 'meetings', 'notices', 'prayer_times', 'qurbani', 'ramadan', 'zakat', 'gallery', 'audit_logs', 'settings'];
wrongTables.forEach(t => sql.push(`DROP TABLE IF EXISTS ${t} CASCADE;`));

sql.push("\n-- ==========================================");
sql.push("-- 1. CREATE CORRECT TABLES BASED ON TYPES");
sql.push("-- ==========================================");

const tablesStart = content.indexOf('Tables: {');
const viewsStart = content.indexOf('Views: {');
const tablesBlock = content.substring(tablesStart, viewsStart > -1 ? viewsStart : content.length);

const tableRegex = /([a-z_]+):\s*\{\s*Row:\s*\{([^}]+)\}/g;
let m;
while ((m = tableRegex.exec(tablesBlock)) !== null) {
  const tableName = m[1];
  sql.push(`CREATE TABLE IF NOT EXISTS ${tableName} (`);
  
  const props = m[2].trim().split('\n');
  const cols = [];
  props.forEach(p => {
    let parts = p.trim().split(':');
    if (parts.length < 2) return;
    let colName = parts[0].trim().replace(/\?$/, '').replace(/['"]/g, '');
    let colType = parts.slice(1).join(':').trim();
    
    let sqltype = 'TEXT';
    if (colType.includes('number')) sqltype = 'DECIMAL(12,2)';
    if (colType.includes('boolean')) sqltype = 'BOOLEAN';
    if (colType.includes('Json')) sqltype = 'JSONB';
    if (colName === 'created_at' || colName === 'updated_at' || colType.includes('string')) sqltype = 'TEXT'; 
    if (colName === 'created_at' || colName === 'updated_at') sqltype = 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()';
    if (colName === 'id') {
      sqltype = 'UUID DEFAULT uuid_generate_v4() PRIMARY KEY';
    } else if (colName.endsWith('_id')) {
      sqltype = 'UUID'; // Foreign keys
    }
    
    cols.push(`  ${colName} ${sqltype}`);
  });
  
  sql.push(cols.join(',\n'));
  sql.push(`);\n`);
}

fs.writeFileSync('generated_schema.sql', sql.join('\n'));
console.log("SQL Schema generated in generated_schema.sql");
