from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,subprocess,time
import imageio_ffmpeg
root=Path(__file__).resolve().parent.parent
jobs=json.loads((root/'imports/bank-audio-jobs.json').read_text());out=root/'imports/tcf-bank/bank/audio';out.mkdir(exist_ok=True)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
def convert(item):
 key,source=item;dest=out/(key+'.m4a')
 if dest.exists() and dest.stat().st_size>100:return key,None
 temp=out/(key+'.tmp.m4a');r=subprocess.run([ffmpeg,'-v','error','-nostdin','-y','-i',source,'-vn','-map_metadata','-1','-ac','1','-ar','24000','-c:a','aac','-b:a','32000','-movflags','+faststart',str(temp)],capture_output=True)
 if r.returncode:return key,r.stderr.decode()[-500:]
 temp.replace(dest);return key,None
errors=[];start=time.time()
with ThreadPoolExecutor(max_workers=4) as pool:
 for n,f in enumerate(as_completed([pool.submit(convert,item) for item in jobs.items()]),1):
  key,error=f.result()
  if error:errors.append((key,error))
  if n%100==0:print(n,'/',len(jobs),'elapsed',round(time.time()-start),'sec',flush=True)
(root/'imports/bank-audio-errors.json').write_text(json.dumps(errors,ensure_ascii=False));print('DONE',len(jobs),'errors',errors,'MB',round(sum(p.stat().st_size for p in out.glob('*.m4a'))/1e6),flush=True)
