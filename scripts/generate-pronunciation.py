"""Offline asset preparation only: pip install edge-tts mutagen; no runtime API calls."""
import asyncio,json
from pathlib import Path
import edge_tts
CLIPS={
 'e':'Thé. Été. Mes amis. Assez. Venez. Aller. Cet été, mes amis prennent le thé.',
 'open-e':'Faire. Lait. Père. Très. Fête. Tête. Seize. Jouet. Mon père fait la fête.',
 'i':'Île. Si. Fanny. Ici. Une petite île. Fanny habite ici.',
 'wa':'Moi. Toi. Loi. Foie. Soi. Viens avec moi. Toi et moi.',
 'tion':'La situation. La nation. La conversation. La solution. La décision. Nous cherchons une solution.',
 'nasal-in':'Pain. Train. Matin. Impossible. Demain. Je prends le train demain matin.',
 'o':'Eau. Chaud. Beau. Aux. Un beau cadeau. Il fait chaud. Je bois de l’eau.',
 'eu':'Feu. Peu. Eux. Heureux. Sœur. Heure. Un peu. Deux heures. Ma sœur est heureuse.',
 'j':'Bien. Pied. Voyage. Travail. Détail. Fille. Famille. Bouteille. Ma famille prépare un voyage.',
 'ou':'Nous. Vous. Tout. Doux. Loup. Joue. Goût. Jouer. Nous jouons avec vous.'
}
async def main():
 out=Path('pronunciation-audio');out.mkdir(exist_ok=True)
 for key,text in CLIPS.items():
  await edge_tts.Communicate(text,'fr-FR-DeniseNeural',rate='-8%').save(str(out/(key+'.mp3')))
  print(key,flush=True)
 (out/'manifest.json').write_text(json.dumps({'voice':'fr-FR-DeniseNeural','rate':'-8%','origin':'generated-speech','clips':CLIPS},ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':asyncio.run(main())
