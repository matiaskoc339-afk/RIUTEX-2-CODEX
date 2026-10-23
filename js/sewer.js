// PARTE 2: Las cloacas / Sala de descartes. Datos del nivel, props propios, documentos y el jefe (El Caimán Fundido).
const Sewer = {
  spawn: [6, 6], boss: [61, 64],
  items: [
    _F('caja_s1', 'caja', 8, 8), _F('caja_s2', 'caja', 35, 10), _D('c1', 5, 4), _D('c_turno_tarde', 18, 22), ['w_a1', 'ammo', 11, 5], ['w_ig1', 'inj_green', 4, 8],
    _D('c2', 22, 13), _D('c16', 35, 13), ['w_a2', 'ammo', 35, 3], ['w_sh1', 'shells', 22, 3],
    _K('wf1', 'fusible_a', 63, 13), _K('wk1', 'taller', 50, 14), _D('c6', 58, 3), ['w_a3', 'ammo', 54, 13], ['w_sh2', 'shells', 63, 3], ['w_cure1', 'inj_cure', 50, 3], _D('c10', 60, 14),
    ['w_a4', 'ammo', 68, 9],
    _F('valve_a', 'valve_a', 75, 12), _F('valve_b', 'valve_b', 77, 12), _F('valve_c', 'valve_c', 79, 12), _F('valve_d', 'valve_d', 81, 12), _D('c3', 83, 13), _D('c4', 74, 4), ['w_a5', 'ammo', 74, 13], ['w_ig2', 'inj_green', 84, 4],
    ['w_a6', 'ammo', 28, 20],
    ['w_a7', 'ammo', 15, 26], ['w_sh3', 'shells', 50, 26], ['w_cure2', 'inj_cure', 13, 32], ['w_case', 'case', 54, 32], _F('fusebox', 'fusebox', 54, 27), _D('c5', 25, 33),
    _D('c9', 63, 23), _D('c13', 75, 24), _D('c14', 64, 36), ['w_a8', 'ammo', 70, 23], ['w_sh4', 'shells', 76, 35], ['w_ig3', 'inj_green', 63, 35], ['w_mp', 'mod_pow', 75, 36], ['w_smg3', 'smg', 68, 34],
    ['w_a9', 'ammo', 31, 38],
    _F('casillero', 'casillero', 20, 50), _D('c11', 29, 46), _K('wf2', 'fusible_b', 40, 50), ['w_smg1', 'smg', 21, 46], ['w_a10', 'ammo', 24, 50], ['w_sh5', 'shells', 35, 50],
    _D('c8', 55, 50), _K('wf3', 'fusible_c', 50, 50), ['w_mask', 'mask', 52, 44], ['w_modmag', 'mod_mag', 55, 46], ['w_ig4', 'inj_green', 47, 50], ['smg2', 'smg', 54, 50],
    ['w_a11', 'ammo', 69, 41],
    _D('c7', 81, 48), _F('termD', 'terminalD', 82, 47), _D('c12', 63, 53), ['w_a12', 'ammo', 64, 48], ['w_sh6', 'shells', 82, 54], ['w_cure3', 'inj_cure', 70, 54], ['w_ig5', 'inj_green', 63, 47], ['w_smg4', 'smg', 78, 54], ['w_yel', 'inj_yellow', 66, 54],
    ['w_a13', 'ammo', 50, 60], ['w_sh7', 'shells', 48, 64], ['w_smg5', 'smg', 50, 66], ['w_ig6', 'inj_green', 88, 60], ['w_ib1', 'inj_blue', 44, 58], ['w_a14', 'ammo', 88, 65], ['s_mat_ss1','screw_small',16,25,{amount:5}], ['s_mat_ps1','powder_small',21,15,{amount:5}], ['s_mat_sg1','screw_large',62,37,{amount:2}], ['s_mat_pg1','powder_large',63,36,{amount:2}], ['s_mat_ss2','screw_small',46,59,{amount:4}], ['s_mat_ps2','powder_small',48,59,{amount:4}], ['s_mat_sg2','screw_large',78,54,{amount:2}], ['s_mat_pg2','powder_large',81,54,{amount:2}], ['s_mat_ss3','screw_small',32,43,{amount:3}], ['s_mat_ps3','powder_small',35,43,{amount:3}]
  ],
  enemies: [
    [201, 'rata', 17, 7], [202, 'rata', 19, 8],
    [203, 'escupidor', 29, 12], [204, 'rata', 24, 8], [205, 'rata', 33, 10], [206, 'rata', 25, 12], [207, 'fundido', 30, 5],
    [208, 'rata', 42, 8], [209, 'rata', 45, 8],
    [210, 'fundido', 56, 8], [211, 'fundido', 60, 10], [212, 'escupidor', 53, 7], [213, 'escupidor', 62, 13], [214, 'rata', 54, 6], [215, 'rata', 58, 12], [216, 'rata', 52, 13], [217, 'rata', 63, 9],
    [218, 'rata', 69, 9], [219, 'rata', 70, 9],
    [220, 'escupidor', 78, 9], [221, 'aullador', 80, 8], [222, 'fundido', 76, 8], [223, 'bruto', 82, 10], [224, 'rata', 79, 6],
    [225, 'rata', 28, 19], [226, 'rata', 28, 22],
    [227, 'rata', 20, 27], [228, 'rata', 30, 25], [229, 'escupidor', 40, 25], [230, 'escupidor', 46, 33], [231, 'fundido', 24, 32], [232, 'trepador', 37, 26], [233, 'trepador', 14, 31], [234, 'rata', 50, 25], [235, 'rata', 28, 33],
    [236, 'rata', 58, 29],
    [237, 'fundido', 65, 25], [238, 'fundido', 72, 30], [239, 'fundido', 68, 35], [240, 'escupidor', 74, 26], [241, 'escupidor', 64, 31], [242, 'aullador', 70, 24], [243, 'bruto', 76, 32], [244, 'rata', 67, 28], [245, 'rata', 70, 33], [246, 'rata', 73, 36], [247, 'rata', 63, 30],
    [248, 'rata', 31, 38], [249, 'rata', 31, 40],
    [250, 'escupidor', 26, 46], [251, 'rata', 24, 48], [252, 'rata', 34, 47], [253, 'rata', 37, 45], [254, 'trepador', 30, 49], [255, 'bruto', 36, 50],
    [256, 'rata', 43, 46],
    [257, 'fundido', 50, 46], [258, 'rata', 48, 44], [259, 'rata', 52, 48], [260, 'rata', 55, 49], [261, 'escupidor', 47, 49],
    [262, 'rata', 69, 43],
    [263, 'fundido', 67, 51], [264, 'fundido', 76, 51], [265, 'escupidor', 72, 48], [266, 'escupidor', 80, 52], [267, 'rata', 64, 50], [268, 'rata', 70, 53], [269, 'rata', 74, 53], [270, 'rata', 82, 49], [271, 'aullador', 70, 52]
  ],
  barrels: [[30, 13], [55, 12], [30, 26], [40, 32], [69, 24], [69, 35], [73, 51], [67, 51], [57, 63], [67, 63], [77, 63], [60, 60], [74, 60]]
};
Object.assign(DOCS, {
  c1: { title: 'Letrero de la compuerta', text: `SALA DE DESCARTES
ACCESO RESTRINGIDO.

Todo lo que cruce esta compuerta deja de ser responsabilidad del programa Riutex.
No se admiten preguntas. No se admiten visitas.` },
  c2: { title: 'Programa Esperanza: captación', text: `Captación de pacientes sin opciones médicas: ELA, Huntington, cáncer terminal, fibrosis.
Promesa: tratamiento experimental gratuito y confidencial.
Tasa de aceptación: 91 %.

Coordinadora de captación: Emily Hart.` },
  c3: { title: 'Nota de Emily al doctor', text: `Dr. Voss:

Ya son cuarenta y dos personas. Les dije que era una cura. Usted me dijo que lo era.
Hoy vi a la señora Beltrán después de la segunda dosis. Ya no me reconocía.
Necesito que me diga a dónde se llevan a los que "no responden".

— Emily` },
  c4: { title: 'Consentimiento informado', text: `El paciente acepta participar en un tratamiento experimental y renuncia a reclamar por cualquier efecto adverso.
Los sujetos sin respuesta terapéutica serán "trasladados a una instalación de cuidados".

(En el margen, a mano: "La instalación son las cloacas.")` },
  c5: { title: 'Diario del operario Ramos', text: `Llevo once años cuidando el foso. Don Aurelio, el dueño del asilo, tenía un cocodrilo ahí abajo: un animal viejo y tranquilo. Lo alimentaba con pollo.
Desde que tiran a los "descartes" por la compuerta, el cocodrilo cambió. Y los descartes también.
Anoche los oí juntos en el agua. No eran gritos de una sola voz.
El compuesto llama a lo que ya está vivo. No distingue si es un hombre o un animal.` },
  c6: { title: 'Planilla de purga', text: `Posición de las válvulas de purga (de la A a la D):
A: 2
B: 0
C: 3
D: 1

Cualquier otra combinación provoca sobrepresión y la compuerta de drenaje no abre.` },
  c7: { title: 'Procedimiento: compuerta D', text: `La compuerta D se abre con una clave de 3 cifras.
Cada cifra es el número de sujetos descartados en un turno, en este orden: mañana, tarde, noche.
Los partes de turno están repartidos por la instalación.` },
  c8: { title: 'Parte de descartes: mañana', text: `Sujetos descartados en el turno de mañana: 4.
Todos respondían a la voz. Ninguno a su nombre.` },
  c9: { title: 'Parte de descartes: tarde', text: `Sujetos descartados en el turno de tarde: 1.
La paciente pidió que avisaran a su hija. No avisamos.` },
  c10: { title: 'Parte de descartes: noche', text: `Sujetos descartados en el turno de noche: 7.
Se oyó mucho ruido en el foso. Los operarios se niegan a bajar de noche.` },
  c11: { title: 'Registro del primer descarte', text: `Primer descarte del programa: 7 de marzo.
El operario Ramos guardó su equipo en el casillero del taller. Dijo que usaría esa fecha como combinación: día y mes, cuatro cifras.` },
  c12: { title: 'Transcripción: grabación de Voss', text: `...Emily es mi mejor reclutadora y mi mejor sujeto. Su sangre reacciona al compuesto sin dosis. La dejé abajo, en observación. Ella cree que la cura sigue en pie.
Si Wilson llega hasta aquí, ya sabrá quién envió la foto. Eso me conviene: los sujetos motivados rinden más...` },
  c13: { title: 'Carta de Emily (sin enviar)', text: `I.:

Sí, trabajé para él. Yo conseguí a esas personas. Creí que las curaba.
Cuando vi lo que hacían con ellas, mandé la foto. Fue lo único que pude hacer sin que me detuvieran.
Sabía que vendrías. Siempre vienes.
Perdóname por no habértelo dicho antes.

— E.` },
  c14: { title: 'Lista de descartados (fragmento)', text: `Beltrán, M. (ELA). Ortiz, J. (Huntington). Salazar, R. (cáncer)... más de ciento diez nombres.

Anotado al final: "El Caimán de Don Aurelio absorbe a los que caen al foso. Ya no queda cocodrilo. Queda otra cosa."` },
  c16: { title: 'Manual del tablero eléctrico', text: `El tablero del Canal central exige tres fusibles: A, B y C.
El A quedó en los tanques. El B, en el taller del operario. El C, en el dormitorio.
Sin los tres, la compuerta a la Galería no recibe corriente.` }
});
['c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c16'].forEach(i => CLUES.add(i));
Object.assign(PROP, {
  tank(c, x, y) { c.fillStyle = '#4a5a54'; c.fillRect(x, y, 32, 32); c.fillStyle = '#6a7a74'; c.fillRect(x + 2, y + 2, 10, 28); c.fillStyle = '#2a3430'; c.fillRect(x + 24, y, 8, 32); c.fillStyle = 'rgba(80,200,60,.25)'; c.fillRect(x + 14, y + 4, 8, 24); },
  pipe(c, x, y) { c.fillStyle = '#5a4a3a'; c.fillRect(x, y + 8, 32, 16); c.fillStyle = '#7a6a58'; c.fillRect(x, y + 8, 32, 4); c.fillStyle = '#2a2018'; c.fillRect(x + 14, y + 6, 4, 20); },
  sack(c, x, y) { c.fillStyle = '#6a5c44'; c.beginPath(); c.ellipse(x + 16, y + 18, 13, 11, 0, 0, 6.283); c.fill(); c.fillStyle = '#4a3e2c'; c.fillRect(x + 12, y + 5, 8, 5); },
  drum(c, x, y) { c.fillStyle = '#2a4a6a'; c.beginPath(); c.arc(x + 16, y + 16, 12, 0, 6.283); c.fill(); c.strokeStyle = '#1a2a3a'; c.lineWidth = 2; c.beginPath(); c.arc(x + 16, y + 16, 8, 0, 6.283); c.stroke(); }
});
Object.assign(DECO, {
  bones(c, x, y, v) { c.save(); c.translate(x + 16, y + 16); c.rotate(v); c.fillStyle = 'rgba(210,205,185,.8)'; c.fillRect(-9, -2, 18, 3); c.fillRect(-6, 4, 12, 2); c.fillRect(-2, -7, 3, 12); c.restore(); },
  slime(c, x, y) { c.fillStyle = 'rgba(80,160,50,.45)'; c.beginPath(); c.ellipse(x + 16, y + 17, 12, 7, 0, 0, 6.283); c.fill(); },
  grate(c, x, y) { c.fillStyle = 'rgba(20,24,22,.9)'; c.fillRect(x + 4, y + 4, 24, 24); c.fillStyle = '#4a4e4c'; for (let i = 0; i < 4; i++) c.fillRect(x + 6 + i * 6, y + 4, 2, 24); },
  skull(c, x, y) { c.fillStyle = 'rgba(220,214,196,.85)'; c.beginPath(); c.arc(x + 16, y + 15, 6, 0, 6.283); c.fill(); c.fillRect(x + 12, y + 19, 8, 4); c.fillStyle = '#111'; c.fillRect(x + 13, y + 13, 2, 3); c.fillRect(x + 17, y + 13, 2, 3); }
});
const SFURN = {
  pillar: [[20, 26], [36, 26], [48, 26], [20, 32], [36, 32], [48, 32], [66, 26], [73, 26], [66, 33], [73, 33], [66, 49], [72, 49], [78, 49], [66, 53], [78, 53], [25, 9], [32, 9]],
  tank: [[51, 4], [52, 4], [51, 5], [52, 5], [56, 4], [57, 4], [56, 5], [57, 5], [61, 4], [62, 4], [61, 5], [62, 5], [51, 11], [52, 11], [51, 12], [52, 12], [61, 11], [62, 11], [61, 12], [62, 12]],
  pipe: [[26, 2], [27, 2], [28, 2], [29, 2], [30, 2], [24, 42], [25, 42]],
  machine: [[23, 4], [24, 4], [33, 4], [34, 4], [75, 5], [76, 5], [77, 5], [80, 5], [81, 5], [82, 5]],
  drum: [[4, 10], [5, 10], [55, 9], [58, 9], [64, 28], [75, 28], [64, 52], [82, 50]],
  sack: [[13, 25], [14, 25], [15, 25], [40, 43], [41, 43], [57, 50]],
  crate: [[11, 10], [38, 43], [39, 43], [38, 49]],
  table: [[22, 44], [23, 44], [30, 44], [31, 44]],
  locker: [[19, 43], [19, 44], [56, 43], [56, 44]],
  bed: [[46, 43], [46, 45], [46, 47], [49, 43], [49, 45], [49, 47], [54, 43], [54, 45]],
  shelf: [[20, 42], [21, 42]]
};
const SDECOR = [['grate', 8, 6], ['slime', 15, 7], ['slime', 24, 10], ['grate', 29, 8], ['grate', 31, 13], ['slime', 40, 8], ['bones', 54, 10], ['slime', 60, 6], ['grate', 69, 9], ['bones', 78, 10], ['slime', 83, 9], ['slime', 28, 20], ['grate', 17, 25], ['bones', 22, 26], ['skull', 34, 26],
  ['slime', 47, 32], ['bones', 64, 24], ['bones', 70, 27], ['skull', 75, 34], ['bones', 66, 36], ['grate', 58, 29], ['bones', 31, 39], ['slime', 22, 45], ['skull', 36, 48], ['bones', 48, 45], ['slime', 53, 47], ['grate', 69, 41], ['bones', 64, 50], ['slime', 74, 52], ['skull', 80, 49], ['bones', 56, 64], ['bones', 70, 66], ['skull', 88, 63]];
Level.buildSewer = function () {
  this.W = 96; this.H = 68; this.wc = ['#1a2420', '#2b3a33', '#0c1210']; this.bricks = true; this.decor = SDECOR; this.bossZone = [46 * TILE, 58 * TILE, 90 * TILE, 68 * TILE];
  const g = this.grid = [], tn = this.tint = [], fl = this.fluid = []; for (let y = 0; y < this.H; y++) { g.push(new Array(this.W).fill(1)); tn.push(new Array(this.W).fill(null)); fl.push(new Array(this.W).fill(0)); }
  const c = (x, y, w, h, col) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { g[j][i] = 0; tn[j][i] = col; } };
  const F = (x, y, w, h, v) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) fl[j][i] = v; };
  const ST = { 'Compuerta': '#252c2a', 'Cámara de bombeo': '#262e2e', 'Tanques de residuos': '#2a2e26', 'Sala de máquinas': '#2a2a2e', 'Canal central': '#243028', 'Galería de descartes': '#2c2824', 'Taller del operario': '#2e2a24', 'Dormitorio de operarios': '#2d2a2a', 'Antecámara de descartes': '#282a2c', 'Foso del Caimán': '#222a24' };
  this.rooms = [['Compuerta', 3, 3, 10, 8], ['Túnel', 13, 6, 8, 3], ['Cámara de bombeo', 21, 2, 16, 14], ['Túnel', 37, 7, 12, 3], ['Tanques de residuos', 49, 2, 16, 14], ['Túnel', 65, 8, 8, 3], ['Sala de máquinas', 73, 3, 12, 12], ['Túnel', 27, 16, 3, 9],
    ['Canal central', 12, 25, 44, 9], ['Túnel', 56, 28, 6, 3], ['Galería de descartes', 62, 22, 16, 16], ['Túnel', 30, 34, 3, 8], ['Taller del operario', 18, 42, 24, 10], ['Túnel', 42, 45, 2, 3], ['Dormitorio de operarios', 44, 42, 14, 10],
    ['Túnel', 68, 38, 3, 8], ['Antecámara de descartes', 62, 46, 22, 10], ['Túnel', 72, 56, 3, 3], ['Foso del Caimán', 46, 59, 44, 8], ['Túnel', 90, 61, 5, 3]].map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
  this.rooms.forEach(r => c(r.x, r.y, r.w, r.h, ST[r.n] || '#232a27'));
  F(13, 6, 8, 3, 1); F(25, 7, 8, 5, 1); F(53, 7, 6, 3, 2); F(62, 8, 3, 3, 1); F(14, 27, 40, 1, 1); F(14, 28, 40, 3, 2); F(14, 31, 40, 1, 1); F(44, 27, 3, 5, 0); F(62, 29, 16, 3, 1); F(24, 47, 5, 3, 1); F(62, 50, 22, 2, 1);
  F(50, 61, 36, 5, 2); F(56, 62, 3, 3, 0); F(66, 62, 3, 3, 0); F(76, 62, 3, 3, 0); // foso tóxico con tres islas
  this.props = {}; for (const t in SFURN) for (const [x, y] of SFURN[t]) { g[y][x] = 4; this.props[x + ',' + y] = t; }
  this.doors = []; const D = (id, x, y, w, h, key) => { const d = { id, key, open: false, tiles: [] }; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { d.tiles.push([i, j]); g[j][i] = key ? 3 : 2; } this.doors.push(d); };
  D('drain', 27, 16, 3, 1, 'drain'); D('galeria', 56, 28, 1, 3, 'fuses'); D('taller', 30, 34, 3, 1, 'taller'); D('gateD', 72, 56, 3, 1, 'gateD'); D('exit2', 90, 61, 1, 3, 'acceso');
  this.decals = []; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const r of this.rooms) for (let i = 0; i < Math.ceil(r.w * r.h / 14); i++) this.decals.push({ x: (r.x + rnd() * r.w) * TILE, y: (r.y + rnd() * r.h) * TILE, r: 6 + rnd() * 14, c: rnd() < .5 ? 'rgba(40,70,30,.35)' : 'rgba(80,8,12,.3)' });
  this.lamps = this.rooms.filter(r => r.n !== 'Túnel').map(r => ({ x: (r.x + r.w / 2) * TILE, y: (r.y + r.h / 2) * TILE, r: Math.min(260, Math.max(r.w, r.h) * 15 + 30) }));
};
// Jefe 2: El Caimán Fundido. Se hunde (invulnerable), emerge bajo tu posición tras un aviso rojo y queda expuesto; en fase 2 invoca crías, escupe ácido y barre con la cola.
class Caiman extends Enemy {
  constructor(id, x, y) {
    super('vacio', x, y, id); this.def = { name: 'El Caimán Fundido', hp: 1400, speed: 100, dmg: 28, detect: 9999, range: 64, cooldown: 1.6, xp: 350, small: false };
    Object.assign(this, { hp: 1400, maxHp: 1400, r: 30, active: false, mode: 'surface', mt: 5, isBoss: true, tx: 0, ty: 0, sumCd: 10, tailCd: 4, spitCd: 6, warned: false });
  }
  hurt(dmg, angle, g) {
    if (this.dead) return; if (this.mode === 'dive' || this.mode === 'ambush') { if (!this.warned) { this.warned = true; UI.msg('Bajo el fango es invulnerable… espera a que emerja.', 2500); } return; }
    if (this.mode === 'stun') dmg *= 1.4; this.hp -= dmg; this.hitFlash = .08; this.active = true; g.sparks(this.x, this.y, 6, '#4a7a20'); Sound.play('enemyhit'); if (this.hp <= 0) this.die(g);
  }
  die(g) { this.dead = true; g.killed.add(this.id); g.player.xp += mutationXPReward(this.def, !!this.isBoss, g.mut); g.player.onKill(g); g.bodies.push({ x: this.x, y: this.y, a: this.face }); g.ring(this.x, this.y, 240, '#a0e060'); g.cam.shake = 18; g.pz.boss2 = true; g.bossDrops(); UI.msg('El Caimán Fundido se hunde para siempre. Algo brilla en el fango…', 7000); Sound.play('enemydie'); }
  update(dt, g) {
    if (this.dead || !this.active) return; const p = g.player, dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1, ph2 = this.hp < this.maxHp / 2, m = this.mode;
    this.t += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); this.mt -= dt; this.face = Math.atan2(dy, dx);
    if (ph2) { this.sumCd -= dt; this.spitCd -= dt; if (this.sumCd <= 0) { this.sumCd = 10; for (let i = 0; i < 3; i++) { const a = i * 2.09 + this.t, r = new Enemy('rata', this.x + Math.cos(a) * 50, this.y + Math.sin(a) * 50, 500 + i + Math.floor(g.t) * 3); r.alert = true; g.enemies.push(r); } UI.msg('¡Salen crías del fango!', 2500); } }
    if (m === 'stun') { if (this.mt <= 0) { this.mode = 'surface'; this.mt = 4; } return; }
    if (m === 'dive') { const sp = this.def.speed * 1.7 * dt; Level.move(this, dx / d * sp, dy / d * sp); if (this.mt <= 0) { this.mode = 'ambush'; this.mt = .8; this.tx = p.x; this.ty = p.y; } return; }
    if (m === 'ambush') {
      if (this.mt <= 0) { this.x = this.tx; this.y = this.ty; for (let k = 0; k < 30 && Level.blocked(this.x, this.y, this.r); k++) { this.x += (68 * TILE - this.x) * .06; this.y += (62 * TILE - this.y) * .06; }
        g.ring(this.x, this.y, 90, '#a0e060'); g.cam.shake = 14; Sound.play('enemydie'); if (Math.hypot(p.x - this.x, p.y - this.y) < 85) { p.hurt(40, this.face, g); p.addPoison(3); } this.mode = 'stun'; this.mt = 2.0; UI.msg('¡Emergió! Dispárale ahora.', 1800); } return;
    }
    if (m === 'bite') { if (this.mt <= 0) { if (d < this.def.range + 24) { p.hurt(this.def.dmg, this.face, g); p.addPoison(2); } this.cd = this.def.cooldown; this.mode = 'surface'; } return; }
    if (m === 'tail') { if (this.mt <= 0) { g.ring(this.x, this.y, 120, '#7ab040'); g.cam.shake = 10; if (d < 120) { p.hurt(20, this.face, g); p.addPoison(3); } this.mode = 'surface'; this.tailCd = 4.5; } return; }
    if (m === 'spit') { if (this.mt <= 0) { for (const o of [-.35, 0, .35]) g.eproj.push({ x: this.x, y: this.y, vx: Math.cos(this.face + o) * 240, vy: Math.sin(this.face + o) * 240, life: 2.2, dmg: 12, poison: 3 }); this.mode = 'surface'; this.spitCd = 6; Sound.play('attack'); } return; }
    this.cd -= dt; this.tailCd -= dt;
    if (this.mt <= 0) { this.mode = 'dive'; this.mt = 2.4; UI.msg('El Caimán se hunde en el fango…', 1800); return; }
    if (ph2 && this.spitCd <= 0 && d > 140) { this.mode = 'spit'; this.mt = .5; return; }
    if (ph2 && this.tailCd <= 0 && d < 130) { this.mode = 'tail'; this.mt = .5; return; }
    if (d < this.def.range && this.cd <= 0) { this.mode = 'bite'; this.mt = .4; return; }
    if (d > this.def.range * .8) { const sp = this.def.speed * (ph2 ? 1.25 : 1) * dt; Level.move(this, dx / d * sp, dy / d * sp); }
  }
  draw(ctx) {
    if (this.mode === 'ambush') { ctx.strokeStyle = 'rgba(255,60,60,.85)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(this.tx, this.ty, 85, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(this.tx, this.ty, 85 * Math.max(0, 1 - this.mt / .8), 0, 6.283); ctx.stroke(); }
    if (this.mode === 'dive' || this.mode === 'ambush') { ctx.strokeStyle = 'rgba(120,200,80,.6)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(this.x, this.y, 14 + ((this.t * 40 + i * 14) % 42), 0, 6.283); ctx.stroke(); } ctx.fillStyle = '#4a7a30'; ctx.fillRect(this.x - 5, this.y - 5, 10, 10); return; }
    ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(4, 6, 60, 26, this.face, 0, 6.283); ctx.fill();
    if (this.mode === 'tail') { ctx.strokeStyle = 'rgba(255,90,60,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 6.283); ctx.stroke(); }
    ctx.rotate(this.face); const col = this.hitFlash > 0 ? '#fff' : this.mode === 'stun' ? '#8a8aa8' : '#4a6a3a';
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(-28, 0, 30, 15, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.ellipse(-56, 0, 22, 9, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.ellipse(-76, 0, 12, 5, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 0, 30, 21, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#3a5a2c'; ctx.fillRect(-8, -30, 14, 9); ctx.fillRect(-8, 21, 14, 9);
    ctx.fillStyle = '#c8b8a8'; ctx.fillRect(-2, -34, 9, 4); ctx.fillRect(8, -18, 8, 4); ctx.fillRect(-14, 14, 8, 4); // brazos humanos fusionados
    const open = this.mode === 'bite' ? 12 : 4; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(22, -14); ctx.lineTo(70, -6 - open); ctx.lineTo(70, -2); ctx.lineTo(22, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(22, 14); ctx.lineTo(70, 6 + open); ctx.lineTo(70, 2); ctx.lineTo(22, 0); ctx.fill();
    ctx.fillStyle = '#e8e2d0'; for (let i = 0; i < 5; i++) { ctx.fillRect(34 + i * 7, -5 - open * .6, 2, 4); ctx.fillRect(34 + i * 7, 2 + open * .6, 2, 4); }
    ctx.fillStyle = '#e0d020'; ctx.fillRect(24, -12, 5, 4); ctx.fillRect(24, 8, 5, 4);
    ctx.restore();
  }
}
