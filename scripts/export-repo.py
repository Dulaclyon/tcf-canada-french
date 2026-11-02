"""Prepare a credential-free allowlisted UTF-8 source tree for GitHub API upload."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
files=['README.md','.gitignore','.env.example','.nojekyll','package.json','index.html','app.js','styles.css','sw.js','manifest.webmanifest','icon.svg']
files += [str(p.relative_to(root)) for d in ['scripts','docs','.github','src/data'] for p in (root/d).rglob('*') if p.is_file() and p.suffix not in ['.pyc']]
print(json.dumps([{'path':f,'mode':'100644','type':'blob','content':(root/f).read_text()} for f in sorted(set(files))],ensure_ascii=False))
