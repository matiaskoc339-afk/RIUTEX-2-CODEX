"""Auditoría de dependencias y ZIP fuente, sin cambiar la partida ni borrar recursos."""
from pathlib import Path
import importlib.util,json,re,subprocess,sys,tempfile,unittest,zipfile
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from audit_assets import audit_runtime
from package import exclusion_reason,project_files,source_selection,write_source_zip

class DistributionTests(unittest.TestCase):
    def test_actual_runtime_has_all_resources_and_licenses(self):
        a=audit_runtime(ROOT);self.assertFalse(a['missing']);self.assertFalse(a['external'])
        names={row['path'] for row in a['runtime_files']}
        for name in ['assets/perspective-pov.webp','assets/perspective-topdown.webp','assets/fonts/OFL.txt','vendor/THREE-LICENSE.txt','vendor/three.min.js']:
            self.assertIn(name,names)
        self.assertFalse(a['unreferenced_media'])

    def test_only_generated_development_outputs_are_excluded(self):
        names,_=project_files(ROOT);a=audit_runtime(ROOT);kept,excluded=source_selection(ROOT,names,a)
        self.assertTrue({row['path'] for row in a['runtime_files']}<=kept.keys())
        for name in ['index.html','package.json','scripts/build.py','scripts/test.js','tests/harness.js','docs/RESULTADOS.json','docs/images/personajes-pov-v0.21.0.png','artifacts/.gitkeep']:
            self.assertIn(name,kept)
        self.assertTrue(all(not name.startswith(('dist/','planos/')) for name in kept))
        self.assertTrue(all(not name.startswith('artifacts/') or name=='artifacts/.gitkeep' for name in kept))
        self.assertTrue(any(row['path'].startswith('planos/') for row in excluded))
        self.assertTrue(any(row['path'].startswith('dist/') for row in excluded))

    def test_audit_traces_relative_and_absolute_urls_and_literal_js_assets(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);(r/'styles').mkdir();(r/'js').mkdir();(r/'assets').mkdir()
            (r/'index.html').write_text('<link rel="stylesheet" href="styles/ui.css"><script src="js/app.js"></script>')
            (r/'styles/ui.css').write_text('a{background:url("../assets/one.svg?size=2#image")} b{background:url(/assets/two.webp)}')
            (r/'js/app.js').write_text("const path='assets/three.png?v=3#image';")
            for name in ['one.svg','two.webp','three.png']:(r/'assets'/name).write_text('fixture')
            a=audit_runtime(r);self.assertFalse(a['missing']);self.assertFalse(a['external'])
            self.assertEqual({row['path'] for row in a['runtime_files']},{'index.html','styles/ui.css','js/app.js','assets/one.svg','assets/two.webp','assets/three.png'})
            (r/'assets/one.svg').unlink();self.assertTrue(audit_runtime(r)['missing'])

    def test_unresolved_dynamic_resource_and_unused_candidate_are_reported_not_deleted(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);(r/'assets').mkdir();(r/'index.html').write_text('<script src="app.js"></script>')
            (r/'app.js').write_text("const path='assets/'+id+'.png';")
            p=r/'assets/candidate.png';p.write_text('do not delete')
            a=audit_runtime(r);self.assertTrue(a['dynamic_resource_sites']);self.assertEqual(a['unreferenced_media'][0]['path'],'assets/candidate.png');self.assertEqual(p.read_text(),'do not delete')

    def test_audit_rejects_external_paths_and_missing_entry(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);self.assertTrue(audit_runtime(r)['missing'])
            (r/'index.html').write_text('<script src="https://example.test/main.js"></script><img src="../outside.png">')
            a=audit_runtime(r);self.assertTrue(a['external']);self.assertTrue(a['missing'])

    def test_active_resource_cannot_be_excluded_even_if_in_generated_folder(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);(r/'planos').mkdir();p=r/'planos/required.png';p.write_bytes(b'active')
            with self.assertRaises(AssertionError):source_selection(r,['planos/required.png'],{'runtime_files':[{'path':'planos/required.png'}]})

    def test_zip_is_reproducible_and_preserves_every_selected_byte(self):
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);p=r/'index.html';p.write_bytes(b'<html>source</html>');files={'index.html':p};gen={'CONTENIDO_DEL_PAQUETE.txt':b'fixture'}
            a=r/'a.zip';b=r/'b.zip';write_source_zip(a,'game',files,gen);write_source_zip(b,'game',files,gen)
            self.assertEqual(a.read_bytes(),b.read_bytes())
            with zipfile.ZipFile(a) as z:
                self.assertEqual(z.read('game/index.html'),p.read_bytes());self.assertIn('game/planos/',z.namelist());self.assertIn('game/artifacts/',z.namelist())

    def test_extracted_source_has_runtime_and_boots_without_git_or_generated_files(self):
        a=audit_runtime(ROOT);names,_=project_files(ROOT);files,_=source_selection(ROOT,names,a)
        # Las incorporaciones de esta revisión aún pueden no estar en el índice.
        for name in ['scripts/audit_assets.py','scripts/package.py','tests/test_distribution.py']:
            files[name]=ROOT/name
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp);archive=r/'source.zip';write_source_zip(archive,'game',files,{})
            with zipfile.ZipFile(archive) as z:z.extractall(r)
            extracted=r/'game';audit=audit_runtime(extracted);self.assertFalse(audit['missing']);self.assertFalse(audit['external'])
            candidates,commit=project_files(extracted);self.assertIsNone(commit);self.assertIn('index.html',candidates)
            # El mismo arnés que ejecuta los escenarios de motor carga todos los JS,
            # incluidos los recursos vendor, desde el ZIP extraído.
            result=subprocess.run(['node','-e',"const {X}=require('./tests/harness');X.Game.init();X.Game.startLvl='mansion';X.Game.start(false);if(X.Game.lvl!=='mansion'||!X.Game.player)process.exit(2);"],cwd=extracted,text=True,capture_output=True)
            self.assertEqual(result.returncode,0,result.stderr)

if __name__=='__main__':unittest.main(verbosity=2)
