/* ================= renderer, lights, sky and post-processing ================= */
const $=id=>document.getElementById(id);
const stage=$('stage'), canvas=$('c');
const reduceMotion=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let renderer;
try{ renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'}); }
catch(e){ $('nogl').hidden=false; return; }
renderer.setClearColor(0x1c1233,1);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.info.autoReset=false; /* counted per frame, over every pass: see renderFrame */
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(30,1,1,220);
const hemi=new T.HemisphereLight(0xffffff,0x888888,0.6); scene.add(hemi);
/* The sun casts the game's shadows. Its shadow box rides along with the camera (see placeSun), so only what is on
   screen, and a little around it, is ever drawn into the shadow map. */
const sun=new T.DirectionalLight(0xffffff,0.6); sun.castShadow=true; scene.add(sun,sun.target);
const SHADOW_W=46, SHADOW_H=34;
{ const c=sun.shadow.camera; c.left=-SHADOW_W/2; c.right=SHADOW_W/2; c.top=SHADOW_H/2; c.bottom=-SHADOW_H/2; c.near=1; c.far=110; sun.shadow.bias=-0.0009; sun.shadow.normalBias=0.035; sun.shadow.mapSize.set(2048,2048); }
const sunDir=new T.Vector3(-0.42,0.78,0.52).normalize(), _sr=new T.Vector3(), _su=new T.Vector3(), _sp=new T.Vector3(), UP=new T.Vector3(0,1,0);
/* Aim the sun at a point. The point is first rounded to whole texels of the shadow map, measured along the map's own
   axes: without that, every shadow edge would crawl as the camera moves. */
function placeSun(x,y,z){
  _sr.crossVectors(UP,sunDir).normalize(); _su.crossVectors(sunDir,_sr);
  _sp.set(x,y,z); const tex=SHADOW_W/sun.shadow.mapSize.x, a=Math.round(_sp.dot(_sr)/tex)*tex, b=Math.round(_sp.dot(_su)/tex)*tex, c=_sp.dot(sunDir);
  sun.target.position.set(0,0,0).addScaledVector(_sr,a).addScaledVector(_su,b).addScaledVector(sunDir,c);
  sun.position.copy(sun.target.position).addScaledVector(sunDir,55);
}
/* Four small lights that follow whatever is glowing nearby: fire spit, lamps, a sun-powered Blorp. Their number never
   changes, so no shader is ever rebuilt for them; a light nobody asked for this frame is simply turned down to nothing.
   Each one asked for is also remembered for the frame, because in a dark level it is what holds the dark back. */
const glowLights=[0,1,2,3].map(()=>{ const l=new T.PointLight(0xffffff,0,7.5,1.4); scene.add(l); return l; });
let glowN=0;
const glowSeen=[]; /* [x,y,z,reach,power] for every glowAt this frame, lights or no lights left */
function glowAt(x,y,z,col,power,reach){
  if(glowSeen.length<12) glowSeen.push([x,y,z,reach||7.5,power]);
  if(glowN>=glowLights.length) return; const l=glowLights[glowN++]; l.position.set(x,y,z); l.color.set(col); l.intensity=power; l.distance=reach||7.5;
}
function glowEnd(){ for(let i=glowN;i<glowLights.length;i++) glowLights[i].intensity=0; glowN=0; }

let world=new T.Group(); scene.add(world);
const fx=new T.Group(); scene.add(fx);

/* ---------- the sky ---------- */
/* One full-screen sheet behind everything, drawn in the game's chunky pixels: a three-colour gradient, a glow around
   where the sun or moon hangs, square stars that twinkle and now and then fall, two decks of drifting cloud, a ribbon
   of northern lights, a wash of coloured dust for the skies of other worlds, and an eclipse for the last one. It is
   drawn in screen space, and slides a little with the camera. */
const skyU={cTop:{value:new T.Color(0x3fb2ff)},cMid:{value:new T.Color(0x96e0ff)},cBot:{value:new T.Color(0xffeebd)},uMid:{value:0.5},
  sunCol:{value:new T.Color(0xfff3c0)},sunPos:{value:new T.Vector2(0.78,0.74)},sunGlow:{value:1},uStars:{value:0},uTime,uScroll:{value:new T.Vector2()},uAspect:{value:1.78},
  cBand:{value:new T.Color(0x000000)},uBand:{value:0},
  uCloud:{value:0},cCloud:{value:new T.Color(0xffffff)},cCloudS:{value:new T.Color(0xd4ecff)},uCloudY:{value:0.62},
  uNeb:{value:0},cNebA:{value:new T.Color(0x7b4fe0)},cNebB:{value:new T.Color(0xff4f7b)},
  uSpokes:{value:0},uEclipse:{value:0},uShoot:{value:0},uBolt:{value:0}};
const skyMesh=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({uniforms:skyU,depthTest:false,depthWrite:false,fog:false,
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.999,1.0); }',
  fragmentShader:`uniform vec3 cTop,cMid,cBot,sunCol,cBand,cCloud,cCloudS,cNebA,cNebB; uniform float uMid,sunGlow,uStars,uTime,uAspect,uBand,uCloud,uCloudY,uNeb,uSpokes,uEclipse,uShoot,uBolt; uniform vec2 sunPos,uScroll; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y); }
    float fbm(vec2 p){ return vnoise(p)*0.55+vnoise(p*2.1+7.3)*0.3+vnoise(p*4.3+1.7)*0.15; }
    /* one deck of cloud, in blocks: 0 none, then the lit top, the body and the shaded underside */
    float deck(vec2 uv,float cells,float speed,float y0,float amount,out float lit){
      vec2 g=floor((uv+vec2(uScroll.x*speed+uTime*0.004*speed,0.0))*vec2(uAspect,1.0)*cells)/cells;
      float band=1.0-smoothstep(0.0,0.26,abs(g.y-y0));
      float n=fbm(g*vec2(3.2,9.0)+vec2(0.0,y0*40.0))*band;
      float m=step(1.0-amount*0.62,n+0.18);
      float up=fbm((g+vec2(0.0,1.5/cells))*vec2(3.2,9.0)+vec2(0.0,y0*40.0))*(1.0-smoothstep(0.0,0.26,abs(g.y+1.5/cells-y0)));
      lit=step(up+0.18,1.0-amount*0.62);
      return m;
    }
    void main(){
      float y=clamp(vUv.y+uScroll.y,0.0,1.0);
      vec3 c=y<uMid?mix(cBot,cMid,y/uMid):mix(cMid,cTop,(y-uMid)/(1.0-uMid));
      vec2 d=(vUv-sunPos)*vec2(uAspect,1.0); float r=length(d);
      if(uNeb>0.0){ vec2 q=(vUv+uScroll*vec2(0.6,0.3))*vec2(uAspect,1.0); float n1=fbm(q*2.3+vec2(uTime*0.006,0.0)), n2=fbm(q*3.1+vec2(9.0,uTime*0.004));
        c+=(cNebA*smoothstep(0.42,0.85,n1)+cNebB*smoothstep(0.5,0.9,n2))*uNeb*smoothstep(0.1,0.7,y); }
      if(uStars>0.0){ vec2 g=(vUv+uScroll*vec2(1.0,0.4))*vec2(uAspect,1.0)*46.0; vec2 id=floor(g), f=fract(g)-0.5; float h=hash(id);
        float sz=0.10+0.14*fract(h*17.0); float s=step(0.93,h)*step(max(abs(f.x),abs(f.y)),sz);
        c+=uStars*s*(0.55+0.45*sin(uTime*(1.0+h*4.0)+h*60.0))*smoothstep(0.15,0.6,y); }
      if(uShoot>0.0){ float k=floor(uTime/4.7), u=fract(uTime/4.7)*4.7, hx=hash(vec2(k,3.0)), hy=hash(vec2(k,8.0));
        vec2 a=vec2(0.15+hx*0.7,0.62+hy*0.3), dir=normalize(vec2(-0.8,-0.36)); vec2 p=(vUv-a)*vec2(uAspect,1.0); float along=dot(p,dir), off=abs(dot(p,vec2(-dir.y,dir.x)));
        float head=u*1.5; c+=uShoot*step(off,0.004)*step(along,head)*smoothstep(head-0.22,head,along)*step(u,0.55)*vec3(1.0,0.97,0.86); }
      if(uBand>0.0){ float w=sin(vUv.x*5.0+uTime*0.12+sin(vUv.x*11.0-uTime*0.2)*0.6)*0.06; float b=exp(-pow((y-0.62-w)*7.0,2.0)); c+=cBand*b*uBand*(0.75+0.25*sin(vUv.x*40.0+uTime)); }
      if(uSpokes>0.0){ float a=atan(d.y,d.x); float sp=step(0.5,fract(a*1.9099+uTime*0.02))*exp(-r*2.2); c+=sunCol*sp*uSpokes*0.22; }
      c+=sunCol*sunGlow*(0.26*exp(-r*r*30.0)+0.10*exp(-r*4.5));
      if(uEclipse>0.0){ float ring=exp(-pow((r-0.078)*46.0,2.0)), flare=exp(-r*7.0)*(0.6+0.4*sin(atan(d.y,d.x)*7.0+uTime*0.4));
        c+=uEclipse*(vec3(1.0,0.84,0.5)*ring*1.5+vec3(1.0,0.52,0.22)*flare*0.5); c*=1.0-uEclipse*step(r,0.072)*0.94; }
      if(uCloud>0.0){ float l1,l2; float m2=deck(vUv,60.0,0.5,uCloudY+0.13,uCloud*0.85,l2); c=mix(c,mix(cCloudS,c,0.45),m2*0.7); c=mix(c,mix(cCloud,c,0.35),m2*l2*0.7);
        float m1=deck(vUv,44.0,1.0,uCloudY,uCloud,l1); c=mix(c,cCloudS,m1*0.9); c=mix(c,cCloud,m1*l1*0.95); }
      c+=uBolt*vec3(0.75,0.8,1.0);
      gl_FragColor=vec4(c,1.0);
    }`}));
skyMesh.frustumCulled=false; skyMesh.renderOrder=-1000; scene.add(skyMesh);

/* ---------- quality ---------- */
/* 0 plain (no shadows, no glow), 1 medium (shadows, bloom and the grade), 2 full (also everything that needs to know how
   far away each pixel is: soft shade in corners, a blur with distance, shafts of sunlight, and mirrors in the water).
   On `auto` the game starts at the top and steps down for good whenever it cannot keep up; a choice made on the pause
   screen switches auto off. */
const QUALITY=[{post:false,shadow:0,dpr:1.5,bloomN:0,deep:false},{post:true,shadow:1024,dpr:1.5,bloomN:4,deep:false},{post:true,shadow:2048,dpr:2,bloomN:5,deep:true}];
const Q={level:2,auto:true,slow:0,frames:0};
function setQuality(n,byHand){
  Q.level=clamp(n,0,2); if(byHand) Q.auto=false; Q.slow=0; Q.frames=0;
  const q=QUALITY[Q.level];
  sun.castShadow=q.shadow>0;
  if(q.shadow&&sun.shadow.mapSize.x!==q.shadow){ sun.shadow.mapSize.set(q.shadow,q.shadow); if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map=null; } }
  renderer.shadowMap.type=Q.level>1?T.PCFSoftShadowMap:T.PCFShadowMap;
  if(typeof layout==='function') layout();
}
/* Called once a frame while a level is being played, with how long the frame took. */
function watchSpeed(dt){
  if(!Q.auto||Q.level===0) return;
  Q.frames++; if(Q.frames<90) return; /* let a new level settle: its first frames compile shaders */
  if(dt>1/42) Q.slow+=dt*2; else Q.slow=Math.max(0,Q.slow-dt);
  if(Q.slow>3){ setQuality(Q.level-1); Q.auto=true; }
}
const deepOn=()=>QUALITY[Q.level].deep&&!!POST.rt&&!!POST.rt.depthTexture;

/* ---------- post-processing ---------- */
/* The scene is drawn into a texture, and on full quality its depth is kept as well. Wherever a surface wrote an alpha
   below one it is treated as a light (see the note on materials in a_art.js): those pixels are copied into a chain of
   ever smaller textures and added back on the way up, which is all a bloom is. From the depth come three more things:
   a soft shade wherever surfaces meet (aoMat), a blur that grows with distance from the lane Blorp walks in, and shafts
   of light where the sun is hidden by something near (the ray passes). The last pass puts it all together, bends the
   picture for ripples, heat and water, dims a dark level to the light Blorp and the lamps give, grades it, and
   darkens the corners. */
const POST={rt:null,down:[],up:[],tilt:[],ao:null,ray:[],refl:null,w:0,h:0,n:-1,deep:false,
  bloom:0.95,hi:0.22,sat:1.06,con:1.03,vig:0.42,tilt_:0,tiltY:0.5,flash:0,tint:new T.Color(1,1,1),
  ao_:0.8,dof:0.55,dofA:9,dofB:70,rays:0.5,dark:0,darkAmb:new T.Color(0.16,0.17,0.3),wob:0,ca:0,grain:0.012,shadow:new T.Color(1,1,1),high:new T.Color(1,1,1)};
const fsCam=new T.OrthographicCamera(-1,1,1,-1,0,1), fsScene=new T.Scene(), fsQuad=new T.Mesh(new T.PlaneGeometry(2,2),null);
fsQuad.frustumCulled=false; fsScene.add(fsQuad);
const FS_V='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
const fsMat=(uniforms,frag,extra)=>new T.ShaderMaterial(Object.assign({uniforms,vertexShader:FS_V,fragmentShader:frag,depthTest:false,depthWrite:false,fog:false},extra||{}));
const TAP4='(S(vec2(-1.0,-1.0))+S(vec2(1.0,-1.0))+S(vec2(-1.0,1.0))+S(vec2(1.0,1.0)))*0.25';
const LIN='float lin(float d){ return uNear*uFar/(uFar-d*(uFar-uNear)); }';
const brightMat=fsMat({t:{value:null},px:{value:new T.Vector2()},uHi:{value:0.2}},
  'uniform sampler2D t; uniform vec2 px; uniform float uHi; varying vec2 vUv; vec3 S(vec2 o){ vec4 c=texture2D(t,vUv+o*px); float l=dot(c.rgb,vec3(0.3,0.59,0.11)); return c.rgb*((1.0-c.a)+uHi*smoothstep(0.86,1.0,l)); } void main(){ gl_FragColor=vec4('+TAP4+',1.0); }');
const downMat=fsMat({t:{value:null},px:{value:new T.Vector2()}},
  'uniform sampler2D t; uniform vec2 px; varying vec2 vUv; vec3 S(vec2 o){ return texture2D(t,vUv+o*px).rgb; } void main(){ gl_FragColor=vec4('+TAP4+',1.0); }');
const upMat=fsMat({t:{value:null},b:{value:null},px:{value:new T.Vector2()}},
  'uniform sampler2D t,b; uniform vec2 px; varying vec2 vUv; vec3 S(vec2 o){ return texture2D(t,vUv+o*px).rgb; } void main(){ gl_FragColor=vec4(texture2D(b,vUv).rgb+'+TAP4+',1.0); }');
/* shade in the corners: for each pixel, eight looks at its neighbourhood, each asking how much of the sky that neighbour hides */
const aoMat=fsMat({td:{value:null},px:{value:new T.Vector2()},uNear:{value:1},uFar:{value:200},uTan:{value:new T.Vector2(1,1)},uR:{value:0.75}},
  `uniform sampler2D td; uniform vec2 px,uTan; uniform float uNear,uFar,uR; varying vec2 vUv;
   ${LIN}
   vec3 vpos(vec2 uv){ float z=lin(texture2D(td,uv).x); return vec3((uv*2.0-1.0)*uTan*z,-z); }
   void main(){
     float d0=texture2D(td,vUv).x; if(d0>=0.9999){ gl_FragColor=vec4(1.0); return; }
     vec3 P=vpos(vUv), Pr=vpos(vUv+vec2(px.x,0.0)), Pl=vpos(vUv-vec2(px.x,0.0)), Pu=vpos(vUv+vec2(0.0,px.y)), Pd=vpos(vUv-vec2(0.0,px.y));
     vec3 dx=abs(Pr.z-P.z)<abs(P.z-Pl.z)?Pr-P:P-Pl, dy=abs(Pu.z-P.z)<abs(P.z-Pd.z)?Pu-P:P-Pd;
     vec3 N=normalize(cross(dx,dy));
     vec2 ruv=0.5*uR/(-P.z*uTan);
     float a=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))))*6.2832, occ=0.0;
     for(int i=0;i<8;i++){ float fi=float(i)+0.5, r=sqrt(fi/8.0), th=a+fi*2.39996;
       vec3 v=vpos(vUv+vec2(cos(th),sin(th))*r*ruv)-P; float d2=dot(v,v)+0.0001;
       occ+=max(0.0,dot(N,v)/sqrt(d2)-0.12)/(1.0+d2/(uR*uR)*1.6); }
     gl_FragColor=vec4(vec3(clamp(1.0-occ*0.3,0.0,1.0)),1.0);
   }`);
/* shafts of light: a glow where the sun is, cut out by whatever stands nearer than the far scenery, then smeared away from the sun three times over */
const rayMaskMat=fsMat({td:{value:null},uNear:{value:1},uFar:{value:200},uSun:{value:new T.Vector2(0.8,0.7)},uAspect:{value:1.78},uCut:{value:60},uCol:{value:new T.Color(1,1,1)}},
  `uniform sampler2D td; uniform float uNear,uFar,uAspect,uCut; uniform vec2 uSun; uniform vec3 uCol; varying vec2 vUv;
   ${LIN}
   void main(){ float z=lin(texture2D(td,vUv).x); float r=length((vUv-uSun)*vec2(uAspect,1.0));
     float g=exp(-r*r*9.0)*0.6+exp(-r*2.6)*0.14; gl_FragColor=vec4(uCol*g*smoothstep(uCut*0.8,uCut,z),1.0); }`);
const rayBlurMat=fsMat({t:{value:null},uSun:{value:new T.Vector2(0.8,0.7)},uStep:{value:0.01}},
  `uniform sampler2D t; uniform vec2 uSun; uniform float uStep; varying vec2 vUv;
   void main(){ vec2 d=(uSun-vUv)*uStep; vec3 c=vec3(0.0); float w=1.0, tw=0.0; vec2 uv=vUv;
     for(int i=0;i<6;i++){ c+=texture2D(t,uv).rgb*w; tw+=w; w*=0.9; uv+=d; }
     gl_FragColor=vec4(c/tw,1.0); }`);
const compMat=fsMat({t:{value:null},td:{value:null},tb:{value:null},tt:{value:null},tao:{value:null},tr:{value:null},
    uBloom:{value:1},uSat:{value:1},uCon:{value:1},uVig:{value:0.4},uTilt:{value:0},uTiltY:{value:0.5},uFlash:{value:0},uTint:{value:POST.tint},uTime,uAspect:{value:1.78},
    uDeep:{value:0},uNear:{value:1},uFar:{value:200},uFocus:{value:23},uDof:{value:0.5},uDofA:{value:9},uDofB:{value:70},uAO:{value:0.8},aoPx:{value:new T.Vector2()},uRays:{value:0},
    uDark:{value:0},uDarkAmb:{value:POST.darkAmb},uLights:{value:[0,1,2,3,4,5].map(()=>new T.Vector4(0,0,0,0))},
    uWob:{value:0},uRip:{value:[new T.Vector4(0,0,0,0),new T.Vector4(0,0,0,0)]},uCA:{value:0},uGrain:{value:0.012},uShadow:{value:POST.shadow},uHigh:{value:POST.high}},
  `uniform sampler2D t,td,tb,tt,tao,tr; uniform float uBloom,uSat,uCon,uVig,uTilt,uTiltY,uFlash,uTime,uAspect,uDeep,uNear,uFar,uFocus,uDof,uDofA,uDofB,uAO,uRays,uDark,uWob,uCA,uGrain;
   uniform vec3 uTint,uDarkAmb,uShadow,uHigh; uniform vec2 aoPx; uniform vec4 uLights[6]; uniform vec4 uRip[2]; varying vec2 vUv;
   ${LIN}
   float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
   void main(){
     vec2 uv=vUv, asp=vec2(uAspect,1.0);
     if(uWob>0.0) uv+=vec2(sin(uv.y*34.0+uTime*2.6),cos(uv.x*27.0+uTime*2.1))*uWob;
     for(int i=0;i<2;i++){ vec4 q=uRip[i]; if(q.w>0.0){ vec2 dv=(uv-q.xy)*asp; float l=length(dv)+0.0001, k=l-q.z; uv+=dv/l*exp(-k*k*700.0)*q.w/asp; } }
     vec4 s=texture2D(t,uv); vec3 c=s.rgb;
     if(uCA>0.0){ vec2 q=(uv-0.5)*uCA; c.r=texture2D(t,uv+q).r; c.b=texture2D(t,uv-q).b; }
     float blur=uTilt>0.0?uTilt*smoothstep(0.16,0.5,abs(vUv.y-uTiltY)):0.0;
     if(uDeep>0.0){
       float d=texture2D(td,uv).x, z=lin(d), solid=1.0-step(0.9999,d);
       float ao=(texture2D(tao,uv+aoPx).r+texture2D(tao,uv-aoPx).r+texture2D(tao,uv+vec2(aoPx.x,-aoPx.y)).r+texture2D(tao,uv+vec2(-aoPx.x,aoPx.y)).r)*0.25;
       c*=mix(1.0,ao,uAO*s.a*solid*(1.0-smoothstep(uFocus+18.0,uFocus+60.0,z)));
       blur=max(blur,solid*uDof*max(smoothstep(uFocus+uDofA,uFocus+uDofB,z),smoothstep(uFocus-3.0,uFocus-9.0,z)*1.2));
     }
     if(blur>0.0) c=mix(c,texture2D(tt,uv).rgb,min(blur,1.0));
     if(uDark>0.0){ float L=0.0; for(int i=0;i<6;i++){ vec4 q=uLights[i]; if(q.w>0.0){ float l=length((vUv-q.xy)*asp); L+=q.w*(1.0-smoothstep(q.z*0.3,q.z,l)); } }
       c*=mix(vec3(1.0),mix(uDarkAmb,vec3(1.0),min(L,1.0)),uDark*s.a); }
     c+=texture2D(tb,uv).rgb*uBloom;
     if(uRays>0.0) c+=texture2D(tr,vUv).rgb*uRays;
     float l=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(l),c,uSat); c=(c-0.5)*uCon+0.5;
     c*=mix(uShadow,uHigh,smoothstep(0.1,0.85,l)); c*=uTint;
     vec2 q=vUv-0.5; c*=1.0-uVig*dot(q,q)*1.5; c+=(hash(vUv*913.0+fract(uTime)*37.0)-0.5)*uGrain; c+=uFlash;
     gl_FragColor=vec4(c,1.0);
   }`);
/* the wipe between screens: a round hole in a sheet of ink, closing on a point, and a plain fade */
const wipe={iris:2,x:0.5,y:0.5,fade:0};
const wipeMat=fsMat({uIris:{value:2},uC:{value:new T.Vector2(0.5,0.5)},uAspect:{value:1.78},uFade:{value:0}},
  'uniform float uIris,uAspect,uFade; uniform vec2 uC; varying vec2 vUv; void main(){ float r=length((vUv-uC)*vec2(uAspect,1.0)); float a=max(uFade,step(uIris,r)); float rim=step(uIris-0.012,r)*(1.0-step(uIris,r)); gl_FragColor=vec4(mix(vec3(0.11,0.07,0.2),vec3(1.0,0.79,0.16),rim),max(a,rim)); }',
  {transparent:true});
function fsPass(mat,target){ fsQuad.material=mat; renderer.setRenderTarget(target); renderer.render(fsScene,fsCam); }
function mkRT(w,h,depth,ms,dtex){
  const o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,depthBuffer:depth,stencilBuffer:false};
  const two=renderer.capabilities.isWebGL2;
  let r; if(ms&&two&&T.WebGLMultisampleRenderTarget){ r=new T.WebGLMultisampleRenderTarget(w,h,o); r.samples=4; } else r=new T.WebGLRenderTarget(w,h,o);
  if(dtex&&two&&T.DepthTexture){ const d=new T.DepthTexture(w,h); d.type=T.UnsignedIntType; d.format=T.DepthFormat; d.minFilter=d.magFilter=T.NearestFilter; r.depthTexture=d; }
  return r;
}
function sizePost(w,h){
  const q=QUALITY[Q.level];
  if(POST.w===w&&POST.h===h&&POST.n===q.bloomN&&POST.deep===q.deep) return;
  for(const r of [POST.rt,POST.ao,POST.refl,...POST.down,...POST.up,...POST.tilt,...POST.ray]) if(r){ if(r.depthTexture) r.depthTexture.dispose(); r.dispose(); }
  POST.w=w; POST.h=h; POST.n=q.bloomN; POST.deep=q.deep; POST.rt=null; POST.ao=null; POST.refl=null; POST.down=[]; POST.up=[]; POST.tilt=[]; POST.ray=[];
  if(!POST.n) return;
  const half=(k)=>[Math.max(2,Math.round(w/k)),Math.max(2,Math.round(h/k))];
  POST.rt=mkRT(w,h,true,true,q.deep);
  for(let i=0;i<POST.n;i++){ const s=half(2<<i); POST.down.push(mkRT(s[0],s[1],false)); if(i<POST.n-1) POST.up.push(mkRT(s[0],s[1],false)); }
  POST.tilt=[mkRT(half(2)[0],half(2)[1],false),mkRT(half(4)[0],half(4)[1],false)];
  if(q.deep){ POST.ao=mkRT(half(2)[0],half(2)[1],false); POST.ray=[mkRT(half(4)[0],half(4)[1],false),mkRT(half(4)[0],half(4)[1],false)]; POST.refl=mkRT(half(2)[0],half(2)[1],true); }
}
/* rings that bend the picture as they spread: a ground pound, a blast, a boss landing */
const RIPS=[{t:9,life:1,x:0,y:0,z:0,amp:0,size:0},{t:9,life:1,x:0,y:0,z:0,amp:0,size:0}];
function ripple(x,y,amp,size,life){ if(reduceMotion) return; const r=RIPS[0].t>=RIPS[0].life||RIPS[0].t>RIPS[1].t?RIPS[0]:RIPS[1]; r.t=0; r.life=life||0.55; r.x=x; r.y=y; r.z=0; r.amp=amp||0.02; r.size=size||0.5; }
/* the frame's passing effects, called once a frame with the real time gone by */
function postTick(dt){
  for(const r of RIPS) if(r.t<r.life) r.t+=dt;
  POST.flash=Math.max(0,POST.flash-dt*1.6); POST.ca=Math.max(0,POST.ca-dt*0.05);
  skyU.uBolt.value=Math.max(0,skyU.uBolt.value-dt*3.2);
}
/* Hooks the level fills in: one draws the mirror image the water shows (e_world.js), one lists the lights that hold back
   the dark, as [screen x, screen y, radius, strength]. */
let reflectPass=null, darkLights=null;
function renderFrame(){
  renderer.info.reset();
  const post=QUALITY[Q.level].post&&POST.rt, deep=post&&deepOn();
  if(deep&&reflectPass) reflectPass();
  if(!post){ renderer.setRenderTarget(null); renderer.render(scene,camera); }
  else {
    renderer.setRenderTarget(POST.rt); renderer.render(scene,camera);
    const D=POST.down, U=POST.up, n=D.length;
    brightMat.uniforms.t.value=POST.rt.texture; brightMat.uniforms.px.value.set(1/POST.w,1/POST.h); brightMat.uniforms.uHi.value=POST.hi; fsPass(brightMat,D[0]);
    for(let i=1;i<n;i++){ downMat.uniforms.t.value=D[i-1].texture; downMat.uniforms.px.value.set(1/D[i-1].width,1/D[i-1].height); fsPass(downMat,D[i]); }
    let low=D[n-1];
    for(let i=n-2;i>=0;i--){ upMat.uniforms.t.value=low.texture; upMat.uniforms.b.value=D[i].texture; upMat.uniforms.px.value.set(0.5/low.width,0.5/low.height); fsPass(upMat,U[i]); low=U[i]; }
    const cu=compMat.uniforms, dofOn=deep&&POST.dof>0;
    if(POST.tilt_>0||dofOn){
      downMat.uniforms.t.value=POST.rt.texture; downMat.uniforms.px.value.set(1/POST.w,1/POST.h); fsPass(downMat,POST.tilt[0]);
      downMat.uniforms.t.value=POST.tilt[0].texture; downMat.uniforms.px.value.set(1/POST.tilt[0].width,1/POST.tilt[0].height); fsPass(downMat,POST.tilt[1]);
      cu.tt.value=POST.tilt[1].texture;
    }
    let rays=0;
    if(deep){
      const dt_=POST.rt.depthTexture, tanY=Math.tan(camera.fov*Math.PI/360), au=aoMat.uniforms;
      au.td.value=dt_; au.px.value.set(1/POST.ao.width,1/POST.ao.height); au.uNear.value=camera.near; au.uFar.value=camera.far; au.uTan.value.set(tanY*camera.aspect,tanY);
      if(POST.ao_>0) fsPass(aoMat,POST.ao);
      /* shafts only while the sun is on the screen or just off it */
      const sp=skyU.sunPos.value, on=clamp(1.5-Math.max(Math.abs(sp.x-0.5),Math.abs(sp.y-0.5))*1.6,0,1); rays=POST.rays*on;
      if(rays>0.01){ const mu=rayMaskMat.uniforms, bu=rayBlurMat.uniforms, R=POST.ray;
        mu.td.value=dt_; mu.uNear.value=camera.near; mu.uFar.value=camera.far; mu.uSun.value.copy(sp); mu.uAspect.value=camera.aspect; mu.uCut.value=POST.rayCut||camDist+34; mu.uCol.value.copy(skyU.sunCol.value); fsPass(rayMaskMat,R[0]);
        bu.uSun.value.copy(sp);
        bu.t.value=R[0].texture; bu.uStep.value=0.006; fsPass(rayBlurMat,R[1]);
        bu.t.value=R[1].texture; bu.uStep.value=0.036; fsPass(rayBlurMat,R[0]);
        bu.t.value=R[0].texture; bu.uStep.value=0.12; fsPass(rayBlurMat,R[1]);
        cu.tr.value=R[1].texture; }
      cu.td.value=dt_; cu.tao.value=POST.ao.texture; cu.aoPx.value.set(0.75/POST.ao.width,0.75/POST.ao.height);
      cu.uNear.value=camera.near; cu.uFar.value=camera.far; cu.uFocus.value=POST.focus||camDist; cu.uDof.value=POST.dof; cu.uDofA.value=POST.dofA; cu.uDofB.value=POST.dofB; cu.uAO.value=POST.ao_;
    }
    cu.uDeep.value=deep?1:0; cu.uRays.value=rays>0.01?rays:0;
    cu.t.value=POST.rt.texture; cu.tb.value=low.texture; cu.uBloom.value=POST.bloom/Math.sqrt(n); cu.uSat.value=POST.sat; cu.uCon.value=POST.con; cu.uVig.value=POST.vig;
    cu.uTilt.value=POST.tilt_; cu.uTiltY.value=POST.tiltY; cu.uFlash.value=POST.flash; cu.uAspect.value=camera.aspect; cu.uWob.value=reduceMotion?0:POST.wob; cu.uCA.value=POST.ca; cu.uGrain.value=POST.grain;
    for(let i=0;i<2;i++){ const r=RIPS[i], q=cu.uRip.value[i];
      if(r.t<r.life){ const s=screenOf(r.x,r.y,r.z), u=r.t/r.life; q.set(s[0],s[1],u*r.size,r.amp*(1-u)*(1-u)); } else q.set(0,0,0,0); }
    cu.uDark.value=POST.dark;
    if(POST.dark>0){ const ls=darkLights?darkLights():[]; for(let i=0;i<6;i++){ const q=cu.uLights.value[i], l=ls[i]; if(l) q.set(l[0],l[1],l[2],l[3]); else q.set(0,0,0,0); } }
    fsPass(compMat,null);
  }
  if(wipe.iris<1.5||wipe.fade>0){
    const u=wipeMat.uniforms; u.uIris.value=wipe.iris; u.uC.value.set(wipe.x,wipe.y); u.uFade.value=wipe.fade; u.uAspect.value=camera.aspect;
    renderer.autoClear=false; fsPass(wipeMat,null); renderer.autoClear=true;
  }
  renderer.setRenderTarget(null);
  glowSeen.length=0;
}
/* where a point in the world lands on the screen, 0 to 1 each way: the wipe closes on Blorp with this */
const _pv=new T.Vector3();
function screenOf(x,y,z){ _pv.set(x,y,z).project(camera); return [clamp(_pv.x*0.5+0.5,0,1),clamp(_pv.y*0.5+0.5,0,1)]; }
/* the same, but free to leave the screen: for things that fade in from its edges */
function screenAt(x,y,z){ _pv.set(x,y,z).project(camera); return [_pv.x*0.5+0.5,_pv.y*0.5+0.5]; }
