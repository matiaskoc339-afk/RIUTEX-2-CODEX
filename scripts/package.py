"""Crea HTML y ZIP revisables después de ejecutar las pruebas documentadas para la versión."""
from pathlib import Path
import argparse,json,zipfile,shutil,re,hashlib
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=root/'release');args=parser.parse_args();out=args.out;out.mkdir(parents=True,exist_ok=True)
version=json.loads((root/'package.json').read_text())['version'];stem='RIUTEX2_Historia_Completa_v'+version
html=root/'dist'/(stem+'.html');assert html.exists(),'Ejecuta npm run build.'
text=html.read_text();assert '<script src=' not in text and '<link rel="stylesheet"' not in text
styles=['style.css','blue.css','horror.css','revision.css','presentation.css','adventure.css','fielddesk.css','survival.css','finale.css','works.css','depths.css','castle.css','endgame.css','polish.css','pov.css']
for src in re.findall(r'<script src="([^"]+)"',(root/'index.html').read_text()):assert (root/src).read_text().replace('</script','<\\/script') in text,src
assert 'class SpiderMatriarch' in text and 'const ProtectionSuit' in text and 'class BlindCarver' in text and 'class RoyalRegent' in text and 'class OriginWren' in text and 'FIN DE RIUTEX 2' in text
result=json.loads((root/'docs/RESULTADOS.json').read_text());assert result['version']==version
files=[root/n for n in ['.gitignore','artifacts/.gitkeep','README.md','RIUTEX2_LEEME.md','package.json','index.html',*styles]]
for d in ['assets','docs','js','planos','scripts','tests']:files.extend(p for p in (root/d).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc')
logs=['all-tests-v0170.txt','pov-models-browser-v0170.txt','pov-browser-v0170.txt','pov-effects-browser-v0170.txt','horror-browser-v0170.txt','pov-patch-browser-v0170.txt','pov-capture-browser-v0170.txt','standalone-v0170.txt','all-tests-v0162.txt','pov-capture-browser-v0162.txt','pov-patch-browser-v0162.txt','pov-browser-v0162.txt','standalone-v0162.txt','all-tests-v0161.txt','pov-patch-browser-v0161.txt','pov-browser-v0161.txt','pov-effects-browser-v0161.txt','horror-browser-v0161.txt','standalone-v0161.txt','all-tests-v0160.txt','browser-suite-v0160.txt','maps-v015.txt','browser-diagnostic-unseeded-v0160.txt']
shots=['pov-enemies-v017.png','pov-bosses-v017.png','pov-items-v017.png','pov-butcher-hospital-v017.png','pov-floor-loot-v017.png','pov-unvisited-office-v0161.png','menu-quiet-v016.png','menu-shot-v016.png','menu-options-v016.png','pov-mansion-v016.png','pov-hospital-v016.png','pov-hospitalworks-v016.png','pov-hospitalcastle-v016.png','pov-hospitalumbra-v016.png','pov-carnicero-2-v016.png','pov-matriarca-3-v016.png','pov-regente-2-v016.png','pov-wren-3-v016.png','pov-effects-wren-cues-v016.png','pov-effects-street-cure-v016.png','pov-effects-street-mutate-v016.png','standalone-pov-v016.png']
shutil.copyfile(html,out/(stem+'.html'))
with zipfile.ZipFile(out/(stem+'.zip'),'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(set(files)):z.write(p,stem+'/'+p.relative_to(root).as_posix())
 z.write(html,stem+'/'+html.name)
 for n in [*result['browser_groups'],*logs]:
  p=root/'artifacts'/n;assert p.exists(),n;z.write(p,stem+'/pruebas/'+n)
 for n in shots:
  p=root/'artifacts'/n;assert p.exists(),n;z.write(p,stem+'/capturas/'+n)
with zipfile.ZipFile(out/(stem+'.zip')) as z:
 assert z.testzip() is None
 assert z.read(stem+'/'+html.name)==(out/(stem+'.html')).read_bytes()
 for p in sorted(set(files)):assert z.read(stem+'/'+p.relative_to(root).as_posix())==p.read_bytes()
for p in [out/(stem+'.html'),out/(stem+'.zip')]:print(p,p.stat().st_size,'bytes',hashlib.sha256(p.read_bytes()).hexdigest())
print('ZIP verificado:',len(set(files)),'fuentes y',sum(result['browser_groups'].values()),'comprobaciones de navegador.')
