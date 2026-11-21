/* ================= tiles & the level builder ================= */
/* A level is a grid of tiles W wide and H tall (16 unless it says otherwise) plus lists of the things that are not
   tiles. The levels themselves live in src/worlds/, one file per world, next to that world's looks. */
const AIR=0,GROUND=1,BRICK=2,QBLOCK=3,USED=4,HARD=5,PIPE=6,HIDDEN=7,SEMI=8,SPIKE=9,COIN=10,ICE=11,CONV_L=12,CONV_R=13,CRUMBLE=14,SWITCH=15,RED=16,BLUE=17,CANNON=18,BOUNCE=19,STICKY=20,EMITTER=21;
/* RED and BLUE are solid by turns: see solidAt in e_world.js. BOUNCE throws whatever lands on it back into the air; STICKY is
   slow to walk on and clings to whoever slides down it; EMITTER is the block a laser or a chute is housed in. */
const SOLID=[0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,1,1,1,1];

function LevelBuilder(W,theme,H){
  H=H||16;
  const t=new Uint8Array(W*H);
  const L={W,H,theme,name:'',tiles:t,contents:new Map(),enemies:[],pipes:[],plats:[],springs:[],firebars:[],waters:[],sparks:[],warps:[],rooms:[],pods:[],winds:[],jets:[],signs:[],cannons:[],geysers:[],lasers:[],chutes:[],
    beat:0,rise:null,
    start:{x:3.5,y:2},checkpoint:null,goal:null,boss:null,liquidY:1.3,look:null};
  const set=(x,y,id)=>{ if(x>=0&&x<W&&y>=0&&y<H) t[y*W+x]=id; };
  const B={
    L,
    fill(x0,y0,x1,y1,id){ for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) set(x,y,id); return B; },
    clear(x0,y0,x1,y1){ return B.fill(x0,y0,x1,y1,AIR); },
    ground(x0,x1,h){ return B.fill(x0,0,x1,(h||2)-1,GROUND); },
    /* a strip of slippery ice; with no y it replaces the top of ordinary ground */
    ice(x0,x1,y){ return B.fill(x0,y===undefined?1:y,x1,y===undefined?1:y,ICE); },
    /* B brick, ? coin block, M power-up block (muffin, then chili), F fluff block (muffin, then candyfloss), O sun block
       (muffin, then sunbloom), S star block, L life block, m many-coin brick, s star brick, I hidden life, i hidden coin,
       H hard, # ice, = one-way ledge, C coin, ^ spikes, K crumbling block, X toggle switch, R red block, U blue block,
       < > conveyor, J bouncy block, Y sticky block, anything else: skip */
    row(x,y,s){ for(let i=0;i<s.length;i++){ const c=s[i],k=y*W+x+i;
      if(c==='B') set(x+i,y,BRICK);
      else if(c==='?') set(x+i,y,QBLOCK);
      else if(c==='M'){ set(x+i,y,QBLOCK); L.contents.set(k,'power'); }
      else if(c==='F'){ set(x+i,y,QBLOCK); L.contents.set(k,'fluff'); }
      else if(c==='O'){ set(x+i,y,QBLOCK); L.contents.set(k,'sun'); }
      else if(c==='S'){ set(x+i,y,QBLOCK); L.contents.set(k,'star'); }
      else if(c==='L'){ set(x+i,y,QBLOCK); L.contents.set(k,'life'); }
      else if(c==='m'){ set(x+i,y,BRICK); L.contents.set(k,'multi'); }
      else if(c==='s'){ set(x+i,y,BRICK); L.contents.set(k,'star'); }
      else if(c==='I'){ set(x+i,y,HIDDEN); L.contents.set(k,'life'); }
      else if(c==='i') set(x+i,y,HIDDEN);
      else if(c==='H') set(x+i,y,HARD);
      else if(c==='#') set(x+i,y,ICE);
      else if(c==='=') set(x+i,y,SEMI);
      else if(c==='C') set(x+i,y,COIN);
      else if(c==='^') set(x+i,y,SPIKE);
      else if(c==='K') set(x+i,y,CRUMBLE);
      else if(c==='X') set(x+i,y,SWITCH);
      else if(c==='R') set(x+i,y,RED);
      else if(c==='U') set(x+i,y,BLUE);
      else if(c==='<') set(x+i,y,CONV_L);
      else if(c==='>') set(x+i,y,CONV_R);
      else if(c==='J') set(x+i,y,BOUNCE);
      else if(c==='Y') set(x+i,y,STICKY);
    } return B; },
    coins(x,y,n){ for(let i=0;i<n;i++) set(x+i,y,COIN); return B; },
    /* a column of coins, and a filled block of them */
    coinCol(x,y,n){ for(let i=0;i<n;i++) set(x,y+i,COIN); return B; },
    coinBox(x0,y0,x1,y1){ return B.fill(x0,y0,x1,y1,COIN); },
    arc(x,y,n){ for(let i=0;i<n;i++){ const u=(i/(n-1))*2-1; set(x+i,y+Math.round((1-u*u)*2),COIN); } return B; },
    stairs(x,n,dir,base){ base=base||2; for(let i=0;i<n;i++){ const h=(dir||1)>0?i+1:n-i; B.fill(x+i,base,x+i,base+h-1,HARD); } return B; },
    pipe(x,h,chomp,base){ base=base||2; B.fill(x,base,x+1,base+h-1,PIPE); L.pipes.push({x,y:base,h}); if(chomp) L.enemies.push({type:'chomper',x:x+1,y:base+h}); return B; },
    /* A pipe Blorp can go down. Two warps with the same tag are the two ends of one pipe; `oneWay` makes this end
       an exit only. */
    warp(x,h,tag,oneWay,base){ base=base||2; B.pipe(x,h,false,base); L.warps.push({x:x+1,y:base+h,tag,enter:!oneWay}); return B; },
    enemy(type,x,y,o){ L.enemies.push(Object.assign({type,x:x+0.5,y:y===undefined?2:y},o||{})); return B; },
    /* a moving ledge: axis 'x' or 'y' slides `range` tiles and back; 'c' circles at that radius; 's' swings like a
       pendulum on a rope `range` tiles long, hung straight above where the ledge is put */
    plat(x,y,w,axis,range,speed,phase){ L.plats.push({x,y,w,axis,range,speed,phase:phase||0}); return B; },
    /* a ledge that drops away a moment after Blorp lands on it, and comes back later */
    fall(x,y,w){ L.plats.push({x,y,w:w||3,axis:'f',range:0,speed:0,phase:0}); return B; },
    spring(x,y){ L.springs.push({x:x+0.5,y:y||2}); return B; },
    firebar(x,y,n,speed,phase){ set(x,y,HARD); L.firebars.push({x:x+0.5,y:y+0.5,n:n||6,speed:speed||1.7,phase:phase||0}); return B; },
    spikes(x0,x1,y){ for(let x=x0;x<=x1;x++) set(x,y||2,SPIKE); return B; },
    /* a box of water to swim in, in tiles, both corners included; its surface is the top of row y1 */
    water(x0,y0,x1,y1){ L.waters.push({x0,y0,x1:x1+1,y1:y1+1}); return B; },
    /* where the deadly stuff in the pits stands; 0 or less for none */
    liquid(y){ L.liquidY=y; return B; },
    /* one of the level's three sun sparks. `needs` names a power-up without which it cannot be reached ('fluff', 'fire' or 'sun'). */
    spark(x,y,needs){ L.sparks.push({x:x+0.5,y:y+0.5,needs:needs||null}); return B; },
    /* A part of the level the camera stays inside. The first room is the one the level starts in; with none, the whole
       level is one room. A `bonus` room plays the bonus tune. */
    room(x0,x1,y0,y1,bonus){ L.rooms.push({x0,x1:x1+1,y0:y0||0,y1:y1===undefined?H:y1+1,bonus:!!bonus}); return B; },
    /* a launch pod at a tile, aimed `ang` degrees from straight up (positive leans right), firing at `power` tiles a second */
    pod(x,y,ang,power){ L.pods.push({x:x+0.5,y:y+0.5,ang:(ang||0)*Math.PI/180,power:power||24}); return B; },
    /* moving air: a box, and the push it gives in tiles per second squared. A fan is drawn under an updraft. */
    wind(x0,y0,x1,y1,ax,ay){ L.winds.push({x0,y0,x1:x1+1,y1:y1+1,ax:ax||0,ay:ay||0}); return B; },
    /* a vent on the tile below (x,y) that shoots a flame `len` tiles up for part of every `period` seconds */
    jet(x,y,len,period,phase){ L.jets.push({x:x+0.5,y,len:len||3,period:period||3,phase:phase||0}); return B; },
    /* A spout in the floor at row y that throws a column of water `h` tiles high for part of every `period` seconds.
       It hurts nobody: it carries Blorp to the top and holds him there, and he can jump off it. */
    geyser(x,y,h,period,phase){ L.geysers.push({x:x+0.5,y:y===undefined?2:y,h:h||6,period:period||4.5,phase:phase||0}); return B; },
    /* A laser: a block at (x,y) whose beam runs `dir` ('l','r','u' or 'd') for up to `len` tiles, or until something solid.
       It is on for `duty` of every `period` seconds, after a flicker of warning; a period of 0 never goes off. With
       `sw` 'red' or 'blue' it is on by turns with the blocks of that colour instead. */
    laser(x,y,dir,len,period,phase,o){ set(x,y,EMITTER); L.lasers.push(Object.assign({x,y,dir:dir||'r',len:len||6,period:period===undefined?3:period,phase:phase||0,duty:0.5,sw:null},o||{})); return B; },
    /* A hatch at (x,y) that lets a roller out every `period` seconds, rolling `dir` (-1 left, 1 right). */
    chute(x,y,period,dir,phase){ set(x,y,EMITTER); L.chutes.push({x,y,period:period||3.5,dir:dir||-1,phase:phase||0}); return B; },
    /* the level's red and blue blocks change over by themselves every `period` seconds, in time with nothing but the clock */
    beat(period){ L.beat=period||2; return B; },
    /* the stuff in the pits rises: `speed` tiles a second, up to row `to`, starting `delay` seconds into the level */
    rise(speed,to,delay){ L.rise={v:speed||0.5,to:to===undefined?H-3:to,delay:delay||0}; return B; },
    bounce(x0,x1,y){ return B.fill(x0,y,x1,y,BOUNCE); },
    sticky(x0,y0,x1,y1){ return B.fill(x0,y0,x1,y1===undefined?y0:y1,STICKY); },
    /* a block that fires rockets at Blorp */
    cannon(x,y,period,phase){ set(x,y===undefined?2:y,CANNON); L.cannons.push({x,y:y===undefined?2:y,period:period||3.2,phase:phase||0}); return B; },
    /* a signpost with a hint. {jump} {run} {down} become the names of the keys or the touch buttons. */
    sign(x,text,y){ L.signs.push({x:x+0.5,y:y||2,text}); return B; },
    conveyor(x0,x1,y,dir){ return B.fill(x0,y,x1,y,dir<0?CONV_L:CONV_R); },
    checkpoint(x,y){ L.checkpoint={x:x+0.5,y:y||2}; return B; },
    start(x,y){ L.start={x:x+0.5,y:y||2}; return B; },
    /* the flagpole, standing on a hard block at height y (the ground, unless said); it needs 18 tiles of floor after it for the hut */
    goal(x,y){ y=y||2; set(x,y,HARD); L.goal={x,y}; return B; },
    /* a boss arena: where the boss starts, how far left and right it may go, its hit points, and which boss */
    boss(x,x0,x1,hp,kind){ L.boss={x,y:2,x0,x1,hp:hp||9,kind:kind||'grump'}; return B; },
    /* which of the theme's five looks (sky and light) to use, when not the one that goes with the level's place in its world */
    look(i){ L.look=i; return B; },
    /* anything else a theme's scenery wants to know about this level, read back as S.L[key] */
    set(key,value){ L[key]=value; return B; }
  };
  return B;
}

/* ---------- the worlds ---------- */
/* Each file in src/worlds/ adds one world with defWorld({name, theme, levels:[...]}) and its looks with THEMES.name = {...}.
   finishWorlds() then makes the flat list the game plays through: each level knows its world, its place in that world,
   and a label such as 2-3. */
const WORLDS=[], THEMES={}, LEVELS=[], LABELS=[], LEVEL_WORLD=[];
function defWorld(w){ WORLDS.push(w); }
function finishWorlds(){
  WORLDS.forEach((w,wi)=>w.levels.forEach((make,si)=>{
    const label=(wi+1)+'-'+(si+1); LABELS.push(label); LEVEL_WORLD.push(wi);
    LEVELS.push(()=>{ const L=make(); L.name=w.name; L.world=wi; L.stage=si; L.stages=w.levels.length; L.label=label; if(!L.rooms.length) L.rooms.push({x0:0,x1:L.W,y0:0,y1:L.H}); return L; });
  }));
}
