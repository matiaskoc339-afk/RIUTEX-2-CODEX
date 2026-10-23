const test = require("node:test");
const assert = require("node:assert/strict");
const { X, run } = require("./harness");
const { Game, Level, Hospital, Enemy, SKILLS, Mutation, Weapons } = X;
Game.init();
function fixture() {
  Game.startLvl = "mansion";
  Game.start(false);
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Hospital.inject(Game);
  Hospital.lobbyReached(Game);
  Game.player.x = 44.5 * 32;
  Game.player.y = 28.5 * 32;
  Game.state = "play";
  Game.player.hp = Game.player.maxHp = 1000;
  Game.enemies = [];
  Level.lamps = [];
  Game.carn.dormant = true;
}
test("La red no solapa círculos, incluidas las bifurcaciones doradas", () => {
  fixture();
  const nodes = Object.entries(SKILLS);
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      const [id, a] = nodes[i],
        [other, b] = nodes[j];
      const radius = (s) => (s.gold ? 29 : s.kind === "minor" ? 15 : 23.5);
      assert.ok(
        Math.hypot(a.px - b.px, a.py - b.py) >= radius(a) + radius(b) + 4,
        id + " / " + other,
      );
    }
});
test("Cuatro parejas doradas del mismo color y cuatro elecciones independientes", () => {
  fixture();
  Game.player.xp = 10000;
  for (const [id, s] of Object.entries(SKILLS))
    if (!s.gold) Game.mut.owned.add(id);
  for (const group of [
    "doctrine_hum",
    "doctrine_mut",
    "doctrine_hum_advanced",
    "doctrine_mut_advanced",
  ]) {
    const pair = Object.entries(SKILLS).filter(([, s]) => s.gold === group);
    assert.equal(pair.length, 2);
    assert.equal(pair[0][1].gold, pair[1][1].gold);
    Game.buySkill(pair[0][0]);
    assert.match(Game.mut.canBuy(pair[1][0], 10000), /Elección sellada/);
  }
  assert.ok(Game.mut.has("gold_reload") && Game.mut.has("gold_catalyst"));
});
test("Los cuatro ramales terminan en poderes o técnicas propios sin dependientes", () => {
  fixture();
  for (const id of [
    "camuflaje",
    "disparo_sereno",
    "suspension",
    "forma_acechador",
  ]) {
    assert.equal(SKILLS[id].type, "active");
    assert.ok(SKILLS[id].requires.length > 0);
    assert.ok(!Object.values(SKILLS).some((s) => s.requires?.includes(id)));
  }
});
test("Suspensión detiene enemigos y proyectiles mientras permite mover al jugador", () => {
  fixture();
  const p = Game.player,
    e = new Enemy("vacio", p.x + 64, p.y, 9021);
  e.alert = true;
  Game.enemies = [e];
  Game.eproj = [{ x: p.x + 40, y: p.y, vx: -140, vy: 0, life: 2, dmg: 5 }];
  Game.mut.owned.add("suspension");
  const energy = p.energy;
  Game.castSkill("suspension");
  assert.equal(p.energy, energy - 48);
  const pos = [e.x, e.y, Game.eproj[0].x],
    px = p.x;
  Game.keys = { KeyS: true };
  Game.update(0.1);
  assert.equal(e.x, pos[0]);
  assert.equal(e.y, pos[1]);
  assert.equal(Game.eproj[0].x, pos[2]);
  assert.ok(p.y > 28.5 * 32);
  assert.ok(p.x === px);
  assert.ok(Game.mut.cd.suspension > 31);
  Game.keys = {};
  Game.temporalField.life = 0.01;
  Game.update(0.02);
  assert.equal(Game.temporalField, null);
  assert.notEqual(Game.eproj[0].x, pos[2]);
});
test("Suspensión ralentiza al Carnicero y respeta el alcance y las paredes", () => {
  fixture();
  Game.mut.owned.add("suspension");
  Game.castSkill("suspension");
  const c = Game.carn;
  c.x = Game.player.x + 32;
  c.y = Game.player.y;
  assert.equal(run("Specializations.fieldFactor(Game.carn,Game)"), 0.22);
  c.x = Game.player.x + 300;
  assert.equal(run("Specializations.fieldFactor(Game.carn,Game)"), 1);
  c.x = 35 * 32;
  c.y = Game.player.y;
  assert.equal(run("Specializations.fieldFactor(Game.carn,Game)"), 1);
});
test("El camuflaje es humano, consume estamina y pierde efecto al correr", () => {
  fixture();
  const p = Game.player;
  Game.mut.owned.add("camuflaje");
  const energy = p.energy;
  Game.castSkill("camuflaje");
  assert.equal(p.stamina, 74);
  assert.equal(p.energy, energy);
  assert.ok(run("Specializations.concealed(Game.player)"));
  const e = new Enemy("vacio", p.x + 120, p.y, 9022);
  e.alert = true;
  Game.enemies = [e];
  Game.update(0.1);
  assert.ok(!e.alert);
  Game.keys = { KeyS: true, ShiftLeft: true };
  Game.update(0.1);
  assert.equal(p.cloak, 0);
});
test("Luz intensa impide camuflarse y no consume estamina", () => {
  fixture();
  const p = Game.player;
  Game.mut.owned.add("camuflaje");
  Level.lamps = [{ x: p.x, y: p.y, r: 180 }];
  Game.castSkill("camuflaje");
  assert.equal(p.cloak, 0);
  assert.equal(p.stamina, 100);
});
test("Atacar rompe camuflaje y la transformación bloquea armas de fuego", () => {
  fixture();
  const p = Game.player;
  Game.giveWeapon("pistol", 24, true);
  p.cloak = 8;
  p.meleeCd = 0;
  p.slash = 0;
  p.melee(Game);
  assert.equal(p.cloak, 0);
  Game.mut.owned.add("forma_acechador");
  Game.castSkill("forma_acechador");
  assert.equal(p.predator, 9);
  assert.equal(p.blade, 9);
  const mag = p.weapon.mag;
  Weapons.fire(Game, p);
  assert.equal(p.weapon.mag, mag);
  const x = p.x;
  Level.move(p, 10, 0);
  assert.ok(Math.abs(p.x - x - 12.6) < 1e-9);
});
test("La ventana de precisión acaba al correr y no deja daño permanente", () => {
  fixture();
  const p = Game.player;
  Game.mut.owned.add("disparo_sereno");
  Game.giveWeapon("pistol", 24, true);
  Game.castSkill("disparo_sereno");
  const pow = p.mods.pow;
  Weapons.fire(Game, p);
  assert.equal(p.mods.pow, pow);
  Game.keys = { KeyS: true, ShiftLeft: true };
  Game.update(0.1);
  assert.equal(p.precisionWindow, 0);
});
test("El guardado conserva recargas de poderes y normaliza doradas antiguas con devolución de EXP", () => {
  fixture();
  Game.mut.owned.add("suspension");
  Game.mut.cd.suspension = 22;
  const clone = new Mutation();
  clone.load(Game.mut.serialize());
  assert.equal(clone.cd.suspension, 22);
  clone.load({
    owned: ["core", "gold_reload", "gold_triage", "gold_catalyst"],
    treeVersion: 5,
  });
  assert.ok(
    clone.has("gold_reload") &&
      !clone.has("gold_triage") &&
      clone.has("gold_catalyst"),
  );
  assert.equal(clone.goldRefund, 34);
});
test("El monitor transforma la salud en color y distingue reservas inactivas", () => {
  fixture();
  const p = Game.player;
  p.hp = p.maxHp;
  assert.equal(
    run("ClinicalHUD.values(Game.player,Game.mut).status"),
    "ESTABLE",
  );
  assert.equal(run("ClinicalHUD.values(Game.player,Game.mut).hue"), 135);
  p.hp = 100;
  assert.equal(
    run("ClinicalHUD.values(Game.player,Game.mut).status"),
    "CRÍTICO",
  );
  assert.equal(run("ClinicalHUD.values(Game.player,Game.mut).hue"), 0);
  Game.mut.tutorial = false;
  assert.equal(run("ClinicalHUD.values(Game.player,Game.mut).energy"), 0);
});

test("Las dos parejas nuevas exigen una maestría avanzada de su rama", () => {
  fixture();
  Game.player.xp = 10000;
  for (const [parent, ids] of [
    ["gold_control", ["gold_fire_discipline", "gold_veteran_reserve"]],
    ["gold_reservoir", ["gold_organic_reactor", "gold_abyssal_heart"]],
  ]) {
    for (const id of ids) {
      assert.ok(Game.mut.canBuy(id, 10000));
      assert.deepEqual([...SKILLS[id].requires], [parent]);
      assert.ok(SKILLS[id].px > SKILLS[parent].px);
      assert.ok(SKILLS[id].px > SKILLS.gold_reload.px + 1500);
    }
    Game.mut.owned.add(parent);
    for (const id of ids) assert.equal(Game.mut.canBuy(id, 10000), null);
  }
});
test("Las nuevas doradas aplican sus mejoras y conservan la exclusión al cargar", () => {
  fixture();
  Game.player.xp = 10000;
  Game.mut.owned.add("gold_control");
  Game.mut.owned.add("gold_reservoir");
  Game.buySkill("gold_fire_discipline");
  Game.buySkill("gold_organic_reactor");
  assert.equal(Game.mut.mod("effort"), 0.25);
  assert.ok(Math.abs(Game.mut.mod("gun") - .32) < 1e-9);
  assert.ok(Game.mut.mod("eregen") >= 0.6);
  assert.equal(Game.mut.mod("melee_effort"), 0.20);
  const restored = new Mutation();
  restored.load(Game.mut.serialize());
  for (const id of ["gold_veteran_reserve", "gold_abyssal_heart"])
    assert.match(restored.canBuy(id, 10000), /Elección sellada/);
  assert.ok(
    restored.has("gold_fire_discipline") &&
      restored.has("gold_organic_reactor"),
  );
});
test("Las alternativas avanzadas amplían sus reservas y salud reales", () => {
  fixture();
  Game.player.xp = 10000;
  Game.mut.owned.add("gold_control");
  Game.mut.owned.add("gold_reservoir");
  Game.update(0);
  const hp = Game.player.maxHp,
    energy = Game.player.maxEnergy,
    stamina = Game.player.maxStamina;
  Game.buySkill("gold_veteran_reserve");
  Game.buySkill("gold_abyssal_heart");
  Game.update(0);
  assert.equal(Game.player.maxHp, hp + 24);
  assert.equal(Game.player.maxEnergy, energy + 40);
  assert.equal(Game.player.maxStamina, stamina + 28);
});
