/* ================= monsters ================= */
/* Every kind of monster is one entry here. What the rest of the game needs to know about a kind is in its flags:
     stomp      landing on it squishes it (or calls stomped(), for the ones that turn into something)
     flip       a ground pound's shock bowls it over even though it cannot be stomped
     fly        it ignores the ground, other walkers and pounds
     heavy      nothing bowls it over: not a bump from below, not a shell, not a star
     fireproof  fire spit does nothing
     bouncy     landing on it is safe and bounces Blorp, but does not hurt it (bounced(e) is told, if it is there)
     harmless   touching it does nothing at all
     glowing    it is a light: a star or a dash puts it out even if it is heavy
   and in its functions: init(e,d) sets it up from the level's description d, mesh(e) builds its model, tick(e,dt) is
   one step of the rules, anim(e,m,dt,time) is looks only, box(e) gives [bottom,height] of where it can be touched
   right now, or null for nowhere. */
const ETYPES={};
function defEnemy(name,K){ K.name=name; ETYPES[name]=K; }
const G1=(key,f,mat)=>{ const g=new T.Group(); g.add(vmesh(key,f,mat)); return g; };
/* A world can give a monster another body: THEMES.x.skins={swoop:mCrow, ...}. The rules stay the same; only the model changes. */
const skinOf=(type,f)=>{ const q=TH&&TH.skins&&TH.skins[type]; return q?[type+'@'+L.theme,q]:[type,f]; };
const G1s=(type,f,mat)=>{ const q=skinOf(type,f); return G1(q[0],q[1],mat); };
/* which side of the screen a sound comes from: call before a monster's sfx, the frame sets it back */
const soundAt=x=>auFrom(x<camX-viewHalfW*0.3?-1:x>camX+viewHalfW*0.3?1:0);
function spawnEnemy(d){
  const K=ETYPES[d.type], e={type:d.type,K,x:d.x,y:d.y,vx:0,vy:0,w:K.w||0.8,h:K.h||0.8,active:false,dead:false,gone:false,flip:false,deadT:0,onGround:false,shell:false,kick:0,chain:0,t:Math.random()*6};
  if(K.init) K.init(e,d);
  e.mesh=K.mesh(e); e.mesh.position.set(e.x,e.y,0); world.add(e.mesh); enemies.push(e); return e;
}
const hitBox=e=>e.K.box?e.K.box(e):[e.y,e.h];
const onScreen=(e,m)=>Math.abs(e.x-camX)<viewHalfW+(m||0);
function killEnemy(e,how,dir){
  if(e.dead) return; e.dead=true;
  if(how==='squish'&&!e.K.fly){ e.flip=false; e.deadT=0.45; e.mesh.scale.set(1.25,0.28,1.25); sfx.stomp(player.combo); ring(e.x,e.y,'#ffffff',1.5,0.25); }
  else { e.flip=true; if(how==='squish'){ e.vy=1; e.vx=0; sfx.stomp(player.combo); } else { e.vy=9; e.vx=(dir||1)*3; sfx.kick(); } if(e.K.unroot) e.K.unroot(e); }
  puff(e.x,e.y+e.h*0.5,WHITE,5,0.17,0.6); burst(e.x,e.y+e.h*0.5,'#fff3a0',3,3,0.08,0.3,true);
  if(e.K.onKill) e.K.onKill(e);
}
/* ordinary walking: gravity, walls turn it round, belts carry it; true if it met a wall */
function walk(e,dt){
  e.vy-=55*dt; if(e.vy<-MAX_FALL) e.vy=-MAX_FALL;
  let hit=false; if(e.vx&&moveX(e,e.vx*dt)){ e.vx=-e.vx; hit=true; }
  const r=moveY(e,e.vy*dt); if(r===1){ e.vy=0; e.onGround=true; const b=beltAt(e); if(b) moveX(e,b*dt);
    /* a bouncy block bounces monsters too, the ones light enough */
    if(!e.K.heavy&&!e.K.boss&&tileAt(Math.floor(e.x),Math.floor(e.y-0.5))===BOUNCE){ e.vy=9; e.onGround=false; } }
  else { if(r===2) e.vy=0; e.onGround=false; }
  return hit;
}
/* no ground ahead of a walker that minds its step */
function ledgeAhead(e){ const ax=Math.floor(e.x+sgn(e.vx)*(e.w/2+0.15)), ay=Math.floor(e.y-0.5); return e.onGround&&!solidAt(ax,ay)&&!semiAt(ax,ay); }
/* something sliding along the ground knocks over whatever it meets */
function sweep(e){
  for(const o of enemies){ if(o===e||!o.active||o.dead||o.gone) continue; const b=hitBox(o); if(!b) continue;
    if(Math.abs(o.x-e.x)<(o.w+e.w)/2&&b[0]<e.y+e.h&&b[0]+b[1]>e.y){
      if(o.K.boss){ damageBoss(o,3); killEnemy(e,'flip',-sgn(e.vx)); return true; }
      if(o.K.heavy) continue;
      killEnemy(o,'flip',sgn(e.vx)); addScore([500,800,1000,2000,4000,8000][Math.min(e.chain,5)],o.x,b[0]+b[1]); e.chain++; } }
  return false;
}
function explode(x,y){
  sfx.explode(); shake(0.4); flash(0.22); ring(x,y-0.3,'#ffd23e',3.6,0.4); burst(x,y,'#ff7a1f',14,8,0.2,0.6,true); burst(x,y,'#ffe14d',10,6,0.16,0.5,true); burst(x,y,'#3a2a55',8,5,0.2,0.7);
  for(const o of enemies){ if(!o.active||o.dead||o.gone) continue; const b=hitBox(o); if(!b) continue;
    if(Math.abs(o.x-x)<2.2+o.w/2&&b[0]<y+2.2&&b[0]+b[1]>y-2.2){ if(o.K.boss) damageBoss(o,3); else if(!o.K.heavy){ killEnemy(o,'flip',sgn(o.x-x)); addScore(500,o.x,b[0]+b[1]); } } }
  for(let ty=Math.floor(y-1.6);ty<=Math.floor(y+1.6);ty++) for(let tx=Math.floor(x-1.6);tx<=Math.floor(x+1.6);tx++) if(tileAt(tx,ty)===BRICK&&!L.contents.get(ty*W+tx)) breakBrick(tx,ty);
  const p=player; if(Math.abs(p.x-x)<1.9&&p.y<y+1.9&&p.y+p.h>y-1.9) hurtPlayer();
}

/* ---------- the first game's monsters ---------- */
defEnemy('blob',{stomp:true, init(e){ e.vx=-1.9; }, mesh:()=>G1('blob',mBlob), tick(e,dt){ walk(e,dt); },
  anim(e,m,dt,time){ m.rotation.y=(e.vx>0?1:-1)*0.8; m.rotation.z=Math.sin(time*11+e.x)*0.1; }});
defEnemy('spikit',{h:0.75,flip:true, init(e){ e.vx=-1.6; }, mesh:()=>G1('spikit',mSpikit), tick(e,dt){ walk(e,dt); },
  anim(e,m,dt,time){ m.rotation.y=(e.vx>0?1:-1)*0.8; m.rotation.z=Math.sin(time*14+e.x)*0.06; }});
function toShell(e){ e.shell=true; e.vx=0; e.h=0.62; e.shellT=0; e.kick=0.25; e.chain=0; const u=e.mesh.userData; u.slug.visible=false; u.shell.position.set(0,0,0); }
function fromShell(e){ e.shell=false; e.vx=player.x<e.x?-1.7:1.7; e.h=0.9; const u=e.mesh.userData; u.slug.visible=true; u.shell.position.set(0,1.4*S8,-0.9*S8); e.mesh.rotation.set(0,0,0); }
defEnemy('shellby',{h:0.9,stomp:true, init(e){ e.vx=-1.7; e.shellT=0; },
  mesh(){ const g=new T.Group(), u=g.userData; u.slug=vmesh('slug',mSlug); u.shell=vmesh('shell',mShell); u.shell.position.set(0,1.4*S8,-0.9*S8); g.add(u.slug,u.shell); return g; },
  stomped(e){ toShell(e); },
  tick(e,dt){ const hit=walk(e,dt);
    if(e.shell){ if(e.vx){ e.shellT=0; if(hit&&onScreen(e,1)) sfx.bump(); sweep(e); } else { e.shellT+=dt; if(e.shellT>7) fromShell(e); } } },
  anim(e,m,dt,time){
    if(e.shell){ if(e.vx) m.rotation.y+=dt*18*sgn(e.vx); m.rotation.z=e.shellT>5?Math.sin(time*40)*0.1:0; }
    else { m.rotation.y=(e.vx>0?1:-1)*1.1; m.rotation.z=0; m.position.y+=Math.abs(Math.sin(time*6+e.x))*0.03; } }});
defEnemy('batty',{h:0.7,stomp:true,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx||3; e.ry=d.ry||1; e.sp=d.sp||1.3; },
  mesh(){ const g=new T.Group(), u=g.userData; u.body=vmesh('batty',mBatty); u.wl=vmesh('wingL',()=>mWing(-1)); u.wr=vmesh('wingR',()=>mWing(1)); u.wl.position.set(-2.5*S8,3.2*S8,0); u.wr.position.set(2.5*S8,3.2*S8,0); g.add(u.body,u.wl,u.wr); return g; },
  tick(e){ e.x=e.ox+Math.sin(e.t*e.sp)*e.rx; e.y=e.oy+Math.sin(e.t*e.sp*2)*e.ry; },
  anim(e,m,dt,time){ const u=m.userData; u.wl.rotation.z=Math.sin(time*16+e.ox)*0.7; u.wr.rotation.z=-u.wl.rotation.z; m.rotation.y=Math.cos(e.t*e.sp)*0.5; }});
defEnemy('boing',{stomp:true,solo:true, init(e){ e.wait=0.8; }, mesh:()=>G1('boing',mBoing),
  tick(e,dt){ const p=player;
    if(e.onGround){ e.vx=0; e.wait-=dt; if(e.wait<=0){ e.vy=13; e.vx=(p.x<e.x?-1:1)*2.6; e.wait=1+Math.random()*0.7; e.onGround=false; } }
    const vx=e.vx; walk(e,dt); if(!e.onGround&&e.vx===-vx&&vx) e.vx=0; },
  anim(e,m){ const s=e.onGround?1-Math.max(0,0.45-e.wait)*0.6:1+clamp(e.vy,-6,8)*0.02, q=1/Math.sqrt(s); m.scale.set(q,s,q); m.rotation.y=(player.x>e.x?1:-1)*0.7; }});
defEnemy('chomper',{h:1.3,fly:true,heavy:false, init(e,d){ e.top=d.y; e.ext=0; e.ph=Math.random(); e.cy=0; }, mesh:()=>G1('chomper',mChomper),
  box:e=>e.ext<0.3?null:[e.top,e.ext*1.4], unroot(e){ e.y=e.top; },
  tick(e,dt){ const p=player; e.ph+=dt; e.y=e.top;
    if(e.cy===0){ if(e.ph>1.6&&Math.abs(p.x-e.x)>1.7){ e.cy=1; e.ph=0; } }
    else if(e.cy===1){ e.ext=Math.min(1,e.ph/0.6); if(e.ph>=0.6){ e.cy=2; e.ph=0; } }
    else if(e.cy===2){ if(e.ph>1.5){ e.cy=3; e.ph=0; } }
    else { e.ext=Math.max(0,1-e.ph/0.6); if(e.ph>=0.6){ e.cy=0; e.ph=0; } } },
  anim(e,m,dt,time){ m.position.set(e.x,e.top-1.55+e.ext*1.5,0); m.rotation.y=Math.sin(time*2+e.x)*0.35; m.scale.y=1+Math.sin(time*10)*0.05*e.ext; }});
defEnemy('prickle',{h:1.3,flip:false, init(e){ e.throwT=1+Math.random()*1.5; e.aim=false; }, mesh:()=>G1('prickle',mPrickle),
  /* stays put and lobs a seed at Blorp every few seconds */
  tick(e,dt){ const p=player; walk(e,dt); e.aim=Math.abs(p.x-e.x)<10&&!p.dead&&!p.goal;
    e.throwT-=dt; if(e.throwT<=0){ if(e.aim){ e.throwT=2.6; throwAt(e.x,e.y+e.h+0.2,clamp(p.x-e.x,-7,7),9.5,mSeed,'seed'); if(onScreen(e,1)) sfx.spit(); } else e.throwT=0.5; } },
  anim(e,m){ const k=e.aim&&e.throwT<0.4?1+(0.4-e.throwT)*0.6:1; m.scale.set(k,1/k,k); m.rotation.y=(player.x>e.x?1:-1)*0.6; }});
defEnemy('icicle',{w:0.6,h:1,fly:true,fireproof:false, init(e){ e.st=0; e.shakeT=0; }, mesh:()=>G1('icicle',mIcicle),
  /* hangs until Blorp walks underneath, wobbles, then drops and shatters */
  tick(e,dt){ const p=player;
    if(e.st===0){ if(Math.abs(p.x-e.x)<1.8&&p.y<e.y&&!p.dead){ e.st=1; e.shakeT=0.3; } }
    else if(e.st===1){ e.shakeT-=dt; if(e.shakeT<=0) e.st=2; }
    else { e.vy-=40*dt; if(e.vy<-MAX_FALL) e.vy=-MAX_FALL; const py=e.y; e.y+=e.vy*dt; const tx=Math.floor(e.x), ty=Math.floor(e.y);
      if(solidAt(tx,ty)||(semiAt(tx,ty)&&py>=ty+0.999)){ e.gone=true; burst(e.x,ty+1.1,'#dcf6ff',8,4,0.12,0.4); if(onScreen(e)) sfx.shatter(); } } },
  anim(e,m,dt,time){ m.rotation.z=e.st===1?Math.sin(time*50)*0.14:0; }});

/* ---------- new in the sequel ---------- */
/* Snippy the crab: quick, turns back at a ledge, and stops now and then to snap its claws */
defEnemy('snippy',{h:0.7,stomp:true, init(e){ e.vx=-3; e.rest=0; e.go=1.5+Math.random()*2; },
  mesh(){ const g=new T.Group(), u=g.userData; u.cl=vmesh('clawL',()=>mClaw(-1)); u.cr=vmesh('clawR',()=>mClaw(1)); u.cl.position.set(-3.4*S8,2.4*S8,0.6*S8); u.cr.position.set(3.4*S8,2.4*S8,0.6*S8); g.add(vmesh('snippy',mSnippy),u.cl,u.cr); return g; },
  tick(e,dt){
    if(e.rest>0){ e.rest-=dt; const v=e.vx; e.vx=0; walk(e,dt); e.vx=v; if(e.rest<=0) e.go=1.5+Math.random()*2.5; return; }
    if(ledgeAhead(e)) e.vx=-e.vx;
    walk(e,dt); e.go-=dt; if(e.go<=0&&e.onGround) e.rest=0.7; },
  anim(e,m,dt,time){ const u=m.userData, snap=e.rest>0?Math.abs(Math.sin(time*18))*0.9:0.15+Math.sin(time*9+e.x)*0.15; u.cl.rotation.z=snap; u.cr.rotation.z=-snap; m.position.y+=e.rest>0?0:Math.abs(Math.sin(time*16+e.x))*0.04; m.rotation.y=Math.sin(time*2+e.x)*0.12; }});
/* Wobbly the jellyfish: drifts up and down in the water; it stings from every side */
const jellyMat=voxMat({transparent:true,opacity:0.86,emissive:0x662255});
defEnemy('jelly',{h:0.9,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.ry=d.ry===undefined?1.6:d.ry; e.rx=d.rx||0; e.sp=d.sp||1; }, mesh:()=>G1('jelly',mJelly,jellyMat),
  tick(e){ const u=e.t*e.sp; e.y=e.oy+Math.sin(u)*e.ry; e.x=e.ox+Math.sin(u*0.5)*e.rx; },
  anim(e,m,dt,time){ const k=1+Math.sin(e.t*e.sp*2)*0.12; m.scale.set(1/k,k,1/k); m.rotation.y=Math.sin(time+e.ox)*0.3; }});
/* Puffer: swims to and fro, and blows itself up to twice the size when Blorp comes near */
defEnemy('puffer',{h:0.8,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx||3; e.sp=d.sp||0.8; e.puff=0; }, mesh:()=>G1('puffer',mPuffer),
  tick(e,dt){ const p=player, px=e.x; e.x=e.ox+Math.sin(e.t*e.sp)*e.rx; e.y=e.oy+Math.sin(e.t*2.1)*0.15; e.dir=e.x>=px?1:-1;
    const near=Math.abs(p.x-e.x)<3.4&&Math.abs(p.y-e.y)<3.2; e.puff=clamp(e.puff+(near?dt*3.5:-dt*1.2),0,1); const s=0.8+e.puff*0.75; e.w=s; e.h=s; },
  box:e=>[e.y-(e.h-0.8)/2,e.h],
  anim(e,m,dt,time){ const s=1+e.puff*0.9+Math.sin(time*5)*0.02; m.scale.setScalar(s); m.position.y=e.y-(s-1)*0.4; m.rotation.y=e.dir*1.1; }});
/* Snapper: a fish that leaps out of the water in an arc, again and again from the same spot. It can be stomped in the air.
   Its cousin the Emberling does the same out of lava, and cannot. */
function leaper(e,dt){
  if(e.wait>0){ e.wait-=dt; e.y=e.base; if(e.wait<=0){ e.vy=Math.sqrt(2*20*e.rise); if(onScreen(e,1)){ spray(e.x,L.liquidY>0&&e.base<L.liquidY?L.liquidY:e.base+1,e.K.glowing?'#ffb02e':'#bfeaff',6,4,e.K.glowing); if(!e.K.glowing) sfx.splash(); } } return; }
  e.vy-=20*dt; e.y+=e.vy*dt; if(e.y<=e.base&&e.vy<0){ e.y=e.base; e.wait=e.gap; }
}
defEnemy('snapper',{h:0.8,stomp:true,fly:true, init(e,d){ e.base=d.y-1.6; e.y=e.base; e.rise=(d.rise||5)+1.6; e.gap=d.gap||1.6; e.wait=(d.phase||0)+0.2+Math.random()*0.3; }, mesh:()=>G1('snapper',mSnapper),
  box:e=>e.wait>0?null:[e.y,e.h], tick:leaper,
  anim(e,m){ m.visible=e.wait<=0; m.rotation.set(0,0,0); m.rotation.x=-clamp(e.vy*0.12,-1.4,1.4)-Math.PI/2*0; m.rotation.z=0; m.rotation.x=-Math.PI/2*clamp(e.vy/9,-1,1); }});
defEnemy('ember',{h:0.8,fly:true,fireproof:true,heavy:true,glowing:true, init(e,d){ e.base=d.y-1.6; e.y=e.base; e.rise=(d.rise||5)+1.6; e.gap=d.gap||1.4; e.wait=(d.phase||0)+0.2+Math.random()*0.3; }, mesh:()=>G1('ember',mEmber,MAT.glow),
  box:e=>e.wait>0?null:[e.y,e.h], tick:leaper,
  anim(e,m,dt,time){ m.visible=e.wait<=0; m.rotation.z=e.vy<0?Math.PI:0; m.rotation.y=time*3; if(m.visible) glowAt(e.x,e.y+0.4,0.6,0xff7a1f,1.1,6); }});
/* Shyde the ghost: creeps up on Blorp while his back is turned, and hides its face when he looks */
const ghostMat=voxMat({transparent:true,opacity:0.88,emissive:0x444466});
defEnemy('ghost',{h:0.9,fly:true,heavy:true,fireproof:true, init(e){ e.shy=false; e.sx=1; },
  mesh(){ const g=new T.Group(), u=g.userData; u.hands=vmesh('ghostHands',mGhostHands,ghostMat); u.shy=vmesh('ghostShy',mGhostShy,ghostMat); const body=vmesh('ghost',mGhost,ghostMat); body.castShadow=u.hands.castShadow=u.shy.castShadow=false; g.add(body,u.hands,u.shy); return g; },
  tick(e,dt){ const p=player, dx=p.x-e.x, dy=p.y+p.h*0.4-e.y, d=Math.hypot(dx,dy)||1;
    e.shy=p.face*dx<0&&Math.abs(dx)>0.3; /* Blorp is facing it */
    if(!e.shy&&d<13&&!p.dead){ e.x+=dx/d*2.1*dt; e.y+=dy/d*2.1*dt; e.sx=dx<0?-1:1; if(onScreen(e)&&Math.random()<dt*0.25) sfx.ghost(); } },
  anim(e,m,dt,time){ const u=m.userData; u.hands.visible=!e.shy; u.shy.visible=e.shy; m.position.y=e.y+Math.sin(time*2.4+e.x)*0.1; m.rotation.y=e.sx*0.7; m.rotation.z=e.shy?0:Math.sin(time*5)*0.08; }});
/* Clonk: a slab of stone that waits overhead and drops when Blorp passes under. Its top is safe to bounce on. */
defEnemy('clonk',{w:1.9,h:2,fly:true,heavy:true,fireproof:true,bouncy:true, init(e,d){ e.oy=d.y; e.st=0; e.wait=0; }, mesh:()=>G1('clonk',mClonk),
  tick(e,dt){ const p=player;
    if(e.st===0){ if(Math.abs(p.x-e.x)<2.1&&p.y<e.y&&!p.dead&&e.wait<=0){ e.st=1; e.wait=0.28; } e.wait-=dt; }
    else if(e.st===1){ e.wait-=dt; if(e.wait<=0){ e.st=2; e.vy=0; } }
    else if(e.st===2){ e.vy=Math.max(-22,e.vy-70*dt); e.y+=e.vy*dt; const ty=Math.floor(e.y);
      if(solidAt(Math.floor(e.x-0.5),ty)||solidAt(Math.floor(e.x+0.5),ty)||e.y<0){ e.y=ty+1; e.st=3; e.wait=0.9; if(onScreen(e,2)){ sfx.clonk(); shake(0.3); dust(e.x-0.9,e.y,3,-1); dust(e.x+0.9,e.y,3,1); } } }
    else if(e.st===3){ e.wait-=dt; if(e.wait<=0) e.st=4; }
    else { e.y+=2.6*dt; if(e.y>=e.oy){ e.y=e.oy; e.st=0; e.wait=0.5; } } },
  anim(e,m,dt,time){ m.position.x=e.x+(e.st===1?Math.sin(time*60)*0.05:0); }});
/* a rocket from a cannon block: straight ahead until it meets a wall */
defEnemy('rocket',{h:0.7,stomp:true,fly:true, init(e,d){ e.vx=(d.dir||-1)*5.6; e.life=9; }, mesh:()=>G1('rocket',mRocket),
  tick(e,dt){ e.life-=dt; e.x+=e.vx*dt; if(solidAt(Math.floor(e.x+sgn(e.vx)*0.4),Math.floor(e.y+0.35))||e.life<=0){ e.gone=true; burst(e.x,e.y+0.35,'#ffffff',6,3,0.14,0.4); }
    if(Math.random()<dt*14) spawnPart(e.x-sgn(e.vx)*0.5,e.y+0.35,0,'#ffffff',0,0.3,0,0.4,0.12,-1); },
  anim(e,m,dt,time){ m.rotation.y=e.vx>0?Math.PI/2:-Math.PI/2; m.rotation.z=0; m.position.y=e.y+Math.sin(time*20)*0.02; }});
/* Fizzle: a walking bomb. Stomp it and the fuse is lit; then it can be kicked like a shell, and it goes off. */
defEnemy('fizzle',{h:0.85,stomp:true, init(e){ e.vx=-1.5; e.fuse=0; },
  mesh(){ const g=new T.Group(), u=g.userData; u.spark=new T.Mesh(partGeo,emberMat[1]); u.spark.scale.setScalar(0.16); u.spark.position.set(0,1.18,0); u.spark.visible=false; g.add(vmesh('fizzle',mFizzle),u.spark); return g; },
  stomped(e){ if(!e.shell){ e.shell=true; e.vx=0; e.fuse=3; e.kick=0.25; e.chain=0; sfx.fuse(); } },
  tick(e,dt){ walk(e,dt);
    if(e.shell){ e.fuse-=dt; if(e.vx&&sweep(e)) return; if(e.fuse<=0){ e.gone=true; explode(e.x,e.y+0.4); } } },
  anim(e,m,dt,time){ const u=m.userData; u.spark.visible=e.shell&&((time*16|0)%2===0);
    if(e.shell){ const k=1+Math.sin(time*(e.fuse<1?40:18))*0.06; m.scale.set(k,k,k); if(e.vx) m.rotation.y+=dt*12*sgn(e.vx); glowAt(e.x,e.y+1,0.5,0xffb02e,0.8,4); }
    else { m.rotation.y=(e.vx>0?1:-1)*0.8; m.rotation.z=Math.sin(time*9+e.x)*0.08; } }});
/* Zappy: a grumpy little storm cloud that hangs over Blorp and drops bolts. It can be stomped, if he can get above it. */
defEnemy('zappy',{h:0.75,stomp:true,fly:true, init(e,d){ e.oy=d.y; e.ox=d.x; e.rx=d.rx||6; e.zap=1.5+Math.random(); }, mesh:()=>G1('zappy',mZappy),
  tick(e,dt){ const p=player, tx=clamp(p.x,e.ox-e.rx,e.ox+e.rx); e.x+=clamp(tx-e.x,-1,1)*1.7*dt; e.y=e.oy+Math.sin(e.t*2)*0.2;
    e.zap-=dt; if(e.zap<=0){ e.zap=2.8; if(onScreen(e)){ throwAt(e.x,e.y-0.2,0,-3,mBolt,'bolt',{g:22,r:0.3,glow:true,col:'#ffe14d'}); sfx.zap(); flash(0.07); } } },
  anim(e,m,dt,time){ const k=e.zap<0.5?1+Math.sin(time*50)*0.08:1; m.scale.set(k,k,k); m.rotation.y=Math.sin(time*1.5+e.ox)*0.3; if(e.zap<0.5) glowAt(e.x,e.y,0.8,0xffe14d,1,5); }});
/* Bonk: plods about until it sees Blorp ahead on its level, then paws the ground and charges. It smashes bricks, and
   knocks itself silly on anything harder. */
defEnemy('rammy',{w:0.9,h:0.9,stomp:true, init(e){ e.vx=-1.2; e.st=0; e.stT=0; e.dir=-1; }, mesh:()=>G1('rammy',mRammy),
  tick(e,dt){ const p=player;
    if(e.st===0){ e.dir=e.vx<0?-1:1; if(ledgeAhead(e)) e.vx=-e.vx; walk(e,dt);
      if(e.onGround&&!p.dead&&(p.x-e.x)*e.dir>0.5&&Math.abs(p.x-e.x)<7.5&&Math.abs(p.y-e.y)<1.3){ e.st=1; e.stT=0.45; } }
    else if(e.st===1){ e.stT-=dt; const v=e.vx; e.vx=0; walk(e,dt); e.vx=v; if(e.stT<=0){ e.st=2; e.vx=e.dir*7.6; } }
    else if(e.st===2){ const tx=Math.floor(e.x+e.dir*(e.w/2+0.1)), ty=Math.floor(e.y+0.4);
      if(tileAt(tx,ty)===BRICK&&!L.contents.get(ty*W+tx)){ breakBrick(tx,ty); if(tileAt(tx,ty+1)===BRICK&&!L.contents.get((ty+1)*W+tx)) breakBrick(tx,ty+1); }
      else if(walk(e,dt)||ledgeAhead(e)){ e.st=3; e.stT=1.5; e.vx=0; if(onScreen(e,1)){ sfx.thud(); shake(0.15); } }
      else if(Math.random()<dt*20) dust(e.x-e.dir*0.4,e.y,1,-e.dir); }
    else { e.stT-=dt; walk(e,dt); if(e.stT<=0){ e.st=0; e.vx=-e.dir*1.2; } } },
  anim(e,m,dt,time){ m.rotation.y=e.dir*1.2; m.rotation.z=e.st===3?Math.sin(time*9)*0.2:0; m.rotation.x=e.st===1?0.25:e.st===2?0.12:0; m.position.y+=e.st===0?Math.abs(Math.sin(time*7+e.x))*0.04:0; }});

/* ---------- new in the third game ---------- */
/* Petalpuff: a dandelion clock with a face. It drifts after Blorp, slowly, and is a fine thing to bounce off. */
defEnemy('puff',{h:0.8,stomp:true,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx===undefined?4:d.rx; },
  mesh:()=>G1s('puff',mPuff), onKill(e){ sparkle(e.x,e.y+0.4,'#ffffff',8,2.4,0.08); },
  tick(e,dt){ const tx=clamp(player.x,e.ox-e.rx,e.ox+e.rx); e.x+=clamp(tx-e.x,-1,1)*0.9*dt; e.y=e.oy+Math.sin(e.t*1.6)*0.35; },
  anim(e,m,dt,time){ m.rotation.z=Math.sin(time*1.6+e.ox)*0.2; m.rotation.y=Math.sin(time*0.9+e.ox)*0.5; const k=1+Math.sin(time*3.2+e.ox)*0.04; m.scale.set(k,1/k,k); }});
/* Buzzby the bee: hangs about, takes aim with a shiver, dives straight at where Blorp was, and flies home */
defEnemy('buzz',{w:0.7,h:0.65,stomp:true,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.st=0; e.stT=0.8+Math.random(); e.dx=0; e.dy=0; e.face=-1; },
  mesh(){ const g=G1s('buzz',mBuzz), u=g.userData; u.wl=vmesh('buzzWL',()=>mBuzzWing(-1),MAT.soft); u.wr=vmesh('buzzWR',()=>mBuzzWing(1),MAT.soft);
    u.wl.position.set(-1.6*S8,5*S8,-0.4*S8); u.wr.position.set(1.6*S8,5*S8,-0.4*S8); u.wl.castShadow=u.wr.castShadow=false; g.add(u.wl,u.wr); return g; },
  tick(e,dt){ const p=player; e.stT-=dt;
    if(e.st===0){ e.x=e.ox+Math.sin(e.t*1.3)*0.8; e.y=e.oy+Math.sin(e.t*2.1)*0.3; e.face=p.x<e.x?-1:1;
      if(e.stT<=0&&!p.dead&&Math.abs(p.x-e.x)<6.5&&p.y<e.y+0.5&&e.y-p.y<7){ e.st=1; e.stT=0.55; if(onScreen(e)){ soundAt(e.x); sfx.buzz(); } } }
    else if(e.st===1){ if(e.stT<=0){ const dx=p.x-e.x, dy=p.y+p.h*0.5-e.y-0.3, d=Math.hypot(dx,dy)||1; e.dx=dx/d*9.5; e.dy=dy/d*9.5; e.st=2; e.stT=Math.min(1.1,d/9.5+0.25); e.face=dx<0?-1:1; } }
    else if(e.st===2){ e.x+=e.dx*dt; e.y+=e.dy*dt; if(e.stT<=0||e.y<1||solidAt(Math.floor(e.x),Math.floor(e.y+0.1))) e.st=3; }
    else { const dx=e.ox-e.x, dy=e.oy-e.y, d=Math.hypot(dx,dy); if(d<0.2){ e.st=0; e.stT=1.5; e.t=0; e.x=e.ox; e.y=e.oy; } else { e.x+=dx/d*3.2*dt; e.y+=dy/d*3.2*dt; e.face=dx<0?-1:1; } } },
  anim(e,m,dt,time){ const u=m.userData; u.wl.rotation.z=Math.sin(time*46+e.ox)*0.8; u.wr.rotation.z=-u.wl.rotation.z;
    m.rotation.y=e.face*1.2; m.rotation.x=e.st===2?0.5:0; m.position.x=e.x+(e.st===1?Math.sin(time*70)*0.05:0); }});
/* Gloop: a slow blob of honey. Stomp it and it comes apart into two small ones, which are quicker and hop. */
defEnemy('gloop',{h:0.75,stomp:true, init(e){ e.vx=-1.3; }, mesh:()=>G1s('gloop',mGloop),
  stomped(e){ e.gone=true; soundAt(e.x); sfx.splat(); spray(e.x,e.y+0.3,TH.stickyCol||'#ffb02e',8,5);
    for(const d of [-1,1]){ const k=spawnEnemy({type:'gloopling',x:e.x+d*0.32,y:e.y+0.1}); k.active=true; k.vx=d*2.6; k.vy=8; } },
  tick(e,dt){ if(ledgeAhead(e)) e.vx=-e.vx; walk(e,dt); },
  anim(e,m,dt,time){ const k=1+Math.sin(time*5+e.x)*0.08; m.scale.set(1/k,k,1/k); m.rotation.y=(e.vx>0?1:-1)*0.7; }});
defEnemy('gloopling',{w:0.5,h:0.42,stomp:true, init(e){ e.vx=(Math.random()<0.5?-1:1)*2.6; },
  mesh(){ const g=G1s('gloop',mGloop); g.children[0].scale.setScalar(0.55); return g; },
  tick(e,dt){ walk(e,dt); if(e.onGround&&Math.random()<dt*1.3){ e.vy=6.5; e.onGround=false; } },
  anim(e,m,dt,time){ const k=1+clamp(e.vy,-5,6)*0.03; m.scale.set(1/k,k,1/k); m.rotation.y=(e.vx>0?1:-1)*0.7; }});
/* Ribbit the frog: sits where he is put. When Blorp comes close on his level he croaks, and then out comes the tongue. Jump it. */
function tongueReach(e,max){ let n=0; while(n<max&&!solidAt(Math.floor(e.x+e.dir*(n+1)),Math.floor(e.y+0.45))) n++; return n; }
function tongueHits(e,from,len,y0,y1){ const p=player; if(p.dead||p.warp||p.star>0||len<=0.2) return false;
  const a=e.x+e.dir*from, b=e.x+e.dir*(from+len); return p.x+p.w/2>Math.min(a,b)&&p.x-p.w/2<Math.max(a,b)&&p.y<e.y+y1&&p.y+p.h>e.y+y0; }
defEnemy('ribbit',{h:0.7,stomp:true,solo:true, init(e){ e.st=0; e.stT=0.8+Math.random(); e.dir=-1; e.tl=0; e.reach=3.6; },
  mesh(){ const g=G1s('ribbit',mRibbit), u=g.userData; u.tongue=new T.Mesh(partGeo,pmatOf('#ff7aa8')); u.tongue.visible=false; g.add(u.tongue); return g; },
  tick(e,dt){ const p=player; walk(e,dt); e.stT-=dt;
    if(e.st===0){ e.tl=0; e.dir=p.x<e.x?-1:1; if(e.stT<=0&&e.onGround&&!p.dead&&Math.abs(p.x-e.x)<5.2&&Math.abs(p.y-e.y)<1.6){ e.st=1; e.stT=0.45; if(onScreen(e)){ soundAt(e.x); sfx.croak(); } } }
    else if(e.st===1){ if(e.stT<=0){ e.st=2; e.stT=0.5; e.reach=Math.min(3.6,tongueReach(e,4)); if(onScreen(e)){ soundAt(e.x); sfx.tongue(); } } }
    else { e.tl=Math.sin((1-e.stT/0.5)*Math.PI)*e.reach; if(tongueHits(e,0.4,e.tl,0.28,0.64)) hurtPlayer(); if(e.stT<=0){ e.st=0; e.stT=1.5+Math.random(); e.tl=0; } } },
  anim(e,m,dt,time){ const u=m.userData, t=u.tongue; m.rotation.y=0; m.scale.x=e.dir; t.visible=e.tl>0.05; if(t.visible){ t.position.set(0.4+e.tl/2,0.45,0.1); t.scale.set(e.tl,0.14,0.2); }
    const k=e.st===1?1+(0.45-e.stT)*0.5:1+Math.sin(time*3+e.x)*0.03; m.scale.y=k; m.scale.z=1/Math.sqrt(k); }});
/* Wisp: a will-o'-the-wisp that circles a spot for ever. Nothing but a star or a dash can put it out, and it lights the dark. */
defEnemy('wisp',{w:0.6,h:0.7,fly:true,heavy:true,fireproof:true,glowing:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx===undefined?2.5:d.rx; e.ry=d.ry===undefined?e.rx:d.ry; e.sp=d.sp||1.2; e.t=d.phase||0; },
  mesh:()=>G1s('wisp',mWisp,MAT.glow),
  tick(e){ e.x=e.ox+Math.cos(e.t*e.sp)*e.rx; e.y=e.oy+Math.sin(e.t*e.sp)*e.ry; },
  anim(e,m,dt,time){ m.rotation.y=time*2; const k=1+Math.sin(time*9+e.ox)*0.1; m.scale.set(k,k,k); glowAt(e.x,e.y+0.35,0.6,TH.wispCol||0x9ff0ff,1,6);
    if(Math.random()<dt*9) spawnPart(e.x+(Math.random()-0.5)*0.3,e.y+0.3,0.1,'#e6fdff',0,0.4,0,0.4,0.07,-0.6,true); }});
/* Swoop: perches in the air, and when Blorp walks under its beat, swoops down across it in a long U and perches at the far end */
defEnemy('swoop',{w:0.9,h:0.7,stomp:true,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.span=d.span||10; e.st=0; e.stT=0.6; e.dir=d.dir||-1; e.depth=4; e.u=0; },
  mesh(){ const g=G1s('swoop',mSwoop), u=g.userData, wl=skinOf('swoopWL',()=>mSwoopWing(-1)), wr=skinOf('swoopWR',()=>mSwoopWing(1));
    u.wl=vmesh(wl[0],wl[1]); u.wr=vmesh(wr[0],wr[1]); u.wl.position.set(-2*S8,3.4*S8,-0.4*S8); u.wr.position.set(2*S8,3.4*S8,-0.4*S8); g.add(u.wl,u.wr); return g; },
  tick(e,dt){ const p=player; e.stT-=dt;
    if(e.st===0){ e.x=e.ox; e.y=e.oy+Math.sin(e.t*2.4)*0.25;
      if(e.stT<=0&&!p.dead&&Math.abs(p.x-(e.ox+e.dir*e.span*0.5))<e.span*0.5+2&&p.y<e.oy){ e.st=1; e.u=0; e.depth=clamp(e.oy-(p.y+0.5),1.5,9); if(onScreen(e,3)){ soundAt(e.x); sfx.caw(); } } }
    else { e.u+=dt/1.9; const u=Math.min(1,e.u); e.x=e.ox+e.dir*e.span*u; e.y=e.oy-e.depth*4*u*(1-u); if(u>=1){ e.ox=e.x; e.dir=-e.dir; e.st=0; e.stT=1.1; } } },
  anim(e,m,dt,time){ const u=m.userData, f=e.st?Math.sin(time*9)*0.25-0.3:Math.sin(time*13+e.ox)*0.7; u.wl.rotation.z=f; u.wr.rotation.z=-f;
    m.rotation.y=e.dir*Math.PI/2; m.rotation.x=e.st?(e.u<0.5?0.5:-0.4):0; }});
/* Rattles: a skeleton that walks its beat. A stomp only knocks it into a heap, and before long the heap gets up again. */
defEnemy('bones',{h:0.9,stomp:true,fireproof:true, init(e){ e.vx=-1.5; e.down=0; },
  mesh(){ const g=new T.Group(), u=g.userData, q=skinOf('bones',mBones); u.up=vmesh(q[0],q[1]); u.pile=vmesh('bonePile',mBonePile); u.pile.visible=false; g.add(u.up,u.pile); return g; },
  box:e=>e.down>0?null:[e.y,e.h],
  stomped(e){ e.down=4.5; burst(e.x,e.y+0.5,'#f2eedf',6,4,0.12,0.5); if(onScreen(e,1)){ soundAt(e.x); sfx.rattle(); } },
  tick(e,dt){ if(e.down>0){ e.down-=dt; const v=e.vx; e.vx=0; walk(e,dt); e.vx=v; if(e.down<=0){ e.down=0; if(onScreen(e,1)){ soundAt(e.x); sfx.rattle(); } } return; }
    if(ledgeAhead(e)) e.vx=-e.vx; walk(e,dt); },
  anim(e,m,dt,time){ const u=m.userData; u.up.visible=e.down<=0; u.pile.visible=e.down>0; m.rotation.y=(e.vx>0?1:-1)*0.8;
    if(e.down>0&&e.down<1) m.position.x=e.x+Math.sin(time*50)*0.03; else if(e.down<=0) m.rotation.z=Math.sin(time*10+e.x)*0.08; }});
/* A roller, let out of a chute: a barrel, a boulder, a pumpkin. It rolls until it meets a wall. Its top is safe to hop on; its front is not. */
defEnemy('roller',{w:0.85,h:0.85,heavy:true,bouncy:true,fireproof:true, init(e,d){ e.vx=(d.dir||-1)*3.6; e.life=14; e.rot=0; e.from=-1; },
  mesh:()=>G1s('roller',mRoller),
  tick(e,dt){ e.life-=dt; const vy=e.vy;
    if(walk(e,dt)||e.life<=0){ e.gone=true; burst(e.x,e.y+0.4,TH.rollerCol||'#b5793f',8,5,0.16,0.5); if(onScreen(e)){ soundAt(e.x); sfx.brk(); } return; }
    if(e.onGround&&vy<-7){ e.vy=-vy*0.3; e.onGround=false; if(onScreen(e)){ soundAt(e.x); sfx.roll(); } }
    e.rot-=e.vx*dt*2.3; if(e.onGround&&Math.random()<dt*8) dust(e.x-sgn(e.vx)*0.3,e.y,1,-sgn(e.vx)); },
  anim(e,m){ m.position.y=e.y+0.44; m.rotation.z=e.rot; }});
/* Mimic: looks like a block that has fallen on the floor. Come close and it opens its eye, grows feet, and comes hopping. */
defEnemy('mimic',{w:0.9,h:0.95,stomp:true,solo:true, init(e){ e.st=0; e.stT=0; },
  mesh(){ const g=new T.Group(), u=g.userData; u.shut=vmesh('mimicShut',mMimicShut); u.open=vmesh('mimic',mMimic); u.open.visible=false; g.add(u.shut,u.open); return g; },
  tick(e,dt){ const p=player;
    if(e.st===0){ walk(e,dt); if(!p.dead&&Math.abs(p.x-e.x)<2.6&&Math.abs(p.y-e.y)<2.5){ e.st=1; e.stT=0.4; if(onScreen(e)){ soundAt(e.x); sfx.chomp(); } } return; }
    e.stT-=dt;
    if(e.onGround){ e.vx=0; if(e.stT<=0){ e.vy=11; e.vx=(p.x<e.x?-1:1)*4.4; e.onGround=false; e.stT=0.75; } }
    const vx=e.vx; walk(e,dt); if(!e.onGround&&e.vx===-vx&&vx) e.vx=0; },
  anim(e,m,dt,time){ const u=m.userData; u.shut.visible=e.st===0; u.open.visible=e.st!==0; if(e.st){ const k=e.onGround?1-Math.max(0,0.3-e.stT)*0.8:1+clamp(e.vy,-6,8)*0.02; m.scale.set(1/Math.sqrt(k),k,1/Math.sqrt(k)); m.rotation.y=(player.x>e.x?1:-1)*0.5; } }});
/* Zapbot: a little flying machine that keeps level with Blorp and, after three bleeps, shoots straight across */
function mShotBolt(){ return [[-3,-0.6,-0.6,6,1.2,1.2,'#ff4f7b'],[-2,-0.3,-0.9,4,0.6,1.8,'#ffd0dc']]; }
defEnemy('drone',{h:0.7,stomp:true,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.ry=d.ry===undefined?2:d.ry; e.fire=1.4+Math.random(); e.dir=-1; },
  mesh(){ const g=G1s('drone',mDrone), u=g.userData; u.rotor=vmesh('rotor',mRotor,MAT.soft); u.rotor.castShadow=false; u.rotor.position.y=7.4*S8; g.add(u.rotor); return g; },
  tick(e,dt){ const p=player, was=e.fire; e.x=e.ox+Math.sin(e.t*0.9)*0.5; const ty=clamp(p.y+0.2,e.oy-e.ry,e.oy+e.ry); e.y+=clamp(ty-e.y,-1,1)*1.6*dt; e.dir=p.x<e.x?-1:1;
    e.fire-=dt; if(was>=0.5&&e.fire<0.5&&onScreen(e)){ soundAt(e.x); sfx.bleep(); }
    if(e.fire<=0){ if(onScreen(e)&&!p.dead&&Math.abs(p.x-e.x)>1.5){ e.fire=2.8; throwAt(e.x+e.dir*0.5,e.y+0.3,e.dir*7.5,0,mShotBolt,'dbolt',{g:0,r:0.26,glow:true,col:'#ff4f7b',flat:true,life:3}); soundAt(e.x); sfx.shot(); } else e.fire=0.6; } },
  anim(e,m,dt,time){ m.userData.rotor.rotation.y=time*30; m.rotation.y=e.dir*0.9; m.rotation.z=Math.sin(time*3+e.ox)*0.08; if(e.fire<0.5) glowAt(e.x,e.y+0.3,0.6,0xff4f7b,1,4); }});
/* Totter: three little faces standing on one another's heads. Each stomp takes the top one off. */
const STACK_COLS=['#ff8f5c','#ffc928','#5fd0c0'];
defEnemy('stack',{w:0.75,h:1.5,stomp:true, init(e){ e.vx=-1.1; e.n=3; },
  mesh(){ const g=new T.Group(), c=TH.stackCols||STACK_COLS; g.userData.seg=[]; for(let i=0;i<3;i++){ const m=vmesh('stack'+c[i],()=>mStackSeg(c[i])); m.position.y=i*0.5; g.add(m); g.userData.seg.push(m); } return g; },
  stomped(e){ e.n--; burst(e.x,e.y+e.h,(TH.stackCols||STACK_COLS)[Math.max(0,e.n)],6,4,0.14,0.5); if(e.n<=0) killEnemy(e,'squish'); else e.h=e.n*0.5; },
  tick(e,dt){ if(ledgeAhead(e)) e.vx=-e.vx; walk(e,dt); },
  anim(e,m,dt,time){ m.userData.seg.forEach((q,i)=>{ q.visible=i<e.n; q.rotation.y=(e.vx>0?1:-1)*0.8+Math.sin(time*3+i*1.7)*0.25; q.position.x=Math.sin(time*5+i)*0.03*i; }); }});
/* a saw on a track: there and back along a line, for ever. Not to be touched from any side. */
defEnemy('saw',{w:0.8,h:0.8,fly:true,heavy:true,fireproof:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx||0; e.ry=d.ry||0; e.sp=d.sp||1.2; e.t=d.phase||0; },
  mesh:()=>G1s('saw',mSaw),
  tick(e){ const u=0.5-0.5*Math.cos(e.t*e.sp); e.x=e.ox+u*e.rx; e.y=e.oy+u*e.ry; },
  anim(e,m,dt,time){ m.position.y=e.y+0.4; m.rotation.z=-time*9; if(Math.random()<dt*6) spawnPart(e.x,e.y+0.1,0.3,'#fff3a0',(Math.random()-0.5)*4,2+Math.random()*2,0,0.25,0.06,14,true); }});
/* a balloon: harmless, and good for one bounce. It pops, and a little later another floats up in its place. */
const BALLOON_COLS=['#ff4f7b','#ffc928','#2fd6c3','#b58cff','#ff8f3c'];
defEnemy('balloon',{w:0.8,h:0.9,fly:true,heavy:true,fireproof:true,bouncy:true,harmless:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.pop=0; e.col=d.col||BALLOON_COLS[Math.floor(d.x)%5]; },
  mesh:e=>G1('balloon'+e.col,()=>mBalloonE(e.col)),
  box:e=>e.pop>0?null:[e.y,e.h],
  bounced(e){ e.pop=3; sfx.pop(); burst(e.x,e.y+0.5,e.col,8,5,0.12,0.4); },
  tick(e,dt){ if(e.pop>0){ e.pop-=dt; return; } e.y=e.oy+Math.sin(e.t*1.4+e.ox)*0.15; },
  anim(e,m,dt,time){ m.visible=e.pop<=0; m.rotation.z=Math.sin(time*1.7+e.ox)*0.1; const k=e.pop<=0?Math.min(1,(e.popUp=(e.popUp||0)+dt*3)):((e.popUp=0),0.01); m.scale.setScalar(k); }});
/* Smudge: Blorp's own shadow, got loose. It does exactly what he did a moment ago, so he had better not stand about. It
   gives up once he is past `until`. */
const SHADE_N=48;
const shadeMat=voxMat({transparent:true,opacity:0.82,emissive:0x110a22});
defEnemy('shade',{w:0.6,h:0.9,fly:true,heavy:true,fireproof:true, init(e,d){ e.hist=new Float32Array(SHADE_N*2).fill(-99); e.hi=0; e.acc=0; e.live=false; e.until=d.until||1e9; e.face=1; },
  mesh(){ const g=G1('shade',mShade,shadeMat); g.add(vmesh('shadeEye',mShadeEye,MAT.glow)); g.children[0].castShadow=false; return g; },
  box:e=>e.live?[e.y,e.h]:null,
  tick(e,dt){ const p=player; if(p.x>e.until){ e.gone=true; puff(e.x,e.y+0.5,'#33265c',8,0.2,0.8); return; }
    e.acc+=dt; while(e.acc>=1/30){ e.acc-=1/30; e.hist[e.hi*2]=p.x; e.hist[e.hi*2+1]=p.y; e.hi=(e.hi+1)%SHADE_N; }
    const x=e.hist[e.hi*2], y=e.hist[e.hi*2+1]; if(x<-90) return;
    if(!e.live){ e.live=true; e.x=x; e.y=y; } if(Math.abs(x-e.x)>0.01) e.face=x>e.x?1:-1; e.x+=(x-e.x)*Math.min(1,dt*22); e.y+=(y-e.y)*Math.min(1,dt*22); },
  anim(e,m,dt,time){ m.visible=e.live; m.rotation.y=e.face*0.95; if(e.live&&Math.random()<dt*14) spawnPart(e.x+(Math.random()-0.5)*0.5,e.y+Math.random()*0.8,0.2,'#33265c',0,0.6,0,0.45,0.1,-0.8); }});

/* ---------- bosses ---------- */
function bossInit(e,d){ e.w=2.2; e.h=2.4; e.hp=d.hp||9; e.hp0=e.hp; e.inv=0; e.x0=d.x0; e.x1=d.x1; e.t=0; e.st='walk'; e.stT=2; e.n=0; e.vx=0; e.dir=-1; }
const BOSS_NAMES={apple:'Granny Smash',croak:'King Croak',razzle:'Ringmaster Razzle',wokbot:'Wokbot 3000',baron:'Baron Blackout'};
/* what the clear screen says once each is beaten */
const BOSS_LINES={apple:'Granny Smash rolls off down the hill, and a jar of sun sparks rolls out of her basket.',croak:'King Croak hiccups up a jar of sun sparks and sinks under the lilies.',
  razzle:'The Ringmaster bows, drops a jar of sun sparks, and is shot out of his own cannon.',wokbot:'Wokbot 3000 boils over. In the pot, among the noodles: a jar of sun sparks.',baron:'The Baron is beaten, and the sun is free.'};
function bossAppears(){ musicStart(L.boss.kind==='baron'?'baron':'boss'); sfx.bossRoar(); popup(player.x+3,7.5,BOSS_NAMES[L.boss.kind]+'!','#ffc928'); shake(0.2); jolt(0.014); }
function damageBoss(e,n){
  if(e.inv>0||e.dead) return;
  e.hp-=n; e.inv=n>=3?1.1:0.3; sfx.bossHit(); shake(0.2); jolt(0.012); G.hitstop=0.07; burst(e.x,e.y+e.h*0.6,'#ffc928',10,5,0.16,0.6,true); ring(e.x,e.y+e.h*0.6,'#ffe14d',3,0.35,true);
  if(e.K.hurt) e.K.hurt(e);
  if(e.hp<=0){
    e.dead=true; e.flip=true; e.vy=13; e.vx=0; G.bossDead=true; G.winT=0; G.fountain=0; G.bossX=clamp(e.x,e.x0,e.x1); addScore(5000,e.x,e.y+e.h);
    for(const b of bombs) b.gone=true; for(const w of waves) w.life=0; for(const o of enemies) if(o!==e&&o.active&&!o.dead&&!o.K.heavy) killEnemy(o,'flip',1);
    musicStop(); sfx.bossDown(); shake(0.4); flash(0.3); jolt(0.03); ripple(e.x,e.y+1,0.03,0.7,0.8);
    for(let i=0;i<4;i++) burst(e.x+(Math.random()-0.5)*2,e.y+1+Math.random()*1.5,pick(Math.random,['#7d3fd1','#ffc928','#ff4f7b','#ffffff']),10,7,0.2,1,true);
    confetti(e.x,e.y+2,40,9); if(e.K.down) e.K.down(e);
  }
}
/* gravity and the arena's walls for a boss that walks; true on the frame it lands hard */
function bossMove(e,dt){
  e.vy-=40*dt*GRAV; if(e.vy<-MAX_FALL) e.vy=-MAX_FALL;
  let wall=moveX(e,e.vx*dt); if(e.x<e.x0){ e.x=e.x0; wall=true; } else if(e.x>e.x1){ e.x=e.x1; wall=true; }
  const wasAir=!e.onGround, fv=e.vy, r=moveY(e,e.vy*dt); let thud=false;
  if(r===1){ if(wasAir&&fv<-8){ thud=true; shake(0.3); sfx.thud(); dust(e.x-1,e.y,3,-1); dust(e.x+1,e.y,3,1); } e.vy=0; e.onGround=true; } else { if(r===2) e.vy=0; e.onGround=false; }
  e.wall=wall; return thud;
}
const bossBlink=(e,m,time)=>{ m.visible=!(e.inv>0&&((time*24|0)%2)); };
const bossMesh=(key,f,scale)=>()=>{ const g=new T.Group(), m=vmesh(key,f); m.scale.setScalar(scale||2.2); g.add(m); return g; };
/* A boss is fought in an arena: flat floor from x0 to x1, walls at both ends at least four tiles high, and nothing over
   it for nine tiles. Each takes a stomp when it is open to one; `spiky` says that just now it is not. */
const bossStars=(e,time)=>{ if(Math.random()<0.25) spawnPart(e.x+Math.cos(time*6)*1.1,e.y+e.h+0.3,Math.sin(time*6)*0.8,'#ffe14d',0,0,0,0.25,0.11,0,true); };
/* Granny Smash: a toffee apple the size of a cart. She rolls from wall to wall, and every wall she hits shakes apples
   out of the trees. Rolling, she cannot be stomped and has to be jumped; after the last wall she sits there seeing stars. */
defEnemy('apple',{boss:true,heavy:true,
  init(e,d){ bossInit(e,d); e.w=2.1; e.h=2.1; e.st='idle'; e.stT=1.6; e.rot=0; e.spiky=false; },
  mesh:bossMesh('apple',mBossApple,2.2),
  tick(e,dt){ const p=player, rage=(e.hp0-e.hp)/e.hp0; e.inv=Math.max(0,e.inv-dt); e.stT-=dt;
    if(e.st==='walk') e.st='idle';
    if(e.st==='idle'){ e.vx=0; e.spiky=e.hp<e.hp0; e.dir=p.x<e.x?-1:1; if(e.stT<=0&&e.onGround){ e.st='wind'; e.stT=0.7; e.spiky=true; sfx.bossRoar(); } }
    else if(e.st==='wind'){ if(e.stT<=0){ e.st='roll'; e.n=2+(rage>0.5?1:0); e.vx=e.dir*(6.4+rage*3); e.spiky=true; } }
    else if(e.st==='dizzy'){ e.vx=0; e.spiky=false; if(e.stT<=0){ e.st='idle'; e.stT=0.5; } }
    const thud=bossMove(e,dt);
    if(e.st==='roll'){ e.rot-=e.vx*dt/1.1; if(Math.random()<dt*20) dust(e.x-sgn(e.vx)*0.8,e.y,1,-sgn(e.vx));
      if(e.wall){ shake(0.35); sfx.thud(); ripple(e.x,e.y+1,0.02,0.5,0.5); e.n--;
        /* apples out of the trees: one aimed at Blorp, the rest scattered */
        const k=1+Math.round(rage*2); for(let i=0;i<=k;i++){ const ax=clamp(i?e.x0+1+Math.random()*(e.x1-e.x0-2):p.x+(Math.random()-0.5),e.x0+1,e.x1-1); throwAt(ax,12.5+i*1.3,0,-1,mAppleBomb,'abomb',{g:17,r:0.36,col:'#e8384f'}); }
        if(e.n<=0){ e.st='dizzy'; e.stT=2.4-rage*0.7; e.vx=0; } else { e.dir=-e.dir; e.vx=e.dir*(6.4+rage*3); } } } },
  hurt(e){ e.st='wind'; e.stT=0.8; e.vx=0; e.spiky=true; e.dir=player.x<e.x?-1:1; },
  anim(e,m,dt,time){ const q=m.children[0]; q.position.y=1.1; q.rotation.z=e.st==='roll'?e.rot:e.st==='wind'?Math.sin(time*40)*0.06-e.dir*0.25:e.st==='dizzy'?Math.sin(time*5)*0.2:0;
    q.rotation.y=e.st==='roll'?0:(e.dir||-1)*0.5; if(e.st==='dizzy') bossStars(e,time); const k=e.st==='idle'?1+Math.sin(time*6)*0.03:1; q.scale.set(2.2/k,2.2*k,2.2/k); bossBlink(e,m,time); }});
/* King Croak: sits and stares; opens wide and lets fly a tongue as long as the room, which has to be jumped, and is then
   out of puff for a good while; or leaps the length of the pond to land on Blorp (the landing sends ripples), and squats
   a moment where he lands. Out of puff or squatting, his head is safe to land on; the rest of the time his crown is not. */
defEnemy('croak',{boss:true,heavy:true,
  init(e,d){ bossInit(e,d); e.w=2.5; e.h=1.9; e.st='sit'; e.stT=1.2; e.tl=0; e.reach=8; e.fled=0; },
  mesh(){ const g=new T.Group(), m=vmesh('croak',mBossCroak), t=new T.Mesh(partGeo,pmatOf('#ff7aa8')); m.scale.setScalar(2.6); t.visible=false; g.add(m,t); g.userData.tongue=t; return g; },
  tick(e,dt){ const p=player, rage=(e.hp0-e.hp)/e.hp0; e.inv=Math.max(0,e.inv-dt); e.stT-=dt;
    if(e.st==='walk') e.st='sit';
    e.spiky=e.st!=='puffed'&&e.st!=='squat';
    if(e.st==='sit'){ e.vx=0; e.tl=0; e.dir=p.x<e.x?-1:1;
      if(e.stT<=0&&e.onGround){ if(e.n++%2===1||Math.abs(p.x-e.x)<2.5){ e.st='leap'; e.fled=0; e.vy=17+rage*2; e.vx=clamp((p.x-e.x)/1.05,-9,9); e.onGround=false; sfx.croak(); }
        else { e.st='gape'; e.stT=0.7-rage*0.2; sfx.croak(); } } }
    else if(e.st==='gape'){ if(e.stT<=0){ e.st='lash'; e.stT=0.6; e.reach=Math.min(11,tongueReach(e,12)-1); sfx.tongue(); } }
    else if(e.st==='lash'){ e.tl=Math.sin((1-e.stT/0.6)*Math.PI)*e.reach; if(tongueHits(e,1.2,e.tl,0.55,1.05)) hurtPlayer(); if(e.stT<=0){ e.st='puffed'; e.stT=3-rage*0.9; e.tl=0; } }
    else if(e.st==='puffed'||e.st==='squat'){ e.vx=0; if(e.stT<=0){ e.st='sit'; e.stT=0.8-rage*0.3; } }
    const thud=bossMove(e,dt);
    if(e.st==='leap'&&e.onGround){ e.vx=0; if(e.fled){ e.st='sit'; e.stT=0.9; } else { e.st='squat'; e.stT=1-rage*0.3; } if(thud){ ripple(e.x,e.y,0.02,0.5,0.5); if(rage>0.3&&!e.fled) shockwave(e.x,e.y); } } },
  hurt(e){ if(e.onGround){ e.st='leap'; e.fled=1; e.vy=15; e.vx=(e.x-(e.x0+e.x1)/2>0?-1:1)*7; e.onGround=false; e.tl=0; } },
  anim(e,m,dt,time){ const q=m.children[0], t=m.userData.tongue; q.scale.set(2.6*e.dir*-1*-1,2.6,2.6); q.scale.x=2.6*(e.dir<0?-1:1); t.visible=e.tl>0.05;
    if(t.visible){ t.position.set(e.dir*(1.2+e.tl/2),0.8,0.2); t.scale.set(e.tl,0.36,0.4); }
    const k=e.st==='gape'?1.12:e.st==='puffed'?0.9+Math.sin(time*9)*0.04:e.st==='squat'?0.82:e.onGround?1+Math.sin(time*3)*0.03:1.1; q.scale.y=2.6*k; if(e.st==='puffed'||e.st==='squat') bossStars(e,time); bossBlink(e,m,time); }});
/* Ringmaster Razzle: bounces round the ring on a great ball, juggling as he goes and throwing what he juggles. Every so
   often he slips off, and sits on the sawdust wondering where the ball went. */
defEnemy('razzle',{boss:true,heavy:true,
  init(e,d){ bossInit(e,d); e.w=1.9; e.h=3; e.st='ride'; e.stT=0; e.dir=-1; e.n=0; e.rot=0; },
  mesh(){ const g=new T.Group(), b=vmesh('razzleBall',mRazzleBall), m=vmesh('razzle',mBossRazzle); b.scale.setScalar(1.25); m.scale.setScalar(1.25); g.add(m,b); g.userData.ball=b; g.userData.man=m; return g; },
  tick(e,dt){ const p=player, rage=(e.hp0-e.hp)/e.hp0; e.inv=Math.max(0,e.inv-dt); e.stT-=dt;
    if(e.st==='walk') e.st='ride';
    if(e.st==='ride'){ e.vx=e.dir*(3.1+rage*1.8); e.h=3;
      if(e.onGround){ e.n++; e.vy=12.5; e.onGround=false;
        if(e.n%5===0){ e.st='down'; e.stT=2.2-rage*0.7; e.vx=0; e.vy=6; e.h=1.7; sfx.thud(); }
        else if(e.n%2===0&&!p.dead){ const k=rage>0.5?[-2.5,0,2.5]:[-1.5,1.5]; for(const o of k) throwAt(e.x,e.y+3,clamp((p.x-e.x)/1.1+o,-9,9),10,mJuggleBall,'jball',{r:0.36,col:'#ff4f7b'}); sfx.spit(); } } }
    else if(e.st==='down'){ e.vx=0; if(e.stT<=0&&e.onGround){ e.st='ride'; e.vy=12; e.onGround=false; e.dir=p.x<e.x?-1:1; } }
    bossMove(e,dt); if(e.wall&&e.st==='ride') e.dir=-e.dir; e.rot-=e.vx*dt/0.8; },
  hurt(e){ e.st='ride'; e.n=1; e.vy=13; e.onGround=false; e.dir=player.x<e.x?-1:1; },
  anim(e,m,dt,time){ const u=m.userData, riding=e.st==='ride'; u.ball.position.set(riding?0:1.4,0.74,riding?0:-0.4); u.ball.rotation.z=e.rot;
    u.man.position.y=riding?1.45:0; u.man.rotation.y=(player.x>e.x?1:-1)*0.6; u.man.rotation.z=riding?Math.sin(time*7)*0.12:Math.sin(time*5)*0.2; if(!riding) bossStars(e,time); bossBlink(e,m,time); }});
/* Wokbot 3000: plods after Blorp with its wok too hot to touch, tosses flaming dumplings, then sweeps the floor with a
   beam that has to be jumped. That overheats it, and while it vents, its head is safe to land on. */
defEnemy('wokbot',{boss:true,heavy:true,
  init(e,d){ bossInit(e,d); e.w=2.4; e.h=2.7; e.st='walk'; e.stT=1.4; e.spiky=true; e.dir=-1; e.beam=0; e.reach=0; },
  mesh(){ const g=new T.Group(), m=vmesh('wokbot',mBossWok), nd=vmesh('wokNoodles',mWokNoodles), bm=new T.Mesh(partGeo,pmatOf('#ff3b6b',true)), core=new T.Mesh(partGeo,pmatOf('#ffffff',true));
    m.scale.setScalar(2.2); nd.scale.setScalar(2.2); bm.visible=core.visible=false; g.add(m,nd,bm,core); Object.assign(g.userData,{bot:m,nd,bm,core}); return g; },
  tick(e,dt){ const p=player, rage=(e.hp0-e.hp)/e.hp0; e.inv=Math.max(0,e.inv-dt); e.stT-=dt; e.beam=0;
    if(e.st==='walk'){ e.spiky=true; e.dir=p.x<e.x?-1:1; if(e.onGround) e.vx+=(e.dir*(1.3+rage)-e.vx)*Math.min(1,dt*3); if(e.stT<=0){ e.st='toss'; e.stT=0.9+rage*0.4; e.n=0; e.vx=0; } }
    else if(e.st==='toss'){ const want=2+Math.round(rage*2), due=Math.floor((0.9+rage*0.4-e.stT)/0.3); if(due>e.n&&e.n<want&&!p.dead){ e.n++; throwAt(e.x,e.y+3.2,clamp((p.x-e.x)/1.15+(e.n-1.5)*1.6,-9,9),11.5,mFireball,'fball',{r:0.36,glow:true,col:'#ff7a1f'}); sfx.fire(); }
      if(e.stT<=0){ e.st='aim'; e.stT=0.95-rage*0.25; e.dir=p.x<e.x?-1:1; e.reach=tongueReach(e,30); sfx.bleep(); } }
    else if(e.st==='aim'){ e.beam=-1; if(e.stT<=0){ e.st='beam'; e.stT=0.34; sfx.laser(); flash(0.08); } }
    else if(e.st==='beam'){ e.beam=1; if(tongueHits(e,1.2,e.reach-1.2,0,0.6)) hurtPlayer(); if(e.stT<=0){ e.st='vent'; e.stT=2.8-rage*0.9; sfx.geyser(); } }
    else if(e.st==='vent'){ e.spiky=false; e.vx=0; if(e.stT<=0){ e.st='walk'; e.stT=1.4-rage*0.5; } }
    bossMove(e,dt); },
  hurt(e){ e.st='walk'; e.stT=1.1; e.spiky=true; },
  anim(e,m,dt,time){ const u=m.userData; u.bot.rotation.y=u.nd.rotation.y=e.dir*0.6; u.bot.rotation.z=e.st==='vent'?Math.sin(time*30)*0.03:e.onGround&&e.st==='walk'?Math.sin(time*7)*0.05:0;
    u.nd.visible=e.st!=='vent'; u.bm.visible=e.beam!==0&&(e.beam>0||((time*16|0)%2===0)); u.core.visible=e.beam>0;
    if(u.bm.visible){ const ln=Math.max(0.1,e.reach-1.2), th=e.beam>0?0.34+Math.sin(time*50)*0.05:0.05; u.bm.position.set(e.dir*(1.2+ln/2),0.32,0.3); u.bm.scale.set(ln,th,th); u.core.position.copy(u.bm.position); u.core.scale.set(ln,th*0.4,th*0.6); if(e.beam>0) glowAt(e.x+e.dir*4,e.y+0.4,0.8,0xff3b6b,1.5,9); }
    if(e.st==='vent'){ if(Math.random()<dt*30) puff(e.x+(Math.random()-0.5)*1.4,e.y+2.6,'#ffffff',1,0.22,2.4); bossStars(e,time); }
    else if(e.spiky&&Math.random()<dt*10) spawnPart(e.x+(Math.random()-0.5)*1.8,e.y+2.8,0.3,'#ffb02e',0,1.5,0,0.4,0.09,-2,true);
    bossBlink(e,m,time); }});
/* Baron Blackout, on his thundercloud. He hangs out of reach raining dark on Blorp; snuffs the lights; and then cannot
   resist a swoop to gloat, which leaves him low and winded. Three moods: the second adds the dark, the third bolts of it. */
let baronDark=0, dawn=-1;
defEnemy('baron',{boss:true,heavy:true,fly:true,
  init(e,d){ bossInit(e,d); e.w=2.3; e.h=2.7; e.st='drift'; e.stT=1.6; e.y=8.4; e.orb=1.2; e.dir=-1; e.dark=0; e.cols=null; baronDark=0; dawn=-1; },
  mesh(){ const g=new T.Group(), m=vmesh('baron',mBossBaron), c=vmesh('baronCloud',mBaronCloud), s=vmesh('baronSnuffer',mBaronSnuffer); m.scale.setScalar(2.1); c.scale.setScalar(2.1); s.scale.setScalar(2.1); m.position.y=0.5; s.position.set(1.5,0.9,0.4); g.add(c,m,s); Object.assign(g.userData,{man:m,cloud:c,snuf:s}); return g; },
  box:e=>[e.y+0.4,e.h],
  tick(e,dt){ const p=player, rage=(e.hp0-e.hp)/e.hp0, mood=rage<0.34?0:rage<0.67?1:2; e.inv=Math.max(0,e.inv-dt); e.stT-=dt; e.dark=Math.max(0,e.dark-dt);
    if(e.st==='walk') e.st='drift';
    if(e.st==='drift'){ e.dir=p.x<e.x?-1:1; e.x+=clamp(p.x-e.x,-1,1)*(2.6+rage*2)*dt; e.x=clamp(e.x,e.x0,e.x1); e.y+=(8.4-e.y)*Math.min(1,dt*3);
      e.orb-=dt; if(e.orb<=0&&!p.dead){ e.orb=1.25-rage*0.5; throwAt(e.x,e.y+0.2,clamp((p.x-e.x)*0.5,-3,3),-1,mDarkOrb,'dorb',{g:15,r:0.36,glow:true,col:'#8a5cf0'}); sfx.spit(); }
      /* between swoops: a downpour of dark; later the snuffer as well; last of all, bolts called down in a row */
      if(e.stT<=0){ const turn=e.n++, k=(turn>>1)%(mood+1);
        if(turn&1){ e.st='aim'; e.stT=0.7; sfx.ghost(); }
        else if(k===0){ e.st='pour'; e.stT=1.6; e.orb=0; }
        else if(k===1){ e.st='snuff'; e.stT=0.9; sfx.dark(); }
        else { e.st='call'; e.stT=0.95; e.cols=[p.x,p.x-3.2,p.x+3.2,p.x-6.4,p.x+6.4]; sfx.bleep(); } } }
    else if(e.st==='pour'){ e.x+=clamp(p.x-e.x,-1,1)*(3.4+rage*2)*dt; e.x=clamp(e.x,e.x0,e.x1); e.orb-=dt;
      if(e.orb<=0&&!p.dead){ e.orb=0.3; throwAt(e.x+(Math.random()-0.5)*1.6,e.y+0.2,(Math.random()-0.5)*4,-1,mDarkOrb,'dorb',{g:15,r:0.36,glow:true,col:'#8a5cf0'}); sfx.spit(); }
      if(e.stT<=0){ e.st='drift'; e.stT=1.2; } }
    else if(e.st==='snuff'){ if(e.stT<=0){ e.dark=6; e.st='drift'; e.stT=1.6; } }
    else if(e.st==='call'){ for(const c of e.cols) if(Math.random()<dt*30) spawnPart(c+(Math.random()-0.5)*0.5,2.1,0.2,'#b58cff',0,2+Math.random()*2,0,0.3,0.1,0,true);
      if(e.stT<=0){ for(const c of e.cols) throwAt(c,11.5,0,-16,mDarkOrb,'dorb',{g:0,r:0.36,glow:true,col:'#8a5cf0',scale:1.4}); sfx.zap(); flash(0.2); e.st='drift'; e.stT=1.5; } }
    else if(e.st==='aim'){ if(e.stT<=0){ e.st='swoop'; e.stT=0; e.sx=e.x; e.ex=clamp(p.x+(p.x-e.x>0?1:-1)*5,e.x0,e.x1); e.sy=e.y; } }
    else if(e.st==='swoop'){ const u=Math.min(1,-e.stT/(1.5-rage*0.4)), k=2*u-1; e.x=lerp(e.sx,e.ex,u); e.y=1.7+(e.sy-1.7)*k*k*(u<0.5?1:0.2); if(u>=1){ e.st='tired'; e.stT=2.3-rage*0.7; } }
    else if(e.st==='tired'){ e.y+=(1.6-e.y)*Math.min(1,dt*6); if(e.stT<=0){ e.st='drift'; e.stT=1.6-rage*0.6; } }
    baronDark=e.dark>0?Math.min(1,e.dark,(6-e.dark)*2):0; },
  hurt(e){ e.st='drift'; e.stT=1.6; e.dark=Math.min(e.dark,0.5); },
  down(){ dawn=0; baronDark=0; sfx.dawn(); },
  anim(e,m,dt,time){ const u=m.userData; m.position.y=e.y+(e.st==='tired'?0:Math.sin(time*3)*0.14); u.man.rotation.y=(player.x>e.x?1:-1)*0.5; u.man.rotation.z=e.st==='tired'?Math.sin(time*8)*0.14:e.st==='aim'?Math.sin(time*40)*0.05:0;
    u.snuf.rotation.z=e.st==='snuff'?-1.2+Math.sin(time*20)*0.1:e.st==='call'?0.9:-0.2; u.cloud.rotation.y=Math.sin(time*1.3)*0.1;
    if(e.st==='tired') bossStars(e,time); else if(Math.random()<dt*8) spawnPart(e.x+(Math.random()-0.5)*2.4,e.y+0.3,0.2,'#4a3f6b',0,-0.8,0,0.5,0.14,-0.5);
    bossBlink(e,m,time); }});

/* ---------- the loops ---------- */
function updateEnemies(dt){
  let anyGone=false;
  for(const e of enemies){
    if(e.gone){ anyGone=true; continue; }
    if(!e.active){ if(Math.abs(e.x-camX)<viewHalfW+2.5&&Math.abs(e.y-camY)<V*0.5+5) e.active=true; else continue; }
    if(e.dead){ if(e.flip){ e.vy-=45*dt; e.x+=e.vx*dt; e.y+=e.vy*dt; if(e.y<room.y0-7) e.gone=true; } else { e.deadT-=dt; if(e.deadT<=0) e.gone=true; } continue; }
    e.t+=dt; e.kick=Math.max(0,e.kick-dt);
    e.K.tick(e,dt);
    if(e.y<-6) e.gone=true;
  }
  /* walkers turn around when they meet */
  const lone=e=>!e.active||e.dead||e.gone||e.K.fly||e.K.boss||e.K.solo||e.shell;
  for(let i=0;i<enemies.length;i++){ const a=enemies[i]; if(lone(a)) continue;
    for(let j=i+1;j<enemies.length;j++){ const b=enemies[j]; if(lone(b)) continue;
      if(Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-b.y)<0.6){ const l=a.x<b.x?a:b, r=l===a?b:a; if(l.vx>0) l.vx=-l.vx; if(r.vx<0) r.vx=-r.vx; } } }
  if(anyGone){ for(const e of enemies) if(e.gone) world.remove(e.mesh); enemies=enemies.filter(e=>!e.gone); }
}
function stompBounce(top){ const p=player; p.y=top; p.vy=15; p.jumping=true; p.springHold=false; p.gHold=28.125; p.gFall=98.4; p.onGround=false; p.pound=0; p.airJumps=p.form===3?1:0; p.dashUsed=false; }
function playerVsEnemies(){
  const p=player; if(p.dead||p.goal||p.warp||p.pod) return;
  for(const e of enemies){
    if(!e.active||e.dead||e.gone) continue;
    const b=hitBox(e); if(!b) continue; const ey=b[0], eh=b[1], K=e.K;
    if(!(Math.abs(p.x-e.x)<(p.w+e.w)/2-0.06&&p.y<ey+eh&&p.y+p.h>ey)) continue;
    if(K.harmless&&!(K.bouncy&&p.vy<0&&p.y>ey+eh*0.4)) continue;
    if(p.star>0||p.dash>0){
      if(K.boss){ if(p.dash>0){ p.dash=0; p.vx=-p.dashDir*6; p.vy=7; p.inv=Math.max(p.inv,0.5); } damageBoss(e,3); }
      else if(!K.heavy||K.glowing){ killEnemy(e,'flip',sgn(e.x-p.x)); comboScore(e.x,ey+eh); G.hitstop=0.03; }
      else if(p.dash>0){ p.dash=0; p.vx=-p.dashDir*5; p.vy=6; p.inv=Math.max(p.inv,0.3); sfx.bump(); }
      continue; }
    const above=p.vy<0&&p.y>ey+eh*0.4&&!p.swim;
    if(e.shell){
      if(e.vx===0){ if(e.kick<=0){ e.vx=(p.x<e.x?1:-1)*10; e.kick=0.3; e.chain=0; sfx.kick(); addScore(400,e.x,e.y+e.h); if(above){ p.y=ey+eh; p.vy=8; p.pound=0; } } }
      else if(above){ e.vx=0; e.kick=0.3; stompBounce(ey+eh); sfx.stomp(p.combo); comboScore(e.x,ey+eh); }
      else if(e.kick<=0) hurtPlayer();
      continue;
    }
    if(K.boss){
      if(above&&!e.spiky){ stompBounce(ey+eh); if(e.inv<=0) damageBoss(e,3); }
      else if(e.inv<0.6) hurtPlayer();
      continue;
    }
    if(above&&K.bouncy){ stompBounce(ey+eh); if(K.bounced) K.bounced(e); else sfx.bump(); continue; }
    if(above&&K.stomp){
      const through=p.pound===2&&!K.stomped;
      if(K.stomped){ K.stomped(e); sfx.stomp(p.combo); } else killEnemy(e,'squish');
      if(!through) stompBounce(ey+eh);
      comboScore(e.x,ey+eh); G.hitstop=0.04;
    } else hurtPlayer();
  }
}
