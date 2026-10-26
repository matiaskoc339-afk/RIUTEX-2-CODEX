"""Regresión de campaña, guardado, sonido y POV WebGL.
--from-suite permite continuar después de reparar una suite histórica.
Cada ejecución reconstruye el HTML para que las pruebas usen la fuente actual.
"""
from pathlib import Path
import argparse,subprocess,sys
root=Path(__file__).resolve().parents[1]
suites=['browser_blue.py','horror_browser.py','revision_browser.py','presentation_browser.py','adventure_browser.py','fielddesk_browser.py','survival_browser.py','gold_browser.py','finale_browser.py','works_browser.py','depths_browser.py','depths_visual.py','flamethrower_browser.py','castle_combat_probe.py','castle_browser.py','castle_visual.py','endgame_browser.py','endgame_visual.py','standalone_blue.py','polish_browser.py','pov_controls_v020_browser.py','pov3d_browser.py','artifacts_lore_browser.py','experience_browser.py','persistence_browser.py','enemy_motion_browser.py','perspective_choice_browser.py','intro_pursuit_browser.py','experience_settings_browser.py','fielddesk_polish_browser.py','audio_polish_browser.py','pov_world_polish_browser.py','persistence_world_browser.py','intelligence_browser.py']
parser=argparse.ArgumentParser();parser.add_argument('--from-suite',choices=suites);args=parser.parse_args()
paths=['scripts/build.py']+['tests/'+name for name in suites[(suites.index(args.from_suite) if args.from_suite else 0):]]
for path in paths:
    print('SUITE',path,flush=True)
    result=subprocess.run([sys.executable,str(root/path)],cwd=root)
    if result.returncode:raise SystemExit(result.returncode)
