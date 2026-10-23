const test = require("node:test");
const assert = require("node:assert/strict");
const { X, run } = require("./harness.js");
const { Game, Level, Hospital, SKILLS, Mutation } = X;
Game.init();
function fresh() {
  Game.startLvl = "mansion";
  Game.start(false);
}
function hospital() {
  fresh();
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Game.state = "play";
}
function point(x, y) {
  Game.player.x = x * 32 + 16;
  Game.player.y = y * 32 + 16;
}
test("Reanudar entre fotogramas nunca hace retroceder los efectos", () => {
  fresh();
  Game.ring(Game.player.x, Game.player.y, 80, "#ffffff");
  Game.last = 1000;
  const before = Game.t;
  Game.loop(990);
  assert.ok(Game.t >= before);
  assert.ok(Game.rings.every((r) => r.life <= r.max));
});
test("Tomar el frasco sella la cámara y ralentiza solo la captura", () => {
  fresh();
  point(32, 5);
  Hospital.finale(Game);
  const d = Level.doors.find((d) => d.id === "secreto");
  assert.ok(!d.open);
  assert.equal(d.key, "h:capture");
  assert.ok(!Game.doorOk(d));
  const p = Game.player,
    old = p.x;
  Level.move(p, 10, 0);
  assert.ok(Math.abs(p.x - old - 3.8) < 0.001);
  assert.ok(Game.custodio.y < 9 * 32);
});
test("Intentar huir por la puerta cerrada termina en captura física", () => {
  fresh();
  point(32, 5);
  Hospital.finale(Game);
  Game.keys = { KeyS: true, ShiftLeft: true };
  let frames = 0;
  while (Game.lvl === "mansion" && frames++ < 900) Game.update(1 / 60);
  assert.equal(Game.lvl, "hospital");
  assert.ok(Game.story.restrained);
  assert.equal(Game.story.captureHeavy, false);
  Game.story.restrained = false;
  const p = Game.player,
    x = p.x;
  Level.move(p, 10, 0);
  assert.equal(p.x - x, 10);
});
test("La puerta no se abre al mantener E: el primer golpe junto al cierre la abre", () => {
  hospital();
  point(43, 7);
  Game.story.seq = "run";
  const c = Game.carn;
  c.dormant = false;
  c.scripted = true;
  c.x = 40 * 32;
  c.y = 7.5 * 32;
  Game.keys = { KeyE: true };
  Hospital.tick(Game, 2);
  const d = Level.doors.find((d) => d.id === "forced");
  assert.ok(!d.open);
  c.hitPlayer(Game);
  assert.ok(d.open);
  assert.equal(Game.story.firstDoorHits, 1);
  assert.equal(Game.story.seq, "wounded_run");
  assert.ok(!Game.story.armHealed);
  c.hitPlayer(Game);
  assert.equal(Game.story.firstDoorHits, 1);
});
test("Inyectarse solo es posible tras llegar al vestíbulo y cerrar el tutorial", () => {
  hospital();
  point(43, 7);
  Game.story.seq = "run";
  Game.carn.hitPlayer(Game);
  Game.useInj();
  assert.ok(!Game.story.armHealed);
  point(52, 24);
  Hospital.tick(Game, 0.1);
  assert.equal(Game.state, "tutorial");
  assert.equal(Game.story.seq, "lobby_inject");
  assert.ok(Game.carn.dormant);
  assert.ok(!Level.doors.find((d) => d.id === "shutter").open);
  run("Guidebook.close(Game)");
  assert.equal(Game.state, "play");
  Game.useInj();
  assert.ok(Game.story.armHealed);
  assert.equal(Game.story.seq, "free");
  assert.ok(Game.mut.tutorial);
  assert.ok(Game.story.tutorialSeen);
});
test("El tutorial se recuerda al guardar y puede volver a abrirse desde pausa", () => {
  hospital();
  point(52, 24);
  Game.story.armCut = true;
  Game.story.seq = "wounded_run";
  Hospital.tick(Game, 0.1);
  run("Guidebook.close(Game)");
  Game.save(0);
  Game.start(false, Game.getSaveSlots()[0]);
  assert.equal(Game.story.seq, "lobby_inject");
  assert.equal(Game.state, "play");
  assert.ok(Game.story.tutorialSeen);
  Game.pause();
  run("Guidebook.open(Game,false);Guidebook.close(Game)");
  assert.equal(Game.state, "pause");
});
test("El mobiliario no produce cuñas opacas que borran toda la zona tras él", () => {
  hospital();
  point(44, 28);
  Game.story.visited = { "hospital:Vestíbulo central": true };
  assert.equal(Level.grid[28][47], 4);
  run("HorrorVision.prepare(Game)");
  assert.ok(run("HorrorVision.visible.has('49,28')"));
  assert.ok(
    Level.blocked(47.5 * 32, 28.5 * 32, 10),
    "El mueble sigue teniendo colisión",
  );
});
test("La red empieza con seis mejoras comunes y después se enlaza mediante requisitos dobles", () => {
  fresh();
  for (const id of run("RevisionTree.common"))
    assert.equal(SKILLS[id].br, "neu");
  const joins = Object.values(SKILLS).filter((s) => s.requires?.length === 2);
  assert.ok(joins.length >= 10);
  for (const k of ["bridge_balance", "bridge_control", "bridge_converge"]) {
    assert.equal(SKILLS[k].requires.length, 2);
    assert.ok(SKILLS[k].requires.some((p) => SKILLS[p].br === "hum"));
    assert.ok(SKILLS[k].requires.some((p) => SKILLS[p].br === "mut"));
  }
});
test("Solo se puede comprar una especialización dorada por tramo y la elección se guarda", () => {
  fresh();
  Game.mut.tutorial = true;
  Game.player.xp = 100000;
  for (const [id, s] of Object.entries(SKILLS))
    if (!s.gold) Game.mut.owned.add(id);
  const gold = Object.entries(SKILLS).filter(([, s]) => s.gold);
  assert.equal(gold.length, 8);
  for (let i = 0; i < 2; i++) {
    const pair = gold.filter(
      ([, s]) => s.gold === (i ? "doctrine_mut" : "doctrine_hum"),
    );
    assert.equal(Game.mut.canBuy(pair[0][0], Game.player.xp), null);
    Game.buySkill(pair[0][0]);
    const xp = Game.player.xp;
    assert.match(
      Game.mut.canBuy(pair[1][0], Game.player.xp),
      /Elección sellada/,
    );
    Game.buySkill(pair[1][0]);
    assert.equal(Game.player.xp, xp);
    assert.ok(!Game.mut.has(pair[1][0]));
  }
  const restored = new Mutation();
  restored.load(Game.mut.serialize());
  assert.match(restored.canBuy("gold_triage", 100000), /Elección sellada/);
});
test("Un nodo de unión requiere las dos habilidades, no una sola", () => {
  fresh();
  const s = SKILLS.bridge_balance;
  Game.mut.owned.add(s.requires[0]);
  assert.match(
    Game.mut.canBuy("bridge_balance", 1000),
    /Necesitas ambas|Antes:/,
  );
  Game.mut.owned.add(s.requires[1]);
  assert.equal(Game.mut.canBuy("bridge_balance", 1000), null);
});
test("El catalizador dorado reduce el coste real de los poderes", () => {
  hospital();
  Hospital.inject(Game);
  Game.mut.owned.add("gold_catalyst");
  Game.player.energy = 100;
  Game.mut.owned.add("instinto");
  Game.castSkill("instinto");
  assert.ok(
    Math.abs(Game.player.energy - (100 - SKILLS.instinto.energy * 0.84)) <
      0.001,
  );
});
