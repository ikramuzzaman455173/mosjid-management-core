const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/"/g, '');
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)[1].trim().replace(/"/g, '');

async function test() {
  const urlPath = url + '/rest/v1/user_roles?select=role_id,invalid_rel(name)&limit=1';
  console.log('Fetching', urlPath);
  const res = await fetch(urlPath, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Data:", data);
}
test();
