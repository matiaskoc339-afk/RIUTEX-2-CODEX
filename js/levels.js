// Mapa por tiles. 0 = suelo, 1 = muro, 2/3 = puerta libre/con llave, 4 = mueble sólido (tipo en Level.props).
const TILE = 32;
const TINT = { 'Celdas': '#2a2a2c', 'Recepción': '#34302c', 'Enfermería': '#2b3434', 'Oficinas': '#33302a', 'Archivo': '#2a282e', 'Dirección': '#352c2a', 'Cocina y almacén': '#303434', 'Sala de seguridad': '#2b2e2c', 'Lavandería': '#262d33', 'Sala de contención': '#2c2527', 'Cámara oculta': '#2d2434' };
const FURN = { // muebles sólidos por tipo
  pillar: [[30, 6], [36, 6], [30, 11], [36, 11], [6, 44], [15, 44], [6, 49], [15, 49], [10, 46], [10, 47]],
  bars: [[7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [4, 40], [5, 40], [6, 40], [7, 40]],
  bed: [[4, 3], [9, 3], [13, 3], [24, 27], [24, 31], [28, 27], [28, 31], [37, 27], [37, 31], [40, 27], [40, 31]],
  desk: [[31, 4], [32, 4], [33, 4], [55, 5], [61, 5], [55, 12], [61, 12], [71, 7], [71, 8], [72, 7], [75, 27], [78, 27], [75, 32], [78, 32]],
  bench: [[33, 9], [34, 9], [37, 9], [38, 9], [70, 5], [71, 5]],
  shelf: [[57, 3], [58, 3], [59, 3], [55, 19], [55, 20], [55, 21], [60, 19], [60, 20], [60, 21], [73, 5], [74, 5]],
  locker: [[24, 35], [25, 35], [32, 35], [33, 35], [81, 29], [81, 30], [81, 31], [76, 16], [76, 17]],
  table: [[31, 30], [32, 30], [72, 18]],
  crate: [[63, 31], [64, 31], [65, 32], [65, 33], [22, 41], [22, 42], [40, 13], [4, 50], [4, 51], [5, 51]],
  machine: [[24, 41], [25, 41], [26, 41], [29, 41], [30, 41], [31, 41], [25, 44], [30, 44]],
  counter: [[55, 30], [56, 30], [58, 30], [59, 30], [61, 30], [62, 30], [55, 33], [56, 33], [58, 33], [59, 33], [61, 33], [62, 33]]
};
const DECOR = [['wheel', 12, 10], ['chair', 9, 9], ['paper', 6, 10], ['chair', 32, 12], ['paper', 29, 7], ['glass', 35, 6], ['wheel', 26, 29], ['wheel', 36, 29], ['puddle', 27, 33], ['chair', 41, 30], ['paper', 57, 10], ['chair', 64, 8],
  ['glass', 60, 13], ['paper', 58, 20], ['paper', 56, 23], ['puddle', 73, 10], ['glass', 74, 30], ['chair', 79, 26], ['chair', 28, 43], ['puddle', 26, 39], ['glass', 31, 38], ['paper', 12, 50], ['chair', 9, 42], ['glass', 16, 48],
  ['wheel', 22, 7], ['paper', 45, 8], ['glass', 48, 8], ['puddle', 33, 20], ['paper', 34, 16], ['chair', 72, 20], ['wheel', 60, 5]];
const PROP = { // dibujo de muebles (px,py = esquina del tile)
  pillar(c, x, y) { c.fillStyle = '#3a3a40'; c.fillRect(x + 3, y + 3, 26, 26); c.fillStyle = '#4a4a52'; c.fillRect(x + 3, y + 3, 26, 4); c.fillStyle = '#26262b'; c.fillRect(x + 3, y + 25, 26, 4); },
  bars(c, x, y) { c.fillStyle = '#55555a'; c.fillRect(x, y + 1, 32, 3); for (let i = 0; i < 4; i++) { c.fillStyle = '#6a6a70'; c.fillRect(x + 4 + i * 8, y, 3, 32); } },
  bed(c, x, y) { c.fillStyle = '#3a2a20'; c.fillRect(x + 2, y + 2, 28, 28); c.fillStyle = '#8a8478'; c.fillRect(x + 4, y + 10, 24, 18); c.fillStyle = '#b0a898'; c.fillRect(x + 5, y + 4, 12, 7); c.fillStyle = 'rgba(90,10,14,.5)'; c.fillRect(x + 12, y + 16, 9, 7); },
  desk(c, x, y) { c.fillStyle = '#4a3626'; c.fillRect(x + 1, y + 4, 30, 24); c.fillStyle = '#5a4632'; c.fillRect(x + 1, y + 4, 30, 4); c.fillStyle = '#c9c0a0'; c.fillRect(x + 6, y + 11, 9, 7); c.fillStyle = '#2a1c10'; c.fillRect(x + 20, y + 14, 8, 10); },
  bench(c, x, y) { c.fillStyle = '#4a3a2c'; c.fillRect(x + 1, y + 8, 30, 14); c.fillStyle = '#2a1e14'; c.fillRect(x + 3, y + 22, 3, 6); c.fillRect(x + 26, y + 22, 3, 6); },
  shelf(c, x, y) { c.fillStyle = '#2e2418'; c.fillRect(x, y, 32, 32); c.fillStyle = '#1a120c'; c.fillRect(x, y + 10, 32, 2); c.fillRect(x, y + 21, 32, 2); const k = ['#6a2a2a', '#2a4a6a', '#5a5a2a', '#3a5a3a']; for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { c.fillStyle = k[(i + r) % 4]; c.fillRect(x + 3 + i * 6, y + 2 + r * 11, 4, 8); } },
  locker(c, x, y) { c.fillStyle = '#4a5258'; c.fillRect(x + 3, y + 1, 26, 30); c.fillStyle = '#2a3036'; c.fillRect(x + 15, y + 1, 2, 30); for (let i = 0; i < 4; i++) c.fillRect(x + 6, y + 5 + i * 3, 7, 1); c.fillStyle = '#8a8a90'; c.fillRect(x + 12, y + 16, 2, 4); c.fillRect(x + 18, y + 16, 2, 4); },
  table(c, x, y) { c.fillStyle = '#4a3a2c'; c.beginPath(); c.ellipse(x + 16, y + 16, 15, 12, 0, 0, 6.283); c.fill(); c.fillStyle = '#5a4838'; c.beginPath(); c.ellipse(x + 16, y + 14, 13, 9, 0, 0, 6.283); c.fill(); },
  crate(c, x, y) { c.fillStyle = '#5a4228'; c.fillRect(x + 2, y + 2, 28, 28); c.strokeStyle = '#2a1c10'; c.lineWidth = 2; c.strokeRect(x + 3, y + 3, 26, 26); c.beginPath(); c.moveTo(x + 3, y + 3); c.lineTo(x + 29, y + 29); c.moveTo(x + 29, y + 3); c.lineTo(x + 3, y + 29); c.stroke(); },
  machine(c, x, y) { c.fillStyle = '#8a8f92'; c.fillRect(x + 1, y + 2, 30, 28); c.fillStyle = '#6a6f72'; c.fillRect(x + 1, y + 2, 30, 5); c.fillStyle = '#2a3a44'; c.beginPath(); c.arc(x + 16, y + 18, 9, 0, 6.283); c.fill(); c.strokeStyle = '#b0b4b6'; c.lineWidth = 2; c.stroke(); },
  counter(c, x, y) { c.fillStyle = '#7a7e80'; c.fillRect(x, y + 6, 32, 20); c.fillStyle = '#9a9ea0'; c.fillRect(x, y + 6, 32, 5); c.fillStyle = '#3a3e40'; c.fillRect(x + 8, y + 14, 14, 8); }
};
const DECO = {
  chair(c, x, y, v) { c.save(); c.translate(x + 16, y + 16); c.rotate(v * .9); c.fillStyle = '#4a3a2c'; c.fillRect(-6, -6, 12, 12); c.fillStyle = '#3a2c20'; c.fillRect(-6, -8, 12, 3); c.restore(); },
  wheel(c, x, y) { c.strokeStyle = '#666'; c.lineWidth = 2; c.beginPath(); c.arc(x + 11, y + 20, 8, 0, 6.283); c.stroke(); c.beginPath(); c.arc(x + 22, y + 22, 4, 0, 6.283); c.stroke(); c.fillStyle = '#2a2a2e'; c.fillRect(x + 9, y + 8, 12, 10); },
  paper(c, x, y, v) { c.save(); c.translate(x + 16, y + 16); c.rotate(v); c.fillStyle = 'rgba(200,192,160,.75)'; c.fillRect(-6, -4, 12, 9); c.restore(); },
  glass(c, x, y) { c.fillStyle = 'rgba(160,200,220,.5)'; for (let i = 0; i < 5; i++) c.fillRect(x + 6 + (i * 7) % 20, y + 8 + (i * 11) % 16, 3, 2); },
  puddle(c, x, y) { c.fillStyle = 'rgba(20,30,40,.7)'; c.beginPath(); c.ellipse(x + 16, y + 17, 13, 8, 0, 0, 6.283); c.fill(); c.fillStyle = 'rgba(100,130,150,.18)'; c.beginPath(); c.ellipse(x + 13, y + 15, 6, 3, 0, 0, 6.283); c.fill(); }
};
const Level = {
  W: 84, H: 60, grid: [], tint: [], decals: [], rooms: [], doors: [], props: {}, lamps: [],
  build(id) {
    if (id === 'mansion' || id.startsWith('hospital')) return this.buildR2(id); // RIUTEX 2 · Fase 1
    if (id === 'sewer') return this.buildSewer();
    if (id === 'base') return this.buildBase();
    if (id === 'lab') return this.buildLab();
    this.W = 84; this.H = 60; this.wc = ['#15141a', '#23212c', '#0b0a0e']; this.bricks = false; this.decor = DECOR; this.fluid = null; this.bossZone = [0, 40 * TILE, 19 * TILE, 99999];
    const g = this.grid = [], tn = this.tint = []; for (let y = 0; y < this.H; y++) { g.push(new Array(this.W).fill(1)); tn.push(new Array(this.W).fill(null)); }
    const c = (x, y, w, h, col) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { g[j][i] = 0; tn[j][i] = col; } };
    this.rooms = [['Celdas', 3, 3, 12, 9], ['Pasillo', 15, 6, 12, 3], ['Recepción', 27, 3, 14, 12], ['Pasillo', 32, 15, 3, 10], ['Enfermería', 22, 25, 22, 11], ['Pasillo', 41, 7, 12, 3], ['Oficinas', 53, 3, 14, 12],
      ['Dirección', 69, 5, 8, 7], ['Pasillo', 67, 7, 2, 3], ['Pasillo', 57, 15, 3, 2], ['Archivo', 53, 17, 10, 8], ['Pasillo', 44, 29, 8, 3], ['Cocina y almacén', 52, 27, 14, 9], ['Pasillo', 66, 28, 6, 3],
      ['Sala de seguridad', 72, 24, 10, 12], ['Pasillo', 27, 36, 3, 2], ['Lavandería', 22, 38, 12, 8], ['Pasillo', 19, 42, 3, 3], ['Sala de contención', 3, 40, 16, 14], ['Pasillo', 8, 54, 3, 5], ['Pasillo', 63, 19, 6, 3], ['Cámara oculta', 69, 15, 8, 8]]
      .map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
    this.rooms.forEach(r => c(r.x, r.y, r.w, r.h, TINT[r.n] || '#2b2b2f'));
    this.props = {}; for (const t in FURN) for (const [x, y] of FURN[t]) { g[y][x] = 4; this.props[x + ',' + y] = t; }
    // Puertas: grid 2 = libre, 3 = con llave/mecanismo. key: nombre de llave, 'power' (generador) o 'archive' (terminal).
    this.doors = []; const D = (id, x, y, w, h, key) => { const d = { id, key, open: false, tiles: [] }; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { d.tiles.push([i, j]); g[j][i] = key ? 3 : 2; } this.doors.push(d); };
    D('cell', 15, 6, 1, 3, null); D('enf', 32, 15, 3, 1, 'enfermeria'); D('alm', 44, 29, 1, 3, 'almacen'); D('seg', 66, 28, 1, 3, 'seguridad'); D('dir', 67, 7, 1, 3, 'director');
    D('cont', 19, 42, 1, 3, 'power'); D('arc', 63, 19, 1, 3, 'archive'); D('exit', 8, 56, 3, 1, 'salida');
    this.decals = []; let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const r of this.rooms) for (let i = 0; i < Math.ceil(r.w * r.h / 12); i++) this.decals.push({ x: (r.x + rnd() * r.w) * TILE, y: (r.y + rnd() * r.h) * TILE, r: 6 + rnd() * 16, c: 'rgba(80,8,12,' + (0.25 + rnd() * 0.3) + ')' });
    this.lamps = this.rooms.filter(r => r.n !== 'Pasillo').map(r => ({ x: (r.x + r.w / 2) * TILE, y: (r.y + r.h / 2) * TILE, r: Math.min(280, Math.max(r.w, r.h) * 17 + 40) })); // lámparas de sala (algunas parpadean)
  },
  fluidAt(px, py) { if (!this.fluid) return 0; const x = Math.floor(px / TILE), y = Math.floor(py / TILE); return (this.fluid[y] && this.fluid[y][x]) || 0; },
  solid(px, py) { const x = Math.floor(px / TILE), y = Math.floor(py / TILE); return x < 0 || y < 0 || x >= this.W || y >= this.H || this.grid[y][x] !== 0; },
  blocked(x, y, r) { return this.solid(x - r, y - r) || this.solid(x + r, y - r) || this.solid(x - r, y + r) || this.solid(x + r, y + r); },
  move(e, dx, dy) { if (!this.blocked(e.x + dx, e.y, e.r)) e.x += dx; if (!this.blocked(e.x, e.y + dy, e.r)) e.y += dy; },
  nearDoor(p) { let best = null, distance = 46; for (const d of this.doors) if (!d.open) for (const [i, j] of d.tiles) { const n = Math.hypot(i * TILE + 16 - p.x, j * TILE + 16 - p.y); if (n < distance) { best = d; distance = n; } } return best; },
  openDoor(d) { d.open = true; if (Game.lvl && (Game.lvl === 'mansion' || Game.lvl.startsWith('hospital'))) d.key = null; d.tiles.forEach(([i, j]) => this.grid[j][i] = 0); },
  los(x1, y1, x2, y2) { const d = Math.hypot(x2 - x1, y2 - y1), n = Math.ceil(d / 8); for (let i = 1; i < n; i++) if (this.solid(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n)) return false; return true; },
  draw(ctx, cam, w, h) {
    const x0 = Math.max(0, Math.floor(cam.x / TILE)), y0 = Math.max(0, Math.floor(cam.y / TILE)), x1 = Math.min(this.W - 1, Math.floor((cam.x + w) / TILE)), y1 = Math.min(this.H - 1, Math.floor((cam.y + h) / TILE));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const v = this.grid[y][x], px = x * TILE, py = y * TILE, hsh = (x * 73 + y * 151) % 7;
      if (v === 1) { ctx.fillStyle = this.wc[0]; ctx.fillRect(px, py, TILE, TILE); ctx.fillStyle = this.wc[1]; ctx.fillRect(px, py, TILE, 4); ctx.fillStyle = this.wc[2]; ctx.fillRect(px, py + TILE - 3, TILE, 3); if (this.bricks) { const o = (y & 1) ? 8 : 20; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.moveTo(px, py + 16); ctx.lineTo(px + TILE, py + 16); ctx.moveTo(px + o, py); ctx.lineTo(px + o, py + 16); ctx.moveTo(px + 28 - o, py + 16); ctx.lineTo(px + 28 - o, py + TILE); ctx.stroke(); } if (hsh === 3) { ctx.strokeStyle = this.wc[2]; ctx.beginPath(); ctx.moveTo(px + 8, py + 6); ctx.lineTo(px + 14, py + 16); ctx.lineTo(px + 11, py + 26); ctx.stroke(); } }
      else if (v === 2 || v === 3) { ctx.fillStyle = '#3b2c1f'; ctx.fillRect(px, py, TILE, TILE); ctx.fillStyle = '#251a12'; ctx.fillRect(px, py + 14, TILE, 4); ctx.fillStyle = v === 3 ? '#b01818' : '#6a6a58'; ctx.fillRect(px + 13, py + 12, 6, 8); }
      else {
        ctx.fillStyle = this.tint[y][x] || '#2b2b2f'; ctx.fillRect(px, py, TILE, TILE); const fv = this.fluid && this.fluid[y][x]; if (fv) { ctx.fillStyle = fv === 2 ? 'rgba(70,170,50,.55)' : 'rgba(40,70,70,.6)'; ctx.fillRect(px, py, TILE, TILE); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(px + 4 + ((this.t || 0) * 12 + x * 7) % 20, py + 8 + (y * 5) % 14, 8, 2); } if (hsh < 3) { ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(px, py, TILE, TILE); } if (((x + y) & 1) && hsh !== 6) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(px, py, TILE, TILE); }
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.strokeRect(px + .5, py + .5, TILE - 1, TILE - 1); if (hsh === 6) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px + 6, py + 9, 14, 3); }
        if (v === 4) PROP[this.props[x + ',' + y]](ctx, px, py);
      }
    }
    for (const d of this.decals) { ctx.fillStyle = d.c; ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r, d.r * .7, d.x, 0, 6.283); ctx.fill(); }
    for (const [t, x, y] of (this.decor || DECOR)) { const px = x * TILE, py = y * TILE; if (px < cam.x - 40 || py < cam.y - 40 || px > cam.x + w || py > cam.y + h) continue; DECO[t](ctx, px, py, (x * 7 + y * 3) % 5 * .6); }
  }
};
