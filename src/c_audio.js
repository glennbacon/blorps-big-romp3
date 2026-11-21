/* ================= audio: everything is synthesised ================= */
/* Signal path:  sfx -> sg (or sl / sr, a little to the left or right) ──────────────┐
                 music notes -> song bus -> mg -> mf (underwater low-pass) -> dk (duck) -> comp -> master -> out
                 song "wet" bus -> es -> dl (echo, fed back through ef and fb) -> eo -> mg
                 anything sent to rs -> rv (a room, made from a burst of fading noise) -> ro -> mg, or -> comp for effects */
const AU={ac:null,muted:false,dead:false,vol:0.4,muf:false,open:18000,master:null,comp:null,sg:null,sl:null,sr:null,mg:null,mf:null,dk:null,es:null,dl:null,ef:null,fb:null,eo:null,rs:null,rv:null,ro:null,xs:null,noise:null,pan:0,amb:0};
/* Some old browsers return nothing from resume(), so never chain on it blindly. */
function auWake(ac){ try{ const p=ac.resume(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} }
function auInit(){
  if(AU.ac){ if(AU.ac.state!=='running') auWake(AU.ac); return; }
  if(AU.dead) return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC){ AU.dead=true; return; }
    const ac=new AC(), gn=v=>{ const g=ac.createGain(); g.gain.value=v; return g; };
    const bq=(type,f,q)=>{ const b=ac.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q; return b; };
    AU.open=Math.min(18000,ac.sampleRate*0.45);
    AU.master=gn(AU.muted?0:AU.vol); AU.master.connect(ac.destination);
    /* a gentle compressor glues music and effects together and catches the odd pile-up of loud sounds */
    const c=AU.comp=ac.createDynamicsCompressor(); c.threshold.value=-10; c.knee.value=10; c.ratio.value=3; c.attack.value=0.005; c.release.value=0.15; c.connect(AU.master);
    AU.sg=gn(1); AU.sg.connect(c);
    /* two more doors for effects, one each side, for things that happen off to the left or right of Blorp */
    AU.sl=gn(1); AU.sr=gn(1);
    if(ac.createStereoPanner){ const pl=ac.createStereoPanner(), pr=ac.createStereoPanner(); pl.pan.value=-0.62; pr.pan.value=0.62; AU.sl.connect(pl); pl.connect(c); AU.sr.connect(pr); pr.connect(c); }
    else { AU.sl.connect(c); AU.sr.connect(c); }
    AU.dk=gn(1); AU.dk.connect(c);
    AU.mf=bq('lowpass',AU.muf?700:AU.open,0.5); AU.mf.connect(AU.dk);
    AU.mg=gn(0.5); AU.mg.connect(AU.mf);
    /* the echo: one delay line with a darkened feedback loop. Its time is set per song. */
    AU.es=gn(0.3); AU.dl=ac.createDelay(1); AU.dl.delayTime.value=0.3; AU.ef=bq('lowpass',2600,0.5); AU.fb=gn(0.33); AU.eo=gn(1);
    AU.es.connect(AU.dl); AU.dl.connect(AU.ef); AU.ef.connect(AU.fb); AU.fb.connect(AU.dl); AU.ef.connect(AU.eo); AU.eo.connect(AU.mg);
    const n=ac.createBuffer(1,Math.floor(ac.sampleRate),ac.sampleRate), d=n.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    AU.noise=n;
    /* the room: a second and a half of noise dying away is all a reverb needs to be told. Music sends to it by the
       instrument; effects send a little, always. */
    AU.rs=gn(1); AU.ro=gn(0.5); AU.xs=gn(0.16);
    if(ac.createConvolver){ const len=Math.floor(ac.sampleRate*1.5), ir=ac.createBuffer(2,len,ac.sampleRate);
      for(let ch=0;ch<2;ch++){ const q=ir.getChannelData(ch); for(let i=0;i<len;i++) q[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); }
      AU.rv=ac.createConvolver(); AU.rv.buffer=ir; AU.rs.connect(AU.rv); AU.rv.connect(AU.ro); AU.ro.connect(AU.mg);
      const xr=ac.createConvolver(); xr.buffer=ir; const xo=gn(0.5); AU.xs.connect(xr); xr.connect(xo); xo.connect(c);
      for(const b of [AU.sg,AU.sl,AU.sr]) b.connect(AU.xs); }
    AU.ac=ac;
    if(ac.state!=='running') auWake(ac);
  }catch(e){ AU.ac=null; AU.dead=true; }
}
function setMuted(m){ AU.muted=!!m; if(AU.master) AU.master.gain.value=AU.muted?0:AU.vol; }
const auNoteIx={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function NF(n){ let i=1,s=auNoteIx[n[0]]; if(n[1]==='#'){ s++; i++; } else if(n[1]==='b'){ s--; i++; } return 440*Math.pow(2,(s+(+n.slice(i)-4)*12-9)/12); }
/* one oscillator with a click-free envelope; returns it so a caller can hang a wobble on its pitch */
function voice(type,f0,f1,t,dur,vol,dest){
  const ac=AU.ac; const o=ac.createOscillator(), g=ac.createGain();
  o.type=type; o.frequency.setValueAtTime(f0,t); if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.03);
  return o;
}
/* where effects made from now on come from: -1 left of Blorp, 0 where he is, 1 right. The game sets it back to 0 every frame. */
function auFrom(side){ AU.pan=side<0?-1:side>0?1:0; }
const auOut=()=>AU.pan<0?AU.sl:AU.pan>0?AU.sr:AU.sg;
function tone(type,f0,f1,dur,vol,delay){ if(!AU.ac||AU.ac.state!=='running') return null; return voice(type,f0,f1,AU.ac.currentTime+(delay||0),dur,vol,auOut()); }
/* a tone whose pitch shakes `depth` Hz either way, `rate` times a second: giggles, growls and sparks */
function auWob(type,f0,f1,dur,vol,delay,rate,depth){
  const o=tone(type,f0,f1,dur,vol,delay); if(!o) return;
  const ac=AU.ac, t=ac.currentTime+(delay||0), l=ac.createOscillator(), lg=ac.createGain();
  l.frequency.value=rate; lg.gain.value=depth; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t+dur+0.03);
}
/* A burst of the shared noise. A gain node sits at 1 until its first scheduled value: start it at 0, or a burst that begins a sample early clicks at full volume. */
function auBurst(t,dur,vol,dest){
  const ac=AU.ac, s=ac.createBufferSource(), g=ac.createGain(); s.buffer=AU.noise; s.loop=true;
  g.gain.value=0; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(g); g.connect(dest); s.start(t,Math.random()*0.5); s.stop(t+dur+0.02);
}
function hiss(dur,vol,delay,hp){
  const ac=AU.ac; if(!ac||ac.state!=='running') return; const t=ac.currentTime+(delay||0);
  const f=ac.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp||900; f.connect(auOut());
  auBurst(t,dur,vol,f);
}
/* noise through a filter that sweeps from f0 to f1: whooshes (bandpass) and rumbles (lowpass). `att` is the share of the time spent swelling in. */
function auWhoosh(type,f0,f1,dur,vol,delay,att){
  const ac=AU.ac; if(!ac||ac.state!=='running') return; const t=ac.currentTime+(delay||0);
  const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=AU.noise; s.loop=true;
  f.type=type; f.Q.value=type==='bandpass'?1.2:0.7; f.frequency.setValueAtTime(f0,t); f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.value=0; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+dur*(att||0.08)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f); f.connect(g); g.connect(auOut()); s.start(t,Math.random()*0.5); s.stop(t+dur+0.02);
}
/* a run of notes `gap` seconds apart, each `len` long, optionally starting `delay` seconds from now */
function jingle(type,notes,gap,vol,len,delay){ notes.split(' ').forEach((n,i)=>{ if(n!=='.') tone(type,NF(n),0,len||gap*1.4,vol,(delay||0)+i*gap); }); }
/* semitone steps of a major pentatonic scale: coin streaks and stomp combos climb it */
const auPent=[0,2,4,7,9,12,14,16,19];
/* Loudness rule of thumb, so nothing jumps out over a coin: square and saw up to 0.12, triangle and sine up to 0.3, raw hiss up to 0.2, filtered noise up to 0.4. */
const sfx={
  /* --- moving about --- */
  jump(big=false){ tone('square',big?250:330,big?520:680,0.17,0.1); tone('triangle',big?125:165,big?260:340,0.15,0.2); },
  jump2(){ tone('square',520,1040,0.11,0.07); tone('sine',780,1560,0.14,0.14,0.02); auWhoosh('bandpass',1800,4200,0.15,0.3); },
  wallKick(){ tone('square',700,350,0.045,0.1); tone('square',440,900,0.08,0.1,0.04); hiss(0.04,0.12,0,2000); },
  poundStart(){ tone('triangle',1800,480,0.2,0.2); tone('square',1810,485,0.2,0.03); },
  poundLand(){ tone('sine',140,38,0.3,0.26); tone('triangle',92,40,0.22,0.24); auWhoosh('lowpass',1400,180,0.28,0.34); hiss(0.05,0.12,0,1200); },
  glide(){ auWhoosh('bandpass',700,1900,0.4,0.22,0,0.4); },
  puff(){ hiss(0.05,0.05,0,1500); },
  slide(){ tone('triangle',1400,300,0.7,0.17); tone('sine',2800,600,0.7,0.05); },
  spring(){ tone('sine',220,980,0.28,0.28); tone('square',220,980,0.2,0.05); tone('sine',440,1960,0.2,0.08,0.03); },
  launch(){ tone('sine',170,42,0.4,0.3); tone('sawtooth',110,700,0.4,0.05); auWhoosh('bandpass',300,3200,0.55,0.4,0,0.25); },
  pipe(){ [440,330,247].forEach((f,i)=>{ tone('square',f,f*0.62,0.13,0.1,i*0.16); tone('triangle',f/2,f*0.31,0.13,0.22,i*0.16); }); },
  /* --- new moves and new ground --- */
  dash(){ auWhoosh('bandpass',600,5200,0.22,0.36,0,0.15); tone('sawtooth',300,1400,0.16,0.06); tone('sine',900,2600,0.18,0.12,0.02); },
  squelch(){ tone('sine',170,90,0.12,0.2); auWhoosh('lowpass',700,220,0.14,0.28); },
  /* a bouncy block: n is 0 for a hop, 1 for a high bounce, 2 for a pound; x picks the note, so a row of them is a tune */
  boing(n=0,x=0,kind=''){ const k=clamp(n|0,0,2), m=Math.pow(2,auPent[(((x|0)%5)+5)%5]/12);
    if(kind==='drum'){ tone('sine',(150+k*20)*m,60,0.2,0.28); tone('triangle',300*m,150,0.07,0.16); hiss(0.05,0.1,0,1200); }
    else if(kind==='hay'){ auWhoosh('lowpass',900,240,0.16,0.3); tone('triangle',140+k*40,260+k*90,0.14,0.22); }
    else { const f=(170+k*45)*m; tone('sine',f,f*(2.6+k*0.5),0.24,0.24); tone('triangle',f*2,f*5,0.15,0.1,0.02); if(k===2) hiss(0.06,0.1,0,1500); } },
  geyser(){ auWhoosh('bandpass',300,2400,0.9,0.34,0,0.3); hiss(0.6,0.07,0.1,2500); tone('sine',90,160,0.5,0.18); },
  laser(){ auWob('sawtooth',880,820,0.3,0.05,0,60,120); tone('square',1760,1700,0.25,0.025); hiss(0.08,0.07,0,5000); },
  chute(){ tone('triangle',200,90,0.16,0.26); hiss(0.1,0.1,0,600); },
  tick(n=0){ tone('square',[880,880,1320][clamp(n|0,0,2)],0,0.05,0.07); },
  beat(on=true){ tone('square',on?523:392,0,0.08,0.08); tone('triangle',on?262:196,0,0.12,0.2); },
  note(n=0){ const f=523.25*Math.pow(2,auPent[(((n|0)%9)+9)%9]/12); tone('triangle',f,0,0.3,0.24); tone('sine',f*2,0,0.2,0.08); },
  dark(){ tone('sine',600,80,0.5,0.2); auWhoosh('lowpass',1200,150,0.5,0.28); },
  /* --- the new monsters --- */
  pop(){ hiss(0.07,0.2,0,1800); tone('square',900,200,0.06,0.1); },
  buzz(){ auWob('sawtooth',220,330,0.45,0.06,0,90,40); },
  croak(){ auWob('square',140,90,0.28,0.08,0,38,30); tone('triangle',180,110,0.26,0.2); },
  tongue(){ tone('square',300,900,0.1,0.08); tone('sine',600,1500,0.12,0.14,0.02); },
  rattle(){ [0,0.05,0.1,0.16].forEach((d,i)=>tone('square',900+i*210,600,0.035,0.07,d)); },
  caw(){ auWob('sawtooth',700,480,0.2,0.06,0,22,90); auWob('sawtooth',640,420,0.22,0.06,0.22,22,90); },
  roll(){ auWhoosh('lowpass',300,120,0.4,0.3); tone('triangle',70,55,0.35,0.2); },
  splat(){ auWhoosh('lowpass',1200,200,0.2,0.32); tone('sine',260,120,0.14,0.2); },
  chomp(){ tone('square',200,90,0.08,0.1); tone('square',260,100,0.08,0.1,0.1); hiss(0.04,0.1,0.1,1500); },
  bleep(){ tone('square',1200,0,0.05,0.06); tone('square',1600,0,0.05,0.06,0.08); tone('square',2000,0,0.09,0.06,0.16); },
  shot(){ tone('sawtooth',1400,300,0.16,0.07); hiss(0.05,0.1,0,4000); },
  saw(){ auWob('sawtooth',500,460,0.3,0.035,0,50,60); hiss(0.25,0.04,0,4500); },
  thunder(){ auWhoosh('lowpass',900,60,1.1,0.4,0.05,0.05); tone('sine',70,34,0.9,0.24); hiss(0.1,0.14,0,700); },
  firework(){ tone('sine',700,2300,0.4,0.08); hiss(0.25,0.14,0.42,1500); tone('sine',180,60,0.3,0.18,0.42); },
  /* --- water --- */
  splash(){ auWhoosh('bandpass',500,2600,0.32,0.4); hiss(0.16,0.09,0.05,3000); tone('sine',300,120,0.14,0.2); },
  swim(){ tone('sine',300,620,0.12,0.2); tone('sine',520,900,0.07,0.1,0.07); },
  bubble(){ tone('sine',900,1700,0.05,0.07); },
  /* --- pick-ups --- */
  coin(streak=0){ const f=784*Math.pow(2,auPent[(((streak|0)%8)+8)%8]/12); tone('square',f,0,0.07,0.1); tone('square',f*1.335,0,0.28,0.12,0.06); tone('sine',f*2.67,0,0.2,0.05,0.06); },
  sprout(){ jingle('square','C5 E5 G5 C6 E6 G6',0.045,0.09,0.08); jingle('triangle','C4 E4 G4 C5 E5 G5',0.045,0.2,0.08); },
  power(){ jingle('square','G4 C5 E5 G5 C6 E6 G6 C7',0.055,0.1,0.1); jingle('square','E4 G4 C5 E5 G5 C6 E6 G6',0.055,0.05,0.1); },
  oneup(){ jingle('square','E5 G5 E6 C6 D6 G6',0.1,0.11,0.14); jingle('triangle','C4 . G4 . B4 D5',0.1,0.24,0.14); },
  check(){ jingle('triangle','C5 G5 C6',0.08,0.25,0.16); jingle('square','. . E6',0.08,0.06,0.2); },
  spark(n=1){
    const k=clamp(n|0,1,3)-1;
    jingle('square',['E6 A6 C#7','E6 A6 C#7 E7','A5 C#6 E6 A6 C#7 E7 . A7'][k],0.06,0.07,0.2+k*0.08);
    jingle('sine',['E7 A7','E7 A7 C#8','. . E7 A7 C#8 E8 . A8'][k],0.06,0.05,0.25,0.03);
    if(k===2) jingle('triangle','A3 . E4 . A4 . . A4',0.06,0.2,0.3);
  },
  /* --- blocks and gadgets --- */
  bump(){ tone('triangle',170,80,0.11,0.3); tone('square',170,80,0.05,0.04); },
  brk(){ hiss(0.2,0.2,0,500); tone('square',220,60,0.16,0.1); tone('triangle',110,50,0.18,0.2,0.02); },
  crumble(){ auWhoosh('lowpass',900,150,0.4,0.36); tone('triangle',140,60,0.3,0.2); [0.06,0.15,0.26].forEach((d,i)=>tone('square',200-i*40,90,0.05,0.06,d)); },
  switchOn(){ tone('square',330,0,0.04,0.1); tone('square',660,0,0.1,0.1,0.05); hiss(0.02,0.1,0,3000); },
  thud(){ tone('triangle',110,45,0.22,0.3); tone('sine',80,40,0.2,0.25); hiss(0.12,0.12,0,200); },
  clonk(){ tone('triangle',130,48,0.25,0.26); tone('sine',72,36,0.3,0.24,0.01); tone('square',300,90,0.05,0.09); hiss(0.1,0.16,0,400); },
  fuse(){ hiss(0.25,0.07,0,5000); auWob('square',2200,1700,0.22,0.025,0,43,300); },
  explode(){ auWhoosh('lowpass',2600,90,0.8,0.34); tone('sine',120,30,0.5,0.26); tone('square',160,40,0.25,0.07); hiss(0.1,0.18,0,800); },
  rocket(){ auWhoosh('bandpass',400,3400,0.45,0.36,0,0.2); tone('sawtooth',160,520,0.4,0.06); tone('square',900,300,0.06,0.07); },
  zap(){ auWob('sawtooth',1600,220,0.22,0.08,0,70,480); tone('square',2400,300,0.08,0.06); hiss(0.2,0.14,0,3500); },
  /* --- friends and foes --- */
  stomp(combo=0){ const m=Math.pow(2,auPent[clamp(combo|0,0,8)]/12); tone('square',420*m,110*m,0.13,0.12); tone('triangle',660*m,0,0.1,0.18,0.04); hiss(0.07,0.15); },
  kick(){ tone('square',520,880,0.07,0.12); hiss(0.03,0.1,0,1800); },
  fire(){ tone('square',880,280,0.11,0.09); hiss(0.08,0.07,0,2500); },
  spit(){ tone('square',300,640,0.09,0.09); },
  shatter(){ hiss(0.14,0.18,0,2500); tone('square',1500,700,0.08,0.06); tone('sine',3100,1900,0.12,0.06,0.03); },
  ghost(){ auWob('sine',700,620,0.16,0.18,0,13,40); auWob('sine',880,790,0.16,0.18,0.17,13,50); auWob('sine',620,470,0.32,0.18,0.34,11,45); },
  hurt(){ jingle('square','E5 C5 A4 E4 C4',0.07,0.12,0.1); tone('triangle',220,70,0.3,0.2); },
  bossHit(){ tone('sawtooth',300,70,0.3,0.12); tone('triangle',150,50,0.3,0.24); hiss(0.15,0.18,0,300); },
  bossRoar(){ auWob('sawtooth',170,62,0.95,0.1,0,28,34); auWob('square',85,42,0.95,0.06,0,19,13); auWhoosh('lowpass',900,220,0.95,0.36,0,0.2); },
  /* a boss falls: eight tumbling thumps, a boom, then sparkles rising out of the smoke */
  bossDown(){
    for(let i=0;i<8;i++){ const m=Math.pow(0.85,i); tone('sawtooth',520*m,250*m,0.16,0.09,i*0.13); hiss(0.08,0.12,i*0.13+0.02,500); }
    auWhoosh('lowpass',1800,100,0.9,0.4,1.05); tone('sine',110,30,0.7,0.3,1.05);
    jingle('square','C5 E5 G5 C6 E6 G6 C7 E7',0.07,0.08,0.22,1.8); jingle('sine','C6 E6 G6 C7 E7 G7 C8 E8',0.07,0.06,0.3,1.83);
  },
  /* --- jingles --- */
  die(){ jingle('square','B4 . F5 . F5 E5 D5 C5 . G4 . E4',0.085,0.11,0.14); jingle('triangle','G3 . D3 . D3 . G2 . . C3 . C2',0.085,0.26,0.16); },
  clear(){ jingle('square','G4 C5 E5 G5 C6 E6 G6 . E6 . G6',0.1,0.1,0.2); jingle('square','E4 G4 C5 E5 G5 C6 E6 . C6 . E6',0.1,0.05,0.2); jingle('triangle','C3 . G3 . C4 . G3 . C4 . C3',0.1,0.24,0.2); },
  over(){ jingle('triangle','C5 . G4 . E4 . A4 B4 A4 Ab4 Bb4 Ab4 G4',0.13,0.25,0.22); jingle('sine','C3 . . . C3 . F3 . . Ab3 . . G3',0.13,0.2,0.4); },
  win(){
    jingle('square','C5 C5 C5 E5 G5 . E5 G5 C6 . C6 E6 G6 . . C7',0.11,0.1,0.24); jingle('square','E4 E4 E4 G4 C5 . C5 E5 G5 . G5 C6 E6 . . G6',0.11,0.05,0.24);
    jingle('triangle','C3 . . C3 G3 . . G3 C4 . . E4 G4 . . C4',0.11,0.24,0.24); hiss(0.3,0.06,1.65,6000);
  },
  /* a world's boss is beaten: the level-clear tune's big sister */
  worldClear(){ jingle('square','C5 E5 G5 C6 . G5 C6 E6 . C6 E6 G6 . . . C7',0.1,0.1,0.24); jingle('square','E4 G4 C5 E5 . C5 E5 G5 . E5 G5 C6 . . . E6',0.1,0.05,0.24);
    jingle('triangle','C3 . G3 . C4 . G3 . C4 . E4 . G4 . . C4',0.1,0.24,0.24); hiss(0.3,0.05,1.5,6000); },
  /* the sun comes back: a slow climb into a held chord */
  dawn(){ jingle('sine','C4 G4 C5 E5 G5 C6 E6 G6',0.16,0.16,0.9); jingle('triangle','C3 . . . G3 . . C4',0.16,0.22,1.2); jingle('square','. . . . . . E6 G6 C7',0.16,0.05,0.8); },
  /* --- menus and messages --- */
  card(){ jingle('square','C5 G5 C6',0.07,0.07,0.12); jingle('triangle','C4 . G4',0.07,0.2,0.16); },
  pause(){ tone('square',660,0,0.07,0.1); tone('square',440,0,0.1,0.1,0.08); },
  uiMove(){ tone('square',660,0,0.04,0.07); },
  uiOk(){ tone('square',660,0,0.06,0.09); tone('square',990,0,0.12,0.09,0.06); },
  hint(){ tone('sine',784,0,0.14,0.2); tone('sine',1047,0,0.24,0.2,0.11); },
  tally(){ tone('square',1568,0,0.03,0.06); },
  iris(){ auWhoosh('bandpass',300,2400,0.45,0.22,0,0.5); },
  /* --- the map: a hop along the path, a way that is shut, a tile of new path (rising as the path grows), a marker opening, a level chosen, a gate swinging wide --- */
  mapHop(){ tone('triangle',560,760,0.06,0.16); },
  mapNo(){ tone('triangle',150,95,0.12,0.3); },
  mapTile(k=0){ tone('square',392*Math.pow(2,((((k|0)%12)+12)%12)/6),0,0.07,0.07); },
  mapOpen(){ jingle('square','C5 E5 G5 C6',0.065,0.1,0.14); },
  mapPlay(){ jingle('square','G4 C5 E5 G5 C6',0.045,0.1,0.09); jingle('triangle','C4 . G4 . C5',0.045,0.2,0.12); },
  gate(){ auWhoosh('lowpass',260,900,1,0.3,0,0.5); jingle('triangle','C3 G3 C4 E4 G4 C5',0.11,0.2,0.4); jingle('square','. . . C5 E5 G5 C6',0.11,0.07,0.4); }
};

/* ================= music: a step sequencer with any number of tracks ================= */
/* A track is a line of tokens, one per step (an eighth or a sixteenth, the song says which). 'E5' plays a note, '.' rests, '-' holds the note before it.
   A drum track uses letters instead, and a token may stack several: k kick, s snare, h closed hat, o open hat, r shaker, p clap, t tick, T tock, c high conga, b low conga. */
function parseTrack(s,dr){
  const tok=s.trim().split(/\s+/), out=[];
  for(let i=0;i<tok.length;i++){
    if(tok[i]==='.'||tok[i]==='-'){ out.push(null); continue; }
    if(dr){ out.push({h:tok[i]}); continue; }
    let d=1; while(tok[i+d]==='-') d++; const fs=tok[i].split('+').map(NF); out.push({f:fs[0],fs:fs.length>1?fs:null,d}); /* C4+E4+G4 is a chord */
  }
  return out;
}
/* Harmony is written as chord names and spelled out by musArp, so bass and arpeggios always agree with the chords.
   `chords` holds one name per `per` steps ('C', 'Am', 'G7', 'Fm7', 'CM7', 'Bdim', 'Dsus', 'C6'...). `pat` is a line of chord tones, repeated as needed:
   1 root, 3 third, 5 fifth, 7 seventh (the octave on a plain triad), 8 octave, 9 ninth; add ^ to go up an octave, _ to go down. `lo` is the lowest root allowed. */
const musQual={'':[0,4,7,12],m:[0,3,7,12],7:[0,4,7,10],m7:[0,3,7,10],M7:[0,4,7,11],dim:[0,3,6,9],sus:[0,5,7,12],aug:[0,4,8,12],6:[0,4,7,9],m6:[0,3,7,9]};
const musNames=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
function musMidi(n){ return Math.round(69+12*Math.log2(NF(n)/440)); }
function musArp(chords,per,pat,lo){
  const ps=pat.trim().split(/\s+/), base=musMidi(lo), out=[];
  chords.trim().split(/\s+/).forEach((c,ci)=>{
    const m=/^([A-G][#b]?)(.*)$/.exec(c)||['','C',''], q=musQual[m[2]]||musQual[''], r=base+((musMidi(m[1]+'0')-base)%12+12)%12;
    for(let i=0;i<per;i++){
      const p=ps[(ci*per+i)%ps.length];
      if(p==='.'||p==='-'){ out.push(p); continue; }
      const d=+p[0], n=r+(d===8?12:d===9?14:q[d>>1]||0)+12*(p.split('^').length-p.split('_').length);
      out.push(musNames[n%12]+(Math.floor(n/12)-1));
    }
  });
  return out.join(' ');
}
/* song({bpm, spb: steps per beat, bpb: beats per bar, sw: swing 0..0.3, ec: echo time in beats, fb: echo feedback}, [instrument, track], ...)
   An instrument is {w: waveform, v: volume, a: attack seconds, s: level left at the end of a note (leave out for a pluck), g: gate, the share of the step that sounds,
   det: cents for a second, detuned oscillator (the fat pulse feel), h: pitch ratio of an added sine partial, vib: vibrato depth in cents on long notes, e: 1 sends it to the echo,
   r: how much of it goes to the room (0 to 1), lp: [from, to] a low-pass that sweeps between those multiples of the note's pitch (a pluck closes, a swell opens),
   pan: -1 to 1, where it sits from left to right, dr: 1 marks a drum track}. */
function song(o,...tracks){
  const tr=tracks.map(([ins,s])=>({ins,seq:parseTrack(s,ins.dr)})), spb=o.spb||2;
  return {key:o.key||'',bpm:o.bpm,spb,bar:spb*(o.bpb||4),sw:o.sw||0,ec:o.ec||0.75,fb:o.fb||0.33,tr,len:Math.max(...tr.map(t=>t.seq.length))};
}
const mus={song:null,step:0,next:0,timer:0,rate:1,paused:false,fresh:false,dry:null,wet:null,hh:null,sn:null,room:null};
/* one note of a pitched instrument: up to three oscillators through one envelope */
function musNote(ins,f,t,dur,dest){
  const ac=AU.ac, g=ac.createGain(), e=t+dur, a=Math.min(ins.a||0.006,dur*0.4), end=e+(ins.s?0.08:0.03), os=[];
  let into=g;
  if(ins.lp){ const fl=ac.createBiquadFilter(); fl.type='lowpass'; fl.Q.value=ins.q||1; const f0=Math.min(AU.open,f*ins.lp[0]), f1=Math.min(AU.open,Math.max(40,f*ins.lp[1]));
    fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(f1,t+Math.max(0.03,dur*0.9)); fl.connect(g); into=fl; }
  const osc=(type,fr,det)=>{ const o=ac.createOscillator(); o.type=type; o.frequency.setValueAtTime(fr,t); if(det) o.detune.setValueAtTime(det,t); o.connect(into); o.start(t); o.stop(end); os.push(o); };
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(ins.v,t+a);
  if(ins.s){ g.gain.exponentialRampToValueAtTime(ins.v*ins.s,e); g.gain.exponentialRampToValueAtTime(0.0001,e+0.05); } else g.gain.exponentialRampToValueAtTime(0.0001,e);
  osc(ins.w,f,0); if(ins.det) osc(ins.w,f,ins.det); if(ins.h) osc('sine',f*ins.h,0);
  /* vibrato only on notes long enough to hear it, and it fades in. The wobble oscillator stops with the note, so nothing is left running. */
  if(ins.vib&&dur>0.24){
    const l=ac.createOscillator(), lg=ac.createGain(); l.frequency.value=ins.vr||5.5;
    lg.gain.value=0; lg.gain.setValueAtTime(0,t+0.1); lg.gain.linearRampToValueAtTime(ins.vib,t+0.24);
    l.connect(lg); os.forEach(o=>lg.connect(o.detune)); l.start(t); l.stop(end);
  }
  g.connect(dest);
}
/* the drum kit: a pitched sine thump for the kick, noise bursts through two shared filters for snare and hats, short blips for the rest */
const musKit={
  /* new to the kit: x a crash, m and l a middle and a low tom, w a wood block, n a rim click, z a zap */
  x(t,v){ auBurst(t,0.5,0.1*v,mus.hh); },
  m(t,v){ voice('sine',200,120,t,0.16,0.36*v,mus.dry); },
  l(t,v){ voice('sine',130,72,t,0.2,0.4*v,mus.dry); },
  w(t,v){ voice('square',820,0,t,0.035,0.07*v,mus.dry); },
  n(t,v){ voice('triangle',480,0,t,0.03,0.22*v,mus.dry); },
  z(t,v){ voice('sawtooth',900,120,t,0.09,0.05*v,mus.dry); },
  k(t,v){ voice('sine',150,46,t,0.15,0.5*v,mus.dry); },
  s(t,v){ auBurst(t,0.13,0.3*v,mus.sn); voice('triangle',230,140,t,0.07,0.16*v,mus.dry); },
  h(t,v){ auBurst(t,0.035,0.1*v,mus.hh); },
  o(t,v){ auBurst(t,0.17,0.085*v,mus.hh); },
  r(t,v){ auBurst(t,0.07,0.05*v,mus.hh); },
  p(t,v){ auBurst(t,0.05,0.26*v,mus.sn); },
  t(t,v){ voice('triangle',1700,0,t,0.03,0.2*v,mus.dry); },
  T(t,v){ voice('triangle',1100,0,t,0.045,0.2*v,mus.dry); },
  c(t,v){ voice('sine',420,330,t,0.11,0.3*v,mus.dry); },
  b(t,v){ voice('sine',250,170,t,0.14,0.34*v,mus.dry); }
};
/* Every song gets its own buses. Fading the old ones out silences any notes still queued from the song before. */
function musDrop(){
  const ac=AU.ac;
  if(ac) [mus.dry,mus.wet].forEach(b=>{ if(b) try{ b.gain.cancelScheduledValues(ac.currentTime); b.gain.setTargetAtTime(0,ac.currentTime,0.02); }catch(e){} });
  if(ac&&mus.room) try{ mus.room.gain.cancelScheduledValues(ac.currentTime); mus.room.gain.setTargetAtTime(0,ac.currentTime,0.02); }catch(e){}
  mus.dry=mus.wet=mus.hh=mus.sn=mus.room=null; if(mus.song) for(const tr of mus.song.tr) tr.out=null;
}
function musBegin(){
  const ac=AU.ac, t=ac.currentTime, s=mus.song;
  const bq=(type,f,q)=>{ const b=ac.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q; b.connect(mus.dry); return b; };
  mus.room=ac.createGain(); mus.room.connect(AU.rs);
  mus.dry=ac.createGain(); mus.dry.connect(AU.mg); mus.wet=ac.createGain(); mus.wet.connect(mus.dry); mus.wet.connect(AU.es);
  /* each track that asks for a place or a seat in the room gets a door of its own into the song's bus */
  for(const tr of s.tr){ const ins=tr.ins; tr.out=null; if(ins.dr||(!ins.pan&&!ins.r)) continue;
    const g=ac.createGain(); let last=g;
    if(ins.pan&&ac.createStereoPanner){ const pn=ac.createStereoPanner(); pn.pan.value=clamp(ins.pan,-1,1); g.connect(pn); last=pn; }
    last.connect(ins.e?mus.wet:mus.dry);
    if(ins.r){ const sd=ac.createGain(); sd.gain.value=clamp(ins.r,0,1); last.connect(sd); sd.connect(mus.room); }
    tr.out=g; }
  mus.hh=bq('highpass',7500,0.7); mus.sn=bq('bandpass',2200,0.5);
  /* retune the echo to the new tempo while its output is shut, so the jump in delay time is never heard */
  AU.eo.gain.cancelScheduledValues(t); AU.eo.gain.setTargetAtTime(0,t,0.008); AU.eo.gain.setValueAtTime(0,t+0.06); AU.eo.gain.linearRampToValueAtTime(1,t+0.3);
  AU.dl.delayTime.setValueAtTime(Math.min(0.95,60/s.bpm*s.ec),t+0.05); AU.fb.gain.setValueAtTime(s.fb,t+0.05);
  mus.fresh=false; mus.next=t+0.1;
}
/* Called from a timer: queue every step that falls in the next fifth of a second on the audio clock, which never drifts or stutters the way timers do. */
function musicTick(){
  const ac=AU.ac, s=mus.song; if(!ac||!s||ac.state!=='running') return;
  if(mus.fresh) musBegin();
  if(mus.paused){ mus.next=ac.currentTime+0.06; return; }
  if(mus.next<ac.currentTime) mus.next=ac.currentTime+0.03;
  const sd=60/s.bpm/s.spb/mus.rate;
  while(mus.next<ac.currentTime+0.2){
    const i=mus.step%s.len, t=mus.next+(i&1?s.sw*sd:0);
    /* while muted the song keeps its place but builds no notes */
    if(!AU.muted) for(const tr of s.tr){
      const n=tr.seq[i%tr.seq.length], ins=tr.ins; if(!n) continue;
      if(n.h){ for(const c of n.h) if(musKit[c]) musKit[c](t,ins.v||1); }
      else { const dest=tr.out||(ins.e?mus.wet:mus.dry), dur=sd*n.d*(ins.g||0.9); if(n.fs) for(const f of n.fs) musNote(ins,f,t,dur,dest); else musNote(ins,n.f,t,dur,dest); }
    }
    mus.step++; mus.next+=sd;
  }
}
/* A song asked for before the first tap or key simply waits: the timer runs, and the tune starts from the top once the audio context is alive. */
function musicStart(name){
  musicStop();
  if(!Object.prototype.hasOwnProperty.call(SONGS,name)) return;
  mus.song=SONGS[name]; mus.step=0; mus.rate=1; mus.paused=false; mus.fresh=true; mus.timer=setInterval(musicTick,40); musicTick();
}
function musicStop(){ if(mus.timer) clearInterval(mus.timer); mus.timer=0; musDrop(); mus.song=null; }
function musicPause(p){ mus.paused=!!p; }
function musicRate(r){ mus.rate=r>0?clamp(r,0.25,4):1; }
/* under water: close a low-pass over the music quickly, open it again over about a third of a second */
function musicMuffle(on){
  on=!!on; if(on===AU.muf) return; AU.muf=on;
  const ac=AU.ac; if(ac) AU.mf.frequency.setTargetAtTime(on?700:AU.open,ac.currentTime,on?0.06:0.1);
}
/* drop the music to about a third for `sec` seconds so a jingle can be heard, then let it swell back */
function musicDuck(sec=1){
  const ac=AU.ac; if(!ac) return; const t=ac.currentTime, p=AU.dk.gain, d=sec>0?Math.min(sec,10):1;
  p.cancelScheduledValues(t); p.setTargetAtTime(0.35,t,0.03); p.setTargetAtTime(1,t+d,0.12);
}

/* ================= the air of a place ================= */
/* Small sounds at random, so a level is never quite silent under its tune: birds, crickets, frogs, drips, wind, rain,
   a far-off crowd, the hum of neon, bubbles, the crackle of embers. The game calls this every frame with the time gone
   by and the kind its theme names; each kind is only a chance per second and a sound. */
const auAirs={
  birds:[0.45,r=>{ const f=2100+r*1100; auWob('sine',f,f*0.82,0.11,0.028,0,20,240); if(r>0.4) auWob('sine',f*1.1,f*0.9,0.1,0.024,0.14,20,240); if(r>0.7) auWob('sine',f*1.2,f,0.12,0.02,0.28,24,260); }],
  crickets:[1.1,r=>{ const f=3900+r*700; for(let i=0;i<3;i++) tone('sine',f,0,0.03,0.016,i*0.06); }],
  frogs:[0.4,r=>{ auWob('square',120+r*60,90,0.2,0.02,0,36,22); }],
  drips:[0.5,r=>{ const f=900+r*1500; tone('sine',f,f*1.5,0.07,0.045); tone('sine',f*1.5,f*2,0.05,0.02,0.09); }],
  wind:[0.22,r=>{ auWhoosh('bandpass',280+r*300,700+r*500,1.2,0.11,0,0.5); }],
  rain:[1.4,r=>{ auWhoosh('bandpass',4200+r*600,3600,1.1,0.07,0,0.4); }],
  crowd:[0.3,r=>{ auWhoosh('bandpass',800+r*300,1300,0.9,0.05,0,0.4); if(r>0.6) tone('triangle',[523,659,784][(r*30|0)%3],0,0.25,0.02); }],
  hum:[0.45,r=>{ auWob('sawtooth',118+r*4,118,0.8,0.01,0,60,3); if(r>0.8) tone('square',2400,0,0.02,0.012); }],
  bubbles:[0.7,r=>{ const f=420+r*900; tone('sine',f,f*1.8,0.06,0.035); }],
  embers:[0.9,r=>{ hiss(0.03,0.03+r*0.03,0,2500+r*2000); }],
  bells:[0.25,r=>{ const f=[1047,1319,1568,2093][(r*40|0)%4]; tone('sine',f,0,0.9,0.03); tone('sine',f*2.01,0,0.5,0.012); }]
};
function auAir(kind,dt){
  const a=auAirs[kind]; if(!a||!AU.ac||AU.ac.state!=='running'||AU.muted||!(dt>0)) return;
  AU.amb+=dt*a[0]*(0.5+Math.random()); if(AU.amb<1) return; AU.amb=0;
  auFrom(Math.random()<0.5?-1:1); a[1](Math.random()); auFrom(0);
}

/* ================= the songs ================= */
/* Each is built inside its own little function so the phrase names stay private. Leads are written out note by note; bass and arpeggios come from the chord line. */
const SONGS={};
/* stretch a line written in eighths onto a sixteenth grid: every note, hold and rest lasts two steps */
function musX2(s){ return s.trim().split(/\s+/).map(k=>k==='.'?'. .':k+' -').join(' ')+' '; }
/* Whole chords, for stabs and pads: like musArp, but every x in the pattern plays root, third and fifth together. */
function musChord(chords,per,pat,lo){
  const ps=pat.trim().split(/\s+/), base=musMidi(lo), out=[], nm=n=>musNames[n%12]+(Math.floor(n/12)-1);
  chords.trim().split(/\s+/).forEach((c,ci)=>{
    const m=/^([A-G][#b]?)(.*)$/.exec(c)||['','C',''], q=musQual[m[2]]||musQual[''], r=base+((musMidi(m[1]+'0')-base)%12+12)%12;
    for(let i=0;i<per;i++){ const p=ps[(ci*per+i)%ps.length]; out.push(p==='x'?nm(r)+'+'+nm(r+q[1])+'+'+nm(r+q[2]):p==='X'?nm(r)+'+'+nm(r+q[1])+'+'+nm(r+q[2])+'+'+nm(r+q[3]):p); }
  });
  return out.join(' ');
}
/* The songs every world shares are here; each world's own tune is in its file in src/worlds/, between the marks
   @song and @endsong, so the audio check can find it. */
/* title screen: the main theme. D major, striding: a tune that climbs a sixth and comes down smiling, over chords that
   are stabbed on the off-beats. The middle eight lifts to G and works its way back through E minor and A. */
SONGS.title=(()=>{
  const h='A5 . D6 . F#6 - E6 D6  B5 - - A5 G5 - . .  G5 . B5 . E6 - D6 B5  A5 - - - . . A5 B5 ';
  const a=h+'C#6 . E6 . A6 - G6 E6  F#6 - - D6 B5 - . .  G5 . B5 . D6 . E6 .  E6 - - - C#6 - A5 - ';
  const a2=h+'C#6 . E6 . A6 - G6 E6  F#6 - - D6 B5 - D6 .  E6 . C#6 . A5 . C#6 .  D6 - - - . . . . ';
  const b='B5 - - G5 B5 - D6 -  E6 - D6 B5 G5 - . .  A5 - - F#5 A5 - D6 -  F#6 - E6 D6 A5 - . .  G5 - - E5 G5 - B5 -  D6 - C#6 B5 G5 - B5 .  C#6 - - . E6 - - .  A5 C#6 E6 A6 G6 - E6 C#6 ';
  const ch='D G Em A A Bm G A  D G Em A A Bm A D  G G D D Em Em A A7  D G Em A A Bm A D';
  const d='k . h . s . h h ', d2='k h h k s h k h ';
  return song({key:'D major',bpm:136},
    [{w:'square',v:0.045,det:9,vib:9,s:0.5,e:1,r:0.25},a+a2+b+a2],
    [{w:'square',v:0.018,g:0.5,pan:0.35},musArp(ch,8,'1 5 8 5 3^ 5 8 5','A3')],
    [{w:'sawtooth',v:0.016,g:0.55,lp:[5,1.3],pan:-0.35,r:0.4},musChord(ch,8,'. x . . x . x .','A3')],
    [{w:'triangle',v:0.24,g:0.8},musArp(ch,8,'1 . . 1 5 . 1 3','D2')],
    [{dr:1,v:1},('kx . h . s . h h '+d.repeat(6)+'k . h . s s s s ').repeat(2)+'kx h h k s h k h '+d2.repeat(6)+'k . s . s s s s kx . h . s . h h '+d.repeat(6)+'k . h o s . s s ']);
})();
/* the world map: a stroll in C major with a lazy swing, whistled over a plucked strum, slower than any level */
SONGS.map=(()=>{
  const h='E5 . G5 . C6 - B5 A5  A5 - E5 . C5 - . .  F5 . A5 . D6 - C6 A5  G5 - - . . . E5 G5 ';
  const a=h+'A5 . C6 . E6 - D6 C6  B5 - G5 . E5 - . G5  A5 . G5 . F5 . D5 .  G5 - - - . . . . ';
  const a2=h+'A5 . C6 . E6 - D6 C6  B5 - G5 . E5 - . G5  F5 . A5 . G5 . B4 .  C5 - - - . . . . ';
  const b='F5 - A5 - C6 - - .  E6 . D6 . C6 - A5 .  G5 - C6 - E6 - - .  D6 . C6 . G5 - E5 .  F5 - A5 - D6 - - .  C6 . B5 . A5 - F5 .  G5 - - . B5 - - .  D6 - B5 - G5 - D5 . ';
  const ch='C Am F G Am Em Dm G  C Am F G Am Em Dm C  F F C C Dm Dm G G7  C Am F G Am Em Dm C';
  return song({key:'C major',bpm:92,sw:0.16},
    [{w:'sine',v:0.12,vib:10,s:0.7,a:0.02,e:1,r:0.4},a+a2+b+a2],
    [{w:'triangle',v:0.05,h:2,g:0.4,pan:0.3,lp:[6,2]},musChord(ch,8,'. x . x . x x .','G3')],
    [{w:'triangle',v:0.24,g:0.8},musArp(ch,8,'1 . . 5 1 . 5 .','E2')],
    [{dr:1,v:0.6},'k . r . p . r r']);
})();
/* boss fights: E minor at a gallop, hammering its first note; the harmony sinks Em, C, Am, B like a door closing, and
   the middle section breaks for G before B7 drags it back */
SONGS.boss=(()=>{
  const h='E5 E5 . G5 . B5 . G5  E6 - D6 B5 G5 - . .  C5 C5 . E5 . G5 . E5  C6 - B5 G5 E5 - . . ';
  const a=h+'A4 A4 . C5 . E5 . C5  A5 - G5 E5 C5 - E5 .  B4 . D#5 . F#5 . A5 .  B5 A5 F#5 D#5 B4 D#5 F#5 A5 ';
  const a2=h+'A4 A4 . C5 . E5 . A5  F#5 . D#5 . B4 . D#5 F#5  E5 - - B4 G4 - B4 .  E5 E5 . E5 . B4 E5 . ';
  const b='G5 - - B5 D6 - - .  F#6 - G6 - D6 - B5 .  A5 - - C6 E6 - - .  D6 - E6 - C6 - A5 .  F#5 - - A5 C6 - - .  B5 - C6 - A5 - F#5 .  B5 . D#6 . F#6 . D#6 .  A6 - F#6 - D#6 B5 A5 F#5 ';
  const ch='Em Em C C Am Am B B7  Em Em C C Am B Em Em  G G Am Am D D B B7  Em Em C C Am B Em Em';
  return song({key:'E minor',bpm:170},
    [{w:'square',v:0.05,det:12,vib:8,g:0.85,e:1},a+a2+b+a2],
    [{w:'sawtooth',v:0.022,g:0.4,pan:0.3},musArp(ch,8,'1 . 3 1 . 3 5 .','E4')],
    [{w:'sawtooth',v:0.065,g:0.6,lp:[9,2]},musArp(ch,8,'1 . 1 1 1 . 1 1','E2')],
    [{w:'triangle',v:0.22,g:0.7},musArp(ch,8,'1 . . 1 . . 5 .','E2')],
    [{dr:1,v:1},'kh h sh kh h kh sh h '.repeat(7)+'kh kh sh sh kl kl s s']);
})();
/* the last fight: D minor, grand and a little mad. An organ of stacked chords, a tune in long strides, and timpani */
SONGS.baron=(()=>{
  const h='D5 - F5 - A5 - - G5  F5 - E5 - D5 - - .  Bb4 - D5 - F5 - - E5  D5 - C#5 - A4 - - . ';
  const a=h+'G4 - Bb4 - D5 - - C5  Bb4 - A4 - G4 - Bb4 -  A4 . C#5 . E5 . G5 .  A5 - - - E5 - C#5 - ';
  const a2=h+'G5 - Bb5 - D6 - - C6  Bb5 - A5 - G5 - E5 -  F5 . A5 . D6 . F6 .  D6 - - - . . A5 . ';
  const b='F5 - - A5 C6 - - .  E6 - F6 - C6 - A5 .  E5 - - G5 C6 - - .  D6 - E6 - C6 - G5 .  D5 - - F5 Bb5 - - .  A5 - Bb5 - F5 - D5 .  A5 . C#6 . E6 . A6 .  G6 - E6 - C#6 A5 G5 E5 ';
  const ch='Dm Dm Bb A Gm Gm A A7  Dm Dm Bb A Gm C7 Dm Dm  F F C C Bb Bb A A7  Dm Dm Bb A Gm C7 Dm Dm';
  return song({key:'D minor',bpm:156,ec:0.5,fb:0.3},
    [{w:'square',v:0.05,det:10,vib:10,s:0.6,g:0.9,e:1,r:0.3},a+a2+b+a2],
    [{w:'sawtooth',v:0.014,g:0.9,s:0.8,lp:[3,3],r:0.6},musChord(ch,8,'X - - - X - X -','A3')],
    [{w:'sawtooth',v:0.06,g:0.6,lp:[8,2]},musArp(ch,8,'1 1 8 1 1 1 8 1','D2')],
    [{w:'triangle',v:0.22,g:0.8},musArp(ch,8,'1 - . 1 5 - 1 .','D2')],
    [{dr:1,v:1},'kx h s h k k s h '+'k h s h k k s h '.repeat(6)+'l l m m l m s s '+'kx h s h k k s h '+'k h s h k k s h '.repeat(6)+'k k s s l l m m ']);
})();
/* secret coin rooms: sixteen giddy bars of A major, all running eighths and hand claps, over before you know it and round again */
SONGS.bonus=(()=>{
  const a='A5 C#6 E6 A6 E6 C#6 E6 .  A6 . A6 . G#6 E6 C#6 .  D6 F#6 A6 F#6 D6 F#6 A6 .  B6 . A6 . F#6 D6 A5 .  E6 G#6 B6 G#6 E6 G#6 B6 .  E6 . D6 . B5 G#5 E5 .  A5 . C#6 . E6 . A6 .  G#6 E6 B5 E6 G#6 B6 . . ';
  const a2='F#6 . A6 . D6 . F#6 A6  D7 - A6 . F#6 - . .  E6 . A6 . C#6 . E6 A6  C#7 - A6 . E6 - . .  D6 . F#6 . B5 . D6 F#6  E6 G#6 B6 E7 . B6 G#6 .  A6 . E6 C#6 A5 . C#6 E6  A6 . . . A5 . . . ';
  const ch='A A D D E E A E  D D A A Bm E A A';
  return song({key:'A major',bpm:182},
    [{w:'square',v:0.055,g:0.7,e:1},a+a2],
    [{w:'triangle',v:0.11,g:0.4,pan:0.3},musArp(ch,8,'. 3 . 5 . 8 . 5','A3')],
    [{w:'triangle',v:0.25,g:0.6},musArp(ch,8,'1 . 8 . 1 . 8 5','E2')],
    [{dr:1,v:0.9},'k h sp h k k sp h '.repeat(7)+'k h sp h sp sp sp sp']);
})();
