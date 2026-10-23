// RIUTEX 2 · Fase 1 — DATOS. Mansión (prólogo) y Hospital de San Gabriel en 3 plantas (estilo comisaría RE2).
// Convención: rooms = [nombre, x, y, w, h] (suelo). cuts = pasos abiertos sin puerta. doors = [id,x,y,w,h,llave]. Coordenadas en tiles.
Object.assign(TINT, { 'Jardín': '#1f2a22', 'Vestíbulo': '#2f2a26', 'Salón': '#33292a', 'Comedor': '#2f2c26', 'Biblioteca': '#2a2a30', 'Estudio': '#2e2a2c', 'Cocina': '#2d3232', 'Cámara fría': '#243238',
  'Habitación 12': '#2c3436', 'Vestíbulo central': '#2e3336', 'Archivo': '#2d2c30', 'Oficinas': '#33312c', 'Sala de descanso': '#2c3a34', 'Lavandería': '#26303a', 'Consultorios': '#2b3638', 'Capilla': '#332e34',
  'Cafetería': '#34312c', 'Cocina del hospital': '#303434', 'Urgencias': '#2b3538', 'Farmacia': '#2a3a36', 'Morgue': '#252d33', 'Rayos X': '#272e36',
  'UCI': '#2a3436', 'Quirófano': '#2e3a3c', 'Biblioteca médica': '#2c2b32', 'Dirección': '#352c2a', 'Habitación 07': '#2a2c2c', 'Laboratorio de Wren': '#26303a', 'Sala de pruebas': '#2a2e32', 'Archivo clínico': '#2d2c2a', 'Descansillo': '#2c3436',
  'Rellano': '#2a2e30', 'Calderas': '#30302a', 'Generadores': '#2d2e2a', 'Almacén': '#2c2c28', 'Garaje': '#2a2a2c', 'Calle': '#1c2024' });
Object.assign(KEYS, { estudio: 'Llave del estudio', archivo: 'Llave del archivo', urgencias: 'Llave de Urgencias', farmacia: 'Tarjeta de Farmacia', morgue: 'Llave de la Morgue', cocina: 'Llave de la cocina', sotano: 'Llave del sótano', pase_sup: 'Pase de planta alta', hab07: 'Llave de la habitación 07', director: 'Llave de Dirección', bib: 'Llave de la biblioteca médica', garaje: 'Llave de la rampa del garaje', 'h:power': 'Energía del garaje', 'h:boss': 'Salida del garaje', 'h:shutter': 'Persiana', 'h:forced': 'Puerta atascada', 'h:sealed': 'Puertas principales', 'h:front': 'Puerta principal', 'h:secret': 'Pasadizo' });
PROP.drawer = (c, x, y) => { c.fillStyle = '#7d878c'; c.fillRect(x + 1, y + 2, 30, 28); c.fillStyle = '#5c666b'; c.fillRect(x + 3, y + 5, 26, 10); c.fillRect(x + 3, y + 18, 26, 10); c.fillStyle = '#c9ced1'; c.fillRect(x + 13, y + 9, 6, 2); c.fillRect(x + 13, y + 22, 6, 2); };
PROP.clock = (c, x, y) => { c.fillStyle = '#4a3220'; c.fillRect(x + 6, y + 1, 20, 30); c.fillStyle = '#d8d0b0'; c.beginPath(); c.arc(x + 16, y + 11, 7, 0, 6.283); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 16, y + 11); c.lineTo(x + 16, y + 6); c.moveTo(x + 16, y + 11); c.lineTo(x + 20, y + 13); c.stroke(); c.fillStyle = '#c0a040'; c.fillRect(x + 14, y + 20, 4, 8); };
PROP.tree = (c, x, y) => { c.fillStyle = '#16301c'; c.beginPath(); c.arc(x + 16, y + 16, 15, 0, 6.283); c.fill(); c.fillStyle = '#1f4a28'; c.beginPath(); c.arc(x + 13, y + 13, 9, 0, 6.283); c.fill(); };
PROP.gen = (c, x, y) => { c.fillStyle = '#4b5148'; c.fillRect(x + 1, y + 2, 30, 28); c.fillStyle = '#c0a030'; c.fillRect(x + 1, y + 2, 30, 4); c.fillStyle = '#20241f'; c.fillRect(x + 5, y + 10, 22, 14); c.fillStyle = '#6a7a60'; for (let i = 0; i < 4; i++) c.fillRect(x + 7 + i * 5, y + 12, 3, 10); };
PROP.stairs = (c, x, y) => { c.fillStyle = '#3a3a3e'; c.fillRect(x, y, 32, 32); c.fillStyle = '#55555c'; for (let i = 0; i < 5; i++) c.fillRect(x + 2, y + 2 + i * 6, 28, 4); };

const _FX = (id, type, x, y, ex) => [id, type, x, y, Object.assign({ fixed: true }, ex)]; // fijo con propiedades extra (escaleras)
const MANSION = {
  W: 64, H: 52, spawn: [31, 46], safe: [], patrol: [],
  rooms: [['Jardín', 18, 41, 28, 8], ['Vestíbulo', 22, 31, 20, 9], ['Salón', 14, 19, 36, 11], ['Comedor', 51, 18, 12, 10], ['Cocina', 51, 29, 12, 9], ['Biblioteca', 2, 19, 11, 10], ['Estudio', 22, 10, 20, 8], ['Cámara fría', 26, 2, 12, 7]],
  cuts: [],
  furn: { tree: [[19, 42], [19, 46], [44, 42], [44, 46], [25, 44], [37, 44]], pillar: [[24, 34], [39, 34], [20, 22], [43, 22]], bench: [[16, 21], [17, 21], [46, 21], [47, 21]], table: [[30, 24], [33, 24], [55, 22], [56, 22], [57, 22]], clock: [[31, 10]],
    shelf: [[3, 19], [4, 19], [5, 19], [7, 19], [8, 19], [9, 19], [3, 27], [4, 27], [8, 27], [9, 27], [23, 10], [24, 10], [38, 10], [39, 10]], desk: [[32, 13], [33, 13], [34, 13], [5, 23]], counter: [[53, 31], [54, 31], [55, 31], [59, 31], [60, 31]], crate: [[60, 36], [52, 36]], locker: [[27, 3], [36, 3]] },
  decor: [['chair', 17, 25], ['paper', 20, 24], ['glass', 31, 27], ['paper', 7, 24], ['chair', 10, 25], ['glass', 55, 25], ['puddle', 56, 34], ['paper', 36, 14], ['chair', 28, 14], ['wheel', 36, 36]],
  doors: [['front', 30, 40, 4, 1, null], ['salon', 30, 30, 4, 1, null], ['bib', 13, 22, 1, 3, null], ['com', 50, 21, 1, 3, null], ['coc', 56, 28, 3, 1, null], ['estudio', 30, 18, 4, 1, 'estudio'], ['secreto', 30, 9, 4, 1, 'h:secret']],
  items: [
    _D('m1', 28, 38), ['ma1', 'ammo', 36, 38], ['ma2', 'ammo', 25, 39], _D('m2', 8, 23), ['mig1', 'inj_green', 6, 26], _D('m3', 17, 27), ['ma3', 'ammo', 12, 21], _D('m4', 58, 24), ['mk1', 'key', 53, 26, { key: 'estudio' }], ['ma4', 'ammo', 60, 20],
    _D('m6', 55, 35), ['mig2', 'inj_green', 61, 30], _F('h_clock', 'h_clock', 31, 12), _D('m7', 38, 16), ['ma5', 'ammo', 26, 16], _F('h_vial', 'h_vial', 32, 5), _D('m8', 28, 6), _F('savebed_mansion', 'savebed', 36, 36)
  ],
  enemies: [[701, 'latente', 28, 22], [702, 'vacio', 40, 26], [703, 'latente', 56, 20], [704, 'latente', 59, 25], [705, 'vacio', 55, 33], [706, 'trepador', 60, 34], [707, 'latente', 6, 22], [708, 'vacio', 9, 26], [709, 'vacio', 26, 14]],
  barrels: []
};

// ---------------------------------------------------------------- HOSPITAL: 3 plantas
const FLOORS = {
  hospital: { // PLANTA BAJA: tramo lineal inicial (Hab.12 -> pasillo largo -> persiana) + vestíbulo central y alas oeste / este
    W: 100, H: 60, spawn: [7, 6], safe: [[3, 32, 16, 38], [23, 32, 36, 40]], // Sala de descanso y Capilla: el Carnicero no entra
    rooms: [['Habitación 12', 3, 3, 9, 8], ['Pasillo largo', 13, 6, 41, 3], ['Pasillo norte', 51, 10, 3, 10], ['Vestíbulo central', 38, 21, 27, 15],
      ['Pasillo oeste', 22, 27, 15, 3], ['Ala oeste', 18, 10, 4, 38], ['Archivo', 3, 10, 14, 9], ['Oficinas', 3, 21, 14, 9], ['Sala de descanso', 3, 32, 14, 7], ['Lavandería', 3, 41, 14, 8], ['Consultorios', 23, 10, 14, 13], ['Capilla', 23, 32, 14, 9],
      ['Pasillo este', 66, 27, 15, 3], ['Ala este', 81, 10, 4, 38], ['Urgencias', 86, 10, 12, 10], ['Farmacia', 86, 22, 12, 8], ['Morgue', 86, 32, 12, 9], ['Rayos X', 86, 43, 12, 6], ['Cafetería', 66, 10, 14, 13], ['Cocina del hospital', 66, 32, 14, 10]],
    cuts: [[51, 9, 3, 1]],
    doors: [['hab12', 12, 6, 1, 3, null], ['forced', 44, 6, 1, 3, 'h:forced'], ['shutter', 51, 20, 3, 1, 'h:shutter'], ['lob_w', 37, 27, 1, 3, null], ['lob_e', 65, 27, 1, 3, null], ['sealed', 50, 36, 5, 1, 'h:sealed'],
      ['arch', 17, 13, 1, 3, 'archivo'], ['ofi', 17, 24, 1, 3, null], ['des', 17, 34, 1, 3, null], ['lav', 17, 41, 1, 3, null], ['sot', 18, 44, 4, 1, 'sotano'], ['con', 22, 14, 1, 3, null], ['cap', 22, 35, 1, 3, null],
      ['urg', 85, 13, 1, 3, 'urgencias'], ['far', 85, 24, 1, 3, 'farmacia'], ['mor', 85, 34, 1, 3, 'morgue'], ['ray', 85, 45, 1, 3, null], ['caf', 80, 14, 1, 3, null], ['coc', 80, 35, 1, 3, 'cocina']],
    furn: { bed: [[4, 3], [8, 3], [20, 6], [28, 8], [36, 6], [24, 7]], crate: [[40, 6], [48, 8], [41, 33]], pillar: [[42, 24], [60, 24], [42, 32], [60, 32], [47, 28], [55, 28]], counter: [[44, 33], [45, 33], [46, 33], [57, 33], [58, 33]], bench: [[40, 23], [41, 23], [61, 23], [62, 23]],
      desk: [[4, 22], [5, 22], [6, 22], [12, 27], [13, 27], [27, 12], [28, 12]], shelf: [[3, 10], [4, 10], [5, 10], [6, 10], [10, 10], [11, 10], [12, 10], [3, 17], [4, 17], [11, 17], [12, 17], [13, 17]], machine: [[4, 41], [5, 41], [6, 41], [10, 41], [11, 41]],
      table: [[69, 14], [70, 14], [74, 18], [75, 18], [70, 36], [73, 36]], locker: [[24, 10], [35, 10]], drawer: [[88, 32], [89, 32], [90, 32], [92, 32], [93, 32], [94, 32], [95, 32], [96, 32]] },
    decor: [['wheel', 15, 7], ['paper', 18, 8], ['glass', 32, 7], ['puddle', 48, 7], ['paper', 44, 25], ['glass', 58, 30], ['puddle', 52, 18], ['wheel', 30, 28], ['paper', 20, 20], ['glass', 82, 20], ['paper', 70, 28], ['puddle', 90, 15]],
    patrol: [[52, 14], [51, 26], [45, 24], [58, 26], [30, 28], [20, 24], [20, 40], [28, 20], [72, 28], [82, 22], [82, 40], [72, 16], [90, 26]],
    items: [
      _D('h1', 10, 9), _D('h2', 4, 9), _D('h3', 30, 7), _D('o2', 52, 12), ['pp1', 'pistol', 45, 34], ['pa1', 'ammo', 47, 34], ['pa2', 'ammo', 44, 22], _F('caja_p1', 'caja', 40, 34), _F('hide_p1', 'h_hide', 40, 22), _FX('stairs_up', 'h_stairs', 62, 22, { to: 'hospital1', at: [50, 45], need: 'pase_sup' }), _FX('stairs_dn_b', 'h_stairs', 19, 46, { to: 'hospitalb', at: [8, 10] }),
      _D('o1', 5, 24), ['hk_arch', 'key', 14, 27, { key: 'archivo' }], ['pig1', 'inj_green', 5, 28], ['pa3', 'ammo', 9, 22], _D('a1', 8, 12), _D('a2', 14, 16), ['hk_urg', 'key', 15, 11, { key: 'urgencias' }], ['pa4', 'ammo', 6, 17],
      _F('savebed_hospital', 'savebed', 5, 35), _F('caja_p2', 'caja', 14, 33), _D('d1', 14, 37), _D('l1', 8, 44), ['pm1', 'mod_mag', 13, 46], ['pig2', 'inj_green', 5, 47], _F('hide_p2', 'h_hide', 30, 28),
      _D('con1', 26, 12), ['hk_coc', 'key', 34, 20, { key: 'cocina' }], ['pa5', 'ammo', 31, 17], ['pig3', 'inj_green', 24, 21], _D('ca1', 33, 34), _F('savebed_hospital_b', 'savebed', 25, 37), ['pcase', 'case', 35, 38],
      _D('c1', 68, 12), ['hk_pase', 'key', 77, 20, { key: 'pase_sup' }], ['pa6', 'ammo', 70, 20], ['pib1', 'inj_blue', 78, 12], _F('hide_p3', 'h_hide', 72, 28),
      _D('k1', 69, 34), ['hk_sot', 'key', 77, 40, { key: 'sotano' }], ['pig4', 'inj_green', 68, 40], ['pa7', 'ammo', 76, 34],
      _D('u1', 88, 12), ['hk_far', 'key', 95, 17, { key: 'farmacia' }], ['pa8', 'ammo', 90, 18], ['pig5', 'inj_green', 96, 11], ['pcr', 'rifleammo', 92, 13],
      _D('f1', 89, 25), _F('h_cab', 'h_cab', 96, 27), ['pa9', 'ammo', 94, 24], ['phs', 'shells', 90, 27],
      _D('mo1', 90, 35), _D('mo2', 95, 38), ['hk_fa', 'key', 94, 39, { key: 'fusible_a' }], ['pig6', 'inj_green', 87, 38], ['phs2', 'shells', 92, 36],
      _D('x1', 90, 46), ['pa10', 'ammo', 95, 45], ['pib2', 'inj_blue', 87, 47], _F('hide_p4', 'h_hide', 83, 20)
    ],
    enemies: [
      [801, 'sonambulo', 44, 26], [802, 'sonambulo', 58, 31], [803, 'latente', 40, 30],
      [804, 'sonambulo', 24, 14], [805, 'rastrero', 30, 17], [806, 'enfermera', 33, 21], [807, 'sonambulo', 10, 24], [808, 'rastrero', 6, 26], [809, 'latente', 8, 14], [810, 'sonambulo', 9, 15], [811, 'rastrero', 9, 45], [812, 'sonambulo', 12, 42],
      [813, 'sonambulo', 70, 15], [814, 'camillero', 75, 20], [815, 'rastrero', 68, 18], [816, 'sonambulo', 72, 36], [817, 'hinchado', 76, 38],
      [818, 'enfermera', 92, 12], [819, 'sonambulo', 89, 17], [820, 'camillero', 94, 14], [821, 'enfermera', 90, 26], [822, 'rastrero', 94, 28], [823, 'latente', 91, 36], [824, 'latente', 96, 34], [825, 'hinchado', 88, 40], [826, 'sonambulo', 92, 46], [827, 'rastrero', 95, 47],
      [828, 'sonambulo', 20, 18], [829, 'camillero', 20, 36], [830, 'sonambulo', 83, 34], [831, 'rastrero', 83, 12]
    ],
    barrels: [[44, 22], [62, 34], [74, 20], [92, 30]]
  },
  hospital1: { // PRIMER PISO
    W: 100, H: 56, spawn: [50, 44], safe: [[44, 40, 55, 47]],
    rooms: [['Descansillo', 44, 40, 12, 8], ['Pasillo alto', 8, 36, 84, 3], ['UCI', 8, 24, 21, 11], ['Quirófano', 30, 24, 22, 11], ['Biblioteca médica', 53, 24, 17, 11], ['Dirección', 71, 24, 21, 11],
      ['Habitación 07', 8, 40, 12, 9], ['Laboratorio de Wren', 22, 40, 18, 9], ['Sala de pruebas', 60, 40, 16, 9], ['Archivo clínico', 78, 40, 14, 9]],
    cuts: [[48, 39, 4, 1]],
    doors: [['uci', 16, 35, 3, 1, null], ['qui', 38, 35, 3, 1, null], ['bib', 60, 35, 3, 1, 'bib'], ['dir', 80, 35, 3, 1, 'director'], ['uq', 29, 28, 1, 3, null], ['qb', 52, 28, 1, 3, null], ['bd', 70, 28, 1, 3, 'director'], ['h07', 12, 39, 3, 1, 'hab07'], ['wren', 28, 39, 3, 1, null], ['pru', 66, 39, 3, 1, null], ['acl', 84, 39, 3, 1, null]],
    furn: { bed: [[10, 26], [10, 29], [14, 26], [14, 29], [22, 26], [22, 29], [9, 43], [11, 43]], table: [[36, 28], [37, 28], [44, 28], [45, 28], [66, 28]], machine: [[31, 25], [50, 25], [24, 42], [25, 42], [26, 42], [62, 42], [63, 42]], shelf: [[56, 25], [57, 25], [58, 25], [62, 25], [63, 25], [64, 25], [56, 32], [57, 32], [66, 32], [67, 32], [80, 42], [81, 42], [82, 42], [88, 42]],
      desk: [[76, 27], [77, 27], [78, 27], [86, 31], [30, 44]], crate: [[34, 44], [70, 45]], pillar: [[20, 37], [40, 37], [60, 37], [80, 37]], locker: [[73, 25], [90, 25]] },
    decor: [['paper', 14, 37], ['glass', 28, 37], ['puddle', 44, 37], ['wheel', 56, 38], ['paper', 70, 37], ['puddle', 12, 30], ['glass', 40, 30]],
    patrol: [[50, 37], [25, 37], [12, 37], [70, 37], [88, 37], [40, 30], [62, 30]],
    items: [
      _FX('stairs_dn', 'h_stairs', 50, 46, { to: 'hospital', at: [62, 24] }), _F('savebed_hospital1', 'savebed', 46, 44), ['q1a', 'ammo', 52, 44], ['q1g', 'inj_green', 45, 42], _D('p0', 49, 37),
      _D('p1', 12, 32), ['hk_h07', 'key', 24, 33, { key: 'hab07' }], ['q1b', 'ammo', 18, 25], ['q1c', 'inj_cure', 26, 25], _F('hide_u', 'h_hide', 9, 25),
      _D('p2', 33, 26), ['hk_fb', 'key', 48, 33, { key: 'fusible_b' }], ['q1d', 'ammo', 41, 32], ['q1e', 'inj_green', 34, 33], ['q1s', 'shells', 46, 26],
      _D('p3', 57, 27), ['hk_bib', 'key', 18, 46, { key: 'bib' }], ['hk_dir', 'key', 66, 33, { key: 'director' }], ['q1f', 'ammo', 68, 26], _D('p6', 74, 33),
      _F('h_safe', 'h_safe', 90, 27), _D('p9', 82, 26), _D('p4', 11, 47), ['q1i', 'inj_yellow', 18, 47], _D('p5', 32, 43), _D('p10', 38, 47), ['q1j', 'rifleammo', 38, 43], _D('p7', 70, 43), ['hrifle', 'inj_yellow', 74, 47], ['q1k', 'rifleammo', 72, 47],
      _D('p8', 86, 44), ['q1l', 'ammo', 90, 47], ['q1m', 'inj_blue', 80, 47], ['q1n', 'mod_prec', 62, 47], _F('caja_p3', 'caja', 85, 36), _F('hide_v', 'h_hide', 14, 37)
    ],
    enemies: [
      [901, 'sonambulo', 12, 28], [902, 'latente', 16, 31], [903, 'latente', 24, 28], [904, 'enfermera', 20, 32], [905, 'rastrero', 9, 30],
      [906, 'cirujano', 38, 28], [907, 'enfermera', 44, 32], [908, 'enfermera', 48, 26], [909, 'sonambulo', 34, 30],
      [910, 'sonambulo', 58, 28], [911, 'camillero', 65, 30], [912, 'rastrero', 56, 33], [913, 'hinchado', 68, 28],
      [914, 'cirujano', 82, 30], [915, 'sonambulo', 76, 31], [916, 'camillero', 88, 29],
      [917, 'sonambulo', 15, 45], [918, 'cirujano', 28, 46], [919, 'enfermera', 36, 45], [920, 'rastrero', 70, 44], [921, 'camillero', 66, 44], [922, 'hinchado', 82, 45], [923, 'sonambulo', 88, 44],
      [924, 'sonambulo', 30, 37], [925, 'rastrero', 76, 37]
    ],
    barrels: [[30, 33], [60, 33]]
  },
  hospitalb: { // SÓTANO: servicio, generadores, rampa y garaje (jefe)
    W: 90, H: 50, spawn: [8, 10], safe: [[4, 6, 13, 13]],
    rooms: [['Rellano', 4, 6, 10, 8], ['Pasillo de servicio', 15, 9, 60, 3], ['Calderas', 16, 13, 16, 9], ['Generadores', 36, 13, 16, 9], ['Almacén', 56, 13, 16, 9], ['Rampa', 72, 12, 4, 23], ['Garaje', 20, 36, 56, 11], ['Calle', 77, 40, 8, 5]],
    cuts: [[14, 9, 1, 3]],
    doors: [['cal', 22, 12, 3, 1, null], ['gen', 42, 12, 3, 1, null], ['alm', 62, 12, 3, 1, null], ['rampa', 72, 20, 4, 1, 'garaje'], ['garage', 72, 35, 4, 1, 'h:power'], ['exit', 76, 40, 1, 4, 'h:boss']],
    furn: { machine: [[18, 14], [19, 14], [28, 14], [29, 14], [18, 20], [29, 20]], crate: [[58, 14], [59, 14], [68, 14], [58, 20], [69, 20], [38, 14], [49, 20]], gen: [[39, 14], [40, 14], [47, 14], [48, 14]], pillar: [[26, 39], [34, 39], [42, 39], [50, 39], [58, 39], [66, 39], [26, 44], [34, 44], [42, 44], [50, 44], [58, 44], [66, 44]], shelf: [[60, 14], [61, 14], [66, 14], [67, 14]], bed: [[5, 7], [12, 7]] },
    decor: [['puddle', 20, 10], ['glass', 40, 10], ['paper', 60, 10], ['wheel', 30, 42], ['puddle', 52, 41], ['glass', 70, 45], ['paper', 24, 16]],
    patrol: [[20, 10], [40, 10], [60, 10], [74, 20], [30, 17], [44, 17], [64, 17]],
    items: [
      _FX('stairs_up2', 'h_stairs', 8, 12, { to: 'hospital', at: [19, 45] }), _F('savebed_hospitalb', 'savebed', 6, 9), _D('s1', 24, 18), ['b1a', 'ammo', 22, 16], ['b1g', 'inj_green', 30, 16], ['b1s', 'shells', 17, 19],
      _F('h_gen', 'h_gen', 43, 15), _D('s2', 38, 19), ['b2a', 'ammo', 50, 19], ['b2i', 'inj_blue', 46, 19],
      _D('s3', 58, 17), ['b3m', 'mod_pow', 66, 18], ['b3r', 'rifleammo', 62, 19], ['b3a', 'ammo', 69, 17], ['b3y', 'inj_yellow', 70, 14], ['b3g', 'inj_green', 60, 19],
      _D('s5', 74, 28), _F('hide_b', 'h_hide', 73, 30), _D('s6', 24, 38), ['b4a', 'ammo', 24, 45], ['b4g', 'inj_green', 22, 40], ['b4c', 'inj_green', 70, 38], ['b4x', 'shells', 62, 46], _F('savebed_hospitalb2', 'savebed', 21, 44),
      _D('s4', 79, 42)
    ],
    enemies: [
      [951, 'hinchado', 22, 16], [952, 'rastrero', 26, 20], [953, 'rastrero', 18, 17], [954, 'sonambulo', 25, 15],
      [955, 'sonambulo', 44, 19], [956, 'enfermera', 47, 16], [957, 'cirujano', 40, 20], [958, 'camillero', 38, 17],
      [959, 'camillero', 60, 16], [960, 'hinchado', 66, 19], [961, 'cirujano', 69, 15], [962, 'sonambulo', 58, 19],
      [963, 'sonambulo', 30, 10], [964, 'rastrero', 54, 10], [965, 'camillero', 74, 24], [966, 'enfermera', 74, 30]
    ],
    barrels: [[28, 10], [48, 10], [54, 18], [66, 40], [40, 42]]
  }
};
FLOORS.hospitalb.bossZone = [20 * TILE, 36 * TILE, 77 * TILE, 47 * TILE];

// ---------------------------------------------------------------- Nuevos enemigos de Fase 1 (estadísticas ya escaladas: hp x1.25, vel x1.1, detección x1.15)
Object.assign(ENEMY_TYPES, {
  sonambulo: { name: 'Sonámbulo', hp: 112, speed: 55, dmg: 12, detect: 190, range: 26, cooldown: 1.2, xp: 25, small: true, color: '#b9b2a8' },
  rastrero: { name: 'Rastrero', hp: 50, speed: 154, dmg: 9, detect: 210, range: 18, cooldown: .7, xp: 18, small: true, latent: true, r: 8, color: '#9a8a80' },
  enfermera: { name: 'Enfermera de ronda', hp: 88, speed: 66, dmg: 9, detect: 420, range: 24, cooldown: 2, xp: 45, small: false, r: 11, color: '#c8d8dc', rng: { min: 150, max: 260, speed: 270, burst: 1, wind: .5, range: 320, poison: 2.5, spread: .08 } },
  camillero: { name: 'Camillero', hp: 175, speed: 99, dmg: 24, detect: 380, range: 32, cooldown: 1.3, xp: 55, small: false, r: 14, color: '#6a7a8a' },
  hinchado: { name: 'Hinchado', hp: 200, speed: 42, dmg: 22, detect: 260, range: 34, cooldown: 1.9, xp: 60, small: false, r: 16, poison: 4, cloud: 62, color: '#a89a60' },
  cirujano: { name: 'Cirujano', hp: 175, speed: 100, dmg: 28, detect: 420, range: 30, cooldown: 1.3, xp: 80, small: false, r: 13, stealth: true, flank: true, color: '#5a8a7a' }
});

const R2_DOCS = {
  m1: { title: 'Orden de misión', text: `MANDO → CAPITÁN AXEL V.\n\nLocalizar al Dr. Elias Wren, bioquímico del programa Riutex, desaparecido hace 11 días. Última posición: su mansión.\n\nRegistrar. No consumir ni manipular muestras.\n\nPD: si encuentran algo, no lo toquen.` },
  m2: { title: 'Nota de Marta (Biblioteca)', text: `Elias dejó de dormir.\n\nEl reloj grande del estudio se paró a las 3:40, la hora exacta en que se llevaron a nuestra hija. Él lo usa como cerradura: dice que lo que más le duele es lo mejor guardado.\n\nNo toques nada. No lo despiertes si lo oyes bajar.` },
  m3: { title: 'Libro de visitas', text: `Última anotación, letra temblorosa:\n\n«Me vigila alguien del hospital de San Gabriel. Lo llaman EL CUSTODIO. Si me llevan, que busquen donde huele a formol.»\n\n— E. Wren` },
  m4: { title: 'Mesa del comedor', text: `Grabado a cuchillo en la mesa:\n\nLO QUE NO CURA, SE CORTA.\nLO QUE SE CORTA, SE GUARDA.\n\nLa silla del extremo está atada con alambre.` },
  m6: { title: 'Diario de cocina', text: `1. El señor Wren bajaba cada noche con una caja fría.\n2. Anoche volvió sin la caja. Sin la cara. Sin nada.\n3. Si alguien lee esto: no abra el estudio solo.` },
  m7: { title: 'Notas de Wren: RIUTEX-X', text: `El compuesto no cura: REESCRIBE tejido. Un hueso roto se suelda en segundos. Un miembro cortado vuelve a crecer.\n\nEl coste: cada dosis cambia al receptor. Pero si el cuerpo ya lo conoce, elige.\n\nHe guardado el único frasco estable donde nadie querría mirar: detrás del reloj.` },
  m8: { title: 'Nota junto al frasco', text: `Capitán:\n\nSi lees esto ya te vigilan. Guarda el frasco donde no lo busquen: la bota, el forro.\n\nCuando todo esté perdido y solo te quede una mano, úsalo. No antes.\n\n— Elias` },
  h1: { title: 'Pulsera de paciente', text: `PACIENTE: V., AXEL.\nHABITACIÓN: 12.\nOBSERVACIONES: «Entregado por EL CUSTODIO. No retirar correas.»\n\nAl dorso, a lápiz: «El más reciente. Después de él no entra nadie.»` },
  h2: { title: 'Aviso en la habitación', text: `ÁREA CLAUSURADA POR ORDEN SANITARIA\n\nLos pacientes no están en cuarentena. Los pacientes SON la cuarentena.\n\nSi oyes metal arrastrarse: no corras. Escóndete.` },
  h3: { title: 'Rayado en el pasillo', text: `Repetido cientos de veces:\n\nÉL ESCUCHA.\n\nCada vez que se oye el gancho, alguien más deja de escribir.` },
  o2: { title: 'Aviso en el vestíbulo', text: `ASCENSORES FUERA DE SERVICIO.\nESCALERA A PLANTA ALTA: solo con pase.\nSÓTANO: por la escalera del ala oeste (llave del sótano).\n\nLa entrada principal fue sellada desde FUERA.` },
  o1: { title: 'Memo de Oficinas', text: `Quien necesite el Archivo: la llave está en el escritorio del fondo de Oficinas, donde nadie mira.\n\nLa llave de Urgencias la guardan en el Archivo, junto a los expedientes antiguos.` },
  a1: { title: 'Lista de pacientes (extracto)', text: `Hab. 07: paciente MÁS ANTIGUO. Ingresó hace años. Sin nombre. Planta alta.\nHab. 08 a 11: vacías.\nHab. 12: paciente MÁS RECIENTE. V., Axel.\n\nNota: «El armario de Farmacia recuerda a los dos extremos.»` },
  a2: { title: 'Expediente: el Custodio', text: `No figura en nómina. Ningún médico lo ha visto comer. Entrega pacientes por la noche y recoge a los que «ya no sirven».\n\nSu limpiador es un antiguo matarife. Se orienta por el oído. Odia el ruido y la luz.` },
  d1: { title: 'Sala de descanso', text: `Lugar seguro: ningún paciente se acerca. Dicen que el Custodio lo ordenó así.\n\nLas camillas están limpias. Alguien las cuida.` },
  l1: { title: 'Lavandería', text: `Las sábanas se lavan solas. Cada mañana hay una más manchada.\n\nLa llave de la cocina del hospital está en Consultorios, en la bata del Dr. Hal.` },
  con1: { title: 'Bata del Dr. Hal', text: `Dr. Hal: «Los frascos buenos los bajo al sótano. Los malos, a la morgue.»\n\nEn el bolsillo: la llave de la cocina del hospital.` },
  ca1: { title: 'Libro de la capilla', text: `Aquí también es seguro. Quien vino a rezar dejó escrito:\n\n«Lo he visto. Lleva el delantal manchado. Cuando hace silencio, es que ya sabe dónde estás.»` },
  c1: { title: 'Diario de la cafetería', text: `El pase de planta alta lo dejó el supervisor sobre la barra el día que todo se fue al diablo.\n\nHay algo en el techo. Se mueve cuando comemos.` },
  k1: { title: 'Nota de la cocina', text: `La llave del sótano la guardó el cocinero «por si hay que bajar a por carne».\n\nNo preguntéis qué carne.` },
  u1: { title: 'Parte de Urgencias', text: `El primer paciente que se levantó fue el de la cama 4. Se levantó sin nadie que lo llamara.\n\nLa tarjeta de Farmacia está colgada de la pared, como un recordatorio.` },
  f1: { title: 'Protocolo de Farmacia', text: `Armario de fármacos controlados. Código de 4 cifras:\n\n— Dos primeras: habitación del paciente MÁS ANTIGUO.\n— Dos últimas: habitación del paciente MÁS RECIENTE.\n\n(Consultar la lista de pacientes del Archivo.)` },
  mo1: { title: 'Etiquetas de la morgue', text: `— «Hal, Dr. Aníbal. Intentó huir con una muestra.»\n— «Sin nombre. Sacado de la hab. 07.»\n— «Reservado: Wren, Elias.»\n\nEl cajón de Wren está abierto. Por dentro.` },
  mo2: { title: 'Bitácora del morguero', text: `Mi bolsillo guarda el fusible A: sin él, nadie enciende el garaje.\n\nLos cadáveres dejaron de quedarse quietos el día que el Sujeto Cero salió de su habitación, la 07.\n\nLa fecha la tiene la caja del director.` },
  x1: { title: 'Informe de Rayos X', text: `Radiografía de un paciente: los huesos del brazo derecho dibujan una forma que no es humana.\n\nA lápiz: «No es una mutación. Es un molde.»` },
  p0: { title: 'Rótulo de la escalera', text: `PLANTA ALTA.\nUCI · QUIRÓFANO · BIBLIOTECA MÉDICA · DIRECCIÓN.\nHABITACIÓN 07 y LABORATORIO al sur.` },
  p1: { title: 'Ficha de la UCI', text: `Los pacientes de la UCI no despiertan: se levantan.\n\nLa llave de la habitación 07 está en el pie de la cama 3. Quien la recoja, que no se quede mucho tiempo.` },
  p2: { title: 'Parte quirúrgico', text: `Procedimiento 14-B: amputación y regeneración inducida con RIUTEX-X.\n\nEl fusible B quedó en la bandeja de instrumental. El generador del sótano exige dos fusibles: A (Morgue) y B (aquí).` },
  p3: { title: 'Nota de la biblioteca médica', text: `La caja del director solo se abre con una fecha, en formato MES-DÍA:\n\nla fecha de ingreso del paciente de la habitación 07.\n\nLa llave de la biblioteca ya no la necesita nadie: la mía está bajo la lámpara.` },
  p4: { title: 'Ficha del Sujeto Cero', text: `Habitación 07. Ingresó el 14 DE JULIO.\n\nPrimer huésped del compuesto. No perdió la voluntad. Perdió el nombre.\n\n«Cuando él se levantó, el hospital dejó de ser un hospital.»` },
  p5: { title: 'Laboratorio de Wren', text: `Pizarra: «RIUTEX-X sobrevive solo en cuerpos ya marcados.»\n\nHay una sombra de frasco en la mesa: alguien se llevó el segundo. Debajo, escrito: «MUSEO · SALA 3.»` },
  p6: { title: 'Despacho del director', text: `El director dejó el hospital con las luces encendidas.\n\nEn la caja fuerte guardaba la llave de la rampa del garaje: «Por si hay que irse. Rápido.»` },
  p7: { title: 'Sala de pruebas', text: `Registros de ruido: el Carnicero reacciona a pasos, disparos y voces. No a la respiración.\n\nSi te ve, no hay escondite. Si te oye, hay oportunidad.\n\nCierra puertas: él puede abrirlas. Ellos no.` },
  p8: { title: 'Ficha: El Carnicero', text: `Ezequiel Marrón, matarife. Primer sujeto en recibir una dosis temprana. No perdió el miedo: perdió el dolor.\n\nEl Custodio lo usa para «limpiar» el hospital.` },
  p9: { title: 'Nota de planta alta', text: `La salida es por el garaje del sótano. El generador necesita 2 fusibles: A y B.\n\nLa rampa se abre con la llave del director.\n\nQue Dios nos ayude: el garaje es su cuarto.` },
  p10: { title: 'Cuaderno del laboratorio', text: `Wren escribe sobre el frasco: «No es una cura. Es una invitación. Pero el que no la acepta, muere sin saber qué había detrás.»` },
  s1: { title: 'Calderas', text: `Las calderas llevan semanas apagadas. El calor viene de otra parte: del suelo, de debajo de la rampa.\n\nA veces se oye que algo respira.` },
  s2: { title: 'Generadores', text: `Panel de generadores. Dos ranuras vacías: FUSIBLE A, FUSIBLE B.\n\nSin energía, la persiana del garaje no se mueve.` },
  s3: { title: 'Almacén', text: `Cajas con la inscripción «NO ABRIR: PERSONAL DE MANTENIMIENTO». Dentro: herramientas, munición vieja, y un gancho de carnicero de repuesto.` },
  s4: { title: 'Cartel del garaje', text: `AMBULANCIAS: 3 plazas.\nAMBULANCIA 2: fuera de servicio.\n\nMarcas de arrastre del fondo a ninguna parte. El Carnicero duerme aquí cuando no caza.` },
  s5: { title: 'Rampa', text: `La rampa lleva al garaje. Pintado en la pared, grande: «NO CORRAS. NO LE DES MOTIVOS.»` },
  s6: { title: 'Nota pegada a la puerta de salida', text: `Axel:\n\nSi sales, no vayas al cuartel. No vayas a casa.\n\nVe al Museo de Historia Natural. Sala 3, vitrina de ámbar.\n\nAhí empezó todo. Ahí termina.\n\n— W.` },
  p9b: { title: 'Informe del Custodio (planta alta)', text: `Sujeto 41: AXEL V. Tolerancia genética: ALTA.\n\nPlan: privarle de un miembro. Dejarle el frasco. Observar qué hace un hombre ante la elección.\n\nSi se inyecta, es un resultado. Si no, un desperdicio.` }
};
Object.assign(DOCS, R2_DOCS);

['m2', 'a1', 'f1', 'mo2', 'p3', 'p4', 'p2', 'l1', 'con1', 'o1'].forEach(id => CLUES.add(id));
Object.assign(Puzzles.CODES, { h_cab: '0712', h_safe: '0714', h_clock: '0340' });

// ---------------------------------------------------------------- Constructor de plantas
const R2_DATA = id => id === 'mansion' ? MANSION : FLOORS[id];
Object.assign(Level, {
  buildR2(id) {
    const D = R2_DATA(id), mans = id === 'mansion'; this.W = D.W; this.H = D.H; this.wc = mans ? ['#17110f', '#2c211d', '#0a0706'] : ['#0d1417', '#1d2b31', '#060a0c']; this.bricks = false; this.decor = D.decor; this.fluid = null;
    this.bossZone = D.bossZone || null; this.bossZone2 = null; this.safeRects = D.safe || [];
    const g = this.grid = [], tn = this.tint = []; for (let y = 0; y < this.H; y++) { g.push(new Array(this.W).fill(1)); tn.push(new Array(this.W).fill(null)); }
    this.rooms = D.rooms.map(([n, x, y, w, h]) => ({ n, x, y, w, h })); for (const r of this.rooms) for (let j = r.y; j < r.y + r.h; j++) for (let i = r.x; i < r.x + r.w; i++) { g[j][i] = 0; tn[j][i] = TINT[r.n] || '#2b2b2f'; }
    for (const [x, y, w, h] of D.cuts || []) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { g[j][i] = 0; tn[j][i] = '#2c3234'; }
    for(const [x,y,w,h] of D.walls||[])for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)g[j][i]=1;
    this.props = {}; for (const t in D.furn) for (const [x, y] of D.furn[t]) { g[y][x] = 4; this.props[x + ',' + y] = t; }
    this.doors = []; for (const [id2, x, y, w, h, key] of D.doors) { const d = { id: id2, key, open: false, tiles: [] }; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { d.tiles.push([i, j]); g[j][i] = key ? 3 : 2; tn[j][i] = '#2c3234'; } this.doors.push(d); }
    this.decals = []; let s = id.length * 7 + 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const r of this.rooms) for (let i = 0; i < Math.ceil(r.w * r.h / 16); i++) this.decals.push({ x: (r.x + rnd() * r.w) * TILE, y: (r.y + rnd() * r.h) * TILE, r: 6 + rnd() * 16, c: 'rgba(80,8,12,' + (0.2 + rnd() * 0.3) + ')' });
    this.lamps = []; for (const r of this.rooms) { const cor = /^(Pasillo|Ala|Rampa)/.test(r.n);
      if (!cor) this.lamps.push({ x: (r.x + r.w / 2) * TILE, y: (r.y + r.h / 2) * TILE, r: Math.min(300, Math.max(r.w, r.h) * 17 + 40) });
      else { const long = r.w > r.h; const n = Math.max(1, Math.floor((long ? r.w : r.h) / 12)); for (let k = 0; k < n; k++) this.lamps.push({ x: (long ? r.x + (k + .5) * r.w / n : r.x + r.w / 2) * TILE, y: (long ? r.y + r.h / 2 : r.y + (k + .5) * r.h / n) * TILE, r: 150 }); } }
  },
  closeDoor(d, force) { // cierra una puerta (solo si nada la bloquea). La llave ya no hace falta una vez abierta.
    if (!d.open) return true; const G = Game, ents = [G.player, ...(G.enemies || []).filter(e => !e.dead), ...(G.squad || [])];
    if (!force) for (const e of ents) for (const [i, j] of d.tiles) if (Math.abs(e.x - (i * TILE + 16)) < 16 + (e.r || 10) && Math.abs(e.y - (j * TILE + 16)) < 16 + (e.r || 10)) return false;
    d.open = false; d.tiles.forEach(([i, j]) => this.grid[j][i] = d.key ? 3 : 2); return true;
  }
});
