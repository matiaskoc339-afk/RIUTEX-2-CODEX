window.qa = {
  step(n = 1) {
    for (let i = 0; i < n; i++) {
      Game.update(1 / 30);
      if (Game.state === "dead") throw Error("Muerte durante recorrido");
    }
  },
  route(tx, ty) {
    const sx = Math.floor(Game.player.x / 32),
      sy = Math.floor(Game.player.y / 32),
      q = [[sx, sy]],
      prev = new Map([[sx + "," + sy, null]]);
    let end = null;
    while (q.length) {
      const [x, y] = q.shift(),
        key = x + "," + y;
      if (x === tx && y === ty) {
        end = key;
        break;
      }
      for (const [dx, dy] of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ]) {
        const nx = x + dx,
          ny = y + dy,
          k = nx + "," + ny,
          v = Level.grid[ny]?.[nx];
        if (v === undefined || v === 1 || v === 4 || prev.has(k)) continue;
        if (v === 2 || v === 3) {
          const d = Level.doors.find((d) =>
            d.tiles.some((t) => t[0] === nx && t[1] === ny),
          );
          if (!d || !Game.doorOk(d)) continue;
        }
        prev.set(k, key);
        q.push([nx, ny]);
      }
    }
    if (!end) throw Error("Sin ruta " + sx + "," + sy + " -> " + tx + "," + ty);
    let path = [];
    while (end) {
      path.push(end.split(",").map(Number));
      end = prev.get(end);
    }
    return path.reverse().slice(1);
  },
  walk(tx, ty) {
    let steps = 0;
    for (const [x, y] of this.route(tx, ty)) {
      const target = [x * 32 + 16, y * 32 + 16];
      let stuck = 0;
      while (
        Math.hypot(target[0] - Game.player.x, target[1] - Game.player.y) > 4
      ) {
        if (++steps > 16000) throw Error("Ruta demasiado larga");
        if (++stuck > 120)
          throw Error(
            "Atasco " +
              Game.player.x / 32 +
              "," +
              Game.player.y / 32 +
              " -> " +
              x +
              "," +
              y,
          );
        const dx = target[0] - Game.player.x,
          dy = target[1] - Game.player.y;
        Game.keys = {
          KeyD: dx > 2,
          KeyA: dx < -2,
          KeyS: dy > 2,
          KeyW: dy < -2,
        };
        const d = Level.nearDoor(Game.player);
        if (d && Game.doorOk(d)) {
          Game.interact();
          if (Game.state === "doc") Game.closeDoc();
          if (Game.state === "slots") Game.closeSaveSlots();
        }
        const foe = Game.enemies
          .filter(
            (e) =>
              !e.dead &&
              !e.dormant &&
              !e.isBoss &&
              Math.hypot(e.x - Game.player.x, e.y - Game.player.y) < 280 &&
              Level.los(Game.player.x, Game.player.y, e.x, e.y),
          )
          .sort(
            (a, b) =>
              Math.hypot(a.x - Game.player.x, a.y - Game.player.y) -
              Math.hypot(b.x - Game.player.x, b.y - Game.player.y),
          )[0];
        if (foe && Game.player.weapon) {
          Game.mouse.x = foe.x - Game.cam.x;
          Game.mouse.y = foe.y - Game.cam.y;
          Game.mouse.clicked = true;
        }
        this.step();
        if (Game.state === "tutorial") {
          Game.keys = {};
          Game.render();
          return { tutorial: true };
        }
      }
    }
    Game.keys = {};
    Game.render();
    return {
      hp: Game.player.hp,
      steps,
      x: Game.player.x / 32,
      y: Game.player.y / 32,
    };
  },
  take(id) {
    const it = Game.items.find((i) => i.id === id);
    if (!it) throw Error("Falta objeto " + id);
    this.walk(Math.floor(it.x / 32), Math.floor(it.y / 32));
    Game.interact();
  },
};
