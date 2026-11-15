"""Verify and restore the versioned, split bank asset archive for GitHub Pages."""
from pathlib import Path
import hashlib,json,tarfile,tempfile,shutil
root=Path(__file__).resolve().parent.parent
pack=root/'bank-pack';manifest=json.loads((pack/'manifest.json').read_text())
with tempfile.TemporaryDirectory() as tmp:
 archive=Path(tmp)/'bank.tar.gz';total=hashlib.sha256()
 with archive.open('wb') as target:
  for part in manifest['parts']:
   data=(pack/part['name']).read_bytes()
   assert hashlib.sha256(data).hexdigest()==part['sha256'],'Damaged bank part: '+part['name']
   total.update(data);target.write(data)
 assert total.hexdigest()==manifest['sha256'],'Bank archive mismatch'
 with tarfile.open(archive) as tar:
  for member in tar.getmembers():
   assert (member.name=='bank' or member.name.startswith('bank/')) and '..' not in Path(member.name).parts and not Path(member.name).is_absolute()
   assert member.isfile() or member.isdir(),'Only regular bank assets are allowed'
  tar.extractall(root/'dist',filter='data')
index=json.loads((root/'dist/bank/index.json').read_text());assert len(index['sets'])==188
count=0;unscored=[]
for item in index['sets']:
 data=json.loads((root/'dist/bank/sets'/(item['id']+'.json')).read_text());assert len(data['questions'])==39
 if not data['answerComplete']:unscored.append(item['id'])
 for q in data['questions']:
  count+=1;assert [o['key'] for o in q['options']]==list('ABCD')
  if item['kind']=='listening':assert q['audio'] and (root/'dist'/q['audio']).is_file();assert q['transcript'] or (item['id']=='listening-opal-189' and q['number']==17)
  for image in q['images']:assert (root/'dist'/image).is_file()
  assert (q['answer'] in 'ABCD') if data['answerComplete'] else q['answer'] is None
assert count==7332 and unscored==['listening-opal-189']
print('Restored and validated 188 sets / 7332 questions; all listening audio, available transcripts and images present.')
