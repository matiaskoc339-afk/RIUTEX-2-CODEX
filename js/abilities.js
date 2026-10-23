// Sistema Riutex-V1: árbol de 5 fases (15 poderes), compra con EXP, fases desbloqueadas con muestras, energía mutante.
const PHASES = ['Despertar', 'Adaptación', 'Manifestación', 'Deformación', 'Trascendencia'];
// Árbol de mutaciones: una RED de nodos conectados. Se compra desde el núcleo hacia afuera: un nodo se puede comprar si está conectado a uno que ya tienes.
// Tipos: major (poder o pasiva), minor (mejora pequeña de estadística), spec (especialización excluyente: solo una de cada par).
const STAT = { // [etiqueta, valor por nodo, descripción]
  hp: ['Vida', 10, v => '+' + v + ' de salud máxima'], melee: ['Golpe', .15, v => '+' + Math.round(v * 100) + ' % de daño cuerpo a cuerpo'], speed: ['Paso', .04, v => '+' + Math.round(v * 100) + ' % de velocidad al moverte'],
  stam: ['Aguante', .2, v => '+' + Math.round(v * 100) + ' % de recuperación de estamina'], en: ['Energía', 10, v => '+' + v + ' de energía mutante máxima'], eregen: ['Flujo', .12, v => '+' + Math.round(v * 100) + ' % de regeneración de energía'],
  xp: ['EXP', .1, v => '+' + Math.round(v * 100) + ' % de EXP ganada'], reload: ['Recarga', .12, v => '+' + Math.round(v * 100) + ' % de velocidad de recarga'], gun: ['Disparo', .08, v => '+' + Math.round(v * 100) + ' % de daño con armas de fuego']
};
const SKILLS = {};
const def = (id, phase, tier, x, kind, name, cost, type, desc, o) => { SKILLS[id] = Object.assign({ phase, tier, x, kind, name, cost, type, desc, links: [] }, o || {}); };
const mi = (id, phase, tier, x, name, stat, links) => def(id, phase, tier, x, 'minor', name, [5, 8, 10, 12, 15][phase - 1], 'passive', STAT[stat][2](STAT[stat][1]), { stat, mod: { [stat]: STAT[stat][1] }, links });
def('core', 1, 0, 4, 'core', 'Riutex-V1', 0, 'passive', 'El compuesto que ya corre por tu sangre. Todo el árbol nace aquí.', { links: ['punos', 'foco'] });
mi('vigor', 1, 0, 2, 'Vigor', 'hp', ['punos']); mi('punos', 1, 0, 3, 'Puños', 'melee', ['core']); mi('foco', 1, 0, 5, 'Foco', 'en', ['core']); mi('rapidez', 1, 0, 6, 'Rapidez', 'speed', ['foco']);
def('fuerza', 1, 1, 2, 'major', 'Fuerza aumentada', 15, 'passive', 'Tu daño cuerpo a cuerpo (clic derecho) se duplica.', { links: ['vigor', 'punos'] });
def('reflejos', 1, 1, 4, 'major', 'Reflejos', 20, 'active', 'Esquiva rápida con invulnerabilidad breve.', { energy: 12, cd: 1.2, links: ['punos', 'foco'] });
def('instinto', 1, 1, 6, 'major', 'Instinto', 20, 'active', 'Detectas a los enemigos cercanos durante 6 s, incluso en la oscuridad.', { energy: 15, cd: 4, links: ['foco', 'rapidez'] });
def('adrenalina', 1, 1, 0, 'spec', 'Adrenalina', 15, 'passive', 'Correr gasta 40 % menos de estamina.', { excl: 'sangrefria', links: ['vigor'] });
def('sangrefria', 1, 1, 8, 'spec', 'Sangre fría', 15, 'passive', 'La energía mutante se recupera 60 % más rápido.', { excl: 'adrenalina', links: ['rapidez'] });
mi('corazon', 2, 2, 1, 'Corazón', 'hp', ['fuerza']); mi('musculo', 2, 2, 3, 'Músculo', 'melee', ['fuerza', 'reflejos']); mi('nervio', 2, 2, 4, 'Nervio', 'speed', ['reflejos']);
mi('cerebro', 2, 2, 5, 'Cerebro', 'en', ['reflejos', 'instinto']); mi('reserva', 2, 2, 7, 'Reserva', 'stam', ['instinto']);
def('piel', 2, 3, 1, 'major', 'Piel endurecida', 25, 'passive', 'Recibes 25 % menos de daño.', { links: ['corazon', 'musculo'] });
def('dash', 2, 3, 4, 'major', 'Dash mutante', 25, 'active', 'Desplazamiento rápido e invulnerable para esquivar ataques.', { energy: 18, cd: .8, links: ['nervio', 'musculo', 'cerebro'] });
def('impacto', 2, 3, 6, 'major', 'Golpe de impacto', 30, 'active', 'Aturde 2 s y empuja a los enemigos cercanos.', { energy: 25, links: ['cerebro', 'reserva'] });
def('blindada', 2, 3, 0, 'spec', 'Coraza', 25, 'passive', 'Piel endurecida bloquea 40 % en vez de 25 %.', { excl: 'reactiva', links: ['piel'] });
def('reactiva', 2, 3, 2, 'spec', 'Piel reactiva', 25, 'passive', 'Al recibir un golpe, los enemigos cercanos sufren 20 de daño y son empujados.', { excl: 'blindada', links: ['piel'] });
mi('carne', 3, 4, 1, 'Carne', 'hp', ['piel']); mi('garra', 3, 4, 2, 'Garra', 'melee', ['piel']); mi('punteria', 3, 4, 3, 'Puntería', 'gun', ['dash']); mi('vena', 3, 4, 4, 'Vena ávida', 'xp', ['dash']);
mi('sinapsis', 3, 4, 5, 'Sinapsis', 'en', ['dash', 'impacto']); mi('fluir', 3, 4, 6, 'Fluir', 'eregen', ['impacto']); mi('manos', 3, 4, 7, 'Manos ágiles', 'reload', ['impacto']);
def('pulso', 3, 5, 1, 'major', 'Pulso', 30, 'active', 'Onda que interrumpe los ataques cercanos.', { energy: 25, links: ['carne', 'garra'] });
def('telequinesis', 3, 5, 4, 'major', 'Telequinesis', 30, 'active', 'Atrae y recoge los objetos a tu alrededor (280 px).', { energy: 20, links: ['punteria', 'vena', 'sinapsis'] });
def('proyeccion', 3, 5, 6, 'major', 'Proyección', 35, 'active', 'Lanzas un fragmento hacia el cursor: 45 de daño.', { energy: 18, cd: 1, links: ['sinapsis', 'fluir', 'manos'] });
def('eco', 3, 5, 0, 'spec', 'Eco', 30, 'passive', 'Pulso también hace 25 de daño a los enemigos que alcanza.', { excl: 'abanico', links: ['pulso'] });
def('abanico', 3, 5, 8, 'spec', 'Abanico', 30, 'passive', 'Proyección lanza 3 fragmentos en abanico (30 de daño cada uno).', { excl: 'eco', links: ['proyeccion'] });
mi('robustez', 4, 6, 1, 'Robustez', 'hp', ['pulso']); mi('tajo', 4, 6, 2, 'Tajo', 'melee', ['pulso']); mi('pulmon', 4, 6, 3, 'Pulmón', 'stam', ['telequinesis']); mi('avaricia', 4, 6, 4, 'Avaricia', 'xp', ['telequinesis']);
mi('neurona', 4, 6, 5, 'Neurona', 'en', ['telequinesis', 'proyeccion']); mi('corriente', 4, 6, 6, 'Corriente', 'eregen', ['proyeccion']); mi('cadencia', 4, 6, 7, 'Cadencia', 'reload', ['proyeccion']);
def('brazo', 4, 7, 1, 'major', 'Brazo mutante', 35, 'active', '10 s con una cuchilla orgánica: más alcance y daño cuerpo a cuerpo x2.', { energy: 30, cd: 3, links: ['robustez', 'tajo'] });
def('regen', 4, 7, 4, 'major', 'Regeneración de emergencia', 35, 'passive', 'Al matar recuperas 4 de salud, con un límite que se recarga despacio.', { links: ['pulmon', 'avaricia', 'neurona'] });
def('sobrecarga', 4, 7, 6, 'major', 'Sobrecarga', 40, 'active', '10 s: poderes a mitad de coste, energía x3 y daño +30 %.', { energy: 40, cd: 15, links: ['neurona', 'corriente', 'cadencia'] });
def('sed', 4, 7, 0, 'spec', 'Sed de sangre', 35, 'passive', 'Cada baja te da 12 de energía mutante.', { excl: 'metabolismo', links: ['brazo'] });
def('metabolismo', 4, 7, 3, 'spec', 'Metabolismo', 35, 'passive', 'Regeneración cura 6 por baja y su reserva sube a 40.', { excl: 'sed', links: ['regen'] });
mi('titan', 5, 8, 1, 'Titán', 'hp', ['brazo']); mi('furia', 5, 8, 2, 'Furia', 'melee', ['brazo']); mi('ritmo', 5, 8, 3, 'Ritmo', 'speed', ['regen']); mi('codicia', 5, 8, 4, 'Codicia', 'xp', ['regen']);
mi('abismo', 5, 8, 5, 'Abismo', 'en', ['regen', 'sobrecarga']); mi('marea', 5, 8, 6, 'Marea', 'eregen', ['sobrecarga']); mi('precision', 5, 8, 7, 'Precisión', 'gun', ['sobrecarga']);
def('ruptura', 5, 9, 1, 'major', 'Ruptura', 45, 'active', 'Explosión de energía: gran daño alrededor de ti.', { energy: 60, cd: 6, links: ['titan', 'furia'] });
def('ultimo', 5, 9, 4, 'major', 'Último recurso', 45, 'passive', 'Sobrevives una vez a un golpe mortal. Enfriamiento: 120 s.', { links: ['ritmo', 'codicia', 'abismo'] });
def('dominio', 5, 9, 6, 'major', 'Dominio', 45, 'active', 'Inmoviliza 6 s a los enemigos pequeños cercanos.', { energy: 35, cd: 8, links: ['abismo', 'marea', 'precision'] });
def('onda', 5, 9, 0, 'spec', 'Onda expansiva', 40, 'passive', 'Ruptura: radio +50 % y daño +30 %.', { excl: 'colmena', links: ['ruptura'] });
def('colmena', 5, 9, 8, 'spec', 'Mente colmena', 40, 'passive', 'Dominio dura 10 s y afecta a TODOS los enemigos cercanos, no solo a los pequeños.', { excl: 'onda', links: ['dominio'] });
(() => { // conexiones bidireccionales + enlaces laterales entre mejoras menores vecinas (forman una red)
  const lk = (a, b) => { if (!SKILLS[a].links.includes(b)) SKILLS[a].links.push(b); if (!SKILLS[b].links.includes(a)) SKILLS[b].links.push(a); };
  for (const id in SKILLS) for (const l of SKILLS[id].links.slice()) lk(id, l);
  const by = {}; for (const id in SKILLS) if (SKILLS[id].kind === 'minor') (by[SKILLS[id].tier] = by[SKILLS[id].tier] || []).push(id);
  for (const t in by) { const a = by[t].sort((p, q) => SKILLS[p].x - SKILLS[q].x); for (let i = 1; i < a.length; i++) if (SKILLS[a[i]].x - SKILLS[a[i - 1]].x === 1) lk(a[i], a[i - 1]); }
})();
class Mutation {
  constructor() { this.owned = new Set(['core']); this.phases = 0; this.equipped = null; this.bindings = {}; this.tutorial = false; this.seen = false; this.cd = {}; }
  has(id) { return this.owned.has(id); }
  mod(stat) { let t = 0; for (const id of this.owned) { const m = SKILLS[id] && SKILLS[id].mod; if (m && m[stat]) t += m[stat]; } return t; }
  canBuy(id, xp) {
    const s = SKILLS[id]; if (this.has(id)) return 'Ya adquirida.'; if (s.phase > this.phases) return 'Fase bloqueada: falta inyectar una muestra de Riutex.';
    if (!s.links.some(l => this.has(l))) return 'Primero adquiere un nodo conectado a este.'; return xp < s.cost ? 'EXP insuficiente.' : null;
  }
  serialize() { return { owned: [...this.owned], phases: this.phases, equipped: this.equipped, bindings: this.bindings, tutorial: this.tutorial, seen: this.seen }; }
  load(d) { this.owned = new Set((d.owned || ['core']).filter(id => SKILLS[id])); this.owned.add('core'); this.phases = d.phases || 0; this.equipped = d.equipped || null; this.bindings = Object.assign({}, d.bindings || {}); this.tutorial = !!d.tutorial; this.seen = !!d.seen; if (this.equipped && !this.bindings[this.equipped]) this.bindings[this.equipped] = 'KeyQ'; for (const id of Object.keys(this.bindings)) if (!this.has(id) || SKILLS[id]?.type !== 'active') delete this.bindings[id]; }
}

// Recompensas de EXP deliberadamente pequeñas y variables; los jefes dan más, sin romper el progreso.
function mutationXPReward(def, isBoss, mut) {
  const base = Number(def && def.xp) || 10;
  let pool;
  if (isBoss || base >= 200) pool = [10, 12, 15, 18, 20, 25];
  else if (base <= 40) pool = [1, 1, 1, 1, 3, 3, 5];
  else if (base <= 80) pool = [2, 2, 2, 3, 3, 5];
  else if (base <= 130) pool = [3, 3, 4, 5, 5, 7];
  else pool = [4, 5, 5, 7, 8, 10];
  const raw = pool[Math.floor(Math.random() * pool.length)];
  return Math.max(1, Math.round(raw * (1 + ((mut && mut.mod('xp')) || 0))));
}

// Efectos reales de cada poder activo.
const ACTIONS = {
  reflejos(g, p) { p.dodge(g, 110, .18); },
  dash(g, p) { p.dodge(g, 190, .2); },
  instinto(g, p) { p.sense = 6; },
  impacto(g, p) { g.ring(p.x, p.y, 100, '#70d6ff'); g.cam.shake = 8; for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 100 + e.r) { e.hurt(10, Math.atan2(e.y - p.y, e.x - p.x), g); if (!e.dead) e.stagger = 2; } },
  pulso(g, p) { g.ring(p.x, p.y, 130, '#438dff'); for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 130 + e.r) { const a = Math.atan2(e.y - p.y, e.x - p.x); if (g.mut.has('eco')) e.hurt(25, a, g); if (e.dead) continue; e.windup = 0; e.cd = 1.5; e.stagger = .7; Level.move(e, Math.cos(a) * 24, Math.sin(a) * 24); } },
  telequinesis(g, p) { g.ring(p.x, p.y, 280, '#6cbcff'); for (const it of g.items) if (!it.fixed && Level.los(p.x,p.y,it.x,it.y) && Math.hypot(it.x - p.x, it.y - p.y) < 280) it.pull = true; },
  proyeccion(g, p) { const ab = g.mut.has('abanico'); for (const o of ab ? [-.28, 0, .28] : [0]) { const a = p.angle + o, c = Math.cos(a), s = Math.sin(a); g.projectiles.push({ x: p.x + c * 16, y: p.y + s * 16, vx: c * 520, vy: s * 520, dmg: (ab ? 30 : 45) * (p.over > 0 ? 1.3 : 1), life: 1.2 }); } },
  brazo(g, p) { p.blade = 10; },
  sobrecarga(g, p) { p.over = 10; },
  ruptura(g, p) { const R = g.mut.has('onda') ? 255 : 170, k = g.mut.has('onda') ? 1.3 : 1; g.ring(p.x, p.y, R, '#c2eeff'); g.cam.shake = 14; for (const e of g.enemies) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (!e.dead && d < R + e.r) e.hurt(90 * k * (1 - d / (R * 2)) * (p.over > 0 ? 1.3 : 1), Math.atan2(e.y - p.y, e.x - p.x), g); } },
  dominio(g, p) { const hive = g.mut.has('colmena'); g.ring(p.x, p.y, 300, '#286bd1'); for (const e of g.enemies) if (!e.dead && (hive || e.def.small) && Math.hypot(e.x - p.x, e.y - p.y) < 300) { e.frozen = hive ? 10 : 6; e.windup = 0; } }
};
