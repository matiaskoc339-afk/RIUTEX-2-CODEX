const test = require("node:test"),
  assert = require("node:assert/strict");
const { X, run } = require("./harness");
const { Game, Hospital, Weapons, Level, Inventory, SKILLS, Enemy } = X;
Game.init();
function fixture() {
  Game.startLvl = "mansion";
  Game.start(false);
  Hospital.toHospital(Game);
  Game.story.restrained = false;
  Hospital.inject(Game);
  Hospital.lobbyReached(Game);
  Game.story.seq = "free";
  Game.state = "play";
  Game.player.x = 52.5 * 32;
  Game.player.y = 26.5 * 32;
  Game.cam.x = Game.player.x - 400;
  Game.cam.y = Game.player.y - 300;
  Game.enemies = [Game.carn];
  Game.keys = {};
  Game.mouse = { x: 500, y: 300, down: false, clicked: false, rclick: false };
  Game.player.invuln = 0;
  Game.player.stamina = 100;
  Game.player.energy = 120;
}
function gun(id) {
  Game.inv = new Inventory();
  while (Game.inv.level < 4) Game.inv.expand();
  Game.giveWeapon(id, 0, true);
  Game.player.weapon.mag = 10;
  Game.player.stamina = 100;
}
test("La inyección no regala ni asigna Reflejos o Instinto", () => {
  fixture();
  assert.deepEqual([...Game.mut.owned], ["core"]);
  assert.deepEqual(Object.keys(Game.mut.bindings), []);
  assert.equal(Game.mut.equipped, null);
  assert.ok(SKILLS.reflejos.cost > 0 && SKILLS.instinto.cost > 0);
});
test("Las cinco armas cuestan estamina y las pesadas cuestan más", () => {
  fixture();
  const spent = {};
  for (const id of ["pistol", "shotgun", "viper", "rifle", "ak"]) {
    gun(id);
    Weapons.fire(Game, Game.player);
    spent[id] = 100 - Game.player.stamina;
    assert.equal(Game.player.weapon.mag, 9);
    assert.ok(spent[id] >= 5, id);
  }
  assert.ok(
    spent.shotgun > spent.pistol &&
      spent.rifle > spent.shotgun &&
      spent.pistol > spent.viper,
  );
});
test("Sin estamina no sale una bala ni se produce ruido", () => {
  fixture();
  gun("pistol");
  Game.player.stamina = 1;
  Weapons.fire(Game, Game.player);
  assert.equal(Game.player.weapon.mag, 10);
  assert.equal(Game.acoustic.events.length, 0);
  assert.equal(Game.player.stamina, 1);
});
test("La recuperación espera tras disparar y vuelve después", () => {
  fixture();
  gun("pistol");
  Weapons.fire(Game, Game.player);
  const st = Game.player.stamina;
  Game.player.update(0.5, Game);
  assert.equal(Game.player.stamina, st);
  Game.player.update(0.7, Game);
  assert.ok(Game.player.stamina > st);
});
test("Golpear infectado consume Riutex y no permite deuda ni spam", () => {
  fixture();
  Game.player.melee(Game);
  assert.equal(Game.player.energy, 96);
  assert.equal(Game.player.stamina, 100);
  Game.player.melee(Game);
  assert.equal(Game.player.energy, 96);
  Game.player.meleeCd = 0;
  Game.player.energy = 2;
  Game.player.melee(Game);
  assert.equal(Game.player.energy, 2);
});
test("El brazo inicial es breve, caro y de daño progresivo", () => {
  fixture();
  Game.mut.owned.add("brazo");
  Game.castSkill("brazo");
  assert.equal(Game.player.blade, 5);
  assert.equal(Game.player.energy, 86);
  Game.player.melee(Game);
  assert.equal(Game.player.energy, 54);
  assert.ok(SKILLS.brazo.desc.includes("+32 %"));
});
test("Un disparo aislado y el silencio no hacen aparecer al Carnicero", () => {
  fixture();
  gun("pistol");
  Weapons.fire(Game, Game.player);
  for (let i = 0; i < 18; i++) Game.update(1);
  assert.equal(Game.carn.dormant, true);
  assert.equal(Game.acoustic.pending, null);
});
test("Ruido repetido avisa, espera y aparece lejos investigando la fuente", () => {
  fixture();
  for (let i = 0; i < 6; i++) {
    run("AcousticPressure.emit(Game,1)");
    Game.t += 0.2;
  }
  assert.ok(Game.acoustic.pending);
  assert.equal(Game.carn.dormant, true);
  run("AcousticPressure.tick(Game,2)");
  assert.equal(Game.carn.dormant, true);
  run("AcousticPressure.tick(Game,.6)");
  assert.equal(Game.carn.dormant, false);
  assert.equal(Game.carn.state, "investigate");
  assert.deepEqual([...Game.carn.tgt], [Game.player.x, Game.player.y]);
  assert.ok(
    Math.hypot(Game.carn.x - Game.player.x, Game.carn.y - Game.player.y) >= 640,
  );
  assert.ok(Game.carn.path.length >= 24);
});
test("No usa una aparición cercana cuando no hay punto justo", () => {
  fixture();
  const old = run("R2_DATA(Game.lvl).patrol");
  run("R2_DATA(Game.lvl).patrol=[[52,26]]");
  assert.equal(
    run("AcousticPressure.investigate(Game,{x:Game.player.x,y:Game.player.y})"),
    false,
  );
  assert.equal(Game.carn.dormant, true);
  run("R2_DATA(Game.lvl).patrol=" + JSON.stringify(old));
});
test("El Carnicero activo recibe el ruido sin teletransportarse ni romper una caza", () => {
  fixture();
  run("AcousticPressure.investigate(Game,{x:Game.player.x,y:Game.player.y})");
  const pos = [Game.carn.x, Game.carn.y];
  Game.carn.state = "routine";
  run("AcousticPressure.investigate(Game,{x:1400,y:900})");
  assert.deepEqual([Game.carn.x, Game.carn.y], pos);
  assert.deepEqual([...Game.carn.tgt], [1400, 900]);
  Game.carn.state = "chase";
  Game.carn.hunt = true;
  run("AcousticPressure.investigate(Game,{x:1300,y:850})");
  assert.equal(Game.carn.state, "chase");
  assert.deepEqual([Game.carn.x, Game.carn.y], pos);
});
test("Cuatro ramas nuevas son opcionales, sin solapes y con recursos humanos separados", () => {
  fixture();
  assert.equal(Object.keys(SKILLS).length, 153);
  for (const id of [
    "segundo_aliento",
    "cambio_guardia",
    "singularidad",
    "eco_carnal",
  ]) {
    assert.equal(SKILLS[id].type, "active");
    assert.ok(SKILLS[id].requires.length > 0);
    assert.equal(
      SKILLS[id].resource,
      SKILLS[id].br === "hum" ? "stamina" : "energy",
    );
    assert.ok(!Object.values(SKILLS).some((s) => s.requires?.includes(id)));
  }
});
test("Segundo aliento mejora el sprint sin convertirlo en invulnerabilidad", () => {
  fixture();
  Game.enemies = [];
  Game.carn = null;
  Game.keys = { KeyD: true, ShiftLeft: true };
  Game.player.update(0.1, Game);
  const base = Game.player.x;
  Game.player.x = 52.5 * 32;
  Game.player.stamina = 100;
  Game.mut.owned.add("segundo_aliento");
  Game.castSkill("segundo_aliento");
  const st = Game.player.stamina;
  Game.player.update(0.1, Game);
  assert.ok(Game.player.x > base);
  assert.equal(st, 76);
  assert.equal(Game.player.invuln, 0);
});
test("Singularidad atrae sin cruzar paredes ni arrastrar al Carnicero", () => {
  fixture();
  Game.mut.owned.add("singularidad");
  Game.castSkill("singularidad");
  const q = Game.gravityWell;
  const e = new Enemy("vacio", q.x + 80, q.y, 1800);
  Game.enemies = [e, Game.carn];
  const d = Math.hypot(e.x - q.x, e.y - q.y),
    c = [Game.carn.x, Game.carn.y];
  run("SurvivalSkills.tick(Game,.1)");
  assert.ok(Math.hypot(e.x - q.x, e.y - q.y) < d);
  assert.deepEqual([Game.carn.x, Game.carn.y], c);
});
test("El eco puede recibir golpes sin quitarle vida al jugador", () => {
  fixture();
  Game.mut.owned.add("eco_carnal");
  Game.castSkill("eco_carnal");
  const hp = Game.player.hp;
  Game.fleshEcho.hurt(20);
  assert.equal(Game.fleshEcho.hp, 40);
  assert.equal(Game.player.hp, hp);
  run("SurvivalSkills.tick(Game,8)");
  assert.equal(Game.fleshEcho, null);
});
test("El personaje sin brazo deja sangre al caminar y deja de hacerlo tras curarse", () => {
  fixture();
  Game.enemies = [];
  Game.carn = null;
  Game.story.armCut = true;
  Game.story.armHealed = false;
  Game.story.seq = "wounded_run";
  const n = Level.decals.length;
  Game.keys = { KeyD: true };
  Game.update(0.1);
  Game.update(0.1);
  assert.ok(Level.decals.length > n);
  Game.story.armHealed = true;
  const stopped = Level.decals.length;
  Game.update(0.1);
  assert.equal(Level.decals.length, stopped);
});
test("La camilla del vestíbulo abre tres huecos y permite cambiar a carga", () => {
  fixture();
  Game.take(Game.items.find((i) => i.id === "savebed_vestibule"));
  assert.equal(Game.state, "slots");
  assert.equal(Game.slotMode, "save");
  assert.equal(Game.slotFromPlay, true);
  Game.switchSaveSlotMode();
  assert.equal(Game.slotMode, "load");
});
test("Banco: sin energía, arma o materiales no gasta nada", () => {
  fixture();
  gun("pistol");
  Game.inv.addAmmo("screw_small", 8);
  Game.inv.addAmmo("powder_small", 8);
  Game.state = "workbench";
  const before = JSON.stringify(Game.inv.serialize());
  assert.equal(run("Workshop.buy(Game,'pistol','damage').ok"), false);
  assert.equal(JSON.stringify(Game.inv.serialize()), before);
  run("Workshop.ensure(Game).powered=true");
  assert.equal(run("Workshop.buy(Game,'rifle','damage').ok"), false);
  assert.equal(JSON.stringify(Game.inv.serialize()), before);
});
test("El banco aumenta daño, aguante, precisión y capacidad solo del arma elegida", () => {
  fixture();
  gun("pistol");
  Game.inv.addAmmo("screw_small", 20);
  Game.inv.addAmmo("powder_small", 20);
  Game.state = "workbench";
  run("Workshop.ensure(Game).powered=true");
  const beforeR = Weapons.effective(Game.player, "rifle");
  for (const key of ["damage", "effort", "precision", "capacity"])
    assert.equal(
      run("Workshop.buy(Game,'pistol'," + JSON.stringify(key) + ").ok"),
      true,
    );
  const w = Weapons.effective(Game.player, "pistol");
  assert.ok(w.dmg > 25 && w.stam < 12 && w.spread < 0.035);
  assert.equal(Weapons.magSize(Game.player, X.WEAPONS.pistol), 14);
  assert.deepEqual(Weapons.effective(Game.player, "rifle"), beforeR);
  assert.equal(run("FieldDesk.count(Game.inv,'screw_small')"), 8);
});
test("Una mejora no rellena balas, admite armas del baúl y tiene límite", () => {
  fixture();
  gun("pistol");
  Game.stash.push({ type: "w_rifle", id: "rifle", mag: 2, w: 4, h: 1 });
  Game.inv.addAmmo("screw_small", 25);
  Game.inv.addAmmo("powder_small", 25);
  Game.inv.addAmmo("screw_large", 6);
  Game.inv.addAmmo("powder_large", 6);
  Game.state = "workbench";
  run("Workshop.ensure(Game).powered=true");
  const ammo = Game.stash[0].mag;
  for (let i = 0; i < 3; i++)
    assert.equal(run("Workshop.buy(Game,'rifle','capacity').ok"), true);
  assert.equal(run("Workshop.buy(Game,'rifle','capacity').ok"), false);
  assert.equal(Game.stash[0].mag, ammo);
});
test("El generador auxiliar exige piezas y documento, sin abrir el garaje", () => {
  fixture();
  const garage = Game.pz["h:power"];
  run("ServiceQuests.open(Game,'generator')");
  assert.equal(run("ServiceQuests.complete(Game)"), false);
  Game.inv.docs.push("w09_workshop");
  Game.inv.keys.push("aux_fuse", "aux_cable");
  const v = run(
    "(()=>{for(let n=0;n<262144;n++){let k=n,a=[];for(let i=0;i<9;i++){a.push(k%4);k>>=2;}if(BluePuzzles.circuitReach(a).has(9))return a;}})()",
  );
  Game.story.serviceMechanisms.generator = v;
  assert.equal(run("ServiceQuests.complete(Game)"), true);
  assert.equal(run("Workshop.ensure(Game).powered"), true);
  assert.equal(Game.pz["h:power"], garage);
  assert.ok(!Game.inv.keys.includes("aux_fuse"));
});
test("M9 y rifle exigen sus componentes y mecanismos, y no duplican accesorios", () => {
  fixture();
  for (const [id, part, solution] of [
    ["pistol", "escort_tool", [1, 2, 0]],
    ["rifle", "scope_film", [5, 5, 5]],
  ]) {
    run("ServiceQuests.open(Game," + JSON.stringify(id) + ")");
    assert.equal(run("ServiceQuests.complete(Game)"), false);
    Game.inv.keys.push(part);
    Game.story.serviceMechanisms[id] = solution;
    assert.equal(run("ServiceQuests.complete(Game)"), true);
    assert.equal(run("Workshop.has(Game," + JSON.stringify(id) + ")"), true);
    assert.ok(!Game.inv.keys.includes(part));
    assert.equal(run("Workshop.claim(Game," + JSON.stringify(id) + ")"), false);
  }
});
test("La culata de escopeta exige presión estable y el resorte", () => {
  fixture();
  const item = Game.items.find((i) => i.id === "case_shotgun");
  Game.take(item);
  assert.equal(run("Workshop.has(Game,'shotgun')"), false);
  Game.inv.keys.push("damper_spring");
  Game.take(item);
  assert.equal(run("Workshop.has(Game,'shotgun')"), false);
  Game.pz["blue:hydro"] = true;
  Game.take(item);
  assert.equal(run("Workshop.has(Game,'shotgun')"), true);
  assert.ok(!Game.inv.keys.includes("damper_spring"));
});
test("C-17 es opcional, conserva salud y solo entrega el cargador tras caer", () => {
  fixture();
  const item = Game.items.find((i) => i.id === "cocoon_c17");
  Game.take(item);
  assert.equal(Game.enemies.filter((e) => e.id === 1197).length, 0);
  Game.inv.docs.push("w09_uzi");
  Game.take(item);
  assert.equal(Game.state, "servicePuzzle");
  run("ServiceQuests.complete(Game)");
  const boss = Game.enemies.find((e) => e.id === 1197);
  assert.ok(boss && !boss.dead);
  boss.hurt(20, 0, Game);
  assert.equal(Game.story.c17.hp, 342);
  assert.equal(run("Workshop.has(Game,'viper')"), false);
  boss.hurt(1000, 0, Game);
  assert.equal(Game.pz["w09:boss"], true);
  Game.take(Game.items.find((i) => i.id === "uzi_attachment_loot"));
  assert.equal(run("Workshop.has(Game,'viper')"), true);
  assert.equal(Weapons.magSize(Game.player, X.WEAPONS.viper), 38);
});
test("Guardado y carga conservan el banco y accesorios; limpian poderes temporales", () => {
  fixture();
  run(
    "Workshop.ensure(Game).levels.pistol={damage:2};Workshop.ensure(Game).powered=true;Workshop.claim(Game,'pistol')",
  );
  Game.mut.owned.add("eco_carnal");
  Game.castSkill("eco_carnal");
  Game.save(0);
  Game.start(false, Game.getSaveSlots()[0]);
  assert.equal(run("Workshop.rank(Game,'pistol','damage')"), 2);
  assert.equal(run("Workshop.has(Game,'pistol')"), true);
  assert.equal(Game.fleshEcho, null);
  assert.equal(Game.gravityWell, null);
});

test("C-17 avisa antes del grito y no hace daño a través de paredes", () => {
  fixture();
  Game.story.c17 = { active: true, hp: 360 };
  run("ServiceQuests.sync(Game)");
  const c = Game.enemies.find((e) => e.id === 1197),
    p = Game.player;
  p.x = 90.5 * 32;
  p.y = 59.5 * 32;
  c.x = 92.5 * 32;
  c.y = p.y;
  c.mode = "roar";
  c.clock = 1.1;
  const hp = p.hp;
  c.update(0.5, Game);
  assert.equal(p.hp, hp);
  const x = 91,
    y = 59,
    old = Level.grid[y][x];
  Level.grid[y][x] = 1;
  c.update(0.7, Game);
  assert.equal(p.hp, hp);
  Level.grid[y][x] = old;
  c.mode = "roar";
  c.clock = 0.1;
  c.update(0.2, Game);
  assert.ok(p.hp < hp);
});
test("El minijefe conserva salud al recargar y no reaparece tras caer", () => {
  fixture();
  Game.story.c17 = { active: true, hp: 300 };
  run("ServiceQuests.sync(Game)");
  Game.save(0);
  Game.start(false, Game.getSaveSlots()[0]);
  let c = Game.enemies.find((e) => e.id === 1197);
  assert.equal(c.hp, 300);
  c.hurt(1000, 0, Game);
  Game.save(0);
  Game.start(false, Game.getSaveSlots()[0]);
  assert.equal(Game.enemies.filter((e) => e.id === 1197 && !e.dead).length, 0);
  assert.equal(
    Game.items.filter((i) => i.id === "uzi_attachment_loot").length,
    1,
  );
});
