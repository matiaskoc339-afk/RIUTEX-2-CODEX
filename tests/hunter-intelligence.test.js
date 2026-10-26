const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game:g,Hospital:H,Level:L}=X,M=run('HunterIntelligence'),BI=run('BlindInvestigation');g.init();
function fixture(pov=false){
 g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';g.player.hidden=false;g.player.x=700;g.player.y=600;g.player.invuln=0;g.keys={};g.enemies=[];g.noise=null;g.clSounds=[];g.clSoundSerial=0;
 L.W=L.H=80;L.grid=Array.from({length:80},(_,y)=>Array.from({length:80},(_,x)=>!x||!y||x===79||y===79?1:0));L.props={};L.doors=[];L.lamps=[];L.safeRects=[];run(`FirstPerson.setEnabled(${pov})`);
 const c=run('new Carnicero(900,500,600)');c.dormant=false;c.state='chase';c.hunt=true;c.burstCd=c.atkCd=100;g.carn=c;g.enemies=[c];return c;
}
test('El Carnicero corta una trayectoria observada sin aumentar su velocidad ni leer entradas',()=>{
 for(const pov of [false,true]){const c=fixture(pov);g.player.x=820;for(let i=0;i<24;i++){g.player.y+=2;g.t+=1/60;c.update(1/60,g);}assert.ok(c.tgt[1]>g.player.y);assert.deepEqual([...c.lastSeen],[g.player.x,g.player.y]);assert.ok(c.tgt[1]-g.player.y<96);assert.ok(c.x<600);}
});
test('Perder visión conserva una pista, no la posición del jugador que ya se escondió',()=>{
 const c=fixture();c.update(.02,g);const clue=[c.hiX,c.hiY];g.player.hidden=true;g.player.x=1200;g.player.y=1000;
 for(let i=0;i<150;i++)c.update(1/60,g);assert.deepEqual([c.hiX,c.hiY],clue);assert.ok(!c.hunt);assert.equal(c.state,'search');assert.ok(c.hiPlan.length>1);assert.ok(c.hiPlan.every(p=>Math.hypot(p[0]-clue[0],p[1]-clue[1])<150));
});
test('La búsqueda comprueba varios lugares y termina sin encontrar un armario sin testigos',()=>{
 const c=fixture();c.hiKnown=true;c.hiX=700;c.hiY=600;c.lastSeen=[700,600];g.player.hidden=true;run('StalkerMind.search(Game.carn)');const start=[c.x,c.y];
 for(let i=0;i<500;i++){g.t+=1/60;c.update(1/60,g);}assert.ok(Math.hypot(c.x-start[0],c.y-start[1])>60);assert.ok(['patrol','routine'].includes(c.state));assert.equal(c.hunt,false);assert.equal(g.player.hidden,true);
});
test('Un ruido prepara investigación en su origen sin regalar la posición actual',()=>{
 const c=fixture();c.state='routine';c.routineT=10;c.hunt=false;c.face=Math.PI;g.player.x=1000;g.player.y=1000;g.noise={x:620,y:700,r:600};c.update(.02,g);
 assert.equal(c.hiKind,'noise');assert.deepEqual([c.hiX,c.hiY],[620,700]);assert.deepEqual([...c.lastHeard],[620,700]);assert.equal(c.state,'investigate');
});
test('Predicciones y lugares de búsqueda no atraviesan paredes ni entran a refugios',()=>{
 const c=fixture();c.hiKnown=true;c.hiKind='sight';c.hiX=700;c.hiY=598;c.hiAge=1/60;c.hiVY=220;
 L.safeRects=[[21,18,23,23]];const target=M.observe(c,g.player,1/60);assert.deepEqual([...target],[700,600]);L.safeRects=[];
 for(let y=1;y<79;y++)L.grid[y][23]=1;const points=M.plan(c,700,600,200,0);assert.ok(points.every(p=>M.floor(...p,c.r)));assert.ok(points.every(p=>p[0]<23*32));
});
test('Un ruido nuevo en el mismo lugar vuelve a ser la pista más reciente',()=>{
 const c=fixture();M.hear(c,{x:650,y:650});M.observe(c,g.player,.02);assert.equal(c.hiKind,'sight');M.hear(c,{x:650,y:650});assert.equal(c.hiKind,'noise');assert.deepEqual([c.hiX,c.hiY],[650,650]);
});
test('El Tallador investiga el último ruido tras recuperarse y acepta un ruido nuevo',()=>{
 fixture();const b=run('new BlindCarver(600,600)');b.active=true;b.hear({id:1,x:700,y:600});b.mode='recover';b.clock=.01;b.update(.02,g);assert.equal(b.mode,'search');assert.ok(b.hiPlan.length>1);
 g.clSounds=[{id:2,x:600,y:780,r:1200,life:1}];b.update(.02,g);assert.equal(b.mode,'listen');assert.deepEqual([...b.target],[600,780]);assert.ok(b.clock>=.6);
});
test('La investigación ciega es idéntica para dos posiciones silenciosas distintas',()=>{
 const paths=[];for(const location of [[1200,600],[600,1200]]){fixture();const b=run('new BlindCarver(600,600)');b.active=true;b.hear({id:1,x:700,y:600});BI.start(b);[g.player.x,g.player.y]=location;
  for(let i=0;i<180;i++)b.update(1/60,g);paths.push([b.x,b.y,b.face,b.mode]);}
 assert.deepEqual(paths[0],paths[1]);
});
test('El Tallador no redirige el corte anunciado y una nueva pista no cancela recuperación',()=>{
 fixture();const b=run('new BlindCarver(600,600)');b.active=true;b.hear({id:1,x:700,y:600});b.mode='wind';b.dir=b.face=0;b.clock=.8;g.clSounds=[{id:2,x:600,y:780,r:1200,life:1}];g.player.x=600;g.player.y=1000;const hp=g.player.hp;
 for(let i=0;i<51;i++)b.update(1/60,g);assert.equal(b.dir,0);assert.equal(g.player.hp,hp);assert.equal(b.mode,'recover');const remaining=b.clock;b.hear({id:3,x:600,y:1000});assert.equal(b.mode,'recover');assert.equal(b.clock,remaining);
});
test('Pausa y congelación detienen las búsquedas; campos de memoria sobreviven sesión',()=>{
 const c=fixture();c.hiKnown=true;c.hiX=700;c.hiY=600;run('StalkerMind.search(Game.carn)');const S=run('SessionSave'),fields=S.fields(c,true);assert.equal(fields.hiKnown,true);assert.ok(fields.hiPlan.length>0);
 const copy=run('new Carnicero(900,500,600)');S.applyFields(copy,fields);assert.deepEqual([...copy.hiPlan[0]],[...c.hiPlan[0]]);c.frozen=2;const x=c.x;c.update(.1,g);assert.equal(c.x,x);c.frozen=0;g.state='pause';const search=c.searchT;c.update(.5,g);assert.equal(c.x,x);assert.equal(c.searchT,search);g.state='play';
 const b=run('new BlindCarver(600,600)');b.active=true;b.hear({id:1,x:700,y:600});BI.start(b);g.state='pause';const before=[b.x,b.y,b.hiSearchTime];b.update(.5,g);assert.deepEqual([b.x,b.y,b.hiSearchTime],before);
});
