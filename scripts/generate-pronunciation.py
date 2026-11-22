"""Build static French audio from the exact displayed examples, with learner pauses.
Requires edge-tts, mutagen and imageio-ffmpeg. Set NODE_BINARY if needed.
"""
import argparse,asyncio,hashlib,json,os,shutil,subprocess,tempfile
from pathlib import Path
import edge_tts,imageio_ffmpeg
from mutagen.mp3 import MP3
ROOT=Path(__file__).resolve().parent.parent
VOICE='fr-FR-DeniseNeural'
RATE='-8%'
def catalog():
    node=os.environ.get('NODE_BINARY') or shutil.which('node')
    if not node:raise RuntimeError('Set NODE_BINARY to your Node executable.')
    return json.loads(subprocess.check_output([node,str(ROOT/'scripts/pronunciation-catalog.mjs')],text=True,cwd=ROOT))
async def synthesize(entry,audio,directory,pause_ms):
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe();pcm=bytearray();boundaries=[]
    for index,phrase in enumerate(entry['examples']):
        segment=directory/f'{audio.stem}-{index}.mp3'
        for attempt in range(3):
            try:
                local=[]
                with segment.open('wb') as handle:
                    async for chunk in edge_tts.Communicate(phrase,VOICE,rate=RATE,boundary='WordBoundary').stream():
                        if chunk['type']=='audio':handle.write(chunk['data'])
                        elif chunk['type']=='WordBoundary':local.append({key:chunk[key] for key in ['text','offset','duration']})
                decoded=subprocess.check_output([ffmpeg,'-v','error','-i',str(segment),'-f','s16le','-ar','24000','-ac','1','-'])
                if not decoded:raise RuntimeError('Empty audio segment')
                break
            except Exception:
                if attempt==2:raise
                await asyncio.sleep(2*(attempt+1))
        shift=round(len(pcm)/48000*10000000)
        boundaries.extend([{**b,'offset':b['offset']+shift} for b in local]);pcm.extend(decoded)
        if index<len(entry['examples'])-1:pcm.extend(bytes(round(48*pause_ms)))
    raw=directory/(audio.stem+'.pcm');raw.write_bytes(pcm)
    subprocess.run([ffmpeg,'-v','error','-y','-f','s16le','-ar','24000','-ac','1','-i',str(raw),'-c:a','libmp3lame','-b:a','96k',str(audio)],check=True)
    return boundaries
async def main():
    parser=argparse.ArgumentParser();parser.add_argument('--key',action='append');parser.add_argument('--pause-ms',type=int,default=1000);args=parser.parse_args()
    if not 0<=args.pause_ms<=5000:raise ValueError('pause-ms must be between 0 and 5000')
    clips=catalog();out=ROOT/'pronunciation-audio';out.mkdir(exist_ok=True)
    previous=json.loads((out/'manifest.json').read_text()) if (out/'manifest.json').exists() else {}
    manifest={'voice':VOICE,'rate':RATE,'origin':'generated-speech','catalogVersion':2,'clips':{k:v for k,v in previous.get('clips',{}).items() if k in clips} if args.key else {}}
    with tempfile.TemporaryDirectory(prefix='tcf-phonics-') as temporary:
        directory=Path(temporary);staged=[]
        for key in args.key or clips:
            entry=clips[key];audio=directory/(key+'.mp3');boundaries=await synthesize(entry,audio,directory,args.pause_ms)
            duration=MP3(audio).info.length;content=audio.read_bytes()
            if len(content)<1000 or duration<.3:raise RuntimeError('Empty or invalid audio')
            manifest['clips'][key]={**entry,'file':key+'.mp3','duration':round(duration,3),'sha256':hashlib.sha256(content).hexdigest(),'boundaries':boundaries,'voice':VOICE,'rate':RATE,'pauseBetweenExamplesMs':args.pause_ms}
            staged.append((audio,out/(key+'.mp3')));print(f'{key}: {len(entry["examples"])} examples, {duration:.1f}s',flush=True)
        for source,destination in staged:shutil.copyfile(source,destination)
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':asyncio.run(main())
