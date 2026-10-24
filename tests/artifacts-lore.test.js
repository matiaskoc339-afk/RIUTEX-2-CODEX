const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {X,run}=require('./harness');
if(run("typeof ArtifactLifecycle==='undefined'"))run(fs.readFileSync(path.join(__dirname,'../js/artifacts-lore.js'),'utf8'));
const {Game:g,Hospital:H,Level:L}=X,A=run('ArtifactLifecycle');g.init();
function start(lvl='hospital'){
 g.startLvl='mansion';g.start(false);
 if(lvl!=='mansion'){H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';if(lvl!=='hospital')H.goto(g,lvl);}
 g.state='play';g.keys={};g.carn=null;g.enemies=[];g.player.invuln=0;return g;
}
test('Una llave de uso único desaparece tras abrir su cerradura y limpia la selección de Artefactos',()=>{
 for(const pov of [false,true]){start();run(`FirstPerson.setEnabled(${pov})`);g.inv.keys=['archivo'];run("FieldDesk.artifact='archivo'");const d=L.doors.find(d=>d.id==='arch');assert.ok(g.doorOk(d));L.openDoor(d);assert.ok(!g.inv.keys.includes('archivo'));assert.equal(d.key,null);assert.equal(run('FieldDesk.artifact'),null);assert.ok(g.story.artifactState.consumed.archivo);}
 run('FirstPerson.setEnabled(false)');
});
test('Una llave de varias puertas permanece hasta abrir el último cierre compatible',()=>{
 start();g.inv.keys=['morgue'];const doors=L.doors.filter(d=>['mor','garden_link'].includes(d.id));assert.equal(doors.length,2);L.openDoor(doors[0]);assert.ok(g.inv.keys.includes('morgue'));L.openDoor(doors[1]);assert.ok(!g.inv.keys.includes('morgue'));assert.equal(A.pending(g,'morgue').length,0);
});
test('Dirección conserva su llave para los tres accesos de la planta alta',()=>{
 start('hospital1');g.inv.keys=['director'];const doors=L.doors.filter(d=>['dir','bd','north_dir'].includes(d.id));assert.equal(doors.length,3);for(let i=0;i<doors.length;i++){L.openDoor(doors[i]);assert.equal(g.inv.keys.includes('director'),i<doors.length-1);}
});
test('Cerrar y cargar una puerta ya desbloqueada no vuelve a exigir la llave consumida',()=>{
 start();g.inv.keys=['archivo'];let d=L.doors.find(d=>d.id==='arch');L.openDoor(d);assert.ok(L.closeDoor(d,true));assert.equal(d.open,false);g.save(0);g.start(false,g.getSaveSlots()[0]);d=L.doors.find(d=>d.id==='arch');assert.equal(d.open,false);assert.equal(d.key,null);assert.ok(g.doorOk(d));assert.ok(!g.inv.keys.includes('archivo'));L.openDoor(d);assert.equal(d.open,true);
});
test('El pase de escaleras se consume al usarse, pero no impide regresar ni volver a subir',()=>{
 start();g.inv.keys=['pase_sup'];g.take(g.items.find(i=>i.id==='stairs_up'));assert.equal(g.lvl,'hospital1');assert.ok(!g.inv.keys.includes('pase_sup'));g.take(g.items.find(i=>i.id==='stairs_dn'));assert.equal(g.lvl,'hospital');g.take(g.items.find(i=>i.id==='stairs_up'));assert.equal(g.lvl,'hospital1');
});
test('La llave de sótano no se descarta hasta abrir su puerta y usar la escalera',()=>{
 start();g.inv.keys=['sotano'];L.openDoor(L.doors.find(d=>d.id==='sot'));assert.ok(g.inv.keys.includes('sotano'));g.take(g.items.find(i=>i.id==='stairs_dn_b'));assert.equal(g.lvl,'hospitalb');assert.ok(!g.inv.keys.includes('sotano'));
});
test('Un guardado antiguo con la puerta abierta migra sin conservar una llave inservible',()=>{
 start();g.inv.keys=['archivo'];let d=L.doors.find(d=>d.id==='arch');L.openDoor(d);const sv=g.save(null);delete sv.story.artifactState;sv.inv.keys=['archivo'];g.start(false,sv);assert.ok(!g.inv.keys.includes('archivo'));assert.ok(g.story.artifactState.consumed.archivo);d=L.doors.find(d=>d.id==='arch');assert.equal(d.key,null);
});
test('Los objetivos recuerdan el acceso adquirido después de retirar físicamente la llave',()=>{
 start('mansion');g.inv.keys=['estudio'];g.pz['h:briefing']=true;L.openDoor(L.doors.find(d=>d.id==='estudio'));assert.ok(!g.inv.keys.includes('estudio'));const goal=run('HospitalCompass.current(Game)');assert.equal(goal.id,'wren_clock');
 const old=g.save(null);delete old.story.artifactState;old.inv.keys=[];g.start(false,old);assert.equal(run('HospitalCompass.current(Game).id'),'wren_clock');
});
test('Retira piezas y equipo ya instalados, conservando sus efectos y las piezas que siguen pendientes',()=>{
 start('hospitalworks');g.inv.keys=['wx_filter','wx_radio','wx_rotor','wx_cell'];run('Works.data().filter=true;Works.data().radioDone=true');g.pz['h:wx_pumps']=true;A.sweep(g);assert.deepEqual([...g.inv.keys],['wx_cell']);assert.equal(run('Works.data().filter'),true);
});
test('La llave del Tallador desaparece al desbloquear la reja, pero no cambia su derrota ni el acceso',()=>{
 start('hospitalcells');g.inv.keys=['cl_prison_key'];g.pz['h:cl_prison']=true;A.sweep(g);assert.ok(!g.inv.keys.includes('cl_prison_key'));assert.ok(g.pz['h:cl_prison']);
});
test('Los ingredientes del antídoto permanecen hasta iniciar la síntesis y después desaparecen',()=>{
 start('hospitalumbra');g.inv.keys=['lf_serum','lf_genome','lf_catalyst'];A.sweep(g);assert.equal(g.inv.keys.length,3);run('Endgame.data().started=true');A.sweep(g);assert.equal(g.inv.keys.length,0);
});
test('El archivo narrativo añade documentos legibles y accesibles, sin requisitos ni recompensas ajenas a los documentos',()=>{
 const rows=run('R2LoreArchive.documents');assert.equal(rows.length,24);const ids=new Set();for(const row of rows){assert.ok(!ids.has(row.id));ids.add(row.id);assert.ok(X.DOCS[row.id].text.length>=400);assert.ok(!run(`CLUES.has('${row.id}')`));}
 for(const lvl of [...new Set(rows.map(r=>r.lvl))]){start(lvl);const queue=[[Math.floor(g.player.x/32),Math.floor(g.player.y/32)]],reachable=new Set(queue.map(p=>p.join(',')));for(let i=0;i<queue.length;i++){const[x,y]=queue[i];for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny,v=L.grid[ny]?.[nx];if(v===undefined||v===1||v===4||reachable.has(k))continue;reachable.add(k);queue.push([nx,ny]);}}
  for(const row of rows.filter(r=>r.lvl===lvl)){const it=g.items.find(i=>i.doc===row.id);assert.ok(it,row.id);assert.equal(L.grid[Math.floor(it.y/32)][Math.floor(it.x/32)],0,row.id);assert.ok(reachable.has(row.x+','+row.y),row.id+' alcanzable');assert.ok(g.items.every(other=>other===it||Math.hypot(other.x-it.x,other.y-it.y)>=40),row.id+' separación');}}
});
test('Los documentos narrativos se recogen una sola vez por 2 XP y se conservan al cargar',()=>{
 start('mansion');g.player.xp=0;const it=g.items.find(i=>i.doc==='lore20_01');assert.ok(it);g.take(it);assert.equal(g.player.xp,2);g.take(it);g.openDoc('lore20_01');assert.equal(g.player.xp,2);g.resume();g.save(0);g.start(false,g.getSaveSlots()[0]);assert.ok(g.inv.docs.includes('lore20_01'));assert.equal(g.player.xp,2);assert.ok(!g.items.some(i=>i.doc==='lore20_01'));
});
test('Una partida anterior recibe los documentos nuevos sin regalarlos, sin borrar progreso ni alterar XP',()=>{
 start('hospital1');g.player.xp=13;const data=g.save(null);delete data.story.artifactState;data.picked=data.picked.filter(id=>!String(id).startsWith('lore20_'));data.inv.docs=data.inv.docs.filter(id=>!id.startsWith('lore20_'));g.start(false,data);assert.equal(g.player.xp,13);assert.equal(g.items.filter(i=>i.doc?.startsWith('lore20_')).length,4);
});
