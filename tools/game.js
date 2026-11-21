/* Loads the game code from src/ into Node, with three.js and the page stubbed out, so a tool can drive the real rules. */
'use strict';
const fs=require('fs'), path=require('path');
const SRC=path.join(__dirname,'..','src');
const worlds=fs.readdirSync(path.join(SRC,'worlds')).filter(f=>f.endsWith('.js')).sort().map(f=>'worlds/'+f.slice(0,-3));
const PARTS=['a_art','b_levels','c_audio','d_render','e_world','e2_fx','f_play','g_enemies',...worlds,'m_map','n_mapview','z_flow'];
const code=PARTS.map(f=>fs.readFileSync(path.join(SRC,f+'.js'),'utf8')).join('\n');

/* Anything asked of a stub answers with another stub; in arithmetic a stub counts as 0. Values set on a stub are kept. */
function stub(preset){
  const f=function(){};
  if(preset) Object.assign(f,preset);
  return new Proxy(f,{
    get(t,k){ if(k===Symbol.toPrimitive) return ()=>0; if(!(k in t)) t[k]=stub(); return t[k]; },
    set(t,k,v){ t[k]=v; return true; },
    apply(){ return stub(); },
    construct(){ return stub(); }
  });
}

/* Starts one copy of the game, as a page load would. `inject` is a function whose source runs inside the game's own
   scope, so it can reach the game's state; whatever it returns comes back as `api`. `storage` stands in for the
   browser's localStorage. `els` holds the page elements the game touched, by id. */
function loadGame(inject,storage){
  const els={stage:stub({clientWidth:1280,clientHeight:720})};
  const doc={getElementById:id=>els[id]||(els[id]=stub()),createElement:()=>stub(),addEventListener(){},querySelectorAll:()=>[],body:stub(),hidden:false};
  const win={innerWidth:1280,innerHeight:720,devicePixelRatio:1,addEventListener(){},THREE:stub(),localStorage:storage,location:{search:''}};
  const run=new Function('THREE','window','document','performance','requestAnimationFrame','setInterval','clearInterval',"'use strict';\n"+code+'\n;return ('+inject.toString()+')();');
  return {api:run(win.THREE,win,doc,{now:()=>0},()=>{},()=>0,()=>{}),els};
}
module.exports={loadGame};
