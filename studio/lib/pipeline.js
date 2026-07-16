'use strict';
/* pipeline.js — compile a project's brief + sheets + templates into
   ready-to-fire prompts and a routed render plan. Pure functions, no I/O
   beyond reads; studio.js owns writes and command flow. */
const fs = require('fs');
const path = require('path');

const STUDIO = path.resolve(__dirname, '..');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function loadConfig() {
  return {
    models: readJson(path.join(STUDIO, 'config/models.json')),
    campaigns: readJson(path.join(STUDIO, 'config/campaigns.json')),
    realismCore: fs.readFileSync(path.join(STUDIO, 'prompts/realism-core.md'), 'utf8'),
  };
}

function loadProject(slug) {
  const dir = path.join(STUDIO, 'projects', slug);
  if (!fs.existsSync(dir)) throw new Error(`no such project: ${slug} (run: node studio/studio.js new ${slug})`);
  const need = (f) => {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) throw new Error(`${slug}/${f} missing — fill the sheets before compiling`);
    return readJson(p);
  };
  return {
    dir,
    brief: need('brief.json'),
    product: need('product-sheet.json'),
    character: need('character-sheet.json'),
    scene: need('scene-sheet.json'),
  };
}

/* resolve {{a.b.c}} against ctx; arrays join with ", "; unknown paths get a
   loud marker so a half-filled sheet can't silently ship a broken prompt */
function fillTemplate(tpl, ctx) {
  const missing = [];
  const out = tpl.replace(/\{\{([\w.-]+)\}\}/g, (_, keypath) => {
    let cur = ctx;
    for (const k of keypath.split('.')) {
      if (Array.isArray(cur) && !/^\d+$/.test(k)) {
        cur = cur.find((el) => el && el.id === k);
      } else {
        cur = (cur !== null && typeof cur === 'object') ? cur[k] : undefined;
      }
      if (cur === undefined) break;
    }
    if (cur === undefined || cur === null || cur === '') {
      missing.push(keypath);
      return `⚠MISSING:${keypath}⚠`;
    }
    if (Array.isArray(cur)) return cur.join(', ');
    if (typeof cur === 'object') return JSON.stringify(cur, null, 2);
    return String(cur);
  });
  return { text: out, missing };
}

/* expand campaign ids (following full-campaign 'includes') into a flat,
   de-duplicated deliverable list tagged with its campaign */
function expandCampaigns(ids, campaignsCfg) {
  const seen = new Set();
  const out = [];
  const walk = (id) => {
    const c = campaignsCfg.campaigns[id];
    if (!c) throw new Error(`unknown campaign: ${id}`);
    if (c.includes) return c.includes.forEach(walk);
    if (seen.has(id)) return;
    seen.add(id);
    for (const d of c.deliverables) out.push({ campaign: id, ...d });
  };
  ids.forEach(walk);
  return out;
}

function compile(slug) {
  const cfg = loadConfig();
  const proj = loadProject(slug);
  const deliverables = expandCampaigns(proj.brief.campaigns, cfg.campaigns);

  const outDir = path.join(proj.dir, 'output');
  const promptsDir = path.join(outDir, 'prompts');
  fs.mkdirSync(promptsDir, { recursive: true });

  const plan = [];
  const allMissing = {};

  for (const d of deliverables) {
    const route = cfg.models.routing[d.route];
    if (!route) throw new Error(`deliverable ${d.id}: route '${d.route}' not in models.json`);
    const model = cfg.models.models[route.primary];

    const tplPath = path.join(STUDIO, 'prompts', d.template);
    const tpl = fs.readFileSync(tplPath, 'utf8');
    const ctx = {
      brief: proj.brief,
      product: proj.product,
      character: proj.character,
      scene: proj.scene,
      deliverable: { ...d, variant_setting: d.variant || 'primary' },
      realism_core: cfg.realismCore,
    };
    const { text, missing } = fillTemplate(tpl, ctx);
    if (missing.length) allMissing[`${d.campaign}/${d.id}`] = [...new Set(missing)];

    const promptFile = `${d.campaign}--${d.id}.txt`;
    fs.writeFileSync(path.join(promptsDir, promptFile), text);

    plan.push({
      campaign: d.campaign,
      id: d.id,
      type: d.type,
      route: d.route,
      model: route.primary,
      fallback: route.fallback,
      adapter: model.adapter,
      env_key: model.env_key,
      aspect: d.aspect,
      duration_s: d.duration_s || null,
      count: d.count,
      depends_on: d.depends_on || null,
      prompt_file: `output/prompts/${promptFile}`,
      status: 'compiled',
    });
  }

  /* dependency-ordered: anything nothing depends on last, identities first */
  plan.sort((a, b) => (a.depends_on ? 1 : 0) - (b.depends_on ? 1 : 0));

  const planOut = { project: slug, compiled_at: new Date().toISOString(), assets: plan };
  fs.writeFileSync(path.join(outDir, 'render-plan.json'), JSON.stringify(planOut, null, 2));
  return { plan: planOut, missing: allMissing, promptsDir };
}

module.exports = { loadConfig, loadProject, compile, fillTemplate, expandCampaigns, STUDIO };
