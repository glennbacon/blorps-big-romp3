/* ================= play: physics and rules ================= */
/* Walking, running, skidding and jumping use the NES Super Mario Bros. speeds and gravities, converted from pixels per
   frame to tiles per second, as in the first game. The wall kick, ground pound, swimming and glide are new. */
const WALK_MAX=5.86,RUN_MAX=9.61,WALK_ACC=8.35,RUN_ACC=12.5,REL_DEC=11.4,SKID_DEC=22.9,MIN_V=0.28,MAX_FALL=15,STEP=1/120;
const G={state:'title',levelIdx:0,open:0,score:0,coins:0,lives:3,cp:false,time:0,bossDead:false,bossSeen:false,winT:0,cardT:0,goalT:0,fountain:0,sparks:[],under:false,hitstop:0,coinT:0,coinRun:0,swCool:0,beatT:0,riseT:0};
const input={left:false,right:false,jump:false,run:false,down:false,jumpBuf:0,runEdge:false,downEdge:false};
const player={x:3.5,y:2,vx:0,vy:0,w:0.7,h:0.9,form:0,prevForm:0,face:1,onGround:true,jumping:false,coyote:0,inv:0,star:0,dead:false,deadT:0,goal:null,
  walkPh:0,idleT:0,combo:0,riding:null,gHold:28.125,gFall:98.4,airMax:WALK_MAX,springHold:false,growT:0,fireCool:0,skid:false,squash:0,
  swim:false,stroke:0,wall:0,wallSide:0,wallT:0,wallLock:0,pound:0,poundT:0,airJumps:0,glide:false,warp:null,pod:null,launchT:0,dustT:0,flapT:0,
  dash:0,dashDir:1,dashCool:0,dashUsed:false,sticky:false,geyser:false};
const COMBO=[100,200,400,800,1000,2000,4000,8000];
const togHold=new Set(); /* red or blue tiles that turned solid around Blorp: they wait until he has stepped out */

function setSize(){ player.h=player.form>0?1.75:0.9; }
function resetPlayer(x,y){
  const p=player; p.x=x; p.y=y; p.vx=0; p.vy=0; p.face=1; p.onGround=true; p.jumping=false; p.coyote=0; p.inv=0; p.star=0; p.dead=false; p.deadT=0; p.goal=null;
  p.walkPh=0; p.idleT=0; p.combo=0; p.riding=null; p.springHold=false; p.growT=0; p.fireCool=0; p.skid=false; p.squash=0; p.gHold=28.125; p.gFall=98.4; p.airMax=WALK_MAX;
  p.swim=false; p.stroke=0; p.wall=0; p.wallSide=0; p.wallT=0; p.wallLock=0; p.pound=0; p.poundT=0; p.airJumps=0; p.glide=false; p.warp=null; p.pod=null; p.launchT=0; p.dustT=0; p.flapT=0;
  p.dash=0; p.dashDir=1; p.dashCool=0; p.dashUsed=false; p.sticky=false; p.geyser=false;
  setSize(); proot.visible=true; proot.rotation.set(0,0.95,0); camLead=1.5; focusY=y; setRoom();
}
/* the room Blorp is in; false if it has not changed */
function setRoom(){ const p=player; for(const r of L.rooms) if(p.x>=r.x0&&p.x<r.x1&&p.y>=r.y0-3&&p.y<r.y1+3){ if(room===r) return false; room=r; return true; } if(!room) room=L.rooms[0]; return false; }
function addScore(n,x,y){ G.score+=n; if(x!==undefined) popup(x,y+0.45,String(n)); }
function gainLife(x,y){ G.lives++; popup(x,y+0.6,'1UP','#7dffb0'); sfx.oneup(); }
function addCoin(){ G.coins++; if(G.coins>=100){ G.coins-=100; gainLife(player.x,player.y+player.h); } }
function comboScore(x,y){ const p=player; if(p.combo>=COMBO.length) gainLife(x,y); else addScore(COMBO[p.combo],x,y); p.combo++; }
/* the moon sparks already banked, one bit each, per level */
function sparkHad(level,i){ return ((G.sparks[level]|0)>>i)&1; }
function sparkCount(level){ const b=G.sparks[level]|0; return (b&1)+((b>>1)&1)+((b>>2)&1); }
function sparkTotal(){ let n=0; for(let i=0;i<LEVELS.length;i++) n+=sparkCount(i); return n; }

/* ---------- tile collision ---------- */
function moveX(e,dx){
  if(!dx) return false;
  e.x+=dx; const y0=Math.floor(e.y+0.02), y1=Math.floor(e.y+e.h-0.02);
  if(dx>0){ const tx=Math.floor(e.x+e.w/2); for(let ty=y0;ty<=y1;ty++) if(solidAt(tx,ty)&&!held(tx,ty)){ e.x=tx-e.w/2-0.001; return true; } }
  else { const tx=Math.floor(e.x-e.w/2); for(let ty=y0;ty<=y1;ty++) if(solidAt(tx,ty)&&!held(tx,ty)){ e.x=tx+1+e.w/2+0.001; return true; } }
  return false;
}
function moveY(e,dy){
  const py=e.y; e.y+=dy; const x0=Math.floor(e.x-e.w/2+0.002), x1=Math.floor(e.x+e.w/2-0.002);
  if(dy<=0){ const ty=Math.floor(e.y); for(let tx=x0;tx<=x1;tx++) if((solidAt(tx,ty)&&!held(tx,ty))||(semiAt(tx,ty)&&py>=ty+0.999)){ e.y=ty+1; return 1; } }
  else { const ty=Math.floor(e.y+e.h); for(let tx=x0;tx<=x1;tx++) if(solidAt(tx,ty)&&!held(tx,ty)){ e.y=ty-e.h-0.001; return 2; } }
  return 0;
}
const held=(tx,ty)=>togHold.size>0&&togHold.has(ty*W+tx);
/* how fast the belt under something carries it, or 0 */
function beltAt(e){ const id=tileAt(Math.floor(e.x),Math.floor(e.y-0.5)); return id===CONV_L?-3.2:id===CONV_R?3.2:0; }

/* ---------- blocks ---------- */
function bumpAnim(key){ const m=blockMesh.get(key); if(!m) return; for(const b of bumps) if(b.mesh===m){ b.t=0; return; } bumps.push({mesh:m,t:0,y:Math.floor(key/W)+0.5}); }
function makeUsed(tx,ty){ const k=ty*W+tx; tiles[k]=USED; const m=blockMesh.get(k); if(m) m.material=usedArr; }
function collectCoin(tx,ty){
  const k=ty*W+tx; if(tiles[k]!==COIN) return; tiles[k]=AIR; const i=coinIdx.get(k); if(i!==undefined) coinPos[i].on=false;
  /* coins picked up one after another ring up a scale */
  G.coinRun=G.coinT>0?G.coinRun+1:0; G.coinT=0.5;
  addCoin(); G.score+=200; sfx.coin(G.coinRun); burst(tx+0.5,ty+0.5,'#fff0a8',4,2.5,0.09,0.3,true);
}
function spawnItem(kind,tx,ty){
  const f={muffin:mMuffin,chili:mChili,fluff:mFluff,sunbloom:mSunbloom,star:mStar,heart:mHeart}[kind];
  const it={kind,x:tx+0.5,y:ty,baseY:ty,vx:0,vy:0,w:0.7,h:0.7,emerge:0.7,mesh:vmesh(kind,f)};
  it.mesh.position.set(it.x,it.y,0); world.add(it.mesh); items.push(it); sfx.sprout();
}
function releaseContent(tx,ty,c){
  if(c==='coin'){ addCoin(); G.score+=200; coinPop(tx+0.5,ty+1.2); sfx.coin(0); }
  else if(c==='power') spawnItem(player.form===0?'muffin':'chili',tx,ty);
  else if(c==='fluff') spawnItem(player.form===0?'muffin':'fluff',tx,ty);
  else if(c==='sun') spawnItem(player.form===0?'muffin':'sunbloom',tx,ty);
  else if(c==='star') spawnItem('star',tx,ty);
  else if(c==='life') spawnItem('heart',tx,ty);
}
function hitAbove(tx,ty){
  for(const e of enemies){ if(!e.active||e.dead||e.gone||e.K.heavy) continue;
    if(e.y>=ty+0.9&&e.y<ty+1.35&&Math.abs(e.x-(tx+0.5))<0.5+e.w/2){ killEnemy(e,'flip',sgn(e.x-player.x)); addScore(100,e.x,e.y+e.h); } }
  for(const it of items){ if(it.emerge<=0&&it.y>=ty+0.9&&it.y<ty+1.3&&Math.abs(it.x-(tx+0.5))<0.85){ it.vy=9; if(it.vx) it.vx=Math.abs(it.vx)*sgn(it.x-(tx+0.5)); } }
  if(tileAt(tx,ty+1)===COIN) collectCoin(tx,ty+1);
}
function breakBrick(tx,ty){
  const k=ty*W+tx; tiles[k]=AIR; const m=blockMesh.get(k); if(m){ world.remove(m); blockMesh.delete(k); }
  for(const b of bumps) if(b.mesh===m) b.t=9;
  addScore(50); sfx.brk(); shake(0.12);
  const c=TH.brick;
  for(let i=0;i<8;i++) spawnPart(tx+0.25+(i%2)*0.5,ty+0.25+((i>>1)%2)*0.5,(i>>2)*0.5-0.25,c[i%3],(i%2?1:-1)*(2+Math.random()*2.5),7+Math.random()*5,(Math.random()-0.5)*4,0.9,0.3,36);
  puff(tx+0.5,ty+0.5,c[2],4,0.2,0.4);
}
/* The switch flips every red and blue block. A block that would close on Blorp waits for him; one that closes on a
   monster squashes it. */
function flipSwitch(quiet){
  if(G.swCool>0) return; G.swCool=0.3; swOn=!swOn; restyleToggles(); if(quiet){ if(Math.abs(player.x-camX)<viewHalfW) sfx.beat(swOn); } else { sfx.switchOn(); flash(0.06); }
  const p=player, turned=swOn?RED:BLUE;
  for(let ty=Math.floor(p.y);ty<=Math.floor(p.y+p.h);ty++) for(let tx=Math.floor(p.x-p.w/2);tx<=Math.floor(p.x+p.w/2);tx++) if(tileAt(tx,ty)===turned) togHold.add(ty*W+tx);
  for(const e of enemies){ if(!e.active||e.dead||e.gone||e.K.heavy||e.K.fly) continue; if(tileAt(Math.floor(e.x),Math.floor(e.y+e.h*0.5))===turned){ killEnemy(e,'flip',1); addScore(200,e.x,e.y+e.h); } }
}
/* Blorp's head has met a block from below, or he has pounded one from above */
function bumpBlock(tx,ty,fromAbove){
  const id=tileAt(tx,ty), k=ty*W+tx, p=player;
  if(id===BRICK){
    const c=L.contents.get(k);
    if(c==='multi'){ let n=multi.has(k)?multi.get(k):8; n--; multi.set(k,n); releaseContent(tx,ty,'coin'); if(n<=0) makeUsed(tx,ty); bumpAnim(k); if(!fromAbove) hitAbove(tx,ty); }
    else if(c){ releaseContent(tx,ty,c); makeUsed(tx,ty); bumpAnim(k); if(!fromAbove) hitAbove(tx,ty); }
    else if(p.form>0){ if(!fromAbove) hitAbove(tx,ty); breakBrick(tx,ty); return true; }
    else { bumpAnim(k); if(!fromAbove) hitAbove(tx,ty); sfx.bump(); }
  } else if(id===QBLOCK||id===HIDDEN){
    const c=L.contents.get(k)||'coin';
    if(id===HIDDEN) addBlock(tx,ty,USED);
    makeUsed(tx,ty); releaseContent(tx,ty,c); bumpAnim(k); if(!fromAbove) hitAbove(tx,ty);
  } else if(id===SWITCH){ bumpAnim(k); flipSwitch(); }
  else if(id===CRUMBLE&&fromAbove){ startCrumble(tx,ty,0.05); }
  else if(!fromAbove) sfx.bump();
  return false;
}
/* crumbling blocks: stood on, they shake, give way, and grow back a few seconds later */
function startCrumble(tx,ty,t){ const k=ty*W+tx; if(!crumbles.has(k)) crumbles.set(k,{t:t===undefined?0.5:t,st:1,tx,ty}); }
function updateCrumbles(dt){
  const p=player;
  for(const [k,c] of crumbles){
    c.t-=dt; const m=blockMesh.get(k);
    if(c.st===1){ if(m) m.position.x=c.tx+0.5+Math.sin(c.t*90)*0.03;
      if(c.t<=0){ c.st=2; c.t=4.5; tiles[k]=AIR; if(m){ m.visible=false; m.position.x=c.tx+0.5; }
        if(Math.abs(c.tx-camX)<viewHalfW+2){ sfx.crumble(); for(let i=0;i<5;i++) spawnPart(c.tx+0.2+Math.random()*0.6,c.ty+0.3+Math.random()*0.5,(Math.random()-0.5)*0.6,i%2?'#e8c58a':'#a8824a',(Math.random()-0.5)*2,1+Math.random()*2,(Math.random()-0.5)*2,0.7,0.24,30); } } }
    else if(c.t<=0&&!(p.x+p.w/2>c.tx&&p.x-p.w/2<c.tx+1&&p.y<c.ty+1&&p.y+p.h>c.ty)){ tiles[k]=CRUMBLE; if(m){ m.visible=true; bumps.push({mesh:m,t:0,y:c.ty+0.5}); } crumbles.delete(k); }
  }
}

/* ---------- player ---------- */
function doJump(){
  const p=player, sp=Math.abs(p.vx);
  if(sp<3.75){ p.vy=15.5; p.gHold=28.125; p.gFall=98.4; }
  else if(sp<8.67){ p.vy=15.5; p.gHold=26.37; p.gFall=84.4; }
  else { p.vy=19; p.gHold=35.16; p.gFall=126.6; }
  if(p.sticky){ p.vy*=0.74; sfx.squelch(); } /* honey holds on to his feet */
  p.jumping=true; p.onGround=false; p.coyote=0; p.riding=null; p.springHold=false; p.geyser=false; input.jumpBuf=0;
  p.airMax=sp>WALK_MAX+0.2?RUN_MAX:WALK_MAX; sfx.jump(p.form>0); dust(p.x,p.y,2,0);
}
/* kick off a wall: up and away, with a moment during which the stick cannot cancel it */
function wallKick(){
  const p=player, s=p.wallSide;
  p.vx=-s*8.4; p.vy=15.6; p.gHold=28.125; p.gFall=98.4; p.face=-s; p.jumping=true; p.springHold=false; p.wallLock=0.17; p.wallT=0; p.wall=0; p.airMax=RUN_MAX; input.jumpBuf=0;
  if(p.form===3) p.airJumps=1;
  sfx.wallKick(); for(let i=0;i<4;i++) dust(p.x+s*p.w/2,p.y+0.2+i*0.2,1,-s);
}
/* the fluff form's second jump, in mid-air */
function airJump(){
  const p=player; p.airJumps--; p.vy=14.2; p.gHold=28.125; p.gFall=98.4; p.jumping=true; p.springHold=false; p.flapT=0.4; input.jumpBuf=0; if(p.airMax<WALK_MAX+1) p.airMax=WALK_MAX+1;
  sfx.jump2(); for(let i=0;i<6;i++) spawnPart(p.x+(Math.random()-0.5)*0.7,p.y+0.1,(Math.random()-0.5)*0.5,'#ffffff',(Math.random()-0.5)*2.5,-1-Math.random()*2,(Math.random()-0.5),0.45,0.16,3);
}
function playerUp(p,dy){
  const prevTop=p.y+p.h; p.y+=dy;
  const ty=Math.floor(p.y+p.h), xl=p.x-p.w/2, xr=p.x+p.w/2, txl=Math.floor(xl+0.002), txr=Math.floor(xr-0.002);
  const hs=tx=>(solidAt(tx,ty)&&!held(tx,ty))||(tileAt(tx,ty)===HIDDEN&&prevTop<=ty+0.02);
  const sl=hs(txl), sr=txr!==txl&&hs(txr);
  if(!sl&&!sr) return;
  /* clipping a block's corner slides you around it, as in the original */
  if(sl&&!sr&&txr!==txl){ const ov=txl+1-xl; if(ov<0.26){ p.x+=ov+0.003; return; } }
  if(sr&&!sl){ const ov=xr-txr; if(ov<0.26){ p.x-=ov+0.003; return; } }
  p.y=ty-p.h-0.001; p.vy=-1; p.jumping=false; p.springHold=false;
  const tc=Math.floor(p.x); bumpBlock(hs(tc)?tc:(sl?txl:txr),ty);
}
function hurtPlayer(){
  const p=player; if(p.inv>0||p.star>0||p.dead||p.goal||p.warp||G.bossDead) return;
  if(p.form>0){ p.prevForm=p.form; p.form=p.form>1?1:0; setSize(); p.inv=2.2; p.growT=0.5; p.pound=0; p.dash=0; sfx.hurt(); shake(0.15); jolt(0.012); }
  else killPlayer();
}
function killPlayer(){
  const p=player; if(p.dead) return;
  p.dead=true; p.deadT=0; p.vy=15; p.vx=0; p.star=0; p.riding=null; p.pound=0; p.swim=false; p.wall=0; p.pod=null; p.dash=0; musicStop(); sfx.die(); jolt(0.02);
}
function shoot(){
  const p=player; if(shots.length>=2) return;
  p.fireCool=0.2; const m=new T.Mesh(partGeo,fireMat); m.scale.setScalar(0.3); world.add(m);
  shots.push({x:p.x+p.face*0.45,y:p.y+p.h*0.5,vx:p.face*13,vy:-2,life:2.5,mesh:m}); sfx.fire();
}
/* The sun form's dash: a burst straight ahead that gravity cannot touch. It bowls over anything that can be bowled
   over, knocks the stuffing out of blocks it meets side on, and can be done once more in the air. */
function startDash(){
  const p=player, d=(input.right?1:0)-(input.left?1:0)||p.face;
  p.dash=0.2; p.dashDir=d; p.face=d; p.dashCool=0.5; if(!p.onGround) p.dashUsed=true; p.vy=0; p.glide=false; p.wall=0; p.jumping=false; p.springHold=false; p.skid=false;
  sfx.dash(); ring(p.x,p.y+p.h*0.5,'#ffe14d',1.8,0.3,true); sparkle(p.x,p.y+p.h*0.5,'#fff3a0',6,3);
}
/* a dashing Blorp has met a wall: whatever blocks are in his way take it as a bump; true if he broke through */
function dashHit(){
  const p=player, tx=Math.floor(p.x+p.dashDir*(p.w/2+0.08)); let any=0, broke=0;
  for(let ty=Math.floor(p.y+0.05);ty<=Math.floor(p.y+p.h-0.05);ty++){ const id=tileAt(tx,ty);
    if(id===BRICK||id===QBLOCK||id===SWITCH||id===CRUMBLE){ any++; if(bumpBlock(tx,ty,true)) broke++; } else if(solidAt(tx,ty)) any=99; }
  return broke>0&&broke===any;
}
function collectItem(it){
  const p=player; it.gone=true;
  const become=f=>{ if(p.form!==f){ p.prevForm=p.form; p.form=f; setSize(); p.growT=0.6; } addScore(1000,it.x,it.y+0.6); sfx.power(); };
  if(it.kind==='muffin'){ if(p.form===0) become(1); else { addScore(1000,it.x,it.y+0.6); sfx.power(); } }
  else if(it.kind==='chili') become(2);
  else if(it.kind==='fluff'){ become(3); p.airJumps=1; }
  else if(it.kind==='sunbloom'){ become(4); ring(p.x,p.y+0.8,'#ffe14d',3,0.5,true); sparkle(p.x,p.y+0.8,'#fff3a0',14,4); }
  else if(it.kind==='star'){ p.star=10; addScore(1000,it.x,it.y+0.6); sfx.power(); musicRate(1.35); }
  else gainLife(it.x,it.y+0.4);
  sparkle(it.x,it.y+0.4,'#fff3a0',10,3.2);
}
function startGoal(){
  const p=player, gx=L.goal.x, gy=L.goal.y+1;
  p.goal='slide'; p.vx=0; p.vy=0; p.x=gx+0.5-0.4; p.y=clamp(p.y,gy,gy+8.2); p.star=0; p.inv=0; p.face=1; p.riding=null; p.onGround=false; p.pound=0; p.wall=0; p.glide=false;
  const hgt=p.y-gy; addScore(hgt>=7?5000:hgt>=5?2000:hgt>=3?800:hgt>=1.5?400:100,p.x,p.y+p.h);
  p.dash=0; musicStop(); sfx.slide(); G.goalT=0;
}
function updateGoal(dt){
  const p=player, gx=L.goal.x, gy=L.goal.y+1;
  if(p.goal==='slide'){
    p.y=Math.max(gy,p.y-7*dt); if(flagMesh) flagMesh.position.y=Math.max(gy+0.3,flagMesh.position.y-7*dt);
    if(p.y<=gy&&(!flagMesh||flagMesh.position.y<=gy+0.3)){ G.goalT+=dt; if(G.goalT>0.35){ p.goal='walk'; p.x=gx+1.2; sfx.clear(); G.fountain=0; } }
  } else if(p.goal==='walk'){
    p.vx=4; p.vy-=60*dt; if(p.vy<-MAX_FALL) p.vy=-MAX_FALL; moveX(p,p.vx*dt);
    if(moveY(p,p.vy*dt)===1){ p.vy=0; p.onGround=true; } else p.onGround=false;
    /* fireworks over the hut while he walks to it */
    G.fountain-=dt; if(G.fountain<=0){ G.fountain=0.22; const fx_=gx+3+Math.random()*7, fy=gy+5+Math.random()*4, c=pick(Math.random,['#ffe14d','#ff4f7b','#2fd6c3','#b58cff','#ffffff']);
      for(let i=0;i<14;i++){ const a=i/14*6.283, s=3+Math.random()*2; spawnPart(fx_,fy,-1.5,c,Math.cos(a)*s,Math.sin(a)*s,0,0.7+Math.random()*0.3,0.14,5,true); } }
    if(p.x>=gx+6.5){ p.goal='in'; p.vx=0; proot.visible=false; burst(p.x,p.y+0.6,'#ffe14d',14,5,0.14,0.7,true); confetti(p.x,p.y+2.5,36,8); G.goalT=0; }
  } else { G.goalT+=dt; if(G.goalT>1.5){ p.goal='done'; levelClear(); } }
}
/* Going down a pipe: sink in, come up out of the other end. Nothing can hurt Blorp on the way. */
function updateWarp(dt){
  const p=player, w=p.warp; w.t+=dt;
  if(w.ph===0){ p.x+=(w.from.x-p.x)*Math.min(1,dt*14); p.y=w.from.y-Math.min(1,w.t/0.6)*(p.h+0.25);
    if(w.t>=0.75){ w.ph=1; w.t=0; p.x=w.to.x; p.y=w.to.y-p.h-0.25; if(setRoom()) roomChanged(); focusY=w.to.y; updateCamera(0,true); sfx.pipe(); } }
  else { p.y=w.to.y-(1-Math.min(1,w.t/0.55))*(p.h+0.25); if(w.t>=0.6){ p.y=w.to.y; p.warp=null; p.vx=0; p.vy=0; p.onGround=true; p.inv=Math.max(p.inv,0.4); } }
}
function tryWarp(){
  const p=player;
  for(const w of L.warps){ if(!w.enter||Math.abs(p.x-w.x)>0.6||Math.abs(p.y-w.y)>0.06) continue;
    const to=L.warps.find(o=>o!==w&&o.tag===w.tag); if(!to) continue;
    p.warp={ph:0,t:0,from:w,to}; p.vx=0; p.vy=0; p.skid=false; p.riding=null; sfx.pipe(); return true; }
  return false;
}
/* what lies under Blorp's feet takes the force of a ground pound; true if he broke through and keeps falling */
function poundLand(){
  const p=player, ty=Math.floor(p.y-0.5), txl=Math.floor(p.x-p.w/2+0.05), txr=Math.floor(p.x+p.w/2-0.05); let broke=0, any=0;
  for(let tx=txl;tx<=txr;tx++){ const id=tileAt(tx,ty); if(id===BRICK||id===QBLOCK||id===SWITCH||id===CRUMBLE){ any++; if(bumpBlock(tx,ty,true)) broke++; } }
  if(broke&&broke===any&&!solidAt(txl,ty)&&!solidAt(txr,ty)){ p.vy=-16; return true; }
  p.pound=0; p.poundT=0.16; p.squash=1.6; sfx.poundLand(); shake(0.28); ring(p.x,p.y,'#ffffff',2.6,0.35); ripple(p.x,p.y,0.014,0.34,0.45); dust(p.x-0.4,p.y,4,-1); dust(p.x+0.4,p.y,4,1);
  for(const e of enemies){ if(!e.active||e.dead||e.gone||e.K.heavy||e.K.fly||!e.onGround) continue;
    if(Math.abs(e.x-p.x)<2.3&&Math.abs(e.y-p.y)<0.8){ if(e.K.stomp||e.K.flip){ killEnemy(e,'flip',sgn(e.x-p.x)); comboScore(e.x,e.y+e.h); } else { e.vy=7; e.onGround=false; } } }
  return false;
}
/* Blorp has come down on a bouncy block: up he goes again. Holding jump makes it a high bounce, a ground pound a huge one. */
function bounceLand(){
  const p=player, ty=Math.floor(p.y-0.5); let bt=-1;
  for(let tx=Math.floor(p.x-p.w/2+0.05);tx<=Math.floor(p.x+p.w/2-0.05);tx++) if(tileAt(tx,ty)===BOUNCE) bt=tx;
  if(bt<0) return false;
  const hard=p.pound>0, hold=input.jump||input.jumpBuf>0;
  p.vy=hard?27:hold?22.5:15.5; p.pound=0; p.springHold=true; p.jumping=true; p.gHold=28.125; p.gFall=98.4; p.combo=0; p.airJumps=p.form===3?1:0; p.dashUsed=false; p.onGround=false; p.squash=1; input.jumpBuf=0;
  bumpAnim(ty*W+bt); sfx.boing(hard?2:hold?1:0,bt); dust(p.x-0.3,p.y,2,-1,TH.bounceCol); dust(p.x+0.3,p.y,2,1,TH.bounceCol); if(hard) ring(p.x,p.y,'#ffffff',2.2,0.3);
  return true;
}
function updatePlayer(dt){
  const p=player;
  if(p.dead){ p.deadT+=dt; if(p.deadT>0.35){ p.vy-=45*dt; p.y+=p.vy*dt; } if(p.deadT>2.5){ p.deadT=-99; afterDeath(); } return; }
  if(p.goal){ if(p.goal!=='done') updateGoal(dt); return; }
  if(p.warp){ updateWarp(dt); return; }
  p.inv=Math.max(0,p.inv-dt); p.growT=Math.max(0,p.growT-dt); p.fireCool=Math.max(0,p.fireCool-dt); p.stroke=Math.max(0,p.stroke-dt); p.wallT=Math.max(0,p.wallT-dt);
  p.launchT=Math.max(0,p.launchT-dt); p.poundT=Math.max(0,p.poundT-dt); p.flapT=Math.max(0,p.flapT-dt); p.dustT-=dt; G.coinT-=dt; G.swCool-=dt;
  if(p.dash<=0) p.dashCool=Math.max(0,p.dashCool-dt);
  if(p.star>0){ p.star-=dt; if(p.star<=0){ p.star=0; musicRate(G.bossSeen?1.12:1); } }
  if(p.pod){ const q=p.pod; q.t-=dt; p.x=q.pod.x; p.y=q.pod.y-p.h/2; p.vx=p.vy=0;
    if(q.t<=0){ const d=q.pod; p.pod=null; if(solidAt(Math.floor(p.x),Math.floor(p.y))) p.y=Math.floor(p.y)+1; /* a big Blorp in a pod on the floor is not fired out of the floor */
      p.vx=Math.sin(d.ang)*d.power; p.vy=Math.cos(d.ang)*d.power; p.launchT=0.55; p.airMax=Math.max(RUN_MAX,Math.abs(p.vx)); p.springHold=true; p.jumping=true; p.gHold=28.125; p.gFall=98.4; p.onGround=false; p.face=p.vx<0?-1:1;
      d.t=0.4; sfx.launch(); shake(0.2); burst(d.x,d.y,'#fff3a0',10,6,0.14,0.5,true); if(p.form===3) p.airJumps=1; p.dashUsed=false; }
    return; }
  if(p.riding){ const pl=p.riding; if(pl.dx) moveX(p,pl.dx); p.y+=pl.dy; }
  if(togHold.size) for(const k of togHold){ const tx=k%W, ty=Math.floor(k/W); if(!(p.x+p.w/2>tx&&p.x-p.w/2<tx+1&&p.y<ty+1&&p.y+p.h>ty)) togHold.delete(k); }

  /* in or out of the water */
  const wtr=waterAt(p.x,p.y+p.h*0.5), was=p.swim; p.swim=!!wtr;
  if(p.swim!==was){ const w=wtr||waterAt(p.x,p.y+p.h*0.5-0.6)||waterAt(p.x,p.y-0.3), sy=w?w.y1-0.14:p.y;
    if(Math.abs(p.vy)>2.5){ sfx.splash(); spray(p.x,sy,TH.liquid.kind==='water'?TH.liquid.b:WATER_LOOK.b,10,5); ring(p.x,sy-0.05,'#ffffff',1.6,0.4); }
    if(p.swim){ p.pound=0; p.jumping=false; p.glide=false; p.combo=0; p.dash=0; } }
  G.under=p.swim&&!!waterAt(p.x,p.y+p.h-0.1);

  const lock=p.wallLock>0||p.launchT>0.25||p.pound>0||p.dash>0; if(p.wallLock>0) p.wallLock-=dt;
  /* what Blorp stands on: honey and tar slow him to a wade */
  const under=p.onGround?tileAt(Math.floor(p.x),Math.floor(p.y-0.5)):AIR; p.sticky=under===STICKY;
  const dir=lock?0:(input.right?1:0)-(input.left?1:0), run=input.run, maxV=(run?RUN_MAX:WALK_MAX)*(p.sticky?0.42:1);
  if(p.pound){ p.vx=0; }
  else if(p.dash>0){ p.dash-=dt; p.vx=p.dashDir*17;
    if(p.dustT<=0){ p.dustT=0.016; trail(p.x-p.dashDir*0.2,p.y+p.h*0.5,p.dash>0.1?'#fff3a0':'#ffc928',p.h*0.55,0.22); }
    if(p.dash<=0){ p.dash=0; p.vx=p.dashDir*RUN_MAX; p.airMax=RUN_MAX; } }
  else if(p.swim){
    const mx=run?5.4:4.3;
    if(dir){ p.vx+=dir*15*dt; if(Math.abs(p.vx)>mx) p.vx=sgn(p.vx)*Math.max(mx,Math.abs(p.vx)-24*dt); p.face=dir; }
    else { const s=Math.abs(p.vx)-7*dt; p.vx=s>0?sgn(p.vx)*s:0; }
    p.skid=false;
  }
  else if(p.onGround){
    /* on ice Blorp speeds up slowly and barely slows down */
    const ice=under===ICE, grip=ice?0.14:p.sticky?2.4:1, push=ice?0.55:p.sticky?0.7:1;
    if(dir){
      if(p.vx*dir<-0.01){ p.vx+=dir*SKID_DEC*(ice?0.3:1)*dt; p.skid=Math.abs(p.vx)>1.5; if(p.skid&&p.dustT<=0){ p.dustT=0.07; dust(p.x,p.y,1,-dir); } }
      else { p.skid=false; if(Math.abs(p.vx)<MIN_V) p.vx=dir*MIN_V;
        if(Math.abs(p.vx)<=maxV){ p.vx+=dir*(run?RUN_ACC:WALK_ACC)*push*dt; if(Math.abs(p.vx)>maxV) p.vx=dir*maxV; }
        else { p.vx-=dir*REL_DEC*grip*dt; if(Math.abs(p.vx)<maxV) p.vx=dir*maxV; } }
      p.face=dir;
      if(Math.abs(p.vx)>RUN_MAX-0.6&&p.dustT<=0){ p.dustT=0.16; dust(p.x-dir*0.3,p.y,1,-dir); }
      if(p.sticky&&p.dustT<=0&&Math.abs(p.vx)>0.5){ p.dustT=0.3; spawnPart(p.x,p.y+0.1,0.4,TH.stickyCol||'#ffc928',-dir*0.6,1.6,0,0.4,0.09,9); }
    } else { p.skid=false; const s=Math.abs(p.vx)-REL_DEC*grip*dt; p.vx=s>0?sgn(p.vx)*s:0; }
  } else if(dir){
    p.vx+=dir*((p.vx*dir<0||Math.abs(p.vx)>=WALK_MAX)?RUN_ACC:WALK_ACC)*dt;
    if(Math.abs(p.vx)>p.airMax) p.vx=sgn(p.vx)*p.airMax;
    p.face=dir;
  }
  if(dir||!p.onGround||Math.abs(p.vx)>0.1) p.idleT=0; else p.idleT+=dt;

  /* down: into a pipe from the ground, a pound from the air, a quicker sink in water */
  if(input.downEdge){ input.downEdge=false;
    if(p.onGround){ if(tryWarp()) return; }
    else if(!p.swim&&!p.pound&&p.launchT<=0){ p.pound=1; p.poundT=0.14; p.vx=0; p.vy=0; p.jumping=false; p.glide=false; p.wall=0; p.dash=0; sfx.poundStart(); } }

  if(p.onGround) p.coyote=0.09; else p.coyote=Math.max(0,p.coyote-dt);
  if(input.jumpBuf>0&&!p.pound){
    if(p.swim){ if(p.stroke<=0){
        if(!waterAt(p.x,p.y+p.h+0.4)) doJump();
        else { p.vy=6.6; p.stroke=0.2; p.onGround=false; input.jumpBuf=0; sfx.swim(); spawnPart(p.x-p.face*0.3,p.y+p.h*0.6,0.4,'#ffffff',-p.face*0.6,1.5,0,0.7,0.08,-3,true); } } }
    else if(p.coyote>0) doJump();
    else if(p.wallT>0&&!p.onGround) wallKick();
    else if(p.form===3&&p.airJumps>0&&p.launchT<=0) airJump();
  }
  input.jumpBuf=Math.max(0,input.jumpBuf-dt);
  if(input.runEdge){ input.runEdge=false; if(p.form===2&&p.fireCool<=0&&!p.pound) shoot();
    else if(p.form===4&&p.dashCool<=0&&p.dash<=0&&!p.pound&&!p.swim&&p.launchT<=0&&!(p.dashUsed&&!p.onGround)) startDash(); }

  /* gravity, and everything that argues with it */
  const vy0=p.vy; /* before gravity has its say: a geyser overrules it */
  if(p.dash>0){ p.vy=0; }
  else if(p.pound===1){ p.vy=0; if(p.poundT<=0){ p.pound=2; p.vy=-25; } }
  else if(p.pound===2){ p.vy=-25; }
  else if(p.swim){
    p.vy-=(input.down?30:11.5)*dt; const lo=input.down?-6.5:-3.5;
    if(p.vy<lo) p.vy+=(lo-p.vy)*Math.min(1,dt*12); if(p.vy>8.5) p.vy=8.5;
  } else {
    const hold=p.vy>0&&(p.springHold||(p.jumping&&input.jump));
    p.vy-=(hold?p.gHold:p.gFall)*GRAV*dt; if(p.vy<=0) p.springHold=false;
    let lifted=false; for(const z of winds) if(z.ay>0&&p.x>z.x0&&p.x<z.x1&&p.y+p.h*0.5>z.y0&&p.y+p.h*0.5<z.y1) lifted=true;
    const was_=p.glide; p.glide=p.form===3&&input.jump&&(p.vy<0||lifted)&&!p.onGround&&p.launchT<=0;
    if(p.glide){ if(p.vy<-2.7) p.vy=Math.min(-2.7,p.vy+90*dt); if(!was_) sfx.glide(); }
    else if(p.wall&&p.vy<(p.wallSticky?-0.7:-3.6)){ p.vy=p.wallSticky?-0.7:-3.6; if(p.dustT<=0){ p.dustT=0.09; dust(p.x+p.wall*p.w/2,p.y+0.5,1,-p.wall*0.3,p.wallSticky?(TH.stickyCol||'#ffc928'):undefined); } }
    if(p.vy<-MAX_FALL) p.vy=-MAX_FALL;
  }
  for(const z of winds) if(p.x>z.x0&&p.x<z.x1&&p.y+p.h*0.5>z.y0&&p.y+p.h*0.5<z.y1&&!p.pound&&p.dash<=0){
    p.vx+=z.ax*dt; if(z.ay){ p.vy+=z.ay*(p.glide?2.2:1)*dt; if(p.vy>11) p.vy=11; if(p.vy>0) p.jumping=false; } }
  /* a geyser carries him to its top and holds him there; from the top he can jump */
  p.geyser=false;
  for(const g of geysers){ if(g.on<=0.3||p.pound||p.dash>0||(p.jumping&&p.vy>0)||p.swim) continue; const top=g.y+g.h*g.on;
    if(Math.abs(p.x-g.x)<0.85&&p.y>=g.y-0.3&&p.y<top+0.5){
      /* up at a good lick, easing in to the crest, and held there: gravity has no say inside the column */
      const dy=top-p.y, want=dy>0.05?Math.min(10.5,2.5+dy*8):clamp(dy*8,-2,0); p.vy=vy0+(want-vy0)*Math.min(1,dt*12); p.jumping=false; p.glide=false; p.geyser=true;
      if(dy<0.7) p.coyote=0.09; p.airJumps=p.form===3?1:0; p.dashUsed=false; } }

  /* a tall Blorp who ends up inside a low gap is nudged out instead of sticking */
  p.wall=0;
  if(p.form>0&&solidAt(Math.floor(p.x),Math.floor(p.y+p.h-0.25))&&!held(Math.floor(p.x),Math.floor(p.y+p.h-0.25))){ p.x+=p.face*3*dt; p.vx=0; }
  else { const s=p.vx<0?-1:1; if(moveX(p,p.vx*dt)){
      if(p.dash>0){ if(dashHit()) p.x+=s*0.02; else { p.dash=0; p.vx=-s*3; p.vy=5; shake(0.12); sfx.bump(); } }
      else { p.vx=0;
      /* pressed against a wall in mid-air: slide down it, ready to kick off. A sticky wall all but holds him. */
      if(!p.onGround&&!p.swim&&!p.pound&&dir===s&&p.x>1&&p.x<W-1&&solidAt(Math.floor(p.x+s*0.6),Math.floor(p.y+0.5))){ p.wall=s; p.wallSide=s; p.wallSticky=tileAt(Math.floor(p.x+s*0.6),Math.floor(p.y+0.5))===STICKY; p.wallT=p.wallSticky?0.2:0.13; } } } }

  const prevY=p.y, fallV=p.vy; let landed=false;
  if(p.vy>0) playerUp(p,p.vy*dt); else if(moveY(p,p.vy*dt)===1) landed=true;
  p.riding=null;
  if(p.vy<=0) for(const pl of plats){
    if(pl.off) continue;
    if(p.x+p.w/2>pl.x+0.05&&p.x-p.w/2<pl.x+pl.w-0.05&&prevY>=pl.y-0.16-Math.max(0,pl.dy)&&p.y<=pl.y){ p.y=pl.y; landed=true; p.riding=pl; break; } }
  if(landed&&!p.riding&&bounceLand()) landed=false;
  if(landed&&p.pound===2&&!p.riding&&poundLand()) landed=false;
  if(landed){
    if(p.pound){ p.pound=0; p.poundT=0.16; p.squash=1.6; sfx.poundLand(); shake(0.22); ring(p.x,p.y,'#ffffff',2.2,0.3); }
    else if(!p.onGround){ p.squash=1; if(fallV<-9){ dust(p.x-0.2,p.y,2,-1); dust(p.x+0.2,p.y,2,1); if(!p.swim) sfx.puff(); } }
    p.onGround=true; p.vy=0; p.jumping=false; p.combo=0; p.airJumps=p.form===3?1:0; p.wallT=0; p.glide=false; p.dashUsed=false;
    const b=beltAt(p); if(b) moveX(p,b*dt);
    /* crumbling blocks underfoot start to go */
    const ty=Math.floor(p.y-0.5); for(let tx=Math.floor(p.x-p.w/2+0.05);tx<=Math.floor(p.x+p.w/2-0.05);tx++) if(tileAt(tx,ty)===CRUMBLE) startCrumble(tx,ty);
    if(p.riding&&p.riding.ax==='f'&&!p.riding.trig) p.riding.trig=0.001;
  } else { if(p.onGround) p.airMax=Math.abs(p.vx)>WALK_MAX+0.2?RUN_MAX:WALK_MAX; p.onGround=false; }

  for(const s of springs){
    if(p.vy<=0&&!p.onGround&&Math.abs(p.x-s.x)<0.78&&p.y<=s.y+0.62&&p.y>=s.y+0.12){
      const big=p.pound>0; p.y=s.y+0.6; p.vy=big?27:22; p.pound=0; p.springHold=true; p.jumping=true; p.gHold=28.125; p.gFall=98.4; p.riding=null; p.combo=0; p.airJumps=p.form===3?1:0; p.dashUsed=false; s.t=0.35; sfx.spring(); } }
  for(const d of pods){ if(d.t>0||p.launchT>0||p.pound) continue;
    if(Math.abs(p.x-d.x)<0.75&&p.y+p.h*0.5>d.y-0.8&&p.y+p.h*0.5<d.y+0.9){ p.pod={pod:d,t:0.42}; p.pound=0; p.glide=false; p.wall=0; p.riding=null; sfx.bump(); break; } }

  const x0=Math.floor(p.x-p.w/2), x1=Math.floor(p.x+p.w/2), y0=Math.floor(p.y+0.05), y1=Math.floor(p.y+p.h-0.05);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++){
    const id=tileAt(tx,ty);
    if(id===COIN) collectCoin(tx,ty);
    else if(id===SPIKE&&p.y<ty+0.55&&p.x+p.w/2>tx+0.14&&p.x-p.w/2<tx+0.86) hurtPlayer();
  }
  for(const s of sparks){ if(s.got||Math.abs(p.x-s.x)>0.85||p.y>s.y+0.75||p.y+p.h<s.y-0.75) continue; collectSpark(s); }
  const cp=L.checkpoint;
  if(cp&&!G.cp&&p.x>cp.x-0.2&&Math.abs(p.y-cp.y)<4&&room===L.rooms[0]){ G.cp=true; if(cpFlag) cpFlag.material.color.set(0x2fd6c3); sfx.check(); popup(cp.x,cp.y+2.6,'Checkpoint','#7dffe6'); sparkle(cp.x,cp.y+1.6,'#7dffe6',14,4); ring(cp.x,cp.y+1.2,'#2fd6c3',2.4,0.45,true); }
  if(L.goal&&p.x<L.goal.x+1&&p.y>=L.goal.y-0.2&&p.y<L.goal.y+12&&(p.x+p.w/2>=L.goal.x+0.43||(p.y<L.goal.y+1&&p.x+p.w/2>=L.goal.x-0.01))) startGoal(); /* walking into the pole's base counts too */
  if(L.boss&&!G.bossSeen&&p.x>L.boss.x0-6){ G.bossSeen=true; bossAppears(); }
  if(setRoom()) roomChanged();
  /* the pits: water can be swum out of until Blorp sinks from view; anything else is the end at a touch */
  const lk=TH.liquid.kind;
  if(lk==='water'||lk==='void'||L.liquidY<=0){ if(p.y<-1.9) killPlayer(); }
  else if(p.y<L.liquidY-0.75){ spray(p.x,L.liquidY,TH.liquid.b,12,6,true); p.y=L.liquidY-0.8; killPlayer(); }
}
function collectSpark(s){
  s.got=true; s.t=0;
  const n=sparks.filter(q=>q.got||q.had).length;
  if(!s.had){ G.sparks[G.levelIdx]=(G.sparks[G.levelIdx]|0)|(1<<s.i); addScore(2000,s.x,s.y+0.6); writeSave(G.levelIdx); }
  sfx.spark(clamp(n,1,3)); musicDuck(n>=3?1.4:0.7); popup(s.x,s.y+1.3,n>=3?'All 3 sun sparks!':'Sun spark '+n+' of 3','#fff3a0');
  sparkle(s.x,s.y,'#fff3a0',16,5,0.13); sparkle(s.x,s.y,'#ffffff',8,3,0.09); ring(s.x,s.y,'#ffe14d',2.4,0.5,true); flash(0.1); ripple(s.x,s.y,0.008,0.3,0.5);
  if(n>=3) confetti(s.x,s.y+0.5,30,7);
}

/* ---------- things that move on their own ---------- */
function updateItems(dt){
  const p=player; let any=false;
  for(const it of items){
    if(it.emerge>0){ it.emerge-=dt; it.y=it.baseY+(1-Math.max(0,it.emerge)/0.7);
      if(it.emerge<=0){ it.y=it.baseY+1; if(it.kind==='muffin'||it.kind==='heart') it.vx=3.2; else if(it.kind==='star'){ it.vx=4.2; it.vy=10; } else if(it.kind==='fluff'){ it.vx=2.4; it.vy=7; } } }
    else { it.vy-=(it.kind==='star'?40:it.kind==='fluff'?22:60)*dt; if(it.vy<-MAX_FALL) it.vy=-MAX_FALL;
      if(it.vx&&moveX(it,it.vx*dt)) it.vx=-it.vx;
      const r=moveY(it,it.vy*dt); if(r===1) it.vy=it.kind==='star'?12:it.kind==='fluff'?7.5:0; else if(r===2) it.vy=0; }
    if(it.emerge<0.25&&!p.dead&&!p.goal&&Math.abs(p.x-it.x)<(p.w+it.w)/2&&p.y<it.y+it.h&&p.y+p.h>it.y) collectItem(it);
    if(it.y<-3) it.gone=true;
    if(it.gone) any=true;
  }
  if(any){ for(const it of items) if(it.gone) world.remove(it.mesh); items=items.filter(it=>!it.gone); }
}
function updateShots(dt){
  let any=false;
  for(const s of shots){
    s.life-=dt; s.vy-=50*dt; if(s.vy<-14) s.vy=-14;
    s.x+=s.vx*dt;
    if(solidAt(Math.floor(s.x),Math.floor(s.y))){ s.life=0; burst(s.x,s.y,'#ffb347',5,3,0.1,0.3,true); }
    else {
      const py=s.y; s.y+=s.vy*dt; const tx=Math.floor(s.x), ty=Math.floor(s.y-0.15);
      if(s.vy<0&&(solidAt(tx,ty)||(semiAt(tx,ty)&&py-0.15>=ty+0.99))){ s.y=ty+1.15; s.vy=8.5; }
      if(s.y<-2||Math.abs(s.x-camX)>viewHalfW+3) s.life=0;
      for(const e of enemies){
        if(!e.active||e.dead||e.gone) continue; const b=hitBox(e); if(!b) continue;
        if(Math.abs(s.x-e.x)<e.w/2+0.18&&s.y>b[0]-0.15&&s.y<b[0]+b[1]+0.15){
          s.life=0; burst(s.x,s.y,'#ffb347',6,4,0.12,0.35,true);
          if(e.K.boss) damageBoss(e,1); else if(!e.K.fireproof){ killEnemy(e,'flip',sgn(s.vx)); addScore(200,e.x,b[0]+b[1]); }
          break; } }
    }
    if(s.life<=0) any=true;
  }
  if(any){ for(const s of shots) if(s.life<=0) world.remove(s.mesh); shots=shots.filter(s=>s.life>0); }
}
/* things thrown at Blorp: a boss's bombs, a Prickle's seeds, a storm cloud's bolts */
function throwAt(x,y,vx,vy,model,key,o){
  const m=vmesh(key,model,o&&o.glow?MAT.glow:undefined); if(o&&o.scale) m.scale.setScalar(o.scale); world.add(m);
  const b=Object.assign({x,y,vx,vy,g:26,r:0.4,mesh:m,gone:false},o||{}); bombs.push(b); return b;
}
function updateBombs(dt){
  const p=player; let any=false;
  for(const b of bombs){
    if(!b.gone){
      b.vy-=b.g*dt; b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.life!==undefined) b.life-=dt;
      if((b.vy<0&&solidAt(Math.floor(b.x),Math.floor(b.y-0.25)))||(b.flat&&solidAt(Math.floor(b.x),Math.floor(b.y)))||b.life<=0||b.y<0||b.x<1||b.x>W-1){ b.gone=true; burst(b.x,b.y,b.col||'#fff1d0',7,4,0.13,0.4,!!b.glow); if(Math.abs(b.x-camX)<viewHalfW) sfx.bump(); if(b.wave) shockwave(b.x,Math.floor(b.y-0.25)+1); }
      else if(!p.dead&&!p.warp&&Math.abs(b.x-p.x)<b.r+p.w/2&&b.y+b.r-0.05>p.y&&b.y-b.r+0.05<p.y+p.h){ b.gone=true; burst(b.x,b.y,b.col||'#fff1d0',7,4,0.13,0.4,!!b.glow); hurtPlayer(); }
    }
    if(b.gone) any=true;
  }
  if(any){ for(const b of bombs) if(b.gone) world.remove(b.mesh); bombs=bombs.filter(b=>!b.gone); }
}
/* a pair of ripples that run along the ground both ways from a heavy landing; they must be jumped */
let waves=[];
function shockwave(x,y){
  for(const d of [-1,1]){ const m=new T.Mesh(partGeo,pmatOf('#fff2c2',true)); m.scale.set(0.5,0.7,1.2); world.add(m); waves.push({x:x+d*0.6,y,vx:d*7.5,life:1.5,mesh:m}); }
}
function updateWaves(dt){
  const p=player; let any=false;
  for(const w of waves){ w.life-=dt; w.x+=w.vx*dt;
    if(solidAt(Math.floor(w.x),Math.floor(w.y+0.3))||!solidAt(Math.floor(w.x),Math.floor(w.y-0.5))) w.life=0;
    else if(!p.dead&&!p.warp&&Math.abs(w.x-p.x)<0.3+p.w/2&&p.y<w.y+0.6&&p.y+p.h>w.y) hurtPlayer();
    if(w.life<=0) any=true; }
  if(any){ for(const w of waves) if(w.life<=0) world.remove(w.mesh); waves=waves.filter(w=>w.life>0); }
}
const SWING_MAX=0.95; /* how far a swinging ledge leans from straight down, in radians */
function spawnPlat(d){
  const pl={x:d.x,y:d.y,w:d.w,ax:d.axis,a0:d.axis==='x'?d.x:d.y,ox:d.x,oy:d.y,range:d.range,sp:d.speed,ph:d.phase||0,t:0,dx:0,dy:0,trig:0,vy:0,off:false}, w8=d.w*8, c=d.axis==='f'?[shade(TH.plat[0],0.9),shade(TH.plat[1],0.85)]:TH.plat;
  const b=[[0,-3.2,-8,w8,3.2,16,c[0]],[0.5,-4.2,-7,w8-1,1,14,c[1]],[1,-0.2,-7,w8-2,0.3,14,shade(c[0],1.12)],[w8/2-3.6,-2.5,8,1.5,1.5,0.2,INK],[w8/2+2.1,-2.5,8,1.5,1.5,0.2,INK],[w8/2-1.2,d.axis==='f'?-3:-2.7,8,2.4,0.4,0.2,INK]];
  pl.mesh=addVox(b,S8,MAT.vox,true);
  if(d.axis==='s'){ /* the rope, hinged where it hangs from */
    const rb=[]; for(let i=0;i<Math.ceil(d.range*2);i++) rb.push([-0.5,-(i+1)*4,-0.5,1,4,1,i%2?'#e8c58a':'#b98a4a']); rb.push([-1.5,-1,-1.5,3,2,3,'#6f7fb8']);
    pl.rope=addVox(rb,S8,MAT.vox,true); pl.rope.position.set(d.x+d.w/2,d.y+d.range,0); }
  plats.push(pl); movePlat(pl,0);
}
function movePlat(pl,dt){
  const ox=pl.x, oy=pl.y; pl.t+=dt;
  if(pl.ax==='x') pl.x=pl.a0+(0.5-0.5*Math.cos(pl.t*pl.sp+pl.ph))*pl.range;
  else if(pl.ax==='y') pl.y=pl.a0+(0.5-0.5*Math.cos(pl.t*pl.sp+pl.ph))*pl.range;
  else if(pl.ax==='c'){ pl.x=pl.ox+Math.cos(pl.t*pl.sp+pl.ph)*pl.range; pl.y=pl.oy+Math.sin(pl.t*pl.sp+pl.ph)*pl.range; }
  else if(pl.ax==='s'){ const a=Math.sin(pl.t*pl.sp+pl.ph)*SWING_MAX; pl.ang=a; pl.x=pl.ox+Math.sin(a)*pl.range; pl.y=pl.oy+pl.range*(1-Math.cos(a)); }
  else if(pl.trig>0){ /* a falling ledge: a short wobble, the drop, and a while later it is back */
    pl.trig+=dt;
    if(pl.trig>0.4&&pl.trig<4){ pl.vy=Math.max(-13,pl.vy-30*dt); pl.y+=pl.vy*dt; if(pl.y<pl.oy-16) pl.off=true; }
    else if(pl.trig>=4){ pl.trig=0; pl.vy=0; pl.y=pl.oy; pl.off=false; } }
  pl.dx=pl.x-ox; pl.dy=pl.y-oy;
}
function updatePlats(dt){ for(const pl of plats) movePlat(pl,dt); }
function spawnFirebar(d){
  const f={x:d.x,y:d.y,n:d.n,sp:d.speed,a:d.phase||0,embers:[]};
  for(let i=0;i<d.n;i++){ const m=new T.Mesh(partGeo,emberMat[i%2]); m.scale.setScalar(0.36); world.add(m); f.embers.push(m); }
  firebars.push(f);
}
function updateFirebars(dt){
  const p=player;
  for(const f of firebars){ f.a+=f.sp*dt; if(p.dead||p.goal||p.warp||p.star>0) continue; const c=Math.cos(f.a), s=Math.sin(f.a);
    for(let i=1;i<f.n;i++){ const ex=f.x+c*i*0.55, ey=f.y+s*i*0.55; if(ex>p.x-p.w/2-0.14&&ex<p.x+p.w/2+0.14&&ey>p.y-0.14&&ey<p.y+p.h+0.14){ hurtPlayer(); break; } } }
}
/* flame jets: quiet, then a flicker of warning, then the flame */
function updateJets(dt){
  const p=player;
  for(const j of jets){ j.t+=dt; const u=(j.t%j.period)/j.period, was=j.on;
    j.on=u<0.5?0:u<0.62?0.12:u<0.94?Math.min(1,(u-0.62)*14):Math.max(0,(1-u)*16);
    if(j.on>0.5&&was<=0.5&&Math.abs(j.x-camX)<viewHalfW) sfx.fire();
    if(j.on>0.5&&!p.dead&&!p.warp&&p.star<=0&&Math.abs(p.x-j.x)<0.3+p.w/2&&p.y<j.y+j.len*j.on&&p.y+p.h>j.y) hurtPlayer(); }
}
function updateCannons(dt){
  const p=player;
  for(const c of cannons){ c.t+=dt; if(c.t<c.period) continue;
    if(Math.abs(c.x+0.5-camX)>viewHalfW+1||Math.abs(p.x-c.x-0.5)<2.5||tileAt(c.x,c.y)!==CANNON){ c.t=c.period-0.4; continue; }
    c.t=0; const d=p.x<c.x?-1:1; if(solidAt(c.x+d,c.y)) continue;
    spawnEnemy({type:'rocket',x:c.x+0.5+d*0.9,y:c.y+0.1,dir:d}).active=true; sfx.rocket(); burst(c.x+0.5+d*0.6,c.y+0.5,'#ffffff',5,2,0.12,0.4);
  }
}
/* geysers: quiet, a bubbling warning, then the column rises, stands and sinks back */
function updateGeysers(dt){
  for(const g of geysers){ g.t+=dt; const u=(g.t%g.period)/g.period, was=g.on;
    g.on=u<0.4?0:u<0.5?0.06:u<0.62?0.06+(u-0.5)/0.12*0.94:u<0.9?1:Math.max(0,(1-u)*10);
    if(g.on>0.3&&was<=0.3&&Math.abs(g.x-camX)<viewHalfW+1) sfx.geyser(); }
}
/* lasers: on and off by the clock, or by turns with the red and blue blocks */
function laserOn(z){ if(z.sw) return (z.sw==='red')===swOn?1:0; if(!z.period) return 1; const u=((z.t+z.phase)%z.period)/z.period; return u<z.duty?1:u>1-0.5/z.period?-1:0; }
function updateLasers(dt){
  const p=player;
  for(const z of lasers){ z.t+=dt; const was=z.on; z.on=laserOn(z);
    if(z.on>0&&was<=0&&Math.abs((z.x0+z.x1)/2-camX)<viewHalfW+2) sfx.laser();
    if(z.on>0&&!p.dead&&!p.warp&&p.star<=0&&p.x+p.w/2>z.x0-0.12&&p.x-p.w/2<z.x1+0.12&&p.y<z.y1+0.12&&p.y+p.h>z.y0-0.12) hurtPlayer(); }
}
function updateChutes(dt){
  for(const c of chutes){ c.t+=dt; if(c.t<c.period) continue;
    if(Math.abs(c.x+0.5-camX)>viewHalfW+3||solidAt(c.x+c.dir,c.y)){ c.t=c.period-0.5; continue; }
    let n=0; for(const e of enemies) if(e.type==='roller'&&e.from===c.x&&!e.gone) n++;
    if(n>=3){ c.t=c.period-0.5; continue; }
    c.t=0; const e=spawnEnemy({type:'roller',x:c.x+0.5+c.dir*0.95,y:c.y+0.05,dir:c.dir}); e.active=true; e.from=c.x;
    if(Math.abs(c.x+0.5-camX)<viewHalfW+1){ sfx.chute(); puff(c.x+0.5+c.dir*0.7,c.y+0.5,'#ffffff',4,0.16); } }
}
/* the level's own clock: blocks that change over on the beat, and a tide that rises */
function updateLevelClock(dt){
  if(L.beat){ const was=L.beat-G.beatT; G.beatT+=dt; const left=L.beat-G.beatT;
    if(left<=0){ G.beatT-=L.beat; G.swCool=0; flipSwitch(true); }
    else if(left<0.61&&Math.ceil(left/0.2)!==Math.ceil(was/0.2)&&Math.abs(player.x-camX)<viewHalfW) sfx.tick(3-Math.ceil(left/0.2)); }
  if(L.rise){ G.riseT+=dt; L.liquidY=Math.min(L.rise.to,L.liquid0+Math.max(0,G.riseT-L.rise.delay)*L.rise.v); for(const w of L.waters) if(w.base) w.y1=L.liquidY+0.14; }
}
function step(dt){
  updatePlats(dt); updateCrumbles(dt); updateGeysers(dt); updateLevelClock(dt);
  updatePlayer(dt);
  if(G.state!=='play') return;
  updateEnemies(dt); updateItems(dt); updateShots(dt); updateBombs(dt); updateWaves(dt); updateFirebars(dt); updateJets(dt); updateCannons(dt); updateLasers(dt); updateChutes(dt);
  for(const d of pods) if(d.t>0) d.t-=dt;
  playerVsEnemies();
  if(G.bossDead){
    G.winT+=dt; G.fountain-=dt;
    if(G.winT<1.8&&G.fountain<=0){ G.fountain=0.09; coinPop(G.bossX+(Math.random()-0.5)*5,2.2+Math.random()*2); addCoin(); G.score+=200; sfx.coin(((G.winT*11)|0)%8); }
    if(G.winT>4&&!player.dead){ G.bossDead=false; if(G.levelIdx>=LEVELS.length-1) showWin(); else levelClear(); }
  }
}
