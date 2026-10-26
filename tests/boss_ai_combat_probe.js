// Escenarios de motor: cuatro arenas y controladores que responden a avisos visibles.
// El equipo se prepara antes del combate; jamás se fuerza daño, fases o victoria.
const fs=require('node:fs'),path=require('node:path');
const {X,run}=require('./harness');
if(run('typeof BossIntelligence')==='undefined')run(fs.readFileSync(path.join(__dirname,'../js/boss-intelligence.js'),'utf8'));
const g=X.Game;g.init();g.render=()=>{};
const results={};
const scenarios=[
 {level:'hospitalchem',controller:'final_controller.js',ammo:80,armor:false,heals:0},
 {level:'hospitalnest',controller:'depths_controller.js',ammo:180,armor:true,heals:4},
 {level:'hospitalroyal',controller:'castle_controller.js',ammo:180,armor:false,heals:4},
 {level:'hospitalorigin',controller:'endgame_controller.js',ammo:180,armor:false,heals:4},
];
for(const s of scenarios){
 run(`Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';FirstPerson.setEnabled(false);Game.keys={};Game.mouse.down=Game.mouse.clicked=Game.mouse.rclick=false;Game.temporalField=null;`);
 if(s.level==='hospitalchem')run('FinalEncounter.land(Game)');else{g.pz['h:boss']=true;g.killed.add(900);X.Hospital.goto(g,s.level);}
 run(`Game.inv=new Inventory();for(let i=0;i<4;i++)Game.inv.expand();Game.player.weapons={};Game.player.weapon=null;Game.giveWeapon('pistol',${s.ammo},true);Game.player.weapon=Game.player.weapons.pistol;for(let i=0;i<${s.heals};i++)Game.inv.add('inj_green');Game.player.hp=Game.player.maxHp=100;Game.player.stamina=Game.player.maxStamina=100;Game.player.energy=Game.player.maxEnergy;Game.player.poison=Game.player.resist=Game.player.invuln=0;Game.player.mods={mag:0,pow:0,prec:0,rate:0,mask:0};Game.mut.owned=new Set(['core']);Game.mut.bindings={};Workshop.ensure(Game).levels={};ProtectionSuit.data(Game).owned=${s.armor};ProtectionSuit.data(Game).hp=${s.armor?90:0};ProtectionSuit.data(Game).levels={protection:0,durability:0,poison:0};`);
 if(s.level==='hospitalnest')run('Game.player.x=31.5*32;Game.player.y=33.5*32;Depths.begin(Game)');
 if(s.level==='hospitalroyal')run('Game.player.x=24.5*32;Game.player.y=29.5*32;Castle.beginRoyal(Game)');
 if(s.level==='hospitalorigin')run('Game.player.x=29.5*32;Game.player.y=39.5*32;Game.inv.keys.push(...Endgame.samples);Endgame.begin(Game)');
 const result=JSON.parse(JSON.stringify(run(fs.readFileSync(path.join(__dirname,s.controller),'utf8'))));
 result.brain={decisions:g.boss.biDecisions,last:g.boss.biLast,reason:g.boss.biReason};results[s.level]=result;
 console.log('BOSS_AI_COMBAT',s.level,JSON.stringify(result));
}
fs.writeFileSync(path.join(__dirname,'../artifacts/boss-ai-combat-results.json'),JSON.stringify({version:require('../package.json').version,scenarios,results,scope:'Motor headless con controladores que conocen los avisos y equipo M9 finito preparado; movimiento, estamina, recarga y daño son reales. No es una campaña humana ni render WebGL.'},null,2)+'\n');
if(Object.values(results).some(r=>!(r.won||r.dead)||r.hp<=0))process.exitCode=1;
