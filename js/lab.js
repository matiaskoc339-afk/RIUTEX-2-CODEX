// PARTE 4: El laboratorio de Voss. Datos, props, documentos y los dos jefes finales: Lucía Voss y el Doctor Adrian Voss.
const Lab = {
  spawn: [7, 6], boss: [60, 47], boss2: [47, 63], crystals: [[53, 44], [66, 44], [59, 51]],
  items: [
    ['l_mat_ss1','screw_small',25,15,{amount:5}], ['l_mat_ps1','powder_small',28,17,{amount:5}], ['l_mat_sg1','screw_large',43,57,{amount:3}], ['l_mat_pg1','powder_large',46,57,{amount:3}], ['l_mat_ss2','screw_small',62,22,{amount:3}], ['l_mat_ps2','powder_small',63,22,{amount:3}], ['l_mat_sg2','screw_large',73,47,{amount:2}], ['l_mat_pg2','powder_large',76,47,{amount:2}],
    _F('caja_l1', 'caja', 9, 8), ['l_case2', 'case', 18, 58], _F('caja_l2', 'caja', 35, 10), _F('caja_l3', 'caja', 79, 62), _D('l1', 5, 4), ['l_a1', 'ammo', 11, 5], ['l_ig1', 'inj_green', 4, 8],
    _D('l2', 22, 12), _D('l4', 35, 3), _D('l3', 28, 13), _D('l11', 21, 5), ['l_sh1', 'shells', 22, 3], ['l_a2', 'ammo', 34, 12], ['l_ra1', 'rifleammo', 33, 13],
    _F('reactor_a', 'reactor_a', 53, 8), _F('reactor_b', 'reactor_b', 55, 8), _F('reactor_c', 'reactor_c', 57, 8), _D('l15', 48, 3), ['l_ig2', 'inj_green', 62, 3], ['l_a3', 'ammo', 62, 13],
    _D('l13', 14, 31), _D('l8', 45, 31), ['l_a4', 'ammo', 13, 26], ['l_sh2', 'shells', 54, 26], ['l_ra2', 'rifleammo', 20, 32], ['l_ib1', 'inj_blue', 54, 32], ['l_ig3', 'inj_green', 33, 32], ['l_smg2', 'smg', 44, 26],
    _K('lpa', 'pase_a', 42, 50), ['l_launcher', 'launcher', 22, 50], ['l_gr1', 'grenade', 24, 50], ['l_gr2', 'grenade', 40, 43], _D('l14', 35, 50), _F('cajaV', 'cajaV', 21, 43),
    _F('terminalB', 'terminalB', 70, 26), _D('l5', 66, 28), _D('l7', 75, 25), _D('l10', 65, 32), _D('l16', 76, 32), ['l_a5', 'ammo', 64, 26], ['l_ra3', 'rifleammo', 76, 23], ['l_ig4', 'inj_green', 73, 32],
    _K('lpb', 'pase_b', 78, 12), _D('l6', 65, 12), _D('l9', 72, 12), _D('l18', 70, 3), ['l_gr3', 'grenade', 66, 10], ['l_mp', 'mod_prec', 79, 3], ['l_a6', 'ammo', 78, 9], ['l_iy1', 'inj_yellow', 72, 9],
    ['l_ig5', 'inj_green', 51, 43], ['l_a7', 'ammo', 52, 52], ['l_ra4', 'rifleammo', 68, 43], ['l_gr4', 'grenade', 68, 52], ['l_sh3', 'shells', 51, 52], ['l_a8', 'ammo', 46, 47],
    _D('l17', 78, 45), _D('l19', 82, 41), _D('l21', 88, 45), ['l_ig6', 'inj_green', 90, 41], ['l_a9', 'ammo', 77, 50], ['l_gr5', 'grenade', 90, 50], ['l_modm', 'mod_mag', 84, 49],
    _D('l20', 80, 60), _D('l12', 88, 60), ['l_modr', 'mod_rate', 85, 65], ['l_ib2', 'inj_blue', 78, 66], ['l_iy2', 'inj_yellow', 90, 66], ['l_ra5', 'rifleammo', 80, 66], ['l_a10', 'ammo', 90, 60],
    ['l_ig7', 'inj_green', 65, 62], ['l_sh4', 'shells', 68, 62],
    ['l_a11', 'ammo', 38, 58], ['l_ra6', 'rifleammo', 57, 58], ['l_gr6', 'grenade', 38, 68], ['l_ig8', 'inj_green', 57, 68], ['l_ig9', 'inj_green', 38, 62], ['l_ib3', 'inj_blue', 47, 65], ['l_modp', 'mod_pow', 57, 63],
    _F('emily', 'emily', 28, 63)
  ],
  enemies: [
    [601, 'prototipo', 24, 9], [602, 'artillero', 33, 4], [603, 'torreta', 36, 3], [604, 'espectro', 29, 10], [605, 'prototipo', 42, 8],
    [606, 'regenerador', 52, 7], [607, 'artillero', 60, 9], [608, 'espectro', 55, 13], [609, 'prototipo', 50, 9], [610, 'torreta', 62, 6], [611, 'espectro', 28, 20],
    [612, 'prototipo', 20, 29], [613, 'prototipo', 30, 26], [614, 'artillero', 40, 29], [615, 'regenerador', 48, 30], [616, 'espectro', 36, 32], [617, 'abominacion', 24, 29], [618, 'artillero', 50, 28], [619, 'prototipo', 14, 29],
    [620, 'prototipo', 31, 38], [621, 'abominacion', 30, 44], [622, 'regenerador', 38, 48], [623, 'artillero', 28, 50], [624, 'espectro', 34, 44], [625, 'prototipo', 40, 46], [626, 'espectro', 58, 29],
    [627, 'artillero', 66, 24], [628, 'prototipo', 74, 30], [629, 'regenerador', 69, 28], [630, 'espectro', 72, 26], [631, 'torreta', 62, 27], [632, 'prototipo', 71, 18],
    [633, 'artillero', 68, 9], [634, 'regenerador', 75, 8], [635, 'espectro', 66, 8], [636, 'abominacion', 73, 10], [637, 'torreta', 79, 11],
    [638, 'prototipo', 80, 44], [639, 'espectro', 86, 46], [640, 'artillero', 84, 42], [641, 'regenerador', 82, 49], [642, 'prototipo', 89, 44],
    [643, 'abominacion', 84, 62], [644, 'artillero', 79, 64], [645, 'espectro', 88, 63], [646, 'prototipo', 82, 60], [647, 'prototipo', 68, 62], [648, 'espectro', 63, 62]
  ],
  barrels: [[24, 8], [34, 29], [48, 29], [30, 47], [58, 44], [62, 52], [46, 58], [50, 66], [40, 63], [56, 63]]
};
Object.assign(DOCS, {
  l1: { title: 'Cartel del laboratorio', text: `LABORATORIO CENTRAL · PROYECTO RIUTEX
Nivel de bioseguridad máximo.

"La muerte no es una ley. Es un problema técnico." — Dr. A. Voss` },
  l2: { title: 'Aviso: sueros y versiones', text: `V1: compatibilidad limitada.
V2 a V5: inestables.
Riutex-Y: el estabilizado.
Riutex-Ω ("Perfecto"): aún en desarrollo. Solo el Dr. Voss tiene acceso a la fórmula.` },
  l3: { title: 'Receta del suero estabilizador', text: `Mezcla en la Sala de cultivos (tres reactivos, en ml):
Reactivo A: 3
Reactivo B: 7
Reactivo C: 1

Cualquier otra proporción contamina el cultivo y bloquea el ala de experimentos.` },
  l4: { title: 'Diario del Dr. Voss · I', text: `Mi hija Lucía tenía siete años cuando le diagnosticaron la enfermedad. Los médicos dijeron que no había cura.
Yo era el mejor genetista del país y no pude hacer nada. Así que me prometí que encontraría la cura, costara lo que costara.
Fundé el programa. Compré el asilo. Todo por ella.` },
  l5: { title: 'Acta de defunción: Lucía Voss', text: `Fallecida el 14 de octubre de 2017.
Causa: complicaciones de su enfermedad.
Observación del padre, escrita a mano: "Llegué tres horas tarde. Estaba en el laboratorio cuando pasó."` },
  l6: { title: 'Acta de fundación del programa', text: `El programa Riutex se fundó en 2019, dos años después del fallecimiento de la hija del director.
Financiación privada. Sin supervisión externa.` },
  l7: { title: 'Procedimiento de bioseguridad', text: `El terminal de bioseguridad se desbloquea con una clave de 4 cifras: el AÑO en que murió la hija del director.
(Nota: no confundir con el año de fundación del programa.)` },
  l8: { title: 'Diario del Dr. Voss · II', text: `Después de que Lucía murió me hundí. Dejé de dormir. Dejé de comer.
Una noche me inyecté la primera dosis de suero, sin pensar. Y el dolor se fue. Por primera vez en meses pude respirar.
Quise volver a sentir eso. Lo hice otra vez. Y otra. Ya no sé cuándo empezó a ser algo que necesito, y no algo que decido.` },
  l9: { title: 'Diario del Dr. Voss · III', text: `He soñado con ella. Me dijo que tenía frío.
El compuesto perfecto traerá de vuelta lo que se perdió. Lo sé. Lo siento en cada vena.
Los demás sujetos fueron borradores. Solo necesitaba afinar la fórmula.` },
  l10: { title: 'Dibujo de Lucía', text: `Un dibujo infantil: una niña, un hombre de bata y un sol enorme. Debajo, con letra torpe:

"Para mi papá. Mi cumpleaños es el 3 de mayo. No llegues tarde."` },
  l11: { title: 'Nota del Dr. Voss', text: `Mi caja privada de Cirugía usa como combinación el cumpleaños de Lucía: mes y día, cuatro cifras. Es lo único que nadie del equipo sabe.` },
  l12: { title: 'Carta final de Emily', text: `I.:

Si estás leyendo esto, ya sabes todo: lo que hice, lo que te inyecté, lo que Voss es.
Cuando me encerraron aquí pensé en ti cada noche. Si sales de esto, no mires atrás.
Y si no salgo yo, quiero que sepas que lo único real en todo este infierno fuiste tú.

— E.` },
  l13: { title: 'Informe de la Dra. Park', text: `Los Prototipos Delta son versiones simplificadas del Sargento Varga: sin el corazón de metal, pero con las mejoras del suero. Más baratos, más rápidos y reemplazables.
Los Espectros se camuflan; los Regeneradores se curan si no se les ataca; las Abominaciones son la versión pesada.` },
  l14: { title: 'Diario del Dr. Okafor', text: `Llevo tres noches escondido en el quirófano. Oí los gritos de la Perrera y supe que el programa se había acabado.
Voss no me dejó salir. Dijo que mi trabajo no estaba terminado.
Si alguien encuentra esto: no confíen en el hombre que lloraba por su hija. Ya no queda nada de él.` },
  l15: { title: 'Nota de la técnica Marta', text: `Último turno. Mis hijos esperan en casa y no puedo llamarlos: aquí no hay señal.
Los cultivos de la Sala 3 se mueven solos. Juraría que respiran.
Mañana renuncio. Que busquen a otra.` },
  l16: { title: 'Protocolo Resurrección', text: `Sujeto: L. Voss (fallecida en 2017, cuerpo conservado).
Se aplicó suero Ω en dosis creciente.
Resultado: actividad neuronal parcial, crecimiento anómalo, reacción a la voz del padre.
Nota del Dr. Voss: "Está volviendo. Solo hay que darle más tiempo."` },
  l17: { title: 'Nota de Emily sobre Lucía', text: `Voss me llevó a ver a su hija. La tenía en una cámara, entre flores de cristal.
Me prometió que si lo ayudaba, nadie más moriría. Le creí.
Esa noche supe que a Lucía no la estaba salvando: la estaba usando de ancla para no sentirse solo.` },
  l18: { title: 'Grabación de Voss', text: `...Y entonces Wilson llegará. Todo lo que hizo Emily durante años lo hizo posible. Su sangre lleva meses aprendiendo lo que yo solo puedo imitar.
Si el suero perfecto necesita un recipiente, ese recipiente es él. Pero también me sirve como espejo: veré qué pasa cuando un cuerpo lo acepta sin romperse.` },
  l19: { title: 'Pared de recuerdos', text: `Decenas de fotografías clavadas en la pared: una niña en un columpio, una niña con tarta, una niña dormida.
En todas, un hombre de bata la sostiene como si pudiera desaparecer en cualquier momento.` },
  l20: { title: 'Último diario del Dr. Voss', text: `Hoy sentí que ya no había vuelta. El suero me llama más fuerte que ella.
A veces me pregunto si lo hago por Lucía o por mí. Prefiero no responder.
Mañana me inyectaré la dosis perfecta. Si funciona, ella volverá. Y si no, al menos dejaré de sentir.` },
  l21: { title: 'Carta de Lucía (de niña)', text: `Papá:
Ven a verme. Ya no me duele nada, pero estoy sola.
No te enfades con los doctores. Ellos hicieron lo que pudieron.
Te quiero mucho.

— Lucía` }
});
['l3', 'l5', 'l6', 'l7', 'l10', 'l11'].forEach(i => CLUES.add(i));
const EMILY_DOCS = ['c3', 'c12', 'c13', 'b12', 'b13', 'l12', 'l17'];
Object.assign(PROP, {});
Object.assign(DECO, {
  flower(c, x, y, v) { const k = ['#d080c0', '#a0a0ff', '#e0e0ff']; for (let i = 0; i < 4; i++) { c.fillStyle = k[(i + Math.floor(v * 3)) % 3]; c.beginPath(); c.arc(x + 6 + (i * 9) % 22, y + 8 + (i * 7) % 18, 3, 0, 6.283); c.fill(); } },
  drawing(c, x, y) { c.save(); c.translate(x + 16, y + 16); c.rotate(.2); c.fillStyle = '#e8e0c8'; c.fillRect(-7, -9, 14, 18); c.fillStyle = '#d06060'; c.fillRect(-4, -5, 4, 4); c.fillStyle = '#60a0d0'; c.fillRect(1, 0, 4, 5); c.restore(); }
});
const LFURN = {
  desk: [[26, 5], [27, 5], [30, 5], [31, 5]], machine: [[66, 4], [67, 4], [66, 6], [67, 6], [76, 4], [77, 4], [76, 6], [77, 6]],
  tank: [[49, 4], [50, 4], [49, 5], [50, 5], [54, 4], [55, 4], [54, 5], [55, 5], [59, 4], [60, 4], [59, 5], [60, 5], [49, 11], [50, 11], [49, 12], [50, 12], [59, 11], [60, 11], [59, 12], [60, 12]],
  bars: [[14, 27], [15, 27], [16, 27], [19, 27], [20, 27], [21, 27], [34, 27], [35, 27], [36, 27], [39, 27], [40, 27], [41, 27], [44, 27], [45, 27], [46, 27], [49, 27], [50, 27], [51, 27]],
  pillar: [[24, 31], [40, 31], [55, 46], [65, 46], [55, 50], [65, 50], [42, 60], [53, 60], [42, 66], [53, 66]],
  table: [[24, 45], [25, 45], [24, 46], [25, 46], [36, 45], [37, 45], [36, 46], [37, 46]],
  shelf: [[63, 23], [64, 23], [65, 23], [70, 23], [71, 23], [72, 23], [63, 31], [64, 31], [71, 31], [72, 31]],
  locker: [[4, 10], [5, 10], [77, 59], [78, 59]], crate: [[11, 10], [35, 14], [36, 14]],
  bench: [[25, 10], [26, 10], [31, 10], [32, 10], [78, 42], [79, 42], [88, 42], [89, 42]]
};
const LDECOR = [['paper', 6, 7], ['glass', 24, 6], ['paper', 29, 8], ['glass', 44, 8], ['paper', 52, 10], ['bones', 56, 6], ['glass', 28, 20], ['paper', 18, 29], ['glass', 32, 30], ['bones', 52, 29], ['paper', 30, 40], ['glass', 28, 47], ['paper', 60, 29], ['glass', 68, 26], ['paper', 72, 28], ['glass', 70, 17], ['paper', 70, 8], ['glass', 74, 5],
  ['flower', 52, 43], ['flower', 57, 44], ['flower', 62, 45], ['flower', 67, 48], ['flower', 53, 49], ['flower', 60, 52], ['flower', 64, 43], ['drawing', 58, 47], ['flower', 82, 59], ['drawing', 86, 62], ['paper', 80, 43], ['paper', 86, 49], ['glass', 90, 47], ['hazard', 40, 58], ['hazard', 40, 59], ['hazard', 50, 58], ['glass', 46, 60], ['bones', 48, 65], ['drawing', 26, 62]];
Level.buildLab = function () {
  this.W = 100; this.H = 72; this.wc = ['#1a2a30', '#2c4048', '#0c1418']; this.bricks = false; this.decor = LDECOR; this.bossZone = [50 * TILE, 42 * TILE, 70 * TILE, 54 * TILE]; this.bossZone2 = [36 * TILE, 56 * TILE, 60 * TILE, 70 * TILE];
  const g = this.grid = [], tn = this.tint = [], fl = this.fluid = []; for (let y = 0; y < this.H; y++) { g.push(new Array(this.W).fill(1)); tn.push(new Array(this.W).fill(null)); fl.push(new Array(this.W).fill(0)); }
  const c = (x, y, w, h, col) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { g[j][i] = 0; tn[j][i] = col; } };
  const LT = { 'Vestíbulo': '#2a3236', 'Recepción de investigación': '#2e383c', 'Sala de cultivos': '#243a34', 'Ala de experimentos': '#2a3034', 'Quirófano': '#2c3a3a', 'Biblioteca': '#302e2a', 'Sala de servidores': '#222a34', 'Cámara de Lucía': '#3a2c38', 'Galería de recuerdos': '#322c30', 'Laboratorio privado': '#2e2a2a', 'Sala del Suero': '#2a2232', 'Celda de observación': '#2c3030', 'Calle': '#1c1e22' };
  this.rooms = [['Vestíbulo', 3, 3, 10, 8], ['Pasillo', 13, 6, 8, 3], ['Recepción de investigación', 21, 2, 16, 14], ['Pasillo', 37, 7, 10, 3], ['Sala de cultivos', 47, 2, 16, 14], ['Pasillo', 27, 16, 3, 9], ['Ala de experimentos', 12, 25, 44, 9],
    ['Pasillo', 30, 34, 3, 8], ['Quirófano', 20, 42, 24, 10], ['Pasillo', 56, 28, 6, 3], ['Biblioteca', 62, 22, 16, 12], ['Pasillo', 70, 14, 3, 8], ['Sala de servidores', 64, 2, 16, 12], ['Pasillo', 44, 46, 6, 3], ['Cámara de Lucía', 50, 42, 20, 12],
    ['Pasillo', 70, 47, 6, 3], ['Galería de recuerdos', 76, 40, 16, 12], ['Pasillo', 84, 52, 3, 6], ['Laboratorio privado', 76, 58, 16, 10], ['Pasillo', 60, 61, 16, 3], ['Sala del Suero', 36, 56, 24, 14], ['Celda de observación', 22, 60, 12, 8],
    ['Pasillo', 34, 62, 2, 3], ['Pasillo', 12, 63, 10, 3], ['Calle', 3, 60, 9, 9]].map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
  this.rooms.forEach(r => c(r.x, r.y, r.w, r.h, LT[r.n] || '#2a3034'));
  this.props = {}; for (const t in LFURN) for (const [x, y] of LFURN[t]) { g[y][x] = 4; this.props[x + ',' + y] = t; }
  this.doors = []; const D = (id, x, y, w, h, key) => { const d = { id, key, open: false, tiles: [] }; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { d.tiles.push([i, j]); g[j][i] = key ? 3 : 2; } this.doors.push(d); };
  D('ward', 27, 16, 3, 1, 'reactor'); D('servers', 70, 14, 3, 1, 'bioT'); D('lucia', 44, 46, 1, 3, 'lucia'); D('lucia_out', 70, 47, 1, 3, 'boss4'); D('voss', 60, 61, 1, 3, 'llave_voss'); D('celda', 34, 62, 1, 3, 'boss5'); D('calle', 12, 63, 1, 3, 'emily');
  this.decals = []; let s = 31; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const r of this.rooms) for (let i = 0; i < Math.ceil(r.w * r.h / 16); i++) this.decals.push({ x: (r.x + rnd() * r.w) * TILE, y: (r.y + rnd() * r.h) * TILE, r: 6 + rnd() * 14, c: rnd() < .6 ? 'rgba(80,8,12,.3)' : 'rgba(110,60,170,.25)' });
  this.lamps = this.rooms.filter(r => r.n !== 'Pasillo').map(r => ({ x: (r.x + r.w / 2) * TILE, y: (r.y + r.h / 2) * TILE, r: Math.min(270, Math.max(r.w, r.h) * 16 + 40) }));
};
// Jefe: Lucía Voss. Un escudo de suero la protege; al destruir un cristal (dispárales) queda expuesta 7 s. Teletransporte, ráfagas radiales y llanto de área.
class Lucia extends Enemy {
  constructor(id, x, y) {
    super('vacio', x, y, id); this.def = { name: 'Lucía Voss', hp: 1600, speed: 0, dmg: 14, detect: 9999, range: 0, cooldown: 3, xp: 700, small: false };
    Object.assign(this, { hp: 1600, maxHp: 1600, r: 16, active: false, isBoss: true, vuln: 0, atkCd: 2, blinkCd: 4, ringCd: 6, summonCd: 11, warned: false, ringWind: 0,
      intro: ['Entre flores de cristal flota una niña. Sus ojos son dos pozos violeta.', 'Lucía: "Papá dijo que vendrías. Dijo que ibas a jugar conmigo."', 'Issac: "…No quiero hacerte daño."', 'Lucía: "Papá dice que los que se van no vuelven. Yo sí volví."'] });
  }
  hurt(dmg, angle, g, pierce) {
    if (this.dead) return; this.active = true; if (this.vuln <= 0) { if (!this.warned) { this.warned = true; UI.msg('Un escudo de suero la protege: destruye los cristales para bajarlo.', 5000); } dmg *= .04; }
    this.hp -= dmg; this.hitFlash = .06; g.sparks(this.x, this.y, 5, '#b080ff'); Sound.play('enemyhit'); if (this.hp <= 0) this.die(g);
  }
  die(g) { this.dead = true; g.killed.add(this.id); g.player.xp += mutationXPReward(this.def, !!this.isBoss, g.mut); g.player.onKill(g); g.bodies.push({ x: this.x, y: this.y, a: 0 }); g.ring(this.x, this.y, 260, '#c080ff'); g.cam.shake = 16; g.pz.boss4 = true; Level.openDoor(Level.doors.find(d => d.id === 'lucia_out')); g.bossDrops(this); UI.msg('Lucía sonríe, por fin en calma. "Dile a papá que ya no tengo frío." Se abre el camino al fondo.', 8000); Sound.play('enemydie'); }
  update(dt, g) {
    if (this.dead || !this.active) return; const p = g.player, ph2 = this.hp < this.maxHp / 2; this.t += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); this.vuln = Math.max(0, this.vuln - dt); this.face = Math.atan2(p.y - this.y, p.x - this.x);
    this.atkCd -= dt; this.blinkCd -= dt; this.ringCd -= dt; if (ph2) this.summonCd -= dt;
    if (this.ringWind > 0) { this.ringWind -= dt; if (this.ringWind <= 0) { g.ring(this.x, this.y, 205, '#c080ff'); g.cam.shake = 8; if (Math.hypot(p.x - this.x, p.y - this.y) < 205) p.hurt(22, this.face, g); } return; }
    if (this.blinkCd <= 0) { const z = Level.bossZone; for (let k = 0; k < 25; k++) { const nx = z[0] + 80 + Math.random() * (z[2] - z[0] - 160), ny = z[1] + 80 + Math.random() * (z[3] - z[1] - 160); if (!Level.blocked(nx, ny, this.r + 4) && Math.hypot(nx - p.x, ny - p.y) > 130) { g.ring(this.x, this.y, 40, '#c080ff'); this.x = nx; this.y = ny; g.ring(nx, ny, 40, '#c080ff'); break; } } this.blinkCd = ph2 ? 2.8 : 4; return; }
    if (this.atkCd <= 0) { const n = ph2 ? 14 : 10; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + this.t; g.eproj.push({ x: this.x, y: this.y, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, life: 3, dmg: 10, poison: 0, bullet: true }); } this.atkCd = ph2 ? 1.7 : 2.4; Sound.play('attack'); }
    if (this.ringCd <= 0) { this.ringWind = .65; this.ringCd = ph2 ? 4 : 6.5; }
    if (ph2 && this.summonCd <= 0) { this.summonCd = 16; for (let i = 0; i < 2; i++) { const e = new Enemy('espectro', this.x + (i ? 40 : -40), this.y + 30, 800 + i + Math.floor(g.t)); e.alert = true; g.enemies.push(e); } UI.msg('Lucía llama a sus "amigos".', 2000); }
  }
  draw(ctx) {
    const by = Math.sin(this.t * 2) * 4; ctx.save(); ctx.translate(this.x, this.y + by); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 22 - by, 14, 6, 0, 0, 6.283); ctx.fill();
    if (this.ringWind > 0) { ctx.strokeStyle = 'rgba(200,120,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -by, 205 * (1 - this.ringWind / .65), 0, 6.283); ctx.stroke(); }
    ctx.fillStyle = 'rgba(160,90,255,.18)'; ctx.beginPath(); ctx.arc(0, 0, 26 + Math.sin(this.t * 4) * 3, 0, 6.283); ctx.fill();
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#e8e0f0'; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.lineTo(13, 22); ctx.lineTo(-13, 22); ctx.fill();   // vestido
    ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(0, -8, 10, 0, 6.283); ctx.fill(); ctx.fillRect(-10, -8, 6, 24); ctx.fillRect(4, -8, 6, 24);                       // pelo largo
    ctx.fillStyle = '#e8d0c0'; ctx.beginPath(); ctx.arc(0, -6, 7, 0, 6.283); ctx.fill(); ctx.fillStyle = '#9a40ff'; ctx.fillRect(-4, -8, 3, 3); ctx.fillRect(1, -8, 3, 3);   // cara y ojos
    for (let i = 0; i < 3; i++) { const a = this.t * 1.5 + i * 2.09; ctx.fillStyle = '#c090ff'; ctx.fillRect(Math.cos(a) * 30 - 3, Math.sin(a) * 30 - 3, 6, 6); }
    if (this.vuln <= 0) { ctx.strokeStyle = 'rgba(120,220,255,' + (.5 + Math.sin(this.t * 6) * .2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 1.047; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 34, Math.sin(a) * 34); } ctx.closePath(); ctx.stroke(); }
    ctx.restore();
  }
}
// Jefe final: Doctor Adrian Voss (Riutex perfecto). Fase 1: humano con dispositivos (ráfagas, gas, esquiva). Fase 2: mutado (ataques de Varga). Fase 3: gigante; el suelo se desmorona en ácido.
class Voss extends Varga {
  constructor(id, x, y) {
    super(id, x, y); this.def = { name: 'Doctor Adrian Voss', hp: 3200, speed: 130, dmg: 34, detect: 9999, range: 56, cooldown: 1.0, xp: 1200, small: false };
    Object.assign(this, { hp: 3200, maxHp: 3200, ph: 1, r: 16, gasCd: 5, shotCd: 1.5, blinkCd: 3, summonCd: 12, shardCd: 6, cR: 14, lastR: 0, slamCd: 3, slamWind: 0, gasWind: 0, gx: 0, gy: 0, shots: 0, shotT: 0,
      intro: ['Una sala circular. En el centro, una cápsula vacía… y un hombre de bata blanca de espaldas.', 'Voss: "Llegaste, Wilson. Mi mejor sujeto. Mi mayor error."', 'Voss: "Todo esto fue por ella. Por Lucía. Llegué tarde. Siempre llegué tarde."', 'Voss: "La primera vez que me inyecté el suero, el dolor se fue. Por primera vez dejé de sentirme culpable."', 'Voss: "Ya no es una cura. Es lo único que me hace sentir vivo. Y esta dosis… es la perfecta."', '(Voss se clava la jeringa en el cuello. Sus venas se iluminan de violeta y la sala tiembla.)', 'Voss: "Voy a traerla de vuelta. Tú serás el último paso."'] });
  }
  phase() { const f = this.hp / this.maxHp; return f > .66 ? 1 : f > .33 ? 2 : 3; }
  hurt(dmg, angle, g, pierce) {
    if (this.dead) return; this.active = true; const ph = this.phase(), k = ph === 1 ? 1 : ph === 2 ? (this.mode === 'expose' ? 1.8 : .55) : .85;
    this.hp -= dmg * k; this.hitFlash = .06; g.sparks(this.x, this.y, 6, '#a060ff'); Sound.play('enemyhit'); if (this.hp <= 0) return this.die(g); const np = this.phase(); if (np !== this.ph) this.transform(np, g);
  }
  transform(np, g) {
    this.ph = np; g.cam.shake = 16; g.ring(this.x, this.y, 260, '#c060ff'); this.mode = 'chase'; this.mt = 0;
    if (np === 2) { UI.msg('Voss: "¡Más! ¡El suero pide más!" Su carne se abre: extremidades orgánicas.', 5000); this.r = 18; this.def.speed = 150; }
    else { UI.msg('EVOLUCIÓN PERFECTA. El laboratorio empieza a colapsar: el suelo se disuelve en ácido.', 6500); this.r = 34; this.def.speed = 72; this.def.dmg = 40; this.collapse(14); }
  }
  collapse(R) { const f = Level.fluid; if (!f) return; for (let y = 56; y <= 69; y++) for (let x = 36; x <= 59; x++) if (Level.grid[y][x] === 0 && Math.hypot(x + .5 - 47.5, y + .5 - 62.5) > R) f[y][x] = 2; }
  die(g) {
    this.dead = true; g.killed.add(this.id); g.player.xp += mutationXPReward(this.def, !!this.isBoss, g.mut); g.player.onKill(g); g.bodies.push({ x: this.x, y: this.y, a: this.face }); g.ring(this.x, this.y, 320, '#e080ff'); g.cam.shake = 20; g.pz.boss5 = true;
    for (let y = 56; y <= 69; y++) for (let x = 36; x <= 59; x++) if (Level.fluid) Level.fluid[y][x] = 0; Level.openDoor(Level.doors.find(d => d.id === 'celda')); g.eproj = []; g.pools = [];
    UI.msg('Voss cae de rodillas: "Lucía… ya voy…". Se abre la celda de observación, al oeste.', 9000); Sound.play('enemydie');
  }
  update(dt, g) {
    if (this.dead || !this.active) return; if (this.ph === 2) return super.update(dt, g); // fase mutada: cuchilla, cargas, látigo y pulso
    const p = g.player, dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1, sp = this.def.speed * dt; this.t += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); this.face = Math.atan2(dy, dx);
    if (this.ph === 1) {
      this.shotCd -= dt; this.gasCd -= dt; this.blinkCd -= dt;
      if (this.gasWind > 0) { this.gasWind -= dt; if (this.gasWind <= 0) { g.pools.push({ x: this.gx, y: this.gy, r: 64, life: 7 }); g.ring(this.gx, this.gy, 64, '#60e040'); } }
      if (this.shots > 0) { this.shotT -= dt; if (this.shotT <= 0) { const a = this.face + (Math.random() - .5) * .14; g.eproj.push({ x: this.x, y: this.y, vx: Math.cos(a) * 450, vy: Math.sin(a) * 450, life: 2, dmg: 10, poison: 0, bullet: true }); this.shots--; this.shotT = .11; Sound.play('attack'); } return; }
      if (d < 130 && this.blinkCd <= 0) { for (let k = 0; k < 12; k++) { const nx = this.x - dx / d * 190 + (Math.random() - .5) * 120, ny = this.y - dy / d * 190 + (Math.random() - .5) * 120; if (!Level.blocked(nx, ny, this.r + 3)) { g.ring(this.x, this.y, 36, '#c080ff'); this.x = nx; this.y = ny; break; } } this.blinkCd = 2.8; return; }
      if (this.gasCd <= 0) { this.gx = p.x; this.gy = p.y; this.gasWind = 1; this.gasCd = 5.5; }
      if (this.shotCd <= 0) { this.shots = 6; this.shotT = 0; this.shotCd = 1.7; }
      if (d < 190) Level.move(this, -dx / d * sp * .8, -dy / d * sp * .8); else if (d > 320) Level.move(this, dx / d * sp * .8, dy / d * sp * .8);
    } else {
      this.slamCd -= dt; this.summonCd -= dt; this.shardCd -= dt; this.cR = Math.max(7, this.cR - dt * .26); const q = Math.floor(this.cR * 2); if (q !== this.lastR) { this.lastR = q; this.collapse(this.cR); }
      if (this.slamWind > 0) { this.slamWind -= dt; if (this.slamWind <= 0) { g.ring(this.x, this.y, 250, '#ff60a0'); g.cam.shake = 14; if (d < 250) p.hurt(38, this.face, g); } return; }
      if (this.slamCd <= 0 && d < 260) { this.slamWind = .7; this.slamCd = 3.6; return; }
      if (this.shardCd <= 0) { this.shardCd = 4.5; for (let i = 0; i < 14; i++) { const a = i / 12 * 6.283 + this.t; g.eproj.push({ x: this.x, y: this.y, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, life: 3, dmg: 12, poison: 0, bullet: true }); } }
      if (this.summonCd <= 0) { this.summonCd = 10; for (let i = 0; i < 2; i++) { const e = new Enemy('prototipo', this.x + (i ? 60 : -60), this.y + 40, 900 + i + Math.floor(g.t)); e.alert = true; g.enemies.push(e); } UI.msg('Voss libera a sus creaciones.', 2000); }
      if (d < this.r + p.r + 4) p.hurt(22, this.face, g); if (d > 90) Level.move(this, dx / d * sp, dy / d * sp);
    }
  }
  draw(ctx) {
    if (this.ph === 2) { super.draw(ctx); ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(160,80,255,.2)'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.283); ctx.fill(); ctx.restore(); return; }
    ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(3, 6, this.r + 6, this.r, 0, 0, 6.283); ctx.fill();
    if (this.gasWind > 0) { ctx.restore(); ctx.save(); ctx.strokeStyle = 'rgba(100,255,60,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.gx, this.gy, 64 * (1 - this.gasWind), 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(this.gx, this.gy, 64, 0, 6.283); ctx.stroke(); ctx.restore(); ctx.save(); ctx.translate(this.x, this.y); }
    if (this.slamWind > 0) { ctx.strokeStyle = 'rgba(255,60,120,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 250, 0, 6.283); ctx.stroke(); }
    if (this.ph === 1) {
      ctx.rotate(this.face); ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#e8e8ee'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 17, 0, 0, 6.283); ctx.fill();              // bata
      ctx.fillStyle = '#b89a82'; ctx.fillRect(8, -16, 14, 5); ctx.fillRect(8, 11, 20, 5); ctx.fillStyle = '#222'; ctx.fillRect(24, 11, 10, 5);                                 // brazos y arma
      ctx.fillStyle = '#c8a890'; ctx.beginPath(); ctx.arc(1, 0, 7, 0, 6.283); ctx.fill(); ctx.fillStyle = '#7a8ab0'; ctx.fillRect(4, -3, 4, 6); ctx.fillStyle = '#8030ff'; ctx.fillRect(-4, -14, 2, 28); // gafas y vena violeta
    } else {
      const s = this.r / 17, t = this.t; ctx.scale(s * .6, s * .6); ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#4a2a6a'; ctx.beginPath(); ctx.ellipse(0, 0, 36, 40, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#7a3ac0'; ctx.lineWidth = 8; for (let i = 0; i < 6; i++) { const a = i * 1.047 + Math.sin(t * 2 + i) * .3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 28, Math.sin(a) * 28); ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); ctx.stroke(); }
      ctx.fillStyle = '#e060ff'; ctx.beginPath(); ctx.arc(0, 0, 12 + Math.sin(t * 6) * 3, 0, 6.283); ctx.fill(); ctx.fillStyle = '#ffd0ff'; ctx.fillRect(-14, -18, 6, 6); ctx.fillRect(8, -18, 6, 6);
    }
    ctx.restore();
  }
}
// REESCRITURA NARRATIVA: documentos revisados para reforzar continuidad, voz y pistas.
Object.assign(DOCS, {
 d1:{title:'Expediente clínico 017 · Wilson, Issac',text:`HOLLOW / UNIDAD DE OBSERVACIÓN BIOLÓGICA
Nombre: Issac Wilson. Edad: 23. Ocupación declarada: repartidor.
Compatibilidad inicial estimada: 94 %. Dosis completa administrada: 06:12.

RESULTADO A LAS 00:15: sin convulsiones, necrosis ni respuesta mutagénica visible. Pulso estable. El compuesto continúa presente en sangre, pero no se integra en el tejido como en los casos anteriores.

Historial de comparación: 999.999 sujetos evaluados. Ninguno sobrevivió a la dosis completa sin deterioro neurológico o transformación física.

Dictamen del Dr. A. Voss: «No hay manifestación. No hay resultado. Clasifíquenlo como descarte».

Anotación añadida a mano, tinta distinta: «La ausencia de síntomas no demuestra ausencia de actividad. No autoricen la eliminación».

Acceso restringido. No informar al paciente ni a sus familiares.`},
 s1:{title:'Mensaje arañado en el muro de aislamiento',text:`Las letras están hechas con uñas. Algunas quedaron hundidas en el yeso; otras desaparecen bajo manchas oscuras.

«I., si llegaste hasta aquí, significa que todavía estás vivo.
No escuches al doctor. No eres un fracaso, aunque él te lo repita.
Me dijeron que me llevan al nivel inferior. No sé cuánto tiempo me queda.
Si oyes tres golpes desde el otro lado de la pared, soy yo.
No respondas si escuchas mi voz desde el pasillo.

Te quiero. Aguanta.
— E.»`},
 e2:{title:'Libro de celdas · actualización de contención',text:`Las celdas de aislamiento fueron numeradas del 01 al 07 durante la primera fase del programa.

CELDA 06: clausurada después de una fuga de material biológico. La puerta fue soldada desde el exterior. No figura en el recorrido de evacuación.
CELDA 07: reservada para observación, pero nunca habilitada por fallos de presión.
CELDA 05: última celda operativa antes del cierre del ala.

Nota del supervisor: no actualizar los planos antiguos. Los equipos de rescate no deben conocer las modificaciones internas.`},
 d2:{title:'Libro de guardia · noche del incidente',text:`03:12 — Se escucharon golpes en la sala de contención. El personal creyó que eran tuberías.
03:19 — El intercomunicador transmitió una respiración durante cuarenta y siete segundos. Nadie habló.
03:26 — Se abrió la puerta interior sin autorización. Las cámaras registraron movimiento, pero ninguna figura reconocible.
03:40 — Corte eléctrico total. Se ordenó permanecer en los puestos.
03:43 — Alguien gritó desde la enfermería: «¡No están muertos!»
03:51 — La central dejó de responder.

La llave de enfermería fue recuperada del cinturón del guardia nocturno, junto a la entrada. El informe oficial atribuye el incidente a una falla eléctrica. Quien redactó esta página añadió: «La electricidad no araña las puertas desde dentro».`},
 e3:{title:'Plano de evacuación · copia no autorizada',text:`PLANTA BAJA: Recepción, Enfermería, Oficinas, Archivo, Dirección, Cocina y almacén, Seguridad.
SUBSUELO 01: Lavandería y mantenimiento.
SUBSUELO 02: Contención primaria.

La ruta sur es la única salida de emergencia que no atraviesa el ala de pacientes. La puerta requiere la llave de salida, asignada al responsable de seguridad.

Anotación en el margen: «Si el ascensor funciona, no lo uses. El indicador marca dos pisos, pero el edificio tiene tres niveles bajo tierra».

Plano retirado del tablón público el día anterior al incidente.`},
 d6:{title:'Directiva H-0 · abandono del complejo',text:`CLASIFICACIÓN: NEGRO / DESTRUCCIÓN TRAS LECTURA
Asunto: cierre irreversible del Complejo Hollow.

La contención ha fallado en tres sectores. Todo el personal con autorización Alfa debe evacuar por la ruta sur. Las muestras, los pacientes y los sujetos de prueba permanecerán en el complejo hasta nueva orden.

No se enviará equipo de recuperación. No se contactará a los familiares. No se reconocerá la existencia del programa ante ninguna autoridad civil o militar.

Si se encuentra este documento fuera del perímetro, deberá destruirse junto con cualquier registro del Proyecto Riutex.

Última línea, escrita a mano: «Nos dijeron que era una evacuación. Si fuera una evacuación, nos dejarían llevarnos a los vivos».
— Dirección del programa`},
 d3:{title:'Cuaderno de la enfermera de turno',text:`He trabajado en hospitales durante once años. Sé cómo suena una persona muriendo. Lo que hay aquí no suena así.

Los pacientes dejan de respirar, se quedan inmóviles y, cuando nos acercamos, vuelven a moverse. No reconocen sus nombres. Algunos lloran mientras intentan mordernos. Otros parecen escuchar algo que nosotros no oímos.

Hoy trajeron a un muchacho encadenado a una camilla. El doctor Voss ordenó administrar la dosis gris completa. Preparé la bandeja y me quedé junto a la puerta esperando el grito.
No hubo grito. Solo una respiración tranquila.

Voss lo miró como si acabara de fallar una máquina. Ordenó dejarlo en el suelo y registrarlo como descarte.

La doctora Lang me dijo que guardara la llave del almacén. «Si despierta, alguien tendrá que ayudarlo», susurró.
No sé a quién se refería. Creo que sí.`},
 e4:{title:'Procedimiento de arranque · generador auxiliar',text:`El generador no admite activación simultánea. Los circuitos deben conectarse de mayor a menor consumo para evitar una sobrecarga en el transformador.

COCINA — 40 kW
LAVANDERÍA — 30 kW
ENFERMERÍA — 20 kW
SEGURIDAD — 10 kW

Secuencia de arranque: activar un interruptor, esperar el clic del relé y continuar con el siguiente. Si el orden se rompe, el sistema corta la alimentación y reinicia el panel.

Advertencia del técnico: «No intenten puentear el relé. El último que lo hizo quedó pegado al tablero».

El generador alimenta las cerraduras del subsuelo. No lo apague mientras haya personal bajo tierra.`},
 f2:{title:'Expediente 02/03 · Ortega',text:`SUJETO: ORTEGA, M. / ingreso no consentido.
Fase de exposición: V1, dosis estándar.
Respuesta: pérdida progresiva de voluntad; incapacidad para reconocer rostros; desplazamiento repetitivo por el perímetro de la celda.

Durante la última entrevista, Ortega repitió: «La puerta está abierta. La puerta está abierta». La puerta permanecía cerrada.

Destino: planta baja, ala de observación. Sin tratamiento autorizado.

FRAGMENTO DE ACCESO AL ARCHIVO — PARTE 2 DE 3: 8`},
 d4:{title:'Memorándum privado del Dr. Voss',text:`Riutex-V1 presenta respuesta estable en una minoría de organismos. En los demás, el rechazo adopta formas que el comité insiste en llamar «efectos secundarios».

Wilson ha sobrevivido a la dosis completa. No presenta deformación, pérdida de memoria ni rechazo inmunológico. La doctora Lang sostiene que el compuesto permanece en su sangre porque el organismo lo está conteniendo. No existe evidencia suficiente para respaldar esa fantasía.

Orden: retirar a Wilson de la lista de sujetos activos. No gastar más recursos.

La tarjeta de seguridad permanece en la cocina, junto al almacén. La documentación sensible está oculta donde el personal de limpieza no suele entrar.

Posdata, añadida horas después: «Si no hay efecto, ¿por qué el análisis de sangre sigue cambiando?»`},
 f3:{title:'Expediente 03/03 · Salas',text:`SUJETO: SALAS, R. / ingreso tras traslado nocturno.
Respuesta al compuesto: hipertrofia acelerada, supresión de la respuesta al dolor y agresividad dirigida hacia cualquier estímulo móvil.

El sujeto arrancó los anclajes de la camilla sin reaccionar a las fracturas de sus propias manos. Se recomienda confinamiento permanente. No asignar personal sin protección reforzada.

FRAGMENTO DE ACCESO AL ARCHIVO — PARTE 3 DE 3: 3`},
 d5:{title:'Informe de laboratorio · RIUTEX-V1',text:`Aspecto: suspensión gris con fluorescencia violeta bajo luz ultravioleta.
Objetivo declarado: inducir regeneración celular y detener la degradación orgánica.
Resultado observado: el compuesto no repara el organismo de manera uniforme. Reescribe sus respuestas.

Cada fase de mutación requiere una muestra nueva, extraída de sujetos con evolución avanzada. El proceso no es obligatorio: los cambios pueden permanecer latentes mientras no se complete la exposición.

ANOMALÍA 017 — WILSON
El compuesto no fue rechazado ni integrado de forma visible. Permanece en sangre, estable, como si esperara una señal.
Hipótesis A: inactividad total.
Hipótesis B — Dra. Lang: «Su cuerpo lo está reteniendo. No sabemos para qué».

Voss tachó la segunda hipótesis y escribió: «No confundir una ausencia de datos con un descubrimiento».`},
 s4:{title:'Informe de captura · Prototipo Cero',text:`OBJETO: P-00 / designación interna: PROTOTIPO CERO.
Ubicación de captura: edificio de la calle Lázaro 14. Fecha incompleta.

No corresponde a ningún paciente registrado. Las marcas en su piel preceden al primer lote de Riutex. El equipo de campo afirma que el sujeto condujo a los reclutadores hasta el complejo, aunque no existe registro de que hablara ni de que recibiera órdenes.

Voss lo llama «el huésped original». En las reuniones lo describe como una prueba de que la infección no nació en el laboratorio; el laboratorio solo aprendió a despertarla.

Estado actual: nivel inferior, cámara de espera.

Nota del guardia: «No se mueve cuando lo miras. Cuando apartas la vista, cambia de lugar».

No bajar sin autorización doble.`},
 d7:{title:'Atlas de respuestas mutagénicas · resumen de campo',text:`El Riutex no produce una forma única. La transformación depende de la fisiología del huésped, de la dosis y de la exposición acumulada.

VACÍOS — pérdida de iniciativa y respuesta a estímulos simples. Caminan sin objetivo aparente.
TREPADORES — elongación ósea y aceleración muscular. Pueden recorrer paredes y techos.
BRUTOS — crecimiento muscular extremo; la respuesta al dolor disminuye casi por completo.
AULLADORES — alteración de laringe y caja torácica. Sus vocalizaciones atraen a otros sujetos.
LATENTES — actividad metabólica mínima. Simulan la muerte hasta detectar proximidad.

Conclusión inicial: el compuesto amplifica patrones preexistentes.
Conclusión corregida, tras revisar los registros de Wilson: también podría revelar una función que el organismo todavía no ha expresado.

La segunda conclusión fue retirada de la versión oficial.`},
 e1:{title:'Recordatorio cifrado del director',text:`La caja fuerte tiene cuatro cifras. No escribas la combinación completa en el mismo lugar que la pista.

PRIMER BLOQUE: usa el número de la celda operativa más alta que siga abierta. No cuentes las celdas soldadas ni las reservadas que nunca entraron en servicio.
SEGUNDO BLOQUE: usa el número del subsuelo donde se encuentra la contención primaria.

Si alguien pregunta, esta nota habla de mantenimiento, no de la caja fuerte.

A.V.`},
 f1:{title:'Expediente 01/03 · Mendoza',text:`SUJETO: MENDOZA, J. / incidente de contención.
Durante el turno de noche, Mendoza atacó a dos enfermeros y continuó golpeando la puerta después de sufrir una lesión incapacitante. No respondió a su nombre ni a las órdenes de sedación.

La celda fue clausurada desde el exterior. El informe afirma que la medida fue preventiva; el registro de enfermería señala que alguien seguía golpeando desde dentro tres horas después.

FRAGMENTO DE ACCESO AL ARCHIVO — PARTE 1 DE 3: 5`},
 e5:{title:'Instrucciones del terminal · Archivo restringido',text:`El terminal requiere una clave de tres cifras.

Los fragmentos están repartidos en tres expedientes de descarte. Léelos en orden cronológico de archivo, no por la fecha en que fueron encontrados:
01/03 — Mendoza
02/03 — Ortega
03/03 — Salas

Introduce los tres dígitos sin espacios. El sistema no registra intentos fallidos, pero activa una alarma silenciosa después del tercero.`},
 d8:{title:'Carta de la Dra. Lang a Adrian Voss',text:`Adrian:

He revisado los análisis de Wilson por cuarta vez. Los demás sujetos rechazan el compuesto, se deforman o pierden la actividad cerebral. Él no hace ninguna de esas cosas. La concentración de Riutex en su sangre sube y baja siguiendo un patrón que no hemos visto en ningún otro organismo.

No es inmunidad. La inmunidad sería una respuesta. Esto parece una negociación.

Si despierta, no será como los otros. No sabemos qué puede hacer, ni qué le hemos enseñado a su cuerpo sin su consentimiento.

No lo conviertas en otra cifra de tu informe. Sácalo del complejo mientras todavía puedas.

— Lang`},
 s2:{title:'Parte de contención · Gideon Marsh',text:`NOMBRE: Gideon Marsh. DESIGNACIÓN OPERATIVA: EL CARCELERO.
Estatura: 2,10 m. Fuerza por encima de los límites de contención convencionales. Episodios de paranoia y respuesta violenta ante movimiento repentino.

Las correas no resistieron. Las cadenas solo retrasaron la fuga. Fue trasladado al subsuelo 02 y encerrado detrás de la compuerta reforzada.

La llave de salida continúa sujeta al cinturón del paciente. Recuperarla es obligatorio para abandonar el complejo.

Nota del jefe de guardia: «No intentes distraerlo con ruido. El ruido lo enfurece. Si se lanza contra ti, deja que golpee la pared. La pared aguanta más que nosotros».

Última actualización: el paciente ya no responde al nombre Gideon.`},
 d9:{title:'Registro restringido · Paciente E',text:`Identificador: E-01. Nombre reservado en los informes públicos.

La muestra de sangre reaccionó al Riutex sin que conste una administración previa. El Dr. Voss escribió: «Alguien la expuso antes de nosotros». La Dra. Lang pidió investigar el origen de la reacción; la solicitud fue denegada.

La paciente no presenta agresividad. Pregunta cada noche por una persona identificada únicamente como «I.» y asegura que vendrá a buscarla.

En una entrevista, E dijo: «No me eligieron porque pudiera ayudarles. Me eligieron porque mi sangre les daba una excusa para seguir».

Traslado ordenado al nivel inferior. Acceso al expediente restringido por dirección.`},
 // BASE MILITAR
 b1:{title:'Control de acceso · Base Sierra',text:`PROYECTO RIUTEX / INSTALACIÓN MILITAR SIERRA
Acceso exclusivo para personal autorizado.

Los sujetos que sobrevivan a las pruebas se registrarán como activos biológicos y serán asignados a unidades de campo. No se les llamará por su nombre frente al resto del personal. No se les permitirá abandonar el perímetro.

Si un sujeto habla, recuerda o pide ayuda, informe al mando. No responda.`},
 b2:{title:'Orden de repliegue · canal interno',text:`REPLIEGUE INMEDIATO. NO ES UNA SIMULACIÓN.

Quemen los archivos sensibles y destruyan las listas de traslado. Los especímenes no serán evacuados.

Sargento Varga: permanezca en la base hasta que el último transporte salga del perímetro. Elimine toda evidencia de cooperación entre el mando y el Proyecto Riutex.

Nota manuscrita: «No pienso volver a dejar a mis hombres aquí».

La nota fue tachada con tanta fuerza que rompió el papel.`},
 b3:{title:'Registro de radio · canal de perímetro',text:`18:05 — Puesto Norte: «Sin novedad en el perímetro».
19:12 — Control: «Mantengan cerrada la Perrera. No respondan a golpes desde el interior».
21:30 — Puesto Norte: «La Perrera está abierta. Repito: la Perrera está abierta. Perdemos el control de los especímenes».

Después de la última transmisión se oye un golpe metálico, tres segundos de estática y una voz que pregunta: «¿Ya puedo volver a casa?»`},
 b4:{title:'Registro de radio · canal de mando',text:`19:40 — Hangar: «Mando, solicitamos refuerzos. Hay movimiento bajo la plataforma».
20:03 — Control: «Negativo. Mantengan posiciones».
22:15 — Mando: «Varga, informe de situación».
22:16 — Sin respuesta.

El operador escribió al margen: «La señal no se perdió. Alguien estaba escuchando y decidió no contestar».

Registro recuperado de la consola principal.`},
 b5:{title:'Registro de radio · última transmisión',text:`23:16 — Sargento Varga: «Aquí Varga. Que nadie abandone su puesto. Yo me encargo».

Se escucha un golpe, un ruido parecido a una respiración mecánica y una segunda voz que repite la última frase con un retraso de dos segundos.

23:17 — Portadora activa, sin voz.
23:21 — Fin de la grabación.

No hubo más transmisiones desde el puesto de mando.`},
 b6:{title:'Protocolo de acceso · puesto de mando',text:`El terminal utiliza como clave la hora de la última transmisión completa del registro de radio.

Formato requerido: HHMM, sin dos puntos.

No utilice la hora en que el operador cerró el registro ni la hora de la última señal de portadora. El sistema busca la última transmisión con voz identificada.

Si la grabación se reproduce sola, no responda al terminal.`},
 b7:{title:'Informe de misión Sierra · pérdidas',text:`Objetivo: asegurar el corredor norte y recuperar el equipo perdido.
Personal desplegado: 14.
Personal que regresó: 02.
Superviviente: Sargento Varga.

El informe médico registra amputación del brazo derecho, fracturas múltiples y exposición prolongada al compuesto. Varga rechazó la evacuación y pidió hablar con el Dr. Voss.

En la última línea escribió: «No me llamen superviviente. Yo fui el que cerró la puerta».

Informe aprobado sin investigación posterior.`},
 b8:{title:'Nota privada del sargento Varga',text:`Mi taquilla usa dos números de dos cifras. Primero, los que salimos a Sierra. Después, los que regresaron vivos del segundo despliegue.

Catorce. Dos.

No lo escribo para recordarlo. Lo escribo porque cada vez que cierro los ojos vuelvo a contar y siempre obtengo el mismo resultado.

Si alguien encuentra esta nota, no abra mi taquilla delante del médico. Hay cosas que el mando no necesita saber.`},
 b9:{title:'Informe quirúrgico · estabilizador cardíaco',text:`El organismo del Sargento Varga no toleró RIUTEX-V1. Para evitar el colapso se implantó un estabilizador cardíaco metálico conectado al sistema circulatorio.

Resultado: fuerza y velocidad aumentadas; regeneración irregular; dolor persistente. El brazo derecho fue reemplazado por tejido mutado tras la cirugía.

Dr. Voss: «El corazón de metal no lo cura. Solo le ordena a su cuerpo que siga funcionando».

Varga solicitó que no se informara a su familia. La solicitud fue aceptada porque no existe registro de familiares vivos.`},
 b10:{title:'Diario de Varga · páginas recuperadas',text:`Perdí catorce hombres en Sierra. Perdí el brazo. Voss me ofreció una forma de volver a ser útil.

Dije que sí porque no soportaba la idea de haber sobrevivido para nada.

El metal de mi pecho golpea más fuerte cuando hay un espécimen cerca. A veces creo que no es un corazón: es una alarma.

Ahora limpio lo que otros ensucian. Si la base cae, me han ordenado quedarme y borrar los registros. No sé si me eligieron por lealtad o porque soy el último hombre al que nadie echará de menos.`},
 b11:{title:'Archivo de asignación · armas vivas',text:`Los sujetos que superan las pruebas de obediencia se asignan a unidades de campo bajo la categoría «armas vivas».

Los sujetos inestables son trasladados a la Perrera. Los que superan la capacidad de contención de la Perrera se derivan a las cloacas. Los casos que no pueden transportarse se registran como material perdido.

No se autoriza el uso de nombres, fotografías ni registros familiares.

Comentario del archivista: «Cambiarles el nombre no cambia lo que eran antes de entrar aquí».

Documento marcado para destrucción.`},
 b12:{title:'Cuaderno privado de Emily · página I',text:`Esto no es un informe de Voss. Es mío. Si lo encuentra, por favor, léalo entero antes de decidir qué clase de persona fui.

Durante meses administré a I. dosis diminutas de V1 en el café y la comida. Nunca una dosis suficiente para provocar una mutación. Quería que su cuerpo aprendiera a reconocer el compuesto antes de que el programa lo encontrara.

Me dije que era una precaución. Me dije que lo protegía.

No le pedí permiso. Esa es la parte que no consigo justificar, por mucho que me repita que lo hice por amor.`},
 b13:{title:'Cuaderno privado de Emily · página II',text:`Cuando comprendí lo que hacían con los pacientes intenté detener el programa. Ya había reclutado a demasiadas personas y firmado demasiados formularios para fingir que no sabía nada.

Mandé una copia de los registros fuera del complejo. Voss descubrió la filtración y me encerró.

I., si estás leyendo esto, tu cuerpo no es especial por casualidad. Yo lo expuse al compuesto sin decírtelo. Creí que así podría salvarte si algún día venían por ti.

No te salvé de la elección. Te la quité.

No espero que me perdones. Solo espero que puedas salir de aquí sin convertirte en lo que él quiere.`},
 b14:{title:'Nota de Voss al sargento Varga',text:`Wilson llegará a la base. Es el único sujeto que ha soportado una dosis completa sin fractura biológica. Quiero que lo mantengas vivo hasta que llegue al laboratorio.

Si pregunta por Emily, no le des información. Si intenta escapar, detenlo. Si el compuesto empieza a manifestarse, no lo mates: avísame.

El acceso al laboratorio depende de la tarjeta de mando. No pierdas esa tarjeta.

P.D. Si la situación se vuelve insostenible, elimina los registros y cumple la orden de repliegue. La investigación está por encima de cualquier individuo.`},
 b15:{title:'Inventario de la Perrera · estado crítico',text:`CLASES DE SUJETOS CONTENIDOS:
SOLDADOS — conservan coordinación y utilizan herramientas o armas.
CAZADORES — velocidad elevada, persiguen estímulos de movimiento.
HOJAS — crecimiento óseo en antebrazos; ataques de corte.
COLOSOS — tejido denso, blindaje orgánico y respuesta reducida al dolor.

Estado actual: puertas interiores comprometidas. Dos cámaras vacías sin señal de apertura. Personal desaparecido: 11.

No entrar sin escolta. No usar altavoces. No llamar a los sujetos por sus nombres anteriores.`},
 b16:{title:'Aviso del hangar · motores',text:`PROHIBIDO ENCENDER MOTORES SIN AUTORIZACIÓN DEL MANDO.

El Coloso reacciona a vibraciones de baja frecuencia. Las pruebas indican que puede localizar un motor apagado si el bloque aún está caliente.

No golpee el capó. No arranque el vehículo para comprobar si la criatura sigue cerca.

Si escucha metal arrastrándose debajo de la plataforma, abandone el hangar a pie.`},
 b17:{title:'Plano de campo · corredor seguro',text:`El campo de pruebas está cubierto por minas de presión. Las rutas antiguas fueron retiradas de los planos tras el último ejercicio.

El único corredor verificado permanece señalizado con cinta amarilla. No se desvíe para recuperar munición ni equipo.

Nota del ingeniero: «La cinta no marca el camino más corto. Marca el único camino por el que todavía podemos caminar».

Si la cinta aparece cortada, regrese. No intente completar el trayecto.`},
 // CLOACAS
 c6:{title:'Planilla de purga · circuito hidráulico',text:`El sistema de drenaje se bloqueó para impedir que el material biológico alcanzara el canal exterior.

A — 2
B — 0
C — 3
D — 1

Las cifras indican la posición final de cada válvula, no el número de vueltas. Alinee los indicadores con la planilla antes de abrir la compuerta.

Advertencia: una secuencia incorrecta mantiene la presión dentro de las tuberías. Si oye tres golpes seguidos, aléjese del panel.`},
 c7:{title:'Procedimiento de apertura · Compuerta D',text:`La Compuerta D utiliza una clave de tres cifras generada a partir del parte de descartes del último turno.

Orden obligatorio: MAÑANA → TARDE → NOCHE.

No se trata de las horas del turno ni del número total de pacientes del día. Cada cifra corresponde a los sujetos declarados como descartados en el parte específico.

Los tres partes se archivaron por separado porque el recuento completo fue clasificado como incidente de bioseguridad.`},
 c8:{title:'Parte de descartes · turno de mañana',text:`Recuento validado: 6 sujetos.

Los seis respondían a estímulos sonoros, pero ninguno reconoció su nombre. Uno de ellos repitió la dirección de su casa durante cuarenta minutos.

El supervisor ordenó retirar las etiquetas de identificación antes del traslado al foso.

Observación del operario: «No eran agresivos hasta que apagamos la luz».

Cifra para el registro de la Compuerta D: 6.`},
 c9:{title:'Parte de descartes · turno de tarde',text:`Recuento validado: 2 sujetos.

Una paciente pidió que avisáramos a su hija. El formulario de contacto estaba completo. La llamada fue cancelada por orden de dirección.

No hubo incidencias durante el traslado. El silencio del pasillo duró exactamente hasta que cerramos la compuerta.

Cifra para el registro de la Compuerta D: 2.`},
 c10:{title:'Parte de descartes · turno de noche',text:`Recuento validado: 5 sujetos.

El foso emitió sonidos que el equipo describió como golpes de cola contra hormigón. No se autorizó la inspección.

Un operario renunció en el acto. Otro dejó su identificación sobre esta hoja y desapareció antes del amanecer.

Cifra para el registro de la Compuerta D: 5.`},
 c11:{title:'Registro de equipo · operario Ramos',text:`El primer descarte oficial del programa fue registrado el 11 de marzo. Ramos recibió la orden de trasladar su equipo al casillero del taller antes de abandonar el complejo.

En el reverso anotó: «Si vuelvo, usaré la fecha del primer día como combinación. Día y mes, cuatro cifras. Si no vuelvo, que al menos alguien sepa cuándo empezó esto».

El casillero no fue vaciado tras su desaparición.`},
 c12:{title:'Transcripción parcial · voz de Adrian Voss',text:`«Emily es nuestra mejor reclutadora y el caso biológico más prometedor. Su sangre reacciona al compuesto sin que conste una dosis. No sabemos si es causa, consecuencia o ambas cosas.

La mantendremos en observación en el nivel inferior. Ella cree que todavía buscamos una cura. No la contradigan: una persona que conserva esperanza coopera mejor.

Si Wilson llega hasta aquí, ya habrá encontrado la fotografía. Déjenlo creer que la pista fue un accidente. Un sujeto motivado siempre llega más lejos que uno obediente».

Fin de transcripción. El resto del audio fue borrado manualmente.`},
 c13:{title:'Carta de Emily · nunca enviada',text:`I.:

Sí, trabajé para él. Yo conseguí a las personas que aparecen en las listas. Me dijeron que recibirían tratamiento, que sus familias serían compensadas, que nadie saldría peor de lo que entró.

Quise creerlo porque necesitaba creer que mi trabajo servía para algo.

Cuando vi las cámaras de contención, envié una copia de los registros y una fotografía fuera del complejo. Fue lo único que pude hacer antes de que me detuvieran.

No te pedí ayuda porque no quería que vinieras. Sabía que vendrías de todos modos.

Si llegas a encontrarme, no confundas mi arrepentimiento con inocencia.
— Emily`},
 c14:{title:'Listado de descartes · fragmento recuperado',text:`BELTRÁN, M. — enfermedad degenerativa.
ORTIZ, J. — trastorno neurológico.
SALAZAR, R. — cáncer avanzado.
Y más de ciento diez nombres eliminados del registro oficial.

Al final de la lista, otra mano escribió:
«Los que caen al foso no desaparecen. Don Aurelio tenía un cocodrilo antes de que empezara el programa. Ahora hay algo que se mueve bajo el agua y no necesita salir para alimentarse».

La página siguiente fue arrancada desde el lomo.`},
 c16:{title:'Manual del tablero eléctrico · Canal central',text:`Para alimentar la compuerta de la Galería de descartes se requieren tres fusibles industriales.

FUSIBLE A — recuperado de los tanques de sedimentación.
FUSIBLE B — guardado en el taller del operario.
FUSIBLE C — trasladado al dormitorio durante la evacuación.

Instale los tres antes de accionar el tablero. El circuito no distingue entre una pieza ausente y una pieza dañada.

Nota de mantenimiento: «Si vuelve la corriente y escucha algo detrás de la pared, no significa que el sistema esté vacío. Significa que ahora puede abrirse».

No deje los fusibles instalados si el canal está inundado.`},
 // LABORATORIO CENTRAL
 l1:{title:'Placa de acceso · Laboratorio central',text:`PROYECTO RIUTEX / NIVEL DE BIOSEGURIDAD OMEGA
Acceso restringido al personal con autorización del director.

«La muerte no es una ley. Es un problema que todavía no hemos resuelto».
— Dr. Adrian Voss, discurso de apertura, 2019.

Debajo de la placa, alguien grabó con una herramienta: «Y nosotros somos el precio».

La inscripción no aparece en los planos oficiales.`},
 l2:{title:'Tabla de formulaciones · versiones del compuesto',text:`V1 — primera formulación viable; alta tasa de rechazo.
V2–V5 — ajustes de regeneración; inestabilidad neurológica creciente.
RIUTEX-Y — estabilización parcial. Requiere mantenimiento continuo.
RIUTEX-Ω — formulación experimental diseñada para conservar actividad celular después de la muerte clínica.

Estado de Ω: no aprobado para uso humano.
Responsable exclusivo: Dr. Adrian Voss.

Anotación técnica: «El nombre “perfecto” fue asignado por el director antes de completar las pruebas».

No existe un protocolo de reversión validado.`},
 l3:{title:'Protocolo de cultivo · suero estabilizador',text:`Para reactivar el ala de experimentos debe prepararse una solución estabilizadora. La proporción se expresa en mililitros y debe respetarse sin redondeo.

REACTIVO A: 3 ml
REACTIVO B: 7 ml
REACTIVO C: 1 ml

El orden de lectura corresponde a las etiquetas del recipiente, no al orden en que fueron encontrados. Una mezcla incorrecta precipita y bloquea el circuito del cultivo.

Nota de la técnica Marta: «La receta funciona. Lo que nadie sabe es si estabiliza el suero o lo que hay dentro de la cámara».

No abrir el ala hasta que los tres indicadores permanezcan verdes.`},
 l4:{title:'Diario de Adrian Voss · I: la promesa',text:`Lucía tenía siete años cuando los médicos dejaron de hablar de tratamiento y empezaron a hablar de tiempo.

Yo era genetista. Había dedicado mi vida a corregir errores que otros consideraban inevitables. Sin embargo, cuando mi hija necesitó que corrigiera el suyo, no pude hacer nada.

Me dijeron que debía acompañarla. Yo me quedé en el laboratorio buscando una alternativa que no existía.

Cuando llegué, ya había muerto.

Fundé Riutex dos años después. En los documentos escribí «regeneración celular». En mi cabeza escribí otra cosa: «No volveré a llegar tarde».

No le conté a nadie que, desde aquella noche, no podía recordar su voz sin escuchar también el monitor apagándose.`},
 l5:{title:'Certificado de defunción · Lucía Voss',text:`Nombre: Lucía Voss.
Fecha de fallecimiento: 14 de octubre de 2017.
Causa registrada: complicaciones de enfermedad progresiva.

Observación manuscrita del padre: «Llegué tres horas tarde. Estaba en el laboratorio cuando me llamaron».

Al dorso, con letra infantil conservada en el expediente, aparece una frase de una tarjeta de cumpleaños: «Papá, este año sí vas a venir, ¿verdad?».

El certificado fue solicitado de nuevo en 2019, después de la creación del programa Riutex. La segunda copia carece de firma del médico forense.`},
 l6:{title:'Acta de fundación · Programa Riutex',text:`Fecha de constitución: 2019.
Financiación: fondos privados y contratos de investigación clasificados.
Supervisión externa: no establecida.
Objetivo oficial: estudio de regeneración celular y prevención del deterioro orgánico.

La fecha de fundación coincide con la primera solicitud de acceso a material biológico de alta seguridad.

Anotación del auditor: «La documentación presenta dos años de gastos anteriores a la constitución legal. No se autoriza investigación adicional».

El auditor fue retirado del proyecto al día siguiente.`},
 l7:{title:'Protocolo de bioseguridad · terminal B',text:`La terminal de bioseguridad requiere el año de fundación del programa, no la fecha de fallecimiento de la paciente que motivó la investigación.

Introduzca cuatro cifras. No use guiones ni espacios.

El acceso habilita la sala de servidores, donde se conservan los registros originales de los sujetos y las copias de seguridad que el director ordenó eliminar.

Nota al operador: «Si la terminal pregunta si desea restaurar los archivos, seleccione SÍ. La orden de borrado no fue aprobada por el comité».

El comité dejó de existir en los registros una semana después.`},
 l8:{title:'Diario de Adrian Voss · II: el silencio',text:`Después del funeral dejé de dormir. El laboratorio seguía funcionando y yo seguía firmando órdenes, como si el trabajo pudiera llenar el espacio que ella había dejado.

La primera dosis me la administré a mí mismo. No buscaba fuerza ni longevidad. Quería que el dolor se callara durante una hora.

Funcionó.

La segunda dosis duró menos. La tercera me permitió trabajar toda la noche. Empecé a registrar el efecto como un avance terapéutico.

Ahora sé que el compuesto no eliminaba el dolor. Solo apagaba la parte de mí que todavía podía reconocerlo.

No recuerdo en qué momento dejé de llamarlo tratamiento.`},
 l9:{title:'Diario de Adrian Voss · III: la voz',text:`Anoche soñé con Lucía. Estaba al otro lado de una puerta y me dijo que tenía frío.

Desperté con la certeza de que el compuesto podía devolverla. No una copia, no una simulación: ella.

Los sujetos anteriores fueron errores de cálculo. Eso me digo cada vez que leo sus nombres. Si consigo estabilizar Ω, todos esos sacrificios tendrán un propósito.

He empezado a borrar la palabra «sujeto» de los informes de Lucía. No es un sujeto. Es mi hija.

No sé por qué esa distinción ya no me parece suficiente.`},
 l10:{title:'Dibujo de Lucía · guardado en el despacho',text:`Dibujo infantil: una niña junto a un hombre con bata blanca. Sobre ambos hay un sol enorme. La figura del hombre tiene una mano desproporcionadamente grande y sostiene una caja violeta.

Texto escrito con lápices de colores:
«Para papá. Mi cumpleaños es el 3 de mayo. No llegues tarde otra vez».

En el margen, Voss escribió años después: «No pude prometerle que estaría siempre. Puedo prometerle que volverá».

El dibujo fue retirado de la habitación del director y trasladado al laboratorio central.`},
 l11:{title:'Nota privada · caja de cirugía',text:`La caja de cirugía usa una combinación de cuatro cifras: mes y día del cumpleaños de Lucía, en ese orden.

No es una fecha clínica ni una clave del programa. Es algo que solo yo debería recordar.

He cambiado la cerradura dos veces. Sigo utilizando la misma combinación.

Si algún día alguien encuentra esta nota, espero que entienda que no guardo ahí dinero ni secretos científicos. Guardo lo último que queda de una vida anterior a Riutex.`},
 l12:{title:'Carta final de Emily a Issac',text:`I.:

Si has llegado al laboratorio, ya sabes lo que hice. No voy a esconderme detrás de las órdenes de Voss. Yo recluté a personas que confiaron en mí. Yo te expuse al compuesto sin preguntarte. Creí que podía anticiparme al desastre y terminé ayudándolo a construirlo.

Cuando me encerraron, repasé cada decisión como si encontrar el instante exacto pudiera deshacerla.

No lo encontré.

Si puedes salir, sal. Si decides no volver a mirarme, lo entenderé. Solo quiero que sepas que, entre todas las mentiras de este lugar, lo que sentí por ti no fue una de ellas.

— Emily`},
 l13:{title:'Informe de la Dra. Park · variantes de combate',text:`Los prototipos Delta reproducen algunas capacidades del estabilizador de Varga sin requerir un implante cardíaco. Su vida útil es corta y el deterioro mental aparece antes que en los sujetos originales.

ESPECTROS: alteración de pigmentación y camuflaje bajo baja iluminación.
REGENERADORES: reparación rápida del tejido; la regeneración se interrumpe al destruir el núcleo expuesto.
ABOMINACIONES: masa corporal extrema, movilidad limitada y resistencia elevada.
TORRETAS: sujetos inmovilizados mediante soporte mecánico; responden a movimiento dentro del perímetro.

Conclusión: no son soldados mejorados. Son funciones del organismo convertidas en herramientas.

La Dra. Park solicitó el cierre del programa. Su tarjeta fue desactivada antes de recibir respuesta.`},
 l14:{title:'Diario de Samuel Okafor · quirófano',text:`Llevo tres noches escondido en el quirófano. Cada vez que intento llegar a la salida, oigo a alguien llamándome desde el corredor.

Voss no me deja ir. Dice que el trabajo no ha terminado y que abandonar ahora sería traicionar a Lucía.

He visto las cámaras. Sé que la niña se mueve cuando él entra. Sé que las flores de cristal crecen alrededor de los cables. No sé si ella sigue dentro de ese cuerpo o si Voss está hablando con algo que aprendió su voz.

No confíen en el hombre que lloraba por su hija. Ese hombre habría detenido el proyecto.

El que queda solo quiere que alguien le diga que todo valió la pena.`},
 l15:{title:'Nota de la técnica Marta · último turno',text:`Último turno. Mis hijos esperan en casa y llevo dos días sin poder llamarles.

Los cultivos de la Sala 3 se mueven cuando nadie los observa. No es la vibración de las bombas: desconecté el sistema y siguieron moviéndose.

Ayer encontré una flor cristalizada creciendo dentro de una tubería sellada. Hoy la vi en el otro extremo del ala.

Le dije a Voss que renunciaba. Me respondió que podía irme cuando terminara el recuento.

No existe un recuento que termine. Cada vez que marco una muestra como descartada, aparece otra en la cámara vacía.

Si alguien encuentra esta nota, no abra la Sala 3.`},
 l16:{title:'Protocolo Ω · intento de resurrección',text:`SUJETO: L. Voss. Fallecimiento registrado en 2017. Cuerpo conservado mediante perfusión experimental.

OBJETIVO: recuperar actividad neuronal y funciones vitales sin degradación del tejido.

Fase 1: respuesta celular irregular.
Fase 2: actividad neuronal parcial.
Fase 3: crecimiento cristalino alrededor del sistema nervioso.
Fase 4: reacción consistente a la voz del padre.

No se ha demostrado recuperación de memoria autobiográfica. Las respuestas pueden corresponder a reconocimiento de patrones acústicos.

Nota manuscrita del Dr. Voss: «Me miró. Dijo papá. No necesito que el comité me explique lo que vi».

Advertencia del equipo: el sujeto debe permanecer aislado. La cámara no puede abrirse durante una respuesta activa.`},
 l17:{title:'Nota de Emily · cámara de Lucía',text:`Voss me llevó a ver a su hija después de que acepté firmar el último traslado.

Estaba dentro de una cámara, rodeada de flores de cristal. Parecía dormida. Cuando él le habló, la niña movió los labios y el doctor se echó a llorar.

Me prometió que, si lo ayudaba, nadie más tendría que morir. Quise creerle porque necesitaba una razón para no odiarme.

Después vi los registros: las flores no eran decoración. Crecían sobre los conductos que mantenían el cuerpo activo. Cada nueva dosis hacía que la cámara se expandiera.

Lucía no era la cura. Era el ancla que impedía a Voss aceptar que ya la había perdido.`},
 l18:{title:'Registro de voz · Adrian Voss',text:`«Wilson llegará. Emily lo preparó durante meses sin comprender del todo lo que estaba haciendo. Su sangre reconoce el compuesto y lo mantiene estable. Lo que ella llama culpa, yo lo llamo una oportunidad irrepetible.

Ω necesita un recipiente capaz de soportarlo. Si Wilson lo acepta, podremos completar el proceso. Si no, habré demostrado que la teoría estaba equivocada.

No me importa lo que diga Lang. No me importa lo que diga el comité.

Cuando Lucía despierte, todo lo demás tendrá una explicación».

[Silencio de 18 segundos]

«Y si no despierta, al menos yo dejaré de sentir».

Fin del registro.`},
 l19:{title:'Muro de recuerdos · despacho privado',text:`Fotografías de Lucía: en un columpio, junto a una tarta de cumpleaños, dormida en un asiento trasero y abrazando una bata demasiado grande.

En las primeras imágenes, Voss aparece sonriendo. En las últimas, su rostro está parcialmente fuera de cuadro. En una fotografía reciente, solo se ven las manos del doctor sujetando la cámara frente a la cámara de contención.

Detrás de cada fotografía hay una fecha. Todas se detienen en octubre de 2017.

Una nota escrita en el muro: «Si guardo suficientes imágenes, no tendré que aceptar que el tiempo siguió avanzando sin ella».

No se sabe quién escribió la frase.`},
 l20:{title:'Último diario de Adrian Voss',text:`Hoy he escuchado la voz de Lucía incluso cuando la cámara estaba apagada.

El compuesto me llama con más fuerza que ella. Ya no sé si la dosis me permite oírla o si solo ha aprendido qué palabras necesito escuchar.

Mañana me administraré Ω. No habrá más pruebas ni comités ni pacientes intermedios. Si funciona, Lucía volverá. Si no funciona, no tendré que soportar otra mañana.

He pasado años afirmando que la muerte es un problema técnico. Tal vez lo que nunca pude aceptar es que hay problemas que no se resuelven con conocimiento.

Si Wilson llega, no lo detengan. Quiero que vea lo que hice. Quiero que alguien recuerde que intenté salvarla.

No escribí que intenté salvar a los demás.`},
 l21:{title:'Carta de Lucía · encontrada entre las fotografías',text:`Papá:

Hoy me dolió menos. La enfermera dice que debo descansar, pero yo quiero que vengas a leerme el cuento del faro.

No te enfades con los doctores. Ellos hicieron lo que pudieron. Tú también.

Cuando vuelva a casa, quiero plantar flores en el jardín. No tienen que ser perfectas. Solo quiero que crezcan.

Te quiero mucho. No llegues tarde.

— Lucía

En el reverso, con letra adulta: «Llegué tarde. Y desde entonces he intentado construir una puerta que no existe».

La segunda frase no estaba en el original. Fue añadida por Adrian Voss.`}
});
