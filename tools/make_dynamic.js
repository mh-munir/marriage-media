const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'app');
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name === 'page.tsx' || entry.name === 'route.ts')) {
      files.push(full);
    }
  }
}

walk(root);

for (const file of files.sort()) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('export const dynamic = "force-dynamic";')) continue;

  let updated;
  if (path.basename(file) === 'page.tsx') {
    if (text.startsWith('"use client";') || text.startsWith("'use client';")) {
      const marker = text.startsWith('"use client";') ? '"use client";' : "'use client';";
      updated = text.replace(marker, `${marker}\n\nexport const dynamic = "force-dynamic";`, 1);
    } else {
      updated = `export const dynamic = "force-dynamic";\n\n${text}`;
    }
  } else {
    updated = `export const dynamic = "force-dynamic";\n\n${text}`;
  }

  fs.writeFileSync(file, updated, 'utf8');
}

console.log(`Updated ${files.length} files`);
