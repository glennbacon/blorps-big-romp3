/* ================= the world map: drawing it ================= */
/* Everything here is looks: m_map.js decides the islands, the route and what is open. The map is built the first time
   it is shown and then kept. A level and the map never show together (see mapMode in z_flow.js).
   The picture is a toy diorama seen through a tilt-shift blur. Nearly all of it is three meshes: the lit land with
   everything that stands still on it, the plants that sway, and whatever glows. The sea is the levels' animated water
   over a bed that takes shadows. The few things that move by themselves are small meshes of their own, turned or
   shifted in mapViewFrame; smoke, bubbles and sparks are two instanced meshes. */
const MAP_SEA_Y=0.2, MAP_BED_Y=-0.7, MAP_TILE_H=0.07, MAP_PITCH=50*Math.PI/180, MAP_BLORP=1.15;
const MAP_SUN=[-0.55,0.74,0.38]; /* from the west and a little south: tops bright, fronts in half shade, shadows falling east */
const mapRoot=new T.Group(); mapRoot.visible=false; scene.add(mapRoot);
let mapBuilt=false, mapTiles=null, mapLocks=null, mapClears=null, mapOpenMark=null, mapMoonLit=null, mapMoonDim=null, mapMoteMesh=null, mapSmokeMesh=null, mapWeather=null,
  mapCamX=0, mapCamY=0, mapCamZ=0, mapNoteT=0, mapIdleT=0, mapFaceY=0, mapZoom=1;
const mapSpins=[], mapBobs=[], mapMotes=[], mapSmokes=[], mapLamps=[], mapBlinks=[];
const MAP_CANDY=['#ff5fa2','#ffb02e','#ffe14d','#b58cff','#ff4f7b','#5fe0d0'];

/* ---------- what each world looks like from above ---------- */
/* A world's file says how its island is drawn, in `map` on its defWorld:
     ground(h,p,x,z)   the colours of a cell: [[cap, cap], [earth, earth]], each pair laid as a chequer. h is the cell's
                       height in steps, p a patchy scatter from 0 to 1 that changes every other cell
     pond              three colours for its pools, shallow to deep
     under             three colours for the underside of floating ground, top to bottom
     scatter(M,c)      called for every free cell of land, to stand small things on it. c has x, y, z (a spot on the cell,
                       at ground level), h (height in steps), r and r2 (two random numbers), R (more of them), and
                       clear(tall), which says whether something that many tiles high may stand there without hiding
                       the path behind it
     landmark(M,x,y,z) builds the world's great sight on the level ground behind its fifth marker: three cells square,
                       centred on x and z, with the marker to the south
   M is the kit they build with: lists of boxes in world units (land, flora, glow, soft), put(list,model,x,y,z,scale,gain)
   to add a model drawn in eighths, part(model,x,y,z,scale,material) for a mesh of its own that can then be given to
   spin(mesh,axis,rate) or bob(mesh,amp,rate,roll), lamp(x,y,z,colour,power,reach,blink) for a light, mote({...}) and
   smoke({...}) for sparks and puffs (see mapViewFrame for what the numbers mean). A world still being written, with no
   `map`, is drawn as plain grass. */
const MAP_PLAIN={ground:(h,p)=>[p<0.3?['#8fdc7a','#84d270']:['#7fd66a','#74cc60'],['#b9845a','#a97650']]};
const mapLook=w=>(WORLDS[w]&&WORLDS[w].map)||MAP_PLAIN;
function mapGround(w,x,z,h){ return (mapLook(w).ground||MAP_PLAIN.ground)(h,mapJit((x>>1)+90,(z>>1)+40),x,z); }

/* ---------- geometry ---------- */
/* Boxes, as voxGeo makes them, and loose quads with a brightness for each corner: the ground is built from quads so
   that only the faces that can be seen are made, and so that it can be shaded where a wall rises from a floor. */
function mapMesher(){
  const P=[],N=[],C=[],I=[]; let n=0;
  const M={
    quad(a,b,c,d,nx,ny,nz,col,fa,fb,fc,fd){
      _col.set(col); const r=_col.r,g=_col.g,bl=_col.b;
      P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);
      N.push(nx,ny,nz,nx,ny,nz,nx,ny,nz,nx,ny,nz);
      C.push(r*fa,g*fa,bl*fa,r*fb,g*fb,bl*fb,r*fc,g*fc,bl*fc,r*fd,g*fd,bl*fd);
      /* split along the diagonal that keeps the shading even */
      if(fa+fc>=fb+fd) I.push(n,n+1,n+2,n,n+2,n+3); else I.push(n+1,n+2,n+3,n+1,n+3,n);
      n+=4; },
    /* the top of a cell, and one of its four walls from y0 up to y1: side 0 south, 1 east, 2 north, 3 west */
    top(x,y,z,col,f){ M.quad([x,y,z+1],[x+1,y,z+1],[x+1,y,z],[x,y,z],0,1,0,col,f[0],f[1],f[2],f[3]); },
    wall(x,z,y0,y1,side,col,f0,f1){
      if(side===0) M.quad([x,y0,z+1],[x+1,y0,z+1],[x+1,y1,z+1],[x,y1,z+1],0,0,1,col,f0,f0,f1,f1);
      else if(side===1) M.quad([x+1,y0,z+1],[x+1,y0,z],[x+1,y1,z],[x+1,y1,z+1],1,0,0,col,f0,f0,f1,f1);
      else if(side===2) M.quad([x+1,y0,z],[x,y0,z],[x,y1,z],[x+1,y1,z],0,0,-1,col,f0,f0,f1,f1);
      else M.quad([x,y0,z],[x,y0,z+1],[x,y1,z+1],[x,y1,z],-1,0,0,col,f0,f0,f1,f1); },
    boxes(list){ for(const b of list){ const x=b[0],y=b[1],z=b[2],w=b[3],h=b[4],d=b[5],c=b[6];
      M.quad([x,y+h,z+d],[x+w,y+h,z+d],[x+w,y+h,z],[x,y+h,z],0,1,0,c,1,1,1,1); M.quad([x,y,z],[x+w,y,z],[x+w,y,z+d],[x,y,z+d],0,-1,0,c,1,1,1,1);
      for(let s=0;s<4;s++){ if(s===0) M.quad([x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d],0,0,1,c,1,1,1,1);
        else if(s===1) M.quad([x+w,y,z+d],[x+w,y,z],[x+w,y+h,z],[x+w,y+h,z+d],1,0,0,c,1,1,1,1);
        else if(s===2) M.quad([x+w,y,z],[x,y,z],[x,y+h,z],[x+w,y+h,z],0,0,-1,c,1,1,1,1);
        else M.quad([x,y,z],[x,y,z+d],[x,y+h,z+d],[x,y+h,z],-1,0,0,c,1,1,1,1); } } },
    geo(){ const g=new T.BufferGeometry();
      g.setAttribute('position',new T.Float32BufferAttribute(P,3)); g.setAttribute('normal',new T.Float32BufferAttribute(N,3)); g.setAttribute('color',new T.Float32BufferAttribute(C,3));
      g.setIndex(I); return g; }
  };
  return M;
}
/* add a model (in 1/8 units, as the level props are) to a list of boxes in world units, at a size; `gain` is how
   much it sways, for a list that will be drawn with the flora material */
function mapPut(list,model,x,y,z,k,gain){ k=(k||1)*S8; for(const b of model) list.push([x+b[0]*k,y+b[1]*k,z+b[2]*k,b[3]*k,b[4]*k,b[5]*k,b[6],y,gain===undefined?1:gain]); }
/* a mesh of its own, for something that moves */
function mapPart(model,x,y,z,k,mat,lit){ const m=new T.Mesh(voxGeo(model,(k||1)*S8),mat||MAT.vox); m.position.set(x,y,z); if(lit!==false&&mat!==MAT.glow){ m.castShadow=true; } mapRoot.add(m); return m; }

/* ---------- models any world's island may use (units: 1/8 cell) ---------- */
function mpBoat(c){ return [[-3,0,-1.2,6,1.4,2.4,'#fff2c2'],[-2.2,-0.5,-0.9,4.4,0.5,1.8,'#b07f48'],[3,0.4,-0.8,1.2,1,1.6,'#fff2c2'],[-0.2,1.4,-0.2,0.4,6.4,0.4,'#8a5a2b'],[0.2,2,-0.1,3,5,0.2,c],[-2.4,2.2,-0.1,2.2,3.6,0.2,WHITE]]; }
function mpTree(c,f){ const l=shade(c,1.16); return [[-1.2,0,-1.2,2.4,9,2.4,'#8a5a2b'],[-6,7,-5,12,4,10,shade(c,0.86)],[-7,11,-6,14,5,12,c],[-5,16,-4,10,4,8,c],[-3,20,-2.5,6,2.4,5,l],[-6,12,6,3,2,0.4,l],[3,17,4,2,2,0.4,f||l]]; }
function mpFern(c){ const d=shade(c,0.85); return [[-0.4,0,-0.4,0.8,3,0.8,d],[-2.6,2,-0.5,2.4,0.8,1,c],[0.4,2.4,-0.5,2.6,0.8,1,c],[-0.5,2.2,0.4,1,0.8,2.4,d],[-0.5,3,-2.4,1,0.8,2.2,c],[-1,3.6,-1,2,1,2,c]]; }
function mpLantern(){ const k='#2c2447'; return [[-0.4,0,-0.4,0.8,7.4,0.8,k],[-0.9,0,-0.9,1.8,0.6,1.8,k],[0,6.8,-0.3,2.6,0.6,0.6,k],[1.5,3.8,-0.8,1.6,0.4,1.6,k],[1.5,6,-0.8,1.6,0.5,1.6,k]]; }
/* a cog seen face on, to be turned about its middle; `flat` lays it on the ground instead */
function mpCog(c,r,flat){ const d=shade(c,0.72), t=r*0.34, b=[[-r*0.78,-r*0.78,-0.7,r*1.56,r*1.56,1.4,c],[-r*1.08,-t,-0.7,r*2.16,t*2,1.4,c],[-t,-r*1.08,-0.7,t*2,r*2.16,1.4,c],[-r*0.3,-r*0.3,-0.9,r*0.6,r*0.6,1.8,d]];
  return flat?b.map(q=>[q[0],q[2]+0.9,q[1],q[3],q[5],q[4],q[6]]):b; }
function mpWindmill(c){ return [[-2.6,0,-2.6,5.2,3,5.2,'#f1e6d0'],[-2.2,3,-2.2,4.4,5,4.4,WHITE],[-1.8,8,-1.8,3.6,3,3.6,WHITE],[-2.8,11,-2.8,5.6,1.2,5.6,c],[-2,12.2,-2,4,1.2,4,c],[-1,13.4,-1,2,1.2,2,shade(c,1.15)],[-0.8,0,2.6,1.6,2.6,0.2,'#8a5a2b']]; }
function mpSails(c){ const w='#fff2c2', b=[[-0.8,-0.8,-0.4,1.6,1.6,1,'#8a5a2b']];
  for(const q of [[0,1],[1,0],[0,-1],[-1,0]]) b.push([q[0]*0.8-(q[0]?0:0.4),q[1]*0.8-(q[1]?0:0.4),0,q[0]?q[0]*7:0.8,q[1]?q[1]*7:0.8,0.3,'#8a5a2b'].map((v,i)=>i===3||i===4?Math.abs(v):v),[q[0]>0?1.6:q[0]<0?-7.6:(q[1]>0?0.4:-2.6),q[1]>0?1.6:q[1]<0?-7.6:(q[0]>0?-2.6:0.4),0.2,q[0]?6:2.2,q[1]?6:2.2,0.15,q[0]+q[1]>0?w:c]);
  return b.map(q=>{ if(q[3]<0){ q[0]+=q[3]; q[3]=-q[3]; } if(q[4]<0){ q[1]+=q[4]; q[4]=-q[4]; } return q; }); }
function mpBalloon(c){ const l=shade(c,1.18); return [[-4,7,-4,8,8,8,c],[-3,15,-3,6,2,6,l],[-3,5,-3,6,2,6,shade(c,0.85)],[-4.1,10,-1.2,8.2,2.4,2.4,WHITE],[-1.2,10,-4.1,2.4,2.4,8.2,WHITE],[-1.2,0,-1.2,2.4,2,2.4,'#b98a5a'],[-1.6,2,-1.6,0.2,3.4,0.2,'#8a5a2b'],[1.4,2,-1.6,0.2,3.4,0.2,'#8a5a2b'],[-1.6,2,1.4,0.2,3.4,0.2,'#8a5a2b'],[1.4,2,1.4,0.2,3.4,0.2,'#8a5a2b']]; }
function mpSpire(c){ return [[-1.5,0,-1.5,3,5,3,c],[-1,5,-1,2,4,2,shade(c,1.25)],[-0.5,9,-0.5,1,3,1,shade(c,1.5)],[1.2,0,-0.4,2,3,2,c],[-2.6,0,0.2,1.4,2,1.4,shade(c,1.2)]]; }
function mpStar(c){ return [[-1.6,0.6,-0.5,3.2,1.2,1],[-0.6,-0.6,-0.5,1.2,3.6,1],[-1.1,-0.1,-0.6,2.2,2.4,1.2]].map(q=>q.concat([c])); }
/* the little sun by a marker, for each of its level's sparks */
function mpSun(c){ const b=[]; ['  #  ',' ### ','#####',' ### ','  #  '].forEach((r,j)=>{ let i=0; while(i<5){ if(r[i]==='#'){ let k=i; while(k<5&&r[k]==='#') k++; b.push([i-2.5,4-j,-0.6,k-i,1,1.2,c]); i=k; } else i++; } }); return b; }

/* ---------- building the map ---------- */
function mapViewBuild(){
  mapBuilt=true;
  const I=ISLE, W=MAP_W, D=MAP_D, R=rng(2026), G_=mapMesher(), land=[], flora=[], glow=[], soft=[], dark=[], lava=mapMesher(), pond=mapMesher(), keep=new Set();
  const inMap=(x,z)=>x>=0&&z>=0&&x<W&&z<D, at=(x,z)=>z*W+x;
  const kindAt=(x,z)=>inMap(x,z)?I.kind[at(x,z)]:MK_SEA;
  const hAt=(x,z)=>I.h[at(Math.floor(x),Math.floor(z))]*MAP_STEP;
  const lamp=(x,y,z,col,p,r,blink)=>mapLamps.push({x,y,z,col,p:p||1,r:r||6,blink:!!blink});

  /* ---- how high the top of each cell stands: the ground, the floor of a pond, the face of the lava ---- */
  const ty=new Float32Array(W*D).fill(-9), shelf=new Uint8Array(W*D), wet=new Uint8Array(W*D);
  for(let k=0;k<W*D;k++){ const kd=I.kind[k]; if(kd===MK_LAND) ty[k]=I.h[k]*MAP_STEP; else if(kd===MK_LAVA||kd===MK_GOO) ty[k]=I.h[k]*MAP_STEP-0.3; else if(kd===MK_POND) ty[k]=I.h[k]*MAP_STEP-0.55; }
  /* how far each cell of sea is from ground that stands in it, up to 3: the pale shelf; and each cell of a pond from its bank */
  for(let pass=1;pass<=3;pass++) for(let z=0;z<D;z++) for(let x=0;x<W;x++){ const k=at(x,z);
    if(I.kind[k]===MK_SEA&&!shelf[k]){ for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ if(!inMap(x+dx,z+dz)) continue; const n=at(x+dx,z+dz);
        if(pass===1?(I.kind[n]!==MK_SEA&&!I.base[n]):(shelf[n]===pass-1&&(pass<3||Math.abs(dx)+Math.abs(dz)===1))) shelf[k]=pass; } }
    if(I.kind[k]===MK_POND&&!wet[k]){ for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=at(x+d[0],z+d[1]); if(pass===1?I.kind[n]===MK_LAND:wet[n]===pass-1) wet[k]=pass; } } }
  /* the shade of a floor at one of its corners: darker for every taller cell that meets it there */
  const corner=(cx,cz,y)=>{ let n=0; for(const q of [[cx-1,cz-1],[cx,cz-1],[cx-1,cz],[cx,cz]]) if(inMap(q[0],q[1])&&ty[at(q[0],q[1])]>y+0.3) n++; return 1-0.13*Math.min(n,3); };
  const shades=(x,z,y)=>[corner(x,z+1,y),corner(x+1,z+1,y),corner(x+1,z,y),corner(x,z,y)];
  const SIDES=[[0,1],[1,0],[0,-1],[-1,0]];

  /* ---- the ground, the pools, the shallows ---- */
  for(let z=0;z<D;z++) for(let x=0;x<W;x++){
    const k=at(x,z), kd=I.kind[k], odd=(x+z)&1, j=mapJit(x+7,z+3);
    if(kd===MK_SEA){
      if(shelf[k]){ const s=shelf[k], y=MAP_SEA_Y-(s===1?0.2:s===2?0.42:0.6);
        G_.top(x,y,z,s===1?(odd?'#f4f6dc':'#e8eed0'):s===2?'#9fdcf0':'#5cb6f2',shades(x,z,y)); }
      continue; }
    const w=I.world[k], look=mapGround(w,x,z,I.h[k]), top=ty[k], floats=I.base[k]>0, y0=floats?I.base[k]*MAP_STEP:MAP_BED_Y-0.1;
    /* higher ground is a little brighter, which is most of what makes a hill read as a hill from above */
    const f=0.94+j*0.06+clamp((I.h[k]-(floats?I.base[k]+2:2))*0.02,-0.04,0.1);
    const cap=shade(look[0][odd],f), body=shade(look[1][odd],f), lip=shade(look[0][odd],f*0.86);
    if(kd===MK_LAND) G_.top(x,top,z,cap,shades(x,z,top));
    else if(kd===MK_POND){ const s=wet[k]||3, pc=mapLook(w).pond||['#35b8e0','#1d7fd0','#12489f']; G_.top(x,top,z,pc[Math.min(s,3)-1],shades(x,z,top));
      if(top+0.25>MAP_SEA_Y+0.1) pond.top(x,top+0.25,z,WHITE,[1,1,1,1]); }
    else { lava.top(x,top,z,WHITE,[1,1,1,1]);
      for(const d of SIDES){ const n=at(x+d[0],z+d[1]); if((I.kind[n]===MK_LAVA||I.kind[n]===MK_GOO)&&ty[n]<top-0.05) glow.push([x+(d[0]>0?0.98:0),ty[n],z+(d[1]>0?0.98:0),d[0]?0.04:1,top-ty[n],d[1]?0.04:1,odd?'#ff7a1f':'#ff9a2e']); }
      if(j<0.3) mapMotes.push({kind:0,x:x+0.2+j*2,y:top,z:z+0.5,col:'#ffb02e',size:0.07,span:1.6+j*3,rate:0.3+j,ph:j*9}); }
    /* walls: wherever the neighbour stands lower. A cap's width of the top colour, then earth that darkens downward */
    SIDES.forEach((d,s)=>{ const nx=x+d[0], nz=z+d[1], nk=inMap(nx,nz)?at(nx,nz):-1, low=nk<0||I.kind[nk]===MK_SEA?y0:Math.max(ty[nk],y0);
      if(low>=top-0.001) return;
      const mid=kd===MK_LAND?Math.max(low,top-0.15):top, deep=clamp((top-low)*0.16,0,0.3);
      if(mid<top) G_.wall(x,z,mid,top,s,lip,1,1);
      if(low<mid) G_.wall(x,z,low,mid,s,body,1-deep,1); });
    if(floats){ /* floating ground tapers underneath, and throws a shadow on the sea */
      let deep=0; while(deep<3&&![[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]].some(q=>{ const a=x+q[0]*(deep+1), b=z+q[1]*(deep+1); return !inMap(a,b)||!I.base[at(a,b)]; })) deep++;
      const under=mapLook(w).under||['#4a416b','#3a3355','#2c2447'];
      G_.quad([x,y0,z],[x+1,y0,z],[x+1,y0,z+1],[x,y0,z+1],0,-1,0,under[0],1,1,1,1);
      for(let i=0;i<deep;i++){ const m=0.06+i*0.1+j*0.08; land.push([x+m,y0-(i+1)*0.55,z+m,1-m*2,0.56,1-m*2,under[Math.min(i,2)]]); }
      if(deep===3&&j<0.4) glow.push([x+0.36,y0-2.3,z+0.36,0.28,0.7,0.28,j<0.2?'#ffc928':'#b58cff']);
      const sx=x-MAP_SUN[0]/MAP_SUN[1]*(y0-MAP_SEA_Y), sz=z-MAP_SUN[2]/MAP_SUN[1]*(y0-MAP_SEA_Y); dark.push([sx,0,sz,1,0.02,1,INK]); }
  }

  /* ---- bridges and stairs ---- */
  /* A stair of light leads to floating ground; lily pads cross a pond; a slab of iron crosses lava; every other gap
     is crossed by planks. */
  const RAINBOW=['#ff6a7e','#ffb347','#ffe66a','#7fe6a0','#7fc4ff','#c3a0ff'];
  MAPSEGS.forEach((seg,si)=>{ const a=seg[0], b=seg[seg.length-1], sky=I.base[at(a.x,a.z)]>0||I.base[at(b.x,b.z)]>0, wMax=Math.max(I.world[at(a.x,a.z)],I.world[at(b.x,b.z)]);
    seg.forEach((c,ci)=>{ const k=at(c.x,c.z); if(!I.deck[k]||I.kind[k]===MK_LAND) return; const x=c.x, z=c.z, y=c.h*MAP_STEP, kd=I.kind[k];
      if(sky){ glow.push([x+0.07,y-0.13,z+0.07,0.86,0.13,0.86,ci%2?'#ffd23e':'#ffe680']); soft.push([x+0.2,y,z+0.2,0.6,0.02,0.6,'#fff7d6']); if(ci%2) mapMotes.push({kind:2,x:x+0.5,y:y+0.5,z:z+0.5,col:'#fff3a0',size:0.06,span:0.5,rate:0.7,ph:ci}); }
      else if(kd===MK_POND){ const s=ty[k]; land.push([x+0.1,s+0.22,z+0.1,0.8,y-s-0.2,0.8,'#2f8a56'],[x+0.06,y-0.08,z+0.06,0.88,0.08,0.88,(ci&1)?'#58c273':'#4db868'],[x+0.56,y,z+0.5,0.22,0.1,0.22,(ci&1)?'#ff8fc7':'#ffffff']); }
      else if(kd===MK_LAVA){ land.push([x+0.02,y-0.14,z+0.1,0.96,0.14,0.8,'#4a4458'],[x+0.02,y-0.2,z+0.06,0.96,0.12,0.1,'#2c2734'],[x+0.02,y-0.2,z+0.84,0.96,0.12,0.1,'#2c2734'],[x+0.02,y-0.2,z+0.06,0.1,0.12,0.88,'#2c2734'],[x+0.88,y-0.2,z+0.06,0.1,0.12,0.88,'#2c2734']); }
      else { const ns=seg[ci+1]&&seg[ci-1]&&seg[ci+1].x===x&&seg[ci-1].x===x; /* planks lie across the way they are walked */
        for(let i=0;i<3;i++) land.push(ns?[x+0.03,y-0.1,z+0.03+i*0.32,0.94,0.1,0.3,i%2?'#a87646':'#b98a5a']:[x+0.03+i*0.32,y-0.1,z+0.03,0.3,0.1,0.94,i%2?'#a87646':'#b98a5a']);
        const foot=kd===MK_SEA?MAP_BED_Y:ty[k]-0.3;
        for(const p of [0.05,0.83]) land.push(ns?[x+p,foot,z+0.44,0.12,y-0.1-foot,0.12,'#7d5630']:[x+0.44,foot,z+p,0.12,y-0.1-foot,0.12,'#7d5630']); } }); });

  /* ---- what stands where ---- */
  const hold=(x0,z0,x1,z1)=>{ for(let z=z0;z<=z1;z++) for(let x=x0;x<=x1;x++) keep.add(at(x,z)); };
  const Mk={land,flora,glow,soft,put:mapPut,part:mapPart,lamp,R,
    spin:(m,axis,rate)=>{ mapSpins.push({m,axis,rate}); return m; },
    bob:(m,amp,rate,roll,drift)=>{ mapBobs.push({m,y:m.position.y,amp:amp||0.05,rate:rate||1,roll:roll||0,drift}); return m; },
    blink:(m,kind)=>{ mapBlinks.push({m,kind:kind||0}); return m; },
    mote:o=>mapMotes.push(Object.assign({kind:0,size:0.07,span:1,rate:0.5,ph:R()*9,col:'#ffffff'},o)),
    smoke:o=>mapSmokes.push(Object.assign({col:'#ffffff',rise:1.6,drift:0.8,size:0.3,rate:0.24,ph:R()},o)), hAt, sea:MAP_SEA_Y};
  /* Blorp's hut by the first marker, and boats here and there on the open sea */
  { const n=MAPNODES[0]; mapPut(land,mHut(),n.x-1.6,hAt(n.x-1,n.z),n.z-0.4,0.42); hold(n.x-2,n.z-1,n.x-1,n.z); }
  for(const q of [[19,49.5,'#ff4f7b',1],[38,34.5,'#ffe14d',0.9],[57,33,'#2fd6c3',0.9],[35,16,'#ff8f3c',0.9],[70,13,'#b58cff',0.8]])
    mapBobs.push({m:mapPart(mpBoat(q[2]),q[0],MAP_SEA_Y+0.06,q[1],q[3]),y:MAP_SEA_Y+0.06,amp:0.05,rate:1.1+q[3]*0.2,roll:0.06,drift:[q[0]-2.5,q[0]+2.5,0.22]});
  /* each world's landmark, on the level ground behind its fifth marker, where it hides nothing */
  for(let w=0;w<10;w++){ const n=MAPNODES[w*5+4], look=mapLook(w); hold(n.x-1,n.z-3,n.x+1,n.z-1);
    if(look.landmark) look.landmark(Mk,n.x+0.5,n.h*MAP_STEP,n.z-1.5);
    else { mapPut(land,mpWindmill('#ff8fc7'),n.x+0.5,n.h*MAP_STEP,n.z-1.6,1.15); mapSpins.push({m:mapPart(mpSails('#ff8fc7'),n.x+0.5,n.h*MAP_STEP+9.7*S8*1.15,n.z-1.6+3.7*S8*1.15,1.15),axis:'z',rate:0.9}); } }

  /* ---- small things, scattered: each world's own, on every cell of its land that is free ---- */
  const onRoute=(x,z)=>inMap(x,z)&&I.route[at(x,z)]>=0;
  /* something tall hides whatever is just north of it, so nothing tall may stand south of the path */
  const clearAt=(x,z,tall)=>{ const n=Math.ceil(tall/1.1); for(let d=1;d<=n;d++) for(let dx=-1;dx<=1;dx++) if(onRoute(x+dx,z-d)) return false; return true; };
  for(let z=1;z<D-1;z++) for(let x=1;x<W-1;x++){
    const k=at(x,z), kd=I.kind[k], w=I.world[k], r=R(), px=x+0.3+R()*0.4, pz=z+0.3+R()*0.4, r2=R(), look=mapLook(w);
    if(kd===MK_POND&&!onRoute(x,z)&&!keep.has(k)){ if(look.pondScatter) look.pondScatter(Mk,{x:px,y:ty[k]+0.25,z:pz,r,r2,R,bank:wet[k]}); continue; }
    if(kd!==MK_LAND||onRoute(x,z)||keep.has(k)||MAPNODES.some(n=>Math.abs(n.x-x)<=1&&Math.abs(n.z-z)<=1)) continue;
    const y=I.h[k]*MAP_STEP, c={x:px,y,z:pz,h:I.h[k],r,r2,R,cx:x,cz:z,clear:tall=>clearAt(x,z,tall)};
    if(look.scatter) look.scatter(Mk,c);
    else if(r<0.1&&c.clear(2.4)) mapPut(flora,mpTree(pick(R,['#3ab85b','#2fae5a']),'#ff8fc7'),px,y,pz,0.8,0.16);
    else if(r<0.3) mapPut(flora,dFlower(pick(R,MAP_CANDY)),px,y,pz,0.75,1);
  }

  /* ---- the meshes ---- */
  G_.boxes(land);
  const ground=new T.Mesh(G_.geo(),MAT.vox); ground.castShadow=true; ground.receiveShadow=true;
  const plants=new T.Mesh(voxGeo(flora,1,true),MAT.flora); plants.castShadow=true; plants.receiveShadow=true;
  mapRoot.add(ground,plants,new T.Mesh(voxGeo(glow,1),MAT.glow),new T.Mesh(voxGeo(soft,1),MAT.soft));
  const sh=new T.Mesh(voxGeo(dark,1),new T.MeshBasicMaterial({color:0x0a2a66,transparent:true,opacity:0.26,depthWrite:false})); sh.position.y=MAP_SEA_Y+0.03; sh.renderOrder=3; mapRoot.add(sh);
  /* the sea: a bed that takes shadows, and the levels' water over it. The water keeps whatever glow lies beneath it,
     or the whole sea would shine. Lava and ponds are the same water in other colours. */
  const flatten=m=>{ m.blending=T.CustomBlending; m.blendSrc=T.SrcAlphaFactor; m.blendDst=T.OneMinusSrcAlphaFactor; m.blendSrcAlpha=T.ZeroFactor; m.blendDstAlpha=T.OneFactor; m.userData.tmp=false; return m; };
  const bed=new T.Mesh(new T.PlaneGeometry(420,420),new T.MeshLambertMaterial({color:0x1c74d6})); bed.rotation.x=-Math.PI/2; bed.position.set(W/2,MAP_BED_Y,D/2); bed.receiveShadow=true;
  const sea=new T.Mesh(new T.PlaneGeometry(420,420),flatten(liquidMat({kind:'water',a:'#2aa2f0',b:'#e6fbff',op:0.6,flow:0.5},0))); sea.rotation.x=-Math.PI/2; sea.position.set(W/2,MAP_SEA_Y,D/2); sea.renderOrder=2;
  const lavaM=new T.Mesh(lava.geo(),liquidMat({kind:'lava',a:'#ff5a14',b:'#ffd23e',op:1,mask:0.3,flow:0.35},0)); lavaM.material.userData.tmp=false;
  const pondM=new T.Mesh(pond.geo(),flatten(liquidMat({kind:'water',a:'#2fc4d0',b:'#e6fffb',op:0.62,flow:0.3},0))); pondM.renderOrder=2;
  mapRoot.add(bed,sea,lavaM,pondM);

  /* ---- clouds: a few low over open water where they cover nothing, and a sheet of unseen ones high up, there
     only for the shadows it trails across the land ---- */
  for(const q of [[20,2.6,34.4,0.3],[39,2.4,17,0.26],[57,3,35.6,0.3],[74,2.2,31.5,0.28],[3,2.4,35,0.24],[36,3,50,0.3]]){
    const m=new T.Mesh(voxGeo(cloudBoxes(R),q[3]),MAT.soft); m.position.set(q[0],q[1],q[2]); m.castShadow=true; mapRoot.add(m); mapBobs.push({m,y:q[1],amp:0.06,rate:0.4,drift:[q[0]-2.5,q[0]+2.5,0.12]}); }
  { const b=[], S=rng(7); for(let i=0;i<7;i++){ const x=S()*90, z=S()*56-6, s=1.2+S(); for(const o of [0,-90]) b.push([x+o,0,z,5*s,0.6,2.6*s,WHITE],[x+o+1.2*s,0,z+1.6*s,3*s,0.6,2*s,WHITE]); }
    mapWeather=new T.Mesh(voxGeo(b,1),new T.MeshBasicMaterial({colorWrite:false,depthWrite:false})); mapWeather.castShadow=true; mapWeather.frustumCulled=false; mapWeather.position.y=15; mapRoot.add(mapWeather); }

  /* ---- smoke, and the small lights that rise, wander and twinkle: one mesh each, a box for every puff or spark ---- */
  const cube=voxGeo([[-0.5,-0.5,-0.5,1,1,1,WHITE]],1);
  mapMoteMesh=new T.InstancedMesh(cube,MAT.glow,Math.max(1,mapMotes.length)); mapSmokeMesh=new T.InstancedMesh(cube,MAT.soft,Math.max(1,mapSmokes.length));
  mapMotes.forEach((p,i)=>mapMoteMesh.setColorAt(i,_col.set(p.col))); mapSmokes.forEach((p,i)=>mapSmokeMesh.setColorAt(i,_col.set(p.col)));
  for(const m of [mapMoteMesh,mapSmokeMesh]){ m.frustumCulled=false; mapRoot.add(m); }

  /* ---- the markers: a locked, an open and a cleared look, and three little moons in front of each for its sparks ---- */
  const n=MAPNODES.length;
  mapLocks=new T.InstancedMesh(geo('mapLock',mMapLock),MAT.vox,n); mapClears=new T.InstancedMesh(geo('mapClear',mMapClear),MAT.vox,n);
  mapMoonDim=new T.InstancedMesh(voxGeo(mpSun('#6f76a8'),0.045),MAT.vox,n*3); mapMoonLit=new T.InstancedMesh(voxGeo(mpSun('#ffd23e'),0.045),new T.MeshBasicMaterial({vertexColors:true,opacity:0.25}),n*3);
  mapOpenMark=vmesh('mapOpen',mMapOpen);
  for(const m of [mapLocks,mapClears,mapMoonDim,mapMoonLit]){ m.frustumCulled=false; m.castShadow=m===mapLocks||m===mapClears; m.receiveShadow=m!==mapMoonLit; mapRoot.add(m); }
  mapRoot.add(mapOpenMark);

  /* ---- the path: one pale tile, edged in brown so it shows on sand and cloud alike, on every cell between two markers ---- */
  let tiles=0; for(const seg of MAPSEGS) tiles+=seg.length-2;
  mapTiles=new T.InstancedMesh(geo('mapTile',mMapTile),MAT.vox,tiles); mapTiles.frustumCulled=false; mapTiles.receiveShadow=true; mapRoot.add(mapTiles);
}

/* Make the path, the markers and their moons match what is open, what has been found, and how much of a new stretch
   has appeared so far. */
function mapViewSync(){
  if(!mapBuilt) return;
  const put=(mesh,i,x,y,z,on,tilt)=>{ _d.position.set(x,y,z); _d.rotation.set(tilt||0,0,0); _d.scale.setScalar(on?1:0.0001); _d.updateMatrix(); mesh.setMatrixAt(i,_d.matrix); };
  let i=0;
  MAPSEGS.forEach((seg,s)=>{ const shown=mapSegShown(s); for(let k=1;k<seg.length-1;k++,i++){ const c=seg[k]; put(mapTiles,i,c.x+0.5,c.h*MAP_STEP,c.z+0.5,k<shown); } });
  mapOpenMark.visible=false;
  MAPNODES.forEach((n,k)=>{ const st=mapMarkState(k), x=n.x+0.5, y=n.h*MAP_STEP, z=n.z+0.5;
    put(mapLocks,k,x,y,z,st===0); put(mapClears,k,x,y,z,st===2);
    if(st===1){ mapOpenMark.visible=true; mapOpenMark.position.set(x,y,z); }
    for(let j=0;j<3;j++){ const s=mapMoonState(k,j), mx=x+(j-1)*0.3, my=y+0.07+(j===1?0.02:0), mz=z+0.5; put(mapMoonDim,k*3+j,mx,my,mz,s===1,-0.75); put(mapMoonLit,k*3+j,mx,my,mz,s===2,-0.75); } });
  for(const m of [mapTiles,mapLocks,mapClears,mapMoonDim,mapMoonLit]) m.instanceMatrix.needsUpdate=true;
}
/* a puff where a tile of new path has just appeared, and a bigger one when its marker opens */
function mapViewPop(seg,k,done){
  const c=MAPSEGS[seg][k-1], n=done?16:4;
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, v=done?2.6:1.3;
    spawnPart(c.x+0.5,c.h*MAP_STEP+0.15,c.z+0.5,done?pick(Math.random,['#ffe14d','#ff4f7b','#ffffff']):'#fff2c2',Math.cos(a)*v,2.5+Math.random()*(done?4:1.5),Math.sin(a)*v,0.5+Math.random()*0.3,done?0.13:0.08,14); }
}
function mapViewShow(on){
  if(on&&!mapBuilt) mapViewBuild();
  mapRoot.visible=on; proot.scale.setScalar(on?MAP_BLORP:1); shadow.scale.setScalar(1);
  if(!on) return;
  stage.style.background='#2a9cee'; skyU.cTop.value.set(0x2a9cee); skyU.cMid.value.set(0x2a9cee); skyU.cBot.value.set(0x2a9cee); skyU.sunGlow.value=0; skyU.uStars.value=0; skyU.uBand.value=0;
  scene.fog=new T.Fog(0x9fd8ff,60,160); sunDir.set(MAP_SUN[0],MAP_SUN[1],MAP_SUN[2]).normalize();
  POST.bloom=0.9; POST.hi=0.1; POST.sat=1.1; POST.con=1.05; POST.tilt_=0.9; POST.tiltY=0.5; POST.vig=0.45;
  POST.ao_=0.9; POST.dof=0; POST.rays=0; POST.dark=0; POST.wob=0; POST.shadow.setRGB(1,1,1); POST.high.setRGB(1,1,1); skyU.uCloud.value=0; skyU.uNeb.value=0; skyU.uSpokes.value=0; skyU.uEclipse.value=0; skyU.uShoot.value=0;
  hemi.color.set(0xffffff); hemi.groundColor.set(0xb4c6e2); hemi.intensity=0.64; sun.color.set(0xfff1d6); sun.intensity=0.72;
  proot.visible=true; mapFaceY=0; mapIdleT=0; pmat.emissive.setRGB(0,0,0);
  mapCamera(0,true);
}
/* The camera looks down on Blorp from the south and follows him, stopping short of showing nothing but sea. */
function mapCamera(dt,snap){
  /* vt is how much of the world fits top to bottom at Blorp's distance. A level's view grows on a narrow screen to
     keep its width; here it is capped, or Blorp would be a speck on a phone. mapZoom is for looking the map over
     from the console. */
  const s=MAPST, vt=Math.min(V*0.95,14)*mapZoom, hw=vt*camera.aspect/2, hd=vt/Math.sin(MAP_PITCH)/2, d=vt/2/Math.tan(15*Math.PI/180);
  const lim=(v,lo,hi)=>lo<hi?clamp(v,lo,hi):(lo+hi)/2;
  const tx=lim(s.x,hw-3,MAP_W-hw+3), ty=mapZoom>1.5?lerp(s.y,4,Math.min(1,mapZoom-1.5)):s.y, tz=lim(s.z,hd-4.5,MAP_D-hd+3), e=snap?1:Math.min(1,dt*4.5);
  mapCamX+=(tx-mapCamX)*e; mapCamY+=(ty-mapCamY)*e; mapCamZ+=(tz-mapCamZ)*e;
  camera.position.set(mapCamX,mapCamY+d*Math.sin(MAP_PITCH),mapCamZ+d*Math.cos(MAP_PITCH)); camera.lookAt(mapCamX,mapCamY,mapCamZ);
  placeSun(mapCamX,mapCamY,mapCamZ);
  if(scene.fog){ scene.fog.near=d+16; scene.fog.far=d+95; }
}
const MAP_TURN={N:Math.PI,E:Math.PI/2,S:0,W:-Math.PI/2};
function mapViewFrame(dt,time){
  const s=MAPST, w=s.walk, g=forms[player.form], u=g.userData, hop=w?Math.sin(Math.PI*clamp(w.t,0,1)):0;
  for(let i=0;i<forms.length;i++) forms[i].visible=i===player.form;
  proot.position.set(s.x,s.y+MAP_TILE_H+hop*0.24,s.z);
  /* walking, he faces the way he is going; standing, he turns to the camera, and after a while he waves */
  let turn=(w?MAP_TURN[s.face]:0)-mapFaceY; turn-=Math.round(turn/6.2832)*6.2832; mapFaceY+=turn*Math.min(1,dt*16);
  proot.rotation.set(0,mapFaceY,0);
  mapIdleT=w?0:mapIdleT+dt;
  const wave=mapIdleT>2.5?2.3+Math.sin(time*9)*0.4:0;
  u.fL.rotation.x=hop*0.75; u.fR.rotation.x=-hop*0.45; u.aL.rotation.x=0; u.aR.rotation.x=0; u.aL.rotation.z=-hop*2; u.aR.rotation.z=hop*2||wave; u.body.position.y=0;
  const st=w?1+hop*0.08:1+Math.sin(time*3)*0.015, inv=1/Math.sqrt(st); g.scale.set(inv,st,inv);
  shadow.visible=true; shadow.position.set(s.x,s.y+MAP_TILE_H+0.02,s.z); shadow.scale.setScalar(MAP_BLORP*(1-hop*0.35));
  mapCamera(dt,false);
  if(mapOpenMark.visible){ const k=1+Math.sin(time*5)*0.07; mapOpenMark.scale.set(k,1,k); mapOpenMark.position.y=MAPNODES[Math.min(G.open,MAPNODES.length-1)].h*MAP_STEP+Math.abs(Math.sin(time*2.5))*0.05; }
  /* cogs, sails and the clock's hands turn; boats and balloons bob and drift; the lighthouse blinks; lightning plays on the storm castle */
  for(const q of mapSpins) q.m.rotation[q.axis]=time*q.rate;
  for(const q of mapBobs){ q.m.position.y=q.y+Math.sin(time*q.rate+q.y*7)*q.amp; if(q.roll) q.m.rotation.z=Math.sin(time*q.rate*0.8)*q.roll; if(q.drift) q.m.position.x=(q.drift[0]+q.drift[1])/2+Math.sin(time*q.drift[2]+q.y)*(q.drift[1]-q.drift[0])/2; }
  const beam=(time%2.6)<1.3, tz=time%4.3, zap=tz<0.09||(tz>0.2&&tz<0.3)||(tz>2.5&&tz<2.58);
  for(const q of mapBlinks) q.m.visible=q.kind?zap:beam;
  if(mapWeather) mapWeather.position.x=(time*0.55)%90-10;
  /* sparks, bubbles and fireflies: kind 0 rises and fades, 1 wanders, 2 twinkles where it is */
  for(let i=0;i<mapMotes.length;i++){ const p=mapMotes[i], t=(time*p.rate+p.ph)%1; let x=p.x, y=p.y, z=p.z, k=p.size;
    if(p.kind===0){ y+=t*p.span; x+=Math.sin(t*6+p.ph)*0.08; k*=Math.sin(t*Math.PI); }
    else if(p.kind===1){ x+=Math.sin(time*p.rate*2+p.ph)*p.span; z+=Math.cos(time*p.rate*1.4+p.ph*2)*p.span*0.6; y+=Math.sin(time*p.rate*3+p.ph)*0.15; k*=0.7+0.3*Math.sin(time*4+p.ph); }
    else k*=0.4+0.6*Math.abs(Math.sin(time*p.rate*2+p.ph));
    _d.position.set(x,y,z); _d.rotation.set(0,0,0); _d.scale.setScalar(Math.max(0.0001,k)); _d.updateMatrix(); mapMoteMesh.setMatrixAt(i,_d.matrix); }
  for(let i=0;i<mapSmokes.length;i++){ const p=mapSmokes[i], t=(time*p.rate+p.ph)%1;
    _d.position.set(p.x+t*t*p.drift,p.y+t*p.rise,p.z-t*0.2); _d.rotation.set(0,t*2,0); _d.scale.setScalar(Math.max(0.0001,p.size*(0.45+t*0.9)*Math.min(1,(1-t)*3)*Math.min(1,t*8))); _d.updateMatrix(); mapSmokeMesh.setMatrixAt(i,_d.matrix); }
  mapMoteMesh.instanceMatrix.needsUpdate=true; mapSmokeMesh.instanceMatrix.needsUpdate=true;
  /* the three roaming lights go to whatever lamps are nearest Blorp, fading in as he comes */
  let a=null, b=null, c=null, da=1e9, db=1e9, dc=1e9;
  for(const l of mapLamps){ const d=Math.abs(l.x-s.x)+Math.abs(l.z-s.z)+Math.abs(l.y-s.y)*0.5;
    if(d<da){ c=b; dc=db; b=a; db=da; a=l; da=d; } else if(d<db){ c=b; dc=db; b=l; db=d; } else if(d<dc){ c=l; dc=d; } }
  for(const q of [[a,da],[b,db],[c,dc]]){ const l=q[0]; if(!l) continue; const f=clamp(1.5-q[1]/5,0,1)*(l.blink&&!beam?0.15:1)*(0.92+0.08*Math.sin(time*9+l.x)); if(f>0.02) glowAt(l.x,l.y,l.z,l.col,l.p*f,l.r); }
  if(mapNoteT>0){ mapNoteT-=dt; if(mapNoteT<=0) mapBanner(); }
}
/* The banner names the marker Blorp stands on. A note, such as why he cannot go on, takes the hint's place for a moment. */
function mapBanner(note){
  const i=MAPST.at;
  $('map-label').textContent=LABELS[i]||''; $('map-name').textContent=LEVELS[i]?WORLDS[LEVEL_WORLD[i]].name:''; paintSparks($('map-sparks'),i); $('map-done').hidden=mapMarkState(i)!==2;
  $('map-note').textContent=note||''; $('map-banner').classList.toggle('note',!!note); mapNoteT=note?1.8:0;
}
