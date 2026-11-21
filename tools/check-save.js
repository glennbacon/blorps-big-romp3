#!/usr/bin/env node
/* Checks that progress is saved in the browser and offered back as "Continue" on the title screen.

   Each check starts the real game code (see game.js) the way a page load would, with a stand-in for the browser's
   localStorage that keeps its contents from one load to the next.

     node tools/check-save.js
*/
'use strict';
const assert=require('assert');
const {loadGame}=require('./game.js');

function storage(){ const m=new Map(); return {map:m,getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{ m.set(k,String(v)); },removeItem:k=>{ m.delete(k); }}; }
const saved=s=>{ assert.strictEqual(s.map.size,1,'expected exactly one saved entry, found '+s.map.size); return JSON.parse([...s.map.values()][0]); };
/* the parts of a save most checks are about */
const core=d=>({level:d.level,open:d.open,score:d.score,coins:d.coins,lives:d.lives,form:d.form});
/* One page load. The probe looks names up inside the game's own scope when they are asked for, so `g.act` is the
   game's act and a name the game lacks fails only the checks that use it. `els` holds the page elements it touched.
   Screen wipes are told not to wait for frames, of which there are none here. */
const probe=function(){ return n=>eval(n); };
function page(s){ const pg=loadGame(probe,s); pg.api('WP').instant=true; return {api:new Proxy({},{get:(_,k)=>pg.api(k)}),els:pg.els}; }
const continueShown=pg=>{ const b=pg.els['btn-continue']; return !!b&&b.hidden===false; };
/* stand Blorp on a marker with everything before it cleared, and start its level */
function enter(g,level,open){ g.G.open=open===undefined?level:open; g.mapPlace(level); assert.strictEqual(g.mapEnter(),true,'the level did not start'); }
/* play to the end of level 2-2 (number 6, counting from 0) for the first time, with a recognisable score, coins, lives and form */
function clearLevel22(s){ const g=page(s).api; g.act('start'); enter(g,6); g.G.score=1234; g.G.coins=7; g.G.lives=4; g.player.form=3; g.levelClear(); return g; }
/* put a hand-written save where the game keeps its own */
function plant(s,text){ page(s).api.act('start'); const key=[...s.map.keys()][0]; assert(key,'nothing was saved, so there is no save to replace'); s.setItem(key,text); }

const checks=[
  ['a first visit offers no Continue',()=>{
    assert(!continueShown(page(storage())));
  }],
  ['starting a new game opens the map on 1-1 and saves it, with no sparks',()=>{
    const s=storage(), g=page(s).api; g.act('start');
    assert.strictEqual(g.G.state,'map'); assert.strictEqual(g.MAPST.at,0);
    assert.deepStrictEqual(core(saved(s)),{level:0,open:0,score:0,coins:0,lives:3,form:0});
    assert.strictEqual(saved(s).sparks.length,g.LEVELS.length); assert(saved(s).sparks.every(b=>b===0));
  }],
  ['clearing a level opens the next one and saves both, with the score, coins, lives and form',()=>{
    const s=storage(); clearLevel22(s);
    assert.deepStrictEqual(core(saved(s)),{level:6,open:7,score:1234,coins:7,lives:4,form:3});
  }],
  ['clearing a level again opens nothing new',()=>{
    const s=storage(), g=page(s).api; g.act('start'); enter(g,6,9); g.levelClear();
    assert.strictEqual(saved(s).open,9);
  }],
  ['after a reload the title offers Continue at the marker Blorp stood on',()=>{
    const s=storage(); clearLevel22(s);
    const pg=page(s);
    assert(continueShown(pg),'Continue is not shown');
    assert.strictEqual(pg.els['btn-continue'].textContent,'Continue at 2-2');
  }],
  ['with a save, the main action on the title continues on the map and restores everything',()=>{
    const s=storage(); clearLevel22(s);
    const g=page(s).api; g.primaryAction();
    assert.deepStrictEqual({at:g.MAPST.at,open:g.G.open,score:g.G.score,coins:g.G.coins,lives:g.G.lives,form:g.player.form,state:g.G.state},
      {at:6,open:7,score:1234,coins:7,lives:4,form:3,state:'map'});
  }],
  ['a moon spark is saved the moment it is touched, and is still there after a reload',()=>{
    const s=storage(), g=page(s).api; g.act('start'); enter(g,3);
    g.collectSpark(g.sparks[1]);
    assert.strictEqual(saved(s).sparks[3],2);
    g.collectSpark(g.sparks[0]); assert.strictEqual(saved(s).sparks[3],3);
    const h=page(s).api; h.primaryAction();
    assert.deepStrictEqual([h.sparkHad(3,0),h.sparkHad(3,1),h.sparkHad(3,2),h.sparkCount(3),h.sparkTotal()],[1,1,0,2,2]);
    enter(h,3); assert.deepStrictEqual(h.sparks.map(q=>q.had),[1,1,0],'a spark already found should show as found');
  }],
  ['a spark found before is not counted twice',()=>{
    const s=storage(), g=page(s).api; g.act('start'); enter(g,0);
    g.collectSpark(g.sparks[2]); const score=g.G.score; g.afterDeath();
    assert.strictEqual(g.sparks[2].had,1); g.collectSpark(g.sparks[2]);
    assert.strictEqual(g.G.score,score); assert.strictEqual(g.sparkTotal(),1);
  }],
  ['a new game forgets the sparks of the last one',()=>{
    const s=storage(), g=page(s).api; g.act('start'); enter(g,0); g.collectSpark(g.sparks[0]); g.levelClear();
    const h=page(s).api; h.act('start');
    assert.strictEqual(h.sparkTotal(),0); assert(saved(s).sparks.every(b=>b===0));
  }],
  ['a save with no furthest level, or with sparks that make no sense, is repaired',()=>{
    const s=storage(); plant(s,'{"level":7,"score":10,"coins":2,"lives":3,"form":1,"sparks":[9,"x",-1,3.7,null,7]}');
    const pg=page(s); assert.strictEqual(pg.els['btn-continue'].textContent,'Continue at 2-3');
    const g=pg.api; g.primaryAction();
    assert.deepStrictEqual({at:g.MAPST.at,open:g.G.open,score:g.G.score,form:g.player.form,state:g.G.state},{at:7,open:7,score:10,form:1,state:'map'});
    assert.strictEqual(g.G.sparks.length,g.LEVELS.length); assert(g.G.sparks.every(b=>Number.isInteger(b)&&b>=0&&b<=7),'sparks are not all whole numbers from 0 to 7: '+g.G.sparks.slice(0,7));
    assert.strictEqual(g.G.sparks[5],7);
  }],
  ['a save whose furthest opened level makes no sense falls back to the level Blorp stood on',()=>{
    for(const open of ['-1','99','"3"','2.5','4','null']){
      const s=storage(); plant(s,'{"level":5,"open":'+open+',"score":0,"coins":0,"lives":3,"form":0}');
      const g=page(s).api; g.primaryAction();
      assert.strictEqual(g.G.open,5,'for an opened level of '+open); assert.strictEqual(g.MAPST.at,5);
    }
  }],
  ['losing a life saves the lives that are left',()=>{
    const s=storage(), g=page(s).api; g.act('start'); enter(g,0); g.afterDeath();
    assert.strictEqual(saved(s).lives,2);
  }],
  ['game over keeps the map and the sparks, and resets the rest',()=>{
    const s=storage(), g=page(s).api; g.act('start'); enter(g,9,12); g.collectSpark(g.sparks[0]);
    g.G.lives=1; g.G.score=500; g.G.coins=3; g.player.form=1; g.afterDeath();
    assert.strictEqual(g.G.state,'over');
    assert.deepStrictEqual(core(saved(s)),{level:9,open:12,score:0,coins:0,lives:3,form:0}); assert.strictEqual(saved(s).sparks[9],1);
    g.primaryAction();
    assert.deepStrictEqual({state:g.G.state,at:g.MAPST.at,open:g.G.open,score:g.G.score,coins:g.G.coins,lives:g.G.lives,form:g.player.form,sparks:g.sparkTotal()},
      {state:'map',at:9,open:12,score:0,coins:0,lives:3,form:0,sparks:1});
  }],
  ['a graphics setting chosen by hand is saved and comes back; Auto is not pinned',()=>{
    const s=storage(), g=page(s).api; g.act('start');
    assert.strictEqual(saved(s).gfx,-1);
    enter(g,0); g.G.state='pause'; g.act('gfx'); assert.strictEqual(g.Q.auto,false);
    const level=g.Q.level; assert.strictEqual(saved(s).gfx,level);
    const h=page(s).api; assert.deepStrictEqual([h.Q.auto,h.Q.level],[false,level]);
  }],
  ['finishing the game keeps the save, with every level open',()=>{
    const s=storage(), g=page(s).api, last=g.LEVELS.length-1; g.act('start'); enter(g,last); g.showWin();
    assert.deepStrictEqual([saved(s).level,saved(s).open],[last,last+1]);
    const pg=page(s); assert(continueShown(pg),'Continue is not shown'); pg.api.primaryAction();
    assert.strictEqual(pg.api.G.state,'map'); assert.strictEqual(pg.api.mapMarkState(last),2);
  }],
  ['a damaged save is ignored',()=>{
    for(const bad of ['not json','null','[]','{"level":999}','{"level":-1}','{"level":"2"}','{"level":1.5}']){
      const s=storage(); plant(s,bad);
      const pg=page(s); assert(!continueShown(pg),'Continue shown for '+bad);
      pg.api.primaryAction(); assert.deepStrictEqual([pg.api.G.state,pg.api.MAPST.at,pg.api.G.open],['map',0,0],'did not start a new game for '+bad);
    }
  }],
  ['a browser that blocks storage still plays',()=>{
    const boom=()=>{ throw new Error('storage is blocked'); };
    for(const s of [{getItem:boom,setItem:boom,removeItem:boom},undefined]){
      const g=page(s).api; g.act('start'); assert.strictEqual(g.G.state,'map');
      enter(g,0); assert.strictEqual(g.G.state,'card');
      g.collectSpark(g.sparks[0]); assert.strictEqual(g.sparkTotal(),1);
      g.levelClear(); g.act('map'); assert.strictEqual(g.G.open,1);
      g.G.lives=1; g.MAPST.reveal=null; enter(g,0,1); g.afterDeath(); g.act('map'); g.showWin();
    }
  }]
];

let bad=0;
for(const [name,run] of checks){
  try{ run(); console.log('ok   '+name); }
  catch(e){ bad++; console.log('FAIL '+name+'\n       '+String(e.message).split('\n')[0]); }
}
console.log(bad?bad+' of '+checks.length+' checks failed':'all '+checks.length+' checks pass');
process.exit(bad?1:0);
