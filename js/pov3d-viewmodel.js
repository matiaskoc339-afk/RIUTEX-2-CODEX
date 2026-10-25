// Manos y arma en una segunda escena 3D: dos extremidades, agarres y materiales físicos.
const POV3DViewmodel={
  cache:new Map(),ready:false,
  init(core){
    if(this.ready)return;const T=THREE,base=core.kitAPI,C=POVCharacterArt.init(base),k={...base,sphere:(...a)=>C.volume(...a),box:(...a)=>C.box(...a),rod:(...a)=>C.rod(...a),cylinder:(...a)=>C.cylinder(...a)};this.k=k;
    this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(58,innerWidth/innerHeight,.015,12);
    this.scene.add(new T.HemisphereLight('#c4d3df','#242028',.88));const light=new T.DirectionalLight('#f4ddc4',1.35);light.position.set(-1,2,1);this.scene.add(light);
    this.weaponRoot=new T.Group();this.scene.add(this.weaponRoot);
    this.skin=C.material(k.mat('#b8977f',.96),'skin'),this.skinShadow=C.material(k.mat('#a78c77',.96),'skin'),this.knuckle=C.material(k.mat('#c3a38d',.96),'skin'),this.blue=C.material(k.mat('#577a89',.96),'mutant'),this.blueDark=C.material(k.mat('#496774',.96),'mutant'),this.blueKnuckle=C.material(k.mat('#6d929d',.96),'mutant'),this.sleeve=C.material(k.mat('#303d40',.98),'cloth'),this.vein=C.material(k.mat('#729ca5',.96),'mutant'),this.bone=C.material(k.mat('#bdc4b6',.96),'metal');
    this.arms=[this.hand(1),this.hand(-1)];for(const a of this.arms)this.scene.add(a.root);
    this.ready=true;
  },
  hand(side){
    const T=THREE,k=this.k,root=new T.Group(),palm=new T.Group(),veins=new T.Group(),claws=new T.Group(),gripDigits=new T.Group(),fistDigits=new T.Group();root.add(palm);palm.add(veins,claws,gripDigits,fistDigits);
    const parts=[],add=(mesh,tone='skin')=>(mesh.userData.handTone=tone,parts.push(mesh),mesh);
    // Palma tallada, arco del pulgar y dedos biselados: textura y planos en vez de piezas esféricas.
    add(POVCharacterArt.loft(palm,[[-.055,.03,.018],[-.025,.041,.024],[.022,.044,.025],[.051,.036,.018]],this.skin));add(k.sphere(palm,-.031,-.012,.008,.018,.03,.021,this.skin));
    for(let i=0;i<4;i++){
      const y=.055-i*.024;
      add(k.rod(gripDigits,[-.035,y,.022],[.012,y-.003,.043],.0115,this.skin));
      add(k.box(gripDigits,-.024,y,.028,.026,.024,.028,this.knuckle),'knuckle');
      add(k.sphere(gripDigits,.012,y-.003,.043,.0105,.0105,.011,this.skin));
      add(k.rod(gripDigits,[.012,y-.003,.043],[.03,y-.013,.02],.0105,this.skin));
      add(k.sphere(gripDigits,.03,y-.013,.02,.011,.011,.013,this.skin));
      // El puño coloca los cuatro nudillos sobre la palma, en vez de apilar tubos.
      const x=-.035+i*.023,yTop=.058-Math.abs(i-1.35)*.004;
      add(k.box(fistDigits,x,yTop-.004,.011,.025,.027,.036,this.knuckle),'knuckle');
      add(k.sphere(fistDigits,x,yTop-.027,.034,.013,.020,.018,this.skin));
      add(k.sphere(fistDigits,x,yTop-.043,.017,.012,.013,.014,this.skin));
    }
    add(k.rod(gripDigits,[-.044,.006,.017],[-.056,.034,.036],.014,this.skin));add(k.sphere(gripDigits,-.056,.034,.036,.015,.016,.016,this.knuckle),'knuckle');
    add(k.rod(gripDigits,[-.056,.034,.036],[-.025,.057,.038],.012,this.skin));add(k.sphere(gripDigits,-.025,.057,.038,.013,.013,.014,this.skin));
    add(k.rod(fistDigits,[-.038,-.008,.035],[-.026,.018,.06],.015,this.skin));add(k.sphere(fistDigits,-.026,.018,.06,.016,.016,.014,this.knuckle),'knuckle');
    add(k.rod(fistDigits,[-.026,.018,.06],[.005,.025,.055],.013,this.skin));add(k.sphere(fistDigits,.005,.025,.055,.014,.013,.012,this.skin));
    k.box(veins,-.008,-.019,.025,.002,.037,.001,this.vein);const branch=k.box(veins,.006,.009,.025,.002,.028,.001,this.vein);branch.rotation.z=-.5;
    for(let i=0;i<3;i++){const spike=k.cylinder(claws,-.026+i*.027,.15+i*.008,-.012,0,.008,.2,this.bone,10);spike.rotation.x=-.24;}
    const forearm=k.cylinder(root,0,0,0,.031,.049,1,this.skin,8),sleeve=k.cylinder(root,0,0,0,.058,.074,1,this.sleeve,8),veinRod=new T.Group();root.add(veinRod);
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
    this.weaponRoot.position.set(.235+bob,-.32-strike*.28-(reload?.15:0)-(p.flash>0?.025:0),-1.11+(p.flash>0?.04:0));this.weaponRoot.rotation.set(reload?-.25:.13,reload?-.18:.13,reload?-.26:0);this.weaponRoot.updateMatrixWorld(true);
    const contact=(x,y,z)=>new THREE.Vector3(x*.0038,y*.0038,-z*.0038).applyMatrix4(this.weaponRoot.matrixWorld);
    let right=id?contact(18,-35,-30):new THREE.Vector3(.30,-.43,-.87),left=id?contact(-17,['pistol','viper'].includes(id)?-29:-12,['pistol','viper'].includes(id)?-28:74):new THREE.Vector3(-.30,-.45,-.86);
    if(s.strike)left.lerp(new THREE.Vector3(-.015,-.07,-1.18),strike);
    for(const a of this.arms){
      if(!a.root.visible)continue;const isLeft=a.side<0,infected=isLeft?s.infected:s.terminal,position=isLeft?left:right;
      a.palm.position.copy(position);a.palm.rotation.set(isLeft&&s.strike?-.2-strike*.3:id?.12:.5,isLeft?.4:-.45,isLeft?-.1:.12);a.palm.scale.x=isLeft?-1:1;
      a.gripDigits.visible=!!id&&!(isLeft&&s.strike);a.fistDigits.visible=!a.gripDigits.visible;
      for(const part of a.parts)part.material=part.userData.handTone==='knuckle'?(infected?this.blueKnuckle:this.knuckle):(infected?this.blue:this.skin);
      a.forearm.material=infected?this.blueDark:this.skinShadow;a.veins.visible=infected;a.claws.visible=s.blade&&(isLeft||s.predator);a.veinRod.visible=infected;
      const shoulder=[isLeft?-.54:.57,-.93,-.31],elbow=[isLeft?-.24:.40,-.74,-.58],wrist=[position.x,position.y-.045,position.z];
      this.segment(a.sleeve,shoulder,elbow);this.segment(a.forearm,elbow,wrist);this.segment(a.veinRod,[elbow[0]-.025,elbow[1],elbow[2]+.04],[wrist[0]-.015,wrist[1],wrist[2]+.027]);
    }
    core.renderer.clearDepth();core.renderer.render(this.scene,this.camera);
    core.stats.hands=this.arms.filter(a=>a.root.visible).length;core.stats.weapon3D=id;core.stats.armInfected=s.infected;
  }
};
