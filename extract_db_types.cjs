const fs = require('fs');

const content = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');

// A simple regex approach to extract Tables and their Row properties
const tablesMatch = content.match(/Tables:\s*\{([\s\S]*?)\}\n\s*Views:/);
if (!tablesMatch) {
  console.log("Could not find Tables block");
  process.exit(1);
}

const tablesStr = tablesMatch[1];
const tableRegex = /([a-zA-Z0-9_]+):\s*\{\s*Row:\s*\{([^}]+)\}/g;
let m;
while ((m = tableRegex.exec(tablesStr)) !== null) {
  console.log(`\nTABLE: ${m[1]}`);
  const props = m[2].trim().split('\n');
  props.forEach(p => {
    console.log(`  ${p.trim()}`);
  });
}
