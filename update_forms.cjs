const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'routes', '_authenticated');

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 1. Mobile grid conversion
      content = content.replace(/className="grid grid-cols-2 gap-3"/g, 'className="grid grid-cols-1 md:grid-cols-2 gap-4"');
      
      // 2. Col-span-2 conversion for mobile
      // Need to be careful not to replace col-span-2 in places where it shouldn't be touched, but usually it's fine
      // Let's replace class="col-span-2" and className="col-span-2"
      content = content.replace(/className="col-span-2"/g, 'className="col-span-1 md:col-span-2"');
      content = content.replace(/className="col-span-2 /g, 'className="col-span-1 md:col-span-2 ');

      // 3. Label required prop
      // Regex matches <Label>...</Label> containing a * at the end
      // e.g. <Label>{t("name")} *</Label>
      content = content.replace(/<Label([^>]*)>(.*?)\s*\*\s*<\/Label>/g, '<Label$1 required>$2</Label>');
      // Also match if it's already required just to be safe
      
      // 4. Space-y-3 to Space-y-4
      content = content.replace(/className="space-y-3"/g, 'className="space-y-4"');
      content = content.replace(/className="space-y-3 /g, 'className="space-y-4 ');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDir(dir);
console.log("Done updating forms.");
