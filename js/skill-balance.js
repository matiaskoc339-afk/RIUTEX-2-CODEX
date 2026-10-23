// v0.15 · Mejoras perceptibles, con incrementos menores en los bonos más potentes.
// Solo T2: no cambia costes, conexiones, elecciones doradas ni identificadores guardados.
const SkillBalance = {
  applied: false, audit: [],
  fractions: new Set(['gun','reload','speed','stam','eregen','melee','effort','melee_effort','xp']),
  steps: {'.025':.04,'.04':.06,'.045':.06,'.05':.07,'.06':.08,'.08':.12,'.1':.14,'.12':.16,'.15':.20,'.2':.25,'.3':.36},
  values: {sigilo:.58,chaleco:.75,medico:.6,adrenalina:.55,sombra:1/.55,sangrefria:1.7,piel:.7,
    blue_vital_7:.65,blue_flow_7:.86,blue_force_7:1.26,blue_neural_7:.8,blue_aim_7:1.32,blue_ghost_7:.68,
    paso_ligero:.30,coraza:.55,recuperacion_tactica:1.4,gold_catalyst:.84,gold_evolution:1.6,
    suspension:.22,shadow_step:.68,predator_speed:1.26,predator_armor:.7,disparo_sereno:1.2,
    cambio_guardia:.75,brazo:1.32,fuerza:1.32},
  value(g, id, legacy) { return isR2lvl(g?.lvl) ? this.values[id] ?? legacy : legacy; },
  upgrade(n) { return this.steps[String(n).replace(/^0\./,'.')] ?? Number((n+Math.min(.06,n*.25)).toFixed(3)); },
  apply() {
    if(this.applied)return;this.applied=true;
    for(const [id,s] of Object.entries(T2)) {
      const percent={};
      for(const [key,before] of Object.entries(s.mod||{})) {
        if(this.fractions.has(key)&&before>0) {
          const after=this.upgrade(before);s.mod[key]=after;percent[Math.round(before*100)]=Math.round(after*100);
          this.audit.push({id,key,before,after});
        } else if(key==='en'&&before>0&&before<=10) {
          const after=before===8?12:14;s.mod[key]=after;
          s.desc=s.desc.replace(new RegExp('([+]?)'+before+'(?= de (?:energía|Riutex|reserva))'), '$1'+after);
          this.audit.push({id,key,before,after});
        }
      }
      s.desc=s.desc.replace(/(\d+)(\s*%)/g,(all,n,end)=>percent[n]===undefined?all:percent[n]+end);
    }
    const changes={sigilo:{35:42},chaleco:{20:25},medico:{50:60},adrenalina:{40:45},sombra:{40:45},
      sangrefria:{60:70},plena:{70:75},fuerza:{25:32},piel:{25:30},brazo:{25:32},blue_aim_7:{25:32},
      blue_vital_7:{60:65},blue_ghost_7:{25:32},blue_force_7:{20:26},blue_neural_7:{15:20},blue_flow_7:{10:14},
      recuperacion_tactica:{35:42},paso_ligero:{65:70},coraza:{40:45},gold_catalyst:{12:16},gold_evolution:{50:60},
      shadow_step:{25:32},disparo_sereno:{30:36},suspension:{75:78},forma_acechador:{20:26,25:30},
      runner_stride:{8:12},segundo_aliento:{24:30,25:32},cambio_guardia:{20:25}};
    for(const [id,values] of Object.entries(changes)) {
      const s=T2[id];if(!s)throw new Error('Habilidad ausente: '+id);
      s.desc=s.desc.replace(/(\d+)(\s*%)/g,(all,n,end)=>values[n]===undefined?all:values[n]+end);
    }
    // Eficiencia es un divisor del coste, no una reducción porcentual directa.
    T2.gun_support.desc='+12 % de eficiencia al disparar, antes de otros ajustes.';
    T2.echo_tissue.desc='+6 de salud y +14 % de eficiencia de los golpes Riutex.';
  }
};
SkillBalance.apply();
