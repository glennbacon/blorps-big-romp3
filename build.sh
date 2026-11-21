#!/bin/bash
# Joins the source pieces in src/ into the single playable page, index.html.
set -e
cd "$(dirname "$0")"
PARTS="src/a_art.js src/b_levels.js src/c_audio.js src/d_render.js src/e_world.js src/e2_fx.js src/f_play.js src/g_enemies.js $(ls src/worlds/*.js | sort | tr '\n' ' ') src/m_map.js src/n_mapview.js src/z_flow.js"
cat src/head.html $PARTS src/tail.html > index.html
# Optional syntax check of the game script, when Node.js is installed.
if command -v node >/dev/null 2>&1; then
  cat $PARTS | node -e "
    let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
      try{ new Function('(()=>{\n'+s+'\n})'); console.log('script syntax ok'); }
      catch(e){ console.error('SYNTAX ERROR: '+e.message); process.exit(1); } });"
fi
echo "built index.html ($(wc -c < index.html) bytes)"
