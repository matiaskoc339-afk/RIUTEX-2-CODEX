// Guardado/carga entre plantas, "Reintentar" con checkpoint, estrés de 6000 frames y compatibilidad con RIUTEX 1.
const { X } = require('./harness.js'); const { Game, Level, TILE, Hospital, Trees, SKILLS, UI } = X; let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { Game.update(dt); Game.render(); } }; const tp = (tx, ty) => { Game.player.x = tx * TILE + 16; Game.player.y = ty * TILE + 16; };
Game.init(); Game.startLvl = 'mansion'; Game.start(false); step(5);
Game.save(2); let sv = Game.getSaveSlots()[2]; ok(sv.lvl === 'mansion' && sv.levelName.includes('Mansión'), 'Guardado en la mansión (hueco 3): ' + sv.levelName); Game.start(false, sv); ok(Game.lvl === 'mansion' && Game.state === 'play' && Trees.cur === 'r2', 'Carga de la mansión OK');
Hospital.toHospital(Game); ok(Game.getSaveSlots()[3] && Game.getSaveSlots()[3].lvl === 'hospital', 'Checkpoint automático al despertar en el hospital (hueco oculto)');
Game.story.seq = 'free'; Game.story.restrained = false; Game.story.carnActive = true; Game.player.maxHp = Game.player.hp = 99999; Game.inv.keys.push('pase_sup', 'urgencias'); Level.openDoor(Level.doors.find(d => d.id === 'urg')); Level.openDoor(Level.doors.find(d => d.id === 'lob_w'));
Hospital.goto(Game, 'hospital1', [50, 45]); ok(Game.lvl === 'hospital1', 'Subes a la planta 1'); Level.openDoor(Level.doors.find(d => d.id === 'uci')); Game.mut.owned.add('sigilo'); Game.mut.owned.add('reflejos'); Game.player.xp = 77; Game.take(Game.items.find(i => i.id === 'p0')); if (Game.state === 'doc') Game.closeDoc();
Game.save(1); sv = Game.getSaveSlots()[1]; ok(sv.lvl === 'hospital1' && sv.levelName.includes('Hospital'), 'Guardado en la planta 1: ' + sv.levelName);
Game.start(false, sv); ok(Game.lvl === 'hospital1' && Game.state === 'play', 'Carga en planta 1'); ok(Level.doors.find(d => d.id === 'uci').open, 'Puerta abierta recuperada'); ok(Game.mut.has('sigilo') && Game.player.xp === sv.xp && Game.inv.docs.includes('p0'), 'Mutaciones, EXP y documentos restaurados'); ok(Game.carn && !Game.carn.dormant || Game.carnT > 0, 'El Carnicero sigue en juego tras cargar');
Hospital.goto(Game, 'hospital', [62, 24]); ok(Level.doors.find(d => d.id === 'urg').open && Level.doors.find(d => d.id === 'lob_w').open, 'Al volver a la planta baja, sus puertas siguen como las dejaste');
// Reintentar tras morir -> checkpoint
Game.player.hp = 0; Game.die && Game.die(); const cp = Game.getSaveSlots()[3]; ok(!!cp, 'Hay checkpoint para "Reintentar"');
// estrés
for (const fl of ['hospital', 'hospital1', 'hospitalb']) {
  Game.arrive = null; Hospital.buildLevel(Game, fl, null); Game.state = 'play'; Game.story.carnActive = true; Game.carnT = .1; Game.player.hp = Game.player.maxHp = 1e9; const codes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft']; let err = null, bad = false;
  try { for (let i = 0; i < 2000; i++) { if (i % 20 === 0) { Game.keys = {}; for (const k of codes) if (Math.random() < .45) Game.keys[k] = true; Game.mouse.x = Math.random() * 800; Game.mouse.y = Math.random() * 600; Game.mouse.clicked = Math.random() < .3; if (Math.random() < .08) Game.interact(); if (Math.random() < .03) Game.castSkill && Game.castSkill('reflejos'); }
      if (Game.state !== 'play') { if (Game.state === 'pad' || Game.state === 'doc' || Game.state === 'cine') { Game.resume && Game.resume(); Game.state = 'play'; } else Game.state = 'play'; } Game.update(1 / 60); Game.render(); const p = Game.player, c = Game.carn; if (![p.x, p.y, c.x, c.y].every(Number.isFinite)) { bad = true; break; } } } catch (e) { err = e; }
  ok(!err && !bad, 'Estrés 2000 frames en ' + fl + (err ? ' → ' + err.stack.split('\n').slice(0, 3).join(' | ') : ''));
}
// compatibilidad RIUTEX 1
Game.startLvl = 'asylum'; Game.start(false); ok(Trees.cur === 'r1' && Object.keys(SKILLS).length === Object.keys(Trees.r1).length && Object.keys(SKILLS).length >= 50, 'Al abrir RIUTEX 1 se restaura su árbol original (' + Object.keys(SKILLS).length + ' nodos)'); ok(Game.lvl === 'asylum' && Game.enemies.length === 36 && Game.boss.def.name === 'El Carcelero', 'RIUTEX 1 (asilo) intacto: 36 enemigos + Carcelero');
for (const l of ['sewer', 'base', 'lab']) { Game.buildLevel(l, null); step(100); } ok(true, 'Cloacas/Base/Laboratorio de RIUTEX 1 construyen y corren 100 frames'); UI.renderTree(Game); ok(true, 'Árbol de RIUTEX 1 renderiza');
Game.inv.items.push({ type: 'sample', x: 0, y: 0, w: 1, h: 1 }); Game.mut.phases = 0; try { Game.injectSample(); ok(Game.mut.phases === 1, 'Bug injectSample (R1) corregido'); } catch (e) { ok(false, 'injectSample falla: ' + e.message); }
// tipos de prop válidos
Game.startLvl = 'mansion'; Game.start(false); const missing = new Set(); for (const l of ['mansion', 'hospital', 'hospital1', 'hospitalb']) { Game.buildLevel(l, null); for (const k in Level.props) if (typeof X.PROP[Level.props[k]] !== 'function') missing.add(Level.props[k]); } ok(missing.size === 0, 'Todos los muebles tienen sprite' + (missing.size ? ' (faltan: ' + [...missing].join(',') + ')' : ''));
console.log(fails ? 'FALLOS ' + fails : 'TODO OK');

process.exitCode = fails ? 1 : 0;
