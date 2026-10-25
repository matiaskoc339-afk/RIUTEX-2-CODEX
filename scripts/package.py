"""Empaqueta la versión comprobada y verifica cada archivo antes de entregarla."""
from pathlib import Path
import argparse,hashlib,json,re,shutil,subprocess,zipfile

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--out',type=Path,default=root/'release')
args=parser.parse_args();out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
version=json.loads((root/'package.json').read_text())['version'];stem='RIUTEX2_Historia_Completa_v'+version
html=root/'dist'/(stem+'.html');itch=root/'dist'/('RIUTEX2_itchio_v'+version+'.zip')
assert html.exists() and itch.exists(),'Ejecuta npm run build.'
text=html.read_text();assert '<script src=' not in text and '<link rel="stylesheet"' not in text
for src in re.findall(r'<script src="([^"]+)"',(root/'index.html').read_text()):
    assert (root/src).read_text().replace('</script','<\\/script') in text,'HTML desactualizado: '+src
assert (root/'vendor/THREE-LICENSE.txt').read_text() in text
with zipfile.ZipFile(itch) as z:
    assert z.namelist()==['index.html'] and z.read('index.html')==html.read_bytes()
result=json.loads((root/'docs/RESULTADOS.json').read_text());assert result['version']==version
assert result['system_failures']==0
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
files={p:root/p for p in tracked if p and (root/p).is_file()}
for name in result.get('browser_reports',{}).values():
    path=root/'artifacts'/name;assert path.is_file(),name;files['artifacts/'+name]=path
for name in result.get('release_artifacts',[]):
    path=root/'artifacts'/name;assert path.is_file(),name;files['artifacts/'+name]=path
for name in ['index.html','js/experience-settings.js','js/survival-readout.js','js/soundscape.js','experience.css','vendor/three.min.js','vendor/THREE-LICENSE.txt','dist/'+html.name,'dist/'+itch.name]:
    assert name in files,'Añade al repositorio antes de empaquetar: '+name
shutil.copyfile(html,out/html.name);shutil.copyfile(itch,out/itch.name)
archive=out/(stem+'.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for name,path in sorted(files.items()):z.write(path,stem+'/'+name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for name,path in files.items():assert z.read(stem+'/'+name)==path.read_bytes(),name
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
manifest={'version':version,'commit':commit,'source_files':len(files),'system_tests':result['system_tests'],'browser_checks':result['browser_checks_total'],'files':{}}
for path in [out/html.name,out/itch.name,archive]:
    manifest['files'][path.name]={'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    print(path,path.stat().st_size,'bytes',manifest['files'][path.name]['sha256'])
(out/('RELEASE_v'+version+'.json')).write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('ZIP verificado archivo por archivo:',len(files),'entradas; commit',commit)
