/* ================= level loading ================= */
/* Throw away whatever level is loaded: its meshes, its lists, and any effects still in the air. */
function unloadLevel(){
  disposeWorld();
  blockMesh.clear(); multi.clear(); crumbles.clear(); togHold.clear();
  enemies=[]; items=[]; shots=[]; bombs=[]; waves=[]; plats=[]; springs=[]; firebars=[]; bumps=[]; sparks=[]; pods=[]; jets=[]; cannons=[]; signs=[]; winds=[]; geysers=[]; lasers=[]; chutes=[]; clouds=[]; critters=[]; lamps=[];
  pitTop=pitFace=null;
  coinMesh=null; sunMesh=null; flagMesh=null; cpFlag=null; motes=null; weathers=[]; liquids=[]; reflY=null; hintFor=null; setHint(null);
  clearFx();
}
function loadLevel(idx,fromCp){
  unloadLevel();
  G.levelIdx=idx; L=LEVELS[idx](); W=L.W; H=L.H; tiles=L.tiles; swOn=true; room=L.rooms[0]; G.under=false; G.beatT=0; G.riseT=0; L.liquid0=L.liquidY;
  /* each level in a world can restyle the sky and light a little, so five levels do not look like one */
  const base=THEMES[L.theme]; TH=Object.assign({},base,base.looks&&base.looks[L.look===null?L.stage:L.look]); GRAV=TH.grav||1; M=themeMats(TH);
  /* where the pits hold water, it can be swum in like any pool */
  if(TH.liquid.kind==='water'&&L.liquidY>0) L.waters.push({x0:-99,y0:-9,x1:W+99,y1:L.liquidY+0.14,base:true});
  applyTheme();
  buildTerrain(); buildBlocks(); buildPipes(); buildSpikes(); buildCoins(); buildLiquid(); buildScenery(); buildGoal(); buildCheckpoint(); buildFixtures(); buildSparks();
  for(const d of L.enemies) spawnEnemy(d);
  if(L.boss) spawnEnemy(Object.assign({type:L.boss.kind},L.boss));
  for(const d of L.plats) spawnPlat(d);
  for(const d of L.springs){ const m=vmesh('spring',mSpring); m.position.set(d.x,d.y,0); world.add(m); springs.push({x:d.x,y:d.y,t:0,mesh:m}); }
  for(const d of L.firebars) spawnFirebar(d);
  const s=(fromCp&&L.checkpoint)?L.checkpoint:L.start;
  resetPlayer(s.x,s.y);
  updateCamera(0,true); animate(0,G.time);
  $('h-level').textContent=L.name+' '+L.label; hudC.sparks=-1;
}
/* Blorp has walked or warped into another room */
function roomChanged(){ if(G.state==='play'&&!player.dead) musicStart(room.bonus?'bonus':TH.music); }

/* ================= per-frame animation (visual only) ================= */
const _d=new T.Object3D();
function animPlayer(dt,time){
  const p=player, show=(p.growT>0&&((p.growT*14|0)%2))?p.prevForm:p.form;
  for(let i=0;i<forms.length;i++) forms[i].visible=i===show;
  if(p.goal!=='in'&&p.goal!=='done') proot.visible=!p.pod&&!(p.inv>0&&!p.dead&&!p.warp&&((time*18|0)%2));
  proot.position.set(p.x,p.y,0);
  const g=forms[show], u=g.userData, sp=Math.abs(p.vx), idle=(p.idleT>2.5||G.state==='title')&&p.onGround&&!p.goal&&!p.warp;
  let rot=p.face>0?0.95:-0.95, rx=0; if(p.dead||idle||p.warp) rot=0; if(p.goal==='slide') rot=1.35; if(p.wall) rot=p.wall*1.45; if(p.dash>0) rot=p.dashDir*1.5;
  let fl=0,fr=0,al=0,ar=0,azl=0,azr=0,by=0;
  if(p.dead){ azl=azr=2.6; fl=0.5; fr=-0.5; }
  else if(p.goal==='slide'){ azl=azr=2.2; fl=fr=0.3; }
  else if(p.pound===1){ rx=(1-p.poundT/0.14)*6.283; azl=azr=1.2; }
  else if(p.pound===2){ azl=azr=2.9; fl=fr=-0.5; }
  else if(p.dash>0){ azl=azr=1.5; al=ar=-1.4; fl=fr=1.2; rx=0.5; }
  else if(p.swim){ const k=Math.sin(time*9); fl=0.9+k*0.5; fr=0.9-k*0.5; azl=1.6+Math.sin(time*6)*0.5; azr=1.6-Math.sin(time*6)*0.5; rx=p.onGround?0:0.5+clamp(-p.vy*0.04,-0.25,0.25); }
  else if(p.wall){ azl=p.wall<0?2.7:0.4; azr=p.wall>0?2.7:0.4; fl=0.4; fr=-0.2; }
  else if(p.onGround){
    p.walkPh+=sp*dt*3.4; const k=Math.min(1,sp/2.5), sw=Math.sin(p.walkPh)*k;
    fl=sw*0.95; fr=-sw*0.95; al=-sw*0.8; ar=sw*0.8; by=Math.abs(Math.sin(p.walkPh))*0.035*k;
    if(idle) azr=2.3+Math.sin(time*9)*0.4;
  } else if(p.glide){ azl=azr=1.5+Math.sin(time*18)*0.15; fl=0.5; fr=0.5; rx=0.25; }
  else { fl=0.75; fr=-0.45; azl=azr=2.3; }
  proot.rotation.y+=(rot-proot.rotation.y)*Math.min(1,dt*14);
  proot.rotation.z+=((p.skid?-p.face*0.22:p.wall?-p.wall*0.12:0)-proot.rotation.z)*Math.min(1,dt*12);
  g.rotation.x=p.pound===1?rx:g.rotation.x+(rx-g.rotation.x)*Math.min(1,dt*10); g.position.y=p.pound===1||p.swim?0:0;
  u.fL.rotation.x=fl; u.fR.rotation.x=fr; u.aL.rotation.x=al; u.aR.rotation.x=ar; u.aL.rotation.z=-azl; u.aR.rotation.z=azr; u.body.position.y=by;
  u.lid.visible=!p.dead&&((time+0.7)%3.3>3.16||p.poundT>0);
  if(u.wL){ const f=p.glide?0.5+Math.sin(time*26)*0.5:p.flapT>0?Math.sin(time*40)*0.9:p.onGround?-0.9:-0.3+Math.sin(time*10)*0.2; u.wL.rotation.y=f; u.wR.rotation.y=-f; }
  p.squash=Math.max(0,p.squash-dt*7);
  let st=1;
  if(!p.dead&&!p.goal&&!p.warp){ st=p.dash>0?0.8:p.pound===2?1.25:p.onGround?1-Math.min(1,p.squash)*0.22+Math.sin(time*3)*0.015:1+clamp(p.vy,-9,12)*0.012; }
  const inv=1/Math.sqrt(st); g.scale.set(inv,st,inv);
  if(p.star>0){ pmat.emissive.setHSL((time*1.6)%1,1,(p.star<2&&((time*10|0)%2))?0.06:0.34); glowAt(p.x,p.y+0.6,1.2,_col.setHSL((time*1.6)%1,1,0.6).getHex(),1.3,7);
    if(Math.random()<dt*24) spawnPart(p.x+(Math.random()-0.5)*0.8,p.y+Math.random()*p.h,0.4,'#fff3a0',0,1,0,0.4,0.09,-2,true); }
  else if(p.form===4&&!p.dead){ const k=0.1+Math.sin(time*4)*0.04+(p.dash>0?0.3:0); pmat.emissive.setRGB(k,k*0.7,0); glowAt(p.x,p.y+p.h*0.6,1,0xffd23e,0.9+(p.dash>0?0.8:0),6.5);
    if(Math.random()<dt*7) spawnPart(p.x+(Math.random()-0.5)*0.8,p.y+Math.random()*p.h,0.4,'#fff3a0',0,0.8,0,0.5,0.07,-1.5,true); }
  else pmat.emissive.setRGB(0,0,0);
  if(p.swim&&Math.random()<dt*2.2) spawnPart(p.x+p.face*0.3,p.y+p.h*0.8,0.5,'#ffffff',0,1.6+Math.random(),0,1.1,0.07,-2.5,true);
  /* blob shadow on whatever is below */
  let gy=-99; const tx=Math.floor(p.x);
  for(let ty=Math.floor(p.y+0.05)-1;ty>=0;ty--){ if(solidAt(tx,ty)||semiAt(tx,ty)){ gy=ty+1; break; } }
  for(const pl of plats) if(!pl.off&&p.x>pl.x&&p.x<pl.x+pl.w&&pl.y<=p.y+0.05&&pl.y>gy) gy=pl.y;
  shadow.visible=gy>-50&&!p.dead&&proot.visible&&p.goal!=='slide'&&!p.warp&&!p.swim;
  if(shadow.visible){ const k=clamp(1-(p.y-gy)*0.11,0.3,1); shadow.position.set(p.x,gy+0.03,0); shadow.scale.setScalar(k); }
}
function animEnemies(dt,time){
  for(const e of enemies){
    const m=e.mesh;
    if(e.dead){ m.position.set(e.x,e.y+(e.flip?e.h:0),0); if(e.flip) m.rotation.z=Math.PI; continue; }
    m.position.set(e.x,e.y,0);
    if(e.active&&e.K.anim) e.K.anim(e,m,dt,time);
  }
}
function animate(dt,time){
  uTime.value=time;
  animPlayer(dt,time); animEnemies(dt,time);
  for(const it of items){ it.mesh.position.set(it.x,it.y,0);
    it.mesh.rotation.y=it.kind==='star'?time*4:it.kind==='muffin'?Math.sin(time*3)*0.25:Math.sin(time*2.6)*0.6; }
  for(const s of shots){ s.mesh.position.set(s.x,s.y,0.2); s.mesh.rotation.z=time*20; s.mesh.rotation.x=time*13; glowAt(s.x,s.y,0.6,0xff9a3d,1.2,6); }
  for(const b of bombs){ b.mesh.position.set(b.x,b.y,0.2); if(b.flat) b.mesh.rotation.y=b.vx<0?Math.PI:0; else if(b.vx) b.mesh.rotation.z-=dt*6*sgn(b.vx); if(b.glow&&Math.abs(b.x-camX)<viewHalfW) glowAt(b.x,b.y,0.6,b.col||'#ffe14d',0.7,4); }
  for(const w of waves){ w.mesh.position.set(w.x,w.y+0.3+Math.abs(Math.sin(time*30))*0.15,0); w.mesh.rotation.y=time*9; }
  for(const pl of plats){ pl.mesh.visible=!pl.off; pl.mesh.position.set(pl.x+(pl.ax==='f'&&pl.trig>0&&pl.trig<0.4?Math.sin(time*70)*0.04:0),pl.y,0); if(pl.rope) pl.rope.rotation.z=pl.ang||0; }
  for(const s of springs){ if(s.t>0) s.t-=dt; const k=s.t>0?Math.sin((s.t/0.35)*Math.PI):0; s.mesh.scale.set(1+k*0.15,1-k*0.45,1+k*0.15); }
  for(const d of pods){ const k=d.t>0?Math.sin(Math.min(1,d.t/0.4)*Math.PI):0, w=player.pod&&player.pod.pod===d?1+Math.sin(time*40)*0.06:1; d.mesh.scale.set((1+k*0.25)*w,(1-k*0.2)*w,(1+k*0.25)*w); }
  for(const f of firebars){ const c=Math.cos(f.a), s=Math.sin(f.a); for(let i=0;i<f.n;i++){ const m=f.embers[i]; m.position.set(f.x+c*i*0.55,f.y+s*i*0.55,0); m.rotation.z=time*6+i; m.rotation.x=time*4; }
    if(Math.abs(f.x-camX)<viewHalfW+3) glowAt(f.x+c*f.n*0.3,f.y+s*f.n*0.3,0.8,0xff7a1f,1,6); }
  for(const j of jets){ const h=j.len*j.on, fl=1+Math.sin(time*40+j.x)*0.12; j.mesh.visible=j.core.visible=j.on>0;
    j.mesh.position.set(j.x,j.y+h/2,0); j.mesh.scale.set(0.62*fl,Math.max(0.01,h),0.62*fl); j.core.position.set(j.x,j.y+h*0.42,0); j.core.scale.set(0.3*fl,Math.max(0.01,h*0.84),0.66);
    if(j.on>0.5&&Math.abs(j.x-camX)<viewHalfW+2) glowAt(j.x,j.y+h*0.5,0.9,0xff7a1f,1.3,7); }
  /* geysers: a rumble of bubbles, then a column with a churning crest */
  for(const g of geysers){ const near=Math.abs(g.x-camX)<viewHalfW+2, h=g.h*g.on, on=g.on>0.3; g.col.visible=g.core.visible=g.crest.visible=on;
    if(on){ const w=0.95+Math.sin(time*23+g.x)*0.06; g.col.position.set(g.x,g.y+h/2,0); g.col.scale.set(1.25*w,Math.max(0.01,h),1.25*w); g.core.position.set(g.x,g.y+h*0.45,0.05); g.core.scale.set(0.6/w,Math.max(0.01,h*0.9),0.9);
      g.crest.position.set(g.x,g.y+h+0.05+Math.sin(time*17)*0.06,0); g.crest.scale.set(1.7*w,0.42,1.5*w); g.crest.rotation.y=time*3;
      if(near&&Math.random()<dt*26) spawnPart(g.x+(Math.random()-0.5)*1.2,g.y+h,(Math.random()-0.5)*0.8,(TH.geyser||['#9fdcff','#e6fbff'])[1],(Math.random()-0.5)*4,2+Math.random()*3,(Math.random()-0.5)*2,0.5,0.1,16,true); }
    else if(g.on>0&&near&&Math.random()<dt*14) spawnPart(g.x+(Math.random()-0.5)*0.6,g.y+0.2,0.3,(TH.geyser||['#9fdcff','#e6fbff'])[1],(Math.random()-0.5)*1.5,2+Math.random()*2,0,0.35,0.08,12,true); }
  /* lasers: a thread of light for a warning, then the beam, alive at the edges */
  for(const z of lasers){ const on=z.on>0, warn=z.on<0&&((time*14|0)%2===0); z.beam.visible=on||warn; z.core.visible=on;
    if(!on&&!warn) continue;
    const cx=(z.x0+z.x1)/2, cy=(z.y0+z.y1)/2, ln=Math.max(0.05,z.horiz?z.x1-z.x0:z.y1-z.y0), th=on?0.24+Math.sin(time*50+cx)*0.04:0.04;
    z.beam.position.set(cx,cy,0); z.beam.scale.set(z.horiz?ln:th,z.horiz?th:ln,th); z.core.position.set(cx,cy,0.02); z.core.scale.set(z.horiz?ln:th*0.4,z.horiz?th*0.4:ln,th*0.6);
    if(on&&Math.abs(cx-camX)<viewHalfW+ln/2){ glowAt(cx,cy,0.7,z.col,1.1,5+ln*0.4); if(Math.random()<dt*18){ const ex=z.horiz?(Math.random()<0.5?z.x0:z.x1):cx, ey=z.horiz?cy:(Math.random()<0.5?z.y0:z.y1); spawnPart(ex,ey,0.2,'#ffffff',(Math.random()-0.5)*4,(Math.random()-0.5)*4,0,0.2,0.07,0,true); } } }
  /* the tide, where a level has one */
  if(pitTop&&L.rise){ pitTop.position.y=L.liquidY; pitFace.position.y=L.liquidY-pitFaceH/2; pitFace.material.uniforms.uSurf.value=L.liquidY; if(reflY!==null) reflY=L.liquidY; }
  for(const s of sparks){ const m=s.mesh;
    if(s.got){ s.t+=dt; const u=Math.min(1,s.t/0.5); m.position.y=s.y+u*1.6; m.scale.setScalar(Math.max(0.001,1-u)); m.rotation.y+=dt*22; m.visible=u<1; continue; }
    m.position.y=s.y+Math.sin(time*2.4+s.x)*0.12; m.rotation.y=Math.sin(time*1.6+s.x)*0.7;
    m.rotation.z=Math.sin(time*1.1+s.x)*0.25;
    if(!s.had&&Math.abs(s.x-camX)<viewHalfW+2){ if(Math.random()<dt*6) spawnPart(s.x+(Math.random()-0.5)*1.1,s.y+(Math.random()-0.5)*1.1,0.3,'#fff3a0',0,0.5,0,0.5,0.06,-0.5,true); glowAt(s.x,s.y,1,0xffd66a,1,5.5); } }
  for(const z of winds){ if(Math.abs((z.x0+z.x1)/2-camX)>viewHalfW+(z.x1-z.x0)/2) continue;
    if(Math.random()<dt*(z.x1-z.x0)*(z.y1-z.y0)*0.5) spawnPart(z.x0+Math.random()*(z.x1-z.x0),z.y0+Math.random()*(z.y1-z.y0),-0.6+Math.random()*1.4,'#ffffff',z.ax*0.12,z.ay*0.12,0,0.5,0.06,0); }
  if(bumps.length){ for(const b of bumps){ b.t+=dt; b.mesh.position.y=b.y+(b.t<0.2?Math.sin(b.t/0.2*Math.PI)*0.32:0); } bumps=bumps.filter(b=>b.t<0.2); }
  if(coinMesh){
    for(let i=0;i<coinPos.length;i++){ const c=coinPos[i];
      if(c.on&&Math.abs(c.x-camX)<viewHalfW+8){ _d.position.set(c.x,c.y+Math.sin(time*3+c.x)*0.05,0); _d.rotation.set(0,time*3.2+c.x*0.6,0); _d.scale.setScalar(1); }
      else { _d.position.set(c.x,-60,0); _d.scale.setScalar(0.001); }
      _d.updateMatrix(); coinMesh.setMatrixAt(i,_d.matrix); }
    coinMesh.instanceMatrix.needsUpdate=true;
  }
  animFx(dt);
  cvTex[0].offset.y=-(time*0.4)%1; cvTex[1].offset.x=-(time*0.4)%1; cvTex[2].offset.x=(time*0.4)%1;
  const bl=(time%3.6)>3.45; if(bl!==blinkOn){ blinkOn=bl; eyeMat.map=bl?texEyeShut:texEyeOpen; }
  if(flagMesh) flagMesh.rotation.y=Math.sin(time*3)*0.18;
  if(cpFlag) cpFlag.rotation.y=Math.sin(time*2.6)*0.22;
  for(const w of weathers) w.material.uniforms.uCam.value.set(camX,camY,0);
  uPush.value.set(player.x,player.dead?-99:player.y,0);
  if(sunMesh) sunMesh.rotation.z=Math.sin(time*0.5)*0.06;
  for(const c of clouds){ c.m.position.x+=c.v*dt; if(c.m.position.x>W+70) c.m.position.x=-70; }
  for(const c of critters) c.tick(dt,time);
  /* whatever lamps the scenery has near the camera get the glow lights that are left */
  if(lamps.length&&glowN<glowLights.length){ let a=null, b=null, ad=1e9, bd=1e9;
    for(const l of lamps){ const d=Math.hypot(l.x-player.x,(l.y-player.y)*1.3); if(d<ad){ b=a; bd=ad; a=l; ad=d; } else if(d<bd){ b=l; bd=d; } }
    for(const q of [[a,ad],[b,bd]]){ const l=q[0], k=l?clamp(1.5-q[1]/(viewHalfW+2),0,1):0; if(k>0) glowAt(l.x,l.y,l.z,l.col,(l.power||1)*k,l.reach||8); } }
  glowEnd();
  /* hint signs speak up when Blorp stands by them */
  let near=null; for(const s of signs) if(Math.abs(player.x-s.x)<1.7&&Math.abs(player.y-s.y)<2.5) near=s;
  if(near!==hintFor){ hintFor=near; setHint(near&&G.state==='play'?near.text:null); if(near&&G.state==='play') sfx.hint(); }
}
let hintFor=null;
function setHint(text){
  const el=$('hint'); if(!text){ el.hidden=true; return; }
  const k=isTouch?{jump:'A',run:'B',down:'▼'}:{jump:'Space',run:'Shift',down:'↓'};
  el.innerHTML=text.replace(/[<>&]/g,'').replace(/\{(\w+)\}/g,(m,n)=>'<b>'+(k[n]||n)+'</b>'); el.hidden=false;
}

/* The eclipse ends: over a few seconds the last level's sky and light turn to morning. */
const _dw=new T.Color();
function dawnLook(u){
  const k=u*u*(3-2*u), to=(c,hex)=>c.lerp(_dw.set(hex),k*0.08+0.02);
  to(skyU.cTop.value,0x3fa2ff); to(skyU.cMid.value,0xffc9a0); to(skyU.cBot.value,0xfff3c2); to(skyU.sunCol.value,0xfff3c0);
  skyU.uEclipse.value*=1-k*0.1; skyU.uStars.value*=1-k*0.08; skyU.sunGlow.value+=(1.6-skyU.sunGlow.value)*k*0.06; skyU.uSpokes.value+=(1-skyU.uSpokes.value)*k*0.05;
  hemi.intensity+=(0.7-hemi.intensity)*k*0.06; sun.intensity+=(0.8-sun.intensity)*k*0.06; to(sun.color,0xfff0d0); to(hemi.color,0xffffff); if(scene.fog) to(scene.fog.color,0xffe6c9);
  POST.rays+=(0.9-POST.rays)*k*0.05;
}

/* ================= screens and flow ================= */
let isTouch=!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches), saved=null, acc=0, lastT=0;
function show(id){
  const ov=$('overlay'); ov.hidden=!id; ov.className=id||'';
  for(const s of ov.querySelectorAll('.screen')) s.hidden=s.id!==id;
  if(id&&!isTouch){ const b=$(id).querySelector('.btn'); if(b){ try{ b.focus({preventScroll:true}); }catch(e){} } }
}
/* The wipe between screens: a ring of ink closes on Blorp, the next thing is set up behind it, and it opens again.
   `instant` is for the checks in tools/, which have no frames to wait for. */
const WP={dir:0,t:0,fn:null,instant:false};
function wipeAim(){ const s=mapOn?screenOf(MAPST.x,MAPST.y+0.5,MAPST.z):screenOf(player.x,clamp(player.y,camY-V/2+1,camY+V/2-1)+0.5,0); wipe.x=s[0]; wipe.y=s[1]; }
function wipeOut(fn){
  if(WP.instant||reduceMotion){ fn(); return; }
  if(WP.dir<0) return;
  WP.dir=-1; WP.t=0; WP.fn=fn; wipeAim(); sfx.iris();
}
function wipeIn(){ if(WP.instant||reduceMotion){ wipe.iris=3; return; } WP.dir=1; WP.t=0; wipe.iris=0; wipeAim(); }
function wipeTick(dt){
  if(!WP.dir) return;
  WP.t+=dt/0.4; const u=Math.min(1,WP.t), e=u*u*(3-2*u);
  if(WP.dir>0) wipeAim();
  wipe.iris=(WP.dir<0?1-e:e)*2.4;
  if(u>=1){ if(WP.dir<0){ WP.dir=0; wipe.iris=0; const f=WP.fn; WP.fn=null; if(f) f(); } else { WP.dir=0; wipe.iris=3; } }
}
/* Progress is kept in the browser so "Continue" on the title screen can pick it up after the page is closed:
   `level` is the marker Blorp stands on, `open` the furthest level opened (see m_map.js), and `sparks` the moon
   sparks found, three bits a level. Storage can be missing or blocked (private windows, embedded pages), so every
   use is allowed to fail quietly. */
const SAVE_KEY='blorps-big-romp-3.save';
function writeSave(level,fresh){
  const d={level,open:G.open,score:fresh?0:G.score,coins:fresh?0:G.coins,lives:fresh?3:G.lives,form:fresh?0:player.form,sparks:G.sparks.slice(0,LEVELS.length),gfx:Q.auto?-1:Q.level};
  try{ window.localStorage.setItem(SAVE_KEY,JSON.stringify(d)); }catch(e){}
}
/* Make sense of something that claims to be a save, or return null. */
function checkSave(d){
  if(!d||!Number.isInteger(d.level)||d.level<0||d.level>=LEVELS.length) return null;
  if(!Number.isInteger(d.open)||d.open<d.level||d.open>LEVELS.length) d.open=d.level;
  const s=Array.isArray(d.sparks)?d.sparks:[]; d.sparks=LEVELS.map((_,i)=>(s[i]|0)&7);
  return d;
}
function readSave(){ try{ return checkSave(JSON.parse(window.localStorage.getItem(SAVE_KEY))); }catch(e){} return null; }
function beginLevel(fromCp){
  G.bossSeen=false; G.bossDead=false;
  mapMode(false);
  loadLevel(G.levelIdx,fromCp); writeSave(G.levelIdx);
  G.state='card'; G.cardT=1.7; acc=0; input.jumpBuf=0; input.runEdge=false; input.downEdge=false;
  $('card-eyebrow').textContent='World '+(L.world+1)+' · Level '+(L.stage+1)+' of '+L.stages; $('card-name').textContent=L.name; $('card-lives').textContent=G.lives;
  paintSparks($('card-sparks'),G.levelIdx);
  show('s-card'); musicStop(); sfx.card(); wipe.iris=3; WP.dir=0;
}
/* three little moons: lit for a spark that has been found */
function paintSparks(el,level){ const kids=el.children; for(let i=0;i<3;i++) kids[i].classList.toggle('got',!!sparkHad(level,i)); }
/* There is no pausing while Blorp is dying: the pause screen's ways out would let him off the life he just lost. */
function togglePause(){
  if(G.state==='play'&&!player.dead){ G.state='pause'; gfxLabel(); show('s-pause'); musicPause(true); sfx.pause(); }
  else if(G.state==='pause'){ G.state='play'; show(null); musicPause(false); acc=0; }
}
function gfxLabel(){ $('btn-gfx').textContent='Graphics: '+(Q.auto?'Auto ('+['plain','medium','full'][Q.level]+')':['Plain','Medium','Full'][Q.level]); }
function afterDeath(){
  G.lives--; player.form=0;
  if(G.lives<=0){ G.state='over'; writeSave(G.levelIdx,true); show('s-over'); sfx.over(); }
  else wipeOut(()=>beginLevel(G.cp));
}
/* Clearing a level for the first time opens the next one. The new stretch of path is shown appearing once Blorp is
   back on the map; after the last level there is no more path to show. */
let newPath=-1;
function levelClear(){
  const first=G.levelIdx>=G.open; if(first) G.open=G.levelIdx+1;
  newPath=first&&G.levelIdx<MAPSEGS.length?G.levelIdx:-1;
  G.state='clear'; writeSave(G.levelIdx);
  $('clear-eyebrow').textContent='Level '+L.label+' clear'; $('clear-name').textContent=L.name; $('clear-score').textContent=G.score; $('clear-coins').textContent=G.coins;
  paintSparks($('clear-sparks'),G.levelIdx);
  $('clear-note').hidden=!L.boss; if(L.boss) $('clear-note').textContent=BOSS_LINES[L.boss.kind]||BOSS_NAMES[L.boss.kind]+' is beaten.';
  show('s-clear');
}
/* Beating the last level opens nothing new, but it still counts: `open` runs one past the end so its marker reads as cleared. */
function showWin(){
  G.open=LEVELS.length; newPath=-1; G.state='win'; writeSave(G.levelIdx);
  const n=sparkTotal(), all=LEVELS.length*3;
  $('win-score').textContent=G.score; $('win-sparks').textContent=n+' / '+all;
  $('win-note').textContent=n>=all?'Every last spark is back where it belongs. The sun has never shone so bright, and neither has Blorp.':'The sun is up again, if a little pale. '+(all-n)+' of its sparks are still out there.';
  show('s-win'); musicStart('title');
}
function act(a){
  auInit();
  if(WP.dir) return;
  if(a==='start'){ G.score=0; G.coins=0; G.lives=3; G.open=0; G.levelIdx=0; G.sparks=LEVELS.map(()=>0); player.form=0; sfx.uiOk(); wipeOut(()=>showMap(-1)); }
  else if(a==='continue'&&saved){ G.score=saved.score|0; G.coins=saved.coins|0; G.lives=Math.max(1,saved.lives|0); G.open=saved.open; G.levelIdx=saved.level; G.sparks=saved.sparks.slice(); player.form=clamp(saved.form|0,0,4); sfx.uiOk(); wipeOut(()=>showMap(-1)); }
  else if(a==='resume') togglePause();
  else if(a==='restart'&&G.state==='pause'){ G.cp=false; player.form=0; wipeOut(()=>beginLevel(false)); }
  else if(a==='gfx'){ if(Q.auto) setQuality(2,true); else if(Q.level>0) setQuality(Q.level-1,true); else { setQuality(2); Q.auto=true; } gfxLabel(); writeSave(G.levelIdx); }
  else if(a==='map'&&(G.state==='clear'||G.state==='over'||G.state==='win'||G.state==='pause')){
    if(G.state==='over'){ G.score=0; G.coins=0; G.lives=3; player.form=0; }
    const seg=G.state==='clear'?newPath:-1; newPath=-1; wipeOut(()=>showMap(seg));
  }
}
function primaryAction(){
  if(G.state==='map') return mapEnter();
  const a={title:saved?'continue':'start',pause:'resume',clear:'map',over:'map',win:'map'}[G.state];
  if(!a) return false; act(a); return true;
}
function toggleSound(){ setMuted(!AU.muted); const b=$('b-sound'); b.classList.toggle('off',AU.muted); b.setAttribute('aria-pressed',String(!AU.muted)); }
$('overlay').addEventListener('click',e=>{ const b=e.target.closest('[data-act]'); if(b){ b.blur(); act(b.dataset.act); } });
$('b-pause').addEventListener('click',e=>{ auInit(); e.currentTarget.blur(); togglePause(); });
$('b-sound').addEventListener('click',e=>{ auInit(); e.currentTarget.blur(); toggleSound(); });
/* A hidden page pauses a level. The map has nothing to pause, but its tune goes quiet until the page is back. */
function pageHidden(){ if(G.state==='map'||G.state==='title') musicPause(document.hidden); else if(document.hidden&&G.state==='play') togglePause(); }
document.addEventListener('visibilitychange',pageHidden);

/* ================= the map between levels ================= */
/* The map and a level never show together. Switching also re-runs the layout, because the touch keys are laid out
   differently on the map and the level camera measures itself against them. */
let mapOn=false;
function mapMode(on){ if(mapOn===on) return; mapOn=on; document.body.classList.toggle('map',on); mapViewShow(on); layout(); }
/* Go to the map, with Blorp on the marker of the level he was last on. `seg` is a stretch of path to show
   appearing, or -1. */
function showMap(seg){
  unloadLevel(); musicStop(); musicMuffle(false);
  G.state='map'; G.cp=false; G.under=false; player.dead=false; setSize();
  mapPlace(G.levelIdx); if(seg>=0) mapReveal(seg);
  mapMode(true); mapViewSync(); mapBanner(); show(null);
  padWas=padDir(); playWas=tk.jump; /* whatever is held on arriving does not count until it is let go */
  writeSave(G.levelIdx); musicStart('map'); hudC.sparks=-1; wipeIn();
}
/* Play the level Blorp is standing on. Not while he is walking, and not while a path is appearing. */
function mapEnter(){
  if(G.state!=='map'||MAPST.walk||MAPST.reveal||WP.dir) return false;
  G.levelIdx=MAPST.at; G.cp=false; sfx.mapPlay(); wipeOut(()=>beginLevel(false)); return true;
}
/* A direction was pressed on the map. */
function mapPress(dir){
  if(G.state!=='map'||WP.dir) return;
  const r=mapGo(dir);
  if(r==='locked'){ sfx.mapNo(); mapBanner('Clear this level to open the path'); } else if(r==='none') sfx.mapNo();
}
/* The touch pad and the A key on the map. Only a fresh press counts. */
let padWas=null, playWas=false;
function mapInput(){
  const d=padDir(), a=tk.jump;
  if(d&&d!==padWas) mapPress(d);
  if(a&&!playWas) mapEnter();
  padWas=d; playWas=a;
}
/* m_map.js calls these as Blorp walks and as a new stretch of path appears */
function mapStepped(){ sfx.mapHop(); }
function mapArrived(){ G.levelIdx=MAPST.at; writeSave(G.levelIdx); mapBanner(); }
function mapRevealed(seg,k,done){ mapViewSync(); mapViewPop(seg,k,done); if(done){ sfx.mapOpen(); mapBanner(); } else sfx.mapTile(k); }

/* ================= input ================= */
const kb={left:false,right:false,jump:false,run:false,down:false}, tk={left:false,right:false,up:false,down:false,jump:false,run:false,pound:false};
const KEYS={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyZ:'jump',KeyK:'jump',ShiftLeft:'run',ShiftRight:'run',KeyX:'run',KeyJ:'run',ArrowDown:'down',KeyS:'down'};
/* On the map the arrows and W A S D walk Blorp north, east, south and west. Up and W jump in a level; here they are
   only a direction, so they never start one. */
const MAPKEYS={ArrowUp:'N',KeyW:'N',ArrowRight:'E',KeyD:'E',ArrowDown:'S',KeyS:'S',ArrowLeft:'W',KeyA:'W'}, kbDir={N:false,E:false,S:false,W:false};
let lastDir='N';
function keyDown(e){
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const k=KEYS[e.code], d=MAPKEYS[e.code];
  if(e.repeat){ if(k||d||e.code==='Enter') e.preventDefault(); return; }
  auInit();
  if(e.code==='Enter'||(e.code==='Space'&&G.state!=='play')||(G.state==='map'&&(e.code==='KeyZ'||e.code==='KeyK'))){ e.preventDefault(); primaryAction(); return; }
  if(e.code==='KeyP'||e.code==='Escape'){ e.preventDefault(); togglePause(); return; }
  if(e.code==='KeyM'){ toggleSound(); return; }
  if(d){ kbDir[d]=true; lastDir=d; e.preventDefault(); if(G.state==='map') mapPress(d); }
  if(k){ kb[k]=true; e.preventDefault(); }
}
function keyUp(e){ const k=KEYS[e.code], d=MAPKEYS[e.code]; if(d) kbDir[d]=false; if(k){ kb[k]=false; e.preventDefault(); } }
window.addEventListener('keydown',keyDown);
window.addEventListener('keyup',keyUp);
window.addEventListener('blur',()=>{ kb.left=kb.right=kb.jump=kb.run=kb.down=false; kbDir.N=kbDir.E=kbDir.S=kbDir.W=false; });
const padDir=()=>tk.up?'N':tk.right?'E':tk.down?'S':tk.left?'W':null;
/* the direction being held on the map: the key pressed last if it is still down, else any that is, else the touch pad */
function heldDir(){ if(kbDir[lastDir]) return lastDir; for(const d in kbDir) if(kbDir[d]) return d; return padDir(); }
function pollInput(){
  const j=kb.jump||tk.jump, r=kb.run||tk.run, d=kb.down||tk.pound;
  if(j&&!input.jump) input.jumpBuf=0.11;
  if(r&&!input.run) input.runEdge=true;
  if(d&&!input.down) input.downEdge=true;
  input.jump=j; input.run=r; input.down=d; input.left=kb.left||tk.left; input.right=kb.right||tk.right;
}
const padMove=$('pad-move'), padAct=$('pad-act'), keyA=$('key-a'), keyB=$('key-b'), keyC=$('key-c'), keyL=padMove.children[0], keyR=padMove.children[1], keyU=padMove.children[2], keyD=padMove.children[3];
function evalTouches(ev){
  let l=false,r=false,u=false,d=false,a=false,b=false,c=false;
  const rm=padMove.getBoundingClientRect(), rp=padAct.getBoundingClientRect();
  const near=(el,x,y,extra)=>{ const q=el.getBoundingClientRect(); return q.width>0&&Math.hypot(x-(q.left+q.width/2),y-(q.top+q.height/2))<q.width/2+extra; };
  const mid=(rm.right+rp.left)/2; /* a thumb left of this line only steers, right of it only acts */
  for(let i=0;i<ev.touches.length;i++){ const t=ev.touches[i], x=t.clientX, y=t.clientY;
    if(x<mid){ if(x>rm.left-40&&y>rm.top-48&&y<rm.bottom+48){ const dx=x-(rm.left+rm.width/2), dy=y-(rm.top+rm.height/2);
        /* on the map the pad is a cross, and whichever arm the thumb is nearest wins */
        if(mapOn&&Math.abs(dy)>Math.abs(dx)){ if(dy<0) u=true; else d=true; } else if(dx<0) l=true; else r=true; } }
    else { if(near(keyA,x,y,24)) a=true; if(near(keyB,x,y,24)) b=true; if(near(keyC,x,y,12)) c=true; } }
  tk.left=l; tk.right=r; tk.up=u; tk.down=d; tk.jump=a; tk.run=b; tk.pound=c;
  keyL.classList.toggle('on',l); keyR.classList.toggle('on',r); keyU.classList.toggle('on',u); keyD.classList.toggle('on',d); keyA.classList.toggle('on',a); keyB.classList.toggle('on',b); keyC.classList.toggle('on',c);
}
function onTouch(e){
  if(!isTouch){ isTouch=true; layout(); }
  evalTouches(e);
  const t=e.target; if(t===canvas||(t.closest&&t.closest('#deck'))) e.preventDefault();
}
for(const n of ['touchstart','touchmove','touchend','touchcancel']) document.addEventListener(n,onTouch,{passive:false});
/* mouse on the on-screen keys, for touch laptops and testing */
for(const el of document.querySelectorAll('.key')){
  el.addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse'){ tk[el.dataset.k]=true; el.classList.add('on'); } });
  for(const n of ['pointerup','pointerleave']) el.addEventListener(n,e=>{ if(e.pointerType==='mouse'){ tk[el.dataset.k]=false; el.classList.remove('on'); } });
}

/* ================= layout, HUD, loop ================= */
function layout(){
  const w=window.innerWidth, h=window.innerHeight;
  document.body.classList.toggle('touch',isTouch);
  const portrait=isTouch&&h>w*1.05;
  document.body.classList.toggle('portrait',portrait);
  stage.style.flex=portrait?'0 0 '+Math.round(clamp(h*0.56,Math.min(w*0.86,h-215),h-215))+'px':'';
  const sw=stage.clientWidth||w, sh=stage.clientHeight||h;
  const dpr=Math.min(window.devicePixelRatio||1,QUALITY[Q.level].dpr);
  renderer.setPixelRatio(dpr); renderer.setSize(sw,sh,false);
  sizePost(Math.round(sw*dpr),Math.round(sh*dpr));
  const aspect=sw/sh;
  V=clamp(14/aspect,12.5,19); camDist=(V/2)/Math.tan(15*Math.PI/180);
  camera.aspect=aspect; camera.far=camDist+190; camera.updateProjectionMatrix(); skyU.uAspect.value=aspect;
  viewHalfW=V*aspect/2;
  /* Landscape touch: the pads float over the bottom of the stage, so raise the walking surface until it clears them.
     n is how far below centre the ground line has to sit (1 = bottom edge); the divisor allows for the camera's 0.19 rad tilt. */
  let lift=0.34*V;
  if(isTouch&&!portrait){
    const sb=stage.getBoundingClientRect().bottom; let top=sb;
    /* measured from the pads, not the keys: a key shifts down while it is pressed, and A is down when a level starts from the map */
    for(const k of [padMove,padAct]) top=Math.min(top,k.getBoundingClientRect().top);
    const n=clamp(1-2*(sb-top+6)/sh,0.1,1);
    lift=Math.min(lift,n*V/(2*(Math.cos(0.19)-n*Math.sin(0.19)*Math.tan(15*Math.PI/180))));
  }
  camBaseY=2+lift;
  if(scene.fog&&TH&&!mapOn){ scene.fog.near=camDist+TH.fogNear; scene.fog.far=camDist+TH.fogFar; } /* the map keeps its own haze */
}
window.addEventListener('resize',layout);
const hudC={lives:-1,coins:-1,score:-1,sparks:-1,boss:-1};
function updateHud(){
  if(hudC.lives!==G.lives){ hudC.lives=G.lives; $('h-lives').textContent=G.lives; }
  if(hudC.coins!==G.coins){ hudC.coins=G.coins; $('h-coins').textContent=String(G.coins).padStart(2,'0'); }
  if(hudC.score!==G.score){ hudC.score=G.score; $('h-score').textContent=String(G.score).padStart(6,'0'); }
  /* a boss in sight: its name, and a pip for every stomp it can still take */
  let boss=null; if(G.bossSeen&&!mapOn&&G.state!=='title') for(const e of enemies) if(e.K.boss&&!e.dead) boss=e;
  const pips=boss?Math.ceil(boss.hp/3):-1;
  if(hudC.boss!==pips){ hudC.boss=pips; $('boss-bar').hidden=pips<0;
    if(boss){ $('boss-name').textContent=BOSS_NAMES[boss.type]; let h=''; for(let i=0;i<Math.ceil(boss.hp0/3);i++) h+=i<pips?'<i class="on"></i>':'<i></i>'; $('boss-hp').innerHTML=h; } }
  /* in a level: this level's three sparks. On the map: how many of them all. */
  const sh=mapOn?1000+sparkTotal():(G.sparks[G.levelIdx]|0);
  if(hudC.sparks!==sh){ hudC.sparks=sh; $('h-sparks').hidden=mapOn; $('h-sun').hidden=!mapOn; if(mapOn) $('h-suns').textContent=sparkTotal()+'/'+LEVELS.length*3; else paintSparks($('h-sparks'),G.levelIdx); }
}
let titleT=0;
function frame(now){
  requestAnimationFrame(frame);
  const real=Math.min(0.1,Math.max(0,(now-lastT)/1000)); lastT=now;
  let dt=real;
  pollInput(); wipeTick(real); auFrom(0);
  if(G.state==='card'){ G.cardT-=dt; if(G.cardT<=0){ show(null); G.state='play'; acc=0; input.jumpBuf=0; input.runEdge=false; input.downEdge=false; musicStart(room.bonus?'bonus':TH.music); if(L.boss&&G.bossSeen) musicStart('boss'); } }
  if(G.state==='play'){
    watchSpeed(real);
    if(G.hitstop>0){ G.hitstop-=real; dt=0; }
    else { if(G.bossDead&&G.winT<1.2) dt*=0.45; /* a boss goes down in slow motion */
      acc+=dt; let n=0; while(acc>=STEP&&n<16&&G.state==='play'&&G.hitstop<=0){ step(STEP); acc-=STEP; n++; } if(n>=16) acc=0; }
  }
  if(G.state==='map'&&!WP.dir) mapInput(); /* which may start a level, so the state is looked at again */
  if(G.state==='map'){ G.time+=dt; uTime.value=G.time; mapTick(dt,WP.dir?null:heldDir(),input.run); animFx(dt); mapViewFrame(dt,G.time); glowEnd(); }
  else if(G.state!=='pause'){
    G.time+=dt; animate(dt,G.time);
    if(G.state==='title'){ titleT+=dt; camLead=1.5+Math.sin(titleT*0.25)*3; }
    updateCamera(dt,false);
  }
  /* under water the picture cools and swims, and the music goes dull */
  const under=G.under&&G.state!=='map'; musicMuffle(under&&G.state==='play');
  if(G.state!=='map'){ POST.wob+=((under?0.0016:TH&&TH.haze||0)-POST.wob)*Math.min(1,real*5);
    /* a level's own dark, and the dark the Baron brings down; and after him, the dawn */
    const want=Math.max(L.dark===undefined?(TH.dark||0):L.dark,baronDark*0.86); POST.dark+=(want-POST.dark)*Math.min(1,real*4);
    if(dawn>=0&&dawn<1){ dawn=Math.min(1,dawn+real*0.3); dawnLook(dawn); }
    if(G.state==='play'&&TH.air) auAir(room.bonus?'':TH.air,real); }
  POST.tint.r+=((under?0.78:1)-POST.tint.r)*Math.min(1,real*6); POST.tint.g+=((under?0.95:1)-POST.tint.g)*Math.min(1,real*6); POST.tint.b+=((under?1.12:1)-POST.tint.b)*Math.min(1,real*6);
  postTick(real);
  updateHud();
  renderFrame();
}

/* Keep progress when the page is republished while open. */
const hot=window.claude&&window.claude.hot;
if(hot&&hot.snapshot){ try{ hot.snapshot(()=>({level:G.levelIdx,open:G.open,score:G.score,coins:G.coins,lives:G.lives,form:player.form,sparks:G.sparks,playing:G.state!=='title'})); }catch(e){} }
function boot(data){
  G.sparks=LEVELS.map(()=>0);
  saved=data&&data.playing?checkSave(data):readSave();
  /* the graphics setting: a choice made by hand is remembered; ?q=0..2 in the address forces one */
  const m=/[?&]q=([0-2])/.exec(window.location&&window.location.search||''), gfx=m?+m[1]:saved&&Number.isInteger(saved.gfx)?saved.gfx:-1;
  if(gfx>=0) setQuality(gfx,true);
  layout();
  loadLevel(0,false);
  if(saved){
    /* Continue becomes the main button, so a stray Enter cannot start over and overwrite the save */
    const b=$('btn-continue'), n=$('btn-start'); b.hidden=false; b.textContent='Continue at '+LABELS[saved.level];
    b.classList.remove('quiet'); n.classList.add('quiet'); n.textContent='New game'; n.before(b);
  }
  show('s-title');
  lastT=performance.now();
  requestAnimationFrame(frame);
}
window.__romp={G,player,input,kb,MAPST,Q,POST,WP,wipe,quality:n=>setQuality(n,true),map:()=>showMap(-1),open:n=>{ G.open=n; mapViewSync(); mapBanner(); },at:i=>{ mapPlace(i); mapBanner(); },zoom:k=>{ mapZoom=k; },
  load:(i,cp)=>{ G.levelIdx=i; beginLevel(!!cp); },tp:(x,y)=>{ player.x=x; player.y=y; player.vx=player.vy=0; focusY=y; setRoom(); },form:f=>{ player.form=f; setSize(); },
  view:()=>({camX,camY,V,viewHalfW,W,H}),count:()=>LEVELS.length,labels:()=>LABELS,enemies:()=>enemies,items:()=>items,plats:()=>plats,step,solidAt,tileAt,L:()=>L,animate,updateCamera,info:()=>renderer.info.render,frame};
if(hot&&hot.ready) hot.ready(boot); else boot((hot&&hot.data)||{});
