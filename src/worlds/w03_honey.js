/* ================= World 3: Honeycomb Heights ================= */
/* A giant beehive among flower meadows. Outside: daisies and sunflowers as tall as houses, hives like towers on the
   hills, bees in the air. Inside: walls of six-sided comb, cells capped with wax, honey running down everything. The
   pits hold honey, and nobody gets out of that. This is the world that makes honey a tool: sticky floors that slow
   Blorp under a bee, and sticky walls that hold him while he kicks his way up. */

/* ---------- the tune ---------- */
/* @song */
/* F major at a bustle, with the fourth raised wherever the harmony steps up to G: a buzzing sawtooth carries the tune,
   plucked chords answer on the off-beats, the bass hops in octaves, and a shaker and a wood block keep time. */
SONGS.honey=(()=>{
  const h='C5 F5 A5 C6 A5 F5 A5 .  C6 . A5 . G5 A5 F5 .  D5 G5 B5 D6 B5 G5 B5 .  D6 . B5 . A5 B5 G5 . ';
  const a=h+'D6 - Bb5 . D6 C6 Bb5 .  C6 - G5 . C6 Bb5 G5 .  A5 B5 C6 . F6 - E6 C6  G5 - - . C5 E5 G5 . ';
  const a2=h+'D6 - Bb5 . D6 C6 Bb5 .  C6 . E6 . G6 - E6 C6  F6 - - C6 A5 - C6 .  F5 - - . A5 . C6 . ';
  const b='D6 - - A5 F5 - A5 .  D6 E6 F6 - E6 - D6 .  D6 - - Bb5 F5 - Bb5 .  D6 C6 Bb5 - C6 - D6 .  Bb5 - - G5 D5 - G5 .  Bb5 A5 G5 - A5 - Bb5 .  C6 . E6 . G6 . E6 .  Bb5 - G5 - E5 C5 E5 G5 ';
  const ch='F F G G Bb C F C  F F G G Bb C F F  Dm Dm Bb Bb Gm Gm C C7  F F G G Bb C F F';
  const d='k r wr r kn r wr w ', f='k r wr r w w wn wn ';
  return song({key:'F major',bpm:148,ec:0.5,fb:0.24},
    [{w:'sawtooth',v:0.05,det:9,vib:13,vr:4.2,s:0.55,g:0.86,lp:[7,3],e:1,r:0.2},a+a2+b+a2],
    [{w:'triangle',v:0.08,h:2,g:0.3,lp:[6,1.4],pan:0.32,r:0.35},musChord(ch,8,'. x . x . . x .','A3')],
    [{w:'square',v:0.014,g:0.4,pan:-0.35},musArp(ch,8,'5 8 3^ 8 5 8 3^ 8','C4')],
    [{w:'triangle',v:0.23,g:0.55},musArp(ch,8,'1 8 . 8 1 8 5 8','F2')],
    [{dr:1,v:0.8},('kx r wr r kn r wr w '+d.repeat(6)+f).repeat(4)]);
})();
/* @endsong */

/* ---------- models ---------- */
/* a flower as tall as a house: a daisy, a sunflower, a cosmos. The head is a disc that faces the lane. */
function honeyBloom(R,petal,mid,big,face){ const g='#4fae4a',d='#3a8a3a', h=(big?19:13)+((R()*6)|0), s=big?1.25:1, x=(R()-0.5)*2.4, p2=shade(petal,0.9), y=h+1, b=[];
  for(let i=0;i<3;i++) b.push([-0.8+x*i/3,i*h/3,-0.8,1.6,h/3+0.2,1.6,i%2?d:g]);
  b.push([x*0.3,h*0.34,-0.5,4.2,0.7,2.2,g],[x*0.5-4.4,h*0.56,-0.5,4.2,0.7,2.2,d]);
  b.push([x-1.8*s,y+2*s,-0.2,3.6*s,3.6*s,1.4,petal],[x-1.8*s,y-5.6*s,-0.2,3.6*s,3.6*s,1.4,petal],[x+2*s,y-1.8*s,-0.2,3.6*s,3.6*s,1.4,petal],[x-5.6*s,y-1.8*s,-0.2,3.6*s,3.6*s,1.4,petal]);
  b.push([x+1.4*s,y+1.4*s,-0.3,3*s,3*s,1.2,p2],[x-4.4*s,y+1.4*s,-0.3,3*s,3*s,1.2,p2],[x+1.4*s,y-4.4*s,-0.3,3*s,3*s,1.2,p2],[x-4.4*s,y-4.4*s,-0.3,3*s,3*s,1.2,p2]);
  b.push([x-2.2*s,y-2.2*s,-0.4,4.4*s,4.4*s,2.2,mid],[x-1.4*s,y-1.4*s,1.8,2.8*s,2.8*s,0.4,shade(mid,1.18)]);
  if(face) b.push([x-1.1*s,y+0.1*s,2.2,0.7*s,0.9*s,0.15,INK],[x+0.4*s,y+0.1*s,2.2,0.7*s,0.9*s,0.15,INK],[x-0.7*s,y-1*s,2.2,1.4*s,0.35*s,0.15,INK]);
  return b; }
function honeyDaisy(R){ return honeyBloom(R,R()<0.75?'#ffffff':'#ffc2dc','#ffd23e',false,false); }
function honeySunflower(R){ return honeyBloom(R,'#ffc928','#8a5524',true,true); }
/* a straw hive on a board, with a door */
function honeySkep(){ const a='#f2b632',b='#d98a1c', o=[[-3.8,0,-3.4,7.6,0.8,6.8,'#8a5524']], w=[6.4,7,6.4,5.2,3.4]; let y=0.8;
  w.forEach((s,i)=>{ o.push([-s/2,y,-s/2,s,1.5,s,i%2?b:a]); y+=1.5; });
  o.push([-0.9,0.8,3.2,1.8,1.6,0.3,'#4a2608'],[-0.5,8.3,-0.5,1,0.6,1,'#8a5524']); return o; }
function honeyPot(){ return [[-2,0,-2,4,3.4,4,'#d9743a'],[-2.4,3.4,-2.4,4.8,0.8,4.8,'#b85a28'],[-1.6,4.2,-1.6,3.2,0.5,3.2,'#ffb428'],[1,1.8,2,0.8,2,0.2,'#ffb428'],[-1.4,1.2,2,1.6,1.2,0.15,'#fff2c9']]; }
function honeyCandle(h){ return [[-1,0,-1,2,h,2,'#fff2c9'],[-1.4,0,-1.4,2.8,0.6,2.8,'#e8c58a'],[0.5,h-1.8,1,0.6,1.8,0.2,'#ffe9a8'],[-1.2,h-1,-0.4,0.3,1,0.8,'#ffe9a8'],[-0.15,h,-0.15,0.3,0.5,0.3,'#3a2a1a']]; }
function honeyFlame(h){ return [[-0.5,h+0.4,-0.5,1,1.3,1,'#ffc23e'],[-0.25,h+0.8,-0.25,0.5,1.4,0.5,'#fff6d0']]; }
function honeyWax(){ return [[-2.4,0,-1.8,4.8,0.9,3.6,'#f6d98a'],[-1.4,0.9,-1,2.8,0.7,2.2,'#fff0c0']]; }
function honeyStack(){ const k='#8a4f14'; return [[-2.6,0,-1.5,5.2,2.2,3,'#e8a52e'],[-2,2.2,-1.2,4,1.8,2.6,'#f2b632'],[-2,0.5,1.5,1.3,1.2,0.15,k],[0.5,0.5,1.5,1.3,1.2,0.15,k],[-0.7,2.5,1.4,1.3,1.1,0.15,k],[-2.6,2.2,-1.5,0.6,0.2,3,'#ffd76a']]; }
function honeyPollen(){ return [[-2,0,-1.5,4,0.6,3,'#ffd84a'],[-1,0.6,-0.8,2.2,0.5,1.8,'#fff3a0']]; }
function honeyClover(){ return [[-1.8,0,-0.7,3.6,0.7,1.6,'#5fb84a'],[-0.9,0.7,-0.5,1.8,0.6,1.2,'#7fd66a'],[-0.35,1.3,-0.2,0.7,0.7,0.6,'#ffffff']]; }
function honeyDrop(){ return [[-1,-1.6,-0.5,2,2.4,1,'#ffc23e'],[-0.6,0.8,-0.4,1.2,1,0.8,'#ffd76a']]; }
/* Petalpuff in this world is a ball of pollen */
function honeyPuff(){ const y='#ffd84a',l='#fff3a0',o='#ffab1f'; return [[-2.5,1,-2.5,5,5,5,y],[-1.8,0.4,-1.8,3.6,6.2,3.6,y],[-3.1,1.8,-1.8,6.2,3.4,3.6,y],[-1.8,1.8,-3.1,3.6,3.4,6.2,y],
  [-1.6,3.4,2.5,1,1.3,0.15,INK],[0.6,3.4,2.5,1,1.3,0.15,INK],[-0.6,2.4,2.5,1.2,0.4,0.15,INK],[-2.4,2.6,2.5,0.8,0.6,0.1,'#ff9a5c'],[1.6,2.6,2.5,0.8,0.6,0.1,'#ff9a5c'],
  [-3.7,5.2,-0.4,1,1,0.8,l],[2.7,5.6,-0.4,1,1,0.8,l],[-0.5,6.6,-0.5,1,1.2,1,l],[-3.6,0.6,0.6,0.9,0.9,0.9,o],[2.9,1.2,-1.4,0.9,0.9,0.9,o],[0.8,-0.5,1,0.9,0.9,0.9,o],[-1.4,6.3,-2,0.9,0.9,0.9,o]]; }
/* a bee grub: three fat rings and a head with a face */
function honeyGrubModel(){ const c='#fff2c9',d='#f0d49a',k='#7a4a1a'; return [
  [-2,0.3,-3.8,4,3,2.2,d],[-2.5,0,-1.7,5,3.8,2.4,c],[-2.2,0.2,0.6,4.4,3.4,2,d],[-1.9,0.4,2.5,3.8,3.1,1.5,'#ffd98a'],
  ...eye(-1.7,1.7,4,1.5,1.4,0.7,0.7,0.6,0.3),...eye(0.2,1.7,4,1.5,1.4,0.7,0.7,0.2,0.3),[-0.7,0.8,4,1.4,0.4,0.2,k],[-1.9,1.2,4,0.6,0.5,0.1,'#ff9a8a'],[1.3,1.2,4,0.6,0.5,0.1,'#ff9a8a'],
  [-1.8,-0.4,-3,0.8,0.5,0.8,k],[1,-0.4,-3,0.8,0.5,0.8,k],[-2,-0.4,-0.6,0.8,0.5,0.8,k],[1.2,-0.4,-0.6,0.8,0.5,0.8,k],[-1.8,-0.4,1.4,0.8,0.5,0.8,k],[1,-0.4,1.4,0.8,0.5,0.8,k],[-0.4,3.8,-1,0.8,0.5,1,d]]; }

/* ---------- a monster of this world's own ---------- */
/* The grub inches along a ceiling. When Blorp walks beneath it shivers, lets go, and from then on is a slow walker that
   minds its step and can be stomped. Put it in the tile below a ceiling: enemy('honeygrub',x,y,{rx}), where rx is how far
   it creeps either way. */
defEnemy('honeygrub',{w:0.8,h:0.5,stomp:true,fly:true,
  init(e,d){ e.ox=d.x; e.rx=d.rx===undefined?1.5:d.rx; e.y=d.y+0.5; e.st=0; e.stT=0; e.dir=-1; e.vx=0; },
  mesh:()=>G1('honeygrub',honeyGrubModel),
  tick(e,dt){ const p=player;
    if(e.st===0){ const nx=e.x+Math.max(0,Math.sin(e.t*4.5))*0.9*e.dir*dt, ax=Math.floor(nx+e.dir*0.45);
      if(Math.abs(nx-e.ox)>e.rx||!solidAt(ax,Math.floor(e.y+0.6))||solidAt(ax,Math.floor(e.y+0.2))) e.dir=-e.dir; else e.x=nx;
      if(!p.dead&&Math.abs(p.x-e.x)<0.75&&p.y<e.y&&e.y-p.y<9){ e.st=1; e.stT=0.4; if(onScreen(e)){ soundAt(e.x); sfx.squelch(); } } }
    else if(e.st===1){ e.stT-=dt; if(e.stT<=0){ e.st=2; e.vx=0; e.vy=0; } }
    else if(e.st===2){ walk(e,dt); if(e.onGround){ e.st=3; e.vx=(p.x<e.x?-1:1)*1.1; } }
    else { if(ledgeAhead(e)) e.vx=-e.vx; walk(e,dt); } },
  anim(e,m,dt,time){ const hang=e.st<2;
    m.rotation.z=hang?Math.PI:0; m.position.y=hang?e.y+e.h:e.y; m.position.x=e.x+(e.st===1?Math.sin(time*70)*0.05:0);
    m.rotation.y=(hang?-1:1)*((e.st===3?e.vx:e.dir)>0?1:-1)*1.2; const k=1+Math.sin(e.t*4.5)*0.08; m.scale.set(1,1/k,k); }});

/* ---------- looks for ledges ---------- */
/* one-way ledges are slabs of comb: a row of cells along the edge, some of them full */
SEMI_LOOKS.honeycomb=function(g,part){ const c='#ffcf4a',l='#fff0a8',d='#c9841a';
  PX(g,c,0,0,16,16); PX(g,l,0,0,16,1); PX(g,d,0,7,16,1);
  if(part===0){ for(let y=1;y<16;y+=5) for(let x=((y/5|0)%2)*4;x<16;x+=8){ PX(g,d,x+1,y,3,1); PX(g,d,x,y+1,1,2); PX(g,d,x+4,y+1,1,2); PX(g,d,x+1,y+3,3,1); PX(g,l,x+1,y+1,3,2); } return; }
  for(let x=0;x<16;x+=4){ PX(g,d,x+1,2,2,1); PX(g,d,x,3,1,2); PX(g,d,x+3,3,1,2); PX(g,d,x+1,5,2,1); PX(g,'#ffb02e',x+1,3,2,2); }
  if(part===2){ PX(g,INK,5,3,2,2); PX(g,INK,9,3,2,2); } };
SEMI_UNDER.honeycomb='#a8641a';

/* ---------- scenery helpers ---------- */
/* a wall of comb: a slab, and on it cell after cell in rows that lock together. Most are open and dark, some are
   capped with pale wax, some brim with honey and glow. */
function honeyWall(S,R,x0,x1,y0,y1,z){
  const far=S.far, glow=S.glowFar, cw=2.4, ch=1.5, dim=!!TH.dark;
  far.push([x0,y0,z-2,x1-x0,y1-y0,2,dim?'#b97a22':'#c98a2a']);
  for(let j=0,y=y0;y+1.95<=y1;y+=ch,j++) for(let x=x0+(j%2?cw/2:0);x+cw<=x1;x+=cw){
    const r=R();
    if(r<0.17){ const c=r<0.09?'#f6d98a':'#eec66a'; far.push([x+0.65,y+0.04,z,1.1,1.86,0.28,c],[x+0.14,y+0.47,z,2.12,1,0.28,c]); }
    else if(r<0.23){ glow.push([x+0.65,y+0.04,z,1.1,1.86,0.07,'#f0a01c'],[x+0.14,y+0.47,z,2.12,1,0.07,r<0.2?'#f0a01c':'#f7b436']); }
    else { const c=r<0.66?'#8a4f14':'#7a4410'; far.push([x+0.65,y+0.04,z,1.1,1.86,0.05,c],[x+0.14,y+0.47,z,2.12,1,0.05,c]); }
  }
}
/* a hive like a tower: a dome of straw in bands, with a door at its foot */
function honeyTower(S,x,y,z,r,lit){ const f=[0.9,1,1,0.94,0.84,0.68,0.46,0.22], bh=r*0.36, a='#f2b632', b='#d98a1c';
  f.forEach((k,i)=>{ const w=r*2*k; S.far.push([x-w/2,y+i*bh,z-w/2,w,bh*1.02,w,i%2?b:a]); if(i<7) S.far.push([x-w/2-r*0.04,y+(i+0.86)*bh,z-w/2-r*0.04,w+r*0.08,bh*0.14,w+r*0.08,'#ffd76a']); });
  S.far.push([x-r*0.1,y+8*bh,z-r*0.1,r*0.2,bh*0.5,r*0.2,'#8a5524']);
  const dw=r*0.5, dh=bh*1.5; S.far.push([x-dw/2-r*0.06,y,z+r*0.9,dw+r*0.12,dh+r*0.06,r*0.06,'#8a5524']);
  (lit?S.glowFar:S.far).push([x-dw/2,y,z+r*0.93,dw,dh,r*0.05,lit?'#ffd27a':'#4a2608']);
  if(lit) for(const q of [[-0.5,2.6],[0.4,3.7],[-0.1,5]]) S.glowFar.push([x+q[0]*r-r*0.08,y+q[1]*bh,z+r*f[Math.floor(q[1])]+0.02,r*0.16,bh*0.5,0.05,'#ffd27a']); }
/* bees about their business behind the lane: half the size of a Buzzby, and never in the way */
function honeyBees(R,n,x0,x1,y0,y1){
  for(let i=0;i<n;i++){ const g=new T.Group(), body=new T.Mesh(geo('honeyBee',mBuzz),MAT.vox), wl=new T.Mesh(geo('honeyBeeWL',()=>mBuzzWing(-1)),MAT.soft), wr=new T.Mesh(geo('honeyBeeWR',()=>mBuzzWing(1)),MAT.soft);
    wl.position.set(-1.6*S8,5*S8,-0.4*S8); wr.position.set(1.6*S8,5*S8,-0.4*S8); g.add(body,wl,wr);
    const cx=x0+R()*(x1-x0), cy=y0+R()*(y1-y0), z=-3.6-R()*3.6, ph=R()*9, sp=0.6+R()*0.6, rx=2+R()*3; g.position.set(cx,cy,z); g.scale.setScalar(0.4+R()*0.12); world.add(g);
    critters.push({tick(dt,time){ const a=time*sp+ph; g.position.x=cx+Math.sin(a)*rx; g.position.y=cy+Math.sin(a*2.1)*0.7; g.rotation.y=Math.cos(a)>0?1.2:-1.2; const f=Math.sin(time*40+ph)*0.8; wl.rotation.z=f; wr.rotation.z=-f; }}); } }

/* what the three indoor looks share: wax underfoot, a wall of comb close behind, amber light */
const honeyIn={inside:true, air:'hum', back:-3.4, fringe:null, cloud:0, spokes:0, rays:0,
  top:'#eebf52', topS:['#f6cc66','#e2b044','#f2c65c','#ffd97a'], dirt:'#b97a2c', dirtS:['#a96c24','#c98a38','#9a5e1c'], cap:'#eebf52', capL:'#fff0a8', capD:'#8a5210',
  sky:['#5a3410','#b8741e','#ffc24a'], fog:0xc98a2a, fogNear:16, fogFar:110, hemiSky:0xffe6b0, hemiGround:0xc98a3a, hemiI:0.6, sunI:0.55, sunCol:0xffd08a, sunDir:[-0.4,0.8,0.5],
  glowCol:0xffc24a, sunGlow:0.4, bloom:0.72, hi:0.26, grade:{shadow:[1.05,0.95,0.84],high:[1.08,1.01,0.9]}};

THEMES.honey={ music:'honey', air:'birds',
  sky:['#3f9cf0','#a8dcff','#fff6cf'], skyMid:0.52, glowCol:0xfff1b0, sunGlow:0.9, cloud:0.45, cloudShade:'#ffe9b8', cloudY:0.66, spokes:0.45,
  fog:0xf4efc4, fogNear:18, fogFar:150,
  hemiSky:0xffffff, hemiGround:0xe6d8a0, hemiI:0.62, sunI:0.72, sunCol:0xfff0cc, sunDir:[-0.45,0.76,0.5],
  top:'#86d456', topS:['#98e068','#74c448','#8cda5e','#aaec7a'], dirt:'#c48a4a', dirtS:['#b47a3e','#d49a5a','#a46a34'], cap:'#86d456', capL:'#b8f08a', capD:'#4c9a38',
  brick:['#e8697f','#b03a58','#ffb0c0'], hard:['#c98a45','#f0bd7a','#8a5524'], pipe:['#6cc24e','#c6f29a','#3e8a32','#1d4a1c'],
  semi:'honeycomb', plat:['#ffe9a8','#d99a2e'], dust:'#fff3c2', back:-6, fringe:['#98e068','#74c448','#ffe14d','#b2ec8a'],
  liquid:{kind:'honey',a:'#ffb428',b:'#ffe9a0',op:1,mask:0.6,mirror:0.3,glint:'#fff6d0',flow:0.3},
  bounce:{kind:'jelly',cols:['#ffe98a','#fffbd6','#f0b93a']}, bounceCol:'#fff3c2', stickyCol:'#ffc23e', geyser:['#ffb428','#ffe9a0'],
  disc:['#ffe14d','#fff3a0','#e08a12'], bloom:0.9, hi:0.14, rays:0.3, grade:{shadow:[0.98,0.97,1.03],high:[1.05,1.02,0.95]},
  skins:{puff:honeyPuff},
  /* midday in the meadow; the gold of late afternoon; the amber dusk inside the hive; deeper in, by candlelight;
     and the climb, which comes out on the roof at sunset */
  looks:[null,
    {sky:['#4a94e6','#b6dcf2','#ffe7a0'],fog:0xf6e4a8,sunCol:0xffe4a8,sunDir:[-0.6,0.6,0.5],cloud:0.55,cloudCol:'#fff6dc',cloudShade:'#ffd98a',glowCol:0xffe08a,rays:0.42,
      disc:['#ffd23e','#fff0a0','#d97a12'],grade:{shadow:[1.0,0.96,1.0],high:[1.07,1.02,0.92]}},
    honeyIn,
    Object.assign({},honeyIn,{dark:0.5,darkAmb:0x8a5420,hemiI:0.52,sunI:0.42,fog:0x8a5216,sky:['#3a200a','#8a5216','#d99a2e'],grade:{shadow:[1.06,0.93,0.8],high:[1.1,1.0,0.86]}}),
    Object.assign({},honeyIn,{dusk:true,sky:['#4a3a8f','#e8707a','#ffc97a'],skyMid:0.45,fog:0xf0a878,fogNear:18,fogFar:150,sunCol:0xffb890,hemiSky:0xffd9c0,hemiGround:0xc98a4a,hemiI:0.58,sunI:0.6,sunDir:[-0.7,0.42,0.5],
      glowCol:0xff9a50,sunGlow:1,disc:['#ff9a3d','#ffd27a','#b3520f'],cloud:0.5,cloudCol:'#ffd9c0',cloudShade:'#e87a8a',cloudY:0.5,rays:0.5,stars:0.25,grade:{shadow:[1.02,0.93,1.0],high:[1.09,1.0,0.9]}})],
  /* Outside: a meadow running back to hills with hives on them, the great hive on the horizon, flowers as tall as
     houses on the far side of the path, bees, and pollen on the wind. Inside: a wall of comb close behind the lane,
     honey running down it and dripping, lanterns of lit cells, and gold dust in the air. A level that says `roof` is
     inside up to that height and out in the evening above it. */
  scenery(S,R){
    const W=S.W, L=S.L, far=S.far, inside=!!TH.inside, roof=L.roof, hasRoof=roof!==undefined, gy=hasRoof?roof:L.liquidY, bk=TH.back||-2.5;
    if(inside){
      const top=hasRoof?roof-0.4:S.H+12, z=bk-0.06;
      honeyWall(S,R,-24,W+24,-9,top,z);
      for(let x=-10+R()*8;x<W+10;x+=7+R()*9){ const y1=Math.min(top-1,7+R()*(S.H-4)), len=4+R()*7;
        S.glowFar.push([x,y1-len,z+0.34,0.5,len,0.1,'#ffb428'],[x-0.12,y1-len-0.35,z+0.34,0.74,0.5,0.14,'#ffcf5a']);
        const m=new T.Mesh(geo('honeyDrop',honeyDrop),MAT.glow), ph=R(), sp=0.22+R()*0.2, y0=y1-len-0.5, fall=Math.min(9,y0+7); m.position.set(x+0.25,y0,z+0.5); world.add(m);
        critters.push({tick(dt,time){ const u=(time*sp+ph)%1; m.position.y=y0-u*u*fall; }}); }
      for(let x=3+R()*5;x<W;x+=8+R()*6) for(let y=4.6+R()*2;y<top-3;y+=8+R()*4){
        far.push([x-0.75,y-0.25,z,1.5,0.25,0.5,'#8a5524'],[x-0.75,y+1.5,z,1.5,0.25,0.5,'#8a5524']); S.glowFar.push([x-0.55,y,z+0.1,1.1,1.5,0.3,'#ffd76a'],[x-0.3,y+0.3,z+0.4,0.6,0.9,0.08,'#fff6d0']);
        lamps.push({x,y:y+0.7,z:z+1.4,col:0xffc24a,power:1.4,reach:9}); }
      S.addWeather('spore',{n:70,cols:['#ffd23e','#fff3a0','#ffb02e'],size:[0.08,0.08],box:[46,22,6],z:-0.5});
      S.addWeather('dust',{n:24,z:6,size:[0.16,0.16],cols:['#ffe9a0','#ffd23e'],op:0.5,box:[46,18,4]});
      if(!hasRoof){ for(let x=6+R()*10;x<W;x+=15+R()*14) S.addShaft(x,3+R()*4,bk+1,2.4+R()*2,11,'#ffc24a',-0.3); return; }
      /* the top of the hive, curving away behind the roof */
      ['#eebf52','#e2ae40','#d99a2e','#c98a2a'].forEach((c,k)=>far.push([-60,roof-40,bk-7-k*5,W+120,39.4-k*k*1.1,5,c]));
    }
    const lit=!!TH.dusk, greens=lit?['#5a9a5a','#4f8f58','#66a460']:['#86d456','#7ccc50','#92dc62'];
    if(hasRoof){
      /* from the roof: other hives standing up out of the evening, the land far below, cloud drifting past at eye level */
      far.push([-240,roof-48,-300,W+480,2,240,'#5a8f5a']);
      for(let x=-140;x<W+140;x+=34+R()*30) hill(far,x,roof-38+R()*8,-110-R()*60,34+R()*30,pick(R,greens),R,false);
      for(let i=0;i<8;i++){ const x=-46+i*(W+92)/7+(R()-0.5)*8, z=-34-R()*50, r=4+R()*5.5, y=roof-12-R()*20;
        honeyTower(S,x,y,z,r,true); far.push([x-r*0.88,y-60,z-r*0.88,r*1.76,60.1,r*1.76,'#d98a1c'],[x-r*0.9,y-8,z-r*0.9,r*1.8,1,r*1.8,'#f2b632'],[x-r*0.9,y-17,z-r*0.9,r*1.8,1,r*1.8,'#f2b632']); }
      for(let x=-60;x<W+60;x+=9+R()*9) S.addCloud(x,roof-9+R()*15,-24-R()*56,R,pick(R,['#ffd9c0','#ffc2b0','#fff0dc']));
      skyDisc(TH.disc,null,roof+5.5);
      S.addWeather('dust',{n:60,cols:['#ffe14d','#fff3a0','#ffc928'],size:[0.09,0.09],op:0.9,vel:[0.6,0.1,0]});
      honeyBees(R,5,4,W-4,roof+3,roof+7);
      return;
    }
    /* the meadow: its bank along the back of the path, then stripes of grass rising a little toward the hills, and
       flowers by the hundred, too far off to be more than dots */
    far.push([-90,gy-6,bk-0.4,W+180,6.4,0.36,'#b47a3e']);
    for(let k=0;k<8;k++) far.push([-120,gy-6,bk-0.4-(k+1)*17,W+240,6.45+k*0.55,17,greens[k%3]]);
    for(let i=0;i<W*1.3;i++){ const z=bk-1-R()*R()*70, x=-30+R()*(W+60), y=gy+0.45+Math.floor((bk-0.4-z)/17)*0.55, s=0.3+R()*0.3;
      far.push([x,y,z,s,s,s,pick(R,['#ffffff','#ffe14d','#ff9fc6','#ffffff','#ffc928','#b58cff'])]); }
    for(let x=-60;x<W+60;x+=20+R()*22){ const z=-46-R()*40, w=18+R()*20, top=gy+5+R()*8;
      hill(far,x,top,z,w,pick(R,greens),R,false);
      if(R()<0.62) honeyTower(S,x+(R()-0.5)*w*0.25,top-0.4,z+0.4,2.2+R()*1.8,lit);
      for(let k=0;k<3;k++){ const px=x+(R()-0.5)*w*0.6, c=pick(R,['#ffffff','#ffc928','#ff9fc6']); far.push([px-0.15,top-2,z+1.8,0.3,3.2,0.3,'#4fae4a'],[px-0.9,top+0.9,z+1.7,1.8,1.8,0.5,c],[px-0.35,top+1.45,z+2.2,0.7,0.7,0.2,c==='#ffc928'?'#8a5524':'#ffd23e']); } }
    /* the great hive, nearer in the second level than in the first */
    if(L.stage) honeyTower(S,W*0.6,gy+3,-70,17,true); else honeyTower(S,W*0.58,gy+3,-98,13,false);
    for(let x=-16;x<W+16;x+=9+R()*11){ const z=-8.4-R()*9, k=1.5+R()*1.3;
      put(S.flora,scaled(R()<0.4?honeySunflower(R):honeyDaisy(R),k),x*8,(gy+0.45)*8,z*8,0.18); }
    for(let x=-50;x<W+50;x+=13+R()*13) S.addCloud(x,gy+9+R()*8,-36-R()*40,R,TH.cloudCol&&mixc(TH.cloudCol,'#ffffff',0.5));
    skyDisc(TH.disc,null,gy+13.4);
    S.addWeather('dust',{n:90,cols:['#ffe14d','#fff3a0','#ffc928','#ffffff'],size:[0.09,0.09],op:0.9,vel:[0.5,-0.12,0]});
    S.addWeather('petal',{n:22,cols:['#ffffff','#fff3a0','#ffd0e4']});
    S.addWeather('dust',{n:14,z:6,size:[0.2,0.2],cols:['#ffe14d','#fff3a0'],op:0.6,box:[46,18,4]});
    for(let x=10;x<W;x+=14+R()*14) S.addShaft(x,gy+4+R()*3,-3.5-R()*2,2.2+R()*2,9,'#fff1c8',-0.42);
    honeyBees(R,Math.ceil(W/20),0,W,gy+3.5,gy+8);
  },
  /* on the grass: giant daisies and sunflowers, straw hives, clover and small flowers. On the wax: candles, pots of
     honey, stacks of comb, heaps of pollen. */
  decor(S,D,R){
    const r=R(), y=D.ty*8, L=S.L;
    if(D.wet) return;
    if(TH.inside){
      const out=L.roof!==undefined&&D.ty>=L.roof;
      if(r<(TH.dark?0.11:0.07)&&D.free(2)&&!out){ const x=D.jx(), z=D.zb(1.4,2.7), h=3.5+R()*3; put(S.near,honeyCandle(h),x,y,z); put(S.glow,honeyFlame(h),x,y,z); lamps.push({x:x/8,y:D.ty+h/8+0.3,z:z/8,col:0xffc24a,power:1.2,reach:7}); }
      else if(r<0.17&&D.free(2)) put(S.near,honeyPot(),D.jx(),y,D.zb(1.5,2.8));
      else if(r<0.29) put(S.near,honeyWax(),D.jx(),y,D.zb(1.3,2.9));
      else if(r<0.36&&D.free(2)) put(S.near,honeyStack(),D.jx(),y,D.zb(1.5,2.8));
      else if(r<0.46) put(S.near,honeyPollen(),D.jx(),y,D.zb(1.3,2.9));
      else if(r<0.5&&out&&D.free(3)) put(S.near,honeySkep(),D.jx(),y,D.zb(1.8,2.8));
      const f=R(); if(f<0.1) put(S.near,honeyPollen(),D.jx(),y,D.zf()); else if(f<0.16) put(S.near,scaled(honeyWax(),0.7),D.jx(),y,D.zf());
      return;
    }
    if(r<0.075&&D.free(8)&&D.open) put(S.flora,honeyDaisy(R),D.jx(),y,D.zb(2.6,5.2),0.3);
    else if(r<0.115&&D.free(9)&&D.open) put(S.flora,honeySunflower(R),D.jx(),y,D.zb(3,5.2),0.25);
    else if(r<0.155&&D.free(3)) put(S.near,honeySkep(),D.jx(),y,D.zb(1.9,4.8));
    else if(r<0.3) put(S.flora,dFlower(pick(R,['#ffffff','#ffe14d','#ff9fc6','#b58cff','#ff8f3c'])),D.jx(),y,D.zb(1.2,5.4),1.2);
    else if(r<0.42) put(S.near,honeyClover(),D.jx(),y,D.zb(1.2,5.4));
    else if(r<0.48) put(S.near,dRock(pick(R,['#d9cfb8','#c4b89a'])),D.jx(),y,D.zb(1.3,5));
    else if(r<0.58) put(S.flora,dTuft(pick(R,['#74c448','#98e068'])),D.jx(),y,D.zb(1.2,5.4),1.4);
    const f=R();
    if(f<0.13) put(S.near,honeyClover(),D.jx(),y,D.zf());
    else if(f<0.23) put(S.flora,dFlower(pick(R,['#ffffff','#ffe14d','#ff9fc6'])),D.jx(),y,D.zf(),1);
  }
};

/* 3-1: clover meadow, at midday. The first bee, the first puddle of honey, the honey river, royal jelly to bounce on, and
   the first honey walls: a pair to kick up for a spark, then a pair on the way, where a cliff is too tall to jump. */
function w3l1(){
  const B=LevelBuilder(264,'honey');
  B.room(0,231).room(236,263,0,15,true);
  B.ground(0,52).ground(56,93).ground(99,141).ground(156,235);
  B.coins(6,3,3).row(11,5,'?M?');
  B.sign(16,'A Buzzby! It shivers, then dives at where you stand. Keep moving, and hop on its back when it comes low.');
  B.enemy('buzz',23,6.5).coins(27,3,3);
  /* the first honey: a puddle, somewhere safe */
  B.sign(31,'Honey is sticky. It slows your feet, and a jump out of it is a small one.');
  B.sticky(34,1,39,1).coins(35,3,4);
  B.row(43,5,'B?B').enemy('gloop',46);
  B.sign(49,'The river is honey too, and deep. Nobody gets out of that: jump it!');
  B.arc(52,3,5).row(59,5,'?').enemy('gloop',62);
  /* a puddle under a bee: wade, but do not dawdle */
  B.sticky(65,1,70,1).enemy('buzz',68,7).coins(66,3,4).enemy('puff',75,6,{rx:3});
  /* royal jelly: a hop gets nowhere, a held jump gets the ledge and its spark */
  B.sign(78,'Royal jelly! Land on it to bounce. Hold {jump} as you land to bounce high.');
  B.row(81,2,'JJ').coinCol(81,5,3).coinCol(82,5,3).row(84,9,'=====').coins(85,10,3).spark(86,11).enemy('gloop',89);
  /* a wider reach of the river, with a block of jelly on a post in the middle */
  B.fill(96,0,96,1,HARD).row(96,2,'J').arc(94,6,5);
  B.row(102,5,'?O?').enemy('gloop',105);
  /* the first honey walls: the low road walks under them, the high road is up between them */
  B.sign(108,'Honey walls hold on to you. Jump at one, then press {jump} to kick across to the other, and up you go.');
  B.sticky(112,4,112,12).sticky(116,4,116,12).coinCol(114,4,8).row(117,12,'====').coins(117,13,2).spark(119,14);
  B.checkpoint(124);
  B.row(128,5,'B?B').enemy('gloop',131).pipe(135,2,true);
  /* the wide river: a ledge that slides, and a ball of pollen to bounce off */
  B.plat(143,2,3,'x',7,1.1).enemy('puff',149,6.5,{rx:2}).coins(144,4,3).coins(151,4,3);
  B.row(159,5,'?B?').enemy('gloop',162);
  B.warp(166,2,'in').enemy('buzz',171,7).warp(176,3,'out',true);
  B.row(180,5,'?').row(180,9,'I');
  /* a cliff too tall to jump: kick up between the honey wall and the cliff's honeyed face */
  B.sticky(184,4,184,10).fill(188,2,197,7,GROUND).sticky(188,2,188,7).coinCol(186,3,6);
  B.row(191,11,'?M?').enemy('gloop',194,8).coins(199,3,3);
  B.stairs(204,5).fill(209,2,209,6,HARD);
  B.goal(215);
  /* a cellar of honey pots: jelly, coins, and a spark at the top of the bounce */
  B.fill(232,2,235,15,GROUND).fill(236,2,236,15,HARD).fill(263,2,263,15,HARD).ground(236,263);
  B.warp(238,2,'in',true).warp(259,2,'out').coinBox(242,3,247,4).row(243,7,'?L?').row(250,2,'J').coinCol(250,5,5).spark(250,11).row(253,9,'===').coins(253,10,3);
  return B.L;
}

/* 3-2: the pollen fields, in the gold of the afternoon. Prickles that spit seeds, bees in pairs, wax comb that crumbles
   underfoot, a honey spout, a pollen pod that fires Blorp over the lake, and a climb with one honey wall and one plain. */
function w3l2(){
  const B=LevelBuilder(262,'honey',20);
  B.ground(0,43).ground(54,87).ground(100,159).ground(170,261);
  B.coins(5,3,3).row(9,5,'?O?');
  B.sign(14,'A Prickle spits seeds, and is too thorny to stomp. Watch where a seed lands, then jump clean over the Prickle.');
  B.enemy('prickle',21).coins(25,3,3);
  B.row(33,5,'B?B').enemy('buzz',31,6.5).enemy('buzz',36,8.5);
  /* the first wax bridge, with a spark hung over the middle of it */
  B.sign(40,'Wax comb crumbles under your feet. Keep moving!');
  B.row(44,1,'KKKKKKKKKK').coins(45,3,3).coins(51,3,2).spark(49,4);
  B.row(57,5,'?B?').enemy('gloop',60).enemy('gloop',64);
  /* a honey spout up to a terrace, and at the end of the terrace a pod */
  B.geyser(69,2,6,4.5).coinCol(69,4,4).fill(72,2,87,7,GROUND);
  B.row(75,11,'?M?').enemy('gloop',78,8);
  B.sign(82,'A pollen pod! Hop in, hold on, and out you pop.',8);
  B.pod(86,8,40,24).arc(90,12,6).coins(98,10,2).coins(102,6,2);
  B.row(113,5,'B?B').enemy('gloop',116).enemy('prickle',121);
  B.checkpoint(126);
  /* one honey wall and one of plain wood */
  B.sign(130,'One honey wall will do. Kick off it to the plain post, and quickly back again.');
  B.fill(134,4,134,12,HARD).fill(138,2,147,8,GROUND).sticky(138,2,138,8).coinCol(136,3,7);
  B.row(141,12,'?F?').enemy('gloop',144,9).enemy('buzz',142,13.5).enemy('buzz',146,15.5).coins(149,3,3);
  /* the wax stair: the low road is a bridge that crumbles, the high road is steps that crumble, up to a spark */
  B.row(160,1,'KKKKKKKKKK').coins(162,3,6);
  B.row(158,4,'KK').row(162,6,'KK').row(166,8,'KK').row(170,9,'===').coins(158,5,2).coins(162,7,2).coins(166,9,2).spark(171,10);
  B.row(175,5,'?B?').enemy('gloop',178).pipe(183,3,true);
  /* a tall spout: from the very top of it, a jump reaches a ledge above the screen */
  B.geyser(189,2,8,4.5,1).coinCol(189,4,6).row(191,12,'===').spark(192,13);
  B.row(197,5,'?O?').enemy('prickle',203);
  /* a long puddle under two bees */
  B.sticky(207,1,214,1).enemy('buzz',209,7).enemy('buzz',213,9).coins(208,3,6);
  /* a ball of pollen to bounce off, up to a ledge of coins */
  B.enemy('puff',220,6.5,{rx:1}).row(223,9,'===').coins(223,10,3).row(224,13,'I');
  B.stairs(228,5).fill(233,2,233,6,HARD);
  B.goal(239);
  return B.L;
}

/* 3-3: into the hive, through the comb halls. Grubs on the ceilings of a low corridor, then the honey shaft: a zigzag of
   honey patches to kick up, to a floor above the hall. Under that floor is a cellar that only a hole leads down to. */
function w3l3(){
  const B=LevelBuilder(278,'honey',22);
  B.room(0,245).room(250,277,0,15,true);
  B.ground(0,61).ground(67,173).ground(193,249);
  B.coins(5,3,3).row(9,5,'?O?').enemy('gloop',15);
  /* the corridor, and the first grubs */
  B.fill(21,7,57,21,GROUND);
  B.sign(23,'Grubs creep along the ceiling and let go when you walk beneath. Keep moving, then hop on one once it has landed.');
  B.enemy('honeygrub',30,6,{rx:2}).coins(28,3,4);
  B.sticky(37,1,42,1).enemy('honeygrub',40,6,{rx:1.5}).coins(38,3,4);
  B.row(46,5,'?').enemy('spikit',51).enemy('honeygrub',54,6,{rx:2});
  /* a wax bridge under a moth */
  B.row(62,1,'KKKKK').coins(62,3,5).spark(64,5).enemy('batty',64,7.5,{rx:3,ry:0.8});
  B.pipe(71,3,true).row(75,5,'B?B');
  /* the honey shaft */
  B.sign(77,'A honey shaft. Kick from wall to wall: the honey will hold you while you look for the next patch.');
  B.fill(80,5,80,21,HARD).fill(85,2,85,13,HARD).fill(85,18,85,21,HARD);
  B.sticky(85,3,85,5).sticky(80,6,80,8).sticky(85,9,85,11).sticky(80,12,80,14).sticky(80,18,80,19).sticky(85,18,85,19);
  B.coinCol(82,4,3).coinCol(83,9,3).coinCol(82,14,2).spark(82,20);
  /* the floor above, and the cellar under it */
  B.fill(86,12,168,13,GROUND).clear(118,12,119,13).fill(150,2,150,11,HARD);
  B.checkpoint(90,14);
  B.row(95,17,'?M?').enemy('gloop',99,14).enemy('gloop',107,14).enemy('buzz',111,18.5).coins(117,15,1).coins(120,15,1).coinCol(118,8,3);
  B.enemy('prickle',125,14).sticky(131,13,136,13).enemy('buzz',133,18).enemy('buzz',137,20).coins(132,15,4);
  B.row(141,17,'B?B').enemy('gloop',145,14).warp(156,2,'up',true,14).coins(161,15,4);
  B.spark(89,3).coins(92,3,5).row(97,5,'?L?').enemy('gloop',104).enemy('honeygrub',110,11,{rx:3}).enemy('gloop',128).coinBox(132,3,137,4).warp(144,2,'up');
  B.warp(160,2,'in').coins(153,3,5);
  /* the honey lake: two ledges that slide, and a bee over the middle */
  B.plat(175,2,3,'x',5,1.1).plat(184,2,3,'x',5,1.1,1.6).enemy('buzz',183,8).coins(177,4,2).coins(186,4,2);
  B.row(197,5,'?O?').warp(203,3,'out',true).enemy('gloop',208);
  B.fill(211,7,219,8,HARD).enemy('honeygrub',215,6,{rx:3}).enemy('spikit',217).coins(213,3,5);
  B.stairs(222,5).fill(227,2,227,6,HARD);
  B.goal(233);
  /* a larder: a pair of honey walls up to a shelf of coins */
  B.fill(246,2,249,21,GROUND).fill(250,2,250,21,HARD).fill(277,2,277,21,HARD).ground(250,277);
  B.warp(252,2,'in',true).warp(273,2,'out').sticky(258,4,258,11).sticky(262,4,262,11).coinCol(260,3,9).row(263,11,'=====').coinBox(263,12,267,13).row(266,5,'?L?').coins(256,3,1).coins(269,3,3);
  return B.L;
}

/* 3-4: the royal cellars, by candlelight. Stepping stones of honey where every jump is a small one, a wall that only
   royal jelly will clear, a pod up to a gallery, jelly on posts over the honey lake, and a second, taller shaft. */
function w3l4(){
  const B=LevelBuilder(290,'honey',20);
  B.room(0,257).room(262,289,0,15,true);
  B.ground(0,43).ground(61,83).ground(87,88).ground(93,133).ground(153,261);
  B.coins(4,3,3).row(8,5,'?O?').enemy('gloop',14);
  /* a long puddle under two bees */
  B.sticky(22,1,31,1).enemy('buzz',25,6.5).enemy('buzz',30,8.5).coins(23,3,3).coins(28,3,3);
  B.row(35,5,'B?B').enemy('spikit',38);
  /* stepping stones, every one of them sticky */
  B.sign(41,'Stepping stones, and every one of them sticky. Small hops!');
  B.ground(46,48).sticky(46,1,48,1).ground(51,53).sticky(51,1,53,1).ground(56,58).sticky(56,1,58,1);
  B.coins(47,3,1).coins(52,3,1).coins(57,3,1).enemy('batty',55,6.5,{rx:4,ry:0.8});
  /* a wall that only a held bounce will clear */
  B.row(66,2,'JJ').coinCol(66,5,4).coinCol(67,5,4).fill(70,2,75,9,GROUND).row(71,13,'?M?').enemy('gloop',73,10).enemy('prickle',80);
  /* a honey spout on a rock in the lake: from the top of it, a spark */
  B.geyser(87,2,7,4.5).coinCol(87,4,4).spark(88,10);
  /* a pod up to the gallery; whoever hops over the pod takes the low road, under a grub */
  B.sign(95,'A pollen pod! It pops you up to the gallery. Or hop over it, and see what is underneath.');
  B.pod(98,2,12,24).fill(102,9,121,10,GROUND).coins(104,12,4).enemy('buzz',109,15.5).row(113,14,'?L?').spark(119,12);
  B.sticky(106,1,111,1).enemy('honeygrub',108,8,{rx:2}).coins(107,3,4).enemy('spikit',116).row(120,5,'I');
  B.checkpoint(126);
  B.row(130,5,'?O?');
  /* royal jelly on posts over the honey lake */
  B.fill(136,0,137,2,HARD).row(136,3,'JJ').fill(142,0,143,2,HARD).row(142,3,'JJ').fill(148,0,149,2,HARD).row(148,3,'JJ');
  B.coins(139,8,2).coins(145,8,2).enemy('puff',145.5,10,{rx:1.5}).coins(150,7,2);
  B.row(157,5,'B?B').enemy('gloop',160);
  /* the tall shaft, up to the high comb */
  B.fill(165,5,165,19,HARD).fill(170,2,204,11,GROUND);
  B.sticky(170,3,170,5).sticky(165,6,165,8).sticky(170,9,170,11).sticky(165,12,165,14).coinCol(167,4,3).coinCol(168,9,3);
  B.enemy('prickle',178,12).sticky(183,11,189,11).enemy('buzz',185,16).enemy('buzz',189,18).coins(184,13,5);
  B.row(193,15,'?F?').enemy('gloop',197,12).warp(200,2,'in',false,12);
  B.warp(210,3,'out',true).enemy('spikit',215).fill(218,7,226,8,HARD).enemy('honeygrub',222,6,{rx:3}).coins(220,3,5);
  B.row(230,5,'?B?');
  B.stairs(236,5).fill(241,2,241,6,HARD);
  B.goal(247);
  /* the queen's pantry: two bounces up to a spark */
  B.fill(258,2,261,19,GROUND).fill(262,2,262,19,HARD).fill(289,2,289,19,HARD).ground(262,289);
  B.warp(264,2,'in',true).warp(285,2,'out').row(267,2,'JJ').coinCol(267,5,4).coinCol(268,5,4).row(271,9,'==J').coins(271,10,2).spark(275,13).coinBox(278,3,282,4).row(279,7,'?L?');
  return B.L;
}

/* 3-5: the great hive, from the cellar to the roof, with the honey rising underneath. Every floor goes up a different
   way: royal jelly, a pair of honey walls, one honey wall and a plain one, a spout, the zigzag shaft, and at the top a
   pollen pod that fires Blorp out through the roof into the sunset. */
function w3l5(){
  const RY=48, B=LevelBuilder(56,'honey',62);
  B.set('roof',RY).rise(0.35,RY-3,16);
  B.fill(0,0,1,RY-1,GROUND).fill(54,0,55,RY-1,GROUND);
  /* the cellar floor, with honey already showing in its pits */
  B.ground(2,13).ground(17,29).ground(34,53);
  B.coins(7,3,3).row(9,5,'?O?').arc(13,3,5).enemy('gloop',23).coins(25,3,3).arc(29,3,6).enemy('buzz',39,6);
  B.sign(42,'The honey is rising. Climb! Royal jelly will throw you up through the hole: hold {jump} as you land.');
  B.row(47,2,'JJ').coinCol(47,5,4).coinCol(48,5,4);
  /* floor 1, right to left: a strip of jelly, a puddle under a grub, and a pair of honey walls in the corner */
  B.fill(2,7,53,8,GROUND).clear(45,7,50,8);
  B.enemy('gloop',40,9).sticky(32,8,37,8).enemy('honeygrub',34,13,{rx:2}).coins(33,10,4).row(24,9,'JJJJJJJ').row(18,12,'?M?').enemy('gloop',13,9).coins(8,10,3);
  /* floor 2, left to right: a wax bridge over the jelly, and one honey pillar by the plain wall */
  B.fill(2,14,53,15,GROUND).clear(2,14,4,15).sticky(1,10,1,19).sticky(5,11,5,15).coinCol(3,10,6);
  B.clear(24,14,30,15).row(24,15,'KKKKKKK').spark(27,18).coins(24,17,2).coins(29,17,2);
  B.enemy('gloop',12,16).row(17,19,'?').enemy('gloop',35,16).enemy('prickle',41,16).row(45,19,'?');
  /* floor 3, right to left: the halfway flag, a puddle under a grub, and a honey spout in the corner */
  B.fill(2,21,53,22,GROUND).clear(51,21,53,22).sticky(50,18,50,22).coinCol(52,17,6);
  B.checkpoint(45,23);
  B.row(39,26,'?O?').enemy('gloop',35,23).sticky(26,22,31,22).enemy('honeygrub',28,27,{rx:2}).coins(27,24,4).enemy('gloop',17,23).coins(10,24,3);
  B.geyser(4,23,8,4.5).coinCol(4,25,5).spark(3,35.5);
  /* floor 4, left to right: a tall hall, a puddle under two bees, and the zigzag shaft */
  B.fill(2,28,53,29,GROUND).clear(2,28,7,29);
  B.enemy('gloop',13,30).row(17,33,'?F?').coins(22,31,4).sticky(29,29,36,29).enemy('buzz',31,35).enemy('buzz',35,37).coins(30,31,6).enemy('prickle',43,30);
  B.fill(2,39,49,40,GROUND).fill(49,32,49,40,HARD).sticky(54,31,54,34).sticky(49,34,49,37).sticky(54,37,54,41).coinCol(51,32,3).coinCol(52,36,3);
  /* floor 5, right to left, to the pod under the hole in the roof */
  B.fill(2,46,53,47,GROUND).clear(16,46,19,47);
  B.sticky(38,40,43,40).enemy('honeygrub',40,45,{rx:2}).coins(39,42,4).enemy('gloop',31,41).row(27,44,'?').coins(22,42,3);
  B.sign(23,'A pollen pod, and daylight above it!',41);
  B.pod(17,41,10,24).row(7,44,'?L?').coins(9,42,3);
  /* the roof */
  B.spark(5,49).coins(8,49,3).coins(22,49,4);
  B.stairs(28,4,1,RY).fill(32,RY,32,RY+3,HARD);
  B.goal(37,RY);
  return B.L;
}

/* ---------- the island on the map ---------- */
/* which six-sided cell of a honeycomb a spot lies in, and whether it is on the line between two cells */
function honeyHexAt(x,z){ const s=2.6, cw=1.5*s, rh=Math.sqrt(3)*s, i0=Math.round(x/cw); let d1=1e9, d2=1e9, id=0;
  for(let i=i0-1;i<=i0+1;i++){ const j0=Math.round(z/rh-(i&1)*0.5); for(let j=j0-1;j<=j0+1;j++){ const dx=x-i*cw, dz=z-(j+(i&1)*0.5)*rh, d=dx*dx+dz*dz; if(d<d1){ d2=d1; d1=d; id=i*7+j*13; } else if(d<d2) d2=d; } }
  return [Math.sqrt(d2)-Math.sqrt(d1)<0.8,((id%3)+3)%3]; }
function honeyMapHive(){ const a='#f2b632',b='#d98a1c',l='#ffd76a', o=[[-11.5,0,-11.5,23,1.2,23,'#c98a45']], w=[20,22,22,21,19,16,12,7]; let y=1.2;
  w.forEach((s,i)=>{ o.push([-s/2,y,-s/2,s,3.4,s,i%2?b:a],[-s/2-0.4,y+2.9,-s/2-0.4,s+0.8,0.6,s+0.8,l]); y+=3.4; });
  o.push([-1.5,y,-1.5,3,1.6,3,b],[-0.5,y+1.6,-0.5,1,1.4,1,'#8a5524'],[-3.4,1.2,10,6.8,6.4,0.8,'#8a5524']); return o; }
function honeyMapHiveGlow(){ return [[-2.6,1.2,10.82,5.2,5.4,0.12,'#ffc24a'],[-1.5,1.2,10.94,3,3.8,0.1,'#fff3c2'],[-7,9,11.02,1.6,1.6,0.1,'#ffd27a'],[5.4,12.4,10.52,1.6,1.6,0.1,'#ffd27a'],[-1,16.4,9.52,1.6,1.6,0.1,'#ffd27a']]; }
defWorld({name:'Honeycomb Heights',theme:'honey',levels:[w3l1,w3l2,w3l3,w3l4,w3l5],
  map:{
    /* meadow below, and on the terraces a honeycomb in three golds, each cell edged in amber */
    ground:(h,p,x,z)=>{ if(h<4) return [p<0.3?['#a2e070','#98d868']:['#86d456','#7ccc50'],['#c48a4a','#b47a3e']];
      const q=honeyHexAt(x+0.5,z+0.5); return [q[0]?['#d9962a','#d08c22']:q[1]===0?['#ffd76a','#f9cf60']:q[1]===1?['#f6c44a','#eebc42']:['#ffe08a','#f8d87e'],['#c98a3c','#b97a30']]; },
    pond:['#ffcf5a','#ffb428','#e08a12'],
    scatter(M,c){ const r=c.r;
      if(r<0.1&&c.clear(2)) M.put(M.flora,honeyDaisy(c.R),c.x,c.y,c.z,0.5+c.r2*0.2,0.25);
      else if(r<0.17&&c.clear(2.6)) M.put(M.flora,honeySunflower(c.R),c.x,c.y,c.z,0.55,0.22);
      else if(r<0.24){ M.put(M.land,honeySkep(),c.x,c.y,c.z,0.6); if(c.r2<0.5){ M.glow.push([c.x-0.07,c.y+0.06,c.z+0.26,0.14,0.12,0.02,'#ffd27a']); M.lamp(c.x,c.y+0.4,c.z+0.4,0xffc24a,1,4); } }
      else if(r<0.38) M.put(M.flora,dFlower(pick(c.R,['#ffffff','#ffe14d','#ff9fc6','#b58cff'])),c.x,c.y,c.z,0.75,1);
      else if(r<0.44) M.put(M.land,honeyPot(),c.x,c.y,c.z,0.55);
      else if(r<0.5) M.put(M.land,honeyClover(),c.x,c.y,c.z,0.9);
      if(r>0.86) M.mote({kind:1,x:c.x,y:c.y+0.5+c.r2*0.7,z:c.z,col:'#ffd23e',size:0.055,span:0.8,rate:0.3+c.r2*0.25}); },
    /* the great hive: a tall dome in bands, its door alight, and bees going round it */
    landmark(M,x,y,z){ M.put(M.land,honeyMapHive(),x,y,z,1); M.put(M.glow,honeyMapHiveGlow(),x,y,z,1); M.lamp(x,y+0.6,z+1.8,0xffc24a,1.6,7);
      for(let i=0;i<9;i++) M.mote({kind:1,x:x,y:y+0.9+i*0.36,z:z+0.3,col:i%3?'#ffd23e':'#fff3a0',size:0.07,span:1.5+((i*7)%4)*0.18,rate:0.3+i*0.05,ph:i*1.7}); }
  }});
