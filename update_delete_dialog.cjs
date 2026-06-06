const fs = require('fs');
const path = require('path');

const dir = 'src/routes/_authenticated';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('confirm(t("confirm_delete"))') || content.includes('confirm(t("confirm_delete"))')) {
    console.log(`Processing ${file}...`);
    
    // 1. Add import
    if (!content.includes('DeleteDialog')) {
      content = content.replace(/(import .* from "@\/components\/.*?";\r?\n)/, '$1import { DeleteDialog } from "@/components/delete-dialog";\n');
    }

    // 2. Add state
    if (!content.includes('const [deleteId, setDeleteId]')) {
      if (content.includes('const [open, setOpen] = useState(false);')) {
        content = content.replace(/(const \[open, setOpen\] = useState\(false\);)/, '$1\n  const [deleteId, setDeleteId] = useState<any>(null);');
      } else if (content.includes('const qc = useQueryClient();')) {
        content = content.replace(/(const qc = useQueryClient\(\);)/, '$1\n  const [deleteId, setDeleteId] = useState<any>(null);');
      }
    }

    // 3. Replace onClick
    // Match: onClick={() => { if (confirm(t("confirm_delete"))) del.mutate(m.id); }}
    content = content.replace(/onClick=\{\(\)\s*=>\s*\{\s*if\s*\(\s*confirm\(t\("confirm_delete"\)\)\s*\)\s*([a-zA-Z0-9_]+)\.mutate\((.*?)\);\s*\}\}/g, 'onClick={() => setDeleteId($2)}');

    // 4. Inject Dialog
    if (!content.includes('<DeleteDialog id={deleteId}')) {
       let mutName = 'del';
       if (content.includes('delMutation.mutate')) mutName = 'delMutation';
       
       const dialogCode = `\n      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => ${mutName}.mutate(id)} />`;
       
       if (content.includes('</CrudDialog>')) {
           content = content.replace(/(<\/CrudDialog>)/, `$1${dialogCode}`);
       } else if (content.includes('</Dialog>')) {
           // Replace the LAST </Dialog>
           const lastIdx = content.lastIndexOf('</Dialog>');
           content = content.slice(0, lastIdx + 9) + dialogCode + content.slice(lastIdx + 9);
       }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
