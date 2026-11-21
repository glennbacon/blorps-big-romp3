#!/usr/bin/env node
/* Proves that every level can be finished, and that every sun spark can be reached.

   The game code in src/ is loaded as-is (see game.js), with three.js and the page stubbed out, so the rules being
   tested are the real ones. A search bot then plays each level: it keeps a snapshot for every spot it has managed to
   stand on (or swim at), keeps trying moves from those spots, and stops when Blorp reaches the flag or beats the boss.
   Each level is played twice, as small Blorp and as big Blorp (who must not get hurt), and the bot jumps 5% lower than
   a player can, so a pass leaves some margin. Then it goes after each of the three sparks in turn, as small Blorp, or
   in the form the level says the spark needs. It also reports common slips, such as a monster placed in mid-air, a
   roof low enough to hit when jumping for the flag, or a tree standing in front of the checkpoint flag.

     node tools/check-levels.js              check every level
     node tools/check-levels.js 2-3 4-1      check only these levels
     node tools/check-levels.js --map 2-3    print a level as text
     node tools/check-levels.js --quick      skip the sparks
     node tools/check-levels.js --jobs 4     share the levels out over this many processes
*/
'use strict';
const {loadGame}=require('./game.js');

/* Runs inside the game's own scope, so it can read and rewind the game's state directly. */
function harness(){
  WP.instant=true;
  /* two random streams: the game's own (rewound with each snapshot, so the game stays repeatable) and the bot's choices (never rewound) */
  let seed=1, botSeed=1, simT=0, lastTiles=null, nerf=1;
  const mix=s=>{ let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
  Math.random=()=>{ seed=(seed+0x6D2B79F5)|0; return mix(seed); };
  const rnd=()=>{ botSeed=(botSeed+0x6D2B79F5)|0; return mix(botSeed); };
  const same=(a,b)=>{ for(let i=0;i<a.length;i++) if(a[i]!==b[i]) return false; return true; };
  /* every prop the scenery places goes through put(); keep a note of each while a level loads */
  let props=null; const put0=put;
  put=function(list,model,ox,oy,oz,gain){ if(props) props.push({model,ox,oy,oz}); return put0(list,model,ox,oy,oz,gain); };
  /* a monster that keeps a history (Blorp's shadow) needs its own copy of it */
  const copies=a=>a.map(o=>{ const c=Object.assign({},o); if(o.hist) c.hist=o.hist.slice(); return c; });
  const bossOf=()=>{ for(const e of enemies) if(e.K.boss) return e; return null; };
  /* every block Blorp's head meets goes through bumpBlock(); keep a note of each while a jump for the flag is tried */
  let knocks=null; const bump0=bumpBlock;
  bumpBlock=function(tx,ty,above){ if(knocks&&!above) knocks.push([tx,ty]); return bump0(tx,ty,above); };

  function snap(){
    const p=Object.assign({},player); p.riding=player.riding?plats.indexOf(player.riding):-1; p.warp=player.warp?Object.assign({},player.warp):null; p.pod=player.pod?Object.assign({},player.pod):null;
    if(!lastTiles||!same(lastTiles,tiles)) lastTiles=tiles.slice();
    const cr=new Map(); for(const [k,c] of crumbles) cr.set(k,Object.assign({},c));
    return {p,inp:Object.assign({},input),g:Object.assign({},G,{sparks:G.sparks.slice()}),tiles:lastTiles,multi:new Map(multi),cr,th:new Set(togHold),sw:swOn,room:L.rooms.indexOf(room),
      en:copies(enemies),it:copies(items),sh:copies(shots),bo:copies(bombs),wv:copies(waves),
      pl:plats.map(q=>[q.x,q.y,q.t,q.dx,q.dy,q.trig,q.vy,q.off]),fb:firebars.map(f=>f.a),jt:jets.map(j=>[j.t,j.on]),cn:cannons.map(c=>c.t),pd:pods.map(d=>d.t),sd:sparks.map(s=>s.got),
      gy:geysers.map(g=>[g.t,g.on]),lz:lasers.map(z=>[z.t,z.on]),ch:chutes.map(c=>c.t),liq:L.liquidY,bd:baronDark,
      cam:[camX,camY,camLead,focusY],seed,time:simT};
  }
  function restore(s){
    Object.assign(player,s.p); player.riding=s.p.riding>=0?plats[s.p.riding]:null; player.warp=s.p.warp?Object.assign({},s.p.warp):null; player.pod=s.p.pod?Object.assign({},s.p.pod):null;
    Object.assign(input,s.inp); Object.assign(G,s.g); G.sparks=s.g.sparks.slice();
    tiles.set(s.tiles); lastTiles=s.tiles;
    multi.clear(); for(const [k,v] of s.multi) multi.set(k,v);
    crumbles.clear(); for(const [k,c] of s.cr) crumbles.set(k,Object.assign({},c));
    togHold.clear(); for(const k of s.th) togHold.add(k); swOn=s.sw; room=L.rooms[s.room];
    enemies=copies(s.en); items=copies(s.it); shots=copies(s.sh); bombs=copies(s.bo); waves=copies(s.wv);
    s.pl.forEach((q,i)=>{ const o=plats[i]; o.x=q[0]; o.y=q[1]; o.t=q[2]; o.dx=q[3]; o.dy=q[4]; o.trig=q[5]; o.vy=q[6]; o.off=q[7]; });
    s.fb.forEach((a,i)=>{ firebars[i].a=a; }); s.jt.forEach((q,i)=>{ jets[i].t=q[0]; jets[i].on=q[1]; }); s.cn.forEach((t,i)=>{ cannons[i].t=t; }); s.pd.forEach((t,i)=>{ pods[i].t=t; });
    s.sd.forEach((g,i)=>{ sparks[i].got=g; });
    s.gy.forEach((q,i)=>{ geysers[i].t=q[0]; geysers[i].on=q[1]; }); s.lz.forEach((q,i)=>{ lasers[i].t=q[0]; lasers[i].on=q[1]; }); s.ch.forEach((t,i)=>{ chutes[i].t=t; });
    L.liquidY=s.liq; for(const w of L.waters) if(w.base) w.y1=s.liq+0.14; baronDark=s.bd;
    camX=s.cam[0]; camY=s.cam[1]; camLead=s.cam[2]; focusY=s.cam[3]; seed=s.seed; simT=s.time; bumps=[];
  }
  /* one tick of the real game; any upward launch is trimmed so the bot never relies on a full-height jump */
  function adv(){ const vy=player.vy; step(STEP); updateCamera(STEP,false); simT+=STEP; if(player.vy>vy+5&&!player.pod&&player.launchT<=0) player.vy*=nerf; }
  function start(idx,form){
    G.lives=3; G.cp=false; G.score=0; G.coins=0; G.bossSeen=false; G.bossDead=false; G.sparks=LEVELS.map(()=>0); player.form=form;
    loadLevel(idx,false); G.state='play'; simT=0; lastTiles=null;
    input.left=input.right=input.jump=input.run=input.down=false; input.jumpBuf=0; input.runEdge=false; input.downEdge=false;
  }
  /* How far every open tile is from a target, counted in tiles through open space, pipes included. Gravity is ignored:
     this only tells the bot which of the places it has reached is the most promising. */
  function field(tx,ty){
    const d=new Int32Array(W*H).fill(-1), q=[]; let h=0;
    const open=(x,y)=>{ if(x<0||x>=W||y<0||y>=H) return false; const id=tiles[y*W+x]; return id===RED||id===BLUE||id===CRUMBLE||id===BRICK||SOLID[id]!==1; };
    const push=(x,y,n)=>{ if(open(x,y)&&d[y*W+x]<0){ d[y*W+x]=n; q.push(x,y); } };
    push(clamp(tx,0,W-1),clamp(ty,0,H-1),0);
    while(h<q.length){ const x=q[h++], y=q[h++], n=d[y*W+x]+1;
      push(x+1,y,n); push(x-1,y,n); push(x,y+1,n); push(x,y-1,n);
      for(const w of L.warps){ if(w.enter) continue; if(Math.floor(w.x)===x&&w.y===y) for(const o of L.warps) if(o.enter&&o.tag===w.tag) push(Math.floor(o.x),o.y,n+2); }
      for(const w of L.warps){ if(!w.enter||Math.floor(w.x)!==x||w.y!==y) continue; for(const o of L.warps) if(o!==w&&o.enter&&o.tag===w.tag) push(Math.floor(o.x),o.y,n+2); }
    }
    return (x,y)=>{ const v=d[clamp(Math.floor(y),0,H-1)*W+clamp(Math.floor(x),0,W-1)]; return v<0?1e6:v; };
  }

  /* Try a short burst of play from wherever the game currently is. */
  function rollout(form,onStand,done){
    const n=1+((rnd()*3)|0);
    for(let m=0;m<n;m++){
      const r=rnd(); let dir=r<0.6?1:r<0.8?-1:0;
      const kind=rnd(), run=rnd()<0.5;
      if(kind<0.24){
        /* taps: for swimming, for kicking from wall to wall, for a second jump in the air */
        const gap=0.14+rnd()*0.4, dur=0.5+rnd()*2.2, flip=rnd()<0.5, hold=0.05+rnd()*0.3; let next=0, since=9;
        for(let t=0;t<dur;t+=STEP){
          if(t>=next){ next=t+gap; input.jumpBuf=0.11; input.jump=true; since=0; if(flip&&t>0) dir=-dir||1; }
          since+=STEP; if(since>hold) input.jump=false;
          input.left=dir<0; input.right=dir>0; input.run=run;
          adv();
          if(player.dead||player.form<form) return 'dead';
          if(done()) return 'win';
        }
      } else {
        const jump=rnd()<0.6, hold=form===3&&rnd()<0.3?0.5+rnd()*3:0.04+rnd()*0.58; /* a long hold is a glide */
        const dur=jump?3.2:0.1+rnd()*0.6;
        let sw=rnd()<0.3?rnd()*0.9:-1; const swDir=((rnd()*3)|0)-1;
        let dn=rnd()<0.16?rnd()*0.8:-1;
        let ds=form===4&&rnd()<0.35?rnd()*0.7:-1; /* the sun form's dash */
        if(jump){ input.jumpBuf=0.11; input.jump=true; }
        for(let t=0;t<dur;t+=STEP){
          if(jump&&t>=hold) input.jump=false;
          if(sw>=0&&t>=sw){ dir=swDir; sw=-1; }
          if(dn>=0&&t>=dn){ input.down=true; input.downEdge=true; dn=-1; }
          if(ds>=0&&t>=ds){ input.runEdge=true; ds=-1; }
          input.left=dir<0; input.right=dir>0; input.run=run;
          adv();
          if(player.dead||player.form<form) return 'dead';
          if(done()) return 'win';
          if(jump&&t>0.1&&player.onGround&&!player.warp) break;
        }
        input.down=false;
        /* a pipe or a launch pod carries Blorp on by itself: wait for it */
        for(let i=0;i<300&&(player.warp||player.pod);i++){ adv(); if(player.dead) return 'dead'; }
      }
      input.jump=false;
      if(player.onGround||player.swim) onStand();
    }
    return '';
  }

  /* target: 'goal', or the number of a spark */
  function run(idx,form,budget,sd,margin,target){
    seed=1; botSeed=sd||1; nerf=margin||1; start(idx,form);
    const sparkRun=target!=='goal', boss=!sparkRun&&L.boss;
    if(sparkRun&&!sparks[target]) return {ok:false,rolls:0,cells:0,why:'no such spark'};
    const tgt=sparkRun?[sparks[target].x,sparks[target].y]:L.goal?[L.goal.x-1,L.goal.y+1]:[L.boss.x,3];
    const dist=field(Math.floor(tgt[0]),Math.floor(tgt[1]));
    const done=()=>sparkRun?sparks[target].got:!!(player.goal||G.bossDead);
    const cells=new Map(), list=[]; let front=[], best=1e9, rolls=0;
    const stand=()=>{
      const b=boss?bossOf():null, hp=b?b.hp:0, k=(player.x|0)+'_'+Math.round(player.y*2)+'_'+hp+(swOn?'':'s');
      let c=cells.get(k);
      if(!c){ const d=dist(player.x,player.y+0.5); c={x:player.x,y:player.y,d,hp,near:b&&G.bossSeen?Math.abs(player.x-b.x):0,snaps:[snap()],n:0}; cells.set(k,c); list.push(c); if(d<best) best=d; }
      else if(c.snaps.length<3&&simT-c.snaps[c.snaps.length-1].time>1.5) c.snaps.push(snap());
    };
    const score=c=>-c.hp*1000+(boss&&c.near?-c.near-200:-c.d);
    const choose=()=>{
      const r=rnd();
      if(r<0.62&&front.length) return front[(rnd()*front.length)|0];
      if(r<0.9){ let bst=null,bs=-1e9; for(let i=0;i<4;i++){ const c=list[(rnd()*list.length)|0], s=score(c)-Math.sqrt(c.n)*0.6; if(s>bs){ bs=s; bst=c; } } return bst; }
      return list[(rnd()*list.length)|0];
    };
    stand();
    for(;rolls<budget;rolls++){
      if(rolls%150===0) front=list.slice().sort((a,b)=>score(b)-score(a)).slice(0,36);
      const c=choose(); c.n++; restore(c.snaps[(rnd()*c.snaps.length)|0]);
      if(rollout(form,stand,done)==='win'){
        const t=simT; if(sparkRun) return {ok:true,time:t,rolls,cells:list.length,why:''};
        input.left=input.right=input.jump=input.run=input.down=false;
        for(let i=0;i<120*20&&G.state==='play';i++) adv();
        const ok=G.state==='clear'||G.state==='win';
        return {ok,time:t,rolls,cells:list.length,why:ok?'':'reached the end but the level never finished (state '+G.state+', x '+player.x.toFixed(1)+', y '+player.y.toFixed(1)+')'};
      }
    }
    const far=list.slice().sort((a,b)=>score(b)-score(a))[0];
    return {ok:false,rolls,cells:list.length,why:'stuck: got to '+far.x.toFixed(1)+','+far.y.toFixed(1)+', still '+far.d+' tiles from '+(sparkRun?'the spark at '+tgt[0]+','+tgt[1]:boss?'the boss (hp left '+far.hp+')':'the flag')};
  }

  /* A jump for the flag must not end on Blorp's head. From every step of the last staircase he jumps for the pole with the
     button held, from a standstill, a walk and a full run, small and big; the real game says whether his head met anything. */
  function headroom(idx){
    const out=[];
    for(const form of [0,1]){
      start(idx,form); if(!L.goal) return out;
      enemies=[]; /* this is about the roof, not about who is flying under it */
      const gx=L.goal.x, gy=L.goal.y, base=snap(); let hit=null;
      for(let x=gx-12;x<gx&&!hit;x++){
        let top=-1; for(let y=0;y<H;y++){ if(solidAt(x,y)) top=y; else if(top>=0) break; }
        if(top<gy) continue; /* level ground, not a step */
        for(const vx of [0,5.5,RUN_MAX]){
          restore(base); player.x=x+0.5; player.y=top+1; player.vx=vx; player.vy=0; player.onGround=true;
          input.left=false; input.right=input.run=input.jump=true; input.jumpBuf=0.11; knocks=[];
          for(let i=0;i<120*4&&!player.goal&&!player.dead;i++){ step(STEP); if(player.onGround&&i>30) break; }
          if(knocks.length){ hit={x,at:knocks[0]}; break; }
        }
      }
      knocks=null; input.right=input.run=input.jump=false;
      if(hit) out.push((form?'big':'small')+' Blorp hits his head at '+hit.at[0]+','+hit.at[1]+' when he jumps for the flag from the step at x '+hit.x);
    }
    return out;
  }

  /* Mistakes that are easy to make when writing a level by hand. */
  function lint(idx){
    const L0=LEVELS[idx](), W0=L0.W, H0=L0.H, t=L0.tiles, out=[];
    const at=(x,y)=>(x<0||x>=W0||y<0||y>=H0)?AIR:t[y*W0+x], sol=(x,y)=>SOLID[at(x,y)]===1||at(x,y)===RED, floor=(x,y)=>sol(x,y)||at(x,y)===SEMI||at(x,y)===BLUE;
    const onFloor=(what,x,y)=>{ const tx=Math.floor(x), ty=Math.floor(y+0.01);
      if(sol(tx,ty)) out.push(what+' at '+x+','+y+' is inside a solid tile');
      else if(Math.abs(y-Math.round(y))>0.01||!floor(tx,ty-1)) out.push(what+' at '+x+','+y+' is not standing on anything'); };
    const wet=(x,y)=>L0.waters.some(w=>x>=w.x0&&x<w.x1&&y>=w.y0&&y<w.y1)||(THEMES[L0.theme].liquid.kind==='water'&&y<L0.liquidY);
    onFloor('start',L0.start.x,L0.start.y);
    if(L0.checkpoint) onFloor('checkpoint',L0.checkpoint.x,L0.checkpoint.y);
    for(const s of L0.springs) onFloor('spring',s.x,s.y);
    for(const s of L0.signs) onFloor('sign',s.x,s.y);
    for(const g of L0.geysers) onFloor('geyser',g.x,g.y);
    for(const z of L0.lasers){ const v={r:[1,0],l:[-1,0],u:[0,1],d:[0,-1]}[z.dir]; if(!v) out.push('laser at '+z.x+','+z.y+' points nowhere ("'+z.dir+'")'); else if(sol(z.x+v[0],z.y+v[1])) out.push('laser at '+z.x+','+z.y+' shines straight into a wall'); }
    for(const c of L0.chutes) if(sol(c.x+c.dir,c.y)) out.push('chute at '+c.x+','+c.y+' opens onto a wall');
    for(const e of L0.enemies){
      const K=ETYPES[e.type]; if(!K){ out.push('unknown monster "'+e.type+'" at '+e.x+','+e.y); continue; }
      if(e.type==='chomper') continue;
      if(e.type==='icicle'){ if(sol(Math.floor(e.x),Math.floor(e.y))) out.push('icicle at '+e.x+','+e.y+' is inside a solid tile'); if(!floor(Math.floor(e.x),Math.floor(e.y)+1)) out.push('icicle at '+e.x+','+e.y+' has nothing to hang from'); continue; }
      if(e.type==='jelly'||e.type==='puffer'){ if(!wet(e.x,e.y+0.4)) out.push(e.type+' at '+e.x+','+e.y+' is not in water'); }
      if(e.type==='shade') continue;
      if(K.fly){ if(e.type!=='ghost'&&e.type!=='snapper'&&e.type!=='ember'&&sol(Math.floor(e.x),Math.floor(e.y+0.2))) out.push(e.type+' at '+e.x+','+e.y+' starts inside a solid tile'); continue; }
      onFloor(e.type,e.x,e.y);
    }
    for(const k of L0.contents.keys()){ const id=t[k]; if(id!==BRICK&&id!==QBLOCK&&id!==HIDDEN) out.push('block contents at '+(k%W0)+','+Math.floor(k/W0)+' have no block'); }
    for(let x=0;x<W0;x++) for(let y=0;y<2;y++){ const id=at(x,y); if(id!==AIR&&id!==GROUND&&id!==HARD&&id!==ICE&&id!==CONV_L&&id!==CONV_R&&id!==STICKY&&id!==BOUNCE&&!((id===SEMI||id===CRUMBLE)&&y===1)) out.push('tile '+id+' at '+x+','+y+' is below the walking surface'); }
    if(L0.sparks.length!==3) out.push('level has '+L0.sparks.length+' sun sparks, not 3');
    for(const s of L0.sparks) if(sol(Math.floor(s.x),Math.floor(s.y))) out.push('spark at '+s.x+','+s.y+' is inside a solid tile');
    const tags={}; for(const w of L0.warps) (tags[w.tag]=tags[w.tag]||[]).push(w);
    for(const k in tags){ if(tags[k].length!==2) out.push('pipe "'+k+'" has '+tags[k].length+' ends, not 2'); else if(!tags[k].some(w=>w.enter)) out.push('pipe "'+k+'" cannot be entered from either end'); }
    const r0=L0.rooms[0], inRoom=(x,r)=>x>=r.x0&&x<r.x1;
    if(!inRoom(L0.start.x,r0)) out.push('the start is outside the first room');
    for(const r of L0.rooms) if(r.x1-r.x0<24) out.push('room from x '+r.x0+' is narrower than the screen (needs 24 tiles)');
    if(L0.goal){ const gx=L0.goal.x, gy=L0.goal.y;
      if(!inRoom(gx,r0)||r0.x1<gx+10) out.push('the first room is too narrow for the hut after the flag (needs to reach x '+(gx+10)+')');
      for(let x=gx-1;x<=gx+8;x++){ if(!sol(x,gy-1)) out.push('no ground at x '+x+' around the flag'); for(let y=gy;y<Math.min(H0,gy+10);y++) if(at(x,y)!==AIR&&!(x===gx&&y===gy)) out.push('tile in the way at '+x+','+y+' around the flag'); } }
    else if(!L0.boss) out.push('level has neither a flag nor a boss');
    for(const n of headroom(idx)) out.push(n);
    if(L0.boss){ const b=L0.boss; if(!ETYPES[b.kind]||!ETYPES[b.kind].boss) out.push('unknown boss "'+b.kind+'"'); if(!(b.x0<b.x&&b.x<b.x1)) out.push('boss starts outside its arena'); onFloor('boss',b.x,b.y); }
    /* scenery: nothing tall may stand between the camera and the checkpoint flag. The flag stands at depth CP_Z and
       spans about a tile to the right of its post; the 0.75 allows for props further back shifting sideways on screen. */
    props=[]; loadLevel(idx,false); const placed=props; props=null;
    if(L0.checkpoint){
      const cp=L0.checkpoint, seen=new Set();
      for(const q of placed) for(const b of q.model){
        const x0=(b[0]+q.ox)/8, x1=x0+b[3]/8, y0=(b[1]+q.oy)/8, y1=y0+b[4]/8, front=(b[2]+b[5]+q.oz)/8;
        if(front>CP_Z-0.075&&y1>cp.y+1&&y0<cp.y+2.4&&x1>cp.x-0.25-0.75&&x0<cp.x+0.95+0.75) seen.add(Math.round(q.ox/8));
      }
      for(const x of seen) out.push('a tall prop near x '+x+' stands in front of the checkpoint at x '+cp.x);
    }
    /* nor may anything tall stand where the hut after the flag does: it would poke out of the walls or roof */
    if(L0.goal){
      const ox=(L0.goal.x+HUT_DX)*8, gy8=L0.goal.y*8, seen=new Set(); let hx0=1e9, hx1=-1e9, hz0=1e9, hz1=-1e9;
      for(const b of mHut()){ hx0=Math.min(hx0,b[0]+ox); hx1=Math.max(hx1,b[0]+b[3]+ox); hz0=Math.min(hz0,b[2]+HUT_Z); hz1=Math.max(hz1,b[2]+b[5]+HUT_Z); }
      for(const q of placed){
        if(q.ox===ox&&q.oz===HUT_Z) continue; /* the hut itself */
        if(Math.abs(q.oy-gy8)>4) continue;    /* something on another floor of a tall level */
        for(const b of q.model){ const x0=b[0]+q.ox, x1=x0+b[3], top=b[1]+b[4]+q.oy, back=b[2]+q.oz, front=back+b[5];
          if(top>gy8+12&&x1>hx0&&x0<hx1&&front>hz0&&back<hz1) seen.add(Math.round(q.ox/8)); }
      }
      for(const x of seen) out.push('a tall prop near x '+x+' overlaps the hut after the flag');
    }
    for(const p of L0.plats){ const sw=p.axis==='s'?p.range*Math.sin(SWING_MAX):0, r=p.axis==='c'?p.range:sw, x0=p.x-r, x1=p.x+(p.axis==='x'?p.range:r)+p.w, y0=p.y-(p.axis==='c'?r:0), y1=p.y+(p.axis==='y'?p.range:p.axis==='s'?p.range:r); if(x0<0||x1>W0||y0<1||y1>H0-2) out.push('moving ledge at '+p.x+','+p.y+' leaves the level'); }
    return out;
  }

  function map(idx){
    const L0=LEVELS[idx](), W0=L0.W, H0=L0.H, t=L0.tiles, CH=' #B?UHPh=^oI<>KXRUcJYE', rows=[];
    for(let y=H0-1;y>=0;y--){ const r=[]; for(let x=0;x<W0;x++){ const id=t[y*W0+x]; r.push(id===AIR&&L0.waters.some(w=>x>=w.x0&&x<w.x1&&y>=w.y0&&y<w.y1)?'~':id===BLUE?'u':(CH[id]||'?')); } rows.push(r); }
    const put_=(x,y,c)=>{ const tx=Math.floor(x), ty=Math.floor(y); if(tx>=0&&tx<W0&&ty>=0&&ty<H0) rows[H0-1-ty][tx]=c; };
    const EC={blob:'b',shellby:'s',spikit:'k',batty:'y',boing:'g',chomper:'c',icicle:'i',prickle:'p',snippy:'n',jelly:'j',puffer:'f',snapper:'a',ember:'e',ghost:'G',clonk:'T',fizzle:'z',zappy:'Z',rammy:'r',
      puff:'d',buzz:'B',gloop:'l',ribbit:'q',wisp:'w',swoop:'V',bones:'x',mimic:'M',drone:'N',stack:'3',saw:'%',balloon:'0',shade:'&'};
    for(const e of L0.enemies) put_(e.x,e.y,EC[e.type]||'e');
    for(const s of L0.springs) put_(s.x,s.y,'S');
    for(const p of L0.plats) for(let i=0;i<p.w;i++) put_(p.x+i,p.y-1,p.axis==='f'?'_':'-');
    for(const f of L0.firebars) put_(f.x,f.y,'*');
    for(const d of L0.pods) put_(d.x,d.y,'O');
    for(const d of L0.jets) put_(d.x,d.y,'!');
    for(const d of L0.geysers) put_(d.x,d.y,'|');
    for(const s of L0.signs) put_(s.x,s.y,'t');
    for(const w of L0.warps) put_(w.x,w.y,w.enter?'v':'A');
    for(const s of L0.sparks) put_(s.x,s.y,'D');
    if(L0.checkpoint) put_(L0.checkpoint.x,L0.checkpoint.y,'C');
    if(L0.goal) put_(L0.goal.x,L0.goal.y+1,'F');
    if(L0.boss) put_(L0.boss.x,L0.boss.y,'W');
    put_(L0.start.x,L0.start.y,'@');
    let ruler=''; for(let x=0;x<W0;x+=10) ruler+=String(x).padEnd(10);
    return rows.map((r,i)=>String(H0-1-i).padStart(2)+' '+r.join('')).join('\n')+'\n   '+ruler;
  }
  const info=idx=>{ const L0=LEVELS[idx](); return {label:L0.label,name:L0.name,theme:L0.theme,W:L0.W,H:L0.H,sparks:L0.sparks.map(s=>s.needs)}; };
  /* scripted input, for debugging the checker itself: acts is a list of [seconds, dir, run, jump, down] */
  function trace(idx,form,acts){
    seed=1; nerf=1; start(idx,form); const out=[];
    for(const a of acts){ if(a[3]){ input.jumpBuf=0.11; } input.jump=!!a[3]; if(a[4]){ input.down=true; input.downEdge=true; } else input.down=false;
      for(let t=0;t<a[0];t+=STEP){ input.left=a[1]<0; input.right=a[1]>0; input.run=!!a[2]; adv(); }
      out.push({t:+simT.toFixed(2),x:+player.x.toFixed(2),y:+player.y.toFixed(2),vx:+player.vx.toFixed(2),vy:+player.vy.toFixed(2),ground:player.onGround,swim:player.swim,wall:player.wall,dead:player.dead,state:G.state,room:L.rooms.indexOf(room),got:sparks.map(s=>s.got?1:0).join('')}); }
    return out;
  }
  return {count:LEVELS.length,run,lint,map,info,trace,tp:(x,y)=>{ player.x=x; player.y=y; player.vx=player.vy=0; }};
}

if(require.main!==module){ module.exports=loadGame(harness).api; return; }
const args=process.argv.slice(2), flag=n=>args.includes('--'+n), jobsAt=args.indexOf('--jobs'), jobs=jobsAt>=0?+args[jobsAt+1]:1;
const names=args.filter((a,i)=>!a.startsWith('--')&&i!==jobsAt+1||(jobsAt<0&&!a.startsWith('--')));
/* with --jobs, hand the levels out to child processes and print what they say, in order */
if(jobs>1){
  const {spawnSync,spawn}=require('child_process');
  const hx0=loadGame(harness).api, all=[]; for(let i=0;i<hx0.count;i++) all.push(hx0.info(i).label);
  const picked=names.length?all.filter(l=>names.includes(l)):all, out=new Map(); let left=picked.length, next=0, shown=0, bad=0;
  const go=()=>{ if(next>=picked.length) return; const l=picked[next++]; let buf='';
    const c=spawn(process.execPath,[__filename,l].concat(flag('quick')?['--quick']:[]));
    c.stdout.on('data',d=>buf+=d); c.stderr.on('data',d=>buf+=d);
    c.on('close',code=>{ out.set(l,buf.split('\n').filter(s=>s&&!/^all 1 levels|^1 of 1 levels/.test(s)).join('\n')); if(code) bad++;
      while(shown<picked.length&&out.has(picked[shown])) console.log(out.get(picked[shown++]));
      if(--left===0){ console.log(bad?bad+' levels failed':'all levels can be finished'); process.exit(bad?1:0); } go(); }); };
  for(let i=0;i<jobs;i++) go();
  return;
}
const hx=loadGame(harness).api;
const all=[]; for(let i=0;i<hx.count;i++) all.push(Object.assign({idx:i},hx.info(i)));
const picked=names.length?all.filter(l=>names.includes(l.label)):all;
if(names.length&&picked.length!==names.length){ console.error('unknown level; levels are '+all.map(l=>l.label).join(' ')); process.exit(2); }
if(flag('map')){ for(const l of picked) console.log(l.label+' '+l.name+' ('+l.theme+', '+l.W+' wide, '+l.H+' tall)\n'+hx.map(l.idx)+'\n'); process.exit(0); }

let bad=0;
for(const l of picked){
  const notes=hx.lint(l.idx), res=[], sh=[];
  for(const form of [0,1]){
    let r=null;
    for(let attempt=0;attempt<3&&!(r&&r.ok);attempt++) r=hx.run(l.idx,form,40000,1+attempt*7919+form,0.95,'goal');
    res.push(r);
  }
  if(!flag('quick')) for(let i=0;i<l.sparks.length;i++){
    const form=l.sparks[i]==='fluff'?3:l.sparks[i]==='fire'?2:l.sparks[i]==='sun'?4:0; let r=null;
    for(let attempt=0;attempt<3&&!(r&&r.ok);attempt++) r=hx.run(l.idx,form,30000,11+attempt*7919+i,0.97,i);
    sh.push(r);
  }
  const ok=res.every(r=>r.ok)&&sh.every(r=>r.ok)&&!notes.length; if(!ok) bad++;
  const cell=r=>r.ok?(r.time.toFixed(0)+'s').padStart(5):' FAIL';
  console.log((ok?'ok  ':'FAIL')+' '+l.label.padEnd(4)+l.name.padEnd(20)+' small '+cell(res[0])+'  big '+cell(res[1])+(sh.length?'  sparks '+sh.map(r=>r.ok?'*':'x').join(''):''));
  for(const n of notes) console.log('       '+n);
  res.forEach((r,i)=>{ if(!r.ok) console.log('       '+(i?'big':'small')+' Blorp: '+r.why); });
  sh.forEach((r,i)=>{ if(!r.ok) console.log('       spark '+(i+1)+': '+r.why); });
}
console.log(bad?bad+' of '+picked.length+' levels failed':'all '+picked.length+' levels can be finished');
process.exit(bad?1:0);
