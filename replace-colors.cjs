const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = [
  { regex: /bg-black/g, replacement: 'bg-background' },
  { regex: /bg-zinc-950/g, replacement: 'bg-card' },
  { regex: /text-white\/80/g, replacement: 'text-foreground/80' },
  { regex: /text-white\/60/g, replacement: 'text-foreground/60' },
  { regex: /text-white\/40/g, replacement: 'text-foreground/40' },
  { regex: /text-white\/30/g, replacement: 'text-foreground/30' },
  { regex: /text-white\/20/g, replacement: 'text-foreground/20' },
  { regex: /text-white\/10/g, replacement: 'text-foreground/10' },
  { regex: /border-white\/5/g, replacement: 'border-border\/50' },
  { regex: /border-white\/10/g, replacement: 'border-border' },
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walkDir(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(srcDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
console.log('Color replacements finished.');
