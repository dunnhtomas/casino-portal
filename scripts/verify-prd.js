const fs = require('fs');
const path = require('path');

function assert(cond, msg){ if(!cond) { console.error('FAIL:', msg); process.exit(2); } }

const root = process.cwd();

// 1: index.astro has 20+ sections (count <section id= or <h3 markers)
const idx = fs.readFileSync(path.join(root,'src','pages','index.astro'),'utf8');
const sectionCount = (idx.match(/<section\b/g)||[]).length;
console.log('index.astro sections:', sectionCount);
assert(sectionCount >= 20, 'index.astro must contain 20+ <section> elements');

// 2: Top-list pages exist
['real-money','fast-withdrawals','mobile','live-dealer'].forEach(p=>{
  const f = path.join(root,'src','pages','best', p + '.astro');
  assert(fs.existsSync(f), `Top list page missing: ${p}`);
});

// 3: Region hubs exist
['ontario','alberta','british-columbia'].forEach(r=>{
  const f = path.join(root,'src','pages','regions', r + '.astro');
  assert(fs.existsSync(f), `Region page missing: ${r}`);
});

// 4: 5+ review pages via data
const casinos = JSON.parse(fs.readFileSync(path.join(root,'data','casinos.json'),'utf8'));
console.log('Casinos count:', casinos.length);
assert(casinos.length >=5, 'Need at least 5 casinos in data/casinos.json');

// 5: How we rate page exists
assert(fs.existsSync(path.join(root,'src','pages','guides','how-we-rate.astro')), 'How We Rate page missing');

// 6: Legal pages
['about','terms','privacy'].forEach(p=> assert(fs.existsSync(path.join(root,'src','pages','legal', p + '.astro')), `Legal page missing: ${p}`));

console.log('\nAll PRD checks passed');
