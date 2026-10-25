// Solo los disparos del POV WebGL usan altura. El resto conserva su simulación original.
const POV3DBallistics = {
  active(g) {
    return typeof FirstPerson !== 'undefined' && FirstPerson.active(g) &&
      typeof POV3DRenderer !== 'undefined' && POV3DRenderer.ready === true;
  },
  ray(g, p) {
    const pitch = Math.max(-1.4, Math.min(1.4, Number(FirstPerson.pitch) || 0));
    const configuredEye = Number(typeof POVCameraMotion!=='undefined'?POVCameraMotion.eye(g):POV3DRenderer.eyeHeight);
    const eye = Number.isFinite(configuredEye) && configuredEye > 0 ? configuredEye : 35;
    return { g, pitch, eye, horizontalScale: Math.cos(pitch), verticalScale: -Math.sin(pitch) };
  },
  height(ray, distance) { return ray.eye + ray.verticalScale * (distance + 18); },
  ceiling(g, x = g.player?.x, y = g.player?.y) {
    const local = POV3DRenderer.ceilingAt?.(x, y, g);
    if (local === Infinity || Number.isFinite(local) && local > 35) return local;
    const room = Level.rooms?.find(r => x >= r.x*TILE && y >= r.y*TILE && x < (r.x+r.w)*TILE && y < (r.y+r.h)*TILE);
    if (g.lvl === 'hospitalstreet' || /Jardín|Jardin|Patio|Calle|exterior/i.test(room?.n || '')) return Infinity;
    const configured = Number(POV3DRenderer.worldState?.ceilingHeight);
    if (Number.isFinite(configured) && configured > 35) return configured;
    return /^(hospitalorigin|hospitalroyal|hospitalnest)$/.test(g.lvl) ? 128 : /^(hospitalchem|hospitalpit)$/.test(g.lvl) ? 90 : 62;
  },
  solid(x, y, height, g) {
    if (!Number.isFinite(height) || height <= 0 || height >= this.ceiling(g, x, y)) return true;
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE), tile = Level.grid[ty]?.[tx];
    if (tile === 0) return false;
    if (tile === 4) {
      const type = Level.props[tx + ',' + ty] || 'crate';
      const propHeight = Number(POV3DRenderer.propHeight?.(type));
      return height <= (Number.isFinite(propHeight) && propHeight > 0 ? propHeight : 31);
    }
    return true; // Muros, puertas cerradas y límites del mapa.
  },
  hitsEntity(e, height) {
    const configured = Number(POV3DRenderer.bodyHeight?.(e));
    const fallback = /spider|rata/.test(e.type || '') && !e.isBoss ? 13 : e.isBoss ? 70 : 44;
    const bodyHeight = Number.isFinite(configured) && configured > 0 ? configured : fallback;
    const base = e.mode === 'air' ? 15 : 0;
    return height >= base && height <= base + bodyHeight;
  },
  hitsStatic(kind, height) { return height >= 0 && height <= (kind === 'barrel' ? 28 : 44); },
  trace(ray, distance) {
    return { pov3D: true, pitch: ray.pitch,
      height1: Math.max(0, Math.min(this.ceiling(ray.g), this.height(ray, 0))),
      height2: Math.max(0, Math.min(this.ceiling(ray.g), this.height(ray, distance))) };
  }
};
