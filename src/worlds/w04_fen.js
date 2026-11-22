/* ================= World 4: Firefly Fen ================= */
/* A swamp, from dusk into night. Cypresses stand on stilts of root with moss hanging from them, mist lies on water
   that is dark, still and a strong mirror, and a huge moon sits low in it twice. The ground is low and wet: lily pads
   that sink, boardwalks, rotten logs, mud that holds on to your feet, and swamp gas that lifts you to the high walks.
   The water itself is safe to fall in. The last three levels are dark: lanterns, glowing caps, Wisps and Blorp himself
   are what there is to see by. */

/* ---------- the tune ---------- */
/* @song */
/* A minor, a slow shuffle with a heavy swing. A jaw harp (a square wave through a filter that snaps shut) twangs a
   tune that keeps coming back to its first note; a banjo chanks on the off-beats; an upright bass rocks between the
   root and the fifth below; a pad hangs far back in the room; wood block and two congas keep time. The middle eight
   lifts to C and G in longer notes, and E7 drags it home. */
SONGS.fen=(()=>{
  const h='A4 . C5 A4 E5 - D5 C5  A4 - G4 A4 . . E4 G4  A4 . D5 A4 F5 - E5 D5  D5 - C5 D5 . . A4 C5 ';
  const a=h+'E5 . E5 D5 C5 - A4 .  C5 . D5 Eb5 E5 - . .  E5 . D5 B4 G#4 - B4 .  E4 - G#4 B4 D5 - E5 . ';
  const a2=h+'F5 . F5 E5 C5 - A4 .  B4 . D5 B4 G#4 - E4 .  A4 . C5 E5 A5 - E5 C5  A4 - - - . . E4 G4 ';
  const b='G5 - - E5 C5 - E5 .  G5 - E5 - C5 - - .  G5 - - D5 B4 - D5 .  G5 - D5 - B4 - - .  F5 - - D5 A4 - D5 .  F5 . E5 D5 A4 - F4 .  E4 . G#4 . B4 . E5 .  D5 - B4 - G#4 E4 G#4 B4 ';
  const ch='Am Am Dm Dm Am Am E7 E7  Am Am Dm Dm F E7 Am Am  C C G G Dm Dm E E7  Am Am Dm Dm F E7 Am Am';
  const d='k . w r b . w c ', d2='k r w c b b w r ';
  return song({key:'A minor',bpm:104,sw:0.22,ec:0.5,fb:0.26},
    [{w:'square',v:0.05,lp:[11,1.3],q:7,g:0.8,e:1,r:0.2,pan:-0.1},a+a2+b+a2],
    [{w:'triangle',v:0.06,h:2,g:0.35,lp:[6,1.5],pan:0.35},musChord(ch,8,'. x . . x . . x','A3')],
    [{w:'sawtooth',v:0.012,s:0.9,a:0.25,g:1,lp:[2,3.5],r:0.9,pan:-0.3},musChord(ch,8,'x - - - - - - -','E3')],
    [{w:'triangle',v:0.24,g:0.85,lp:[5,1.6]},musArp(ch,8,'1 - . 5_ 1 . 5 5','E2')],
    [{dr:1,v:0.8},(d+d2).repeat(3)+d+'k c w c b b c c '+(d+d2).repeat(3)+d+'k . c c b c bw bw ']);
})();
/* @endsong */

/* ---------- models ---------- */
/* a cypress on stilts of root, flat-topped, with moss hanging from it. c: [bark, dark bark, three greens, moss] */
function fenCypress(R,c){ const t=c[0], d=c[1], b=[], h=14+((R()*8)|0), flip=R()<0.5?-1:1;
  for(const q of [[-3.4,-0.6],[3,-1],[-1.6,2.4],[1.8,2.2],[0.4,-3]]) b.push([q[0]-0.6,0,q[1]-0.6,1.2,3.2,1.2,d],[q[0]*0.55-0.65,3,q[1]*0.55-0.65,1.3,2.2,1.3,t]);
  b.push([-1.6,4.6,-1.6,3.2,2,3.2,d],[-1.2,6.6,-1.2,2.4,h-6.6,2.4,t],[flip>0?1:-5,h-5,-0.5,4,1,1,d]);
  b.push([-7,h,-6,14,2.4,12,c[2]],[-9,h+2.4,-7,18,2.6,14,c[3]],[-6,h+5,-5,12,2.2,10,c[4]],[-3,h+7.2,-3,7,1.4,6,c[2]]);
  for(let i=0;i<7;i++){ const x=-8+R()*15, z=-5+R()*11, l=2+R()*4.5; b.push([x,h+2.4-l,z,0.7,l,0.7,c[5]]); }
  return b; }
/* a mangrove: arching roots and a low round crown */
function fenMangrove(R,c){ const t=c[0], d=c[1], b=[];
  for(const q of [[-4,0],[3.4,0.6],[-1.4,3],[1.6,-2.6],[-3,-2.4]]) b.push([q[0]-0.5,0,q[1]-0.5,1,4,1,d],[Math.min(q[0],q[0]*0.4)-0.5,3.6,q[1]*0.5-0.5,1+Math.abs(q[0])*0.6,1,1,t]);
  b.push([-1,4.4,-1,2,3,2,t],[-5,7,-4,10,3.4,8,c[2]],[-4,10.4,-3,8,2,6,c[3]],[2.6,6.2,-2,3,1.6,4,c[4]],[-6,6,-1,2.4,1.6,3,c[4]]);
  for(let i=0;i<3;i++){ const x=-4.5+R()*9, l=1.5+R()*2; b.push([x,7-l,3.6,0.6,l,0.6,c[5]]); }
  return b; }
function fenCattail(R){ const g='#5f9a4a',l='#86bf5a',h='#6b4426', b=[], n=3+((R()*3)|0);
  for(let i=0;i<n;i++){ const x=(i-n/2)*1.5+R(), z=R()*1.6-0.8, s=9+R()*7; b.push([x,0,z,0.5,s,0.5,g],[x-0.35,s-3.4,z-0.35,1.2,3,1.2,h],[x+0.05,s-0.4,z+0.05,0.4,1.4,0.4,'#c9b98a'],[x+0.8,0,z,0.5,s*0.6,0.4,l],[x-1,0,z+0.3,0.5,s*0.45,0.4,l]); }
  return b; }
function fenReeds(R,c){ const b=[]; for(let i=0;i<5;i++){ const x=-2.4+i*1.1+R()*0.5, s=3+R()*5; b.push([x,0,R()*1.4-0.7,0.5,s,0.5,i%2?c:shade(c,0.82)]); } return b; }
function fenFern(){ const g='#3f8a4a',l='#5fae5a'; return [[-0.4,0,-0.4,0.8,2.4,0.8,g],[-3,1.6,-0.6,2.8,0.8,1.2,l],[0.4,2,-0.6,3,0.8,1.2,l],[-0.6,1.8,0.4,1.2,0.8,2.6,g],[-0.6,2.6,-2.8,1.2,0.8,2.6,l],[-1.2,3,-1.2,2.4,1,2.4,l]]; }
function fenStump(){ const t='#6b4a30',d='#4a3220',m='#6fae4a'; return [[-2.6,0,-2.2,5.2,3.4,4.4,t],[-3.4,0,-0.6,1.2,1.4,1.4,d],[2.4,0,0.2,1.2,1.2,1.4,d],[-0.8,0,2,1.4,1,1.2,d],[-2.6,3.4,-2.2,5.2,0.5,4.4,'#b89a6a'],[-1.4,3.9,-1.2,2.6,0.1,2.4,'#8a6a44'],[-2.8,2.4,-2.4,2.6,1.2,2,m],[0.6,3.4,-2.3,2.2,0.8,1.6,m]]; }
function fenLog(){ const t='#6b4a30',d='#3a2618',m='#6fae4a'; return [[-6,0,-1.8,12,3.2,3.6,t],[-6.2,0.4,-1.4,0.3,2.4,2.8,d],[6,0.4,-1.4,0.3,2.4,2.8,'#b89a6a'],[-3,3.2,-1.6,4,0.6,2.4,m],[2,3.2,-0.6,2.4,0.5,2,m],[4,2,1.8,1,1,0.2,d]]; }
function fenKnees(R){ const d='#5a4030', b=[]; for(let i=0;i<4;i++){ const s=1.4+R()*2.6, x=-3+i*1.8+R(), z=R()*2-1; b.push([x,0,z,1,s,1,d],[x+0.2,s,z+0.2,0.6,0.6,0.6,'#7a5a3a']); } return b; }
/* a glowing mushroom in two parts: stalks for the lit list, caps for the list that shines */
function fenShroomStalk(){ const s='#d9e8d0'; return [[-0.5,0,-0.5,1,2.6,1,s],[1.6,0,0.4,0.7,1.6,0.7,s],[-2.2,0,0.6,0.6,1.1,0.6,s]]; }
function fenShroomCap(c){ const l=shade(c,1.25); return [[-1.8,2.6,-1.8,3.6,1,3.6,c],[-1.1,3.6,-1.1,2.2,0.7,2.2,l],[1,1.6,-0.2,1.9,0.7,1.9,c],[-2.7,1.1,0.1,1.6,0.6,1.6,l]]; }
/* a lantern hung from a crooked post, and the flame in it */
function fenPost(){ const k='#3a2a22',w='#5a4030'; return [[-0.6,0,-0.6,1.2,22,1.2,w],[-1.2,0,-1.2,2.4,1,2.4,k],[-0.6,22,-0.6,5.2,1,1.2,w],[3.2,20.4,-0.2,0.5,1.6,0.5,k],[2.2,15.6,-1.3,2.6,0.6,2.6,k],[2.2,19.8,-1.3,2.6,0.6,2.6,k],
  [2.2,16.2,-1.3,0.4,3.6,0.4,k],[4.4,16.2,-1.3,0.4,3.6,0.4,k],[2.2,16.2,0.9,0.4,3.6,0.4,k],[4.4,16.2,0.9,0.4,3.6,0.4,k]]; }
function fenFlame(c){ return [[2.6,16.2,-0.9,1.8,3.6,1.8,c],[3,17,-1.05,1,1.8,2.1,'#fffbe0']]; }
function fenPad(c,f){ const b=[[-2.6,0,-2,5.2,0.5,4,c],[-1.6,0,-2.8,3.2,0.5,5.6,c],[-0.3,0.5,-0.2,2.4,0.12,0.5,shade(c,0.72)]]; if(f) b.push([-1,0.5,-1,2,0.8,2,f],[-0.5,1.3,-0.5,1,0.6,1,'#fff3a0']); return b; }
/* a shack on legs, with a jetty and two lit windows */
function fenShack(){ const w='#5a4030',d='#3a2a22',r='#4a5a3a'; return [[-7,0,-5,1.2,9,1.2,d],[5.8,0,-5,1.2,9,1.2,d],[-7,0,3.8,1.2,8,1.2,d],[5.8,0,3.8,1.2,8,1.2,d],[-9,8,-6,18,1.2,12,w],[-7,9.2,-5,14,8,10,'#6b4a30'],
  [-9,17.2,-6.6,18,1.4,13.2,r],[-7,18.6,-5,14,1.4,10,shade(r,0.85)],[-4.5,20,-3,9,1.2,6,r],[9,8,-1,5,0.8,3,w],[13,0,0,1,8,1,d]]; }
function fenShackGlow(){ return [[-4.6,11.4,5.05,3.2,3.6,0.15,'#ffd27a'],[1.6,11.4,5.05,3.2,3.6,0.15,'#ffd27a']]; }
/* a dragonfly, its wings, and a pair of eyes for the dark */
function fenFly(c){ return [[-0.4,-0.4,-3,0.8,0.8,6,c],[-0.7,-0.6,2.4,1.4,1.2,1.4,shade(c,1.3)],[-0.25,-0.25,-5,0.5,0.5,2,shade(c,0.7)]]; }
function fenFlyWing(sx){ return sx>0?[[0,0,-0.2,4,0.15,1.3,'#e6fbff'],[0,0,-1.8,3.4,0.15,1.2,'#c9f0ff']]:[[-4,0,-0.2,4,0.15,1.3,'#e6fbff'],[-3.4,0,-1.8,3.4,0.15,1.2,'#c9f0ff']]; }
function fenEyes(){ return [[-1.6,0,0,1.2,1.2,0.3,'#fff3a0'],[0.6,0,0,1.2,1.2,0.3,'#fff3a0'],[-1.2,0.2,0.3,0.4,0.8,0.1,'#3a2a00'],[1,0.2,0.3,0.4,0.8,0.1,'#3a2a00']]; }

/* ---------- the fen's own creatures ---------- */
/* other bodies for shared monsters: a swamp frog with orange spots, a mosquito for the bee's rules, a green Wisp */
function fenFrog(){ return mRibbit('#b6d94c','#6a8f2a','#fff6c2').concat([[-2.4,4.4,-2,1.4,0.25,1.4,'#e8843a'],[1.2,4.4,-0.6,1,0.25,1,'#e8843a'],[3.5,2,-1.6,0.2,1.2,1.2,'#e8843a']]); }
function fenMozzie(){ const c='#7a8a9a',d='#3a4452',r='#ff5a5a'; return [[-1.6,1.6,-3,3.2,2.6,3.2,d],[-1.8,1.4,0,3.6,3.2,2.2,c],[-1.4,2,2.2,2.8,2.4,1.2,c],
  ...eye(-1.7,3,3.2,1.5,1.4,0.8,0.8,0.6,0.3),...eye(0.2,3,3.2,1.5,1.4,0.8,0.8,0.1,0.3),
  [-0.3,1.2,3.4,0.6,0.6,3,'#e8d9b0'],[-0.2,1.3,6.2,0.4,0.4,1,r],[-0.5,2.4,-4.4,1,1.2,1.6,r],
  [-2.8,0,-0.6,0.4,1.8,0.4,d],[2.4,0,-0.6,0.4,1.8,0.4,d],[-2.6,0,1.4,0.4,1.6,0.4,d],[2.2,0,1.4,0.4,1.6,0.4,d]]; }
function fenWisp(){ return mWisp('#c8ff8a','#f4ffd9'); }
/* The Gulper: the Snapper's rules in a deep-water body, dark, with a pale lure on a stalk that shines. (The shared
   Snapper does not take a skin, so the fen keeps its own.) Its light is what gives it away in the dark. */
function fenGulperBody(){ const c='#2a3a4f',d='#16202f',l='#8a9ab0'; return [[-1.9,0.4,-3,3.8,4.4,6,c],[-1.5,0.8,3,3,3.4,1.2,c],[-1.5,0,-2,3,0.6,4.6,l],
  [-0.5,1.4,-4.6,1,2.6,1.6,d],[-0.5,0.2,-5.4,1,1.6,1,d],[-0.5,3.6,-5.4,1,1.6,1,d],[-0.4,4.8,-2,0.8,1.2,3,d],
  [1.9,2.8,1,0.15,1.5,1.5,WHITE],[2,3.1,1.5,0.12,0.8,0.8,INK],[-2.05,2.8,1,0.15,1.5,1.5,WHITE],[-2.12,3.1,1.5,0.12,0.8,0.8,INK],
  [-1.2,0.9,4.2,2.4,0.9,0.15,'#0c1220'],[-1,1.4,4.3,0.5,0.6,0.15,WHITE],[0.5,1.4,4.3,0.5,0.6,0.15,WHITE],[-0.2,4.8,2.4,0.4,2,0.4,d],[-0.2,6.6,2.4,0.4,0.4,2,d]]; }
function fenGulperLure(){ return [[-0.7,5.6,4.2,1.4,1.4,1.4,'#e8ffb0'],[-0.4,5.9,4.5,0.8,0.8,1.3,WHITE]]; }
defEnemy('fenGulper',{h:0.8,stomp:true,fly:true, init(e,d){ e.base=d.y-1.6; e.y=e.base; e.rise=(d.rise||5)+1.6; e.gap=d.gap||1.6; e.wait=(d.phase||0)+0.2+Math.random()*0.3; },
  mesh(){ const g=new T.Group(); g.add(vmesh('fenGulper',fenGulperBody),vmesh('fenGulperLure',fenGulperLure,MAT.glow)); return g; },
  box:e=>e.wait>0?null:[e.y,e.h], tick:leaper,
  anim(e,m){ m.visible=e.wait<=0; m.rotation.set(-Math.PI/2*clamp(e.vy/9,-1,1),0,0); if(m.visible&&onScreen(e,2)) glowAt(e.x,e.y+0.5,0.6,0xd9ff9a,0.9,5.5); }});
/* Dozy: a newt in a nightcap, fast asleep where it is put. It wakes with a start when somebody lands close by on its
   level, and then comes hopping, never further than `rx` from its bed; left alone, it hops home and nods off again.
   A stomp does for it, asleep or awake. The bobble on its cap is a small light. */
function fenDozyBody(awake){ const c='#e8a04a',d='#b0682a',l='#ffe2b0',n='#7a8fe0'; const b=[[-3,0,-2.6,6,3.6,5.2,c],[-2.4,3.6,-2,4.8,1,4,c],[-2.4,0.4,2.6,4.8,1.8,0.3,l],
    [-3.8,0,-1,1,1.2,2.6,d],[2.8,0,-1,1,1.2,2.6,d],[-0.5,0.6,-4.4,1,1.2,2,d],[-0.5,1.4,-5.6,1,1,1.4,c],
    [-3,4.2,-2.2,6,0.9,4.6,n],[-2.2,5.1,-1.6,4.4,1.2,3.4,n],[-1.2,6.3,-1,2.6,1,2.2,n],[0.6,7.1,-0.6,1.6,0.8,1.4,n]];
  if(awake) b.push(...eye(-2.4,2.2,2.6,2,1.9,1,1.1,0.8,0.3),...eye(0.4,2.2,2.6,2,1.9,1,1.1,0.2,0.3),[-2.6,4,2.6,2.3,0.5,0.5,d],[0.3,4,2.6,2.3,0.5,0.5,d],[-1,0.8,2.9,2,0.9,0.2,'#7a1f3d']);
  else b.push([-2.3,2.8,2.6,1.8,0.4,0.2,INK],[0.5,2.8,2.6,1.8,0.4,0.2,INK],[-2.5,3.1,2.6,0.4,0.4,0.2,INK],[2.1,3.1,2.6,0.4,0.4,0.2,INK],[-0.5,1.4,2.9,1,0.5,0.2,'#7a1f3d']);
  return b; }
function fenDozyBobble(){ return [[1.9,6.4,-0.4,1.1,1.1,1.1,'#fff3a0']]; }
defEnemy('fenDozy',{w:0.8,h:0.7,stomp:true,fly:true,solo:true,
  init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx===undefined?2:d.rx; e.wake=d.wake||2.4; e.st=0; e.stT=0; e.hop=0; e.rest=0; e.dir=-1; },
  mesh(){ const g=new T.Group(), u=g.userData; u.zz=vmesh('fenDozyZ',()=>fenDozyBody(false)); u.up=vmesh('fenDozyUp',()=>fenDozyBody(true)); u.up.visible=false; g.add(u.zz,u.up,vmesh('fenDozyBob',fenDozyBobble,MAT.glow)); return g; },
  tick(e,dt){ const p=player;
    if(e.st===0){ e.x=e.ox; e.y=e.oy; if(!p.dead&&p.onGround&&Math.abs(p.x-e.x)<e.wake&&Math.abs(p.y-e.oy)<0.7){ e.st=1; e.stT=0.7; e.dir=p.x<e.x?-1:1; if(onScreen(e)){ soundAt(e.x); sfx.pop(); } } return; }
    e.stT-=dt;
    if(e.st===1){ if(e.stT<=0){ e.st=2; e.stT=3; e.hop=0; e.rest=0.1; } return; }
    if(!p.dead&&Math.abs(p.x-e.ox)<e.rx+3&&Math.abs(p.y-e.oy)<3) e.stT=Math.max(e.stT,1.2);
    if(e.hop>0){ e.hop-=dt; e.x+=e.vx*dt; e.y=e.oy+Math.sin((1-Math.max(0,e.hop)/0.42)*Math.PI)*0.7; if(e.hop<=0){ e.y=e.oy; e.vx=0; } return; }
    e.y=e.oy; const home=e.stT<=0||p.dead, tx=home?e.ox:clamp(p.x,e.ox-e.rx,e.ox+e.rx), dx=clamp(tx-e.x,-1.3,1.3);
    if(home&&Math.abs(e.x-e.ox)<0.05){ e.st=0; e.x=e.ox; return; }
    e.rest-=dt; if(e.rest<=0&&Math.abs(dx)>0.04){ e.hop=0.42; e.vx=dx/0.42; e.dir=dx<0?-1:1; e.rest=0.22; } },
  anim(e,m,dt,time){ const u=m.userData, up=e.st!==0; u.zz.visible=!up; u.up.visible=up; m.rotation.y=up?e.dir*0.8:0.4;
    const k=e.st===0?1+Math.sin(time*2.2+e.ox)*0.05:e.st===1?1+Math.sin(time*40)*0.08:e.hop>0?1.12:1; m.scale.set(1/Math.sqrt(k),k,1/Math.sqrt(k));
    if(onScreen(e,2)){ glowAt(e.x,e.y+0.8,0.5,0xfff3a0,up?0.9:0.6,up?5:4);
      if(e.st===0&&Math.random()<dt*1.1) spawnPart(e.x+0.35,e.y+0.9,0.4,'#dfe9ff',0.25,0.7,0,1.3,0.08,-0.2,true,{spin:0}); } }});

/* ---------- boardwalk planks: grey, weathered, with moss in the gaps ---------- */
SEMI_LOOKS.fenboard=function(g,part,R){
  PX(g,'#8a7460',0,0,16,16); PX(g,'#a8927a',0,0,16,1); PX(g,'#4f3f30',0,7,16,1); PX(g,'#4f3f30',5,0,1,16); PX(g,'#4f3f30',11,0,1,16);
  for(const q of [[1,3],[7,5],[13,2],[8,11],[2,13]]) PX(g,'#75624f',q[0],q[1],2,1);
  PX(g,'#6fae4a',4,0,2,2); PX(g,'#5f9a4a',10,5,2,2); PX(g,'#2c2430',2,3); PX(g,'#2c2430',8,3); PX(g,'#2c2430',14,3);
  if(part===0){ PX(g,'#4f3f30',0,15,16,1); PX(g,'#6fae4a',12,12,3,2); } };
SEMI_UNDER.fenboard='#3f3226';

/* ---------- the theme ---------- */
const fenGlows=['#7dfff0','#b6ff8a','#ffd66a'];
THEMES.fen={ music:'fen', air:'frogs',
  sky:['#1b4f52','#5f9f78','#efe09a'], skyMid:0.52, glowCol:0xf6f0b0, sunGlow:0.75, cloud:0.4, cloudCol:'#cfe0a8', cloudShade:'#6fa684', cloudY:0.7,
  fog:0x7fb394, fogNear:14, fogFar:125,
  hemiSky:0xe2f4cc, hemiGround:0x4a7a62, hemiI:0.62, sunI:0.58, sunCol:0xffe6a8, sunDir:[-0.6,0.5,0.5],
  top:'#5a9448', topS:['#68a452','#4d8540','#62a04c','#7ab25c'], dirt:'#5c4433', dirtS:['#4f3a2b','#6b5140','#463224'], cap:'#5a9448', capL:'#8cc468', capD:'#2f5a34',
  brick:['#8f6f4c','#5c4433','#b8996a'], hard:['#73857a','#98ab9e','#49594f'], pipe:['#7a5a3a','#a8845a','#4a3422','#1c120c'],
  semi:'fenboard', plat:['#6fc45a','#2f8a48'], dust:'#cfe8c0', back:-5.5, fringe:['#6fae4a','#4f8a3a','#8cc468','#5a9448'],
  liquid:{kind:'water',a:'#0f4a50',b:'#a8f0d8',op:0.84,far:60,mirror:0.78,glint:'#d8ffe0',flow:0.45}, pool:{kind:'water',a:'#1a6a68',b:'#b8f5e0',op:0.6,mirror:0.3,flow:0.5},
  bounce:{kind:'cap',cols:['#3fd6c0','#b8fff0','#1a8a80']}, bounceCol:'#b8fff0', sticky:['#6b4a30','#8f6c48','#3a2618'], stickyCol:'#6b4a30', geyser:['#b6f08a','#ecffd0'],
  disc:['#fff6c8','#fffbe6','#c9bf8a'], discX:0.6, bloom:1, hi:0.16, rays:0.3, dof:0.5, grade:{shadow:[0.92,1.0,1.05],high:[1.06,1.03,0.92]}, wispCol:0xb6ff8a,
  skins:{ribbit:fenFrog,buzz:fenMozzie,wisp:fenWisp},
  fenMoon:9.5, fenCols:{far:'#2f6652',leaf:['#3a7a4a','#2f6a44','#4a8a50'],moss:'#9fb88a',mist:'#c4e4bc',bark:['#6b4a38','#4a3226'],pads:['#4f9a5a','#3f8a50','#5fae62'],deep:'#0a2e36'},
  looks:[null,
    /* 2: violet twilight */
    {sky:['#2a1c62','#7a4f9e','#f2a49c'],skyMid:0.5,fog:0x7a68a0,hemiSky:0xe0d0ff,hemiGround:0x4a4a78,hemiI:0.58,sunI:0.5,sunCol:0xffc0b0,sunDir:[-0.66,0.42,0.5],glowCol:0xffd0c0,sunGlow:0.6,stars:0.35,
      cloud:0.45,cloudCol:'#f0b0c0',cloudShade:'#7a5a9a',disc:['#fff0e0','#fff8f0','#c9a8c0'],discX:-0.55,fenMoon:8.5,
      liquid:{kind:'water',a:'#221a52',b:'#f0c0e0',op:0.84,far:60,mirror:0.8,glint:'#ffd8f0',flow:0.45},grade:{shadow:[0.96,0.92,1.1],high:[1.07,1.0,0.98]},
      fenCols:{far:'#3c3a74',leaf:['#2f6a5c','#285a54','#3a7a64'],moss:'#a8a8c8',mist:'#cbb8ea',bark:['#5a4048','#3a2a34'],pads:['#3f8a66','#347a5c','#4a9a70'],deep:'#141240'}},
    /* 3: night, the moon up */
    {sky:['#060a22','#12264a','#2f5a66'],skyMid:0.5,fog:0x16343f,fogNear:12,fogFar:105,hemiSky:0x9fc0e8,hemiGround:0x1f3a40,hemiI:0.56,sunI:0.5,sunCol:0xbfd8ff,sunDir:[-0.5,0.6,0.45],glowCol:0xcfe6ff,sunGlow:0.6,
      stars:0.8,shoot:1,cloud:0.25,cloudCol:'#2f5a70',cloudShade:'#16303f',air:'crickets',lit:true,disc:['#f4f8ff','#ffffff','#a8b8d8'],discX:0.7,fenMoon:10,darkAmb:0x1c2a44,rays:0.25,
      liquid:{kind:'water',a:'#082a3a',b:'#8fd8e8',op:0.86,far:60,mirror:0.8,glint:'#cfeeff',flow:0.4},grade:{shadow:[0.9,0.98,1.12],high:[1.02,1.03,1.0]},
      fenCols:{far:'#10303c',leaf:['#1f4f48','#1a443e','#27594e'],moss:'#6f9a9a',mist:'#4f7f92',bark:['#3f3038','#2a2028'],pads:['#2f7a5a','#286a50','#3a8a62'],deep:'#04121c'}},
    /* 4: deeper night: the moon behind the trees, swamp light in the sky */
    {sky:['#04061a','#0c1a3a','#1f4a4a'],skyMid:0.46,fog:0x10262f,fogNear:11,fogFar:95,hemiSky:0x8fb0d8,hemiGround:0x1a3038,hemiI:0.52,sunI:0.42,sunCol:0xb0ccff,sunDir:[-0.4,0.66,0.45],glowCol:0xb6ffd0,sunGlow:0.45,
      stars:0.9,shoot:1,cloud:0.3,cloudCol:'#28506a',cloudShade:'#122838',neb:['#1f8a6a','#5a3fa0'],nebI:0.4,air:'crickets',lit:true,disc:['#e8fff0','#f4fff8','#98c0b0'],discX:-0.75,fenMoon:6.5,darkAmb:0x18263e,rays:0.2,
      liquid:{kind:'water',a:'#06222e',b:'#7fd0c8',op:0.87,far:60,mirror:0.82,glint:'#c0f4e0',flow:0.4},grade:{shadow:[0.88,0.98,1.12],high:[1.0,1.04,1.0]},
      fenCols:{far:'#0c2630',leaf:['#1a443e','#163a36','#215046'],moss:'#5f8a8a',mist:'#3f6f80',bark:['#372a32','#241c24'],pads:['#286a50','#225c46','#327a5a'],deep:'#030e16'}},
    /* 5: the King's night: a great green-gold moon */
    {sky:['#04120e','#0f3528','#4a7a3a'],skyMid:0.5,fog:0x143a2c,fogNear:12,fogFar:100,hemiSky:0xb0e0b8,hemiGround:0x1f3a30,hemiI:0.56,sunI:0.5,sunCol:0xe0ffc0,sunDir:[-0.3,0.66,0.5],glowCol:0xe8ffb0,sunGlow:0.85,
      stars:0.6,cloud:0.3,cloudCol:'#3a6a4a',cloudShade:'#16382a',air:'crickets',lit:true,disc:['#f2ffb8','#fbffe0','#a8c070'],discX:0.15,fenMoon:10.5,darkAmb:0x1e3030,rays:0.35,
      liquid:{kind:'water',a:'#08301f',b:'#b8f0a8',op:0.86,far:60,mirror:0.82,glint:'#e0ffc0',flow:0.4},grade:{shadow:[0.9,1.02,1.04],high:[1.04,1.05,0.94]},
      fenCols:{far:'#0f3024',leaf:['#1f4f3a','#1a4432','#27593f'],moss:'#7fa080',mist:'#4f8a6a',bark:['#3f3028','#2a2018'],pads:['#2f7a4a','#286a40','#3a8a52'],deep:'#04140e'}}],
  /* the far view: a shore of cypress crowns against the sky; islands in the middle distance, each with its trees
     standing in their reflections; across the channel, big trees on stilts, cattails, shacks on legs and lily pads;
     mist lying on the water; the moon; fireflies; dragonflies by dusk, and eyes in the dark by night */
  scenery(S,R){
    const W=S.W, far=S.far, lv=S.L, wy=lv.liquidY, night=!!TH.lit, C=TH.fenCols, back=TH.back||-2.5;
    const tree=[C.bark[0],C.bark[1],C.leaf[0],C.leaf[1],C.leaf[2],C.moss];
    const add=(list,model,x,y,z)=>{ for(const b of model) list.push([b[0]+x,b[1]+y,b[2]+z,b[3],b[4],b[5],b[6]]); };
    far.push([-90,wy-1.2,-67,W+180,1.5,7,shade(C.far,0.8)]);
    for(let x=-80;x<W+80;x+=6+R()*8){ const z=-60-R()*5, w=7+R()*7, h=7+R()*8;
      far.push([x-0.5,wy,z,1,h*0.6,1,shade(C.far,0.7)],[x-w/2,wy+h*0.5,z-2,w,h*0.3,4,C.far],[x-w*0.36,wy+h*0.8,z-1.5,w*0.72,h*0.22,3,shade(C.far,1.12)]); }
    for(let x=-50;x<W+50;x+=15+R()*17){ const z=-20-R()*26, w=6+R()*6, n=2+((R()*2)|0);
      far.push([x-w/2,wy-0.6,z-2,w,0.9,4,shade(C.leaf[1],0.75)],[x-w*0.3,wy+0.3,z-1.2,w*0.6,0.3,2.4,C.leaf[1]]);
      for(let i=0;i<n;i++) add(far,scaled(fenCypress(R,tree),0.24+R()*0.14),x+(i-(n-1)/2)*w*0.42+R()*1.5,wy+0.3,z-R()*1.2);
      if(R()<0.35){ const sx=x+w*0.3; add(far,scaled(fenShack(),0.2),sx,wy,z+2.5); add(S.glowFar,scaled(fenShackGlow(),0.2),sx,wy,z+2.5); } }
    for(let x=-18;x<W+18;x+=8+R()*9){ const z=-(8.5+R()*8), r=R();
      if(r<0.62) put(S.flora,scaled(fenCypress(R,tree),1.5+R()*0.5),x*8,wy*8-2,z*8,0.12);
      else if(r<0.84) put(S.flora,scaled(fenMangrove(R,tree),1.7),x*8,wy*8-2,z*8,0.1);
      else { put(S.near,scaled(fenShack(),1.25),x*8,wy*8-2,z*8); put(S.glow,scaled(fenShackGlow(),1.25),x*8,wy*8-2,z*8); if(night) lamps.push({x,y:wy+2,z:z+1.2,col:0xffc060,power:1.2,reach:8}); }
      put(S.flora,fenCattail(R),(x+3+R()*3)*8,wy*8-1,(z+1+R()*2)*8,0.8); }
    for(let x=-10;x<W+10;x+=2.2+R()*3.6){ const z=-(6.4+R()*13); put(S.near,scaled(fenPad(pick(R,C.pads),R()<0.3?pick(R,['#ff9fd0','#fff6e0','#ffd0e8']):null),1+R()*0.8),x*8,wy*8+0.3,z*8); }
    for(let x=-40;x<W+40;x+=9+R()*10){ const z=-(7+R()*40), w=8+R()*12; S.soft.push([x,wy+0.15+R()*0.5,z,w,0.22+R()*0.2,2+R()*3,C.mist],[x+w*0.2,wy+0.5+R()*0.4,z-0.6,w*0.5,0.18,1.6,C.mist]); }
    for(let x=-50;x<W+50;x+=20+R()*22) S.addCloud(x,wy+1+R()*2.2,-(12+R()*30),R,C.mist,0.12+R()*0.2);
    skyDisc(TH.disc,null,TH.fenMoon||9.5,2.3);
    S.addWeather('firefly',{n:night?120:70}); S.addWeather('firefly',{n:14,z:6,size:[0.16,0.16],box:[46,14,4]});
    if(!night) S.addWeather('dust',{n:50,cols:['#fff3c9','#e8ffd0']});
    for(let x=8;x<W;x+=15+R()*16) S.addShaft(x,4.5+R()*3,-3.5-R()*2.5,2.2+R()*2,9,night?'#9fc0ff':'#ffe9b0',-0.4);
    /* pools and flooded passages get a back wall of deep water, so they read as full */
    for(const w of lv.waters) if(!w.base) far.push([w.x0,w.y0,back+0.05,w.x1-w.x0,w.y1-w.y0-0.2,0.25,C.deep]);
    /* the level's own lights: lanterns on posts where it says, and glowing caps */
    for(const q of lv.lanterns||[]){ const x=q[0], y=q[1], z=-2;
      put(S.near,fenPost(),x*8,y*8,z*8); put(S.glow,fenFlame(night?'#ffd27a':'#ffe9a0'),x*8,y*8,z*8);
      lamps.push({x:x+0.44,y:y+2.25,z:z+0.3,col:0xffc870,power:night?1.5:0.8,reach:night?9:6}); }
    for(const q of lv.shrooms||[]){ const c=pick(R,fenGlows); put(S.near,scaled(fenShroomStalk(),1.3),q[0]*8,q[1]*8,-12); put(S.glow,scaled(fenShroomCap(c),1.3),q[0]*8,q[1]*8,-12); lamps.push({x:q[0],y:q[1]+0.6,z:-1.2,col:c,power:1.1,reach:6.5}); }
    if(!night) for(let i=0;i<Math.ceil(W/30);i++){ const c=pick(R,['#3fd6c0','#7fb8ff','#ffb347']), g=new T.Group(), wl=new T.Mesh(geo('fenFlyL',()=>fenFlyWing(-1)),MAT.soft), wr=new T.Mesh(geo('fenFlyR',()=>fenFlyWing(1)),MAT.soft);
      g.add(new T.Mesh(geo('fenFly'+c,()=>fenFly(c)),MAT.vox),wl,wr); const x0=R()*W, y0=3.2+R()*3.5, z=-1.6-R()*3, ph=R()*9, sp=0.4+R()*0.4; g.position.set(x0,y0,z); g.scale.setScalar(0.6); world.add(g);
      critters.push({tick(dt,time){ const u=time*sp+ph; g.position.x=x0+(Math.sin(u)+Math.sin(u*2.7)*0.4)*3.5; g.position.y=y0+Math.sin(u*1.9)*0.5; g.rotation.y=(Math.cos(u)+Math.cos(u*2.7)*1.08>0?1:-1)*Math.PI/2; const f=Math.sin(time*40+ph)*0.5; wl.rotation.z=f; wr.rotation.z=-f; }}); }
    else for(let i=0;i<Math.ceil(W/14);i++){ const m=new T.Mesh(geo('fenEyes',fenEyes),MAT.glow), ph=R()*20, every=4+R()*5; m.position.set(R()*W,wy+0.4+R()*2.6,-(7+R()*12)); m.scale.setScalar(0.7+R()*0.6); world.add(m);
      critters.push({tick(dt,time){ const u=(time+ph)%every; m.visible=u>0.16&&(u<every*0.6||u>every*0.6+2.2); }}); }
  },
  /* on the wet ground: cypresses and mangroves at the back, lanterns, cattails, glowing caps, ferns, stumps and logs */
  decor(S,D,R){
    const r=R(), y=D.ty*8, night=!!TH.lit, C=TH.fenCols, tree=[C.bark[0],C.bark[1],C.leaf[0],C.leaf[1],C.leaf[2],C.moss];
    if(D.wet){ if(r<0.5) put(S.flora,fenReeds(R,'#2f8a6a'),D.jx(),y,D.zb(0.3,4.6),1.2); return; }
    if(r<0.05&&D.free(8)&&D.open) put(S.flora,fenCypress(R,tree),D.jx(),y,D.zb(3,4.3),0.14);
    else if(r<0.085&&D.free(5)&&D.open) put(S.flora,fenMangrove(R,tree),D.jx(),y,D.zb(2.8,4.3),0.12);
    else if(r<0.11&&D.free(4)&&D.open){ const x=D.jx(), z=D.zb(2.2,4.4); put(S.near,fenPost(),x,y,z); put(S.glow,fenFlame(night?'#ffd27a':'#ffe9a0'),x,y,z); lamps.push({x:x/8+0.44,y:D.ty+2.25,z:z/8+0.3,col:0xffc870,power:night?1.4:0.7,reach:night?8.5:6}); }
    else if(r<0.2&&D.free(3)&&D.open) put(S.flora,fenCattail(R),D.jx(),y,D.zb(1.6,4.8),0.8);
    else if(r<0.29){ const x=D.jx(), z=D.zb(1.3,5), c=pick(R,fenGlows); put(S.near,fenShroomStalk(),x,y,z); put(S.glow,fenShroomCap(c),x,y,z); if(night&&R()<0.5) lamps.push({x:x/8,y:D.ty+0.5,z:z/8,col:c,power:0.8,reach:5}); }
    else if(r<0.37) put(S.flora,fenFern(),D.jx(),y,D.zb(1.2,5),1);
    else if(r<0.42) put(S.near,R()<0.5?fenStump():fenLog(),D.jx(),y,D.zb(1.9,4.6));
    else if(r<0.5) put(S.flora,fenReeds(R,'#6fae4a'),D.jx(),y,D.zb(1.2,5.2),1.3);
    else if(r<0.55) put(S.near,fenKnees(R),D.jx(),y,D.zb(1.3,5));
    else if(r<0.6) put(S.near,dRock(pick(R,['#73857a','#5a7a5a'])),D.jx(),y,D.zb(1.2,5));
    const f=R();
    if(f<0.1){ const x=D.jx(), z=D.zf(); S.near.push([x-0.3,y,z-0.3,0.6,1.2,0.6,'#d9e8d0']); S.glow.push([x-1,y+1.2,z-1,2,0.7,2,pick(R,fenGlows)]); }
    else if(f<0.24) put(S.flora,dTuft('#6fae4a'),D.jx(),y,D.zf(),1);
  }
};

/* a level's own lanterns: a list of x, or [x, height of the foot] for one that stands in the water or on high ground */
function fenLamps(B,list){ B.L.lanterns=(B.L.lanterns||[]).concat(list.map(q=>typeof q==='number'?[q,2]:q)); return B; }

/* 4-1: Lily Lane, at dusk. The fen's first things, one at a time: pads that sink, water that is safe, something that
   leaps out of it, and mud. A spark hides under the first boardwalk, and a flight of pads climbs to another. */
function w4l1(){
  const B=LevelBuilder(262,'fen'); B.liquid(1.5);
  B.room(0,229).room(234,261,0,15,true);
  B.ground(0,26).ground(40,58).ground(62,84).ground(104,124).ground(128,150).ground(170,233);
  fenLamps(B,[14,[33,1.2],50,[92,1.2],118,143,[161,1.2],186]);
  B.coins(6,3,3).row(11,5,'?B?').enemy('blob',16).coins(19,3,3);
  B.sign(23,'Lily pads sink a moment after you land: keep hopping. The water is safe. Tap {jump} to swim, and {jump} at the top to leap out.');
  B.fall(28,2,2).fall(32,2,2).fall(36,2,2).coins(28,4,2).coins(36,4,2).spark(32.5,5);
  B.row(44,5,'?M?').enemy('ribbit',49).coins(51,3,3).sign(55,'Something lurks under the water. Watch for its light, and cross when it has gone back down.');
  B.enemy('fenGulper',60,2,{rise:3.5});
  B.sign(64,'Mud! It is slow going, and jumps from it are short.');
  B.sticky(68,1,74,1).coins(69,3,5).enemy('blob',73).row(78,5,'B?B').enemy('shellby',81);
  /* the long crossing: planks, pads, and a gulper between them; the second spark hides under the first planks */
  B.row(85,1,'====').spark(87,0).fall(90,2,2).enemy('fenGulper',92.5,2,{rise:3.5,phase:0.7}).fall(94,2,2).row(97,1,'===').fall(101,2,2).coins(85,3,4).arc(90,4,6).coins(97,3,3);
  B.checkpoint(108).row(112,5,'B?B').enemy('boing',116).enemy('ribbit',121);
  B.enemy('fenGulper',126,2,{rise:4});
  B.row(131,5,'?O?').enemy('shellby',134).enemy('blob',138);
  B.warp(141,2,'in').warp(147,3,'out',true);
  /* pads along the water for the road, and a flight of them climbing to the third spark */
  B.fall(152,2,2).fall(156,2,2).fall(160,2,2).fall(164,2,2).fall(167,2,2).coins(152,4,2).coins(167,4,2);
  B.fall(159,5,2).fall(163,8,2).spark(166.5,10).coins(159,7,2).coins(163,10,2).enemy('fenGulper',162.5,2,{rise:3,phase:0.5});
  B.row(174,5,'B?B').enemy('ribbit',178).sticky(182,1,187,1).enemy('boing',185).row(190,5,'?M?').enemy('blob',193).pipe(197,2,true);
  B.stairs(200,6).fill(206,2,206,7,HARD);
  B.goal(212);
  /* a hollow under the roots: glowing caps to bounce on, and a life at the top */
  B.fill(230,2,233,15,GROUND).ground(234,261).fill(234,2,234,15,HARD).fill(261,2,261,15,HARD);
  B.warp(236,2,'in',true).warp(257,2,'out').row(241,2,'JJ').coinCol(241,5,4).coinCol(242,5,4).row(244,8,'=====').coins(244,9,5).row(246,12,'?L?').coinBox(250,3,254,5);
  return B.L;
}

/* 4-2: Gaslight Boardwalk, at twilight. Swamp gas lifts Blorp to the high walks, twice in a row for a spark; logs
   that crumble; two frogs glaring at each other across a gap; mosquitoes; and the Dozy, asleep on its planks. */
function w4l2(){
  const B=LevelBuilder(288,'fen',18); B.liquid(1.5);
  B.room(0,255).room(260,287,0,17,true);
  B.ground(0,34).ground(51,65).ground(74,84).ground(88,100).ground(103,103).ground(121,137).ground(151,163).ground(171,196).ground(216,259);
  fenLamps(B,[18,[42,1.2],60,79,95,[111,1.2],130,[142,1.2],158,180,[203,1.2],222]);
  B.coins(6,3,3).row(10,5,'?O?').enemy('blob',15).enemy('buzz',21,7);
  B.sign(27,'Swamp gas! It will not hurt you. Ride it up, and jump off at the top.');
  B.geyser(32,2,7,4.5).coinCol(32,4,4).row(35,7,'=============').coins(36,9,3).spark(41,9).coins(44,9,3).enemy('buzz',46,11);
  B.fall(36,2,2).fall(40,2,2).fall(44,2,2).fall(48,2,2).enemy('fenGulper',42.5,2,{rise:3});
  B.row(55,5,'B?B').enemy('shellby',58).sign(62,'Rotten logs crumble underfoot. Do not dawdle.');
  B.row(66,1,'KKKKKKKK').coins(67,3,6).enemy('buzz',70,7);
  /* two frogs, one each side of a gap */
  B.row(77,5,'?').enemy('ribbit',82).enemy('ribbit',89).row(92,5,'?M?').enemy('blob',96);
  /* the gas stair: one spout to the first walk, a second standing on it to the top one and its spark; pads below */
  B.geyser(103,2,6,4.5).row(105,7,'======').geyser(110,8,5,4,1.5).row(112,11,'======').spark(115,13).coins(106,9,3).coins(113,13,2);
  B.fall(105,2,2).fall(109,2,2).fall(113,2,2).fall(117,2,2).enemy('fenGulper',107.5,2,{rise:3}).enemy('fenGulper',115.5,2,{rise:3,phase:0.8});
  B.checkpoint(125).row(129,5,'B?B').enemy('buzz',132,7).sign(135,'Shh! A Dozy sleeps until somebody lands close by. Stomp it in its sleep, or be quick.');
  B.row(140,1,'=====').enemy('fenDozy',142,2,{rx:1.6}).fall(147,2,2).coins(141,4,3);
  B.row(154,5,'?O?').enemy('ribbit',159).row(164,1,'KKKKKKK').enemy('buzz',167,7).coins(165,3,5);
  B.warp(175,2,'in').enemy('boing',181).sticky(183,1,187,1).warp(190,3,'out',true);
  /* the last water: gas to a high walk where a Dozy sleeps, or pads and planks below */
  B.geyser(195,2,7,4.5).row(198,7,'===========').enemy('fenDozy',203,8,{rx:2.5}).coins(199,9,3).coins(205,9,3);
  B.fall(198,2,2).row(201,1,'===').fall(205,2,2).enemy('fenGulper',207.5,2,{rise:3}).fall(209,2,2).fall(213,2,2);
  B.row(219,5,'?B?').enemy('blob',221).enemy('shellby',224);
  B.stairs(228,6).fill(234,2,234,7,HARD);
  B.goal(240);
  /* a gas vent in a hollow tree: the third spark is up where it blows */
  B.fill(256,2,259,17,GROUND).ground(260,287).fill(260,2,260,17,HARD).fill(287,2,287,17,HARD);
  B.warp(262,2,'in',true).warp(283,2,'out').geyser(268,2,8,4).coinCol(268,4,6).row(270,9,'====').coins(270,10,4).row(276,2,'J').coinCol(276,5,5).row(278,10,'===').spark(279,11);
  return B.L;
}

/* 4-3: Lights Out. The first dark level: lanterns on posts, a Wisp to read by, caps that glow. In the middle a bank
   of earth with a flooded passage through it: over the top is the road, down the well and through is the spark. */
function w4l3(){
  const B=LevelBuilder(262,'fen'); B.liquid(1.5).set('dark',0.55);
  B.ground(0,34).ground(49,76).ground(77,108,6).ground(109,135).ground(158,200).ground(217,261);
  fenLamps(B,[6,17,31,[38,1.2],[47,1.2],56,70,[78,6],[91,6],[106,6],111,121,133,[139,1.2],[147,1.2],[156,1.2],165,177,190,199,[204,1.2],[212,1.2],219,229,238]);
  B.set('shrooms',[[84.5,2],[90,2],[95,2],[100.5,2]]);
  B.sign(4,'Night has fallen on the fen. Lanterns, Wisps and glowing caps show the way, and a sunbloom makes you shine.');
  B.row(8,5,'?O?').enemy('blob',14).enemy('shellby',19).sign(23,'A Wisp is a light, and it burns. Only a dash or a star puts one out.').enemy('wisp',28,5.4,{rx:2,ry:1.4});
  B.fall(36,2,2).fall(40,2,2).fall(44,2,2).enemy('fenGulper',42.5,2,{rise:3}).spark(40.5,5).coins(36,4,2).coins(44,4,2);
  B.row(53,5,'B?B').enemy('ribbit',58).row(63,2,'JJ').coinCol(63,5,3).coinCol(64,5,3).row(66,9,'====').row(67,13,'L').coins(66,10,4);
  /* the flooded passage: up on the gas, then over the top, or down the well and through */
  B.geyser(74,2,5,4.5).clear(80,2,104,4).clear(80,5,82,5).clear(102,5,104,5).water(80,2,104,5);
  B.enemy('ribbit',89,6).enemy('fenDozy',96,6,{rx:2}).coins(85,7,3);
  B.enemy('jelly',87,2.8,{ry:0.75}).enemy('jelly',97,2.8,{ry:0.75,sp:1.3}).spark(92,3).coins(83,3,3).coins(99,3,3);
  B.checkpoint(113).row(117,5,'?M?').enemy('boing',121);
  /* a block in a ring of Wisps */
  B.row(127,6,'?').enemy('wisp',127,6.4,{rx:2.4,ry:2.4,sp:1.3}).enemy('wisp',127,6.4,{rx:2.4,ry:2.4,sp:1.3,phase:Math.PI/1.3}).enemy('shellby',131);
  /* rotten logs and pads over the black water, a lantern at every other post */
  B.row(137,1,'KKKK').fall(143,2,2).row(146,1,'===').fall(150,2,2).row(154,1,'KKKK').enemy('fenGulper',141.5,2,{rise:3}).enemy('fenGulper',152.5,2,{rise:3,phase:0.8}).coins(137,3,4).coins(146,3,3).coins(154,3,4);
  B.row(162,5,'B?B').enemy('shellby',166).enemy('ribbit',170);
  /* two posts of mud to kick up between: the third spark is at the top, above the lantern light */
  B.fill(175,5,175,12,STICKY).fill(179,5,179,12,STICKY).coinCol(177,5,7).spark(177,13);
  B.row(184,5,'?O?').enemy('boing',188).enemy('blob',193).pipe(196,2,true);
  /* the last pads, with a Wisp going round them */
  B.fall(202,2,2).fall(206,2,2).fall(210,2,2).fall(214,2,2).enemy('wisp',208.5,4,{rx:4.5,ry:1.6,sp:0.9}).coins(206,4,2).coins(210,4,2);
  B.enemy('ribbit',221).row(224,5,'?B?').enemy('blob',227);
  B.stairs(231,5).fill(236,2,236,6,HARD);
  B.goal(242);
  return B.L;
}

/* 4-4: The Wisp Walk. Darker still. The lanterns give out at a long broken boardwalk, and the only light along it is
   the Wisps that circle each stretch: they show the way and they bar it. Then gas to the top of a mud bank, with a
   hollow under its far end. */
function w4l4(){
  const B=LevelBuilder(300,'fen'); B.liquid(1.5).set('dark',0.7);
  B.room(0,265).room(270,299,0,15,true);
  B.ground(0,30).ground(51,82).ground(130,173).ground(174,190,7).ground(191,203).ground(212,269);
  fenLamps(B,[5,13,22,29,[34,1.2],[41,1.2],[47,1.2],53,62,72,80,131,139,148,158,167,[176,7],[183,7],[189,7],194,202,[207,1.2],214,223,231,241,274,284,293]);
  B.set('shrooms',[[186.5,2],[189.5,2]]);
  B.row(8,5,'?O?').enemy('blob',14).enemy('ribbit',23);
  B.fall(32,2,2).fall(36,2,2).row(39,1,'=====').enemy('fenDozy',41,2,{rx:1.5}).fall(45,2,2).fall(48,2,2).spark(36.5,5).enemy('fenGulper',34.5,2,{rise:3}).coins(40,4,3);
  B.row(55,5,'B?B').enemy('boing',60).sticky(64,1,71,1).enemy('wisp',67.5,5.6,{rx:3,ry:1.4,sp:1.1}).enemy('wisp',67.5,5.6,{rx:3,ry:1.4,sp:1.1,phase:Math.PI/1.1}).enemy('shellby',76).coins(65,3,6);
  /* the Wisp Walk: five stretches of planks, each with its own light going round it */
  B.sign(79,'The lanterns stop here. Follow the Wisps, and mind them: they come round low.');
  B.row(85,1,'======').row(94,1,'======').row(103,1,'======').row(112,1,'======').row(121,1,'======');
  B.enemy('wisp',87.5,4.8,{rx:2.6,ry:2.3,sp:1.1}).coins(86,3,4);
  B.enemy('wisp',96.5,4.8,{rx:2.6,ry:2.3,sp:-1.3,phase:1}).coins(95,3,4);
  B.enemy('wisp',105.5,4.9,{rx:2.6,ry:2.4,sp:1}).enemy('wisp',105.5,4.9,{rx:2.6,ry:2.4,sp:1,phase:Math.PI}).spark(105.5,4);
  B.enemy('fenGulper',110,2,{rise:3}).enemy('ribbit',115).enemy('wisp',114.5,6.6,{rx:2.5,ry:1,sp:1}).coins(113,3,2);
  B.enemy('wisp',123.5,4.8,{rx:2.6,ry:2.3,sp:1.4,phase:2}).coins(122,3,4);
  B.checkpoint(134).row(138,5,'?M?').enemy('shellby',142).warp(147,2,'in').warp(155,3,'out',true).enemy('boing',160).enemy('blob',165);
  /* gas to the top of the mud bank; under its far end, a hollow with a frog in it and a spark behind the frog */
  B.geyser(171,2,6,4.5).coinCol(171,4,4).fill(174,2,174,6,STICKY).row(178,10,'?O?').enemy('ribbit',183,7).clear(185,2,190,4).spark(185,2).enemy('ribbit',187).coins(188,2,2);
  B.row(195,5,'B?B').enemy('blob',198).row(204,1,'KKKKKKKK').enemy('wisp',207.5,5.6,{rx:3,ry:1.2}).coins(205,3,6);
  B.row(216,5,'?M?').enemy('ribbit',221).enemy('boing',226);
  B.stairs(232,6).fill(238,2,238,7,HARD);
  B.goal(244);
  /* a Wisp's hoard: coins with their keeper going round them, and a life over a glowing cap */
  B.fill(266,2,269,15,GROUND).ground(270,299).fill(270,2,270,15,HARD).fill(299,2,299,15,HARD);
  B.warp(272,2,'in',true).warp(295,2,'out').row(277,2,'J').coinCol(277,5,5).row(279,9,'====').coins(279,10,4).row(280,13,'?L?').coinBox(285,3,290,5).enemy('wisp',287.5,4.2,{rx:4.2,ry:2.2,sp:1.2});
  return B.L;
}

/* 4-5: King Croak's Court. A short way in by lantern light: pads, a ring of Wisps, two frogs across a gap, a stair of
   rotten logs with a spark at the top, and one great gust of gas up to the bank above his pond. Then down to him. */
function w4l5(){
  const B=LevelBuilder(200,'fen',18); B.liquid(1.5).set('dark',0.5);
  B.ground(0,24).ground(45,70).ground(74,112).ground(116,133).ground(134,160,7).ground(161,199).stairs(161,5,-1);
  fenLamps(B,[5,13,22,[30,1.2],[38,1.2],47,56,67,77,87,96,106,118,127,[136,7],[146,7],[156,7],168,174,180,186,192]);
  B.row(8,5,'?O?').enemy('blob',14).enemy('ribbit',20);
  B.fall(26,2,2).row(29,1,'===').fall(33,2,2).fall(37,2,2).row(40,1,'KKKKK').spark(33.5,5).enemy('fenGulper',35.5,2,{rise:3}).coins(29,3,3).coins(40,3,5);
  B.row(49,5,'B?B').enemy('boing',53).row(58,6,'?').enemy('wisp',58,6.4,{rx:2.3,ry:2.3,sp:1.2}).enemy('wisp',58,6.4,{rx:2.3,ry:2.3,sp:1.2,phase:Math.PI/1.2}).sticky(62,1,66,1);
  /* two frogs across a gap, again */
  B.enemy('ribbit',68).enemy('ribbit',76).enemy('shellby',81).row(84,5,'?M?');
  /* a stair of rotten logs: each step goes a moment after it is stood on */
  B.row(89,4,'KK').row(93,6,'KK').row(97,8,'KK').spark(100,10).coins(93,8,2).coins(97,10,2);
  B.row(106,5,'?').row(107,9,'I').enemy('blob',109).enemy('fenGulper',114,2,{rise:3.5}).enemy('fenDozy',121,2,{rx:2}).row(124,5,'B?B');
  /* the gust: off to the right part way up for the bank, or all the way to the top and left for the last spark */
  B.geyser(131,2,10,5).coinCol(131,4,7).row(126,11,'===').spark(127,13);
  B.checkpoint(138,7).row(143,10,'BOB').sign(150,'King Croak leaps, then lashes out his tongue. Jump it! Then he is out of puff: stomp him.',7);
  /* the King's pond: flat, with steps down into it from the bank (above the reach of his tongue) and stone at the far end */
  B.fill(195,2,199,15,HARD);
  B.boss(188,170,194,9,'croak');
  return B.L;
}

/* ---------- the island on the map ---------- */
/* King Croak's throne: a great stump with a lily for a cushion, a crown carved on its back, and a torch each side */
function fenThrone(){ const t='#6b4a30',d='#4a3220',m='#5f9a4a',g='#ffc928'; return [[-9,0,-8,18,5,16,t],[-11,0,-5,3,2.4,4,d],[8,0,-2,3,2,4,d],[-4,0,8,3,1.8,3,d],[3,0,7,3,1.4,3,d],
  [-9,5,-8,18,0.6,16,'#b89a6a'],[-7,5.6,-2,14,1.2,9,'#4f9a5a'],[-6,6.8,-1,12,0.6,7,'#6fc45a'],
  [-8,5.6,-8,16,13,3.4,t],[-9,10,-8.4,2,10,3,d],[7,10,-8.4,2,10,3,d],[-6,18.6,-8,12,2.4,3,d],[-3,21,-8,6,2,3,t],
  [-2,12.6,-4.5,4,0.9,0.4,g],[-2,13.5,-4.5,0.9,1.3,0.4,g],[-0.45,13.5,-4.5,0.9,1.8,0.4,g],[1.1,13.5,-4.5,0.9,1.3,0.4,g],
  [-8.4,7,-5,2.4,1,2,m],[6,9,-4.8,2.4,1,2,m],[-4,23,-7.6,3,0.8,2.4,m],
  [-11.5,0,5,1,9,1,d],[10.5,0,5,1,9,1,d],[-12,9,4.5,2,0.8,2,d],[10,9,4.5,2,0.8,2,d]]; }
function fenThroneGlow(){ return [[-11.7,9.8,4.8,1.4,2.2,1.4,'#ffb347'],[-11.4,12,5.1,0.8,1.2,0.8,'#ffe9a0'],[10.3,9.8,4.8,1.4,2.2,1.4,'#ffb347'],[10.6,12,5.1,0.8,1.2,0.8,'#ffe9a0'],[-7,5.6,6,1.6,1.4,1.6,'#7dfff0'],[5,5.6,5.6,1.2,1,1.2,'#b6ff8a']]; }
defWorld({name:'Firefly Fen',theme:'fen',levels:[w4l1,w4l2,w4l3,w4l4,w4l5],
  map:{
    /* low, murky ground, with moss in patches */
    ground:(h,p)=>[p<0.3?['#5f9248','#588a44']:['#4d7f42','#487a3e'],['#5c4433','#4f3a2b']],
    pond:['#2fa89a','#1f7f80','#145a66'],
    scatter(M,c){ const r=c.r, tree=['#6b4a38','#4a3226','#3a7a4a','#2f6a44','#4a8a50','#9fb88a'];
      if(r<0.1&&c.clear(2.4)) M.put(M.flora,fenCypress(c.R,tree),c.x,c.y,c.z,0.55+c.r2*0.2,0.15);
      else if(r<0.16&&c.clear(1.6)) M.put(M.flora,fenMangrove(c.R,tree),c.x,c.y,c.z,0.6,0.15);
      else if(r<0.3) M.put(M.flora,fenCattail(c.R),c.x,c.y,c.z,0.55,0.8);
      else if(r<0.4){ const g=pick(c.R,fenGlows); M.put(M.land,fenShroomStalk(),c.x,c.y,c.z,0.9); M.put(M.glow,fenShroomCap(g),c.x,c.y,c.z,0.9); if(c.r2<0.35) M.lamp(c.x,c.y+0.5,c.z,g,0.9,4); }
      else if(r<0.44&&c.clear(1.4)){ M.put(M.land,fenPost(),c.x,c.y,c.z,0.5); M.put(M.glow,fenFlame('#ffd27a'),c.x,c.y,c.z,0.5); M.lamp(c.x+0.2,c.y+1.2,c.z+0.2,0xffc870,1.2,5); }
      else if(r<0.56) M.put(M.flora,fenFern(),c.x,c.y,c.z,0.8,1);
      else if(r<0.62) M.put(M.land,fenStump(),c.x,c.y,c.z,0.7);
      if(r>0.8) M.mote({kind:1,x:c.x,y:c.y+0.5+c.r2*0.8,z:c.z,col:c.r2<0.5?'#d9ff6a':'#fff3a0',size:0.05,span:0.8,rate:0.2+c.r2*0.25}); },
    pondScatter(M,c){ if(c.r<0.6) M.put(M.land,fenPad(c.r2<0.5?'#4f9a5a':'#5fae62',c.r<0.2?(c.r2<0.5?'#ff9fd0':'#fff6e0'):null),c.x,c.y,c.z,0.85);
      if(c.r>0.7) M.mote({kind:1,x:c.x,y:c.y+0.5+c.r2*0.5,z:c.z,col:'#d9ff6a',size:0.05,span:0.7,rate:0.25}); },
    /* the throne, the King on it, and his torches */
    landmark(M,x,y,z){ M.put(M.land,fenThrone(),x,y,z,1); M.put(M.glow,fenThroneGlow(),x,y,z,1); M.put(M.land,mBossCroak(),x,y+0.93,z+0.3,1.5);
      M.lamp(x-1.4,y+1.5,z+0.7,0xffb347,1.4,6); M.lamp(x+1.4,y+1.5,z+0.7,0xffb347,1.4,6); }
  }});
