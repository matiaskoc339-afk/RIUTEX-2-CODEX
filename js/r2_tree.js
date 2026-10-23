// RIUTEX 2 · Árbol de habilidades (propio de la secuela). Dos caminos: HUMANIDAD (izquierda) y MUTACIÓN (derecha) + núcleo neutral.
// Regla: cuantos más nodos compras en un camino, más nodos (empezando por los más profundos) del OTRO camino se pierden. El árbol de RIUTEX 1 no se toca.
const T2 = {};
const n2 = (id, br, tier, x, kind, name, cost, type, desc, links, o) => { T2[id] = Object.assign({ phase: 1, tier, x, kind, name, cost, type, desc, links: links || [], br }, o || {}); };
const m2 = (id, br, tier, x, name, stat, links, cost) => n2(id, br, tier, x, 'minor', name, cost || 5 + tier, 'passive', STAT[stat][2](STAT[stat][1]), links, { stat, mod: { [stat]: STAT[stat][1] } });
// --- Neutral
n2('core', 'neu', 0, 5, 'core', 'Riutex-X', 0, 'passive', 'El compuesto experimental ya corre por tu sangre. Todo nace aquí.', ['instinto', 'reflejos', 'vigor']);
n2('reflejos', 'neu', 1, 5, 'major', 'Reflejos', 0, 'active', 'Esquiva rápida con invulnerabilidad breve. (Despertada con el frasco)', ['core', 'aguante'], { energy: 12, cd: 1.2 });
n2('instinto', 'neu', 1, 4, 'major', 'Instinto', 0, 'active', 'Detectas enemigos cercanos 6 s, incluso en la oscuridad. (Despertado con el frasco)', ['core', 'veloz'], { energy: 15, cd: 4 });
m2('vigor', 'neu', 1, 6, 'Vigor', 'hp', ['core', 'foco'], 4); m2('veloz', 'neu', 2, 4, 'Paso ágil', 'speed', ['instinto', 'punteria'], 5); m2('aguante', 'neu', 2, 5, 'Aguante', 'stam', ['reflejos'], 5); m2('foco', 'neu', 2, 6, 'Foco', 'en', ['vigor', 'garras'], 5);
// --- HUMANIDAD: disciplina, puntería, sigilo y medicina. Sin depender de la mutación.
m2('punteria', 'hum', 2, 3, 'Pulso firme', 'gun', ['veloz', 'manos', 'sigilo'], 5); m2('manos', 'hum', 2, 2, 'Manos expertas', 'reload', ['punteria', 'chaleco'], 5);
n2('sigilo', 'hum', 3, 3, 'major', 'Paso sigiloso', 8, 'passive', 'El Carnicero y los enemigos te oyen un 35 % menos al moverte y disparar.', ['punteria', 'chaleco', 'concentracion', 'sombra']);
n2('chaleco', 'hum', 3, 2, 'major', 'Chaleco y disciplina', 12, 'passive', 'Recibes un 20 % menos de daño.', ['manos', 'sigilo', 'medico', 'sombra']);
n2('medico', 'hum', 3, 1, 'major', 'Medicina de campaña', 10, 'passive', 'Las inyecciones verdes curan un 50 % más.', ['chaleco', 'tirador', 'adrenalina']);
n2('adrenalina', 'hum', 3, 0, 'major', 'Adrenalina', 12, 'passive', 'Correr gasta un 40 % menos de estamina.', ['medico', 'sangrefria']);
n2('concentracion', 'hum', 4, 3, 'major', 'Concentración', 12, 'active', 'Durante 8 s tus disparos son mucho más precisos.', ['sigilo', 'certero'], { energy: 15, cd: 10 });
n2('sombra', 'hum', 4, 2, 'major', 'Sombra', 10, 'passive', 'Si te escondes en una taquilla, el Carnicero nunca te encuentra.', ['sigilo', 'chaleco', 'sutura']);
m2('tirador', 'hum', 4, 1, 'Tirador', 'gun', ['medico', 'resistencia'], 10);
n2('sutura', 'hum', 5, 2, 'major', 'Sutura', 18, 'active', 'Cierras tus heridas: recuperas 30 de salud al instante.', ['sombra', 'resistencia', 'ultimo'], { energy: 25, cd: 25 });
n2('certero', 'hum', 5, 3, 'major', 'Disparo certero', 18, 'active', 'Tu próximo disparo hace casi el triple de daño.', ['concentracion', 'elite'], { energy: 20, cd: 6 });
m2('resistencia', 'hum', 5, 1, 'Resistencia', 'hp', ['tirador', 'sutura', 'sangrefria', 'ultimo'], 10);
n2('sangrefria', 'hum', 5, 0, 'major', 'Mente fría', 14, 'passive', 'La energía se recupera un 60 % más rápido.', ['adrenalina', 'resistencia']);
n2('ultimo', 'hum', 6, 2, 'major', 'Voluntad de hierro', 30, 'passive', 'Una vez por nivel, un golpe mortal te deja con 1 de vida en vez de matarte.', ['sutura', 'resistencia', 'plena']);
n2('elite', 'hum', 6, 3, 'major', 'Tirador de élite', 25, 'passive', '+20 % de daño con armas de fuego.', ['certero', 'plena'], { mod: { gun: .2 } });
n2('plena', 'hum', 7, 2, 'major', 'Humanidad plena', 35, 'passive', 'Tu cuerpo se recompone solo cuando estás herido (hasta el 70 %).', ['ultimo', 'elite']);
// --- MUTACIÓN: poder bruto, el cuerpo como arma.
m2('garras', 'mut', 2, 7, 'Garras', 'melee', ['foco', 'fuerza', 'impacto'], 5);
n2('fuerza', 'mut', 2, 8, 'major', 'Fuerza aumentada', 10, 'passive', 'Tu daño cuerpo a cuerpo (clic derecho) se duplica.', ['garras', 'impacto', 'dash', 'piel']);
n2('impacto', 'mut', 3, 7, 'major', 'Impacto', 12, 'active', 'Onda corta que daña y aturde a los enemigos cercanos.', ['garras', 'fuerza', 'regen', 'dash'], { energy: 25, cd: 6 });
n2('dash', 'mut', 3, 8, 'major', 'Embestida', 14, 'active', 'Carrera brutal: esquivas y atraviesas el peligro.', ['fuerza', 'impacto', 'brazo', 'proyeccion'], { energy: 18, cd: 3 });
n2('piel', 'mut', 3, 9, 'major', 'Piel endurecida', 14, 'passive', 'Recibes un 25 % menos de daño.', ['fuerza', 'proyeccion', 'sed']);
n2('regen', 'mut', 4, 7, 'major', 'Regeneración', 14, 'passive', 'Cada enemigo que matas te cura unos puntos de salud.', ['impacto', 'metabolismo']);
n2('brazo', 'mut', 4, 8, 'major', 'Brazo mutante', 18, 'active', 'Tu brazo se convierte en cuchilla durante 10 s.', ['dash', 'pulso'], { energy: 30, cd: 20 });
n2('proyeccion', 'mut', 4, 9, 'major', 'Proyección', 16, 'active', 'Lanzas una proyectil de energía mutante.', ['piel', 'dash', 'telequinesis', 'sobrecarga'], { energy: 20, cd: 5 });
n2('sed', 'mut', 3, 10, 'major', 'Sed de sangre', 14, 'passive', 'Cada enemigo que matas te devuelve energía mutante.', ['piel', 'sobrecarga']);
n2('metabolismo', 'mut', 5, 7, 'major', 'Metabolismo acelerado', 16, 'passive', 'Tu cuerpo gasta menos energía y la recupera antes.', ['regen', 'pulso']);
n2('pulso', 'mut', 5, 8, 'major', 'Pulso', 18, 'active', 'Onda que empuja y frena a los enemigos cercanos.', ['brazo', 'metabolismo', 'dominio'], { energy: 25, cd: 8 });
n2('telequinesis', 'mut', 5, 9, 'major', 'Telequinesis', 14, 'active', 'Atraes objetos cercanos hacia ti.', ['proyeccion', 'ruptura'], { energy: 10, cd: 6 });
n2('sobrecarga', 'mut', 4, 10, 'major', 'Sobrecarga', 25, 'active', 'Durante unos segundos, tus ataques y tu velocidad se disparan.', ['proyeccion', 'sed', 'reactiva', 'ruptura'], { energy: 40, cd: 30 });
n2('reactiva', 'mut', 5, 10, 'major', 'Piel reactiva', 20, 'passive', 'Los enemigos que te golpean reciben parte del daño de vuelta.', ['sobrecarga']);
n2('dominio', 'mut', 6, 8, 'major', 'Dominio', 28, 'active', 'Paralizas durante unos segundos a los enemigos pequeños de alrededor.', ['pulso', 'forma'], { energy: 35, cd: 25 });
n2('ruptura', 'mut', 6, 9, 'major', 'Ruptura', 30, 'active', 'Descarga devastadora de energía en un área.', ['telequinesis', 'sobrecarga', 'forma'], { energy: 50, cd: 35 });
n2('forma', 'mut', 7, 9, 'major', 'Forma mutante', 40, 'active', 'Durante 12 s: cuchilla, velocidad y daño de mutante. Recuperas salud al activarla.', ['dominio', 'ruptura'], { energy: 50, cd: 40 });

// Acciones nuevas (las de la rama Mutación ya existen en RIUTEX 1)
Object.assign(ACTIONS, {
  concentracion(g, p) { p.focus = 8; UI.msg('Respiras hondo: puntería firme 8 s.', 1800); },
  sutura(g, p) { p.hp = Math.min(p.maxHp, p.hp + 30); p.poison = 0; g.fxInject('#60d0a0'); },
  certero(g, p) { p.sniper = 1; UI.msg('Siguiente disparo: daño casi x3.', 2200); },
  forma(g, p) { p.over = 12; p.blade = 12; p.hp = Math.min(p.maxHp, p.hp + 25); g.ring(p.x, p.y, 160, '#9adfff'); g.cam.shake = 10; }
});

const Trees = {
  r1: Object.assign({}, SKILLS), cur: 'r1', sel: null,
  use(name) { if (name === this.cur) return; for (const k of Object.keys(SKILLS)) delete SKILLS[k]; Object.assign(SKILLS, name === 'r2' ? T2 : this.r1); this.cur = name; UI.treeSel = null; },
  count(m, br) { let n = 0; for (const id of m.owned) if (SKILLS[id] && SKILLS[id].br === br) n++; return n; },
  lost(m, id, extra) { // ¿se ha perdido este nodo por avanzar en el camino contrario?
    const s = SKILLS[id]; if (!s || s.br === 'neu' || m.has(id)) return false; const opp = s.br === 'hum' ? 'mut' : 'hum', n = this.count(m, opp) + (extra ? 1 : 0), t = s.tier;
    return (n >= 2 && t >= 6) || (n >= 4 && t >= 5) || (n >= 6 && t >= 4) || (n >= 8 && t >= 3) || (n >= 10 && t >= 2);
  },
  preview(m, id) { const s = SKILLS[id]; if (!s || s.br === 'neu') return []; const lost = []; for (const k in SKILLS) { const o = SKILLS[k]; if (o.br !== s.br && o.br !== 'neu' && !m.has(k) && !this.lost(m, k, false) && this.lostAfter(m, k, s.br)) lost.push(o.name); } return lost; },
  lostAfter(m, k, br) { const o = SKILLS[k], opp = br, n = this.count(m, opp) + 1, t = o.tier; return (n >= 2 && t >= 6) || (n >= 4 && t >= 5) || (n >= 6 && t >= 4) || (n >= 8 && t >= 3) || (n >= 10 && t >= 2); }
};
// Reglas de compra del árbol de RIUTEX 2 (sin fases; conexión + camino no perdido + EXP)
(() => {
  const _can = Mutation.prototype.canBuy;
  Mutation.prototype.canBuy = function (id, xp) {
    if (Trees.cur !== 'r2') return _can.call(this, id, xp); const s = SKILLS[id]; if (!s) return 'Nodo desconocido.'; if (this.has(id)) return 'Ya adquirida.';
    if (Trees.lost(this, id)) return 'PERDIDA: avanzaste demasiado en el camino contrario.'; if (!s.links.some(l => this.has(l))) return 'Primero adquiere un nodo conectado a este.'; return xp < s.cost ? 'EXP insuficiente.' : null;
  };
  // Pasivas nuevas: Humanidad plena (curación lenta)
  const _upd = Game.update; Game.update = function (dt) { _upd.call(this, dt); if (Trees.cur === 'r2' && this.mut.has('plena') && this.state === 'play') { const p = this.player; if (p.hp < p.maxHp * .75 && p.hp > 0) p.hp = Math.min(p.maxHp * .75, p.hp + 1.2 * dt); } };
  const _ui = UI.renderTree;
  UI.renderTree = function (g) {
    if (Trees.cur !== 'r2') return _ui.call(this, g);
    const m = g.mut, p = g.player, box = this.$('treeBox'), X = x => 70 + x * 100, Y = t => 720 - t * 90, W = 1180, H = 790;
    box.style.zoom = Math.min(1, (innerHeight - 24) / (H + 10), (innerWidth - 350) / W); box.style.width = W + 'px'; box.style.height = H + 'px';
    const hum = Trees.count(m, 'hum'), mut = Trees.count(m, 'mut');
    let h = '<svg width="' + W + '" height="' + H + '" style="position:absolute;left:0;top:0"><rect x="0" y="0" width="' + (X(3.5)) + '" height="' + H + '" fill="rgba(70,140,200,.07)"/><rect x="' + X(6.5) + '" y="0" width="' + (W - X(6.5)) + '" height="' + H + '" fill="rgba(150,60,200,.09)"/>';
    const seen = {};
    for (const id in SKILLS) for (const l of SKILLS[id].links) { const k = [id, l].sort().join('|'); if (seen[k] || !SKILLS[l]) continue; seen[k] = 1; const a = SKILLS[id], b = SKILLS[l], both = m.has(id) && m.has(l), one = m.has(id) || m.has(l), dead = (Trees.lost(m, id) && !m.has(id)) || (Trees.lost(m, l) && !m.has(l));
      h += '<line x1="' + X(a.x) + '" y1="' + Y(a.tier) + '" x2="' + X(b.x) + '" y2="' + Y(b.tier) + '" stroke="' + (dead ? '#1c1c20' : both ? (a.br === 'hum' || b.br === 'hum' ? '#70c0ff' : '#9adfff') : one ? '#555a6a' : '#262a34') + '" stroke-width="' + (both ? 4 : 2.5) + '"/>'; }
    box.innerHTML = h + '</svg>';
    const lab = (x, y, t, c) => { const d = document.createElement('div'); d.className = 'ph'; d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;color:' + c + ';width:' + (X(3.5) - 20) + 'px'; d.textContent = t; box.appendChild(d); };
    lab(10, 8, 'HUMANIDAD · ' + hum + ' nodos', '#8fd0ff'); lab(X(6.5) + 10, 8, 'MUTACIÓN · ' + mut + ' nodos', '#d0a0ff');
    for (const id in SKILLS) {
      const s = SKILLS[id], err = m.canBuy(id, p.xp), lost = Trees.lost(m, id), d = document.createElement('div'), st = m.has(id) ? ' owned' : lost ? ' lost' : (!err || err === 'EXP insuficiente.') ? ' avail' : ' locked';
      d.className = 'tn ' + s.kind + ' ' + s.br + st + (this.treeSel === id ? ' sel' : '') + (m.equipped === id ? ' eq' : '') + (!err ? ' can' : '');
      const sz = s.kind === 'minor' ? 54 : s.kind === 'core' ? 66 : 0;
      d.style.cssText = sz ? 'left:' + (X(s.x) - sz / 2) + 'px;top:' + (Y(s.tier) - sz / 2) + 'px;width:' + sz + 'px;height:' + sz + 'px' : 'left:' + (X(s.x) - 52) + 'px;top:' + (Y(s.tier) - 22) + 'px';
      d.innerHTML = s.kind === 'minor' ? '<b>' + STAT[s.stat][0] + '</b><span>' + s.cost + '</span>' : s.kind === 'core' ? '<b>NÚCLEO</b>' : '<b>' + s.name + '</b><span>' + (lost ? 'PERDIDA' : (m.has(id) ? '✔ ' : '') + (s.cost ? s.cost + ' EXP · ' : '') + (s.type === 'active' ? s.energy + ' en.' : 'pasiva')) + '</span>';
      d.onclick = () => { this.treeSel = id; this.renderTree(g); }; box.appendChild(d);
    }
    this.$('treeHead').textContent = 'EXP ' + p.xp + ' · Energía ' + Math.floor(p.energy) + '/' + p.maxEnergy + '\nCamino: HUMANIDAD ' + hum + ' · MUTACIÓN ' + mut + '.  Cada nodo que compras en un camino va cerrando el otro: primero sus nodos más profundos, luego los demás. Los nodos neutrales (centro) no afectan. Resplandor = puedes comprarlo ahora.';
    const id = this.treeSel, s = id && SKILLS[id], b = this.$('bBuy'), sb = this.$('bSample');
    let txt = 'Selecciona un nodo.'; if (s) { const lostNow = Trees.lost(m, id), pre = !m.has(id) && !lostNow ? Trees.preview(m, id) : [];
      txt = s.name + '  [' + (s.br === 'hum' ? 'Humanidad' : s.br === 'mut' ? 'Mutación' : 'Neutral') + ']\n' + s.desc + '\n' + (s.type === 'active' ? 'Activa · energía ' + s.energy + ' · recarga ' + s.cd + ' s' : 'Pasiva') + (s.cost ? ' · ' + s.cost + ' EXP' : '') + '\n' + (m.has(id) ? 'ADQUIRIDA' + (s.type === 'active' ? ' · TECLA ' + (m.bindings[id] ? g.keyName(m.bindings[id]) : 'SIN ASIGNAR') : '') : (m.canBuy(id, p.xp) || 'Disponible'));
      if (pre.length) txt += '\n⚠ Al comprarla, se perderán: ' + pre.slice(0, 6).join(', ') + (pre.length > 6 ? ' y ' + (pre.length - 6) + ' más' : ''); }
    this.$('treeInfo').textContent = txt;
    if (!s || s.kind === 'core') { b.textContent = s ? 'Núcleo' : 'Selecciona un nodo'; b.disabled = true; } else if (m.has(id)) { b.textContent = s.type === 'active' ? (m.equipped === id ? 'Seleccionada' : 'Seleccionar habilidad') : 'Adquirida'; b.disabled = s.type !== 'active'; } else { b.textContent = 'Comprar (' + s.cost + ' EXP)'; b.disabled = !!m.canBuy(id, p.xp); }
    const bindBtn = this.$('bBind'); bindBtn.style.display = s && m.has(id) && s.type === 'active' ? 'block' : 'none'; bindBtn.textContent = s && m.bindings[id] ? 'Cambiar tecla (' + g.keyName(m.bindings[id]) + ')' : 'Asignar tecla';
    if (sb) { sb.textContent = 'Absorber muestra de Riutex (+40 EXP) · ' + g.inv.samples; sb.disabled = g.inv.samples <= 0; }
  };
})();
