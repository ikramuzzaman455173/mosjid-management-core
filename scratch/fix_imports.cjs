const fs = require('fs');
const files = [
  'assets.tsx',
  'bank.tsx',
  'cash.tsx',
  'committee.tsx',
  'events.tsx',
  'expenses.tsx',
  'income.tsx',
  'inventory.tsx',
  'mobile-banking.tsx',
  'notices.tsx',
  'subscription.tsx'
];

files.forEach(f => {
  const p = 'src/routes/_authenticated/' + f;
  const text = fs.readFileSync(p, 'utf8');
  if (!text.includes('import { Hint }')) {
    const lines = text.split('\n');
    lines.splice(2, 0, 'import { Hint } from "@/components/ui/hint";');
    fs.writeFileSync(p, lines.join('\n'));
    console.log('Fixed ' + f);
  }
});
