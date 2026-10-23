"""Resume registros ya obtenidos; no sustituye la ejecución de las pruebas."""
from pathlib import Path
import json,re,sys
r=Path(__file__).resolve().parents[1]
files=['browser-blue-results.json','horror-browser-results.json','revision-browser-results.json','presentation-browser-results.json','adventure-browser-results.json','fielddesk-browser-results.json','survival-browser-results.json','gold-browser-results.json','finale-browser-results.json','works-browser-results.json','depths-browser-results.json','depths-visual-results.json','flamethrower-browser-results.json','castle-combat-results.json','castle-browser-results.json','castle-visual-results.json','endgame-browser-results.json','endgame-visual-results.json','standalone-blue-results.json','polish-browser-results.json','pov-browser-results.json','pov-effects-browser-results.json']
version=json.loads((r/'package.json').read_text())['version']
presentation_only='--presentation-only' in sys.argv
pov_patch='--pov-patch' in sys.argv
pov_capture='--pov-capture' in sys.argv
pov_models='--pov-models' in sys.argv
files.extend(['pov-patch-browser-results.json','pov-capture-browser-results.json','pov-models-browser-results.json'])
if presentation_only:files=['standalone-blue-results.json','polish-browser-results.json']
if pov_patch:files=['pov-patch-browser-results.json','pov-browser-results.json','pov-effects-browser-results.json','horror-browser-results.json','standalone-blue-results.json']
if pov_capture:files=['pov-capture-browser-results.json','pov-patch-browser-results.json','pov-browser-results.json','standalone-blue-results.json']
if pov_models:files=['pov-models-browser-results.json','pov-browser-results.json','pov-effects-browser-results.json','horror-browser-results.json','pov-patch-browser-results.json','pov-capture-browser-results.json','standalone-blue-results.json']
data={n:json.loads((r/'artifacts'/n).read_text()) for n in files}
if presentation_only:
 for n,d in data.items():assert d.get('version')==version,(n,'Vuelve a ejecutar la prueba de esta versión.')
for n,d in data.items():assert not d.get('errors'),(n,d['errors'])
if pov_patch:
 for n in ['pov-patch-browser-results.json','standalone-blue-results.json']:assert data[n].get('version')==version,(n,'Vuelve a ejecutar la prueba de esta versión.')
if pov_capture:
 for n in ['pov-capture-browser-results.json','pov-patch-browser-results.json','standalone-blue-results.json']:assert data[n].get('version')==version,(n,'Vuelve a ejecutar la prueba de esta versión.')
if pov_models:
 for n in ['pov-models-browser-results.json','pov-capture-browser-results.json','pov-patch-browser-results.json','standalone-blue-results.json']:assert data[n].get('version')==version,(n,'Vuelve a ejecutar la prueba de esta versión.')
groups={n:len(d.get('passed',d.get('checks',[]))) for n,d in data.items()}
log=(r/('artifacts/all-tests-v'+version.replace('.','')+'.txt')).read_text();assert 'ℹ fail 0' in log
result=json.loads((r/'docs/RESULTADOS.json').read_text());result.pop('patch',None)
if (presentation_only or pov_patch or pov_capture or pov_models) and result['version']!=version:
 result['regression_baseline']={k:result[k] for k in ['version','system_tests','integration_checks','map_validations','browser_groups','browser_checks_total']}
result['validation_scope']='Menú, fundidos y HTML integrado; motor y mapas comprobados de nuevo. El resto del navegador se conserva como historial de la versión anterior.' if presentation_only else 'Suite completa del motor y navegador.'
if pov_patch:result['validation_scope']='Motor, integración y mapas completos; navegador enfocado en visibilidad POV, mirada vertical, controles, efectos/epílogos, oscuridad clásica y HTML integrado. El resto de la campaña conserva su historial v0.16.0.'
if pov_capture:result['validation_scope']='Motor, integración y mapas completos; navegador enfocado en el botón Bloquear ratón, captura real/rechazada, controles POV, visibilidad y HTML integrado. Los otros grupos conservan sus validaciones anteriores.'
if pov_models:result['validation_scope']='Motor, integración y mapas completos; siete grupos de navegador: modelos/objetos/retícula, controles y recorrido POV, efectos/epílogos, oscuridad clásica, mirada/visibilidad, captura del ratón y HTML integrado. Los combates completos de campaña conservan sus validaciones anteriores.'
result.update(version=version,date='2026-10-23',scope='RIUTEX 2 completo: mansión, hospital, fábrica, castillo, laboratorio UMBRAL, Wren/ORIGEN y dos epílogos',system_tests=int(re.search(r'ℹ tests (\d+)',log)[1]),system_failures=0,integration_checks=len(re.findall(r'^PASS ',log,re.M)),map_validations=len(re.findall(r'^  OK$',log,re.M)),browser_groups=groups,browser_checks_total=sum(groups.values()),standalone_headless_fps=data['standalone-blue-results.json']['headless_fps'],file_access=data['standalone-blue-results.json'].get('file_access'))
result['new_map'].update(laboratory_dimensions=[156,128],laboratory_rooms=26,laboratory_doors=40,laboratory_enemies=35,antidote_ingredients=3,laboratory_puzzles=12,laboratory_optional_modules=5,origin_dimensions=[60,56],origin_rooms=3,origin_phases=3,street_dimensions=[66,62],street_rooms=4,endings=2)
for key,group,field in [('arena_combat','works-browser-results.json','combat'),('carnicero_combat','finale-browser-results.json','combat'),('suit_custodian_combat','depths-browser-results.json','guard_combat'),('matriarch_combat','depths-browser-results.json','boss_combat'),('castle_m9_combats','castle-combat-results.json','combats'),('castle_r98_combat','castle-browser-results.json','royal_r98_combat'),('origin_combat','endgame-browser-results.json','combat')]:
 if group in data:result[key]=data[group][field]
result['presentation']={'skill_stats_updated':62,'fractional_stats_updated':50,'small_riutex_reserves_updated':12,'transition_ms':680,'reduced_transition_ms':160,'skill_nodes':153,'golden_pairs':4,'menu_revision':'v0.15.1: sin figuras humanas, sangre con textura, disparos reflejados más intensos, logo y botones renovados','previous_browser_suites':'Los escenarios de lógica y recorrido aíslan la presentación; polish-browser verifica los fundidos con requestAnimationFrame real.'}
result['pov']={'optional':True,'default_enabled':False,'settings':['menuFirstPerson','pauseFirstPerson'],'renderer':'Proyección en primera persona con profundidad por píxel, materiales y siluetas frontales; misma simulación y colisiones.','camera_relative_movement':True,'pointer_lock_fallback':True,'saves_unchanged':True,'coverage':'Prólogo y primera huida con movimiento real; siete armas, quince mapas, doce formas de jefes preparadas; avisos, poderes, caída y dos epílogos preparados con comparación de píxeles.'}
result['pov'].update(normal_vertical_look=True,unvisited_rooms_visible_through_open_doors=True,walls_and_closed_doors_occlude=True,map_discovery_unchanged=True,topdown_visibility_unchanged=True)
result['pov']['capture_button']='povCaptureButton'
if 'pov-models-browser-results.json' in data:
 models=data['pov-models-browser-results.json'];result['pov'].update(enemy_identities=len(models['models']),boss_phase_images=len(models['bosses']),loot_samples=len(models['items']),inherited_type_cache_fixed=True,centered_crosshair=True)
result['notes']='v0.16 añade la opción Primera Persona POV en ajustes y pausa, con vista clásica predeterminada, materiales, enemigos frontales, armas y avisos proyectados. v0.15.1 renueva exclusivamente la presentación del menú; se elimina la figura humana y se intensifican disparos, material de sangre, entorno y botones. v0.15 conserva balance porcentual, opciones persistentes y fundidos. Rutas, mecanismos y finales con movimiento, puertas y botones reales; enemigos retirados solo para aislar geometría. Combates independientes con IA y recursos preparados finitos. El controlador conoce posiciones y avisos y no representa una primera partida humana ni valida los recursos de la campaña íntegra. UMBRAL se recorre en sus 26 espacios; sus tres cámaras no permiten eludir cierres. Wren atraviesa tres mutaciones sin saltos. El GL-6 tiene identidad independiente de la migración LG-4/FL-4, granadas fabricables, explosión y cuatro mejoras. La decisión del antídoto se guarda, elimina poderes mutantes y el brazo reconstruido al curarse, o conserva la transformación. Ambos finales caminan por la calle y muestran el helicóptero antes del resultado. Capturas preparadas de formas no se cuentan como combates. La inyección de vida máxima sustituye al rifle del hospital. HTML integrado probado por HTTP sin recursos externos; Chromium administrado bloquea file://, intento que no se cuenta como superado.'
result['notes']='v0.16.1 corrige el sentido vertical de ratón/flechas y elimina únicamente en POV la máscara de salas sin visitar, manteniendo oclusión física, descubrimiento del plano y oscuridad clásica. '+result['notes']
result['notes']='v0.16.2 añade el botón Bloquear ratón, visible solo en POV sin captura y durante la partida; Esc libera y pausa. '+result['notes']
result['notes']='v0.17.0 diferencia las criaturas y objetos de primera persona, separa Carnicero/Vacío y C-17/Camillero antes de la caché, recorta el margen transparente de objetos sueltos y centra la mira al inclinar la cámara. '+result['notes']
(r/'docs/RESULTADOS.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['system_tests','integration_checks','map_validations','browser_checks_total']},ensure_ascii=False))
