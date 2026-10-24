// Ratón POV: ejes equivalentes y ciclo de menús sin capturas repetidas ni disparos.
const test=require('node:test'),assert=require('node:assert/strict');
const {X,run,sandbox}=require('./harness');
const {Game:g,Hospital:H}=X,fp=run('FirstPerson'),transitions=run('SceneTransitions');g.init();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function start(enabled=true){fp.setEnabled(false);g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';g.enemies=[];g.carn=null;g.keys={};g.player.angle=0;g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;fp.setEnabled(enabled);fp.pitch=0;fp.capturePending=false;fp.captureWanted=false;fp.captureAttempted=false;fp.ignoreUnlock=false;return g.player;}
function native(fn,work){const ready=fp.ready,original=g.cv.requestPointerLock;fp.ready=true;g.cv.requestPointerLock=fn;try{work();}finally{fp.release(g);fp.ignoreUnlock=false;fp.ready=ready;if(original)g.cv.requestPointerLock=original;else delete g.cv.requestPointerLock;}}
test('La misma distancia de ratón produce el mismo giro angular X/Y en toda la barra',()=>{
 start();for(const percent of [25,100,250]){fp.setSensitivity(percent);g.player.angle=fp.pitch=0;fp.look(40,40,g);near(g.player.angle,fp.pitch);g.player.angle=fp.pitch=0;fp.look(-40,-40,g);near(g.player.angle,fp.pitch);}fp.setSensitivity(100);
});
test('Valores no finitos no dañan la cámara; la mirada conserva sus límites amplios',()=>{
 start();fp.look(NaN,Infinity,g);near(g.player.angle,0);near(fp.pitch,0);fp.look(0,100000,g);near(fp.pitch,fp.maxPitch);fp.look(0,-100000,g);near(fp.pitch,-fp.maxPitch);const before=fp.pitch;fp.look(0,1,g);assert.ok(fp.pitch>before);
});
test('Las flechas de respaldo también giran e inclinan a la misma velocidad',()=>{
 start();fp.turnKeys={ArrowRight:true,ArrowDown:true};fp.tick(.05,g);near(g.player.angle,fp.pitch);fp.turnKeys={};
});
test('Cerrar un menú solicita captura automática una vez y limpia las acciones del ratón',()=>{
 start();let requests=0;native(()=>{requests++;},()=>{g.state='tree';UI('tree');g.mouse.down=g.mouse.clicked=g.mouse.rclick=true;g.resume();assert.equal(requests,1);assert.ok(fp.captureWanted&&fp.capturePending);assert.ok(!g.mouse.down&&!g.mouse.clicked&&!g.mouse.rclick);for(let i=0;i<30;i++)fp.tick(1/60,g);assert.equal(requests,1);});
});
test('Una captura rechazada ofrece respaldo y no reintenta en cada frame',()=>{
 start();let requests=0;native(()=>{requests++;throw new Error('denied');},()=>{fp.wantCapture(g);assert.equal(requests,1);assert.ok(fp.fallback&&fp.armed&&!fp.capturePending);for(let i=0;i<60;i++)fp.tick(1/60,g);assert.equal(requests,1);g.state='pause';UI('pause');g.resume();assert.equal(requests,2);});
});
test('Un fundido aplaza la captura y la solicita al terminar, sin perder la intención',()=>{
 start();let requests=0;native(()=>{requests++;},()=>{transitions.active=true;UI(null);fp.tick(1/60,g);assert.equal(requests,0);assert.equal(fp.captureWanted,true);transitions.finish();assert.equal(requests,1);});
});
test('Topdown no solicita captura automática ni altera la mirada',()=>{
 start(false);let requests=0;native(()=>{requests++;},()=>{g.resume();fp.wantCapture(g);fp.look(80,80,g);fp.tick(.05,g);assert.equal(requests,0);near(g.player.angle,0);near(fp.pitch,0);});
});
test('Abrir habilidades libera una captura activa y no la recupera mientras el menú siga abierto',()=>{
 start();let exits=0,requests=0;const original=sandbox.document.exitPointerLock;
 native(()=>{requests++;},()=>{sandbox.document.pointerLockElement=g.cv;sandbox.document.exitPointerLock=()=>{exits++;sandbox.document.pointerLockElement=null;};g.toggleTree();assert.equal(g.state,'tree');assert.equal(exits,1);assert.equal(fp.captureWanted,false);for(let i=0;i<20;i++)fp.tick(1/60,g);assert.equal(requests,0);});
 sandbox.document.pointerLockElement=null;if(original)sandbox.document.exitPointerLock=original;else delete sandbox.document.exitPointerLock;fp.ignoreUnlock=false;
});
function UI(screen){return X.UI.screen(screen);}
