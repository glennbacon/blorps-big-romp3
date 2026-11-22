/* ================= effects: flying bits, weather, rings, pop-ups ================= */
/* Everything here is looks. Nothing in it is read by the rules of the game, so the checks in tools/ can run without it. */

/* ---------- flying bits ---------- */
/* Up to FX_MAX little boxes in the air at once, drawn as two meshes however many there are: one for bits that are lit
   like everything else, one for bits that glow. A bit has a place, a speed, a weight, a life, and a size that can swell
   or shrink as it ages; `flat` makes it a flake instead of a cube. */
const FX_MAX=420, PARTS=[];
const fxCube=voxGeo([[-0.5,-0.5,-0.5,1,1,1,WHITE]],1);
/* materials of their own: three.js builds one shader for a material that is drawn with a colour for each copy and another
   for one that is not, and must never be asked to use the wrong one */
const fxLit=new T.InstancedMesh(fxCube,voxMat(),FX_MAX), fxGlow=new T.InstancedMesh(fxCube,new T.MeshBasicMaterial({vertexColors:true,opacity:0}),FX_MAX);
/* The colours are asked for here, while the mesh still counts every bit it can hold: three.js makes room for as many
   colours as the mesh counts at the first asking, and a mesh that counted none would get none, and draw nothing. */
for(const m of [fxLit,fxGlow]){ m.setColorAt(0,new T.Color(1,1,1)); m.frustumCulled=false; m.count=0; fx.add(m); }
fxLit.castShadow=true;
function spawnPart(x,y,z,col,vx,vy,vz,life,size,grav,glow,o){
  let p=null; for(const q of PARTS) if(q.life<=0){ p=q; break; }
  if(!p){ if(PARTS.length>=FX_MAX) return null; p={life:0}; PARTS.push(p); }
  p.x=x; p.y=y; p.z=z; p.col=col; p.vx=vx; p.vy=vy; p.vz=vz; p.life=life; p.max=life; p.size=size; p.grav=grav===undefined?30:grav; p.glow=!!glow;
  p.grow=o&&o.grow||1; p.flat=o&&o.flat||0; p.drag=o&&o.drag||0; p.spin=o&&o.spin!==undefined?o.spin:8; p.rot=Math.random()*6.283;
  return p;
}
function burst(x,y,col,n,spd,size,life,glow){
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, s=(spd||5)*(0.4+Math.random()*0.6);
    spawnPart(x,y,(Math.random()-0.5)*0.6,col,Math.cos(a)*s,Math.abs(Math.sin(a))*s+1.5,(Math.random()-0.5)*3,(life||0.5)*(0.6+Math.random()*0.6),(size||0.14)*(0.7+Math.random()*0.6),undefined,glow); }
}
/* a low puff of dust that drifts and settles: landing, skidding, sliding down a wall */
function dust(x,y,n,dir,col){
  for(let i=0;i<n;i++) spawnPart(x+(Math.random()-0.5)*0.4,y+0.08+Math.random()*0.1,0.3+Math.random()*0.5,col||TH.dust||'#ffffff',(dir||0)*(1+Math.random()*1.5)+(Math.random()-0.5)*1.6,0.6+Math.random()*1.4,(Math.random()-0.5)*1.2,0.4+Math.random()*0.3,0.14+Math.random()*0.11,3,false,{grow:2,drag:2.5,spin:2});
}
/* a spray thrown up and out, for water and for a ground pound */
function spray(x,y,col,n,spd,glow){
  for(let i=0;i<n;i++){ const a=(Math.random()-0.5)*2.2; spawnPart(x+(Math.random()-0.5)*0.5,y,(Math.random()-0.5)*0.8,col,Math.sin(a)*spd*(0.4+Math.random()*0.6),Math.cos(a)*spd*(0.5+Math.random()*0.7),(Math.random()-0.5)*2,0.45+Math.random()*0.35,0.09+Math.random()*0.09,22,glow); }
}
/* motes of light that drift outward and wink out: a pick-up, a power-up, anything precious */
function sparkle(x,y,col,n,spd,size){
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, s=(spd||2.2)*(0.3+Math.random()*0.7);
    spawnPart(x+(Math.random()-0.5)*0.3,y+(Math.random()-0.5)*0.3,0.2+Math.random()*0.5,col,Math.cos(a)*s,Math.sin(a)*s,(Math.random()-0.5),0.45+Math.random()*0.5,(size||0.1)*(0.6+Math.random()*0.8),-1.2,true,{drag:2.2,spin:3}); }
}
/* a soft cloud that rises and thins: smoke, steam, a monster going up in a poof */
function puff(x,y,col,n,size,rise){
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, s=0.6+Math.random()*1.4;
    spawnPart(x+(Math.random()-0.5)*0.4,y+(Math.random()-0.5)*0.3,0.2+Math.random()*0.5,col,Math.cos(a)*s,Math.sin(a)*s*0.6+(rise||0.8),(Math.random()-0.5)*1.2,0.4+Math.random()*0.35,(size||0.2)*(0.7+Math.random()*0.5),-1.5,false,{grow:2.2,drag:3,spin:1.5}); }
}
/* paper flakes of every colour that flutter down: a flag reached, a boss beaten */
const CONFETTI=['#ffe14d','#ff4f7b','#2fd6c3','#b58cff','#ffffff','#ff9a3d','#7dffb0'];
function confetti(x,y,n,spd){
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, s=(spd||6)*(0.3+Math.random()*0.7);
    spawnPart(x,y,(Math.random()-0.5)*0.8,CONFETTI[(Math.random()*CONFETTI.length)|0],Math.cos(a)*s,Math.abs(Math.sin(a))*s+2,(Math.random()-0.5)*4,1.1+Math.random()*0.9,0.13+Math.random()*0.08,9,false,{flat:1,drag:1.6,spin:14}); }
}
/* a mark left hanging in the air for a moment: behind a dash, a star-powered Blorp, a shooting thing */
function trail(x,y,col,size,life){ spawnPart(x,y,0.1,col,0,0,0,life||0.28,size||0.3,0,true,{spin:0}); }

/* ---------- rings ---------- */
/* a ring that spreads along the ground, or with `up`, stands facing the camera */
const RINGS=[], ringGeo=new T.RingGeometry(0.76,1,32);
function ring(x,y,col,size,life,up){
  let r=null; for(const q of RINGS) if(q.t>=q.life){ r=q; break; }
  if(!r){ if(RINGS.length>=12) return; const m=new T.Mesh(ringGeo,new T.MeshBasicMaterial({transparent:true,depthWrite:false,side:T.DoubleSide})); fx.add(m); r={mesh:m,t:1,life:1}; RINGS.push(r); }
  r.mesh.material.color.set(col); r.mesh.rotation.x=up?0:-Math.PI/2; r.mesh.position.set(x,y+(up?0:0.06),up?0.6:0.2); r.mesh.visible=true; r.t=0; r.life=life||0.4; r.size=size||2.4;
}

/* ---------- words and numbers that float up ---------- */
const POPS=[], popTexCache={};
function popTex(txt,col){
  const k=txt+col; if(popTexCache[k]) return popTexCache[k];
  const c=document.createElement('canvas'); c.width=256; c.height=64; const g=c.getContext('2d');
  g.font='700 46px "Jersey 20","Pixelify Sans","Trebuchet MS",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
  g.lineWidth=10; g.strokeStyle=INK; g.strokeText(txt,128,34); g.fillStyle=col; g.fillText(txt,128,34);
  const t=new T.CanvasTexture(c); return popTexCache[k]=t;
}
function popup(x,y,txt,col){
  let s=null; for(const q of POPS) if(q.life<=0){ s=q; break; }
  if(!s){ if(POPS.length>=14) return; const sp=new T.Sprite(new T.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false})); sp.renderOrder=10; fx.add(sp); s={sp,life:0}; POPS.push(s); }
  s.sp.material.map=popTex(txt,col||WHITE); s.sp.material.needsUpdate=true; s.sp.visible=true; s.sp.position.set(x,y,1.3); s.sp.scale.set(3.4,0.85,1); s.life=0.9;
}
const CPOPS=[];
function coinPop(x,y){
  let c=null; for(const q of CPOPS) if(q.t<0){ c=q; break; }
  if(!c){ if(CPOPS.length>=14) return; c={mesh:new T.Mesh(geo('coin',mCoin,0.1),MAT.coin),t:-1}; fx.add(c.mesh); CPOPS.push(c); }
  c.t=0; c.x=x; c.y=y; c.mesh.visible=true;
}
function shake(a){ shakeT=0.22; shakeA=Math.max(a,shakeT>0?shakeA*0.5:0); }
function flash(a){ POST.flash=Math.max(POST.flash,reduceMotion?a*0.3:a); }
/* a jolt that splits the colours at the edges of the screen for a moment */
function jolt(a){ if(!reduceMotion) POST.ca=Math.max(POST.ca,a||0.012); }
function clearFx(){
  for(const p of PARTS) p.life=0; fxLit.count=0; fxGlow.count=0;
  for(const s of POPS){ s.life=0; s.sp.visible=false; }
  for(const c of CPOPS){ c.t=-1; c.mesh.visible=false; }
  for(const r of RINGS){ r.t=r.life; r.mesh.visible=false; }
}
/* one frame of all of the above. The map uses them too. */
const _fd=new T.Object3D(), _fc=new T.Color();
function animFx(dt){
  let nl=0, ng=0;
  for(const p of PARTS){ if(p.life<=0) continue; p.life-=dt; if(p.life<=0) continue;
    p.vy-=p.grav*dt; if(p.drag){ const k=Math.max(0,1-p.drag*dt); p.vx*=k; p.vy*=k; p.vz*=k; }
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; p.rot+=p.spin*dt;
    const u=1-p.life/p.max, s=p.size*(1+(p.grow-1)*u)*Math.min(1,p.life/p.max*(p.grow>1?3:2));
    _fd.position.set(p.x,p.y,p.z); _fd.rotation.set(p.rot,p.flat?p.rot*0.7:0,p.rot*0.75); _fd.scale.set(s,p.flat?s*0.12:s,s); _fd.updateMatrix();
    const m=p.glow?fxGlow:fxLit, i=p.glow?ng++:nl++; m.setMatrixAt(i,_fd.matrix); m.setColorAt(i,_fc.set(p.col)); }
  fxLit.count=nl; fxGlow.count=ng;
  for(const m of [fxLit,fxGlow]){ m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; }
  for(const r of RINGS){ if(r.t>=r.life) continue; r.t+=dt; if(r.t>=r.life){ r.mesh.visible=false; continue; } const u=r.t/r.life; r.mesh.scale.setScalar(0.3+u*r.size); r.mesh.material.opacity=(1-u*u)*0.9; }
  for(const s of POPS){ if(s.life<=0) continue; s.life-=dt; if(s.life<=0){ s.sp.visible=false; continue; } s.sp.position.y+=dt*1.5; s.sp.material.opacity=Math.min(1,s.life*4); }
  for(const c of CPOPS){ if(c.t<0) continue; c.t+=dt;
    if(c.t>0.55){ c.t=-1; c.mesh.visible=false; popup(c.x,c.y+1.1,'200','#ffe14d'); continue; }
    c.mesh.position.set(c.x,c.y+13*c.t-20*c.t*c.t,0); c.mesh.rotation.y=c.t*26; }
}

/* ---------- weather ---------- */
/* Petals, leaves, snow, rain, embers, fireflies, bubbles, dust: a few hundred flat flakes that the graphics card moves
   by itself. Each has a random place in a box; the box follows the camera and the flakes wrap round inside it, so
   there is weather wherever Blorp goes and none is ever made or thrown away. A kind is only a set of numbers:
     n how many, size [w,h] in tiles, vel [x,y,z] tiles a second, sway [across, in-and-out, how fast], spin turns it as it
     falls, tilt leans it instead (rain), cols its colours, glow makes each a light, twinkle makes them wink, op below
     one makes them see-through, box the space they fill, z where that space sits (0 is the lane; more is nearer). */
const WEATHER={
  petal:{n:150,size:[0.2,0.14],vel:[-0.7,-1.1,0],sway:[0.7,0.3,1.1],spin:1.6,cols:['#ffc2dc','#ff9fc6','#ffe3ef','#ffffff']},
  leaf:{n:120,size:[0.24,0.16],vel:[-1.3,-1.5,0],sway:[0.9,0.4,1.3],spin:2.4,cols:['#ff9a3d','#ffc928','#e2542a','#c93d3d','#ffdd6b']},
  snow:{n:260,size:[0.11,0.11],vel:[-0.4,-1.6,0],sway:[0.5,0.3,0.9],spin:0.5,cols:['#ffffff','#e8f4ff']},
  rain:{n:420,size:[0.035,0.75],vel:[-5,-22,0],sway:[0,0,0],spin:0,tilt:-0.22,cols:['#bcd9ff','#9fc4f5','#d9ecff'],op:0.55},
  ember:{n:110,size:[0.09,0.09],vel:[0.3,1.3,0],sway:[0.5,0.3,1.7],spin:1,cols:['#ff7a1f','#ffb02e','#ffe14d'],glow:1,twinkle:3},
  firefly:{n:70,size:[0.1,0.1],vel:[0.12,0.05,0],sway:[1.3,0.9,0.5],spin:0,cols:['#d9ff6a','#fff3a0','#b6ff6a'],glow:1,twinkle:1.6},
  bubble:{n:90,size:[0.14,0.14],vel:[0,1.1,0],sway:[0.25,0.15,1.6],spin:0,cols:['#e6fdff','#bfeaff'],op:0.6},
  dust:{n:90,size:[0.06,0.06],vel:[0.15,-0.05,0],sway:[0.5,0.4,0.4],spin:0.4,cols:['#ffffff','#fff3c9'],op:0.7},
  spore:{n:90,size:[0.09,0.09],vel:[0.1,0.25,0],sway:[0.6,0.4,0.6],spin:0.5,cols:['#7dfff0','#b58cff','#ff9be0'],glow:1,twinkle:1.1},
  confetti:{n:160,size:[0.16,0.1],vel:[-0.3,-1.4,0],sway:[0.6,0.3,1.4],spin:3.2,cols:CONFETTI},
  star:{n:80,size:[0.08,0.08],vel:[0.05,0.02,0],sway:[0.2,0.2,0.3],spin:0,cols:['#ffffff','#fff3a0','#bfe0ff'],glow:1,twinkle:2.2},
  sand:{n:240,size:[0.5,0.035],vel:[-11,-0.6,0],sway:[0,0.2,1],spin:0,tilt:0.04,cols:['#ffe6a0','#f0cf85','#fff0c9'],op:0.5}
};
let weathers=[];
const weatherQuad=new T.PlaneGeometry(1,1);
function addWeather(kind,o){
  const K=Object.assign({box:[46,20,9],z:-2},WEATHER[kind]||WEATHER.dust,o||{}), n=K.n, R=rng(900+weathers.length*31+n);
  const g=tmpGeo(new T.InstancedBufferGeometry()); g.index=weatherQuad.index; g.setAttribute('position',weatherQuad.attributes.position);
  const seed=new Float32Array(n*4), col=new Float32Array(n*3);
  for(let i=0;i<n;i++){ seed[i*4]=R(); seed[i*4+1]=R(); seed[i*4+2]=R(); seed[i*4+3]=R(); _fc.set(K.cols[(R()*K.cols.length)|0]); col[i*3]=_fc.r; col[i*3+1]=_fc.g; col[i*3+2]=_fc.b; }
  g.setAttribute('aSeed',new T.InstancedBufferAttribute(seed,4)); g.setAttribute('aCol',new T.InstancedBufferAttribute(col,3)); g.instanceCount=n;
  const see=K.op!==undefined&&K.op<1, u=T.UniformsUtils.merge([T.UniformsLib.fog,{uCam:{value:new T.Vector3()},uBox:{value:new T.Vector3(K.box[0],K.box[1],K.box[2])},uVel:{value:new T.Vector3(K.vel[0],K.vel[1],K.vel[2])},
    uSize:{value:new T.Vector2(K.size[0],K.size[1])},uSway:{value:new T.Vector3(K.sway[0],K.sway[1],K.sway[2])},uSpin:{value:K.spin||0},uTilt:{value:K.tilt||0},uTwinkle:{value:K.twinkle||0},uZ0:{value:K.z},uGlow:{value:K.glow?1:0},uOp:{value:see?K.op:1}}]);
  u.uTime=uTime;
  const m=new T.ShaderMaterial({uniforms:u,fog:true,transparent:see,depthWrite:!see,side:T.DoubleSide,
    vertexShader:`attribute vec4 aSeed; attribute vec3 aCol; uniform float uTime,uSpin,uTilt,uTwinkle,uZ0; uniform vec3 uCam,uBox,uVel,uSway; uniform vec2 uSize; varying vec3 vCol; varying float vA;
#include <fog_pars_vertex>
void main(){ float t=uTime*(0.75+aSeed.w*0.5); vec3 p=aSeed.xyz*uBox+uVel*t;
  p.x+=sin(t*uSway.z+aSeed.w*40.0)*uSway.x; p.z+=cos(t*uSway.z*0.8+aSeed.x*30.0)*uSway.y; p.y+=sin(t*uSway.z*1.3+aSeed.y*20.0)*uSway.x*0.3;
  vec3 c0=vec3(uCam.x,uCam.y,uZ0)-uBox*0.5; p=mod(p-c0,uBox)+c0;
  vec2 q=position.xy*uSize; float a=uTilt, sh=1.0;
  if(uSpin>0.0){ a=t*uSpin+aSeed.w*6.283; sh=cos(a*1.7); q.x*=sh; }
  float cs=cos(a), sn=sin(a); q=vec2(q.x*cs-q.y*sn,q.x*sn+q.y*cs);
  vec4 mvPosition=viewMatrix*vec4(p,1.0); mvPosition.xy+=q; gl_Position=projectionMatrix*mvPosition;
  vCol=aCol*(0.82+0.18*abs(sh)); vA=uTwinkle>0.0?0.25+0.75*pow(abs(sin(t*uTwinkle+aSeed.w*50.0)),2.0):1.0;
#include <fog_vertex>
}`,
    fragmentShader:`uniform float uGlow,uOp; varying vec3 vCol; varying float vA;
#include <fog_pars_fragment>
void main(){ gl_FragColor=vec4(vCol*mix(1.0,vA,uGlow),uGlow>0.5?1.0-vA:uOp);
#include <fog_fragment>
}`});
  m.userData.tmp=true;
  const mesh=new T.Mesh(g,m); mesh.frustumCulled=false; mesh.renderOrder=4; world.add(mesh); weathers.push(mesh); return mesh;
}
/* the old way of asking for drifting specks, kept so a theme can still say only a colour and a count */
function addMotes(col,n,size,fall,glow){
  _fc.set(col); const c='#'+_fc.getHexString();
  motes=addWeather('dust',{n:n,size:[size*1.2,size*1.2],cols:[c],vel:[0.12,fall?-fall:0.02,0],glow:glow?1:0,twinkle:glow?1.4:0,op:glow?1:0.8,sway:[0.5,0.4,0.5]});
}
/* a slanting bar of light, as falls through leaves or deep water; it breathes a little */
const shaftMat=new T.ShaderMaterial({uniforms:{uTime},transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,
  vertexShader:'attribute vec4 aShaft; varying vec2 vUv; varying vec4 vS; void main(){ vUv=uv; vS=aShaft; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:'uniform float uTime; varying vec2 vUv; varying vec4 vS; void main(){ float a=sin(vUv.x*3.1416)*smoothstep(0.0,0.5,vUv.y)*smoothstep(1.0,0.75,vUv.y)*(0.7+0.3*sin(uTime*0.7+vS.a*40.0)); gl_FragColor=vec4(vS.rgb*a*0.3,a*0.3); }'});
function addShaft(x,y,z,w,h,col,lean){
  const g=tmpGeo(new T.PlaneGeometry(w,h)); _fc.set(col||'#fff3c0'); const a=new Float32Array(16); for(let i=0;i<4;i++){ a[i*4]=_fc.r; a[i*4+1]=_fc.g; a[i*4+2]=_fc.b; a[i*4+3]=(x*0.37)%1; }
  g.setAttribute('aShaft',new T.BufferAttribute(a,4));
  const m=new T.Mesh(g,shaftMat); m.position.set(x,y+h/2,z); m.rotation.z=lean===undefined?-0.35:lean; m.renderOrder=5; world.add(m); return m;
}
