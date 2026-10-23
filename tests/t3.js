// Validación de mapas: objetos/enemigos sobre suelo, todo alcanzable (puertas transitables), muebles sin bloquear.
const { X } = require('./harness.js'); const { Game, Level, TILE, FLOORS } = X; Game.init(); Game.startLvl = 'mansion'; Game.start(false);
let bad = 0;
for (const l of ['mansion', 'hospital', 'hospital1', 'hospitalb', 'hospitalchem', 'hospitalworks', 'hospitalpit', 'hospitalnest', 'hospitalcells', 'hospitalcastle', 'hospitalcastle1', 'hospitalroyal', 'hospitalumbra', 'hospitalorigin', 'hospitalstreet']) {
  Game.buildLevel(l, null); const g = Level.grid, errs = [];
  for (const i of Game.items) { const tx = Math.floor(i.x / TILE), ty = Math.floor(i.y / TILE); if (g[ty][tx] !== 0) errs.push('item ' + i.id + '@' + tx + ',' + ty + ' g' + g[ty][tx]); }
  for (const e of Game.enemies) { const tx = Math.floor(e.x / TILE), ty = Math.floor(e.y / TILE); if (e.id !== 900 && g[ty][tx] !== 0) errs.push('enemy ' + e.id + '@' + tx + ',' + ty); }
  const sx = Math.floor(Game.player.x / TILE), sy = Math.floor(Game.player.y / TILE), seen = new Set([sx + ',' + sy]), q = [[sx, sy]];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Level.W || ny >= Level.H) continue; const v = g[ny][nx]; if (v === 1 || v === 4 || seen.has(nx + ',' + ny)) continue; seen.add(nx + ',' + ny); q.push([nx, ny]); } }
  const un = Game.items.filter(i => !seen.has(Math.floor(i.x / TILE) + ',' + Math.floor(i.y / TILE))).map(i => i.id), une = Game.enemies.filter(e => e.id !== 900 && !seen.has(Math.floor(e.x / TILE) + ',' + Math.floor(e.y / TILE))).map(e => e.id);
  const floorTiles = seen.size, miss = Game.items.filter(i => i.type === 'doc' && !X.DOCS[i.doc]).map(i => i.doc);
  // salas sin alcanzar
  const rooms = Level.rooms.filter(r => !seen.has((r.x + 1) + ',' + (r.y + 1)) && !seen.has((r.x + Math.floor(r.w / 2)) + ',' + (r.y + Math.floor(r.h / 2)))).map(r => r.n);
  const ids = Game.items.map(i => i.id), dup = ids.filter((x, k) => ids.indexOf(x) !== k);
  console.log(l, Level.W + 'x' + Level.H, 'salas', Level.rooms.length, 'puertas', Level.doors.length, 'objetos', Game.items.length, 'enemigos', Game.enemies.length, 'suelo', floorTiles);
  const all = [...errs, ...un.map(x => 'inalc.item ' + x), ...une.map(x => 'inalc.enem ' + x), ...miss.map(x => 'doc sin texto ' + x), ...rooms.map(x => 'sala inalc. ' + x), ...dup.map(x => 'id duplicado ' + x)];
  console.log('  ' + (all.length ? 'PROBLEMAS: ' + all.join('; ') : 'OK'));
  bad += all.length;
}
console.log(bad ? 'FALLOS ' + bad : 'MAPAS OK');

process.exitCode = bad ? 1 : 0;
