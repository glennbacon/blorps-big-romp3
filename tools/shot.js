#!/usr/bin/env node
/* Takes pictures of the built game in a headless browser, for looking at a level without playing to it.

     node tools/shot.js out.png 3-2                 the start of level 3-2
     node tools/shot.js out.png 3-2 120 2           the same level, with Blorp put at x 120, y 2
     node tools/shot.js out- 3-2 20,2 80,2 140,6    several places in one go: out-0.png, out-1.png, out-2.png
     node tools/shot.js out.png map 12              the map, with Blorp on marker 12 and every level open
     node tools/shot.js out.png title               the title screen
   Options: --form 0..4 (Blorp's form), --size 1280x720, --zoom 2.6 (the map, from further off), --wait 2500 (ms to
   let each picture settle), --keep (do not make Blorp invulnerable while the picture is taken).

   This needs Playwright (npm i playwright) and is not needed to build or check the game. Where the network cannot
   reach the CDN that three.js loads from, set THREE_JS to a local copy of three.min.js (r128). */
'use strict';
const path=require('path');
let chromium; try{ ({chromium}=require('playwright')); }catch(e){ console.error('tools/shot.js needs Playwright: npm i playwright'); process.exit(2); }
const args=process.argv.slice(2), opt={form:0,size:'1280x720',zoom:1,wait:2500}, rest=[];
for(let i=0;i<args.length;i++){ const a=args[i]; if(a==='--keep') opt.keep=true; else if(a.startsWith('--')) opt[a.slice(2)]=args[++i]; else rest.push(a); }
const [out,what,...spots]=rest;
if(!out||!what){ console.error('usage: node tools/shot.js out.png <level label | map | title> [x y | x,y ...]'); process.exit(2); }
(async()=>{
  const [w,h]=String(opt.size).split('x').map(Number);
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await (await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1})).newPage(), errs=[];
  page.on('console',m=>{ if((m.type()==='error'||m.type()==='warning')&&!/GPU stall|GL Driver/.test(m.text())) errs.push(m.type()+': '+m.text()); });
  page.on('pageerror',e=>errs.push('page error: '+e.message));
  if(process.env.THREE_JS) await page.route('**/three.min.js',r=>r.fulfill({path:process.env.THREE_JS,contentType:'application/javascript'}));
  await page.goto('file://'+path.resolve(__dirname,'..','index.html')+'?q=2');
  await page.waitForTimeout(1200);
  if(!(await page.evaluate('!!window.__romp'))){ console.error('the game did not start'+(errs.length?': '+errs[0]:'')+'. Is three.js reachable? (see THREE_JS)'); await browser.close(); process.exit(1); }
  const shoot=async file=>{ await page.waitForTimeout(+opt.wait); await page.screenshot({path:file}); console.log('wrote '+file); };
  if(what==='title') await shoot(out);
  else if(what==='map'){
    await page.evaluate(`(()=>{ const r=__romp; r.G.open=r.count(); r.map(); r.at(${+(spots[0]||0)}); r.zoom(${+opt.zoom}); })()`);
    await page.waitForTimeout(1500); await shoot(out);
  } else {
    const idx=await page.evaluate(`__romp.labels().indexOf(${JSON.stringify(what)})`);
    if(idx<0){ console.error('no level '+what); await browser.close(); process.exit(2); }
    await page.evaluate(`__romp.load(${idx})`);
    await page.waitForTimeout(4200); /* the level card */
    const list=spots.length===2&&!spots[0].includes(',')?[spots.join(',')]:spots;
    const put=s=>page.evaluate(`(()=>{ const r=__romp; r.form(${+opt.form}); ${opt.keep?'':'r.player.inv=99;'} ${s?`r.tp(${s});`:''} })()`);
    if(list.length<=1){ await put(list[0]); await shoot(out); }
    else for(let i=0;i<list.length;i++){ await put(list[i]); await shoot(out.replace(/\.png$/,'')+i+'.png'); }
  }
  if(errs.length) console.log([...new Set(errs)].slice(0,10).join('\n'));
  await browser.close();
})();
