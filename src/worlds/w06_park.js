/* ================= World 6: Popcorn Park ================= */
/* A funfair at night, built on a pier. Striped tents and stalls on the boards, a Ferris wheel turning across the water,
   a roller coaster against the sky, strings of coloured bulbs, fireworks, and under it all a black sea that shows every
   light twice. New here: balloons to bounce along, trampolines, cannons that fire Blorp from one to the next, gondolas
   that go round a hub, trapezes, Mimics among the prize blocks, and signs that a switch lights up. A fall lands in the
   sea, which can be swum out of. The fifth level is the big top, and Ringmaster Razzle. */

/* ---------- the tune ---------- */
/* @song */
/* C major at a gallop: a fairground organ plays the tune, a glockenspiel doubles it an octave up, the bass goes oom and
   the chords go pah, and a snare rolls into every section with a crash on the one. */
SONGS.park=(()=>{
  const h='C6 . E6 . G6 - E6 C6  E6 D6 E6 C6 G5 - . .  A5 . C6 . F6 - C6 A5  ';
  const a=h+'G5 A5 G5 E5 C5 - . G5  B5 . D6 . F6 - D6 B5  B5 A5 B5 G5 D5 - . G5  C6 E6 G6 E6 C6 E6 G6 .  D6 . B5 . G5 - . . ';
  const t='G5 A5 G5 E5 C5 - . E5  F5 . A5 . D6 - A5 F5  G5 B5 D6 G6 F6 D6 B5 G5  C6 . G5 . E5 . G5 .  ';
  const a2=h+t+'C6 - - - . . G5 G5 ', a3=h+t+'C6 - - - C5 - . . ';
  const b='A5 - - C6 F6 - - .  A6 . G6 . F6 - C6 .  G5 - - C6 E6 - - .  G6 . F6 . E6 - C6 .  F#5 - - A5 D6 - - .  F#6 . E6 . D6 - C6 .  B5 . D6 . G6 . D6 .  F6 - D6 - B5 G5 A5 B5 ';
  const lead=a+a2+b+a3, up=lead.replace(/([A-G]#?)(\d)/g,(m,n,o)=>n+(+o+1));
  const ch='C C F C G7 G7 C G7  C C F C Dm G7 C C  F F C C D7 D7 G G7  C C F C Dm G7 C C';
  const d='k h s h k k s h ';
  return song({key:'C major',bpm:160,ec:0.5,fb:0.22},
    [{w:'square',v:0.046,h:2,g:0.82,s:0.75,vib:5,e:1,r:0.25,pan:-0.12},lead],
    [{w:'sine',v:0.065,h:4,g:0.3,r:0.35,pan:0.32},up],
    [{w:'square',v:0.02,g:0.4,lp:[5,1.5],pan:0.25},musChord(ch,8,'. . x . . . x .  . . x . . x x .','C4')],
    [{w:'triangle',v:0.25,g:0.6},musArp(ch,8,'1 . . . 5_ . . .  1 . . . 5_ . 5_ .','C2')],
    [{dr:1,v:0.9},('kx h s h k k s h '+d.repeat(6)+'k h s s s s s s ').repeat(2)+'kx h sp h k k sp h '+'k h sp h k k sp h '.repeat(6)+'k k s s s s s s '+'kx h s h k k s h '+d.repeat(6)+'k . s . s s sx . ']);
})();
/* @endsong */

/* ---------- models ---------- */
const parkBulbCols=['#ff5f8f','#ffd23e','#5fe0d0','#b58cff','#ff9a3d'];
const parkSea=(a,b)=>({kind:'water',a,b,op:0.9,mirror:0.8,glint:b,far:80});
/* a prize stall: a counter, a striped awning, a sign, three prizes */
function parkStall(c){ const w='#fff2d6',k='#6a4630',d=shade(c,0.72), b=[[-8,0,-5,16,5,10,k],[-8.4,5,-5.2,16.8,1,10.8,'#e2b278'],[-8,6,-5,1,9,1,k],[7,6,-5,1,9,1,k],[-8,6,-4.6,16,9,0.6,d],
    [-5,6,1.6,2.2,2.2,2.2,'#ffe14d'],[-1,6,1.6,2.2,3,2.2,'#5fe0d0'],[3,6,1.6,2.2,2.2,2.2,'#ff8fc7'],[-4,16.6,-1,8,3,1,c],[-3,17.4,0,6,1.4,0.2,w]];
  for(let i=0;i<8;i++) b.push([-9+i*2.25,15,-6,2.25,1.2,12,i%2?w:c],[-9+i*2.25,13.4,5.4,2.25,1.8,0.6,i%2?c:w]);
  return b; }
/* a popcorn cart */
function parkCart(){ const r='#e8384f',w='#fff2d6',k='#2c2447',g='#ffc928', b=[[-5,2.4,-3,10,4.6,6,r],[-5,4,3,10,1.2,0.15,w],[-5.6,0,-3.4,2.8,2.8,0.8,k],[2.8,0,-3.4,2.8,2.8,0.8,k],[-5.6,0,2.6,2.8,2.8,0.8,k],[2.8,0,2.6,2.8,2.8,0.8,k],
    [-3.6,7,-1.8,7.2,3,3.6,'#ffe9a0'],[-2.6,10,-1.2,5.2,1,2.4,'#fff6d0'],[-4.6,7,-2.8,0.6,6.4,0.6,g],[4,7,-2.8,0.6,6.4,0.6,g],[-4.6,7,2.2,0.6,6.4,0.6,g],[4,7,2.2,0.6,6.4,0.6,g],[5,5,-0.4,2.4,0.6,0.8,g]];
  for(let i=0;i<6;i++) b.push([-6+i*2,13.4,-3.6,2,1.4,7.2,i%2?w:r]);
  return b; }
function parkLampM(){ const k='#3a3360'; return [[-0.5,0,-0.5,1,13,1,k],[-1.4,0,-1.4,2.8,0.8,2.8,k],[-1.6,13,-1.6,3.2,0.6,3.2,k],[-1,16.2,-1,2,0.5,2,k]]; }
/* a bunch of balloons tied to a post */
function parkBalloonPost(R){ const b=[[-0.4,0,-0.4,0.8,5,0.8,'#6a4630'],[-1.2,0,-1.2,2.4,0.8,2.4,'#4a3f6b']], n=3+((R()*2)|0);
  for(let i=0;i<n;i++){ const c=pick(R,parkBulbCols), x=(i-(n-1)/2)*2.8+(R()-0.5), y=9+R()*5, z=(R()-0.5)*2;
    b.push([x-0.1,5,z-0.1,0.2,y-5,0.2,'#e8e0ff'],[x-1.5,y,z-1.5,3,3.6,3,c],[x-1,y+3.6,z-1,2,0.6,2,shade(c,1.2)],[x-0.4,y-0.5,z-0.4,0.8,0.5,0.8,shade(c,0.8)],[x-1,y+2,z+1.5,0.8,1,0.12,WHITE]); }
  return b; }
function parkFlagPole(c){ return [[-0.4,0,-0.4,0.8,17,0.8,'#f4ead0'],[-1,0,-1,2,0.8,2,'#6a4630'],[0.4,13.6,-0.2,5,3,0.4,c],[5.4,14.4,-0.2,2,1.4,0.4,c],[-0.7,17,-0.7,1.4,1.4,1.4,'#ffc928']]; }
function parkBucket(){ const r='#e8384f'; return [[-1.5,0,-1.5,3,3.4,3,r],[-1.6,0.8,-1.6,3.2,0.6,3.2,WHITE],[-1.6,2.2,-1.6,3.2,0.6,3.2,WHITE],[-1.3,3.4,-1.3,2.6,1,2.6,'#fff6d0'],[-0.6,4.4,-0.6,1.4,0.7,1.4,'#ffe9a0']]; }
function parkSpill(){ return [[-1.6,0,-0.6,1,0.7,1,'#fff6d0'],[0,0,0.2,0.9,0.6,0.9,'#ffe9a0'],[1.2,0,-0.5,0.8,0.7,0.8,'#fff6d0'],[-0.4,0,-1.2,0.7,0.5,0.7,WHITE]]; }
function parkBarrel(c){ const w='#fff2d6'; return [[-2,0,-2,4,5,4,c],[-2.2,1,-2.2,4.4,0.7,4.4,w],[-2.2,3.3,-2.2,4.4,0.7,4.4,w],[-1.6,5,-1.6,3.2,0.3,3.2,shade(c,1.2)]]; }
/* a small striped tent, for the boards and for the island */
function parkTentS(c){ const w='#fff2d6', b=[[-2,0,6,4,6,0.3,'#2c2447'],[-0.4,19.4,-0.4,0.8,5,0.8,'#f4ead0'],[0.4,22,-0.2,4,2.2,0.4,'#ffe14d']];
  for(let i=0;i<6;i++) b.push([-9+i*3,0,-6,3,9,12,i%2?w:c]);
  for(let k=0;k<4;k++){ const s=10.5-k*2.6; b.push([-s,9+k*2.6,-s*0.7,2*s,2.6,s*1.4,k%2?w:c]); }
  return b; }
function parkBalloonM(c){ return [[-1.5,0,-1.5,3,3.6,3,c],[-1,3.6,-1,2,0.6,2,shade(c,1.2)],[-0.3,-0.6,-0.3,0.6,0.6,0.6,shade(c,0.8)],[-0.06,-5,-0.06,0.12,4.4,0.12,WHITE],[-1,2,1.5,0.8,1,0.12,WHITE]]; }
/* the far view's moving parts, in tiles: a gondola hung from its pivot, the coaster's train, a carousel and its bulbs */
function parkGondola(c){ return [[-0.05,-0.6,-0.05,0.1,0.6,0.1,'#b9a8e8'],[-0.75,-0.8,-0.5,1.5,0.2,1,'#f4e9dc'],[-0.65,-1.9,-0.45,1.3,0.7,0.9,c],[-0.65,-1.2,-0.45,0.12,0.4,0.9,c],[0.53,-1.2,-0.45,0.12,0.4,0.9,c]]; }
function parkTrainM(){ return [[-2.2,0,-0.4,1.3,0.7,0.8,'#ff4f7b'],[-0.65,0,-0.4,1.3,0.7,0.8,'#ffd23e'],[0.9,0,-0.4,1.3,0.7,0.8,'#5fe0d0'],[-1.8,0.7,-0.2,0.5,0.4,0.4,'#fff2d6'],[-0.25,0.7,-0.2,0.5,0.4,0.4,'#fff2d6'],[1.3,0.7,-0.2,0.5,0.4,0.4,'#fff2d6']]; }
function parkCarouM(){ const r='#e8384f',w='#fff2d6',g='#ffc928', b=[[-0.3,0.4,-0.3,0.6,4,0.6,g],[-3.2,4.2,-3.2,6.4,0.5,6.4,r],[-2.4,4.7,-2.4,4.8,0.5,4.8,w],[-1.5,5.2,-1.5,3,0.5,3,r],[-0.5,5.7,-0.5,1,0.7,1,g]];
  [[2.2,0,'#ff8fc7'],[-2.2,0,'#5fe0d0'],[0,2.2,'#ffd23e'],[0,-2.2,'#b58cff']].forEach(q=>b.push([q[0]-0.08,0.4,q[1]-0.08,0.16,3.8,0.16,g],[q[0]-0.5,1.4,q[1]-0.25,1,0.6,0.5,w],[q[0]+0.3,1.9,q[1]-0.2,0.35,0.5,0.4,w],[q[0]-0.2,2,q[1]-0.27,0.4,0.15,0.54,q[2]]));
  return b; }
function parkCarouGlow(){ const b=[]; for(let i=0;i<4;i++) for(const s of [-1,1]){ const u=-2.8+i*1.87; b.push([u-0.15,3.85,s*3.2-0.15,0.3,0.3,0.3,parkBulbCols[i%5]],[s*3.2-0.15,3.85,u-0.15,0.3,0.3,0.3,parkBulbCols[(i+2)%5]]); } return b; }
/* a striped tent for the far pier, in tiles: striped walls, a stepped roof, a pennant, bulbs under the eaves, a lit door */
function parkBigTent(far,glow,x,y,z,w,h,c){ const cr='#f4e9dc', n=Math.max(4,Math.round(w/1.6)), sw=w/n, hh=w*0.11;
  for(let i=0;i<n;i++) far.push([x-w/2+i*sw,y,z-w*0.35,sw,h,w*0.7,i%2?cr:c]);
  for(let k=0;k<5;k++){ const s=w*0.56*(1-k/5.2); far.push([x-s,y+h+k*hh,z-s*0.7,2*s,hh,s*1.4,k%2?c:cr]); }
  const top=y+h+5*hh; far.push([x-0.12,top,z-0.12,0.24,w*0.22,0.24,cr],[x+0.12,top+w*0.12,z-0.05,w*0.16,w*0.09,0.1,'#ffe14d']);
  for(let i=0;i<=n;i++) glow.push([x-w/2+i*sw-0.16,y+h-0.45,z+w*0.35+0.05,0.32,0.32,0.12,parkBulbCols[i%5]]);
  glow.push([x-w*0.08,y,z+w*0.35+0.06,w*0.16,h*0.6,0.06,'#ffd27a']);
}
/* skins: a candyfloss for the puff, a Catherine wheel for the saw (the gull is the swoop in white) */
function parkFloss(){ const p='#ff9fd6',l='#ffc9ea',d='#e56fb4'; return [[-2.5,1,-2.5,5,5,5,p],[-1.8,0.4,-1.8,3.6,6.2,3.6,l],[-3.1,1.8,-1.8,6.2,3.4,3.6,p],[-1.8,1.8,-3.1,3.6,3.4,6.2,p],
  ...eye(-2.1,3.1,2.5,1.7,1.7,0.8,0.9,0.5,0.3),...eye(0.4,3.1,2.5,1.7,1.7,0.8,0.9,0.4,0.3),[-0.7,2.1,2.5,1.4,0.5,0.15,INK],
  [-0.5,-2.6,-0.5,1,3,1,'#fff2d6'],[-0.3,-3.4,-0.3,0.6,0.8,0.6,'#e8d9b0'],[-3.6,5,-0.5,1.1,1.1,1,l],[2.6,5.4,-0.5,1.1,1.1,1,l],[-0.6,6.6,-0.6,1.2,1,1.2,d]]; }
function parkCath(){ const b=[[-2.6,-2.6,-0.5,5.2,5.2,1,'#ff4f7b'],[-3.9,-0.9,-0.6,7.8,1.8,1.2,'#ffe14d'],[-0.9,-3.9,-0.6,1.8,7.8,1.2,'#5fe0d0'],[-1.3,-1.3,-0.9,2.6,2.6,1.8,WHITE],[-0.9,-0.2,0.9,0.6,0.7,0.12,INK],[0.3,-0.2,0.9,0.6,0.7,0.12,INK],[-0.5,-0.9,0.9,1,0.3,0.12,INK]];
  for(const q of [[3.4,0.9],[-4.4,-1.9],[-1.9,3.4],[0.9,-4.4]]) b.push([q[0],q[1],-0.4,1,1,0.8,'#fff3a0']);
  return b; }
/* Tick-Tock, a wind-up tin toy: it marches while its spring lasts, then stands and whirrs while the key turns back */
function parkToyM(){ const c='#4d96ff',d='#2b59c3',y='#ffd23e',r='#ff4f7b'; return [[-2.8,1.2,-2.4,5.6,4.2,4.8,c],[-2.2,5.4,-1.8,4.4,1,3.6,d],[-0.5,6.4,-0.5,1,0.8,1,r],
  ...eye(-2.2,2.8,2.4,1.9,1.8,0.9,1,0.8,0.35),...eye(0.3,2.8,2.4,1.9,1.8,0.9,1,0.2,0.35),[-1.2,1.6,2.4,2.4,0.7,0.2,'#fff2d6'],[-0.9,1.7,2.6,0.4,0.5,0.1,d],[0.5,1.7,2.6,0.4,0.5,0.1,d],
  [-2.6,0,-1.4,2,1.2,3.4,y],[0.6,0,-1.4,2,1.2,3.4,y],[-3.4,2.4,-0.6,0.6,1.6,1.2,d],[2.8,2.4,-0.6,0.6,1.6,1.2,d],[-2.8,4.6,2.4,5.6,0.5,0.15,y]]; }
function parkToyKey(){ const g='#c9d2e2'; return [[-0.35,-0.35,-1.6,0.7,0.7,1.6,g],[-1.7,-0.5,-2.4,1.4,1,0.8,'#ffc928'],[0.3,-0.5,-2.4,1.4,1,0.8,'#ffc928']]; }
defEnemy('parktoy',{h:0.8,stomp:true, init(e){ e.vx=-2.8; e.wind=1.8; e.dir=-1; },
  mesh(){ const g=new T.Group(), u=g.userData; u.key=vmesh('parkToyKey',parkToyKey); u.key.position.set(0,3.2*S8,-2.4*S8); g.add(vmesh('parkToy',parkToyM),u.key); return g; },
  tick(e,dt){ e.wind-=dt;
    if(e.wind<=0){ if(e.vx){ e.dir=sgn(e.vx); e.vx=0; e.wind=1; } else { e.vx=e.dir*2.8; e.wind=1.8; } }
    if(e.vx&&ledgeAhead(e)) e.vx=-e.vx;
    walk(e,dt); },
  anim(e,m,dt,time){ const dir=e.vx?sgn(e.vx):e.dir; m.rotation.y=dir*0.8; m.rotation.z=e.vx?Math.sin(time*22+e.x)*0.08:0; m.userData.key.rotation.z+=dt*(e.vx?10:-4); }});

THEMES.park={ music:'park', air:'crowd',
  /* dusk: the sun going down behind the coaster, and the lights just on */
  sky:['#27267a','#a2508f','#ffa46a'], skyMid:0.52, glowCol:0xffb060, sunGlow:0.9, stars:0.25, cloud:0.35, cloudCol:'#ffb0a0', cloudShade:'#7a4a8a', cloudY:0.58,
  fog:0x6a4484, fogNear:22, fogFar:170,
  hemiSky:0xd9c4ff, hemiGround:0x7a5670, hemiI:0.66, sunI:0.6, sunCol:0xffc08a, sunDir:[-0.62,0.42,0.5],
  top:'#c98f5c', topS:['#d39a66','#b98050','#c58a58','#dba672'], dirt:'#8a5c3c', dirtS:['#7a5033','#9a6a46','#6f472c'], cap:'#d9a66e', capL:'#f2c690', capD:'#6a442a', stone:true,
  brick:['#e8504a','#8a2630','#ffb0a0'], hard:['#f4ead0','#fffaf0','#b9a888'], pipe:['#ff5fa2','#ffc2dc','#b02a6a','#3a0f2a'],
  semi:'plank', plat:['#ffc928','#c98a00'], dust:'#fff3d6', back:-7,
  liquid:parkSea('#2a2a6a','#ffcf9a'),
  bounce:{kind:'tramp',cols:['#ff4f7b','#ffd0dc','#b02a4d']}, bounceCol:'#ffffff',
  stackCols:['#ff4f7b','#ffe14d','#4d96ff'],
  skins:{puff:parkFloss,saw:parkCath,swoop:()=>mSwoop('#fdfdff','#aeb7c9','#ffb02e'),swoopWL:()=>mSwoopWing(-1,'#aeb7c9','#ffffff'),swoopWR:()=>mSwoopWing(1,'#aeb7c9','#ffffff')},
  disc:['#ff9a3d',null,'#b3520f'], discY:6.5, discX:0.6, rays:0.45,
  bloom:1.2, hi:0.26, sat:1.1, vig:0.48, grade:{shadow:[0.92,0.9,1.12],high:[1.1,1.0,0.9]},
  fw:0.1, cloudTint:'#c9809a',
  looks:[null,
    /* 2: twilight, the moon up */
    {sky:['#141452','#4b318a','#c9608c'],fog:0x40306e,stars:0.6,hemiSky:0xb4a8ff,hemiGround:0x5a4470,hemiI:0.63,sunCol:0xffc49a,sunI:0.52,sunDir:[-0.45,0.6,0.55],disc:['#fff6e0',null,'#c9b8e0'],discY:15,discX:1,
      glowCol:0xd9c8ff,sunGlow:0.5,cloud:0.3,cloudCol:'#8a6ab0',cloudShade:'#3a2a66',rays:0.2,liquid:parkSea('#1a1c54','#ffd9a0'),fw:0.14,cloudTint:'#5a4688'},
    /* 3: full night */
    {sky:['#05061e','#11123f','#33245f'],fog:0x1c1a48,stars:1,shoot:1,neb:['#33308a','#7a2a6a'],nebI:0.3,hemiSky:0x9aa0ff,hemiGround:0x4a3a66,hemiI:0.62,sunCol:0xffcf9a,sunI:0.52,sunDir:[-0.4,0.68,0.55],
      disc:['#fff6e0',null,'#c9b8e0'],discY:15.5,discX:-0.8,glowCol:0xc9d0ff,sunGlow:0.45,cloud:0.2,cloudCol:'#3a3a78',cloudShade:'#1a1a44',rays:0.15,liquid:parkSea('#0c1034','#ffd9a0'),fw:0.16,cloudTint:'#2e2a60',
      grade:{shadow:[0.88,0.9,1.16],high:[1.1,1.02,0.9]}},
    /* 4: fireworks night */
    {sky:['#0a0530','#2a1160','#70307a'],fog:0x2a1c58,stars:0.8,neb:['#5a2ab0','#c03a7a'],nebI:0.5,hemiSky:0xb09aff,hemiGround:0x5a3a70,hemiI:0.63,sunCol:0xffc0a0,sunI:0.5,sunDir:[-0.4,0.68,0.55],
      disc:['#fff6e0',null,'#c9b8e0'],discY:16,discX:1.2,glowCol:0xe0b0ff,sunGlow:0.45,cloud:0.15,cloudCol:'#4a2a78',cloudShade:'#1a1040',rays:0.15,liquid:parkSea('#100a38','#ffb0d0'),fw:0.75,cloudTint:'#3a2a6a'},
    /* 5: the big top, from the inside */
    {sky:['#07051c','#190f3a','#3a183a'],fog:0x2a1228,fogNear:26,stars:0.9,hemiSky:0xffe2c4,hemiGround:0x7a4a50,hemiI:0.68,sunCol:0xfff0cc,sunI:0.6,sunDir:[-0.25,0.85,0.45],
      disc:['#fff6e0',null,'#c9b8e0'],discY:15.5,discX:-0.9,glowCol:0xc9d0ff,sunGlow:0.4,cloud:0.1,cloudCol:'#3a2a58',cloudShade:'#1a1030',rays:0.1,liquid:parkSea('#0c0a2c','#ffd9a0'),fw:0.14,tent:1,cloudTint:'#2a2050',
      bloom:1.1,grade:{shadow:[1.0,0.9,0.98],high:[1.1,1.02,0.92]}}],
  /* the far view: a town across the bay, a roller coaster with its train, a Ferris wheel that turns, a second pier of
     tents and stalls and a carousel, searchlights, loose balloons, fireworks, and bulbs strung along the back of the boards */
  scenery(S,R){
    const W=S.W, far=S.far, gf=S.glowFar, sea=S.L.liquidY, tx=TH.tent&&S.L.tentX?S.L.tentX:1e9, out=Math.min(W+70,tx+30);
    skyDisc(TH.disc,null,TH.discY||15);
    /* the town across the bay */
    for(let x=-70;x<out;x+=4+R()*5){ const w=3.5+R()*4, h=3+R()*9; far.push([x,sea-1,-88,w,h+1,4,pick(R,['#2a2258','#322a66','#261e50'])]);
      for(let k=0;k<3;k++) if(R()<0.7) gf.push([x+0.5+R()*(w-1.2),sea+0.6+R()*(h-1.2),-85.9,0.5,0.6,0.1,pick(R,['#ffd27a','#ffe9a0','#ff9a6a'])]); }
    /* the roller coaster, and the train that runs along it */
    for(let i=0;i<Math.max(1,Math.round(W/170));i++){ const x0=W*(0.1+0.52*i)+R()*24, len=80+R()*30, z=-52-R()*6;
      const hgt=x=>sea+3.5+Math.sin(x/len*Math.PI)*(8.5+5.5*Math.sin(x*0.17+x0)+2*Math.sin(x*0.43)); let py=hgt(0);
      for(let x=0;x<=len;x+=2.5){ const y=hgt(x); far.push([x0+x-0.2,sea-1,z-0.2,0.45,y-sea+1,0.45,'#3d2f6e'],[x0+x-2.5,Math.min(y,py)-0.15,z-0.7,2.7,Math.abs(y-py)+0.55,1.4,'#6f52b0']);
        if((x/2.5)%2===0) far.push([x0+x-2.5,sea+1.2+((x/5)%2)*2.2,z-0.1,5,0.3,0.3,'#3d2f6e']);
        gf.push([x0+x-0.25,y+0.45,z+0.5,0.5,0.5,0.3,parkBulbCols[(x/2.5|0)%5]]); py=y; }
      const m=new T.Mesh(geo('parkTrain',parkTrainM,1),MAT.vox); world.add(m);
      critters.push({tick(dt,time){ const s=(time*7+x0)%len; m.position.set(x0+s,hgt(s)+0.5,z+0.2); }}); }
    /* the Ferris wheel: a rim and spokes that turn as one, bulbs on the rim, and gondolas that stay upright */
    for(let i=0;i<Math.max(1,Math.round(W/190));i++){ const x=W*(0.3+0.45*i)+R()*16, r=9, y=sea+r+3.5, z=-36, n=16, g=new T.Group(); if(x>tx) continue;
      g.position.set(x,y,z);
      for(let k=0;k<4;k++){ const m=new T.Mesh(geo('parkSpoke',()=>[[-r,-0.12,-0.12,2*r,0.24,0.24,'#8a7ab8']],1),MAT.vox); m.rotation.z=k*Math.PI/4; g.add(m); }
      const seg=2*r*Math.sin(Math.PI/n)+0.1, ri=r*Math.cos(Math.PI/n), bl=[[-0.9,-0.9,0.1,1.8,1.8,0.5,'#ffe9a0']];
      for(let k=0;k<n;k++){ const a=(k+0.5)/n*6.2832, m=new T.Mesh(geo('parkRim',()=>[[-seg/2,-0.18,-0.25,seg,0.36,0.5,'#b9a8e8']],1),MAT.vox); m.position.set(Math.cos(a)*ri,Math.sin(a)*ri,0); m.rotation.z=a+Math.PI/2; g.add(m);
        const b=k/n*6.2832; bl.push([Math.cos(b)*r-0.3,Math.sin(b)*r-0.3,0.2,0.6,0.6,0.3,parkBulbCols[k%5]],[Math.cos(b)*r*0.5-0.2,Math.sin(b)*r*0.5-0.2,0.2,0.4,0.4,0.3,parkBulbCols[(k+2)%5]]); }
      g.add(new T.Mesh(tmpGeo(voxGeo(bl,1)),MAT.glow)); world.add(g);
      const gs=[]; for(let k=0;k<8;k++){ const c=parkBulbCols[k%5], m=new T.Mesh(geo('parkGond'+c,()=>parkGondola(c),1),MAT.vox); world.add(m); gs.push(m); }
      critters.push({tick(dt,time){ const a0=time*0.22; g.rotation.z=a0; for(let k=0;k<8;k++){ const a=a0+k*0.7854; gs[k].position.set(x+Math.cos(a)*r,y+Math.sin(a)*r,z+0.3); } }});
      for(let k=0;k<8;k++){ const u=k/8, hh=(y-sea)/8; for(const s of [-1,1]) far.push([x+s*(1-u)*r*0.55-0.3,sea+k*hh,z-0.9,0.6,hh+0.05,0.5,'#5a4a8a']); }
      far.push([x-r*0.7,sea-1,z-2.5,r*1.4,1.6,4,'#5a4032']); }
    /* the other pier: boards on the water, a rail of bulbs, tents, stalls with their lamps lit, now and then a carousel */
    let seg=0;
    for(let x=-30;x<out;){ const len=24+R()*20;
      far.push([x,sea-1.4,-28,len,2,15,'#5a4032'],[x,sea+0.6,-13.3,len,0.4,0.25,'#f4e9dc']);
      for(let px=x+1;px<x+len;px+=6){ far.push([px-0.12,sea+0.6,-13.4,0.24,4.6,0.24,'#f4e9dc']); if(px+6<x+len) for(let k=1;k<6;k++){ const u=k/6; gf.push([px+u*6-0.14,sea+5-Math.sin(u*Math.PI)*1.1,-13.4,0.28,0.28,0.2,parkBulbCols[(k+seg)%5]]); } }
      parkBigTent(far,gf,x+len*0.28,sea+0.6,-21,8+R()*3,4.5,pick(R,['#d83a4a','#3a7ad8','#e8a020','#c83a9a']));
      if(len>30) parkBigTent(far,gf,x+len*0.74,sea+0.6,-18.5,5.5+R()*2,3.4,pick(R,['#d83a4a','#2fb0a0','#e8a020']));
      for(let k=0;k<3;k++){ const sx=x+3+R()*(len-6); far.push([sx-1,sea+0.6,-15.5,2,1.6,1.6,pick(R,['#7a3a5a','#3a5a8a','#8a6a2a'])],[sx-1.2,sea+2.2,-15.7,2.4,0.4,2,pick(R,['#e8504a','#f4e9dc'])]); gf.push([sx-0.8,sea+1.1,-13.85,1.6,0.9,0.06,'#ffd27a']); }
      if(seg%2===1&&x+len<tx){ const cx=x+len*0.5, cy=sea+0.6, cz=-16.5, g=new T.Group(); far.push([cx-3,cy,cz-3,6,0.4,6,'#c9a0e8']);
        g.position.set(cx,cy,cz); g.add(new T.Mesh(geo('parkCarou',parkCarouM,1),MAT.vox),new T.Mesh(geo('parkCarouG',parkCarouGlow,1),MAT.glow)); world.add(g);
        critters.push({tick(dt,time){ g.rotation.y=time*0.6; }}); }
      x+=len+6+R()*8; seg++; }
    /* searchlights that sweep the sky */
    for(let i=0;i<Math.ceil(W/130);i++){ const bx=W*(0.15+0.7*R()), by=sea+2, bz=-25, h=30, ph=R()*6, m=S.addShaft(bx,by,bz,3,h,pick(R,['#fff1c8','#c8e0ff','#ffd0e8']),0);
      critters.push({tick(dt,time){ const a=Math.sin(time*0.35+ph)*0.6; m.rotation.z=-a; m.position.set(bx+Math.sin(a)*h/2,by+Math.cos(a)*h/2,bz); }}); }
    /* balloons that got away */
    for(let i=0;i<Math.ceil(W/36);i++){ const c=parkBulbCols[i%5], m=new T.Mesh(geo('parkLoose'+c,()=>parkBalloonM(c),0.4),MAT.vox), x0=R()*W, z=-9-R()*14, ph=R()*22, sp=0.5+R()*0.5; world.add(m);
      critters.push({tick(dt,time){ m.position.set(x0+Math.sin(time*0.4+ph)*1.5,sea+1.5+((time*sp+ph)%24),z); }}); }
    /* bulbs strung from pole to pole along the back of the boards, and the light they give */
    for(let x=-8;x<W+8;x+=9){ S.near.push([x*8-2,(sea-1)*8,-62,4,(9-sea)*8,4,'#f4ead0'],[x*8-3,64,-63,6,3,6,'#ffc928']);
      for(let k=1;k<12;k++){ const u=k/12; S.glow.push([(x+u*9)*8-1.2,(7.7-Math.sin(u*Math.PI)*1.5)*8-1.2,-61.2,2.4,2.4,2.4,parkBulbCols[((k+x)%5+5)%5]]); }
      if((x+8)%18===0) lamps.push({x:x+4.5,y:6.3,z:-6.4,col:0xffc890,power:1.2,reach:10}); }
    for(let x=-50;x<out;x+=30+R()*30) S.addCloud(x,13+R()*7,-50-R()*30,R,TH.cloudTint);
    S.addWeather('firefly',{n:34,cols:parkBulbCols,size:[0.09,0.09],box:[46,16,8],z:-3});
    if(TH.fw>0.4||TH.tent) S.addWeather('confetti',{n:70});
    /* fireworks: a streak up, then a ring of sparks high in the far sky; heard now and then, never often */
    if(TH.fw){ let wait=1.5+R()*2, quiet=3; const pend=[], cols=['#ff5f8f','#ffd23e','#5fe0d0','#b58cff','#ff9a3d','#ffffff','#7dffb0'];
      critters.push({tick(dt,time){ if(!(dt>0)) return; quiet-=dt; wait-=dt;
        if(wait<=0){ wait=(0.5+Math.random())/TH.fw; const x=camX+(Math.random()-0.5)*46, y=15+Math.random()*9, z=-42-Math.random()*26; if(x>tx-6) return;
          pend.push({t:0.42,x,y,z,c:pick(Math.random,cols)}); spawnPart(x,y-9,z,'#fff3c0',0,21,0,0.42,0.5,0,true,{spin:0});
          if(G.state==='play'&&quiet<=0&&Math.random()<0.5){ quiet=4; sfx.firework(); } }
        for(let i=pend.length-1;i>=0;i--){ const p=pend[i]; p.t-=dt; if(p.t>0) continue; pend.splice(i,1);
          for(let k=0;k<22;k++){ const a=k/22*6.2832, v=5+Math.random()*2; spawnPart(p.x,p.y,p.z,k%5?p.c:'#ffffff',Math.cos(a)*v,Math.sin(a)*v,(Math.random()-0.5)*2,1.1+Math.random()*0.5,0.75,2.5,true,{drag:1.3,spin:0}); } } }}); }
    /* inside the big top: a striped wall close behind the ring, king poles, benches full of people, spotlights */
    if(tx<1e8){
      for(let x=tx;x<W+16;x+=2) far.push([x,sea-1,-8.4,2,27,0.6,((x-tx)/2)%2?'#f4e9dc':'#c93d3d']);
      for(let x=tx;x<W+16;x+=2) far.push([x,12.2+(((x-tx)/2)%2)*0.5,-7.9,2,1.3,0.3,((x-tx)/2)%2?'#ffc928':'#e8a020']);
      far.push([tx-0.7,sea,-8,1.4,27,1.4,'#ffc928'],[tx-1.4,sea,-8.7,2.8,1.2,2.8,'#c98a00']);
      const b0=S.L.boss?S.L.boss.x0-1:tx+12, b1=S.L.boss?S.L.boss.x1+1:W, skin=['#ffd9b0','#e8b088','#c98a5a','#8a5a3c'];
      for(let k=0;k<3;k++){ const z=-4.3-k*1, y=2+0.6*(k+1); far.push([b0,2,z-1,b1-b0,0.6*(k+1),1,k%2?'#5a3a6a':'#6f4a80']);
        for(let x=b0+0.3+R()*0.3;x<b1-0.6;x+=0.8+R()*0.25){ const c=pick(R,parkBulbCols); far.push([x,y,z-0.6,0.56,0.5,0.4,c],[x+0.06,y+0.5,z-0.55,0.44,0.42,0.36,pick(R,skin)]); if(R()<0.12) far.push([x+0.5,y+0.7+R()*0.5,z-0.5,0.4,0.48,0.4,pick(R,parkBulbCols)]); } }
      for(const x of [b0-1,(b0+b1)/2,b1+1]) far.push([x-0.3,2,-7.6,0.6,24,0.6,'#ffc928']);
      for(let x=tx+3;x<W;x+=4.5+R()*3) S.addShaft(x,2,-2.2-R()*2.4,2.4+R()*1.6,13,pick(R,['#fff1c8','#ffd0e0','#c8e0ff','#fff1c8']),(R()-0.5)*0.8);
      for(let x=b0+3;x<b1;x+=8) lamps.push({x,y:7.5,z:-1.5,col:0xffe6c0,power:1.3,reach:11});
    }
  },
  /* on the boards: stalls, lamp posts, popcorn carts, balloons on posts, flags, small tents, barrels, buckets and spilt popcorn */
  decor(S,D,R){
    const r=R(), y=D.ty*8;
    if(D.wet) return;
    if(TH.tent&&S.L.tentX&&D.x>=S.L.tentX-1){
      if(r<0.12) put(S.near,parkBucket(),D.jx(),y,D.zb(1.3,2.6)); else if(r<0.2) put(S.near,parkBarrel(pick(R,['#e8384f','#3a7ad8','#ffc928'])),D.jx(),y,D.zb(1.4,2.6));
      if(R()<0.3) put(S.near,parkSpill(),D.jx(),y,D.zf());
      return; }
    if(r<0.045&&D.free(6)&&D.open){ const x=D.jx(), z=D.zb(3.4,5.2); put(S.near,parkStall(pick(R,['#e8384f','#3a7ad8','#2fb0a0','#c83a9a'])),x,y,z); S.glow.push([x-7,y+12.4,z+5.2,14,0.7,0.3,'#ffd27a']); lamps.push({x:x/8,y:D.ty+1.4,z:z/8+0.9,col:0xffc060,power:1.2,reach:7}); }
    else if(r<0.09&&D.free(5)&&D.open){ const x=D.jx(), z=D.zb(1.6,4.6); put(S.near,parkLampM(),x,y,z); S.glow.push([x-1.3,y+13.6,z-1.3,2.6,2.6,2.6,'#ffe9a0']); lamps.push({x:x/8,y:D.ty+1.8,z:z/8+0.3,col:0xffd27a,power:1.3,reach:8}); }
    else if(r<0.12&&D.free(4)&&D.open){ const x=D.jx(), z=D.zb(2,4.6); put(S.near,parkCart(),x,y,z); S.glow.push([x-0.6,y+11,z-0.6,1.2,1.4,1.2,'#ffe9a0']); }
    else if(r<0.165&&D.free(5)&&D.open) put(S.flora,parkBalloonPost(R),D.jx(),y,D.zb(1.8,5.4),0.5);
    else if(r<0.2&&D.free(5)&&D.open) put(S.near,parkFlagPole(pick(R,parkBulbCols)),D.jx(),y,D.zb(1.8,6));
    else if(r<0.215&&D.free(7)&&D.open) put(S.near,parkTentS(pick(R,['#e8384f','#3a7ad8','#e8a020'])),D.jx(),y,D.zb(4.6,5.4));
    else if(r<0.29) put(S.near,parkBarrel(pick(R,['#e8384f','#3a7ad8','#ffc928','#2fb0a0'])),D.jx(),y,D.zb(1.4,6));
    else if(r<0.37) put(S.near,parkBucket(),D.jx(),y,D.zb(1.3,6));
    else if(r<0.43) put(S.near,dCrate(pick(R,['#c98f5c','#b97a4a','#ffb347'])),D.jx(),y,D.zb(1.5,6));
    else if(r<0.52) put(S.near,parkSpill(),D.jx(),y,D.zb(1.2,6));
    const f=R();
    if(f<0.16) put(S.near,parkSpill(),D.jx(),y,D.zf());
  }
};

/* where a cannon at tile (x,y), aimed ang degrees at power P, has thrown Blorp after t seconds if he does not steer */
function parkArc(x,y,ang,P,t){ const a=ang*Math.PI/180, vx=Math.sin(a)*P; let vy=Math.cos(a)*P, py=y+0.5; for(let s=0;s<t;s+=1/120){ vy=Math.max(-15,vy-(vy>0?28.125:98.4)/120); py+=vy/120; } return [x+0.5+vx*t,py]; }
/* a chain of cannons, each firing into the next, with coins along every flight. A shot is [angle, power, seconds until
   the next cannon catches him]; the last one has no third number. */
function parkCannons(B,x,y,shots){
  for(const s of shots){ B.pod(x,y,s[0],s[1]); const end=s[2]||0.8;
    for(let t=0.24;t<end-0.14;t+=0.13){ const q=parkArc(x,y,s[0],s[1],t); B.coins(Math.floor(q[0]),Math.floor(q[1]),1); }
    if(s[2]){ const q=parkArc(x,y,s[0],s[1],s[2]); x=q[0]-0.5; y=q[1]-0.5; } }
  return B; }

/* 6-1: opening night, at dusk. The fair's first three tricks, one at a time and each somewhere safe: balloons over a
   small gap, a trampoline under a high ledge, and a prize block that is not a block. Then the trampolines go out to sea. */
function w6l1(){
  const B=LevelBuilder(262,'park');
  B.room(0,231).room(236,261,0,15,true);
  B.ground(0,40).ground(50,100).ground(105,150).ground(169,235);
  B.coins(5,3,3).row(9,5,'?M?').enemy('blob',14);
  B.sign(18,'Three clowns in a stack! Every stomp takes the top one off.').enemy('stack',24).row(28,5,'B?B').enemy('blob',31);
  /* the first balloons: two, over water that can be swum */
  B.sign(35,'Balloons! Land on one and it bounces you. Hold {jump} as you land to go higher. A popped one soon comes back.');
  B.enemy('balloon',43,2.6).enemy('balloon',46,2.6).arc(42,4,3).arc(45,4,3);
  B.row(53,5,'B?B').enemy('blob',57).enemy('shellby',62);
  /* the first trampoline: a hop gets nowhere, a held jump gets the ledge and its spark */
  B.sign(66,'A trampoline! Hold {jump} as you land on it to fly. Pound it with {down} to fly higher still.');
  B.row(69,2,'JJ').coinCol(69,5,3).coinCol(70,5,3).row(73,9,'=====').coins(73,10,2).spark(75,10).coins(76,10,2);
  B.row(81,5,'?B?').enemy('boing',85);
  /* the first Mimic, with nothing else about */
  B.sign(89,'Not every prize block is a block. A Mimic wakes when you come close: stomp it!').enemy('mimic',95);
  B.enemy('balloon',102,3.6).coins(102,6,2).row(105,8,'==').coins(105,9,2);
  B.checkpoint(110);
  B.row(114,5,'BOB').enemy('stack',120).enemy('blob',125).enemy('blob',127).row(131,5,'?').row(131,9,'I').enemy('boing',137).enemy('shellby',144);
  /* trampolines on posts in the sea; the one in the middle throws a held jump as high as the second spark */
  B.fill(153,0,154,2,HARD).row(153,3,'JJ').fill(159,0,160,3,HARD).row(159,4,'JJ').fill(165,0,166,2,HARD).row(165,3,'JJ');
  B.coins(156,8,2).coins(162,8,2).spark(159.5,13);
  B.row(172,5,'?B?').enemy('boing',176).row(183,2,'?').enemy('mimic',185).row(187,2,'?').row(184,5,'B?B');
  B.warp(191,2,'in').enemy('stack',196).warp(200,3,'out',true);
  B.stairs(206,6).fill(212,2,212,7,HARD);
  B.goal(218);
  /* the balloon seller's store room: a trampoline, a ledge, and a balloon under the third spark */
  B.fill(232,2,235,15,GROUND).ground(236,261).fill(236,2,236,15,HARD).fill(261,2,261,15,HARD);
  B.warp(238,2,'in',true).warp(257,2,'out').row(242,2,'JJ').coinCol(242,5,3).coinCol(243,5,3).row(245,7,'===').coins(245,8,3).enemy('balloon',250,9.3).spark(251,12).coinBox(247,3,254,4).row(253,7,'?L?');
  return B.L;
}

/* 6-2: the human cannonball, at twilight. Cannons: one over a ditch, then one that fires into another. Gondolas that go
   round a hub and lift Blorp to a high deck. A trapeze, then two, and two wheels turning over open water. */
function w6l2(){
  const B=LevelBuilder(296,'park');
  B.room(0,265).room(270,295,0,15,true);
  B.ground(0,30).ground(37,74).ground(92,150).ground(164,166).ground(177,196).ground(222,269);
  B.coins(4,3,3).row(8,5,'?O?').enemy('blob',13).enemy('batty',18,6,{rx:3});
  B.sign(22,'A cannon! Hop in, and it fires you the way it points.');
  parkCannons(B,27,2,[[40,21]]);
  B.row(44,5,'B?B').enemy('parktoy',50).enemy('blob',56);
  B.sign(60,'One cannon can fire you into the next. Sit tight!');
  parkCannons(B,66,2,[[45,22,0.7],[45,22]]);
  B.row(101,5,'?M?').enemy('shellby',105).enemy('stack',110);
  /* the first wheel: two gondolas on a hub, the only way up to the deck; the second spark hangs over the hub */
  B.sign(113,'The gondolas go round and round. Step on low, step off high.');
  B.plat(118.5,6,3,'c',3,0.9,0).plat(118.5,6,3,'c',3,0.9,Math.PI).spark(119.5,12);
  B.ground(125,138,8).coins(127,9,3).row(130,11,'?L?').enemy('parktoy',133,8);
  B.checkpoint(143).row(146,5,'?O?');
  /* trapezes, with an islet between them and a spark over the islet */
  B.sign(149,'A trapeze! Jump on at the near end of its swing, and off at the far end.');
  B.plat(155,3,3,'s',6,1.2).plat(170,3,3,'s',6,1.2,1.6).spark(165,6).coins(155,5,3).coins(170,5,3).enemy('batty',160,8,{rx:2});
  B.row(180,5,'B?B').enemy('boing',184).enemy('stack',190);
  /* two wheels over the water, turning out of step */
  B.plat(201.5,5,3,'c',3,1,0).plat(201.5,5,3,'c',3,1,Math.PI).plat(212.5,5,3,'c',3,1,Math.PI/2).plat(212.5,5,3,'c',3,1,Math.PI*1.5);
  B.coins(202,5,2).coins(213,5,2).enemy('batty',208,10,{rx:2});
  B.warp(225,2,'in').row(229,5,'B?B').enemy('parktoy',231).warp(235,3,'out',true);
  B.stairs(240,6).fill(246,2,246,7,HARD);
  B.goal(252);
  /* the cannon store: one shot across the room, through the third spark */
  B.fill(266,2,269,15,GROUND).ground(270,295).fill(270,2,270,15,HARD).fill(295,2,295,15,HARD);
  B.warp(272,2,'in',true).warp(291,2,'out'); parkCannons(B,276,2,[[25,20]]);
  { const q=parkArc(276,2,25,20,0.62); B.spark(q[0]-0.5,q[1]-0.5); }
  B.coinBox(284,3,288,4).row(285,7,'?L?');
  return B.L;
}

/* 6-3: the midway at midnight. A firework on legs and a wall to try it on, Mimics hiding in a row of prizes, a switch
   that lights the red signs and the blue ones by turns, cannons that fire rockets, and a pair of trapezes to the flag. */
function w6l3(){
  const B=LevelBuilder(284,'park');
  B.ground(0,58).ground(67,112).ground(127,190).ground(215,283);
  B.coins(4,3,3).row(8,5,'?M?').enemy('blob',13);
  /* a cell of bricks with the first spark in it: blow the wall in with a Fizzle, or drop through the hole in the roof */
  B.sign(17,'A Fizzle is a firework on legs. Stomp it to light the fuse, then kick it away, or stand well back!');
  B.enemy('fizzle',22);
  B.fill(28,2,28,3,BRICK).fill(32,2,32,3,HARD).fill(28,4,32,4,HARD).clear(30,4,30,4).row(31,2,'H').spark(29,2).coins(29,3,2);
  B.row(38,2,'?').enemy('mimic',40).row(42,2,'?').enemy('mimic',44).row(46,2,'?').row(39,5,'?B?B?').enemy('parktoy',52).enemy('batty',55,6,{rx:3});
  B.enemy('balloon',61,2.6).enemy('balloon',64,2.6).arc(60,4,3).arc(63,4,3);
  /* the signs: the switch puts out the red gate and lights the blue steps, which lead up to a spark */
  B.sign(69,'Hit the switch! Red signs go dark and blue signs light up. A lit sign is solid.');
  B.row(72,5,'X').fill(77,2,77,6,RED).row(81,4,'UU').row(85,6,'UU').row(89,8,'====').coins(89,9,1).spark(90,9).coins(91,9,2).enemy('shellby',84);
  B.sign(95,'Cannons fire rockets. Jump over them, or stomp them.').row(98,5,'?O?').cannon(104,2,3.2).row(109,5,'X');
  /* a bridge of red signs: lit, it carries Blorp over; dark, he swims */
  B.row(113,2,'RRRRRRRRRRRRRR').row(119,6,'I');
  B.fill(128,2,129,2,HARD).cannon(128,3,3.4,1).row(129,3,'H').checkpoint(135);
  B.row(139,5,'B?B').enemy('fizzle',142).enemy('stack',147).row(151,2,'??').enemy('mimic',154).row(156,2,'?');
  /* above the screen: a trampoline, a ledge, a higher ledge, and the third spark */
  B.row(160,2,'JJ').coinCol(160,5,3).coinCol(161,5,3).row(164,9,'===').coins(164,10,3).row(169,12,'==').spark(169.5,13);
  B.enemy('boing',174).cannon(179,2,3.4).enemy('swoop',186,9,{span:8});
  B.plat(195,3,3,'s',6,1.2).plat(208,3,3,'s',6,1.2,1.5).coins(195,5,3).coins(208,5,3).enemy('batty',202,8,{rx:2});
  B.row(218,5,'?M?').enemy('parktoy',222).cannon(228,2,3.2).enemy('fizzle',234).row(238,5,'B?B').enemy('stack',243).enemy('blob',247);
  B.stairs(254,6).fill(260,2,260,7,HARD);
  B.goal(266);
  return B.L;
}

/* 6-4: fireworks night. Every ride at once: a long line of balloons with a trampoline in the middle, a Catherine wheel,
   the great wheel with four gondolas, three cannons in a chain across the bay, more wheels of fire, and a trapeze under
   rocket fire. */
function w6l4(){
  const B=LevelBuilder(306,'park');
  B.room(0,275).room(280,305,0,15,true);
  B.ground(0,30).ground(53,92).ground(108,138,5).ground(172,206).ground(225,279);
  B.coins(4,3,3).row(8,5,'?O?').enemy('fizzle',13).enemy('stack',19).enemy('parktoy',25);
  /* balloons out to a trampoline on a post, and balloons on to the far side; the first spark is over the trampoline */
  B.enemy('balloon',33,2.6).enemy('balloon',36,2.8).fill(40,0,41,2,HARD).row(40,3,'JJ').enemy('balloon',44,3).enemy('balloon',47,2.8).enemy('balloon',50,2.6);
  B.spark(40.5,8).coins(33,5,1).coins(36,5,1).coins(44,6,1).coins(47,5,1).coins(50,5,1).enemy('puff',45,8,{rx:2});
  B.row(56,5,'B?B').enemy('boing',60).cannon(65,2,3.2).row(69,5,'?M?');
  B.sign(73,'A Catherine wheel! It cannot be stomped. Wait for it to climb, then run under.').enemy('saw',78,6.5,{ry:-4.3,sp:1.3});
  /* a trampoline for a ground pound: the second spark is as high as the sky goes */
  B.row(82,2,'?').enemy('mimic',84).row(86,2,'?').row(89,2,'JJ').spark(89.5,14).coinCol(89,5,4).coinCol(90,5,4);
  /* the great wheel: four gondolas on one hub, and the only way up to the high deck */
  for(let k=0;k<4;k++) B.plat(98.5,6,2,'c',3.5,0.9,k*Math.PI/2);
  B.row(113,8,'?').enemy('parktoy',116,5).enemy('fizzle',123,5).enemy('swoop',129,10,{span:8}).checkpoint(132,5);
  parkCannons(B,137,5,[[45,22,0.7],[55,22,0.7],[45,22]]);
  B.row(188,5,'?O?').enemy('saw',193,2,{rx:5,sp:1.5}).enemy('stack',201).enemy('puff',204,6,{rx:2});
  /* a trapeze and two balloons, with a cannon on the far side firing along them */
  B.plat(211,3,3,'s',6,1.25).enemy('balloon',220,2.8).enemy('balloon',222.5,2.6).coins(211,5,3);
  B.fill(227,2,228,2,HARD).cannon(227,3,3.6).row(228,3,'H');
  B.enemy('fizzle',232).warp(235,2,'in').row(239,2,'?').enemy('mimic',241).row(243,2,'?').row(240,5,'B?B').warp(246,3,'out',true);
  B.stairs(250,6).fill(256,2,256,7,HARD);
  B.goal(262);
  /* the wheel house: four gondolas round a hub, and the third spark in the hub */
  B.fill(276,2,279,15,GROUND).ground(280,305).fill(280,2,280,15,HARD).fill(305,2,305,15,HARD);
  B.warp(282,2,'in',true).warp(301,2,'out'); for(let k=0;k<4;k++) B.plat(291,8,2,'c',3.5,0.8,k*Math.PI/2);
  B.spark(291.5,8).coinBox(286,3,297,3).coins(291,12,2);
  return B.L;
}

/* 6-5: the big top. A short walk through the sideshows, one of each: balloons, a stage with something under it, a
   trampoline, a cannon, a Catherine wheel, a trapeze. Then the tent, a muffin, and Ringmaster Razzle in his ring. */
function w6l5(){
  const B=LevelBuilder(208,'park');
  B.set('tentX',150);
  B.ground(0,28).ground(41,47,4).ground(48,84).ground(92,130).ground(143,207);
  /* the stage is hollow: under it, reached from the water, the third spark */
  B.clear(41,1,45,2).row(39,2,'==').spark(44,1);
  B.coins(4,3,3).row(8,5,'?O?').enemy('stack',14).enemy('parktoy',21);
  B.enemy('balloon',31,2.6).enemy('balloon',34,2.8).enemy('balloon',37,2.8).spark(33,6).coins(31,5,1).coins(35,5,1);
  B.row(51,5,'B?B').enemy('fizzle',54).row(58,2,'JJ').coinCol(58,5,3).coinCol(59,5,3).row(61,9,'====').coins(61,10,4).row(62,13,'I');
  B.cannon(68,2,3.2).row(71,2,'?').enemy('mimic',73).row(75,2,'?').enemy('boing',78);
  parkCannons(B,81,2,[[45,22]]);
  B.row(101,5,'?').enemy('batty',105,6,{rx:3}).enemy('stack',109).enemy('saw',115,6.5,{ry:-4.3,sp:1.3}).cannon(121,2,3.4).enemy('parktoy',125);
  /* the second spark is above the top of the trapeze's swing */
  B.plat(133,3,3,'s',5,1.3).spark(139,9).coins(133,5,3);
  B.checkpoint(147).row(151,5,'?M?');
  /* up the steps and down into the ring */
  B.stairs(161,5).fill(166,2,166,6,HARD).fill(193,2,193,10,HARD);
  B.boss(186,168,192,12,'razzle');
  return B.L;
}

/* ---------- the island on the map ---------- */
function parkMapTop(){ const r='#d83a4a',w='#f4e9dc', b=[[-9.6,0,-7.6,19.2,0.6,15.2,'#c9a0e8'],[-1.6,0.6,7,3.2,5,0.3,'#2c2447'],[-0.3,19.6,-0.3,0.6,6,0.6,w],[0.3,23,-0.15,4.4,2.4,0.3,'#ffe14d'],[4.7,23.6,-0.15,1.6,1.2,0.3,'#ffe14d']];
  for(let i=0;i<8;i++) b.push([-9+i*2.25,0.6,-7,2.25,7,14,i%2?w:r]);
  for(let k=0;k<5;k++){ const s=10.4-k*2; b.push([-s,7.6+k*2.4,-s*0.76,2*s,2.4,s*1.52,k%2?w:r]); }
  return b; }
function parkMapTopGlow(){ const b=[[-1.2,0.8,7.3,2.4,4.2,0.1,'#ffd27a']]; for(let i=0;i<9;i++) b.push([-9.3+i*2.25,6.6,7.05,0.6,0.6,0.3,parkBulbCols[i%5]]); for(let i=0;i<6;i++) for(const s of [-1,1]) b.push([s*9.2-0.3,6.6,-6.6+i*2.6,0.6,0.6,0.6,parkBulbCols[(i+1)%5]]); return b; }
function parkMapWheel(){ const c='#b9a8e8', b=[[-5,-0.3,-0.3,10,0.6,0.6,c],[-0.3,-5,-0.3,0.6,10,0.6,c],[-0.8,-0.8,-0.5,1.6,1.6,1,'#ffc928']];
  for(let i=0;i<8;i++){ const a=i/8*6.2832; b.push([Math.cos(a)*5-0.9,Math.sin(a)*5-0.9,-0.45,1.8,1.8,0.9,parkBulbCols[i%5]]); }
  return b; }
defWorld({name:'Popcorn Park',theme:'park',levels:[w6l1,w6l2,w6l3,w6l4,w6l5],
  map:{
    /* a chequer of candy colours: pink and cream, with mint here and there and lemon on the high ground */
    ground:(h,p)=>[h>=4&&p<0.5?['#ffe08a','#fff0c9']:p<0.28?['#7fe0d0','#fff0c9']:['#ff9fc6','#fff0c9'],['#b97a4a','#a86a3c']],
    pond:['#58c4ea','#2f95d6','#1f66b0'],
    scatter(M,c){ const r=c.r, col=pick(c.R,parkBulbCols);
      if(r<0.07&&c.clear(2.2)) M.put(M.land,parkTentS(pick(c.R,['#e8384f','#3a7ad8','#e8a020'])),c.x,c.y,c.z,0.36);
      else if(r<0.14){ M.put(M.land,parkLampM(),c.x,c.y,c.z,0.5); M.glow.push([c.x-0.09,c.y+0.84,c.z-0.09,0.18,0.18,0.18,'#ffe9a0']); if(c.r2<0.5) M.lamp(c.x,c.y+0.9,c.z+0.2,0xffd27a,1.1,5); }
      else if(r<0.19&&c.clear(1.8)) M.bob(M.part(parkBalloonM(col),c.x,c.y+0.75+c.r2*0.3,c.z,1.1),0.07,1.1+c.r2,0.07);
      else if(r<0.26) M.put(M.land,parkBucket(),c.x,c.y,c.z,0.75);
      else if(r<0.31&&c.clear(1.4)) M.put(M.land,parkFlagPole(col),c.x,c.y,c.z,0.5);
      else if(r<0.36&&c.clear(1.6)) M.put(M.land,parkStall(pick(c.R,['#e8384f','#3a7ad8','#2fb0a0'])),c.x,c.y,c.z,0.38);
      else if(r<0.42) M.put(M.land,parkBarrel(col),c.x,c.y,c.z,0.6);
      if(r>0.88) M.mote({kind:2,x:c.x,y:c.y+0.35+c.r2*0.5,z:c.z,col,size:0.08,rate:0.6+c.r2}); },
    /* the big top, striped, flagged and floodlit, and beside it a little Ferris wheel that turns */
    landmark(M,x,y,z){ M.put(M.land,parkMapTop(),x-0.3,y,z,0.82); M.put(M.glow,parkMapTopGlow(),x-0.3,y,z,0.82);
      M.lamp(x-1,y+1.2,z+1.3,0xffe6b0,1.6,7); M.lamp(x+0.6,y+1.2,z+1.3,0xffe6b0,1.4,7);
      const wx=x+1.12, wy=y+1.05, wz=z+0.9; M.land.push([wx-0.05,y,wz-0.2,0.1,1.05,0.1,'#f4e9dc'],[wx-0.3,y,wz-0.3,0.6,0.1,0.3,'#6a4630']);
      M.spin(M.part(parkMapWheel(),wx,wy,wz,0.9),'z',0.8); }
  }});
