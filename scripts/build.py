"""Empaqueta los scripts clásicos, CSS y SVG sin dependencias ni red."""
from pathlib import Path
import base64,re,mimetypes,json,zipfile
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text()
styles=re.findall(r'<link rel="stylesheet" href="([^"]+)">',html)
css='\n'.join((ROOT/f).read_text() for f in styles)
def asset(match):
 path=ROOT/match[1]
 if not path.exists():raise FileNotFoundError(path)
 return 'url("data:'+('font/ttf' if path.suffix=='.ttf' else mimetypes.guess_type(path)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()+'")'
css=re.sub(r"url\(['\"]?(assets/[^)'\"]+)['\"]?\)",asset,css)
html=re.sub(r'<link rel="stylesheet" href="[^"]+">','',html)
html=html.replace('</head>','<style>'+css+'</style></head>')
def script(match):
 text=(ROOT/match[1]).read_text().replace('</script','<\\/script')
 return '<script>\n'+text+'\n</script>'
html=re.sub(r'<script src="([^"]+)"></script>',script,html)
# La licencia también viaja en el HTML único distribuido en itch.io.
license_text=(ROOT/'vendor/THREE-LICENSE.txt').read_text()
html=html.replace('</head>','<!-- Three.js / MIT\n'+license_text+'-->\n</head>')
assert not re.search(r'<script src=|<link rel="stylesheet"',html)
out=ROOT/'dist';out.mkdir(exist_ok=True)
version=json.loads((ROOT/'package.json').read_text())['version']
path=out/('RIUTEX2_Historia_Completa_v'+version+'.html');path.write_text(html)
print(path, path.stat().st_size,'bytes')
itch=out/('RIUTEX2_itchio_v'+version+'.zip')
with zipfile.ZipFile(itch,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
 archive.writestr('index.html',html)
print(itch, itch.stat().st_size,'bytes; index.html en la raíz para itch.io')
