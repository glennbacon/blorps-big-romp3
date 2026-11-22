/* ================= World 2: Caramel Orchard ================= */
/* An orchard on rolling hills in autumn, at golden hour: apple trees heavy with fruit, maples in orange and red, hay
   rolls, red barns, a windmill turning, crows, and leaves on the wind. Hay bales bounce, caramel sticks, apples roll out
   of hatches in the hillsides, hay carts trundle to and fro, and old plank bridges crumble into the stream, which can be
   swum out of. The five levels run from a bright afternoon through a deep orange sunset to a harvest moon. */

/* ---------- the tune ---------- */
/* @song */
/* A barn dance in D major with a shuffle: a fiddle saws out the tune over a banjo's picked roll, a guitar chops on the
   off-beats, the bass walks, and somebody claps on two and four. The middle eight lifts to G and climbs home by way of
   E minor and A. */
SONGS.orchard=(()=>{
  const h='D5 F#5 A5 F#5 D6 - A5 F#5  B5 A5 F#5 A5 D5 - . A4  B4 D5 G5 D5 B5 - A5 G5  F#5 A5 F#5 D5 A5 - - . ';
  const a=h+'D5 F#5 A5 F#5 D6 - C#6 B5  B5 - F#5 B5 D6 - B5 F#5  E5 A5 C#6 A5 E6 - C#6 A5  G5 - E5 C#5 A4 C#5 E5 A5 ';
  const a2=h+'G5 B5 D6 B5 G5 B5 D6 E6  C#6 E6 C#6 A5 E5 A5 C#6 E6  D6 - A5 F#5 D5 F#5 A5 D6  D6 - - - . . A4 . ';
  const b='G5 - B5 - D6 - - B5  D6 E6 D6 B5 G5 - B5 .  F#5 - A5 - D6 - - A5  F#6 E6 D6 A5 F#5 - A5 .  E5 - G5 - B5 - - G5  E6 D6 B5 G5 E5 G5 B5 .  C#6 . E6 . A5 . C#6 .  E6 G6 E6 C#6 A5 B5 C#6 E6 ';
  const ch='D D G D D Bm A A7  D D G D G A D D  G G D D Em Em A A7  D D G D G A D D';
  const d='k r sp r k k sp r ';
  return song({key:'D major',bpm:132,sw:0.2,ec:0.5,fb:0.2},
    [{w:'sawtooth',v:0.05,lp:[2.2,4.6],q:1.2,vib:14,vr:6,s:0.75,a:0.02,g:0.92,det:5,e:1,r:0.3,pan:-0.1},a+a2+b+a2],
    [{w:'triangle',v:0.075,h:3,g:0.32,lp:[9,2.5],pan:0.35},musArp(ch,8,'1 5 8 3^ 5 8 3^ 5','A3')],
    [{w:'sawtooth',v:0.014,g:0.3,lp:[6,1.5],pan:-0.35,r:0.3},musChord(ch,8,'. . x . . . x .','A3')],
    [{w:'triangle',v:0.24,g:0.75},musArp(ch,8,'1 . 5 . 1 . 3 5  1 . 3 . 5 . 3 1','D2')],
    [{dr:1,v:0.85},(d.repeat(3)+'k r sp r k sp sp w ').repeat(2)+('k t sp r k k sp t '.repeat(3)+'k r sp r l m sp sp ').repeat(2)+(d.repeat(3)+'k r sp r k sp sp w ').repeat(2)+(d.repeat(3)+'k r sp r k sp sp w '+d.repeat(3)+'k r sp sp l l m x ')]);
})();
/* @endsong */

/* ---------- models ---------- */
const orchardMapleCols=['#f08a2a','#e2542a','#ffc23a','#d9432e'];
function orchardAppleTree(R){ const t='#7a4a2c',t2='#5f3820',g=['#86b33c','#9ac64a','#6f9f32','#b3d158'], b=[], h=6+((R()*3)|0), top=h+1;
  b.push([-1.4,0,-1.4,2.8,h,2.8,t],[-1,h,-1,2,2,2,t2],[0.6,h-2.2,-0.7,3.6,1.2,1.4,t2],[-4.2,h-1.4,-0.7,3.4,1.2,1.4,t2],
    [-7,top,-5.5,14,5.2,11,g[0]],[-8.6,top+1.2,-4.5,17.2,3,9,g[2]],[-5.5,top+5.2,-4.5,11,3,9,g[1]],[-3.5,top+8.2,-3,7,1.8,6,g[3]],
    [-8.9,top+2,-1,0.4,1.3,1.3,'#e8384f'],[8.5,top+1.6,1,0.4,1.3,1.3,'#e8384f']);
  for(let i=0;i<7;i++){ const y=top+0.4+R()*6.2, hi=y>top+5; b.push([(hi?-5:-6.6)+R()*(hi?9:12),y,hi?4.5:5.5,1.3,1.3,0.5,R()<0.8?'#e8384f':'#ffc928']); }
  return b; }
function orchardMaple(R,c){ const t='#6a4028', l=shade(c,1.14), d=shade(c,0.84), h=8+((R()*4)|0);
  return [[-1.2,0,-1.2,2.4,h,2.4,t],[-0.9,h,-0.9,1.8,3,1.8,'#573220'],[-6,h+1,-5,12,3.4,10,d],[-7.6,h+4,-6,15.2,5,12,c],[-6,h+9,-5,12,4,10,c],[-4,h+13,-3.5,8,3,7,l],[-2,h+16,-2,4,2,4,l],
    [-6.5,h+5,6,3,2,0.4,l],[2.5,h+10,5,3,2,0.4,l],[-1.5,h+7,6,2.2,1.6,0.4,d]]; }
/* a round bale, end on: these stand about behind the lane (the square ones in it are the ones that bounce) */
function orchardRoll(){ const c='#e2bc4e',l='#f6dc82',d='#b98f30'; return [[-4,0.8,-3,8,6.4,6,c],[-3.2,0,-3,6.4,8,6,c],[-3.4,7.6,-2.6,6.8,0.5,5.2,l],[-2.6,1.4,3,5.2,5.2,0.2,d],[-1.5,2.5,3.2,3,3,0.15,l],[-0.5,3.5,3.35,1,1,0.1,d],[-4.1,3,-0.4,8.2,0.5,0.8,'#8a5a2b']]; }
function orchardFence(){ const p='#c9a06a',r='#e6c890',d='#9a7444'; return [[-0.6,0,-0.5,1.2,5.4,1,p],[-0.8,5.4,-0.7,1.6,0.5,1.4,d],[-4,3.6,-0.25,8,0.9,0.5,r],[-4,1.5,-0.25,8,0.9,0.5,r]]; }
function orchardPumpkin(){ const o='#f08a2a',d='#d96a1c',l='#ffab4a'; return [[-2.6,0,-2,5.2,3.2,4,o],[-3.2,0.5,-1.5,6.4,2.2,3,d],[-1.8,3.2,-1.4,3.6,0.5,2.8,l],[-0.4,3.6,-0.4,0.8,1.3,0.8,'#5f8a2a'],[-0.9,0.3,2,0.5,2.6,0.12,d],[0.6,0.3,2,0.5,2.6,0.12,d]]; }
function orchardScarecrow(){ const p='#8a5a2b',s='#c93d3d',y='#e8c04a',f='#f0d9a0',ht='#b98a2a';
  return [[-0.5,0,-0.5,1,12,1,p],[-5.6,8.2,-0.4,11.2,0.9,0.8,p],[-2.2,5,-1,4.4,5,2,s],[-5.2,7.6,-0.8,3,2.2,1.6,s],[2.2,7.6,-0.8,3,2.2,1.6,s],[-6.4,7.8,-0.6,1.2,1.6,1.2,y],[5.2,7.8,-0.6,1.2,1.6,1.2,y],
    [-2.5,4.2,-1.1,5,0.9,2.2,y],[-1.8,10,-1.6,3.6,3.4,3.2,f],[-3.3,13.2,-3,6.6,0.6,6,ht],[-1.8,13.8,-1.6,3.6,1.8,3.2,ht],[-1.8,13.8,1.5,3.6,0.6,0.2,s],
    [-1.2,11.6,1.6,0.8,0.9,0.15,INK],[0.4,11.6,1.6,0.8,0.9,0.15,INK],[-0.9,10.6,1.6,1.8,0.3,0.15,INK],[-1.6,6.2,1,1.4,1.4,0.15,'#ffc928']]; }
function orchardWheat(){ const s='#d9b84a',h='#f0d470'; return [[-1.6,0,0,0.5,4.6,0.5,s],[-1.9,4.6,-0.2,1.1,2.2,0.9,h],[0,0,0.4,0.5,5.2,0.5,s],[-0.3,5.2,0.2,1.1,2.2,0.9,h],[1.5,0,-0.3,0.5,4,0.5,s],[1.2,4,-0.5,1.1,2,0.9,h]]; }
function orchardLeafPile(R){ const c=['#f08a2a','#e2542a','#ffc23a','#c93d3d']; return [[-2.4,0,-1.6,4.8,0.6,3.2,pick(R,c)],[-1.4,0.6,-1,2.8,0.5,2,pick(R,c)],[0.8,0,1,1.4,0.3,1,pick(R,c)]]; }
function orchardCrate(){ const w='#c99a5a',d='#8f6a36'; return [[-2.6,0,-2,5.2,2.8,4,w],[-2.6,0.9,2,5.2,0.5,0.15,d],[-2.6,2,2,5.2,0.5,0.15,d],[-2.2,2.8,-1.6,1.6,1,1.6,'#e8384f'],[-0.4,2.8,-0.4,1.6,1.2,1.6,'#e8384f'],[0.8,2.8,-1.6,1.4,0.9,1.4,'#ffc928'],[-1.8,2.8,0.2,1.3,0.9,1.3,'#9ac64a']]; }
/* a red barn with a gambrel roof; its windows are a model of their own, lit at dusk */
function orchardBarn(){ const r='#c8402f',d='#8f2a22',w='#fbeed8',k='#3a2418',rf='#5a4a5e',rl='#7a6a80';
  return [[-11,0,-6,22,10.4,12,r],[-9.4,10.4,-6,18.8,3.4,12,r],[-6,13.8,-6,12,2.6,12,r],
    [-12.4,9.6,-7,3.4,1.6,14,rf],[9,9.6,-7,3.4,1.6,14,rf],[-10.6,11.2,-7,3.4,2.8,14,rl],[7.2,11.2,-7,3.4,2.8,14,rl],[-8,14,-7,4.6,2.6,14,rf],[3.4,14,-7,4.6,2.6,14,rf],[-4.4,16.4,-7,8.8,1.5,14,rl],
    [-3.6,0,6,7.2,7.6,0.3,d],[-3.6,0,6.3,0.6,7.6,0.15,w],[3,0,6.3,0.6,7.6,0.15,w],[-3.6,7,6.3,7.2,0.6,0.15,w],[-0.3,0,6.3,0.6,7,0.15,w],
    [-1.6,10.6,6,3.2,3,0.3,k],[-2,10.2,6.1,4,0.4,0.25,w],[-2,13.6,6.1,4,0.4,0.25,w],[-9,3.6,6,2.4,2.8,0.2,k],[6.6,3.6,6,2.4,2.8,0.2,k],[-11,0,6,22,0.7,0.2,d]]; }
function orchardBarnGlow(){ return [[-1.3,10.9,6.32,2.6,2.5,0.1,'#ffd27a'],[-8.7,3.9,6.22,1.8,2.2,0.1,'#ffc45a'],[6.9,3.9,6.22,1.8,2.2,0.1,'#ffc45a']]; }
function orchardSilo(){ const s='#e6dcc8',d='#c2b6a0',rf='#5a4a5e'; return [[-3,0,-3,6,16,6,s],[-3.1,5,-3.1,6.2,0.6,6.2,d],[-3.1,10.6,-3.1,6.2,0.6,6.2,d],[-3.4,16,-3.4,6.8,1.2,6.8,rf],[-2.2,17.2,-2.2,4.4,1.2,4.4,rf],[-1,18.4,-1,2,0.8,2,'#7a6a80']]; }
/* a windmill, and its sails drawn round their hub so they can turn */
function orchardMill(){ const s='#f3e8d2',w='#fffaf0',c='#c8402f'; return [[-4.4,0,-4.4,8.8,7,8.8,s],[-3.8,7,-3.8,7.6,8,7.6,w],[-3.2,15,-3.2,6.4,6,6.4,w],[-4,21,-4,8,1.6,8,c],[-3,22.6,-3,6,1.6,6,c],[-1.6,24.2,-1.6,3.2,1.2,3.2,'#e2604a'],[-1.2,0,4.4,2.4,4,0.25,'#6a4028'],[-1,10,3.8,2,2.4,0.2,'#5a4a5e']]; }
function orchardSails(){ const k='#6a4028',w='#fbeed8'; return [[-1,-1,-0.5,2,2,1.2,k],[-0.4,1,0,0.8,13,0.5,k],[0.4,3,0.1,3.4,10,0.25,w],[-0.4,-14,0,0.8,13,0.5,k],[-3.8,-13,0.1,3.4,10,0.25,w],[1,-0.4,0,13,0.8,0.5,k],[3,-3.8,0.1,10,3.4,0.25,w],[-14,-0.4,0,13,0.8,0.5,k],[-13,0.4,0.1,10,3.4,0.25,w]]; }
/* the skins: a crow on a Swoop's rules, a toffee blob on a Gloop's, and an apple with a temper for the hatches */
function orchardCrow(){ return mSwoop('#34304a','#211d33','#ffb02e').concat([[-1.3,1.4,-6.6,2.6,0.9,2.4,'#211d33'],[-1.2,5.2,2.6,2.4,0.7,2,'#48446a']]); }
function orchardCrowWing(sx){ return mSwoopWing(sx,'#211d33','#48446a'); }
function orchardToffee(){ return mGloop('#c1701f','#8a4a14','#f2b866').concat([[-0.35,6.2,-0.35,0.7,3.2,0.7,'#f3e2bd'],[-1.6,3,3,0.9,0.5,0.3,'#f2b866']]); }
function orchardApple(){ const r='#e8384f',d='#b8203c',l='#ff7d8c'; return [[-3,-3.6,-3.3,6,7.2,6.6,r],[-3.7,-2.8,-3,7.4,5.6,6,r],[-2.6,-3.9,-2.6,5.2,0.4,5.2,d],[-2.4,3.5,-2.4,4.8,0.3,4.8,d],
  [-0.4,3.5,-0.4,0.8,1.5,0.8,'#7a4a2c'],[0.4,4.2,-0.5,2,0.7,1.2,'#7fae3a'],
  [-1.8,-0.4,3.3,1.1,1.5,0.2,INK],[0.7,-0.4,3.3,1.1,1.5,0.2,INK],[-2.2,1.3,3.3,1.8,0.45,0.2,INK],[0.4,1.3,3.3,1.8,0.45,0.2,INK],[-1,-2.2,3.3,2,0.45,0.2,INK],[-2.9,1.8,3.3,0.9,1.1,0.12,l]]; }
/* crows a long way off, for the scenery to flap */
function orchardBird(){ return [[-0.8,-0.5,-0.6,1.6,1,2.4,'#2a2638'],[-0.3,-0.2,1.8,0.6,0.5,0.9,'#ffb02e']]; }
function orchardBirdWing(sx){ return sx>0?[[0,-0.2,-0.8,3.6,0.4,1.8,'#2a2638']]:[[-3.6,-0.2,-0.8,3.6,0.4,1.8,'#2a2638']]; }

/* ---------- the hay cart ---------- */
/* A monster of this world's own, and no monster at all: a cart that trundles to and fro with a bale of hay on it. It
   hurts nobody. Its bale bounces Blorp exactly as a bale in the ground does: about 4 tiles, or 9 with jump held.
   Options: rx how far it rolls (to the right of where it is put), sp how fast, phase, and rail:1 to lay rails under
   it on trestles `drop` tiles tall, for a cart that crosses a stream or a gully. */
function orchardCartBody(){ const r='#d8483a',rd='#a8342a',d='#7d4f24',hy='#e8c04a',hl='#fbe28a',hd='#b98a2a',tw='#8a5a2b';
  return [[-7,2.2,-3.4,14,2.6,6.8,r],[-7.3,4.6,-3.6,14.6,0.5,7.2,rd],[-9.4,3,-0.5,2.4,0.7,1,d],
    [-6,5.1,-3,12,6.8,6,hy],[-6,11.4,-3,12,0.6,6,hl],[-6,5.1,3,12,0.5,0.15,hd],[-2.8,5.1,3,0.6,6.9,0.2,tw],[2.2,5.1,3,0.6,6.9,0.2,tw],
    [-2,8.2,3,1,1.3,0.25,INK],[1,8.2,3,1,1.3,0.25,INK],[-0.9,6.9,3,1.8,0.4,0.25,INK]]; }
function orchardCartWheel(){ const k='#5a3220',l='#c9a06a'; return [[-2,-2,-0.5,4,4,1,k],[-2.6,-1.2,-0.5,5.2,2.4,1,k],[-1.2,-2.6,-0.5,2.4,5.2,1,k],[-0.6,-0.6,-0.7,1.2,1.2,1.4,l],[-0.3,-2.2,0.5,0.6,4.4,0.15,l],[-2.2,-0.3,0.5,4.4,0.6,0.15,l]]; }
function orchardRail(len,drop){ const m='#8a8aa3',w='#7d4f24',b=[[0,-0.14,-0.5,len,0.14,0.12,m],[0,-0.14,0.3,len,0.14,0.12,m]];
  for(let x=0.3;x<len;x+=1) b.push([x,-0.26,-0.65,0.3,0.12,1.2,w]);
  for(let x=0.4;x<len;x+=3.6){ b.push([x,-drop,-0.55,0.3,drop-0.26,0.3,w],[x,-drop,0.2,0.3,drop-0.26,0.3,w]); if(drop>3) b.push([x-0.05,-drop*0.5,-0.6,0.4,0.2,1.2,w]); }
  return b; }
defEnemy('orchardCart',{w:1.6,h:1.5,fly:true,heavy:true,fireproof:true,bouncy:true,harmless:true,
  init(e,d){ e.ox=d.x; e.oy=d.y; e.rx=d.rx||5; e.sp=d.sp||0.8; e.t=d.phase||0; e.rail=d.rail?1:0; e.drop=d.drop||Math.max(0.6,d.y-1.2); e.sq=0; },
  mesh(e){ const g=G1('orchardCart',orchardCartBody), u=g.userData; u.wheels=[];
    for(const x of [-4.4,4.4]){ const m=vmesh('orchardWheel',orchardCartWheel); m.position.set(x*S8,2.5*S8,3.7*S8); g.add(m); u.wheels.push(m); }
    if(e.rail){ const m=new T.Mesh(tmpGeo(voxGeo(orchardRail(e.rx+2.4,e.drop),1)),MAT.vox); m.position.set(e.ox-1.2,e.oy,0); m.castShadow=true; world.add(m); }
    return g; },
  tick(e,dt){ const u=0.5-0.5*Math.cos(e.t*e.sp); e.x=e.ox+u*e.rx; e.y=e.oy; e.sq=Math.max(0,e.sq-dt); },
  bounced(e){ const p=player, hold=input.jump||input.jumpBuf>0; p.vy=hold?22.5:15.5; p.springHold=true; p.jumping=true; input.jumpBuf=0; e.sq=0.25;
    sfx.boing(hold?1:0,Math.floor(e.x),'hay'); dust(p.x-0.3,p.y,2,-1,TH.bounceCol); dust(p.x+0.3,p.y,2,1,TH.bounceCol); },
  anim(e,m){ const u=m.userData, k=e.sq>0?1-Math.sin(e.sq/0.25*Math.PI)*0.16:1; m.scale.set(1/Math.sqrt(k),k,1/Math.sqrt(k)); m.position.z=-0.3;
    if(u.wheels) for(const w of u.wheels) w.rotation.z=-e.x*3; }});

THEMES.orchard={ music:'orchard', air:'birds',
  sky:['#4f9be0','#bfdcec','#ffe2a2'], skyMid:0.5, glowCol:0xffd98a, sunGlow:1.0, cloud:0.45, cloudCol:'#fff6e0', cloudShade:'#f2cf9c', cloudY:0.66, spokes:0.4,
  fog:0xf6dcae, fogNear:18, fogFar:150,
  hemiSky:0xfff6e6, hemiGround:0xd9b98a, hemiI:0.6, sunI:0.74, sunCol:0xffe6b8, sunDir:[-0.55,0.62,0.5],
  top:'#b7c652', topS:['#c9d466','#a3b444','#dcc85a','#cf9e44'], dirt:'#9a6238', dirtS:['#8a5530','#b0764a','#7a4a28'], cap:'#b7c652', capL:'#e0e68c', capD:'#7f8f30',
  brick:['#c8503c','#8a2f26','#f08a6a'], hard:['#e2c48e','#f6e2b4','#a8824a'], pipe:['#7fa8c9','#d6ecfa','#4a6f92','#22364a'],
  semi:'plank', plat:['#d8483a','#8a2a24'], dust:'#f6e2b4', back:-6, fringe:['#cdd668','#a8b848','#e6b84a','#d9843a'],
  liquid:{kind:'water',a:'#4f97ad',b:'#fff0c4',op:0.8,far:70,mirror:0.7,glint:'#ffe6a8'}, pool:{kind:'water',a:'#5fa8ba',b:'#fff0c4',op:0.6},
  bounce:{kind:'hay',cols:['#e8c04a','#fbe28a','#b98a2a']}, bounceCol:'#fbe28a',
  sticky:['#c9782a','#f2b866','#8a4a14'], stickyCol:'#d98a3a',
  stackCols:['#e8702a','#f08f2e','#ffab3d'], rollerCol:'#e8384f',
  skins:{swoop:orchardCrow,swoopWL:()=>orchardCrowWing(-1),swoopWR:()=>orchardCrowWing(1),gloop:orchardToffee,roller:orchardApple},
  disc:['#ffd75a','#ffeea0','#d98a12'], sunY:12.5, bloom:0.95, hi:0.16, rays:0.5, grade:{shadow:[0.98,0.94,1.05],high:[1.07,1.02,0.92]},
  looks:[null,
    /* later in the afternoon */
    {sky:['#5a93d6','#d6dcc8','#ffd98a'],fog:0xf6d49a,sunCol:0xffdca0,sunDir:[-0.6,0.54,0.5],cloud:0.55,cloudShade:'#f0c080',sunY:11},
    /* golden hour */
    {sky:['#6f8fcf','#f0c88a','#ffd070'],skyMid:0.55,fog:0xf7c880,sunCol:0xffd08a,hemiSky:0xfff0d6,glowCol:0xffc060,sunDir:[-0.66,0.46,0.5],disc:['#ffc23a','#ffe08a','#c9720f'],cloudCol:'#ffe9c0',cloudShade:'#f0a868',rays:0.6,sunY:9.5,air:'wind',
      liquid:{kind:'water',a:'#7a98a0',b:'#ffe2a0',op:0.8,far:70,mirror:0.72,glint:'#ffd98a'},grade:{shadow:[1.0,0.93,1.03],high:[1.08,1.01,0.9]}},
    /* sunset */
    {sky:['#7a3f6a','#e8703a','#ffc04a'],skyMid:0.5,fog:0xf09a5a,sunCol:0xffa864,hemiSky:0xffd6b0,hemiGround:0xc98a6a,hemiI:0.56,sunI:0.7,glowCol:0xff8a3a,sunGlow:1.1,sunDir:[-0.72,0.36,0.5],disc:['#ff8a2a','#ffc46a','#b3480f'],
      cloud:0.5,cloudCol:'#ffc890',cloudShade:'#c9604a',rays:0.65,sunY:8.5,shaft:'#ffb060',air:'crickets',
      liquid:{kind:'water',a:'#a8683a',b:'#ffd08a',op:0.82,far:70,mirror:0.75,glint:'#ffc070'},grade:{shadow:[1.02,0.9,1.02],high:[1.1,0.98,0.86]}},
    /* dusk, under a harvest moon, with the lamps lit */
    {sky:['#1c2050','#4a3a7a','#d9744a'],skyMid:0.42,fog:0x8a6a8a,sunCol:0xc9c0f0,hemiSky:0xb8b0e0,hemiGround:0x7a6480,hemiI:0.5,sunI:0.46,glowCol:0xffb060,sunGlow:0.6,sunDir:[-0.5,0.6,0.5],stars:0.75,shoot:1,disc:['#ffc86a',null,'#c98a3a'],
      cloud:0.3,cloudCol:'#8a78b0',cloudShade:'#4a3f78',rays:0.25,spokes:0,sunY:12,shaft:'#c9b8ff',lit:true,air:'crickets',
      liquid:{kind:'water',a:'#3a4a8a',b:'#ffc88a',op:0.84,far:70,mirror:0.75,glint:'#ffd9a0'},grade:{shadow:[0.9,0.92,1.14],high:[1.08,1.0,0.96]}}],
  /* the far view: hazy ridges, rolling hills with rows of little trees, barns and windmills on their rises, and across
     the stream a long meadow of big apple trees and maples behind a fence; crows, clouds, and leaves on the wind */
  scenery(S,R){
    const W=S.W, far=S.far, lit=!!TH.lit, by=L.liquidY+0.35;
    for(let x=-90;x<W+90;x+=46+R()*30) hill(far,x,15+R()*7,-96-R()*8,70+R()*30,pick(R,['#c7a878','#b89a86','#d2b070']),R,false);
    for(let x=-60;x<W+60;x+=19+R()*20){ const z=-44-R()*34, w=22+R()*20, top=5+R()*8;
      hill(far,x,top,z,w,pick(R,['#d6b24a','#c98a3a','#a8ad48','#dcc060','#b97a3a']),R,false);
      for(let k=0;k<5;k++){ const px=x+(k-2)*w*0.065+(R()-0.5)*0.6, s=2.2+R()*1.4; far.push([px-0.25,top-0.6,z,0.5,1.8,0.5,'#6a4028'],[px-s/2,top+0.9,z-s/2,s,s*0.75,s,pick(R,['#f08a2a','#e2542a','#ffc23a','#86b33c','#d9432e'])]); } }
    /* the far bank: one long meadow, patched with stubble, and a fence along it */
    far.push([-90,by-2.2,-66,W+180,2.2,55.5,'#c2b84e']);
    for(let x=-80;x<W+80;x+=9+R()*10) far.push([x,by,-14-R()*30,6+R()*9,0.05,3+R()*7,pick(R,['#dcc060','#c98a3a','#a8ad48','#e0b04a'])]);
    far.push([-60,by+0.55,-10.9,W+120,0.12,0.1,'#e6c890'],[-60,by+0.28,-10.9,W+120,0.1,0.1,'#e6c890']);
    for(let x=-60;x<W+60;x+=2.5) far.push([x,by,-10.95,0.16,0.8,0.16,'#c9a06a']);
    /* barns with their silos */
    { const n=Math.max(1,Math.round(W/120)), k=0.34;
      for(let i=0;i<n;i++){ const x=W*(0.1+0.8*(i+R()*0.7)/n), z=-28-R()*8, y=by+2+R()*2;
        hill(far,x+1,y,z-1,30,'#b9b24a',R,false); put(far,scaled(orchardBarn(),k),x,y,z); put(far,scaled(orchardSilo(),k),x+5.2,y,z-0.6);
        if(lit) put(S.glowFar,scaled(orchardBarnGlow(),k),x,y,z); } }
    /* windmills, turning */
    for(let x=30+R()*50;x<W;x+=110+R()*60){ const z=-19-R()*5, y=by+1.5+R()*1.5, k=0.36, ph=R()*6;
      hill(far,x,y,z-1,13,'#c9b450',R,false); put(far,scaled(orchardMill(),k),x,y,z);
      const m=new T.Mesh(geo('orchardSailsFar',orchardSails,k),MAT.vox); m.position.set(x,y+19*k,z+4.9*k); world.add(m);
      critters.push({tick(dt,time){ m.rotation.z=-(time*0.45+ph); }}); }
    /* big trees along the bank, where the stream can show them twice */
    for(let x=-24;x<W+24;x+=6+R()*8){ const z=-12.5-R()*9, r=R();
      if(r<0.5){ put(S.flora,scaled(orchardAppleTree(R),1.7),x*8,by*8,z*8,0.22); if(lit) S.glowFar.push([x-0.9,by+1.5,z+0.8,0.4,0.5,0.4,'#ffcf6a']); }
      else if(r<0.85) put(S.flora,scaled(orchardMaple(R,pick(R,orchardMapleCols)),1.6),x*8,by*8,z*8,0.22);
      else put(S.near,scaled(orchardRoll(),1.5),x*8,by*8,z*8); }
    for(let x=-50;x<W+50;x+=13+R()*13) S.addCloud(x,10+R()*7,-36-R()*40,R,TH.cloudCol&&mixc(TH.cloudCol,'#ffffff',0.4));
    skyDisc(TH.disc,null,TH.sunY||12.5,lit?1.5:1.15);
    S.addWeather('leaf'); S.addWeather('leaf',{n:14,z:6,size:[0.3,0.2],box:[46,18,4]}); if(lit) S.addWeather('firefly',{n:46});
    for(let x=6;x<W;x+=10+R()*12) S.addShaft(x,4+R()*3,-3.5-R()*2.5,2.4+R()*2.6,10,TH.shaft||'#ffe6a8',-0.6);
    /* crows crossing the sky in threes */
    for(let i=0;i<Math.ceil(W/70);i++){ const g=new T.Group(), parts=[], x0=R()*W, y0=9.5+R()*4, z=-14-R()*10, sp=1.4+R(), ph=R()*9, span=W+60;
      for(let k=0;k<3;k++){ const q=new T.Group(), wl=new T.Mesh(geo('orchardBirdL',()=>orchardBirdWing(-1)),MAT.vox), wr=new T.Mesh(geo('orchardBirdR',()=>orchardBirdWing(1)),MAT.vox);
        q.add(new T.Mesh(geo('orchardBird',orchardBird),MAT.vox),wl,wr); q.position.set(-k*1.5,(k%2)*0.7,-k*0.9); g.add(q); parts.push([wl,wr,k]); }
      g.position.set(x0,y0,z); g.rotation.y=0.9; world.add(g);
      critters.push({tick(dt,time){ g.position.x=((x0+time*sp)%span+span)%span-30; g.position.y=y0+Math.sin(time*0.6+ph)*0.8; for(const p of parts){ const f=Math.sin(time*9+ph+p[2])*0.8; p[0].rotation.z=f; p[1].rotation.z=-f; } }}); }
  },
  /* on the grass: apple trees and maples, hay rolls, scarecrows, a barn now and then, runs of fence, pumpkins, wheat,
     crates of apples and drifts of leaves; at dusk a lantern hangs in every apple tree */
  decor(S,D,R){
    const r=R(), y=D.ty*8, lit=!!TH.lit;
    if(D.wet) return;
    const flat=n=>{ for(let k=-n;k<=n;k++){ if(tileAt(D.x+k,D.ty-1)!==GROUND) return false; const up=tileAt(D.x+k,D.ty); if(up!==AIR&&up!==COIN) return false; } return true; };
    if(((D.x>>3)%3)===1) put(S.near,orchardFence(),D.x*8+4,y,-15.2);
    if(r<0.075&&D.free(8)&&D.open&&flat(1)){ const x=D.jx(), z=D.zb(2.8,5); put(S.flora,orchardAppleTree(R),x,y,z,0.25);
      if(lit){ S.near.push([x-3.7,y+5.6,z+3.6,0.3,2.6,0.3,'#3a2418']); S.glow.push([x-4.5,y+3.6,z+2.8,1.9,2.2,1.9,'#ffcf6a']); lamps.push({x:x/8-0.45,y:D.ty+0.6,z:z/8+0.5,col:0xffc060,power:1.2,reach:6}); } }
    else if(r<0.125&&D.free(9)&&D.open&&flat(1)) put(S.flora,orchardMaple(R,pick(R,orchardMapleCols)),D.jx(),y,D.zb(2.6,5.2),0.25);
    else if(r<0.155&&D.free(3)&&D.open) put(S.near,orchardRoll(),D.jx(),y,D.zb(2.2,4.6));
    else if(r<0.17&&D.free(5)&&D.open) put(S.near,orchardScarecrow(),D.jx(),y,D.zb(2.2,4.4));
    else if(r<0.185&&D.free(7)&&D.open&&flat(2)){ const x=D.x*8+4, z=D.zb(4.2,4.6); put(S.near,orchardBarn(),x,y,z);
      if(lit){ put(S.glow,orchardBarnGlow(),x,y,z); lamps.push({x:x/8,y:D.ty+1,z:z/8+1.2,col:0xffc060,power:1.5,reach:8}); } }
    else if(r<0.27) put(S.near,scaled(orchardPumpkin(),0.7+R()*0.6),D.jx(),y,D.zb(1.3,5.2));
    else if(r<0.4) put(S.flora,orchardWheat(),D.jx(),y,D.zb(1.2,5.4),1.2);
    else if(r<0.47) put(S.near,orchardLeafPile(R),D.jx(),y,D.zb(1.2,5.4));
    else if(r<0.51) put(S.near,orchardCrate(),D.jx(),y,D.zb(1.4,5));
    else if(r<0.6) put(S.flora,dFlower(pick(R,['#ffc928','#ff8f3c','#ffffff','#e8384f'])),D.jx(),y,D.zb(1.2,5.4),1.2);
    const f=R();
    if(f<0.12) put(S.near,orchardLeafPile(R),D.jx(),y,D.zf());
    else if(f<0.19) put(S.near,scaled(orchardPumpkin(),0.5),D.jx(),y,D.zf());
    else if(f<0.28) put(S.flora,scaled(orchardWheat(),0.6),D.jx(),y,D.zf(),1);
  }
};

/* 2-1: Windfall Lane. A bright afternoon and an easy walk, to meet the orchard's hay bales: a hop, a held bounce to a
   loft of planks, bale to bale over the stream, and a pounded bale that throws Blorp to the top of the sky. Old planks
   that crumble, a springshroom up the bank, toffee blobs, and a pipe down to the cider cellar. */
function w2l1(){
  const B=LevelBuilder(262,'orchard');
  B.room(0,229).room(234,261,0,15,true);
  B.ground(0,53).ground(58,79).ground(92,151).ground(156,233);
  B.coins(8,3,3).row(13,5,'?B?').enemy('blob',18).row(22,5,'B?BMB').row(24,9,'?').enemy('blob',28).enemy('puff',32,6,{rx:3});
  /* the first bales: a hop gets nowhere, a held jump gets the planks and their spark */
  B.sign(36,'A hay bale! Land on it to bounce. Hold {jump} as you land to bounce high.');
  B.row(40,2,'JJ').coinCol(40,5,3).coinCol(41,5,3).row(43,9,'=====').coins(43,10,4).spark(47,10);
  B.arc(48,4,5);
  B.sign(51,'Old planks crumble underfoot. Do not dawdle!');
  B.row(54,1,'KKKK').coins(54,3,4);
  B.row(61,5,'?B?').enemy('gloop',66).enemy('puff',70,6,{rx:3}).pipe(74,2,true);
  /* bale to bale over the stream */
  B.sign(77,'Bale to bale, over the stream!');
  B.fill(82,0,83,2,HARD).row(82,3,'JJ').fill(87,0,88,2,HARD).row(87,3,'JJ').coins(84,8,2).coins(89,7,2);
  B.row(95,5,'B?B').enemy('shellby',99);
  B.checkpoint(104);
  /* a springshroom up the bank to the top field */
  B.sign(107,'A springshroom! It throws you right up the bank.');
  B.spring(110).coinCol(110,5,4).ground(112,127,7).row(116,10,'?O?').enemy('gloop',120,7).enemy('puff',124,10,{rx:3});
  B.ground(128,130,5).ground(131,133,3);
  /* a pounded bale throws Blorp higher than anything: the second spark is up there */
  B.sign(136,'Press {down} in the air for a ground pound. Pound a bale, and up you go!');
  B.row(139,2,'J').coinCol(139,6,3).coinCol(139,10,3).spark(139,14).row(142,10,'===').coins(142,11,3);
  B.row(146,5,'?').enemy('blob',149).arc(151,4,6).enemy('snapper',153.5,2,{rise:4});
  B.row(159,5,'B?B').enemy('shellby',162).enemy('gloop',166);
  B.warp(170,2,'in').enemy('blob',175).warp(180,3,'out',true);
  B.row(185,5,'B?B?B').row(187,9,'F').enemy('puff',191,6,{rx:3}).enemy('gloop',195);
  B.ground(200,201,3).ground(202,203,4).ground(204,205,5).ground(206,208,6);
  B.goal(214);
  /* the cider cellar: coins by the crate, and a springshroom up to the third spark */
  B.fill(230,2,233,15,GROUND).fill(234,2,234,15,HARD).fill(261,2,261,15,HARD).ground(234,261);
  B.warp(236,2,'in',true).coinBox(240,3,245,5).row(241,8,'?L?').spring(248).row(250,9,'====').coins(250,10,4).spark(252,13).warp(257,2,'out');
  return B.L;
}

/* 2-2: Sticky Hollow. Later in the afternoon: caramel underfoot, which slows a walk and shortens a jump; a hatch in
   the hillside that lets apples roll down the terraces; pumpkins three high; and the first crow. One spark hangs over
   a stone in the caramel, one over the hollow where only a hop off an apple will reach it, and one is in the hill. */
function w2l2(){
  const B=LevelBuilder(250,'orchard');
  B.ground(0,48).ground(53,118).ground(123,180).ground(185,249);
  B.coins(6,3,3).row(11,5,'?O?').enemy('blob',15).enemy('gloop',20);
  B.sign(24,'Caramel! It is slow to wade through, and a jump from it is a small one.');
  B.sticky(27,1,33,1).coins(28,4,5).enemy('blob',37);
  /* a stone in the caramel is the place to jump from */
  B.sticky(40,1,47,1).row(44,2,'H').coinCol(44,4,2).spark(44,7);
  B.arc(48,4,6).enemy('snapper',50.5,2,{rise:4});
  B.row(56,5,'B?B').enemy('stack',60);
  /* the hatch in the hillside: apples come bouncing down the terraces, and break on the stump at the bottom */
  B.sign(63,'Apples roll out of that hatch. Jump them, or hop on their tops.');
  B.row(66,2,'H');
  B.ground(70,72,3).ground(73,75,4).ground(76,78,5).ground(79,84,6).ground(85,97,8).chute(85,6,4,-1);
  B.coins(87,9,3).row(89,11,'?L?').enemy('gloop',93,8);
  /* down the far side, and a tunnel back into the hill */
  B.ground(98,104,4).clear(92,4,97,5).spark(92,4).coins(93,4,4);
  B.checkpoint(108);
  B.row(111,5,'?M?').enemy('blob',115);
  B.row(119,1,'KKKK').coins(119,3,4).row(121,6,'I');
  B.sign(126,'A crow! It swoops when you walk beneath. Jump it, or land on its back.');
  B.coins(130,3,5).enemy('swoop',138,7,{span:10});
  B.enemy('stack',146).row(149,5,'?B?').pipe(153,3,true);
  /* the hollow: caramel all the way across, apples rolling over it, and a spark that only an apple's back will reach */
  B.row(158,2,'H').sticky(160,1,176,1).ground(177,180,3).chute(177,2,3.8,-1).coins(162,4,2).spark(168,6).coins(173,4,2);
  B.coins(181,6,4).enemy('snapper',182.5,2,{rise:4,phase:0.4});
  B.row(188,5,'?O?').enemy('stack',192).enemy('shellby',197).enemy('swoop',206,7,{span:9});
  B.spring(210).coinCol(210,5,3).row(212,9,'===').coins(212,10,3).row(213,13,'L');
  B.ground(215,216,3).ground(217,218,4).ground(219,221,5);
  B.goal(227);
  return B.L;
}

/* 2-3: Hayloft Hill. Golden hour, and a climb: the first hay cart, caramel walls to kick up between, a Bonk among
   the bricks, a hill of rolling apples with a crow over it, and a cart on rails across the gully, with a spark high
   above it for whoever holds jump. A pipe on the hilltop leads to the hayloft. */
function w2l3(){
  const B=LevelBuilder(258,'orchard',20);
  B.room(0,225,0,19).room(230,257,0,15,true);
  B.ground(0,95).ground(100,229);
  B.coins(6,3,3).row(10,5,'?M?').enemy('blob',14).enemy('boing',19);
  /* the first hay cart, and the planks its bale reaches */
  B.sign(23,'A hay cart! Its bale bounces you like any other. Hold {jump} to go high.');
  B.enemy('orchardCart',26,2,{rx:6}).row(28,9,'=====').coins(28,10,5).row(30,13,'L');
  /* caramel walls: up between the post and the cliff */
  B.sign(37,'Caramel walls hold you fast. Jump at one, then press {jump} to kick away from it.');
  B.sticky(42,5,42,13).ground(46,62,10).sticky(46,2,46,8).coinCol(44,4,5).spark(44,10);
  B.row(50,13,'?F?').enemy('gloop',54,10).enemy('puff',58,13,{rx:3});
  B.ground(63,65,8).ground(66,68,6).ground(69,71,4);
  B.row(76,5,'B?B').fill(81,2,81,3,BRICK).enemy('rammy',86).pipe(91,2,true);
  B.row(96,1,'KKKK').coins(96,3,4);
  B.checkpoint(103);
  /* the apple hill, with a crow over it */
  B.row(106,5,'?').row(109,2,'H');
  B.ground(112,114,3).ground(115,117,4).ground(118,120,5).ground(121,123,6).ground(124,126,7).ground(127,143,9).chute(127,7,3.6,-1);
  B.enemy('swoop',123,12,{span:9});
  B.enemy('boing',131,9).row(133,12,'BOB').warp(137,2,'loft',false,9).warp(141,2,'back',true,9);
  /* the gully: a cart on rails crosses it, a springshroom at each end for whoever falls in */
  B.ground(158,172,9).enemy('orchardCart',145,9,{rx:10,rail:1,sp:0.7,drop:7}).arc(148,12,7).spark(150,16);
  B.spring(146).spring(155).enemy('gloop',150).coins(149,3,4);
  B.enemy('stack',164,9).row(166,12,'?B?').ground(173,175,7).ground(176,178,5).ground(179,181,3);
  B.row(185,5,'?M?').fill(189,2,189,3,BRICK).enemy('rammy',193).enemy('puff',196,6,{rx:2});
  B.ground(199,200,3).ground(201,202,4).ground(203,205,5);
  B.goal(211);
  /* the hayloft: bales in the floor between two caramel posts, and the third spark at the top of them */
  B.fill(226,2,229,19,GROUND).fill(230,2,230,15,HARD).fill(257,2,257,15,HARD).ground(230,257);
  B.warp(232,2,'loft',true).coinBox(236,3,241,4).row(237,7,'?L?').bounce(247,249,1).sticky(246,5,246,14).sticky(250,5,250,14).coinCol(248,4,8).spark(248,14).warp(253,2,'back');
  return B.L;
}

/* 2-4: Sunset Mill Run. The long way over the stream as the sun goes down: planks that crumble with bales between
   them and fish leaping, a hay cart on rails across the wide water, a long hill of apples up to the mill, bales
   stepping down the far side, a Bonk, and a wall of caramel with a bale at its foot. The mill's cellar has a cart
   of its own. */
function w2l4(){
  const B=LevelBuilder(290,'orchard');
  B.room(0,257).room(262,289,0,15,true);
  B.ground(0,27).ground(52,83).ground(102,150).ground(169,261);
  B.coins(5,3,3).row(9,5,'?O?').enemy('stack',14).enemy('swoop',24,7,{span:8});
  /* the long bridge: planks, a bale, planks, a bale, planks */
  B.row(28,1,'KKKK').fill(34,0,35,2,HARD).row(34,3,'JJ').row(38,1,'KKKK').fill(44,0,45,2,HARD).row(44,3,'JJ').row(48,1,'KKKK');
  B.enemy('snapper',32.5,2,{rise:4}).enemy('snapper',42.5,2,{rise:4,phase:0.8}).coins(29,3,2).coins(34,7,2).spark(40,6).coins(44,7,2).coins(49,3,2);
  B.row(55,5,'B?B').enemy('gloop',58).enemy('shellby',63).pipe(68,3,true).sticky(72,1,77,1).enemy('stack',75);
  /* a cart across the wide water */
  B.sign(80,'This cart runs on rails. Bounce along with it, all the way over!');
  B.enemy('orchardCart',85,2,{rx:15,rail:1,sp:0.45}).coins(88,7,3).coins(95,7,3);
  B.checkpoint(106);
  /* the long hill up to the mill */
  B.row(109,5,'?M?').row(112,2,'H');
  B.ground(115,117,3).ground(118,120,4).ground(121,123,5).ground(124,126,6).ground(127,129,7).ground(130,150,9).chute(130,7,3.2,-1);
  B.enemy('swoop',126,12,{span:9}).row(133,12,'?B?').enemy('boing',136,9).warp(140,2,'mill',false,9).enemy('stack',144,9).warp(147,2,'out',true,9);
  /* bales stepping down over the water; the first one, held, reaches the spark */
  B.fill(154,0,155,6,HARD).row(154,7,'JJ').fill(159,0,160,4,HARD).row(159,5,'JJ').fill(164,0,165,2,HARD).row(164,3,'JJ');
  B.coins(156,11,2).spark(157,14).coins(161,9,2).coins(166,7,2);
  B.row(172,5,'B?B').fill(177,2,177,3,BRICK).enemy('rammy',182).enemy('gloop',188).row(191,5,'?O?');
  /* a wall of caramel, too tall to jump: there is a bale at its foot */
  B.row(198,2,'J').coinCol(198,5,4).sticky(202,2,203,8).coins(202,10,2);
  B.enemy('puff',208,6,{rx:3}).enemy('blob',212).enemy('blob',214).row(217,5,'?B?').enemy('swoop',226,7,{span:8});
  B.ground(229,230,3).ground(231,232,4).ground(233,235,5);
  B.goal(241);
  /* the mill cellar: a cart under a loft of planks, and the third spark above the loft */
  B.fill(258,2,261,15,GROUND).fill(262,2,262,15,HARD).fill(289,2,289,15,HARD).ground(262,289);
  B.warp(264,2,'mill',true).enemy('orchardCart',268,2,{rx:11,sp:0.9}).coinBox(270,5,277,6).row(272,9,'====').coins(272,10,4).spark(274,13).warp(285,2,'out');
  return B.L;
}

/* 2-5: Granny's Orchard, at dusk under a harvest moon. A short way through her trees: one hill of apples, a bale in
   the ground to pound for a spark, two caramel posts with another at the top, a last hollow of caramel, and then
   Granny Smash herself, who rolls from wall to wall and shakes apples out of the sky. */
function w2l5(){
  const B=LevelBuilder(194,'orchard');
  B.ground(0,62).ground(67,193);
  B.coins(6,3,3).row(10,5,'?O?').enemy('stack',15).enemy('swoop',26,7,{span:9});
  B.row(31,2,'H').ground(35,37,3).ground(38,40,4).ground(41,43,5).ground(44,57,7).chute(44,5,3.4,-1);
  B.spark(47,10).enemy('gloop',50,7).row(52,10,'B?B').ground(58,60,5).ground(61,62,3);
  B.row(63,1,'KKKK').coins(63,3,4);
  /* a bale in the ground: walk on and it bounces, pound it and the spark is yours */
  B.row(70,5,'?B?').enemy('rammy',76).bounce(82,82,1).coinCol(82,5,4).spark(82,13);
  /* two caramel posts over the path */
  B.sticky(90,5,90,14).sticky(94,5,94,14).coinCol(92,5,6).spark(92,14);
  B.enemy('blob',99).enemy('swoop',108,7,{span:9});
  B.row(112,2,'H').sticky(114,1,123,1).ground(124,128,3).chute(124,2,3.6,-1).enemy('stack',127,3).coins(116,4,2).coins(120,4,2);
  B.checkpoint(133);
  B.row(137,5,'?M?').row(141,5,'I');
  B.sign(143,'Granny Smash! Jump her while she rolls. When she sees stars, stomp her.');
  B.fill(148,2,148,2,HARD).fill(177,2,177,13,HARD).fill(178,2,193,13,GROUND);
  B.boss(170,150,176,9,'apple');
  return B.L;
}

/* ---------- the island on the map ---------- */
/* Granny's tree: an apple tree as big as a barn, hung with lanterns, with her cider press and a hay cart at its foot */
function orchardGrannyTree(){ const t='#7a4a2c',t2='#5f3820',g=['#86b33c','#9ac64a','#6f9f32','#b3d158'], b=[
    [-3,0,-3,6,12,6,t],[-4.4,0,-4,8.8,2,8,t2],[-2.2,12,-2.2,4.4,4,4.4,t2],[2,8,-1,6,2,2,t2],[-8,9,-1,6,2,2,t2],
    [-11,13,-9,22,7,18,g[2]],[-13,15,-8,26,5,16,g[0]],[-10,20,-8,20,5,16,g[1]],[-7,25,-6,14,3.6,12,g[0]],[-4,28.6,-4,8,2.4,8,g[3]]];
  for(const q of [[-10,14.5],[-6,17],[-1,14.2],[4,16.5],[8.4,14.6],[-8,21.5],[-2,22],[5,21.5],[-4,26],[3,25.6],[11,17.5],[-12.6,17]])
    b.push([q[0],q[1],q[1]>=25?6:q[1]>=20?8:Math.abs(q[0]+0.9)>10?8:9,1.8,1.8,0.6,'#e8384f']);
  for(const q of orchardGrannyLamps) b.push([q[0]+0.7,q[1]+2,q[2]+0.7,0.2,13-q[1]-2,0.2,'#3a2418']);
  return b; }
const orchardGrannyLamps=[[-9,9.4,6],[-4.6,8.6,9.6],[2.4,9.2,9.6],[7.6,9.8,6],[-11.6,10.4,1],[10.4,10.2,2]];
function orchardGrannyGlow(){ const b=[]; for(const q of orchardGrannyLamps) b.push([q[0],q[1],q[2],1.6,2,1.6,'#ffcf6a'],[q[0]+0.3,q[1]+0.3,q[2]+1.6,1,1.4,0.1,'#fff3c2']); return b; }
function orchardPress(){ const w='#b5793f',d='#7d4f24',m='#8a8aa3'; return [[-3,0,-2.4,6,1,4.8,d],[-2.6,1,-2,5.2,3.4,4,w],[-2.7,1.8,-2.1,5.4,0.5,4.2,m],[-2.7,3.4,-2.1,5.4,0.5,4.2,m],[-3.4,0,-0.5,0.8,8,1,d],[2.6,0,-0.5,0.8,8,1,d],[-3.4,8,-0.5,6.8,0.9,1,d],
  [-0.4,4.4,-0.4,0.8,5.6,0.8,m],[-2,9.6,-0.3,4,0.5,0.6,m],[2.6,1.2,2,1.6,0.6,0.6,m],[3.2,0,1.6,2,1.6,2,'#c99a5a']]; }
defWorld({name:'Caramel Orchard',theme:'orchard',levels:[w2l1,w2l2,w2l3,w2l4,w2l5],
  map:{
    /* gold stubble, russet leaf-fall and late grass, in patches */
    ground:(h,p)=>[p<0.3?['#e2b84a','#d8ad42']:p<0.52?['#c98a3a','#bf8034']:['#b7c652','#adbc4a'],['#9a6238','#8a5530']],
    pond:['#6fb8c9','#3f8fb0','#2a6a94'],
    scatter(M,c){ const r=c.r, cx=c.cx+0.5, cz=c.cz+0.5;
      /* a barn, and a windmill on the hill */
      if(c.cx===27&&c.cz===40){ M.put(M.land,orchardBarn(),cx,c.y,cz,0.42); M.put(M.glow,orchardBarnGlow(),cx,c.y,cz,0.42); M.put(M.land,orchardSilo(),cx+0.75,c.y,cz-0.1,0.42); return; }
      if(c.cx===24&&c.cz===39){ M.put(M.land,orchardMill(),cx,c.y,cz,0.62); M.spin(M.part(orchardSails(),cx,c.y+19*0.62*S8,cz+4.9*0.62*S8,0.62),'z',0.8); return; }
      /* rows of little apple trees */
      if(c.cx%2===0&&c.cz%2===1&&r<0.85&&c.clear(1.6)) M.put(M.flora,orchardAppleTree(c.R),cx,c.y,cz,0.5,0.2);
      else if(r<0.1) M.put(M.land,orchardRoll(),c.x,c.y,c.z,0.55);
      else if(r<0.2) M.put(M.land,orchardPumpkin(),c.x,c.y,c.z,0.55+c.r2*0.3);
      else if(r<0.26&&c.clear(2.2)) M.put(M.flora,orchardMaple(c.R,pick(c.R,orchardMapleCols)),c.x,c.y,c.z,0.5,0.2);
      else if(r<0.36) M.put(M.flora,orchardWheat(),c.x,c.y,c.z,0.8,1);
      else if(r<0.42) M.put(M.land,orchardFence(),cx,c.y,c.z,0.9);
      else if(r<0.48) M.put(M.land,orchardLeafPile(c.R),c.x,c.y,c.z,0.9);
      if(r>0.92) M.mote({kind:1,x:c.x,y:c.y+0.5+c.r2*0.6,z:c.z,col:pick(c.R,['#ff9a3d','#ffc928','#e2542a']),size:0.05,span:0.8,rate:0.25+c.r2*0.2}); },
    landmark(M,x,y,z){ M.put(M.flora,orchardGrannyTree(),x,y,z-0.2,1,0.08); M.put(M.glow,orchardGrannyGlow(),x,y,z-0.2,1);
      M.put(M.land,orchardPress(),x+0.95,y,z+1.05,0.6); M.put(M.land,orchardCartBody(),x-0.95,y,z+1.1,0.55); M.put(M.land,orchardPumpkin(),x-0.1,y,z+1.25,0.6);
      M.lamp(x,y+1.3,z+1.2,0xffc060,1.5,7); M.lamp(x-1,y+1.4,z+0.4,0xffc060,1,5); }
  }});
