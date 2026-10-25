// Bucle principal, entrada, cámara, objetos, partículas, guardado y render.
const SAVE_KEY = 'riutex2_blue_v030';
const SAVE_SLOTS_KEY = 'riutex2_blue_slots_v030';
const Game = {
  state: 'menu', keys: {}, mouse: { x: 0, y: 0, down: false, clicked: false, rclick: false }, cam: { x: 0, y: 0, shake: 0 },
  enemies: [], items: [], bodies: [], particles: [], tracers: [], picked: new Set(), killed: new Set(), cleared: false, last: 0, t: 0,
  init() {
    this.cv = document.getElementById('cv'); this.ctx = this.cv.getContext('2d'); this.lc = document.createElement('canvas'); this.lctx = this.lc.getContext('2d');
    const rs = () => { this.cv.width = this.lc.width = Math.ceil(innerWidth / 1.35); this.cv.height = this.lc.height = Math.ceil(innerHeight / 1.35); }; rs(); addEventListener('resize', rs);
    addEventListener('keydown', e => {
      if (['Tab', 'Space'].includes(e.code)) e.preventDefault(); Sound.unlock();
      if (e.repeat) return;
      if (this.mut && this.mut.bindingTarget) {
        e.preventDefault();
        const code = e.code; if (code === 'Escape') { this.mut.bindingTarget = null; UI.msg('Asignación de tecla cancelada.', 1600); if (this.state === 'tree') UI.renderTree(this); return; }
        const blocked = ['Tab','Space','ShiftLeft','ShiftRight','ControlLeft','ControlRight','AltLeft','AltRight','KeyW','KeyA','KeyS','KeyD','KeyE','KeyF','KeyJ','KeyK','KeyR','Digit1','Digit2','Digit3','Digit4','Digit5','KeyM','Enter','Backspace'];
        if (blocked.includes(code)) { UI.msg('Esa tecla ya está reservada para otra acción. Elige otra.', 2200); return; }
        const taken = Object.entries(this.mut.bindings).find(([id, key]) => id !== this.mut.bindingTarget && key === code);
        if (taken) { UI.msg('Esa tecla ya está asignada a ' + SKILLS[taken[0]].name + '.', 2200); return; }
        this.mut.bindings[this.mut.bindingTarget] = code; this.mut.equipped = this.mut.bindingTarget; this.mut.bindingTarget = null;
        UI.msg('Tecla asignada: ' + this.keyName(code), 1800); if (this.state === 'tree') UI.renderTree(this); return;
      }
      this.keys[e.code] = true;
      if (e.code === 'KeyM' && (this.state === 'play' || this.state === 'map')) { this.toggleMap(); return; }
      if (e.code === 'Escape' && ['map','puzzle'].includes(this.state)) { this.resume(); return; }
      if (e.code === 'Escape') { if (this.state === 'play') this.pause(); else if (this.state === 'pause') this.resume(); else if (this.state === 'inv') this.toggleInv(); else if (this.state === 'doc') this.closeDoc(); else if (this.state === 'tree') this.toggleTree(); else if (this.state === 'stash') this.resume(); }
      if (this.state === 'cine') { if (['KeyE', 'Space', 'Enter'].includes(e.code)) this.cineNext(); return; }
      if (this.state === 'pad') { if (/^Digit\d$/.test(e.code)) Puzzles.key(this, e.code.slice(5)); else if (e.code === 'Backspace') Puzzles.key(this, 'C'); else if (e.code === 'Enter') Puzzles.key(this, 'OK'); else if (e.code === 'Escape') this.resume(); }
      if (e.code === 'Tab' && (this.state === 'play' || this.state === 'inv')) this.toggleInv();
      if (e.code === 'KeyR' && this.state === 'inv') this.rotateSel();
      if (e.code === 'KeyK' && (this.state === 'play' || this.state === 'tree')) this.toggleTree();
      if (e.code === 'KeyJ' && (this.state === 'play' || this.state === 'doc')) { if (this.state === 'doc') this.closeDoc(); else this.openJournal(); }
      if (this.state !== 'play') return;
      if (e.code === 'KeyR') Weapons.reload(this.player);
      if (e.code === 'KeyE') this.interact();
      if (e.code === 'KeyF') this.useInj();
      if (this.mut && Object.entries(this.mut.bindings).some(([id, code]) => code === e.code && this.mut.has(id))) this.castSkillByKey(e.code);
      if (/^Digit[12345]$/.test(e.code)) { const w = this.player.weapons[{ Digit1: this.lvl === 'mansion' && this.player.weapons.ak ? 'ak' : 'pistol', Digit2: 'shotgun', Digit3: 'viper', Digit4: this.player.weapons.r98 && (this.player.weapon?.id !== 'r98' || !this.player.weapons.rifle) ? 'r98' : 'rifle', Digit5: isR2lvl(this.lvl) ? this.player.weapons.gl6 && (this.player.weapon?.id !== 'gl6' || !this.player.weapons.flamethrower) ? 'gl6' : 'flamethrower' : 'launcher' }[e.code]]; if (w) { this.player.weapon = w; this.player.reloading = 0; UI.msg(WEAPONS[w.id].name, 1200); } }
    });
    addEventListener('keyup', e => this.keys[e.code] = false); addEventListener('blur', () => { this.keys = {}; if (this.state === 'play') this.pause(); });
    this.cv.addEventListener('mousemove', e => { this.mouse.x = e.clientX * this.cv.width / innerWidth; this.mouse.y = e.clientY * this.cv.height / innerHeight; });
    this.cv.addEventListener('mousedown', e => { if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; Sound.unlock(); } if (e.button === 2 && this.state === 'play') this.mouse.rclick = true; });
    addEventListener('mouseup', e => { if (e.button === 0) this.mouse.down = false; }); this.cv.addEventListener('contextmenu', e => e.preventDefault());
    const b = (id, f) => document.getElementById(id).onclick = () => { Sound.unlock(); f(); };
    document.getElementById('cine').onclick = () => this.cineNext(); b('bEnd', () => this.toMenu()); b('bPadX', () => this.resume()); b('bStSave', () => this.toStash()); b('bStClose', () => this.resume()); b('bRot', () => this.rotateSel()); b('bDrop', () => this.dropSel()); b('bBuy', () => this.treeAction()); b('bSample', () => this.injectSample()); b('bTreeClose', () => this.toggleTree()); b('bUse', () => this.useInj()); b('bInvClose', () => this.toggleInv()); b('bDocClose', () => this.closeDoc()); b('bNew', () => this.start(false)); b('bCont', () => this.openSaveSlots('load')); b('bRes', () => this.resume());
    b('bBind', () => this.assignSkillKey(UI.treeSel)); b('bRst', () => this.start(false)); b('bMenu', () => this.toMenu()); b('bMenu2', () => this.toMenu()); b('bRetry', () => this.start(this.hasSave()));
    this.refreshMenu(); UI.screen('menu'); requestAnimationFrame(t => this.loop(t));
  },
  validSave(s) { return !!(s && typeof s === 'object' && typeof s.lvl === 'string' && [s.x,s.y,s.hp,s.maxHp,s.xp].every(Number.isFinite) && s.maxHp > 0 && s.inv && Array.isArray(s.inv.items) && Array.isArray(s.inv.keys) && Array.isArray(s.inv.docs) && s.mut && Array.isArray(s.mut.owned) && s.story && typeof s.story === 'object' && Array.isArray(s.picked) && Array.isArray(s.killed)); },
  getSaveSlots() { try { const slots = SaveCodec.decode(localStorage.getItem(SAVE_SLOTS_KEY) || 'null'); return Array.from({length:4}, (_,i) => Array.isArray(slots) && this.validSave(slots[i]) ? slots[i] : null); } catch (e) { return [null,null,null,null]; } },
  hasSave() { return this.getSaveSlots().some(Boolean) || (() => { try { return this.validSave(SaveCodec.decode(localStorage.getItem(SAVE_KEY))); } catch (e) { return false; } })(); },
  refreshMenu() { document.getElementById('bCont').disabled = !this.hasSave(); },
  openSaveSlots(mode) { this.slotReturnState = this.state; this.slotFromPlay = this.state === 'play'; this.slotMode = mode; UI.renderSaveSlots(this, mode); this.state = 'slots'; UI.screen('slots'); },
  closeSaveSlots() { const back = this.slotReturnState || 'menu'; if (back === 'play') this.resume(); else this.toMenu(); },
  switchSaveSlotMode() { if (!this.slotFromPlay) return; this.slotMode = this.slotMode === 'save' ? 'load' : 'save'; UI.renderSaveSlots(this, this.slotMode); },
  chooseSaveSlot(slot) { if (this.slotMode === 'save') { if (!this.save(slot)) return; this.resume(); UI.msg('Partida guardada en el hueco ' + (slot + 1) + '.', 2600); return; } const slots = this.getSaveSlots(); let data = slots[slot]; if (!data && slot === 0) { try { data = SaveCodec.decode(localStorage.getItem(SAVE_KEY)); } catch (e) {} } if (!this.validSave(data)) return UI.msg('Este hueco está vacío o no contiene una partida válida.', 2400); this.start(false, data); },
  toMenu() { this.state = 'menu'; Sound.stopAmbient(); this.refreshMenu(); UI.screen('menu'); },
  pause() { this.state = 'pause'; UI.screen('pause'); }, resume() { this.state = 'play'; UI.screen(null); this.last = performance.now(); },
  start(load, slotData = null) {
    this.t = 0; this.bodies = []; this.particles = []; this.tracers = []; this.rings = []; this.projectiles = []; this.eproj = []; this.pools = []; this.barrels = []; this.dropN = 0; this.stash = []; this.picked = new Set(); this.killed = new Set(); this.cleared = false;
    this.inv = new Inventory(); this.mut = new Mutation(); this.pz = { power: false, safe: false, archive: false, boss: false, seq: [], valves: [0, 0, 0, 0], drain: false, fuses: false, gateD: false, locker: false, boss2: false, mandoT: false, taquilla: false, boss3: false, reactors: [0, 0, 0], reactor: false, bioT: false, cajaV: false, boss4: false, boss5: false, emily: false };
    this.story = { docs: [], samples: 0, riutexUsed: 0, decisions: [], read: [] }; // story: base para los finales
    let sv = slotData; if (load && !sv) { const slots = this.getSaveSlots(); sv = slots.find(Boolean) || null; if (!sv) { try { sv = SaveCodec.decode(localStorage.getItem(SAVE_KEY)); } catch (e) {} } }
    const p = this.player = new Player(0, 0);
    if (sv) {
      Object.assign(p, { hp: sv.hp, xp: sv.xp }); p.mods = Object.assign(p.mods, sv.mods); p.maxHp = sv.maxHp || 60;
      if (sv.mut) this.mut.load(sv.mut); p.energy = sv.energy == null ? 100 : sv.energy; p.lastCd = sv.lastCd || 0; this.inv.load(sv.inv); this.stash = sv.stash || []; this.inv.syncWeapons(p); p.weapon = sv.cur ? p.weapons[sv.cur] || null : null; this.story = sv.story; if (sv.pz) Object.assign(this.pz, sv.pz);
      this.picked = new Set(sv.picked); this.killed = new Set(sv.killed); this.dropN = 1000;
    }
    this.buildLevel(sv && sv.lvl ? sv.lvl : (this.startLvl || 'asylum'), sv);
    if (sv) { p.x = sv.x; p.y = sv.y; } else if (this.lvl === 'asylum') UI.msg('Despiertas en una celda vacía… Abre la puerta con E y busca un arma. TAB: maletín · J: diario de documentos.', 6000);
    this.state = 'play'; UI.screen(null); Sound.unlock(); Sound.startAmbient(); this.last = performance.now(); this.cam.x = p.x - this.cv.width / 2; this.cam.y = p.y - this.cv.height / 2;
  },
  buildLevel(lvl, sv) { // construye mapa, objetos y enemigos de un nivel (asilo o cloacas) y aplica el progreso guardado
    const p = this.player; this.lvl = lvl; Level.build(lvl); const D = { asylum: Campaign, sewer: Sewer, base: Base, lab: Lab }[lvl];
    const I = (id, type, tx, ty, x) => Object.assign({ id, type, x: tx * TILE + 16, y: ty * TILE + 16 }, x || {});
    this.items = D.items.map(a => I(a[0], a[1], a[2], a[3], a[4])); const bedPos = { asylum: [6, 5], sewer: [7, 6], base: [7, 6], lab: [7, 6] }[lvl]; this.items.push(I('savebed_' + lvl, 'savebed', bedPos[0], bedPos[1], { fixed: true })); this.enemies = D.enemies.map(a => new Enemy(a[1], a[2] * TILE + 16, a[3] * TILE + 16, a[0]));
    this.boss = lvl === 'lab' ? new Lucia(600, Lab.boss[0] * TILE + 16, Lab.boss[1] * TILE + 16) : lvl === 'sewer' ? new Caiman(300, Sewer.boss[0] * TILE + 16, Sewer.boss[1] * TILE + 16) : lvl === 'base' ? new Varga(400, Base.boss[0] * TILE + 16, Base.boss[1] * TILE + 16) : new Carcelero(100, 12 * TILE + 16, 47 * TILE + 16); this.enemies.push(this.boss); this.boss2 = lvl === 'lab' ? new Voss(700, Lab.boss2[0] * TILE + 16, Lab.boss2[1] * TILE + 16) : null; if (this.boss2) this.enemies.push(this.boss2); this.curBoss = null;
    this.crystals = lvl === 'lab' ? Lab.crystals.map(([x, y]) => ({ x: x * TILE + 16, y: y * TILE + 16, hp: 60, dead: false, respawn: 0 })) : [];
    this.barrels = (D.barrels || []).map(([x, y, m]) => ({ x: x * TILE + 16, y: y * TILE + 16, dead: false, mine: !!m })); this.eproj = []; this.pools = [];
    p.x = (D.spawn[0] + .5) * TILE; p.y = (D.spawn[1] + .5) * TILE;
    if (sv && sv.lvl === lvl) { (sv.doors || []).forEach(id => { const d = Level.doors.find(d => d.id === id); if (d) Level.openDoor(d); }); (sv.drops || []).forEach(d => this.items.push(d)); }
    this.items = this.items.filter(i => !this.picked.has(i.id) || i.fixed);
    this.enemies.forEach(e => { if (this.killed.has(e.id)) { e.dead = true; this.bodies.push({ x: e.x, y: e.y, a: e.face }); } });
    if (this.killed.has(this.boss.id)) { if (lvl === 'sewer') this.pz.boss2 = true; else if (lvl === 'base') this.pz.boss3 = true; else if (lvl === 'lab') this.pz.boss4 = true; else this.pz.boss = true; this.bossDrops(); }
    if (lvl === 'lab' && this.killed.has(700)) { this.pz.boss5 = true; const d = Level.doors.find(d => d.id === 'celda'); if (d) Level.openDoor(d); }
  },
  giveWeapon(id, ammo, force) { // añade un arma (y su munición inicial) al maletín; si no cabe, avisa (o la manda al baúl si es una recompensa)
    const p = this.player, inv = this.inv, w = WEAPONS[id], it = { type: 'w_' + id, id, mag: Weapons.magSize(p, w) };
    if (!inv.place(it)) { if (!force) { UI.msg('Sin espacio en el maletín para ' + w.name + '. Guarda algo en el baúl de la zona (cofre compartido).', 5000); return false; } this.stash.push(it); UI.msg(w.name + ' enviada al baúl compartido: tu maletín está lleno.', 6000); }
    inv.syncWeapons(p); if (ammo) { const got = inv.addAmmo(AMMO[id], ammo); if (got < ammo) { this.stash.push({ type: AMMO[id], count: ammo - got }); UI.msg('La munición que no cabía fue al baúl compartido.', 4000); } } if (!p.weapon && p.weapons[id]) p.weapon = p.weapons[id]; return true;
  },
  openStash() { this.state = 'stash'; UI.renderStash(this); UI.screen('stash'); },
  toStash() { const it = this.inv.selItem(); if (!it) return UI.msg('Selecciona un objeto de tu maletín.', 1800); this.inv.removeAt(this.inv.sel); this.inv.syncWeapons(this.player); this.stash.push(it); UI.renderStash(this); },
  fromStash(i) {
    const it = this.stash[i]; if (!it) return;
    if (it.type.startsWith('am_')) { const got = this.inv.addAmmo(it.type, it.count); if (got <= 0) return UI.msg('Sin espacio en el maletín.', 2000); if (got < it.count) it.count -= got; else this.stash.splice(i, 1); }
    else { if (!this.inv.place(it)) return UI.msg('Sin espacio en el maletín.', 2000); this.stash.splice(i, 1); this.inv.syncWeapons(this.player); }
    UI.renderStash(this);
  },
  enterLab() { // Parte 4: el laboratorio
    this.eproj = []; this.pools = []; this.buildLevel('lab', null); const p = this.player; this.cam.x = p.x - this.cv.width / 2; this.cam.y = p.y - this.cv.height / 2; this.cam.shake = 8; this.save();
    UI.msg('El laboratorio de Voss. Aquí nació todo. Los experimentos más nuevos patrullan los pasillos.', 8000);
  },
  cinematic(lines, cb) { this.state = 'cine'; this.cine = { lines, i: 0, cb }; UI.$('cineT').textContent = lines[0]; UI.screen('cine'); },
  cineNext() { const c = this.cine; if (!c || this.state !== 'cine') return; c.i++; if (c.i >= c.lines.length) { this.resume(); if (c.cb) c.cb(); } else UI.$('cineT').textContent = c.lines[c.i]; },
  talkEmily() {
    if (!this.pz.boss5) return UI.msg('La celda está cerrada.');
    this.cinematic(['Emily está sentada en el suelo de la celda, pálida, con una bata de paciente.', 'Emily: "…I.? Eres tú. De verdad viniste."', 'Issac: "Siempre vengo."', 'Emily: "Todo lo que escribí… lo que te hice… ¿lo leíste?"', 'Issac: "Lo leí. Me da igual. Salgamos de aquí."', 'Emily: "Hay una salida al oeste. Vamos, antes de que todo esto se derrumbe."'], () => { this.pz.emily = true; Level.openDoor(Level.doors.find(d => d.id === 'calle')); UI.msg('Salgan por la puerta oeste, a la calle.', 6000); });
  },
  blast(x, y, damage) { // explosión de granada: daña a enemigos y a ti, rompe cristales y detona barriles
    this.ring(x, y, 125, '#ffa050'); this.cam.shake = 12; this.sparks(x, y, 22, '#ff9040'); Sound.play('blast'); const p = this.player;
    for (const e of this.enemies) { const d = Math.hypot(e.x - x, e.y - y); if (!e.dead && d < 115 + e.r && Level.los(x, y, e.x, e.y)) e.hurt(damage == null ? (e.isBoss ? 120 : 150) : damage * (e.isBoss ? .8 : 1), Math.atan2(e.y - y, e.x - x), this, true); }
    if (Math.hypot(p.x - x, p.y - y) < 85 && Level.los(x, y, p.x, p.y)) p.hurt(28, Math.atan2(p.y - y, p.x - x), this);
    for (const o of this.barrels) if (!o.dead && Math.hypot(o.x - x, o.y - y) < 110 && Level.los(x, y, o.x, o.y)) o.chainDelay = Math.min(o.chainDelay ?? Infinity, .12);
    for (const c of this.crystals) if (!c.dead && Math.hypot(c.x - x, c.y - y) < 100 && Level.los(x, y, c.x, c.y)) this.breakCrystal(c);
  },
  breakCrystal(c) { c.dead = true; c.respawn = 8; this.ring(c.x, c.y, 60, '#80e0ff'); this.sparks(c.x, c.y, 14, '#80e0ff'); const b = this.boss; if (b && b.active && !b.dead && b.vuln !== undefined) { b.vuln = 5; UI.msg('¡El escudo cae! Dispárale ahora.', 1800); } },
  showEnding() {
    const m = Math.max(0, this.mut.owned.size - 1), em = EMILY_DOCS.every(d => this.inv.docs.includes(d)); let t, s, x;
    if (em) { t = 'FINAL SECRETO'; s = 'Lo que Emily guardaba'; x = 'En la calle, Emily le entrega a Issac su cuaderno completo: no solo lo que hizo, sino la fórmula que lleva meses anotando. No era solo una culpable: llevaba años buscando cómo deshacer lo que Voss empezó.\nJuntos tienen la verdad y los medios. El Riutex no terminó en el laboratorio: apenas empieza su final.'; }
    else if (m >= 25) { t = 'FINAL OSCURO'; s = 'El nuevo doctor'; x = 'Issac ha absorbido demasiado Riutex. En la calle, a la luz del amanecer, sus venas brillan y el suero le susurra. Emily lo mira con miedo.\nLo que salió del laboratorio no es el chico que repartía pizzas. Y el laboratorio, ahora vacío, necesita un nuevo director.'; }
    else if (m >= 7) { t = 'FINAL MUTANTE'; s = 'Lo que queda de ti'; x = 'Issac y Emily salen a la calle. Él está vivo, pero su cuerpo cambió para siempre: el Riutex ya forma parte de él.\nEmily lo abraza igual. "Aprenderemos a vivir con ello", dice. "Juntos."'; }
    else { t = 'FINAL HUMANO'; s = 'Conservar la humanidad'; x = 'Issac apenas usó el poder del Riutex. Sale del laboratorio con Emily de la mano, cansado pero entero.\nLa calle huele a lluvia. Es la primera vez en meses que respiran sin miedo.'; }
    UI.$('endH').textContent = t; UI.$('endS').textContent = s; UI.$('endB').textContent = x + '\n\nDocumentos reunidos: ' + this.inv.docs.length + ' · Mutaciones: ' + m + ' · Muestras: ' + this.story.riutexUsed + '\n\nGracias por jugar RIUTEX: The Hollow Asylum.'; UI.screen('end');
  },
  enterBase() { // Parte 3: de la salida de las cloacas a las instalaciones militares
    this.eproj = []; this.pools = []; this.buildLevel('base', null); const p = this.player; this.cam.x = p.x - this.cv.width / 2; this.cam.y = p.y - this.cv.height / 2; this.cam.shake = 8; this.save();
    UI.msg('Instalaciones militares del proyecto. Abandonadas a toda prisa… pero no vacías. Aquí viven las armas que salieron bien.', 8000);
  },
  enterSewer() { // Parte 2: de la salida del asilo a las cloacas
    this.eproj = []; this.pools = []; this.buildLevel('sewer', null); const p = this.player; this.cam.x = p.x - this.cv.width / 2; this.cam.y = p.y - this.cv.height / 2; this.cam.shake = 8; this.save();
    UI.msg('Bajas por la escotilla. Las cloacas: aquí tiraban a los que "fallaron". Cuidado con el fango verde: es veneno.', 8000);
  },
  explode(b) { // barril explosivo o mina: daña a enemigos y a ti; explota en cadena
    if (!b || b.dead) return; b.dead = true; b.chainDelay = null; const R = b.mine ? 75 : 125; this.ring(b.x, b.y, R + 5, '#ff9040'); this.cam.shake = 14; this.sparks(b.x, b.y, 24, '#ff8030'); Sound.play('blast'); const p = this.player;
    for (const e of this.enemies) { const d = Math.hypot(e.x - b.x, e.y - b.y); if (!e.dead && d < R + e.r && Level.los(b.x, b.y, e.x, e.y)) e.hurt(e.isBoss ? 110 : 160, Math.atan2(e.y - b.y, e.x - b.x), this, true); }
    if (Math.hypot(p.x - b.x, p.y - b.y) < (b.mine ? 60 : 90) && Level.los(b.x, b.y, p.x, p.y)) p.hurt(b.mine ? 32 : 25, Math.atan2(p.y - b.y, p.x - b.x), this);
    for (const o of this.barrels) if (!o.dead && Math.hypot(o.x - b.x, o.y - b.y) < 100 && Level.los(b.x, b.y, o.x, o.y)) o.chainDelay = Math.min(o.chainDelay ?? Infinity, .15);
  },
  save(slot = 0) {
    const p = this.player; try { const data = { lvl: this.lvl, x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, xp: p.xp, cur: p.weapon && p.weapon.id, stash: this.stash, mods: p.mods, pz: this.pz, inv: this.inv.serialize(), drops: this.items.filter(i => i.id.startsWith('drop')).map(i => ({ id: i.id, type: i.type, x: i.x, y: i.y, carry: i.carry, amount: i.amount, count: i.count })), mut: this.mut.serialize(), energy: p.energy, lastCd: p.lastCd, story: this.story, doors: Level.doors.filter(d => d.open).map(d => d.id), picked: [...this.picked], killed: [...this.killed], savedAt: new Date().toISOString(), levelName: ({mansion:'RIUTEX 2 · Mansión',hospital:'RIUTEX 2 · Hospital (planta baja)',hospital1:'RIUTEX 2 · Hospital (primer piso)',hospitalb:'RIUTEX 2 · Hospital (sótano)',hospitalchem:'RIUTEX 2 · Contención C-0',hospitalworks:'RIUTEX 2 · Cloacas / Fábrica',hospitalpit:'RIUTEX 2 · Ensayo del almacén',hospitalnest:'RIUTEX 2 · Último colector',hospitalcells:'RIUTEX 2 · Calabozos de Valcárcel',hospitalcastle:'RIUTEX 2 · Castillo (planta baja)',hospitalcastle1:'RIUTEX 2 · Castillo (planta alta)',hospitalroyal:'RIUTEX 2 · Sala real',hospitalumbra:'RIUTEX 2 · Laboratorio UMBRAL',hospitalorigin:'RIUTEX 2 · Núcleo ORIGEN',hospitalstreet:'RIUTEX 2 · Epílogo San Gabriel',asylum:'Asilo',sewer:'Cloacas',base:'Instalaciones militares',lab:'Laboratorio'})[this.lvl] || this.lvl }; if (slot === null) return JSON.parse(JSON.stringify(data)); const slots = this.getSaveSlots(); slots[slot] = data; localStorage.setItem(SAVE_SLOTS_KEY, SaveCodec.encode(slots)); try { localStorage.setItem(SAVE_KEY, SaveCodec.encode(data)); } catch (e) {} return true; } catch (e) { UI.msg('No se pudo guardar. El navegador no permite almacenar la partida.'); return false; }
  },
  die() { this.state = 'dead'; Sound.stopAmbient(); setTimeout(() => { if (this.state === 'dead') UI.screen('dead'); }, 900); },
  interact() {
    const p = this.player, inv = this.inv, it = this.nearItem();
    if (!it) { // sin objeto cerca: intenta abrir una puerta
      const d = Level.nearDoor(p); if (!d) return;
      if (!this.doorOk(d)) return UI.msg(this.doorWhy(d));
      Level.openDoor(d); Sound.play('door'); return UI.msg(KEYS[d.key] ? 'Usaste: ' + KEYS[d.key] : 'Puerta abierta', 2500);
    }
    this.take(it);
  },
  take(it) {
    const p = this.player, inv = this.inv, t = it.type;
    if (it.fixed && it.type === 'savebed') { this.openSaveSlots('save'); return; }
    if (it.fixed) return Puzzles.use(this, it);
    if (it.carry) { // objeto soltado por el jugador
      const c = Object.assign({}, it.carry), full = 'Sin espacio en el maletín. Guarda algo en el baúl de la zona.';
      if (c.type.startsWith('am_')) { const got = inv.addAmmo(c.type, c.count); if (got <= 0) return UI.msg(full); if (got < c.count) { it.carry.count -= got; return UI.msg('Recogiste ' + got + '; no cabe el resto.'); } } else if (!inv.place(c)) return UI.msg(full);
      inv.syncWeapons(p); this.picked.add(it.id); this.items.splice(this.items.indexOf(it), 1); Sound.play('pickup'); return UI.msg('Recogido: ' + ITEMS[c.type].name, 2000);
    }
    if (t === 'pistol') { if (!this.giveWeapon('pistol', 5, false)) return; UI.msg('Pistola M9 recogida del policía. Clic para disparar, R para recargar.', 5000); }
    else if (t === 'ammo' || t === 'shells' || t === 'smg' || t === 'rifleammo' || t === 'grenade') { // la munición ocupa espacio en el maletín
      const T = { ammo: ['am_pistol', 5], shells: ['am_shells', 2], smg: ['am_smg', 16], rifleammo: ['am_rifle', 3], grenade: ['am_grenade', 2] }[t], want = it.amount || T[1], got = inv.addAmmo(T[0], want);
      if (got <= 0) return UI.msg('Sin espacio en el maletín para la munición. Usa el baúl de la zona o suelta algo (TAB).', 4500);
      if (got < want) { it.amount = want - got; return UI.msg('Recogiste ' + got + ' (' + ITEMS[T[0]].short + '); no cabe el resto.', 3500); } UI.msg('+' + got + ' · ' + ITEMS[T[0]].name);
    }
    else if (t === 'launcher') { if (!this.giveWeapon('launcher', 2, false)) return; UI.msg('LANZAGRANADAS: explosión de área (también te daña a ti). Equípalo con la tecla 5.', 7000); }
    else if (t === 'rifle') { if (!this.giveWeapon('rifle', 4, false)) return; UI.msg('RIFLE DE PRECISIÓN: gran daño y alcance, un solo disparo. Equípalo con la tecla 4.', 7000); }
    else if (t === 'mask') { p.mods.mask = 1; UI.msg('Máscara filtrante: el veneno te hace la mitad de daño y dura la mitad.', 6000); }
    else if (t.startsWith('mod_')) { const k = t.slice(4); p.mods[k] = (p.mods[k] || 0) + 1; UI.msg({ mag: 'Cargador extendido: +4 al cargador de todas tus armas.', pow: 'Cañón reforzado: +30 % de daño.', prec: 'Mira láser: 25 % menos de dispersión.', rate: 'Cadencia: +15 %.' }[k], 6000); }
    else if (t.startsWith('inj_')) { if (!inv.add(t)) return UI.msg('No hay espacio en el maletín. Reorganiza, usa o suelta algo (TAB).'); UI.msg('Recogido: ' + ITEMS[t].name + '. Pulsa F para usar.'); }
    else if (t === 'key') { inv.keys.push(it.key); UI.msg('Recogido: ' + KEYS[it.key]); }
    else if (t === 'case') { if (inv.expand()) UI.msg('Maletín ampliado: ' + inv.cols + '×' + inv.rows + ' casillas.', 4000); else UI.msg('El maletín ya alcanzó su capacidad máxima.', 2500); }
    else if (['screw_small','screw_large','powder_small','powder_large'].includes(t)) { const n = it.amount || it.count || 1, got = inv.addAmmo(t, n); if (got <= 0) return UI.msg('No hay espacio para los materiales.'); if (got < n) { it.amount = n - got; return UI.msg('Recogiste ' + got + ' materiales; el resto sigue en el suelo.'); } UI.msg('Material recogido: ' + ITEMS[t].name + ' ×' + got, 2200); }
    else if (t === 'stab') { this.mut.tutorial = true; if (this.mut.phases < 1) { this.mut.phases = 1; p.maxEnergy = 100 + this.mut.phases * 20 + this.mut.mod('en'); p.energy = Math.min(p.maxEnergy, p.energy + 20); } this.fxInject('#38a9ff'); UI.msg('ESTABILIZADOR: el Riutex-V1 de tu sangre responde. Fase 1: +20 de energía máxima. Pulsa K para abrir el árbol de mutaciones. Clic derecho: golpe cuerpo a cuerpo.', 9000); }
    else if (t === 'sample') { if (!inv.add('sample')) return UI.msg('No hay espacio para la muestra en el maletín (TAB).'); if (!it.id.startsWith('drop')) this.story.samples++; UI.msg('Muestra de Riutex-V1 guardada. Puedes inyectarla desde el árbol (K) o conservarla.', 5000); }
    else if (t === 'doc') { inv.docs.push(it.doc); this.story.docs.push(it.doc); }
    this.picked.add(it.id); this.items.splice(this.items.indexOf(it), 1); Sound.play('pickup');
    if (t === 'doc') this.openDoc(it.doc);
  },
  craftAmmo(recipe) { const r = this.inv.craft(recipe); UI.msg(r.msg, 2800); UI.renderInv(this); },
  rotateSel() { const it = this.inv.selItem(); if (!it) return; if (!this.inv.rotate(it)) UI.msg('No hay espacio para girarlo.', 1500); UI.renderInv(this); },
  dropSel() { const it = this.inv.selItem(), p = this.player; if (!it) return UI.msg('Selecciona un objeto del maletín.', 1500); this.inv.removeAt(this.inv.sel); this.inv.syncWeapons(p); this.items.push({ id: 'drop' + (++this.dropN), type: it.type, x: p.x, y: p.y, carry: JSON.parse(JSON.stringify(it)) }); UI.msg('Soltaste: ' + ITEMS[it.type].short + '. Puedes recogerlo luego.', 2500); UI.renderInv(this); },
  ring(x, y, r, c) { this.rings.push({ x, y, r, c, life: .45, max: .45 }); },
  fxMutate() { const p = this.player; for (let i = 0; i < 14; i++) this.particles.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 160, vy: (Math.random() - .5) * 160, life: .6, c: '#50baff', sz: 2 + Math.random() * 2 }); UI.flash('#58bdff'); Sound.play('mutate'); },
  keyName(code) { return ({ KeyQ:'Q',KeyZ:'Z',KeyX:'X',KeyC:'C',KeyV:'V',KeyB:'B',KeyN:'N',KeyM:'M',Digit6:'6',Digit7:'7',Digit8:'8',Digit9:'9' }[code] || code.replace('Key','').replace('Digit','')); },
  assignSkillKey(id) { if (!this.mut.has(id) || SKILLS[id].type !== 'active') return; this.mut.bindingTarget = id; UI.msg('Pulsa la tecla que quieres asignar a ' + SKILLS[id].name + '. (Esc, WASD y teclas de acciones están reservadas)', 5000); },
  castSkillByKey(code) { const id = Object.keys(this.mut.bindings).find(k => this.mut.bindings[k] === code && this.mut.has(k)); if (id) this.castSkill(id); },
  castSkill(id) { // Cada habilidad activa tiene su propia tecla asignada.
    if (this.state !== 'play') return; const m = this.mut, p = this.player;
    if (!m.tutorial) return UI.msg('El Riutex aún no responde. Sigue explorando.');
    id = id || m.equipped; if (!id || !m.has(id) || SKILLS[id].type !== 'active') return;
    const s = SKILLS[id]; if ((m.cd[id] || 0) > 0) return; const cost = s.energy * (p.over > 0 ? .5 : 1);
    if (p.energy < cost) return UI.msg('Energía mutante insuficiente.');
    p.energy -= cost; m.cd[id] = s.cd || 1.5; ACTIONS[id](this, p); this.fxMutate();
  },
  toggleTree() {
    if (this.state === 'play') { if (!this.mut.tutorial) return UI.msg('El Riutex de tu sangre sigue inestable. Sigue explorando…'); this.mut.seen = true; this.state = 'tree'; UI.renderTree(this); UI.screen('tree'); }
    else if (this.state === 'tree') this.resume();
  },
  buySkill(id) { const m = this.mut, s = SKILLS[id], err = m.canBuy(id, this.player.xp); if (err) return UI.msg(err); this.player.xp -= s.cost; if (s.excl && m.has(s.excl)) { m.owned.delete(s.excl); UI.msg('Reemplazas: ' + SKILLS[s.excl].name, 2500); } m.owned.add(id); if (s.mod && s.mod.hp) { this.player.maxHp += s.mod.hp; this.player.hp += s.mod.hp; } if (s.type === 'active') { const free = ['KeyQ','Digit6','Digit7','Digit8','Digit9','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN'].find(k => !Object.values(m.bindings).includes(k)); if (free) m.bindings[id] = free; if (!m.equipped) m.equipped = id; } this.fxMutate(); UI.msg('Mutación: ' + s.name, 2500); },
  treeAction() { const id = UI.treeSel; if (!id) return; if (this.mut.has(id)) { if (SKILLS[id].type === 'active') { this.mut.equipped = id; if (!this.mut.bindings[id]) this.assignSkillKey(id); else UI.msg('Habilidad seleccionada: ' + SKILLS[id].name + ' (' + this.keyName(this.mut.bindings[id]) + ')', 2200); } } else this.buySkill(id); UI.renderTree(this); },
  injectSample() {
    const m = this.mut, inv = this.inv, p = this.player; if (m.phases >= 5) return UI.msg('Ya has abierto todas las fases.'); if (inv.samples <= 0) return UI.msg('No tienes muestras de Riutex-V1. Busca una nueva.');
    inv.remove('sample'); m.phases++; this.story.riutexUsed++; p.maxEnergy = 100 + m.phases * 20 + m.mod('en'); p.energy = Math.min(p.maxEnergy, p.energy + 20); this.fxInject('#38a9ff'); UI.msg('Muestra inyectada: Fase ' + m.phases + ' desbloqueada. +20 de energía máxima y +20 de energía actual.', 3500); UI.renderTree(this);
  },
  doorOk(d) { if (d.key === 'armeria') return ['llave_arm_a', 'llave_arm_b'].every(k => this.inv.keys.includes(k)); if (d.key === 'lucia') return ['pase_a', 'pase_b'].every(k => this.inv.keys.includes(k)); const f = { power: 'power', archive: 'archive', drain: 'drain', fuses: 'fuses', gateD: 'gateD', bossdead: 'boss2', approach: 'mandoT', reactor: 'reactor', bioT: 'bioT', boss4: 'boss4', boss5: 'boss5', emily: 'emily' }[d.key]; return !d.key || (f ? this.pz[f] : this.inv.keys.includes(d.key)); },
  doorWhy(d) { return { power: 'Sin energía eléctrica: restablece el generador.', archive: 'Cerradura sellada: solo el terminal del Archivo la abre.', drain: 'Compuerta de drenaje cerrada: busca el panel de válvulas.', fuses: 'Sin corriente: faltan fusibles en el tablero.', gateD: 'Compuerta D sellada: usa el terminal de la antecámara.', bossdead: 'La salida se desbloquea cuando caiga el Caimán.', armeria: 'Cerradura doble: necesitas la llave A (Barracones) y la llave B (Perrera).', approach: 'El terminal del puesto de mando mantiene sellado este acceso.', reactor: 'Sin energía en el ala de experimentos: estabiliza los reactivos de la Sala de cultivos.', bioT: 'Acceso bloqueado: terminal de bioseguridad de la Biblioteca.', lucia: 'Sellada: necesitas los pases de seguridad A y B.', boss4: 'El camino se abre cuando caiga Lucía.', boss5: 'La celda se abre cuando caiga Voss.', emily: 'Primero tienes que encontrar a Emily.' }[d.key] || 'Cerrada: requiere ' + KEYS[d.key]; },
  dropCraftingMaterial(enemy) { // Botín de materiales poco frecuente: recompensa útil sin convertir cada combate en una lluvia de objetos.
    if (!enemy || enemy.isBoss || (enemy.def && enemy.def.turret)) return;
    const elite = !!(enemy.def && (enemy.def.xp || 0) >= 70);
    const chance = elite ? 0.23 : 0.14;
    if (Math.random() >= chance) return;
    const advanced = this.lvl === 'base' || this.lvl === 'lab';
    const roll = Math.random();
    let type;
    if (advanced) type = roll < 0.28 ? 'screw_small' : roll < 0.48 ? 'powder_small' : roll < 0.74 ? 'screw_large' : 'powder_large';
    else type = roll < 0.38 ? 'screw_small' : roll < 0.72 ? 'powder_small' : roll < 0.86 ? 'screw_large' : 'powder_large';
    const amount = type.endsWith('_large') ? 1 : (Math.random() < 0.7 ? 2 : 3);
    // El botín se coloca en una casilla de suelo real, nunca dentro de una pared, mueble o puerta cerrada.
    const tx = Math.floor(enemy.x / TILE), ty = Math.floor(enemy.y / TILE);
    let spot = null, best = Infinity;
    for (let r = 0; r <= 6; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
      if (Math.max(Math.abs(x - tx), Math.abs(y - ty)) !== r || !Level.grid[y] || Level.grid[y][x] !== 0) continue;
      const d = Math.hypot((x + 0.5) * TILE - enemy.x, (y + 0.5) * TILE - enemy.y);
      if (d < best) { best = d; spot = { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE }; }
    }
    if (!spot) return;
    this.items.push({ id: 'drop_mat_' + (++this.dropN), type, x: spot.x, y: spot.y, amount });
  },
  bossDrops(bb) { const b = bb || this.boss, add = (id, type, extra, dx) => { if (!this.picked.has(id) && !this.items.some(i => i.id === id)) this.items.push(Object.assign({ id, type, x: b.x + dx, y: b.y }, extra)); }; if (this.lvl === 'sewer') { add('bs2', 'sample', {}, -20); add('bk2', 'key', { key: 'acceso' }, 22); } else if (this.lvl === 'base') { add('bs3', 'sample', {}, -22); add('bk3', 'key', { key: 'lab' }, 22); } else if (this.lvl === 'lab') { if (b.id === 600) { add('bs4', 'sample', {}, -22); add('bk4', 'key', { key: 'llave_voss' }, 22); } } else { add('bs1', 'sample', {}, -22); add('bk1', 'key', { key: 'salida' }, 22); } },
  objective() {
    if (this.lvl === 'lab') return this.objective4();
    if (this.lvl === 'sewer') return this.objective2();
    if (this.lvl === 'base') return this.objective3();
    const p = this.player, k = this.inv.keys, pz = this.pz; if (!p.weapon) return 'Abre la celda y busca un arma en el pasillo.';
    if (!k.includes('enfermeria')) return 'Busca la llave de la enfermería, cerca de la entrada.'; if (!k.includes('almacen')) return 'Registra la enfermería: ahí está la llave del almacén.';
    if (!k.includes('seguridad')) return 'Busca la tarjeta de seguridad en la cocina y el almacén.'; if (!pz.power) return 'Restablece la electricidad: 4 interruptores, en el orden correcto.';
    if (!pz.boss) return 'Baja a la sala de contención (subsuelo).'; return 'Sal del asilo por la puerta sur. (Opcional: caja fuerte y archivo.)';
  },
  finish() {
    if (this.state !== 'play') return; if (this.lvl === 'asylum') return this.enterSewer(); if (this.lvl === 'sewer') return this.enterBase(); if (this.lvl === 'base') return this.enterLab(); this.state = 'end'; Sound.stopAmbient();
    this.showEnding();
  },
  objective4() {
    const k = this.inv.keys, pz = this.pz; if (!pz.reactor) return 'Estabiliza el cultivo en la Sala de cultivos: tres reactivos con la receta correcta.';
    if (!k.includes('pase_a') && !pz.boss4) return 'Recorre el Ala de experimentos y el Quirófano: busca el pase A.'; if (!k.includes('pase_b') && !pz.boss4) return 'Descifra la clave de bioseguridad de la Biblioteca y toma el pase B en Servidores.';
    if (!pz.boss4) return 'Con ambos pases, abre la cámara de Lucía.'; if (!pz.boss5) return 'Explora las salas de Voss y baja al sanctum con su llave.'; if (!pz.emily) return 'Busca a Emily en la celda de observación.'; return 'Salgan a la calle por la puerta oeste.';
  },
  objective3() {
    const k = this.inv.keys, pz = this.pz; if (!k.includes('llave_arm_a') && !k.includes('tarjeta')) return 'Cruza el patio de armas. Busca las llaves de la armería (A en Barracones, B en la Perrera).';
    if (!k.includes('tarjeta')) return 'Consigue las dos llaves de armería y abre la Armería (junto al Hangar): ahí está la tarjeta de mando.'; if (!pz.mandoT) return 'Entra al Puesto de mando y descifra el terminal con los registros de radio.';
    if (!pz.boss3) return 'Cruza hacia la antesala del laboratorio. Varga te espera.'; return 'Entra al laboratorio con la tarjeta.';
  },
  objective2() {
    const pz = this.pz; if (!pz.drain) return 'Explora las cloacas: busca el panel de válvulas para abrir la compuerta de drenaje.'; if (!pz.fuses) return 'Reúne los 3 fusibles (A, B y C) y colócalos en el tablero del Canal central.';
    if (!pz.gateD) return 'Cruza la Galería de descartes y descifra la clave de la Compuerta D.'; if (!pz.boss2) return 'Baja al foso: el Caimán Fundido te espera.'; return 'Sal por el túnel este del foso.';
  },
  promptText() {
    const it = this.nearItem(); if (it) return '[E] ' + (it.type === 'savebed' ? 'Guardar / cargar partida en la camilla' : ['screw_small','screw_large','powder_small','powder_large'].includes(it.type) ? 'Recoger ' + ITEMS[it.type].name : itemLabel(it)); const d = Level.nearDoor(this.player);
    return d ? (!this.doorOk(d) ? this.doorWhy(d) : '[E] ' + (KEYS[d.key] ? 'Usar ' + KEYS[d.key] : 'Abrir puerta')) : '';
  },
  toggleInv() { if (this.state === 'play') { this.state = 'inv'; UI.renderInv(this); UI.screen('inv'); } else if (this.state === 'inv') this.resume(); },
  useInj() { if (this.state !== 'play' && this.state !== 'inv') return; this.inv.use(this); if (this.state === 'inv') UI.renderInv(this); },
  openDoc(id) { this.prev = this.state; this.state = 'doc'; UI.renderJournal(this, id); UI.screen('doc'); },
  openJournal() { if (!this.inv.docs.length) return UI.msg('Aún no has encontrado documentos.', 2000); this.openDoc(this.jSel && this.inv.docs.includes(this.jSel) ? this.jSel : this.inv.docs[this.inv.docs.length - 1]); },
  closeDoc() { if (this.prev === 'inv') { this.state = 'inv'; UI.renderInv(this); UI.screen('inv'); } else this.resume(); },
  fxInject(c) { const p = this.player; for (let i = 0; i < 22; i++) this.particles.push({ x: p.x + (Math.random() - .5) * 14, y: p.y + (Math.random() - .5) * 14, vx: (Math.random() - .5) * 40, vy: -50 - Math.random() * 90, life: .8, c, sz: 2 + Math.random() * 2 }); UI.flash(c); Sound.play('inject'); },
  nearItem() { const p = this.player; let best = null, bd = 40; for (const i of this.items) { const d = Math.hypot(i.x - p.x, i.y - p.y); if (d < bd) { bd = d; best = i; } } return best; },
  sparks(x, y, n, c) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = 40 + Math.random() * 140; this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .3 + Math.random() * .3, c, sz: 1 + Math.random() * 2 }); } },
  loop(now) {
    requestAnimationFrame(t => this.loop(t)); const dt = Math.max(0, Math.min(0.05, (now - this.last) / 1000)); this.last = now;
    if (this.state === 'play' || this.state === 'dead') this.update(this.state === 'play' ? dt : dt * .3); if (this.player) this.render(); 
  },
  update(dt) {
    // La cadena avanza con la simulación: pausa y cambios de nivel no dejan temporizadores activos.
    if (this.state === 'play') for (const b of this.barrels.filter(b => !b.dead && Number.isFinite(b.chainDelay))) {
      b.chainDelay -= dt; if (b.chainDelay <= 0) this.explode(b);
    }
    const p = this.player; this.t += dt; for (const k in this.mut.cd) this.mut.cd[k] -= dt; p.evo = Math.min(1, (this.mut.owned.size - 1) / 40); p.maxEnergy = 100 + this.mut.phases * 20 + this.mut.mod('en'); if (Math.random() < dt / 22) Sound.noise(0.8, 0.3, 120); if (p.evo > .4 && Math.random() < .08) this.particles.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 30, vy: -20, life: .5, c: '#38a9ff', sz: 2 }); if (this.state === 'play') { p.update(dt, this); const bz = this.curBoss && this.curBoss.active && !this.curBoss.dead ? (this.curBoss === this.boss2 ? Level.bossZone2 : Level.bossZone) : null; if (bz) { p.x = Math.max(bz[0] + p.r, Math.min(bz[2] - p.r, p.x)); p.y = Math.max(bz[1] + p.r, Math.min(bz[3] - p.r, p.y)); } } this.enemies.forEach(e => e.update(dt, this));
    for (const q of this.particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .93; q.vy *= .93; q.life -= dt; } this.particles = this.particles.filter(q => q.life > 0);
    for (const r of this.rings) r.life -= dt; this.rings = this.rings.filter(r => r.life > 0);
    for (const q of this.projectiles) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; if (Level.solid(q.x, q.y)) { q.life = 0; if (q.grenade) { q.x -= q.vx * dt; q.y -= q.vy * dt; q.done = true; this.blast(q.x, q.y, q.damage); } else this.sparks(q.x, q.y, 6, '#38a9ff'); continue; }
      for (const e of this.enemies) if (!e.dead && Math.hypot(e.x - q.x, e.y - q.y) < e.r + 5) { if (q.grenade) { q.done = true; this.blast(q.x, q.y, q.damage); } else e.hurt(q.dmg, Math.atan2(q.vy, q.vx), this); q.life = 0; this.sparks(q.x, q.y, 8, '#38a9ff'); break; } }
    for (const q of this.projectiles) if (q.grenade && q.life <= 0 && !q.done) { q.done = true; this.blast(q.x, q.y, q.damage); }
    this.projectiles = this.projectiles.filter(q => q.life > 0);
    for (const it of [...this.items]) if (it.pull) { const dx = p.x - it.x, dy = p.y - it.y, d = Math.hypot(dx, dy) || 1, s = Math.min(d, 420 * dt); it.x += dx / d * s; it.y += dy / d * s; if (d < 24) { it.pull = false; this.take(it); } } // telequinesis
    Level.t = this.t; for (const c of this.crystals) if (c.dead && (c.respawn -= dt) <= 0) { c.dead = false; c.hp = 60; } for (const b of this.barrels) if (b.mine && !b.dead && Math.hypot(b.x - p.x, b.y - p.y) < 15) this.explode(b);
    for (const q of this.eproj) { if (this.temporalField && Math.hypot(q.x-this.temporalField.x,q.y-this.temporalField.y)<280 && Level.los(this.temporalField.x,this.temporalField.y,q.x,q.y)) continue; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; if (Level.solid(q.x, q.y)) { q.life = 0; if (q.bullet) this.sparks(q.x, q.y, 3, '#ffd27a'); else this.pools.push({ x: q.x, y: q.y, r: 26, life: 4 }); continue; }
      if (Math.hypot(q.x - p.x, q.y - p.y) < p.r + 5) { q.life = 0; const invuln = p.invuln; p.hurt(q.dmg, Math.atan2(q.vy, q.vx), this); if (p.invuln > invuln) p.addPoison(q.poison || 0); if (!q.bullet) this.pools.push({ x: q.x, y: q.y, r: 22, life: 3 }); } }
    this.eproj = this.eproj.filter(q => q.life > 0);
    for (const pl of this.pools) { pl.life -= dt; if (Math.hypot(pl.x - p.x, pl.y - p.y) < pl.r) p.addPoison(dt * 2.2); } this.pools = this.pools.filter(pl => pl.life > 0);
    for (const tr of this.tracers) tr.life -= dt; this.tracers = this.tracers.filter(tr => tr.life > 0);
    const c = this.cam, tx = p.x - this.cv.width / 2, ty = p.y - this.cv.height / 2, k = 1 - Math.pow(0.001, dt); // cámara suave
    c.x += (tx - c.x) * k; c.y += (ty - c.y) * k; c.shake *= Math.pow(0.002, dt);
    UI.prompt(this.state === 'play' ? this.promptText() : ''); UI.hud(p, this.inv, this.mut);
    for (const [b, z] of [[this.boss, Level.bossZone], [this.boss2, Level.bossZone2]]) if (b && z && !b.active && !b.dead && p.x > z[0] && p.x < z[2] && p.y > z[1] && p.y < z[3]) {
      if (b.intro) { if (!b.introDone) { b.introDone = true; this.curBoss = b; this.cinematic(b.intro, () => { b.active = true; this.cam.shake = 12; }); } }
      else { b.active = true; this.curBoss = b; this.cam.shake = 12; UI.msg(b.def.name.toUpperCase() + ' despierta…', 4000); } }
    UI.bossBar(this.curBoss || this.boss); if (typeof HospitalCompass !== 'undefined' && isR2()) HospitalCompass.hud(this); else UI.$('obj').textContent = 'OBJETIVO: ' + this.objective(); if ({ asylum: p.y > 58.3 * TILE, sewer: this.pz.boss2 && p.x > 93 * TILE, base: this.pz.boss3 && p.y > 56.3 * TILE, lab: this.pz.emily && p.x < 6 * TILE }[this.lvl]) this.finish();
  },
  render() {
    const ctx = this.ctx, W = this.cv.width, H = this.cv.height, c = this.cam, p = this.player, sx = (Math.random() - .5) * c.shake, sy = (Math.random() - .5) * c.shake;
    const cam = { x: c.x + sx, y: c.y + sy }; ctx.fillStyle = '#060c15'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-cam.x, -cam.y);
    Level.draw(ctx, cam, W, H);
    for (const b of this.bodies) { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.fillStyle = '#5c6058'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 13, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#7a1018'; ctx.fillRect(-4, -4, 8, 8); ctx.restore(); }
    for (const i of this.items) this.drawItem(ctx, i);
    this.enemies.forEach(e => e.dead || e.draw(ctx)); p.draw(ctx);
    for (const pl of this.pools) { ctx.globalAlpha = Math.min(1, pl.life / 2) * .55; ctx.fillStyle = '#50c040'; ctx.beginPath(); ctx.ellipse(pl.x, pl.y, pl.r, pl.r * .75, 0, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1;
    for (const c of this.crystals) if (!c.dead) { ctx.fillStyle = 'rgba(120,230,255,.85)'; ctx.shadowColor = '#60e0ff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(c.x, c.y - 14); ctx.lineTo(c.x + 9, c.y); ctx.lineTo(c.x, c.y + 14); ctx.lineTo(c.x - 9, c.y); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; }
    for (const b of this.barrels) if (!b.dead && b.mine) { ctx.fillStyle = '#3a3a34'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, 6.283); ctx.fill(); ctx.fillStyle = Math.sin(this.t * 6 + b.x) > 0 ? '#ff3020' : '#501010'; ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3); }
    for (const b of this.barrels) if (!b.dead && !b.mine) { ctx.fillStyle = '#8a2a1a'; ctx.fillRect(b.x - 9, b.y - 11, 18, 22); ctx.fillStyle = '#c0a030'; ctx.fillRect(b.x - 9, b.y - 3, 18, 4); ctx.fillStyle = '#ffcc40'; ctx.fillRect(b.x - 3, b.y - 8, 6, 4); }
    for (const q of this.eproj) { ctx.fillStyle = q.bullet ? '#ffe080' : '#90e050'; ctx.shadowColor = q.bullet ? '#ffc040' : '#50ff30'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(q.x, q.y, q.bullet ? 3 : 5, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0; }
    for (const r of this.rings) { const k = 1 - r.life / r.max; ctx.strokeStyle = r.c; ctx.globalAlpha = 1 - k; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * k, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1;
    for (const q of this.projectiles) { ctx.fillStyle = '#7a6a90'; ctx.shadowColor = '#50baff'; ctx.shadowBlur = 10; ctx.fillRect(q.x - 4, q.y - 4, 8, 8); ctx.shadowBlur = 0; }
    ctx.lineWidth = 2; for (const tr of this.tracers) { ctx.strokeStyle = 'rgba(255,230,160,' + tr.life * 10 + ')'; ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke(); }
    for (const q of this.particles) { ctx.globalAlpha = Math.min(1, q.life * 3); ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, q.sz, q.sz); } ctx.globalAlpha = 1; ctx.restore();
    // Iluminación: capa oscura con linterna (cono) y halo; parpadea ligeramente.
    const l = this.lctx, px = p.x - cam.x, py = p.y - cam.y, fl = 1; l.globalCompositeOperation = 'source-over'; l.fillStyle = 'rgba(3,6,9,.91)'; l.fillRect(0, 0, W, H);
    l.globalCompositeOperation = 'destination-out'; let g = l.createRadialGradient(px, py, 5, px, py, 100 * fl); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.fillRect(0, 0, W, H);
    g = l.createRadialGradient(px, py, 20, px, py, 330 * fl); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.beginPath(); l.moveTo(px, py); l.arc(px, py, 330, p.angle - .42, p.angle + .42); l.closePath(); l.fill();
    for (let i = 0; i < Level.lamps.length; i++) { const L = Level.lamps[i], lx = L.x - cam.x, ly = L.y - cam.y; if (lx < -L.r || ly < -L.r || lx > W + L.r || ly > H + L.r) continue;
      const fk = i % 3 === 0 ? (Math.random() < .12 ? .1 : .7) : 1 + Math.sin(this.t * 3 + i) * .05, gr = l.createRadialGradient(lx, ly, 5, lx, ly, L.r); gr.addColorStop(0, 'rgba(0,0,0,' + .19 * fk + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = gr; l.fillRect(lx - L.r, ly - L.r, L.r * 2, L.r * 2); }
    ctx.drawImage(this.lc, 0, 0);
    if (p.poison > 0) { ctx.fillStyle = 'rgba(50,140,30,' + Math.min(.22, p.poison * .04) + ')'; ctx.fillRect(0, 0, W, H); }
    if (p.sense > 0) for (const e of this.enemies) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (e.dead || d > 460) continue; ctx.strokeStyle = 'rgba(90,205,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x - cam.x, e.y - cam.y, e.r + 6 + Math.sin(this.t * 8) * 2, 0, 6.283); ctx.stroke(); } // Instinto
    if (!isR2lvl(this.lvl) && p.flash > 0) { ctx.fillStyle = 'rgba(255,220,150,.05)'; ctx.fillRect(0, 0, W, H); }
  },
  drawItem(ctx, i) {
    ctx.save(); ctx.translate(i.x, i.y);
    if (i.type === 'pistol') { ctx.rotate(.5); ctx.fillStyle = '#243a6a'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 14, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#6a0a12'; ctx.fillRect(-3, -3, 7, 8); ctx.fillStyle = '#111'; ctx.fillRect(8, -2, 9, 4); ctx.fillStyle = '#d8d0a0'; ctx.fillRect(-1, 8, 2, 2); }
    else if (i.type === 'ammo') { ctx.fillStyle = '#4a5030'; ctx.fillRect(-7, -5, 14, 10); ctx.fillStyle = '#d8b84a'; ctx.fillRect(-5, -2, 10, 3); }
    else if (i.type === 'caja') { ctx.fillStyle = '#4a3220'; ctx.fillRect(-13, -9, 26, 18); ctx.fillStyle = '#6a4a30'; ctx.fillRect(-13, -9, 26, 6); ctx.fillStyle = '#c0a040'; ctx.fillRect(-3, -3, 6, 6); ctx.strokeStyle = 'rgba(180,120,255,.6)'; ctx.lineWidth = 2; ctx.strokeRect(-14, -10, 28, 20); }
    else if (i.type.startsWith('w_')) { ctx.fillStyle = '#2a2e2a'; ctx.fillRect(-12, -3, 24, 6); ctx.fillRect(-4, 2, 5, 8); }
    else if (i.type.startsWith('am_')) { ctx.fillStyle = '#4a4a38'; ctx.fillRect(-7, -5, 14, 10); ctx.fillStyle = ITEMS[i.type].color; for (let k = 0; k < 3; k++) ctx.fillRect(-5 + k * 4, -3, 2, 6); }
    else if (i.type.startsWith('reactor_')) { ctx.fillStyle = '#244a40'; ctx.fillRect(-10, -14, 20, 28); ctx.fillStyle = '#60ffc0'; ctx.fillRect(-7, -11, 14, 8); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.fillText(this.pz.reactors[i.type.charCodeAt(8) - 97], -4, 11); }
    else if (i.type === 'terminalB' || i.type === 'cajaV') { ctx.fillStyle = i.type === 'cajaV' ? '#5a4a60' : '#1a2a30'; ctx.fillRect(-11, -13, 22, 26); ctx.fillStyle = i.type === 'cajaV' ? '#c080ff' : '#60d0ff'; ctx.fillRect(-7, -7, 14, 7); }
    else if (i.type === 'pistol') { ctx.fillStyle = '#4a5058'; ctx.fillRect(-10,-3,18,6); ctx.fillStyle = '#252a30'; ctx.fillRect(0,2,6,8); ctx.fillStyle = '#b0b8bf'; ctx.fillRect(-8,-5,10,2); }
    else if (i.type === 'rifle') { ctx.fillStyle = '#4c5a65'; ctx.fillRect(-14,-3,27,6); ctx.fillStyle = '#252a30'; ctx.fillRect(-3,2,7,8); ctx.fillStyle = '#9ba8b0'; ctx.fillRect(1,-6,10,2); ctx.fillStyle = '#806345'; ctx.fillRect(-13,2,9,3); }
    else if (i.type === 'launcher') { ctx.fillStyle = '#3a4a3a'; ctx.fillRect(-12, -4, 24, 8); ctx.fillStyle = '#222'; ctx.fillRect(8, -6, 6, 12); ctx.fillStyle = '#d8b84a'; ctx.fillRect(-9, 3, 4, 4); }
    else if (i.type === 'grenade') { ctx.fillStyle = '#4a6a3a'; ctx.beginPath(); ctx.ellipse(-3, 0, 5, 7, 0, 0, 6.283); ctx.ellipse(5, 0, 5, 7, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#222'; ctx.fillRect(-5, -9, 4, 3); ctx.fillRect(3, -9, 4, 3); }
    else if (i.type === 'emily') { ctx.fillStyle = '#d8d8e0'; ctx.beginPath(); ctx.ellipse(0, 4, 9, 12, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#e0c0a8'; ctx.beginPath(); ctx.arc(0, -9, 6, 0, 6.283); ctx.fill(); ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.arc(0, -11, 7, 3.14, 6.283); ctx.fill(); ctx.fillRect(-7, -11, 3, 14); }
    else if (i.type.startsWith('valve_')) { ctx.fillStyle = '#6a3a1a'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#c08040'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.283); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.fillText(this.pz.valves[i.type.charCodeAt(6) - 97], -4, -14); }
    else if (i.type === 'fusebox') { ctx.fillStyle = '#4a4e4c'; ctx.fillRect(-11, -13, 22, 26); ctx.fillStyle = this.pz.fuses ? '#40e060' : '#e04030'; ctx.fillRect(-6, -8, 12, 5); ctx.fillStyle = '#222'; ctx.fillRect(-6, 0, 12, 8); }
    else if (i.type === 'terminalD' || i.type === 'casillero') { ctx.fillStyle = i.type === 'casillero' ? '#4a5258' : '#1a2a20'; ctx.fillRect(-11, -13, 22, 26); ctx.fillStyle = i.type === 'casillero' ? '#c0a040' : '#40e080'; ctx.fillRect(-7, -7, 14, 7); }
    else if (i.type === 'smg') { ctx.fillStyle = '#2a4a2a'; ctx.fillRect(-8, -5, 16, 10); ctx.fillStyle = '#d8b84a'; for (let k = 0; k < 4; k++) ctx.fillRect(-6 + k * 4, -3, 2, 6); }
    else if (i.type === 'mask') { ctx.fillStyle = '#3a4a3a'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 11, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#9ac0b0'; ctx.fillRect(-7, -4, 5, 4); ctx.fillRect(2, -4, 5, 4); ctx.fillStyle = '#222'; ctx.fillRect(-3, 3, 6, 6); }
    else if (i.type === 'safe') { ctx.fillStyle = '#4a4a50'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#b0a060'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.283); ctx.fill(); }
    else if (i.type === 'terminal') { ctx.fillStyle = '#1a2a20'; ctx.fillRect(-12, -9, 24, 18); ctx.fillStyle = '#40e080'; ctx.fillRect(-9, -6, 18, 8); }
    else if (i.type.startsWith('sw_')) { ctx.fillStyle = '#3a3a3a'; ctx.fillRect(-7, -9, 14, 18); ctx.fillStyle = this.pz.power || this.pz.seq.includes(i.type) ? '#40e060' : '#e0a030'; ctx.fillRect(-3, -6, 6, 12); }
    else if (i.type.startsWith('mod_')) { ctx.fillStyle = '#c08040'; ctx.fillRect(-8, -4, 16, 8); ctx.fillStyle = '#222'; ctx.fillRect(-4, -2, 8, 4); }
    else if (i.type === 'shells') { ctx.fillStyle = '#a02020'; ctx.fillRect(-7, -4, 5, 9); ctx.fillRect(1, -4, 5, 9); ctx.fillStyle = '#d8b84a'; ctx.fillRect(-7, 3, 5, 2); ctx.fillRect(1, 3, 5, 2); }
    else if (i.type === 'case') { ctx.fillStyle = '#5a3a1c'; ctx.fillRect(-9, -6, 18, 12); ctx.fillStyle = '#c0a040'; ctx.fillRect(-2, -2, 4, 4); ctx.fillStyle = '#2a1a0c'; ctx.fillRect(-9, -1, 18, 1); }
    else if (['screw_small','screw_large'].includes(i.type)) { ctx.strokeStyle = i.type === 'screw_small' ? '#aab4bd' : '#697681'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8,-5); ctx.lineTo(7,6); ctx.moveTo(-7,5); ctx.lineTo(7,-6); ctx.stroke(); ctx.fillStyle = '#c8d0d5'; ctx.fillRect(-10,-7,5,4); ctx.fillRect(5,4,5,4); }
    else if (['powder_small','powder_large'].includes(i.type)) { ctx.fillStyle = i.type === 'powder_small' ? '#c6a65f' : '#6b4934'; ctx.fillRect(-8,-10,16,20); ctx.fillStyle = '#e0d0a0'; ctx.fillRect(-5,-7,10,3); ctx.fillStyle = '#29231b'; ctx.fillRect(-5,0,10,5); }
    else if (i.type === 'savebed') { ctx.fillStyle = '#343c45'; ctx.fillRect(-14,-9,28,18); ctx.fillStyle = '#d7dce0'; ctx.fillRect(-11,-7,22,10); ctx.fillStyle = '#658b9b'; ctx.fillRect(-11,4,22,3); ctx.fillStyle = '#c7a86a'; ctx.fillRect(-14,-11,28,3); }
    else if (i.type.startsWith('inj_')) { ctx.rotate(-.6); ctx.fillStyle = ITEMS[i.type].color; ctx.fillRect(-8, -2.5, 12, 5); ctx.fillStyle = '#ccc'; ctx.fillRect(4, -1, 7, 2); ctx.fillRect(-10, -4, 2, 8); }
    else if (i.type === 'key') { ctx.fillStyle = '#d8b84a'; ctx.beginPath(); ctx.arc(-4, 0, 4, 0, 6.283); ctx.fill(); ctx.fillRect(-1, -1.5, 11, 3); ctx.fillRect(6, 1, 2, 4); }
    else if (i.type === 'doc') { ctx.rotate(.3); ctx.fillStyle = '#cfc6a8'; ctx.fillRect(-6, -8, 12, 16); ctx.fillStyle = '#6a6450'; for (let k = -5; k < 6; k += 3) ctx.fillRect(-4, k, 8, 1); }
    else { ctx.fillStyle = '#9a9aa0'; ctx.fillRect(-3, -8, 6, 14); ctx.fillStyle = '#38a9ff'; ctx.fillRect(-2, -2, 4, 7); ctx.fillStyle = '#555'; ctx.fillRect(-4, -9, 8, 3); }
    ctx.restore();
  }
};
