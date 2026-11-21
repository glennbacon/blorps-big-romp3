#!/bin/bash
# Joins the source pieces in src/ into the single playable page, index.html.
set -e
cd "$(dirname "$0")"
PARTS="src/a_art.js src/b_levels.js src/c_audio.js src/d_render.js src/e_world.js src/e2_fx.js src/f_play.js src/g_enemies.js $(ls src/worlds/*.js | sort | tr '\n' ' ') src/m_map.js src/n_mapview.js src/z_flow.js"
cat src/head.html $PARTS src/tail.html > index.html
# Optional checks of the game script, when Node.js is installed: that it parses, and that no two pieces have given
# the same name to a function. All the pieces share one scope, so the second would quietly replace the first.
if command -v node >/dev/null 2>&1; then
  node -e "
    const fs=require('fs'), files=process.argv.slice(1), seen=new Map(); let s='', bad=0;
    for(const f of files){ const t=fs.readFileSync(f,'utf8'); s+=t+'\n';
      for(const m of t.matchAll(/^function\s+([A-Za-z_\$][\w\$]*)/gm)){ if(seen.has(m[1])){ console.error('NAME USED TWICE: function '+m[1]+' in '+seen.get(m[1])+' and '+f); bad++; } else seen.set(m[1],f); } }
    try{ new Function('(()=>{\n'+s+'\n})'); }catch(e){ console.error('SYNTAX ERROR: '+e.message); process.exit(1); }
    if(bad) process.exit(1); console.log('script syntax ok');" $PARTS
fi
echo "built index.html ($(wc -c < index.html) bytes)"
