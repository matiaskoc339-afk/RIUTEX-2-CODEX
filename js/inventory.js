// Inventario: 8 espacios para inyecciones; llaves, documentos y muestras van aparte (no ocupan espacio).
const ITEMS = { // w,h = casillas que ocupa en el maletín
  inj_green: { name: 'Inyección verde (Recuperación)', short: 'Recuperación', color: '#3fbf5a', w: 1, h: 2, use: true, desc: 'Recupera 40 de salud (y cura el veneno).' },
  inj_blue: { name: 'Inyección azul (Enfoque)', short: 'Enfoque', color: '#3f7fe0', w: 1, h: 2, use: true, desc: '20 s de enfoque (precisión, menos retroceso, recarga rápida) y, de forma PERMANENTE, disparar cansa un 15 % menos.' },
  inj_yellow: { name: 'Inyección amarilla (Expansión)', short: 'Expansión', color: '#e0c93f', w: 1, h: 1, use: true, desc: 'Aumenta la salud máxima en 20 de forma permanente.' },
  inj_cure: { name: 'Antídoto (verde azulado)', short: 'Antídoto', color: '#40d0c0', w: 1, h: 1, use: true, desc: 'Elimina el veneno y da 30 s de resistencia a él.' },
  w_pistol: { name: 'Pistola M9', short: 'M9', color: '#9aa0b0', w: 2, h: 1, use: false, desc: 'Arma equilibrada. Se equipa con la tecla 1.' },
  w_shotgun: { name: 'Escopeta M12', short: 'Escopeta', color: '#b08a60', w: 4, h: 1, use: false, desc: 'Gran daño a corta distancia. Tecla 2.' },
  w_viper: { name: 'Subfusil Viper', short: 'Viper', color: '#7aa07a', w: 3, h: 1, use: false, desc: 'Alta cadencia. Tecla 3.' },
  w_rifle: { name: 'Rifle de precisión', short: 'Rifle', color: '#8a9ab0', w: 4, h: 1, use: false, desc: 'Gran daño y alcance. Tecla 4.' },
  w_launcher: { name: 'Lanzagranadas', short: 'Lanzag.', color: '#7a8a6a', w: 3, h: 2, use: false, desc: 'Explosivo, también te daña a ti. Tecla 5.' },
  am_pistol: { name: 'Munición 9 mm', short: '9 mm', color: '#d8b84a', w: 1, h: 1, use: false, cap: 18, desc: 'Munición de la pistola (se apila hasta 18).' },
  am_shells: { name: 'Cartuchos de escopeta', short: 'Cartuchos', color: '#c04a3a', w: 1, h: 1, use: false, cap: 10, desc: 'Munición de la escopeta (se apila hasta 10).' },
  am_smg: { name: 'Munición del Viper', short: 'Viper', color: '#4a8a4a', w: 1, h: 1, use: false, cap: 40, desc: 'Munición del subfusil (se apila hasta 40).' },
  am_rifle: { name: 'Cartuchos de rifle', short: 'Rifle', color: '#6a7a9a', w: 1, h: 1, use: false, cap: 10, desc: 'Munición del rifle (se apila hasta 10).' },
  am_grenade: { name: 'Granadas', short: 'Granadas', color: '#5a7a3a', w: 1, h: 1, use: false, cap: 4, desc: 'Munición del lanzagranadas (se apila hasta 4).' },
  screw_small: { name: 'Tornillos pequeños', short: 'Torn. P', color: '#9da6ad', w: 1, h: 1, use: false, cap: 30, desc: 'Tornillos recuperados de maquinaria. Se usan para fabricar munición.' },
  screw_large: { name: 'Tornillos grandes', short: 'Torn. G', color: '#65717c', w: 1, h: 1, use: false, cap: 20, desc: 'Pernos industriales. Sirven para fabricar munición pesada.' },
  powder_small: { name: 'Pólvora pequeña', short: 'Pólv. P', color: '#b99b61', w: 1, h: 1, use: false, cap: 30, desc: 'Pequeña carga de pólvora para munición ligera.' },
  powder_large: { name: 'Pólvora grande', short: 'Pólv. G', color: '#72543d', w: 1, h: 1, use: false, cap: 20, desc: 'Carga de pólvora de alto rendimiento para munición pesada.' },
  sample: { name: 'Muestra de Riutex-V1', short: 'Muestra', color: '#38a9ff', w: 1, h: 1, use: false, desc: 'Se absorbe desde K para obtener 40 EXP. Puedes conservarla sin usarla; ocupa una casilla.' }
};
const AMMO = { pistol: 'am_pistol', shotgun: 'am_shells', viper: 'am_smg', rifle: 'am_rifle', launcher: 'am_grenade' }; // arma -> tipo de munición
const KEYS = { enfermeria: 'Llave de la enfermería', almacen: 'Llave del almacén', seguridad: 'Tarjeta de seguridad', director: 'Llave del director', salida: 'Llave de la salida', taller: 'Llave del taller', pase_a: 'Pase de seguridad A', pase_b: 'Pase de seguridad B', llave_voss: 'Llave del sanctum de Voss', acceso: 'Llave de acceso militar', llave_arm_a: 'Llave de armería A', llave_arm_b: 'Llave de armería B', tarjeta: 'Tarjeta del puesto de mando', lab: 'Tarjeta del laboratorio', fusible_a: 'Fusible A', fusible_b: 'Fusible B', fusible_c: 'Fusible C' };
function itemLabel(it) {
  const t = it.type;
  if (t === 'pistol') return 'Recoger pistola'; if (t === 'screw_small' || t === 'screw_large' || t === 'powder_small' || t === 'powder_large') return 'Recoger ' + ITEMS[t].name; if (t === 'ammo') return 'Recoger munición';
  if (t === 'key') return 'Recoger: ' + KEYS[it.key]; if (t === 'doc') return 'Leer: ' + DOCS[it.doc].title;
  if (it.fixed) return Puzzles.label(it); if (t.startsWith('mod_')) return 'Recoger: mejora de arma'; if (t === 'shells') return 'Recoger cartuchos'; if (t === 'smg') return 'Recoger munición del Viper'; if (t === 'rifle') return 'Recoger: Rifle de precisión'; if (t === 'launcher') return 'Recoger: Lanzagranadas'; if (t === 'grenade') return 'Recoger granadas'; if (t === 'rifleammo') return 'Recoger munición de rifle'; if (t === 'mask') return 'Recoger: máscara filtrante'; if (t === 'case') return 'Recoger: Ampliación de maletín'; if (t === 'stab') return 'Inyectarse: Estabilizador Riutex'; if (t === 'sample') return 'Recoger muestra de Riutex-V1'; return 'Recoger: ' + ITEMS[t].name;
}
const CASE_LEVELS = [[4, 4], [5, 4], [5, 5], [6, 5]]; // cada ampliación encontrada en el mapa agranda el maletín
class Inventory { // maletín tipo Resident Evil: empieza en 4x3 casillas
  constructor() { this.cols = 4; this.rows = 3; this.level = 0; this.items = []; this.sel = -1; this.keys = []; this.docs = []; }
  get samples() { return this.items.filter(i => i.type === 'sample').length; }
  fits(x, y, w, h, skip) { if (x < 0 || y < 0 || x + w > this.cols || y + h > this.rows) return false; return !this.items.some(o => o !== skip && x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y); }
  add(type) { return this.place({ type }); }
  place(obj) { // coloca un objeto en el primer hueco libre (probando también girado)
    const d = ITEMS[obj.type];
    for (const rot of d.w === d.h ? [0] : [0, 1]) { const w = rot ? d.h : d.w, h = rot ? d.w : d.h;
      for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) if (this.fits(x, y, w, h)) { Object.assign(obj, { x, y, w, h }); this.items.push(obj); if (this.sel < 0 && d.use) this.sel = this.items.length - 1; return true; } }
    return false;
  }
  addStack(type, n) { return this.addAmmo(type, n); }
  addAmmo(type, n) { // rellena pilas existentes y crea nuevas mientras haya hueco; devuelve cuánto cupo
    let left = n; const cap = ITEMS[type].cap;
    for (const it of this.items) if (it.type === type && it.count < cap && left > 0) { const k = Math.min(cap - it.count, left); it.count += k; left -= k; }
    while (left > 0) { const k = Math.min(cap, left); if (!this.place({ type, count: k })) break; left -= k; }
    return n - left;
  }
  craft(recipe) {
    const recipes = { pistol: { cost: { screw_small: 2, powder_small: 2 }, ammo: 'am_pistol', count: 10, label: '10 balas de 9 mm' }, shotgun: { cost: { screw_large: 1, powder_large: 2 }, ammo: 'am_shells', count: 4, label: '4 cartuchos' }, viper: { cost: { screw_small: 3, powder_small: 3 }, ammo: 'am_smg', count: 20, label: '20 balas Viper' }, rifle: { cost: { screw_large: 2, powder_large: 2 }, ammo: 'am_rifle', count: 5, label: '5 cartuchos de rifle' }, launcher: { cost: { screw_large: 3, powder_large: 4 }, ammo: 'am_grenade', count: 2, label: '2 granadas' } };
    const r = recipes[recipe]; if (!r) return { ok: false, msg: 'Receta desconocida.' };
    for (const [type, need] of Object.entries(r.cost)) { const have = this.items.filter(i => i.type === type).reduce((n, i) => n + (i.count || 1), 0); if (have < need) return { ok: false, msg: 'Material insuficiente para fabricar ' + r.label + '.' }; }
    const trial = new Inventory(); trial.load(JSON.parse(JSON.stringify(this.serialize()))); if (trial.addAmmo(r.ammo, r.count) < r.count) return { ok: false, msg: 'No hay espacio para toda la munición fabricada. Libera casillas y vuelve a intentarlo.' };
    for (const [type, need] of Object.entries(r.cost)) { let left = need; for (let i = this.items.length - 1; i >= 0 && left > 0; i--) { const it = this.items[i]; if (it.type !== type) continue; const take = Math.min(left, it.count || 1); if (it.count != null) it.count -= take; left -= take; if (!it.count || it.count <= 0) this.removeAt(i); } }
    this.addAmmo(r.ammo, r.count); return { ok: true, msg: 'Fabricaste ' + r.label + '.' };
  }
  reserve(id) { const t = AMMO[id]; return this.items.reduce((s, i) => s + (i.type === t ? i.count : 0), 0); }
  takeAmmo(id, n) { const t = AMMO[id]; let left = n; for (let i = this.items.length - 1; i >= 0 && left > 0; i--) { const it = this.items[i]; if (it.type !== t) continue; const k = Math.min(it.count, left); it.count -= k; left -= k; if (it.count <= 0) this.removeAt(i); } return n - left; }
  syncWeapons(p) { // las armas utilizables son las que están en el maletín
    p.weapons = {}; for (const it of this.items) if (it.type.startsWith('w_')) p.weapons[it.id] = it; if (p.weapon && !this.items.includes(p.weapon)) { p.weapon = null; p.reloading = 0; }
  }
  remove(type) { const i = this.items.findIndex(o => o.type === type); if (i >= 0) this.removeAt(i); return i >= 0; }
  removeAt(i) { this.items.splice(i, 1); this.sel = this.items.findIndex(o => ITEMS[o.type].use); }
  selItem() { return this.items[this.sel] || null; }
  move(it, x, y) { if (!this.fits(x, y, it.w, it.h, it)) return false; it.x = x; it.y = y; return true; }
  rotate(it) {
    if (it.w === it.h) return false; const w = it.h, h = it.w;
    if (this.fits(it.x, it.y, w, h, it)) { it.w = w; it.h = h; return true; }
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) if (this.fits(x, y, w, h, it)) { it.w = w; it.h = h; it.x = x; it.y = y; return true; }
    return false;
  }
  expand() { if (this.level >= CASE_LEVELS.length) return false; [this.cols, this.rows] = CASE_LEVELS[this.level++]; return true; }
  use(g) {
    let i = this.sel; if (i < 0) i = this.items.findIndex(o => ITEMS[o.type].use); const it = this.items[i];
    if (!it) return UI.msg('No tienes inyecciones. Revisa tu maletín (TAB).'); if (!ITEMS[it.type].use) return UI.msg(ITEMS[it.type].desc, 3500);
    const t = it.type, p = g.player;
    if (t === 'inj_green') { if (p.hp >= p.maxHp && p.poison <= 0) return UI.msg('Tu salud ya está al máximo.'); p.hp = Math.min(p.maxHp, p.hp + 40); p.poison = 0; }
    else if (t === 'inj_blue') { p.focus = 20; p.mods.steady = (p.mods.steady || 0) + 1; }
    else if (t === 'inj_cure') { p.poison = 0; p.resist = 30; }
    else if (t === 'inj_yellow') { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); }
    this.removeAt(i); g.fxInject(ITEMS[t].color); UI.msg(ITEMS[t].short + ': ' + ITEMS[t].desc, 3000);
  }
  serialize() { return { cols: this.cols, rows: this.rows, level: this.level, items: this.items, sel: this.sel, keys: this.keys, docs: this.docs }; }
  load(d) { Object.assign(this, d); }
}
