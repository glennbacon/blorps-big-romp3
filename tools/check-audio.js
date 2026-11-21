#!/usr/bin/env node
/* Proves src/c_audio.js cannot throw at run time: loads it against a strict fake of the Web Audio API,
   fires every sound effect, and plays every song through two full loops on a fake clock.  node tools/check-audio.js */
'use strict';
const fs=require('fs'), path=require('path');
/* The audio module, and after it every world's own tune: the part of each file in src/worlds/ between @song and @endsong. */
const core=fs.readFileSync(path.join(__dirname,'..','src','c_audio.js'),'utf8');
const WDIR=path.join(__dirname,'..','src','worlds'), wfiles=fs.readdirSync(WDIR).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(WDIR,f),'utf8'));
const tunes=wfiles.map(t=>{ const m=/\/\* @song \*\/([\s\S]*?)\/\* @endsong \*\//.exec(t); return m?m[1]:''; }).join('\n');
const src=core+'\n'+tunes;
let failed=0;
const fail=m=>{ failed++; console.error('FAIL: '+m); };
const attempt=(what,fn)=>{ try{ return fn(); }catch(e){ fail(what+' threw: '+(e&&e.message||e)); } };

const FNS=['auInit','setMuted','musicStart','musicStop','musicPause','musicRate','musicMuffle','musicDuck','musicTick'];
/* every effect the game calls by name, found by reading the source for sfx.name( */
const SRC=path.join(__dirname,'..','src'), game=fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).concat(wfiles).join('\n');
const sfxAt=core.indexOf('const sfx={'), sfxBlock=core.slice(sfxAt,core.indexOf('\n};',sfxAt));
const SFX=[...new Set([...game.matchAll(/\bsfx\.([A-Za-z_]\w*)\(/g)].map(m=>m[1]).concat([...sfxBlock.matchAll(/^  ([A-Za-z_]\w*)\([^)]*\)\{/gm)].map(m=>m[1])))].sort();
/* every world's theme names its tune */
const LEVELS=[...new Set(wfiles.flatMap(t=>[...t.matchAll(/\bmusic:'(\w+)'/g)].map(m=>m[1])))];
const SONG_NAMES=['title','map','boss','baron','bonus'].concat(LEVELS);
const LONG_OK=['win','clear','over','die','bossDown','gate','worldClear','dawn'];
const OWNED='clamp sgn rng pick T G L W H M V $ input player step'.split(' ');
const KEPT='AU NF voice tone hiss jingle parseTrack song SONGS mus musicTick sfx'.split(' ').concat(FNS);
/* the worlds' tunes are checked as songs, but the house rules about names are for the audio module alone */
const DRUMS='kshorptTcbxmlwnz';

/* ---------- a strict stand-in for the Web Audio API ---------- */
function makeEnv(opt={}){
  const env={now:0,nodes:[],timers:new Map(),tid:0,state:opt.state||'running',made:0};
  const num=(v,what)=>{ if(typeof v!=='number'||!Number.isFinite(v)) throw new Error(what+' is not a finite number ('+v+')'); return v; };
  const time=(t,what)=>{ num(t,what); if(t<0) throw new Error(what+' is negative ('+t+')'); if(t<env.now-1e-6) throw new Error(what+' is in the past ('+t+' < '+env.now+')'); return t; };
  class Param{
    constructor(owner,name,v,min,max){ this.owner=owner; this.name=name; this.v0=v; this.min=min; this.max=max; this.ev=[]; }
    ok(v,what){ num(v,what); if(this.min!==undefined&&(v<this.min||v>this.max)) throw new Error(what+' out of range ('+v+', allowed '+this.min+'..'+this.max+')'); return v; }
    get value(){ return this.valueAt(env.now); }
    set value(v){ this.v0=this.ok(v,this.name+'.value'); }
    add(k,v,t,tc){ const w=this.name+'.'+k; this.ok(v,w+' value'); time(t,w+' time'); this.ev.push({k,v,t,tc}); this.ev.sort((a,b)=>a.t-b.t); return this; }
    setValueAtTime(v,t){ return this.add('set',v,t); }
    linearRampToValueAtTime(v,t){ return this.add('lin',v,t); }
    exponentialRampToValueAtTime(v,t){
      if(!(v>0)) throw new Error(this.name+'.exponentialRampToValueAtTime to '+v+' (must be above 0)');
      num(t,'time'); if(!(this.valueAt(t)>0)) throw new Error(this.name+'.exponentialRampToValueAtTime starting from '+this.valueAt(t)+' (must be above 0)');
      return this.add('exp',v,t);
    }
    setTargetAtTime(v,t,tc){ num(tc,this.name+' time constant'); if(tc<0) throw new Error(this.name+' time constant is negative'); return this.add('tgt',v,t,tc); }
    cancelScheduledValues(t){ time(t,this.name+'.cancelScheduledValues time'); this.ev=this.ev.filter(e=>e.t<t); return this; }
    valueAt(t){
      let v=this.v0, pt=0, tg=null; const settle=at=>tg.v+(v-tg.v)*Math.exp(-(at-tg.t)/Math.max(tg.tc,1e-9));
      for(const e of this.ev){
        if(e.t<=t){ if(tg){ v=settle(e.t); tg=null; } if(e.k==='tgt') tg=e; else v=e.v; pt=e.t; continue; }
        if(tg) return settle(t);
        if(e.k==='lin') return v+(e.v-v)*(t-pt)/(e.t-pt);
        if(e.k==='exp') return v*Math.pow(e.v/v,(t-pt)/(e.t-pt));
        return v;
      }
      return tg?settle(t):v;
    }
  }
  const WAVES=['sine','square','sawtooth','triangle'], FILTERS=['lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'];
  class Node{
    constructor(kind){ this.kind=kind; this.outs=[]; this.born=env.now; env.nodes.push(this); env.made++; }
    connect(to){ if(!(to instanceof Node)&&!(to instanceof Param)) throw new Error(this.kind+'.connect target is not a node or a param ('+to+')'); if(to.kind==='source'||to.kind==='osc') throw new Error('cannot connect into a source node'); this.outs.push(to); return to; }
    disconnect(){ this.outs=[]; }
    param(name,v,min,max){ this[name]=new Param(this,this.kind+'.'+name,v,min,max); }
    start(t=0,off=0){
      if(this.kind!=='osc'&&this.kind!=='source') throw new Error(this.kind+' has no start()');
      if(this.t0!==undefined) throw new Error(this.kind+'.start called twice'); time(t,this.kind+'.start time'); num(off,'start offset'); if(off<0) throw new Error('start offset is negative');
      if(this.kind==='source'&&!this._buf) throw new Error('buffer source started without a buffer'); this.t0=t;
    }
    stop(t=0){ if(this.t0===undefined) throw new Error(this.kind+'.stop before start'); time(t,this.kind+'.stop time'); if(t<this.t0) throw new Error(this.kind+' stops before it starts'); this.t1=t; }
    get type(){ return this._type; }
    set type(v){ const list=this.kind==='osc'?WAVES:this.kind==='filter'?FILTERS:null; if(!list||!list.includes(v)) throw new Error('bad '+this.kind+' type "'+v+'"'); this._type=v; }
    get buffer(){ return this._buf; }
    set buffer(b){ if((this.kind!=='source'&&this.kind!=='convolver')||!(b&&b.isFakeBuffer)) throw new Error('bad buffer on '+this.kind); this._buf=b; }
  }
  class FakeAC{
    constructor(){ if(opt.ctorThrows) throw new Error('audio is not allowed here'); this.sampleRate=44100; this.destination=new Node('destination'); env.ac=this; env.contexts=(env.contexts||0)+1; }
    get currentTime(){ return env.now; }
    get state(){ return env.state; }
    resume(){ return opt.resumeNothing?undefined:Promise.resolve(); }
    createOscillator(){ const n=new Node('osc'); n._type='sine'; n.param('frequency',440,-22050,22050); n.param('detune',0,-153600,153600); return n; }
    createGain(){ const n=new Node('gain'); n.param('gain',1); return n; }
    createBiquadFilter(){ const n=new Node('filter'); n._type='lowpass'; n.param('frequency',350,0,22050); n.param('Q',1); n.param('gain',0); n.param('detune',0); return n; }
    createBufferSource(){ const n=new Node('source'); n.loop=false; n.param('playbackRate',1); n.param('detune',0); return n; }
    createBuffer(ch,len,rate){ [ch,len,rate].forEach(v=>{ num(v,'createBuffer argument'); if(v<=0||v!==Math.floor(v)) throw new Error('bad createBuffer argument '+v); }); const d=new Float32Array(len); return {isFakeBuffer:true,length:len,sampleRate:rate,duration:len/rate,numberOfChannels:ch,getChannelData:c=>{ if(c!==0&&!(c>0&&c<ch)) throw new Error('no channel '+c); return d; }}; }
    createDelay(max=1){ num(max,'createDelay max'); if(max<=0||max>=180) throw new Error('bad createDelay max '+max); const n=new Node('delay'); n.param('delayTime',0,0,max); return n; }
    createDynamicsCompressor(){ const n=new Node('comp'); n.param('threshold',-24,-100,0); n.param('knee',30,0,40); n.param('ratio',12,1,20); n.param('attack',0.003,0,1); n.param('release',0.25,0,1); return n; }
    createWaveShaper(){ const n=new Node('shaper'); n.curve=null; n.oversample='none'; return n; }
    createStereoPanner(){ const n=new Node('panner'); n.param('pan',0,-1,1); return n; }
    createConvolver(){ const n=new Node('convolver'); n.normalize=true; return n; }
  }
  env.window=opt.noAC?{}:opt.webkit?{webkitAudioContext:FakeAC}:{AudioContext:FakeAC};
  /* the test owns the clock and the timers */
  env.setInterval=(fn,ms)=>{ if(typeof fn!=='function') throw new Error('setInterval without a function'); env.timers.set(++env.tid,{fn,ms}); return env.tid; };
  env.clearInterval=id=>{ env.timers.delete(id); };
  env.advance=dt=>{ env.now+=dt; for(const t of [...env.timers.values()]) t.fn(); };
  env.isNode=x=>x instanceof Node;
  env.reaches=(node,goal,avoid)=>{ const seen=new Set(), q=[node]; while(q.length){ const n=q.shift(); if(seen.has(n)||n===avoid) continue; seen.add(n); if(n===goal) return true; for(const o of n.outs) q.push(o instanceof Param?o.owner:o); } return false; };
  return env;
}
function load(env){
  const names=['AU','sfx','SONGS',...FNS];
  const body='"use strict";\n'+src+'\n;return {'+names.join(',')+",mus:typeof mus==='undefined'?null:mus};";
  const noTimeout=()=>{ throw new Error('setTimeout is not available to the audio module'); };
  return new Function('window','clamp','setInterval','clearInterval','setTimeout','document','navigator',body)(env.window,(v,lo,hi)=>v<lo?lo:v>hi?hi:v,env.setInterval,env.clearInterval,noTimeout,undefined,undefined);
}
/* every way each effect is likely to be called */
function sfxCalls(){
  const calls=[]; for(const k of SFX) calls.push([k,[]]);
  for(let i=-2;i<=12;i++) calls.push(['coin',[i]]); for(let i=-1;i<=10;i++) calls.push(['stomp',[i]]);
  for(let i=0;i<=4;i++) calls.push(['spark',[i]]); for(let i=-3;i<=40;i++) calls.push(['mapTile',[i]]);
  for(let n=-1;n<=3;n++) for(const k of ['','drum','hay','nope']) calls.push(['boing',[n,n*7,k]]); for(let i=-2;i<=12;i++) calls.push(['note',[i]],['tick',[i]]); calls.push(['beat',[true]],['beat',[false]]);
  calls.push(['jump',[true]],['jump',[false]],['coin',[NaN]],['stomp',[undefined]],['spark',['2']],['mapTile',[1e9]]);
  return calls;
}
/* after a test: every source must stop some day and lead to the speakers */
function checkNodes(env,what){
  let bad=0;
  for(const n of env.nodes){
    if(n.kind!=='osc'&&n.kind!=='source') continue;
    const name=n.kind==='osc'?'an oscillator':'a noise source';
    if(n.t0===undefined){ if(!bad++) fail(what+': '+name+' was created but never started'); }
    else if(n.t1===undefined){ if(!bad++) fail(what+': '+name+' is never stopped'); }
    else if(!env.reaches(n,env.ac.destination)){ if(!bad++) fail(what+': '+name+' is not connected to the output'); }
  }
}
/* a rough loudness figure: the peak of the summed envelopes, weighted by how piercing each kind of source is */
function loudness(env,from){
  const list=[];
  for(const n of env.nodes){
    if((n.kind!=='osc'&&n.kind!=='source')||n.t0===undefined||n.born<from) continue;
    let f=null, g=n; while(g&&g.kind!=='gain'){ if(g.kind==='filter') f=g; g=g.outs.find(env.isNode); }
    const after=g&&g.outs.find(env.isNode); if(!after) continue;   /* a wobble oscillator only steers a pitch; it makes no sound itself */
    if(!f&&after.kind==='filter') f=after;
    let w=n.kind==='source'?(f?(f.type==='highpass'?0.55:0.3):0.6):({square:1,sawtooth:0.85,triangle:0.42,sine:0.4})[n.type];
    if(n.kind==='osc'&&n.frequency.valueAt(n.t0)<200) w*=0.6;
    list.push({n,g,w});
  }
  let peak=0, end=from; for(const s of list) end=Math.max(end,s.n.t1||from);
  for(let t=from;t<=end;t+=0.004){ let sum=0; for(const s of list) if(t>=s.n.t0&&t<=s.n.t1) sum+=s.w*Math.abs(s.g.gain.valueAt(t)); if(sum>peak) peak=sum; }
  return {peak,len:end-from};
}

/* ---------- 0. the file parses, and its top-level names keep to the house rules ---------- */
attempt('parsing src/c_audio.js',()=>new Function(src));
{
  const names=[...core.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);
  for(const n of names){
    if(OWNED.includes(n)) fail('declares "'+n+'", which the rest of the game owns');
    else if(!KEPT.includes(n)&&!/^(au|mus)[A-Z]/.test(n)) fail('top-level name "'+n+'" is neither an interface name nor prefixed with au/mus');
  }
  if(/^\s*(import|export)\s/m.test(core)) fail('the file must be a plain fragment: no import or export');
}

/* ---------- 1. the interface ---------- */
const env=makeEnv(), A=attempt('loading the module',()=>load(env));
if(!A){ console.error('audio check failed: the module does not load'); process.exit(1); }
if(!A.AU||typeof A.AU!=='object'||!('ac' in A.AU)||A.AU.muted!==false) fail('AU must be an object with ac and muted:false');
if(A.AU&&A.AU.ac!==null) fail('AU.ac must be null before auInit');
for(const k of FNS) if(typeof A[k]!=='function') fail(k+' must be a function');
if(!A.sfx||typeof A.sfx!=='object') fail('sfx must be an object');
for(const k of SFX){ const f=A.sfx&&A.sfx[k]; if(typeof f!=='function') fail('sfx.'+k+' is missing'); else if(f.length!==0) fail('sfx.'+k+' has an argument without a default'); }
for(const k of Object.keys(A.sfx||{})) if(typeof A.sfx[k]!=='function') fail('sfx.'+k+' is not a function');
for(const k of SONG_NAMES) if(!A.SONGS||!Object.prototype.hasOwnProperty.call(A.SONGS,k)) fail('SONGS.'+k+' is missing');
if(failed){ console.error('audio check failed: '+failed+' problem(s)'); process.exit(1); }

/* ---------- 2. nothing may happen, or throw, before auInit ---------- */
for(const [k,args] of sfxCalls()) attempt('sfx.'+k+'('+args.join(',')+') before auInit',()=>A.sfx[k](...args));
attempt('music calls before auInit',()=>{ A.setMuted(true); A.setMuted(false); A.musicMuffle(true); A.musicMuffle(false); A.musicDuck(1); A.musicDuck(); A.musicRate(1.35); A.musicPause(true); A.musicPause(false); A.musicTick(); A.musicStop(); A.musicStart('title'); A.musicTick(); A.musicStop(); A.musicStart('no such song'); A.musicStart(); A.musicStart('constructor'); });
if(env.made) fail('audio nodes were created before auInit');
if(env.timers.size) fail('a timer is still running after musicStop / an unknown song');

/* ---------- 3. auInit, then every effect ---------- */
attempt('auInit',()=>{ A.auInit(); A.auInit(); A.auInit(); });
if(!A.AU.ac) fail('auInit did not create an AudioContext');
if(env.contexts!==1) fail('auInit created '+env.contexts+' contexts, expected 1');
if(failed){ console.error('audio check failed: '+failed+' problem(s)'); process.exit(1); }
const out=env.ac.destination;
if(!env.nodes.some(n=>n.kind==='comp'&&env.reaches(n,out))) fail('no DynamicsCompressor on the way to the output');
if(!env.nodes.some(n=>n.kind==='delay'&&n.outs.some(o=>o.kind&&env.reaches(o,n)))) fail('no feedback delay (echo) in the graph');
/* a suspended context: effects must stay silent */
env.state='suspended'; { const before=env.made;
  for(const [k,args] of sfxCalls()) attempt('sfx.'+k+' while suspended',()=>A.sfx[k](...args));
  attempt('auInit while suspended',()=>A.auInit());
  if(env.made!==before) fail('effects built audio nodes while the context was suspended'); }
env.state='running';
const loud={}, long={};
for(const [k,args] of sfxCalls()){
  env.now+=3; const from=env.now, mark=env.nodes.length;
  attempt('sfx.'+k+'('+args.join(',')+')',()=>A.sfx[k](...args));
  if(env.nodes.length===mark) fail('sfx.'+k+'('+args.join(',')+') made no sound');
  const r=loudness(env,from); loud[k]=Math.max(loud[k]||0,r.peak); long[k]=Math.max(long[k]||0,r.len);
}
checkNodes(env,'sfx');
const coin=loud.coin||1e-9;
for(const k of SFX){
  if(long[k]>1.25&&!LONG_OK.includes(k)) fail('sfx.'+k+' lasts '+long[k].toFixed(2)+' s (limit about 1.2 s)');
  if(loud[k]>coin*2.2) fail('sfx.'+k+' is about '+(loud[k]/coin).toFixed(1)+' times as loud as coin');
}
{ const by=SFX.slice().sort((a,b)=>loud[b]-loud[a]).slice(0,4).map(k=>k+' '+(loud[k]/coin).toFixed(2)).join(', ');
  const ln=SFX.filter(k=>!LONG_OK.includes(k)).sort((a,b)=>long[b]-long[a])[0];
  console.log('sfx     '+SFX.length+' effects ok   loudest vs coin: '+by+'   longest short effect: '+ln+' '+long[ln].toFixed(2)+' s'); }

/* ---------- 4. mute, muffle and duck do what they say ---------- */
attempt('setMuted',()=>{
  const master=env.nodes.find(n=>n.kind==='gain'&&n.outs.includes(out)); if(!master) return fail('no master gain feeds the output');
  A.setMuted(true); if(A.AU.muted!==true||master.gain.value!==0) fail('setMuted(true) does not silence the master gain');
  A.setMuted(false); if(A.AU.muted!==false||!(master.gain.value>0)) fail('setMuted(false) does not restore the master gain');
});
let muffle=null;
attempt('musicMuffle',()=>{
  A.musicMuffle(true); env.now+=0.5; muffle=env.nodes.find(n=>n.kind==='filter'&&n.type==='lowpass'&&n.frequency.value>500&&n.frequency.value<900);
  if(!muffle) return fail('musicMuffle(true) closed no low-pass filter to about 700 Hz');
  A.musicMuffle(false); env.now+=0.35; if(!(muffle.frequency.value>8000)) fail('musicMuffle(false) has not opened the filter after 0.35 s ('+muffle.frequency.value.toFixed(0)+' Hz)');
  env.now+=1; A.sfx.coin(); if(!env.reaches(env.nodes.filter(n=>n.kind==='osc').pop(),out,muffle)) fail('sound effects pass through the underwater filter; only music should');
});
attempt('musicDuck',()=>{
  const gains=env.nodes.filter(n=>n.kind==='gain'), before=gains.map(n=>n.gain.ev.length); A.musicDuck(1);
  const dk=gains.find((n,i)=>n.gain.ev.length!==before[i]); if(!dk) return fail('musicDuck changed no gain');
  const lo=dk.gain.valueAt(env.now+0.4), hi=dk.gain.valueAt(env.now+2); if(lo<0.25||lo>0.45) fail('musicDuck drops the music to '+lo.toFixed(2)+', expected about 0.35'); if(hi<0.9) fail('musicDuck has not brought the music back a second later ('+hi.toFixed(2)+')');
  A.musicDuck(); A.musicDuck(0); A.musicDuck(NaN); A.musicDuck(-1); env.now+=12; if(dk.gain.value<0.95) fail('the music stays ducked after odd musicDuck arguments');
});

/* ---------- 5. every song: the data, then two full loops on the fake clock ---------- */
const bpmOf={};
for(const name of Object.keys(A.SONGS)){
  const s=A.SONGS[name]; let ok=true; const bad=m=>{ ok=false; fail('song '+name+': '+m); };
  if(!s||!Array.isArray(s.tr)||!(s.bpm>0)||!(s.len>0)||!(s.bar>0)||!(s.spb>0)){ bad('is not a parsed song'); continue; }
  bpmOf[name]=s.bpm;
  if(s.tr.length<4) bad('has '+s.tr.length+' tracks, needs at least 4');
  if(!s.tr.some(t=>t.ins.dr)) bad('has no drum track');
  if(s.tr.filter(t=>!t.ins.dr).length<3) bad('needs lead, harmony and bass tracks');
  if(s.len%s.bar) bad('length '+s.len+' steps is not a whole number of '+s.bar+'-step bars');
  if(s.len/s.bar<16) bad('is only '+(s.len/s.bar)+' bars long, needs at least 16');
  s.tr.forEach((t,i)=>{
    if(s.len%t.seq.length) bad('track '+i+' is '+t.seq.length+' steps, which does not divide the loop of '+s.len);
    if(!t.seq.some(Boolean)) bad('track '+i+' is empty');
    t.seq.forEach((n,j)=>{ if(!n) return;
      if(t.ins.dr){ for(const c of n.h||'?') if(!DRUMS.includes(c)){ bad('track '+i+' step '+j+': unknown drum "'+c+'"'); } }
      else if(!(n.f>=30&&n.f<=5000)||!(n.d>=1)) bad('track '+i+' step '+j+': bad note (f='+n.f+', d='+n.d+')'); });
    if(!t.ins.dr&&(!(t.ins.v>0&&t.ins.v<=0.4)||!['sine','square','sawtooth','triangle'].includes(t.ins.w))) bad('track '+i+' has a bad instrument');
  });
  const secs=s.len*60/s.bpm/s.spb, mark=env.nodes.length, began=env.now; let ticks=0, poly=0;
  attempt('playing '+name,()=>{
    A.musicStart(name); if(env.timers.size!==1) bad('musicStart left '+env.timers.size+' timers running');
    const want=2*s.len+s.bar;
    while(A.mus?A.mus.step<want:env.now<began+2.2*secs+10){
      if(++ticks>200000) throw new Error('the song never reached its second loop');
      /* mostly a steady 40 ms tick, now and then a stall like a busy phone, plus every control the game uses */
      env.advance(ticks%151===0?0.4:ticks%7===0?0.055:0.04);
      if(ticks===200) A.musicRate(1.35); if(ticks===500) A.musicRate(1.12); if(ticks===800) A.musicRate(1);
      if(ticks===300){ A.musicPause(true); for(let i=0;i<10;i++) env.advance(0.04); A.musicPause(false); }
      if(ticks===350){ A.musicMuffle(true); A.musicDuck(0.8); } if(ticks===420) A.musicMuffle(false);
      if(ticks===450){ A.setMuted(true); for(let i=0;i<10;i++) env.advance(0.04); A.setMuted(false); }
    }
    const notes=env.nodes.slice(mark).filter(n=>n.kind==='osc'||n.kind==='source');
    if(!notes.length) bad('scheduled no notes');
    /* peak polyphony, and proof that music (unlike effects) runs through the underwater filter */
    const edges=[]; for(const n of notes){ edges.push([n.t0,1],[n.t1,-1]); } edges.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); let cur=0; for(const e of edges){ cur+=e[1]; if(cur>poly) poly=cur; }
    if(muffle&&notes.some(n=>env.reaches(n,out,muffle))) bad('some music bypasses the underwater filter');
    A.musicStop(); if(env.timers.size) bad('musicStop left a timer running');
    const made=env.made; for(let i=0;i<20;i++) env.advance(0.04); if(env.made!==made) bad('notes were scheduled after musicStop');
  });
  checkNodes(env,'song '+name); env.nodes.length=mark;
  if(ok) console.log('song    '+name.padEnd(7)+(s.key||'?').padEnd(9)+String(s.bpm).padStart(4)+' bpm '+String(s.len/s.bar).padStart(3)+' bars '+secs.toFixed(1).padStart(6)+' s  '+s.tr.length+' tracks  peak '+poly+' voices');
}
for(const k of LEVELS) if(bpmOf.map>=bpmOf[k]) fail('the map tune ('+bpmOf.map+' bpm) must be slower than level "'+k+'" ('+bpmOf[k]+' bpm)');
attempt('switching songs and stopping',()=>{ A.musicStart('title'); env.advance(0.04); A.musicStart('boss'); env.advance(0.04); if(env.timers.size!==1) fail('switching songs left '+env.timers.size+' timers'); A.musicStart('nope'); if(env.timers.size) fail('an unknown song should mean silence'); A.musicStop(); A.musicStop(); });

/* ---------- 6. awkward browsers: no Web Audio, a constructor that throws, the webkit prefix, resume() returning nothing ---------- */
for(const [what,opt] of [['no AudioContext',{noAC:true}],['AudioContext that throws',{ctorThrows:true}],['webkitAudioContext',{webkit:true}],['resume() returning nothing',{resumeNothing:true,state:'suspended'}]]){
  const e=makeEnv(opt), B=attempt('loading with '+what,()=>load(e)); if(!B) continue;
  attempt('running with '+what,()=>{
    B.musicStart('title'); B.auInit(); B.auInit(); for(const k of SFX) B.sfx[k](); B.setMuted(true); B.setMuted(false); B.musicMuffle(true); B.musicDuck(1); B.musicRate(1.12); B.musicPause(false);
    for(let i=0;i<50;i++) e.advance(0.04); e.state='running'; for(let i=0;i<50;i++) e.advance(0.04); B.auInit(); for(const k of SFX) B.sfx[k](); B.musicStop();
    if(opt.webkit&&!e.nodes.some(n=>n.kind==='osc')) fail('a song started before auInit never began playing with '+what);
  });
}

if(failed){ console.error('audio check failed: '+failed+' problem(s)'); process.exit(1); }
console.log('audio ok');
