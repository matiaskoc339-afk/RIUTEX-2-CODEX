// La elección pertenece al inicio de Nueva partida; cargar o reintentar no la repite.
const PerspectiveChoice = {
  visible: false, starting: false, ready: false,
  controls() { return ['bPerspectivePOV', 'bPerspectiveTopdown', 'bPerspectiveBack'].map(id => UI.$(id)); },
  open(g = Game) {
    if (this.starting || SceneTransitions.active) return;
    Sound.unlock(); FirstPerson.release(g); g.state = 'menu';
    UI.screen('perspectiveChoice');
    UI.$(FirstPerson.enabled ? 'bPerspectivePOV' : 'bPerspectiveTopdown').focus();
  },
  cancel(g = Game) {
    if (!this.visible || this.starting) return;
    g.toMenu(); UI.$('bNew').focus();
  },
  choose(mode, g = Game) {
    if (!this.visible || this.starting || !['pov', 'topdown'].includes(mode)) return false;
    this.starting = true;
    try {
      Sound.unlock(); FirstPerson.clearActions(g); g.keys = {};
      FirstPerson.setEnabled(mode === 'pov'); g.startLvl = 'mansion';
      g.start(false); // Síncrono dentro del clic: conserva la activación para Pointer Lock.
      return true;
    } finally { this.starting = false; }
  },
  init(g) {
    UI.$('bNew').onclick = () => this.open(g);
    UI.$('bPerspectivePOV').onclick = () => this.choose('pov', g);
    UI.$('bPerspectiveTopdown').onclick = () => this.choose('topdown', g);
    UI.$('bPerspectiveBack').onclick = () => this.cancel(g);
    if (this.ready) return;
    this.ready = true;
    window.addEventListener('keydown', e => {
      if (!this.visible) return;
      e.stopImmediatePropagation();
      if (e.code === 'Escape') { e.preventDefault(); this.cancel(g); return; }
      const nodes = this.controls(), index = nodes.indexOf(document.activeElement);
      if (e.code === 'Tab') {
        e.preventDefault(); nodes[(index + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length].focus();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault(); nodes[index === 0 ? 1 : 0].focus();
      }
    }, true);
  }
};
(() => {
  const init = Game.init;
  Game.init = function(...args) { const result = init.apply(this, args); PerspectiveChoice.init(this); return result; };
  const screen = UI.screen;
  UI.screen = function(name) {
    const result = screen.call(this, name);
    PerspectiveChoice.visible = name === 'perspectiveChoice';
    this.$('perspectiveChoice').classList.toggle('hidden', !PerspectiveChoice.visible);
    if (PerspectiveChoice.visible) this.$('hud').classList.add('hidden');
    return result;
  };
})();
