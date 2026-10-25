const test=require('node:test'), assert=require('node:assert/strict');
const {X,run}=require('./harness');const g=X.Game,L=X.Level,M=run('POVCameraMotion'),P=run('FirstPerson');g.init();
function start(enabled=true){
 g.startLvl='mansion';g.start(false);X.Hospital.toHospital(g);g.story.restrained=false;X.Hospital.inject(g);g.story.seq='free';g.state='play';
 g.enemies=[];g.carn=null;g.custodio=null;g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;
 L.W=40;L.H=30;L.grid=Array.from({length:30},(_,y)=>Array.from({length:40},(_,x)=>!x||!y||x===39||y===29?1:0));L.props={};L.rooms=[];L.doors=[];L.safeRects=[];
 g.player.x=g.player.y=320;g.player.angle=0;g.player.walkT=0;g.player.knx=g.player.kny=0;g.player.weapon=null;g.player.hidden=false;
 P.setEnabled(enabled);run('MenuScene.reduced=false');M.reset();
}
function steps(n){const poses=[];for(let i=0;i<n;i++){g.update(1/60);poses.push({...M.pose(g)});}return poses;}
test('La cámara parte centrada y caminar produce un balanceo acotado sin cambiar el apuntado',()=>{
 start();assert.deepEqual({...M.pose(g)},{y:0,roll:0});g.keys={KeyW:true};const poses=steps(90);
 assert.ok(poses.some(p=>p.y>.3)&&poses.some(p=>p.y<-.3));assert.ok(poses.every(p=>Math.abs(p.y)<=.5&&Math.abs(p.roll)<=.002));assert.equal(g.player.angle,0);assert.equal(P.pitch,0);
});
test('Correr aumenta ligeramente el paso y detenerse lo desvanece hasta el centro',()=>{
 start();g.keys={KeyW:true};steps(60);const walking=M.amplitude;g.keys.ShiftLeft=true;steps(45);assert.ok(M.amplitude>walking&&M.amplitude<=.82);
 g.keys={};const last=M.amplitude;steps(1);assert.ok(M.amplitude>0&&M.amplitude<last);steps(90);assert.equal(M.amplitude,0);assert.equal(M.eye(g),35);
});
test('Empujar una pared o permanecer escondido no simula pasos',()=>{
 start();g.player.x=11*32-10;g.player.y=10.5*32;L.grid[10][11]=1;g.keys={KeyW:true};steps(60);assert.equal(M.amplitude,0);
 g.player.hidden=true;g.player.x=300;steps(20);assert.equal(M.amplitude,0);
});
test('Pausa congela la pose y reducir movimiento elimina todo el balanceo',()=>{
 start();g.keys={KeyW:true};steps(40);const before={...M.pose(g)};g.pause();steps(25);assert.deepEqual({...M.pose(g)},before);
 g.resume();g.keys={KeyW:true};run('MenuScene.reduced=true');steps(20);assert.equal(M.amplitude,0);assert.deepEqual({...M.pose(g)},{y:0,roll:0});run('MenuScene.reduced=false');
});
test('Topdown y una partida nueva no heredan desplazamiento de cámara',()=>{
 start();g.keys={KeyW:true};steps(30);assert.ok(M.amplitude>0);P.setEnabled(false);steps(2);assert.deepEqual({...M.pose(g)},{y:0,roll:0});
 P.setEnabled(true);g.startLvl='mansion';g.start(false);assert.equal(M.amplitude,0);assert.equal(M.eye(g),35);
});
test('El disparo y el ojo comparten exactamente la altura del paso',()=>{
 start();g.keys={KeyW:true};steps(37);const B=run('POV3DBallistics'),ray=B.ray(g,g.player);assert.notEqual(M.eye(g),35);assert.equal(ray.eye,M.eye(g));
});
test('Calcular la pose no altera al jugador ni acumula inclinación al repetir un frame',()=>{
 start();g.keys={KeyW:true};steps(25);const before=JSON.stringify(g.player),pose={...M.pose(g)};
 for(let i=0;i<100;i++)assert.deepEqual({...M.pose(g)},pose);assert.equal(JSON.stringify(g.player),before);
});
