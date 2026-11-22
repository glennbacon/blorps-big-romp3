/* ================= World 9: Rock Candy Caverns ================= */
/* Caves of rock candy under a mountain of sugar. Walls of banded toffee close behind the lane, a roof hung with spun
   sugar, crystals that glow from inside, liquorice vines with crystal lanterns on them, gumdrop boulders, and a lake of
   pink syrup that mirrors it all. Every level is dark: crystals are the lamps to steer by, a sunbloom is offered early,
   and here and there the only light is what Blorp carries, or a Wisp. The lake can be swum in; the amber syrup of
   level 4 cannot, and it rises. Level 5 climbs out into daylight. */

/* ---------- the tune ---------- */
/* @song */
/* A music box in a cave. D major with a sharpened fourth (G sharp, which leans on F sharp and on the E major chord):
   a celesta picks out the tune over slow broken chords, a glass pad hangs far back in the room, the echo is long, and
   a soft kick and a shaker keep time. The last bar of every phrase is left empty for the cave to answer. */
SONGS.candy=(()=>{
  const h='F#5 . A5 . D6 - C#6 A5  G#5 - F#5 . D5 - . .  E5 . G#5 . B5 - A5 G#5  F#5 - E5 . B4 - . . ';
  const a=h+'D5 . F#5 . B5 - A5 F#5  G#5 - F#5 . D5 - F#5 .  E5 . G#5 . B5 . E6 .  D6 - - - A5 - F#5 . ';
  const a2=h+'D5 . F#5 . B5 - A5 F#5  G#5 . B5 . E6 - C#6 B5  A5 - F#5 . D5 . F#5 .  D5 - - - . . . . ';
  const b='C#6 - - A5 F#5 - A5 .  C#6 - B5 A5 F#5 - - .  B5 - - G#5 E5 - G#5 .  B5 - A5 G#5 E5 - - .  D6 - - B5 F#5 - B5 .  D6 - C#6 B5 F#5 - - .  E6 . . B5 . . G#5 .  E5 - - - . . E5 G#5 ';
  const ch='D D E E Bm Bm E D  D D E E Bm E D D  F#m F#m E E Bm Bm E E  D D E E Bm E D D';
  const d='k . r . . . r . ', q='. . . . . . . . ', s='. . r . . . r . ';
  return song({key:'D lydian',bpm:108,ec:1.5,fb:0.46},
    [{w:'sine',v:0.12,h:4,g:0.95,e:1,r:0.45,pan:-0.12},a+a2+b+a2],
    [{w:'triangle',v:0.05,h:2,g:0.9,lp:[5,1.4],e:1,r:0.5,pan:0.3},musArp(ch,8,'1 . 5 . 8 . 3^ .','D3')],
    [{w:'sine',v:0.04,a:0.3,s:0.85,g:1,vib:6,r:1,pan:-0.3},musChord(ch,8,'x - - - - - - -','A3')],
    [{w:'triangle',v:0.2,g:0.8,lp:[4,1.2]},musArp(ch,8,'1 - - . . . 5 .','D2')],
    [{dr:1,v:0.55},d.repeat(7)+q+d.repeat(7)+q+s.repeat(6)+q+q+d.repeat(7)+q]);
})();
/* @endsong */

/* ---------- models ---------- */
const candyTof=['#b5763a','#d99a52','#8f5a2c','#e3b070','#a86a30','#c98a4a','#7d4c26','#f0cfa0'];
/* a stand of crystal as tall as a tree: every box is a light, so it goes in a glow list */
function candyCrystal(c,R){ const l=mixc(c,'#ffffff',0.45), d=shade(c,0.7), b=[], n=3+((R()*3)|0);
  for(let i=0;i<n;i++){ const mid=i===(n>>1), x=(i-(n-1)/2)*3.4+(R()-0.5)*1.4, z=(R()-0.5)*2.4, w=mid?3.6:2+R()*1.4, h=mid?15+R()*9:5+R()*8;
    b.push([x-w/2,0,z-w/2,w,h,w,i%2?d:c],[x-w*0.32,h,z-w*0.32,w*0.64,w*0.6,w*0.64,c],[x-w*0.14,h+w*0.6,z-w*0.14,w*0.28,w*0.45,w*0.28,l],[x-w/2-0.05,h*0.15,z+w/2-0.25,w*0.3,h*0.7,0.35,l]); }
  return b; }
/* a knee-high cluster, and a bud small enough for the front lip */
function candyShards(c){ const l=mixc(c,'#ffffff',0.5); return [[-1,0,-1,2,4.5,2,c],[-0.5,4.5,-0.5,1,1.3,1,l],[1.1,0,-0.3,1.4,2.6,1.4,shade(c,0.8)],[-2.4,0,0.2,1.2,1.8,1.2,c],[-2.2,1.8,0.4,0.8,0.7,0.8,l]]; }
function candyBud(c){ return [[-0.6,0,-0.6,1.2,2,1.2,c],[-0.3,2,-0.3,0.6,0.8,0.6,mixc(c,'#ffffff',0.5)],[0.7,0,0,0.8,1.2,0.8,shade(c,0.8)]]; }
function candyRockBase(){ return [[-6,0,-3.5,12,1.6,7,'#9a6238'],[-4,1.6,-2.5,8,0.8,5,'#b5763a'],[-5,1.5,3.3,3,0.5,0.4,'#fbeef6'],[1,1.9,2.4,3,0.5,0.4,'#fbeef6']]; }
/* a gumdrop boulder, sugared, with a face */
function candyGumdrop(c){ const l=mixc(c,'#ffffff',0.45), d=shade(c,0.75); return [[-4,0,-3.5,8,3.6,7,c],[-3.2,3.6,-2.8,6.4,2,5.6,c],[-2,5.6,-1.8,4,1,3.6,l],[-4,0,3.5,8,0.6,0.15,d],
  ...eye(-2.6,1.6,3.5,1.9,1.9,0.9,1,0.6,0.4),...eye(0.7,1.6,3.5,1.9,1.9,0.9,1,0.4,0.4),[-0.9,0.8,3.5,1.8,0.45,0.2,INK],
  [-2.8,4.4,2.8,0.6,0.6,0.3,WHITE],[1.6,5,1.8,0.5,0.5,0.3,WHITE],[2.6,3.9,-1,0.5,0.5,0.3,WHITE],[-1,6.6,-0.4,0.5,0.3,0.5,WHITE]]; }
/* a stalagmite of toffee in bands, with a cap of sugar */
function candyStalagmite(R){ const h=7+R()*8, b=[]; let w=4.4, y=0, i=0;
  while(y<h){ const hh=2+R()*1.6; b.push([-w/2,y,-w/2,w,hh,w,i%2?'#e3b070':'#c98a4a']); y+=hh; w=Math.max(1,w-0.9); i++; }
  b.push([-w/2,y,-w/2,w,0.6,w,'#fbeef6']); return b; }
function candySugarPile(){ return [[-2.4,0,-1.6,4.8,0.6,3.2,'#fbeef6'],[-1.2,0.6,-0.9,2.6,0.5,1.8,WHITE]]; }
/* a liquorice vine, hanging `len` eighths down from where it is put, and the crystal lantern that hangs on its end */
function candyVine(len){ const b=[]; for(let y=0,i=0;y<len;y+=4,i++) b.push([i%2?-0.5:-0.3,-Math.min(len,y+4),-0.4,0.8,Math.min(4,len-y),0.8,i%2?'#3a1f3d':'#5a2a52']);
  b.push([0.4,-len*0.4,-0.3,1.3,0.5,0.6,'#ff6fae'],[-1.6,-len*0.7,-0.3,1.3,0.5,0.6,'#ff6fae']); return b; }
function candyLantern(c){ const l=mixc(c,'#ffffff',0.5); return [[-1.4,-5.2,-1.4,2.8,4,2.8,c],[-0.9,-6.6,-0.9,1.8,1.4,1.8,l],[-0.5,-7.6,-0.5,1,1,1,l]]; }
function candyLanternCap(){ return [[-1.8,-1.2,-1.8,3.6,1.2,3.6,'#3a1f3d'],[-0.4,0,-0.4,0.8,0.8,0.8,'#3a1f3d']]; }
/* the Glimmer, a glow-worm: a plump grub with feelers, and a lamp for a tail */
function candyGlimBody(){ const c='#8a6ab8',d='#5f458a',l='#d8c2f2'; return [[-2.2,0.4,0.6,4.4,3.6,3.2,c],[-1.8,0.4,-1.8,3.6,3,2.4,d],[-2,3.9,1,4,0.5,2.4,l],
  ...eye(-2,1.6,3.8,1.7,1.7,0.8,0.9,0.5,0.4),...eye(0.3,1.6,3.8,1.7,1.7,0.8,0.9,0.4,0.4),[-0.8,0.8,3.8,1.6,0.4,0.2,INK],
  [-0.9,4,2,0.5,1.5,0.5,d],[0.4,4,2,0.5,1.5,0.5,d],[-2.4,0,1.2,1,0.6,1.2,d],[1.4,0,1.2,1,0.6,1.2,d],[-2,0,-1.2,1,0.6,1,d],[1,0,-1.2,1,0.6,1,d]]; }
function candyGlimLamp(){ return [[-1.9,0.6,-4.6,3.8,3.4,2.8,'#bfffe0'],[-1.3,4,-4.2,2.6,0.8,2,'#e8fff4'],[-1,5.5,1.9,0.7,0.7,0.7,'#bfffe0'],[0.3,5.5,1.9,0.7,0.7,0.7,'#bfffe0']]; }
/* the shared monsters in sugar: a pink Wisp, and a Rattles of spun sugar with rose bones */
function candyWisp(){ return mWisp('#ffc2ea','#fff2fb'); }
function candyBones(){ return recolor(mBones(),{'#c9c2a8':'#ff9fd0'}); }

/* ---------- a monster of this world's own ---------- */
/* Glimmer: slow, turns back at a ledge, and lights the dark round itself. A stomp squashes it, and puts its lamp out. */
defEnemy('candyglim',{w:0.8,h:0.6,stomp:true, init(e){ e.vx=-1; },
  mesh(){ const g=G1('candyglim',candyGlimBody), lm=vmesh('candyglimLamp',candyGlimLamp,MAT.glow); lm.castShadow=false; g.add(lm); return g; },
  tick(e,dt){ if(ledgeAhead(e)) e.vx=-e.vx; walk(e,dt); },
  anim(e,m,dt,time){ m.rotation.y=(e.vx>0?1:-1)*1.15; const k=1+Math.sin(time*6+e.x)*0.07; m.scale.set(1,k,1/k); glowAt(e.x,e.y+0.4,0.7,0x9fffd0,0.9,6); }});

THEMES.candy={ music:'candy', air:'drips',
  sky:['#0c0617','#170a2a','#24103c'], skyMid:0.5, sunGlow:0, glowCol:0xff9fe0,
  fog:0x1d0e34, fogNear:12, fogFar:95,
  hemiSky:0xf2e2ff, hemiGround:0x7a5a8a, hemiI:0.66, sunI:0.42, sunCol:0xffe6f6, sunDir:[-0.3,0.82,0.48],
  top:'#fbeef6', topS:['#ffffff','#f3d9ea','#ffe6f4','#ecd0e4'], dirt:'#c98a4a', dirtS:['#b5763a','#dba664','#a86a30'], cap:'#fbeef6', capL:'#ffffff', capD:'#d9a8c8',
  brick:['#fff2f9','#e2b4d0','#ffffff'], hard:['#b48ad8','#dcc2f2','#7a4fa0'], pipe:['#e0405a','#ff9aa8','#a01f3a','#3a0a18'],
  semi:'slab', semiCols:['#e8a04a','#ffd08a','#a8642a'], plat:['#5fd6e6','#2a8fa8'], dust:'#fff2fa', back:-7,
  liquid:{kind:'water',a:'#ff6fae',b:'#ffe0f0',op:0.84,far:60,mirror:0.6,glint:'#fff0fa',flow:0.4}, pool:{kind:'water',a:'#ff7fb8',b:'#ffe0f0',op:0.7},
  bounce:{kind:'jelly',cols:['#7fe06a','#c8ffb0','#3f9a3a']}, bounceCol:'#c8ffb0', sticky:['#c9742a','#f0b060','#8a4a12'], stickyCol:'#f0b060',
  dark:0.6, darkAmb:0x2c1c50, bloom:0.85, hi:0.12, rays:0, vig:0.5, sat:1.1, grade:{shadow:[0.94,0.92,1.1],high:[1.05,1.0,0.98]},
  skins:{wisp:candyWisp,bones:candyBones}, wispCol:0xffb0e0,
  /* what the crystals of a level are made of, and whether daylight still finds its way in through the roof */
  crys:['#ff5fa8','#ff8fc7','#ff5fa8','#ffb3dc'], shafts:1,
  looks:[null,
    {crys:['#3fd8ee','#7fe8f6','#3fb8ff'],sky:['#050b1a','#0a1830','#0f2844'],fog:0x0c1c36,hemiSky:0xe2f2ff,hemiGround:0x4a6a8a,wispCol:0x9ff0ff,shafts:0,grade:{shadow:[0.9,0.96,1.12],high:[1.0,1.02,1.03]}},
    {crys:['#a678ff','#c9a0ff','#7a5cff'],sky:['#0a0518','#150a2e','#211044'],fog:0x180c38,hemiSky:0xeadcff,wispCol:0xc9a0ff,shafts:0},
    {crys:['#ffae38','#ffd060','#ff8a2a'],sky:['#120805','#22100a','#36180c'],fog:0x2a1408,hemiSky:0xffecd0,hemiGround:0x8a5a3a,sunCol:0xffe0b0,wispCol:0xffd27a,shafts:0,
      liquid:{kind:'syrup',a:'#ff9a1f',b:'#ffe9a0',op:1,mask:0.7,far:60,mirror:0.2,glint:'#fff2c0',flow:0.6},grade:{shadow:[1.06,0.94,0.9],high:[1.06,1.0,0.92]}},
    {crys:['#ff5fa8','#3fd8ee','#a678ff','#ffae38','#6fe08a'],sky:['#4a9af0','#b4deff','#ffeeda'],fog:0xe0d6f2,fogNear:18,fogFar:160,hemiSky:0xffffff,hemiGround:0xd8c2dc,hemiI:0.7,sunI:0.7,sunCol:0xfff1dc,sunDir:[-0.45,0.76,0.5],
      glowCol:0xfff1c8,sunGlow:0.9,cloud:0.45,cloudShade:'#f3d6ea',cloudY:0.66,spokes:0.4,disc:['#ffe14d','#fff3a0','#e08a12'],rays:0.35,wispCol:0xffe0f4,shafts:0,vig:0.4,
      liquid:{kind:'syrup',a:'#ff5fa8',b:'#ffd6ec',op:1,mask:0.75,far:60,mirror:0.3,glint:'#fff0fa',flow:0.5}}],
  /* The cave. A wall of toffee strata close behind the lane, with shelves of crystal on it, and a roof with spun-sugar
     stalactites; where the lake runs under the lane the wall falls away and a far cavern shows, with pillars, islets of
     giant crystal and its own far wall. Lanterns hang where the level asks, and a crystal grows by every monster that
     has no light of its own. A level that says `candyOpen` ends in the open air from that column on. */
  scenery(S,R){
    const W=S.W, H=S.H, L=S.L, t=L.tiles, far=S.far, gf=S.glowFar, cols=TH.crys, open=L.candyOpen, liq=L.liquidY, tall=H>18,
      roofY=tall?H-5:11.2, farZ=open===undefined?-52:-30, deep=Math.abs(farZ)-14, SUGAR='#fbeef6',
      out=x=>open!==undefined&&x>=open, dimIn=x=>(L.candyDim||[]).some(q=>x>=q[0]&&x<=q[1]),
      sol=(x,y)=>x>=0&&x<W&&y>=0&&y<H&&SOLID[t[y*W+x]]===1;
    /* where the lake lies open: columns with no floor, eight or more of them, islets and all */
    const wet=x=>x>=0&&x<W&&t[W+x]!==GROUND&&t[W+x]!==HARD, lk=[], lakes=[];
    for(let x=0;x<W;x++) lk.push(wet(x));
    for(let x=1;x<W-1;x++) if(!lk[x]&&lk[x-1]){ let e=x; while(e<W&&!wet(e)) e++; if(e<W&&e-x<=4) for(let k=x;k<e;k++) lk[k]=true; }
    for(let x=0;x<W;x++) if(lk[x]){ let e=x; while(e+1<W&&lk[e+1]) e++; if(e-x>=7) lakes.push([x-1,e+1]); x=e; }
    const inLake=x=>lakes.some(q=>x>=q[0]&&x<=q[1]);
    /* the near wall and the roof, a stretch at a time; the strata run the length of the cave */
    const strata=[]; for(let y=-5,i=0;y<H+10;i++){ const hh=1.1+R()*1.5; strata.push([y,hh,candyTof[(i*3+((R()*2)|0))%8]]); y+=hh; }
    for(let x=-28;x<W+28;){ const w=3+R()*3, x0=x, mid=x+w/2; x+=w; if(out(mid)||inLake(mid)) continue;
      const zf=-(7.4+R()*1.3), pale=open===undefined?0:clamp((mid-open+12)/12,0,1)*0.85, yr=roofY+R()*1.4, tint=c=>pale?mixc(c,SUGAR,pale):c;
      for(const s of strata){ if(s[0]>yr+0.6) break; far.push([x0,s[0],zf-2.6+(R()-0.5)*0.5,w+0.05,s[1]+0.02,2.6,tint(s[2])]); }
      far.push([x0,yr,zf-0.2,w+0.05,H+10-yr,-2.5-zf,tint(pick(R,['#6e4424','#7d4c26','#8a5630']))]);
      for(let k=(R()*3)|0;k>0;k--){ const sx=x0+0.5+R()*(w-1), sz=zf+0.8+R()*(-4.2-zf), ln=0.9+R()*2.7;
        far.push([sx-0.45,yr-ln*0.45,sz-0.45,0.9,ln*0.45+0.1,0.9,tint('#8a5630')],[sx-0.3,yr-ln*0.8,sz-0.3,0.6,ln*0.36,0.6,tint('#c98a4a')],[sx-0.15,yr-ln,sz-0.15,0.3,ln*0.21,0.3,SUGAR]);
        if(R()<0.35&&!dimIn(sx)) gf.push([sx-0.13,yr-ln-0.2,sz-0.13,0.26,0.22,0.26,pick(R,cols)]); }
      /* shelves on the wall, with crystals growing on them */
      for(let y=3.5+R()*4;y<yr-3;y+=6+R()*6){ if(R()>(tall?0.55:0.4)||dimIn(mid)) continue;
        const d=1.2+R()*1.2, c=pick(R,cols); far.push([x0+0.3,y,zf-0.1,w-0.6,0.6,d,tint('#e3b070')]);
        for(let k=1+((R()*3)|0);k>0;k--){ const cw=0.35+R()*0.4, chh=1+R()*2.2, px=x0+0.5+R()*Math.max(0.2,w-1.5);
          gf.push([px,y+0.6,zf+d*0.3,cw,chh,cw,k%2?shade(c,0.75):c],[px+cw*0.2,y+0.6+chh,zf+d*0.3+cw*0.2,cw*0.6,cw*0.9,cw*0.6,mixc(c,'#ffffff',0.4)]); } }
    }
    /* daylight through holes in the roof, where a look still has it */
    if(TH.shafts&&!tall) for(let x=14+R()*10;x<W-10;x+=24+R()*14){ if(inLake(x)||dimIn(x)) continue;
      S.addShaft(x,1.5,-3.6,2.4+R()*1.4,11.5,'#fff0d2',-0.32); gf.push([x+0.7,roofY-0.1,-2.44,2.6,1.5,0.08,'#e6f6ff']); lamps.push({x,y:4.2,z:-2.5,col:0xfff0d2,power:0.7,reach:10}); }
    /* the far wall, behind everything, so that no sky shows where there is none */
    const xr=open===undefined?W+60:open+6;
    far.push([-60,-12,farZ-8,xr+60,H+36,3,'#24122c']);
    for(let y=-9,i=0;y<H+16;i++){ const hh=2.4+R()*2.6; far.push([-60,y,farZ-5,xr+60,hh+0.02,3.4+(i%3)*0.7,shade(candyTof[(i*5)%8],0.62)]); y+=hh; }
    /* the cavern over the lake */
    for(const q of lakes){ const a=q[0], b=q[1], len=b-a; if(out(a)) continue;
      for(let i=0;i<2+len/9;i++){ const px=a-4+R()*(len+8), pz=-11-R()*(deep-1), pw=1.8+R()*2.2, pc=shade(pick(R,candyTof),0.8);
        far.push([px-pw/2,-8,pz-pw/2,pw,H+22,pw,pc],[px-pw*0.9,-8,pz-pw*0.9,pw*1.8,8.9+(liq>0?liq:1),pw*1.8,pc]);
        for(let y=(liq>0?liq:1)+1.5+R()*2;y<H+2;y+=5+R()*6){ const c=pick(R,cols), sd=R()<0.5?-1:1, ex=px+sd*(pw/2+0.5);
          gf.push([Math.min(px+sd*pw/2,ex),y,pz+pw/2-0.5,0.5,0.45,0.45,shade(c,0.75)],[ex-0.3,y,pz+pw/2-0.6,0.6,1.6+R()*2.6,0.6,c]); } }
      if(liq>0&&!tall) for(let i=0;i<1+len/6;i++){ const ix=a+1+R()*(len-2), iz=-10-R()*(deep-4), c=pick(R,cols), l=mixc(c,'#ffffff',0.4);
        far.push([ix-2,liq-1,iz-1.5,4,1.5,3,'#e9d6e4'],[ix-1.2,liq+0.5,iz-1,2.4,0.4,2,SUGAR]);
        for(let k=0,n=2+((R()*3)|0);k<n;k++){ const cw=0.7+R()*0.9, chh=k?2.5+R()*4:6+R()*6, cx=ix-1.4+k*0.9+R()*0.4;
          gf.push([cx,liq+0.9,iz-cw/2+(R()-0.5),cw,chh,cw,k%2?shade(c,0.78):c],[cx+cw*0.2,liq+0.9+chh,iz-cw*0.3,cw*0.6,cw*0.8,cw*0.6,l]); } }
      if(!tall){ for(let i=0;i<len/3;i++){ const sx=a+R()*len, sz=-11-R()*(deep-2), yb=8.5+R()*4.5; far.push([sx-0.9,yb+1.5,sz-0.9,1.8,H+10.5-yb,1.8,'#6e4424'],[sx-0.5,yb,sz-0.5,1,1.5,1,'#c98a4a']); }
        lamps.push({x:(a+b)/2,y:(liq>0?liq:1)+4.5,z:-12,col:pick(R,cols),power:1,reach:15}); } }
    /* lanterns on liquorice vines where the level asks for them; then a crystal by every monster with no light of its own */
    const lit=[];
    const lantern=(x,y,c)=>{ const tx=Math.floor(x); let top=Math.floor(y)+2; while(top<H&&top<y+8&&!sol(tx,top)) top++;
      put(S.near,candyVine(Math.max(2,(top-y-0.6)*8)),x*8,top*8,-16); put(S.near,candyLanternCap(),x*8,(y+0.6)*8,-16); put(S.glow,candyLantern(c),x*8,(y+0.6)*8,-16);
      lamps.push({x,y,z:-1.4,col:c,power:1.15,reach:9}); lit.push([x,y]); };
    for(const q of L.candyLamps||[]) lantern(q[0]+0.5,q[1],pick(R,cols));
    const haz={icicle:1,clonk:1,mimic:1,spikit:1,bones:1,batty:1,ghost:1};
    for(const e of L.enemies){ if(!haz[e.type]||dimIn(e.x)||out(e.x)||lit.some(q=>Math.abs(q[0]-e.x)<5.5&&Math.abs(q[1]-e.y)<6)) continue;
      const c=pick(R,cols), tx=Math.floor(e.x); let fy=Math.floor(e.y); while(fy>0&&!sol(tx,fy-1)&&t[(fy-1)*W+tx]!==SEMI) fy--;
      const gx=e.x+(R()<0.5?-1.3:1.3), gt=Math.floor(gx);
      if(fy>0&&gt>=0&&gt<W&&t[(fy-1)*W+gt]===GROUND&&!sol(gt,fy)&&!sol(gt,fy+1)){ put(S.near,candyRockBase(),gx*8,fy*8,-24); put(S.glow,scaled(candyCrystal(c,R),0.62),gx*8,fy*8+1.2,-24);
        lamps.push({x:gx,y:fy+2.4,z:-2.6,col:c,power:1.2,reach:11}); lit.push([gx,fy+2]); }
      else lantern(e.x+1,fy>0?fy+4.3:e.y+2.5,c); }
    /* out on the mountainside: slopes of sugar stepping up behind the lane, far peaks, clouds and the sun */
    if(open!==undefined){ const gy=L.goal?L.goal.y:2, d0=L.dark===undefined?(TH.dark||0):L.dark, fd=L.candyFade||[H*0.4,H*0.75];
      for(let k=0;k<7;k++){ const top=gy+0.5+k, zb=-7.4-(k+1)*5; far.push([open-1+k*0.8,gy-30,zb,W-open+90,30.5+k,5,k%2?'#f6e8f2':'#fdf4fa']);
        for(let x=open+2+R()*8;x<W+30;x+=9+R()*14) far.push([x,top-0.2-R()*0.5,zb+5,5+R()*9,0.22,0.08,pick(R,['#ffb3d9','#aee6fa','#d9c2ff','#ffd9a0'])]); }
      for(let x=open-10;x<W+70;x+=20+R()*18) hill(far,x,gy+7+R()*9,-52-R()*36,20+R()*16,pick(R,['#fdf4fa','#f3e2ee','#ffe9f4']),R,false,'#ffffff');
      for(let x=-40;x<W+60;x+=16+R()*14) S.addCloud(x,gy+7+R()*7,-62-R()*20,R);
      skyDisc(TH.disc,null,gy+10.5);
      /* the dark thins as the climb nears the top, and is gone at the mouth of the cave */
      critters.push({tick(){ const u=clamp((camY-fd[0])/(fd[1]-fd[0]),0,1), v=clamp((camX-(open-9))/10,0,1); L.dark=d0*(1-Math.max(u*0.55,v)); }}); }
    /* glitter in the air, near and far */
    S.addWeather('star',{n:70,cols:cols.concat(['#ffffff','#fff3a0'])}); S.addWeather('star',{n:14,z:6,size:[0.17,0.17],box:[46,18,4],cols:cols.concat(['#ffffff'])});
    S.addWeather('spore',{n:36,cols:cols});
    /* drops of syrup falling from the roof */
    for(let i=0;i<9;i++){ const m=new T.Mesh(geo('candyDrip',()=>[[-0.4,-1.2,-0.4,0.8,2.4,0.8,'#ffd6ee'],[-0.25,1.2,-0.25,0.5,0.8,0.5,'#ffd6ee']]),MAT.glow), x0=R()*30, z=-2.4-R()*3, sp=0.22+R()*0.2, ph=R();
      m.position.set(0,-50,z); world.add(m);
      critters.push({tick(dt,time){ const u=(time*sp+ph)%1, dx=((x0-camX)%30+45)%30-15; m.position.x=camX+dx; m.position.y=camY+7.5-u*u*15; m.visible=!out(camX+dx); }}); }
  },
  /* on the sugar: tall crystals that are lamps, small ones, stalagmites, gumdrop boulders, toffee and drifts of sugar */
  decor(S,D,R){
    const r=R(), y=D.ty*8, cols=TH.crys, dim=(S.L.candyDim||[]).some(q=>D.x>=q[0]&&D.x<=q[1]);
    if(D.wet) return;
    if(r<0.05&&D.free(4)&&D.open&&!dim){ const c=pick(R,cols), x=D.jx(), z=D.zb(2.8,5.4); put(S.near,candyRockBase(),x,y,z); put(S.glow,candyCrystal(c,R),x,y+1.4,z); lamps.push({x:x/8,y:D.ty+1.8,z:z/8+0.5,col:c,power:1.25,reach:10}); }
    else if(r<0.12&&D.free(2)&&!dim) put(S.glow,candyShards(pick(R,cols)),D.jx(),y,D.zb(1.5,5.6));
    else if(r<0.17&&D.free(3)&&D.open) put(S.near,candyStalagmite(R),D.jx(),y,D.zb(2.2,5.6));
    else if(r<0.26) put(S.near,candyGumdrop(pick(R,CANDY)),D.jx(),y,D.zb(1.7,5.4));
    else if(r<0.34) put(S.near,dRock(pick(R,['#b5763a','#9a6238','#d99a52'])),D.jx(),y,D.zb(1.3,5.6));
    else if(r<0.44) put(S.near,candySugarPile(),D.jx(),y,D.zb(1.2,5.8));
    const f=R();
    if(f<0.1&&!dim) put(S.glow,candyBud(pick(R,cols)),D.jx(),y,D.zf());
    else if(f<0.2) put(S.near,candySugarPile(),D.jx(),y,D.zf());
  }
};
/* a lantern on a liquorice vine, hung at a tile: the scenery reads the list */
function candyLamp(B,x,y){ (B.L.candyLamps=B.L.candyLamps||[]).push([x,y]); return B; }

/* 9-1: the sugar door. The dark as the whole idea, somewhere still half lit by daylight: a sunbloom at once, Glimmers that
   carry their own lamps, stalactites that fall, a cell of sugar bricks to dash into, and crusts of sugar that crumble
   over the first lake. */
function w9l1(){
  const B=LevelBuilder(262,'candy');
  B.room(0,229).room(234,261,0,15,true).set('dark',0.45);
  B.ground(0,46).ground(51,96).ground(102,104).ground(109,111).ground(117,160).ground(165,233);
  B.coins(5,3,3).sign(9,'It is dark down here. A sunbloom makes Blorp shine: look in the blocks.').row(13,5,'?O?');
  B.sign(19,'A Glimmer carries its own lamp. Stomp it, and the lamp goes out.').enemy('candyglim',25);
  B.row(29,5,'B?B').enemy('candyglim',34).row(39,5,'BOB').enemy('spikit',43);
  /* the first spark hangs over the first pit, where a jump goes anyway */
  B.arc(46,3,6).spark(48,6);
  /* the first stalactites: a low roof, nothing else, and coins that say keep walking */
  B.sign(53,'Sugar stalactites fall when Blorp walks beneath. Keep moving, and never stop under one.');
  B.fill(56,8,72,15,GROUND).enemy('icicle',59,7).enemy('icicle',63,7).enemy('icicle',67,7).enemy('icicle',70,7).coins(58,2,13);
  B.row(75,5,'?B?').enemy('candyglim',79);
  /* a cell walled with sugar bricks holds the second spark: dash in, or drop through the hole in its roof and climb out by the step */
  B.sign(81,'Sugar bricks! A dash goes straight through them. A small Blorp must find the hole in the roof.');
  B.row(83,2,'H').fill(86,2,86,4,BRICK).fill(90,2,90,4,HARD).fill(86,5,90,5,HARD).clear(88,5,88,5).row(89,2,'H').spark(87,3).coins(87,2,1).row(94,5,'I');
  /* the lake: crusts that crumble, two islets, and a gap with a shallow at each end to wade out by */
  B.sign(93,'Sugar crust crumbles underfoot. Keep moving!');
  B.row(97,1,'KKKKK').row(112,1,'KKKKK').fill(105,0,105,0,GROUND).fill(108,0,108,0,GROUND).coins(98,3,3).arc(104,3,6).coins(113,3,3);
  B.checkpoint(120);
  B.row(124,5,'?M?').enemy('candyglim',128).enemy('batty',131,6,{rx:3});
  /* stalactites again, with a Spikit coming the other way: hop it between two of them */
  B.fill(136,8,150,15,GROUND).enemy('icicle',139,7).enemy('icicle',144,7).enemy('icicle',148,7).enemy('spikit',147).coins(140,2,3);
  B.warp(153,2,'in').warp(157,3,'out',true).arc(160,3,6);
  B.row(169,5,'B?B?B').row(171,9,'O').enemy('candyglim',173).enemy('spikit',179).enemy('batty',185,6,{rx:3}).row(190,5,'?');
  B.stairs(196,6).fill(202,2,202,7,HARD);
  B.goal(208);
  /* a crystal vault at the far end of the pipe: a gumdrop to bounce on, and the third spark on the shelf above it */
  B.fill(226,2,233,15,GROUND).fill(234,2,234,15,HARD).fill(261,2,261,15,HARD).ground(234,261);
  B.warp(236,2,'in',true).row(241,5,'?L?').coinBox(240,7,246,8).row(249,2,'J').coinCol(249,5,5).row(251,9,'====').coins(251,10,2).spark(253,10).warp(257,2,'out');
  candyLamp(B,103,6); candyLamp(B,110,6); candyLamp(B,88,8); candyLamp(B,244,7); candyLamp(B,255,6);
  return B.L;
}

/* 9-2: the lake. Mimics asleep among real blocks, a ledge that swings on its chain, the first Wisp, and a switch that
   grows a bridge of crystal over the syrup and takes a stair away; then a stretch with no crystals at all, where two
   Wisps over two pits are the only light. */
function w9l2(){
  const B=LevelBuilder(270,'candy');
  B.room(0,237).room(242,269,0,15,true);
  B.ground(0,51).ground(72,99).ground(122,145,5).ground(146,157).ground(162,168).ground(173,241);
  B.coins(5,3,3).row(9,5,'?O?').enemy('candyglim',15);
  B.sign(18,'Blocks on the floor want pounding from above. But a real block keeps its eye open: a Mimic only pretends to sleep.');
  B.row(22,2,'?').enemy('mimic',25).row(28,2,'?');
  B.row(33,5,'B?B').enemy('spikit',38).row(43,5,'BOB').enemy('batty',47,6,{rx:2.5});
  /* the first swing, with the first spark hanging over the middle of it */
  B.sign(49,'The ledges swing on their chains. Step on at the near end of the swing, and off at the far.');
  B.row(52,1,'=====').plat(59,3,3,'s',6,1.3).row(67,1,'=====').coins(53,3,3).coins(59,5,2).coins(62,5,2).spark(61,7).coins(68,3,3);
  B.row(76,5,'?B?').sign(78,'Rattles only lies down for a moment. Do not wait about.').enemy('bones',82);
  /* a shelf with a block on it, and a block that is not */
  B.row(86,4,'=====').row(87,5,'?').enemy('mimic',89,5).coins(86,8,5);
  B.sign(91,'A Wisp lights the dark, and burns. Only a dash or a star puts one out.').enemy('wisp',93,6,{rx:2});
  /* the switch grows a bridge of crystal; with no bridge, the far bank is a cliff no swimmer can climb */
  B.sign(96,'A switch! Bump it from below, and crystal grows across the lake.').row(97,5,'X').row(100,2,'U'.repeat(22)).coins(103,3,16);
  B.checkpoint(124,5);
  /* the same switch took the red stair away: the one on this side brings it back, and the second spark is at the top of it */
  B.row(126,8,'X').row(129,7,'RR').row(132,10,'RR').spark(132,12);
  B.row(137,8,'?O?').enemy('bones',141,5).stairs(146,3,-1);
  /* no crystals grow here: only the Wisps to see by, one over each pit */
  B.set('candyDim',[[150,176]]).sign(151,'No crystals grow here. Follow the Wisps.');
  B.fill(158,0,158,0,GROUND).fill(161,0,161,0,GROUND).fill(169,0,169,0,GROUND).fill(172,0,172,0,GROUND);
  B.enemy('wisp',159.5,6.5,{rx:2}).enemy('candyglim',165).enemy('wisp',170.5,6.5,{rx:2,phase:3.1});
  B.row(177,5,'?B?').enemy('bones',181);
  B.row(184,2,'?').row(186,2,'B').enemy('mimic',188).row(190,2,'?');
  B.warp(194,2,'in').warp(199,3,'out',true);
  B.stairs(204,6).fill(210,2,210,7,HARD);
  B.goal(216);
  /* the Mimic's larder: three shelves up to the third spark, and a block on the floor that bites */
  B.fill(234,2,241,15,GROUND).fill(242,2,242,15,HARD).fill(269,2,269,15,HARD).ground(242,269);
  B.warp(244,2,'in',true).row(249,4,'===').row(253,6,'===').row(257,8,'===').coinBox(249,6,251,7).coins(253,8,3).spark(258,10);
  B.row(250,2,'?').enemy('mimic',253).row(256,2,'?').warp(265,2,'out');
  candyLamp(B,60,9); candyLamp(B,110,7); candyLamp(B,131,13); candyLamp(B,247,8); candyLamp(B,261,6);
  return B.L;
}

/* 9-3: the Violet Shafts. Walls to kick up, and toffee that holds on: a first shaft to learn in, Clonks, stepping stones
   of sugar crust, then the great shaft with a ledge to rest on halfway. A dash through the bricks at its foot is the
   short cut, and the tunnel behind them hides a spark for whoever walks back into it. One Shyde, near the end. */
function w9l3(){
  const B=LevelBuilder(250,'candy',22);
  B.set('dark',0.68).set('lightR',5);
  B.ground(0,61).ground(78,157).ground(178,249).ground(26,38,9).ground(106,130,12);
  B.coins(5,3,3).row(8,5,'?O?').enemy('candyglim',14);
  B.sign(17,'In the air, push against a wall and press {jump} to kick off it. Toffee is sticky: it holds Blorp while he thinks.');
  B.sticky(22,4,22,12).coinCol(24,4,6).row(30,12,'?M?').enemy('bones',34,9);
  B.sign(41,'A Clonk waits overhead and drops when Blorp walks under. Let it fall, then hop over: its top is safe.');
  B.enemy('clonk',46,7).coins(45,2,3).row(50,5,'?B?').enemy('clonk',56,7).coins(55,2,3);
  /* stepping stones of sugar crust, up and down, with the first spark over the highest */
  B.fill(62,0,62,0,GROUND).fill(77,0,77,0,GROUND);
  B.row(63,2,'KK').row(67,3,'KK').row(71,4,'KK').row(75,3,'KK').spark(72,7).enemy('batty',68,9.5,{rx:3,ry:0.5});
  B.row(85,5,'?O?').row(92,5,'B?B').enemy('bones',95);
  /* the great shaft: sticky toffee on the left, a ledge to rest on halfway, and the second spark for a kick back over the drop */
  B.sticky(102,4,102,19).row(103,7,'===').coinCol(104,3,4).spark(104,17);
  /* at its foot, two bricks thick, the short cut: a tunnel under the high floor, open at the far end, with the third spark in it */
  B.fill(106,2,107,4,BRICK).clear(108,2,130,4).coins(110,2,6).spark(112,3).row(118,2,'?').enemy('mimic',121).row(124,2,'B');
  B.fill(112,18,128,21,GROUND).enemy('icicle',115,17).enemy('icicle',119,17).enemy('icicle',123,17).enemy('icicle',126,17).enemy('candyglim',121,12).coins(114,12,12);
  B.checkpoint(134).row(138,5,'?M?');
  B.enemy('clonk',144,7).coins(143,2,3).enemy('spikit',150).enemy('clonk',153,7).coins(152,2,3);
  /* a swing over the second lake, by the light of a Wisp */
  B.row(158,1,'=====').plat(165,3,3,'s',6,1.2).row(173,1,'=====').enemy('wisp',166,10,{rx:2}).coins(159,3,3).coins(174,3,3);
  B.sign(180,'Shyde only moves while Blorp looks away. Face it and it hides. Nothing can hurt it, so keep going!').enemy('ghost',184,5.4);
  B.row(187,5,'B?B').row(188,9,'O');
  B.fill(193,8,207,21,GROUND).enemy('icicle',196,7).enemy('icicle',200,7).enemy('icicle',204,7).enemy('spikit',203).coins(195,2,11);
  B.stairs(212,6).fill(218,2,218,7,HARD);
  B.goal(224);
  candyLamp(B,24,8); candyLamp(B,104,10); candyLamp(B,69,7); candyLamp(B,115,3.6); candyLamp(B,127,3.6); candyLamp(B,162,7);
  return B.L;
}

/* 9-4: syrup rising. A tall cave climbed terrace by terrace while amber syrup, which burns, comes up behind: steps, a
   crust that crumbles over the drop, a Clonk that gives a lift to the spark on its head, a toffee shaft, a swing over
   the deep, and steps nobody can see near the top. Nothing below row 24 stays dry for ever. */
function w9l4(){
  const B=LevelBuilder(250,'candy',40);
  B.rise(0.16,24.5,6);
  B.ground(0,13).ground(14,29,4).ground(34,49,6).ground(50,63,9).ground(69,82,10).ground(83,96,13).ground(101,120,15).ground(121,140,21).ground(161,178,23).ground(179,192,26).ground(197,249,28);
  B.sign(4,'This syrup burns, and it is rising. Climb!').row(8,5,'?O?');
  B.row(18,7,'?O?').enemy('candyglim',24,4).arc(28,5,6).spark(31,8);
  B.enemy('bones',41,6).row(43,9,'B?B').fill(48,6,49,6,HARD);
  /* the second spark sits on a Clonk's head: let it drop, hop on, and ride it back up */
  B.sign(52,"A Clonk's top is safe. This one will give Blorp a lift.",9).enemy('clonk',56,14).spark(56,16).coins(55,9,3).enemy('candyglim',61,9);
  B.row(64,8,'KKKKK').coins(65,10,3);
  B.row(73,13,'?M?').enemy('candyglim',76,10).fill(81,10,82,11,HARD);
  B.enemy('batty',89,16.5,{rx:3,ry:1}).coins(86,14,6).arc(95,15,6);
  B.row(105,18,'?O?').enemy('bones',110,15).sign(113,'Kick up the toffee. The syrup is patient, but it is coming.',15);
  B.sticky(117,17,117,25).coinCol(119,16,5);
  B.checkpoint(124,21);
  B.fill(127,27,138,39,GROUND).enemy('icicle',129,26).enemy('icicle',133,26).enemy('icicle',137,26).enemy('candyglim',134,21).coins(128,21,10);
  /* the swing over the deep */
  B.row(141,20,'=====').plat(148,22,3,'s',6,1.2).row(156,20,'=====').coins(142,22,3).coins(157,22,3);
  B.row(165,26,'?O?').enemy('clonk',171,28).coins(170,23,3).fill(177,23,178,24,HARD);
  /* Mimics among blocks, and above the two coins, steps nobody can see: the third spark is over them */
  B.row(182,26,'?').enemy('mimic',184,26).row(186,26,'?').coins(189,28,2).row(189,29,'ii').spark(189,33).arc(191,28,6);
  B.row(201,31,'B?B').enemy('candyglim',205,28).stairs(210,4,1,28).fill(214,28,214,32,HARD);
  B.goal(220,28);
  candyLamp(B,66,12); candyLamp(B,98,17); candyLamp(B,119,22); candyLamp(B,150,27); candyLamp(B,194,30);
  return B.L;
}

/* 9-5: up and out. Everything the caverns have taught, stacked on end: gumdrops to bounce up, a toffee shaft with a nook
   at its foot, a floor lit only by Wisps, a switch that grows a crystal stair, two swings that climb, a vault of sugar
   bricks for a dash, a last chimney, and then daylight: the dark thins on the way up, and the flag stands on the
   mountainside in the open air. Here the syrup far below is not for swimming. */
function w9l5(){
  const B=LevelBuilder(236,'candy',48);
  B.set('dark',0.72).set('lightR',5).set('candyOpen',170).set('candyFade',[24,36]).set('candyDim',[[44,64]]);
  B.ground(0,20).ground(21,44,10).ground(45,62,17).ground(67,83,19).ground(84,100,25).ground(136,164,28).ground(165,235,34);
  B.sign(4,'Up and out! There is daylight somewhere above.').row(7,5,'?O?').enemy('candyglim',11);
  /* gumdrops: the first spark hangs where a held bounce goes */
  B.sign(14,'Gumdrops bounce. Hold {jump} as Blorp lands, and up he goes.').row(17,2,'JJ').coinCol(17,5,4).coinCol(18,5,4).spark(17,12);
  B.enemy('bones',27,10).row(30,13,'?B?').enemy('clonk',36,15).coins(35,10,3).row(39,10,'H');
  /* a toffee shaft; at its foot a low nook runs in under the next floor, and the second spark glows at the end of it */
  B.sticky(41,12,41,21).coinCol(43,12,4).clear(45,10,51,11).spark(51,10);
  /* no crystals on this floor: two Wisps, and a Rattles walking between them */
  B.enemy('wisp',51,22,{rx:2}).enemy('bones',55,17).enemy('wisp',58,22,{rx:2,phase:3.1}).arc(61,19,6);
  B.row(70,22,'?O?').row(74,19,'?').enemy('mimic',76,19).row(78,19,'B');
  /* the switch grows a step of crystal: with no step, the next floor is out of reach */
  B.sign(72,'A switch grows crystal, and crystal makes a stair.',19).row(79,22,'X').row(82,21,'UU');
  B.checkpoint(87,25).row(90,28,'?O?').enemy('clonk',95,30).coins(94,25,3).row(98,28,'I');
  /* two swings, each a step higher than the last */
  B.row(101,24,'=====').plat(108,26,3,'s',6,1.2).row(116,25,'=====').plat(123,27,3,'s',6,1.2,1.6).row(131,26,'=====');
  B.coins(102,26,3).coins(117,27,3).coins(132,28,3);
  /* a vault of sugar bricks: only a dash gets in, and the third spark is inside. The way on is over its roof */
  B.sign(138,'Sugar bricks. A dash goes through them; nothing else will.',28);
  B.fill(141,28,147,30,HARD).clear(142,28,146,29).fill(141,28,141,29,BRICK).spark(145,28,'sun').coins(142,28,3);
  B.fill(150,34,158,47,GROUND).enemy('icicle',152,33).enemy('icicle',155,33).enemy('spikit',156,28).coins(151,28,7);
  /* the last chimney, and out */
  B.sticky(161,30,161,40).coinCol(163,29,5);
  B.coins(172,35,3).row(177,37,'?L?').stairs(186,6,1,34).fill(192,34,192,39,HARD);
  B.goal(198,34);
  candyLamp(B,19,7); candyLamp(B,43,16); candyLamp(B,104,29); candyLamp(B,118,30); candyLamp(B,127,31); candyLamp(B,134,31); candyLamp(B,163,35);
  return B.L;
}

/* ---------- the island on the map ---------- */
/* the mouth of the caverns: a great geode split open, lined with crystals of every colour */
function candyGeode(){ const r='#8a6a9a',d='#5f4a72',w='#fbeef6',k='#2a1238', b=[];
  for(const s of [-1,1]){ const x=s<0?-11.5:4.5; b.push([x,0,-8,7,9,14,r],[x+(s<0?0.8:0.2),9,-7,6,4,12,r],[x+(s<0?2:0.8),13,-5.5,4.2,2.6,9,d],[s<0?-5.2:4.5,0,-7.2,0.7,12.5,13,w]); }
  b.push([-4.5,0,-8.6,9,13,2.4,k],[-4.5,0,-6.2,9,0.5,12,d]);
  return b; }
function candyGeodeGlow(){ const C=['#ff5fa8','#3fd8ee','#a678ff','#ffae38','#6fe08a','#ff8fc7','#7fe8f6'], b=[];
  for(let i=0;i<9;i++){ const s=i%2?1:-1, x=s*(1.2+((i*7)%5)*0.6), z=-5+i*1.2, h=3+((i*5)%7), w=1.4+(i%3)*0.4, c=C[i%7];
    b.push([x-w/2,0.5,z-w/2,w,h,w,c],[x-w*0.3,0.5+h,z-w*0.3,w*0.6,w*0.7,w*0.6,mixc(c,'#ffffff',0.45)]); }
  b.push([-4.4,12.5,-3,1,2.4,1,C[1]],[-4.4,12.5,1,1,1.8,1,C[0]],[3.5,12.5,-1,1,2.2,1,C[3]],[3.5,12.5,3,1,1.6,1,C[2]]);
  return b; }
defWorld({name:'Rock Candy Caverns',theme:'candy',levels:[w9l1,w9l2,w9l3,w9l4,w9l5],
  map:{
    /* sugar-white slopes with veins of pink, blue and violet */
    ground:(h,p)=>[p<0.16?['#ffc4e4','#ffb6dc']:p<0.3?['#c4ecff','#b4e4fa']:p<0.4?['#e2d2ff','#d6c4fa']:['#fdf5fa','#f4e8f1'],['#e2bd92','#d4ad80']],
    pond:['#ff9fd0','#ff6fae','#d94a8a'],
    scatter(M,c){ const r=c.r, C=['#ff5fa8','#3fd8ee','#a678ff','#ffae38'];
      if(r<0.09&&c.clear(2)){ const col=pick(c.R,C); M.put(M.glow,candyCrystal(col,c.R),c.x,c.y,c.z,0.55); if(c.r2<0.5) M.lamp(c.x,c.y+0.9,c.z+0.2,col,1.1,5); }
      else if(r<0.2) M.put(M.glow,candyShards(pick(c.R,C)),c.x,c.y,c.z,0.7);
      else if(r<0.3) M.put(M.land,candyGumdrop(pick(c.R,CANDY)),c.x,c.y,c.z,0.55);
      else if(r<0.38) M.put(M.land,candySugarPile(),c.x,c.y,c.z,0.9);
      else if(r<0.43&&c.clear(1.6)) M.put(M.land,candyStalagmite(c.R),c.x,c.y,c.z,0.6);
      if(r>0.88) M.mote({kind:2,x:c.x,y:c.y+0.4+c.r2*0.7,z:c.z,col:pick(c.R,C),size:0.05,span:0.5,rate:0.5+c.r2*0.5}); },
    landmark(M,x,y,z){ M.put(M.land,candyGeode(),x,y,z,1); M.put(M.glow,candyGeodeGlow(),x,y,z,1); M.lamp(x,y+1.2,z+0.6,0xff9fe0,1.6,7); M.lamp(x,y+1,z+1.6,0x7fe8f6,1.1,5); }
  }});
