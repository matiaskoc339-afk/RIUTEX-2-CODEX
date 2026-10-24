// Manos y arma en una segunda escena 3D: dos extremidades, agarres y materiales físicos.
const POV3DViewmodel={
  cache:new Map(),ready:false,
  init(core){
    if(this.ready)return;const T=THREE,k=core.kitAPI;this.k=k;
    this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(58,innerWidth/innerHeight,.015,12);
    this.scene.add(new T.HemisphereLight('#c4d3df','#242028',.88));const light=new T.DirectionalLight('#f4ddc4',1.35);light.position.set(-1,2,1);this.scene.add(light);
    this.weaponRoot=new T.Group();this.scene.add(this.weaponRoot);
    this.skin=k.mat('#bd9679',.76),this.skinShadow=k.mat('#8e6d58',.82),this.knuckle=k.mat('#c5a28a',.78),this.blue=k.mat('#638da9',.72),this.blueDark=k.mat('#35566e',.79),this.blueKnuckle=k.mat('#789aaf',.74),this.sleeve=k.mat('#27363d',.88),this.vein=k.mat('#3c91bd',.58,0,'#174765'),this.bone=k.mat('#bed0d2',.57);
    this.arms=[this.hand(1),this.hand(-1)];for(const a of this.arms)this.scene.add(a.root);
    this.ready=true;
  },
  hand(side){
    const T=THREE,k=this.k,root=new T.Group(),palm=new T.Group(),veins=new T.Group(),claws=new T.Group(),gripDigits=new T.Group(),fistDigits=new T.Group();root.add(palm);palm.add(veins,claws,gripDigits,fistDigits);
    const parts=[],add=(mesh,tone='skin')=>(mesh.userData.handTone=tone,parts.push(mesh),mesh);
    // La base de la mano es continua y los dedos terminan en almohadillas redondas.
    add(k.sphere(palm,0,.004,0,.047,.062,.028,this.skin));add(k.sphere(palm,-.032,-.009,.012,.026,.041,.027,this.skin));
    for(let i=0;i<4;i++){
      const y=.055-i*.024;
      add(k.rod(gripDigits,[-.035,y,.022],[.012,y-.003,.043],.0115,this.skin));
      add(k.sphere(gripDigits,-.024,y,.028,.015,.014,.016,this.knuckle),'knuckle');
      add(k.sphere(gripDigits,.012,y-.003,.043,.012,.012,.012,this.skin));
      add(k.rod(gripDigits,[.012,y-.003,.043],[.03,y-.013,.02],.0105,this.skin));
      add(k.sphere(gripDigits,.03,y-.013,.02,.011,.011,.013,this.skin));
      // El puño coloca los cuatro nudillos sobre la palma, en vez de apilar tubos.
      const x=-.035+i*.023,yTop=.058-Math.abs(i-1.35)*.004;
      add(k.sphere(fistDigits,x,yTop-.004,.011,.014,.017,.024,this.knuckle),'knuckle');
      add(k.sphere(fistDigits,x,yTop-.027,.034,.013,.020,.018,this.skin));
      add(k.sphere(fistDigits,x,yTop-.043,.017,.012,.013,.014,this.skin));
    }
    add(k.rod(gripDigits,[-.044,.006,.017],[-.056,.034,.036],.014,this.skin));add(k.sphere(gripDigits,-.056,.034,.036,.015,.016,.016,this.knuckle),'knuckle');
    add(k.rod(gripDigits,[-.056,.034,.036],[-.025,.057,.038],.012,this.skin));add(k.sphere(gripDigits,-.025,.057,.038,.013,.013,.014,this.skin));
    add(k.rod(fistDigits,[-.038,-.008,.035],[-.026,.018,.06],.015,this.skin));add(k.sphere(fistDigits,-.026,.018,.06,.016,.016,.014,this.knuckle),'knuckle');
    add(k.rod(fistDigits,[-.026,.018,.06],[.005,.025,.055],.013,this.skin));add(k.sphere(fistDigits,.005,.025,.055,.014,.013,.012,this.skin));
    k.rod(veins,[-.007,-.047,.028],[.004,.018,.028],.0026,this.vein);k.rod(veins,[.004,.018,.028],[.027,.05,.025],.0019,this.vein);k.rod(veins,[.004,.018,.028],[-.024,.038,.026],.0018,this.vein);
    for(let i=0;i<3;i++){const spike=k.cylinder(claws,-.026+i*.027,.15+i*.008,-.012,0,.008,.2,this.bone,10);spike.rotation.x=-.24;}
    const forearm=k.cylinder(root,0,0,0,.035,.057,1,this.skin,16),sleeve=k.cylinder(root,0,0,0,.065,.09,1,this.sleeve,16),veinRod=k.cylinder(root,0,0,0,.0027,.0027,1,this.vein,6);
    root.userData.side=side;return {root,palm,parts,forearm,sleeve,veins,claws,veinRod,gripDigits,fistDigits,side};
  },
  segment(mesh,a,b,r1=1){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);mesh.position.copy(av.add(bv).multiplyScalar(.5));mesh.scale.y=d.length();mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());},
  weapon(id){
    if(this.cache.has(id))return this.cache.get(id);
    const muzzle=POVViewmodel.gun(id),positions=[],colors=[];
    for(const face of POVViewmodel.faces){const color=new THREE.Color(face.base);for(let i=1;i<face.v.length-1;i++)for(const v of [face.v[0],face.v[i+1],face.v[i]]){positions.push(v[0]*.0038,v[1]*.0038,-v[2]*.0038);colors.push(color.r,color.g,color.b);}}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.24,side:THREE.DoubleSide}),mesh=new THREE.Mesh(geometry,material),root=new THREE.Group();root.add(mesh);root.userData.muzzle=new THREE.Vector3(muzzle[0]*.0038,muzzle[1]*.0038,-muzzle[2]*.0038);root.userData.weaponId=id;this.cache.set(id,root);return root;
  },
  render(core,g,time,dt){
    this.init(core);const p=g.player,s=POVViewmodel.state(g),id=s.predator?'':p.weapon?.id||'';
    this.camera.aspect=core.width/core.height;this.camera.updateProjectionMatrix();
    const shown=g.state==='play'&&!p.hidden&&!g.collapse;this.weaponRoot.visible=shown;for(const a of this.arms)a.root.visible=shown&&(a.side>0||!s.missing);if(!shown)return;
    if(id!==this.id){this.weaponRoot.clear();this.weaponMesh=id?this.weapon(id):null;if(this.weaponMesh)this.weaponRoot.add(this.weaponMesh);this.id=id;}
    const progress=s.strike?THREE.MathUtils.clamp(1-p.slash/.15,0,1):0,strike=s.strike?Math.sin(progress*Math.PI):0,bob=MenuScene.motionReduced()?0:Math.sin(p.walkT||time*.8)*(p.running?.009:.003),reload=p.reloading>0;
    this.weaponRoot.position.set(.31+bob,-.36-strike*.28-(reload?.15:0)-(p.flash>0?.025:0),-1.14+(p.flash>0?.04:0));this.weaponRoot.rotation.set(reload?-.25:.14,reload?-.18:.18,reload?-.26:0);this.weaponRoot.updateMatrixWorld(true);
    const contact=(x,y,z)=>new THREE.Vector3(x*.0038,y*.0038,-z*.0038).applyMatrix4(this.weaponRoot.matrixWorld);
    let right=id?contact(14,-34,-28):new THREE.Vector3(.32,-.41,-.84),left=id?contact(-9,-9,['pistol','viper'].includes(id)?-15:70):new THREE.Vector3(-.32,-.43,-.82);
    if(s.strike)left.lerp(new THREE.Vector3(-.015,-.07,-1.18),strike);
    for(const a of this.arms){
      if(!a.root.visible)continue;const isLeft=a.side<0,infected=isLeft?s.infected:s.terminal,position=isLeft?left:right;
      a.palm.position.copy(position);a.palm.rotation.set(isLeft&&s.strike?-.2-strike*.3:id?.12:.5,isLeft?.4:-.45,isLeft?-.1:.12);a.palm.scale.x=isLeft?-1:1;
      a.gripDigits.visible=!!id&&!(isLeft&&s.strike);a.fistDigits.visible=!a.gripDigits.visible;
      for(const part of a.parts)part.material=part.userData.handTone==='knuckle'?(infected?this.blueKnuckle:this.knuckle):(infected?this.blue:this.skin);
      a.forearm.material=infected?this.blueDark:this.skinShadow;a.veins.visible=infected;a.claws.visible=s.blade&&(isLeft||s.predator);a.veinRod.visible=infected;
      const shoulder=[isLeft?-.63:.67,-.82,-.46],elbow=[isLeft?-.40:.43,-.58,-.68],wrist=[position.x,position.y-.045,position.z];
      this.segment(a.sleeve,shoulder,elbow);this.segment(a.forearm,elbow,wrist);this.segment(a.veinRod,[elbow[0]-.025,elbow[1],elbow[2]+.04],[wrist[0]-.015,wrist[1],wrist[2]+.027]);
    }
    core.renderer.clearDepth();core.renderer.render(this.scene,this.camera);
    core.stats.hands=this.arms.filter(a=>a.root.visible).length;core.stats.weapon3D=id;core.stats.armInfected=s.infected;
  }
};
