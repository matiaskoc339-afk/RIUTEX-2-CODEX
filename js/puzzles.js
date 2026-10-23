// Puzzles: caja fuerte (código por documentos), generador (orden de interruptores) y archivo (código por expedientes).
const Puzzles = {
  ORDER: ['sw_cocina', 'sw_lav', 'sw_enf', 'sw_seg'], NAMES: { sw_cocina: 'Cocina', sw_lav: 'Lavandería', sw_enf: 'Enfermería', sw_seg: 'Seguridad' },
  CODES: { safe: '0502', archive: '583', gateD: '625', locker: '1103', mandoT: '2316', taquilla: '1402', bioT: '2019', cajaV: '0503' }, VALVES: [2, 0, 3, 1], REACT: [3, 7, 1], cur: null,
  label(it) {
    const t = it.type; if (t === 'safe') return 'Abrir caja fuerte'; if (t === 'terminal') return 'Usar terminal del archivo'; if (t.startsWith('valve_')) return 'Girar válvula ' + t.slice(6).toUpperCase() + ' (posición ' + Game.pz.valves[t.charCodeAt(6) - 97] + ')';
    if (t.startsWith('reactor_')) return 'Girar reactivo ' + t.slice(8).toUpperCase() + ' (' + Game.pz.reactors[t.charCodeAt(8) - 97] + ')'; if (t === 'terminalB') return 'Terminal de bioseguridad'; if (t === 'cajaV') return 'Abrir caja del Dr. Voss'; if (t === 'caja') return 'Abrir baúl compartido de la zona'; if (t === 'emily') return 'Hablar con Emily'; if (t === 'terminalM') return 'Terminal del puesto de mando'; if (t === 'taquilla') return 'Abrir taquilla del sargento'; if (t === 'fusebox') return 'Tablero de fusibles'; if (t === 'terminalD') return 'Terminal de la compuerta D'; if (t === 'casillero') return 'Abrir casillero del operario'; return 'Interruptor del generador: ' + this.NAMES[t];
  },
  use(g, it) {
    if (it.type.startsWith('valve_')) {
      if (g.pz.drain) return UI.msg('Las válvulas ya están en posición.'); const i = it.type.charCodeAt(6) - 97; g.pz.valves[i] = (g.pz.valves[i] + 1) % 4; Sound.play('door');
      if (g.pz.valves.every((v, k) => v === this.VALVES[k])) { g.pz.drain = true; Level.openDoor(Level.doors.find(d => d.id === 'drain')); g.cam.shake = 10; g.ring(g.player.x, g.player.y, 240, '#40a0ff'); UI.msg('Las tuberías rugen: la compuerta de drenaje se abre hacia el canal.', 6000); }
      else UI.msg('Válvula ' + it.type.slice(6).toUpperCase() + ': posición ' + g.pz.valves[i], 2200); return;
    }
    if (it.type === 'fusebox') {
      const need = ['fusible_a', 'fusible_b', 'fusible_c'], have = need.filter(k => g.inv.keys.includes(k)); if (g.pz.fuses) return UI.msg('El tablero ya funciona.');
      if (have.length < 3) return UI.msg('Tablero de fusibles: llevas ' + have.length + '/3. Faltan A, B y C repartidos por la instalación.', 4500);
      g.pz.fuses = true; Level.openDoor(Level.doors.find(d => d.id === 'galeria')); g.inv.keys = g.inv.keys.filter(k => !need.includes(k)); g.cam.shake = 8; Sound.play('door'); return UI.msg('Vuelve la corriente: la compuerta a la Galería de descartes se abre.', 6000);
    }
    if (it.type.startsWith('reactor_')) {
      if (g.pz.reactor) return UI.msg('El cultivo ya está estabilizado.'); const i = it.type.charCodeAt(8) - 97; g.pz.reactors[i] = (g.pz.reactors[i] + 1) % 10; Sound.play('door');
      if (g.pz.reactors.every((v, k) => v === this.REACT[k])) { g.pz.reactor = true; Level.openDoor(Level.doors.find(d => d.id === 'ward')); g.cam.shake = 10; g.ring(g.player.x, g.player.y, 240, '#60ffc0'); UI.msg('El suero se estabiliza: se reactiva el ala de experimentos.', 6000); }
      else UI.msg('Reactivo ' + it.type.slice(8).toUpperCase() + ': ' + g.pz.reactors[i] + ' ml', 2200); return;
    }
    if (it.type === 'terminalB') return g.pz.bioT ? UI.msg('Servidores ya desbloqueados.') : this.pad(g, 'bioT', 4, 'BIOSEGURIDAD · clave de 4 cifras');
    if (it.type === 'cajaV') return g.pz.cajaV ? UI.msg('La caja está vacía.') : this.pad(g, 'cajaV', 4, 'CAJA DEL DR. VOSS · 4 cifras');
    if (it.type === 'caja') return g.openStash();
    if (it.type === 'emily') return g.talkEmily();
    if (it.type === 'terminalM') return g.pz.mandoT ? UI.msg('Acceso al laboratorio ya desbloqueado.') : this.pad(g, 'mandoT', 4, 'PUESTO DE MANDO · clave de 4 cifras');
    if (it.type === 'taquilla') return g.pz.taquilla ? UI.msg('La taquilla está vacía.') : this.pad(g, 'taquilla', 4, 'TAQUILLA DEL SARGENTO · 4 cifras');
    if (it.type === 'terminalD') return g.pz.gateD ? UI.msg('Compuerta D abierta.') : this.pad(g, 'gateD', 3, 'COMPUERTA D · clave de 3 cifras');
    if (it.type === 'casillero') return g.pz.locker ? UI.msg('El casillero está vacío.') : this.pad(g, 'locker', 4, 'CASILLERO DEL OPERARIO · 4 cifras');
    if (it.type === 'safe') return g.pz.safe ? UI.msg('La caja fuerte está vacía.') : this.pad(g, 'safe', 4, 'CAJA FUERTE · 4 cifras');
    if (it.type === 'terminal') return g.pz.archive ? UI.msg('Archivo ya desbloqueado.') : this.pad(g, 'archive', 3, 'ARCHIVO RESTRINGIDO · clave de 3 cifras');
    if (g.pz.power) return UI.msg('El generador ya funciona.'); const seq = g.pz.seq; if (seq.includes(it.type)) return UI.msg('Ese interruptor ya está activado.');
    if (this.ORDER[seq.length] === it.type) {
      seq.push(it.type); Sound.play('door');
      if (seq.length === 4) { g.pz.power = true; g.ring(g.player.x, g.player.y, 260, '#6ab0ff'); g.cam.shake = 10; UI.msg('Se restablece la electricidad. Algo se desbloquea en el subsuelo…', 6000); }
      else UI.msg('Interruptor activado (' + seq.length + '/4).');
    } else { g.pz.seq = []; g.cam.shake = 8; g.sparks(g.player.x, g.player.y, 16, '#6ab0ff'); Sound.play('hurt'); UI.msg('Cortocircuito: los interruptores se reinician. El orden importa.', 4500); }
  },
  pad(g, id, len, title) { this.cur = { id, len, code: '' }; g.state = 'pad'; UI.showPad(title, len, ''); UI.screen('pad'); },
  key(g, k) {
    const c = this.cur; if (!c || g.state !== 'pad') return;
    if (k === 'C') c.code = ''; else if (k === 'OK') { if (c.code.length < c.len) return UI.showPad(null, c.len, c.code, 'Faltan cifras'); return this.submit(g); } else if (c.code.length < c.len) c.code += k;
    UI.showPad(null, c.len, c.code);
  },
  submit(g) { const c = this.cur; if (c.code === this.CODES[c.id]) { g.resume(); this.solve(g, c.id); } else { c.code = ''; Sound.play('empty'); UI.showPad(null, c.len, '', 'CÓDIGO INCORRECTO'); } },
  solve(g, id) {
    const p = g.player; g.pz[id] = true; Sound.play('door');
    if (id === 'safe') { g.giveWeapon('shotgun', 5, true); p.mods.mag++; UI.msg('CAJA FUERTE: Escopeta M12 y cargador extendido (+4). Cambia de arma con 1 / 2.', 8000); }
    else if (id === 'gateD') { Level.openDoor(Level.doors.find(d => d.id === 'gateD')); g.cam.shake = 10; UI.msg('COMPUERTA D: se abre el camino al foso. Prepárate.', 6000); }
    else if (id === 'bioT') { Level.openDoor(Level.doors.find(d => d.id === 'servers')); g.cam.shake = 8; UI.msg('BIOSEGURIDAD: se abre el acceso a la Sala de servidores.', 6000); }
    else if (id === 'cajaV') { p.mods.rate = (p.mods.rate || 0) + 1; p.mods.pow = (p.mods.pow || 0) + 1; p.maxHp += 20; p.hp += 20; UI.msg('CAJA DE VOSS: mejora de cadencia, potencia y +20 de vida máxima.', 7000); }
    else if (id === 'mandoT') { Level.openDoor(Level.doors.find(d => d.id === 'approach')); g.cam.shake = 10; UI.msg('TERMINAL: se abre el pasillo hacia la antesala del laboratorio. Prepárate.', 6000); }
    else if (id === 'taquilla') { p.mods.pow = (p.mods.pow || 0) + 1; p.maxHp += 20; p.hp += 20; UI.msg('TAQUILLA: cañón reforzado (+30 % de daño) y una inyección de expansión (+20 de vida máxima).', 7000); }
    else if (id === 'locker') { g.giveWeapon('viper', 20, true); p.mods.rate = (p.mods.rate || 0) + 1; UI.msg('CASILLERO: Subfusil Viper y mejora de cadencia (+15 %). Equípalo con la tecla 3.', 8000); }
    else { Level.openDoor(Level.doors.find(d => d.id === 'arc')); UI.msg('ARCHIVO: se abre una cámara oculta al este.', 6000); }
  }
};
