// Arnés headless: carga los scripts del juego con un DOM falso y permite ejecutar lógica real.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = process.env.R2ROOT || process.argv[2] || require('path').join(__dirname,'..');
const mkEl = () => { const e = { style: {setProperty(k,v){this[k]=v;}}, dataset:{}, classList: { toggle() {}, add() {}, remove() {} }, children: [], setAttribute() {}, appendChild() {}, querySelector() { return mkEl(); }, querySelectorAll(){ return [mkEl(),mkEl(),mkEl()]; }, addEventListener() {}, getContext: () => ctx2d, set innerHTML(v) {}, get innerHTML() { return ''; }, textContent: '', width: 800, height: 600, remove() {} }; return e; };
const ctx2d = new Proxy({}, { get: (t, k) => k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : (() => {}), set: () => true });
const store = {};
const sandbox = { console, Math, JSON, Set, Map, Array, Object, Number, String, Date, performance: { now: () => 0 }, setTimeout: (f) => 0, clearTimeout() {}, requestAnimationFrame() {}, innerWidth: 800, innerHeight: 600,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => store[k] = v }, addEventListener() {},
  document: { body: mkEl(), getElementById: () => mkEl(), createElement: () => mkEl() }, Audio: function () {}, AudioContext: function () {} };
sandbox.window = sandbox; vm.createContext(sandbox);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
for (const s of scripts) { try { vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8') + '\n', sandbox, { filename: s }); } catch (e) { throw new Error('LOAD ERROR '+s+': '+e.stack); } }
// const/class declarations no cuelgan de globalThis: los exponemos
vm.runInContext(`globalThis.__X = { PROP, FLOORS: typeof FLOORS!=='undefined'?FLOORS:null, Trees: typeof Trees!=='undefined'?Trees:null, HOSP: null, MANSION: typeof MANSION!=='undefined'?MANSION:null, Hospital: typeof Hospital!=='undefined'?Hospital:null, Nav: typeof Nav!=='undefined'?Nav:null, Carnicero: typeof Carnicero!=='undefined'?Carnicero:null, Weapons, Game, Level, Campaign, Sewer, Base, Lab, Enemy, Carcelero, ENEMY_TYPES, DOCS, Puzzles, Inventory, Mutation, SKILLS, ITEMS, WEAPONS, UI, Sound, TILE }`, sandbox);
module.exports = { sandbox, X: sandbox.__X, run: c => vm.runInContext(c, sandbox) };
