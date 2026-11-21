"""Build static French audio from the exact displayed examples. No runtime TTS/API calls.
Requires edge-tts and mutagen. Set NODE_BINARY if node is not on PATH.
"""
import argparse,asyncio,hashlib,json,os,shutil,subprocess,tempfile
from pathlib import Path
import edge_tts
from mutagen.mp3 import MP3
ROOT=Path(__file__).resolve().parent.parent
VOICE='fr-FR-DeniseNeural'
RATE='-8%'
def catalog():
    node=os.environ.get('NODE_BINARY') or shutil.which('node')
    if not node: raise RuntimeError('Set NODE_BINARY to your Node executable.')
    return json.loads(subprocess.check_output([node,str(ROOT/'scripts/pronunciation-catalog.mjs')],text=True,cwd=ROOT))
async def main():
    parser=argparse.ArgumentParser();parser.add_argument('--key',action='append');args=parser.parse_args()
    clips=catalog();out=ROOT/'pronunciation-audio';out.mkdir(exist_ok=True)
    previous=json.loads((out/'manifest.json').read_text()) if (out/'manifest.json').exists() else {}
    manifest={'voice':VOICE,'rate':RATE,'origin':'generated-speech','catalogVersion':2,'clips':dict(previous.get('clips',{})) if args.key else {}}
    selected=args.key or list(clips)
    # Prepare every replacement before touching the existing playable files.
    with tempfile.TemporaryDirectory(prefix='tcf-phonics-') as directory:
        staged=[]
        for key in selected:
            entry=clips[key];audio=Path(directory)/(key+'.mp3');boundaries=[]
            for attempt in range(3):
                try:
                    boundaries=[]
                    speech=edge_tts.Communicate(entry['text'],VOICE,rate=RATE,boundary='WordBoundary')
                    with audio.open('wb') as handle:
                        async for chunk in speech.stream():
                            if chunk['type']=='audio':handle.write(chunk['data'])
                            elif chunk['type']=='WordBoundary':boundaries.append({'text':chunk['text'],'offset':chunk['offset'],'duration':chunk['duration']})
                    duration=MP3(audio).info.length
                    if audio.stat().st_size<1000 or duration<.3:raise RuntimeError('Empty or invalid audio')
                    break
                except Exception:
                    if attempt==2:raise
                    await asyncio.sleep(2*(attempt+1))
            content=audio.read_bytes()
            manifest['clips'][key]={**entry,'file':key+'.mp3','duration':round(duration,3),'sha256':hashlib.sha256(content).hexdigest(),'boundaries':boundaries}
            staged.append((audio,out/(key+'.mp3')))
            print(f'{key}: {len(entry["examples"])} examples, {duration:.1f}s',flush=True)
        for source,destination in staged:shutil.copyfile(source,destination)
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':asyncio.run(main())
