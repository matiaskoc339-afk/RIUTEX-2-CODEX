// Partida completa de la Fase 1 (nuevo flujo) + puertas + IA del Carnicero + árbol de dos caminos.
const { X } = require('./harness.js'); const { Game, Level, TILE, Puzzles, Trees, Hospital, Nav, SKILLS } = X; let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { Game.update(dt); Game.render(); } }; const tp = (tx, ty) => { Game.player.x = tx * TILE + 16; Game.player.y = ty * TILE + 16; };
const take = id => { const it = Game.items.find(i => i.id === id); if (!it) throw new Error('item no existe ' + id); Game.take(it); if (Game.state === 'doc') Game.closeDoc(); };
const pad = code => { for (const ch of code) Puzzles.key(Game, ch); Puzzles.key(Game, 'OK'); }; const door = id => Level.doors.find(d => d.id === id); const unlock = id => { const d = door(id); ok(Game.doorOk(d) || !d.key, 'puerta ' + id + ' se abre con su llave'); Level.openDoor(d); };
const fake = () => { Game.keys = {}; };
Game.init(); Game.startLvl = 'mansion'; Game.start(false);
// ---------- MANSIÓN (jugable desde el segundo 0)
ok(Game.state === 'play' && Game.lvl === 'mansion', 'La mansión empieza JUGABLE (sin cinemática)'); ok(Game.player.weapon?.id === 'ak' && Game.squad.length === 3, 'AK de asalto + 3 soldados de escuadrón'); step(300);
Level.openDoor(door('front')); tp(31, 39); step(5); ok(door('front').open, 'Pegado a la puerta: NO se cierra encima de ti'); tp(28, 34); step(2); ok(!Hospital.doorOpen('front') && door('front').key === 'h:front', 'Al entrar al vestíbulo, la puerta principal se cierra y bloquea');
take('m2'); if(Game.state==='doc')Game.closeDoc(); ok(Game.pz['h:briefing'], 'La pista de la biblioteca habilita el comedor del prólogo'); take('mk1'); step(2); ok(Game.enemies.filter(e => [703, 704].includes(e.id)).every(e => e.alert), 'Coger la llave del comedor despierta a los criados'); unlock('estudio');
tp(31, 13); take('h_clock'); ok(Game.state === 'puzzle', 'Reloj con agujas abre mecanismo interactivo');
const {run} = require('./harness.js');
run("BluePuzzles.cur.values=[1,10]"); ok(!run('BluePuzzles.complete(Game)'), 'Hora incorrecta rechazada');
run("BluePuzzles.cur.values=[3,40]; BluePuzzles.complete(Game)"); ok(Game.pz.h_clock && door('secreto').open, '03:40 abre el pasadizo');
tp(32, 6); take('h_vial'); ok(Game.story.finale && Game.custodio, 'Coger el frasco: apagón y aparece el Custodio (huida jugable)'); let n = 0; while (Game.lvl === 'mansion' && n++ < 2000) step(1);
ok(Game.lvl === 'hospital' && Game.story.seq === 'wake' && Game.story.restrained, 'El Custodio te alcanza: despiertas atado en el hospital (' + n + ' frames)'); ok(Game.state === 'play' && Game.inv.items.length === 0 && !Game.player.weapon, 'Sin equipo, sin cinemáticas de texto: estado jugable');
// ---------- TRAMO LINEAL: correas -> pasillo largo -> persecución -> brazo -> frasco -> vestíbulo
step(30); const px = Game.player.x; Game.keys.KeyD = true; step(30); Game.keys = {}; ok(Math.abs(Game.player.x - px) < 2, 'Atado: no puedes moverte'); for (let i = 0; i < 12; i++) Game.interact(); ok(!Game.story.restrained && Game.story.seq === 'room', 'Pulsar E 12 veces te libera');
ok(Game.carn.dormant, 'El Carnicero aún no aparece'); Level.openDoor(door('hab12')); tp(23, 7); step(3); ok(Game.story.seq === 'run' && !Game.carn.dormant && Game.carn.hunt, 'Al avanzar por el pasillo largo, el Carnicero aparece y te caza');
tp(43,7); Game.keys={}; let t=0; while(Game.story.seq==='run'&&t++<3000)step(1);
ok(Game.story.seq==='wounded_run'&&Game.story.armCut,'El primer golpe junto a la puerta corta el brazo');ok(door('forced').open&&Game.story.firstDoorHits===1,'Un solo golpe abre el cierre');
Game.useInj();ok(!Game.story.armHealed,'El frasco no puede usarse durante la huida');
tp(52,19);step(3);ok(door('shutter').open,'La persiana permite llegar al vestíbulo herido');tp(52,24);step(2);ok(Game.story.seq==='lobby_inject'&&Game.state==='tutorial','Llegada: persiana cerrada y tutorial visual');ok(Game.carn.dormant&&!door('shutter').open,'El perseguidor queda separado del jugador');
run('Guidebook.close(Game)');Game.useInj();ok(Game.story.armHealed&&Game.story.seq==='free','F regenera el brazo recién en el vestíbulo');ok(!Game.mut.has('reflejos')&&!Game.mut.has('instinto'),'Las técnicas iniciales no son obligatorias');Game.player.xp+=10;Game.buySkill('reflejos');Game.castSkill('reflejos');ok(Game.player.dashT>0,'Q activa la esquiva');
// ---------- VESTÍBULO: exploración libre
Game.player.maxHp = 99999; Game.player.hp = 99999;
take('pp1'); ok(Game.player.weapon && Game.player.weapon.id === 'pistol', 'Pistola en el centro del vestíbulo'); take('pa1');
const lw = door('lob_w'); tp(38, 28); Game.keys = {}; Game.interact(); ok(lw.open, 'Puerta del ala oeste se abre con E'); step(2); ok(Game.story.carnActive, 'Al abrir un ala, el Carnicero entra en juego'); step(60 * 16); ok(Game.carn.dormant, 'El silencio no hace aparecer al Carnicero por un temporizador');
// cerrar puertas (un enemigo en el umbral lo impide)
const blocker = Game.enemies.find(e => e.id === 803); blocker.x = 37 * TILE + 16; blocker.y = 28 * TILE + 16; tp(36, 28); Game.interact(); ok(lw.open, 'Un enemigo en el umbral impide cerrar la puerta'); blocker.dead = true;
tp(36, 28); Game.keys = {}; const near = Hospital.nearOpenDoor(Game.player); ok(near && near.id === 'lob_w', 'Detecta puerta abierta cercana'); Game.interact(); ok(!lw.open && Level.grid[28][37] === 2, 'E cierra la puerta (queda como puerta libre)');
// ---------- CADENA DE PUZZLES (planta baja)
tp(14, 27); take('hk_arch'); ok(!!Game.inv.keys.length, 'Llave del archivo (Oficinas)'); unlock('arch'); take('hk_urg'); take('a1'); take('o1'); take('h1'); take('f1'); ok(Game.inv.docs.includes('a1') && Game.inv.docs.includes('f1') && Game.inv.docs.includes('h1'), 'Documentos conectados: lista de pacientes + pulsera hab.12 + protocolo');
take('hk_pase') ; take('hk_coc'); take('hk_sot'); take('hk_far'); unlock('urg'); unlock('far'); const cab = Game.items.find(i => i.id === 'h_cab'); Game.take(cab); pad('0000'); ok(!Game.pz.h_cab, 'Armario: código erróneo rechazado'); pad('0712'); ok(Game.pz.h_cab && !Game.player.weapons.shotgun && Game.inv.keys.includes('morgue'), 'Armario 0712 (hab.07 + hab.12): material clínico y llave de la Morgue; escopeta opcional');
unlock('mor'); take('hk_fa'); ok(Game.inv.keys.includes('fusible_a'), 'Fusible A en la Morgue');
// escalera arriba
const up = Game.items.find(i => i.id === 'stairs_up'); const had = Game.inv.keys.splice(Game.inv.keys.indexOf('pase_sup'), 1); Game.take(up); ok(Game.lvl === 'hospital', 'Escalera bloqueada sin pase'); Game.inv.keys.push('pase_sup'); door('lob_e').open || Level.openDoor(door('lob_e')); Game.take(up); ok(Game.lvl === 'hospital1', 'Con el pase subes al primer piso'); ok(Game.story.doors.hospital.includes('far') && Game.story.doors.hospital.includes('arch'), 'Puertas abiertas de la planta baja se recuerdan');
step(60 * 26); ok(Game.carn && Game.carn.dormant, 'La planta alta permanece tranquila sin nuevo ruido');
unlock('uci'); take('hk_h07'); unlock('h07'); take('p4'); take('p3'); take('hk_bib'); unlock('bib'); take('hk_dir'); unlock('dir'); const sf = Game.items.find(i => i.id === 'h_safe'); Game.take(sf); pad('0101'); ok(!Game.pz.h_safe, 'Caja: fecha errónea'); pad('0714'); ok(Game.pz.h_safe && Game.inv.keys.includes('garaje') && !Game.player.weapons.viper && !Game.stash.some(i => i.id === 'viper'), 'Caja del director 0714 (ingreso del Sujeto Cero): llave de la rampa; UZI opcional');
take('hk_fb'); ok(Game.inv.keys.includes('fusible_b'), 'Fusible B en el quirófano');
// sótano
Game.take(Game.items.find(i => i.id === 'stairs_dn')); ok(Game.lvl === 'hospital' && Math.abs(Game.player.x / TILE - 62.5) < 3, 'Bajas a la planta baja por la escalera principal'); tp(19, 43); unlock('sot'); tp(19, 45); Game.take(Game.items.find(i => i.id === 'stairs_dn_b')); ok(Game.lvl === 'hospitalb', 'Escalera al sótano');
tp(43, 16); Game.take(Game.items.find(i => i.id === 'h_gen')); ok(Game.state==='puzzle', 'Los dos fusibles habilitan el circuito del generador');
run(`{let solution=null;for(let n=0;n<262144;n++){let k=n,v=[];for(let i=0;i<9;i++){v.push(k%4);k=Math.floor(k/4);}if(BluePuzzles.circuitReach(v).has(9)){solution=v;break;}}if(!solution)throw Error('Circuito imposible');BluePuzzles.cur.values=solution;BluePuzzles.complete(Game);}`); ok(Game.pz['h:power'] && door('garage').open, 'Generador con 2 fusibles: energía del garaje'); unlock('rampa');
// ---------- DERRUMBE Y JEFE FINAL (el combate completo se prueba aparte en navegador)
tp(73,38);step(3);ok(!Game.boss && !Level.bossZone, 'El garaje permite acercarse a la salida, sin el jefe antiguo');
unlock('exit');tp(79,42);step(1);ok(!!Game.collapse,'El suelo cede cuando estás a punto de salir');step(115);
ok(Game.lvl==='hospitalchem' && Game.boss.active && Game.boss.phase===1,'La caída termina en la rejilla de la cuba química');
const c=Game.boss;step(300);ok(Game.state==='play'&&c.maxHp===1500,'Jefe de tres fases activo, sin cinemática de texto');
c.hurt(5000,0,Game);ok(c.phase===2&&c.hp===1000&&c.mode==='mutate','Primera forma vencida: mutación obligatoria');step(180);
c.hurt(5000,0,Game);ok(c.phase===3&&c.hp===500&&c.mode==='mutate','Segunda forma vencida: furia obligatoria');step(180);
c.hurt(5000,0,Game);ok(c.dead&&Game.pz['h:boss']&&door('containment_exit').open,'La victoria abre la compuerta lateral');
tp(38,19);step(3);ok(Game.state==='play','La galería permite llegar a la escalera tras la victoria');Game.take(Game.items.find(i=>i.id==='wx_down'));ok(Game.lvl==='hospitalworks','La escalera conecta con el nuevo refugio de la fábrica');
// ---------- Red completa: conectividad, compra y efectos reales
Game.start(false); Game.mut.tutorial=true; Game.player.xp=9999;
const m=Game.mut; ['reflejos','instinto'].forEach(id=>m.owned.add(id));
ok(Object.keys(SKILLS).length===153, '153 opciones disponibles en fase 1');
let changed=true;while(changed){changed=false;for(const id in SKILLS)if(!m.has(id)&&!m.canBuy(id,Game.player.xp)){Game.buySkill(id);changed=true;}}
ok(m.owned.size===149,'Se completa toda la red compatible y se elige un dorado por tramo');
ok(!Trees.lost(m,'plena')&&!Trees.lost(m,'forma'),'No se pierden disciplinas por compras tempranas');
ok(m.mod('gun')>0&&m.mod('eregen')>0&&Game.player.maxHp>60,'Las mejoras modifican estadísticas reales');
Game.player.hp=10;Game.player.energy=Game.player.maxEnergy;Game.mut.cd={};Game.castSkill('sutura');ok(Game.player.hp>=40,'Sutura cura realmente');
Game.player.energy=Game.player.maxEnergy;Game.mut.cd={};Game.castSkill('instinto');ok(Math.abs(Game.mut.cd.instinto-SKILLS.instinto.cd*.8)<.001,'Maestría Sinapsis reduce la recarga');
UI=X.UI;UI.renderTree(Game);ok(true,'La red Humano/Mutante se renderiza');
console.log(fails ? '\nFALLOS: ' + fails : '\nTODAS LAS COMPROBACIONES OK');process.exitCode=fails?1:0;
