'use strict';
/* dashboard.js — build the studio engine's visual dashboard (single HTML).
   Collects every project (brief + sheets + render plan + compiled prompts)
   and renders a dark studio UI. studio.js `dashboard` command writes it
   locally and, when a passphrase env is set, encrypts it into site/studio/. */
const fs = require('fs');
const path = require('path');

const STUDIO = path.resolve(__dirname, '..');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function maybeJson(p) { return fs.existsSync(p) ? readJson(p) : null; }

function collect() {
  const projectsDir = path.join(STUDIO, 'projects');
  const projects = [];
  for (const slug of fs.readdirSync(projectsDir)) {
    if (slug === '_template' || slug.startsWith('.')) continue;
    const dir = path.join(projectsDir, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const plan = maybeJson(path.join(dir, 'output/render-plan.json'));
    const prompts = {};
    if (plan) {
      for (const a of plan.assets) {
        const p = path.join(dir, a.prompt_file);
        if (fs.existsSync(p)) prompts[`${a.campaign}--${a.id}`] = fs.readFileSync(p, 'utf8');
        a.rendered = fs.existsSync(path.join(dir, 'renders', a.id));
      }
    }
    projects.push({
      slug,
      brief: maybeJson(path.join(dir, 'brief.json')),
      product: maybeJson(path.join(dir, 'product-sheet.json')),
      character: maybeJson(path.join(dir, 'character-sheet.json')),
      scene: maybeJson(path.join(dir, 'scene-sheet.json')),
      plan, prompts,
    });
  }
  const campaigns = readJson(path.join(STUDIO, 'config/campaigns.json'));
  const models = readJson(path.join(STUDIO, 'config/models.json'));
  return { projects, campaigns, models, built_at: new Date().toISOString() };
}

function buildHtml() {
  const data = collect();
  // <-escape so embedded prompts can never break out of the script tag
  const DATA = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>avatiser — studio engine</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#080808">
<style>
:root { --bg:#080808; --bg2:#0F0F0F; --bg3:#161616; --line:#242424; --line2:#2E2E2E;
  --mut:#6E6E6E; --mut2:#484848; --sil:#B8B8B8; --wht:#EFEFEF; --wht2:#F8F8F8; --acc:#7FB8A4; }
* { margin:0; box-sizing:border-box; }
body { background:var(--bg); color:var(--sil); font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; padding-bottom:80px; }
.top { position:sticky; top:0; z-index:9; display:flex; align-items:baseline; gap:14px; padding:18px clamp(16px,4vw,40px); background:rgba(8,8,8,.92); backdrop-filter:blur(14px); border-bottom:1px solid var(--line); }
.mark { font-weight:900; font-size:22px; letter-spacing:-.03em; color:var(--wht2); }
.mark i { font-style:normal; color:var(--sil); }
.top span { font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:var(--mut); }
.wrap { max-width:1100px; margin:0 auto; padding:0 clamp(16px,4vw,40px); }
.tabs { display:flex; gap:8px; flex-wrap:wrap; margin:26px 0 6px; }
.tab { font-size:13px; font-weight:700; padding:9px 18px; border-radius:100px; border:1px solid var(--line2); color:var(--sil); background:none; cursor:pointer; }
.tab.on { background:var(--wht2); color:var(--bg); border-color:var(--wht2); }
h2 { font-size:11px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:var(--mut); margin:38px 0 14px; display:flex; align-items:center; gap:12px; }
h2::after { content:''; flex:1; height:1px; background:var(--line); }
.hero { margin-top:30px; }
.hero .name { font-size:clamp(24px,4vw,38px); font-weight:900; letter-spacing:-.02em; color:var(--wht2); line-height:1.15; }
.hero .cli { font-size:13px; color:var(--mut); margin-top:6px; }
.chips { display:flex; flex-wrap:wrap; gap:7px; margin-top:14px; }
.chip { font-size:11px; font-weight:600; letter-spacing:.05em; border:1px solid var(--line2); padding:5px 13px; border-radius:100px; }
.chip.hl { background:var(--wht2); color:var(--bg); border-color:var(--wht2); font-weight:800; }
.grid3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; }
.card { background:var(--bg2); border:1px solid var(--line); border-radius:12px; padding:18px 20px; }
.card h3 { font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--acc); margin-bottom:12px; }
.kv { display:grid; grid-template-columns:96px 1fr; gap:4px 12px; font-size:13px; }
.kv b { color:var(--mut); font-weight:600; font-size:11px; letter-spacing:.04em; text-transform:uppercase; padding-top:2px; }
.kv span { color:var(--wht); }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { text-align:left; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--mut); font-weight:700; padding:8px 10px; border-bottom:1px solid var(--line2); }
td { padding:9px 10px; border-bottom:1px solid var(--line); color:var(--wht); vertical-align:top; }
tr.camp td { background:var(--bg3); font-size:10px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sil); }
.tag { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.06em; padding:2px 9px; border-radius:5px; border:1px solid var(--line2); }
.tag.video { color:#D6B87F; border-color:#5a4d33; }
.tag.image { color:#8FB6D6; border-color:#33455a; }
.mdl { font-size:11px; color:var(--acc); }
.dep { font-size:11px; color:var(--mut); }
.st { font-size:11px; } .st.ok { color:var(--acc); } .st.wait { color:var(--mut); }
details { border:1px solid var(--line); border-radius:10px; background:var(--bg2); margin-bottom:8px; overflow:hidden; }
summary { cursor:pointer; padding:13px 16px; font-size:13.5px; font-weight:700; color:var(--wht); display:flex; align-items:center; gap:10px; list-style:none; }
summary::-webkit-details-marker { display:none; }
summary .cam { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--mut); }
summary::after { content:'+'; margin-left:auto; color:var(--mut); font-weight:400; font-size:16px; }
details[open] summary::after { content:'–'; }
.pbody { border-top:1px solid var(--line); position:relative; }
pre { padding:16px 18px; font:11.5px/1.55 ui-monospace,'SF Mono',Menlo,monospace; color:var(--sil); white-space:pre-wrap; word-break:break-word; max-height:420px; overflow:auto; }
.copy { position:absolute; top:10px; right:12px; font-size:11px; font-weight:700; background:var(--bg3); color:var(--sil); border:1px solid var(--line2); padding:6px 13px; border-radius:7px; cursor:pointer; }
.copy:hover { color:var(--wht2); border-color:var(--mut); }
.route { font-size:12.5px; }
.route td:first-child { color:var(--mut); }
.empty { padding:40px; text-align:center; color:var(--mut); border:1px dashed var(--line2); border-radius:12px; }
.foot { margin-top:48px; font-size:12px; color:var(--mut2); line-height:1.8; }
code { background:var(--bg3); border:1px solid var(--line); padding:1px 7px; border-radius:5px; font-size:11.5px; color:var(--sil); }
</style>
</head>
<body>
<div class="top"><div class="mark">avatiser<i>.</i></div><span>studio engine</span></div>
<div class="wrap">
  <div class="tabs" id="tabs"></div>
  <div id="view"></div>
  <div class="foot">
    generated <span id="ts"></span> · regenerate: <code>node studio/studio.js dashboard</code>
    after any <code>compile</code> · prompts are trade craft — this page stays behind the lock.
  </div>
</div>
<script>
var DATA = ${DATA};
var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
var join = function(v){ return Array.isArray(v) ? v.join(', ') : (v || '—'); };
function kv(rows){ return '<div class="kv">' + rows.map(function(r){ return '<b>'+r[0]+'</b><span>'+esc(join(r[1]))+'</span>'; }).join('') + '</div>'; }

function renderProject(p){
  var h = '';
  var b = p.brief || {};
  h += '<div class="hero"><div class="name">' + esc(b.product_name || p.slug) + '</div>';
  h += '<div class="cli">' + esc(b.client || '') + (b.market ? ' · ' + esc(b.market) : '') + '</div>';
  h += '<div class="chips">' + (b.campaigns||[]).map(function(c){ return '<span class="chip hl">'+esc(c)+'</span>'; }).join('');
  h += (b.brand_voice ? '<span class="chip">'+esc(b.brand_voice)+'</span>' : '') + '</div></div>';

  h += '<h2>consistency sheets</h2><div class="grid3">';
  var pr = p.product, ch = p.character, sc = p.scene;
  h += '<div class="card"><h3>product</h3>' + (pr ? kv([['name',pr.name],['form',pr.form_factor],['hero angle',pr.hero_angle],['must read',pr.label && pr.label.must_read_text],['claims',pr.claims]]) : '<span class="dep">not built</span>') + '</div>';
  h += '<div class="card"><h3>character</h3>' + (ch ? kv([['role',ch.role],['casting',ch.casting && (ch.casting.age_range+' · '+ch.casting.ethnicity_region)],['face',ch.casting && ch.casting.face_notes],['energy',ch.performance && ch.performance.energy],['identity',ch.identity && ch.identity.soul_identity_id || 'not yet locked']]) : '<span class="dep">not built</span>') + '</div>';
  h += '<div class="card"><h3>scene</h3>' + (sc ? kv([['world',sc.world],['key light',sc.settings && sc.settings[0] && sc.settings[0].light && sc.settings[0].light.key],['palette',sc.camera && sc.camera.palette],['grade',sc.camera && sc.camera.grade]]) : '<span class="dep">not built</span>') + '</div>';
  h += '</div>';

  h += '<h2>render plan</h2>';
  if (!p.plan) { h += '<div class="empty">not compiled yet — run <code>node studio/studio.js compile '+esc(p.slug)+'</code></div>'; }
  else {
    var groups = {};
    p.plan.assets.forEach(function(a){ (groups[a.campaign] = groups[a.campaign] || []).push(a); });
    h += '<div style="overflow-x:auto"><table><tr><th>asset</th><th>type</th><th>model</th><th>spec</th><th>needs</th><th>status</th></tr>';
    Object.keys(groups).forEach(function(c){
      h += '<tr class="camp"><td colspan="6">'+esc(c)+'</td></tr>';
      groups[c].forEach(function(a){
        h += '<tr><td>'+esc(a.id)+'</td><td><span class="tag '+a.type+'">'+a.type+'</span></td><td class="mdl">'+esc(a.model)+'</td>'
           + '<td>'+esc(a.aspect)+(a.duration_s?' · '+a.duration_s+'s':'')+' · ×'+a.count+'</td>'
           + '<td class="dep">'+esc(a.depends_on||'—')+'</td>'
           + '<td class="st '+(a.rendered?'ok':'wait')+'">'+(a.rendered?'rendered':'awaiting keys')+'</td></tr>';
      });
    });
    h += '</table></div>';
  }

  h += '<h2>compiled prompts</h2>';
  var keys = Object.keys(p.prompts||{});
  if (!keys.length) h += '<div class="empty">compile to see prompts</div>';
  keys.forEach(function(k){
    var parts = k.split('--');
    h += '<details><summary><span class="cam">'+esc(parts[0])+'</span>'+esc(parts[1])+'</summary>'
       + '<div class="pbody"><button class="copy" data-k="'+esc(k)+'">copy</button><pre>'+esc(p.prompts[k])+'</pre></div></details>';
  });

  h += '<h2>model routing</h2><div style="overflow-x:auto"><table class="route"><tr><th>job</th><th>primary</th><th>fallback</th></tr>';
  Object.keys(DATA.models.routing).forEach(function(r){
    var m = DATA.models.routing[r];
    h += '<tr><td>'+esc(r)+'</td><td class="mdl">'+esc(m.primary)+'</td><td class="dep">'+esc(m.fallback||'—')+'</td></tr>';
  });
  h += '</table></div>';
  return h;
}

var cur = 0;
function draw(){
  var tabs = document.getElementById('tabs');
  tabs.innerHTML = DATA.projects.map(function(p,i){
    return '<button class="tab'+(i===cur?' on':'')+'" data-i="'+i+'">'+esc(p.slug)+'</button>';
  }).join('');
  document.getElementById('view').innerHTML = DATA.projects.length
    ? renderProject(DATA.projects[cur])
    : '<div class="empty" style="margin-top:30px">no projects yet — <code>node studio/studio.js new &lt;slug&gt;</code></div>';
}
document.addEventListener('click', function(e){
  var t = e.target.closest('.tab'); if (t) { cur = +t.dataset.i; draw(); return; }
  var c = e.target.closest('.copy');
  if (c) {
    var txt = DATA.projects[cur].prompts[c.dataset.k];
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
      function(){ c.textContent='copied ✓'; setTimeout(function(){ c.textContent='copy'; },1400); },
      function(){ c.textContent='select + copy manually'; });
  }
});
document.getElementById('ts').textContent = new Date(DATA.built_at).toLocaleString();
draw();
</script>
</body>
</html>`;
}

module.exports = { buildHtml, collect };
