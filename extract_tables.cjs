const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src', 'routes', '_authenticated');
const tables = new Set();
fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).forEach(file => {
  const c = fs.readFileSync(path.join(dir, file), 'utf8');
  const r = /supabase\.from\(['"]([^'"]+)['"]\)/g;
  let m;
  while ((m = r.exec(c)) !== null) {
    tables.add(m[1]);
  }
});
console.log(Array.from(tables));
