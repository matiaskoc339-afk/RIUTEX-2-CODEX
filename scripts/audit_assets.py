"""Audita dependencias declaradas; no borra archivos ni interpreta código como órdenes."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse,json,re

ROOT=Path(__file__).resolve().parents[1]
MEDIA={'.svg','.png','.jpg','.jpeg','.webp','.gif','.ttf','.woff','.woff2','.ogg','.mp3','.wav','.glb','.gltf'}

def audit_runtime(root=ROOT):
    root=Path(root).resolve();seen=set();pending=['index.html'];references=[];missing=[];external=[];dynamic=[]
    def reference(owner,value,relative=False):
        value=value.strip()
        if not value or value.startswith(('data:','#','blob:')):return
        split=urlsplit(value)
        if split.scheme or split.netloc:
            external.append({'from':owner,'url':value});return
        path=unquote(split.path)
        base=Path(owner).parent if relative and not path.startswith('/') else Path('.')
        resolved=(root/base/path.lstrip('/')).resolve()
        try:target=resolved.relative_to(root).as_posix()
        except ValueError:
            missing.append({'from':owner,'path':value,'reason':'fuera del proyecto'});return
        references.append({'from':owner,'path':target})
        if not resolved.is_file():missing.append({'from':owner,'path':target,'reason':'no existe'})
        elif target not in seen:pending.append(target)
    while pending:
        owner=pending.pop()
        if owner in seen:continue
        path=root/owner
        if not path.is_file():
            missing.append({'from':'entrada','path':owner,'reason':'no existe'});continue
        seen.add(owner)
        if path.suffix not in {'.html','.css','.js'}:continue
        text=path.read_text()
        if path.suffix=='.html':
            for value in re.findall(r'<(?:script|img|source)\b[^>]*?\bsrc=["\']([^"\']+)',text,re.I):reference(owner,value,True)
            for value in re.findall(r'<link\b[^>]*?\bhref=["\']([^"\']+)',text,re.I):reference(owner,value,True)
        elif path.suffix=='.css':
            for value in re.findall(r'url\(\s*["\']?([^\)"\']+)',text,re.I):reference(owner,value,True)
            for value in re.findall(r'@import\s+["\']([^"\']+)',text,re.I):reference(owner,value,True)
        else:
            # Los recursos JS se resuelven desde el documento; no desde js/.
            # Solo rutas literales, sin ejecutar funciones ni eliminar código legado.
            for value in re.findall(r'["\']((?:assets|vendor)/[^"\'<>\s]+\.[a-zA-Z0-9]+(?:[?#][^"\'<>\s]*)?)["\']',text):reference(owner,value)
            # Una construcción dinámica necesita revisión humana. Nunca se considera
            # un archivo prescindible solo porque esta auditoría no pueda resolverla.
            for line,source in enumerate(text.splitlines(),1):
                if re.search(r'[`"\'](?:assets|vendor)/[^`"\']*(?:\$\{|[`"\']\s*\+)',source):
                    dynamic.append({'from':owner,'line':line,'reason':'ruta construida en JavaScript; revisar antes de eliminar candidatos'})
    licenses=[]
    if any(name.startswith('assets/fonts/') for name in seen):licenses.append('assets/fonts/OFL.txt')
    if 'vendor/three.min.js' in seen:licenses.append('vendor/THREE-LICENSE.txt')
    for name in licenses:
        if (root/name).is_file():seen.add(name)
        else:missing.append({'from':'licencia','path':name,'reason':'no existe'})
    media=[p.relative_to(root).as_posix() for folder in ['assets','vendor'] for p in (root/folder).rglob('*') if p.is_file() and p.suffix.lower() in MEDIA]
    unused=[{'path':name,'bytes':(root/name).stat().st_size} for name in sorted(set(media)-seen)]
    files=[{'path':name,'bytes':(root/name).stat().st_size} for name in sorted(seen)]
    return {'entry':'index.html','runtime_files':files,'runtime_bytes':sum(row['bytes'] for row in files),
            'references':references,'missing':missing,'external':external,'dynamic_resource_sites':dynamic,'unreferenced_media':unused,
            'scope':'Dependencias HTML, CSS y rutas literales de recursos JS más sus licencias. Un candidato sin referencias requiere revisión antes de borrarlo; no demuestra que una función JS sea código muerto.'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=ROOT);parser.add_argument('--out',type=Path)
    args=parser.parse_args();result=audit_runtime(args.root);text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.out:args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(text)
    else:print(text,end='')
    if result['missing'] or result['external']:raise SystemExit(1)

if __name__=='__main__':main()
