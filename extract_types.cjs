const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'routes', '_authenticated');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  // Match type Definitions like "type Member = { ... };"
  const regex = /type\s+[A-Za-z]+\s*=\s*\{([^}]*)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log(`\n--- ${file} ---`);
    console.log(match[0]);
  }
}
