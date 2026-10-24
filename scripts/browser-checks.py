"""Regresión de campaña, guardado y POV WebGL.
Las suites POV de Canvas anteriores quedan como referencia histórica; el render
y la captura actuales se comprueban con pov3d_browser y controls_v020.
"""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
for path in ['scripts/build.py','tests/browser_blue.py','tests/horror_browser.py','tests/revision_browser.py','tests/presentation_browser.py','tests/adventure_browser.py','tests/fielddesk_browser.py','tests/survival_browser.py','tests/gold_browser.py','tests/finale_browser.py','tests/works_browser.py','tests/depths_browser.py','tests/depths_visual.py','tests/flamethrower_browser.py','tests/castle_combat_probe.py','tests/castle_browser.py','tests/castle_visual.py','tests/endgame_browser.py','tests/endgame_visual.py','tests/standalone_blue.py','tests/polish_browser.py','tests/pov_controls_v020_browser.py','tests/pov3d_browser.py','tests/artifacts_lore_browser.py','tests/experience_browser.py','tests/persistence_browser.py']:
    result=subprocess.run([sys.executable,str(root/path)],cwd=root)
    if result.returncode:
        raise SystemExit(result.returncode)
