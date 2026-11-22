/* ================= World 8: Neon Noodletown ================= */
/* The rooftops of a city at night, in the rain: towers behind towers with their windows lit, signs in pink, cyan and
   yellow, noodle bars steaming, a monorail and flying cars crossing the far view, and a black canal far below that
   shows it all twice. The roofs are alarmed: beams on timers, Zapbots, lifts with a saw on the rail beside them,
   walkways that move, vents that blow, old signs that crumble underfoot. A fall ends in the canal. */

/* ---------- the tune ---------- */
/* @song */
/* D minor, synthwave, 112 to the minute on a grid of sixteenths: a sawtooth arpeggio that never stops running, a pad of
   whole chords that swells in from nothing, a pulsing bass, four on the floor with a clap on two and four, and over it a
   lead that holds long notes, shakes them, and lets the echo answer. */
SONGS.neon=(()=>{
  const h='D5 - - - A5 - - -  F5 - - - D5 - Bb4 -  C5 - - - F5 - A5 -  G5 - - - - - E5 - ';
  const a=h+'F5 - - - A5 - - -  Bb5 - A5 - F5 - - -  G5 - - - Bb5 - D6 -  C#6 - - - - - A5 - ';
  const a2=h+'F5 - - - A5 - D6 -  F6 - - - D6 - Bb5 -  C6 - E6 - G5 - C6 -  D6 - - - - - . . ';
  const b='Bb5 - - G5 Bb5 - D6 -  E6 - - - C6 - G5 -  A5 - - F5 A5 - C6 -  D6 - - - A5 - F5 -  D5 - F5 - Bb5 - - -  G5 - Bb5 - D6 - - -  E6 - - - C#6 - A5 -  G5 - A5 - C#6 - E6 - ';
  const ch='Dm Bb F C Dm Bb Gm A  Dm Bb F C Dm Bb C Dm  Gm C F Dm Bb Gm A A7  Dm Bb F C Dm Bb C Dm';
  const d='k . h . ksp . h . k . h . ksp . h o ';
  return song({key:'D minor',bpm:112,spb:4,ec:0.75,fb:0.4},
    [{w:'sawtooth',v:0.04,det:9,vib:13,s:0.75,a:0.02,g:0.95,lp:[3.5,7],e:1,r:0.45,pan:0.1},musX2(a+a2+b+a2)],
    [{w:'sawtooth',v:0.021,g:0.6,lp:[7,1.2],q:3,pan:0.35,r:0.3},musArp(ch,16,'1 5 8 5 3^ 5 8 5 1 5 8 5 3^ 5 8 5','A3')],
    [{w:'sawtooth',v:0.013,a:0.5,s:0.9,g:1,lp:[1.2,5],r:0.85,pan:-0.3},musChord(ch,16,'x - - - - - - - - - - - - - - -','A3')],
    [{w:'sawtooth',v:0.06,h:1,g:0.6,lp:[6,1.5]},musArp(ch,16,'1 . 1 . 1 . 1 . 1 . 1 . 1 . 8 1','A1')],
    [{dr:1,v:0.9},'kx . h . ksp . h . k . h . ksp . h o '+d.repeat(6)+'k . h . ksp . h . k . h . ks s m l ']);
})();
/* @endsong */

/* ---------- models ---------- */
const neonWin=['#ffd27a','#ffe9a0','#ffc878','#ffd27a','#9fe8ff','#ff9ad0'];
const neonHex=c=>parseInt(c.slice(1),16);
let neonSteamAt=[]; /* where steam rises in the level that is loaded: [x, y, z, puffs a second, size] */
/* a water tank on stilts, with a ladder */
function neonTankM(){ const w='#7a5238',d='#55372a',m='#434c80',r='#2a2f58',r2='#3a4170';
  return [[-5,0,-5,1,10,1,m],[4,0,-5,1,10,1,m],[-5,0,4,1,10,1,m],[4,0,4,1,10,1,m],[-5,4.6,4.2,10,0.8,0.6,m],
    [-6,10,-6,12,1,12,r],[-5,11,-5,10,13,10,w],[-5.3,13.5,-5.3,10.6,0.8,10.6,d],[-5.3,20,-5.3,10.6,0.8,10.6,d],[-2,11,5,0.4,13,0.15,d],[1.6,11,5,0.4,13,0.15,d],
    [-6,24,-6,12,1.2,12,r],[-4.4,25.2,-4.4,8.8,1.5,8.8,r2],[-2.6,26.7,-2.6,5.2,1.5,5.2,r],[-0.8,28.2,-0.8,1.6,1.6,1.6,r2],
    [5.4,0,-0.6,0.5,23,0.5,m],[5.4,0,1.2,0.5,23,0.5,m]]; }
/* an air-conditioner: a box with a fan behind a grille */
function neonAcM(){ const c='#9aa6d0',l='#c2ccee',d='#2a2f58';
  return [[-4,0.6,-3,8,5.6,6,c],[-4.3,6.2,-3.3,8.6,0.6,6.6,l],[-3.4,0,-2.4,1.2,0.6,4.8,d],[2.2,0,-2.4,1.2,0.6,4.8,d],
    [-3.2,1.4,3,4.2,4.2,0.2,d],[-1.7,2.9,3.2,1.2,1.2,0.15,'#7df3ff'],[-3,3.3,3.2,3.8,0.4,0.1,'#5a648f'],[-1.3,1.6,3.2,0.4,3.8,0.1,'#5a648f'],
    [1.6,1.6,3,1.8,0.5,0.2,d],[1.6,2.8,3,1.8,0.5,0.2,d],[1.6,4,3,1.8,0.5,0.2,d]]; }
function neonAerialM(h){ const c='#6f7bb0',d='#434c80';
  return [[-1.5,0,-1.5,3,1,3,d],[-0.4,1,-0.4,0.8,h-1,0.8,c],[-3,h-3,-0.25,6,0.5,0.5,c],[-2,h-6,-0.25,4,0.5,0.5,c],[-1.2,h-9,-0.25,2.4,0.5,0.5,c],[-3,h-3,-0.25,0.5,1.6,0.5,c],[2.5,h-3,-0.25,0.5,1.6,0.5,c]]; }
/* the frame of a sign: two posts and a dark board. What is written on it is a glyph, and glows. */
function neonSignM(){ const k='#1a1d3a',p='#434c80'; return [[-6,0,-0.5,1,9.5,1,p],[5,0,-0.5,1,9.5,1,p],[-7.5,9,-0.6,15,10,1.2,k],[-7.9,8.6,-0.8,15.8,0.6,1.6,p],[-7.9,18.8,-0.8,15.8,0.6,1.6,p]]; }
/* what a sign says, in tubes of light, ten wide and eight tall from its foot: 0 a bowl of noodles, 1 an arrow, 2 a word, 3 three bars */
function neonGlyphM(k,c,c2){ const w='#ffffff';
  return k===0?[[-4,1,0,8,2.2,0.3,c],[-2,0,0,4,1,0.3,c],[-4.8,3.2,0,9.6,0.8,0.3,c2],[-2.6,4.8,0,0.7,2.4,0.3,w],[-0.3,5.4,0,0.7,2.4,0.3,w],[2,4.8,0,0.7,2.4,0.3,w]]
    :k===1?[[-4.6,3.3,0,5.6,1.4,0.3,c],[1,1.2,0,1.3,5.6,0.3,c],[2.3,2,0,1.2,4,0.3,c],[3.5,2.9,0,1.1,2.2,0.3,c],[-4.6,0.6,0,3,0.8,0.3,c2],[-4.6,6.6,0,3,0.8,0.3,c2]]
    :k===2?[[-3.5,6.6,0,7,0.9,0.3,c],[-4.6,4,0,9.2,0.9,0.3,c],[-3.5,0.6,0,7,0.9,0.3,c],[-0.5,0.6,0,1,6.9,0.3,c],[-3.5,2.1,0,1,1.4,0.3,c2],[2.5,2.1,0,1,1.4,0.3,c2]]
    :[[-4.5,5.6,0,9,1.2,0.3,c],[-4.5,3.4,0,6.2,1.2,0.3,c2],[-4.5,1.2,0,8,1.2,0.3,c],[2.7,3.4,0,1.8,1.2,0.3,w]]; }
/* a noodle bar: a counter under a striped awning, curtains, a pot, three stools */
function neonBarM(){ const w='#6b4630',d='#4a2f22',k='#1f2340',r='#c93d3d',c='#fff2e0',s='#aab4d8',n='#2a3a8a',t='#434c80';
  return [[-10,0,-4,20,4.6,7,w],[-10.5,4.6,-4.5,21,0.8,8,d],[-10,5.4,-4.4,20,9,1,'#3a2a55'],[-10,5.4,2.4,1,9,1,k],[9,5.4,2.4,1,9,1,k],
    [-11.5,14.4,-5.4,23,1.4,10.4,r],[-11.5,12.8,4.6,23,1.6,0.5,r],[-9,12.8,4.8,3,1.6,0.4,c],[-1.5,12.8,4.8,3,1.6,0.4,c],[6,12.8,4.8,3,1.6,0.4,c],
    [-8.4,9.6,3,3.6,3.2,0.3,n],[-3.4,9.6,3,3.6,3.2,0.3,n],[1.6,9.6,3,3.6,3.2,0.3,n],
    [3.5,5.4,-1.8,4.4,2.4,3.6,s],[4,7.8,-1.3,3.4,0.5,2.6,'#7a84b0'],[-7,5.4,-1,2.4,1.2,2.4,c],[-3.6,5.4,-0.4,2.4,1.2,2.4,c],
    [-7.5,0,4.2,2.4,3,2.4,t],[-1.2,0,4.6,2.4,3,2.4,t],[5,0,4.2,2.4,3,2.4,t]]; }
/* its lights: two paper lanterns, a strip under the counter's edge, and a bowl of noodles on the roof */
function neonBarGlowM(c){ const g=[[-11.2,8.4,4.2,2,3,2,'#ff4f4f'],[9.2,8.4,4.2,2,3,2,'#ff4f4f'],[-9.6,5.5,3.5,19.2,0.3,0.3,'#ffd27a']];
  for(const b of scaled(neonGlyphM(0,c,'#ffe14d'),1.1)) g.push([b[0],b[1]+16.2,b[2]-1,b[3],b[4],b[5],b[6]]);
  return g; }
/* a paper lantern on a post: the post, and the lantern */
function neonLampM(){ const k='#2a2f58'; return [[-1.4,0,-1.4,2.8,0.8,2.8,k],[-0.4,0.8,-0.4,0.8,12.4,0.8,k],[-0.4,12.6,-0.4,4.6,0.6,0.8,k],[2.5,11.6,-0.9,1.8,0.5,1.8,k],[2.5,7.6,-0.9,1.8,0.5,1.8,k]]; }
function neonLampGlowM(c){ return [[2.1,8.1,-1.3,2.6,3.5,2.6,c],[2.9,7.2,-0.5,1,0.4,1,'#ffe14d']]; }
/* a stub of chimney, for steam to come out of */
function neonStackM(){ return [[-2,0,-2,4,7,4,'#5a648f'],[-2.6,7,-2.6,5.2,1,5.2,'#434c80'],[-1.4,8,-1.4,2.8,0.15,2.8,'#14183a'],[-2.1,3,-2.1,4.2,0.6,4.2,'#434c80']]; }
/* the monorail and a flying car, in whole tiles: each a body, and its lights */
function neonTrainM(){ const b=[]; for(let i=0;i<3;i++){ const x=i*5.4; b.push([x,0,-0.7,5,1.5,1.4,'#c9d2f0'],[x-0.02,0.25,-0.75,5.04,0.3,1.5,'#ff3fa4'],[x+0.3,1.5,-0.5,4.4,0.2,1,'#8a94b8']); } return b; }
function neonTrainGlowM(){ const b=[[15.82,0.4,-0.4,0.12,0.4,0.8,'#ffffff'],[-0.1,0.4,-0.4,0.12,0.3,0.8,'#ff3b4f']]; for(let i=0;i<3;i++) for(let k=0;k<4;k++) b.push([i*5.4+0.5+k*1.1,0.75,0.7,0.8,0.5,0.06,'#ffe9a0']); return b; }
function neonCarM(){ return [[-0.9,0,-0.4,1.8,0.45,0.8,'#2a2f58'],[-0.5,0.45,-0.35,0.9,0.32,0.7,'#434c80']]; }
function neonCarGlowM(){ return [[0.9,0.1,-0.3,0.1,0.22,0.6,'#fff3c2'],[-1,0.1,-0.3,0.1,0.22,0.6,'#ff3b4f'],[-0.7,-0.09,-0.3,1.4,0.07,0.6,'#3ff0ff']]; }

/* ---------- the world's own creatures ---------- */
/* a Zapbot in the city's colours */
function neonZapbotM(){ return mDrone('#5a66a8','#2a2f58','#7df3ff').concat([[-3.9,3.6,-0.4,0.3,0.5,0.8,'#7df3ff'],[3.6,3.6,-0.4,0.3,0.5,0.8,'#7df3ff'],[-2,1.2,2.5,4,0.5,0.3,'#ff3fa4']]); }
/* a pigeon: plump and grey, a green sheen at the neck, one beady eye each side of the beak */
function neonPigeonM(){ const c='#8a94b8',l='#b4bedc',d='#5a648f'; return [
  [-2.2,0.8,-2.6,4.4,3.4,5,c],[-1.7,3.4,0.6,3.4,2.8,2.8,l],[-1.8,3,0.5,3.6,0.7,3,'#5fd6b0'],
  ...eye(-1.6,4.4,3.4,1.3,1.3,0.7,0.8,0.3,0.2),...eye(0.3,4.4,3.4,1.3,1.3,0.7,0.8,0.3,0.2),
  [-0.5,3.7,3.4,1,0.7,1.1,'#ffb347'],[-1.4,1.8,-4.2,2.8,1,1.8,d],[-1,1.2,-5.4,2,0.8,1.4,d],
  [-1.5,0,-0.4,0.9,0.8,1.4,'#ff8f7a'],[0.6,0,-0.4,0.9,0.8,1.4,'#ff8f7a'],[-1.4,1.2,2.4,2.8,1.6,0.2,l]]; }
function neonPigeonWingM(sx){ const d='#6a7498',l='#a8b2d4'; return sx>0?[[0,-0.4,-1.6,3.4,0.8,3.2,d],[3.4,-0.2,-1.1,1.8,0.5,2.2,d],[0.5,0.4,-1.2,2.4,0.12,2.2,l]]:[[-3.4,-0.4,-1.6,3.4,0.8,3.2,d],[-5.2,-0.2,-1.1,1.8,0.5,2.2,d],[-2.9,0.4,-1.2,2.4,0.12,2.2,l]]; }
/* It flies a figure of eight, as a Batty does, and can be stomped. All it knows is in plain numbers on e. */
defEnemy('neonPigeon',{h:0.7,stomp:true,fly:true, init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx||3; e.ry=d.ry||1; e.sp=d.sp||1.3; },
  mesh(){ const g=new T.Group(), u=g.userData; u.body=vmesh('neonPigeon',neonPigeonM); u.wl=vmesh('neonPigeonWL',()=>neonPigeonWingM(-1)); u.wr=vmesh('neonPigeonWR',()=>neonPigeonWingM(1));
    u.wl.position.set(-2.2*S8,3.2*S8,-0.6*S8); u.wr.position.set(2.2*S8,3.2*S8,-0.6*S8); g.add(u.body,u.wl,u.wr); return g; },
  tick(e){ e.x=e.ox+Math.sin(e.t*e.sp)*e.rx; e.y=e.oy+Math.sin(e.t*e.sp*2)*e.ry; },
  anim(e,m,dt,time){ const u=m.userData; u.wl.rotation.z=Math.sin(time*15+e.ox)*0.75; u.wr.rotation.z=-u.wl.rotation.z; m.rotation.y=(Math.cos(e.t*e.sp)>0?1:-1)*1.05; m.rotation.z=Math.sin(time*4+e.ox)*0.06; }});

THEMES.neon={ music:'neon', air:'rain',
  /* evening, with the last blue in the sky: the glow of the city along the skyline, blue above it */
  sky:['#1b2a7a','#7a4a9e','#ff9ab0'], skyMid:0.6, sunGlow:0, stars:0.22, cloud:0.55, cloudCol:'#8a78c4', cloudShade:'#2f2c66', cloudY:0.74, neb:['#ff3fa4','#3fd0ff'], nebI:0.2,
  fog:0x5a4690, fogNear:16, fogFar:135,
  hemiSky:0xc2ccff, hemiGround:0xff9ad0, hemiI:0.74, sunI:0.5, sunCol:0xa8d4ff, sunDir:[-0.4,0.72,0.56],
  /* wet roofs: dark slate laid in courses, with a bright line along every edge */
  top:'#3d4577', topS:['#475089','#343b68','#4f5a98','#6170b8'], dirt:'#2b3058', dirtS:['#23274a','#353b6a','#1d2140'], cap:'#4a5596', capL:'#7df3ff', capD:'#181b38', stone:true,
  brick:['#c2457f','#7a2455','#ff8fc0'], hard:['#6f7bb0','#aab6ea','#434c80'], pipe:['#22c7b8','#9ffff0','#12807a','#06302f'],
  semi:'beam', plat:['#ffd23e','#c9741f'], dust:'#cfe0ff', back:-5.5,
  /* the canal: black, and a mirror. Nobody swims in it. */
  liquid:{kind:'canal',a:'#0c1236',b:'#7df3ff',op:1,far:60,mirror:0.85,glint:'#ff8fd0',flow:0.5},
  bounce:{kind:'tramp',cols:['#ff4f9a','#ffd0ec','#8a2460']}, bounceCol:'#cfe0ff', laser:'#ff2e6a',
  bloom:1.0, hi:0.2, rays:0, sat:1.12, con:1.05, vig:0.5, grade:{shadow:[0.92,0.96,1.14],high:[1.07,0.98,1.03]},
  skins:{drone:neonZapbotM}, neons:['#ff3fa4','#3ff0ff','#ffe14d'],
  looks:[null,
    /* deep night */
    {sky:['#050818','#2a1a5a','#6a2f8a'],fog:0x241c52,hemiSky:0x9aa8ff,hemiGround:0xff7ac8,hemiI:0.68,sunI:0.42,sunCol:0x8ab8ff,stars:0.55,shoot:1,cloud:0.38,cloudCol:'#4a4490',cloudShade:'#171a40',nebI:0.3,
      cap:'#4a4f9a',capL:'#ff7ac8',neons:['#ff3fa4','#8a6cff','#3ff0ff'],liquid:{kind:'canal',a:'#070b26',b:'#ff9ad0',op:1,far:60,mirror:0.88,glint:'#7df3ff',flow:0.5},grade:{shadow:[0.9,0.94,1.18],high:[1.06,0.98,1.06]}},
    /* the sign district: a haze of magenta, lit from below in green */
    {sky:['#1c0f40','#a03a9a','#ff5fae'],skyMid:0.62,fog:0x7a3288,hemiSky:0xd8b0ff,hemiGround:0x6ff0d8,hemiI:0.72,sunI:0.45,sunCol:0xff9ad8,stars:0.1,cloud:0.3,cloudCol:'#c47ad8',cloudShade:'#4a2470',neb:['#3ff0c0','#ffe14d'],nebI:0.26,
      cap:'#5a4a96',capL:'#b6ff6a',neons:['#b6ff6a','#ff3fa4','#3ff0ff','#ffe14d'],liquid:{kind:'canal',a:'#160c36',b:'#b6ff6a',op:1,far:60,mirror:0.85,glint:'#ff5fae',flow:0.5},grade:{shadow:[1.0,0.92,1.14],high:[1.06,1.0,0.98]}},
    /* a storm: low cloud, hard rain, lightning */
    {sky:['#080a18','#2e3a5c','#51618a'],skyMid:0.62,fog:0x2c3654,hemiSky:0xa8b8dc,hemiGround:0x7f8fc0,hemiI:0.66,sunI:0.36,sunCol:0xb8d0ff,stars:0,cloud:0.95,cloudCol:'#55628a',cloudShade:'#141a2e',cloudY:0.68,nebI:0.06,storm:1,sat:1.02,
      cap:'#4a5a8a',capL:'#cfe6ff',neons:['#3ff0ff','#ff3fa4','#cfe6ff'],liquid:{kind:'canal',a:'#080c1c',b:'#cfe6ff',op:1,far:60,mirror:0.8,glint:'#cfe6ff',flow:1.5},grade:{shadow:[0.9,0.97,1.12],high:[1.0,1.0,1.06]}},
    /* the kitchen roof: everything lit by the burners */
    {sky:['#1c0a18','#8a2a2a','#ff7a2e'],skyMid:0.62,fog:0x6a2630,hemiSky:0xffc4a8,hemiGround:0xff7a3d,hemiI:0.72,sunI:0.5,sunCol:0xffb878,stars:0,cloud:0.5,cloudCol:'#b8553f',cloudShade:'#34121c',neb:['#ff7a2e','#ffd23e'],nebI:0.24,kitchen:1,
      top:'#4a3f6a',cap:'#7a4a5a',capL:'#ffb02e',neons:['#ff7a3d','#ffe14d','#ff3b4f'],liquid:{kind:'canal',a:'#1a0a14',b:'#ffb02e',op:1,far:60,mirror:0.85,glint:'#ff7a2e',flow:0.5},grade:{shadow:[1.06,0.94,1.0],high:[1.08,1.0,0.92]}}],
  /* the far view: a skyline a long way off, towers in the middle distance with signs down their corners, the monorail
     on its pylons, and the far bank of the canal with its billboards, tanks and steaming kitchens. Flying cars, the
     train, searchlights, rain near and far, and lightning now and then. */
  scenery(S,R){
    const W=S.W, far=S.far, gf=S.glowFar, soft=S.soft, ly=L.liquidY, storm=!!TH.storm, kitchen=!!TH.kitchen, NE=TH.neons;
    neonSteamAt=[];
    /* a tower standing in the canal: a dark block, a cap, and rows of lit windows up its face */
    const tower=(x,z,w,top,d,col,cw,chh,lit)=>{
      far.push([x-w/2,ly-42,z-d,w,top-ly+42,d,col],[x-w/2-0.25,top,z-d-0.25,w+0.5,0.45,d+0.5,shade(col,1.3)]);
      const cols=Math.max(1,Math.floor((w-0.8)/cw)), rows=Math.max(0,Math.floor((top-ly-1)/chh)), x0=x-cols*cw/2;
      for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){ if(R()>lit) continue; let n=1; while(i+n<cols&&R()<0.3) n++;
        soft.push([x0+i*cw+cw*0.18,top-(j+1)*chh+chh*0.2,z,n*cw-cw*0.36,chh*0.56,0.08,pick(R,neonWin)]); i+=n; }
    };
    /* the skyline */
    for(let x=-90;x<W+90;x+=7+R()*8){ const z=-74-R()*22, w=5+R()*7, top=5+R()*13+(R()<0.15?9:0); tower(x,z,w,top,6,'#161a40',2.4,2.3,0.3);
      if(R()<0.4){ const h=3+R()*4; far.push([x-0.15,top+0.45,z-3,0.3,h,0.3,'#2a2f58']); gf.push([x-0.3,top+0.45+h,z-3.15,0.6,0.6,0.6,'#ff3b4f']); } }
    /* the middle distance: some wear a sign down one corner, some an aerial with a red light */
    for(let x=-60;x<W+60;x+=8+R()*9){ const z=-40-R()*16, w=4.5+R()*5, top=4+R()*10, q=R(); tower(x,z,w,top,6,'#1c2150',1.5,1.6,0.42);
      if(q<0.4){ const c=pick(R,NE), sx=x+(R()<0.5?-w/2+0.3:w/2-1.1), n=3+((R()*3)|0); far.push([sx-0.15,top-2.1-(n-1)*1.1,z+0.02,1.1,n*1.1+0.3,0.1,'#0e1130']); for(let k=0;k<n;k++) gf.push([sx,top-1.5-k*1.1,z+0.12,0.8,0.8,0.1,c]); }
      else if(q<0.7){ const h=2.5+R()*3; far.push([x-0.12,top+0.45,z-3,0.25,h,0.25,'#3a4170']); gf.push([x-0.25,top+0.45+h,z-3.12,0.5,0.5,0.5,'#ff3b4f']); } }
    /* the monorail: a beam on pylons with a line of light under it, and two trains that come by in turn */
    { const ry=6.6, span=W+260; far.push([-90,ry,-34.6,W+180,0.5,1.2,'#262b55']); gf.push([-90,ry-0.14,-33.4,W+180,0.12,0.06,NE[1%NE.length]]);
      for(let x=-84;x<W+90;x+=13) far.push([x-0.5,ly-3,-34.5,1,ry-ly+3,1,'#1c2150']);
      for(let i=0;i<2;i++){ const g=new T.Group(), off=i*span*0.5; g.add(new T.Mesh(geo('neonTrain',neonTrainM,1),MAT.vox),new T.Mesh(geo('neonTrainG',neonTrainGlowM,1),MAT.glow)); g.position.set(-200,ry+0.5,-34); world.add(g);
        critters.push({tick(dt,time){ g.position.x=(time*11+off)%span-110; }}); } }
    /* the far bank: a street front of lower roofs, with billboards, water tanks and kitchens on them */
    for(let x=-34;x<W+34;){ const w=5+R()*6, z=-20-R()*5, top=1.6+R()*7.5, q=R(); x+=w/2;
      tower(x,z,w,top,7,'#232857',1.25,1.35,0.5);
      if(q<0.3) put(S.near,scaled(neonTankM(),1.4),x*8,top*8+3.6,(z-3.5)*8);
      else if(q<0.62){ const c=pick(R,NE), c2=pick(R,NE), k=(R()*4)|0; far.push([x-2.5,top+1.5,z-1.6,5,3.7,0.3,'#0e1130'],[x-2,top+0.45,z-1.5,0.3,1.1,0.3,'#3a4170'],[x+1.7,top+0.45,z-1.5,0.3,1.1,0.3,'#3a4170']);
        put(S.glow,scaled(neonGlyphM(k,c,c2),3.4),x*8,(top+1.75)*8,(z-1.3)*8); }
      else if(q<(kitchen?0.95:0.8)){ far.push([x-0.6,top+0.45,z-2.6,1.2,1.1,1.2,'#3a4170']); neonSteamAt.push([x,top+1.6,z-2,kitchen?2.4:1.5,0.36]); }
      if(R()<0.55) gf.push([x-w/2,top+0.45,z+0.04,w,0.1,0.08,pick(R,NE)]);
      x+=w/2+0.4+R()*2.5; }
    /* low cloud, and searchlights that lean about in it */
    for(let x=-60;x<W+60;x+=(storm?16:30)+R()*24) S.addCloud(x,13+R()*5,-46-R()*30,R,storm?'#3a4466':kitchen?'#6a3a4a':'#5a4f98',storm?1.2+R():undefined);
    for(let x=20+R()*30;x<W;x+=46+R()*40){ const ln=(R()-0.5)*0.9, m=S.addShaft(x,ly,-44-R()*10,2.6,30,pick(R,NE),ln); critters.push({tick(dt,time){ m.rotation.z=ln+Math.sin(time*0.3+x)*0.16; }}); }
    /* flying cars: a dark body, headlights, tail lights */
    for(let i=0;i<Math.ceil(W/55)+2;i++){ const z=-37-R()*20, y0=8.5+R()*7, sp=(R()<0.5?-1:1)*(5+R()*6), ph=R()*400, span=W+180, g=new T.Group();
      g.add(new T.Mesh(geo('neonCar',neonCarM,1),MAT.vox),new T.Mesh(geo('neonCarG',neonCarGlowM,1),MAT.glow)); if(sp<0) g.rotation.y=Math.PI; g.position.set(-99,y0,z); world.add(g);
      critters.push({tick(dt,time){ const u=(time*Math.abs(sp)+ph)%span; g.position.x=sp>0?u-90:W+90-u; g.position.y=y0+Math.sin(time*0.6+ph)*0.35; }}); }
    /* rain, far and near; over the kitchens, steam and sparks as well */
    S.addWeather('rain',storm?{n:720,vel:[-10,-25,0],tilt:-0.38,size:[0.04,0.9]}:{n:440});
    S.addWeather('rain',{n:storm?90:50,z:6,size:[0.055,1.3],box:[46,18,4],op:0.32,vel:storm?[-10,-25,0]:[-5,-22,0],tilt:storm?-0.38:-0.22});
    if(kitchen){ S.addWeather('dust',{n:60,size:[0.5,0.5],cols:['#fff0e6','#ffd9c2'],vel:[0.3,1.4,0],op:0.16,sway:[0.8,0.4,0.5],box:[46,16,8],z:-4}); S.addWeather('ember',{n:40}); }
    /* lightning: the sky goes white for a moment, and now and then thunder follows */
    { let next=(storm?2:6)+R()*8, again=0;
      critters.push({tick(dt){ next-=dt; if(again>0){ again-=dt; if(again<=0) skyU.uBolt.value=0.85; }
        if(next<=0){ next=(storm?3.5:10)+Math.random()*(storm?6:16); skyU.uBolt.value=1; if(storm){ flash(0.07); if(Math.random()<0.6) again=0.16; }
          if(G.state==='play'&&Math.random()<(storm?0.5:0.3)) sfx.thunder(); } }}); }
    /* steam from every kitchen and chimney near the camera, and the rain splashing on whatever it lands on */
    critters.push({tick(dt){ if(!(dt>0)) return;
      for(const s of neonSteamAt) if(Math.abs(s[0]-camX)<viewHalfW+6&&Math.random()<dt*s[3]) spawnPart(s[0]+(Math.random()-0.5)*0.3,s[1],s[2],kitchen?'#fff0e6':'#dfe8ff',(Math.random()-0.5)*0.3,0.8+Math.random()*0.5,0,1.7,s[4],-0.3,false,{grow:2.6,drag:0.5,spin:0.8});
      if(Math.random()<dt*(storm?26:14)){ const x=camX+(Math.random()-0.5)*2*viewHalfW, tx=Math.floor(x); if(tx<0||tx>=W) return; let ty=H-1; while(ty>=0&&!solidAt(tx,ty)) ty--;
        if(ty>=0) spawnPart(x,ty+1.04,tileAt(tx,ty)===GROUND?-4.5+Math.random()*5.8:(Math.random()-0.5)*1.6,'#cfe0ff',(Math.random()-0.5)*1.2,1.4+Math.random(),0,0.22,0.05,12); } }});
  },
  /* on the roofs: a parapet along the back with a line of light on it, another line under the front lip, windows in
     the wall below; and standing about, water tanks, noodle bars, signs, aerials, lanterns, air-conditioners,
     chimneys, crates, dishes and puddles */
  decor(S,D,R){
    const r=R(), y=D.ty*8, bz=D.back*8, NE=TH.neons, kitchen=!!TH.kitchen, c0=NE[((D.x>>4)+D.ty)%NE.length];
    S.near.push([D.x*8,y,bz,8,2.2,1.4,'#262b55']);
    S.glow.push([D.x*8,y+2.2,bz+0.35,8,0.4,0.5,c0],[D.x*8,y-2.7,12.02,8,0.45,0.2,c0]);
    for(let wy=D.ty-1.1;wy>0.5;wy-=1.5) if(R()<0.38) S.soft.push([D.x+0.18+R()*0.2,wy,1.5,0.42,0.52,0.03,pick(R,neonWin)]);
    if(!D.free(2)) return;
    const x=D.jx(), open=D.open;
    if(r<0.03&&D.free(5)&&open) put(S.near,neonTankM(),x,y,D.zb(2.7,3.6));
    else if(r<(kitchen?0.1:0.065)&&D.free(4)&&open){ const z=D.zb(2.7,3.5); put(S.near,neonBarM(),x,y,z); put(S.glow,neonBarGlowM(pick(R,NE)),x,y,z);
      lamps.push({x:x/8,y:D.ty+1.3,z:z/8+1,col:'#ff9a6a',power:1.3,reach:7}); neonSteamAt.push([x/8+0.6,D.ty+1.05,z/8-0.1,2.2,0.15]); }
    else if(r<0.115&&D.free(4)&&open){ const z=D.zb(2.4,4.4), c=pick(R,NE); put(S.near,neonSignM(),x,y,z); put(S.glow,neonGlyphM((R()*4)|0,c,pick(R,NE)),x,y+9.6,z+0.65);
      lamps.push({x:x/8,y:D.ty+1.7,z:z/8+0.7,col:c,power:1.2,reach:6.5}); }
    else if(r<0.155&&D.free(4)&&open){ const z=D.zb(2,4.8), h=16+R()*9; put(S.near,neonAerialM(h),x,y,z); S.glow.push([x-0.5,y+h,z-0.5,1,1,1,'#ff3b4f']); }
    else if(r<0.215&&D.free(3)&&open){ const z=D.zb(1.5,4.4), c=kitchen?'#ff7a3d':pick(R,['#ff4f4f','#ff7a3d','#ff3fa4']); put(S.near,neonLampM(),x,y,z); put(S.glow,neonLampGlowM(c),x,y,z);
      lamps.push({x:x/8+0.4,y:D.ty+1.2,z:z/8,col:c,power:1.1,reach:6}); }
    else if(r<0.3) put(S.near,neonAcM(),x,y,D.zb(1.7,4.6));
    else if(r<0.345){ const z=D.zb(1.7,4.6); put(S.near,neonStackM(),x,y,z); neonSteamAt.push([x/8,D.ty+1.05,z/8,1.4,0.13]); }
    else if(r<0.39) put(S.near,dCrate(pick(R,['#5a648f','#7a5238','#434c80'])),x,y,D.zb(1.6,4.8));
    else if(r<0.425&&D.free(3)) put(S.near,dDish(),x,y,D.zb(1.8,4.8));
    else if(r<0.53){ const z=D.zb(1.3,4.6), w=3+R()*4; S.near.push([x-w/2,y,z-1.5,w,0.12,3,'#5868a8'],[x-w/2+0.6,y+0.12,z-0.9,w*0.4,0.05,1,'#8fa0e0']); }
    /* now and then a little bulb on the roof's front lip */
    if(R()<0.1) S.glow.push([D.jx(),y,D.zf()-0.4,0.7,0.7,0.7,pick(R,NE)]);
  }
};

/* 8-1: first rain. The roofs' alarms, one at a time: a single beam with a long wait, moving walkways, two beams out of
   step, the first Zapbot behind a block to hide by, and old signs that crumble over the canal. The last beam hangs
   over a walkway; a crumbling sign beside it is the way up onto its gantry. A pipe goes down to a boiler room. */
function w8l1(){
  const B=LevelBuilder(262,'neon');
  B.liquid(0.7).room(0,229).room(234,261,0,15,true);
  B.ground(0,40).ground(45,84).ground(97,140).ground(153,233);
  B.coins(7,3,3).row(12,5,'?M?').enemy('shellby',18).enemy('neonPigeon',23,6,{rx:2.5});
  /* the first alarm: one beam, on for a second and a half in every five */
  B.sign(26,'An alarm beam! It flickers before it fires. Wait for it to go out, then walk under.');
  B.fill(30,7,32,7,HARD).laser(31,7,'d',5,5,0,{duty:0.3}).coins(33,3,3);
  B.row(36,5,'B?B').enemy('shellby',38).arc(40,4,6);
  /* walkways: one that helps, one that has to be walked against */
  B.sign(47,'A moving walkway carries whoever stands on it. Run against it to stay where you are.');
  B.conveyor(50,59,1,1).coins(51,3,8).row(57,6,'I');
  B.conveyor(62,71,1,-1).row(65,5,'?B?').enemy('shellby',67).enemy('neonPigeon',69,8,{rx:3});
  B.enemy('fizzle',77).row(80,5,'?');
  /* a walkway from one building to the next, and the first spark over the middle of it */
  B.conveyor(85,96,1,1).coins(86,3,3).spark(90,5).coins(93,3,3);
  B.row(100,5,'BOB').enemy('fizzle',105);
  B.sign(107,'Two beams, out of step. There is room to wait between them.');
  B.fill(110,7,116,7,HARD).laser(111,7,'d',5,4,0,{duty:0.4}).laser(115,7,'d',5,4,2,{duty:0.4}).coins(112,3,3);
  B.checkpoint(120);
  /* the first Zapbot: its bolt stops at the two blocks, so behind them is safe */
  B.sign(123,'A Zapbot bleeps three times, then shoots straight across. Jump the bolt, or stomp the bot.');
  B.fill(127,2,127,3,HARD).coins(128,3,2).enemy('drone',132,4.5,{ry:2}).row(135,5,'?');
  B.sign(138,'These old signs crumble underfoot. Keep moving!');
  B.row(142,2,'KKK').row(146,3,'KKK').row(150,2,'KK').coins(142,4,3).coins(146,5,3).coins(150,4,2);
  B.row(156,5,'?B?').enemy('fizzle',160);
  B.warp(165,2,'in').enemy('neonPigeon',171,6,{rx:2.5}).warp(176,3,'out',true);
  B.enemy('drone',182,4.5,{ry:2});
  /* the last alarm, over a walkway that carries Blorp into it; the sign beside it is a step up to the gantry and the second spark */
  B.conveyor(188,197,1,1).row(189,4,'KKK').fill(193,7,195,7,HARD).laser(194,7,'d',5,3.6,0,{duty:0.4}).spark(194,9).coins(196,3,2);
  B.stairs(200,6).fill(206,2,206,7,HARD);
  B.goal(212);
  /* the boiler room: coins, a life, and a vent that lifts Blorp to a ledge and the third spark */
  B.fill(230,2,233,15,GROUND).fill(234,2,234,15,HARD).fill(261,2,261,15,HARD).ground(234,261);
  B.warp(236,2,'in',true).warp(257,2,'out').coinBox(240,3,245,4).row(241,6,'?L?');
  B.sign(247,'A vent! Step into the air and ride it up.');
  B.wind(249,2,250,9,0,125).coinCol(250,4,5).row(251,7,'====').coins(251,9,2).spark(253,9);
  return B.L;
}

/* 8-2: lift shafts, in the dead of night. Up the sides of the towers: a plain lift, a vent to ride, a weak vent that
   only a candyfloss Blorp can glide up, cannons, and lifts with a saw running the rail between them and the roof.
   A beam along the floor to hop, and the first storm cloud. Under the tallest tower there is a way back in. */
function w8l2(){
  const B=LevelBuilder(282,'neon',20);
  B.liquid(0.7);
  B.ground(0,36).ground(41,78).ground(83,130).ground(135,178).ground(187,281);
  B.coins(6,3,3).row(10,5,'?O?').enemy('rammy',19);
  B.sign(22,'A beam along the floor never goes out. Hop over it.');
  B.laser(26,2,'r',3,0).arc(26,3,5).row(32,5,'B?B').enemy('shellby',34);
  /* the first lift: it goes a tile higher than the roof it serves, so there is time to step off */
  B.sign(43,'A lift. Step on, ride it up, and step off at the top.');
  B.plat(47,2,3,'y',7,0.9).coinCol(48,4,4).ground(50,62,8).row(54,11,'?F?').enemy('shellby',59,8);
  /* the first vent */
  B.sign(64,'A vent blows straight up. Step in and ride the air.');
  B.wind(67,2,68,9,0,125).coinCol(67,4,5).ground(69,78,8);
  /* a weak vent: a glider goes up it, nobody else does, and the spark is at the top */
  B.sign(71,'A weak vent. Only a candyfloss Blorp can ride this one: hold {jump} and glide up.',8);
  B.wind(73,8,74,16,0,60).coinCol(73,11,5).spark(73,17,'fluff').row(76,11,'F').arc(78,8,5);
  /* cannons */
  B.sign(85,'A cannon! It fires rockets at you. Jump them, or bounce on one.');
  B.coins(88,3,3).cannon(93,2,3.2).row(97,5,'B?B').enemy('fizzle',101);
  /* a lift with a saw on the rail beside it: the saw never comes lower than head height, so the foot of the rail is safe */
  B.sign(105,'A saw runs the rail beside this lift. Jump across to the roof when the saw is out of the way.');
  B.plat(109,2,3,'y',8,0.8).coinCol(110,4,5).enemy('saw',112,4.4,{ry:8,sp:1.5}).ground(113,126,9);
  B.checkpoint(119,9).row(122,12,'?M?');
  B.sign(137,'A storm cloud follows you and drops bolts. Keep moving!');
  B.row(141,4,'===').coins(141,5,3).enemy('zappy',146,7.5,{rx:6}).row(152,5,'B?B').enemy('shellby',156);
  /* two cannons, one on the other, and a spark in plain sight above them */
  B.cannon(164,2,3.2).cannon(164,3,3.2,1.6).spark(164,7).enemy('neonPigeon',170,6,{rx:3}).row(174,5,'?');
  B.plat(180,2,3,'x',4,1).coins(182,4,3);
  B.row(190,5,'?O?').enemy('rammy',195);
  /* two vents, one above the other, to the top of the tallest tower */
  B.wind(199,2,200,7,0,125).coinCol(199,4,3).ground(201,208,6).enemy('fizzle',204,6);
  B.wind(207,6,208,12,0,125).coinCol(207,8,4).ground(209,220,11).row(213,14,'?L?').enemy('drone',217,12.5,{ry:1.5});
  /* under that tower, a passage open only at the far end: the third spark is at the back of it */
  B.clear(210,2,220,4).spark(211,3).coins(213,3,5);
  B.row(224,5,'B?B').enemy('shellby',228);
  /* the last lift hangs over the canal, and its saw comes all the way down */
  B.clear(232,0,235,1).plat(232,2,3,'y',6,0.9).enemy('saw',235,2.2,{ry:8,sp:1.4,phase:1.2}).ground(236,246,7).coins(238,8,3).row(240,10,'?');
  B.stairs(250,6).fill(256,2,256,7,HARD);
  B.goal(262);
  return B.L;
}

/* 8-3: alarm alley, in the sign district. Blocks sitting on the roof, some of which are Mimics; a corridor of beams that
   fire in a wave; a wall of red beams and the switch that puts it out, and a second switch that brings the red steps
   back; beams that shine up from posts in the floor. A pipe goes down to a vault full of blocks. */
function w8l3(){
  const B=LevelBuilder(276,'neon');
  B.liquid(0.7).room(0,243).room(248,275,0,15,true);
  B.ground(0,44).ground(49,100).ground(111,160).ground(165,247);
  B.coins(6,3,3).row(10,5,'?M?').enemy('fizzle',16);
  B.sign(19,'Blocks on the roof? Jump, then press {down} to pound them. But one of them is only pretending.');
  B.row(23,2,'?').row(26,2,'?').enemy('mimic',29).row(32,2,'?').row(37,5,'B?B').enemy('neonPigeon',41,7,{rx:2.5});
  /* the corridor: five beams, each on for 1.6 seconds in 4, each starting 0.8 after the one before */
  B.sign(51,'The alarm corridor. The beams fire in turn, left to right: follow the one that has just gone out.');
  B.fill(55,7,75,8,HARD);
  [0,3.2,2.4,1.6,0.8].forEach((ph,i)=>B.laser(57+i*4,7,'d',5,4,ph,{duty:0.4}));
  B.coins(58,3,3).coins(62,3,3).spark(67,5).coins(70,3,3);
  B.row(80,5,'?O?').enemy('shellby',85).row(89,2,'?').enemy('mimic',92).row(95,2,'?');
  /* a walkway between buildings, with a beam lying across it */
  B.conveyor(101,110,1,1).laser(105,2,'r',2,0).arc(104,4,5);
  B.checkpoint(114);
  B.row(118,5,'B?B').enemy('drone',124,4.5,{ry:2});
  /* the red wall. The first switch puts it out. Beyond it a second switch brings red back: the wall, and the red steps to the spark. */
  B.sign(128,'A wall of red beams. Bump the red switch from below to turn it off.');
  B.row(131,5,'X').fill(136,9,138,15,HARD);
  for(let x=136;x<=138;x++) B.laser(x,8,'d',6,0,0,{sw:'red'});
  B.row(142,5,'X').row(145,4,'RR').row(149,6,'RR').spark(150,9).enemy('fizzle',155).row(157,5,'?');
  /* posts in the floor, their beams out of step in pairs */
  B.sign(167,'These beams shine up from the floor. Hop each post while its beam is out.');
  B.laser(172,2,'u',6,3.2,0).laser(176,2,'u',6,3.2,1.6).laser(180,2,'u',6,3.2,0).laser(184,2,'u',6,3.2,1.6).coins(173,3,3).coins(177,3,3).coins(181,3,3);
  B.warp(190,2,'in').row(193,2,'?').enemy('mimic',195).warp(198,3,'out',true);
  B.row(203,5,'?M?').enemy('drone',207,5,{ry:2.5}).enemy('shellby',211);
  B.stairs(214,6).fill(220,2,220,7,HARD);
  B.goal(226);
  /* the vault: blocks to pound, two of them Mimics, and a ledge over them with the third spark */
  B.fill(244,2,247,15,GROUND).fill(248,2,248,15,HARD).fill(275,2,275,15,HARD).ground(248,275);
  B.warp(250,2,'in',true).warp(271,2,'out').row(255,2,'?').enemy('mimic',257).row(259,2,'?').row(261,2,'?').enemy('mimic',264).row(266,2,'?');
  B.row(258,5,'=====').coins(258,7,2).spark(260,8).coins(261,7,2);
  return B.L;
}

/* 8-4: stormfront. Everything the roofs have, in the wind and the lightning: a brick strongroom for a sunbloom's dash, a
   walkway under a beam, a lift and its saw, crumbling signs across the wide canal with a storm cloud overhead, a
   walkway to ride in step with the alarm, the red wall, a lift over the water, a vent to the highest roof, and signs
   all the way down again. A pipe goes down to the generator room. */
function w8l4(){
  const B=LevelBuilder(300,'neon',20);
  B.liquid(0.7).room(0,267).room(272,299,0,15,true);
  B.ground(0,30).ground(43,65).ground(66,80,9).ground(97,151).ground(156,170,9).ground(171,182,13).ground(199,271);
  B.coins(5,3,3).row(8,5,'O?O').enemy('shellby',13);
  /* the strongroom: over the top by the ledge, or straight through its brick door with a dash, to the spark inside */
  B.row(17,4,'==').fill(21,2,27,5,HARD).clear(22,2,26,4).fill(21,2,21,4,BRICK).coins(22,2,3).spark(25,3,'sun').coins(22,6,5);
  B.conveyor(31,42,1,1).fill(35,7,37,7,HARD).laser(36,7,'d',5,3.6,0,{duty:0.45}).coins(32,3,3).coins(38,3,4);
  B.row(46,5,'B?B').enemy('fizzle',50).cannon(56,2,3);
  B.plat(62,2,3,'y',8,0.9).coinCol(63,4,5).enemy('saw',65,4.4,{ry:8,sp:1.5});
  B.row(70,12,'B?B').enemy('drone',76,10.5,{ry:1.5});
  /* signs across the wide canal, each a step lower, and a storm cloud that follows */
  B.row(82,8,'KKK').row(87,7,'KKK').row(92,6,'KKK').coins(82,10,3).coins(87,9,3).coins(92,8,3).enemy('zappy',88,13.5,{rx:6});
  B.row(101,5,'?M?').enemy('rammy',106);
  /* the walkway runs at the speed the alarm's wave does: step on behind a beam that has just gone out, and stand still */
  B.sign(109,'Ride the walkway in step with the alarm.');
  B.conveyor(112,125,1,1).fill(113,7,124,7,HARD).laser(115,7,'d',5,3.75,0,{duty:0.4}).laser(119,7,'d',5,3.75,2.5,{duty:0.4}).laser(123,7,'d',5,3.75,1.25,{duty:0.4}).coins(116,3,3).coins(120,3,3);
  B.checkpoint(129);
  B.row(133,5,'X').enemy('drone',137,4.5,{ry:2}).fill(140,9,141,19,HARD).laser(140,8,'d',6,0,0,{sw:'red'}).laser(141,8,'d',6,0,0,{sw:'red'});
  B.row(144,5,'B?B').enemy('shellby',147);
  /* a lift over the water, a saw on the rail between it and the tower */
  B.plat(152,2,3,'y',8,0.9).coinCol(153,4,5).enemy('saw',155,2.4,{ry:8.5,sp:1.5,phase:2});
  B.enemy('shellby',161,9).row(163,12,'?').wind(169,9,170,14,0,125).coinCol(169,11,3);
  B.row(175,16,'?').cannon(180,13,3.2);
  /* down again by four signs; the spark hangs over the second */
  B.row(184,11,'KK').row(188,9,'KK').row(192,7,'KK').row(196,5,'KK').spark(188,13).enemy('neonPigeon',194,10,{rx:2});
  B.row(202,5,'?O?').enemy('shellby',206);
  B.warp(210,2,'in').enemy('fizzle',215).warp(220,3,'out',true);
  B.laser(226,2,'u',6,3.2,0).laser(230,2,'u',6,3.2,1.6).coins(227,3,3).enemy('drone',234,4.5,{ry:2});
  B.stairs(240,6).fill(246,2,246,7,HARD);
  B.goal(252);
  /* the generator room: a lift, a saw on its rail, and a ledge with the third spark */
  B.fill(268,2,271,19,GROUND).fill(272,2,272,19,HARD).fill(299,2,299,19,HARD).ground(272,299);
  B.warp(274,2,'in',true).warp(295,2,'out').coinBox(277,3,279,4);
  B.plat(281,2,3,'y',8,0.9).coinCol(282,4,5).enemy('saw',284,4.4,{ry:7,sp:1.4}).row(285,8,'=====').coins(285,10,2).spark(287,10).coins(288,10,2);
  return B.L;
}

/* 8-5: the kitchen roof, and Wokbot 3000. A short way in, past burners that flare in turn, a beam over a walkway, a lift
   that goes on up past its stop (stay on it for a spark), a vent to a ledge, a corridor of beams and the red wall.
   Then a checkpoint, a muffin, and the roof of the noodle tower, where the Wokbot is cooking. */
function w8l5(){
  const B=LevelBuilder(200,'neon');
  B.liquid(0.7);
  B.ground(0,34).ground(39,80).ground(64,80,8).ground(85,199);
  B.coins(6,3,3).row(10,5,'?O?').enemy('fizzle',15);
  B.sign(18,'The kitchen roof. The burners flare in turn: wait for the flame to drop.');
  B.jet(22,2,3,3).jet(26,2,3,3,1.5).coins(23,3,3).row(29,2,'?').enemy('mimic',31);
  B.conveyor(42,51,1,1).fill(45,7,47,7,HARD).laser(46,7,'d',5,3.6,0,{duty:0.4}).coins(43,3,2).spark(49,5);
  B.enemy('drone',56,4.5,{ry:2});
  /* the lift goes four tiles higher than the roof: step off for the way on, or ride to the top and jump for the spark */
  B.plat(60,2,3,'y',10,0.8).coinCol(61,4,4).coinCol(61,10,3).spark(61,14).enemy('saw',63,4.4,{ry:6,sp:1.5});
  B.row(68,11,'?M?').enemy('shellby',72,8).cannon(78,8,3.2);
  B.row(88,5,'B?B').enemy('fizzle',91);
  /* a vent on the way: walk through it, or let it carry Blorp up to a ledge and the third spark */
  B.wind(96,2,97,11,0,125).coinCol(96,4,5).row(98,9,'===').spark(99,11);
  B.enemy('zappy',103,7.5,{rx:4});
  B.fill(110,7,122,7,HARD).laser(112,7,'d',5,3.6,0,{duty:0.4}).laser(116,7,'d',5,3.6,2.4,{duty:0.4}).laser(120,7,'d',5,3.6,1.2,{duty:0.4}).coins(113,3,3).coins(117,3,3);
  B.jet(128,2,3,3).jet(132,2,3,3,1).jet(136,2,3,3,2).coins(129,3,3).coins(133,3,3);
  B.row(142,5,'X').fill(147,9,148,15,HARD).laser(147,8,'d',6,0,0,{sw:'red'}).laser(148,8,'d',6,0,0,{sw:'red'});
  B.checkpoint(153).row(158,5,'?M?');
  /* the arena: flat, 26 wide, a kerb at the near end and a wall at the far one */
  B.fill(166,2,166,2,HARD).fill(194,2,194,12,HARD);
  B.boss(188,168,193,12,'wokbot');
  return B.L;
}

/* ---------- the island on the map ---------- */
function neonMapTowerM(h,c){ const d=shade(c,0.78); return [[-2.6,0,-2.6,5.2,h,5.2,c],[-3,h,-3,6,0.6,6,d],[-0.3,h+0.6,-0.3,0.6,3,0.6,'#6f7bb0'],[0.8,h+0.6,-1.8,1.6,1.1,1.6,d]]; }
function neonMapTowerGlowM(h,c,R){ const b=[[-2.9,0.8,2.5,0.4,h-1.6,0.3,c],[-0.4,h+3.6,-0.4,0.8,0.8,0.8,'#ff3b4f']];
  for(let y=1.4;y<h-1.4;y+=2.1) for(let i=0;i<3;i++){ if(R()<0.6) b.push([-1.9+i*1.5,y,2.6,0.9,1.1,0.12,pick(R,neonWin)]); if(R()<0.5) b.push([2.6,y,-1.9+i*1.5,0.12,1.1,0.9,pick(R,neonWin)]); }
  return b; }
/* the noodle tower: a podium, a shaft of five floors, a deck, and on a stand above it the bowl */
function neonMapNoodleM(){ const c='#3d4577',d='#2a2f58',k='#1d2140', b=[[-10,0,-10,20,2.4,20,d],[-6.5,2.4,-6.5,13,23,13,c],[-8.5,25.4,-8.5,17,1.4,17,d],[-1.2,26.8,-1.2,2.4,3.4,2.4,'#6f7bb0'],
    [-4.5,5.6,6.5,9,1,2.2,'#c93d3d'],[-4.5,5.2,8.3,9,0.5,0.4,'#fff2e0'],[7,26.8,5,0.5,5,0.5,'#6f7bb0'],[-7.6,26.8,-7.2,3,2.2,3,'#5a648f']];
  for(let i=1;i<5;i++) b.push([-6.9,5.8+i*4,-6.9,13.8,0.5,13.8,k]); return b; }
function neonMapNoodleGlowM(){ const p='#ff3fa4',w='#ffe9a0', b=[[-3,30.2,-3,6,1,6,p],[-5,31.2,-5,10,2.6,10,p],[-5.8,33.8,-5.8,11.6,0.9,11.6,'#ff9ad0'],[-4.6,34.7,-4.6,9.2,0.7,9.2,w],[1,35.2,-0.6,6.5,0.5,0.5,'#fff2c2'],[1,35.2,0.8,6.5,0.5,0.5,'#fff2c2'],
    [6.5,4,3.6,0.5,18,2.4,'#3ff0ff'],[-1.5,2.4,6.5,3,2.8,0.15,'#ffd27a'],[6.9,31.8,4.9,0.7,0.7,0.7,'#ff3b4f'],[-10,2.4,9.6,20,0.3,0.4,p],[-10,2.4,-10,0.4,0.3,19.6,'#3ff0ff'],[9.6,2.4,-10,0.4,0.3,19.6,'#3ff0ff']];
  for(let j=0;j<5;j++) for(let i=0;i<3;i++){ if((i+j*2)%5!==3&&j>0) b.push([-4.9+i*3.6,6.8+j*4,6.5,2.4,2.2,0.15,w]); if(i<2&&(i+j)%3!==2) b.push([6.5,6.8+j*4,-4.9+i*3.6,0.15,2.2,2.4,w]); }
  return b; }
defWorld({name:'Neon Noodletown',theme:'neon',levels:[w8l1,w8l2,w8l3,w8l4,w8l5],
  map:{
    /* dark slate, wet, with lines of light laid along it */
    ground:(h,p)=>[p<0.3?['#3d4577','#394070']:['#333a66','#2f3560'],['#23274a','#1d2140']],
    pond:['#2a3a8a','#1a2466','#0c1236'],
    scatter(M,c){ const r=c.r, R=c.R, NE=['#ff3fa4','#3ff0ff','#ffe14d'];
      if(r<0.15&&c.clear(2.4)){ const h=9+((c.r2*9)|0), nc=pick(R,NE); M.put(M.land,neonMapTowerM(h,pick(R,['#3a4170','#2f3560','#454d86'])),c.x,c.y,c.z,0.8); M.put(M.glow,neonMapTowerGlowM(h,nc,R),c.x,c.y,c.z,0.8);
        if(c.r2<0.35) M.lamp(c.x,c.y+0.6,c.z+0.5,neonHex(nc),1.1,5); }
      else if(r<0.23&&c.clear(1.5)){ const nc=pick(R,NE); M.put(M.land,neonSignM(),c.x,c.y,c.z,0.42); M.put(M.glow,neonGlyphM((R()*4)|0,nc,pick(R,NE)),c.x,c.y+9.6*0.42*S8,c.z+0.65*0.42*S8,0.42); }
      else if(r<0.3) M.put(M.land,neonAcM(),c.x,c.y,c.z,0.5);
      else if(r<0.36&&c.clear(1.2)){ M.put(M.land,neonLampM(),c.x,c.y,c.z,0.5); M.put(M.glow,neonLampGlowM('#ff4f4f'),c.x,c.y,c.z,0.5); }
      else if(r<0.64){ const nc=NE[(c.cx+c.cz)%3]; if(c.r2<0.5) M.glow.push([c.cx+0.03,c.y+0.004,c.cz+0.45,0.94,0.035,0.1,nc]); else M.glow.push([c.cx+0.45,c.y+0.004,c.cz+0.03,0.1,0.035,0.94,nc]); }
      if(r>0.93) M.mote({kind:2,x:c.x,y:c.y+0.9+c.r2,z:c.z,col:'#cfe0ff',size:0.04,span:0.4,rate:0.8}); },
    /* the noodle tower, its bowl alight and steaming */
    landmark(M,x,y,z){ M.put(M.land,neonMapNoodleM(),x,y,z,1); M.put(M.glow,neonMapNoodleGlowM(),x,y,z,1);
      for(let i=0;i<3;i++) M.smoke({x:x-0.3+i*0.3,y:y+35.4*S8,z:z,col:'#eef2ff',size:0.3,rise:1.5,drift:0.5,rate:0.24,ph:i/3});
      M.lamp(x,y+1,z+1.6,0xffd27a,1.4,6); M.lamp(x,y+4.2,z+0.9,0xff3fa4,1.6,7); }
  }});
