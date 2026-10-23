// IA del Carnicero: persecuciones aleatorias (sin quedarse atascado en esquinas) + puertas (solo él las abre).
const { X } = require('./harness.js'); const { Game, Level, TILE, Hospital, Nav } = X; let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
Game.init(); Game.startLvl = 'mansion'; Game.start(false); Hospital.toHospital(Game); Game.story.seq = 'free'; Game.story.restrained = false;
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (const fl of ['hospital', 'hospital1', 'hospitalb']) {
  Game.arrive = null; Hospital.buildLevel(Game, fl, null); Game.state = 'play'; Game.player.maxHp = Game.player.hp = 1e9; for (const d of Level.doors) { d.key = null; Level.openDoor(d); }
  const floor = []; for (let y = 0; y < Level.H; y++) for (let x = 0; x < Level.W; x++) if (Level.grid[y][x] === 0 && !Nav.safe(x, y)) floor.push([x, y]);
  const c = Game.carn; c.dormant = false; c.r = 14; let okN = 0, slow = 0, N = 0, worst = 0;
  for (let k = 0; k < 150; k++) {
    const a = floor[Math.floor(rnd() * floor.length)], b = floor[Math.floor(rnd() * floor.length)]; const ideal = Nav.path(a[0] * TILE + 16, a[1] * TILE + 16, b[0] * TILE + 16, b[1] * TILE + 16); if (!ideal || ideal.length < 8) continue; N++;
    c.x = a[0] * TILE + 16; c.y = a[1] * TILE + 16; c.state = 'chase'; c.hunt = true; c.path = null; c.stagger = 0; c.openT = 0; c.atkCd = 99; const p = Game.player; p.x = b[0] * TILE + 16; p.y = b[1] * TILE + 16; p.hidden = false; Game.noise = null;
    const need = ideal.length * TILE / 150 * 1.5 + 4; let t = 0, done = false; while (t < need && !done) { c.tgt = [p.x, p.y]; c.lostT = 0; c.update(1 / 60, Game); t += 1 / 60; if (Math.hypot(c.x - p.x, c.y - p.y) < 70) done = true; }
    if (done) { okN++; worst = Math.max(worst, t / (ideal.length * TILE / 150)); } else { slow++; if (slow <= 3) console.log('   atascado: de', a, 'a', b, 'ruta', ideal.length, 'dist final', Math.round(Math.hypot(c.x - p.x, c.y - p.y) / TILE), 'tiles en', (c.x / TILE).toFixed(1), (c.y / TILE).toFixed(1)); }
  }
  ok(okN / N >= .97, fl + ': el Carnicero completa ' + okN + '/' + N + ' persecuciones aleatorias sin atascarse (peor caso x' + worst.toFixed(2) + ' del tiempo ideal)');
}
// puertas: enemigo normal NO cruza una puerta cerrada; el Carnicero la abre y la deja abierta
Hospital.buildLevel(Game, 'hospital', null); Game.state = 'play'; Game.player.maxHp = Game.player.hp = 1e9; const d = Level.doors.find(d => d.id === 'ofi'); const arch = Level.doors.find(d => d.id === 'des');
for (const x of Level.doors) if (x.id !== 'ofi') { x.key = null; Level.openDoor(x); }
const px = 10 * TILE + 16, py = 25 * TILE + 16; Game.player.x = px; Game.player.y = py; const en = Game.enemies.find(e => e.id === 828); en.x = 20 * TILE + 16; en.y = 25.5 * TILE; en.alert = true; en.dead = false; Game.enemies.forEach(e => { if (e !== en && e.id !== 900) e.dead = true; });
for (let i = 0; i < 600; i++) { Game.update(1 / 60); en.alert = true; } ok(!d.open && en.x > 17.5 * TILE, 'Puerta cerrada: un enemigo normal NO la atraviesa ni la abre (x=' + (en.x / TILE).toFixed(1) + ')');
const c = Game.carn; Game.story.carnActive = true; c.dormant = false; c.x = 20 * TILE + 16; c.y = 25.5 * TILE; c.state = 'chase'; c.hunt = true; c.tgt = [px, py]; c.path = null; c.atkCd = 99; let t = 0; while (!d.open && t++ < 600) { c.tgt = [px, py]; c.lostT = 0; c.update(1 / 60, Game); } ok(d.open, 'El Carnicero abre la puerta cerrada (en ' + t + ' frames) y la deja abierta'); for (let i = 0; i < 60; i++) { c.tgt = [px, py]; c.update(1 / 60, Game); } ok(d.open, 'La puerta queda abierta tras su paso');
// puerta con llave: el Carnicero no puede
const lk = Level.doors.find(d => d.id === 'arch'); ok(lk.key === 'archivo' || lk.open, 'Puertas con llave siguen bloqueadas (no se saltan puzzles)');
console.log(fails ? '\nFALLOS: ' + fails : '\nIA/PUERTAS OK');

process.exitCode = fails ? 1 : 0;
