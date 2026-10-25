const test = require('node:test');
const assert = require('node:assert/strict');
const { X, run } = require('./harness');
const { Game, Hospital, Inventory, Level } = X;
const Archive = run('FieldArchive'), Atlas = run('MapAtlas'), Desk = run('FieldDesk');
Game.init();
function fixture() {
  Game.startLvl = 'mansion'; Game.start(false); Hospital.toHospital(Game);
  Game.story.restrained = false; Hospital.inject(Game); Hospital.lobbyReached(Game);
  Game.state = 'play'; Game.enemies = []; Game.carn = null;
  Game.story.read = []; Game.story.visited = {}; Game.story.mapTiles = {};
  Archive.prepare(Game);
}
const plain = x => JSON.parse(JSON.stringify(x));
test('El buscador ignora tildes, combina palabras y solo consulta documentos recuperados', () => {
  fixture(); Game.inv.docs = ['w_shot_notice', 'b_diag', 'lf_arrival', 'lore20_01'];
  Archive.query = '  DIAGNOSTICO  ';
  assert.ok(Archive.matches(Game).includes('b_diag'));
  Archive.query = 'LABORATORIO UMBRAL';
  assert.deepEqual(plain(Archive.matches(Game)), ['lf_arrival']);
  Archive.query = 'suero';
  assert.ok(Archive.matches(Game).every(id => Game.inv.docs.includes(id)));
  const hidden = Object.keys(X.DOCS).find(id => !Game.inv.docs.includes(id) && X.DOCS[id].title.length > 12);
  Archive.query = X.DOCS[hidden].title;
  assert.ok(!Archive.matches(Game).includes(hidden));
  Archive.query = '<script>';
  assert.deepEqual(plain(Archive.matches(Game)), []);
});
test('Filtros y búsquedas no marcan lecturas ni añaden EXP; leer solo registra el papel elegido', () => {
  fixture(); Game.inv.docs = ['w_shot_notice', 'b_diag', 'lore20_01'];
  Game.story.read = ['b_diag']; const xp = Game.player.xp;
  X.UI.jTab = 'unread'; Archive.query = '';
  assert.deepEqual(plain(Archive.matches(Game)).sort(), ['lore20_01', 'w_shot_notice'].sort());
  Archive.renderList(Game); assert.deepEqual(plain(Game.story.read), ['b_diag']);
  X.UI.renderJournal(Game, 'lore20_01');
  assert.deepEqual(plain(Game.story.read), ['b_diag', 'lore20_01']);
  assert.equal(Game.player.xp, xp);
  X.UI.jTab = 'pista'; assert.ok(Archive.matches(Game).every(id => run('CLUES').has(id)));
  X.UI.jTab = 'historia'; assert.ok(Archive.matches(Game).every(id => !run('CLUES').has(id)));
});
test('La procedencia usa la ubicación de cada papel, también al leerlo desde otra zona', () => {
  fixture();
  for (const [id, expected] of [['m1', 'mansion'], ['h1', 'hospital'], ['wx_intro', 'works'], ['cl_silence', 'castle'], ['lf_arrival', 'umbra'], ['wx_radio_log', 'works']]) {
    const origin = Archive.source(id); assert.ok(origin, id);
    assert.equal(Archive.sector(origin.lvl).id, expected, id);
  }
  Archive.query = 'texto anterior'; const oldInv = Game.inv;
  Game.inv = new Inventory(); Archive.prepare(Game);
  assert.equal(Archive.query, ''); assert.equal(X.UI.jTab, 'all');
  assert.notEqual(Archive.inventory, oldInv);
});
test('Equipar desde el maletín reutiliza el arma real y cancela la recarga sin regalar munición', () => {
  fixture(); Game.inv = new Inventory(); Game.inv.expand();
  Game.giveWeapon('pistol', 7, true); const pistol = Game.player.weapon; pistol.mag = 7;
  Game.giveWeapon('shotgun', 2, false); const shotgun = Game.inv.items.find(i => i.id === 'shotgun');
  Game.player.weapon = pistol; Game.inv.addAmmo('am_pistol', 9);
  Game.inv.sel = Game.inv.items.indexOf(shotgun); Game.player.reloading = 1;
  const before = JSON.stringify(Game.inv.serialize());
  assert.equal(Desk.equipSelected(Game), false, 'No se equipa desde juego activo');
  Game.state = 'inv'; assert.equal(Desk.equipSelected(Game), true);
  assert.equal(Game.player.weapon, shotgun); assert.equal(Game.player.reloading, 0);
  assert.equal(JSON.stringify(Game.inv.serialize()), before); assert.equal(pistol.mag, 7);
  assert.equal(Desk.equipSelected(Game), false, 'No repite un cambio inexistente');
  Game.inv.sel = Game.inv.items.findIndex(i => i.type === 'am_pistol');
  assert.equal(Desk.equipSelected(Game), false); assert.equal(Game.player.weapon, shotgun);
});
test('La ficha del mapa no conoce puertas, servicios ni botín de salas no visitadas', () => {
  fixture(); const D = run("R2_DATA('hospital')"), index = D.rooms.findIndex(r => r[0] === 'Vestíbulo central');
  assert.ok(index >= 0); assert.equal(Atlas.roomSummary(Game, 'hospital', index), null);
  Game.story.visited['hospital:Vestíbulo central'] = true;
  const info = Atlas.roomSummary(Game, 'hospital', index);
  assert.deepEqual(plain(info), { name: 'Vestíbulo central', doors: 0, open: 0, locked: 0, services: [], remaining: 0 });
});
test('El banco de armas cuenta como servicio solo tras verlo y conserva el filtro de recompensas', () => {
  fixture(); const D = run("R2_DATA('hospital')"), bench = D.items.find(i => i[1] === 'h_workbench'), k = Atlas.knowledge(Game, 'hospital', D);
  const room = k.roomAt(bench[2], bench[3]), index = D.rooms.indexOf(room);
  assert.ok(index >= 0); Game.story.visited['hospital:' + room[0]] = true;
  assert.ok(!Atlas.roomSummary(Game, 'hospital', index).services.includes('Mesa de mejoras'));
  Game.story.mapTiles.hospital = [bench[2] + ',' + bench[3]];
  assert.ok(Atlas.roomSummary(Game, 'hospital', index).services.includes('Mesa de mejoras'));
  Game.picked.add(bench[0]);
  assert.ok(!Atlas.roomSummary(Game, 'hospital', index).services.includes('Mesa de mejoras'));
  assert.equal(Atlas.roomSummary(Game, 'hospital', -1), null);
});
