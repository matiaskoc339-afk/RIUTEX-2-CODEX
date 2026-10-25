// Animación exclusiva del POV. Todo el estado visual vive en la malla:
// no adelanta ataques, no desplaza hitboxes y no se guarda en la partida.
const POVEnemyMotion = {
  bind(root) {
    const rig = root.userData.rig, nodes = new Set();
    for (const value of Object.values(rig)) {
      if (Array.isArray(value)) value.forEach(n => n?.isObject3D && nodes.add(n));
      else if (value?.isObject3D) nodes.add(value);
    }
    return root.userData.motion = {
      base: [...nodes].map(node => ({node, p: node.position.clone(), r: node.rotation.clone(), s: node.scale.clone()})),
      time: root.userData.clock || 0, gait: 0, speed: 0, impact: 0,
      x: null, y: null, mode: null, clock: 0, hit: 0
    };
  },
  animate(root, e, g, time, dt = .016) {
    const data = root.userData, rig = data.rig;
    if (!rig) return;
    const m = data.motion || this.bind(root), step = Math.max(0, Math.min(.05, dt));
    if (g?.state !== 'play') { m.x = e.x; m.y = e.y; return; }
    if (e.frozen > 0) { m.x = e.x; m.y = e.y; return; }
    m.time += step; data.clock = m.time;
    const id = data.modelIdentifier || '', seed = (Number(e.id) || 0) * 1.713;
    const mode = id === 'carnicero' && !e.active && e.state ? e.state : (e.mode || e.state || 'idle');
    const winding = /wind|listen/.test(mode) || e.windup > 0;
    const charging = /^(rush|charge|lunge)$/.test(mode);
    const clock = e.windup > 0 ? e.windup : (e.clock ?? e.mt ?? 0);
    const duration = e.windup > 0 ? .38 : (e.windMax || (mode === 'rushWind' ? .7 : mode === 'windup' ? .48 : .8));
    const progress = Math.max(0, Math.min(1, 1 - clock / duration));
    // Un combo puede seguir en «wind»: el reinicio del reloj marca otro golpe.
    if (m.mode && ((m.winding && !winding) ||
        (winding && m.winding && clock > m.clock + .12))) m.impact = .28;
    if ((e.hitFlash || 0) > m.hit + .015) m.recoil = .18;
    m.impact = Math.max(0, m.impact - step); m.recoil = Math.max(0, (m.recoil || 0) - step);
    const distance = m.x === null ? 0 : Math.hypot((e.x || 0) - m.x, (e.y || 0) - m.y);
    const travel = distance < 35 ? distance : 0; // Reaparecer tras oclusión no reproduce una zancada enorme.
    const desired = step > 0 ? Math.min(1.5, travel / step / 125) : 0;
    m.speed += (desired - m.speed) * Math.min(1, step * 15);
    m.gait += travel * (/carnicero|regent|guard|keeper/.test(id) ? .075 : .115);
    m.x = e.x || 0; m.y = e.y || 0; m.mode = mode; m.winding = winding; m.clock = clock; m.hit = e.hitFlash || 0;
    for (const b of m.base) { b.node.position.copy(b.p); b.node.rotation.copy(b.r); b.node.scale.copy(b.s); }
    const t = m.time, walk = Math.min(1, m.speed), gait = m.gait, breath = Math.sin(t * 2.8 + seed);
    const recover = mode === 'recover' || mode === 'stun', mutate = mode === 'mutate' || mode === 'intro';
    const impact = Math.sin(m.impact / .28 * Math.PI), hit = Math.sin(m.recoil / .18 * Math.PI);
    const blind = id === 'cl_blind' || id === 'wx_listener';
    const heavy = /carnicero|regent|guard|keeper|wren|bruto|coloso/.test(id);
    const roof = typeof POV3DRenderer !== 'undefined' ? POV3DRenderer.ceilingAt(e.x || 0, e.y || 0, g) : Infinity;
    const tight = Number.isFinite(roof) && roof < (data.height || 45) * 1.45;
    const sleeping = data.sleeping && !e.alert;
    if (rig.body) {
      rig.body.position.y += .32 * breath + Math.abs(Math.sin(gait)) * (heavy ? .7 : 1) * walk - (recover ? .6 : 0);
      rig.body.position.z += impact * 1.7;
      rig.body.scale.y *= 1 + breath * .014;
      const room = tight ? .4 : 1;
      rig.body.rotation.x += (rig.lean || 0) + room * ((charging ? .28 : winding ? -.1 * progress : 0) + impact * .2 - hit * .15);
      rig.body.rotation.y += room * (Math.sin(gait) * .045 * walk + (winding ? -.16 * progress : impact * .22));
      rig.body.rotation.z += room * Math.sin(gait) * (heavy ? .055 : .08) * walk;
      if (mutate) { rig.body.rotation.x += Math.sin(t * 8) * .13 * room; rig.body.scale.x *= 1 + Math.sin(t * 6) * .025; }
      if (sleeping) rig.body.rotation.x += .7;
    }
    if (rig.head) {
      rig.head.rotation.x += breath * .035 + (winding ? -.2 * progress : recover ? .12 : 0) - hit * .18;
      rig.head.rotation.y += Math.sin(t * (blind ? 1.7 : .75) + seed) * (blind ? .25 : .13);
      rig.head.rotation.z += Math.sin(t * .9 + seed) * .045;
    }
    rig.legs?.forEach((n, i) => {
      n.rotation.x += sleeping ? -1.15 : Math.sin(gait + i * Math.PI) * .55 * walk + (winding ? (i ? .1 : -.18) * progress : 0);
      n.rotation.z += (i ? -.025 : .025) + (recover ? (i ? -.045 : .045) : 0);
    });
    rig.knees?.forEach((n, i) => { n.rotation.x += sleeping ? 1.3 : Math.max(0, Math.sin(gait + i * Math.PI)) * .65 * walk + (recover ? .12 : 0); });
    rig.arms?.forEach((n, i) => {
      const side = i ? 1 : -1, strikeArm = heavy ? i === 1 : (Math.floor((e.id || 0) + (e.step || 0)) % 2) === i;
      if (data.ally) { n.rotation.set(i ? -.55 : -1, 0, i ? -.33 : .42); n.rotation.x += Math.sin(gait) * .035 * walk; return; }
      n.rotation.x += -.18 + Math.sin(gait + (1-i) * Math.PI) * .5 * walk + Math.sin(t * 1.9 + seed + i) * .07;
      n.rotation.z += side * -.06 + Math.sin(t * 1.3 + seed + i) * .035;
      if (blind && !winding && !charging) { n.rotation.x -= .28; n.rotation.z -= side * .15; }
      if (winding) {
        // En un pasillo bajo prepara el corte al costado, sin meter el arma en el techo.
        n.rotation.x = strikeArm ? -1.02 - progress * (tight ? .22 : 1.1) : -.6 - progress * .35;
        n.rotation.z += side * (strikeArm ? .3 : .15) * progress;
        n.rotation.y += side * -.22 * progress;
        if (/spit|venom|needles|wave|roar|vents|marks|quake/.test(e.attack || '')) n.rotation.x = -.75 - progress * .3;
      }
      if (charging) { n.rotation.x = i ? -1.1 : -.55; n.rotation.z += side * -.18; }
      if (impact > 0 && strikeArm) { n.rotation.x = (tight ? -1.3 : -1.95) + impact * (tight ? 1.9 : 2.55); n.rotation.y += impact * .35 * side; }
      if (recover && !m.impact) n.rotation.x += .18 + breath * .08;
      n.rotation.x -= hit * .2;
      if (mutate) { n.rotation.x = -.5 + Math.sin(t * 9 + i) * .25; n.rotation.z += side * .5; }
    });
    rig.elbows?.forEach((n, i) => {
      n.rotation.x += data.ally ? (i ? -1 : -.45) : winding ? -(tight ? .08 : .7) * progress : charging ? -.4 : -.12 + breath * .06;
      if (impact) n.rotation.x -= .3 * (1 - impact);
    });
    rig.extraArms?.forEach((n, i) => { n.rotation.x += Math.sin(t * 2.8 + i) * .23 - (winding ? .65 * progress : 0); n.rotation.y += Math.sin(t * 2 + i) * .25 + impact * .5; });
    rig.quadrupedLegs?.forEach((n, i) => {
      const phase = gait + (i === 0 || i === 3 ? 0 : Math.PI);
      n.rotation.x += Math.sin(phase) * .65 * walk;
      n.position.y += Math.max(0, Math.sin(phase)) * 1.3 * walk;
      if (winding) n.rotation.x += (i % 2 ? -.26 : .22) * progress;
    });
    rig.jaw && (rig.jaw.rotation.x += .04 + breath * .05 + (winding ? progress * .4 : impact * .55));
    rig.tail && (rig.tail.rotation.y += Math.sin(t * 3 + gait) * (.15 + walk * .25));
    rig.spiderLegs?.forEach((n, i) => {
      const phase = gait + i * Math.PI * .75, side = i < 4 ? -1 : 1;
      n.rotation.y += Math.sin(phase) * (.025 + walk * .18);
      n.rotation.z += side * (Math.max(0, Math.sin(phase)) * .22 * walk + breath * .025);
      if (winding) { n.rotation.z += side * .1 * progress; if (i % 4 >= 2) n.rotation.x -= .15 * progress; }
      if (e.mode === 'air') n.rotation.z += side * .35;
    });
    rig.spiderKnees?.forEach((n, i) => { n.rotation.z += (i < 4 ? 1 : -1) * Math.max(0, Math.sin(gait + i * Math.PI * .75)) * .2 * walk; });
    rig.fangs?.forEach((n, i) => { n.rotation.x += winding ? -.35 * progress : impact * .35; n.rotation.y += (i ? -1 : 1) * (breath * .05 + progress * (winding ? .18 : 0)); });
    rig.wings?.forEach((n, i) => { n.rotation.y += Math.sin(t * (winding ? 14 : 10) + i * Math.PI) * .65; n.rotation.z += Math.cos(t * 5 + i * Math.PI) * .08; });
    if (rig.wings && rig.body) rig.body.position.y += Math.sin(t * 3.2) * 1.9;
  }
};
POV3DAssets.animateEnemy = function(root, e, g, time, dt) { POVEnemyMotion.animate(root, e, g, time, dt); };
