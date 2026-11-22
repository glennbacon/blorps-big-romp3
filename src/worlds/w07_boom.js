/* ================= World 7: Boombox Boulevard ================= */
/* A street made of music, at a party that starts at sunset and is all lit up by the last level. The pavement is a
   keyboard, the buildings are speaker stacks and cassettes, records turn on the walls, a glitter ball hangs where the
   sun should be, and an equaliser rises and falls along the skyline in time with the tune. The pits hold nothing but
   the bass, which glows and is the end of whoever falls in.
   What is new here is the beat: the red and blue blocks change over by the clock, once a bar (the tune is written at
   exactly 120 so that a bar is two seconds), and the lasers keep the same time. Drums are the bouncy blocks, tape is
   the belt, speakers blow, and a note hops on the beat. */

/* ---------- the tune ---------- */
/* @song */
/* A minor, funk-pop at exactly 120 on a grid of sixteenths: a bright square lead that leans on the off-beats, a plucked
   bass with a line of its own, a clavinet picking at the chords, stabs, a clap on two and four and hats all the way.
   The middle eight turns to A major and four on the floor, and E7 drags it back to the minor. */
SONGS.boom=(()=>{
  const h='E5 . . G5 . . A5 - - . C6 . A5 . G5 .  A5 - - - . . E5 . G5 . A5 . . . . .  F5 . . A5 . . D6 - - . C6 . A5 . F5 .  A5 - - - . . D5 . F5 . A5 . C6 . D6 . ';
  const e1='C6 . . A5 . . C6 - - . A5 . F5 . A5 .  D6 . . B5 . . D6 - - . B5 . G5 . B5 .  E6 - - D6 . C6 . A5 - - . . C6 . D6 .  E6 - - - . . B5 . G#5 . B5 . E5 - . . ';
  const e2='C6 . . A5 . . C6 - - . A5 . F5 . A5 .  D6 . . B5 . . D6 - - . E6 . D6 . B5 .  A5 - - - . . E5 . A5 . C6 . E6 . A6 .  A6 - - - - - . . . . . . E5 G5 A5 B5 ';
  const b='C#6 - - - E6 - - - A6 - - . E6 . C#6 .  E6 - - - - - C#6 - A5 - - - . . . .  D6 - - - F#6 - - - A6 - - . F#6 . D6 .  F#6 - - - - - D6 - A5 - - - . . A5 B5  '+
    'C#6 - - . C#6 . A5 . F#5 - - . A5 . C#6 .  D6 - - . D6 . A5 . F#5 - - . A5 . D6 .  E6 - - . E6 . B5 . G#5 - - . B5 . E6 .  G#6 - - - E6 - - - D6 - - - B5 - G#5 - ';
  const a=h+e1, a2=h+e2;
  const cA='Am7 Am7 Dm7 Dm7 F G Am7 E7  Am7 Am7 Dm7 Dm7 F G Am Am', cB='A A D D F#m D E E7', cC='Am7 Am7 Dm7 Dm7 F G Am Am';
  const pA='1 - . 1 . 8 . . 1 . . 7 8 . 5 .', pB='1 . 8 . 1 . 8 . 1 . 8 . 1 . 8 5';
  const sA='. . x . . . . X . . . . x . . .', sB='x . . x . . x . . . x . . x . .';
  const dA='kh h h h psh h h kh h h kh h psh h o h ', dX='kxh h h h psh h h kh h h kh h psh h o h ', dF='kh h h h psh h h kh h h psh h ps ps m l ';
  const dB='k h o h kps h o h k h o h kps h o h ', dY='kx h o h kps h o h k h o h kps h o h ', dG='k h o h kps h o h k h kps h ps ps m l ';
  return song({key:'A minor',bpm:120,spb:4,ec:0.75,fb:0.26},
    [{w:'square',v:0.046,det:8,vib:8,s:0.6,g:0.85,e:1,r:0.2},a+a2+b+a2],
    [{w:'square',v:0.018,g:0.4,lp:[9,2],pan:0.35},musArp(cA+' '+cB+' '+cC,16,'. 5 . 8 5 . 3^ . . 5 8 . 5 . 3^ .','A3')],
    [{w:'sawtooth',v:0.017,g:0.55,lp:[5,1.3],pan:-0.3,r:0.35},musChord(cA,16,sA,'A3')+' '+musChord(cB,16,sB,'A3')+' '+musChord(cC,16,sA,'A3')],
    [{w:'sawtooth',v:0.08,h:1,g:0.75,lp:[6,1.1],q:3},musArp(cA,16,pA,'D2')+' '+musArp(cB,16,pB,'D2')+' '+musArp(cC,16,pA,'D2')],
    [{dr:1,v:0.85},dX+dA.repeat(6)+dF+dA.repeat(7)+dF+dY+dB.repeat(6)+dG+dX+dA.repeat(6)+dF]);
})();
/* @endsong */

/* ---------- models ---------- */
const boomParty=['#ff4fa8','#ffe14d','#3ff0e0','#b58cff','#ff8f3c'];
function boomHash(a){ const s=Math.sin(a*12.9898)*43758.5453; return s-Math.floor(s); }
/* one speaker cabinet, 8 wide and 11 tall: a woofer, a tweeter and a strip of trim. c is the cabinet, g the cones */
function boomSpeaker(c,g){ const d=shade(c,0.6), k='#1c1233'; g=g||'#ff4fa8'; return [
  [-4,0,-3,8,11,6,c],[-4,10.4,-3,8,0.6,6.1,shade(c,1.25)],[-4,0,3,8,0.6,0.2,d],
  [-3,1.2,3,6,5.2,0.25,k],[-2.4,0.6,3,4.8,6.4,0.25,k],[-2,2,3.25,4,3.6,0.2,g],[-0.9,2.9,3.45,1.8,1.8,0.2,shade(g,1.3)],
  [-1.6,7.6,3,3.2,2.2,0.25,k],[-0.8,8.1,3.25,1.6,1.2,0.2,g]]; }
/* two or three of them, stood on one another */
function boomStackM(R){ const cs=['#7a5cf0','#d04aa0','#3a3090','#2fa8c0','#e0902e'], n=2+((R()*2)|0), b=[]; let y=0;
  for(let i=0;i<n;i++){ const k=i?0.82:1.05; for(const q of scaled(boomSpeaker(pick(R,cs),pick(R,boomParty)),k)) b.push([q[0],q[1]+y,q[2],q[3],q[4],q[5],q[6]]); y+=11*k; }
  return b; }
/* a street lamp bent like a note; its head is a light, added where it is stood */
function boomLampM(){ const k='#2c2466', d='#1c1233'; return [[-0.5,0,-0.5,1,13,1,k],[-1.4,0,-1.4,2.8,0.8,2.8,d],[-0.5,12.2,-0.5,3.6,0.8,1,k],[2.3,10.4,-0.5,0.8,2,1,k]]; }
/* a cassette stood on its edge, as big as a shop sign */
function boomTape(c){ const d=shade(c,0.7), k='#1c1233'; return [[-6,0,-1,12,8,2,c],[-6,7.4,-1,12,0.6,2.1,shade(c,1.25)],
  [-5,3.2,1,10,4,0.2,'#fff3d6'],[-5,5.9,1.2,10,0.5,0.1,'#ff4fa8'],[-5,5.1,1.2,10,0.4,0.1,'#ffb02e'],
  [-3.8,3.4,1.2,7.6,1.4,0.15,k],[-3.2,3.6,1.35,1,1,0.1,WHITE],[2.2,3.6,1.35,1,1,0.1,WHITE],
  [-3.6,0,1,7.2,2.2,0.2,d],[-2.6,0.7,1.2,0.7,0.7,0.1,k],[1.9,0.7,1.2,0.7,0.7,0.1,k]]; }
/* a boombox left on the pavement */
function boomBoxM(c){ const d=shade(c,0.65), k='#1c1233', g='#c9d2e2'; return [[-6,0,-2,12,5.6,4,c],[-6,5.2,-2,12,0.4,4.1,shade(c,1.25)],
  [-5.4,0.8,2,3.6,3.6,0.2,k],[-4.6,1.6,2.2,2,2,0.2,g],[1.8,0.8,2,3.6,3.6,0.2,k],[2.6,1.6,2.2,2,2,0.2,g],
  [-1.4,1,2,2.8,2,0.2,'#fff3d6'],[-1.4,3.5,2,2.8,0.9,0.2,k],[-5,4.6,2,1,0.5,0.25,'#ffe14d'],[4,4.6,2,1,0.5,0.25,'#ff4f7b'],
  [-4.4,5.6,-0.4,0.6,1.4,0.8,d],[3.8,5.6,-0.4,0.6,1.4,0.8,d],[-4.4,7,-0.4,8.8,0.6,0.8,d]]; }
/* a neon sign on a post: the board, and what is lit on it */
function boomNeonM(){ return [[-0.5,0,-0.5,1,6,1,'#2c2466'],[-5,6,-0.6,10,7,1.2,'#1c1233'],[-5.4,5.6,-0.8,10.8,0.6,1.6,'#3a2f80'],[-5.4,12.8,-0.8,10.8,0.6,1.6,'#3a2f80']]; }
function boomNeonG(kind,c){ const z=0.7, d=0.3;
  if(kind===0) return [[-2.6,7.2,z,2.6,2,d,c],[-0.6,8.2,z,0.6,4,d,c],[0,11.4,z,2.2,0.7,d,c],[1.6,9.8,z,0.6,1.6,d,c]];
  if(kind===1){ const hs=[2,4,3,5,2.5], b=[]; for(let i=0;i<5;i++) b.push([-3.8+i*1.6,7,z,1.1,hs[i],d,boomParty[i]]); return b; }
  if(kind===2) return [[-0.6,7.2,z,1.2,5.2,d,c],[-2.6,9.2,z,5.2,1.2,d,c],[-1.6,8.2,z,3.2,3.2,d,c]];
  return [[-3.8,8,z,1.6,0.8,d,c],[-2.2,8.8,z,1.2,0.8,d,c],[-1,9.6,z,1.2,0.8,d,c],[0.2,10.4,z,1.2,0.8,d,c],[1.4,9.6,z,1.2,0.8,d,c],[2.6,8.8,z,1.2,0.8,d,c]]; }
/* three balloons on strings, tied to a weight: they sway */
function boomBalloons(R){ const b=[[-1.2,0,-1,2.4,1,2,'#3a2f80']];
  for(let i=0;i<3;i++){ const x=(i-1)*2.2+R()-0.5, hh=9+R()*4, c=pick(R,boomParty); b.push([x-0.1,0,-0.1,0.25,hh,0.25,'#e6e0ff'],[x-1.3,hh,-1.2,2.6,3,2.4,c],[x-0.9,hh+3,-0.8,1.8,0.6,1.6,shade(c,1.2)],[x-0.6,hh+1.6,1.2,0.7,0.9,0.15,WHITE]); }
  return b; }
/* a crate of records, and a drum left behind by the band */
function boomCrate(){ const c='#b5793f', d='#8a5a2b', k='#1c1233'; return [[-3,0,-2.5,6,3.4,5,c],[-3,1.2,2.5,6,0.6,0.15,d],[-3,2.6,2.5,6,0.4,0.15,d],
  [-2.2,3.4,-1.8,0.5,2,3.6,k],[-1,3.4,-1.8,0.5,1.6,3.6,'#3a2f66'],[0.2,3.4,-1.8,0.5,2,3.6,k],[1.4,3.4,-1.8,0.5,1.4,3.6,k],[-2.2,3.9,1.2,0.52,1,0.6,'#ff4fa8'],[0.2,3.9,1.2,0.52,1,0.6,'#ffe14d']]; }
function boomDrum(c){ const s='#c9d2e2'; return [[-2,0.6,-2,4,2.6,4,c],[-2.2,3.2,-2.2,4.4,0.4,4.4,'#fff2d6'],[-2.2,0.4,-2.2,4.4,0.4,4.4,'#fff2d6'],
  [-1.8,0,-1.8,0.5,0.6,0.5,s],[1.3,0,-1.8,0.5,0.6,0.5,s],[-1.8,0,1.3,0.5,0.6,0.5,s],[1.3,0,1.3,0.5,0.6,0.5,s],[-0.6,1.4,2,1.2,1.2,0.15,'#ffe14d']]; }
/* a record as big as a cartwheel, seen face on, to be turned about its middle; and the same lying flat */
function boomDisc(){ const k='#15102e', g='#2c2466'; return [[-6,-6,-0.5,12,12,1,k],[-4.4,-7.6,-0.5,8.8,15.2,1,k],[-7.6,-4.4,-0.5,15.2,8.8,1,k],
  [-5,-5,0.5,10,10,0.15,g],[-4.2,-4.2,0.62,8.4,8.4,0.1,k],[-2.6,-2.6,0.7,5.2,5.2,0.2,'#ff4fa8'],[-2.6,0.2,0.88,2.4,2.4,0.1,'#ffe14d'],[-0.5,-0.5,0.9,1,1,0.2,WHITE],
  [5.2,-0.6,0.5,1.6,1.2,0.2,'#c9d2e2'],[-6.8,-0.6,0.5,1.6,1.2,0.2,'#6a5fb0']]; }
function boomDiscFlat(){ return boomDisc().map(q=>[q[0],q[2]+0.5,q[1],q[3],q[5],q[4],q[6]]); }
/* a note of light, to float up from the street */
function boomNoteFx(c){ return [[-1.6,0,-0.5,3,2.2,1,c],[0.8,1.4,-0.5,0.7,5,1,c],[1.5,5.2,-0.5,1.8,1.2,1,c],[2.6,3.8,-0.5,0.7,1.6,1,c]]; }
/* the cone of a speaker that blows, drawn on the face of its two-by-two box */
function boomCone(){ return [[-4,-4,0,8,8,0.3,'#ff4fa8'],[-2.6,-2.6,0.3,5.2,5.2,0.3,'#ff9ad8'],[-1,-1,0.6,2,2,0.3,'#ffe6f6']]; }
/* one bar of the equaliser, in tiles: fourteen lamps, sea green at the foot, yellow, then pink at the top */
function boomEqBar(k){ const b=[], n=14;
  for(let i=0;i<n;i++){ const u=i/(n-1), c=u<0.45?mixc('#2fe0d0','#ffe14d',u/0.45):mixc('#ffe14d','#ff3fa8',(u-0.45)/0.55); b.push([-1.6,i*1.7,-0.3,3.2,1.3,0.6,mixc('#120c38',c,k)]); }
  return b; }
/* far scenery, in tiles: a speaker as big as a house, with a woofer and a tweeter on its face; g is the colour its cones glow */
function boomHouse(far,gf,x,y,z,w,hh,c,g){ const d=3, zf=z+d/2, r=Math.min(w,hh*0.62)*0.36, cy=y+hh*0.4, k='#15102e', tr=r*0.36, ty=y+hh*0.82;
  far.push([x-w/2,y,z-d/2,w,hh,d,c],[x-w/2,y+hh-0.3,z-d/2-0.1,w,0.3,d+0.2,shade(c,1.3)]);
  far.push([x-r,cy-r*0.62,zf,2*r,r*1.24,0.12,k],[x-r*0.62,cy-r,zf,r*1.24,2*r,0.12,k],[x-tr,ty-tr,zf,2*tr,2*tr,0.12,k]);
  gf.push([x-r*0.6,cy-r*0.6,zf+0.13,r*1.2,r*1.2,0.08,g],[x-r*0.22,cy-r*0.22,zf+0.22,r*0.44,r*0.44,0.08,mixc(g,'#ffffff',0.45)],[x-tr*0.5,ty-tr*0.5,zf+0.13,tr,tr,0.08,g]); }
/* and a cassette as big as a floor of flats: label, window, two reels with the light on behind them */
function boomCassette(far,gf,x,y,z,w,c,lit){ const hh=w*0.62, d=2.4, zf=z+d/2, k='#15102e';
  far.push([x-w/2,y,z-d/2,w,hh,d,c],[x-w/2,y+hh-0.25,z-d/2-0.1,w,0.25,d+0.2,shade(c,1.3)]);
  far.push([x-w*0.42,y+hh*0.36,zf,w*0.84,hh*0.52,0.1,'#f4ead6'],[x-w*0.42,y+hh*0.76,zf+0.1,w*0.84,hh*0.07,0.06,'#ff4fa8'],[x-w*0.42,y+hh*0.67,zf+0.1,w*0.84,hh*0.05,0.06,'#ffb02e']);
  far.push([x-w*0.3,y+hh*0.42,zf+0.1,w*0.6,hh*0.2,0.06,k],[x-w*0.3,y,zf,w*0.6,hh*0.2,0.1,shade(c,0.7)]);
  gf.push([x-w*0.24,y+hh*0.45,zf+0.17,w*0.1,hh*0.14,0.05,lit],[x+w*0.14,y+hh*0.45,zf+0.17,w*0.1,hh*0.14,0.05,lit]); }

/* ---------- this world's own creatures ---------- */
/* the record: a saw's rules, a record's looks. Black, a pink label, and chips of light round the rim that show it turning */
function boomRecord(){ const k='#1c1233', g='#3a2f66', b=[[-3.2,-3.2,-0.5,6.4,6.4,1,k],[-2.2,-4.2,-0.5,4.4,8.4,1,k],[-4.2,-2.2,-0.5,8.4,4.4,1,k],
  [-2.8,-2.8,-0.6,5.6,5.6,1.2,g],[-2.2,-2.2,-0.7,4.4,4.4,1.4,k],[-1.4,-1.4,-0.8,2.8,2.8,1.6,'#ff4fa8'],[-1.4,0.2,-0.85,1.2,1.2,1.7,'#ffe14d'],[-0.4,-0.4,-0.9,0.8,0.8,1.8,WHITE]];
  for(let i=0;i<8;i++){ const a=i/8*6.283+0.39, x=Math.cos(a)*4.4, y=Math.sin(a)*4.4; b.push([x-0.7,y-0.7,-0.4,1.4,1.4,0.8,i%2?'#ff4fa8':WHITE]); }
  return b; }
/* the microphone: a Zapbot's rules. A grille for a head, a face, a short handle; the rotor is the Zapbot's own */
function boomMic(){ const s='#c9d2e2', d='#8a94ab', k='#2c2447'; return [
  [-2.6,2.6,-2.6,5.2,4.2,5.2,s],[-2,2.2,-2,4,5,4,s],[-3,3.6,-1.8,6,2.2,3.6,s],[-2.7,4.3,-2.7,5.4,0.5,5.4,d],
  [-1.2,0,-1.2,2.4,2.2,2.4,k],[-1.4,1.6,-1.4,2.8,0.6,2.8,'#ff4fa8'],
  ...eye(-2.1,4.9,2.6,1.8,1.5,0.8,0.9,0.7,0.3),...eye(0.3,4.9,2.6,1.8,1.5,0.8,0.9,0.2,0.3),
  [-1,3,2.6,2,1.1,0.3,'#3a1a4a'],[-0.5,3.2,2.9,1,0.4,0.1,'#ff8fb0'],[-0.3,6.8,-0.3,0.6,0.8,0.6,d]]; }
/* the amp: a Clonk's rules (it waits overhead and drops; its top is safe), in a cabinet with a temper */
function boomAmp(){ const c='#3a2f66', l='#6a5fb0', d='#1c1233';
  const b=[[-8,0,-5,16,16,10,c],[-8,15,-5,16,1,10.1,l],[-8,0,5,16,1,0.2,d],[-8,0,5,1,16,0.2,l],[7,0,5,1,16,0.2,d],
    [-7,12.6,5,14,2,0.3,'#ffe14d'],[-6,13,5.3,1.2,1.2,0.2,d],[-3.6,13,5.3,1.2,1.2,0.2,d],[-1.2,13,5.3,1.2,1.2,0.2,d],[4.6,13,5.3,1.4,1.2,0.2,'#ff4f7b'],
    [-7,1.4,5,14,10.6,0.25,'#54468c'],
    [-5.5,6.8,5.25,3.6,3,0.3,WHITE],[1.9,6.8,5.25,3.6,3,0.3,WHITE],[-4.4,7.2,5.55,1.6,1.6,0.15,INK],[2.8,7.2,5.55,1.6,1.6,0.15,INK],
    [-6,9.8,5.25,4.4,1,0.5,d],[1.6,9.8,5.25,4.4,1,0.5,d],[-2.2,9.2,5.25,1,0.8,0.5,d],[1.2,9.2,5.25,1,0.8,0.5,d],
    [-3,2,5.25,6,3.6,0.3,INK],[-2,2.8,5.55,4,2,0.2,'#ff4fa8'],[-0.8,3.3,5.75,1.6,1,0.15,'#ffd0ec']];
  for(let x=-7;x<7;x+=3.6) b.push([x,-1.6,-3,2.2,1.6,6,'#d5dcea']);
  return b; }
defEnemy('boomamp',Object.assign({},ETYPES.clonk,{mesh:()=>G1('boomamp',boomAmp)}));
/* the note: a quaver with a face, sour green so that it shows against the night */
function boomNote(){ const c='#c8f03c', d='#7fa81e'; return [
  [-3.2,1.2,-2.6,6.4,3.6,5.2,c],[-2.4,0.8,-2,4.8,4.6,4,c],
  [1.8,4.4,-0.6,1.2,6,1.2,d],[3,8.6,-0.6,2.2,1.2,1.2,d],[4.2,7,-0.6,1.2,1.6,1.2,d],
  ...eye(-2.6,2.4,2.6,2,1.8,1,1,0.8,0.3),...eye(0.2,2.4,2.6,2,1.8,1,1,0.2,0.3),
  [-1.2,1.4,2.6,2,0.5,0.2,INK],[-2.7,4.4,2.6,2.2,0.5,0.4,d],[0.1,4.4,2.6,2.2,0.5,0.4,d],
  [-2.6,0,-1.4,1.8,0.8,3,d],[0.8,0,-1.4,1.8,0.8,3,d]]; }
/* It sits still and hops exactly on the beat, twice a bar: `hop` tiles one way, then the same back, for ever. The beat
   is the level's own clock (the one the blocks change by), never the music. Every other hop it sings. */
defEnemy('boomnote',{w:0.75,h:0.8,stomp:true,solo:true,
  init(e,d){ e.hop=d.hop===undefined?2:d.hop; e.dir=d.dir||1; e.ph=0; e.sing=Math.floor(d.x)%5; },
  mesh:()=>G1('boomnote',boomNote),
  tick(e,dt){
    const ph=(L.beat?G.beatT:e.t)%1;
    if(ph<e.ph&&e.onGround){ e.vy=13.5; e.vx=e.dir*e.hop/0.49; e.dir=-e.dir; e.onGround=false;
      if(e.dir<0&&onScreen(e)){ soundAt(e.x); sfx.note(e.sing); e.sing=(e.sing+2)%9; } }
    e.ph=ph;
    walk(e,dt); if(e.onGround) e.vx=0; },
  anim(e,m){ const k=e.onGround?1-0.2*Math.max(0,1-e.ph*5):1+clamp(e.vy,-6,8)*0.03, q=1/Math.sqrt(k); m.scale.set(q,k,q); m.rotation.y=(player.x>e.x?1:-1)*0.6; m.rotation.z=e.onGround?0:-e.vx*0.04; }});

/* one-way ledges here are slabs of keyboard */
SEMI_LOOKS.boomkeys=function(g,part){
  PX(g,'#f4f0ff',0,0,16,16);
  if(part===0){ for(let x=3;x<16;x+=4) PX(g,'#b0a6d8',x,0,1,16); PX(g,'#1c1233',2,0,2,9); PX(g,'#1c1233',10,0,2,9); return; }
  PX(g,'#ffffff',0,0,16,1); for(let x=3;x<16;x+=4) PX(g,'#b0a6d8',x,1,1,6); PX(g,'#1c1233',2,0,2,5); PX(g,'#1c1233',10,0,2,5); PX(g,'#8a80c0',0,7,16,1);
  if(part===2){ PX(g,INK,5,3,1,2); PX(g,INK,8,3,1,2); } };
SEMI_UNDER.boomkeys='#8a80c0';

/* ---------- the looks ---------- */
THEMES.boom={ music:'boom', air:'crowd',
  /* level 1 is magic hour: the sun is down, the glitter ball is up */
  sky:['#3b2385','#c2529e','#ffb46e'], skyMid:0.52, glowCol:0xffc890, sunGlow:0.85, spokes:0.45, stars:0.12,
  cloud:0.34, cloudCol:'#ffb0c8', cloudShade:'#8a4fb0', cloudY:0.66,
  fog:0x7a3f9a, fogNear:16, fogFar:150,
  hemiSky:0xffe2f0, hemiGround:0x7a5ab8, hemiI:0.62, sunI:0.66, sunCol:0xffc8a0, sunDir:[-0.55,0.55,0.5],
  /* the ground is a keyboard: ivory on top, ruled into keys, over a body as dark as a speaker cabinet */
  top:'#f1ecff', topS:['#ffffff','#e6defa','#f8f4ff','#dcd2f4'], dirt:'#2c2466', dirtS:['#241d58','#3d3390','#201a4e'], cap:'#f4f0ff', capL:'#ffffff', capD:'#15102e', stone:true,
  brick:['#a05cf0','#6a2fc0','#d0a8ff'], hard:['#8a8fc0','#c6caf0','#4a4f8a'], pipe:['#f2b632','#ffe9a0','#b9781a','#4a2a08'],
  semi:'boomkeys', plat:['#3fe0a0','#1f9a6a'], dust:'#ffd0f4', back:-6,
  liquid:{kind:'bass',a:'#e0218a',b:'#ffb8ec',op:1,mask:0.4,flow:2.2,glint:'#fff0fa'},
  bounce:{kind:'drum',cols:['#ff8f3c','#ffe14d','#8a3a1a']}, bounceCol:'#ffe9c0', laser:'#ff4f7b',
  disc:['#eef0ff',null,'#4a3f8a'], discX:0.7, bloom:1, hi:0.12, rays:0.4, sat:1.1, con:1.04, vig:0.48,
  grade:{shadow:[0.94,0.9,1.12],high:[1.08,1.0,0.98]},
  skins:{saw:boomRecord,drone:boomMic}, stackCols:['#7a5cf0','#ff4fa8','#ffd23e'],
  eq:0.45, /* how bright the equaliser and the windows are: it grows level by level */
  looks:[null,
    /* early night */
    {sky:['#1d1560','#5a2f9e','#d8559a'],fog:0x4a2a8e,stars:0.5,cloud:0.2,cloudCol:'#b070d8',cloudShade:'#3a2a80',hemiSky:0xd8ccff,hemiGround:0x5a4aa8,hemiI:0.55,sunI:0.5,sunCol:0xd8b8ff,sunDir:[-0.45,0.68,0.5],
      glowCol:0xff9ae0,sunGlow:0.6,eq:0.6,grade:{shadow:[0.9,0.9,1.16],high:[1.06,0.98,1.04]}},
    /* night, with coloured dust in the sky */
    {sky:['#0e0b3c','#2a1f7c','#8a3fb4'],fog:0x2a1f72,stars:0.85,shoot:1,cloud:0,neb:['#ff4fa8','#3fd0ff'],nebI:0.35,hemiSky:0xc4b8ff,hemiGround:0x4a3f9a,hemiI:0.52,sunI:0.46,sunCol:0xc0b0ff,sunDir:[-0.4,0.72,0.5],
      glowCol:0xd0a0ff,sunGlow:0.5,eq:0.75,grade:{shadow:[0.88,0.9,1.18],high:[1.05,0.98,1.06]}},
    /* the small hours: a ribbon of laser light over the roofs */
    {sky:['#07062c','#17135c','#3f2aa0'],fog:0x1c1660,stars:1,shoot:1,cloud:0,band:'#3ff0c8',neb:['#7a5cf0','#3fd0ff'],nebI:0.45,hemiSky:0xb8b0ff,hemiGround:0x40388a,hemiI:0.5,sunI:0.42,sunCol:0xb0b8ff,sunDir:[-0.35,0.76,0.5],
      glowCol:0xa0c0ff,sunGlow:0.45,eq:0.88,vig:0.55,grade:{shadow:[0.86,0.9,1.2],high:[1.04,0.99,1.08]}},
    /* the encore: everything that can be lit is lit */
    {sky:['#150a40','#52219a','#ff5fae'],fog:0x4a2090,stars:0.9,shoot:1,cloud:0,neb:['#ff4fa8','#ffe14d'],nebI:0.5,spokes:0.9,hemiSky:0xf0d0ff,hemiGround:0x6a48b0,hemiI:0.58,sunI:0.5,sunCol:0xffc0f0,sunDir:[-0.45,0.68,0.5],
      glowCol:0xff9ae0,sunGlow:0.9,eq:1,lit:true,bloom:1.1,grade:{shadow:[0.92,0.88,1.16],high:[1.08,0.98,1.04]}}],
  /* The far view. Behind the street a dance floor runs to the horizon, dark squares and lit ones; on it stand speakers
     the size of tower blocks, tower blocks made of cassettes, records turning on walls; beyond them all the equaliser
     rises out of the floor and falls back, four times a second, in time with the tune. Stage lights lean across it,
     notes float up, confetti comes down, and the glitter ball hangs over everything. */
  scenery(S,R){
    const W=S.W, far=S.far, gf=S.glowFar, k=TH.eq||0.5, lit=!!TH.lit, night=(TH.stars||0)>0.3, base=1.5, P=boomParty;
    const dim=(c,t)=>mixc('#17123f',c,clamp(t,0,1));
    far.push([-70,base-9,-112,W+140,9,105.9,'#191446']);
    for(let i=0;i*6<W+132;i++) for(let j=0;j<17;j++){ const x=-66+i*6, z=-12-j*6;
      if((i+j)&1) far.push([x,base,z,6,0.04,6,'#251d64']);
      if(R()<0.04+0.08*k) gf.push([x+0.5,base+0.05,z+0.5,5,0.04,5,dim(pick(R,P),0.3+0.55*k)]); }
    /* the equaliser: every bar is one tall mesh that slides up through the floor and back */
    const bars=[], eg=geo('boomEq'+Math.round(k*100),()=>boomEqBar(k),1);
    for(let x=-58;x<W+58;x+=4.6){ const m=new T.Mesh(eg,MAT.glow); m.position.set(x,base-18,-90); world.add(m); bars.push({m,x}); }
    critters.push({tick(dt,time){ const bt=time*2, n=Math.floor(bt*2), f=bt*2-n;
      for(let i=0;i<bars.length;i++){ const q=bars[i]; if(Math.abs(q.x-camX)>80) continue;
        const a=boomHash(i*3.17+n*1.31), b=boomHash(i*3.17+(n-1)*1.31), w=0.6+0.4*Math.sin(i*0.5+bt*0.7);
        const lv=Math.max((0.25+0.75*a)*(1-0.5*f),(0.25+0.75*b)*0.5*(1-f))*w*(n%2?0.85:1.1);
        q.m.position.y=base-21.3+Math.min(1,lv)*20; } }});
    /* the skyline: speakers as big as tower blocks, dim with distance */
    for(let x=-54;x<W+54;x+=16+R()*13){ const z=-62-R()*16, w=10+R()*7, n=2+((R()*3)|0), c=pick(R,['#2b2170','#33267e','#261c62']), g=dim(pick(R,P),0.25+0.45*k); let y=base;
      for(let i=0;i<n;i++){ const hh=w*(0.85+R()*0.25); boomHouse(far,gf,x,y,z,w,hh,c,g); y+=hh; } }
    /* the middle distance: tower blocks made of cassettes, and stacks of speakers */
    for(let x=-44;x<W+44;x+=14+R()*11){ const z=-28-R()*16;
      if(R()<0.55){ const w=9+R()*4, n=2+((R()*4)|0); let y=base;
        for(let i=0;i<n;i++){ boomCassette(far,gf,x,y,z,w,pick(R,['#5a48c8','#c8409a','#2f9ab8','#d9902e','#4a3aa8']),dim(i%2?'#ffe9a0':'#9ff0ff',0.45+0.55*k)); y+=w*0.62; }
        if(night) gf.push([x-0.2,y,z,0.4,1.4+R()*2,0.4,'#ff4f7b']); }
      else { const w=6+R()*3, n=2+((R()*2)|0), c=pick(R,['#4a3aa8','#5a2f9a','#3a3090']), g=dim(pick(R,P),0.45+0.55*k); let y=base;
        for(let i=0;i<n;i++){ const hh=w*(0.9+R()*0.2); boomHouse(far,gf,x,y,z,w,hh,c,g); y+=hh; } } }
    /* the far side of the street: small stacks, walls with a record turning on each, cassettes, lamps */
    const recs=[];
    for(let x=-18;x<W+18;x+=9+R()*8){ const z=-9-R()*5, t=R();
      if(t<0.3){ const w=3.6+R()*1.6, n=2+((R()*2)|0), c=pick(R,['#6a52e0','#d04aa0','#3a3090','#2fa8c0']), g=dim(pick(R,P),0.55+0.45*k); let y=base;
        for(let i=0;i<n;i++){ boomHouse(far,gf,x,y,z,w,w,c,g); y+=w; } }
      else if(t<0.55){ const hh=7+R()*2; far.push([x-4,base,z-0.6,8,hh,1.2,pick(R,['#3a3090','#4a2f8a','#2c2a78'])],[x-4.3,base+hh,z-0.8,8.6,0.4,1.6,'#6a5fd0']);
        const m=new T.Mesh(geo('boomDisc',boomDisc,0.4),MAT.vox); m.position.set(x,base+hh*0.55,z+0.85); world.add(m); recs.push({m,sp:(0.8+R()*1.2)*(R()<0.5?1:-1)}); }
      else if(t<0.75) boomCassette(far,gf,x,base,z,6.5+R()*2,pick(R,['#5a48c8','#c8409a','#2f9ab8','#d9902e']),dim('#ffe9a0',0.5+0.5*k));
      else { const c=pick(R,P); far.push([x-0.2,base,z-0.2,0.4,6.5,0.4,'#2c2466'],[x-0.2,base+6.3,z-0.2,1.6,0.4,0.4,'#2c2466']); gf.push([x+0.8,base+5.2,z-0.45,1.2,1.1,0.9,dim(c,0.6+0.4*k)]);
        if(night) lamps.push({x:x+1.4,y:base+5.6,z:z+0.6,col:c,power:1.2,reach:9}); } }
    if(recs.length) critters.push({tick(dt,time){ for(const q of recs) q.m.rotation.z=time*q.sp; }});
    /* stage lights */
    for(let x=6;x<W;x+=15+R()*12) S.addShaft(x,base,-10-R()*8,2.4+R()*2,15+R()*6,dim(pick(R,P),0.5+0.5*k),(R()<0.5?-1:1)*(0.2+R()*0.3));
    if(TH.cloud) for(let x=-50;x<W+50;x+=18+R()*16) S.addCloud(x,11+R()*7,-40-R()*40,R,mixc(TH.cloudCol||'#ffffff','#ffffff',0.3));
    /* the glitter ball: a moon with a face, tiled round the rim with little mirrors, hung on a wire */
    skyDisc(TH.disc,null,14.5,1.1);
    { const fb=[], fc=['#ffffff','#c9d6ff','#ff9ae0','#9ff0ff','#ffe9a0','#aeb8e6'];
      for(let i=-4;i<4;i++) for(let j=-4;j<4;j++){ const cx=i+0.5, cy=j+0.5; if(Math.abs(cx)+Math.abs(cy)>5.2||((i+j)&1)) continue; if(Math.abs(cx)<2.8&&cy>-2.6&&cy<2) continue; fb.push([i+0.12,j+0.12,1.02,0.76,0.76,0.08,pick(R,fc)]); }
      fb.push([-0.15,4,0.3,0.3,10,0.3,'#c9d2e2']);
      const mm=new T.MeshBasicMaterial({vertexColors:true,fog:false,opacity:0.5}); mm.userData.tmp=true;
      if(sunMesh) sunMesh.add(new T.Mesh(tmpGeo(voxGeo(fb,1.1)),mm)); }
    /* confetti, near and far; at night a few sparks hang in the air as well */
    S.addWeather('confetti',{n:lit?170:80,cols:P.concat(['#ffffff'])}); S.addWeather('confetti',{n:lit?18:9,z:6,size:[0.3,0.2],box:[46,18,4],cols:P});
    if(night) S.addWeather('star',{n:40,cols:['#ffffff','#ff9ae0','#9ff0ff'],box:[52,20,10],z:-9});
    /* notes that float up from the street behind the lane */
    const fl=[];
    for(let i=0;i<Math.ceil(W/15);i++){ const c=pick(R,P), m=new T.Mesh(geo('boomFx'+c,()=>boomNoteFx(c)),MAT.glow); world.add(m); fl.push({m,x:R()*W,z:-1.8-R()*3.4,ph:R(),sp:0.1+R()*0.08,s:0.5+R()*0.4}); }
    critters.push({tick(dt,time){ for(const q of fl){ const u=(time*q.sp+q.ph)%1, on=Math.abs(q.x-camX)<40; q.m.visible=on; if(!on) continue;
      q.m.position.set(q.x+Math.sin(time*1.1+q.ph*40)*0.7,2.4+u*8,q.z); q.m.rotation.z=Math.sin(time*2+q.ph*20)*0.3; q.m.scale.setScalar(Math.max(0.01,q.s*Math.sin(u*Math.PI))); } }});
    /* the speakers that blow: a cone on the face of each box, thumping on the beat, and a glow on the side the air comes from */
    const cones=[];
    for(const q of (S.L.blow||[])){ const x=q[0], y=q[1], d=q[2];
      S.near.push([x*8+2,y*8+3,8.04,12,10,0.3,'#1c1233'],[x*8+3.5,y*8+1.5,8.04,9,13,0.3,'#1c1233']);
      const m=new T.Mesh(geo('boomCone',boomCone),MAT.glow); m.position.set(x+1,y+1,1.05); world.add(m); cones.push(m);
      S.glow.push([d>0?(x+2)*8:x*8-0.4,y*8+3,-5,0.4,10,10,'#ff9ae0']); }
    if(cones.length) critters.push({tick(dt,time){ const f=(time*2)%1, s=1+0.14*Math.max(0,1-f*3); for(const m of cones) m.scale.set(s,s,1); }});
  },
  /* on the pavement: black keys along the front lip, a chequer of dance floor behind the lane, and what a street party
     leaves standing about: speaker stacks, note lamps, cassettes, boomboxes, neon, balloons, crates of records, drums */
  decor(S,D,R){
    const r=R(), y=D.ty*8, x8=D.x*8, night=(TH.stars||0)>0.3, k=TH.eq||0.5, P=boomParty;
    if(D.wet) return;
    const m7=((D.x%7)+7)%7; if(m7!==2&&m7!==6) S.near.push([x8+2.4,y,9.2,3.2,0.55,3.1,'#1c1233']);
    S.near.push([x8,y,((D.x+D.ty)&1)?-22:-34,8,0.1,10,'#3a2f80']);
    if(R()<0.05+0.1*k) S.glow.push([x8+0.6,y+0.1,R()<0.5?-21.4:-33.4,6.8,0.08,8.8,mixc('#2a2068',pick(R,P),0.45+0.55*k)]);
    if(r<0.05&&D.free(6)&&D.open) put(S.near,boomStackM(R),D.jx(),y,D.zb(2.8,4.8));
    else if(r<0.1&&D.free(4)&&D.open){ const x=D.jx(), z=D.zb(1.7,4.6), c=pick(R,P); put(S.near,boomLampM(),x,y,z); S.glow.push([x+1.4,y+8.2,z-1.1,3,2.4,2.2,c]);
      if(night) lamps.push({x:x/8+0.3,y:D.ty+1.2,z:z/8+0.4,col:c,power:1.3,reach:8}); }
    else if(r<0.14&&D.free(3)&&D.open) put(S.near,boomTape(pick(R,['#5a48c8','#c8409a','#2f9ab8','#d9902e'])),D.jx(),y,D.zb(2.2,5));
    else if(r<0.19&&D.free(3)&&D.open) put(S.near,boomBoxM(pick(R,['#7a5cf0','#ff4fa8','#2fb8c8','#ffb02e'])),D.jx(),y,D.zb(1.9,5));
    else if(r<0.24&&D.free(5)&&D.open){ const x=D.jx(), z=D.zb(3,5.2), c=pick(R,P); put(S.near,boomNeonM(),x,y,z);
      for(const b of boomNeonG((R()*4)|0,c)) S.glow.push([b[0]+x,b[1]+y,b[2]+z,b[3],b[4],b[5],b[6]]);
      if(night&&R()<0.6) lamps.push({x:x/8,y:D.ty+1.2,z:z/8+0.5,col:c,power:1.1,reach:7}); }
    else if(r<0.3&&D.free(5)&&D.open) put(S.flora,boomBalloons(R),D.jx(),y,D.zb(1.6,5),0.45);
    else if(r<0.37&&D.free(2)&&D.open) put(S.near,scaled(boomSpeaker(pick(R,['#7a5cf0','#d04aa0','#3a3090','#2fa8c0']),pick(R,P)),0.7),D.jx(),y,D.zb(1.5,5.2));
    else if(r<0.44) put(S.near,boomCrate(),D.jx(),y,D.zb(1.4,5.2));
    else if(r<0.5) put(S.near,boomDrum(pick(R,['#ff8f3c','#ff4fa8','#3fd0e0'])),D.jx(),y,D.zb(1.3,5.2));
    if(R()<0.16) S.near.push([D.jx(),y,D.zf(),0.9,0.3,0.7,pick(R,P)]);
  }
};

/* ---------- things the levels are built from ---------- */
/* a laser that keeps time: on while the blocks of that colour are solid, and drawn in that colour */
function boomLz(B,x,y,dir,len,sw){ return B.laser(x,y,dir,len,2,0,{sw,col:sw==='red'?'#ff4f7b':'#4d96ff'}); }
/* a speaker that blows: a box two by two with its foot at (x,y), and the air it pushes `len` tiles to one side.
   A push of 11 cannot be walked into from a standstill, only run into; whoever keeps moving hardly feels it. */
function boomBlow(B,x,y,dir,len,hgt){ hgt=hgt||3; B.fill(x,y,x+1,y+1,HARD);
  if(dir>0) B.wind(x+2,y,x+1+len,y+hgt-1,11,0); else B.wind(x-len,y,x-1,y+hgt-1,-11,0);
  (B.L.blow=B.L.blow||[]).push([x,y,dir]); return B; }
/* the walls of a secret room from x0 to x1, and the solid ground that shuts it off from the hut */
function boomRoom(B,x0,x1,top){ return B.fill(x0-4,2,x0-1,top,GROUND).fill(x0,2,x0,top,HARD).fill(x1,2,x1,top,HARD); }

/* 7-1: soundcheck, at magic hour. One new thing at a time, each somewhere safe: drums that play a scale, the first tape,
   two red and two blue blocks over solid ground to watch the beat by, and then the first bridge that keeps time, with a
   post to rest on between the colours. Stairs on the beat near the end are for whoever wants the heart at the top.
   Sparks: over the drums; over the blue middle of the bridge; at the top of the drum room down the pipe. */
function w7l1(){
  const B=LevelBuilder(262,'boom');
  B.room(0,229).room(234,261,0,15,true).beat(2);
  B.ground(0,46).ground(51,100).ground(112,160).ground(165,261);
  B.coins(8,3,3).row(13,5,'B?B').enemy('stack',19).row(23,5,'?M?').row(24,9,'?');
  B.sign(28,'Drums! Each one plays a note. Hold {jump} as you land to bounce high.');
  B.row(31,2,'JJJJJ').coinCol(32,5,3).coinCol(34,5,3).spark(33,10).row(37,8,'===').coins(37,9,3).enemy('boing',42).arc(45,4,6);
  B.row(54,5,'B?B').enemy('stack',58);
  /* the beat, over solid ground */
  B.sign(61,'Red and blue blocks swap on the beat. Three ticks, and they change over.');
  B.row(64,4,'RR').row(68,4,'UU').coins(64,6,2).coins(68,6,2).row(72,7,'===').coins(72,8,3);
  B.sign(76,'Tape runs like a belt. It carries whatever stands on it.');
  B.conveyor(79,88,1,1).coins(80,3,8).enemy('stack',92).row(95,5,'?O?');
  /* the first bridge: red, a post, blue, a post, red */
  B.sign(98,'A bridge on the beat. Wait on a post until the next colour is solid.');
  B.row(101,2,'RRR').fill(104,0,104,2,HARD).row(105,2,'UUU').fill(108,0,108,2,HARD).row(109,2,'RRR');
  B.coins(101,4,3).coins(105,4,3).coins(109,4,3).spark(106,7);
  B.checkpoint(116).row(120,5,'B?B').enemy('batty',125,6,{rx:3}).enemy('stack',129);
  /* two drums, and something hidden for whoever pounds one */
  B.row(133,2,'JJ').coinCol(133,6,3).coinCol(134,9,3).row(134,13,'I');
  B.warp(140,2,'in').enemy('boing',147).warp(153,3,'out',true).enemy('boing',157).arc(159,4,6);
  B.row(168,5,'?M?');
  /* stairs on the beat, over solid ground: a miss is only a fall back to the street */
  B.sign(171,'Stairs on the beat. Jump as the ticks end, and land as the next colour comes.');
  B.row(173,4,'RRR').row(176,6,'UUU').row(179,8,'RRR').row(183,10,'====').row(184,14,'L');
  B.coins(173,6,3).coins(176,8,3).coins(179,10,3).coins(183,12,4);
  B.enemy('stack',177).enemy('stack',189).enemy('batty',192,7,{rx:2});
  B.stairs(198,6).fill(204,2,204,7,HARD);
  B.goal(210);
  /* the drum room: five drums in a row, a scale to play, and the spark on the ledge above the last */
  boomRoom(B,234,261,15);
  B.warp(236,2,'in',true).warp(257,2,'out').row(241,2,'JJJJJ').coinCol(241,5,2).coinCol(242,5,3).coinCol(243,5,4).coinCol(244,5,5).coinCol(245,5,6);
  B.row(248,9,'====').spark(250,10).coins(248,11,4).coinBox(253,3,255,4);
  return B.L;
}

/* 7-2: side B, as night falls. The first notes that hop on the beat, records spinning along their grooves, tape that
   runs against you, a speaker that blows, and the first stairs that have to be climbed on the beat: they are the only
   way over the wall, but they stand on solid ground. Then a long bridge of four colours.
   Sparks: over the second tape; in a cell whose roof comes and goes with the blue; in a nook behind the wall. */
function w7l2(){
  const B=LevelBuilder(258,'boom');
  B.beat(2);
  B.ground(0,40).ground(45,92).ground(107,150).ground(166,206).ground(211,257);
  B.coins(7,3,3).row(11,5,'?O?');
  B.sign(15,'A note hops on the beat, there and back. Count it in, then go by.').enemy('boomnote',19,2,{hop:2});
  B.sign(23,'Records spin along their grooves. Never touch one: jump it.');
  B.conveyor(25,36,1,-1).enemy('saw',27,2,{rx:7,sp:1.3}).coins(26,5,3).coins(32,5,3).arc(39,4,6);
  B.row(48,5,'B?B').enemy('stack',52);
  /* the stairs: red, blue, red, a keyboard, and over the wall */
  B.sign(56,'Stairs on the beat. Jump as the ticks end, and land as the next colour comes.');
  B.row(59,3,'RRR').row(62,5,'UUU').row(65,7,'RRR').row(68,9,'=====').coins(59,5,3).coins(62,7,3).coins(65,9,3).coins(69,11,3);
  B.fill(74,2,77,8,HARD).clear(76,2,77,3).spark(76,2);
  B.enemy('fizzle',81).row(84,5,'?M?').enemy('boomnote',88,2,{hop:2});
  /* two tapes over the bass, each running away from the gap between them, and a record that rides up and down in it */
  B.fill(93,0,93,3,HARD).conveyor(94,98,3,-1).conveyor(101,105,3,1).fill(106,0,106,3,HARD).enemy('saw',99.5,2.5,{ry:5,sp:1.4});
  B.spark(103,7).coins(95,5,3).coins(102,5,3);
  B.checkpoint(110).sign(113,'Speakers blow. Keep running: stop, and you are blown back.');
  boomBlow(B,126,2,-1,6);
  B.coins(120,3,5).row(131,5,'BOB').enemy('stack',134).enemy('fizzle',139).row(144,6,'I');
  /* the long bridge: four colours, three posts */
  B.row(151,2,'RRR').fill(154,0,154,2,HARD).row(155,2,'UUU').fill(158,0,158,2,HARD).row(159,2,'RRR').fill(162,0,162,2,HARD).row(163,2,'UUU');
  B.coins(151,4,3).coins(155,4,3).coins(159,4,3).coins(163,4,3).enemy('batty',158,8,{rx:3,ry:1});
  /* a cell in the way, roofed in blue: walk over it while the roof is there, or drop in for the spark when it is not;
     the step inside is the way out, when the roof next goes */
  B.fill(169,2,169,3,HARD).fill(170,2,170,5,HARD).row(171,5,'UUU').fill(174,2,174,5,HARD).fill(175,2,175,3,HARD).row(173,2,'H').spark(171,3).coins(171,2,2);
  B.row(179,5,'?M?').enemy('boomnote',183,2,{hop:2}).enemy('stack',188);
  B.conveyor(191,201,1,1).enemy('saw',193,2,{rx:7,sp:1.3}).coins(194,5,5);
  /* a speaker at your back, and a gap to be blown across */
  boomBlow(B,203,2,1,7,5);
  B.enemy('fizzle',216).row(219,5,'B?B');
  B.stairs(224,6).fill(230,2,230,7,HARD);
  B.goal(236);
  return B.L;
}

/* 7-3: the bass drop. The pits are wide now: a line of drums crosses the first, a launch pod the second, and drums with
   a red floor and a blue one the last. Amps wait overhead, microphones shoot straight across, and the first lasers
   keep time with the blocks: each is shown beside a block of its own colour, on solid ground, before it matters.
   Sparks: high over the middle drum; on a ledge only the upright pod reaches; at the top of the stairs down the pipe. */
function w7l3(){
  const B=LevelBuilder(292,'boom');
  B.room(0,259).room(264,291,0,15,true).beat(2);
  B.ground(0,30).ground(49,90).ground(99,108).ground(116,160).ground(181,291);
  B.coins(6,3,3).row(9,5,'?O?').enemy('stack',14);
  B.sign(17,'An amp drops when you walk under it. Let it fall, then go. Its top is safe.');
  B.enemy('boomamp',22,7).enemy('boomamp',27,8);
  /* the drum line: three pairs on posts in the bass */
  B.fill(33,0,34,2,HARD).row(33,3,'JJ').fill(38,0,39,2,HARD).row(38,3,'JJ').fill(43,0,44,2,HARD).row(43,3,'JJ');
  B.spark(38,10).coins(35,8,3).coins(40,8,3).coinCol(46,5,3);
  B.row(52,5,'B?B').enemy('boomnote',56,2,{hop:2});
  /* lasers, on solid ground: the red one beside red blocks, the blue one beside blue */
  B.sign(60,'A laser keeps time with the blocks: red light while red is solid. Wait for it to go out.');
  boomLz(B,64,8,'d',6,'red'); B.row(66,4,'RR').coins(66,6,2);
  boomLz(B,70,8,'d',6,'blue'); B.row(72,4,'UU').coins(72,6,2);
  B.enemy('fizzle',76).row(80,5,'?M?').enemy('boomamp',84,7);
  /* the pod throws Blorp about fourteen tiles, on to an island with a wall at its far end to stop him sliding off */
  B.sign(87,'A launch pod. Walk in, and hold on!').pod(89,2,40,22);
  B.coins(93,5,1).coins(95,6,1).coins(97,7,1).coins(99,6,1).coins(101,4,1).coins(104,3,3).fill(108,2,108,3,HARD);
  B.row(109,2,'RRR').fill(112,0,112,2,HARD).row(113,2,'UUU').coins(109,4,3).coins(113,4,3);
  B.checkpoint(120);
  B.sign(124,'A microphone hovers level with you, bleeps three times, and shoots straight across. Jump the shot, or stomp the mic.');
  B.enemy('drone',130,5,{ry:2}).enemy('stack',136).enemy('boomamp',141,7).enemy('boomamp',146,8);
  /* a pod that fires straight up: steer right at the top for the ledge */
  B.row(150,5,'?O?').pod(155,2,0,24).coinCol(155,5,6).row(157,10,'====').spark(159,11);
  /* drums and colours: a drum, a red floor, a post to wait on, a blue floor, a drum */
  B.fill(163,0,164,2,HARD).row(163,3,'JJ').row(167,4,'RRRR').fill(171,0,171,4,HARD).row(172,4,'UUUU').fill(177,0,179,2,HARD).row(177,3,'JJJ');
  B.coins(167,6,4).coins(172,6,4);
  B.row(185,5,'BMB').enemy('boomnote',189,2,{hop:2}).enemy('drone',195,6,{ry:2});
  B.warp(200,2,'in').enemy('fizzle',205).warp(210,3,'out',true);
  /* three gates, red, blue, red: one step to a bar */
  B.sign(213,'Step through with the beat.');
  boomLz(B,216,8,'d',6,'red'); boomLz(B,220,8,'d',6,'blue'); boomLz(B,224,8,'d',6,'red');
  B.coins(217,3,3).coins(221,3,3);
  B.stairs(228,6).fill(234,2,234,7,HARD);
  B.goal(240);
  /* a practice room: stairs on the beat over a safe floor, and the spark at the top of them */
  boomRoom(B,264,291,15);
  B.warp(266,2,'in',true).warp(287,2,'out');
  B.row(270,4,'RRR').row(273,6,'UUU').row(276,8,'RRR').row(279,10,'====').spark(281,11).coins(270,6,3).coins(273,8,3).coins(276,10,3).coinBox(283,3,285,4);
  return B.L;
}

/* 7-4: the remix, in the small hours. The colours now come without posts between them, and the stairs go up a tower
   that stands across the street: climb it on the beat, ride the tape off its top past a record, and come down beyond.
   Then a beam along the floor that goes out for one bar in two, a blue floor between two drums, and amps over a tape
   that runs the wrong way.
   Sparks: over the first bridge; at the far end of the high tape; in the hollow under the tower, entered from behind. */
function w7l4(){
  const B=LevelBuilder(234,'boom',18);
  B.beat(2);
  B.ground(0,36).ground(54,128).ground(144,233);
  B.coins(6,3,3).row(10,5,'?O?');
  B.sign(13,'A Rammy charges when it sees you. Jump it, and it knocks itself silly on a wall.');
  B.enemy('rammy',21).fill(27,2,27,3,HARD).enemy('boomnote',29,2,{hop:2});
  /* red straight on to blue: hop over the change. A post after every pair. */
  B.sign(34,'No post between these. Hop as the ticks end, and land on the new colour.');
  B.row(37,2,'RRRUUU').fill(43,0,43,2,HARD).row(44,2,'RRRUUU').fill(50,0,50,2,HARD).row(51,2,'RRR');
  B.coins(37,4,3).coins(40,4,3).coins(44,4,3).coins(47,4,3).coins(51,4,3).spark(41,6);
  B.row(57,5,'B?B').enemy('stack',60);
  /* the tower: three steps on the beat, over solid ground, and a last jump of three on to its top */
  B.sign(63,'Up the tower, on the beat.');
  B.row(67,3,'RRR').row(70,5,'UUU').row(73,7,'RRR').coins(67,5,3).coins(70,7,3).coins(73,9,3);
  B.fill(76,2,86,10,GROUND).clear(80,2,86,4).spark(81,3).coins(82,2,4);
  B.row(78,14,'?O?').enemy('boomamp',83,15);
  /* the high tape, with a record on it, and two blue blocks beyond its end */
  B.conveyor(87,99,10,1).enemy('saw',89,11,{rx:8,sp:1.2}).coins(91,13,3).row(102,10,'UU').spark(102,11);
  B.enemy('stack',93).enemy('fizzle',101).checkpoint(109);
  /* the low beam: stand on its box, and run when it goes out */
  B.sign(112,'When the low beam goes out, run. It comes back on the beat.');
  B.laser(115,2,'r',6,2,0,{sw:'red',col:'#ff4f7b'}).fill(122,2,122,2,HARD).coins(117,3,4);
  /* a drum, a blue floor, a drum: leave on the first tick and the floor is there to land on */
  B.sign(125,'Go on the first tick: the blue floor will be there when you land.');
  B.fill(131,0,132,2,HARD).row(131,3,'JJ').row(135,4,'UUUU').fill(141,0,143,2,HARD).row(141,3,'JJJ').coins(135,6,4);
  B.row(148,5,'?M?').enemy('drone',153,5,{ry:2}).enemy('rammy',158).fill(164,2,164,3,HARD);
  B.conveyor(168,179,1,-1).enemy('boomamp',171,7).enemy('boomamp',176,7).coins(173,3,2);
  B.row(183,5,'B?B').row(184,9,'I').enemy('fizzle',188).enemy('boomnote',192,2,{hop:2});
  B.stairs(198,6).fill(204,2,204,7,HARD);
  B.goal(210);
  return B.L;
}

/* 7-5: the encore, with every light in the street on. The long one: every trick of the beat in turn, each with a sign
   before it. Blocks to watch; a bridge with posts; a bridge without; stairs on the beat to a high road, and a pod off
   the end of it; four lasers in time; the low beam; and last, drums and both colours over the widest pit.
   Sparks: in the sky on the pod's way; high over the middle of the bridge with no posts; above the last drum in the
   room down the pipe. */
function w7l5(){
  const B=LevelBuilder(310,'boom',18);
  B.room(0,277).room(282,309,0,17,true).beat(2);
  B.ground(0,34).ground(46,80).ground(97,123).ground(124,139,9).ground(148,200).ground(219,309);
  B.coins(6,3,3).row(10,5,'?O?').enemy('stack',15).enemy('boomnote',19,2,{hop:2});
  B.sign(23,'The encore! Every trick, one after another. First: red and blue, on the beat.');
  B.row(25,4,'RR').row(28,4,'UU').row(31,4,'RR').coins(25,6,2).coins(28,6,2).coins(31,6,2).row(28,9,'L');
  /* one: a bridge with posts */
  B.row(35,2,'RRR').fill(38,0,38,2,HARD).row(39,2,'UUU').fill(42,0,42,2,HARD).row(43,2,'RRR');
  B.coins(35,4,3).coins(39,4,3).coins(43,4,3).enemy('batty',40,9,{rx:3,ry:1});
  B.row(49,5,'B?B').enemy('fizzle',53).enemy('boomamp',58,7).enemy('boomamp',62,8);
  B.conveyor(66,77,1,-1).enemy('saw',68,2,{rx:7,sp:1.3}).row(70,5,'?M?');
  /* two: no posts, four colours on end, then one post and a last red */
  B.sign(79,'No posts now. Hop as the ticks end.');
  B.row(81,2,'RRRUUURRRUUU').fill(93,0,93,2,HARD).row(94,2,'RRR');
  B.coins(81,4,3).coins(84,4,3).coins(90,4,3).coins(94,4,3).spark(88,7);
  B.fill(100,2,100,3,HARD).enemy('rammy',107);
  /* three: stairs on the beat, over solid ground, to the high road */
  B.sign(111,'Stairs on the beat, to the high road.');
  B.row(115,3,'RRR').row(118,5,'UUU').row(121,7,'RRR').coins(115,5,3).coins(118,7,3).coins(121,9,3);
  B.checkpoint(128,9).row(131,12,'?O?').enemy('stack',135,9);
  /* a pod off the end of the high road: it lands about fourteen tiles on, with a spark at the top of the throw */
  B.pod(138,9,35,18).spark(143,12).coins(140,10,1).coins(141,11,1).coins(146,10,1).coins(148,8,1).coins(150,5,1);
  /* four: lasers in time */
  B.sign(159,'Lasers keep time too. Step through with the beat.');
  boomLz(B,163,8,'d',6,'red'); boomLz(B,167,8,'d',6,'blue'); boomLz(B,171,8,'d',6,'red'); boomLz(B,175,8,'d',6,'blue');
  B.coins(164,3,3).coins(168,3,3).coins(172,3,3).row(179,5,'?M?');
  /* five: the low beam */
  B.sign(181,'And the low beam. Stand on its box, and run when it goes out.');
  B.laser(183,2,'r',6,2,0,{sw:'blue',col:'#4d96ff'}).fill(190,2,190,2,HARD).coins(185,3,4);
  B.enemy('fizzle',193).enemy('stack',196);
  /* six: a drum, red straight on to blue, a post, a drum */
  B.sign(198,'Last one: drums and colours over the bass. Bounce in as red comes.');
  B.fill(203,0,204,2,HARD).row(203,3,'JJ').row(207,4,'RRRUUU').fill(213,0,213,4,HARD).fill(216,0,218,2,HARD).row(216,3,'JJJ').coins(207,6,3).coins(210,6,3);
  B.warp(224,2,'in').enemy('drone',229,6,{ry:2}).warp(234,3,'out',true).enemy('boomnote',238,2,{hop:2}).row(241,5,'BOB');
  B.stairs(246,6).fill(252,2,252,7,HARD);
  B.goal(258);
  /* the after-party: three drums, and the spark on a ledge that only a pound on the last one reaches */
  boomRoom(B,282,309,17);
  B.warp(284,2,'in',true).warp(305,2,'out').sign(287,'Pound the last drum.');
  B.row(289,2,'J').row(292,2,'J').row(295,2,'J').coinCol(289,5,3).coinCol(292,5,4).coinCol(295,5,6).row(298,12,'===').spark(299,13).coinBox(302,3,303,5);
  return B.L;
}

/* ---------- the island on the map ---------- */
/* the giant boombox: its two cones are its eyes, its tape door its mouth */
function boomMapBox(){ const c='#7a5cf0', l='#a890ff', d='#4a35b0', k='#1c1233', s='#c9d2e2'; return [
  [-11,1,-4,22,12,8,c],[-11,12.4,-4,22,0.8,8.1,l],[-11,1,4,22,0.8,0.2,d],[-10,0,-3,3,1,6,k],[7,0,-3,3,1,6,k],
  [-9.6,2.6,4,7.2,7.2,0.3,k],[-8.8,1.8,4,5.6,8.8,0.3,k],[2.4,2.6,4,7.2,7.2,0.3,k],[3.2,1.8,4,5.6,8.8,0.3,k],
  [-1.8,2.4,4,3.6,3.4,0.3,'#fff3d6'],[-1.4,3,4.3,0.9,0.9,0.15,k],[0.5,3,4.3,0.9,0.9,0.15,k],[-1.8,6.4,4,3.6,1.2,0.3,k],
  [-1.6,8.4,4,0.9,0.9,0.4,'#ffe14d'],[-0.4,8.4,4,0.9,0.9,0.4,'#ff4f7b'],[0.8,8.4,4,0.9,0.9,0.4,'#3fe0c8'],[-1.8,10,4,3.6,1.6,0.3,s],
  [-8,13.2,-1,1.2,4,2,d],[6.8,13.2,-1,1.2,4,2,d],[-8,16.6,-1,16,1.2,2,l],[9.4,13.2,-3,0.5,9,0.5,s],[9.1,22,-3.3,1.1,1.1,1.1,'#ff4f7b']]; }
function boomMapBoxGlow(){ return [[-8.2,3.6,4.3,4.4,5.2,0.2,'#ff4fa8'],[-7,4.8,4.5,2,2.8,0.2,'#ffd0ec'],[3.8,3.6,4.3,4.4,5.2,0.2,'#3ff0e0'],[5,4.8,4.5,2,2.8,0.2,'#d6fffa'],
  [-1.6,6.7,4.3,0.5,0.6,0.1,'#7dffb0'],[-0.8,6.7,4.3,0.5,0.8,0.1,'#ffe14d'],[0,6.7,4.3,0.5,0.5,0.1,'#ff4f7b'],[0.8,6.7,4.3,0.5,0.7,0.1,'#7dffb0']]; }
defWorld({name:'Boombox Boulevard',theme:'boom',levels:[w7l1,w7l2,w7l3,w7l4,w7l5],
  map:{
    /* every third row is a keyboard, ivory and black; the rest is dance floor, with squares lit here and there */
    ground:(h,p,x,z)=>[x!==undefined&&((z%3)+3)%3===0?['#f4f0ff','#241d58']:p<0.14?['#ff4fa8','#3fd0e0']:p<0.26?['#ffd23e','#7a5cf0']:['#4a3aa8','#3a2c8c'],['#2c2466','#241d58']],
    scatter(M,c){ const r=c.r, P=boomParty;
      if(r<0.07&&c.clear(2.2)) M.put(M.land,boomStackM(c.R),c.x,c.y,c.z,0.55);
      else if(r<0.11) M.spin(M.part(boomDiscFlat(),c.x,c.y+0.05,c.z,0.36),'y',1+c.r2*1.5);
      else if(r<0.17&&c.clear(1.6)){ const col=pick(c.R,P); M.put(M.land,boomLampM(),c.x,c.y,c.z,0.6); M.glow.push([c.x+0.1,c.y+0.6,c.z-0.09,0.24,0.2,0.18,col]); if(c.r2<0.5) M.lamp(c.x+0.2,c.y+0.75,c.z+0.2,col,1.1,5); }
      else if(r<0.24) M.put(M.land,boomTape(pick(c.R,['#5a48c8','#c8409a','#2f9ab8','#d9902e'])),c.x,c.y,c.z,0.55);
      else if(r<0.33) M.put(M.land,boomBoxM(pick(c.R,['#7a5cf0','#ff4fa8','#2fb8c8','#ffb02e'])),c.x,c.y,c.z,0.5);
      else if(r<0.41) M.put(M.land,boomSpeaker(pick(c.R,['#7a5cf0','#d04aa0','#2fa8c0']),pick(c.R,P)),c.x,c.y,c.z,0.5);
      else if(r<0.47) M.put(M.land,boomDrum(pick(c.R,['#ff8f3c','#ff4fa8','#3fd0e0'])),c.x,c.y,c.z,0.7);
      if(r>0.88) M.mote({kind:0,x:c.x,y:c.y+0.3,z:c.z,col:pick(c.R,P),size:0.07,span:1.2+c.r2,rate:0.25+c.r2*0.2}); },
    /* the giant boombox, cones glowing, notes rising from it, and a record turning either side */
    landmark(M,x,y,z){ M.put(M.land,boomMapBox(),x,y,z,1); M.put(M.glow,boomMapBoxGlow(),x,y,z,1);
      for(let i=0;i<7;i++) M.mote({kind:0,x:x-1.2+i*0.4,y:y+1.7,z:z-0.1+(i%2)*0.3,col:boomParty[i%5],size:0.1,span:2.2+(i%3)*0.4,rate:0.26+i*0.03,ph:i*0.37});
      M.spin(M.part(boomDiscFlat(),x-1.25,y+0.06,z+1.2,0.4),'y',1.6); M.spin(M.part(boomDiscFlat(),x+1.25,y+0.06,z+1.2,0.4),'y',-1.9);
      M.lamp(x-0.75,y+0.8,z+1.1,0xff4fa8,1.4,6); M.lamp(x+0.75,y+0.8,z+1.1,0x3ff0e0,1.4,6); }
  }});
