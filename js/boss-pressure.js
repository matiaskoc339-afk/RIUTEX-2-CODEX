// Presión compartida por los jefes de RIUTEX 2, en ambas perspectivas.
// No aumenta su vida ni altera recompensas o partidas guardadas.
const BossPressure = {
  meleeDamage(enemy, damage, blade) {
    if (!enemy.isBoss) return damage;
    const exposed = enemy.mode === 'recover' || enemy.mode === 'stun';
    return damage * (blade ? (exposed ? 1 : .72) : (exposed ? .65 : .38));
  },
  wind(enemy) {
    const factor = enemy.phase === 3 || enemy.enraged ? .88 : .93;
    enemy.clock = enemy.windMax = Math.max(.6, enemy.clock * factor);
  },
  recovery(enemy, seconds, wall = false) {
    // Chocar sigue siendo la mejor oportunidad; los peligros persistentes
    // conservan todo su tiempo para no superponerse al siguiente ataque.
    const hazards = enemy.attack === 'vents' || enemy.attack === 'marks' || enemy.attack === 'quake';
    return hazards || seconds >= 3 ? seconds : Math.max(wall ? 1.65 : .7, seconds * (wall ? .9 : .8));
  },
  closeAttack(enemy, kind, g) {
    if (Math.hypot(g.player.x - enemy.x, g.player.y - enemy.y) > 112) return kind;
    if (enemy instanceof SpiderMatriarch) return enemy.attack === 'claw' ? kind : 'claw';
    if (enemy instanceof FinalCarnicero) return enemy.attack === 'cleave' ? kind : 'cleave';
    if (enemy instanceof RoyalRegent) return enemy.phase === 2 ? 'hammer' : 'slash';
    if (enemy instanceof OriginWren) return enemy.phase === 2 ? 'slam' : 'chain';
    return kind;
  }
};

// Solo los cuatro encuentros de tres fases usan estas funciones. Las pausas
// de reanudación de una partida y las transiciones de mutación se mantienen.
for (const Boss of [FinalCarnicero, SpiderMatriarch, RoyalRegent, OriginWren]) {
  const begin = Boss.prototype.begin, recover = Boss.prototype.recover;
  Boss.prototype.begin = function(kind, g) {
    begin.call(this, kind, g);
    BossPressure.wind(this);
  };
  Boss.prototype.recover = function(seconds, wall = false) {
    return recover.call(this, BossPressure.recovery(this, seconds, wall), wall);
  };
}
