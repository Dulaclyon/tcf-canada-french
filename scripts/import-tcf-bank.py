"""Import the user's local 188-set collection; preserve originals outside the repo."""
from pathlib import Path
from collections import Counter
import xml.etree.ElementTree as E,zipfile,re,json,hashlib,os
ROOT=Path(__file__).resolve().parent.parent
source=next(ROOT.parent.glob('【002】*'))
out=ROOT/'imports/tcf-bank/bank';out.mkdir(parents=True,exist_ok=True)
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
manifest=[];audioJobs={};issues=[]
def identity(p):
 name=p.stem
 if '免费' in name:return 'free'+re.search(r'免费\s*(\d)',name)[1]
 return re.search(r'(\d+)',name)[1]
def tokens(p):
 z=zipfile.ZipFile(p);rels=E.fromstring(z.read('word/_rels/document.xml.rels'));targets={e.attrib['Id']:e.attrib.get('Target','') for e in rels};doc=E.fromstring(z.read('word/document.xml'));result=[]
 for para in doc.findall('.//w:p',ns):
  text=''.join(t.text or '' for t in para.findall('.//w:t',ns)).strip()
  if text and not text.startswith('⭐') and 'Bontcf.com' not in text:result.append(('text',text))
  for blip in para.findall('.//a:blip',ns):
   target=targets.get(blip.attrib.get('{'+ns['r']+'}embed',''),'')
   if not target or not target.startswith('media/'):continue
   data=z.read('word/'+target);name=hashlib.sha256(data).hexdigest()[:24]+Path(target).suffix.lower();dest=out/'images'/name;dest.parent.mkdir(exist_ok=True);dest.write_bytes(data);result.append(('image','bank/images/'+name))
 return result
mark=re.compile(r'^(?:(\d+|免费[12])\s*[-－]\s*)?(\d{1,2})[.．]?$')
def parse(p,free=False):
 ts=tokens(p);answers='';qs=[];q=None
 for kind,t in ts:
  if kind=='text' and re.match(r'^答案\s*[:：]',t):answers=re.sub('[^ABCD]','',re.split('[:：]',t,maxsplit=1)[1]);continue
  match=mark.fullmatch(t) if kind=='text' else None
  if match and (match[1] or free) and 1<=int(match[2])<=39:
   q={'number':int(match[2]),'lines':[],'images':[]};qs.append(q);continue
  if q:
   if kind=='image':q['images'].append(t)
   elif not re.fullmatch(r'[_－—\-\s]+',t):q['lines'].append(t)
 return qs,answers
# Index original per-question audio; the 34 full-test recordings duplicate this material.
audioDirs={}
for p in source.rglob('*.mp3'):
 if '成套' in str(p):continue
 group='opal' if 'opal' in str(p) else 'reussir';key=(group,identity(p.parent));audioDirs.setdefault(key,[]).append(p)
transcripts={}
for p in source.rglob('*.docx'):
 if '听力文本（' in p.parent.name:
  transcripts[('opal' if 'opal' in p.parent.name else 'reussir',identity(p))]=p
for p in sorted(source.rglob('*.docx'),key=str):
 if '题目（' not in p.parent.name:continue
 kind='listening' if '听力题目' in p.parent.name else 'reading';group='opal' if 'opal' in p.parent.name else 'reussir';num=identity(p);id=f'{kind}-{group}-{num}'
 qs,answer=parse(p, num.startswith('free'));assert len(qs)==39,(p,len(qs));assert sorted(q['number'] for q in qs)==list(range(1,40)),p
 textBy={}
 if kind=='listening':
  tp=transcripts.get((group,num))
  if tp:
   tx,_=parse(tp,num.startswith('free'));textBy={q['number']:q['lines'] for q in tx}
  if len(textBy)!=39:issues.append({'set':id,'issue':'transcript-count','count':len(textBy)})
  audioBy={}
  for ap in audioDirs.get((group,num),[]):
   match=re.search(r'[-－]\s*\(?\s*(\d+)\)?$',ap.stem)
   if not match:issues.append({'set':id,'issue':'audio-filename','file':ap.name});continue
   qn=int(match[1]);digest=hashlib.sha256(ap.read_bytes()).hexdigest()[:32];audioBy[qn]='bank/audio/'+digest+'.m4a';audioJobs.setdefault(digest,str(ap))
 else:audioBy={}
 validAnswer=len(answer)==39
 if not validAnswer:issues.append({'set':id,'issue':'answer-count','count':len(answer),'rawAnswer':answer})
 for q in qs:
  lines=q.pop('lines');options=[];body=[];current=None
  starts=[i for i,line in enumerate(lines) if re.match(r'^A[.．)]\s*',line)]
  optionStart=starts[-1] if starts else len(lines)
  for lineIndex,line in enumerate(lines):
   if lineIndex<optionStart:
    if not re.fullmatch(r'Options\s*:',line,flags=re.I):body.append(line)
    continue
   if re.fullmatch(r'Options\s*:',line,flags=re.I):continue
   match=re.match(r'^([ABCD])[.．)]\s*(.*)',line)
   if match:current={'key':match[1],'text':match[2]};options.append(current)
   elif current:current['text']+=' '+line
   else:body.append(line)
  q['body']='\n'.join(body);q['options']=options;q['answer']=answer[q['number']-1] if validAnswer else None
  q['transcript']='\n'.join(textBy.get(q['number'],[]));q['audio']=audioBy.get(q['number'])
  if kind=='listening' and not q['transcript']:issues.append({'set':id,'question':q['number'],'issue':'missing-transcript'})
  if kind=='listening' and not q['audio']:issues.append({'set':id,'question':q['number'],'issue':'missing-audio'})
  if len(options)!=4:issues.append({'set':id,'question':q['number'],'issue':'option-count','count':len(options)})
  if kind=='listening':q['taskType']='看图选答' if q['images'] else '听录音选答'
  else:q['taskType']='阅读理解'
 title=('Réussir' if group=='reussir' else 'Opal')+' · '+('免费 '+num[4:] if num.startswith('free') else '套题 '+num)
 item=dict(id=id,kind=kind,group=group,title=title,number=num,questionCount=len(qs),answerComplete=validAnswer,questionFile=str(p.relative_to(source)))
 (out/'sets').mkdir(exist_ok=True);(out/'sets'/f'{id}.json').write_text(json.dumps({**item,'questions':qs},ensure_ascii=False,separators=(',',':')))
 manifest.append(item)
(out/'index.json').write_text(json.dumps({'title':'听读题库','sets':manifest},ensure_ascii=False,separators=(',',':')))
(ROOT/'imports/bank-import-issues.json').write_text(json.dumps(issues,ensure_ascii=False,indent=2));(ROOT/'imports/bank-audio-jobs.json').write_text(json.dumps(audioJobs,ensure_ascii=False))
print(json.dumps({'sets':len(manifest),'byKind':dict(Counter(m['kind'] for m in manifest)),'questions':sum(m['questionCount'] for m in manifest),'uniqueAudio':len(audioJobs),'issues':issues[:10],'issueCounts':dict(Counter(i['issue'] for i in issues))},ensure_ascii=False))
