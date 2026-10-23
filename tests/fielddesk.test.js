const test = require("node:test");
const assert = require("node:assert/strict");
const { X, run } = require("./harness");
const { Game, Hospital, Inventory, Level, SKILLS } = X;
Game.init();
function hospital() {
  Game.startLvl = "mansion";
  Game.start(false);
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Hospital.inject(Game);
  Hospital.lobbyReached(Game);
  Game.state = "play";
  Game.enemies = [];
  Game.carn = null;
}
test("Fabricar cuenta las casillas que liberan los ingredientes", () => {
  const inv = new Inventory();
  inv.cols = 2;
  inv.rows = 1;
  inv.addAmmo("screw_small", 2);
  inv.addAmmo("powder_small", 2);
  assert.equal(inv.craft("pistol").ok, true);
  assert.equal(inv.reserve("pistol"), 10);
  assert.equal(inv.items.length, 1);
});
test("Un fallo de espacio o materiales conserva todo el maletín", () => {
  const inv = new Inventory();
  inv.cols = 2;
  inv.rows = 1;
  inv.addAmmo("screw_small", 3);
  inv.addAmmo("powder_small", 3);
  const before = JSON.stringify(inv.serialize());
  assert.equal(inv.craft("pistol").ok, false);
  assert.equal(JSON.stringify(inv.serialize()), before);
  assert.equal(inv.craft("shotgun").ok, false);
  assert.equal(JSON.stringify(inv.serialize()), before);
  assert.equal(inv.craft("desconocida").ok, false);
  assert.equal(JSON.stringify(inv.serialize()), before);
});
test("Preparar y reagrupar materiales tiene un coste y no los multiplica", () => {
  const inv = new Inventory();
  inv.addAmmo("powder_large", 1);
  assert.equal(inv.craft("powder_split").ok, true);
  assert.equal(inv.items.find((i) => i.type === "powder_small").count, 3);
  assert.equal(inv.craft("powder_pack").ok, false);
  inv.addAmmo("powder_small", 1);
  assert.equal(inv.craft("powder_pack").ok, true);
  assert.equal(inv.items.length, 1);
  assert.equal(inv.items[0].count, 1);
  assert.equal(inv.items[0].type, "powder_large");
});
test("Fabricar mantiene la referencia del arma equipada y las llaves", () => {
  hospital();
  Game.inv = new Inventory();
  Game.inv.expand();
  Game.giveWeapon("pistol", 9, true);
  const gun = Game.player.weapon;
  Game.inv.addAmmo("screw_small", 2);
  Game.inv.addAmmo("powder_small", 2);
  Game.inv.keys = ["archivo"];
  assert.equal(Game.inv.craft("pistol").ok, true);
  assert.ok(Game.inv.items.includes(gun));
  assert.equal(Game.player.weapon, gun);
  assert.deepEqual(Game.inv.keys, ["archivo"]);
});
test("Leer la nota de la biblioteca conserva el desbloqueo de la historia", () => {
  Game.startLvl = "mansion";
  Game.start(false);
  Game.take(Game.items.find((i) => i.id === "m2"));
  assert.equal(Game.state, "doc");
  assert.equal(Game.pz["h:briefing"], true);
  Game.closeDoc();
  assert.equal(Game.state, "play");
});
test("La deformación crece con habilidades mutantes y respeta la ruta humana", () => {
  hospital();
  const base = run("MutationBody.intensity(Game)");
  for (const [id, s] of Object.entries(SKILLS))
    if (s.br === "hum") Game.mut.owned.add(id);
  assert.equal(run("MutationBody.intensity(Game)"), base);
  const ids = Object.keys(SKILLS).filter((id) => SKILLS[id].br === "mut");
  Game.mut.owned.add(ids[0]);
  const small = run("MutationBody.intensity(Game)");
  assert.ok(small > base && small < 0.1);
  ids.forEach((id) => Game.mut.owned.add(id));
  assert.equal(run("MutationBody.intensity(Game)"), 1);
  Game.story.armHealed = false;
  assert.equal(run("MutationBody.intensity(Game)"), 0);
});
test("Las siete taquillas quedan junto a un límite sin ocupar puertas", () => {
  hospital();
  let n = 0;
  for (const floor of ["hospital", "hospital1", "hospitalb"]) {
    Level.build(floor);
    const data = run("R2_DATA(" + JSON.stringify(floor) + ")");
    for (const [id, type, x, y] of data.items) {
      if (type !== "h_hide") continue;
      n++;
      assert.equal(Level.grid[y][x], 0, id);
      assert.ok(
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([a, b]) => Level.grid[y + b]?.[x + a] === 1),
        id + " junto a pared",
      );
      assert.ok(
        !Level.doors.some((d) => d.tiles.some(([a, b]) => a === x && b === y)),
        id,
      );
    }
  }
  assert.equal(n, 7);
});
test("El reloj tiene un solo mueble y un punto de interacción accesible", () => {
  Game.startLvl = "mansion";
  Game.start(false);
  const data = run("MANSION");
  const i = data.items.find((i) => i[0] === "h_clock");
  assert.equal(data.furn.clock.length, 1);
  assert.equal(Level.grid[i[3]][i[2]], 0);
  assert.ok(
    Math.hypot(data.furn.clock[0][0] - i[2], data.furn.clock[0][1] - i[3]) <= 1,
  );
});
