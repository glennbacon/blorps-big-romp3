/* ================= the world map: the island, the route and the rules of walking ================= */
finishWorlds();
/* Nothing in this file draws. The island is a grid of voxel columns, MAP_W cells west to east and MAP_D north to south,
   with north at z = 0, so "up" on the map is north. Heights are whole steps of MAP_STEP world units. n_mapview.js
   turns the grid into a picture; tools/check-map.js checks it, and can print it as text. */
const MAP_W=78, MAP_D=54, MAP_STEP=0.5;
const MK_SEA=0, MK_LAND=1, MK_LAVA=2, MK_GOO=3, MK_POND=4;
const MAP_HOP=0.14, MAP_HOP_FAST=0.085, MAP_TILE=0.09; /* seconds per tile: walking, running, and a new path appearing */
const MAP_DIR={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};

/* a fixed scatter from 0 to 1 for each cell, so coasts are ragged and the ground is flecked the same way every time */
function mapJit(x,z){ let t=Math.imul(x*374761393+z*668265263,1274126177); t^=t>>>13; t=Math.imul(t,1274126177); return ((t^(t>>>16))>>>0)/4294967296; }
function MapBuilder(){
  const N=MAP_W*MAP_D;
  /* h: land height in steps, 0 for none. base: where a floating column stops, 0 for one that reaches the seabed.
     world: 0 to 9, or -1 for open sea. kind: one of MK_. deck: height of a bridge or stair over a gap, 0 for none.
     route: the cell's place along the route, or -1. */
  const I={h:new Uint8Array(N),base:new Uint8Array(N),world:new Int8Array(N).fill(-1),kind:new Uint8Array(N),deck:new Uint8Array(N),route:new Int16Array(N).fill(-1)};
  /* every cell inside an ellipse, with how far out it is: 0 at the middle, 1 at the edge */
  function each(cx,cz,rx,rz,rag,fn){
    for(let z=Math.max(1,Math.floor(cz-rz-1));z<=Math.min(MAP_D-2,Math.ceil(cz+rz+1));z++) for(let x=Math.max(1,Math.floor(cx-rx-1));x<=Math.min(MAP_W-2,Math.ceil(cx+rx+1));x++){
      const dx=(x+0.5-cx)/rx, dz=(z+0.5-cz)/rz, d=Math.sqrt(dx*dx+dz*dz);
      if(d<=1+(mapJit(x,z)-0.5)*rag) fn(z*MAP_W+x,Math.min(d,1));
    }
  }
  const B={
    I,
    /* an ellipse of land belonging to one world */
    blob(cx,cz,rx,rz,world,h,rag){ each(cx,cz,rx,rz,rag===undefined?0.3:rag,k=>{ I.kind[k]=MK_LAND; I.world[k]=world; I.h[k]=h; I.base[k]=0; }); return B; },
    /* a stepped hill on land that is already there; pow below 1 makes a dome, above 1 a spire */
    raise(cx,cz,r,dh,pow){ each(cx,cz,r,r,0,(k,d)=>{ if(I.kind[k]===MK_LAND) I.h[k]+=Math.round(dh*Math.pow(1-d,pow||1)); }); return B; },
    /* level an area of land */
    flat(cx,cz,rx,rz,h,rag){ each(cx,cz,rx,rz,rag||0,k=>{ if(I.kind[k]===MK_LAND) I.h[k]=h; }); return B; },
    /* level a rectangle of land, corner to corner: a terrace, a courtyard, the foot of a building */
    plate(x0,z0,x1,z1,h){ for(let z=z0;z<=z1;z++) for(let x=x0;x<=x1;x++){ const k=z*MAP_W+x; if(I.kind[k]===MK_LAND) I.h[k]=h; } return B; },
    /* turn land into a pool of lava, goo or water; it keeps its world and its height, which is the pool's rim */
    pool(cx,cz,rx,rz,kind,rag){ each(cx,cz,rx,rz,rag||0,k=>{ if(I.kind[k]===MK_LAND) I.kind[k]=kind; }); return B; },
    /* take land away again: a crack, a channel, a bay */
    cut(cx,cz,rx,rz,rag){ each(cx,cz,rx,rz,rag||0,k=>{ I.kind[k]=MK_SEA; I.h[k]=0; I.base[k]=0; I.world[k]=-1; }); return B; },
    /* make land float: its columns stop at `base` instead of reaching the seabed */
    lift(cx,cz,rx,rz,base){ each(cx,cz,rx,rz,0,k=>{ if(I.kind[k]===MK_LAND) I.base[k]=base; }); return B; },
    /* Smooth what the ragged edges leave behind: a pool that would spill into the sea gets a bank, land that hangs
       on by one side goes, and a notch of sea closed in on three sides is filled. */
    tidy(){
      const NB=[[1,0],[-1,0],[0,1],[0,-1]], solid=(x,z)=>NB.filter(d=>I.kind[(z+d[1])*MAP_W+x+d[0]]!==MK_SEA);
      const inner=fn=>{ let any=false; for(let z=1;z<MAP_D-1;z++) for(let x=1;x<MAP_W-1;x++) if(fn(x,z,z*MAP_W+x)) any=true; return any; };
      inner((x,z,k)=>{ if(I.kind[k]===MK_SEA||I.kind[k]===MK_LAND) return;
        for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ const n=(z+dz)*MAP_W+x+dx; if(I.kind[n]===MK_SEA){ I.kind[n]=MK_LAND; I.h[n]=I.h[k]; I.world[n]=I.world[k]; I.base[n]=I.base[k]; } } });
      while(inner((x,z,k)=>{ if(I.kind[k]===MK_SEA||solid(x,z).length>=2) return false; I.kind[k]=MK_SEA; I.h[k]=0; I.base[k]=0; I.world[k]=-1; return true; }));
      while(inner((x,z,k)=>{ const s=solid(x,z); if(I.kind[k]!==MK_SEA||s.length<3) return false;
        const n=(z+s[0][1])*MAP_W+x+s[0][0]; I.kind[k]=MK_LAND; I.h[k]=I.h[n]; I.base[k]=I.base[n]; I.world[k]=I.world[n]; return true; }));
      return B;
    },
    /* The route: where it starts, then one string of compass letters for each stretch between two markers. */
    route(x,z,moves){
      const cells=[{x,z}], at=[0];
      for(const s of moves){ for(const c of s){ const d=MAP_DIR[c]; x+=d[0]; z+=d[1]; cells.push({x,z}); } at.push(cells.length-1); }
      const prof=routeProfile(cells.map(c=>{ const k=c.z*MAP_W+c.x; return I.kind[k]===MK_LAND?I.h[k]:-1; }));
      cells.forEach((c,i)=>{ const k=c.z*MAP_W+c.x; c.h=prof[i]; I.route[k]=i; if(I.kind[k]===MK_LAND) I.h[k]=c.h; else I.deck[k]=c.h; });
      return {nodes:at.map(i=>cells[i]),segs:moves.map((_,i)=>cells.slice(at[i],at[i+1]+1))};
    }
  };
  return B;
}
/* The height of each cell along the route, given the land under it (-1 where there is none). A gap of sea, lava or
   thin air is bridged in a straight line between its banks. Then the route is made walkable: neighbours may differ
   by one step at most. Only ever cutting into the land would flatten every summit, and only ever filling would bury
   every hollow, so the result is halfway between the highest profile that cuts and the lowest that fills. */
function routeProfile(p){
  const n=p.length;
  for(let i=1;i<n;i++) if(p[i]<0){ let j=i; while(p[j]<0) j++; for(let k=i;k<j;k++) p[k]=p[i-1]+(p[j]-p[i-1])*(k-i+1)/(j-i+1); i=j; }
  const lo=p.slice(), hi=p.slice();
  for(let i=1;i<n;i++){ lo[i]=Math.min(lo[i],lo[i-1]+1); hi[i]=Math.max(hi[i],hi[i-1]-1); }
  for(let i=n-2;i>=0;i--){ lo[i]=Math.min(lo[i],lo[i+1]+1); hi[i]=Math.max(hi[i],hi[i+1]-1); }
  return p.map((_,i)=>Math.max(1,Math.floor((lo[i]+hi[i])/2+0.5)));
}

/* ---------- finding the way from marker to marker ---------- */
/* The route is given as a list of markers, and the stretches between them are worked out here. Each is the plainest
   path there is: straight, an L, or a Z. Of the ones that keep to the rules (never over the path already laid, never
   alongside it, never through a lair or another marker), the one that crosses least water wins. `hints` can name the
   shape of a stretch outright, as a string of compass letters, where the plain choice is not the handsome one. */
function mapWays(I,nodes,blocked,hints){
  const key=(x,z)=>z*MAP_W+x, used=new Set([key(nodes[0][0],nodes[0][1])]), marks=new Set(nodes.map(n=>key(n[0],n[1]))), moves=[];
  /* the shapes worth trying for one stretch, least water first, and the cells each would lay */
  function shapes(i){
    const a=nodes[i], b=nodes[i+1], dx=b[0]-a[0], dz=b[1]-a[1], ax=Math.abs(dx), az=Math.abs(dz), H=(dx>0?'E':'W'), V=(dz>0?'S':'N'), h=n=>H.repeat(n), v=n=>V.repeat(n), c=[], out=[];
    if(hints&&hints[i]) c.push(hints[i]);
    else if(!az) c.push(h(ax)); else if(!ax) c.push(v(az));
    else { c.push(h(ax)+v(az),v(az)+h(ax)); for(let k=2;k<ax-1;k++) c.push(h(k)+v(az)+h(ax-k)); for(let k=2;k<az-1;k++) c.push(v(k)+h(ax)+v(az-k)); }
    c.forEach((w,wi)=>{ let x=a[0], z=a[1], ok=true, sea=0, prev=key(x,z); const mine=[prev];
      for(let j=0;j<w.length&&ok;j++){ const d=MAP_DIR[w[j]]; x+=d[0]; z+=d[1]; const k=key(x,z), last=j===w.length-1;
        if(x<1||z<1||x>=MAP_W-1||z>=MAP_D-1||used.has(k)||blocked.has(k)||(marks.has(k)&&!last)) ok=false;
        else for(const q of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=key(x+q[0],z+q[1]); if(n!==prev&&(used.has(n)||mine.includes(n)||(marks.has(n)&&n!==key(b[0],b[1])))) ok=false; }
        if(I.kind[k]!==MK_LAND) sea++; mine.push(k); prev=k; }
      if(ok&&x===b[0]&&z===b[1]) out.push({w,cells:mine.slice(1),score:sea*4+wi*0.01}); });
    return out.sort((p,q)=>p.score-q.score);
  }
  /* a shape that suits one stretch may leave no room for the next, so a dead end is backed out of */
  let tries=0;
  (function lay(i){
    if(i>=nodes.length-1) return true;
    for(const s of shapes(i)){ if(++tries>200000) break; for(const k of s.cells) used.add(k); moves[i]=s.w; if(lay(i+1)) return true; for(const k of s.cells) used.delete(k); }
    return false;
  })(0)||(()=>{ throw new Error('the map has no route through its markers'); })();
  return moves;
}

/* ---------- Blorp's world ---------- */
/* Ten islands, laid out so the journey reads at a glance: a snake. Along the south, west to east: the blossom garden,
   the orchard, the honeycomb and the fen. Back along the middle, east to west: the canyon and its falls, the fair, the
   boulevard and the neon town. Then north to the candy mountain, and from its shoulder a stair of light climbs east to
   the Baron's bastion, which floats over the sea in the dark it has made for itself.
   The camera looks north and down, so ground hides what is just north of it: tall ground stands at the back of its
   island, and nothing but sky stands north of the floating one.
   Each world's fifth marker has a lair behind it: three cells square of level ground, where the map view stands the
   world's landmark (see `map.landmark` in the world files). */
const MAP_MARKS=[
  [4,45],[7,41],[11,44],[14,46],[15,42],            /* 1 Blossom Bluffs */
  [23,43],[26,47],[30,45],[34,47],[33,42],          /* 2 Caramel Orchard */
  [42,43],[45,46],[49,44],[52,47],[52,42],          /* 3 Honeycomb Heights */
  [61,42],[64,46],[69,45],[72,43],[70,38],          /* 4 Firefly Fen */
  [65,30],[70,27],[71,22],[68,19],[61,22],          /* 5 Fossil Falls */
  [51,25],[48,28],[44,26],[40,28],[41,23],          /* 6 Popcorn Park */
  [32,25],[29,28],[25,26],[21,28],[22,23],          /* 7 Boombox Boulevard */
  [13,25],[10,29],[5,28],[4,23],[9,21],             /* 8 Neon Noodletown */
  [15,14],[19,12],[23,14],[27,13],[28,9],           /* 9 Rock Candy Caverns */
  [43,9],[47,12],[52,10],[57,12],[59,8]];           /* 10 Blackout Bastion */
function buildIsle(){
  const B=MapBuilder(), I=B.I, blocked=new Set();
  /* 1 Blossom Bluffs, south-west: a low garden with a terrace along the back and a hill in each far corner */
  B.blob(10,43,8,5.5,0,2).flat(10,40.6,7.4,2.3,4,0.25).raise(4.5,40,2.4,3,0.7).raise(12,39,2.2,2,0.8);
  /* 2 Caramel Orchard, south: rolling ground, a tall hill in the north-west and a low one in the south-east */
  B.blob(29,43,8.5,6,1,3).raise(25,39.6,3.2,4,0.7).raise(36,46,2.4,2,0.8).raise(29,48,2.2,1,0.8);
  /* 3 Honeycomb Heights, south: three terraces of comb, stepping up to the north */
  B.blob(48,43,8,5.5,2,3,0.2).flat(48,41.4,7,2.9,5,0.2).flat(46,39.6,3.6,1.6,7,0.2);
  /* 4 Firefly Fen, south-east: low and wet, pools everywhere, firmer ground along the north */
  B.blob(67,41,8,7,3,2,0.25).flat(67,42.4,6.6,4,1,0.3).pool(64.6,43.6,1.6,1.1,MK_POND,0.3).pool(70.6,47.6,2.2,0.9,MK_POND,0.3).pool(66.4,39.6,1.5,1,MK_POND,0.3).pool(73.4,39.4,1.1,1.5,MK_POND,0.3).pool(61.6,39,1,1.2,MK_POND,0.3);
  /* 5 Fossil Falls, east: two mesas with a canyon between them, a river in it, and low ground to the south */
  B.blob(65,24,8.5,6.5,4,4,0.2).flat(70,22.6,4.4,4.4,8,0.2).flat(71.5,19.6,2.6,1.6,10,0.2).flat(61.6,22,3.6,3.6,7,0.2).flat(65.6,22.6,1.3,5.6,2,0).pool(65.6,22.4,0.8,5,MK_POND,0);
  /* 6 Popcorn Park, middle: a fairground, flat as a table, with a low rise at the back for the big top */
  B.blob(45,25,8,5.5,5,3,0.2).flat(44,22.4,5,2.4,4,0.2);
  /* 7 Boombox Boulevard, middle: a stage in three steps, the highest at the back */
  B.blob(26,25,8,5.5,6,3,0.15).flat(26,22.8,6.6,2.7,4,0.15).flat(27,21,4,1.3,5,0.1);
  /* 8 Neon Noodletown, west: city blocks on a slab, a step higher at the back */
  B.blob(8.5,25,6.5,7,7,3,0.12).flat(8.5,21,5.4,3,4,0.1);
  /* 9 Rock Candy Caverns, north-west: a mountain of sugar, its peak at the back, its east shoulder where the stair leaves */
  B.blob(21,10,9.5,5.5,8,5,0.25).raise(19.5,7.6,6.5,10,0.85).raise(27.6,8.6,3.4,4,0.6);
  /* 10 Blackout Bastion, north: a slab of dark rock afloat, highest of all */
  B.blob(52,9,11,5,9,20,0.15).plate(49,5,56,8,21).lift(52,9,12,6,16);
  /* every marker stands on its own world's ground, with a cell of it on each side, whatever the ragged coast did */
  MAP_MARKS.forEach((n,i)=>{ const w=(i/5)|0, at=I.kind[n[1]*MAP_W+n[0]]===MK_LAND&&I.world[n[1]*MAP_W+n[0]]===w?I.h[n[1]*MAP_W+n[0]]:[2,3,3,2,4,3,3,3,5,20][w];
    for(const q of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){ const k=(n[1]+q[1])*MAP_W+n[0]+q[0]; if(I.kind[k]!==MK_LAND||I.world[k]!==w){ I.kind[k]=MK_LAND; I.world[k]=w; I.h[k]=at; I.base[k]=w===9?16:0; } } });
  /* the lairs: ground made sure of behind each world's fifth marker, and kept clear of the path */
  for(let w=0;w<10;w++){ const n=MAP_MARKS[w*5+4], at=I.h[n[1]*MAP_W+n[0]], base=I.base[n[1]*MAP_W+n[0]];
    for(let dz=-3;dz<=-1;dz++) for(let dx=-1;dx<=1;dx++){ const k=(n[1]+dz)*MAP_W+n[0]+dx; I.kind[k]=MK_LAND; I.world[k]=w; I.h[k]=at; I.base[k]=base; blocked.add(k); } }
  B.tidy();
  const made=B.route(MAP_MARKS[0][0],MAP_MARKS[0][1],mapWays(I,MAP_MARKS,blocked,MAP_HINTS));
  /* a lair stands level with its marker, whatever the path did to the marker's height */
  for(let w=0;w<10;w++){ const n=made.nodes[w*5+4]; for(let dz=-3;dz<=-1;dz++) for(let dx=-1;dx<=1;dx++) I.h[(n.z+dz)*MAP_W+n.x+dx]=n.h; }
  return {ISLE:I,MAPNODES:made.nodes,MAPSEGS:made.segs};
}
/* where the plain way between two markers is not the one wanted: the stretch's number, and its shape */
const MAP_HINTS={};
const {ISLE,MAPNODES,MAPSEGS}=buildIsle();

/* ---------- the rules of walking ---------- */
/* G.open is the furthest level opened: level i can be played when i <= G.open and has been cleared when i < G.open.
   It runs one past the last level once that is cleared. The stretch of path from marker i to marker i+1 exists once
   level i is cleared. */
const MAPST={at:0,walk:null,reveal:null,x:0,y:0,z:0,face:'S'};
function mapStandH(x,z){ const k=z*MAP_W+x; return ISLE.deck[k]||(ISLE.kind[k]===MK_LAND?ISLE.h[k]:0); }
const mapDirOf=(a,b)=>b.x>a.x?'E':b.x<a.x?'W':b.z>a.z?'S':'N';
/* which way the path leaves a marker: on toward the next one, and back toward the one before */
function mapDirAt(i){ const f=MAPSEGS[i], b=MAPSEGS[i-1]; return {fwd:f?mapDirOf(f[0],f[1]):null,back:b?mapDirOf(b[b.length-1],b[b.length-2]):null}; }
function mapPlace(i){ const n=MAPNODES[i], s=MAPST; s.at=i; s.walk=null; s.x=n.x+0.5; s.y=n.h*MAP_STEP; s.z=n.z+0.5; s.face='S'; }
/* Set off from the marker Blorp stands on. 'go' he is walking; 'locked' the path that way is not open yet; 'none'
   there is no path that way; 'busy' he is already walking, or a path is still appearing. */
function mapGo(dir){
  const s=MAPST; if(s.walk||s.reveal) return 'busy';
  const d=mapDirAt(s.at); if(!dir) return 'none';
  if(dir===d.fwd){ if(s.at>=G.open) return 'locked'; s.walk={seg:s.at,dir:1,k:0,t:0}; return 'go'; }
  if(dir===d.back){ s.walk={seg:s.at-1,dir:-1,k:MAPSEGS[s.at-1].length-1,t:0}; return 'go'; }
  return 'none';
}
/* One frame of the map. `held` is the direction being held, if any. It never sets Blorp off from a standstill, which
   takes a press, but when he reaches a marker and the path carries on that way, he carries on too. It only ever
   carries him further the way he was going: where a path doubles back, the same key would otherwise walk him home. */
function mapTick(dt,held,fast){
  const s=MAPST, r=s.reveal, w=s.walk;
  if(r){ const n=MAPSEGS[r.seg].length; r.t+=dt;
    /* the reveal is over before the game hears of its last tile, so that what it then draws is the opened marker */
    while(r.t>=MAP_TILE&&r.k<n){ r.t-=MAP_TILE; r.k++; if(r.k>=n) s.reveal=null; mapRevealed(r.seg,r.k,r.k>=n); }
    return; }
  if(!w) return;
  const seg=MAPSEGS[w.seg], end=w.dir>0?seg.length-1:0;
  w.t+=dt/(fast?MAP_HOP_FAST:MAP_HOP);
  while(w.t>=1&&w.k!==end){ w.t-=1; w.k+=w.dir; if(w.k!==end) mapStepped(); }
  const a=seg[w.k];
  if(w.k===end){ s.walk=null; s.at=w.dir>0?w.seg+1:w.seg; s.x=a.x+0.5; s.y=a.h*MAP_STEP; s.z=a.z+0.5; mapArrived();
    const d=mapDirAt(s.at); if(held&&held===(w.dir>0?d.fwd:d.back)) mapGo(held); return; }
  const b=seg[w.k+w.dir]; s.face=mapDirOf(a,b);
  s.x=a.x+0.5+(b.x-a.x)*w.t; s.y=(a.h+(b.h-a.h)*w.t)*MAP_STEP; s.z=a.z+0.5+(b.z-a.z)*w.t;
}
/* Show a newly opened stretch appearing, tile by tile. Until it has finished nothing else can happen on the map. */
function mapReveal(seg){ MAPST.reveal={seg,k:0,t:0}; }
/* how many of a stretch's tiles are showing, counting the markers at both ends */
function mapSegShown(seg){ const r=MAPST.reveal; return r&&r.seg===seg?r.k:seg<G.open?MAPSEGS[seg].length:0; }
/* 0 locked, 1 open, 2 cleared; a marker whose path is still appearing stays locked until it has */
function mapMarkState(i){ const r=MAPST.reveal; return r&&i===r.seg+1?0:i<G.open?2:i===G.open?1:0; }
/* one of the three little moons by a marker: 0 not shown, because the marker is still locked; 1 a spark yet to be
   found in that level; 2 a spark found */
function mapMoonState(i,j){ return mapMarkState(i)===0?0:sparkHad(i,j)?2:1; }
