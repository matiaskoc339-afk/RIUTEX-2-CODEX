const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { X, run } = require('./harness');
const { Game: g, Hospital: H, Level: L, Enemy, Weapons: W } = X;
if (run('typeof POV3DBallistics') === 'undefined') run(fs.readFileSync(path.join(__dirname, '../js/pov3d-ballistics.js'), 'utf8'));
if (run('typeof POV3DRenderer') === 'undefined') run('globalThis.POV3DRenderer={};');
const renderer = run('POV3DRenderer');
g.init();
function start(pov = true, pitch = 0) {
  g.startLvl = 'mansion'; g.start(false); H.toHospital(g); g.story.restrained = false; H.inject(g); H.lobbyReached(g); g.story.seq = 'free'; g.state = 'play';
  g.carn = null; g.boss = g.curBoss = null; g.enemies = []; g.barrels = []; g.crystals = []; g.projectiles = []; g.tracers = []; g.keys = {};
  L.W = 40; L.H = 30; L.grid = Array.from({ length: L.H }, (_, y) => Array.from({ length: L.W }, (_, x) => !x || !y || x === 39 || y === 29 ? 1 : 0)); L.props = {}; L.safeRects = [];
  g.player.x = 320; g.player.y = 336; g.player.angle = 0; g.player.stamina = 100; g.player.mods.prec = 100; g.player.xp = 0; g.player.hp = 100;
  g.giveWeapon('pistol', 12, true); g.player.weapon = g.player.weapons.pistol; g.player.weapon.mag = 12;
  run(`FirstPerson.setEnabled(${pov});FirstPerson.pitch=${pitch}`);
  renderer.ready = true; renderer.eyeHeight = 35; renderer.worldState = { ceilingHeight: 62 };
  renderer.bodyHeight = e => /spider|rata/.test(e.type) ? 13 : 44;
  renderer.propHeight = type => type === 'bed' ? 18 : type === 'locker' ? 48 : 31;
  return g.player;
}
function target(type = 'sonambulo', distance = 128, id = 99500) {
  const e = new Enemy(type, g.player.x + distance, g.player.y, id); e.hp = 1; g.enemies.push(e); return e;
}
test('POV 3D: disparar al nivel del cuerpo conserva daño, munición, estamina y una sola recompensa', () => {
  const p = start(), e = target(), before = p.stamina; W.fire(g, p);
  assert.ok(e.dead); assert.equal(p.weapon.mag, 11); assert.ok(p.stamina < before); assert.equal(p.xp, 1);
  e.hurt(1000, 0, g); assert.equal(p.xp, 1);
  const trace = g.tracers.at(-1); assert.equal(trace.pov3D, true); assert.equal(trace.height1, 35); assert.equal(trace.height2, 35);
});
test('POV 3D: mirar al techo o al suelo no daña al enemigo que queda en la línea horizontal', () => {
  for (const pitch of [-1.2, 1.2]) {
    const p = start(true, pitch), e = target(); W.fire(g, p);
    assert.equal(e.hp, 1); assert.equal(e.dead, false); assert.equal(p.weapon.mag, 11); assert.equal(p.xp, 0);
    const trace = g.tracers.at(-1); assert.equal(trace.height2, pitch < 0 ? 62 : 0);
  }
});
test('POV 3D: una araña baja necesita apuntar a su altura', () => {
  let p = start(), e = target('ds_spider', 96); W.fire(g, p); assert.equal(e.dead, false);
  p = start(true, Math.atan2(35 - 8, 96)); e = target('ds_spider', 96); W.fire(g, p); assert.equal(e.dead, true);
});
test('POV 3D: los disparos pasan sobre camas bajas pero muros y armarios siguen bloqueando', () => {
  for (const [tile, prop, killed] of [[4, 'bed', true], [4, 'locker', false], [1, 'wall', false], [2, 'door', false], [3, 'locked-door', false]]) {
    const p = start(), e = target(); L.grid[10][11] = tile; L.props['11,10'] = prop; W.fire(g, p); assert.equal(e.dead, killed, prop);
  }
});
test('Topdown mantiene su disparo horizontal y sus muebles sólidos aunque el último pitch sea vertical', () => {
  let p = start(false, -1.2), e = target(); W.fire(g, p); assert.equal(e.dead, true); assert.equal(g.tracers.at(-1).pov3D, undefined);
  p = start(false, 0); e = target(); L.grid[10][11] = 4; L.props['11,10'] = 'bed'; W.fire(g, p); assert.equal(e.dead, false);
});
test('POV sin renderer 3D conserva el comportamiento anterior para los navegadores sin WebGL', () => {
  const p = start(true, -1.2), e = target(); renderer.ready = false; W.fire(g, p); assert.equal(e.dead, true); assert.equal(g.tracers.at(-1).pov3D, undefined);
});
test('No se alteran los proyectiles de poderes o las granadas existentes', () => {
  const p = start(); g.giveWeapon('gl6', 2, true); p.weapon = p.weapons.gl6; const n = g.projectiles.length; W.fire(g, p);
  assert.equal(g.projectiles.length, n + 1); assert.ok(g.projectiles.at(-1).grenade); assert.equal(g.projectiles.at(-1).pov3D, undefined);
});
test('Los patios y exteriores no añaden un techo invisible a las trayectorias', () => {
  start(); L.rooms = [{ n: 'Patio de invierno', x: 0, y: 0, w: 40, h: 30 }];
  const B = run('POV3DBallistics'); assert.equal(B.ceiling(g), Infinity); assert.equal(B.solid(400, 336, 100, g), false);
  L.rooms = []; assert.equal(B.ceiling(g), 62); assert.equal(B.solid(400, 336, 100, g), true);
});
