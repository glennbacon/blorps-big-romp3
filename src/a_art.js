/* ================= helpers ================= */
const T=THREE;
const S8=0.125;
const INK='#1c1233', WHITE='#ffffff';
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const sgn=v=>v<0?-1:1;
const lerp=(a,b,t)=>a+(b-a)*t;
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const pick=(R,a)=>a[(R()*a.length)|0];
const _col=new T.Color(), _col2=new T.Color();
function shade(hex,f){ _col.set(hex); return '#'+new T.Color(clamp(_col.r*f,0,1),clamp(_col.g*f,0,1),clamp(_col.b*f,0,1)).getHexString(); }
function mixc(a,b,t){ return '#'+_col.set(a).lerp(_col2.set(b),t).getHexString(); }

/* Build one merged, vertex-coloured geometry from a list of boxes: [x,y,z,w,h,d,colour] (min corner + size).
   A box placed with put() also carries the height of its model's foot and a gain; with `sway` set, each vertex then
   gets a weight that grows with its height above the foot, and the flora material bends it in the wind.
   Every face also says where on itself each corner is and how big it is (`bev`), so the voxel material can draw a
   thin bevel along its edges: that line of light and shade is most of what makes a box read as a little block. */
function voxGeo(boxes,s,sway){
  s=s||S8;
  const P=[],N=[],C=[],I=[],E=[],S=sway?[]:null; let n=0;
  for(const b of boxes){
    const x0=b[0]*s,y0=b[1]*s,z0=b[2]*s,x1=x0+b[3]*s,y1=y0+b[4]*s,z1=z0+b[5]*s, w=x1-x0, h=y1-y0, d=z1-z0;
    _col.set(b[6]); const r=_col.r,g=_col.g,bl=_col.b, base=b[7]===undefined?y0:b[7]*s, gain=b[8]===undefined?1:b[8];
    const F=[
      x1,y0,z1, x1,y0,z0, x1,y1,z0, x1,y1,z1,  1,0,0,
      x0,y0,z0, x0,y0,z1, x0,y1,z1, x0,y1,z0, -1,0,0,
      x0,y1,z1, x1,y1,z1, x1,y1,z0, x0,y1,z0,  0,1,0,
      x0,y0,z0, x1,y0,z0, x1,y0,z1, x0,y0,z1,  0,-1,0,
      x0,y0,z1, x1,y0,z1, x1,y1,z1, x0,y1,z1,  0,0,1,
      x1,y0,z0, x0,y0,z0, x0,y1,z0, x1,y1,z0,  0,0,-1];
    for(let f=0;f<6;f++){
      const o=f*15, fa=f<2?d:w, fb=f===2||f===3?d:h;
      for(let k=0;k<4;k++){ P.push(F[o+k*3],F[o+k*3+1],F[o+k*3+2]); N.push(F[o+12],F[o+13],F[o+14]); C.push(r,g,bl); E.push(k===1||k===2?fa:0,k>1?fb:0,fa,fb); if(S) S.push(Math.max(0,F[o+k*3+1]-base)*gain); }
      I.push(n,n+1,n+2,n,n+2,n+3); n+=4;
    }
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(P,3));
  g.setAttribute('normal',new T.Float32BufferAttribute(N,3));
  g.setAttribute('color',new T.Float32BufferAttribute(C,3));
  g.setAttribute('bev',new T.Float32BufferAttribute(E,4));
  if(S) g.setAttribute('sway',new T.Float32BufferAttribute(S,1));
  g.setIndex(I);
  return g;
}
function put(list,model,ox,oy,oz,gain){ for(const b of model) list.push([b[0]+ox,b[1]+oy,b[2]+oz,b[3],b[4],b[5],b[6],oy,gain===undefined?1:gain]); }
/* the same model at another size, or mirrored left to right */
function scaled(model,k){ return model.map(b=>[b[0]*k,b[1]*k,b[2]*k,b[3]*k,b[4]*k,b[5]*k,b[6]]); }
function mirrored(model){ return model.map(b=>[-b[0]-b[3],b[1],b[2],b[3],b[4],b[5],b[6]]); }
function recolor(model,swap){ return model.map(b=>{ const r=b.slice(); r[6]=swap[b[6]]||b[6]; return r; }); }

/* Materials. What a material writes to the alpha channel is not see-through-ness (nothing here blends unless it says
   `transparent`): it is how much the surface does NOT glow. The bloom pass spreads light from wherever alpha is below
   one, so `opacity:0` means "this is a light", and ordinary lit surfaces, at one, stay crisp.
   voxMat makes the lit material every voxel model wears. On top of three.js's own shading it draws the bevel: along the
   top edge of every side face, and round every top face, a line of light; along every other edge a line of shade. The
   line thins out with distance until it is gone, so far scenery does not shimmer. With `sway` the material also bends
   its plants in the wind, and parts them round Blorp as he walks through. */
const uTime={value:0}, uPush={value:new T.Vector3(0,-99,0)};
function voxMat(o){
  o=o||{}; const sway=o.sway, P=o.phong?T.MeshPhongMaterial:T.MeshLambertMaterial, par=Object.assign({vertexColors:true},o); delete par.sway; delete par.phong;
  const m=new P(par); m.extensions={derivatives:true};
  m.onBeforeCompile=sh=>{ sh.uniforms.uTime=uTime; sh.uniforms.uPush=uPush;
    sh.vertexShader='uniform float uTime; uniform vec3 uPush;\nattribute vec4 bev; varying vec4 vBev; varying float vBevT;\n'+(sway?'attribute float sway;\n':'')+sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n vBev=bev; vBevT=normal.y;'+(sway?' transformed.x+=(sin(uTime*1.7+position.x*0.9+position.z*0.7)*0.05+sin(uTime*3.1+position.x*2.3)*0.016)*sway; transformed.z+=sin(uTime*1.3+position.x*1.1)*0.02*sway;'+
        ' { float px=position.x-uPush.x; float k=exp(-px*px*2.2)*step(abs(position.y-uPush.y-0.4),1.3)*exp(-position.z*position.z*0.35); transformed.x+=(px<0.0?-1.0:1.0)*k*0.3*min(sway,1.4); transformed.y-=k*0.08*min(sway,1.4); }':''));
    sh.fragmentShader='varying vec4 vBev; varying float vBevT;\n'+sh.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\n { vec2 be=min(vBev.xy,vBev.zw-vBev.xy); float bd=min(be.x,be.y), bw=0.028, ba=fwidth(bd)+0.00001;'+
      ' float bl=(1.0-smoothstep(bw-ba,bw+ba,bd))*clamp(bw/ba*0.7,0.0,1.0);'+
      ' float hl=vBevT>0.5?0.7:(abs(vBevT)<0.5&&(vBev.w-vBev.y)<=bd+0.0006?1.0:0.0);'+
      ' diffuseColor.rgb*=1.0+bl*(hl>0.0?0.2*hl:-0.2); }'); };
  return m;
}
const MAT={ vox:voxMat(), glow:new T.MeshBasicMaterial({vertexColors:true,opacity:0}), soft:new T.MeshBasicMaterial({vertexColors:true,opacity:0.8}),
  coin:voxMat({phong:true,emissive:0x6b4a00,specular:0xfff0b0,shininess:26,opacity:0.82}), spark:voxMat({phong:true,emissive:0x8a5a00,specular:0xffffff,shininess:30,opacity:0.6}),
  shiny:voxMat({phong:true,specular:0xffffff,shininess:48}), flora:voxMat({sway:true}) };
const GEO={};
const geo=(k,f,s)=>GEO[k]||(GEO[k]=voxGeo(f(),s));
const vmesh=(k,f,mat)=>{ const m=new T.Mesh(geo(k,f),mat||MAT.vox); m.castShadow=true; return m; };

/* ================= pixel textures ================= */
function mkTex(draw){
  const c=document.createElement('canvas'); c.width=c.height=16; const g=c.getContext('2d'); draw(g);
  const t=new T.CanvasTexture(c); t.magFilter=T.NearestFilter; t.minFilter=T.NearestFilter; t.generateMipmaps=false; t.wrapS=t.wrapT=T.RepeatWrapping; return t;
}
const PX=(g,c,x,y,w,h)=>{ g.fillStyle=c; g.fillRect(x,y,w||1,h||1); };
function speck(g,base,cols,n,R){ PX(g,base,0,0,16,16); for(let i=0;i<n;i++) PX(g,cols[(R()*cols.length)|0],(R()*16)|0,(R()*16)|0); }
function drawStone(g,c,R){ PX(g,c.dirt,0,0,16,16); for(let r=0;r<4;r++){ const y=r*4; PX(g,c.dirtS[1],0,y,16,1); PX(g,c.capD,0,y+3,16,1); for(const x of (r%2?[3,11]:[7,15])) PX(g,c.capD,x,y,1,4); } for(let i=0;i<10;i++) PX(g,c.dirtS[0],(R()*16)|0,(R()*16)|0); }
function texTop(c){ return mkTex(g=>{ const R=rng(11); speck(g,c.top,c.topS,80,R); if(c.stone){ PX(g,c.capD,0,15,16,1); PX(g,c.capD,15,0,1,16); PX(g,c.capD,7,0,1,16); PX(g,c.capD,0,7,16,1);} }); }
function texSide(c){ return mkTex(g=>{ const R=rng(12); if(c.stone) drawStone(g,c,R); else speck(g,c.dirt,c.dirtS,70,R);
  PX(g,c.cap,0,0,16,4); PX(g,c.capL,0,0,16,1);
  for(let x=0;x<16;x++){ const d=c.stone?0:(R()*3)|0; if(d) PX(g,c.cap,x,4,1,d); PX(g,c.capD,x,3+d+(c.stone?0:1),1,1); } }); }
function texDirt(c){ return mkTex(g=>{ const R=rng(13); if(c.stone) drawStone(g,c,R); else { speck(g,c.dirt,c.dirtS,70,R); for(let i=0;i<4;i++) PX(g,c.dirtS[1],(R()*14)|0,(R()*15)|0,2,1); } }); }
function texUnder(c){ return mkTex(g=>{ const R=rng(14); if(c.stone) drawStone(g,c,R); else speck(g,c.dirt,c.dirtS,70,R);
  for(let x=0;x<16;x++){ const d=1+((R()*3)|0); PX(g,shade(c.dirt,0.72),x,16-d,1,d); } }); }
function texBrick(b){ return mkTex(g=>{ PX(g,b[0],0,0,16,16); for(let r=0;r<4;r++){ const y=r*4; PX(g,b[2],0,y,16,1); PX(g,b[1],0,y+3,16,1); for(const x of (r%2?[3,11]:[7,15])) PX(g,b[1],x,y,1,4); } }); }
function texHard(h){ return mkTex(g=>{ PX(g,h[0],0,0,16,16); PX(g,h[1],0,0,16,1); PX(g,h[1],0,0,1,16); PX(g,h[2],0,15,16,1); PX(g,h[2],15,0,1,16);
  PX(g,h[2],4,4,8,1); PX(g,h[2],4,4,1,8); PX(g,h[1],4,11,8,1); PX(g,h[1],11,4,1,8); PX(g,h[1],1,1); PX(g,h[2],14,14); }); }
function eyeBase(g){ PX(g,'#ffc928',0,0,16,16); PX(g,'#ffe680',0,0,16,1); PX(g,'#ffe680',0,0,1,16); PX(g,'#c98a00',0,15,16,1); PX(g,'#c98a00',15,0,1,16);
  for(const q of [[2,2],[13,2],[2,13],[13,13]]) PX(g,'#c98a00',q[0],q[1]); }
function texEye(open){ return mkTex(g=>{ eyeBase(g); const d='#7a4a00';
  if(open){ PX(g,d,5,4,6,1); PX(g,WHITE,5,5,6,1); PX(g,WHITE,4,6,8,4); PX(g,WHITE,5,10,6,1); PX(g,d,5,11,6,1); PX(g,d,3,6,1,4); PX(g,d,12,6,1,4);
    PX(g,d,4,5); PX(g,d,11,5); PX(g,d,4,10); PX(g,d,11,10); PX(g,INK,6,6,4,4); PX(g,WHITE,6,6,2,1); PX(g,WHITE,6,7); }
  else { PX(g,d,4,8,8,1); PX(g,d,3,7); PX(g,d,12,7); PX(g,d,5,9); PX(g,d,8,9); PX(g,d,11,9); } }); }
function texEyeTop(){ return mkTex(g=>{ eyeBase(g); }); }
function texUsed(face){ return mkTex(g=>{ PX(g,'#b08968',0,0,16,16); PX(g,'#cfa988',0,0,16,1); PX(g,'#cfa988',0,0,1,16); PX(g,'#7f5f45',0,15,16,1); PX(g,'#7f5f45',15,0,1,16);
  for(const q of [[2,2],[13,2],[2,13],[13,13]]) PX(g,'#7f5f45',q[0],q[1]);
  if(face){ PX(g,'#5d4330',4,8,8,1); PX(g,'#5d4330',3,7); PX(g,'#5d4330',12,7); } }); }
function texIce(){ return mkTex(g=>{ PX(g,'#a8e4ff',0,0,16,16); PX(g,'#dcf6ff',0,0,16,2); PX(g,'#7cc4ee',0,15,16,1); PX(g,'#7cc4ee',15,0,1,16);
  for(const q of [[2,4,4],[9,6,3],[4,10,5],[11,2,2]]) for(let i=0;i<q[2];i++) PX(g,WHITE,q[0]+i,q[1]+q[2]-1-i); }); }
/* Thin one-way ledges: only the top 8 rows of the side texture are shown. Each look draws three parts: 0 the top, 1 the
   side, 2 a side with a face on it. A world may add its own with SEMI_LOOKS.name=function(g,part,R){...} and the colour
   of its underside in SEMI_UNDER. */
const SEMI_LOOKS={
  cloud(g,part,R){
    if(part===0){ speck(g,WHITE,['#eaf6ff','#f6fbff'],40,R); return; }
    PX(g,WHITE,0,0,16,16); for(let x=0;x<16;x++){ const d=2+((R()*2)|0); PX(g,'#cfe6ff',x,8-d,1,d); }
    if(part===2){ PX(g,INK,5,1,1,2); PX(g,INK,10,1,1,2); PX(g,INK,6,4,4,1); PX(g,INK,5,3); PX(g,INK,10,3); PX(g,'#ffb3c7',3,3,2,1); PX(g,'#ffb3c7',11,3,2,1); } },
  shroom(g,part){ const c='#ff5fa2';
    if(part===0){ PX(g,c,0,0,16,16); for(const q of [[2,2],[9,4],[5,10],[12,11]]) PX(g,'#ffe3f0',q[0],q[1],3,3); return; }
    PX(g,c,0,0,16,5); PX(g,'#ff8fc0',0,0,16,1); PX(g,'#ffe3f0',2,2,2,2); PX(g,'#ffe3f0',10,1,3,2); PX(g,'#ffe9c9',0,5,16,3); for(let x=1;x<16;x+=3) PX(g,'#e8c79c',x,5,1,3);
    if(part===2){ PX(g,INK,6,2,1,2); PX(g,INK,9,2,1,2); } },
  beam(g,part){
    PX(g,'#5a6ab0',0,0,16,16); PX(g,'#8fa0e6',0,0,16,1); PX(g,'#2c3566',0,7,16,1);
    if(part===0){ for(let x=1;x<16;x+=4) PX(g,'#3ff0ff',x,6,2,4); PX(g,'#2c3566',0,15,16,1); return; }
    PX(g,'#3ff0ff',0,3,16,2); PX(g,'#bffcff',0,3,16,1); for(let x=3;x<16;x+=6) PX(g,'#2c3566',x,1);
    if(part===2){ PX(g,INK,6,3,1,2); PX(g,INK,9,3,1,2); } },
  plank(g,part){
    PX(g,'#b5793f',0,0,16,16); PX(g,'#d39a5a',0,0,16,1); PX(g,'#7d4f24',0,7,16,1); PX(g,'#7d4f24',5,0,1,16); PX(g,'#7d4f24',11,0,1,16);
    PX(g,'#3a3a4a',2,3); PX(g,'#3a3a4a',8,3); PX(g,'#3a3a4a',13,3);
    if(part===0){ PX(g,'#7d4f24',0,15,16,1); } },
  /* green canes lashed side by side */
  bamboo(g,part){
    for(let x=0;x<16;x+=4){ PX(g,'#8fcf5a',x,0,4,16); PX(g,'#b6e87a',x,0,1,16); PX(g,'#5f9a3a',x+3,0,1,16); }
    if(part===0){ PX(g,'#5f9a3a',0,5,16,1); PX(g,'#5f9a3a',0,12,16,1); return; }
    PX(g,'#b6e87a',0,0,16,1); PX(g,'#5f9a3a',0,7,16,1); PX(g,'#e8c58a',0,3,16,1);
    if(part===2){ PX(g,INK,6,2,1,2); PX(g,INK,9,2,1,2); } },
  /* a slab of something poured and set: `cols` come from the theme's `semiCols` [body, light, dark] */
  slab(g,part,R,c){ c=c||['#ffc928','#ffe680','#c98a00'];
    PX(g,c[0],0,0,16,16); PX(g,c[1],0,0,16,2); PX(g,c[2],0,7,16,1);
    if(part===0){ for(let i=0;i<5;i++) PX(g,c[1],(R()*14)|0,(R()*14)|0,2,1); return; }
    for(let x=1;x<16;x+=5) PX(g,c[2],x,3,2,2);
    if(part===2){ PX(g,INK,6,3,1,2); PX(g,INK,9,3,1,2); } }
};
const SEMI_UNDER={cloud:'#cfe6ff',shroom:'#ffe9c9',plank:'#7d4f24',beam:'#2c3566',bamboo:'#5f9a3a',slab:'#8a6a20'};
function texSemi(kind,part,cols){ return mkTex(g=>{ (SEMI_LOOKS[kind]||SEMI_LOOKS.plank)(g,part,rng(21),cols); }); }
/* Bouncy blocks: part 0 the top, 1 a side. `c` is [body, light, dark]. A world may add its own to BOUNCE_LOOKS. */
const BOUNCE_LOOKS={
  /* a wobbling cube of jelly with a face */
  jelly(g,part,c){ PX(g,c[0],0,0,16,16); PX(g,c[1],0,0,16,2); PX(g,c[1],0,0,2,16); PX(g,c[2],0,14,16,2); PX(g,c[2],14,0,2,16); PX(g,c[1],3,3,3,2); PX(g,WHITE,3,3,2,1);
    if(part===1){ PX(g,INK,5,6,2,3); PX(g,INK,9,6,2,3); PX(g,INK,6,11,4,1); PX(g,INK,5,10); PX(g,INK,10,10); } },
  /* a drum: a skin on top, a painted shell with zigzags round the side */
  drum(g,part,c){ if(part===0){ PX(g,'#fff2d6',0,0,16,16); PX(g,c[2],0,0,16,1); PX(g,c[2],0,15,16,1); PX(g,c[2],0,0,1,16); PX(g,c[2],15,0,1,16); PX(g,'#f0dcb0',5,5,6,6); return; }
    PX(g,c[0],0,0,16,16); PX(g,'#fff2d6',0,0,16,2); PX(g,c[2],0,2,16,1); PX(g,c[2],0,13,16,1); PX(g,'#fff2d6',0,14,16,2);
    for(let x=0;x<16;x++){ const y=4+Math.abs(((x+2)%8)-4); PX(g,c[1],x,y,1,2); } },
  /* a bale of straw tied with twine */
  hay(g,part,c,R){ R=R||rng(5); speck(g,c[0],[c[1],c[2]],90,R); for(let y=1;y<16;y+=3) for(let x=(y%2)*3;x<16;x+=6) PX(g,c[2],x,y,3,1);
    if(part===1){ PX(g,'#8a5a2b',3,0,1,16); PX(g,'#8a5a2b',12,0,1,16); } else { PX(g,'#8a5a2b',3,0,1,16); PX(g,'#8a5a2b',12,0,1,16); } },
  /* a trampoline: a striped frame with a taut mat on top */
  tramp(g,part,c){ if(part===0){ PX(g,'#2c2447',0,0,16,16); PX(g,c[0],0,0,16,2); PX(g,c[0],0,14,16,2); PX(g,c[0],0,0,2,16); PX(g,c[0],14,0,2,16); for(let i=4;i<12;i+=2) PX(g,'#4a3f6b',i,4,1,8); return; }
    PX(g,'#3a2f55',0,0,16,16); PX(g,c[0],0,0,16,4); PX(g,c[1],0,0,16,1); for(let x=0;x<16;x+=4) PX(g,WHITE,x,1,2,2); PX(g,'#aeb7c9',2,4,2,12); PX(g,'#aeb7c9',12,4,2,12); PX(g,'#7a8399',3,4,1,12); PX(g,'#7a8399',13,4,1,12); },
  /* a mushroom cap, spotted */
  cap(g,part,c){ PX(g,c[0],0,0,16,16); PX(g,c[1],0,0,16,1); for(const q of [[2,3],[9,2],[5,9],[12,10]]) PX(g,WHITE,q[0],q[1],3,3);
    if(part===1){ PX(g,'#fff2d6',0,9,16,7); for(let x=1;x<16;x+=3) PX(g,'#e8c79c',x,9,1,7); PX(g,c[2],0,8,16,1); } }
};
function texBounce(look,part){ const c=look.cols||['#ff8fc7','#ffd0ec','#d05a8a']; return mkTex(g=>{ (BOUNCE_LOOKS[look.kind]||BOUNCE_LOOKS.jelly)(g,part,c); }); }
/* Sticky blocks: honey, tar, gum. Part 0 the top, 1 a side with runs down it. `c` is [body, light, dark]. */
function texSticky(c,part){ return mkTex(g=>{ const R=rng(41); PX(g,c[0],0,0,16,16);
  if(part===0){ for(let i=0;i<7;i++) PX(g,c[1],(R()*13)|0,(R()*14)|0,3,1); for(let i=0;i<5;i++) PX(g,c[2],(R()*14)|0,(R()*15)|0,2,1); return; }
  PX(g,c[1],0,0,16,2); for(let x=0;x<16;x++){ const d=3+((Math.sin(x*1.3)+1)*2.5|0)+((R()*2)|0); PX(g,c[1],x,2,1,1); PX(g,c[2],x,d+6,1,16-d-6); if(x%4===1) PX(g,c[1],x,3,1,d+1); }
  for(let i=0;i<4;i++) PX(g,WHITE,2+i*4,1); }); }
const HONEY=['#ffb02e','#ffe08a','#c9740f'];

/* the sequel's blocks: conveyor belts, crumbling blocks, the toggle switch and the red and blue blocks it flips */
function texConveyor(part){ return mkTex(g=>{ PX(g,'#4a4f6a',0,0,16,16);
  if(part===0){ for(let x=0;x<16;x+=4){ PX(g,'#6a7096',x,0,2,16); PX(g,'#2c3048',x+2,0,1,16); } return; }
  PX(g,'#6a7096',0,0,16,3); PX(g,'#8a90b8',0,0,16,1); PX(g,'#2c3048',0,3,16,1); PX(g,'#2c3048',0,12,16,4);
  for(let x=0;x<16;x+=8) for(let i=0;i<3;i++){ const px=part===1?x+1+i:x+5-i; PX(g,'#ffc928',px,5+i,2,1); PX(g,'#ffc928',px,9-i,2,1); }
  for(let x=1;x<16;x+=4) PX(g,'#8a90b8',x,13,2,2); }); }
function texCrumble(){ return mkTex(g=>{ const R=rng(31); speck(g,'#e8c58a',['#f3d7a4','#d9b274'],50,R); PX(g,'#fbe3b5',0,0,16,1); PX(g,'#fbe3b5',0,0,1,16); PX(g,'#a8824a',0,15,16,1); PX(g,'#a8824a',15,0,1,16);
  for(const q of [[3,2,1,4],[4,6,3,1],[7,6,1,4],[10,3,1,3],[10,3,3,1],[5,11,1,3],[12,9,1,5],[11,9,2,1]]) PX(g,'#8a6636',q[0],q[1],q[2],q[3]); }); }
const TOG=[['#ff4f7b','#ff9bb0','#b02a4d'],['#4d96ff','#a6ccff','#2b59c3']];
function texSwitch(blue){ return mkTex(g=>{ const c=TOG[blue?1:0]; PX(g,c[0],0,0,16,16); PX(g,c[1],0,0,16,1); PX(g,c[1],0,0,1,16); PX(g,c[2],0,15,16,1); PX(g,c[2],15,0,1,16);
  PX(g,c[2],8,4,2,6); PX(g,c[2],8,12,2,2); PX(g,WHITE,7,3,2,6); PX(g,WHITE,7,11,2,2); for(const q of [[2,2],[13,2],[2,13],[13,13]]) PX(g,c[2],q[0],q[1]); }); }
function texToggle(blue,solid){ return mkTex(g=>{ const c=TOG[blue?1:0];
  if(solid){ PX(g,c[0],0,0,16,16); PX(g,c[1],0,0,16,2); PX(g,c[1],0,0,2,16); PX(g,c[2],0,14,16,2); PX(g,c[2],14,0,2,16); PX(g,c[1],5,5,6,6); PX(g,c[0],6,6,4,4); PX(g,c[2],10,6,1,5); PX(g,c[2],6,10,5,1); }
  else { g.clearRect(0,0,16,16); for(let i=0;i<16;i+=4){ PX(g,c[0],i,0,2,1); PX(g,c[0],i+2,15,2,1); PX(g,c[0],0,i+2,1,2); PX(g,c[0],15,i,1,2); } } }); }


/* ================= voxel models (units: 1/8 tile, origin at feet centre, facing +z) ================= */
function eye(x,y,z,w,h,pw,ph,px,py){ return [[x,y,z,w,h,0.4,WHITE],[x+px,y+py,z+0.4,pw,ph,0.2,INK],[x+px+pw*0.5,y+py+ph*0.55,z+0.6,pw*0.38,ph*0.34,0.08,WHITE]]; }

/* Blorp's five looks: 0 small, 1 big, 2 fire (after a chili), 3 fluff (after candyfloss: a second jump and a glide),
   4 sun (after a sunbloom: he shines in the dark, and dashes) */
function blorpCols(form){ return form===2 ? {b:'#ff6b3d',d:'#d9431e',l:'#ffd9a8',h:'#ffe14d',f:'#ffd23e',t:'#ffd23e'}
  : form===4 ? {b:'#ffc21f',d:'#e8900c',l:'#fff3c2',h:'#fff8d9',f:'#ff7a3d',t:'#ff9a3d'}
  : form===3 ? {b:'#ff9fd6',d:'#e062ad',l:'#fff0fa',h:'#ffffff',f:'#7fdcff',t:'#ffffff'}
  : {b:'#2fd6c3',d:'#1b9c8f',l:'#b5f7ea',h:'#fff2c2',f:'#ff8f3c',t:'#1b9c8f'}; }
function mBlorpSmall(c){ return [
  [-3,1,-2.5,6,5,5,c.b],[-2,6,-2,4,1,4,c.b],
  ...eye(-1.5,3.4,2.5,3,2.6,1.5,1.6,0.8,0.5),
  [-1.5,1.9,2.5,3,0.8,0.3,'#7a1f3d'],[0.4,2.2,2.8,0.8,0.5,0.15,WHITE],
  [-2.9,2.7,2.5,0.8,0.7,0.15,'#ff9bb0'],[2.1,2.7,2.5,0.8,0.7,0.15,'#ff9bb0'],
  [-2.6,6,-0.6,1,1.4,1.2,c.h],[1.6,6,-0.6,1,1.4,1.2,c.h],[-2.4,7.4,-0.4,0.6,0.6,0.8,c.h],[1.8,7.4,-0.4,0.6,0.6,0.8,c.h],
  [-0.5,1.6,-3.5,1,1,1,c.b],[-0.5,2.4,-4.3,1,1,1,c.t],
  [3,3,-1.2,0.15,1.2,1.2,c.d],[-3.15,3.8,0.2,0.15,1.2,1.2,c.d],[-1,7,-1.4,1.2,0.15,1.2,c.d]]; }
function mBlorpBig(c,form){ const b=[
  [-3.5,1.5,-3,7,9,6,c.b],[-2.5,10.5,-2.2,5,1.2,4.4,c.b],[-2.5,2,3,5,2.4,0.3,c.l],
  ...eye(-2,6.3,3,4,3.4,2,2.1,1.1,0.7),
  [-2,4.7,3,4,1,0.4,'#7a1f3d'],[-1.4,5.1,3.4,0.9,0.6,0.15,WHITE],[0.6,5.1,3.4,0.9,0.6,0.15,WHITE],
  [-3.4,5.4,3,0.9,0.8,0.15,'#ff9bb0'],[2.5,5.4,3,0.9,0.8,0.15,'#ff9bb0'],
  [-3.2,10.5,-0.7,1.3,2,1.4,c.h],[1.9,10.5,-0.7,1.3,2,1.4,c.h],[-3,12.5,-0.5,0.8,1,1,c.h],[2.2,12.5,-0.5,0.8,1,1,c.h],
  [-0.6,2,-4.2,1.2,1.2,1.2,c.b],[-0.6,3,-5.2,1.2,1.2,1.2,c.d],[-0.6,4,-6,1.2,1.2,1.2,c.t],
  [3.5,4,-1.5,0.15,1.6,1.6,c.d],[3.5,7.5,0.5,0.15,1.2,1.2,c.d],[-3.65,6,-0.5,0.15,1.6,1.6,c.d],[-1.5,11.7,-1.6,1.4,0.15,1.4,c.d]];
  if(form===2) b.push([-0.8,11.7,-0.8,1.6,1.5,1.6,'#ffd23e'],[-0.4,13.2,-0.4,0.8,1,0.8,'#fff3a0']);
  if(form===3) b.push([-1.6,11.7,-1.4,3.2,1.4,2.8,WHITE],[-0.8,13.1,-0.8,1.8,1,1.6,WHITE],[-2.4,11.7,-0.6,0.9,0.9,1.4,'#ffe3f4'],[1.5,11.7,-0.6,0.9,0.9,1.4,'#ffe3f4']);
  /* a crown of rays, like a child's drawing of the sun */
  if(form===4) b.push([-0.7,11.7,-0.9,1.4,2.6,1.4,'#fff3a0'],[-1.9,11.7,-0.7,1,1.6,1,'#ffe14d'],[0.9,11.7,-0.7,1,1.6,1,'#ffe14d'],[-0.7,11.7,-2.1,1.4,1.4,1,'#ffe14d'],[-0.7,11.7,0.7,1.4,1.2,1,'#ffe14d'],
    [-3.9,8,-1,0.5,1.4,1.4,'#fff3a0'],[3.4,8,-1,0.5,1.4,1.4,'#fff3a0'],[-3.9,3.4,-0.6,0.5,1.2,1.2,'#fff3a0'],[3.4,5,0.4,0.5,1.2,1.2,'#fff3a0']);
  return b; }
/* the fluff form's wings: hinged at the shoulder blade, flat along x so they can flap */
function mBlorpWing(sx){ const w=WHITE,l='#ffe3f4'; return sx>0 ? [[0,-1,-0.4,3.4,3,0.8,w],[3.4,-0.2,-0.4,1.8,2.4,0.8,w],[5.2,0.6,-0.4,1.2,1.6,0.8,l]] : [[-3.4,-1,-0.4,3.4,3,0.8,w],[-5.2,-0.2,-0.4,1.8,2.4,0.8,w],[-6.4,0.6,-0.4,1.2,1.6,0.8,l]]; }

function mBlob(){ const c='#9b5de5',d='#5a2ea6'; return [
  [-3.5,1,-3,7,4.5,6,c],[-2.5,5.5,-2.2,5,1,4.4,c],
  ...eye(-2.8,2.9,3,2.2,1.9,1,1,1.0,0.3),...eye(0.6,2.9,3,2.2,1.9,1,1,0.2,0.3),
  [-3,4.9,3,2.6,0.7,0.5,d],[0.4,4.9,3,2.6,0.7,0.5,d],[-1.2,4.4,3,0.9,0.6,0.5,d],[0.3,4.4,3,0.9,0.6,0.5,d],
  [-2,1.5,3,4,0.8,0.25,d],[-1.6,1.9,3.25,0.7,0.9,0.2,WHITE],[0.9,1.9,3.25,0.7,0.9,0.2,WHITE],
  [-3.2,0,-1.5,2.4,1,3.6,'#ffb347'],[0.8,0,-1.5,2.4,1,3.6,'#ffb347'],
  [-0.3,6.5,-0.3,0.6,1.3,0.6,d],[-0.7,7.8,-0.7,1.4,1.4,1.4,'#ff5d8f'],
  [3.5,2.5,-1.5,0.15,1.2,1.2,d],[-3.65,3.2,0.3,0.15,1.2,1.2,d]]; }
function mSlug(){ const c='#ffe066',d='#c99a00'; return [
  [-2,0,-3.2,4,2,7,c],[-1.6,2,1,3.2,2.6,2.6,c],
  [-1.4,4.6,2,0.8,1.6,0.8,c],[0.6,4.6,2,0.8,1.6,0.8,c],
  [-1.8,6.2,1.6,1.6,1.6,1.6,WHITE],[0.2,6.2,1.6,1.6,1.6,1.6,WHITE],
  [-1.4,6.6,3.2,0.8,0.9,0.15,INK],[0.6,6.6,3.2,0.8,0.9,0.15,INK],
  [-1,2.7,3.6,2,0.4,0.15,d],[-2,0,3.8,4,1,0.5,c]]; }
function mShell(){ const c='#ff6b9d',l='#ffc2d6',d='#c93d70'; return [
  [-2.6,0.6,-2.6,5.2,4,5.2,c],[-2,4.6,-2,4,0.9,4,c],[-2.6,0,-2.6,5.2,0.6,5.2,d],
  [2.6,1.2,-1.6,0.2,2.8,3.2,l],[2.8,2,-0.7,0.1,1.1,1.4,c],
  [-2.8,1.2,-1.6,0.2,2.8,3.2,l],[-2.9,2,-0.7,0.1,1.1,1.4,c],
  [-1.5,1.2,2.6,3,2.8,0.2,l],[-0.6,2,2.8,1.2,1.1,0.1,c],
  [-1,5.5,-1,2,0.3,2,l]]; }
function mSpikit(){ const c='#ff5a5f',d='#9c1c2b',s='#fff1d0'; const b=[
  [-3.5,0.8,-3,7,3.7,6,c],[-3,0,-2.5,6,0.8,5,'#ffb4a2'],
  ...eye(-2.6,1.9,3,1.9,1.6,0.9,0.9,0.9,0.2),...eye(0.7,1.9,3,1.9,1.6,0.9,0.9,0.1,0.2),
  [-2.9,3.5,3,5.8,0.6,0.5,d],[-1,1,3,2,0.5,0.2,d]];
  for(const x of [-3,-0.7,1.6]) for(const z of [-2.4,0.6]) b.push([x,4.5,z,1.4,1,1.4,s],[x+0.35,5.5,z+0.35,0.7,1,0.7,WHITE]);
  return b; }
function mBatty(){ const c='#4d96ff',d='#2b59c3'; return [
  [-2.5,0.6,-2,5,4.6,4,c],[-2.5,5.2,-0.6,1.3,1.5,1.2,c],[1.2,5.2,-0.6,1.3,1.5,1.2,c],[-2.2,5.5,0.6,0.7,0.8,0.1,'#ff9bb0'],[1.5,5.5,0.6,0.7,0.8,0.1,'#ff9bb0'],
  ...eye(-1.6,2.3,2,3.2,2.6,1.4,1.5,0.9,0.5),[-0.4,1.2,2,0.8,1,0.3,WHITE],[-1.5,1.9,2,3,0.4,0.2,d],
  [-1.6,0,-0.5,1,0.6,1.2,'#ffb347'],[0.6,0,-0.5,1,0.6,1.2,'#ffb347']]; }
function mWing(sx){ const d='#2b59c3',l='#7db4ff'; return sx>0 ? [[0,-0.5,-1.5,3.6,1,3,d],[3.6,-0.3,-1,1.6,0.6,2,d],[0.6,0.5,-1,2.4,0.12,2,l]] : [[-3.6,-0.5,-1.5,3.6,1,3,d],[-5.2,-0.3,-1,1.6,0.6,2,d],[-3,0.5,-1,2.4,0.12,2,l]]; }
function mBoing(){ const c='#7bd85f',d='#3f9a2e'; return [
  [-3.5,0.8,-2.5,7,3.7,5,c],[-2.6,0.8,2.5,5.2,2,0.25,'#e9ffc2'],
  [-3.3,4.5,0,2.6,2.2,2.4,c],[0.7,4.5,0,2.6,2.2,2.4,c],
  ...eye(-3.05,4.8,2.4,2.1,1.6,0.9,1,0.9,0.3),...eye(0.95,4.8,2.4,2.1,1.6,0.9,1,0.3,0.3),
  [-2.5,3.1,2.5,5,0.45,0.35,d],[0.4,2.4,2.75,1.2,0.75,0.2,'#ff7aa8'],
  [-4.4,0,-1.5,1.6,1.6,3.4,d],[2.8,0,-1.5,1.6,1.6,3.4,d],
  [-1,4.5,-1.5,1.2,0.15,1.2,d],[1.2,4.5,-2,0.9,0.15,0.9,d]]; }
function mChomper(){ const c='#ff4f7b',d='#5a0f2a',st='#3ec97c'; const b=[
  [-1,0,-1,2,8,2,st],[-1.15,2,-1.15,2.3,0.8,2.3,'#2a9c5c'],[-1.15,5,-1.15,2.3,0.8,2.3,'#2a9c5c'],
  [-3,7,-3,6,5,6,c],[-3.15,9.1,-3.15,6.3,0.9,6.3,d],
  [-2,7.5,3,1.2,1.2,0.15,WHITE],[0.8,8,3,0.9,0.9,0.15,WHITE],[3,7.6,-1,0.15,1.2,1.2,WHITE],[-3.15,10.5,0.5,0.15,1,1,WHITE],[-1,12,-1,1.4,0.15,1.4,WHITE],
  ...eye(-2.4,10.4,3,1.7,1.4,0.8,0.8,0.8,0.2),...eye(0.5,10.4,3,1.7,1.4,0.8,0.8,0.1,0.2)];
  for(const x of [-2.6,-1.1,0.4,1.9]) b.push([x,9.1,3.15,0.8,0.9,0.2,WHITE]);
  return b; }
function mBoss(){ const c='#7d3fd1',d='#3f1a80',g='#ffc928'; return [
  [-4,1,-3.5,8,6,7,c],[-3,7,-2.6,6,1.2,5.2,c],[-3,1.2,3.5,6,0.9,0.3,'#c9a6ff'],
  ...eye(-3.2,4.6,3.5,2.3,2,1.1,1.1,1.0,0.3),...eye(0.9,4.6,3.5,2.3,2,1.1,1.1,0.2,0.3),...eye(-0.9,6.5,3.5,1.8,1.5,0.8,0.8,0.5,0.3),
  [-3.4,6.7,3.5,2.4,0.7,0.7,d],[1.0,6.7,3.5,2.4,0.7,0.7,d],
  [-2.6,2.3,3.5,5.2,1.1,0.35,d],[-2.2,2.9,3.85,0.9,1.2,0.25,WHITE],[1.3,2.9,3.85,0.9,1.2,0.25,WHITE],[-0.5,2.3,3.85,1,0.7,0.2,WHITE],
  [-5.2,5,-0.8,1.2,1.4,1.6,'#fff2c2'],[-6,6,-0.6,0.9,1.8,1.2,'#fff2c2'],[4,5,-0.8,1.2,1.4,1.6,'#fff2c2'],[5.1,6,-0.6,0.9,1.8,1.2,'#fff2c2'],
  [-2.6,8.2,-2,5.2,1,4,g],[-2.6,9.2,-2,1,1.2,1,g],[-0.5,9.2,-2,1,1.2,1,g],[1.6,9.2,-2,1,1.2,1,g],[-2.6,9.2,1,1,1.2,1,g],[-0.5,9.2,1,1,1.7,1,g],[1.6,9.2,1,1,1.2,1,g],[-0.4,8.5,2,0.8,0.5,0.15,'#ff4f7b'],
  [-3.8,0,-2,3,1.2,4.5,'#ffb347'],[0.8,0,-2,3,1.2,4.5,'#ffb347'],
  [-5,2.5,-0.6,1,2.5,1.4,d],[4,2.5,-0.6,1,2.5,1.4,d]]; }
function mIcicle(){ const c='#bfeaff',d='#7cc4ee'; return [
  [-2.5,5.5,-2.5,5,2.5,5,c],[-1.8,3,-1.8,3.6,2.5,3.6,c],[-1.1,1,-1.1,2.2,2,2.2,'#e3f6ff'],[-0.5,0,-0.5,1,1,1,WHITE],
  [-2.5,7.4,2.5,5,0.6,0.15,WHITE],[-1.6,5.9,2.5,0.8,1,0.15,INK],[0.8,5.9,2.5,0.8,1,0.15,INK],[2.5,6,-1,0.15,1.2,1.2,d],[-2.65,6.4,0,0.15,1,1,d]]; }
function mPrickle(){ const c='#3fbf6a',d='#1f8a48',s='#fff1d0'; const b=[
  [-2.2,0,-2,4.4,9,4,c],[-1.6,9,-1.5,3.2,1,3,c],
  [-4.2,3,-1,2,1.4,2,c],[-4.2,4.4,-1,1.4,2.6,2,c],[2.2,4.5,-1,2,1.4,2,c],[2.8,5.9,-1,1.4,2.2,2,c],
  ...eye(-1.9,5.6,2,1.7,1.5,0.8,0.8,0.8,0.2),...eye(0.2,5.6,2,1.7,1.5,0.8,0.8,0.1,0.2),
  [-2,7.2,2,1.8,0.5,0.4,d],[0.2,7.2,2,1.8,0.5,0.4,d],[-0.9,3.2,2,1.8,1.6,0.3,'#5a0f2a'],
  [-0.9,10,-0.9,1.8,0.8,1.8,'#ff8fc7'],[-0.4,10.8,-0.4,0.8,0.5,0.8,'#ffe14d']];
  for(const q of [[-2.45,1.5],[-2.45,7.8],[2.2,2.2],[2.2,8]]) b.push([q[0],q[1],-0.3,0.25,0.6,0.6,s]);
  for(const y of [1,8.4]) b.push([-0.3,y,2,0.6,0.5,0.3,s]);
  return b; }
function mSeed(){ return [[-2,-2,-2,4,4,4,'#8a5a2b'],[-1.4,2,-1.4,2.8,0.7,2.8,'#b98a4a'],[-1.2,0,2,0.8,0.9,0.15,WHITE],[0.4,0,2,0.8,0.9,0.15,WHITE]]; }
function mBomb(){ const c='#3a2a55',s='#fff1d0'; return [[-2,-2,-2,4,4,4,c],[-0.6,2,-0.6,1.2,1.2,1.2,s],[-0.6,-3.2,-0.6,1.2,1.2,1.2,s],[2,-0.6,-0.6,1.2,1.2,1.2,s],[-3.2,-0.6,-0.6,1.2,1.2,1.2,s],[-0.6,-0.6,2,1.2,1.2,1.2,s],
  [-1.3,0,2,0.9,0.9,0.15,'#ff4f7b'],[0.4,0,2,0.9,0.9,0.15,'#ff4f7b']]; }

function mMuffin(){ const cup='#d99a5b',cd='#b97a3f',f='#ff8fc7'; return [
  [-2.5,0,-2.5,5,3,5,cup],[-1.9,0,2.5,0.6,3,0.15,cd],[-0.3,0,2.5,0.6,3,0.15,cd],[1.3,0,2.5,0.6,3,0.15,cd],
  [-3.2,3,-3.2,6.4,1.6,6.4,f],[-2.4,4.6,-2.4,4.8,1.2,4.8,f],[-1.2,5.8,-1.2,2.4,0.8,2.4,'#ffb3da'],[-0.6,6.6,-0.6,1.2,1.2,1.2,'#e63946'],
  [-2,3.6,3.2,0.8,0.4,0.12,'#ffe14d'],[0.9,4.0,3.2,0.8,0.4,0.12,'#2fd6c3'],[-0.6,3.3,3.2,0.4,0.8,0.12,WHITE],[2,3.4,3.2,0.4,0.7,0.12,'#7b4fe0'],
  [-1.7,1.2,2.65,0.9,1.1,0.2,INK],[0.8,1.2,2.65,0.9,1.1,0.2,INK],[-0.5,0.6,2.65,1,0.4,0.2,INK]]; }
function mChili(){ const r='#ff3b30',g='#2fa84f'; return [
  [-0.6,0,-0.6,1.2,0.7,1.2,r],[-1.1,0.7,-1,2.2,1.8,2,r],[-1.5,2.5,-1.3,3,2.5,2.6,r],[-1.2,5,-1.1,2.4,1.1,2.2,r],
  [-0.5,6.1,-0.5,1,1.2,1,g],[-0.5,7,-0.5,1.8,0.6,1,g],[-1.4,6,-1.2,2.8,0.4,2.4,g],
  [0.7,2.8,1.3,0.5,0.8,0.12,'#ffb0a8'],[-1.1,3.5,1.3,0.7,0.8,0.15,INK],[0.2,3.5,1.3,0.7,0.8,0.15,INK],[-1.3,4.4,1.3,1,0.3,0.25,INK],[0.2,4.4,1.3,1,0.3,0.25,INK]]; }
function mStar(){ const y='#ffd23e',l='#fff3a0'; return [
  [-1.6,2,-0.8,3.2,3,1.6,y],[-0.8,5,-0.8,1.6,1.9,1.6,y],[-0.4,6.9,-0.5,0.8,0.7,1,l],
  [-3.5,3.3,-0.8,1.9,1.4,1.6,y],[1.6,3.3,-0.8,1.9,1.4,1.6,y],[-2.6,0.2,-0.8,1.5,1.9,1.6,y],[1.1,0.2,-0.8,1.5,1.9,1.6,y],
  [-0.9,3.1,0.8,0.6,1.2,0.15,INK],[0.3,3.1,0.8,0.6,1.2,0.15,INK],[-0.9,3.1,-0.95,0.6,1.2,0.15,INK],[0.3,3.1,-0.95,0.6,1.2,0.15,INK]]; }
function mHeart(){ const c='#ff4f7b',l='#ffb0c4'; const rows=[' ## ## ','#######','#######',' ##### ','  ###  ','   #   ']; const b=[];
  rows.forEach((r,j)=>{ let i=0; while(i<7){ if(r[i]==='#'){ let k=i; while(k<7&&r[k]==='#') k++; b.push([i-3.5,(5-j)+0.4,-1,k-i,1,2,c]); i=k; } else i++; } });
  b.push([-2.5,5.2,1,1,0.8,0.12,l],[-1.3,3,1,0.6,1,0.15,INK],[0.7,3,1,0.6,1,0.15,INK]); return b; }
function mCoin(){ return [[-2,-3,-0.5,4,6,1,'#ffc928'],[-3,-2,-0.5,6,4,1,'#ffc928'],[-1,-2,-0.68,2,4,1.36,'#fff0a8']]; }
function mSpring(){ return [[-1.5,0,-1.5,3,2.2,3,'#fff2d6'],[-0.9,0.8,1.5,0.6,0.7,0.12,INK],[0.3,0.8,1.5,0.6,0.7,0.12,INK],
  [-4,2.2,-3,8,1.6,6,'#ff4f7b'],[-3,3.8,-2.2,6,0.9,4.4,'#ff4f7b'],[-2.6,2.9,3,1.4,0.7,0.12,WHITE],[1,2.6,3,1.6,0.9,0.12,WHITE],
  [-1,4.7,-0.8,1.6,0.12,1.4,WHITE],[1.4,4.7,0.6,1,0.12,1,WHITE],[-2.6,4.7,0,1,0.12,1,WHITE]]; }
function mSpikeTile(){ const b=[]; for(const ox of [0.5,4.5]) for(const oz of [-3.5,0.5]) b.push([ox,0,oz,3,1.6,3,'#aeb7c9'],[ox+0.5,1.6,oz+0.5,2,1.6,2,'#d5dcea'],[ox+1,3.2,oz+1,1,1.6,1,WHITE]); return b; }
function mHut(){ const c='#8b5cf6',d='#5b35c0',r='#ff4f7b'; return [
  [0,0,-7,24,20,14,c],[-2,20,-9,28,3,18,r],[1,23,-7.5,22,3,15,r],[4,26,-6,16,3,12,r],[8,29,-4,8,3,8,r],
  [8,0,7,8,11,0.5,INK],[9,9.5,7.5,2,1.5,0.3,WHITE],[13,9.5,7.5,2,1.5,0.3,WHITE],
  ...eye(2.5,12,7,5.5,5,2.5,3,2.2,1),...eye(16,12,7,5.5,5,2.5,3,0.8,1),
  [-2,23,-2,3,5,3,'#fff2c2'],[23,23,-2,3,5,3,'#fff2c2'],[0,0,7,8,1.5,0.4,d],[16,0,7,8,1.5,0.4,d]]; }

/* small props scattered on the walkway */
const CANDY=['#ff8fc7','#ffb347','#5fe0d0','#b58cff','#ffe14d'];
function dFlower(c){ return [[-0.5,0,-0.5,1,3,1,'#3fae49'],[-1.5,3,-0.5,3,3,1,c],[-0.5,4,0.5,1,1,0.3,'#fff3a0'],[0.5,1,-0.5,1.2,0.8,1,'#3fae49']]; }
function dTuft(c){ return [[-1.5,0,0,1,2,1,shade(c,0.85)],[-0.3,0,0,1,3,1,c],[0.9,0,0,1,2,1,shade(c,0.85)]]; }
function dGumdrop(c){ return [[-2,0,-2,4,2,4,c],[-1.5,2,-1.5,3,1.2,3,c],[-0.8,3.2,-0.8,1.6,0.6,1.6,shade(c,1.25)],[-1.4,1,2,0.7,0.9,0.12,INK],[0.6,1,2,0.7,0.9,0.12,INK]]; }
function dTree(c){ const l=shade(c,1.18); return [[-1.5,0,-1.5,3,12,3,'#a5642f'],[-8,10,-6,16,5,12,c],[-10,15,-7,20,6,14,c],[-8,21,-6,16,5,12,c],[-5,26,-4,10,3,8,c],[-7,21,6,4,3,0.4,l],[-8,15.5,7,3,2,0.4,l],[3,24,4,3,2,0.4,l]]; }
function dRock(c){ return [[-2,0,-1.5,4,2,3,c],[-1,2,-1,2.5,1,2,shade(c,1.15)]]; }
function dShroom(c){ return [[-0.6,0,-0.6,1.2,2,1.2,'#e9e0ff'],[-2,2,-2,4,1.2,4,c],[-1.2,3.2,-1.2,2.4,0.8,2.4,c]]; }
function dCrystal(c){ return [[-1,0,-1,2,5,2,c],[-0.5,5,-0.5,1,1.5,1,shade(c,1.3)],[1,0,-0.5,1.4,2.6,1.4,c],[-2.2,0,0,1.2,1.8,1.2,c]]; }
function dCandle(){ return [[-0.6,0,-0.6,1.2,2.4,1.2,'#f4ead0']]; }
function dBones(){ return [[-2,0,-0.4,4,0.7,0.8,'#efe9dc'],[-2.4,0,-0.7,0.8,1,1.4,'#efe9dc'],[1.6,0,-0.7,0.8,1,1.4,'#efe9dc']]; }
function dPine(){ const g='#2f9c78',l='#f4fbff'; return [[-1.2,0,-1.2,2.4,5,2.4,'#8a5a3c'],[-7,4,-5,14,4,10,g],[-7,8,-5,14,1,10,l],[-5.5,9,-4,11,4,8,g],[-5.5,13,-4,11,1,8,l],[-4,14,-3,8,4,6,g],[-4,18,-3,8,1,6,l],[-2,19,-2,4,3,4,g],[-2,22,-2,4,1,4,l]]; }
function dSnowman(){ return [[-2.5,0,-2.5,5,4,5,WHITE],[-1.8,4,-1.8,3.6,3,3.6,WHITE],[-1.2,5.2,1.8,0.7,0.8,0.15,INK],[0.5,5.2,1.8,0.7,0.8,0.15,INK],[-0.4,4.4,1.8,0.8,0.6,1,'#ff8f3c'],
  [-0.4,1,2.5,0.8,0.8,0.15,INK],[-0.4,2.5,2.5,0.8,0.8,0.15,INK],[-2.4,6.6,-2.4,4.8,0.5,4.8,'#ff4f7b'],[-1.4,7.1,-1.4,2.8,1.6,2.8,'#ff4f7b']]; }
function dCactus(c){ return [[-1.5,0,-1.5,3,13,3,c],[-5,5,-1,3.5,1.6,2,c],[-5,6.6,-1,1.8,4,2,c],[1.5,7,-1,3.5,1.6,2,c],[3.2,8.6,-1,1.8,3.5,2,c],[-1,13,-1,2,0.9,2,'#ff8fc7']]; }
function dLamp(){ return [[-0.5,0,-0.5,1,9,1,'#6f7fb8'],[-1.5,0,-1.5,3,0.8,3,'#434f85'],[-1.8,9,-1.8,3.6,0.6,3.6,'#434f85']]; }
function dCrate(c){ return [[-2.5,0,-2.5,5,5,5,c],[-2.5,2,2.5,5,1,0.15,shade(c,0.7)],[-0.5,0,2.5,1,5,0.15,shade(c,0.7)],[-2.5,5,-2.5,5,0.3,5,shade(c,1.25)]]; }
function dDish(){ return [[-0.5,0,-0.5,1,5,1,'#8fa0e6'],[-3,5,-1,6,1,2,'#aab8ea'],[-4,6,-1,1,2,2,'#aab8ea'],[3,6,-1,1,2,2,'#aab8ea'],[-0.4,6,-0.4,0.8,2.5,0.8,'#ff4f7b']]; }

/* ================= the world map: markers and landmarks (units: 1/8 cell, origin at the middle of the cell's top) ================= */
function mMapTile(){ return [[-2.1,0,-2.1,4.2,0.3,4.2,'#8a5a2b'],[-1.6,0.3,-1.6,3.2,0.26,3.2,'#fff2c2']]; }
function mMapPad(c,l,d){ return [[-3,0,-2,6,0.5,4,c],[-2,0,-3,4,0.5,6,c],[-2.2,0.5,-1.4,4.4,0.25,2.8,l],[-1.4,0.5,-2.2,2.8,0.25,4.4,l],[-3,0,2,6,0.5,0.15,d],[-2,0,3,4,0.5,0.15,d]]; }
function mMapLock(){ const b=mMapPad('#8a879c','#a9a6b8','#625f73'); b.push([-0.9,0.75,-0.6,1.8,1.4,1.2,'#625f73'],[-0.6,2.15,-0.3,0.3,0.9,0.6,'#625f73'],[0.3,2.15,-0.3,0.3,0.9,0.6,'#625f73'],[-0.6,3.05,-0.3,1.2,0.3,0.6,'#625f73']); return b; }
function mMapOpen(){ const b=mMapPad('#ff4f7b','#ffe14d','#c22a55'); b.push([-0.8,0.75,-0.8,1.6,0.3,1.6,WHITE]); return b; }
function mMapClear(){ const b=mMapPad('#ffc928','#fff0a8','#c98a00');
  b.push([2,0.5,-2.9,0.6,7,0.6,'#fff2c2'],[1.8,7.5,-3.1,1,1,1,'#ffc928'],[-1.6,4.6,-2.8,3.6,2.6,0.4,'#2fd6c3'],[-0.7,5.3,-2.4,1.4,1.2,0.15,WHITE],[-0.3,5.6,-2.25,0.6,0.6,0.1,INK]); return b; }
/* King Grump's castle and his tower stand behind their markers, so Blorp is never hidden by them */
function mMapCastle(){ const c='#c8524f',d='#7d2a28',l='#ea8a80',r='#5a4a8f', b=[
  [-5,-2,-11,10,10,6,c],[-5,8,-11,10,0.6,6,l],[-5,8.6,-11,2,1.6,6,c],[-1,8.6,-11,2,1.6,6,c],[3,8.6,-11,2,1.6,6,c],
  [-8.5,-2,-12,4,15,5,d],[4.5,-2,-12,4,15,5,d],[-9,13,-12.5,5,1,6,r],[4,13,-12.5,5,1,6,r],[-8.2,14,-11.7,3.4,1.6,4.4,r],[4.8,14,-11.7,3.4,1.6,4.4,r],[-7.4,15.6,-10.9,1.8,1.6,2.8,r],[5.6,15.6,-10.9,1.8,1.6,2.8,r],
  [-1.6,0,-5,3.2,4.6,0.3,INK],[-2,4.6,-5,4,0.5,0.4,d],[-7.4,6,-7,1.6,2.2,0.2,INK],[5.8,6,-7,1.6,2.2,0.2,INK],
  [-0.3,10.2,-8.5,0.6,6.5,0.6,'#fff2c2'],[0.3,13.6,-8.4,3.6,2.8,0.4,'#7d3fd1'],[1.2,14.4,-8,1.8,1.2,0.15,'#ffc928']];
  return b; }
function mMapCastleGlow(){ return [[-3.9,5.4,-5,1.6,1.6,0.2,'#ffd23e'],[2.3,5.4,-5,1.6,1.6,0.2,'#ffd23e'],[-7,6.4,-6.95,0.8,1.2,0.2,'#ff7a1f'],[6.2,6.4,-6.95,0.8,1.2,0.2,'#ff7a1f']]; }
function mMapTower(){ const c='#434f85',d='#2c3566',l='#8fa0e6', b=[
  [-3.5,-2,-11,7,18,6,c],[-4.5,16,-12,9,1.6,8,l],[-4.5,17.6,-12,1.6,1.4,8,l],[2.9,17.6,-12,1.6,1.4,8,l],[-2.5,17.6,-10,5,5,4,d],
  [-3.2,22.6,-10.7,6.4,1.4,5.4,'#b04fd6'],[-2.2,24,-9.7,4.4,1.3,3.4,'#b04fd6'],[-1.2,25.3,-8.7,2.4,1.1,1.4,'#dd9cff'],[-0.35,26.4,-8.35,0.7,5,0.7,'#aab8ea'],
  [-1.4,0,-5,2.8,4,0.3,INK],[-3.5,6.5,-5.2,7,0.5,0.4,d],[-3.5,12,-5.2,7,0.5,0.4,d]];
  return b; }
function mMapTowerGlow(){ return [[-2.4,8,-5,1.3,2.2,0.2,'#ffe680'],[1.1,8,-5,1.3,2.2,0.2,'#ffe680'],[-0.65,13.2,-5,1.3,2,0.2,'#7df9ff'],[-1.3,19,-6,2.6,2.4,0.2,'#ff9be0'],[-1,31,-9,2,2,2,'#3ff0ff'],[-2.6,0.2,-4.9,0.5,3,0.2,'#3ff0ff'],[2.1,0.2,-4.9,0.5,3,0.2,'#3ff0ff']]; }

/* ================= new for the sequel: monsters ================= */
function mSnippy(){ const c='#ff7a4d',d='#c9432a',l='#ffc2a8'; return [
  [-3.5,1.2,-2.5,7,3,5,c],[-2.8,4.2,-2,5.6,0.8,4,c],[-3,1.2,2.5,6,1,0.25,l],
  [-2,5,1,0.8,1.6,0.8,c],[1.2,5,1,0.8,1.6,0.8,c],[-2.4,6.4,0.6,1.6,1.5,1.6,WHITE],[0.8,6.4,0.6,1.6,1.5,1.6,WHITE],[-2,6.7,2.2,0.8,0.9,0.15,INK],[1.2,6.7,2.2,0.8,0.9,0.15,INK],
  [-1.5,2.4,2.5,3,0.5,0.3,d],
  [-4.5,0,-1.8,1,1.4,1,d],[3.5,0,-1.8,1,1.4,1,d],[-4.5,0,0.8,1,1.4,1,d],[3.5,0,0.8,1,1.4,1,d]]; }
function mClaw(sx){ const c='#ff7a4d',d='#c9432a', x=sx>0?0:-2.6; return [[x,0,-1,2.6,2.4,2,c],[x+(sx>0?1.4:-0.4),2.4,-1,1.6,1.5,2,c],[x+(sx>0?0:1.4),2.4,-0.6,1.2,1,1.2,d]]; }
function mJelly(){ const c='#ff8fe0',l='#ffd0f4',d='#c95ab0'; const b=[[-3,3,-3,6,3,6,c],[-2.2,6,-2.2,4.4,1.2,4.4,c],[-1.2,7.2,-1.2,2.4,0.6,2.4,l],[-3.3,2.4,-3.3,6.6,0.8,6.6,d],
  [-1.8,4,3,1,1.2,0.15,INK],[0.8,4,3,1,1.2,0.15,INK],[-0.6,3.5,3,1.2,0.3,0.15,INK],[-2.2,6.2,3,1,0.6,0.1,WHITE]];
  for(const q of [[-2.4,-1.6],[0,-2.2],[1.8,-1.4],[-1,1.6],[1.4,1.8],[-2.6,0.6]]) b.push([q[0],0,q[1],0.8,2.6,0.8,l]);
  return b; }
function mPuffer(){ const c='#ffd23e',d='#e09a12',s='#fff1d0'; const b=[[-3,0.5,-3,6,6,6,c],[-2.2,0,-2.2,4.4,7,4.4,c],[-3.5,1.5,-2,7,4,4,c],[-2.4,1,3,4.8,2,0.2,'#fff3c2'],
  ...eye(-2.6,3.6,3,2,2,1,1,0.8,0.4),...eye(0.6,3.6,3,2,2,1,1,0.2,0.4),[-0.8,2.2,3,1.6,0.9,0.4,'#ff8f3c'],
  [-0.5,3,-4.6,1,2.4,1.6,d],[-4.6,2.6,-0.8,1.1,1.2,1.6,d],[3.5,2.6,-0.8,1.1,1.2,1.6,d]];
  for(const q of [[-1.9,7],[1.1,7],[-0.4,7.4],[-3.6,5.4],[2.8,5.4],[-3.6,0.4],[2.8,0.4]]) b.push([q[0],q[1],-0.4,0.8,1,0.8,s]);
  return b; }
function mSnapper(c,d){ c=c||'#ff5a7a'; d=d||'#b02a4d'; return [[-1.6,0.6,-3,3.2,4,6,c],[-1.2,1,3,2.4,3.2,1,c],[-1.2,0,-2,2.4,0.6,4,'#ffe0e6'],[-0.4,4.6,-2,0.8,1.4,3,d],[-0.5,1.4,-4.6,1,2.6,1.6,d],[-0.5,0.4,-5.4,1,1.4,1,d],[-0.5,3.6,-5.4,1,1.4,1,d],
  [1.6,2.6,1.2,0.15,1.3,1.3,WHITE],[1.7,2.9,1.6,0.12,0.7,0.7,INK],[-1.75,2.6,1.2,0.15,1.3,1.3,WHITE],[-1.82,2.9,1.6,0.12,0.7,0.7,INK],[-1,0.8,4,2,0.5,0.15,WHITE]]; }
function mEmber(){ return [[-2.5,0,-2.5,5,5,5,'#ff7a1f'],[-1.8,5,-1.8,3.6,1.2,3.6,'#ffb02e'],[-0.8,6.2,-0.8,1.6,1.2,1.6,'#ffe14d'],[-1.6,2.4,2.5,1,1.4,0.15,INK],[0.6,2.4,2.5,1,1.4,0.15,INK],[-1,1.2,2.5,2,0.5,0.15,INK]]; }
function mGhost(){ const c='#eef1ff',d='#b9c0ee'; return [[-3,1.5,-2.5,6,6,5,c],[-2.2,7.5,-1.8,4.4,1,3.6,c],[-3,0,-2.5,1.4,1.5,5,c],[-0.7,0.4,-2.5,1.4,1.1,5,c],[1.6,0,-2.5,1.4,1.5,5,c],
  [-2,4.6,2.5,1.4,1.8,0.15,INK],[0.6,4.6,2.5,1.4,1.8,0.15,INK],[-1.7,5.6,2.65,0.5,0.5,0.1,WHITE],[0.9,5.6,2.65,0.5,0.5,0.1,WHITE],[-1,2.6,2.5,2,1.2,0.15,'#7a1f3d'],[-0.4,2.6,2.65,0.8,0.5,0.1,'#ff8fb0'],
  [-2.9,3.6,2.5,0.8,0.6,0.1,'#ffc2d6'],[2.1,3.6,2.5,0.8,0.6,0.1,'#ffc2d6'],[3,3.4,-0.8,0.15,1.4,1.4,d],[-3.15,4.2,0.2,0.15,1.2,1.2,d]]; }
function mGhostHands(){ return [[-4.6,3,0.5,1.6,1.6,1.6,'#eef1ff'],[3,3,0.5,1.6,1.6,1.6,'#eef1ff']]; }
function mGhostShy(){ return [[-2.9,4.2,2.7,2.7,2.5,1,'#eef1ff'],[0.2,4.2,2.7,2.7,2.5,1,'#eef1ff'],[-2.9,4.2,3.7,2.7,0.5,0.1,'#b9c0ee'],[0.2,4.2,3.7,2.7,0.5,0.1,'#b9c0ee']]; }
function mClonk(){ const c='#8a8aa3',l='#babad0',d='#5a5a73'; const b=[[-8,0,-5,16,16,10,c],[-8,15,-5,16,1,10.1,l],[-8,0,5,16,1,0.2,d],[-8,0,5,1,16,0.2,l],[7,0,5,1,16,0.2,d],
  [-5.5,8.5,5,3.6,3,0.3,WHITE],[1.9,8.5,5,3.6,3,0.3,WHITE],[-4.4,9,5.3,1.6,1.6,0.15,INK],[2.8,9,5.3,1.6,1.6,0.15,INK],[-6,11.6,5,4.4,1,0.5,d],[1.6,11.6,5,4.4,1,0.5,d],[-2.2,11,5,1,0.8,0.5,d],[1.2,11,5,1,0.8,0.5,d],
  [-4.5,3,5,9,2.4,0.3,INK],[-3.6,4.2,5.3,1.4,1.2,0.15,WHITE],[-0.7,4.2,5.3,1.4,1.2,0.15,WHITE],[2.2,4.2,5.3,1.4,1.2,0.15,WHITE]];
  for(let x=-7;x<7;x+=3.6) b.push([x,-1.6,-3,2.2,1.6,6,'#d5dcea']); return b; }
function mRocket(){ const c='#3a2a55',r='#ff4f7b'; return [[-2.4,0.6,-3.5,4.8,4.8,6,c],[-1.8,1.2,2.5,3.6,3.6,1.4,c],[-1,2,3.9,2,2,0.8,r],[-2.6,0.4,-3.9,5.2,5.2,0.8,r],
  [2.4,2.6,0.2,0.15,1.6,1.6,WHITE],[2.5,3,0.8,0.12,0.8,0.8,INK],[-2.55,2.6,0.2,0.15,1.6,1.6,WHITE],[-2.62,3,0.8,0.12,0.8,0.8,INK],[2.4,4.4,-0.2,0.2,0.5,2.4,r],[-2.6,4.4,-0.2,0.2,0.5,2.4,r]]; }
function mCannon(){ const c='#4a3f6b',l='#6f63a0',d='#2c2447'; return [[-4,0,-4,8,8,8,c],[-4.6,1,-3.4,0.6,6,6.8,d],[4,1,-3.4,0.6,6,6.8,d],[-3,8,-3,6,0.5,6,l],[-2.5,1.5,4,5,5,0.2,d],[-1.5,2.5,4.2,3,3,0.15,INK],[-1,4.5,4.35,0.8,0.8,0.1,WHITE]]; }
function mFizzle(){ const c='#3a2a55',l='#5a4a7f'; return [[-2.8,1,-2.8,5.6,5.6,5.6,c],[-2.2,0.6,-2.2,4.4,6.4,4.4,c],[-2.2,5.4,2.8,1.4,0.8,0.12,l],
  ...eye(-2.3,2.8,2.8,1.9,1.9,0.9,1,0.8,0.3),...eye(0.4,2.8,2.8,1.9,1.9,0.9,1,0.2,0.3),[-1,1.6,2.8,2,0.5,0.15,'#ff4f7b'],
  [-0.6,7,-0.6,1.2,0.8,1.2,'#aeb7c9'],[-0.3,7.8,-0.3,0.6,1.2,0.6,'#e8c58a'],[-2.6,0,-1.2,1.8,1,2.8,'#ffb347'],[0.8,0,-1.2,1.8,1,2.8,'#ffb347']]; }
function mZappy(){ const c='#6a6f9c',l='#8e93c0',d='#4a4f7c'; return [[-4,1,-2.5,8,3.4,5,c],[-2.8,4.4,-2,5.6,1.6,4,c],[-1.4,6,-1.4,3,1,2.8,l],[-5,1.6,-1.6,1.2,2,3.2,c],[3.8,1.6,-1.6,1.2,2,3.2,c],[-3.4,0.4,-2,6.8,0.7,4,d],
  ...eye(-2.6,2.2,2.5,2,1.8,1,1,0.8,0.2),...eye(0.6,2.2,2.5,2,1.8,1,1,0.2,0.2),[-2.9,4,2.5,2.4,0.6,0.5,d],[0.5,4,2.5,2.4,0.6,0.5,d],[-0.9,1.3,2.5,1.8,0.5,0.2,INK]]; }
function mBolt(){ return [[-0.6,6,-0.4,1.6,3,0.8,'#fff3a0'],[-1.2,3.4,-0.4,1.6,3,0.8,'#ffe14d'],[-0.4,0,-0.4,1.4,3.6,0.8,'#fff3a0']]; }
function mRammy(){ const c='#b5651d',d='#7a3f0f',l='#e8a85a',h='#fff2c2'; return [[-3.5,1.2,-4,7,5.4,8,c],[-3,6.6,-3,6,0.8,6,c],[-2.6,1.6,4,5.2,4,1.2,l],
  ...eye(-2.4,4.2,5.2,1.8,1.5,0.9,0.9,0.8,0.2),...eye(0.6,4.2,5.2,1.8,1.5,0.9,0.9,0.1,0.2),[-2.6,5.6,5.2,2.2,0.6,0.5,d],[0.4,5.6,5.2,2.2,0.6,0.5,d],
  [-1,2,5.2,2,1.2,0.6,'#3a1f0a'],[-0.7,2.4,5.8,0.5,0.5,0.15,INK],[0.2,2.4,5.8,0.5,0.5,0.15,INK],
  [-4.6,5.4,2.4,1.4,1.4,1.6,h],[-5.4,6.4,3,1,1.6,1.2,h],[3.2,5.4,2.4,1.4,1.4,1.6,h],[4.4,6.4,3,1,1.6,1.2,h],
  [-3.2,0,-3,2,1.2,2,d],[1.2,0,-3,2,1.2,2,d],[-3.2,0,1.6,2,1.2,2,d],[1.2,0,1.6,2,1.2,2,d],[-0.5,3,-5,1,1,1.2,d]]; }

/* ================= new for the sequel: pickups and things in the level ================= */
function mFluff(){ const c='#ff9fd6',l='#ffd0ec',w=WHITE; return [[-0.4,0,-0.4,0.8,3,0.8,'#fff2c2'],[-2.6,2.6,-2.2,5.2,3.4,4.4,c],[-1.8,6,-1.6,3.6,1.2,3.2,c],[-3.2,3.4,-1.4,0.8,1.8,2.8,l],[2.4,3.4,-1.4,0.8,1.8,2.8,l],[-1,7.2,-0.8,2,0.6,1.6,l],
  [-1.5,4,2.2,0.8,1,0.15,INK],[0.7,4,2.2,0.8,1,0.15,INK],[-0.5,3.4,2.2,1,0.3,0.15,INK],[-2.2,5.4,2.2,1.2,0.5,0.1,w],[-4.4,4.2,-0.6,1.4,1.6,1.2,w],[3,4.2,-0.6,1.4,1.6,1.2,w]]; }
/* a sun spark: a little sun with a happy face and eight rays, drawn from rows like the heart */
function mSpark(){ const rows=['   ##   ',' ###### ',' ###### ','########','########',' ###### ',' ###### ','   ##   ']; const b=[];
  rows.forEach((r,j)=>{ let i=0; while(i<8){ if(r[i]==='#'){ let k=i; while(k<8&&r[k]==='#') k++; b.push([i-4,(7-j)-4,-1,k-i,1,2,j<2?'#fff7c2':j<5?'#ffe14d':'#ffc21f']); i=k; } else i++; } });
  b.push([-2,0.2,1,1,1.3,0.15,INK],[1,0.2,1,1,1.3,0.15,INK],[-1.4,-1.8,1,2.8,0.5,0.15,INK],[-2,-1.3,1,0.6,0.5,0.15,INK],[1.4,-1.3,1,0.6,0.5,0.15,INK],[-3.2,-0.8,1,0.9,0.6,0.1,'#ff9a5c'],[2.3,-0.8,1,0.9,0.6,0.1,'#ff9a5c']);
  for(const q of [[-0.5,4.6,1,1.6],[-0.5,-6.2,1,1.6],[4.6,-0.5,1.6,1],[-6.2,-0.5,1.6,1],[3.4,3.4,1.2,1.2],[-4.6,3.4,1.2,1.2],[3.4,-4.6,1.2,1.2],[-4.6,-4.6,1.2,1.2]]) b.push([q[0],q[1],-0.5,q[2],q[3],1,'#fff3a0']);
  return b; }
/* a sunbloom: a sunflower with a face, which gives the sun form */
function mSunbloom(){ const y='#ffd23e',l='#fff3a0',g='#3fae49'; const b=[[-0.5,0,-0.5,1,3.4,1,g],[0.5,1,-0.5,1.6,0.8,1,g],[-2.1,1.8,-0.5,1.6,0.8,1,g],[-1.8,4,-0.9,3.6,3.6,1.8,'#a5642f'],
  [-1.2,5.6,0.9,0.7,0.9,0.15,INK],[0.5,5.6,0.9,0.7,0.9,0.15,INK],[-0.7,4.7,0.9,1.4,0.35,0.15,INK]];
  for(const q of [[-1,7.6,2,1.6],[-1,2.4,2,1.6],[1.8,4.8,1.6,2],[-3.4,4.8,1.6,2],[1.6,7.2,1.4,1.4],[-3,7.2,1.4,1.4],[1.6,3,1.4,1.4],[-3,3,1.4,1.4]]) b.push([q[0],q[1],-0.6,q[2],q[3],1.2,(q[0]+q[1])%2?y:l]);
  return b; }
function mSign(){ return [[-0.5,0,-0.4,1,5,0.8,'#a5642f'],[-3.5,4.5,-0.5,7,4.5,1,'#e2b278'],[-3.5,8.6,-0.5,7,0.5,1.1,'#f7d6a6'],[-3.5,4.5,0.5,7,0.5,0.1,'#b07f48'],[-0.5,5.6,0.5,1,0.9,0.15,INK],[-0.5,7,0.5,1,1.5,0.15,INK]]; }
/* a launch pod, drawn pointing up; the level turns it to aim */
function mPod(){ const c='#ff4f7b',d='#c22a55',y='#ffe14d'; return [[-4,-4,-4,8,7,8,c],[-4.6,3,-4.6,9.2,1.6,9.2,y],[-3,4.6,-3,6,0.4,6,INK],[-4,-4.6,-4,8,0.6,8,d],[-4.3,-1.6,-4.3,8.6,1.2,8.6,WHITE],[-1.4,-0.2,4,1,1.2,0.15,INK],[0.5,-0.2,4,1,1.2,0.15,INK],[-0.9,-3,4,1.8,0.4,0.15,INK]]; }
/* the vent a flame jet comes out of, and a fan that makes an updraft */
function mVent(){ return [[-3.5,0,-3.5,7,1.2,7,'#4a4f6a'],[-2.5,1.2,-2.5,5,0.6,5,'#2c3048'],[-1.5,1.8,-1.5,3,0.1,3,'#ff7a1f']]; }
function mFan(){ return [[-4,0,-4,8,1.6,8,'#5a6ab0'],[-3,1.6,-3,6,0.5,6,'#2c3566'],[-2.6,2.1,-0.5,5.2,0.3,1,'#bfcaff'],[-0.5,2.1,-2.6,1,0.3,5.2,'#bfcaff']]; }

/* ================= new for the sequel: the bosses (drawn small, shown at more than twice the size) ================= */
function mBossBongo(){ const c='#8a5a2b',d='#5a3616',l='#e8c58a'; return [[-4.5,1,-3.5,9,6.5,7,c],[-3.4,7.5,-2.6,6.8,1.4,5.2,c],[-3,1.6,3.5,6,3.6,0.4,l],
  ...eye(-3.2,5.2,3.5,2.4,2,1.1,1.1,1.0,0.3),...eye(0.8,5.2,3.5,2.4,2,1.1,1.1,0.2,0.3),[-3.5,7.2,3.5,2.8,0.8,0.7,d],[0.7,7.2,3.5,2.8,0.8,0.7,d],
  [-2,2.2,3.9,4,1.2,0.3,d],[-1.6,2.8,4.2,0.9,0.9,0.2,WHITE],[0.7,2.8,4.2,0.9,0.9,0.2,WHITE],
  [-6.6,2,-1.2,2.2,5,2.4,c],[4.4,2,-1.2,2.2,5,2.4,c],[-6.9,0.4,-1.5,2.8,2,3,d],[4.1,0.4,-1.5,2.8,2,3,d],
  [-3.6,0,-2,3,1.2,4.5,d],[0.6,0,-2,3,1.2,4.5,d],[-1,8.9,-1,2,1.2,2,'#ff4f7b'],[-0.5,10.1,-0.5,1,0.8,1,'#ffe14d']]; }
function mBossBoohoo(){ const b=mGhost().concat(mGhostHands()), k='#2c2447';
  b.push([-3,8.5,-2.4,6,0.6,4.8,k],[-2,9.1,-1.6,4,2.6,3.2,k],[-2,9.1,1.6,4,0.7,0.1,'#ff4f7b'],[-1.4,1.4,2.6,1.1,1,0.3,'#ff4f7b'],[0.3,1.4,2.6,1.1,1,0.3,'#ff4f7b'],[-0.3,1.6,2.7,0.6,0.6,0.3,'#ffe14d'],
    [-2.4,6.5,2.6,2,0.5,0.3,k],[0.4,6.5,2.6,2,0.5,0.3,k]); return b; }
function mBossZappa(){ const b=mZappy(), g='#ffc928';
  b.push([-2,7,-1.2,4,0.8,2.4,g],[-2,7.8,-1.2,0.8,1,0.8,g],[-0.4,7.8,-1.2,0.8,1.4,0.8,g],[1.2,7.8,-1.2,0.8,1,0.8,g],[-2,7.8,0.4,0.8,1,0.8,g],[1.2,7.8,0.4,0.8,1,0.8,g],[-0.3,7.2,1.2,0.6,0.5,0.12,'#ff4f7b'],
    [-1.6,-1.2,-0.4,1,1.6,0.8,'#ffe14d'],[0.8,-1.6,-0.4,1,2,0.8,'#ffe14d']); return b; }
function mBossQueen(){ const swap={'#7d3fd1':'#e0409a','#3f1a80':'#8a1458','#c9a6ff':'#ffc2e0'}, b=mBoss().map(q=>{ const r=q.slice(); r[6]=swap[q[6]]||q[6]; return r; });
  b.push([-1.6,1.9,3.9,3.2,0.5,0.2,'#ff2a6d'],[-3.7,6.9,3.9,0.5,1,0.2,INK],[3.2,6.9,3.9,0.5,1,0.2,INK],[-0.7,10.9,0.7,1.4,1.4,1.4,'#7df9ff'],[-4.4,1,-4.3,8.8,6.6,0.8,'#5a1f8a'],[-4.8,6.6,-4.3,9.6,1.2,1.4,'#ffffff']); return b; }

/* ================= new for the third game: things in the level ================= */
/* the block a laser shines from or a roller drops out of, a geyser's spout, and a roller */
function mEmitter(){ const c='#4a4f6a',l='#7a80a8',d='#2c3048'; return [[-4,0,-4,8,8,8,c],[-4,7.4,-4,8,0.6,8,l],[-4,0,4,8,0.6,0.2,d],[-4.3,2.6,-4.3,8.6,2.8,8.6,d],[-1.5,2.8,4.3,3,2.4,0.2,'#ffe14d'],[-0.8,3.4,4.5,1.6,1.2,0.15,WHITE]]; }
function mSpout(){ const c='#8a8aa3',d='#5a5a73'; return [[-3.5,0,-3.5,7,1.4,7,c],[-2.5,1.4,-2.5,5,0.7,5,d],[-1.6,2.1,-1.6,3.2,0.2,3.2,'#2c2447']]; }
function mRoller(c,d){ c=c||'#b5793f'; d=d||'#7d4f24'; return [[-3,-3.6,-3.4,6,7.2,6.8,c],[-3.6,-3,-3.4,7.2,6,6.8,c],[-3.8,-3.8,-3.7,7.6,7.6,0.9,d],[-3.8,-3.8,2.8,7.6,7.6,0.9,d],[-3.8,-3.8,-0.5,7.6,7.6,0.9,d],
  [-1.5,-0.2,3.7,1.1,1.3,0.15,INK],[0.5,-0.2,3.7,1.1,1.3,0.15,INK],[-1.9,1.3,3.7,1.6,0.4,0.15,INK],[0.4,1.3,3.7,1.6,0.4,0.15,INK],[-1,-2,3.7,2,0.4,0.15,INK]]; }

/* ================= new for the third game: monsters ================= */
function mPuff(){ const w=WHITE,l='#ffe9f4'; return [[-2.5,1,-2.5,5,5,5,w],[-1.8,0.4,-1.8,3.6,6.2,3.6,w],[-3.1,1.8,-1.8,6.2,3.4,3.6,w],[-1.8,1.8,-3.1,3.6,3.4,6.2,w],
  [-1.6,3.4,2.5,1,1.3,0.15,INK],[0.6,3.4,2.5,1,1.3,0.15,INK],[-0.6,2.4,2.5,1.2,0.4,0.15,INK],[-2.4,2.6,2.5,0.8,0.6,0.1,'#ffb3c7'],[1.6,2.6,2.5,0.8,0.6,0.1,'#ffb3c7'],
  [-0.3,-2,-0.3,0.6,2.4,0.6,'#7cc244'],[-0.9,-2.8,-0.5,1.8,0.8,1,'#8a5a2b'],[-3.7,5.2,-0.4,1,1,0.8,l],[2.7,5.6,-0.4,1,1,0.8,l],[-0.5,6.6,-0.5,1,1.2,1,l]]; }
function mBuzz(){ const y='#ffc928',k='#3a2a1a'; return [[-2.4,0.8,-2.8,4.8,4.2,2,y],[-2.4,0.8,-0.8,4.8,4.2,1.4,k],[-2.4,0.8,0.6,4.8,4.2,1.6,y],[-2,1.2,2.2,4,3.4,1,k],
  ...eye(-1.9,2.6,3.2,1.6,1.5,0.8,0.8,0.7,0.3),...eye(0.3,2.6,3.2,1.6,1.5,0.8,0.8,0.1,0.3),[-2.1,4.1,3.2,1.9,0.5,0.4,k],[0.2,4.1,3.2,1.9,0.5,0.4,k],
  [-0.4,1.8,-4.2,0.8,0.8,1.4,'#fff1d0'],[-1.4,4.6,2.4,0.4,1.6,0.4,k],[1,4.6,2.4,0.4,1.6,0.4,k],[-1.7,6.1,2.2,1,0.8,0.8,k],[0.7,6.1,2.2,1,0.8,0.8,k]]; }
function mBuzzWing(sx){ return sx>0?[[0,0,-1.4,3.6,0.25,2.4,'#e6fbff'],[3.6,0,-1,1,0.25,1.6,'#c9f0ff']]:[[-3.6,0,-1.4,3.6,0.25,2.4,'#e6fbff'],[-4.6,0,-1,1,0.25,1.6,'#c9f0ff']]; }
function mGloop(c,d,l){ c=c||'#ffb02e'; d=d||'#d97a12'; l=l||'#ffe08a'; return [[-3.6,0,-3,7.2,2.4,6,c],[-3,2.4,-2.6,6,2,5.2,c],[-2.2,4.4,-2,4.4,1.2,4,c],[-1,5.6,-1,2,0.8,2,l],
  [-4.2,0,-1,0.8,1.2,2,d],[3.4,0,-0.4,0.8,1,1.8,d],[-1,0,3,2,0.9,0.6,d],
  ...eye(-2.4,2.2,2.6,1.9,1.7,0.9,0.9,0.8,0.3),...eye(0.5,2.2,2.6,1.9,1.7,0.9,0.9,0.2,0.3),[-1,1.1,3,2,0.5,0.2,'#7a3f0f'],[-2.4,4.6,1.2,1.2,0.5,0.9,l]]; }
function mRibbit(c,d,l){ c=c||'#5fcf6a'; d=d||'#2f9a48'; l=l||'#d9ffb8'; return [[-3.5,0.8,-3,7,3.6,6,c],[-2.8,0.8,3,5.6,2,0.3,l],[-3.6,4.4,0.4,2.6,2.2,2.4,c],[1,4.4,0.4,2.6,2.2,2.4,c],
  ...eye(-3.3,4.7,2.8,2,1.6,0.9,1,0.9,0.3),...eye(1.3,4.7,2.8,2,1.6,0.9,1,0.2,0.3),[-2.6,2.6,3,5.2,0.5,0.4,d],
  [-4.6,0,-2.4,1.8,1.4,3.6,d],[2.8,0,-2.4,1.8,1.4,3.6,d],[-3.6,0,1.6,1.4,0.8,2.2,d],[2.2,0,1.6,1.4,0.8,2.2,d],[-1.4,4.4,-1.6,1.1,0.2,1.1,d],[0.8,4.4,-2.4,0.9,0.2,0.9,d]]; }
function mWisp(c,l){ c=c||'#9ff0ff'; l=l||'#e6fdff'; return [[-2,0.6,-2,4,4,4,c],[-1.4,0,-1.4,2.8,5.2,2.8,l],[-0.8,5.2,-0.8,1.6,1.2,1.6,c],[-0.4,6.4,-0.4,0.8,0.9,0.8,l],[-1.2,2.4,2,0.8,1.1,0.15,INK],[0.4,2.4,2,0.8,1.1,0.15,INK]]; }
function mSwoop(c,d,bk){ c=c||'#b06ad9'; d=d||'#7a3fae'; bk=bk||'#ffb347'; return [[-2.2,0.8,-3.2,4.4,3.6,6,c],[-1.8,2,2.4,3.6,3.2,2.6,c],[-0.8,2.6,5,1.6,1.1,3,bk],[-0.6,2.1,5,1.2,0.5,2,shade(bk,0.8)],
  [1.8,3.6,3.4,0.15,1.2,1.2,WHITE],[1.9,3.9,3.9,0.12,0.6,0.6,INK],[-1.95,3.6,3.4,0.15,1.2,1.2,WHITE],[-2.02,3.9,3.9,0.12,0.6,0.6,INK],
  [-0.6,4.4,-1,1.2,1.4,3,d],[-0.5,1.6,-5,1,2,2,d],[-1.2,0,-0.6,0.8,0.9,1.2,bk],[0.4,0,-0.6,0.8,0.9,1.2,bk]]; }
function mSwoopWing(sx,d,l){ d=d||'#7a3fae'; l=l||'#d09cf2'; return sx>0?[[0,-0.5,-2,4,1,4,d],[4,-0.3,-1.4,2.4,0.7,3,d],[6.4,-0.2,-0.8,1.4,0.5,1.8,l],[0.6,0.5,-1.4,3,0.12,2.8,l]]:[[-4,-0.5,-2,4,1,4,d],[-6.4,-0.3,-1.4,2.4,0.7,3,d],[-7.8,-0.2,-0.8,1.4,0.5,1.8,l],[-3.6,0.5,-1.4,3,0.12,2.8,l]]; }
function mBones(){ const w='#f2eedf',d='#c9c2a8'; return [[-2.6,3.6,-2.4,5.2,4.4,4.8,w],[-2,3,-1.6,4,0.8,3.6,d],
  [-1.9,5.2,2.4,1.5,1.7,0.2,INK],[0.4,5.2,2.4,1.5,1.7,0.2,INK],[-1.5,5.6,2.55,0.6,0.6,0.15,'#ff4f7b'],[0.8,5.6,2.55,0.6,0.6,0.15,'#ff4f7b'],[-0.3,4.2,2.4,0.6,0.7,0.2,INK],
  [-1.6,3,2.4,0.6,0.8,0.15,w],[-0.5,3,2.4,0.6,0.8,0.15,w],[0.6,3,2.4,0.6,0.8,0.15,w],
  [-0.5,1.2,-0.5,1,1.8,1,w],[-1.8,1.6,-0.6,3.6,0.6,1.2,d],[-1.4,0,-0.6,0.9,1.2,1.6,w],[0.5,0,-0.6,0.9,1.2,1.6,w]]; }
function mBonePile(){ const w='#f2eedf',d='#c9c2a8'; return [[-2.6,0,-2.4,5.2,2.6,4.8,w],[-3.4,0,-0.4,6.8,0.8,0.9,d],[-0.4,0,-3.2,0.9,0.8,6.4,d],[-1.9,0.9,2.4,1.5,1.2,0.2,INK],[0.4,0.9,2.4,1.5,1.2,0.2,INK]]; }
function mMimic(){ const y='#ffc928',l='#ffe680',d='#c98a00'; return [[-4,1,-4,8,8,8,y],[-4,8.6,-4,8,0.4,8,l],[-4,1,4,8,0.5,0.2,d],
  [-2.4,4.8,4,4.8,2.8,0.2,WHITE],[-1,5.2,4.2,2,2,0.15,INK],[-1,6.3,4.3,0.8,0.7,0.1,WHITE],[-3,7.6,4,2.6,0.6,0.4,d],[0.4,7.6,4,2.6,0.6,0.4,d],
  [-3,1.8,4,6,1.6,0.2,'#7a1f3d'],[-2.6,2.7,4.2,0.9,0.7,0.15,WHITE],[-0.9,2.7,4.2,0.9,0.7,0.15,WHITE],[0.8,2.7,4.2,0.9,0.7,0.15,WHITE],[-1.8,1.8,4.2,0.9,0.6,0.15,WHITE],[0,1.8,4.2,0.9,0.6,0.15,WHITE],
  [-3.4,0,-1.5,2.4,1,3.4,'#ff8f3c'],[1,0,-1.5,2.4,1,3.4,'#ff8f3c']]; }
function mMimicShut(){ const y='#ffc928',l='#ffe680',d='#c98a00'; return [[-4,0,-4,8,8,8,y],[-4,7.6,-4,8,0.4,8,l],[-4,0,4,8,0.5,0.2,d],[-2.4,3.6,4,4.8,0.5,0.2,'#7a4a00'],[-1,1.4,4,2,0.4,0.2,'#7a4a00'],[-2.6,1,4,0.5,0.5,0.2,d],[2.1,1,4,0.5,0.5,0.2,d],[-2.6,6.5,4,0.5,0.5,0.2,d],[2.1,6.5,4,0.5,0.5,0.2,d]]; }
function mDrone(c,d,l){ c=c||'#8fa0c8'; d=d||'#5a6a96'; l=l||'#c9d6f2'; return [[-3,1,-2.5,6,4,5,c],[-2.4,5,-2,4.8,0.8,4,l],[-3.6,2,-1.5,0.6,2,3,d],[3,2,-1.5,0.6,2,3,d],
  [-1.6,2,2.5,3.2,2.4,0.3,INK],[-0.7,2.5,2.8,1.4,1.4,0.15,'#ff4f7b'],[-0.3,3.2,2.95,0.6,0.5,0.1,WHITE],[-0.3,5.8,-0.3,0.6,1.6,0.6,d],[-1.2,0,-1.2,2.4,1,2.4,d]]; }
function mRotor(){ return [[-4,0,-0.5,8,0.3,1,'#e6edff'],[-0.5,0,-4,1,0.3,8,'#e6edff']]; }
function mStackSeg(c){ const d=shade(c,0.7); return [[-3,0,-3,6,4,6,c],[-3.3,3.3,-3.3,6.6,0.7,6.6,d],...eye(-2.3,1.1,3,1.9,1.7,0.9,0.9,0.8,0.3),...eye(0.4,1.1,3,1.9,1.7,0.9,0.9,0.1,0.3),[-1,0.3,3,2,0.5,0.2,INK]]; }
function mSaw(){ const c='#c9d2e2',d='#8a94ab'; const b=[[-3,-3,-0.5,6,6,1,c],[-2.2,-3.6,-0.5,4.4,7.2,1,c],[-3.6,-2.2,-0.5,7.2,4.4,1,c],[-1.2,-1.2,-0.8,2.4,2.4,1.6,'#ff4f7b'],[-0.5,-0.5,-0.9,1,1,1.8,WHITE]];
  for(let i=0;i<8;i++){ const a=i/8*6.283, x=Math.cos(a)*4.1, y=Math.sin(a)*4.1; b.push([x-0.8,y-0.8,-0.4,1.6,1.6,0.8,i%2?d:WHITE]); } return b; }
function mBalloonE(c){ const l=shade(c,1.22), d=shade(c,0.8); return [[-3,2,-3,6,6,6,c],[-2.2,1.2,-2.2,4.4,7.6,4.4,c],[-3.6,3,-2.2,7.2,4,4.4,c],[-2.2,3,-3.6,4.4,4,7.2,c],[-2,6.4,2.7,1.4,1.2,0.5,l],[-0.6,0.4,-0.6,1.2,0.8,1.2,d],[-0.15,-3.2,-0.15,0.3,3.6,0.3,'#fff2c2'],
  [-1.3,4.4,3.6,0.8,1,0.15,INK],[0.5,4.4,3.6,0.8,1,0.15,INK],[-0.6,3.4,3.6,1.2,0.3,0.15,INK]]; }
function mShade(){ const c={b:'#33265c',d:'#1c1233',l:'#4a3a7a',h:'#5a4a8f',f:'#241a44',t:'#1c1233'}; const b=mBlorpSmall(c).filter(q=>q[6]!==WHITE&&q[6]!=='#ff9bb0'&&q[6]!=='#7a1f3d'&&q[6]!==INK); b.push([-1.5,3.4,2.5,3,2.6,0.3,'#1c1233']); return b; }
function mShadeEye(){ return [[-0.9,3.9,2.8,1.8,1.6,0.25,'#ff3b6b'],[-0.3,4.4,3.05,0.6,0.6,0.1,'#ffd0dc']]; }

/* ================= new for the third game: the bosses (drawn small, shown at about twice the size) ================= */
/* Granny Smash, a toffee apple gone bad: drawn round her own middle, because she rolls */
function mBossApple(){ const r='#e8384f',rd='#b8203c',c='#d98a2b',cl='#f5bd62'; return [
  [-4,-3.4,-3.6,8,6.8,7.2,r],[-3.4,-4,-3.2,6.8,8,6.4,r],[-4.5,-2.4,-2.8,9,4.8,5.6,r],[-2.8,-4.4,-2.4,5.6,0.6,4.8,rd],
  [-4.1,1,-3.7,8.2,2.5,7.4,c],[-3.5,3.4,-3.3,7,0.8,6.6,c],[-4.6,1.4,-2.9,9.2,1.4,5.8,c],[-3,0.2,3.7,1.2,0.8,0.2,c],[1.6,-0.4,3.7,1,1.4,0.2,c],[-0.4,0.4,3.7,0.9,0.6,0.2,c],[-2.4,2.6,3.4,2,0.5,0.5,cl],
  [-0.5,4,-0.5,1,3.6,1,'#f0dcb0'],[-0.5,7.2,-0.5,1,0.5,1,'#d9b98a'],
  ...eye(-3,-1.6,3.6,2.4,2.2,1.1,1.2,1.0,0.3),...eye(0.6,-1.6,3.6,2.4,2.2,1.1,1.2,0.3,0.3),[-3.3,0.5,3.6,2.7,0.7,0.6,rd],[0.6,0.5,3.6,2.7,0.7,0.6,rd],[-1.4,0.1,3.6,1,0.6,0.6,rd],[0.4,0.1,3.6,1,0.6,0.6,rd],
  [-2.2,-3.6,3.3,4.4,1.2,0.4,'#5a0f2a'],[-1.8,-3,3.6,0.9,0.7,0.2,WHITE],[-0.4,-3,3.6,0.9,0.7,0.2,WHITE],[1,-3,3.6,0.9,0.7,0.2,WHITE],
  [4.5,-1,-1,0.2,1.4,1.4,rd],[-4.7,0,0.2,0.2,1.2,1.2,rd]]; }
function mAppleBomb(){ return [[-2,-2,-2,4,4,4,'#e8384f'],[-1.4,-2.4,-1.4,2.8,4.8,2.8,'#e8384f'],[-0.3,2.2,-0.3,0.6,1.2,0.6,'#8a5a2b'],[0.3,2.8,-0.3,1.4,0.6,0.8,'#3fae49'],[-1.2,0,2,0.8,0.9,0.15,INK],[0.4,0,2,0.8,0.9,0.15,INK]]; }
/* King Croak, a toad the size of a shed, and his tongue */
function mBossCroak(){ const b=mRibbit('#58b25e','#2c7e44','#e3f7b0'), g='#ffc928';
  b.push([-2,6.6,-1.4,4,0.8,2.8,g],[-2,7.4,-1.4,0.8,1.1,0.8,g],[-0.4,7.4,-1.4,0.8,1.5,0.8,g],[1.2,7.4,-1.4,0.8,1.1,0.8,g],[-2,7.4,0.6,0.8,1.1,0.8,g],[1.2,7.4,0.6,0.8,1.1,0.8,g],[-0.3,6.9,1.4,0.6,0.5,0.12,'#ff4f7b'],
    [-3.6,1.6,-1,0.4,1.2,1.2,'#8fd08a'],[3.2,2.6,0.4,0.4,1,1,'#8fd08a'],[-1.6,4.4,-2.6,1.2,0.3,1.2,'#8fd08a'],[-2.2,1.2,3.1,4.4,1.3,0.25,'#7a1f3d']); return b; }
/* Ringmaster Razzle: top hat, moustache, red coat; the ball he rides is a mesh of its own, so it can turn under him */
function mBossRazzle(){ const r='#e8384f',rd='#a81f38',g='#ffc928',k='#2c2447',sk='#ffd9b0'; return [
  [-3,0,-2.4,6,5.4,4.8,r],[-3.2,0,-2.6,6.4,1,5.2,rd],[-0.6,0.6,2.4,1.2,4.6,0.2,WHITE],[-0.4,3.6,2.6,0.8,0.8,0.15,g],[-0.4,2,2.6,0.8,0.8,0.15,g],[-3,4.2,2.4,1.6,1.2,0.2,g],[1.4,4.2,2.4,1.6,1.2,0.2,g],
  [-2.6,5.4,-2.2,5.2,3.8,4.4,sk],...eye(-2.1,7,2.2,1.7,1.5,0.8,0.9,0.7,0.3),...eye(0.4,7,2.2,1.7,1.5,0.8,0.9,0.2,0.3),[-2.3,8.6,2.2,2,0.5,0.4,k],[0.3,8.6,2.2,2,0.5,0.4,k],
  [-0.5,6.4,2.2,1,0.7,0.6,'#ff9a8a'],[-2.6,5.7,2.2,2.2,0.7,0.5,k],[0.4,5.7,2.2,2.2,0.7,0.5,k],[-3.2,5.9,2.2,0.7,1,0.4,k],[2.5,5.9,2.2,0.7,1,0.4,k],
  [-3.6,9.2,-3.2,7.2,0.7,6.4,k],[-2.4,9.9,-2,4.8,4,4,k],[-2.5,10.3,-2.1,5,0.9,4.2,r],[-0.5,11.6,2,1,1,0.15,g],
  [-4.4,2,-0.8,1.4,3.2,1.6,r],[3,2,-0.8,1.4,3.2,1.6,r],[-4.6,1,-0.9,1.8,1.2,1.8,WHITE],[2.8,1,-0.9,1.8,1.2,1.8,WHITE]]; }
function mRazzleBall(){ const a='#ffe14d',b_='#4d96ff',r='#ff4f7b'; const b=[[-4,-4,-4,8,8,8,a],[-4.6,-2.6,-2.6,9.2,5.2,5.2,a],[-2.6,-4.6,-2.6,5.2,9.2,5.2,a],[-2.6,-2.6,-4.6,5.2,5.2,9.2,a],
  [-4.1,-1,-4.1,8.2,2,8.2,b_],[-1,-4.1,-4.1,2,8.2,8.2,r]]; return b; }
function mJuggleBall(){ return [[-2,-2,-2,4,4,4,'#ff4f7b'],[-1.4,-2.4,-1.4,2.8,4.8,2.8,'#ff4f7b'],[-2.1,-0.6,-2.1,4.2,1.2,4.2,WHITE],[-0.6,0.9,2,1.2,0.9,0.12,'#ffe14d']]; }
/* Wokbot 3000, the noodle bar's cook: a boiler on legs with a wok for a hat */
function mBossWok(){ const c='#9aa7c2',d='#5a6788',l='#d5deee',k='#2c3048',n='#3ff0ff'; return [
  [-4,1.6,-3.4,8,6.4,6.8,c],[-3.4,8,-2.8,6.8,1,5.6,l],[-4.3,3.2,-3.7,8.6,1,7.4,d],[-4.3,6,-3.7,8.6,0.6,7.4,d],
  [-3,4.6,3.4,6,2.8,0.3,k],[-2.4,5.2,3.7,1.6,1.6,0.15,n],[0.8,5.2,3.7,1.6,1.6,0.15,n],[-1.9,5.7,3.85,0.6,0.6,0.1,WHITE],[1.3,5.7,3.85,0.6,0.6,0.1,WHITE],
  [-2.2,2.4,3.4,4.4,1.2,0.3,k],[-1.8,2.7,3.7,0.6,0.6,0.15,'#ffe14d'],[-0.8,2.7,3.7,0.6,0.6,0.15,'#ffe14d'],[0.2,2.7,3.7,0.6,0.6,0.15,'#ffe14d'],[1.2,2.7,3.7,0.6,0.6,0.15,'#ffe14d'],
  [-5,9,-4.4,10,0.8,8.8,k],[-4.2,9.8,-3.6,8.4,0.6,7.2,'#3a4266'],[-5.8,9.2,-0.5,0.9,0.5,1,k],[4.9,9.2,-0.5,0.9,0.5,1,k],
  [-5.6,3,-1,1.6,3.6,2,d],[4,3,-1,1.6,3.6,2,d],[-6,2,-1.2,2.2,1.4,2.4,l],[3.8,2,-1.2,2.2,1.4,2.4,l],
  [-3.2,0,-1.6,2.4,1.6,3.6,d],[0.8,0,-1.6,2.4,1.6,3.6,d],[-0.3,10.4,-0.3,0.6,1.6,0.6,d],[-0.6,12,-0.6,1.2,1.2,1.2,'#ff4f7b']]; }
function mWokNoodles(){ const y='#ffe08a',o='#ffb347'; return [[-3.4,10.2,-2.8,6.8,0.8,5.6,y],[-2.4,11,-1.8,2,0.6,1.6,o],[0.6,11,0.2,1.8,0.6,1.6,o],[-0.6,11,-2.4,1.2,0.5,1.2,'#7ee0a8'],[1.4,11,-1.8,1,0.8,1,'#ff8fa8']]; }
function mFireball(){ return [[-2,-2,-2,4,4,4,'#ff7a1f'],[-1.3,-1.3,-2.6,2.6,2.6,5.2,'#ffb02e'],[-0.8,-0.8,-0.8,1.6,1.6,1.6,'#fff3a0'],[-2.6,-1.3,-1.3,5.2,2.6,2.6,'#ffb02e']]; }
/* Baron Blackout: a tall hat, a cloak like a closed umbrella, two lamp-yellow eyes, and the snuffer he puts lights out with */
function mBossBaron(){ const k='#1c1233',c='#3a2a6b',cl='#5a3fa0',g='#ffc928',e='#ffe14d'; return [
  [-3.4,1,-2.8,6.8,6.4,5.6,c],[-4,1,-3.2,8,2.4,6.4,c],[-4.4,0.4,-3.4,8.8,1.2,6.8,cl],[-2.6,7.4,-2.2,5.2,1,4.4,c],
  [-2.6,5.2,2.8,5.2,2.6,0.3,k],[-2,5.8,3.1,1.5,1.4,0.15,e],[0.5,5.8,3.1,1.5,1.4,0.15,e],[-1.5,6.2,3.25,0.5,0.6,0.1,WHITE],[1,6.2,3.25,0.5,0.6,0.1,WHITE],[0.3,5.6,3.3,1.9,1.8,0.08,g],
  [-1.6,3.2,2.8,3.2,1.2,0.3,k],[-1.2,3.5,3.1,0.6,0.6,0.15,WHITE],[-0.3,3.5,3.1,0.6,0.6,0.15,WHITE],[0.6,3.5,3.1,0.6,0.6,0.15,WHITE],
  [-0.4,1.4,2.8,0.8,1.4,0.2,g],[-3.4,7.6,-3,6.8,0.8,1.2,'#e8384f'],
  [-3.8,8.4,-3.2,7.6,0.7,6.4,k],[-2.6,9.1,-2.2,5.2,4.6,4.4,k],[-2.7,9.6,-2.3,5.4,0.9,4.6,g],[-2.2,13.7,-1.8,4.4,0.5,3.6,'#2c2447'],
  [-5.2,3,-0.8,1.8,3.4,1.6,c],[3.4,3,-0.8,1.8,3.4,1.6,c],[-5.4,2,-0.9,2.2,1.2,1.8,WHITE],[3.2,2,-0.9,2.2,1.2,1.8,WHITE]]; }
function mBaronSnuffer(){ const g='#ffc928',d='#c98a00'; return [[-0.4,0,-0.4,0.8,9,0.8,'#8a5a2b'],[-0.4,9,-0.4,3.2,0.8,0.8,g],[2,6.6,-1,2.4,2.6,2,g],[1.6,6,-1.4,3.2,0.8,2.8,d],[2.6,9,-0.4,1.2,0.8,0.8,g]]; }
function mBaronCloud(){ const c='#2c2447',l='#4a3f6b'; return [[-6,0,-3.4,12,2.6,6.8,c],[-4.4,2.6,-2.6,8.8,1.4,5.2,c],[-7.2,0.6,-2.4,1.6,1.6,4.8,l],[5.6,0.6,-2.4,1.6,1.6,4.8,l],[-5,-0.8,-2.6,10,0.8,5.2,l]]; }
function mDarkOrb(){ return [[-2,-2,-2,4,4,4,'#3a2a6b'],[-1.3,-2.6,-1.3,2.6,5.2,2.6,'#5a3fa0'],[-2.6,-1.3,-1.3,5.2,2.6,2.6,'#5a3fa0'],[-0.8,-0.8,1.9,1.6,1.6,0.3,'#ffe14d']]; }
