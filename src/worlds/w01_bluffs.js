/* ================= World 1: Blossom Bluffs ================= */
/* A garden on a hillside in spring: cherry trees shedding petals, red gates, stone lanterns, a river far below. The
   world that teaches the moves, old and new: drums to bounce on, a fountain to ride, the sunbloom and its dash. A fall
   lands in the river, which can be swum out of. */

/* ---------- the tune ---------- */
/* @song */
/* G major, on five notes, in no hurry: a plucked koto carries the tune in the middle of its range over a second koto's
   ripples, a flute holds long notes a little above, and two drums and a wood block keep time. */
SONGS.bluffs=(()=>{
  const h='D4 . E4 G4 A4 - G4 E4  D4 - B3 . D4 - . .  E4 . G4 A4 B4 - A4 G4  A4 - E4 . G4 - . . ';
  const a=h+'B4 . A4 G4 E4 - G4 A4  B4 - D5 . B4 - . .  A4 . G4 E4 D4 - E4 G4  A4 - - . D4 E4 G4 A4 ';
  const a2=h+'B4 . D5 E5 D5 - B4 A4  G4 - A4 . B4 - . .  A4 . G4 E4 D4 . E4 .  G4 - - . . D4 E4 G4 ';
  const b='E5 - - D5 B4 - A4 .  G4 - A4 - B4 - - .  D5 - - B4 A4 - G4 .  E4 - G4 - A4 - - .  E5 - - D5 B4 - D5 .  E5 - G5 - E5 - - .  D5 . B4 . A4 . G4 .  A4 - - - D4 E4 G4 A4 ';
  const ch='G G Em Em C C D D  G G Em Em C D G G  C C G G Am Am D D7  G G Em Em C D G G';
  return song({key:'G major',bpm:122,ec:0.75,fb:0.3},
    [{w:'triangle',v:0.13,h:3,g:0.85,lp:[7,1.6],e:1,r:0.3,pan:-0.15},a+a2+b+a2],
    [{w:'triangle',v:0.055,h:2,g:0.5,pan:0.3},musArp(ch,8,'1 5 8 5 3^ 5 8 5','G3')],
    [{w:'sine',v:0.045,vib:14,s:0.9,a:0.1,g:1,r:0.6,pan:0.2},musArp(ch,8,'3 - - - 5 - - -','D4')],
    [{w:'triangle',v:0.24,g:0.8},musArp(ch,8,'1 . . 5 1 . 5 .','E2')],
    [{dr:1,v:0.8},'l . r . m . r r  l . r w m . m . '.repeat(15)+'l . r . m . r r  l l m m l m w w']);
})();
/* @endsong */

/* ---------- models ---------- */
function dSakura(R){ const t='#7a4a3a',t2='#5f372b', p=['#ffb7d5','#ff9cc4','#ffd0e4','#ffe6f0'], b=[]; let x=0; const n=5+((R()*2)|0), lean=(R()-0.5)*1.4;
  for(let i=0;i<n;i++){ b.push([x-1.3,i*3,-1.2,2.6,3,2.4,i%2?t:t2]); x+=lean*(i>1?0.7:0.2); }
  const top=n*3;
  b.push([x-1,top,-1,2,2,2,t],[x+0.5,top-2,-0.6,4,1.2,1.2,t2],[x-4.5,top-3.5,-0.6,4,1.2,1.2,t2]);
  for(let i=0;i<9;i++){ const a=i/9*6.283+R(), r=3+R()*4.5, s=4+R()*3; b.push([x+Math.cos(a)*r-s/2,top-2+R()*5,Math.sin(a)*r*0.7-s/2,s,s*0.7,s,pick(R,p)]); }
  b.push([x-4.5,top+1,-4,9,4.5,8,p[0]],[x-3,top+5.5,-3,6,2.5,6,p[2]]);
  return b; }
function dTorii(){ const r='#e8473f',d='#a82c30',k='#2c2447'; return [[-7,0,-1,2,16,2,r],[5,0,-1,2,16,2,r],[-7.4,0,-1.4,2.8,1.6,2.8,k],[4.6,0,-1.4,2.8,1.6,2.8,k],[-9,12,-1,18,1.6,2,r],[-10.5,15.6,-1.4,21,2,2.8,d],[-11.5,17.6,-1.6,2,1,3.2,d],[9.5,17.6,-1.6,2,1,3.2,d],[-1,13.6,-0.8,2,2,1.6,r]]; }
function dStoneLantern(){ const s='#c4bfd0',d='#948fa6'; return [[-2,0,-2,4,1,4,d],[-0.8,1,-0.8,1.6,4,1.6,s],[-1.8,5,-1.8,3.6,0.8,3.6,d],[-1.4,5.8,-1.4,2.8,2.4,2.8,s],[-2.4,8.2,-2.4,4.8,0.8,4.8,d],[-1.4,9,-1.4,2.8,0.8,2.8,s],[-0.5,9.8,-0.5,1,0.8,1,d]]; }
function dBamboo(R){ const g='#6fc45a',d='#4a9a48',l='#a8ec8a', b=[]; for(let i=0;i<3+((R()*2)|0);i++){ const x=(i-1.5)*1.6+R(), z=R()*2-1, h=10+R()*9;
    for(let y=0;y<h;y+=3) b.push([x,y,z,0.9,2.8,0.9,(y/3|0)%2?g:d]); b.push([x-1.6,h-1,z-0.4,2,0.5,1.4,l],[x+0.6,h-2.4,z-0.4,2,0.5,1.4,l],[x-0.4,h,z-0.6,1.6,0.5,1.8,l]); } return b; }
function dAzalea(c){ const g='#4fae5a',l='#62c26a'; return [[-2.5,0,-2,5,2.6,4,g],[-1.8,2.6,-1.4,3.6,1.2,2.8,l],[-2.2,1.4,2,1,1,0.2,c],[0.6,1.8,2,1,1,0.2,c],[-0.8,3.2,1.4,1,1,0.2,c],[1.8,0.8,2,0.8,0.8,0.2,shade(c,1.15)],[-2.6,2.2,-0.4,0.2,1,1,c],[2.4,1.6,0.4,0.2,1,1,c]]; }
function dTeaHouse(){ const w='#f4e9dc',r='#c93d3d',d='#8a2630',k='#5f372b'; return [[-9,0,-6,18,1.4,12,k],[-8,1.4,-5,16,9,10,w],[-8,1.4,5,2,9,0.3,k],[6,1.4,5,2,9,0.3,k],[-2.5,1.4,5,5,7,0.3,'#e8c58a'],[-0.2,1.4,5.2,0.4,7,0.15,k],[-2.5,4.6,5.2,5,0.4,0.15,k],
  [-11,10.4,-8,22,1.2,16,r],[-9.5,11.6,-6.5,19,1.2,13,d],[-7,12.8,-4.5,14,1.2,9,r],[-4,14,-2.5,8,1,5,d],[-12,10,-8.6,2,0.8,2,d],[10,10,-8.6,2,0.8,2,d],[-12,10,6.6,2,0.8,2,d],[10,10,6.6,2,0.8,2,d]]; }
function dPetalPile(){ return [[-2,0,-1.5,4,0.5,3,'#ffc2dc'],[-1,0.5,-0.8,2.2,0.4,1.8,'#ffe3ef']]; }
function mKoi(){ return mSnapper('#ff8a3d','#fff2e0'); }
/* a butterfly: two wings hinged on a body, for the scenery to flap */
function mFlutter(c,sx){ return sx>0?[[0,-1.5,-0.1,3,3,0.2,c],[0.5,-0.8,0.1,1.4,1.4,0.1,shade(c,1.3)]]:[[-3,-1.5,-0.1,3,3,0.2,c],[-1.9,-0.8,0.1,1.4,1.4,0.1,shade(c,1.3)]]; }

THEMES.bluffs={ music:'bluffs', air:'birds',
  sky:['#4f9ff0','#b9e0ff','#ffe6ef'], skyMid:0.5, glowCol:0xfff1c8, sunGlow:0.9, cloud:0.5, cloudShade:'#f6cfe0', cloudY:0.68, spokes:0.5,
  fog:0xf2deee, fogNear:18, fogFar:150,
  hemiSky:0xffffff, hemiGround:0xe2c8d6, hemiI:0.62, sunI:0.7, sunCol:0xfff1dc, sunDir:[-0.45,0.76,0.5],
  top:'#7fd66a', topS:['#93e07c','#6cc45a','#88da72','#a2e88a'], dirt:'#b9845a', dirtS:['#a97650','#c9966a','#9a6a48'], cap:'#7fd66a', capL:'#b0f090', capD:'#4a9a48',
  brick:['#e8786a','#b04a44','#ffb0a0'], hard:['#d9d0c4','#f6f0e8','#9a8f84'], pipe:['#6fc45a','#c2f0a0','#3f8a3a','#1f4a22'],
  semi:'bamboo', plat:['#e8504a','#a82c30'], dust:'#ffe3ef', back:-6, fringe:['#8fe07a','#6cc45a','#ffc2dc','#a2e88a'],
  liquid:{kind:'water',a:'#3a9fd6',b:'#eafcff',op:0.8,far:70}, pool:{kind:'water',a:'#48b4e0',b:'#eafcff',op:0.58},
  bounce:{kind:'drum',cols:['#e8504a','#ffd9a0','#8a2630']}, bounceCol:'#ffe3ef', geyser:['#9fdcff','#f0fdff'],
  disc:['#ffe14d','#fff3a0','#e08a12'], bloom:0.9, hi:0.14, rays:0.3, grade:{shadow:[0.97,0.95,1.05],high:[1.04,1.01,0.97]},
  skins:{snapper:mKoi},
  looks:[null,
    {sky:['#58a8f4','#c4e6ff','#fff0e6'],fog:0xf6e6f0,cloud:0.62},
    {sky:['#3f8fe8','#a6d4fa','#ffeccc'],fog:0xf0e2d8,sunCol:0xffecc8,sunDir:[-0.55,0.66,0.5],cloud:0.4,grade:{shadow:[0.97,0.97,1.04],high:[1.05,1.02,0.95]}},
    {sky:['#e87a8a','#ffb890','#ffe9b8'],fog:0xffd2c0,sunCol:0xffc49a,hemiSky:0xffe2d6,glowCol:0xffa060,sunDir:[-0.68,0.44,0.5],disc:['#ff9a3d','#ffd27a','#b3520f'],cloudCol:'#ffe3c9',cloudShade:'#f09a8a',rays:0.5,
      liquid:{kind:'water',a:'#5a8fd0',b:'#ffd9b8',op:0.8,far:70},grade:{shadow:[1.0,0.93,1.04],high:[1.08,1.0,0.92]}},
    {sky:['#2b2a78','#8a5aa8','#ffa98a'],fog:0xb890b8,sunCol:0xd6b8ff,hemiSky:0xe6d6ff,hemiGround:0x9a88b8,hemiI:0.5,sunI:0.5,glowCol:0xffc0e0,sunDir:[-0.6,0.5,0.5],stars:0.7,shoot:1,sunGlow:0.45,disc:['#fff6e0','#fffdf2','#c9b8e0'],cloud:0.35,cloudCol:'#c9a8e0',cloudShade:'#7a5aa0',rays:0.18,
      liquid:{kind:'water',a:'#3a4fa8',b:'#ffc2e6',op:0.82,far:70},lit:true,grade:{shadow:[0.92,0.94,1.12],high:[1.06,1.0,1.0]}}],
  /* the far view: hills of cherry trees, a snow-capped mountain, a pagoda on a rise, gates and big trees in the middle
     distance, butterflies, and petals on the wind near and far */
  scenery(S,R){
    const W=S.W, far=S.far, lit=!!TH.lit;
    /* the mountain, once, a long way back */
    { const x=W*0.35+R()*W*0.3, z=-96, w=70, h=30, n=10; for(let k=0;k<n;k++){ const ww=w*Math.pow(1-k/n,1.25); far.push([x-ww/2,k*h/n-2,z-3,ww,h/n,6,k>=n-3?'#ffffff':k%2?'#9aa9e0':'#8d9cd6']); } }
    for(let x=-60;x<W+60;x+=22+R()*24){ const z=-40-R()*38, w=16+R()*18, top=4+R()*7;
      hill(far,x,top,z,w,pick(R,['#6fcf7a','#62c26f','#7ed98a']),R,false);
      for(let k=0;k<4;k++){ const px=x+(R()-0.5)*w*0.5, s=2.4+R()*2; far.push([px-0.25,top-1,z,0.5,2,0.5,'#7a4a3a'],[px-s/2,top+0.6,z-s/2,s,s*0.7,s,pick(R,['#ffb7d5','#ff9cc4','#ffd0e4'])]); } }
    /* pagodas on their own rises */
    for(let i=0;i<Math.max(1,Math.round(W/150));i++){ const x=W*(0.2+0.6*R()), z=-34-R()*10, y=5+R()*3; hill(far,x,y,z,14,'#62c26f',R,false);
      for(let k=0;k<4;k++){ const s=5-k*0.9; far.push([x-s/2,y+k*2.6,z-s/2,s,1.9,s,'#f4e9dc'],[x-s/2-0.9,y+k*2.6+1.9,z-s/2-0.9,s+1.8,0.5,s+1.8,'#c93d3d'],[x-s/2-0.4,y+k*2.6+2.4,z-s/2-0.4,s+0.8,0.3,s+0.8,'#8a2630']); }
      far.push([x-0.2,y+10.4,z-0.2,0.4,2.4,0.4,'#ffc928']); S.glowFar.push([x-0.5,y+0.5,z+2.55,1,1.1,0.1,'#ffe9a0']); if(lit) for(let k=1;k<4;k++) S.glowFar.push([x-0.4,y+k*2.6+0.5,z+(5-k*0.9)/2+0.05,0.8,0.9,0.1,'#ffd27a']); }
    /* big cherry trees and gates on the far bank of the river, where the water can show them twice */
    for(let x=-20;x<W+20;x+=11+R()*13){ const z=-9-R()*7;
      if(R()<0.3) put(S.near,scaled(dTorii(),1.3),x*8,(L.liquidY+0.2)*8,z*8);
      else put(S.flora,scaled(dSakura(R),1.5),x*8,(L.liquidY+0.2)*8,z*8,0.25);
      far.push([x-5,L.liquidY-1.5,z-3,10,1.8,6,'#7fd66a']); }
    for(let x=-50;x<W+50;x+=12+R()*12) S.addCloud(x,9+R()*8,-34-R()*40,R,TH.cloudCol&&mixc(TH.cloudCol,'#ffffff',0.5));
    skyDisc(TH.disc,null,14.5);
    S.addWeather('petal'); S.addWeather('petal',{n:12,z:6,size:[0.26,0.18],box:[46,18,4]});
    for(let x=10;x<W;x+=13+R()*14) S.addShaft(x,5+R()*3,-3.5-R()*2,2.2+R()*2,9,TH.lit?'#d6b8ff':'#fff1c8',-0.42);
    /* butterflies about the lane */
    for(let i=0;i<Math.ceil(W/26);i++){ const c=pick(R,['#ffe14d','#ff8fc7','#7fdcff','#ffffff','#ff9a3d']), g=new T.Group(), wl=new T.Mesh(geo('flutL'+c,()=>mFlutter(c,-1)),MAT.vox), wr=new T.Mesh(geo('flutR'+c,()=>mFlutter(c,1)),MAT.vox);
      g.add(wl,wr); const x0=R()*W, y0=3.5+R()*4, z=-1.6-R()*2.6, ph=R()*9, sp=0.5+R()*0.5; g.position.set(x0,y0,z); g.scale.setScalar(0.5); world.add(g);
      critters.push({tick(dt,time){ g.position.x=x0+Math.sin(time*sp+ph)*3; g.position.y=y0+Math.sin(time*sp*2.3+ph)*0.6; g.rotation.y=Math.cos(time*sp+ph)>0?0.5:-0.5; const f=Math.sin(time*16+ph)*1.1; wl.rotation.y=f; wr.rotation.y=-f; }}); }
  },
  /* on the grass: cherry trees, bamboo, lanterns that light up at dusk, a tea house now and then, azaleas and petals */
  decor(S,D,R){
    const r=R(), y=D.ty*8, lit=!!TH.lit;
    if(D.wet) return;
    if(r<0.085&&D.free(7)&&D.open) put(S.flora,dSakura(R),D.jx(),y,D.zb(2.8,5),0.3);
    else if(r<0.13&&D.free(5)&&D.open) put(S.flora,dBamboo(R),D.jx(),y,D.zb(2.4,5.2),0.7);
    else if(r<0.165&&D.free(3)){ const x=D.jx(), z=D.zb(1.6,4.4); put(S.near,dStoneLantern(),x,y,z); S.glow.push([x-0.9,y+6.2,z+1.4,1.8,1.6,0.15,lit?'#ffe9a0':'#fff6d9']); if(lit) lamps.push({x:x/8,y:D.ty+0.9,z:z/8+0.4,col:0xffd27a,power:1.3,reach:7}); }
    else if(r<0.18&&D.free(6)&&D.open) put(S.near,dTorii(),D.jx(),y,D.zb(3.4,4.6));
    else if(r<0.195&&D.free(5)&&D.open){ const x=D.jx(), z=D.zb(4,4.8); put(S.near,dTeaHouse(),x,y,z); if(lit){ S.glow.push([x-2.5,y+1.4,z+5.1,5,7,0.1,'#ffd27a']); lamps.push({x:x/8,y:D.ty+0.8,z:z/8+1.2,col:0xffc060,power:1.5,reach:8}); } }
    else if(r<0.3) put(S.near,dAzalea(pick(R,['#ff8fc7','#ff5fa2','#ffffff','#ffb347'])),D.jx(),y,D.zb(1.3,5.2));
    else if(r<0.42) put(S.flora,dFlower(pick(R,['#ff8fc7','#ffe14d','#ffffff','#b58cff'])),D.jx(),y,D.zb(1.2,5.4),1.2);
    else if(r<0.5) put(S.near,dRock(pick(R,['#c4bfd0','#aaa5ba'])),D.jx(),y,D.zb(1.2,5));
    else if(r<0.6) put(S.near,dPetalPile(),D.jx(),y,D.zb(1.2,5.4));
    const f=R();
    if(f<0.14) put(S.near,dPetalPile(),D.jx(),y,D.zf());
    else if(f<0.24) put(S.flora,dFlower(pick(R,['#ff8fc7','#ffffff','#ffe14d'])),D.jx(),y,D.zf(),1);
  }
};

/* 1-1: a first walk in the garden. Running and jumping, a drum to bounce on, two posts to kick up between, a pond to swim,
   a frog to hop over, and a pipe down to a hidden grove. */
function w1l1(){
  const B=LevelBuilder(254,'bluffs');
  B.room(0,221).room(226,253,0,15,true);
  B.ground(0,52).ground(56,112).ground(117,172).ground(177,225);
  B.sign(6,'Hold {run} to run. Hold {jump} longer to jump higher.');
  B.coins(10,3,3).row(15,5,'?').enemy('blob',20);
  B.row(24,5,'B?BMB').row(26,9,'?').enemy('blob',30).enemy('puff',35,6,{rx:3});
  /* the first drums: a hop gets nowhere, a held jump gets the ledge and its spark */
  B.sign(39,'A drum! Land on it to bounce. Hold {jump} as you land to bounce high.');
  B.row(42,2,'JJ').coinCol(42,5,3).coinCol(43,5,3).row(45,9,'=====').coins(45,10,5).spark(49,11);
  B.arc(51,4,6);
  B.sign(59,'In the air, push against a wall and press {jump} to kick off it.');
  B.fill(62,4,62,11,HARD).fill(66,4,66,11,HARD).coinCol(64,4,6).row(68,8,'==').coins(68,9,2);
  B.row(72,5,'?B?').enemy('ribbit',77).sign(73,'A frog has a long tongue. Hear the croak, then jump.');
  /* the pond: up three steps, a swim, and out the other side; the second spark is under a stone shelf */
  B.stairs(81,3).ground(84,104,5).clear(87,2,101,4).water(87,2,101,4).stairs(105,3,-1);
  B.sign(85,'Under water, tap {jump} to swim up. At the top, {jump} leaps out.',5);
  B.coins(89,3,4).coins(96,2,4).fill(93,3,95,3,HARD).spark(94,2).row(90,8,'===').coins(90,9,3);
  B.checkpoint(110);
  B.enemy('snapper',114.5,2,{rise:4});
  /* a drum hit by a ground pound throws Blorp higher than anything: the third spark is up there */
  B.row(120,5,'B?B').enemy('blob',123).enemy('puff',127,5,{rx:3});
  B.sign(130,'Press {down} in the air for a ground pound. Pound a drum, and up you go!');
  B.row(133,2,'J').row(134,2,'J').coinCol(133,6,3).coinCol(134,9,3).spark(134,14).row(137,10,'===').coins(137,11,3);
  B.pipe(141,3,true).row(146,5,'?B?').enemy('shellby',149).enemy('blob',153);
  B.sign(155,'A pipe with arrows goes somewhere. Stand on it and press {down}.');
  B.warp(158,2,'in').warp(167,3,'out',true).enemy('ribbit',163);
  B.enemy('snapper',174.5,2,{rise:4,phase:0.6});
  B.row(180,5,'B?B?B').row(182,9,'O').enemy('blob',183).enemy('puff',187,6,{rx:3}).enemy('shellby',191);
  B.stairs(196,6).fill(202,2,202,7,HARD);
  B.goal(208);
  /* the hidden grove */
  B.fill(222,2,225,15,GROUND).fill(226,2,226,15,HARD).fill(253,2,253,15,HARD).ground(226,253);
  B.warp(228,2,'in',true).coinBox(232,3,239,5).row(233,8,'?L?').row(241,2,'J').coinCol(241,5,5).row(243,9,'===').coins(243,10,3).warp(249,2,'out');
  return B.L;
}

/* 1-2: the drum garden. Rows of drums over the river, Petalpuffs to bounce off between them, and the first sunbloom,
   with a wall of bricks to try its dash on. */
function w1l2(){
  const B=LevelBuilder(250,'bluffs');
  B.room(0,221).room(224,249,0,15,true);
  B.ground(0,24).ground(44,70).ground(74,118).ground(140,223);
  B.coins(6,3,3).row(10,5,'?M?').enemy('blob',14).enemy('ribbit',20);
  /* drums on posts over the water */
  B.sign(22,'Bounce from drum to drum. Hold {jump} for the far ones.');
  B.fill(27,0,28,3,HARD).row(27,4,'JJ').fill(33,0,34,3,HARD).row(33,4,'JJ').fill(39,0,40,3,HARD).row(39,4,'JJ');
  B.coins(30,8,2).coins(36,8,2).row(35,12,'==').spark(35,13).enemy('snapper',31,2,{rise:3.5}).enemy('snapper',37,2,{rise:3.5,phase:0.8});
  B.row(47,5,'B?B').enemy('shellby',50).enemy('blob',54).pipe(58,2,true);
  B.row(62,4,'==').row(66,6,'==').coins(62,5,2).coins(66,7,2).enemy('puff',69,8,{rx:3});
  /* the sunbloom, and what its dash is for */
  B.row(78,5,'BOB').sign(76,'A sunbloom! In sun form, press {run} to dash. A dash goes through bricks, and through monsters.');
  B.enemy('blob',83).enemy('blob',85).enemy('blob',87);
  B.fill(91,2,92,4,BRICK).coins(94,3,4).row(96,5,'?');
  /* a brick-walled cell holds the second spark: dash in, or drop through the gap in the roof and climb out by the step */
  B.fill(100,2,100,4,BRICK).fill(104,2,104,4,HARD).fill(100,5,104,5,HARD).clear(102,5,102,5).row(103,2,'H').spark(101,3).coins(101,2,2);
  B.checkpoint(109);
  B.row(112,5,'?B?').enemy('ribbit',115);
  /* the long crossing: drums, a sliding ledge, and puffs to hop along */
  B.fill(121,0,122,2,HARD).row(121,3,'JJ').plat(125,5,3,'x',5,1.2).fill(135,0,136,2,HARD).row(135,3,'JJ');
  B.enemy('puff',128,8,{rx:2}).enemy('puff',132,9,{rx:2}).coins(126,7,3).arc(129,10,5).enemy('snapper',131.5,2,{rise:4});
  B.row(143,5,'B?B').enemy('blob',146).enemy('shellby',150);
  B.warp(154,2,'in').enemy('blob',159).enemy('puff',162,5,{rx:3}).warp(166,3,'out',true);
  B.row(171,5,'?M?').row(172,9,'L').enemy('ribbit',175).pipe(180,3,true);
  B.row(185,4,'==').row(189,6,'==').coins(185,5,2).coins(189,7,2).enemy('puff',192,8,{rx:2});
  B.stairs(196,6).fill(202,2,202,7,HARD);
  B.goal(208);
  /* a drum room at the far end of the pipe: the spark is at the top of it */
  B.fill(222,2,223,15,GROUND).ground(224,249).fill(224,2,224,15,HARD).fill(249,2,249,15,HARD);
  B.warp(226,2,'in',true).warp(245,2,'out').row(231,2,'JJ').row(235,7,'===').row(240,2,'J').coinCol(231,5,4).coins(235,8,3).row(237,12,'==').spark(237,13).coinCol(240,5,4);
  return B.L;
}

/* 1-3: the fountain terraces. The garden climbs: fountains to ride up, posts to kick between, and a tea-house roof
   with a spark on it. */
function w1l3(){
  const B=LevelBuilder(240,'bluffs',20);
  B.ground(0,40).ground(44,90).ground(95,117).ground(133,150).ground(155,239);
  B.coins(6,3,3).row(10,5,'B?B').enemy('blob',14).enemy('puff',18,6,{rx:3});
  B.sign(21,'A fountain will not hurt you. Ride it up, and jump from the top.');
  B.geyser(25,2,7,4.5).ground(28,40,8).coinCol(25,4,5).row(31,11,'?M?').enemy('ribbit',35,8).enemy('blob',38,8);
  B.arc(41,9,5);
  B.fill(44,2,50,6,GROUND).enemy('shellby',47,7).row(53,5,'B?B').enemy('blob',57);
  /* a tall post: the fountain beside it only goes halfway, the rest is a kick; the spark hangs at the very top */
  B.geyser(62,2,5,4.5,1).fill(65,2,65,13,HARD).fill(61,7,61,14,HARD).coinCol(63,8,5).spark(63,15).ground(66,78,11);
  B.row(69,14,'?L?').enemy('puff',72,14,{rx:3}).enemy('ribbit',75,11);
  B.fill(79,2,80,8,HARD).fill(81,2,82,5,HARD).coins(79,9,2).coins(81,6,2);
  B.row(86,5,'?B?').enemy('blob',88).enemy('snapper',92.5,2,{rise:4});
  B.checkpoint(98);
  B.row(102,5,'BOB').enemy('blob',106).enemy('blob',108).pipe(112,2,true);
  /* three fountains on posts in the river, out of step with one another; the one in the middle reaches a ledge */
  B.ground(120,120).ground(125,125).ground(130,130);
  B.geyser(120,2,5,4,0).geyser(125,2,6,4,1.3).geyser(130,2,5,4,2.6).coinCol(120,4,3).coinCol(125,4,4).coinCol(130,4,3).row(124,11,'===').spark(124,12).enemy('snapper',122.5,2,{rise:3.5}).enemy('snapper',127.5,2,{rise:3.5,phase:0.9});
  B.row(138,5,'?B?').enemy('shellby',141).enemy('ribbit',146).arc(150,4,6);
  B.row(158,5,'B?B').enemy('blob',161).enemy('puff',165,6,{rx:3});
  /* the tea-house roof: drums on the ground, a ledge halfway, and bricks that hide the third spark */
  B.sign(167,'Too tall to jump? There is a drum.').row(170,2,'J').fill(173,2,181,7,HARD).clear(174,2,180,6).fill(173,2,173,6,BRICK).spark(178,3,'sun').coins(175,2,5);
  B.row(174,10,'=======').coins(175,11,5).enemy('puff',184,7,{rx:2});
  B.row(188,5,'?M?').enemy('blob',191).enemy('shellby',195);
  B.stairs(200,6).fill(206,2,206,7,HARD);
  B.goal(212);
  return B.L;
}

/* 1-4: the sunset bridge. A long way over the river on red bridges that swing, with Petalpuffs and leaping koi, and a
   switch that opens the way to the shrine. */
function w1l4(){
  const B=LevelBuilder(264,'bluffs');
  B.room(0,231).room(236,263,0,15,true);
  B.ground(0,30).ground(52,74).ground(98,150).ground(170,235);
  B.coins(5,3,3).row(10,5,'?O?').enemy('blob',14).enemy('ribbit',19).pipe(24,2,true);
  /* the first bridge: planks, then a ledge that swings */
  B.sign(27,'The red ledges swing. Step on at the near end of the swing, off at the far.');
  B.row(31,1,'=====').plat(38,3,3,'s',6,1.3).row(46,1,'=====').enemy('snapper',36.5,2,{rise:4}).enemy('snapper',44.5,2,{rise:4,phase:0.9}).coins(32,3,3).arc(38,6,5).coins(47,3,3);
  B.row(55,5,'B?B').enemy('shellby',58).enemy('puff',63,6,{rx:3}).row(66,5,'?').row(66,9,'L');
  /* the second: two swings, with a puff to bounce off and a spark above the middle */
  B.plat(77,3,3,'s',6,1.2).plat(86,3,3,'s',6,1.2,1.6).row(94,1,'===').enemy('puff',83.5,7,{rx:1}).spark(83,10).coins(78,6,2).coins(87,6,2).enemy('snapper',91.5,2,{rise:4.5});
  B.checkpoint(101);
  B.row(105,5,'?M?').enemy('blob',108).enemy('blob',110).enemy('ribbit',115);
  /* the shrine: a switch on a post turns the red gate off; inside, a spark */
  B.sign(118,'Pound the switch from above. Red blocks go, blue blocks come.');
  B.fill(121,2,121,4,HARD).row(121,5,'X').fill(126,2,126,6,RED).fill(127,6,132,6,HARD).fill(132,2,132,5,HARD).spark(129,3).coins(127,2,5).row(124,9,'UU').coins(124,10,2);
  B.row(136,5,'B?B').enemy('shellby',139).pipe(144,3,true);
  /* the long bridge at sunset */
  B.row(151,1,'====').plat(157,3,3,'x',5,1.1).row(166,1,'====').enemy('snapper',155.5,2,{rise:4}).enemy('snapper',164.5,2,{rise:4.5,phase:1}).coins(158,5,5).enemy('puff',161,8,{rx:2});
  B.row(173,5,'?B?').enemy('ribbit',176).enemy('blob',181);
  B.warp(185,2,'in').enemy('shellby',190).warp(196,3,'out',true);
  B.row(201,5,'BOB').enemy('blob',204).enemy('puff',207,6,{rx:2});
  B.stairs(210,6).fill(216,2,216,7,HARD);
  B.goal(222);
  /* under the bridge: a cellar of drums, with the third spark behind a wall only a dash or a long way round will pass */
  B.fill(232,2,235,15,GROUND).ground(236,263).fill(236,2,236,15,HARD).fill(263,2,263,15,HARD);
  B.warp(238,2,'in',true).warp(259,2,'out').row(243,2,'J').row(246,7,'===').fill(251,2,251,4,BRICK).fill(251,5,255,5,HARD).fill(255,2,255,4,HARD).clear(253,5,253,5).row(254,2,'H').spark(252,3).coinBox(252,2,253,2).coinCol(243,5,4).coins(246,8,3).row(249,10,'==');
  return B.L;
}

/* 1-5: the lantern walk, at dusk. Everything the garden has taught, one thing after another: drums over the water, a
   fountain stair, swings, a dash through a wall of bricks, and a last climb to the flag with the lamps coming on. */
function w1l5(){
  const B=LevelBuilder(300,'bluffs',20);
  B.room(0,265).room(270,299,0,15,true);
  B.ground(0,28).ground(46,84).ground(88,128).ground(150,190).ground(194,269);
  B.coins(6,3,3).row(10,5,'?M?').enemy('blob',14).enemy('ribbit',19).enemy('puff',23,6,{rx:3});
  B.fill(30,0,31,2,HARD).row(30,3,'JJ').fill(36,0,37,3,HARD).row(36,4,'JJ').fill(42,0,43,2,HARD).row(42,3,'JJ').coins(33,8,2).coins(39,9,2).enemy('snapper',34,2,{rise:4}).enemy('snapper',40,2,{rise:4,phase:0.7});
  B.row(36,13,'==').spark(36,14);
  B.row(49,5,'B?B').enemy('shellby',52).enemy('blob',56).pipe(60,3,true);
  /* the fountain stair: three terraces, a fountain up each */
  B.geyser(66,2,5,4).ground(69,74,6).geyser(77,2,9,4,1.5).ground(80,84,10).coinCol(66,4,3).coinCol(77,5,6).enemy('ribbit',71,6).row(81,13,'?O?').enemy('blob',83,10);
  B.arc(85,10,5).fill(88,2,92,7,GROUND).enemy('puff',95,8,{rx:3}).row(97,5,'?B?');
  B.checkpoint(102);
  B.enemy('blob',106).enemy('blob',108).enemy('shellby',112);
  /* a wall with a cell inside it: over the top by the drum, or straight through the bricks with a dash, to the spark */
  B.row(113,2,'J').fill(116,2,118,6,BRICK).fill(119,2,121,6,HARD).clear(119,2,120,4).spark(120,3,'sun').fill(116,7,121,7,HARD).row(124,5,'?');
  /* the swings over the wide water */
  B.plat(131,3,3,'s',6,1.2).plat(140,4,3,'s',6,1.2,1.5).enemy('puff',137,8,{rx:1.5}).enemy('snapper',136,2,{rise:4.5}).enemy('snapper',146,2,{rise:4,phase:0.8}).coins(132,6,2).coins(141,7,2);
  B.row(153,5,'B?B').enemy('ribbit',156).enemy('blob',160).enemy('puff',164,6,{rx:3});
  B.warp(168,2,'in').enemy('shellby',173).warp(180,3,'out',true);
  B.row(184,5,'?').enemy('snapper',192,2,{rise:4});
  B.row(197,5,'BMB').row(198,9,'L').enemy('blob',200).enemy('ribbit',205);
  /* the last climb: posts to kick up, a terrace, and down the stairs to the flag */
  B.fill(210,4,210,12,HARD).ground(214,222,9).coinCol(212,3,8).row(217,12,'?').enemy('puff',218,12,{rx:3}).enemy('blob',220,9).fill(223,2,224,6,HARD).fill(225,2,225,3,HARD);
  B.stairs(238,6).fill(244,2,244,7,HARD);
  B.goal(250);
  /* a lantern room: drums in a row, each one a note, and the third spark for whoever pounds the last */
  B.fill(266,2,269,15,GROUND).ground(270,299).fill(270,2,270,15,HARD).fill(299,2,299,15,HARD);
  B.warp(272,2,'in',true).warp(295,2,'out').row(277,2,'J').row(280,2,'J').row(283,2,'J').row(286,2,'J').coinCol(277,5,2).coinCol(280,5,3).coinCol(283,5,4).coinCol(286,5,5).spark(286,14).row(289,9,'===').coins(289,10,3).sign(274,'Pound the last drum.');
  return B.L;
}

/* ---------- the island on the map ---------- */
function mpPagoda(){ const w='#f4e9dc',r='#c93d3d',d='#8a2630',k='#5f372b', b=[[-9,0,-9,18,1.2,18,'#c4bfd0']];
  for(let i=0;i<4;i++){ const s=14-i*2.6, y=1.2+i*6.2; b.push([-s/2,y,-s/2,s,4.2,s,w],[-s/2-2,y+4.2,-s/2-2,s+4,1,s+4,r],[-s/2-1,y+5.2,-s/2-1,s+2,1,s+2,d],[-1,y+0.6,s/2,2,2.6,0.2,k]); }
  b.push([-0.4,26,-0.4,0.8,5,0.8,'#ffc928'],[-1,28,-1,2,0.6,2,'#ffc928']); return b; }
function mpPagodaGlow(){ const b=[]; for(let i=0;i<4;i++){ const s=14-i*2.6, y=1.2+i*6.2; b.push([-s/2+1,y+1.2,s/2+0.05,1.6,2,0.15,'#ffe9a0'],[s/2-2.6,y+1.2,s/2+0.05,1.6,2,0.15,'#ffe9a0']); } return b; }
defWorld({name:'Blossom Bluffs',theme:'bluffs',levels:[w1l1,w1l2,w1l3,w1l4,w1l5],
  map:{
    /* lawn, with drifts of fallen petals on the terrace */
    ground:(h,p)=>[h>=4&&p<0.4?['#ffc7df','#ffb8d6']:p<0.25?['#a2e88a','#98de80']:['#7fd66a','#74cc60'],['#b9845a','#a97650']],
    pond:['#58c4ea','#2f95d6','#1f66b0'],
    scatter(M,c){ const r=c.r;
      if(r<0.11&&c.clear(2.4)) M.put(M.flora,dSakura(c.R),c.x,c.y,c.z,0.62+c.r2*0.25,0.2);
      else if(r<0.16&&c.clear(1.8)) M.put(M.flora,dBamboo(c.R),c.x,c.y,c.z,0.7,0.5);
      else if(r<0.2){ M.put(M.land,dStoneLantern(),c.x,c.y,c.z,0.7); M.glow.push([c.x-0.08,c.y+0.54,c.z+0.12,0.16,0.14,0.02,'#ffe9a0']); if(c.r2<0.5) M.lamp(c.x,c.y+0.7,c.z+0.3,0xffd27a,1.1,5); }
      else if(r<0.23&&c.clear(1.6)) M.put(M.land,dTorii(),c.x,c.y,c.z,0.6);
      else if(r<0.4) M.put(M.flora,dFlower(pick(c.R,['#ff8fc7','#ffe14d','#ffffff','#b58cff'])),c.x,c.y,c.z,0.75,1);
      else if(r<0.48) M.put(M.land,dAzalea(pick(c.R,['#ff8fc7','#ff5fa2','#ffffff'])),c.x,c.y,c.z,0.6);
      else if(r<0.54) M.put(M.land,dPetalPile(),c.x,c.y,c.z,0.9);
      if(r>0.9) M.mote({kind:1,x:c.x,y:c.y+0.5+c.r2*0.6,z:c.z,col:'#ffc2dc',size:0.05,span:0.8,rate:0.25+c.r2*0.2}); },
    /* the pagoda, with a lamp in every window */
    landmark(M,x,y,z){ M.put(M.land,mpPagoda(),x,y,z,1); M.put(M.glow,mpPagodaGlow(),x,y,z,1); M.lamp(x,y+1.2,z+1.6,0xffd27a,1.5,7); }
  }});
