from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
for path in ['scripts/build.py','tests/browser_blue.py','tests/horror_browser.py','tests/revision_browser.py','tests/presentation_browser.py','tests/adventure_browser.py','tests/fielddesk_browser.py','tests/survival_browser.py','tests/gold_browser.py','tests/finale_browser.py','tests/works_browser.py','tests/depths_browser.py','tests/depths_visual.py','tests/flamethrower_browser.py','tests/castle_combat_probe.py','tests/castle_browser.py','tests/castle_visual.py','tests/endgame_browser.py','tests/endgame_visual.py','tests/standalone_blue.py','tests/polish_browser.py','tests/pov_browser.py','tests/pov_effects_browser.py','tests/pov_patch_browser.py','tests/pov_capture_browser.py','tests/pov_models_browser.py','tests/pov_sensitivity_browser.py']:
    result=subprocess.run([sys.executable,str(root/path)],cwd=root)
    if result.returncode:
        raise SystemExit(result.returncode)
