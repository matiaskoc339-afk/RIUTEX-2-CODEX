// PARTE 3: Instalaciones militares del proyecto. Datos, props, documentos y el jefe Sargento Varga.
const _lane = (x, y) => (y >= 28 && y <= 30 && x >= 14 && x <= 25) || (x >= 14 && x <= 16 && y >= 28 && y <= 39); // carril seguro del campo minado
const Base = {
  spawn: [7, 6], boss: [86, 42],
  items: [
    ['b_mat_ss1','screw_small',33,15,{amount:4}], ['b_mat_ps1','powder_small',34,15,{amount:4}], ['b_mat_sg1','screw_large',55,51,{amount:2}], ['b_mat_pg1','powder_large',61,49,{amount:2}], ['b_mat_ss2','screw_small',48,33,{amount:3}], ['b_mat_ps2','powder_small',51,33,{amount:3}], ['b_mat_sg2','screw_large',83,31,{amount:2}], ['b_mat_pg2','powder_large',86,31,{amount:2}],
    _F('caja_b1', 'caja', 9, 8), _F('caja_b2', 'caja', 50, 25), _D('b1', 5, 4), ['m_a1', 'ammo', 11, 5], ['m_sh1', 'shells', 4, 9],
    _D('b2', 15, 9), ['m_ig1', 'inj_green', 23, 6], _D('b3', 45, 3), ['m_a2', 'ammo', 34, 14], ['m_sh2', 'shells', 49, 13], ['m_smg1', 'smg', 35, 3],
    _K('mka', 'llave_arm_a', 75, 3), _D('b8', 72, 13), _D('b4', 68, 9), ['m_ig2', 'inj_green', 62, 3], ['m_a3', 'ammo', 75, 14], ['m_smg2', 'smg', 76, 9], _F('taquilla', 'taquilla', 76, 5),
    _D('b7', 31, 26), ['m_a4x', 'ammo', 50, 32], _D('b6', 61, 23), _D('b5', 72, 24), ['m_a4', 'ammo', 72, 32], _D('b17', 27, 29), ['m_a5', 'ammo', 25, 29], ['m_ig3', 'inj_green', 15, 37],
    _K('mkb', 'llave_arm_b', 22, 53), _D('b9', 24, 46), _D('b10', 6, 53), _D('b15', 20, 52), ['m_a6', 'ammo', 7, 50], ['m_sh3', 'shells', 20, 51], ['m_yel', 'inj_yellow', 5, 54], ['m_mp', 'mod_prec', 12, 53],
    _D('b11', 34, 48), _D('b16', 31, 49), ['m_a7', 'ammo', 31, 47], ['m_sh4', 'shells', 55, 40], ['m_smg3', 'smg', 45, 40], ['m_ig4', 'inj_green', 50, 50],
    ['m_rifle', 'rifle', 63, 45], ['m_ra1', 'rifleammo', 66, 45], _K('mkt', 'tarjeta', 60, 47), ['m_modm', 'mod_mag', 68, 46], ['m_modr', 'mod_rate', 60, 44], _D('b12', 65, 47), ['m_ra3', 'rifleammo', 68, 43],
    _F('mandoT', 'terminalM', 85, 22), _D('b14', 80, 29), _D('b13', 91, 29), ['m_ig5', 'inj_green', 79, 19], ['m_a8', 'ammo', 92, 29], ['m_sh5', 'shells', 92, 19], ['m_a9', 'ammo', 76, 40], ['m_sh6', 'shells', 95, 50], ['m_ig6', 'inj_green', 76, 50], ['m_ib1', 'inj_blue', 55, 52], ['m_smg4', 'smg', 95, 40], ['m_ra2', 'rifleammo', 90, 50]
  ],
  enemies: [
    [401, 'soldado', 20, 6], [402, 'torreta', 23, 10], [403, 'cazador', 28, 8],
    [404, 'soldado', 36, 8], [405, 'soldado', 45, 9], [406, 'torreta', 34, 3], [407, 'torreta', 49, 14], [408, 'cazador', 42, 12], [409, 'hoja', 40, 5], [410, 'soldado', 47, 6],
    [411, 'cazador', 55, 8],
    [412, 'hoja', 66, 9], [413, 'soldado', 70, 11], [414, 'soldado', 64, 12], [415, 'cazador', 72, 6], [416, 'coloso', 69, 10],
    [417, 'soldado', 41, 19],
    [418, 'cazador', 33, 30], [419, 'soldado', 38, 28], [420, 'hoja', 47, 26], [421, 'soldado', 48, 31], [422, 'torreta', 51, 25],
    [423, 'cazador', 55, 28],
    [424, 'soldado', 63, 29], [425, 'soldado', 70, 27], [426, 'hoja', 66, 31], [427, 'torreta', 73, 23],
    [428, 'cazador', 27, 29],
    [429, 'soldado', 10, 26], [430, 'soldado', 20, 35], [431, 'cazador', 8, 36], [432, 'torreta', 4, 24],
    [433, 'cazador', 15, 42],
    [434, 'cazador', 8, 47], [435, 'cazador', 14, 50], [436, 'hoja', 20, 47], [437, 'coloso', 12, 52], [438, 'cazador', 22, 50], [439, 'soldado', 6, 50],
    [440, 'soldado', 41, 36],
    [441, 'coloso', 40, 45], [442, 'hoja', 34, 42], [443, 'soldado', 48, 42], [444, 'soldado', 36, 49], [445, 'cazador', 52, 46], [446, 'torreta', 54, 39], [447, 'hoja', 44, 48],
    [448, 'soldado', 64, 43], [449, 'hoja', 67, 47], [450, 'cazador', 61, 46],
    [451, 'cazador', 75, 27],
    [452, 'soldado', 82, 24], [453, 'soldado', 90, 24], [454, 'hoja', 85, 28], [455, 'coloso', 88, 28], [456, 'torreta', 79, 20], [457, 'torreta', 92, 20]
  ],
  barrels: [[34, 10], [48, 10], [65, 12], [31, 31], [50, 28], [54, 47], [33, 45], [66, 29], [77, 40], [94, 40], [77, 49], [94, 49], [86, 48]]
};
for (let x = 5; x <= 24; x += 3) for (let y = 23; y <= 38; y += 3) if (!_lane(x, y) && !_lane(x - 1, y) && !_lane(x + 1, y) && !_lane(x, y - 1) && !_lane(x, y + 1)) Base.barrels.push([x, y, 1]); // minas (tercer valor = 1)
Object.assign(DOCS, {
  b1: { title: 'Cartel de acceso militar', text: `INSTALACIONES MILITARES · PROYECTO RIUTEX
Personal autorizado únicamente.

Los especímenes exitosos se registran en la Perrera y se asignan a unidades de campo. Se prohíbe hablar con ellos.` },
  b2: { title: 'Orden de repliegue', text: `REPLIEGUE INMEDIATO.
Quemen los archivos sensibles. Los especímenes no se evacúan.

Sargento Varga: permanezca en la base y elimine toda prueba. Nadie debe salir con lo que ha visto.` },
  b3: { title: 'Registro de radio · I', text: `Transmisiones del día de la evacuación:
18:05 · "Sin novedad en el perímetro."
21:30 · "Perrera abierta. Perdemos el control de los especímenes."` },
  b4: { title: 'Registro de radio · II', text: `19:40 · "Mando, solicitamos refuerzos en el hangar."
22:15 · "Varga, informe de situación." (Sin respuesta.)` },
  b5: { title: 'Registro de radio · III', text: `22:47 · "Aquí Varga. Que nadie abandone su puesto. Yo me encargo."
(Sin respuesta. No hubo más transmisiones.)` },
  b6: { title: 'Procedimiento del puesto de mando', text: `La clave del terminal del Puesto de mando es la hora de la ÚLTIMA transmisión registrada, sin los dos puntos (cuatro cifras).
Los registros de radio están repartidos por la base.` },
  b7: { title: 'Informe de misión Sierra', text: `Misión Sierra: emboscada en la zona norte.
Hombres desplegados: 14.
Hombres que regresaron: 1 (el sargento Varga, sin el brazo derecho).` },
  b8: { title: 'Nota del sargento Varga', text: `Escribí esto para no olvidarlo. Mi taquilla se abre con dos números de dos cifras: primero cuántos salimos, luego cuántos volvimos.
Catorce y uno. Siempre me falta el segundo.` },
  b9: { title: 'Informe: el corazón estabilizador', text: `El cuerpo del Sargento Varga rechaza RIUTEX-V1. Se le implantó un estabilizador cardíaco de metal que obliga a su organismo a ser compatible.
Resultado: fuerza, velocidad, un brazo mutante nuevo. Dolor constante.
Dr. Voss: "El corazón de metal lo mantiene en pie. Si falla, se desmorona."` },
  b10: { title: 'Diario de Varga', text: `Perdí a catorce hombres en Sierra. Perdí el brazo. Voss me ofreció volver a ser fuerte.
Acepté. Mi cuerpo gritó, pero el metal en mi pecho gritó más fuerte y lo calló.
Ahora limpio lo que otros ensucian. Es lo único que me queda.` },
  b11: { title: 'Archivo: armas vivas', text: `Los sujetos que superaban las pruebas se asignaban al ejército como "armas vivas".
Los que no obedecían, o se rompían, terminaban en la Perrera... y los que la Perrera no contenía, en las cloacas.` },
  b12: { title: 'Cuaderno privado de Emily · I', text: `Esto no es de Voss. Es mío.
Llevo meses poniéndole a I. dosis diminutas de V1 en el café, en la comida. Lo justo para que su cuerpo aprendiera sin romperse.
Nunca se lo dije. Creí que lo estaba protegiendo. Creí que, si algún día lo cogían, él aguantaría.` },
  b13: { title: 'Cuaderno privado de Emily · II', text: `Cuando vi lo que hacían con los demás intenté parar. Quise dejar de dárselo.
Pero ya era tarde... y peor: me encariñé. No era un sujeto. Era la única persona que me hacía reír.
Si lees esto, I.: tu cuerpo no es especial por casualidad. Lo hice yo. Y lo hice mal, y lo hice por amor.` },
  b14: { title: 'Nota de Voss a Varga', text: `Wilson va a llegar. Es el único que ha sobrevivido sin romperse; quiero ver hasta dónde llega.
Hazlo bien, Sargento. Elimina las pruebas. Y a él, si es necesario.
La puerta del laboratorio solo abre con tu tarjeta.` },
  b15: { title: 'Inventario de la Perrera', text: `Especímenes asignados: SOLDADOS (disparan), CAZADORES (rápidos), HOJAS (brazo-cuchilla), COLOSOS (blindados).
Estado: contención rota. Se recomienda no entrar sin escolta.` },
  b16: { title: 'Cartel del hangar', text: `PROHIBIDO ENCENDER MOTORES.
El Coloso reacciona al ruido y a las vibraciones.` },
  b17: { title: 'Plano del campo de pruebas', text: `El campo de pruebas está minado en todo el terreno.
El ÚNICO carril seguro está señalizado con cinta amarilla.` }
});
['b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b17'].forEach(i => CLUES.add(i));
Object.assign(PROP, {
  sandbag(c, x, y) { c.fillStyle = '#6a6040'; c.beginPath(); c.ellipse(x + 16, y + 20, 15, 9, 0, 0, 6.283); c.fill(); c.fillStyle = '#7a704a'; c.beginPath(); c.ellipse(x + 16, y + 14, 13, 8, 0, 0, 6.283); c.fill(); c.strokeStyle = '#4a4430'; c.beginPath(); c.moveTo(x + 6, y + 14); c.lineTo(x + 26, y + 14); c.stroke(); },
  rack(c, x, y) { c.fillStyle = '#3a3e3a'; c.fillRect(x, y + 4, 32, 24); c.fillStyle = '#1a1c1a'; for (let i = 0; i < 4; i++) c.fillRect(x + 4 + i * 7, y + 6, 3, 20); c.fillStyle = '#6a6e6a'; for (let i = 0; i < 4; i++) c.fillRect(x + 3 + i * 7, y + 8, 5, 3); },
  jeep(c, x, y) { c.fillStyle = '#4a5a3a'; c.fillRect(x, y + 6, 32, 20); c.fillStyle = '#2a3a22'; c.fillRect(x + 2, y + 8, 28, 5); c.fillStyle = '#111'; c.fillRect(x + 3, y + 22, 8, 6); c.fillRect(x + 21, y + 22, 8, 6); c.fillStyle = '#8aa0b0'; c.fillRect(x + 18, y + 10, 10, 5); }
});
Object.assign(DECO, {
  tape(c, x, y) { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#e0c020' : '#222'; c.fillRect(x + i * 8, y + 13, 8, 6); } },
  casing(c, x, y) { c.fillStyle = 'rgba(200,170,60,.8)'; for (let i = 0; i < 5; i++) c.fillRect(x + 6 + (i * 9) % 20, y + 8 + (i * 7) % 16, 3, 2); },
  hazard(c, x, y) { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? 'rgba(224,192,32,.55)' : 'rgba(30,30,30,.55)'; c.fillRect(x + i * 8, y + 2, 8, 28); } }
});
const BFURN = {
  sandbag: [[16, 6], [17, 6], [21, 9], [22, 9], [36, 5], [37, 5], [46, 5], [47, 5], [36, 12], [37, 12], [46, 12], [47, 12], [66, 12], [67, 12]],
  crate: [[39, 7], [43, 7], [39, 11], [43, 11], [74, 13], [75, 13], [31, 40], [32, 40], [54, 49], [53, 49], [5, 45], [58, 43]],
  jeep: [[36, 43], [37, 43], [46, 46], [47, 46], [42, 49], [43, 49]],
  bed: [[63, 3], [63, 5], [63, 7], [66, 3], [66, 5], [66, 7], [70, 3], [70, 5], [73, 3]],
  locker: [[62, 14], [63, 14], [64, 14], [61, 31], [62, 31], [79, 18], [80, 18], [92, 18], [93, 18]],
  rack: [[59, 41], [60, 41], [61, 41], [62, 41], [65, 41], [66, 41], [67, 41], [68, 41]],
  desk: [[64, 24], [65, 24], [68, 24], [69, 24], [81, 21], [82, 21], [83, 21], [88, 21], [89, 21], [90, 21]],
  machine: [[52, 40], [53, 40], [71, 31], [72, 31]],
  pillar: [[80, 42], [80, 47], [92, 42], [92, 47], [86, 44], [86, 46]],
  bars: [[6, 48], [7, 48], [8, 48], [9, 48], [12, 48], [13, 48], [14, 48], [15, 48], [18, 48], [19, 48], [20, 48], [21, 48]],
  table: [[35, 27], [36, 27], [45, 27], [46, 27], [35, 30], [36, 30], [45, 30], [46, 30], [85, 25], [86, 25], [85, 26], [86, 26]],
  shelf: [[31, 24], [32, 24], [33, 24], [58, 48], [59, 48]]
};
const BDECOR = [['paper', 6, 7], ['casing', 20, 8], ['casing', 44, 6], ['paper', 38, 9], ['hazard', 34, 8], ['hazard', 34, 9], ['casing', 64, 10], ['chair', 68, 12], ['paper', 70, 6], ['paper', 33, 28], ['chair', 47, 29], ['casing', 50, 26], ['glass', 66, 27], ['paper', 63, 30],
  ['bones', 8, 52], ['bones', 14, 46], ['bones', 22, 54], ['casing', 40, 41], ['hazard', 38, 44], ['hazard', 38, 45], ['paper', 62, 47], ['casing', 66, 42], ['paper', 84, 29], ['chair', 82, 27], ['glass', 90, 26], ['casing', 78, 44], ['casing', 94, 44], ['bones', 88, 48], ['hazard', 85, 53], ['hazard', 86, 53]];
Level.buildBase = function () {
  this.W = 100; this.H = 70; this.wc = ['#22241f', '#34382e', '#10120e']; this.bricks = false; this.fluid = null; this.bossZone = [74 * TILE, 38 * TILE, 98 * TILE, 52 * TILE];
  const tapes = []; for (let x = 14; x <= 25; x++) tapes.push(['tape', x, 27]); for (let x = 17; x <= 25; x++) tapes.push(['tape', x, 31]); for (let y = 28; y <= 39; y++) tapes.push(['tape', 13, y]); for (let y = 31; y <= 39; y++) tapes.push(['tape', 17, y]);
  this.decor = BDECOR.concat(tapes);
  const g = this.grid = [], tn = this.tint = []; for (let y = 0; y < this.H; y++) { g.push(new Array(this.W).fill(1)); tn.push(new Array(this.W).fill(null)); }
  const c = (x, y, w, h, col) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { g[j][i] = 0; tn[j][i] = col; } };
  const BT = { 'Túnel de acceso': '#25272a', 'Puesto de control': '#2a2d28', 'Patio de armas': '#33342c', 'Barracones': '#2e2c28', 'Comedor': '#32302a', 'Sala de comunicaciones': '#262a2e', 'Campo de pruebas': '#3a3626', 'Perrera de especímenes': '#2c2628', 'Hangar': '#2e3030', 'Armería': '#292b2a', 'Puesto de mando': '#242a2c', 'Antesala del laboratorio': '#262c30' };
  this.rooms = [['Túnel de acceso', 3, 3, 10, 8], ['Puesto de control', 13, 5, 12, 6], ['Pasillo', 25, 7, 8, 3], ['Patio de armas', 33, 2, 18, 14], ['Pasillo', 51, 7, 10, 3], ['Barracones', 61, 2, 16, 14], ['Pasillo', 40, 16, 3, 8], ['Comedor', 30, 24, 22, 10],
    ['Pasillo', 52, 27, 8, 3], ['Sala de comunicaciones', 60, 22, 14, 12], ['Pasillo', 26, 28, 4, 3], ['Campo de pruebas', 4, 22, 22, 18], ['Pasillo', 14, 40, 3, 4], ['Perrera de especímenes', 4, 44, 22, 12], ['Pasillo', 40, 34, 3, 4],
    ['Hangar', 30, 38, 26, 14], ['Pasillo', 56, 43, 2, 3], ['Armería', 58, 40, 12, 10], ['Pasillo', 74, 26, 4, 3], ['Puesto de mando', 78, 18, 16, 14], ['Pasillo', 86, 32, 3, 6], ['Antesala del laboratorio', 74, 38, 24, 14], ['Pasillo', 84, 52, 4, 5]]
    .map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
  this.rooms.forEach(r => c(r.x, r.y, r.w, r.h, BT[r.n] || '#2a2b2c'));
  this.props = {}; for (const t in BFURN) for (const [x, y] of BFURN[t]) { g[y][x] = 4; this.props[x + ',' + y] = t; }
  this.doors = []; const D = (id, x, y, w, h, key) => { const d = { id, key, open: false, tiles: [] }; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { d.tiles.push([i, j]); g[j][i] = key ? 3 : 2; } this.doors.push(d); };
  D('armeria', 56, 43, 1, 3, 'armeria'); D('mando', 74, 26, 1, 3, 'tarjeta'); D('approach', 86, 32, 3, 1, 'approach'); D('lab', 84, 52, 4, 1, 'lab');
  this.decals = []; let s = 23; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (const r of this.rooms) for (let i = 0; i < Math.ceil(r.w * r.h / 16); i++) this.decals.push({ x: (r.x + rnd() * r.w) * TILE, y: (r.y + rnd() * r.h) * TILE, r: 6 + rnd() * 14, c: rnd() < .6 ? 'rgba(80,8,12,.35)' : 'rgba(20,20,14,.35)' });
  this.lamps = this.rooms.filter(r => r.n !== 'Pasillo').map(r => ({ x: (r.x + r.w / 2) * TILE, y: (r.y + r.h / 2) * TILE, r: Math.min(270, Math.max(r.w, r.h) * 16 + 40) }));
};
// Jefe final de la Parte 3: Sargento Varga. Guardia alta (de frente casi no le haces daño); queda expuesto tras fallar una carga o al sobrecargar su corazón de metal.
class Varga extends Enemy {
  constructor(id, x, y) {
    super('vacio', x, y, id); this.def = { name: 'Sargento Varga', hp: 1900, speed: 140, dmg: 32, detect: 9999, range: 56, cooldown: .8, xp: 600, small: false };
    Object.assign(this, { hp: 1900, maxHp: 1900, r: 17, active: false, mode: 'chase', mt: 0, isBoss: true, dir: 0, atk: '', pulseCd: 8, whipCd: 5, warned: false });
  }
  hurt(dmg, angle, g, pierce) {
    if (this.dead) return; this.active = true; let k = this.mode === 'expose' ? 2.2 : this.mode === 'recover' ? 1 : pierce ? 1 : .25;
    if (k < .5 && !this.warned) { this.warned = true; UI.msg('Cubre su corazón con el brazo: espera a que ataque y falle, o usa los barriles.', 5000); }
    this.hp -= dmg * k; this.hitFlash = .06; g.sparks(this.x, this.y, k < .5 ? 3 : 7, k < .5 ? '#aaaaaa' : '#7a0a14'); Sound.play('enemyhit'); if (this.hp <= 0) this.die(g);
  }
  die(g) { this.dead = true; g.killed.add(this.id); g.player.xp += mutationXPReward(this.def, !!this.isBoss, g.mut); g.player.onKill(g); g.bodies.push({ x: this.x, y: this.y, a: this.face }); g.ring(this.x, this.y, 260, '#ff6060'); g.cam.shake = 18; g.pz.boss3 = true; g.bossDrops(); UI.msg('Varga cae. Su corazón de metal se apaga… y suelta la tarjeta del laboratorio.', 7000); Sound.play('enemydie'); }
  update(dt, g) {
    if (this.dead || !this.active) return; const p = g.player, dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1, hpf = this.hp / this.maxHp, rage = hpf < .55, last = hpf < .25, m = this.mode;
    this.t += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); this.mt -= dt; this.pulseCd -= dt; this.whipCd -= dt; if (m !== 'dashing' && m !== 'wind') this.face = Math.atan2(dy, dx);
    if (m === 'recover' || m === 'expose') { if (this.mt <= 0) this.mode = 'chase'; return; }
    if (m === 'wind') {
      if (this.atk === 'slash') this.face = Math.atan2(dy, dx);
      if (this.mt > 0) return;
      if (this.atk === 'slash') { if (d < this.def.range + 28) p.hurt(this.def.dmg, this.face, g); g.ring(this.x + Math.cos(this.face) * 30, this.y + Math.sin(this.face) * 30, 50, '#d8a0ff'); this.mode = 'recover'; this.mt = .7; this.cd = this.def.cooldown; }
      else if (this.atk === 'dash') { this.mode = 'dashing'; this.mt = .35; Sound.play('attack'); }
      else if (this.atk === 'whip') { const ux = Math.cos(this.face), uy = Math.sin(this.face), t = dx * ux + dy * uy, off = Math.abs(dx * uy - dy * ux); if (t > 0 && t < 240 && off < 28) p.hurt(26, this.face, g); g.ring(this.x + ux * 120, this.y + uy * 120, 70, '#d8a0ff'); this.mode = 'recover'; this.mt = .65; this.whipCd = 4.5; }
      else if (this.atk === 'pulse') { g.ring(this.x, this.y, 150, '#ff5050'); g.cam.shake = 12; if (d < 150) p.hurt(24, Math.atan2(dy, dx), g); this.mode = 'expose'; this.mt = 1.9; this.pulseCd = 7; UI.msg('¡Su corazón queda expuesto! Dispara ahora.', 1800); }
      return;
    }
    if (m === 'dashing') {
      const sp = 620 * dt, ox = this.x, oy = this.y; Level.move(this, Math.cos(this.dir) * sp, Math.sin(this.dir) * sp);
      if (d < this.r + p.r + 6) { p.hurt(28, this.dir, g); this.mode = 'recover'; this.mt = .55; this.cd = this.def.cooldown; return; }
      if (Math.hypot(this.x - ox, this.y - oy) < sp * .5 || this.mt <= 0) { this.mode = 'expose'; this.mt = 2.0; this.cd = this.def.cooldown; g.sparks(this.x, this.y, 12, '#ff8030'); g.cam.shake = 8; UI.msg('¡Falló la carga! Dispara a su pecho.', 1800); } return;
    }
    this.cd -= dt;
    if (this.cd <= 0) {
      if (rage && this.pulseCd <= 0 && d < 220) { this.mode = 'wind'; this.atk = 'pulse'; this.mt = .65; return; }
      if (rage && this.whipCd <= 0 && d > 110 && d < 230) { this.mode = 'wind'; this.atk = 'whip'; this.mt = .42; return; }
      if (d < this.def.range + 6) { this.mode = 'wind'; this.atk = 'slash'; this.mt = last ? .2 : .28; return; }
      if (d > 120) { this.mode = 'wind'; this.atk = 'dash'; this.dir = Math.atan2(dy, dx); this.mt = last ? .24 : .38; return; }
    }
    if (d > this.def.range * .7) { const sp = this.def.speed * (rage ? 1.15 : 1) * (last ? 1.15 : 1) * dt; Level.move(this, dx / d * sp, dy / d * sp); }
  }
  draw(ctx) {
    if (this.mode === 'dashing') { ctx.fillStyle = 'rgba(160,120,200,.25)'; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(this.x - Math.cos(this.dir) * i * 14, this.y - Math.sin(this.dir) * i * 14, 15, 0, 6.283); ctx.fill(); } }
    ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(3, 5, 20, 16, 0, 0, 6.283); ctx.fill();
    if (this.mode === 'wind') { ctx.strokeStyle = 'rgba(255,60,60,.6)'; ctx.lineWidth = this.atk === 'pulse' ? 3 : 6; ctx.beginPath(); if (this.atk === 'pulse') ctx.arc(0, 0, 150, 0, 6.283); else { const a = this.atk === 'dash' ? this.dir : this.face, L = this.atk === 'dash' ? 380 : this.atk === 'whip' ? 240 : 80; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); } ctx.stroke(); }
    const ex = this.mode === 'expose'; ctx.rotate(this.face);
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#4a5242'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 19, 0, 0, 6.283); ctx.fill();                   // torso con chaleco
    ctx.fillStyle = '#2a3026'; ctx.fillRect(-6, -14, 10, 28);
    ctx.fillStyle = '#b89a82'; ctx.fillRect(6, -18, 16, 5);                                                                                          // brazo izquierdo
    ctx.fillStyle = '#7a4a6a'; ctx.beginPath(); ctx.moveTo(4, 12); ctx.lineTo(26, 14); ctx.lineTo(52, 8); ctx.lineTo(28, 22); ctx.lineTo(4, 20); ctx.fill();  // brazo mutante con cuchilla
    ctx.fillStyle = '#c8b8d8'; ctx.beginPath(); ctx.moveTo(40, 9); ctx.lineTo(62, 6); ctx.lineTo(44, 15); ctx.fill();
    ctx.fillStyle = ex ? '#ff3030' : '#30d8ff'; ctx.beginPath(); ctx.arc(5, 0, ex ? 7 : 4, 0, 6.283); ctx.fill();                                     // corazón de metal
    if (ex) { ctx.strokeStyle = 'rgba(255,80,80,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(5, 0, 11 + Math.sin(this.t * 14) * 2, 0, 6.283); ctx.stroke(); }
    ctx.fillStyle = '#b89a82'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.283); ctx.fill(); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-1, -3, 8, 3); ctx.fillStyle = '#ff4020'; ctx.fillRect(5, 1, 2, 2); // cabeza
    ctx.restore();
  }
}
