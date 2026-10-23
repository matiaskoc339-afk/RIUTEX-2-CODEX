// Interfaz: HUD, menús, inventario y lector de documentos (DOM).
const UI = {
  $: id => document.getElementById(id), msgT: null,
  screen(name) { for (const s of ['menu', 'pause', 'dead', 'inv', 'doc', 'tree', 'pad', 'end', 'cine', 'stash', 'slots']) this.$(s).classList.toggle('hidden', s !== name); this.$('hud').classList.toggle('hidden', name === 'menu' || name === 'end'); },
  msg(t, ms = 3500) { const m = this.$('msg'); m.textContent = t; m.style.opacity = 1; clearTimeout(this.msgT); this.msgT = setTimeout(() => m.style.opacity = 0, ms); },
  prompt(t) { this.$('prompt').textContent = t || ''; },
  vignette() { const v = this.$('vig'); v.style.opacity = 1; setTimeout(() => v.style.opacity = 0, 150); },
  flash(c) { const f = this.$('fx'); f.style.background = c; f.style.opacity = ['#58bdff','#38a9ff','#60d0a0'].includes(c) ? .12 : .32; setTimeout(() => f.style.opacity = 0, 220); },
  hud(p, inv, mut) {
    this.$('hp').style.width = (p.hp / p.maxHp * 100) + '%'; this.$('st').style.width = p.stamina + '%'; this.$('xp').textContent = 'EXP ' + p.xp + ' · SALUD ' + Math.ceil(p.hp) + '/' + p.maxHp;
    const w = p.weapon; let s = w ? WEAPONS[w.id].name + '\n' + (p.reloading > 0 ? 'RECARGANDO…' : w.mag + ' / ' + inv.reserve(w.id)) : 'Sin arma';
    const si = inv && inv.items[inv.sel], t = si && ITEMS[si.type].use ? si.type : null; s += '\n[F] ' + (t ? ITEMS[t].short : 'sin inyección'); if (p.focus > 0) s += '\nEnfoque ' + Math.ceil(p.focus) + ' s'; if (p.poison > 0) s += '\nENVENENADO ' + Math.ceil(p.poison) + ' s'; if (p.stamina < 30) s += '\nSIN ALIENTO: la puntería falla'; if (mut) { const active = Object.keys(mut.bindings || {}).filter(id => mut.has(id) && SKILLS[id] && SKILLS[id].type === 'active'); s += active.length ? '\n' + active.map(id => '[' + (Game.keyName ? Game.keyName(mut.bindings[id]) : mut.bindings[id]) + '] ' + SKILLS[id].name).join(' · ') : '\nSin habilidades activas asignadas'; this.$('en').style.width = (p.energy / p.maxEnergy * 100) + '%'; this.$('enb').style.display = mut.tutorial ? 'block' : 'none'; this.$('hint').style.display = mut.tutorial && !mut.seen ? 'block' : 'none'; }
    this.$('ammo').textContent = s;
  },
  renderInv(g) { // maletín: clic en objeto = seleccionar, clic en casilla = mover, R = girar
    const inv = g.inv, p = g.player, C = 56, box = this.$('invGrid'); box.innerHTML = ''; box.style.gridTemplateColumns = 'repeat(' + inv.cols + ',' + C + 'px)';
    for (let y = 0; y < inv.rows; y++) for (let x = 0; x < inv.cols; x++) { const c = document.createElement('div'); c.className = 'cell'; c.onclick = () => { const it = inv.selItem(); if (it && !inv.move(it, x, y)) this.msg('No cabe ahí.', 1500); this.renderInv(g); }; box.appendChild(c); }
    inv.items.forEach((it, i) => { const df = ITEMS[it.type], d = document.createElement('div'); d.className = 'it' + (i === inv.sel ? ' sel' : '');
      d.style.cssText = 'left:' + it.x * C + 'px;top:' + it.y * C + 'px;width:' + it.w * C + 'px;height:' + it.h * C + 'px;background:' + df.color + '33;border-color:' + df.color;
      d.innerHTML = '<b style="background:' + df.color + '"></b><span>' + df.short + (it.count != null ? ' ×' + it.count : '') + (it.mag != null ? ' ' + it.mag : '') + '</span>'; d.onclick = e => { e.stopPropagation(); inv.sel = i; this.renderInv(g); }; box.appendChild(d); });
    const used = inv.items.reduce((n, o) => n + o.w * o.h, 0), s = inv.selItem();
    this.$('invCap').textContent = 'Maletín ' + inv.cols + '×' + inv.rows + ' · casillas libres: ' + (inv.cols * inv.rows - used) + ' · ampliaciones: ' + inv.level + '/' + CASE_LEVELS.length;
    this.$('invInfo').textContent = (s ? ITEMS[s.type].name + '\n' + ITEMS[s.type].desc : 'Selecciona un objeto. Luego haz clic en una casilla para moverlo o pulsa R para girarlo.') +
      '\n\nSalud ' + Math.ceil(p.hp) + '/' + p.maxHp + ' · Muestras: ' + inv.samples + '\nArma: ' + (p.weapon ? WEAPONS[p.weapon.id].name + ' (' + p.weapon.mag + ' + ' + inv.reserve(p.weapon.id) + ')' : 'ninguna');
    this.$('invKeys').textContent = 'Llaves: ' + (inv.keys.map(k => KEYS[k]).join(' · ') || 'ninguna');
    const dv = this.$('invDocs'); dv.innerHTML = '';
    const jb = document.createElement('button'); jb.textContent = 'Abrir diario (J) · ' + inv.docs.length + ' documentos'; jb.onclick = () => g.openJournal(); dv.appendChild(jb);
    const oldCraft = this.$('invSide').querySelector('.craft-actions'); if (oldCraft) oldCraft.remove(); const craft = document.createElement('div'); craft.className = 'craft-actions'; craft.innerHTML = '<h3>Fabricación de munición</h3><p>9 mm: 2 tornillos pequeños + 2 pólvoras pequeñas → 10 balas</p><button data-craft="pistol">Fabricar 9 mm ×10</button><p>Viper: 3 tornillos pequeños + 3 pólvoras pequeñas → 20 balas</p><button data-craft="viper">Fabricar Viper ×20</button><p>Escopeta: 1 tornillo grande + 2 pólvoras grandes → 4 cartuchos</p><button data-craft="shotgun">Fabricar cartuchos ×4</button><p>Rifle: 2 tornillos grandes + 2 pólvoras grandes → 5 cartuchos</p><button data-craft="rifle">Fabricar rifle ×5</button><p>Lanzagranadas: 3 tornillos grandes + 4 pólvoras grandes → 2 granadas</p><button data-craft="launcher">Fabricar granadas ×2</button>'; craft.querySelectorAll('[data-craft]').forEach(b => b.onclick = () => g.craftAmmo(b.dataset.craft)); this.$('invSide').appendChild(craft);
  },
  renderStash(g) { // baúl compartido: infinito, accesible desde la caja de cualquier zona
    const inv = g.inv, C = 56, box = this.$('stGrid'); box.innerHTML = ''; box.style.gridTemplateColumns = 'repeat(' + inv.cols + ',' + C + 'px)';
    for (let y = 0; y < inv.rows; y++) for (let x = 0; x < inv.cols; x++) { const c = document.createElement('div'); c.className = 'cell'; c.onclick = () => { const it = inv.selItem(); if (it && !inv.move(it, x, y)) this.msg('No cabe ahí.', 1500); this.renderStash(g); }; box.appendChild(c); }
    inv.items.forEach((it, i) => { const df = ITEMS[it.type], d = document.createElement('div'); d.className = 'it' + (i === inv.sel ? ' sel' : '');
      d.style.cssText = 'left:' + it.x * C + 'px;top:' + it.y * C + 'px;width:' + it.w * C + 'px;height:' + it.h * C + 'px;background:' + df.color + '33;border-color:' + df.color;
      d.innerHTML = '<b style="background:' + df.color + '"></b><span>' + df.short + (it.count != null ? ' ×' + it.count : '') + (it.mag != null ? ' ' + it.mag : '') + '</span>'; d.onclick = e => { e.stopPropagation(); inv.sel = i; this.renderStash(g); }; box.appendChild(d); });
    const list = this.$('stList'); list.innerHTML = ''; if (!g.stash.length) list.textContent = 'El baúl está vacío. Es el mismo en todas las zonas.';
    g.stash.forEach((it, i) => { const df = ITEMS[it.type], d = document.createElement('div'); d.className = 'jit'; d.innerHTML = '<span>' + df.name + (it.count != null ? ' ×' + it.count : '') + (it.mag != null ? ' (' + it.mag + ')' : '') + '</span><i>SACAR</i>'; d.onclick = () => g.fromStash(i); list.appendChild(d); });
    const used = inv.items.reduce((n, o) => n + o.w * o.h, 0), s = inv.selItem();
    this.$('stInfo').textContent = 'Maletín ' + inv.cols + '×' + inv.rows + ' · casillas libres: ' + (inv.cols * inv.rows - used) + '\n' + (s ? 'Seleccionado: ' + ITEMS[s.type].name : 'Selecciona un objeto de tu maletín para guardarlo.');
  },
  renderSaveSlots(g, mode) { const box = this.$('saveSlotsList'); box.innerHTML = ''; const slots = g.getSaveSlots(); this.$('saveSlotsTitle').textContent = mode === 'save' ? 'GUARDAR PARTIDA' : 'CARGAR PARTIDA'; this.$('saveSlotsHint').textContent = mode === 'save' ? 'Elige uno de los 3 huecos. Si está ocupado, se sobrescribirá.' : 'Elige qué partida cargar. Si no quieres cargar ninguna, pulsa «Ninguno / volver».'; slots.slice(0, 3).forEach((sv, i) => { const b = document.createElement('button'); b.className = 'save-slot'; b.innerHTML = '<b>HUECO ' + (i + 1) + '</b><span>' + (sv ? ((sv.levelName || sv.lvl || 'Partida') + ' · ' + new Date(sv.savedAt || Date.now()).toLocaleString()) : 'VACÍO') + '</span><small>' + (sv ? ('Salud ' + Math.ceil(sv.hp || 0) + '/' + (sv.maxHp || 0) + ' · EXP ' + (sv.xp || 0)) : 'Sin datos guardados') + '</small>'; b.onclick = () => g.chooseSaveSlot(i); box.appendChild(b); }); const switchBtn = this.$('bSlotsSwitch'); switchBtn.classList.toggle('hidden', !g.slotFromPlay); switchBtn.textContent = mode === 'save' ? 'Cargar partida' : 'Guardar partida'; switchBtn.onclick = () => g.switchSaveSlotMode(); this.$('bSlotsClose').textContent = mode === 'load' ? 'Ninguno / volver' : 'Cancelar'; this.$('bSlotsClose').onclick = () => g.closeSaveSlots(); },
  padBuilt: false,
  showPad(title, len, code, err) {
    if (!this.padBuilt) { this.padBuilt = true; const g = this.$('padKeys'); ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].forEach(k => { const b = document.createElement('button'); b.textContent = k; b.onclick = () => Puzzles.key(Game, k); g.appendChild(b); }); }
    if (title) this.$('padT').textContent = title; this.$('padD').textContent = (code + '_'.repeat(len - code.length)).split('').join(' '); this.$('padE').textContent = err || '';
  },
  bossBar(b) { const e = this.$('boss'); if (!b || !b.active || b.dead) { e.classList.add('hidden'); return; } e.classList.remove('hidden'); this.$('bossN').textContent = b.def.name.toUpperCase(); this.$('bossB').style.width = Math.max(0, b.hp / b.maxHp * 100) + '%'; },
  treeSel: null,
  renderTree(g) { // red de nodos; las fases se abren con muestras de Riutex
    const m = g.mut, p = g.player, box = this.$('treeBox'), X = x => 60 + x * 105, Y = t => 730 - t * 72, nm = id => SKILLS[id].kind === 'minor' ? STAT[SKILLS[id].stat][0] : SKILLS[id].name;
    box.style.zoom = Math.min(1, (innerHeight - 24) / 790, (innerWidth - 350) / 960);
    let h = '<svg width="960" height="780" style="position:absolute;left:0;top:0">';
    for (let ph = 1; ph <= 5; ph++) h += '<rect x="0" y="' + (Y(2 * ph - 1) - 42) + '" width="960" height="146" fill="' + (ph > m.phases ? 'rgba(0,0,0,.4)' : 'rgba(110,50,170,.08)') + '"/>';
    const seen = {};
    for (const id in SKILLS) for (const l of SKILLS[id].links) {
      const k = [id, l].sort().join('|'); if (seen[k]) continue; seen[k] = 1; const a = SKILLS[id], b = SKILLS[l], both = m.has(id) && m.has(l), one = m.has(id) || m.has(l);
      h += '<line x1="' + X(a.x) + '" y1="' + Y(a.tier) + '" x2="' + X(b.x) + '" y2="' + Y(b.tier) + '" stroke="' + (both ? '#70d6ff' : one ? '#6a4a90' : '#2a2236') + '" stroke-width="' + (both ? 4 : 2.5) + '"/>';
    }
    box.innerHTML = h + '</svg>';
    for (let ph = 1; ph <= 5; ph++) { const l = document.createElement('div'); l.className = 'ph'; l.style.top = (Y(2 * ph - 1) - 40) + 'px'; l.textContent = 'FASE ' + ph + ' · ' + PHASES[ph - 1].toUpperCase() + (ph > m.phases ? ' · BLOQUEADA: falta una muestra de Riutex' : ''); box.appendChild(l); }
    for (const id in SKILLS) {
      const s = SKILLS[id], err = m.canBuy(id, p.xp), d = document.createElement('div'), st = m.has(id) ? ' owned' : (!err || err === 'EXP insuficiente.') ? ' avail' : ' locked';
      d.className = 'tn ' + s.kind + ' z' + (s.x < 3 ? 0 : s.x < 6 ? 1 : 2) + st + (this.treeSel === id ? ' sel' : '') + (m.equipped === id ? ' eq' : '');
      const sz = s.kind === 'minor' ? 54 : s.kind === 'core' ? 66 : 0;
      d.style.cssText = sz ? 'left:' + (X(s.x) - sz / 2) + 'px;top:' + (Y(s.tier) - sz / 2) + 'px;width:' + sz + 'px;height:' + sz + 'px' : 'left:' + (X(s.x) - 52) + 'px;top:' + (Y(s.tier) - 22) + 'px';
      d.innerHTML = s.kind === 'minor' ? '<b>' + STAT[s.stat][0] + '</b><span>' + s.cost + '</span>' : s.kind === 'core' ? '<b>NÚCLEO</b>' : '<b>' + s.name + '</b><span>' + s.cost + ' EXP · ' + (s.type === 'active' ? s.energy + ' en.' : s.kind === 'spec' ? 'elige 1' : 'pasiva') + '</span>';
      d.onclick = () => { this.treeSel = id; this.renderTree(g); }; box.appendChild(d);
    }
    this.$('treeHead').textContent = 'EXP ' + p.xp + ' · Energía ' + Math.floor(p.energy) + '/' + p.maxEnergy + ' · Evolución ' + Math.round(Math.max(0, m.owned.size - 1) / 40 * 100) + ' %\nCompra desde el NÚCLEO hacia afuera: cada nodo debe estar conectado a uno que ya tengas. Rojo = combate · Azul = supervivencia · Morado = mente · Dorado = especialización (una por par).';
    const id = this.treeSel, s = id && SKILLS[id], b = this.$('bBuy'), sb = this.$('bSample');
    this.$('treeInfo').textContent = s ? s.name + (s.kind === 'spec' ? ' (especialización)' : s.kind === 'minor' ? ' (mejora menor)' : '') + '\n' + s.desc + '\n' + (s.type === 'active' ? 'Activa · energía ' + s.energy : s.kind === 'spec' ? 'Especialización' : 'Pasiva') + ' · ' + s.cost + ' EXP'
      + '\nConectado con: ' + s.links.slice(0, 5).map(nm).join(', ') + (s.excl ? '\nExcluyente con: ' + SKILLS[s.excl].name : '') + '\n' + (m.has(id) ? 'ADQUIRIDA' + (s.type === 'active' ? ' · TECLA ' + (m.bindings[id] ? (g.keyName(m.bindings[id])) : 'SIN ASIGNAR') : '') : m.canBuy(id, p.xp) || 'Disponible') : 'Selecciona un nodo.';
    if (!s || s.kind === 'core') { b.textContent = s ? 'Núcleo' : 'Selecciona un nodo'; b.disabled = true; }
    else if (m.has(id)) { b.textContent = s.type === 'active' ? (m.equipped === id ? 'Seleccionada' : 'Seleccionar habilidad') : 'Adquirida'; b.disabled = s.type !== 'active'; }
    else { b.textContent = (s.excl && m.has(s.excl) ? 'Reemplazar (' : 'Comprar (') + s.cost + ' EXP)'; b.disabled = !!m.canBuy(id, p.xp); }
    const bindBtn = this.$('bBind'); bindBtn.style.display = s && m.has(id) && s.type === 'active' ? 'block' : 'none'; bindBtn.textContent = s && m.bindings[id] ? 'Cambiar tecla (' + g.keyName(m.bindings[id]) + ')' : 'Asignar tecla'; bindBtn.disabled = !(s && m.has(id) && s.type === 'active');
    sb.textContent = m.phases >= 5 ? 'Todas las fases abiertas' : 'Inyectar muestra → Fase ' + (m.phases + 1) + ' (tienes ' + g.inv.samples + ')'; sb.disabled = m.phases >= 5 || g.inv.samples <= 0;
  },
  jTab: 'all',
  renderJournal(g, id) { // diario: lista a la izquierda, papel a la derecha
    const inv = g.inv, st = g.story; st.read = st.read || []; const wasNew = !st.read.includes(id); if (wasNew) st.read.push(id); g.jSel = id;
    this.$('jHead').textContent = 'DIARIO · ' + inv.docs.length + ' documentos';
    const tabs = this.$('jTabs'); tabs.innerHTML = ''; [['all', 'Todos'], ['pista', 'Pistas'], ['historia', 'Historia']].forEach(([k, t]) => { const b = document.createElement('button'); b.textContent = t; b.className = this.jTab === k ? 'on' : ''; b.onclick = () => { this.jTab = k; this.renderJournal(g, g.jSel); }; tabs.appendChild(b); });
    const list = this.$('jItems'); list.innerHTML = '';
    inv.docs.slice().reverse().filter(i => this.jTab === 'all' || (this.jTab === 'pista') === CLUES.has(i)).forEach(i => { const d = document.createElement('div'); d.className = 'jit' + (i === id ? ' sel' : ''); d.innerHTML = '<span>' + (st.read.includes(i) ? '' : '<u class="nw">● </u>') + DOCS[i].title + '</span><i>' + (CLUES.has(i) ? 'PISTA' : 'HISTORIA') + '</i>'; d.onclick = () => this.renderJournal(g, i); list.appendChild(d); });
    this.$('docT').textContent = DOCS[id].title; this.$('docB').textContent = DOCS[id].text; this.$('jStamp').textContent = CLUES.has(id) ? 'PISTA' : 'CONFIDENCIAL'; this.$('jPaper').scrollTop = 0;
  }
};
