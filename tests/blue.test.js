const test = require("node:test");
const assert = require("node:assert/strict");
const { X, run } = require("./harness.js");
const { Game, Level, Hospital, Inventory, SKILLS } = X;
Game.init();
function start() {
  Game.startLvl = "mansion";
  Game.start(false);
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Hospital.inject(Game);
  Hospital.lobbyReached(Game);
  Game.state = "play";
}
test("Los mecanismos rechazan resultados incorrectos y conservan ajustes al salir", () => {
  start();
  run("BluePuzzles.open(Game,'mix');BluePuzzles.change(Game,0)");
  Game.resume();
  run("BluePuzzles.open(Game,'mix')");
  assert.equal(run("BluePuzzles.cur.values[0]"), 1);
  assert.equal(run("BluePuzzles.complete(Game)"), false);
  assert.equal(Game.pz["blue:mix"], undefined);
});
test("Las recompensas no se pierden con maletín lleno ni se duplican", () => {
  start();
  while (Game.inv.add("inj_green")) {}
  const before = Game.stash.length,
    xp = Game.player.xp;
  run(
    "BluePuzzles.open(Game,'mix');BluePuzzles.cur.values=[2,1,3];BluePuzzles.complete(Game)",
  );
  assert.equal(Game.stash.length, before + 2);
  assert.equal(Game.player.xp, xp + 30);
  assert.equal(run("BluePuzzles.complete(Game)"), false);
  assert.equal(Game.stash.length, before + 2);
});
test("Los dos circuitos son resolubles por giros y las falsas conexiones no funcionan", () => {
  start();
  assert.equal(
    run("BluePuzzles.circuitReach([0,0,0,0,0,0,0,0,0]).has(9)"),
    false,
  );
  const solution = run(
    `(()=>{for(let n=0;n<262144;n++){let k=n,v=[];for(let i=0;i<9;i++){v.push(k%4);k=Math.floor(k/4);}if(BluePuzzles.circuitReach(v).has(9))return v;}return null;})()`,
  );
  assert.ok(solution);
  run(
    `BluePuzzles.open(Game,'security');BluePuzzles.cur.values=${JSON.stringify(solution)};BluePuzzles.complete(Game)`,
  );
  assert.ok(Level.doors.find((d) => d.id === "arch").open);
  Hospital.goto(Game, "hospitalb", [8, 10]);
  let generator = Game.items.find((i) => i.id === "h_gen");
  Game.take(generator);
  assert.equal(Game.state, "play");
  Game.inv.keys.push("fusible_a", "fusible_b");
  Game.take(generator);
  assert.equal(Game.state, "puzzle");
  assert.ok(!Game.pz["h:power"]);
  run(
    `BluePuzzles.cur.values=${JSON.stringify(solution)};BluePuzzles.complete(Game)`,
  );
  assert.ok(Game.pz["h:power"]);
  assert.ok(!Game.inv.keys.includes("fusible_a"));
  assert.ok(Level.doors.find((d) => d.id === "garage").open);
});
test("Aislamiento ofrece un mecanismo distinto y guarda su progreso", () => {
  start();
  Hospital.goto(Game, "hospital1", [50, 45]);
  Game.take(Game.items.find((i) => i.id === "h_eeg"));
  run("BluePuzzles.cur.values=[2,4,3];BluePuzzles.complete(Game)");
  assert.ok(Game.pz["blue:eeg"]);
  assert.equal(Game.inv.samples, 1);
  Game.save(0);
  const saved = Game.getSaveSlots()[0];
  Game.start(false, saved);
  assert.ok(Game.pz["blue:eeg"]);
  assert.equal(Game.inv.samples, 1);
});
test("La galería sur conecta ambas alas sin atravesar el vestíbulo", () => {
  start();
  for (const d of Level.doors) if (!d.key) Level.openDoor(d);
  const q = [[20, 40]],
    seen = new Set(["20,40"]);
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const a = x + dx,
        b = y + dy,
        k = a + "," + b;
      if (b < 38 || Level.grid[b]?.[a] !== 0 || seen.has(k)) continue;
      seen.add(k);
      q.push([a, b]);
    }
  }
  assert.ok(seen.has("83,40"), "Falta conexión entre las alas");
});
test("Las maestrías alteran esquiva, daño y recuperación", () => {
  start();
  Game.mut.owned.add("blue_force_7");
  Game.player.dodge(Game, 100, 0.2);
  assert.equal(Math.hypot(Game.player.dashVx, Game.player.dashVy), 630);
  const foe = Game.enemies.find((e) => e.type === "sonambulo");
  foe.hp = 20;
  Game.blueShooting = true;
  Game.mut.owned.add("blue_aim_7");
  foe.hurt(4, 0, Game);
  assert.ok(Math.abs(foe.hp - 14.72) < 1e-9);
  Game.blueShooting = false;
  Game.mut.owned.add("blue_body_7");
  Game.player.energy = 0;
  Game.player.onKill(Game);
  assert.equal(Game.player.energy, 6);
});
