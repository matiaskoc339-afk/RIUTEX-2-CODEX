// Balanceo de pasos exclusivamente visual: no gira el apuntado ni mueve colisiones.
const POVCameraMotion = {
  amplitude: 0, lastX: null, lastY: null, lastDt: 0, player: null, level: null,
  offset: {y: 0, roll: 0},
  reset() { this.amplitude=0; this.lastX=this.lastY=null; this.lastDt=0; this.player=null; this.level=null; this.offset.y=this.offset.roll=0; },
  advance(g, dt) {
    const p=g.player;
    if (!p || !FirstPerson.active(g) || MenuScene.motionReduced()) { this.reset(); return; }
    if (this.player!==p || this.level!==g.lvl) { this.reset(); this.player=p; this.level=g.lvl; }
    const distance=this.lastX===null?0:Math.hypot(p.x-this.lastX,p.y-this.lastY);
    this.lastX=p.x; this.lastY=p.y;
    if (g.state!=='play' || SceneTransitions.active) { this.lastDt=0; return; }
    const step=Math.max(0,Math.min(.1,Number(dt)||0)), previousDt=this.lastDt;
    this.lastDt=step;
    const keys=g.keys||{}, walking=keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD;
    const moved=walking && distance>.02 && distance<32 && previousDt>0 && !p.hidden && !p.dashT && !g.story?.restrained;
    const speed=moved?Math.min(1,distance/previousDt/135):0;
    const target=(p.running?.82:.5)*speed;
    this.amplitude+=(target-this.amplitude)*(1-Math.exp(-step*11));
    if (this.amplitude<.0001) this.amplitude=0;
  },
  pose(g=Game) {
    const p=g.player;
    if (!p || this.player!==p || this.level!==g.lvl || !FirstPerson.active(g) || MenuScene.motionReduced() || g.state==='menu') {
      this.offset.y=this.offset.roll=0; return this.offset;
    }
    const phase=p.walkT||0;
    this.offset.y=Math.sin(phase*2)*this.amplitude;
    this.offset.roll=Math.sin(phase)*this.amplitude*.004;
    return this.offset;
  },
  eye(g=Game) { return 35+this.pose(g).y; }
};
(() => {
  const update=Game.update;
  Game.update=function(dt) { POVCameraMotion.advance(this,dt); return update.call(this,dt); };
  const start=Game.start;
  Game.start=function(...args) { POVCameraMotion.reset(); return start.apply(this,args); };
})();
