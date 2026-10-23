const test = require("node:test"),
  assert = require("node:assert/strict");
const { X, run } = require("./harness");
const { Game, Hospital, Level, Weapons, SKILLS, Inventory, Puzzles, WEAPONS } =
  X;
Game.init();
function fresh() {
  Game.startLvl = "mansion";
  Game.start(false);
}
function hospital() {
  fresh();
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Hospital.inject(Game);
  Hospital.lobbyReached(Game);
  Game.player.x = 52.5 * 32;
  Game.player.y = 24.5 * 32;
  Game.enemies = [];
  Game.carn = null;
  Game.state = "play";
}
function take(id) {
  const it = Game.items.find((i) => i.id === id);
  assert.ok(it, id);
  Game.take(it);
  if (Game.state === "doc") Game.closeDoc();
}
function solveRack() {
  for (const [id, delta, count] of [
    [2, -1, 2],
    [1, -1, 2],
    [4, -1, 3],
    [3, 1, 2],
    [0, 1, 4],
  ]) {
    run("BluePuzzles.cur.selected=" + id);
    for (let j = 0; j < count; j++)
      assert.ok(run("WeaponPuzzles.move(Game," + delta + ")"));
  }
  assert.ok(run("WeaponPuzzles.solved()"));
  return run("WeaponPuzzles.complete(Game)");
}
test("El prólogo entrega un AK automático fuerte, con munición propia", () => {
  fresh();
  assert.equal(Game.player.weapon.id, "ak");
  assert.equal(Game.player.weapon.mag, 30);
  assert.equal(Game.inv.reserve("ak"), 90);
  assert.ok(WEAPONS.ak.auto && WEAPONS.ak.dmg > WEAPONS.pistol.dmg);
  assert.equal(Game.player.weapons.pistol, undefined);
  const before = Game.player.weapon.mag;
  Weapons.fire(Game, Game.player);
  assert.equal(Game.player.weapon.mag, before - 1);
});
test("Hospital elimina el equipo del prólogo incluso si estaba en el baúl", () => {
  fresh();
  Game.stash.push({ type: "w_ak", id: "ak", mag: 30 });
  Hospital.toHospital(Game);
  assert.ok(!Game.player.weapon);
  assert.equal(Game.inv.items.length, 0);
  assert.equal(Game.inv.reserve("ak"), 0);
  assert.equal(Game.stash.length, 0);
});
test("El arma inicial queda en suelo visible desde la entrada del vestíbulo", () => {
  hospital();
  const it = Game.items.find((i) => i.id === "pp1");
  assert.equal(it.x / 32, 52.5);
  assert.equal(it.y / 32, 26.5);
  assert.equal(Level.grid[26][52], 0);
  Game.render();
  assert.ok(run("HorrorVision.visible.has('52,26')"));
  take("pp1");
  assert.equal(Game.player.weapon.id, "pistol");
});
test("El monitor usa cargador real, capacidad mejorada y reserva independiente", () => {
  fresh();
  let v = run("WeaponMonitor.snapshot(Game)");
  assert.equal(v.id, "ak");
  assert.equal(v.loaded, 30);
  assert.equal(v.max, 30);
  assert.equal(v.reserve, 90);
  Game.player.mods.mag = 1;
  Game.player.weapon.mag = 7;
  v = run("WeaponMonitor.snapshot(Game)");
  assert.equal(v.loaded, 7);
  assert.equal(v.max, 34);
  Weapons.reload(Game.player);
  assert.ok(run("WeaponMonitor.snapshot(Game).reloading"));
  Weapons.finishReload(Game.player);
  assert.equal(Game.player.weapon.mag, 34);
  assert.equal(Game.inv.reserve("ak"), 63);
});
test("El monitor distingue armas de fuego, manos y forma orgánica", () => {
  hospital();
  assert.equal(run("WeaponMonitor.snapshot(Game).id"), "none");
  take("pp1");
  Game.player.predator = 3;
  assert.equal(run("WeaponMonitor.snapshot(Game).id"), "claw");
  assert.equal(run("WeaponMonitor.snapshot(Game).max"), 0);
});
test("Los cierres principales conservan sus llaves y no regalan escopeta ni UZI", () => {
  hospital();
  Puzzles.solve(Game, "h_cab");
  Puzzles.solve(Game, "h_safe");
  assert.ok(
    Game.inv.keys.includes("morgue") && Game.inv.keys.includes("garaje"),
  );
  assert.ok(!Game.player.weapons.shotgun && !Game.player.weapons.viper);
  assert.ok(!Game.stash.some((i) => i.id === "shotgun" || i.id === "viper"));
});
test("Escopeta: faltan piezas, no se puede abrir antes de explorar", () => {
  hospital();
  assert.ok(!Game.items.some((i) => i.id === "q_shotgun"));
  take("q_shot_rack");
  assert.equal(Game.state, "play");
  take("q_crank");
  take("q_shot_rack");
  assert.equal(Game.state, "puzzle");
  assert.equal(run("WeaponPuzzles.complete(Game)"), false);
  assert.ok(!Game.pz["adv:shotgun"]);
  assert.ok(!Game.items.some((i) => i.id === "q_shotgun"));
});
test("Escopeta: las piezas no atraviesan obstáculos y el soporte tiene salida", () => {
  hospital();
  take("q_crank");
  run("WeaponPuzzles.open(Game,'shotgun')");
  assert.equal(run("WeaponPuzzles.move(Game,1)"), false);
  assert.ok(solveRack());
  assert.ok(Game.pz["adv:shotgun"]);
  assert.ok(!Game.inv.keys.includes("rack_crank"));
  assert.ok(Game.items.some((i) => i.id === "q_shotgun"));
  assert.ok(!Game.player.weapons.shotgun);
  take("q_shotgun");
  assert.ok(Game.player.weapons.shotgun);
  assert.equal(Game.inv.reserve("shotgun"), 8);
});
test("Una recompensa no se pierde con el maletín lleno ni se duplica al volver", () => {
  hospital();
  take("q_crank");
  run("WeaponPuzzles.open(Game,'shotgun')");
  solveRack();
  while (Game.inv.add("inj_yellow")) {}
  const it = Game.items.find((i) => i.id === "q_shotgun");
  Game.take(it);
  assert.ok(!Game.picked.has(it.id));
  assert.ok(Game.items.includes(it));
  Game.inv.items = [];
  Game.inv.syncWeapons(Game.player);
  Game.take(it);
  const rounds = Game.inv.reserve("shotgun");
  Game.take(it);
  assert.equal(Game.inv.items.filter((i) => i.id === "shotgun").length, 1);
  assert.equal(Game.inv.reserve("shotgun"), rounds);
  Hospital.goto(Game, "hospital1", [50, 45]);
  Hospital.goto(Game, "hospital", [52, 24]);
  assert.ok(!Game.items.some((i) => i.id === "q_shotgun"));
});
test("Las trabas conservan ajustes al salir y tras guardar/cargar", () => {
  hospital();
  take("q_crank");
  run(
    "WeaponPuzzles.open(Game,'shotgun');BluePuzzles.cur.selected=2;WeaponPuzzles.move(Game,-1)",
  );
  Game.resume();
  Game.save(0);
  Game.start(false, Game.getSaveSlots()[0]);
  run("WeaponPuzzles.open(Game,'shotgun')");
  assert.equal(run("BluePuzzles.cur.positions[2][0]"), 1);
});
test("El cierre óptico requiere piezas de dos plantas diferentes", () => {
  hospital();
  take("q_prism");
  Hospital.goto(Game, "hospital1", [50, 45]);
  Game.story.seq = "free";
  run("WeaponPuzzles.open(Game,'optics')");
  assert.equal(Game.state, "play");
  take("q_cell");
  run("WeaponPuzzles.open(Game,'optics')");
  assert.equal(Game.state, "puzzle");
  assert.ok(!run("WeaponPuzzles.solved()"));
  assert.equal(run("WeaponPuzzles.complete(Game)"), false);
});
test("El haz necesita los tres testigos y el receptor para liberar la UZI", () => {
  hospital();
  take("q_prism");
  Hospital.goto(Game, "hospital1", [50, 45]);
  take("q_cell");
  run("WeaponPuzzles.open(Game,'optics')");
  for (let i = 0; i < 6; i++) run("WeaponPuzzles.turn(Game," + i + ")");
  assert.equal(run("WeaponPuzzles.beam(BluePuzzles.cur.angles).lit.size"), 3);
  assert.ok(run("WeaponPuzzles.complete(Game)"));
  assert.ok(!Game.player.weapons.viper);
  take("q_uzi");
  assert.ok(Game.player.weapons.viper);
  assert.equal(Game.inv.reserve("viper"), 30);
  assert.ok(
    !Game.inv.keys.includes("optic_cell") &&
      !Game.inv.keys.includes("optic_lens"),
  );
});
test("Una UZI de una partida antigua no se duplica en el nuevo alijo", () => {
  hospital();
  Game.giveWeapon("viper", 0, true);
  Hospital.goto(Game, "hospital1", [50, 45]);
  Game.pz["adv:optics"] = true;
  run("Adventure.sync(Game)");
  take("q_uzi");
  assert.equal(Game.inv.items.filter((i) => i.id === "viper").length, 1);
});
test("Las pistas principales orientan sin listar soluciones ni objetivos opcionales", () => {
  assert.ok(
    run(
      "['w_exit_note','w_shot_notice','w_shot_manual','w_uzi_notice','w_uzi_manual','w_uzi_optics'].every(id=>CLUES.has(id))",
    ),
  );
  hospital();
  take("pp1");
  let q = run("HospitalCompass.current(Game)");
  assert.equal(q.id, "service_west");
  assert.ok(!/0712|0714|escopeta|UZI|fusible A|fusible B/.test(q.hint));
  const before = q.id;
  Game.pz["adv:shotgun"] = true;
  Game.inv.keys.push("optic_lens");
  assert.equal(run("HospitalCompass.current(Game).id"), before);
  const markup = run("HospitalCompass.markup(Game,'hospital')");
  assert.match(markup, /ellipse/);
  assert.ok(!/Farmacia|Morgue|Seguridad|Aislamiento/.test(markup));
});
test("El rumbo del mapa cambia de planta y se actualiza después del generador", () => {
  hospital();
  take("pp1");
  Game.inv.keys.push("sotano", "fusible_a", "pase_sup");
  assert.equal(run("HospitalCompass.current(Game).floor"), "hospital1");
  assert.equal(run("HospitalCompass.markup(Game,'hospital')"), "");
  Game.inv.keys.push("fusible_b", "garaje");
  assert.equal(run("HospitalCompass.current(Game).floor"), "hospitalb");
  Game.pz["h:power"] = true;
  Game.inv.keys = Game.inv.keys.filter((k) => !k.startsWith("fusible_"));
  assert.equal(run("HospitalCompass.current(Game).id"), "garage");
  Game.pz["h:boss"] = true;
  assert.equal(run("HospitalCompass.current(Game).id"), "exit");
});
test("En un cruce se selecciona la puerta cercana, sin quedar bloqueado por otra cerradura", () => {
  hospital();
  Game.player.x = 21.686 * 32;
  Game.player.y = 45.5 * 32;
  const d = Level.nearDoor(Game.player);
  assert.equal(d.id, "security");
  assert.ok(Game.doorOk(d));
  Game.interact();
  assert.ok(d.open);
});
