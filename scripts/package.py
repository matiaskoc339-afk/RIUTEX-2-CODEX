"""Entrega limpia: HTML, ZIP de itch.io y fuentes editables sin resultados duplicados."""
from pathlib import Path
import argparse,hashlib,json,re,shutil,subprocess,zipfile
from audit_assets import audit_runtime

ROOT=Path(__file__).resolve().parents[1]
ZIP_TIME=(2026,1,1,0,0,0)


def exclusion_reason(name):
    """Excluir de la distribución no borra el archivo de desarrollo."""
    parts=Path(name).parts
    if any(part in {'.git','__pycache__','.pytest_cache'} for part in parts) or name.endswith(('.pyc','.pyo')):
        return 'caché o metadatos del entorno'
    if name.startswith('dist/'):
        return 'compilados entregados por separado; se regeneran con npm run build'
    if name.startswith('release/'):
        return 'paquetes de distribución anteriores'
    if name.startswith('planos/'):
        return 'exportaciones con spoilers; se regeneran con npm run maps'
    if name.startswith('artifacts/') and name!='artifacts/.gitkeep':
        return 'capturas, registros o informes generados de desarrollo'
    if name in {'CONTENIDO_DEL_PAQUETE.txt','DISTRIBUCION.json'}:
        return 'metadatos de una distribución anterior; se regeneran'
    return None


def project_files(root):
    """En el repositorio usa el índice; un ZIP extraído funciona sin tener .git."""
    root=Path(root).resolve()
    try:
        top=subprocess.check_output(['git','rev-parse','--show-toplevel'],cwd=root,text=True,stderr=subprocess.DEVNULL).strip()
        if Path(top).resolve()!=root:raise ValueError('El repositorio pertenece a otra carpeta')
        names=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
        commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
    except (subprocess.CalledProcessError,FileNotFoundError,ValueError):
        names=[path.relative_to(root).as_posix() for path in root.rglob('*') if path.is_file()]
        commit=None
    return sorted(name for name in names if name and (root/name).is_file()),commit


def source_selection(root,names,audit):
    root=Path(root);required={row['path'] for row in audit['runtime_files']}
    kept={};excluded=[]
    for name in names:
        path=root/name
        if not path.is_file():continue
        assert path.resolve().is_relative_to(root.resolve()),'El archivo sale del proyecto: '+name
        reason=exclusion_reason(name)
        if reason:
            if name in required:raise AssertionError('La exclusión afectaría al juego: '+name)
            excluded.append({'path':name,'bytes':path.stat().st_size,'reason':reason})
        else:kept[name]=path
    for name in required:
        assert (root/name).is_file(),'Dependencia ausente: '+name
        # El recurso nuevo también debe estar presente aunque aún no exista en el índice.
        kept[name]=root/name
    return kept,excluded


def write_source_zip(path,stem,files,generated):
    payload={name:file.read_bytes() for name,file in files.items()}
    payload.update(generated)
    with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        # El exportador de planos necesita esta carpeta aunque no lleve imágenes anteriores.
        for directory in ['artifacts/','planos/']:
            info=zipfile.ZipInfo(stem+'/'+directory,ZIP_TIME);info.external_attr=(0o40755<<16)|0x10
            z.writestr(info,b'')
        for name,data in sorted(payload.items()):
            info=zipfile.ZipInfo(stem+'/'+name,ZIP_TIME);info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,data,compresslevel=9)
    with zipfile.ZipFile(path) as z:
        assert z.testzip() is None
        assert {name for name in z.namelist() if not name.endswith('/')}=={stem+'/'+name for name in payload}
        for name,data in payload.items():assert z.read(stem+'/'+name)==data,name
    return len(payload)


def validate_build(root,version):
    root=Path(root);html=root/'dist'/('RIUTEX2_Historia_Completa_v'+version+'.html');itch=root/'dist'/('RIUTEX2_itchio_v'+version+'.zip')
    assert html.exists() and itch.exists(),'Ejecuta npm run build.'
    text=html.read_text();assert '<script src=' not in text and '<link rel="stylesheet"' not in text
    for src in re.findall(r'<script src="([^"]+)"',(root/'index.html').read_text()):
        assert (root/src).read_text().replace('</script','<\\/script') in text,'HTML desactualizado: '+src
    assert (root/'vendor/THREE-LICENSE.txt').read_text() in text
    with zipfile.ZipFile(itch) as z:
        assert z.namelist()==['index.html'] and z.read('index.html')==html.read_bytes()
    return html,itch


def package(root,out):
    root=Path(root).resolve();out=Path(out).resolve()
    # No volver a incluir la salida cuando se empaquetan fuentes sin repositorio Git.
    assert out!=root,'La salida no puede ser la raíz del proyecto.'
    if root in out.parents:assert out==root/'release','La salida dentro del proyecto debe ser release/.'
    out.mkdir(parents=True,exist_ok=True)
    version=json.loads((root/'package.json').read_text())['version'];stem='RIUTEX2_Historia_Completa_v'+version
    html,itch=validate_build(root,version)
    result=json.loads((root/'docs/RESULTADOS.json').read_text());assert result['version']==version
    assert result['system_failures']==0
    audit=audit_runtime(root);assert not audit['missing'],audit['missing'];assert not audit['external'],audit['external']
    names,commit=project_files(root)
    # Registra también las pruebas/capturas que el empaquetador anterior añadía
    # desde archivos ignorados, sin volver a meterlas en el ZIP fuente.
    evidence=[*result.get('browser_reports',{}).values(),*result.get('release_artifacts',[])]
    names=sorted(set(names+['artifacts/'+name for name in evidence if (root/'artifacts'/name).is_file()]))
    files,excluded=source_selection(root,names,audit)
    for name in ['index.html','package.json','README.md','RIUTEX2_LEEME.md','scripts/build.py','scripts/package.py','scripts/audit_assets.py','assets/fonts/OFL.txt','vendor/THREE-LICENSE.txt']:
        assert name in files,'Añade al repositorio antes de empaquetar: '+name
    distribution={'version':version,'commit':commit,'runtime_files':len(audit['runtime_files']),'runtime_bytes':audit['runtime_bytes'],'unreferenced_media':audit['unreferenced_media'],'dynamic_resource_sites':audit['dynamic_resource_sites'],
        'excluded_from_source':excluded,'excluded_bytes':sum(row['bytes'] for row in excluded),'scope':'Se omiten resultados, compilados duplicados y exportaciones regenerables del ZIP fuente; se conservan en el repositorio o el espacio de desarrollo. No se elimina código del juego ni recursos activos.'}
    readme=('RIUTEX 2 · fuentes editables · v'+version+'\n\n'
        'Para jugar desde estas fuentes: npm start y abre http://localhost:8000.\n'
        'Para generar el HTML único y el ZIP de itch.io: npm run build.\n'
        'El HTML y el ZIP para jugar también se entregan por separado.\n'
        'El ZIP fuente conserva código, recursos, licencias, documentación y pruebas.\n'
        'No contiene capturas, registros antiguos, compilados duplicados ni planos exportados.\n'
        'Los planos se regeneran con npm run maps (requiere Pillow).\n'
        'La documentación de diseño puede incluir imágenes enlazadas que sí se conservan.\n'
        'DISTRIBUCION.json explica cada exclusión; ningún recurso activo se elimina.\n').encode()
    generated={'CONTENIDO_DEL_PAQUETE.txt':readme,'DISTRIBUCION.json':(json.dumps(distribution,ensure_ascii=False,indent=2)+'\n').encode()}
    shutil.copyfile(html,out/html.name);shutil.copyfile(itch,out/itch.name)
    archive=out/(stem+'.zip');count=write_source_zip(archive,stem,files,generated)
    manifest={'version':version,'commit':commit,'source_files':count,'system_tests':result['system_tests'],'browser_checks':result['browser_checks_total'],'runtime_audit':{'files':len(audit['runtime_files']),'missing':len(audit['missing']),'external':len(audit['external'])},'distribution_cleanup':{'excluded_files':len(excluded),'excluded_bytes':distribution['excluded_bytes']},'files':{}}
    for path in [out/html.name,out/itch.name,archive]:
        manifest['files'][path.name]={'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        print(path,path.stat().st_size,'bytes',manifest['files'][path.name]['sha256'])
    (out/('RELEASE_v'+version+'.json')).write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('ZIP fuente verificado:',count,'archivos; dependencias activas:',len(audit['runtime_files']),'· sin copias de compilados ni informes generados')
    return manifest


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=ROOT/'release');parser.add_argument('--root',type=Path,default=ROOT)
    args=parser.parse_args();package(args.root,args.out)

if __name__=='__main__':main()
