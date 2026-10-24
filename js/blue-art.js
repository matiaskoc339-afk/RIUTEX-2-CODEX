// Dibujo vectorial nítido. La geometría de juego sigue siendo la de la base entregada.
const BlueArt = {
  human(c, p, enemy = false) {
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.angle ?? p.face ?? 0);
    const sw = Math.sin(p.walkT || Game.t * 5) * 2,
      cl = enemy ? p.def.color || "#94a4ad" : "#263c52";
    c.fillStyle = "rgba(0,0,0,.32)";
    c.beginPath();
    c.ellipse(2, 4, 14, 18, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#131d29";
    c.fillRect(-7 + sw, -10, 12, 6);
    c.fillRect(-7 - sw, 4, 12, 6);
    const coat = c.createLinearGradient(-8, -12, 10, 12);
    coat.addColorStop(0, cl);
    coat.addColorStop(1, enemy ? "#4a5662" : "#122337");
    c.fillStyle = p.hurtFlash > 0 ? "#e7f5ff" : coat;
    c.beginPath();
    c.ellipse(-1, 0, 9, 14, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = enemy ? "#5f6b6c" : "#4f6d85";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-5, -11);
    c.lineTo(2, -7);
    c.moveTo(-5, 11);
    c.lineTo(2, 7);
    c.stroke();
    c.fillStyle = enemy ? "#9d9e8e" : "#c4a18b";
    c.fillRect(4, -12, 12, 5);
    if (!(Game.story?.armCut && !Game.story.armHealed) && !enemy) {
      c.fillStyle = Game.story?.armHealed ? "#359dcd" : "#c4a18b";
      c.fillRect(5, 7, 14, 5);
    }
    if (enemy) {
      c.fillStyle = "#973d44";
      c.fillRect(-4, -3, 5, 8);
      c.fillStyle = "#b6b6a5";
      c.fillRect(7, 7, 13, 4);
    } else {
      c.fillStyle = "#0e1d2c";
      c.fillRect(-6, -8, 9, 16);
      c.fillStyle = "#7e9cae";
      c.fillRect(-4, -6, 5, 3);
      c.fillRect(-4, 3, 5, 3);
      if (p.weapon) {
        const len = {
          pistol: 18,
          ak: 34,
          shotgun: 30,
          viper: 24,
          rifle: 35,
          r98: 39,
          gl6: 32,
          launcher: 30,
          flamethrower: 32,
        }[p.weapon.id];
        c.fillStyle = "#121b24";
        c.fillRect(12, -8, len, 5);
        c.fillStyle = "#7896a7";
        c.fillRect(17, -8, len - 6, 2);
        c.fillRect(16, -3, 4, 6);
      }
    }
    c.fillStyle = enemy ? "#b0ac99" : "#c4a18b";
    c.beginPath();
    c.ellipse(2, 0, 7, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = enemy ? "#58594d" : "#18222b";
    c.beginPath();
    c.ellipse(-1, 0, 5, 6, 0, Math.PI / 2, Math.PI * 1.5);
    c.fill();
    if (!enemy) {
      c.strokeStyle = "#8ce2ff";
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-2, -7);
      c.lineTo(-3, 7);
      c.stroke();
    }
    if (p.blade > 0) {
      c.fillStyle = "#a9ecff";
      c.beginPath();
      c.moveTo(10, 8);
      c.lineTo(48, 10);
      c.lineTo(12, 16);
      c.fill();
    }
    if (p.slash > 0) {
      c.strokeStyle = "#b7e9ff";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, p.slashR, -1.2, 1.2);
      c.stroke();
    }
    c.restore();
  },
};
Player.prototype.draw = function (c) {
  if (Game.squad) Game.squad.forEach((s) => s.draw(c));
  if (Game.custodio) drawCustodio(c, Game.custodio);
  if (this.hidden) return;
  if (Game.story?.restrained) {
    c.fillStyle = "#aac6d2";
    c.fillRect(this.x - 24, this.y - 16, 48, 32);
    c.fillStyle = "#364656";
    c.fillRect(this.x - 8, this.y - 18, 4, 36);
  }
  BlueArt.human(c, this);
};
(() => {
  const draw = Enemy.prototype.draw;
  Enemy.prototype.draw = function (c) {
    if (
      !["sonambulo", "enfermera", "cirujano", "camillero"].includes(this.type)
    )
      return draw.call(this, c);
    if (this.dead) return;
    BlueArt.human(c, this, true);
    if (this.type === "enfermera") {
      c.fillStyle = "#dfe9e9";
      c.fillRect(this.x - 4, this.y - 4, 8, 8);
      c.fillStyle = "#b9404b";
      c.fillRect(this.x - 1, this.y - 3, 2, 6);
      c.fillRect(this.x - 3, this.y - 1, 6, 2);
    }
    if (this.windup > 0) {
      c.strokeStyle = "#ff9f72";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(this.x, this.y, this.r + 9, 0, Math.PI * 2);
      c.stroke();
    }
  };
})();
PROP.bed = function (c, x, y) {
  c.fillStyle = "#192b3c";
  c.fillRect(x + 1, y + 2, 30, 31);
  c.fillStyle = "#7695a5";
  c.fillRect(x + 2, y + 1, 28, 28);
  c.fillStyle = "#c8dadd";
  c.fillRect(x + 5, y + 3, 22, 23);
  c.fillStyle = "#91b7c9";
  c.fillRect(x + 5, y + 13, 22, 13);
  c.fillStyle = "#ebf2ef";
  c.fillRect(x + 7, y + 4, 17, 7);
  c.fillStyle = "#446679";
  c.fillRect(x + 1, y + 9, 3, 15);
  c.fillRect(x + 28, y + 9, 3, 15);
};
PROP.bench = function (c, x, y) {
  c.fillStyle = "#172b3d";
  c.fillRect(x + 2, y + 7, 28, 21);
  c.fillStyle = "#426b85";
  c.fillRect(x + 2, y + 5, 28, 7);
  c.fillStyle = "#6b91a5";
  c.fillRect(x + 3, y + 13, 12, 10);
  c.fillRect(x + 17, y + 13, 12, 10);
};
PROP.counter = function (c, x, y) {
  c.fillStyle = "#304a5a";
  c.fillRect(x, y + 8, 32, 24);
  c.fillStyle = "#b4ccce";
  c.fillRect(x, y + 3, 32, 21);
  c.fillStyle = "#e1eaea";
  c.fillRect(x, y + 3, 32, 3);
  c.fillStyle = "#608c9e";
  c.fillRect(x + 2, y + 22, 28, 3);
};
PROP.desk = function (c, x, y) {
  c.fillStyle = "#273f50";
  c.fillRect(x + 1, y + 6, 30, 25);
  c.fillStyle = "#829fae";
  c.fillRect(x + 1, y + 3, 30, 23);
  c.fillStyle = "#122938";
  c.fillRect(x + 4, y + 6, 14, 10);
  c.fillStyle = "#64acc9";
  c.fillRect(x + 5, y + 7, 12, 7);
  c.fillStyle = "#c8dcdd";
  c.fillRect(x + 20, y + 8, 8, 12);
  c.fillStyle = "#405968";
  c.fillRect(x + 5, y + 19, 12, 3);
};
PROP.pillar = function (c, x, y) {
  c.fillStyle = "#223849";
  c.fillRect(x + 1, y + 3, 30, 29);
  c.fillStyle = "#8da6af";
  c.fillRect(x + 3, y + 1, 26, 26);
  c.fillStyle = "#bacbce";
  c.fillRect(x + 3, y + 1, 26, 4);
  c.fillStyle = "#54788b";
  c.fillRect(x + 3, y + 23, 26, 4);
};
PROP.shelf = function (c, x, y) {
  c.fillStyle = "#284353";
  c.fillRect(x, y, 32, 32);
  for (let row = 0; row < 3; row++) {
    c.fillStyle = "#8ca3aa";
    c.fillRect(x, y + row * 11 + 9, 32, 2);
    for (let i = 0; i < 4; i++) {
      c.fillStyle = ["#c7d9dc", "#7395ac", "#b8b3a0", "#668fa3"][(row + i) % 4];
      c.fillRect(x + 2 + i * 8, y + row * 11 + 1, 6, 7);
      c.fillStyle = "#547384";
      c.fillRect(x + 3 + i * 8, y + row * 11 + 3, 4, 2);
    }
  }
};
PROP.plant = function (c, x, y) {
  c.fillStyle = "#293c46";
  c.beginPath();
  c.ellipse(x + 17, y + 23, 11, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#8babb4";
  c.beginPath();
  c.ellipse(x + 16, y + 18, 9, 8, 0, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    c.fillStyle = i % 2 ? "#497b70" : "#38675e";
    c.beginPath();
    c.ellipse(
      x + 16 + Math.cos(a) * 7,
      y + 15 + Math.sin(a) * 7,
      9,
      4,
      a,
      0,
      Math.PI * 2,
    );
    c.fill();
  }
};
(() => {
  const build = Level.buildR2;
  Level.buildR2 = function (id) {
    build.call(this, id);
    this.surface = [];
    for (let y = 0; y < this.H; y++)
      this.surface.push(new Array(this.W).fill("#728c98"));
    for (const r of this.rooms) {
      const col =
        id === "mansion"
          ? /Jardín/.test(r.n)
            ? "#3c5e59"
            : "#64615c"
          : /Patio|Capilla|descanso|Descansillo|Rellano/.test(r.n)
            ? "#6b9193"
            : /Quirófano|UCI|Hidroterapia|Urgencias/.test(r.n)
              ? "#8ba7a4"
              : /Generador|Caldera|Garaje|Turbina|Bombas/.test(r.n)
                ? "#5c7685"
                : /Archivo|Biblioteca|Dirección/.test(r.n)
                  ? "#7c8794"
                  : "#7f9aa6";
      for (let y = r.y; y < r.y + r.h; y++)
        for (let x = r.x; x < r.x + r.w; x++) this.surface[y][x] = col;
    }
  };
})();
Level.draw = function (c, cam, w, h) {
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1),
    y0 = Math.max(0, Math.floor(cam.y / TILE) - 1),
    x1 = Math.min(this.W - 1, Math.ceil((cam.x + w) / TILE)),
    y1 = Math.min(this.H - 1, Math.ceil((cam.y + h) / TILE));
  const floor = (x, y) =>
    this.grid[y]?.[x] !== undefined && this.grid[y][x] !== 1;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const v = this.grid[y][x],
        px = x * TILE,
        py = y * TILE;
      if (v === 1) {
        c.fillStyle = "#08131f";
        c.fillRect(px, py, TILE, TILE);
        if (floor(x, y + 1)) {
          c.fillStyle = "#6f8797";
          c.fillRect(px, py + 18, 32, 14);
          c.fillStyle = "#b9c9cc";
          c.fillRect(px, py + 18, 32, 3);
          c.fillStyle = "#2d596f";
          c.fillRect(px, py + 26, 32, 4);
        }
        if (floor(x + 1, y)) {
          c.fillStyle = "#465e70";
          c.fillRect(px + 24, py, 8, 32);
          c.fillStyle = "#7b98a8";
          c.fillRect(px + 29, py, 3, 32);
        }
        if (floor(x - 1, y)) {
          c.fillStyle = "#61798a";
          c.fillRect(px, py, 6, 32);
          c.fillStyle = "#9baeb7";
          c.fillRect(px, py, 2, 32);
        }
        if (floor(x, y - 1)) {
          c.fillStyle = "#8197a3";
          c.fillRect(px, py, 32, 4);
        }
        continue;
      }
      const warm = Game.lvl === "mansion",
        garden = ["#1f2a22"].includes(this.tint[y][x]);
      c.fillStyle = this.surface?.[y]?.[x] || (warm ? "#555d65" : "#7f9aa6");
      c.fillRect(px, py, 32, 32);
      if ((x + y) % 2) {
        c.fillStyle = "rgba(15,37,49,.055)";
        c.fillRect(px, py, 32, 32);
      }
      c.strokeStyle = "rgba(15,38,52,.17)";
      c.lineWidth = 0.7;
      c.strokeRect(px, py, 32, 32);
      if ((x * 73 + y * 151) % 19 === 0) {
        c.fillStyle = "rgba(220,240,246,.11)";
        c.fillRect(px + 2, py + 2, 27, 2);
      }
      if (v === 2 || v === 3) {
        c.fillStyle = v === 3 ? "#20384c" : "#3d657a";
        c.fillRect(px + 2, py + 2, 28, 28);
        c.strokeStyle = "#8ca8b5";
        c.strokeRect(px + 5, py + 5, 22, 22);
        c.fillStyle = v === 3 ? "#e59172" : "#a0def4";
        c.fillRect(px + 22, py + 13, 4, 6);
      }
      if (v === 4) PROP[this.props[x + "," + y]]?.(c, px, py);
    }
  for (const d of this.decals) {
    if (
      Math.abs(d.x - cam.x - w / 2) > w / 2 + 30 ||
      Math.abs(d.y - cam.y - h / 2) > h / 2 + 30
    )
      continue;
    c.fillStyle = d.c;
    c.beginPath();
    c.ellipse(d.x, d.y, d.r * 0.6, d.r * 0.35, d.x, 0, Math.PI * 2);
    c.fill();
  }
  for (const [t, x, y] of this.decor || []) {
    if (
      x * 32 < cam.x - 32 ||
      x * 32 > cam.x + w ||
      y * 32 < cam.y - 32 ||
      y * 32 > cam.y + h
    )
      continue;
    DECO[t]?.(c, x * 32, y * 32, (x + y) % 4);
  }
  // Líneas de orientación y luminarias de pared del hospital.
  if (Game.lvl !== "mansion")
    for (const r of this.rooms) {
      if (
        r.x * 32 > cam.x + w ||
        r.y * 32 > cam.y + h ||
        (r.x + r.w) * 32 < cam.x ||
        (r.y + r.h) * 32 < cam.y
      )
        continue;
      if (/Pasillo|Ala |Galería/.test(r.n)) {
        c.strokeStyle = "rgba(91,169,197,.38)";
        c.lineWidth = 3;
        c.beginPath();
        if (r.w > r.h) {
          c.moveTo(r.x * 32, (r.y + r.h - 0.6) * 32);
          c.lineTo((r.x + r.w) * 32, (r.y + r.h - 0.6) * 32);
        } else {
          c.moveTo((r.x + 0.6) * 32, r.y * 32);
          c.lineTo((r.x + 0.6) * 32, (r.y + r.h) * 32);
        }
        c.stroke();
      } else {
        const lx = (r.x + r.w / 2) * 32,
          ly = r.y * 32 + 3;
        c.fillStyle = "#a9dfe6";
        c.fillRect(lx - 23, ly, 46, 3);
        c.fillStyle = "rgba(139,213,237,.1)";
        c.fillRect(lx - 23, ly + 3, 46, 14);
      }
    }
  // Señalética discreta de cada espacio, integrada en el suelo.
  for (const r of this.rooms) {
    const x = (r.x + r.w / 2) * 32,
      y = (r.y + 1.4) * 32;
    if (x < cam.x - 120 || x > cam.x + w + 120 || y < cam.y || y > cam.y + h)
      continue;
    c.textAlign = "center";
    c.font = "600 9px sans-serif";
    c.fillStyle = "rgba(205,234,241,.5)";
    c.fillText(r.n.toUpperCase(), x, y);
    c.textAlign = "start";
  }
};

// Los marcos permanecen visibles cuando la hoja está abierta.
(() => {
  const floor = Level.draw;
  Level.draw = function (c, cam, w, h) {
    floor.call(this, c, cam, w, h);
    for (const d of this.doors) {
      const xs = d.tiles.map((t) => t[0]),
        ys = d.tiles.map((t) => t[1]),
        x = Math.min(...xs) * 32,
        y = Math.min(...ys) * 32,
        dw = (Math.max(...xs) - Math.min(...xs) + 1) * 32,
        dh = (Math.max(...ys) - Math.min(...ys) + 1) * 32;
      if (x > cam.x + w || y > cam.y + h || x + dw < cam.x || y + dh < cam.y)
        continue;
      c.fillStyle = "#8d9996";
      if (dw > dh) {
        c.fillRect(x - 3, y, 5, dh);
        c.fillRect(x + dw - 2, y, 5, dh);
      } else {
        c.fillRect(x, y - 3, dw, 5);
        c.fillRect(x, y + dh - 2, dw, 5);
      }
    }
  };
})();
