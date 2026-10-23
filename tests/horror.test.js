const test = require("node:test");
const assert = require("node:assert/strict");
const { X, run } = require("./harness.js");
const { Game, Level, Hospital, SKILLS, Nav } = X;
Game.init();
function fixture(lvl = "hospital") {
  Game.startLvl = "mansion";
  Game.start(false);
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Hospital.inject(Game);
  Hospital.lobbyReached(Game);
  if (lvl !== "hospital") Hospital.goto(Game, lvl, [8, 10]);
  Game.state = "play";
  Game.player.hp = Game.player.maxHp = 1000;
}
function at(x, y) {
  Game.player.x = x * 32 + 16;
  Game.player.y = y * 32 + 16;
}
test("Red conectada: inicio común, requisitos y 2 elecciones doradas", () => {
  fixture();
  assert.equal(Object.keys(SKILLS).length, 153);
  for (const [id, s] of Object.entries(SKILLS)) {
    assert.ok(Number.isFinite(s.px) && Number.isFinite(s.py), id);
    if (id === "core") continue;
    assert.ok(s.requires.length>=1);
    const parent = SKILLS[s.requires[0]];
    assert.ok(parent, id);
    if (s.br === "hum") {
      assert.equal(s.mod?.en || 0, 0);
      assert.equal(s.mod?.eregen || 0, 0);
      if (s.type === "active") assert.equal(s.resource, "stamina");
    }
  }
  Game.player.xp = 10000;
  let change = true;
  while (change) {
    change = false;
    for (const id in SKILLS)
      if (!Game.mut.has(id) && !Game.mut.canBuy(id, Game.player.xp)) {
        Game.buySkill(id);
        change = true;
      }
  }
  assert.equal(Game.mut.owned.size, 149);
});
test("La técnica humana consume estamina y el poder mutante consume Riutex", () => {
  fixture();
  Game.mut.owned.add("concentracion");
  Game.player.energy = 100;
  Game.player.stamina = 100;
  Game.castSkill("concentracion");
  assert.equal(Game.player.energy, 100);
  assert.equal(Game.player.stamina, 82);
  Game.mut.owned.add("coraza");
  Game.castSkill("coraza");
  assert.equal(Game.player.energy, 70);
  assert.equal(Game.player.shell, 6);
  Game.mut.owned.add("trueque");
  const hp = Game.player.hp;
  Game.castSkill("trueque");
  assert.equal(Game.player.hp, hp - 12);
  assert.equal(Game.player.energy, 115);
});
test("Las mejoras de estamina amplían la reserva y se respetan al recuperarla", () => {
  fixture();
  for (const [id, s] of Object.entries(SKILLS))
    if (s.mod?.capacity) Game.mut.owned.add(id);
  Game.player.stamina = 100;
  Game.update(0.01);
  assert.ok(Game.player.maxStamina > 100);
  Game.player.stamina = Game.player.maxStamina - 1;
  Game.player.update(0.1, Game);
  assert.ok(Game.player.stamina > 100);
  assert.ok(Game.player.stamina <= Game.player.maxStamina);
});
test("Una sala no se revela a través de una puerta abierta hasta entrar", () => {
  fixture();
  at(38, 28);
  Level.openDoor(Level.doors.find((d) => d.id === "lob_w"));
  Game.story.visited = { "hospital:Vestíbulo central": true };
  Game.story.mapTiles = {};
  run("HorrorVision.prepare(Game)");
  assert.equal(run("HorrorVision.allowed(35,28)"), false);
  assert.ok(!Game.story.mapTiles.hospital.includes("35,28"));
  at(35, 28);
  Game.update(0.01);
  run("HorrorVision.prepare(Game)");
  assert.equal(run("HorrorVision.allowed(35,28)"), true);
  assert.ok(Game.story.mapTiles.hospital.includes("35,28"));
});
test("Los muros detienen la visibilidad incluso entre salas visitadas", () => {
  fixture();
  Game.story.visited = {
    "hospital:Oficinas": true,
    "hospital:Ala oeste": true,
  };
  at(16, 25);
  run("HorrorVision.prepare(Game)");
  assert.ok(!run("HorrorVision.visible.has('18,25')"));
  Level.openDoor(Level.doors.find((d) => d.id === "ofi"));
  run("HorrorVision.prepare(Game)");
  assert.ok(run("HorrorVision.visible.has('18,25')"));
});
test("La rampa no puede rodearse por el almacén ni por criogenia sin llave", () => {
  fixture("hospitalb");
  for (const d of Level.doors) if (!d.key) Level.openDoor(d);
  const seen = new Set(["64,18"]),
    q = [[64, 18]];
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
      if (Level.grid[b]?.[a] !== 0 || seen.has(k)) continue;
      seen.add(k);
      q.push([a, b]);
    }
  }
  assert.ok(!seen.has("74,24"));
  assert.ok(Level.grid[24][72] === 1);
  assert.ok(Level.doors.find((d) => d.id === "bulkhead_cryo").key === "garaje");
});
test("Ocultarse sin ser visto rompe la persecución y el Carnicero se aleja", () => {
  fixture();
  for (const d of Level.doors) if (!d.key) Level.openDoor(d);
  const c = Game.carn;
  c.dormant = false;
  c.scripted = false;
  c.x = 20.5 * 32;
  c.y = 25.5 * 32;
  c.state = "chase";
  c.hunt = true;
  c.lastSeen = [c.x, c.y];
  c.tgt = c.lastSeen.slice();
  at(10, 25);
  Game.player.hidden = true;
  Game.noise = null;
  for (let i = 0; i < 600; i++) {
    Game.t += 1 / 30;
    c.update(1 / 30, Game);
  }
  assert.equal(Game.player.hidden, true);
  assert.equal(c.hunt, false);
  assert.ok(["patrol", "routine", "search"].includes(c.state));
  assert.ok(Math.hypot(c.x - Game.player.x, c.y - Game.player.y) > 180);
});
test("Un ruido nuevo interrumpe su rutina sin conocer la posición oculta", () => {
  fixture();
  const c = Game.carn;
  c.dormant = false;
  c.scripted = false;
  c.x = 45.5 * 32;
  c.y = 25.5 * 32;
  c.face = 0;
  c.state = "routine";
  c.routineT = 10;
  at(45, 30);
  Game.player.hidden = false;
  Game.noise = { x: Game.player.x, y: Game.player.y, r: 420 };
  c.update(0.1, Game);
  assert.ok(["investigate", "search"].includes(c.state));
  assert.deepEqual(Array.from(c.tgt), [Game.player.x, Game.player.y]);
});
test("Si presencia la entrada a la taquilla, investiga ese escondite", () => {
  fixture();
  const it = Game.items.find((i) => i.id === "hide_p1");
  Game.player.x = it.x;
  Game.player.y = it.y;
  const c = Game.carn;
  c.dormant = false;
  c.scripted = false;
  c.x = it.x + 90;
  c.y = it.y;
  c.face = Math.PI;
  c.state = "chase";
  c.hunt = true;
  Hospital.use(Game, it);
  assert.ok(c.hideWitness);
  for (let i = 0; i < 300 && Game.player.hidden; i++) c.update(1 / 30, Game);
  assert.equal(Game.player.hidden, false);
});
test("La guía indica correr, inyectar y bajar al vestíbulo en el momento correcto", () => {
  fixture();
  Game.story.seq = "run";
  at(42, 7);
  run("EscapeGuide.tick(Game)");
  assert.ok(run("EscapeGuide.target[0]") > Game.player.x);
  Game.story.seq = "cut";
  run("EscapeGuide.tick(Game)");
  assert.equal(run("EscapeGuide.target"), null);
  Game.story.seq = "healed";
  at(52, 12);
  run("EscapeGuide.tick(Game)");
  assert.ok(run("EscapeGuide.target[1]") > Game.player.y);
});

test('La puerta del invernadero no se puede rodear por el lateral de la pasarela',()=>{fixture();assert.equal(Level.grid[44][100],1);const d=Level.doors.find(d=>d.id==='greenhouse');assert.ok(!d.open);assert.equal(Level.grid[46][100],2);Level.openDoor(d);assert.equal(Level.grid[46][100],0);assert.equal(Level.grid[44][100],1);});

test('Esconderse no elimina la reserva de estamina ampliada',()=>{fixture();Game.player.maxStamina=160;Game.player.stamina=145;Game.player.hidden=true;Game.player.update(.1,Game);assert.ok(Game.player.stamina>=145);assert.ok(Game.player.stamina<=160);});
