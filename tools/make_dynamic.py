from pathlib import Path
root = Path(r'c:\Users\mhmun\Desktop\marriage-media\src\app')
files = list(root.rglob('page.tsx')) + list(root.rglob('route.ts'))
for path in sorted(set(files)):
    text = path.read_text(encoding='utf-8')
    if 'export const dynamic = "force-dynamic";' in text:
        continue
    if path.name == 'page.tsx':
        if text.startswith('"use client";') or text.startswith("'use client';"):
            marker = '"use client";' if text.startswith('"use client";') else "'use client';"
            text = text.replace(marker, marker + '\n\nexport const dynamic = "force-dynamic";', 1)
        else:
            text = 'export const dynamic = "force-dynamic";\n\n' + text
    else:
        text = 'export const dynamic = "force-dynamic";\n\n' + text
    path.write_text(text, encoding='utf-8')
