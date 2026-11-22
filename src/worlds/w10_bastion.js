/* ================= World 10: Blackout Bastion ================= */
/* Baron Blackout's fortress, afloat in the sky under an eclipse he made himself. Black stone and brass, and every light
   in the place put out: street lamps gone dark, candles under snuffers, chandeliers hanging unlit. The only gold left is
   in the jars of stolen sun sparks, caged, far off. Thunderheads roll underneath. Here Blorp meets Smudge, his own
   shadow, and every machine the game has, one last time; and on the roof, the Baron. */

/* ---------- the tune ---------- */
/* @song */
/* C minor, a dark march: a reedy lead that climbs by steps and falls by leaps, low brass that swells open on every
   chord, an organ holding the chords stacked, a wood block and a rim ticking like a clock, and timpani at the ends of
   the phrases. The middle eight lifts to E flat like a door opening on a lit room, and G7 shuts it again. */
SONGS.bastion=(()=>{
  const h='C5 . D5 . Eb5 - F5 G5  G5 - - C5 Eb5 - . .  Ab4 . Bb4 . C5 - D5 Eb5  D5 - - G4 B4 - . . ';
  const a=h+'F4 . G4 . Ab4 - Bb4 C5  C5 - - F4 Ab4 - . .  G4 . A4 . B4 . C5 D5  F5 - - D5 B4 - G4 - ';
  const a2=h+'F5 . G5 . Ab5 - G5 F5  G5 - - D5 B4 - D5 .  Eb5 . D5 . C5 - - G4  C5 - - - . . . . ';
  const b='Eb5 - - G5 Bb5 - - .  Bb5 . Ab5 . G5 - Eb5 .  D5 - - F5 Bb5 - - .  Bb5 . Ab5 . F5 - D5 .  C5 - - Eb5 Ab5 - - .  Ab5 . G5 . Eb5 - C5 .  B4 . D5 . G5 . B5 .  D6 - B5 - G5 F5 D5 B4 ';
  const ch='Cm Cm Ab G Fm Fm G G7  Cm Cm Ab G Fm G Cm Cm  Eb Eb Bb Bb Ab Ab G G7  Cm Cm Ab G Fm G Cm Cm';
  const d='kw . n . sw . n h ', d4='kw . n . sw . l l ', d8='kw . n . l l m l ', p=d+d+d+d4+d+d+d+d8;
  return song({key:'C minor',bpm:132,ec:0.5,fb:0.28},
    [{w:'square',v:0.048,det:7,vib:8,s:0.55,g:0.85,e:1,r:0.3},a+a2+b+a2],
    [{w:'sawtooth',v:0.05,g:0.92,s:0.7,lp:[1.2,6],q:1.4,pan:-0.3,r:0.25},musArp(ch,8,'1 - - - 5 - - 1','C3')],
    [{w:'triangle',v:0.03,h:2,g:0.95,s:0.9,a:0.02,r:0.6,pan:0.3},musChord(ch,8,'X - - - - - X -','G3')],
    [{w:'triangle',v:0.22,g:0.6},musArp(ch,8,'1 . 5 . 1 . 5 .','C2')],
    [{dr:1,v:0.9},p+p+'kwx . n . sw . n h '+d+d+d4+d+d+d+d8+p]);
})();
/* @endsong */

/* ---------- models ---------- */
const bastionC={k:'#1d1830',s:'#3a3456',s2:'#4c4670',s3:'#5e5886',br:'#b08a3c',brL:'#e0bd6a',brD:'#6a4e1c',v:'#6a4fa8',vD:'#3a2a6b',em:'#ff7a3d',glass:'#56608a',wax:'#e8e0c8'};
/* a street lamp gone dark: a post, an arm, and a glass with nothing in it */
function bastionLamp(){ const c=bastionC; return [[-1.4,0,-1.4,2.8,1,2.8,c.brD],[-0.5,1,-0.5,1,14,1,c.k],[-0.9,6,-0.9,1.8,0.6,1.8,c.br],[-0.5,15,-0.5,4.2,0.8,1,c.k],[2.2,11.4,-1.2,2.6,3.2,2.4,c.glass],[1.9,14.6,-1.5,3.2,0.6,3,c.br],[2.9,15.2,-0.5,1.2,0.8,1,c.br],[1.9,10.8,-1.5,3.2,0.6,3,c.br]]; }
/* a candle under its snuffer */
function bastionCandle(){ const c=bastionC; return [[-1,0,-1,2,0.5,2,c.brD],[-0.6,0.5,-0.6,1.2,2.2,1.2,c.wax],[-1.1,2.4,-1.1,2.2,1.2,2.2,c.br],[-0.7,3.6,-0.7,1.4,1,1.4,c.br],[-0.3,4.6,-0.3,0.6,0.8,0.6,c.brL],[0.3,5,-0.2,1.6,0.4,0.4,c.brD]]; }
/* a brass cage on a post. The jar of sun sparks inside it is drawn apart, as a light. */
function bastionCage(){ const c=bastionC; return [[-0.5,0,-0.5,1,6,1,c.k],[-1.2,0,-1.2,2.4,0.8,2.4,c.brD],[-2.2,6,-2.2,4.4,0.6,4.4,c.br],[-2.2,11.4,-2.2,4.4,0.6,4.4,c.br],
  [-2.2,6.6,-2.2,0.5,4.8,0.5,c.br],[1.7,6.6,-2.2,0.5,4.8,0.5,c.br],[-2.2,6.6,1.7,0.5,4.8,0.5,c.br],[1.7,6.6,1.7,0.5,4.8,0.5,c.br],[-1,12,-1,2,0.8,2,c.brD],[-0.4,12.8,-0.4,0.8,0.8,0.8,c.brL]]; }
/* the same cage hung on a chain, for where there is no ground behind the lane to stand it on */
function bastionHang(){ const c=bastionC, b=[[-2.2,0,-2.2,4.4,0.6,4.4,c.br],[-2.2,5.4,-2.2,4.4,0.6,4.4,c.br],[-2.2,0.6,-2.2,0.5,4.8,0.5,c.br],[1.7,0.6,-2.2,0.5,4.8,0.5,c.br],[-2.2,0.6,1.7,0.5,4.8,0.5,c.br],[1.7,0.6,1.7,0.5,4.8,0.5,c.br],[-1,6,-1,2,0.8,2,c.brD]];
  for(let i=0;i<14;i++) b.push([i%2?-0.5:-0.2,6.8+i*2.6,i%2?-0.2:-0.5,i%2?1:0.4,2.8,i%2?0.4:1,c.k]); return b; }
function bastionJar(y){ y=y===undefined?6.8:y; return [[-1.2,y,-1.2,2.4,3,2.4,'#ffd23e'],[-0.8,y+3,-0.8,1.6,0.6,1.6,'#fff3a0'],[-0.6,y+0.8,1.2,1.2,1.2,0.1,'#fffbe0']]; }
/* the Baron's banner: an eclipse on violet */
function bastionBanner(){ const c=bastionC; return [[-0.4,0,-0.4,0.8,20,0.8,c.k],[-1,0,-1,2,0.8,2,c.brD],[-0.6,20,-0.6,1.2,1,1.2,c.br],[0.4,9,-0.15,5,10,0.3,c.v],[0.4,8,-0.15,1.6,1,0.3,c.v],[3.8,8,-0.15,1.6,1,0.3,c.v],
  [1.6,13,0.15,2.6,2.6,0.1,c.k],[2.3,13.7,0.2,1.2,1.2,0.1,c.em],[0.4,18.4,-0.2,5,0.6,0.4,c.br]]; }
function bastionMerlon(){ const c=bastionC; return [[-3.6,0,-1.6,7.2,4.4,3.2,c.s],[-4,4.4,-2,8,0.8,4,c.s2]]; }
function bastionPost(){ const c=bastionC; return [[-0.6,0,-0.6,1.2,3.4,1.2,c.k],[-0.9,3.4,-0.9,1.8,0.8,1.8,c.br]]; }
function bastionStud(){ const c=bastionC; return [[-0.7,0,-0.7,1.4,0.5,1.4,c.brD],[-0.4,0.5,-0.4,0.8,0.4,0.8,c.brL]]; }
/* a cog, face on, to be turned about its middle; `flat` lays it on the ground */
function bastionCog(c,r,flat){ const d=shade(c,0.7), t=r*0.34, b=[[-r*0.78,-r*0.78,-0.6,r*1.56,r*1.56,1.2,c],[-r*1.08,-t,-0.6,r*2.16,t*2,1.2,c],[-t,-r*1.08,-0.6,t*2,r*2.16,1.2,c],[-r*0.3,-r*0.3,-0.8,r*0.6,r*0.6,1.6,d]];
  return flat?b.map(q=>[q[0],q[2]+0.8,q[1],q[3],q[5],q[4],q[6]]):b; }
/* skins. A Wisp here is a captive light: a spark with a long face, in a little cage of its own. */
function bastionWisp(){ const d='#6a4e1c'; return [[-2,0.8,-2,4,3.6,4,'#ffd23e'],[-1.4,0.3,-1.4,2.8,4.6,2.8,'#fff3a0'],[-0.8,4.9,-0.8,1.6,1.1,1.6,'#ffd23e'],[-0.4,6,-0.4,0.8,0.8,0.8,'#fff3a0'],
  [-1.2,2.5,2,0.8,1.1,0.15,INK],[0.4,2.5,2,0.8,1.1,0.15,INK],[-0.6,1.5,2,1.2,0.35,0.15,INK],
  [-2.7,0,-2.7,5.4,0.4,5.4,d],[-2.7,0.4,-2.7,0.45,5.4,0.45,d],[2.25,0.4,-2.7,0.45,5.4,0.45,d],[-2.7,0.4,2.25,0.45,5.4,0.45,d],[2.25,0.4,2.25,0.45,5.4,0.45,d],[-2.7,5.8,-2.7,5.4,0.4,0.45,d],[-2.7,5.8,2.25,5.4,0.4,0.45,d]]; }
/* a saw here is a brass cog off its axle */
function bastionGear(){ const c=bastionC, b=[[-3,-3,-0.5,6,6,1,c.br],[-2.2,-3.6,-0.5,4.4,7.2,1,c.br],[-3.6,-2.2,-0.5,7.2,4.4,1,c.br],[-1.4,-1.4,-0.8,2.8,2.8,1.6,c.brD],[-0.5,-0.5,-0.9,1,1,1.8,c.brL]];
  for(let i=0;i<8;i++){ const a=i/8*6.283, x=Math.cos(a)*4.1, y=Math.sin(a)*4.1; b.push([x-0.9,y-0.9,-0.5,1.8,1.8,1,i%2?c.brD:c.brL]); } return b; }
/* Rattles in the Baron's livery: a brass helmet with an ember plume */
function bastionGuard(){ const c=bastionC; return mBones().concat([[-2.9,7.1,-2.7,5.8,1.5,5.4,c.br],[-3.2,6.7,-3,6.4,0.6,6,c.brD],[-0.4,8.6,-1.6,0.8,1.6,3.2,c.em]]); }
function bastionBall(){ return mRoller('#7a7896','#3e3a58'); }
function bastionDrone(){ return mDrone('#8a6ad0','#4a3a8a','#d8c8ff'); }
/* the Snuffer: a candle snuffer with feet and a temper. The handle on its head is where to land. */
function bastionSnuffM(){ const c=bastionC; return [[-3.4,0.8,-3.4,6.8,0.7,6.8,c.brD],[-3,1.5,-3,6,2.2,6,c.br],[-2.4,3.7,-2.4,4.8,1.8,4.8,c.br],[-1.6,5.5,-1.6,3.2,1.3,3.2,c.brL],[-0.5,6.8,-0.5,1,0.9,1,c.brD],[-1.3,7.7,-0.4,2.6,0.6,0.8,c.brD],
  ...eye(-2.3,2.1,3,1.9,1.7,0.9,0.9,0.8,0.3),...eye(0.4,2.1,3,1.9,1.7,0.9,0.9,0.2,0.3),[-2.5,3.9,3,2.2,0.5,0.4,c.brD],[0.3,3.9,3,2.2,0.5,0.4,c.brD],[-0.9,1.6,3,1.8,0.4,0.2,INK],
  [-2.6,0,-1.2,2,0.8,3.2,c.vD],[0.6,0,-1.2,2,0.8,3.2,c.vD]]; }
/* The Snuffer hops to and fro across its beat, 1.7 tiles a hop, turning once it is `span` tiles from where it was put
   (so a span of 1.5 is one hop either way, 2 is two), and never steps off an edge. It can be stomped; its hop is high
   enough to run under. */
defEnemy('bastionSnuff',{w:0.8,h:0.95,stomp:true,solo:true,
  init(e,d){ e.ox=d.x; e.span=d.span===undefined?2:d.span; e.dir=d.dir||-1; e.wait=0.5+(d.phase||0); },
  mesh:()=>G1('bastionSnuff',bastionSnuffM),
  tick(e,dt){
    if(e.onGround){ e.vx=0; e.wait-=dt;
      if(e.wait<=0){
        const ok=s=>{ const tx=Math.floor(e.x+s*1.7), ty=Math.floor(e.y-0.5); return (solidAt(tx,ty)||semiAt(tx,ty))&&!solidAt(tx,ty+1); };
        if((e.x-e.ox)*e.dir>=e.span-0.3) e.dir=-e.dir;
        if(!ok(e.dir)) e.dir=-e.dir;
        e.vy=16; e.vx=ok(e.dir)?e.dir*2.9:0; e.wait=0.8; e.onGround=false; } }
    const vx=e.vx; walk(e,dt); if(!e.onGround&&vx&&e.vx===-vx){ e.vx=0; e.dir=-e.dir; } },
  anim(e,m){ const s=e.onGround?1-Math.max(0,0.3-e.wait)*0.9:1+clamp(e.vy,-6,8)*0.02, q=1/Math.sqrt(s); m.scale.set(q,s,q); m.rotation.y=(player.x>e.x?1:-1)*0.6; m.rotation.z=e.onGround?0:-e.dir*0.12; }});

/* one-way ledges are iron gratings edged in brass; bouncy blocks are the Baron's velvet footstools */
SEMI_LOOKS.bastion=function(g,part){ const k='#2a2444', s='#4c4670', l='#6a6494', b='#c79a3e';
  PX(g,s,0,0,16,16); PX(g,l,0,0,16,1); PX(g,k,0,7,16,1);
  if(part===0){ for(let x=1;x<16;x+=4) PX(g,k,x,3,2,10); PX(g,b,0,0,16,1); PX(g,b,0,15,16,1); return; }
  PX(g,b,0,1,16,1); for(let x=0;x<16;x+=4) PX(g,k,x,3,1,4); for(let x=2;x<16;x+=4) PX(g,b,x,4);
  if(part===2){ PX(g,INK,6,3,1,2); PX(g,INK,9,3,1,2); } };
SEMI_UNDER.bastion='#2a2444';
BOUNCE_LOOKS.bastion=function(g,part,c){ const b='#e0bd6a';
  PX(g,c[0],0,0,16,16); PX(g,c[1],0,0,16,2); PX(g,c[2],0,14,16,2); PX(g,c[2],0,0,1,16); PX(g,c[2],15,0,1,16);
  for(const q of [[4,4],[11,4],[4,11],[11,11],[7,7]]) PX(g,b,q[0],q[1]);
  if(part===1){ PX(g,b,0,13,16,1); for(let x=1;x<16;x+=3) PX(g,b,x,14,1,2); PX(g,INK,5,5,2,3); PX(g,INK,9,5,2,3); PX(g,INK,6,10,4,1); } };

/* ---------- the far view, in pieces ---------- */
/* a tower of the keep: a shaft, a crown of merlons, and now and then a pointed roof */
function bastionTower(far,x,z,w,top,col,roof){ const l=shade(col,1.25), m=w/5;
  far.push([x-w/2,-40,z-w/2,w,top+40,w,col],[x-w/2-0.5,top-1.6,z-w/2-0.5,w+1,1.6,w+1,l]);
  for(let i=0;i<3;i++) far.push([x-w/2-0.5+i*(w+1-m*1.2)/2,top,z+w/2-0.4,m*1.2,m,0.9,l]);
  if(roof) for(let k=0;k<4;k++){ const ww=(w-1)*(1-k/4); far.push([x-ww/2,top+m+k*w*0.22,z-ww/2,ww,w*0.22,ww,k%2?roof:shade(roof,1.15)]); } }
/* a great street lamp, gone dark; `globes` keeps where its glass is, for the morning */
function bastionFarLamp(S,x,y,z,s){ const c=bastionC, f=S.far;
  f.push([x-0.3*s,y,z-0.3*s,0.6*s,8*s,0.6*s,c.k],[x-0.7*s,y,z-0.7*s,1.4*s,0.5*s,1.4*s,c.brD],[x-0.3*s,y+8*s,z-0.3*s,2.4*s,0.5*s,0.6*s,c.k],[x+1.2*s,y+6*s,z-0.6*s,1.4*s,1.8*s,1.2*s,c.glass],[x+1*s,y+7.8*s,z-0.8*s,1.8*s,0.35*s,1.6*s,c.br],[x+1*s,y+5.7*s,z-0.8*s,1.8*s,0.3*s,1.6*s,c.br]);
  S.globes.push([x+1.2*s,y+6*s,z-0.6*s+0.05,1.4*s,1.8*s,1.2*s,'#ffe9a0']); }
/* a cage on a chain, and the jar of sun sparks in it: the only gold in the place */
function bastionFarCage(S,x,y,z,s,len){ const c=bastionC, f=S.far;
  f.push([x-0.08*s,y+2*s,z-0.08*s,0.16*s,len,0.16*s,c.k],[x-0.8*s,y,z-0.8*s,1.6*s,0.2*s,1.6*s,c.br],[x-0.8*s,y+1.8*s,z-0.8*s,1.6*s,0.2*s,1.6*s,c.br]);
  for(const q of [[-0.8,-0.8],[0.62,-0.8],[-0.8,0.62],[0.62,0.62]]) f.push([x+q[0]*s,y+0.2*s,z+q[1]*s,0.18*s,1.6*s,0.18*s,c.br]);
  S.glowFar.push([x-0.42*s,y+0.3*s,z-0.42*s,0.84*s,1.1*s,0.84*s,'#ffd23e'],[x-0.26*s,y+1.4*s,z-0.26*s,0.52*s,0.24*s,0.52*s,'#fff3a0']);
  S.jars.push([x,y,z]); }
/* a chandelier with its candles out */
function bastionFarChand(far,x,y,z,s,len){ const c=bastionC;
  far.push([x-0.1*s,y+0.6*s,z-0.1*s,0.2*s,len,0.2*s,c.k],[x-1.6*s,y,z-0.3*s,3.2*s,0.3*s,0.6*s,c.br],[x-0.3*s,y,z-1.6*s,0.6*s,0.3*s,3.2*s,c.br],[x-0.4*s,y-0.3*s,z-0.4*s,0.8*s,0.9*s,0.8*s,c.brD]);
  for(const q of [[-1.5,-0.15],[1.2,-0.15],[-0.15,-1.5],[-0.15,1.2]]) far.push([x+q[0]*s,y+0.3*s,z+q[1]*s,0.3*s,0.7*s,0.3*s,c.wax]); }
/* a thunderhead, to lie under the fortress */
function bastionStorm(list,x,y,z,s,R){ const a='#2c2350', b='#3b3068', d='#1c1638';
  list.push([x-9*s,y,z-3*s,18*s,3*s,6*s,a],[x-6*s,y+3*s,z-2.5*s,12*s,2.6*s,5*s,b],[x-3*s+R()*2*s,y+5.6*s,z-2*s,6.5*s,2*s,4*s,b],[x-11*s,y+0.6*s,z-2*s,3*s,1.6*s,4*s,d],[x+8.5*s,y+0.8*s,z-2*s,3*s,1.4*s,4*s,d],[x-7*s,y-0.8*s,z-2.4*s,14*s,0.8*s,4.8*s,d]); }
/* what shows when one of them lights up from inside: in tiles */
function bastionFlash(){ return [[-5,0.6,-1.6,10,2,3.2,'#8a78e0'],[-3,2.8,-1.2,6,1.6,2.4,'#b8a8ff'],[-0.4,-2.4,0,1.2,2.6,0.6,'#fff3d0'],[-1.2,-4.6,0,1.2,2.6,0.6,'#e8e0ff'],[-0.3,-7,0,1,2.8,0.6,'#fff3d0']]; }
/* the Baron's own tower, with the sun he stole caged at its top */
function bastionKeep(S,x,z,s){ const f=S.far, col='#1e1638', l='#2a2050', b='#8a6a2a', t=5*s;
  f.push([x-7*s,-40,z-7*s,14*s,40+t,14*s,col],[x-8*s,t-1.5*s,z-8*s,16*s,1.5*s,16*s,l],[x-7.3*s,t-6*s,z-7.3*s,14.6*s,0.7*s,14.6*s,'#4a3a22']);
  for(let i=0;i<4;i++) f.push([x-8*s+i*4.4*s,t,z+6.6*s,2.8*s,1.6*s,1.4*s,l]);
  f.push([x-5.2*s,t-13*s,z+7.02*s,2.2*s,6*s,0.2,bastionC.v],[x+3*s,t-13*s,z+7.02*s,2.2*s,6*s,0.2,bastionC.v]);
  for(const q of [[-4.6,-4.6],[3.6,-4.6],[-4.6,3.6],[3.6,3.6],[-0.5,3.6]]) f.push([x+q[0]*s,t,z+q[1]*s,1*s,8*s,1*s,b]);
  f.push([x-5.4*s,t+8*s,z-5.4*s,10.8*s,1.1*s,10.8*s,b],[x-3*s,t+9.1*s,z-3*s,6*s,1.3*s,6*s,'#6a4e1c'],[x-0.5*s,t+10.4*s,z-0.5*s,1*s,2.6*s,1*s,b]);
  S.glowFar.push([x-2.8*s,t+1.2*s,z-2.8*s,5.6*s,5.6*s,5.6*s,'#ffd23e'],[x-2.1*s,t+0.6*s,z-2.1*s,4.2*s,6.8*s,4.2*s,'#ffe680'],[x-3.5*s,t+2.1*s,z-2.1*s,7*s,3.8*s,4.2*s,'#ffd23e']); }
/* In the dark, and on the roof where the Baron brings his own, jars of sun sparks stand along the lane to see by:
   one every few tiles wherever there is ground, and one hung on a chain at each place the level asks for with
   set('lampsAt',[[x,y],...]). */
function bastionLights(S,R){
  const Lv=S.L, dk=Lv.dark===undefined?(TH.dark||0):Lv.dark; if(!(dk>0)&&!Lv.boss) return;
  const cp=Lv.checkpoint?Lv.checkpoint.x:-99, gx=Lv.goal?Lv.goal.x:-99;
  for(let x=4;x<S.W-2;x+=7+((R()*4)|0)){
    if(Math.abs(x+0.5-cp)<3||(x>gx+1&&x<gx+14)||Lv.signs.some(s=>Math.abs(s.x-x-0.5)<1.5)) continue;
    for(let ty=2;ty<S.H-3;ty++){ if(tileAt(x,ty-1)!==GROUND||tileAt(x,ty)!==AIR||tileAt(x,ty+1)!==AIR||tileAt(x,ty+2)!==AIR) continue;
      put(S.near,bastionCage(),x*8+4,ty*8,-15); put(S.glow,bastionJar(),x*8+4,ty*8,-15); lamps.push({x:x+0.5,y:ty+1.1,z:-1.4,col:0xffd27a,power:1.4,reach:8}); break; } }
  for(const q of Lv.lampsAt||[]){ put(S.near,bastionHang(),q[0]*8+4,q[1]*8,-15); put(S.glow,bastionJar(0.8),q[0]*8+4,q[1]*8,-15); lamps.push({x:q[0]+0.5,y:q[1]+0.4,z:-1.4,col:0xffd27a,power:1.4,reach:8}); }
}

THEMES.bastion={ music:'bastion', air:'wind', kind:'walls',
  sky:['#0b0720','#2a1650','#7a3a52'], skyMid:0.55, glowCol:0xffb070, sunGlow:0.5, eclipse:1, stars:0.9, neb:['#5a2fa8','#b8481e'], nebI:0.45,
  cloud:0.55, cloudCol:'#3a2f60', cloudShade:'#1a1232', cloudY:0.2, discX:0.75, discY:9.5,
  fog:0x2e2050, fogNear:20, fogFar:170,
  hemiSky:0xa89ae0, hemiGround:0x3a2a58, hemiI:0.74, sunI:0.55, sunCol:0xffc890, sunDir:[-0.4,0.7,0.55],
  top:'#4c4670', topS:['#565080','#443e66','#4f4974','#5c5688'], dirt:'#322c4e', dirtS:['#2a2444','#3e3860','#262040'], cap:'#b08a3c', capL:'#e0bd6a', capD:'#1d1830', stone:true,
  brick:['#6a4fa8','#3a2a6b','#9a82d8'], hard:['#6e6a8c','#9a96b8','#3e3a58'], pipe:['#b08a3c','#e8c878','#6a4e1c','#1d1830'],
  semi:'bastion', plat:['#c79a3e','#6a4e1c'], dust:'#b8b0d8', back:-6,
  liquid:{kind:'void',a:'#0b0720',b:'#b58cff'},
  bounce:{kind:'bastion',cols:['#7a3fd1','#b58cff','#3a2a6b']}, bounceCol:'#b58cff', sticky:['#2a1f4a','#6a55b8','#120c26'], stickyCol:'#6a55b8',
  laser:'#ff4f7b', wispCol:0xffd66a, rollerCol:'#7a7896',
  bloom:1, hi:0.12, rays:0.3, vig:0.5, sat:1.08, con:1.05, grade:{shadow:[0.9,0.9,1.14],high:[1.08,1.0,0.92]},
  skins:{wisp:bastionWisp,saw:bastionGear,bones:bastionGuard,roller:bastionBall,drone:bastionDrone},
  looks:[null,
    /* the lamp works: indoors, brass and soot, a little warm light */
    {kind:'works',air:'hum',dark:0.5,darkAmb:0x3a2c2a,eclipse:0,stars:0,neb:null,cloud:0,rays:0,sky:['#0e0a0c','#221614','#3a2218'],fog:0x2a1a16,fogNear:14,fogFar:90,
      hemiSky:0xffd9a8,hemiGround:0x4a3020,hemiI:0.72,sunI:0.45,sunCol:0xffb060,
      top:'#6a5a48',topS:['#75654f','#5f5040','#6e5e4b','#7c6c56'],dirt:'#4a3c30',dirtS:['#40342a','#57483a','#3a2e26'],cap:'#c79a3e',capL:'#ffd97a',capD:'#241a14',
      brick:['#a8683a','#6a3a1c','#d89a62'],hard:['#8a7a62','#b8a888','#52463a'],grade:{shadow:[1.0,0.92,0.9],high:[1.1,1.0,0.86]}},
    /* the dungeons: cold stone, and darker */
    {kind:'dungeon',air:'drips',dark:0.72,eclipse:0,stars:0,neb:null,cloud:0,rays:0,sky:['#06060e','#10101f','#1c1a30'],fog:0x14142a,fogNear:12,fogFar:80,
      hemiSky:0xa8b8e8,hemiGround:0x2a2a48,hemiI:0.76,sunI:0.35,sunCol:0xb8c8ff,
      top:'#56607c',topS:['#606a88','#4c5670','#5a6480','#687290'],dirt:'#3a4258',dirtS:['#323a4e','#465066','#2c3446'],cap:'#7a86a8',capL:'#a8b4d0',capD:'#1a1e2e',
      brick:['#5a6690','#343c5c','#8a96c0'],grade:{shadow:[0.88,0.94,1.16],high:[1.0,1.02,1.04]}},
    /* the ink well: a shaft of black stone, and ink that climbs it */
    {kind:'well',air:'bubbles',dark:0.6,eclipse:0,stars:0,neb:null,cloud:0,rays:0,sky:['#05030a','#0e081c','#1a0e30'],fog:0x120a24,fogNear:12,fogFar:70,
      hemiSky:0xb8a0f0,hemiGround:0x2a1a50,hemiI:0.74,sunI:0.35,sunCol:0xc8a8ff,
      top:'#4e4478',topS:['#584e84','#463c6c','#52487c','#5e548c'],dirt:'#342a54',dirtS:['#2c244a','#40366a','#281f44'],cap:'#8a6ad0',capL:'#b58cff',capD:'#16102a',
      liquid:{kind:'ink',a:'#170d32',b:'#9a6cf8',op:1,mask:0.6,glint:'#b58cff',flow:0.5,far:8},grade:{shadow:[0.92,0.88,1.16],high:[1.04,0.98,1.06]}},
    /* the roof, for the Baron: the eclipse low and close, the sky on fire at the edges */
    {kind:'roof',sky:['#08051a','#3a1458','#b0482a'],skyMid:0.5,stars:1,shoot:1,nebI:0.6,sunGlow:0.6,discX:0.5,discY:10.5,cloud:0.7,cloudY:0.16,hemiI:0.8,rays:0.38,fog:0x3a2052}],
  /* Out of doors: the keep on the skyline with the caged sun on the Baron's tower, nearer walls with his banners, great
     lamps gone dark, jars of sun sparks hung in cages, a second wall-walk across the gap, and under it all thunderheads
     with lightning in them. Indoors: a wall with whatever the place is made of, and the same jars. */
  scenery(S,R){
    const W=S.W, H=S.H, far=S.far, c=bastionC, k=TH.kind||'walls', Lv=S.L;
    S.jars=[]; S.globes=[];
    if(k==='walls'||k==='roof'){
      /* nothing is drawn where the sun should be; this unseen mark only tells the sky where to put the eclipse */
      sunMesh=new T.Mesh(tmpGeo(new T.PlaneGeometry(0.01,0.01)),MAT.soft); sunMesh.visible=false; sunMesh.position.set(0,TH.discY||9.5,-62); world.add(sunMesh);
      /* the keep, a long way back */
      for(let x=-70;x<W+70;x+=20+R()*22){ const z=-78-R()*14, w=8+R()*8, top=2+R()*13;
        bastionTower(far,x,z,w,top,pick(R,['#1c1536','#211a3e','#191232']),R()<0.6?'#2a1f4c':null);
        if(R()<0.55) far.push([x+w/2,-40,z-1.5,18+R()*10,40+top*0.4,3,'#1a1334']); }
      if(Lv.boss) bastionKeep(S,(Lv.boss.x0+Lv.boss.x1)/2+5,-52,1.25); else bastionKeep(S,W*(0.3+R()*0.4),-66,1);
      /* nearer towers, each with a banner, and curtain walls between */
      for(let x=-40;x<W+40;x+=24+R()*18){ const z=-34-R()*14, w=5+R()*3, top=1+R()*7, wl=10+R()*12, wt=top-3-R()*2;
        bastionTower(far,x,z,w,top,pick(R,['#251d44','#2a214c']),null);
        far.push([x-0.9,top-5.6,z+w/2+0.05,1.8,4.6,0.15,c.v],[x-0.45,top-3.4,z+w/2+0.2,0.9,0.9,0.1,c.k],[x+w/2,-40,z-1,wl,40+wt,2,'#221a40']);
        for(let i=0;i<wl-1;i+=2) far.push([x+w/2+i,wt,z-1,1,0.8,2,'#2a214c']); }
      /* great lamps, dark; and gantries with the jars hung from them */
      for(let x=-30;x<W+30;x+=28+R()*24) bastionFarLamp(S,x,-7-R()*3,-22-R()*12,1.5+R()*0.6);
      for(let x=-20;x<W+20;x+=16+R()*16){ const z=-17-R()*14, top=7+R()*4, cy=top-4.6-R()*2;
        far.push([x-0.5,-40,z-0.5,1,40+top,1,c.k],[x-0.5,top,z-0.3,6,0.5,0.6,c.k],[x-0.9,top+0.5,z-0.9,1.8,0.5,1.8,c.br]);
        bastionFarCage(S,x+4.6,cy,z,1.3,top-cy-2.6); }
      /* the wall-walk on the far side of the gap */
      far.push([-40,-30,-12.5,W+80,30.6,3.5,'#2b2450']);
      for(let x=-40;x<W+40;x+=2) far.push([x,0.6,-9.9,1,0.9,0.9,'#352d5e']);
      for(let x=-12;x<W+12;x+=11+R()*10){ const r=R();
        if(r<0.5) put(S.near,scaled(bastionLamp(),1.5),x*8,4.8,-88);
        else if(r<0.75){ put(S.near,scaled(bastionCage(),1.4),x*8,4.8,-88); put(S.glow,scaled(bastionJar(),1.4),x*8,4.8,-88); S.jars.push([x,1.6,-11]); }
        else put(S.flora,scaled(bastionBanner(),1.4),x*8,4.8,-88,0.2); }
      /* the storm underneath */
      for(let i=0;i<W/5+16;i++){ const z=-14-R()*66; bastionStorm(S.soft,-50+R()*(W+100),-5+(z+14)*0.12-R()*4,z,0.8+R()*1.1,R); }
      for(let i=0;i<Math.ceil(W/40)+2;i++){ const x=R()*W, z=-20-R()*38, y=-8-R()*4, s=1+R()*0.8, rate=0.08+R()*0.07, ph=R();
        bastionStorm(S.soft,x,y,z,s,R);
        const m=new T.Mesh(geo('bastionFlash',bastionFlash,1),MAT.glow); m.scale.setScalar(s); m.position.set(x,y,z+3*s+0.06); m.visible=false; world.add(m);
        critters.push({tick(dt,time){ const u=(time*rate+ph)%1, on=u<0.012||(u>0.022&&u<0.04); m.visible=on;
          if(on&&Math.abs(x-camX)<34){ skyU.uBolt.value=Math.max(skyU.uBolt.value,0.14); if(G.state==='play'&&Math.random()<dt*0.6) sfx.thunder(); } }}); }
      for(let x=-50;x<W+50;x+=18+R()*16) S.addCloud(x,2+R()*10,-30-R()*40,R,'#3a2f62');
      for(let x=12;x<W;x+=22+R()*20) S.addShaft(x,4+R()*3,-4-R()*2,2.5+R()*2,10,'#b89aff',-0.5);
      S.addWeather('ember',{n:60,size:[0.07,0.07],vel:[0.5,0.6,0],cols:['#b58cff','#8a5cf0','#ff9a5c','#ffd27a']});
      S.addWeather('dust',{n:12,z:6,size:[0.22,0.22],cols:['#1c1438','#2a1f4a'],op:0.6,box:[46,18,4],vel:[0.6,-0.1,0]});
      /* on the roof, when the Baron falls: the jars come open and the sparks go up, and the great lamps light */
      if(k==='roof'){ const fb=[]; for(const q of S.jars) for(let i=0;i<4;i++) fb.push([q[0]+(R()-0.5)*1.6,q[1]+0.4+R()*1.4,q[2]+(R()-0.5),0.32,0.32,0.32,i?'#ffd23e':'#fff3a0']);
        const up=new T.Mesh(tmpGeo(voxGeo(fb,1)),MAT.glow), lit=new T.Mesh(tmpGeo(voxGeo(S.globes,1)),MAT.glow); up.visible=lit.visible=false; world.add(up,lit); let rise=0;
        critters.push({tick(dt){ if(dawn>0.1){ up.visible=true; rise=Math.min(40,rise+dt*4.5); up.position.y=rise; } lit.visible=dawn>0.3; }}); }
    } else {
      /* indoors: a wall behind everything, in courses, with a pilaster every few tiles */
      const wc=k==='works'?['#2a1e18','#34261e','#40302a']:k==='dungeon'?['#191d2e','#22273c','#2e3450']:['#150f2a','#1d1638','#2a2050'], top=H+14;
      far.push([-30,-14,-11,W+60,top+14,2.5,wc[0]]);
      for(let x=-24;x<W+24;x+=12) far.push([x-1,-14,-8.6,2,top+14,0.9,wc[2]]);
      for(let y=5.5;y<top;y+=8) far.push([-30,y,-8.55,W+60,0.6,0.5,wc[1]]);
      const cog=(x,y,s,rate)=>{ const m=new T.Mesh(geo('bastionCogW',()=>bastionCog(c.br,8)),MAT.vox); m.scale.setScalar(s); m.position.set(x,y,-7.9); world.add(m); critters.push({tick(dt,time){ m.rotation.z=time*rate; }}); };
      if(k==='works'){
        /* pipes, boilers, furnace doors, cogs that still turn, and rows of bulbs with nothing in them */
        far.push([-30,6.8,-8.4,W+60,0.5,0.5,'#8a6a2a'],[-30,10.4,-8.4,W+60,0.35,0.4,'#6a4e1c']);
        for(let x=-10;x<W+10;x+=7+R()*8) far.push([x,R()<0.5?7.3:-14,-8.35,0.45,R()<0.5?3.1:20.8,0.45,'#8a6a2a']);
        for(let x=6;x<W;x+=34+R()*22){ far.push([x,0.2,-8.5,5,5.4,1.3,'#6a4e1c'],[x-0.2,1.4,-8.55,5.4,0.4,1.4,c.br],[x-0.2,4,-8.55,5.4,0.4,1.4,c.br],[x+1.9,5.6,-8.3,1.2,1.2,0.9,'#8a6a2a']); S.glowFar.push([x+2,2.3,-7.18,1,1,0.06,'#ffb040']); }
        for(let x=22;x<W;x+=40+R()*24){ far.push([x-0.3,0.2,-8.45,3.6,2.9,0.5,'#1a1210']); S.glowFar.push([x+0.3,0.7,-7.93,2.4,1.6,0.06,'#ff7a2a']); for(let i=0;i<3;i++) far.push([x+0.7+i*0.8,0.7,-7.9,0.18,1.6,0.1,'#1a1210']); }
        for(let x=2;x<W;x+=6){ far.push([x,8.9,-7.8,0.08,1.5,0.08,c.k],[x-0.35,8.2,-8.15,0.7,0.8,0.7,c.glass]); }
        for(let x=14;x<W;x+=26+R()*20){ const s=2+R()*1.6; cog(x,4+R()*4,s,(R()<0.5?-1:1)*(0.5+R()*0.5)); cog(x+s*1.9,5.5+R()*2,s*0.6,0.9+R()*0.6); }
        for(let x=10;x<W;x+=30+R()*20) bastionFarCage(S,x,5+R()*2.5,-7.2,0.9,top);
        S.addWeather('ember',{n:26,size:[0.06,0.06],vel:[0.2,0.9,0],cols:['#ff9a3d','#ffd27a']});
        S.addWeather('dust',{n:40,cols:['#c9b8a0','#8a7a62'],op:0.5});
      } else if(k==='dungeon'){
        /* arches, barred windows with a little of the eclipse coming through, chains, cages, chandeliers */
        let i=0;
        for(let x=-24;x<W+24;x+=12,i++){ far.push([x+2.2,-2,-8.52,7.6,8.5,0.2,'#0b0d16'],[x+3.2,6.5,-8.52,5.6,1.2,0.2,'#0b0d16']);
          if(i%2===0){ S.glowFar.push([x+5,9.4,-8.5,2,2.8,0.1,'#4a3a9a']); for(let b=0;b<3;b++) far.push([x+5.3+b*0.6,9.4,-8.38,0.16,2.8,0.1,c.k]); S.addShaft(x+6.6,1.5,-6.6,2.6,9,'#6a58c8',-0.5); }
          if(i%3===1) bastionFarCage(S,x+6,3.5+R()*3,-7.3,0.9,top);
          else if(i%4===2) bastionFarChand(far,x+6,8+R()*2,-7.2,1.1,top);
          if(R()<0.6) far.push([x+1.5+R()*9,2+R()*6,-7.6,0.12,top,0.12,c.k]); }
        S.addWeather('dust',{n:50,cols:['#8a96c0','#56607c'],op:0.5});
      } else {
        /* the well: chains, jars and slow cogs all the way up, and ink dripping */
        for(let y=5;y<H+6;y+=6+R()*5){ const x=3+R()*25; if(R()<0.6) bastionFarCage(S,x,y,-7.3,0.9,5+R()*6); else bastionFarChand(far,x,y,-7.2,1,5+R()*6); }
        for(let x=36;x<W;x+=14+R()*10) bastionFarCage(S,x,H-11+R()*3,-7.3,0.9,14);
        for(let y=8;y<H;y+=16+R()*8) cog(4+R()*22,y,2+R()*1.5,(R()<0.5?-1:1)*(0.3+R()*0.3));
        for(let x=2;x<W;x+=4+R()*6) far.push([x,-14,-8.48,0.5+R()*0.8,top*(0.3+R()*0.7),0.1,'#0c0820']);
        S.addWeather('rain',{n:60,size:[0.05,0.4],vel:[0,-9,0],tilt:0,cols:['#3a2a6b','#5a3fa0'],op:0.8});
        S.addWeather('spore',{n:30,cols:['#8a5cf0','#b58cff']});
      }
    }
    bastionLights(S,R);
  },
  /* on the stone: a battlement along the back of every wall-walk, lamps with nothing in them, the Baron's banners,
     now and then a caged jar, candles under their snuffers, rubble, chain posts, and brass studs along the lip */
  decor(S,D,R){
    const r=R(), y=D.ty*8, c=bastionC, k=TH.kind||'walls', out=k==='walls'||k==='roof';
    if(out&&D.x%2===0) put(S.near,bastionMerlon(),D.x*8+4,y,(D.back+0.42)*8);
    if(r<0.045&&D.free(4)&&D.open) put(S.near,bastionLamp(),D.jx(),y,D.zb(2.4,4.6));
    else if(r<0.08&&D.free(4)&&D.open&&k!=='well') put(S.flora,bastionBanner(),D.jx(),y,D.zb(2.6,4.8),0.3);
    else if(r<0.1&&D.free(3)&&D.open&&out){ const x=D.jx(), z=D.zb(2.4,4.6); put(S.near,bastionCage(),x,y,z); put(S.glow,bastionJar(),x,y,z); }
    else if(r<0.19) put(S.near,bastionCandle(),D.jx(),y,D.zb(1.3,5));
    else if(r<0.27) put(S.near,dRock(pick(R,[c.s3,c.s2])),D.jx(),y,D.zb(1.2,5));
    else if(r<0.31) put(S.near,bastionPost(),D.jx(),y,D.zb(1.4,5));
    else if(r<0.34&&(k==='works'||k==='well')) put(S.near,bastionCog(c.br,2.4,true),D.jx(),y,D.zb(1.5,4.8));
    else if(r<0.36&&k==='dungeon') put(S.near,dBones(),D.jx(),y,D.zb(1.3,5));
    const f=R();
    if(f<0.1) put(S.near,bastionStud(),D.jx(),y,D.zf());
    else if(f<0.14) put(S.near,[[-0.5,0,-0.5,1,1.3,1,c.wax],[-0.15,1.3,-0.15,0.3,0.4,0.3,c.k]],D.jx(),y,D.zf());
  }
};

/* 10-1: the outer walls, under the eclipse. A walk along the battlements to meet what is new here, one thing at a time:
   the Snuffer, a captive light, and Smudge, first on plain stone and then with one thing to jump. Gaps between the
   wall-walks are crossed by a lamp that swings, a cannon keeps one stretch, and a pipe leads down to the lamp store. */
function w10l1(){
  const B=LevelBuilder(292,'bastion');
  B.room(0,259).room(264,291,0,15,true);
  B.ground(0,30).ground(35,96).ground(118,160).ground(166,199).ground(205,263);
  B.sign(5,'Baron Blackout keeps the sun sparks he stole in jars. Those gold lights in the cages are all the daylight there is left. Win them back!');
  B.coins(9,3,3).row(13,5,'?O?').enemy('bones',19);
  B.sign(22,'A Snuffer hops to and fro. Run under a hop, or land on its handle.').enemy('bastionSnuff',28,2,{span:1.5});
  B.arc(30,4,6);
  B.row(38,5,'B?B').enemy('bones',42);
  /* a captive light going round its cage, and a spark over the top of it for whoever times the jump */
  B.sign(45,'A captive light circles its cage. It is too bright to touch: let it go by.');
  B.fill(50,3,50,3,HARD).enemy('wisp',50,4.3,{rx:2.2,sp:1.3}).spark(50,8);
  /* Smudge, on plain ground. He wakes when Blorp is about sixteen tiles short of where he is put. */
  B.sign(54,'That is Smudge: your shadow, got loose. He does whatever you did a moment ago. Keep going, and never turn back!');
  B.enemy('shade',75,2,{until:85}).coins(61,3,3).coins(68,3,3).coins(75,3,3).coins(81,3,2);
  B.row(88,5,'?M?').enemy('bastionSnuff',92,2,{span:1.5});
  /* the first gap in the walls: planks, and a ledge that swings like a hanging lamp, with a spark over the middle */
  B.row(97,1,'====').plat(103,3,3,'s',6,1.3).row(111,1,'=======').coins(98,3,2).spark(104,7).coins(112,3,3);
  B.checkpoint(122);
  B.row(127,5,'B?B').enemy('bones',131).enemy('bones',135);
  B.sign(138,'A cannon. Its rockets fly straight: hop over them, or on them.').cannon(146,2,3.2).enemy('bastionSnuff',153,2,{span:2});
  B.arc(160,4,7);
  /* Smudge again, with one thing to jump */
  B.sign(168,'Smudge again, and something in the way. One jump, and no stopping.');
  B.enemy('shade',187,2,{until:197}).fill(183,2,184,3,HARD).coins(177,3,3).coins(183,5,2).coins(189,3,3);
  B.fall(201,2,3);
  B.row(208,5,'?F?').enemy('bones',212);
  B.warp(216,2,'in').enemy('bastionSnuff',221,2,{span:1.5}).warp(225,3,'out',true);
  B.bounce(229,230,2).coinCol(229,5,3).coinCol(230,5,3).row(232,9,'===').coins(232,10,3);
  B.stairs(236,6).fill(242,2,242,7,HARD);
  B.goal(248);
  /* the lamp store: two posts to kick up between, and the third spark at the top of them */
  B.fill(260,2,263,15,GROUND).ground(264,291).fill(264,2,264,15,HARD).fill(291,2,291,15,HARD);
  B.warp(266,2,'in',true).warp(287,2,'out').coinBox(270,3,273,4);
  B.fill(276,4,276,11,HARD).fill(280,4,280,11,HARD).coinCol(278,4,7).spark(278,12).row(282,8,'===').coins(282,9,3);
  return B.L;
}

/* 10-2: the lamp works, in the dark. The Baron's machines, one after another and then together: a belt under two cogs,
   gas lamps, a bridge that crumbles, Smudge on a belt that carries him too, stone stampers, beams that take turns
   with a switch, and barrels of shot rolling down the steps. */
function w10l2(){
  const B=LevelBuilder(296,'bastion');
  B.room(0,263).room(268,295,0,15,true);
  B.ground(0,61).ground(67,82).ground(85,198).ground(204,267);
  B.sign(4,'The lamp works, and not a lamp lit. Take a sunbloom: in sun form Blorp is his own light.');
  B.row(8,5,'?O?').coins(13,3,3).enemy('bones',17);
  /* the belt runs the wrong way, and two cogs ride up and down over it, nearly in step */
  B.conveyor(22,36,1,-1).enemy('saw',26,2.2,{ry:3.8,sp:1.3}).enemy('saw',32,2.2,{ry:3.8,sp:1.3,phase:0.5}).coins(28,6,3);
  B.row(40,5,'B?B').enemy('bastionSnuff',45,2,{span:1.5});
  B.sign(49,'Gas lamps. Each one flickers before it lights: go when it goes out.');
  B.jet(53,2,3,3).jet(57,2,3,3,1.5).coins(54,3,3);
  /* a bridge that will not bear standing on, and a spark over the middle of it */
  B.row(62,1,'KKKKK').arc(62,3,5).spark(64,6);
  /* Smudge on the belts: standing still is still moving, for both of them. One gap to jump. */
  B.sign(69,'Smudge is in the works too. The belt carries you along, and him after you.');
  B.enemy('shade',88,2,{until:100}).conveyor(73,82,1,1).conveyor(85,96,1,1).coins(76,3,3).coins(87,3,3).coins(92,3,3);
  B.row(102,5,'?M?');
  /* three stone stampers over one belt */
  B.conveyor(107,121,1,1).enemy('clonk',110,8).enemy('clonk',115,8).enemy('clonk',120,8).coins(112,3,2).coins(117,3,2);
  B.checkpoint(126);
  B.row(130,5,'B?B').enemy('bones',134);
  /* two beams and two switches. The first switch puts the red beam out and lights the blue one, and brings out two
     blue steps: up them, on to the second switch, and the spark is overhead. Bump that switch from below to go on. */
  B.sign(137,'Red beams burn while the switch is red. Bump the switch from below, and the blue ones take their turn.');
  B.row(141,5,'X').laser(146,10,'d',8,0,0,{sw:'red'}).row(148,4,'UU').row(152,5,'X').spark(152,9).laser(157,10,'d',8,0,0,{sw:'blue'});
  /* barrels of shot come down three terraces from a hatch at the top, and break on the block at the bottom */
  B.fill(162,2,162,2,HARD).row(165,5,'?O?');
  B.ground(172,177,3).ground(178,183,4).ground(184,198,5).chute(194,5,3.6,-1).coins(174,4,3).coins(180,5,3).coins(186,6,3);
  B.arc(199,5,5);
  B.row(207,5,'B?B').enemy('bastionSnuff',210,2,{span:1.5});
  B.warp(214,2,'in').jet(219,2,3,2.8).cannon(223,2,3.4).jet(227,2,3,2.8,1.4).warp(231,3,'out',true);
  B.stairs(236,6).fill(242,2,242,7,HARD);
  B.goal(248);
  /* the switch room: a cell of red blocks with the third spark in it */
  B.fill(264,2,267,15,GROUND).ground(268,295).fill(268,2,268,15,HARD).fill(295,2,295,15,HARD);
  B.warp(270,2,'in',true).warp(291,2,'out').coinBox(274,3,276,4).row(278,5,'X');
  B.fill(282,2,282,4,RED).fill(282,5,286,5,HARD).fill(286,2,286,4,HARD).spark(284,3).coins(283,2,3);
  return B.L;
}

/* 10-3: the dungeons, darker still. Captive lights to see by, turning chains of fire, a chimney of tar to kick up,
   a bridge that crumbles under cannon fire, and then Smudge through a row of gas lamps and a stamper, where the
   thing to do is wait and waiting is the one thing there is no time for. After the checkpoint: hanging lamps over a
   pit, a launch pod over a bed of spikes, and three beams on the clock. */
function w10l3(){
  const B=LevelBuilder(308,'bastion');
  B.room(0,275).room(280,307,0,15,true);
  B.ground(0,70).ground(76,150).ground(172,279);
  B.sign(4,'The dungeons. The lights down here are prisoners too, and still too hot to touch.');
  B.row(8,5,'?O?').coins(12,3,3);
  B.fill(18,3,18,3,HARD).enemy('wisp',18,4.3,{rx:2.3,sp:1.2}).enemy('wisp',18,4.3,{rx:2.3,sp:1.2,phase:2.62}).enemy('bones',25);
  B.enemy('ghost',31,6).firebar(36,6,6,1.6).firebar(44,5,6,-1.6,1).enemy('bones',50);
  /* the tar chimney: a hanging pillar and a wall, both sticky. Over the wall is the way on; the spark is on top of the pillar. */
  B.fill(56,5,56,12,STICKY).fill(60,2,60,8,STICKY).fill(60,9,60,9,HARD).fill(61,2,61,9,HARD).coinCol(58,4,7).spark(56,14);
  B.enemy('bones',65);
  /* a bridge that crumbles, with a cannon at the far end of it; the block beyond stops what it fires the other way */
  B.row(71,1,'KKKKK').cannon(79,2,3.4).coins(72,3,3).fill(85,2,85,2,HARD).row(83,5,'?M?');
  /* Smudge, where waiting is tempting: gas lamps, a sunbloom to stop for, a stamper to bait */
  B.sign(88,'Smudge is at home in the dark. Gas lamps ahead, and no time to stand and wait for them.');
  B.enemy('shade',108,2,{until:134}).jet(98,2,3,2.6).jet(105,2,3,2.6,1.3).row(110,5,'?O?').enemy('clonk',118,8).jet(125,2,3,2.6,0.6).coins(128,3,4);
  B.checkpoint(138);
  B.row(142,5,'B?B').enemy('bones',146);
  /* two hanging lamps to ride over the pit, a spark between them, and a captive light above the second */
  B.plat(153,3,3,'s',6,1.2).plat(162,3,3,'s',6,1.2,1.6).row(170,1,'==').spark(159,8).enemy('wisp',166,9,{rx:1.3,sp:1.5}).coins(154,6,2).coins(163,6,2);
  B.row(176,5,'?F?').enemy('ghost',181,6).enemy('bones',184);
  /* a launch pod on the floor throws Blorp over a bed of spikes; the stretch after it is left clear to land and stop in */
  B.pod(189,2,35,22).spikes(191,197).coins(193,7,3);
  B.row(207,5,'B?B').enemy('bones',213);
  /* three beams on the clock, one after another, and a ghost for company */
  B.laser(218,9,'d',7,3.2,0,{duty:0.42}).laser(224,9,'d',7,3.2,1.07,{duty:0.42}).laser(230,9,'d',7,3.2,2.13,{duty:0.42}).enemy('ghost',227,7).coins(220,3,3).coins(226,3,3);
  B.warp(236,2,'in').enemy('bastionSnuff',241,2,{span:1.5}).warp(245,3,'out',true);
  B.stairs(250,6).fill(256,2,256,7,HARD);
  B.goal(262);
  /* an oubliette: a cell with the third spark in it. In through the bricks with a dash, or down through the hole in
     its roof by way of the block beside it; out by the step inside. */
  B.fill(276,2,279,15,GROUND).ground(280,307).fill(280,2,280,15,HARD).fill(307,2,307,15,HARD);
  B.warp(282,2,'in',true).warp(303,2,'out').coinBox(285,3,287,4).enemy('wisp',286,8,{rx:1.4,sp:1.4}).row(290,2,'H');
  B.fill(292,2,292,4,BRICK).fill(296,2,296,4,HARD).fill(292,5,296,5,HARD).clear(294,5,294,5).row(295,2,'H').spark(293,3).coins(293,2,2);
  return B.L;
}

/* 10-4: the ink well. A shaft sixty tiles deep with the ink coming up it: ledges, a chimney to kick up, a lift, two
   lamps that swing, a second chimney of tar, steps that crumble, a ledge that slides, and out at the top. Then a walk
   along the well-head to the flag, with the ink standing in every gap. A fall anywhere is a fall into the ink. */
function w10l4(){
  const B=LevelBuilder(132,'bastion',76), Y=62;
  B.fill(0,0,1,75,GROUND).fill(30,0,131,Y-1,GROUND).ground(2,9,4);
  B.start(4,4).liquid(1.3).rise(0.34,60.6,7);
  B.set('lampsAt',[[15,9],[23,13],[28,17],[21,25],[12,26],[14,38],[23,40],[28,44],[21,51],[12,55],[6,58],[15,61],[26,64]]);
  B.sign(7,'The ink is rising. Climb! It stops just under the well-head.',4);
  /* ledges up and across to the right-hand wall */
  B.row(12,5,'===').row(17,7,'===').row(22,9,'========').coins(12,7,3).coins(17,9,3);
  /* the first chimney: a pillar and the wall, three apart; out over the pillar's top to the left. A spark hangs above
     the way out, for one kick more. */
  B.fill(26,12,26,21,HARD).fill(30,12,30,21,STICKY).coinCol(28,12,8).spark(28,24);
  B.row(19,21,'======').row(13,21,'====');
  /* a lift, and a spark over the top of its climb */
  B.plat(8,22,3,'y',9,0.9).spark(9,34).row(3,30,'====');
  B.checkpoint(4,31);
  /* two hanging lamps, swinging out of step, up to a ledge on the right */
  B.plat(9,32,3,'s',5,1.25).plat(18,34,3,'s',5,1.25,1.6).row(25,36,'=====').coins(10,35,2).coins(19,37,2);
  /* the second chimney, tarred on both sides */
  B.fill(26,39,26,46,STICKY).fill(26,47,26,47,HARD).fill(30,39,30,47,STICKY).coinCol(28,39,8).row(19,47,'======');
  /* steps that crumble, back to the left */
  B.row(14,49,'KKK').row(9,51,'KKK').row(3,53,'====').coins(15,51,2).coins(10,53,2);
  /* a ledge that slides across, three more gratings, and out */
  B.plat(8,55,3,'x',10,1).row(23,56,'====').row(18,58,'===').row(23,60,'======').coins(24,58,2).coins(19,60,2);
  /* the well-head */
  B.sign(33,'Out of the well. Mind the gaps: the ink has come up to meet you.',Y).row(36,Y+3,'?O?').enemy('bones',41,Y);
  B.clear(46,0,49,Y-1).arc(45,Y+2,6);
  B.conveyor(52,63,Y-1,-1).laser(55,Y+7,'d',7,3.2,0,{duty:0.42}).laser(60,Y+7,'d',7,3.2,1.6,{duty:0.42}).coins(57,Y+1,2);
  B.enemy('bastionSnuff',68,Y,{span:1.5}).row(70,Y+3,'B?B').enemy('bastionSnuff',75,Y,{span:1.5});
  B.clear(80,0,84,Y-1).row(80,Y-1,'KKKKK').coins(81,Y+1,3);
  /* a stamper, then two footstools and a grating high above them with the third spark at its far end */
  B.enemy('clonk',88,Y+6).bounce(91,92,Y).coinCol(91,Y+3,3).coinCol(92,Y+3,3).row(94,Y+7,'=====').spark(98,Y+9);
  B.enemy('bones',103,Y);
  B.goal(110,Y);
  return B.L;
}

/* 10-5: the roof, and Baron Blackout. A last run of everything: Smudge over a crumbling bridge and against a belt,
   three beams with Snuffers hopping between them, a swinging lamp and a circling ledge over the drop with a cannon
   covering it, two chains of fire, a launch pod over spikes. Then the checkpoint, a muffin and a sunbloom, and the
   Baron's arena under his tower. When he falls, the eclipse ends. */
function w10l5(){
  const B=LevelBuilder(204,'bastion');
  B.ground(0,26).ground(35,78).ground(100,203);
  B.sign(4,'The roof, under the Baron\'s own tower. Everything he has left is in the way.');
  B.row(9,5,'?O?').enemy('bastionSnuff',15,2,{span:1.5}).enemy('bones',19);
  B.sign(21,'Smudge, one last time: over the crumbling bridge and against the belt. Run!');
  B.enemy('shade',40,2,{until:52}).row(27,1,'KKKKKKKK').conveyor(38,48,1,-1).coins(28,3,3).coins(40,3,3).coins(45,3,3);
  /* a footstool, and over the first beam's lamp a spark that only a high bounce reaches */
  B.bounce(55,56,2).spark(59,10);
  B.laser(59,9,'d',7,3,0,{duty:0.4}).laser(65,9,'d',7,3,1,{duty:0.4}).laser(71,9,'d',7,3,2,{duty:0.4}).enemy('bastionSnuff',62,2,{span:1}).enemy('bastionSnuff',68,2,{span:1});
  B.row(74,5,'?M?');
  /* over the drop: planks, a lamp that swings, a ledge that goes round, planks; a spark over the top of the round, a
     captive light to see by, and a cannon on the far side that can only fire back across */
  B.row(79,1,'==').plat(83,3,3,'s',6,1.2).plat(92,5,3,'c',2.5,1.1).row(98,1,'==').enemy('wisp',88,9,{rx:1.3,sp:1.4}).spark(93,10);
  B.cannon(103,2,3.6).fill(104,2,104,2,HARD);
  /* two chains of fire turning against each other, and a spark where they both reach */
  B.firebar(111,5,6,1.7).firebar(117,5,6,-1.7,1.6).spark(114,6).enemy('bones',122);
  B.row(124,5,'?F?').pod(128,2,35,22).spikes(130,135).coins(132,7,3);
  B.checkpoint(150);
  B.sign(152,'A muffin, then a sunbloom. Sun Blorp shines when the Baron snuffs the lights, and a dash at him counts as a stomp.');
  B.row(155,5,'M').row(158,5,'O');
  /* the arena: up the steps, over the wall, and no way back */
  B.stairs(161,4).fill(165,2,165,5,HARD).fill(196,2,196,12,HARD);
  B.boss(181,167,194,18,'baron');
  return B.L;
}

/* ---------- the island on the map ---------- */
/* the Baron's tower: black stone banded in brass, a cage at the top with the stolen sun in it */
function bastionMapTower(){ const c=bastionC, b=[[-10,0,-10,20,3,20,c.s],[-8,3,-8,16,2,16,c.s2],[-6.5,5,-6.5,13,22,13,c.s],[-7,13,-7,14,1.2,14,c.br],[-7,22,-7,14,1.2,14,c.br],[-8,27,-8,16,2.4,16,c.s2],
    [-1.5,5,6.5,3,5,0.3,c.k],[-1.2,16,6.5,2.4,3.4,0.3,c.k],[-6.2,8,6.6,2.4,7,0.2,c.v],[3.8,8,6.6,2.4,7,0.2,c.v],
    [-4.6,38.4,-4.6,9.2,1.2,9.2,c.br],[-3,39.6,-3,6,1.2,6,c.brD],[-0.6,40.8,-0.6,1.2,2.4,1.2,c.brL]];
  for(const q of [[-8,-8],[4.5,-8],[-8,4.5],[4.5,4.5],[-1.75,-8],[-1.75,4.5],[-8,-1.75],[4.5,-1.75]]) b.push([q[0],29.4,q[1],3.5,2.4,3.5,c.s]);
  for(const q of [[-4.4,-4.4],[3.4,-4.4],[-4.4,3.4],[3.4,3.4],[-0.5,3.4],[-0.5,-4.4],[-4.4,-0.5],[3.4,-0.5]]) b.push([q[0],29.4,q[1],1,9,1,c.br]);
  return b; }
function bastionMapSun(){ return [[-2.6,31,-2.6,5.2,5.2,5.2,'#ffd23e'],[-2,30.4,-2,4,6.4,4,'#ffe680'],[-3.2,31.8,-2,6.4,3.6,4,'#ffd23e'],[-2,31.8,-3.2,4,3.6,6.4,'#ffd23e']]; }
function bastionMapCloud(){ return [[-9,0,-5,18,4,10,'#3a2f60'],[-6,4,-4,12,3,8,'#4a3f78'],[-11,1,-3,4,2.4,6,'#2e2452'],[7,1,-3,4,2.4,6,'#2e2452'],[-7,-1,-4,14,1,8,'#2e2452']]; }
function bastionMapBolt(){ return [[-0.4,-3.2,4,1.6,3,1,'#fff3a0'],[-1.6,-5.8,4,1.6,3,1,'#ffe14d'],[-0.5,-8.6,4,1.4,3.2,1,'#fff3a0']]; }
defWorld({name:'Blackout Bastion',theme:'bastion',levels:[w10l1,w10l2,w10l3,w10l4,w10l5],
  map:{
    /* black and violet flagstones, afloat */
    ground:(h,p)=>[p<0.22?['#5e5886','#58527e']:['#4a4468','#443e60'],['#2e2846','#28223e']],
    pond:['#5a3fa0','#3a2a6b','#1d1830'],
    under:['#2a2444','#1c1730','#110d20'],
    scatter(M,c){ const r=c.r;
      if(r<0.07&&c.clear(1.8)) M.put(M.land,bastionLamp(),c.x,c.y,c.z,0.62);
      else if(r<0.11&&c.clear(1.6)){ M.put(M.land,bastionCage(),c.x,c.y,c.z,0.7); M.put(M.glow,bastionJar(),c.x,c.y,c.z,0.7); if(c.r2<0.6) M.lamp(c.x,c.y+0.9,c.z+0.3,0xffd27a,1.1,5); }
      else if(r<0.16&&c.clear(2)) M.put(M.flora,bastionBanner(),c.x,c.y,c.z,0.6,0.3);
      else if(r<0.27) M.put(M.land,bastionMerlon(),c.x,c.y,c.z,0.7);
      else if(r<0.37) M.put(M.land,bastionCandle(),c.x,c.y,c.z,0.8);
      else if(r<0.45) M.put(M.land,dRock('#5e5886'),c.x,c.y,c.z,0.8);
      if(r>0.93) M.mote({kind:2,x:c.x,y:c.y+0.6+c.r2,z:c.z,col:'#b58cff',size:0.05,rate:0.4}); },
    /* the Baron's tower with the caged sun at its top, and over it a thundercloud that will not go away */
    landmark(M,x,y,z){
      M.put(M.land,bastionMapTower(),x,y,z,1); M.put(M.glow,bastionMapSun(),x,y,z,1); M.lamp(x,y+4.3,z+0.9,0xffd27a,1.8,9);
      M.bob(M.part(bastionMapCloud(),x,y+6.7,z,1,MAT.soft),0.12,0.9,0.03);
      M.blink(M.bob(M.part(bastionMapBolt(),x,y+6.7,z,1,MAT.glow),0.12,0.9),1); }
  }});
