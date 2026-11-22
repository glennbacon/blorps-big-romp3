/* ================= World 5: Fossil Falls ================= */
/* A canyon of red and ochre rock laid down in courses, full of the bones of giants: ribs arching over the path, skulls
   the size of houses, hollow bones for pipes and spines for bridges. A river runs in the pits (it can be swum out of),
   tall waterfalls come down the far wall, a volcano smokes on the horizon and pterosaurs wheel over it all. The world's
   machine is the geyser; boulders roll out of chutes, ribs swing on chains, slabs drop away, tar holds whoever touches
   it. Level 4 goes behind the falls into a cave; level 5 climbs them at sunset. */

/* ---------- the tune ---------- */
/* @song */
/* A minor on five notes (A C D E G), drums first: toms and congas rolling three-three-two, the bass on the low drum's
   beats, a marimba with the tune and a flute that answers it in the gaps. */
SONGS.fossil=(()=>{
  const h='A4 . C5 . E5 D5 C5 .  A4 . C5 E5 . G5 E5 .  G5 . E5 . C5 D5 E5 .  D5 . G5 . D5 C5 D5 .  ';
  const a=h+'A5 . G5 E5 . C5 E5 .  A5 . G5 E5 C5 . A4 .  D5 . G5 . A5 G5 D5 .  E5 - . G5 E5 . . .  ';
  const a2=h+'A5 . G5 D5 . G5 A5 .  G5 . E5 . G5 E5 D5 .  C5 . E5 . A5 . G5 E5  A4 - . . A4 C5 E5 G5  ';
  const b='C6 . . G5 E5 . G5 .  C6 . A5 G5 . E5 G5 .  D6 . . C6 G5 . D5 .  G5 . D5 . G5 C6 D6 .  A5 . . G5 D5 . G5 .  A5 . D6 . A5 G5 D5 .  E5 . G5 . E5 . D5 E5  G5 . E5 D5 E5 G5 A5 C6  ';
  const f1='. . . . . . . .  . . . . . . E6 D6  E6 - - - . . . .  . . . . . . G5 A5  ';
  const fa=f1+'C6 - - - . . . .  . . . . . . E6 G6  A6 - - G6 - - D6 -  E6 - - - - - . .  ';
  const fa2=f1+'D6 - - - . . . .  . . . . . . G6 E6  A6 - - - E6 - C6 -  A5 - - - - - . .  ';
  const fb='E6 - - - - - G6 -  E6 - - - . . . .  D6 - - - - - G6 -  D6 - - - . . . .  A5 - - - - - D6 -  A5 - - - . . . .  G5 - - - E6 - - -  G6 - - - - - . .  ';
  const ch='Am Am C Gsus Am Am Dsus Em  Am Am C Gsus Dsus Em Am Am  C C Gsus Gsus Dsus Dsus Em Em  Am Am C Gsus Dsus Em Am Am';
  const d1='l c b l m b l c ', d2='l c b l m m l b ', df='l l m m c c b b ', dx='lr c b lr m b lr c ';
  const dA=d1+d1+d1+d2+d1+d1+d1+df;
  return song({key:'A minor',bpm:128,ec:0.75,fb:0.28},
    [{w:'triangle',v:0.14,h:4,g:0.45,lp:[9,2],r:0.3,pan:-0.15},a+a2+b+a2],
    [{w:'sine',v:0.05,vib:14,s:0.9,a:0.08,g:1,e:1,r:0.6,pan:0.3},fa+fa2+fb+fa2],
    [{w:'triangle',v:0.05,h:2,g:0.4,pan:0.4},musArp(ch,8,'. 3 8 3 . 3 8 3','A3')],
    [{w:'triangle',v:0.24,g:0.7},musArp(ch,8,'1 . . 1 . . 8 .','E2')],
    [{dr:1,v:0.8},dA+dA+dx+dx+dx+d2+dx+dx+dx+df+dA]);
})();
/* @endsong */

/* ---------- models ---------- */
const fossilBone='#efe6cf', fossilBoneD='#cfc4a6', fossilBoneL='#fffaf0';
const fossilRock=['#c9603a','#e08a4a','#b54f33','#f0b070','#d9744a','#f6d6a0'];
function fossilFern(R){ const g=['#5fb85a','#4a9a48','#7fd06a'], b=[[-0.5,0,-0.5,1,1.4,1,'#3f8a3e']];
  [[1,0],[-1,0],[0,1],[0,-1],[0.7,0.7],[-0.7,-0.7]].forEach((d,i)=>{ const l=2+R()*1.6;
    for(let k=0;k<2;k++){ const u0=k*l/2+0.4, u1=(k+1)*l/2+0.6, x0=Math.min(d[0]*u0,d[0]*u1), z0=Math.min(d[1]*u0,d[1]*u1);
      b.push([x0-0.5,1.6-k*0.8,z0-0.5,Math.abs(d[0])*(u1-u0)+1,0.6,Math.abs(d[1])*(u1-u0)+1,g[(i+k)%3]]); } });
  return b; }
/* a cycad: a stubby ringed trunk, a cone in the middle and a crown of drooping fronds */
function fossilCycad(R){ const t='#8a5a3c',t2='#6f4630',g=['#4fa85a','#3f9050','#6cc46a'], b=[], n=3+((R()*2)|0);
  for(let i=0;i<n;i++) b.push([-1.6,i*3,-1.6,3.2,3,3.2,i%2?t:t2],[-1.9,i*3+2.2,-1.9,3.8,0.8,3.8,i%2?t2:t]);
  const top=n*3; b.push([-1.1,top,-1.1,2.2,1.8,2.2,'#e8a04a'],[-0.6,top+1.8,-0.6,1.2,1,1.2,'#ffc24a']);
  [[1,0],[-1,0],[0,1],[0,-1],[0.72,0.72],[-0.72,0.72],[0.72,-0.72],[-0.72,-0.72]].forEach((d,i)=>{ const l=6+R()*3;
    for(let k=0;k<3;k++){ const u0=k/3*l+1, u1=(k+1)/3*l+1.3, x0=Math.min(d[0]*u0,d[0]*u1), z0=Math.min(d[1]*u0,d[1]*u1);
      b.push([x0-0.7,top+0.6-k*k*0.7,z0-0.7,Math.abs(d[0])*(u1-u0)+1.4,0.7,Math.abs(d[1])*(u1-u0)+1.4,g[(i+k)%3]]); } });
  return b; }
function fossilHorsetail(R){ const b=[]; for(let i=0;i<3;i++){ const x=(i-1)*1.5+R()*0.6, z=R()*1.4-0.7, h=4+R()*4; b.push([x,0,z,0.7,h,0.7,'#6aa848']); for(let y=1.6;y<h;y+=1.8) b.push([x-0.3,y,z-0.3,1.3,0.4,1.3,'#9ad060']); b.push([x-0.1,h,z-0.1,0.9,0.8,0.9,'#d9c070']); } return b; }
/* half a ribcage: four ribs that rise behind the lane and curl forward over it, on a length of spine */
function fossilRibs(){ const w=fossilBone, d=fossilBoneD, l=fossilBoneL, b=[[-21,16.5,-2.8,42,2.6,2.6,d]];
  for(let i=0;i<4;i++){ const x=-18.8+i*12;
    b.push([x,0,-1,1.6,18,2,w],[x,17,0.5,1.6,7,2,w],[x,23,2,1.6,5,2.2,l],[x,27,3.6,1.6,3,4,l],[x,29,7,1.6,2,6,w],[x,27.5,12.5,1.6,2.2,4,w],[x,24.5,15.5,1.4,3.4,1.8,d],[x-0.5,18.4,-3.1,2.6,1.7,3.2,w]); }
  return b; }
/* a skull, looking out at the lane */
function fossilSkull(){ const w=fossilBone, d=fossilBoneD, l=fossilBoneL; return [[-6,3,-6,12,8,9,w],[-5,11,-5,10,1.5,7,l],[-4,2,3,8,5,6,w],[-3,7,3,6,1.5,4,l],
  [-5.2,7.4,3,2.8,2.8,0.4,INK],[2.4,7.4,3,2.8,2.8,0.4,INK],[-1.6,4.6,9,1.1,1.4,0.3,INK],[0.5,4.6,9,1.1,1.4,0.3,INK],
  [-3.6,0.6,7.6,1.3,1.6,1.3,l],[-1.8,0.6,7.6,1.3,1.6,1.3,l],[0,0.6,7.6,1.3,1.6,1.3,l],[1.8,0.6,7.6,1.3,1.6,1.3,l],[-3.6,0,2,7.2,1.2,6.5,d],
  [-6.6,3.5,-2,0.8,3,5,d],[5.8,3.5,-2,0.8,3,5,d],[1,11.6,-1,0.5,1.1,3,d]]; }
/* a hoodoo: a stack of soft rock under a cap of hard */
function fossilSpire(R){ const b=[], n=3+((R()*2)|0); let y=0, w=5;
  for(let i=0;i<n;i++){ const hh=3+R()*2; b.push([-w/2,y,-w/2,w,hh,w,fossilRock[(i*2+1)%5]]); y+=hh; w-=0.8; }
  b.push([-w/2-1.2,y,-w/2-1.2,w+2.4,1.6,w+2.4,'#b54f33'],[-w/2-0.6,y+1.6,-w/2-0.6,w+1.2,0.6,w+1.2,'#d9744a']); return b; }
function fossilAmber(){ return [[-1.6,0,-1.4,3.2,3.6,2.8,'#f09a1a'],[-0.9,3.6,-0.8,1.8,1.6,1.6,'#ffc24a'],[1.2,0,-0.2,1.8,2.2,1.8,'#e08a12'],[-2.6,0,0.2,1.4,1.6,1.4,'#ffb02e']]; }
function fossilStalag(c){ return [[-2,0,-2,4,3,4,c],[-1.4,3,-1.4,2.8,3,2.8,shade(c,1.1)],[-0.8,6,-0.8,1.6,3,1.6,shade(c,1.2)],[-0.3,9,-0.3,0.6,2,0.6,shade(c,1.3)]]; }
/* the roller's body here: a boulder with a scowl */
function fossilBoulder(){ const c='#b0694a',d='#7f4630',l='#d08a62'; return [[-3,-3.6,-3.4,6,7.2,6.8,c],[-3.6,-3,-3.4,7.2,6,6.8,c],[-3.2,-3.2,-3.8,6.4,6.4,7.6,d],
  [-2.4,2.2,3.4,2,1,0.45,l],[1,-2.8,3.4,1.6,1,0.45,l],[-3.75,-1,-1,0.2,1.6,2,d],[3.55,0.4,0.2,0.2,1.4,1.8,d],[-0.2,3.55,-1.5,1.6,0.2,2,l],
  [-1.7,-0.3,3.8,1.2,1.4,0.2,INK],[0.5,-0.3,3.8,1.2,1.4,0.2,INK],[-2.1,1.2,3.8,1.7,0.5,0.2,INK],[0.4,1.2,3.8,1.7,0.5,0.2,INK],[-0.9,-2.1,3.8,1.8,0.45,0.2,INK]]; }
/* the swoop's body here: a pterosaur, long in the beak and crested, with wings of skin */
function fossilPtero(){ const c='#5fae9a',d='#3a7f72',bk='#ffb347',cr='#e8504a'; return [[-2,0.8,-3.2,4,3.2,6,c],[-1.4,0.4,-2.6,2.8,0.5,4.6,'#e8dcb0'],[-1.6,2.2,2.4,3.2,2.8,2.6,c],
  [-0.7,2.8,5,1.4,1,4.4,bk],[-0.5,2.3,5,1,0.5,3,shade(bk,0.8)],[-0.5,4.6,-1.4,1,1.2,4.2,cr],[-0.4,5.4,-2.6,0.8,0.9,2,cr],
  [1.6,3.5,3.4,0.15,1.2,1.2,WHITE],[1.7,3.8,3.9,0.12,0.6,0.6,INK],[-1.75,3.5,3.4,0.15,1.2,1.2,WHITE],[-1.82,3.8,3.9,0.12,0.6,0.6,INK],
  [-0.4,1.4,-5.4,0.8,1,2.4,d],[-0.7,1.1,-6.4,1.4,1.4,1.2,cr],[-1.1,0,-0.6,0.7,0.9,1,bk],[0.4,0,-0.6,0.7,0.9,1,bk]]; }
function fossilPteroWing(sx){ const d='#3a7f72',l='#8fd6c0',f='#e8dcb0', b=[[0,-0.4,-2.2,4.2,0.8,4.4,d],[4.2,-0.3,-1.8,2.8,0.6,3.4,d],[7,-0.2,-1.2,1.8,0.5,2.2,d],[8.6,-0.15,-0.6,1,0.4,1,f],[0.6,0.4,-1.6,5.4,0.12,3,l],[0,-0.3,2,6.6,0.6,0.6,f]];
  return sx>0?b:mirrored(b); }
function fossilPiranhaM(){ return recolor(mSnapper('#4f8a9a','#2a5a6a'),{'#ffe0e6':'#ff7a4a'}).concat([[-1.1,0.5,3.9,0.6,0.8,0.3,WHITE],[0.5,0.5,3.9,0.6,0.8,0.3,WHITE],[-0.3,1.5,4.05,0.6,0.7,0.3,WHITE],[-1.2,3.3,3.6,2.4,0.4,0.5,'#2a5a6a']]); }
function fossilBlockM(){ return recolor(mClonk(),{'#8a8aa3':'#c98a5a','#babad0':'#e8b888','#5a5a73':'#8a5234','#d5dcea':'#f2e6cf'}); }
function fossilStalM(){ return recolor(mIcicle(),{'#bfeaff':'#a88468','#e3f6ff':'#c8a488','#7cc4ee':'#7a5a48','#ffffff':'#ead8b8'}); }
/* a little three-horn, for the charger */
function fossilTrikeM(){ const c='#8fb85a',d='#5f8a3e',l='#d9e8a0',f='#e8a04a',fs='#c9603a',h='#fff2c2'; return [
  [-3.4,1.2,-4,6.8,4.8,7.4,c],[-2.8,6,-3.2,5.6,0.8,5.6,d],[-2.6,1.4,-4.6,5.2,3,1,d],[-0.6,2,-6.2,1.2,1.4,2,d],[-2.6,1.6,3.4,5.2,4.2,2.6,c],
  [-4.6,3.6,2.2,9.2,5.4,1.2,f],[-3.6,9,2.2,7.2,0.9,1.2,f],[-3.8,7,3.4,1.4,1.4,0.2,fs],[2.4,7,3.4,1.4,1.4,0.2,fs],[-0.7,8,3.4,1.4,1.2,0.2,fs],
  ...eye(-2.3,3.8,6,1.7,1.5,0.8,0.9,0.7,0.2),...eye(0.6,3.8,6,1.7,1.5,0.8,0.9,0.2,0.2),
  [-1.3,1.2,6,2.6,1.6,1.4,l],[-0.5,2.8,6.4,1,1.6,1.2,h],[-2.6,5.6,5,1,1,2.6,h],[-2.5,6.2,7,0.8,0.9,1.6,h],[1.6,5.6,5,1,1,2.6,h],[1.7,6.2,7,0.8,0.9,1.6,h],
  [-3.2,0,-3,2,1.2,2,d],[1.2,0,-3,2,1.2,2,d],[-3.2,0,1.4,2,1.2,2,d],[1.2,0,1.4,2,1.2,2,d]]; }

/* ---------- the world's own monsters ---------- */
/* The leaping fish, the falling block, the icicle and the charger do not take a skin from the theme, so each is given a
   body of this world's here and keeps the shared rules exactly: a piranha, a carved stone, a stalactite, a three-horn. */
defEnemy('fossilPiranha',Object.assign({},ETYPES.snapper,{mesh:()=>G1('fossilPiranha',fossilPiranhaM)}));
defEnemy('fossilBlock',Object.assign({},ETYPES.clonk,{mesh:()=>G1('fossilBlock',fossilBlockM)}));
defEnemy('fossilStal',Object.assign({},ETYPES.icicle,{mesh:()=>G1('fossilStal',fossilStalM)}));
defEnemy('fossilTrike',Object.assign({},ETYPES.rammy,{mesh:()=>G1('fossilTrike',fossilTrikeM)}));

/* one-way ledges are lengths of spine */
SEMI_LOOKS.fossil=function(g,part){ const w='#efe6cf',l='#fffaf0',d='#b8ad90',k='#8f8468';
  PX(g,w,0,0,16,16);
  if(part===0){ for(const x of [0,8]){ PX(g,l,x+1,0,5,16); PX(g,d,x+7,0,1,16); PX(g,d,x,0,1,16); } PX(g,d,0,7,16,1); PX(g,d,0,15,16,1); return; }
  PX(g,l,0,0,16,1); PX(g,d,0,5,16,1);
  for(const x of [0,8]){ PX(g,d,x+7,0,1,6); PX(g,l,x+1,1,5,1); PX(g,d,x+2,5,4,3); PX(g,k,x,6,2,2); PX(g,k,x+6,6,2,2); }
  if(part===2){ PX(g,INK,3,2,1,2); PX(g,INK,5,2,1,2); } };
SEMI_UNDER.fossil='#b8ad90';

/* ---------- scenery ---------- */
/* Rock in courses: every course keeps its colour wherever it is, so the layers run right across the far view. */
function fossilBands(list,x,w,y0,y1,z,d,bh,dim){
  for(let y=y0,k=Math.round(y0/bh);y<y1-0.01;y+=bh,k++){ const c=fossilRock[((k%6)+6)%6], n=((k*7)%3+3)%3*0.25; list.push([x+n,y,z-d,w-n*2,Math.min(bh,y1-y),d+n*0.6,dim?shade(c,dim):c]); } }
/* The same on the ground itself: thin courses along the front of every run of earth, read straight from the level. And
   where tar is set in the floor, the trench either side of the lane is filled with it. */
function fossilStrata(S){
  const W=S.W, H=S.H, t=S.L.tiles, base=TH.dirt, cols=[mixc(base,'#ffe2a8',0.5),shade(base,0.74),mixc(base,'#fff4dc',0.72)], back=(TH.back||-2.5)*8;
  for(let y=0;y<H;y++){ let x=0;
    while(x<W){ if(t[y*W+x]!==GROUND){ x++; continue; } let x1=x; while(x1+1<W&&t[y*W+x1+1]===GROUND) x1++;
      const a=x===0?-14:x, b=x1===W-1?W+14:x1+1, k=(y*5)%3;
      S.near.push([a*8,y*8+0.8+k*0.5,12,(b-a)*8,0.9,0.3,cols[k===1?2:0]],[a*8,y*8+3.2+(k===2?0.6:0),12,(b-a)*8,0.6,0.3,cols[1]]);
      x=x1+1; } }
  for(let y=1;y<H-1;y++) for(let x=0;x<W;x++) if(t[y*W+x]===STICKY&&t[(y-1)*W+x]===GROUND&&t[(y+1)*W+x]!==STICKY){ const c=(TH.sticky||HONEY)[0]; S.near.push([x*8,y*8,8,8,8,4,c],[x*8,y*8,back,8,8,-8-back,c]); }
}
/* Streaks of white that run down a sheet of water for ever: one instanced mesh, each streak wrapping from the bottom to
   the top by itself. */
const fossilDummy=new T.Object3D(), fossilFoam=new T.MeshBasicMaterial({color:0xf4fdff,opacity:0.86}), fossilFoamGlow=new T.MeshBasicMaterial({color:0xe6fbff,opacity:0});
function fossilStreaks(R,x,y0,y1,z,w,n,glow){
  const m=new T.InstancedMesh(partGeo,glow?fossilFoamGlow:fossilFoam,n), st=[], hh=y1-y0;
  for(let i=0;i<n;i++) st.push({x:x-w/2+0.3+R()*(w-0.6),w:0.25+R()*0.35,h:0.7+R()*1.5,v:(2.6+R()*1.6)/hh,o:R()});
  m.frustumCulled=false; world.add(m);
  critters.push({tick(dt,time){ for(let i=0;i<n;i++){ const s=st[i], u=(time*s.v+s.o)%1; fossilDummy.position.set(s.x,y1-s.h/2-u*hh,z); fossilDummy.scale.set(s.w,s.h,0.12); fossilDummy.updateMatrix(); m.setMatrixAt(i,fossilDummy.matrix); } m.instanceMatrix.needsUpdate=true; }});
}
function fossilRainbow(S,cx,cy,z,r){ const C=['#ff7a7a','#ffb860','#ffe66a','#9be89a','#7cc4ff','#c09cff'];
  for(let b=0;b<6;b++){ const rr=r-b*0.36; for(let q=0.3;q<=2.85;q+=0.4/rr) S.soft.push([cx+Math.cos(q)*rr-0.21,cy+Math.sin(q)*rr-0.21,z,0.42,0.42,0.06,C[b]]); } }
/* a waterfall: a blue sheet over the lip of the wall, streaks running down it, mist at the foot, and for the big ones a rainbow in the mist */
function fossilFall(S,R,x,y0,y1,z,w,big){
  const hh=y1-y0+1.2;
  S.far.push([x-w/2,y0-1.2,z,w,hh,0.5,'#49b4e0'],[x-w/2,y0-1.2,z+0.5,0.45,hh,0.1,'#8fd8f5'],[x+w/2-0.45,y0-1.2,z+0.5,0.45,hh,0.1,'#8fd8f5'],
    [x-w/2-0.2,y1-0.5,z+0.2,w+0.4,0.7,0.6,'#d6f4ff'],[x-w/2-1.6,y1-1.4,z-0.2,1.6,2.2,1.4,'#b54f33'],[x+w/2,y1-1.4,z-0.2,1.6,2.2,1.4,'#b54f33']);
  fossilStreaks(R,x,y0,y1-0.3,z+0.6,w,Math.min(150,Math.round(w*(y1-y0)/2.2)+4),false);
  S.soft.push([x-w/2-1.4,y0-0.3,z+0.9,w+2.8,1.3,1.8,'#ffffff'],[x-w/2-2.6,y0-0.3,z+1.8,2.4,0.8,1.4,'#eafcff'],[x+w/2+0.4,y0-0.3,z+1.8,2.6,0.9,1.4,'#eafcff'],[x-1,y0+0.8,z+1.3,2,0.9,1.2,'#ffffff'],[x-w/2-0.6,y0+0.6,z+1.1,1.4,0.7,1,'#f4fdff']);
  if(big) fossilRainbow(S,x+w/2+2.6,y0+0.4,z+2.4,4.2);
}
/* a pterosaur a long way off, going round and round */
function fossilFlyer(x0,y0,z,rad,sp,ph){
  const g=new T.Group(), body=new T.Mesh(geo('fossilPteroFar',fossilPtero),MAT.vox), wl=new T.Mesh(geo('fossilPteroFarL',()=>fossilPteroWing(-1)),MAT.vox), wr=new T.Mesh(geo('fossilPteroFarR',()=>fossilPteroWing(1)),MAT.vox);
  wl.position.set(-2*S8,3.2*S8,-0.4*S8); wr.position.set(2*S8,3.2*S8,-0.4*S8); g.add(body,wl,wr); g.scale.setScalar(1.7); g.position.set(x0,y0,z); world.add(g);
  critters.push({tick(dt,time){ const a=time*sp+ph, f=Math.sin(time*4.4+ph)*0.5; g.position.set(x0+Math.cos(a)*rad,y0+Math.sin(a*0.5)*1.2,z+Math.sin(a)*rad*0.35);
    g.rotation.y=Math.atan2(-Math.sin(a),0.35*Math.cos(a)); g.rotation.z=Math.sin(a)*0.25; wl.rotation.z=f; wr.rotation.z=-f; }});
}
/* Inside the cave: a back wall of dark rock with windows in it onto the back of the falls, which is where the light
   comes from; teeth of stone above and below; amber here and there; drips. */
function fossilCaveView(S,R){
  const W=S.W, far=S.far, ly=S.L.liquidY, rock=['#4a3542','#3f2c3a','#57404c','#463240'];
  let x=-30, n=0;
  while(x<W+30){ const w=5+R()*6;
    if(n%4===3){ const ww=6+R()*3;
      S.glowFar.push([x-0.5,-2,-13,ww+1,22,0.4,'#6fc4e6'],[x+ww*0.2,-2,-12.8,ww*0.25,22,0.2,'#a8e2f8']);
      fossilStreaks(R,x+ww/2,ly-1,16,-12.4,ww,14,true);
      far.push([x-0.5,11.5,-9.6,ww+1,8,2,rock[0]],[x-0.5,-3,-9.6,ww+1,3.6+R()*1.4,2,rock[1]]);
      for(let k=0;k<3;k++) far.push([x+R()*ww,8.6+R()*1.6,-9.4,0.9,3.4,0.9,rock[2]]);
      lamps.push({x:x+ww/2,y:6,z:-7,col:0x9fdcff,power:1.5,reach:11});
      x+=ww; }
    else { far.push([x,-3,-11-R()*1.5,w+0.4,24,3+R()*2,rock[n%4]]); if(R()<0.5) far.push([x+w*0.3,-3,-8.4,w*0.5,2+R()*4,1.2,rock[(n+1)%4]]); x+=w; }
    n++; }
  for(let q=-10;q<W+10;q+=3+R()*5){ const z=-5.6-R()*2.6, l=1.5+R()*3.5, c=pick(R,rock);
    far.push([q,11-l,z,1.2,l+1,1.2,c],[q+0.3,11-l-1.2,z+0.3,0.6,1.3,0.6,shade(c,1.15)]);
    if(R()<0.5){ const hh=1+R()*2.5; far.push([q+1.5,ly-0.5,z-0.5,1.6,hh+0.5,1.6,c],[q+1.9,ly+hh,z-0.1,0.8,1,0.8,shade(c,1.15)]); }
    if(R()<0.25){ S.glowFar.push([q+0.2,ly+0.3,z+1.3,0.7,1.1,0.5,'#ffb02e']); lamps.push({x:q+0.5,y:ly+1,z:z+1.5,col:0xffb02e,power:1.1,reach:6}); } }
  S.addWeather('rain',{n:46,size:[0.045,0.32],vel:[0,-9,0],tilt:0,cols:['#bfeaff','#e6fbff'],op:0.7});
  S.addWeather('firefly',{n:26,cols:['#9ff0ff','#d9fbff']});
  for(let q=12;q<W;q+=22+R()*18) S.addShaft(q,3,-4-R()*2,2+R()*2,9,'#9fdcff',-0.25);
}

THEMES.fossil={ music:'fossil', air:'birds',
  sky:['#3a8ee0','#9fd8f5','#ffe6c0'], skyMid:0.52, glowCol:0xfff0c0, sunGlow:0.9, cloud:0.35, cloudShade:'#f2d6c0', cloudY:0.7, spokes:0.35,
  fog:0xf2d4b4, fogNear:20, fogFar:150,
  hemiSky:0xfff6e6, hemiGround:0xd8a888, hemiI:0.62, sunI:0.74, sunCol:0xfff0d8, sunDir:[-0.45,0.76,0.5],
  top:'#e8b062', topS:['#f2c27a','#d99a50','#eebb70','#f7d090'], dirt:'#c0583a', dirtS:['#a84a32','#d06a44','#b05038'], cap:'#e8b062', capL:'#f8d898', capD:'#a85a34',
  brick:['#d98a4a','#9a5a2e','#f2b878'], hard:['#e6dcc4','#fbf4e2','#a89a80'], pipe:['#efe6cf','#fffaf0','#b8ad90','#3a3024'],
  semi:'fossil', plat:['#f2ead6','#c4b89a'], dust:'#f2d2a0', back:-5, fringe:['#8fc45a','#6aa848','#d9c070','#a8d070'],
  liquid:{kind:'water',a:'#2aa5c8',b:'#eafcff',op:0.8,far:70}, pool:{kind:'water',a:'#3ab4d6',b:'#eafcff',op:0.6},
  sticky:['#2a2430','#5a5068','#141018'], stickyCol:'#3a3040', geyser:['#bfeaff','#ffffff'],
  disc:['#ffe14d','#fff3a0','#e08a12'], bloom:0.9, hi:0.16, rays:0.35, grade:{shadow:[0.99,0.95,1.03],high:[1.05,1.01,0.95]},
  skins:{swoop:fossilPtero,swoopWL:()=>fossilPteroWing(-1),swoopWR:()=>fossilPteroWing(1),roller:fossilBoulder},
  stackCols:['#d9cdb0','#ece4cc','#fff8e6'], rollerCol:'#b0694a',
  looks:[null,
    /* 2: later in the morning, more cloud */
    {sky:['#2f86e0','#8fd0f7','#ffedd0'],fog:0xf4dcc0,cloud:0.5,sunDir:[-0.5,0.72,0.5]},
    /* 3: noon, and hot */
    {sky:['#2a7ee0','#7fc8f8','#fff2d8'],fog:0xf6e2c8,sunCol:0xfff6e6,sunI:0.8,sunDir:[-0.3,0.86,0.42],cloud:0.22,haze:0.0006,grade:{shadow:[1.0,0.96,1.0],high:[1.06,1.02,0.94]}},
    /* 4: the cave behind the falls */
    {cave:1,air:'drips',dark:0.55,darkAmb:0x2c2840,sky:['#120e1a','#1c1626','#2a2030'],fog:0x1e1a2a,fogNear:10,fogFar:80,cloud:0,spokes:0,sunGlow:0,rays:0,
      hemiSky:0xa8c0e0,hemiGround:0x5a4650,hemiI:0.6,sunI:0.4,sunCol:0xbfe0ff,sunDir:[-0.3,0.8,0.55],bloom:1.05,
      top:'#8f7466',topS:['#9c8172','#7f665a','#96796a','#a88c7c'],dirt:'#6a4c4c',dirtS:['#5c4042','#785858','#644648'],cap:'#8f7466',capL:'#b89c8a',capD:'#4a3438',fringe:['#5aa890','#3f8a78','#7fc8b0'],
      liquid:{kind:'water',a:'#1c6f8c',b:'#bfefff',op:0.82,far:30,mirror:0.4},grade:{shadow:[0.92,0.96,1.1],high:[1.02,1.0,1.0]}},
    /* 5: sunset on the falls */
    {dusk:1,sky:['#4a3590','#f0785a','#ffd27a'],skyMid:0.45,fog:0xf0a078,sunCol:0xffb07a,hemiSky:0xffd6c0,hemiGround:0xb07868,hemiI:0.56,sunI:0.66,glowCol:0xff9050,sunGlow:1,sunDir:[-0.7,0.42,0.5],
      disc:['#ff8a3d','#ffc27a','#b3520f'],cloud:0.45,cloudCol:'#ffd9b0',cloudShade:'#d8707a',rays:0.55,stars:0.2,spokes:0.5,
      liquid:{kind:'water',a:'#4a7fc0',b:'#ffd9b8',op:0.8,far:70},grade:{shadow:[1.02,0.92,1.06],high:[1.1,0.99,0.9]}}],
  /* the far view: a volcano smoking on the horizon, mesas, the far wall of the canyon with its waterfalls, and on the
     far bank of the river the bones of giants among the cycads. In a tall level the wall stands as high as the rim, and
     the mesas and the volcano stand on top of it. */
  scenery(S,R){
    const W=S.W, H=S.H, far=S.far, ly=S.L.liquidY, tall=H>24, rim=tall?(S.L.rim||H-12):0;
    fossilStrata(S);
    if(TH.cave){ fossilCaveView(S,R); return; }
    { const vx=W*0.62, vz=-104, base=tall?rim-6:-2, n=9, vw=64, vh=28;
      for(let k=0;k<n;k++){ const ww=vw*Math.pow(1-k/(n+1.5),1.15); far.push([vx-ww/2,base+k*vh/n,vz-4,ww,vh/n,8,k%2?'#8a5650':'#7a4a48']); }
      S.glowFar.push([vx-4,base+vh-0.3,vz+4.05,8,0.9,0.1,'#ff9a3d'],[vx-1,base+vh-3,vz+4.05,1.4,2.8,0.1,'#ffb347']);
      for(let k=0;k<6;k++){ const s=5+k*1.6; S.soft.push([vx-s/2+k*2.6+R()*2,base+vh+1+k*3,vz-2,s,s*0.55,3,k%2?'#cfc4c0':'#b8aaa8']); } }
    for(let x=-70;x<W+70;x+=24+R()*30){ const z=-46-R()*38, w=14+R()*18, base=tall?rim-3:-3, top=base+9+R()*10;
      far.push([x-w*0.65,base,z-9,w*1.3,2+R()*2.5,10.5,'#b85a3c']);
      fossilBands(far,x-w/2,w,base,top,z,8,2.4,0.96); far.push([x-w/2-0.4,top,z-8.2,w+0.8,0.5,8.6,'#f0b070']);
      if(R()<0.5){ const w2=w*0.4; fossilBands(far,x-w2/2,w2,top+0.5,top+3.5,z-1,5,2.4,0.96); } }
    /* the far wall, and the falls that come over it */
    let lastFall=-999, nf=0;
    for(let x=-44;x<W+44;){ const w=9+R()*9;
      if(!tall&&R()<0.2){ x+=4+R()*4; continue; }
      const top=tall?rim+1+((R()*3)|0):8+((R()*7)|0), z=-23-R()*5;
      fossilBands(far,x,w+0.5,-3,top,z,10,tall?3:2.2); far.push([x-0.3,top,z-10,w+1.1,0.5,10.5,'#e8b062']);
      if(R()<0.6) put(S.flora,scaled(fossilCycad(R),2.2),(x+w*(0.2+R()*0.6))*8,(top+0.5)*8,(z-2.5)*8,0.15);
      if(tall) for(let k=0;k<2;k++){ const yl=5+R()*(rim-9), lx=x+R()*(w-5); far.push([lx,yl,z,5,0.9,2.6,'#e8b062'],[lx+0.4,yl-1.2,z,4.2,1.2,1.8,'#b54f33']); put(S.flora,scaled(fossilCycad(R),1.8),(lx+2.5)*8,(yl+0.9)*8,(z+1.3)*8,0.15); }
      if(w>=10&&x+w/2-lastFall>(tall?26:38)+R()*16&&x>-20&&x<W+20){ lastFall=x+w/2; nf++; fossilFall(S,R,x+w/2,ly,top,z+0.3,tall?5.5+R()*2:2.8+R()*2,nf%2===1); }
      x+=w; }
    /* the far bank */
    for(let x=-20;x<W+20;x+=10+R()*12){ const z=-9-R()*6, q=R(), by=(ly+0.25)*8;
      far.push([x-5,ly-1.5,z-3,10,1.8,6,'#e8b062'],[x-3.6,ly+0.3,z-2,7.2,0.3,4,'#f2c27a']);
      if(q<0.22) put(S.near,scaled(fossilSkull(),2.8),x*8,by,z*8);
      else if(q<0.42) put(S.near,scaled(fossilRibs(),1.9),x*8,by,(z-1.5)*8);
      else if(q<0.8) put(S.flora,scaled(fossilCycad(R),1.7),x*8,by,z*8,0.2);
      else put(S.near,scaled(fossilSpire(R),2.4),x*8,by,z*8); }
    for(let x=-50;x<W+50;x+=14+R()*14) S.addCloud(x,(tall?rim+7:9)+R()*8,-36-R()*40,R,TH.cloudCol&&mixc(TH.cloudCol,'#ffffff',0.5));
    skyDisc(TH.disc,null,tall?rim+11:14.5);
    S.addWeather('dust',{n:60,cols:['#fff3c9','#ffe0a0','#ffffff'],size:[0.07,0.07]});
    if(TH.dusk) S.addWeather('ember',{n:22,z:-5});
    for(let x=10;x<W;x+=14+R()*16) S.addShaft(x,(tall?R()*(rim-6):0)+5+R()*3,-3.5-R()*2,2.2+R()*2,9,TH.dusk?'#ffc49a':'#fff1c8',-0.42);
    for(let i=0;i<Math.ceil(W/60)+1;i++) fossilFlyer(R()*W,tall?8+R()*(rim-2):8.5+R()*4.5,-9-R()*10,5+R()*5,0.25+R()*0.2,R()*6.28);
  },
  /* on the ground: ribs that curl over the lane, cycads, skulls, hoodoos, ferns, loose bones, amber. In the cave: teeth
     of stone, amber that glows (those are the lamps), and pale blue mushrooms. */
  decor(S,D,R){
    const r=R(), y=D.ty*8;
    if(D.wet) return;
    if(TH.cave){ const rk=pick(R,['#5c4350','#4f3846','#684c58']);
      if(r<0.07&&D.free(3)) put(S.near,fossilStalag(rk),D.jx(),y,D.zb(1.8,4.4));
      else if(r<0.2){ const x=D.jx(), z=D.zb(1.5,4.2); put(S.near,fossilAmber(),x,y,z); S.glow.push([x-0.9,y+0.8,z+1.45,1.8,2,0.15,'#ffe08a'],[x-0.5,y+3.9,z+0.85,1,1,0.15,'#ffd86a']); lamps.push({x:x/8,y:D.ty+0.6,z:z/8+0.3,col:0xffb02e,power:1.25,reach:6.5}); }
      else if(r<0.3){ const x=D.jx(), z=D.zb(1.3,4.6); put(S.near,dShroom('#3fb8a8'),x,y,z); S.glow.push([x-1,y+3.3,z-1,2,0.5,2,'#7dfff0']); }
      else if(r<0.4) put(S.near,dBones(),D.jx(),y,D.zb(1.3,4.4));
      else if(r<0.52) put(S.near,dRock(rk),D.jx(),y,D.zb(1.2,4.6));
      if(R()<0.14) put(S.near,scaled(dRock(rk),0.6),D.jx(),y,D.zf());
      return; }
    if(r<0.016&&D.free(5)&&D.open) put(S.near,fossilRibs(),D.jx(),y,D.zb(3.7,4.3));
    else if(r<0.07&&D.free(4)&&D.open) put(S.flora,fossilCycad(R),D.jx(),y,D.zb(2.6,4.5),0.22);
    else if(r<0.1&&D.free(3)&&D.open) put(S.near,fossilSkull(),D.jx(),y,D.zb(2.6,4));
    else if(r<0.15&&D.free(3)&&D.open) put(S.near,fossilSpire(R),D.jx(),y,D.zb(2.4,4.4));
    else if(r<0.3) put(S.flora,fossilFern(R),D.jx(),y,D.zb(1.4,4.7),0.9);
    else if(r<0.37) put(S.near,dBones(),D.jx(),y,D.zb(1.3,4.6));
    else if(r<0.45) put(S.near,dRock(pick(R,['#c9603a','#e08a4a','#b54f33'])),D.jx(),y,D.zb(1.3,4.7));
    else if(r<0.49){ const x=D.jx(), z=D.zb(1.4,4.4); put(S.near,fossilAmber(),x,y,z); S.glow.push([x-0.7,y+1,z+1.45,1.4,1.6,0.15,'#ffe08a']); }
    else if(r<0.55) put(S.flora,fossilHorsetail(R),D.jx(),y,D.zb(1.3,4.6),1);
    const f=R();
    if(f<0.1) put(S.flora,scaled(fossilFern(R),0.55),D.jx(),y,D.zf(),0.8);
    else if(f<0.17) put(S.near,scaled(dBones(),0.6),D.jx(),y,D.zf());
    else if(f<0.23) put(S.near,scaled(dRock('#d9744a'),0.5),D.jx(),y,D.zf());
  }
};

/* 5-1: the canyon floor. A first walk among the bones: Rattles, who will not stay down; a geyser to ride up to a
   shelf; a rib swinging on its chain over the river; two bone posts to kick up between; and a geyser on a rock in the
   river that is the only way up the next shelf. */
function w5l1(){
  const B=LevelBuilder(250,'fossil');
  B.room(0,221).room(226,249,0,15,true);
  B.ground(0,33).ground(34,46,8).ground(47,50,5).ground(51,72).ground(78,92).ground(107,140).ground(144,144).ground(149,165,6).ground(166,225);
  B.coins(8,3,3).row(12,5,'?O?').sign(17,'Rattles the skeleton never stays down. A stomp only buys you a moment.').enemy('bones',23);
  B.sign(27,'A geyser! It will not hurt you. Ride it to the top, then {jump}.');
  B.geyser(31,2,6,4.5).coinCol(31,4,4).spark(31,10);
  B.row(38,11,'?M?').enemy('bones',42,8).coins(47,6,3);
  B.row(55,5,'B?B').enemy('fossilTrike',61).enemy('stack',68);
  B.arc(72,4,7).enemy('fossilPiranha',75,2,{rise:4});
  /* the first rib on a chain, with a stub of spine at each bank */
  B.row(81,5,'?B?').sign(87,'A rib on a chain. Step on at the near end of its swing, and off at the far end.');
  B.row(93,1,'=').row(106,1,'=').plat(98,3,3,'s',6,1.3).enemy('fossilPiranha',96,2,{rise:3.5}).enemy('fossilPiranha',103,2,{rise:4,phase:0.9}).arc(97,6,6);
  B.checkpoint(111).row(115,5,'?O?').enemy('bones',120).enemy('fossilTrike',126);
  /* two posts to kick up between: the second spark hangs at the top */
  B.fill(131,4,131,12,HARD).fill(135,4,135,12,HARD).coinCol(133,4,7).spark(133,12);
  /* a geyser on a rock in the river: the shelf beyond is too high for any jump */
  B.geyser(144,2,5,4).coinCol(144,4,3).enemy('fossilPiranha',142,2,{rise:3}).enemy('fossilPiranha',146.5,2,{rise:4,phase:0.8});
  B.row(153,9,'?M?').enemy('bones',157,6).enemy('stack',162,6).coins(166,3,3);
  B.warp(171,2,'in').enemy('fossilTrike',177).warp(182,3,'out',true);
  B.row(188,5,'BOB').enemy('stack',192);
  B.stairs(198,5).fill(203,2,203,6,HARD);
  B.goal(209);
  /* down the hollow bone: a cellar with a geyser of its own, and the third spark on a shelf above it */
  B.fill(222,2,225,15,GROUND).fill(226,2,226,15,HARD).fill(249,2,249,15,HARD).ground(226,249);
  B.warp(228,2,'in',true).coinBox(231,3,233,5).geyser(236,2,6,4).coinCol(236,4,4).row(239,9,'====').coins(239,10,4).spark(241,11).row(241,13,'L').warp(245,2,'out');
  return B.L;
}

/* 5-2: rolling stones. Boulders: first along a flat lane with a kerb to break on, then down a stair that has to be
   climbed against them, then down another with them at Blorp's heels. Between the two stairs, slabs that drop away over
   a gully; after them, tar, and a tar wall to kick up; and the first pterosaurs. */
function w5l2(){
  const B=LevelBuilder(232,'fossil');
  B.ground(0,57).ground(61,73).ground(74,92,7).ground(93,107).ground(108,128,7).ground(129,231).ground(172,196,8);
  B.coins(6,3,3).row(10,5,'?O?').enemy('bones',15);
  B.sign(19,'Boulders! They roll until they hit a wall. Jump them, or land on top for a bounce.');
  B.fill(23,2,23,2,HARD).chute(36,2,4.5,-1).coins(27,5,3);
  B.row(41,5,'B?B').enemy('stack',46).enemy('swoop',54,7,{span:9}).enemy('fossilPiranha',58.5,2,{rise:3});
  /* the boulder stair: wide treads, a chute at the top, and a length of spine to cross over it by */
  B.fill(62,2,64,2,HARD).fill(65,2,67,3,HARD).fill(68,2,70,4,HARD).fill(71,2,73,5,HARD);
  B.chute(82,7,4.5,-1).row(79,9,'=====').coins(79,10,5).row(86,10,'?M?');
  /* a hollow under the shelf, open only to the gully: the third spark, and Rattles to mind it */
  B.clear(84,2,92,4).spark(85,3).coins(86,2,5).enemy('bones',89);
  /* slabs over the gully; a fall costs only the time it takes the geyser to come round */
  B.sign(90,'These slabs drop a moment after you land. Do not hang about.',7);
  B.fall(94,7,3).fall(99,7,3).fall(104,7,3).spark(100,3).coins(97,3,2).geyser(107,2,5,4);
  B.checkpoint(112,7).row(116,10,'?B?').enemy('bones',118,7);
  /* down the far stair with boulders coming from behind; they break on the kerb at the bottom */
  B.chute(124,7,4.5,1).row(121,9,'=========').coins(122,10,7);
  B.fill(129,2,131,5,HARD).fill(132,2,134,4,HARD).fill(135,2,137,3,HARD).fill(138,2,140,2,HARD);
  B.coins(143,3,3).enemy('fossilTrike',150).arc(146,4,5).fill(158,2,158,2,HARD);
  /* tar: a patch to wade, then a tar wall and a post to kick up between. Kick on past the top for the second spark. */
  B.sign(160,'Tar! Slow going underfoot. But a tar wall holds you while you kick your way up.');
  B.sticky(162,1,165,1).fill(167,4,167,13,HARD).fill(171,2,171,7,STICKY).fill(171,10,171,13,HARD).coinCol(169,3,5).spark(169,12);
  B.row(177,11,'?O?').enemy('stack',182,8).enemy('swoop',192,12,{span:9});
  B.fill(197,2,197,6,HARD).fill(198,2,198,4,HARD).enemy('bones',204);
  B.goal(212);
  return B.L;
}

/* 5-3: geyser steps. Geysers as a stair, each one going off as the last one tops out; a geyser that keeps time with a
   sliding rib, so the ride up has to meet the ride across; three ribs on chains over the wide water, with the second
   spark at the top of a swing; and carved stones that drop on whoever walks under. */
function w5l3(){
  const B=LevelBuilder(272,'fossil');
  B.room(0,243).room(248,271,0,15,true);
  B.ground(0,30).ground(34,34).ground(39,39).ground(44,44).ground(48,66,9).ground(67,96).ground(112,113).ground(114,140,9).ground(141,142).ground(169,170).ground(171,190,9).ground(191,247);
  B.coins(5,3,3).row(9,5,'?O?').enemy('stack',15).enemy('swoop',26,7,{span:8});
  /* the geyser stair: three rocks in the river, three geysers, each higher than the last */
  B.geyser(34,2,3,4,0).geyser(39,2,5,4,3).geyser(44,2,7,4,2).coinCol(34,4,2).coinCol(39,4,4).coinCol(44,4,5).spark(39,9);
  B.enemy('fossilPiranha',36.5,2,{rise:3}).enemy('fossilPiranha',41.5,2,{rise:3.5,phase:0.8});
  B.row(52,12,'?M?').enemy('bones',56,9).enemy('prickle',62,9).arc(66,9,5);
  B.row(72,5,'B?B').enemy('fossilTrike',78).sign(82,'That stone is watching you. It drops when you walk under it: wait for the thud, then go.').enemy('fossilBlock',86,7).coins(85,3,3);
  /* the geyser and the rib: one period for both, so the rib is always coming in as the geyser tops out */
  B.sign(91,'The geyser and the rib keep time with each other. Ride up as the rib comes in.');
  B.geyser(95,2,6,2*Math.PI,1.5*Math.PI).plat(98,8,3,'x',10,1).geyser(112,2,7,4.5,1).coinCol(95,4,4).coins(101,10,6).enemy('fossilPiranha',104,2,{rise:4.5});
  B.checkpoint(118,9).row(122,12,'?O?').enemy('bones',127,9).enemy('stack',134,9);
  /* three ribs over the wide water; a geyser at the foot of each cliff carries up whoever falls in */
  B.geyser(141,2,7,4).geyser(169,2,7,4,2).plat(145,9,3,'s',5,1.2).plat(154,9,3,'s',5,1.2,1.6).plat(163,9,3,'s',5,1.2,3.2).spark(159,13);
  B.enemy('fossilPiranha',150,2,{rise:5}).enemy('fossilPiranha',159,2,{rise:5,phase:0.9}).enemy('swoop',184,14,{span:9}).coins(146,11,2).coins(155,11,2).coins(164,11,2);
  B.row(178,12,'?M?').enemy('prickle',185,9);
  B.enemy('fossilBlock',196,7).enemy('fossilBlock',201,7).coins(195,3,8);
  B.warp(206,2,'in').enemy('fossilTrike',211).warp(215,3,'out',true);
  B.stairs(221,5).fill(226,2,226,6,HARD);
  B.goal(232);
  /* a tar pit of a room: one wall of tar, one of bone, and the third spark at the top of the gap between them */
  B.fill(244,2,247,15,GROUND).fill(248,2,248,15,HARD).fill(271,2,271,15,HARD).ground(248,271);
  B.warp(250,2,'in',true).coinBox(253,3,255,5).fill(258,4,258,12,STICKY).fill(262,4,262,12,HARD).coinCol(260,3,8).spark(260,12).row(264,7,'===').coins(264,8,3).warp(267,2,'out');
  return B.L;
}

/* 5-4: behind the falls. A cave, dim, lit by amber and by the daylight that comes through the water. Stalactites that
   drop; a tar chimney up to a high road of narrow ledges with Rattles on them, or a low road under it along a boulder
   alley; slabs over the underground river beneath a roof of stone teeth; and a stair to climb against the boulders. A
   vault of bricks holds a spark for whoever kept the sunbloom. */
function w5l4(){
  const B=LevelBuilder(256,'fossil');
  B.room(0,227).room(232,255,0,15,true);
  B.fill(0,11,255,15,GROUND);
  B.ground(0,36).ground(42,103).ground(121,231);
  B.coins(4,3,3).row(8,5,'?O?').enemy('bones',14);
  B.sign(19,'Stalactites shiver, then drop. Tease them down, or run under.');
  B.fill(23,8,33,10,GROUND).enemy('fossilStal',25,7).enemy('fossilStal',28,7).enemy('fossilStal',31,7);
  B.arc(36,4,7).enemy('fossilPiranha',39,2,{rise:3.5});
  /* the amber vault: bricks on the near side, and only a dash goes through bricks side on */
  B.fill(46,2,46,3,BRICK).fill(46,4,50,4,HARD).fill(50,2,50,3,HARD).spark(48,2,'sun').coins(47,3,3);
  /* a tar post and a stone lip to kick up between, to the high road; or walk on under, along the boulder alley */
  B.fill(55,4,55,9,STICKY).fill(59,4,59,5,HARD).fill(59,6,69,7,GROUND).fill(73,6,80,7,GROUND).fill(84,6,93,7,GROUND).coinCol(57,3,5);
  B.enemy('bones',64,8).spark(76,9).coins(74,8,2).coins(78,8,2).enemy('bones',88,8).enemy('fossilStal',71,10).enemy('fossilStal',82,10);
  B.fill(61,2,61,2,HARD).chute(92,2,4.5,-1).coins(66,3,3).coins(76,3,3).coins(85,3,3);
  B.checkpoint(97);
  /* slabs over the river, under a low roof with teeth in it */
  B.fill(105,9,119,10,GROUND).fall(105,3,3).fall(110,4,3).fall(115,3,3).enemy('fossilStal',111,8).enemy('fossilStal',116,8).enemy('fossilPiranha',113,2,{rise:2.5}).coins(106,5,2).coins(111,6,2).coins(116,5,2);
  B.row(125,5,'?M?').enemy('fossilTrike',131).enemy('stack',138).fill(143,2,143,2,HARD);
  /* the boulder stair, in the dark */
  B.ground(148,149,3).ground(150,151,4).ground(152,153,5).ground(154,155,6).ground(156,172,7).clear(154,11,174,12);
  B.chute(166,7,4,-1).row(163,9,'=====').coins(163,10,5).row(169,10,'?O?').enemy('fossilStal',151,10);
  B.enemy('bones',178).warp(182,2,'in').enemy('fossilBlock',188,7).warp(193,3,'out',true).enemy('stack',198);
  B.clear(201,11,227,14).stairs(203,5).fill(208,2,208,6,HARD);
  B.goal(214);
  /* an amber pocket off the pipe: a geyser, a shelf, the third spark */
  B.fill(228,2,231,10,GROUND).fill(232,2,232,10,HARD).fill(255,2,255,10,HARD).ground(232,255);
  B.warp(234,2,'in',true).coinBox(236,3,239,5).geyser(242,2,4,4).coinCol(242,4,3).row(245,6,'====').coins(245,7,4).spark(247,8).warp(251,2,'out');
  return B.L;
}

/* 5-5: the climb up the falls, at sunset. Four terraces between two cliffs, walked right, left, right, left, and a
   tower of geysers, a tar chimney or a swinging rib at the end of each to reach the next: boulders along the first,
   a rib and dropping slabs on the second (the checkpoint is at its start), narrow ledges with Rattles and a carved
   stone on the third, and the flag on the rim. A fall lands on the terrace below. It is narrower than the other
   levels because it is so much taller: the way through it is about 450 tiles. */
function w5l5(){
  const B=LevelBuilder(124,'fossil',50);
  B.set('rim',38);
  B.fill(0,9,11,37,GROUND).fill(110,0,123,37,GROUND);
  B.ground(0,29).ground(35,62).ground(66,66).ground(71,71).ground(75,109);
  B.fill(12,9,98,10,GROUND).clear(80,9,83,10);
  B.fill(15,18,109,19,GROUND).clear(40,18,51,19).clear(68,18,78,19);
  B.fill(12,27,96,28,GROUND).clear(84,27,87,28).clear(64,27,67,28).clear(54,27,57,28);
  B.fill(17,36,109,37,GROUND);
  /* the canyon floor, out from under the cliff */
  B.coins(7,3,3).row(16,5,'?O?').enemy('bones',22).enemy('fossilPiranha',32,2,{rise:3.5}).arc(29,4,7);
  B.enemy('fossilTrike',43).row(49,5,'B?B').enemy('stack',56);
  B.geyser(66,2,4,4,0).geyser(71,2,4,4,3).spark(71,8).coinCol(66,4,2).enemy('fossilPiranha',68.5,2,{rise:2.5});
  B.row(82,5,'?M?').enemy('bones',88).enemy('swoop',97,7,{span:9});
  /* first tower: a geyser to a shelf, a second from the shelf to the terrace */
  B.geyser(105,2,5,4,0).fill(100,6,102,6,GROUND).geyser(101,7,4,4,3).coinCol(105,4,3).coinCol(101,8,3).coins(107,3,2);
  /* first terrace, right to left: a gap, a Prickle, then the boulder run */
  B.row(91,14,'?M?').enemy('stack',88,11).arc(79,12,6).enemy('prickle',71,11).enemy('bones',64,11).fill(58,11,58,11,HARD);
  B.chute(22,11,4.5,1).row(19,13,'=====').coins(19,14,5).row(38,13,'===').coins(38,14,3).coins(46,12,3).coins(30,12,3);
  /* second tower: a chimney between the cliff and a wall of tar, with a rest halfway */
  B.fill(15,13,15,17,STICKY).row(12,15,'===').coinCol(13,12,3).coinCol(13,17,3);
  /* second terrace, left to right: a rib over the first hole, slabs over the second */
  B.checkpoint(21,20).coins(26,21,3).row(32,23,'?B?').plat(43,21,3,'s',6,1.2).spark(39,26).coins(44,23,2);
  B.enemy('swoop',62,24,{span:8}).enemy('bones',58,20).fall(69,20,3).fall(74,20,3).coins(70,22,2).coins(75,22,2);
  B.enemy('bones',86,20).row(92,23,'?O?').enemy('fossilTrike',98,20);
  /* third tower: a geyser up to where a rib swings in, and the rib across to the terrace */
  B.geyser(106,20,6,4).row(101,32,'HHH').plat(101,27,3,'s',5,1.2).coinCol(106,22,4);
  /* third terrace, right to left: narrow ledges, then tar */
  B.enemy('bones',91,29).enemy('fossilBlock',76,33).enemy('stack',71,29).enemy('bones',60,29).coins(85,31,2).coins(65,31,2).coins(55,31,2);
  B.row(45,32,'?M?').sticky(34,28,39,28).enemy('stack',26,29);
  /* last tower: two geysers again; from the top of the second, the rim is to the right, and something else to the left */
  B.geyser(18,29,5,4,0).fill(13,33,15,33,GROUND).geyser(14,34,4,4,3).coinCol(18,31,3).coinCol(14,35,3);
  /* the rim */
  B.spark(5,39).coins(7,39,3).coins(22,39,3).enemy('bones',30,38).row(40,41,'?L?').enemy('swoop',52,43,{span:10}).enemy('stack',62,38).enemy('fossilTrike',74,38);
  B.stairs(86,4,1,38).fill(90,38,90,42,HARD);
  B.goal(98,38);
  return B.L;
}

/* ---------- the island on the map ---------- */
/* the great skeleton: a giant on two legs, tail out behind, jaws open to the east */
function mpFossilRex(){ const w=fossilBone, d=fossilBoneD, l=fossilBoneL, b=[
  [-11,0,-8,22,1,16,'#c9603a'],[-9.5,1,-6.5,19,0.8,13,'#e08a4a'],
  [-3.4,1.8,-2.6,1.6,7,1.6,w],[-0.6,1.8,1.2,1.6,7,1.6,w],[-3.8,1.8,-3,3.6,1,2.4,d],[-1,1.8,0.8,3.6,1,2.4,d],
  [-4.4,8.6,-2,5.4,2.4,4.2,w],[-7.6,9.4,-0.8,3.4,1.6,1.6,w],[-10.4,8.2,-0.7,3,1.4,1.4,d],[-12.4,6.8,-0.6,2.4,1.2,1.2,d],
  [0.8,10,-1,3,1.8,2,w],[3.4,11.2,-1,3,1.8,2,w],[5.8,12.6,-0.9,2.6,1.8,1.8,w],[7.4,14,-0.8,1.8,3.2,1.6,w],
  [6.6,16.8,-2,6.4,4.2,4,w],[12.6,16.6,-1.6,3.2,2.8,3.2,l],[7.8,15.4,-1.6,7,1,3.2,d],
  [8.4,18.6,2,1.7,1.7,0.2,INK],[14.2,18,1.6,0.8,0.8,0.2,INK],[10.2,16,1.5,0.6,0.9,0.3,l],[11.6,16,1.5,0.6,0.9,0.3,l],[13,16,1.5,0.6,0.9,0.3,l],
  [5.4,9.6,1.1,0.8,2.4,0.8,d],[6,9,1.1,1.4,0.7,0.8,d]];
  for(const x of [0.6,2.6,4.6]) b.push([x,6,-2.7,0.9,4.6,0.8,l],[x,6,1.9,0.9,4.6,0.8,l],[x,5.4,-2.7,0.9,0.8,5.4,l]);
  return b; }
defWorld({name:'Fossil Falls',theme:'fossil',levels:[w5l1,w5l2,w5l3,w5l4,w5l5],
  map:{
    /* red rock on the mesas, ochre sand below, paler by the river */
    ground:(h,p)=>[h>=7?(p<0.3?['#e07a48','#d87040']:['#d0643c','#c85c36']):h<=2?['#d6bc7c','#ccb272']:p<0.3?['#f0c078','#e8b66e']:['#e8b062','#dfa658'],['#b85436','#a84a30']],
    pond:['#4fc4e0','#2a9fd0','#1f70b8'],
    scatter(M,c){ const r=c.r;
      if(r<0.07&&c.clear(1.8)) M.put(M.flora,fossilCycad(c.R),c.x,c.y,c.z,0.5+c.r2*0.15,0.2);
      else if(r<0.13) M.put(M.flora,fossilFern(c.R),c.x,c.y,c.z,0.8,0.8);
      else if(r<0.18) M.put(M.land,dBones(),c.x,c.y,c.z,0.9);
      else if(r<0.21) M.put(M.land,fossilSkull(),c.x,c.y,c.z,0.4);
      else if(r<0.27&&c.clear(1.2)) M.put(M.land,fossilSpire(c.R),c.x,c.y,c.z,0.6);
      else if(r<0.3){ M.put(M.land,fossilAmber(),c.x,c.y,c.z,0.7); M.glow.push([c.x-0.06,c.y+0.09,c.z+0.13,0.12,0.14,0.02,'#ffe08a']); }
      else if(r<0.36) M.put(M.land,dRock(pick(c.R,['#c9603a','#e08a4a'])),c.x,c.y,c.z,0.8);
      if(r>0.93) M.mote({kind:1,x:c.x,y:c.y+0.5+c.r2*0.6,z:c.z,col:'#ffe0a0',size:0.04,span:0.8,rate:0.2+c.r2*0.2}); },
    /* the great skeleton on its slab of mesa, with amber in its eye */
    landmark(M,x,y,z){ M.put(M.land,mpFossilRex(),x-0.15,y,z,0.9); M.glow.push([x+0.8,y+2.1,z+0.23,0.19,0.19,0.04,'#ffb02e']); M.lamp(x+0.6,y+1.6,z+1.2,0xffb02e,1.2,6); }
  }});
