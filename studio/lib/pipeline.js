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

/* project inputs: the brief plus whichever of these exist. Which ones a
   compile actually needs depends on the campaign types in brief.campaigns
   (see 'requires' in campaigns.json) — compile() enforces that. */
const PROJECT_FILES = {
  product: 'product-sheet.json',
  character: 'character-sheet.json',
  scene: 'scene-sheet.json',
  campaign: 'campaign.md',
};
const DEFAULT_REQUIRES = ['product', 'character', 'scene'];

function loadProject(slug) {
  const dir = path.join(STUDIO, 'projects', slug);
  if (!fs.existsSync(dir)) throw new Error(`no such project: ${slug} (run: node studio/studio.js new ${slug})`);
  const briefPath = path.join(dir, 'brief.json');
  if (!fs.existsSync(briefPath)) throw new Error(`${slug}/brief.json missing`);
  const proj = { dir, slug, brief: readJson(briefPath) };
  for (const [key, file] of Object.entries(PROJECT_FILES)) {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) { proj[key] = null; continue; }
    proj[key] = file.endsWith('.md') ? parseCampaign(fs.readFileSync(p, 'utf8'), `${slug}/${file}`) : readJson(p);
  }
  return proj;
}

/* parse a fashion-campaign-director campaign.md (the skill's output format)
   into { title, concept, styling, visual_system, assumed, shots[] }.
   Shot ids: hero, support-1, support-2, support-3. Each shot may carry a
   *References:* bullet list saying what every attached image is for. */
function parseCampaign(md, label = 'campaign.md') {
  const text = md.replace(/\r\n/g, '\n');
  const title = (text.match(/^# +(.+)$/m) || [])[1];
  if (!title) throw new Error(`${label}: no "# Title" line`);

  // a **Label:** paragraph runs until the next blank line or bold label
  const para = (name) => {
    const m = text.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\n|\\n\\*\\*[A-Z]|$)`));
    return m ? m[1].trim() : '';
  };
  const visual = para('Visual system');
  const visual_system = {};
  for (const part of visual.split(/\s+·\s+/)) {
    const m = part.match(/^\s*([^:]+):\s*([\s\S]+)$/);
    if (m) visual_system[m[1].trim().toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')] = m[2].trim();
  }
  const assumed = (text.match(/^\*Assumed:\*\s*(.+)$/m) || [])[1] || '';

  const shots = [];
  const heads = [...text.matchAll(/^## +(Hero|Supporting +(\d+))\s*:\s*(.+)$/gm)];
  heads.forEach((h, i) => {
    const body = text.slice(h.index + h[0].length, i + 1 < heads.length ? heads[i + 1].index : undefined);
    const id = h[2] ? `support-${h[2]}` : 'hero';
    const prompt = (body.match(/```[^\n]*\n([\s\S]*?)\n```/) || [])[1];
    if (!prompt) throw new Error(`${label}: shot "${h[0].trim()}" has no fenced prompt block`);
    const aspect = ((body.match(/Aspect ratio:\s*([\d.]+\s*:\s*[\d.]+)/i) || prompt.match(/--ar\s+([\d.]+:[\d.]+)/) || [])[1] || '').replace(/\s/g, '');
    shots.push({
      id,
      role: h[2] ? 'supporting' : 'hero',
      name: h[3].trim(),
      purpose: ((body.match(/^\*Purpose:\*\s*(.+)$/m) || [])[1] || '').trim(),
      /* optional: a *References:* line followed by "- " bullets, one per attached image */
      references: ((body.match(/^\*References:\*[ \t]*\n((?:[ \t]*- .*(?:\n|$))+)/m) || [])[1] || '').trim(),
      prompt: prompt.trim(),
      /* optional: a "*Style frame:*" line + its own fenced block, after the main
         prompt, for when the Soul pass must differ (e.g. an empty plate for a
         scale shot, people added in the final pass). Defaults to the prompt. */
      style_prompt: ((body.match(/^\*Style frame:\*[^\n]*\n```[^\n]*\n([\s\S]*?)\n```/m) || [])[1] || prompt).trim(),
      /* 'own' when the shot has its own *Style frame:* prompt, 'same' when it has a bare
         *Style frame:* line (Soul pass with the main prompt), '' when it has neither.
         fashion-editorial always runs the style pass; beauty-editorial only when set. */
      style_frame: /^\*Style frame:\*[^\n]*\n```/m.test(body) ? 'own' : (/^\*Style frame:\*/m.test(body) ? 'same' : ''),
      /* optional: a "*Product lock:*" line + fenced block — the Nano Banana pass that
         swaps the generated product for the exact product photo, so label text is
         copied, never generated. Shots without one skip that pass. */
      product_prompt: ((body.match(/^\*Product lock:\*[^\n]*\n```[^\n]*\n([\s\S]*?)\n```/m) || [])[1] || '').trim(),
      aspect,
    });
  });
  if (!shots.some((s) => s.id === 'hero')) throw new Error(`${label}: no "## Hero: …" shot`);

  return {
    title: title.trim(),
    concept: para('Concept'),
    styling: para('Styling'),
    visual_system,
    visual_system_raw: visual,
    assumed,
    shots,
  };
}

/* walk a.b.c through ctx; inside arrays, a non-numeric key matches el.id */
function resolvePath(ctx, keypath) {
  let cur = ctx;
  for (const k of keypath.split('.')) {
    if (Array.isArray(cur) && !/^\d+$/.test(k)) {
      cur = cur.find((el) => el && el.id === k);
    } else {
      cur = (cur !== null && typeof cur === 'object') ? cur[k] : undefined;
    }
    if (cur === undefined) break;
  }
  return cur;
}

/* resolve {{a.b.c}} against ctx; arrays join with ", "; unknown paths get a
   loud marker so a half-filled sheet can't silently ship a broken prompt */
function fillTemplate(tpl, ctx) {
  const missing = [];
  const out = tpl.replace(/\{\{([\w.-]+)\}\}/g, (_, keypath) => {
    const cur = resolvePath(ctx, keypath);
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

/* every input the chosen campaigns need must exist before anything compiles */
function checkRequirements(proj, deliverables, campaignsCfg) {
  const needs = new Set();
  for (const id of new Set(deliverables.map((d) => d.campaign))) {
    for (const r of campaignsCfg.campaigns[id].requires || DEFAULT_REQUIRES) needs.add(r);
  }
  const absent = [...needs].filter((r) => !proj[r]);
  if (absent.length) {
    throw new Error(`${proj.slug}: missing ${absent.map((r) => PROJECT_FILES[r] || r).join(', ')} — `
      + (absent.includes('campaign')
        ? 'run the fashion-campaign-director skill (/campaign) to write campaign.md'
        : 'fill the sheets before compiling'));
  }
}

function compile(slug) {
  const cfg = loadConfig();
  const proj = loadProject(slug);
  if (!Array.isArray(proj.brief.campaigns) || !proj.brief.campaigns.length) {
    throw new Error(`${slug}/brief.json: 'campaigns' must list at least one campaign id`);
  }
  const deliverables = expandCampaigns(proj.brief.campaigns, cfg.campaigns);
  checkRequirements(proj, deliverables, cfg.campaigns);

  const outDir = path.join(proj.dir, 'output');
  const promptsDir = path.join(outDir, 'prompts');
  /* start clean so a shot removed from campaign.md can't leave a stale prompt */
  fs.rmSync(promptsDir, { recursive: true, force: true });
  fs.mkdirSync(promptsDir, { recursive: true });

  const plan = [];
  const allMissing = {};
  const skipped = [];

  for (const d of deliverables) {
    const route = cfg.models.routing[d.route];
    if (!route) throw new Error(`deliverable ${d.id}: route '${d.route}' not in models.json`);
    const model = cfg.models.models[route.primary];

    /* shot-bound deliverables (fashion-editorial) pull one shot out of campaign.md */
    let shot;
    if (d.shot) {
      shot = proj.campaign && proj.campaign.shots.find((s) => s.id === d.shot);
      if (!shot) {
        if (d.optional) { skipped.push(`${d.campaign}/${d.id}`); continue; }
        throw new Error(`${slug}/campaign.md has no shot '${d.shot}' (needed by ${d.campaign}/${d.id})`);
      }
      /* a pass that only some shots need, e.g. "skip_unless": "shot.product_prompt" */
      if (d.skip_unless && !resolvePath({ shot }, d.skip_unless)) { skipped.push(`${d.campaign}/${d.id}`); continue; }
    }

    const tplPath = path.join(STUDIO, 'prompts', d.template);
    const tpl = fs.readFileSync(tplPath, 'utf8');
    const ctx = {
      brief: proj.brief,
      product: proj.product,
      character: proj.character,
      scene: proj.scene,
      campaign: proj.campaign,
      shot,
      deliverable: { ...d, variant_setting: d.variant || 'primary' },
      realism_core: cfg.realismCore,
    };
    const { text, missing } = fillTemplate(tpl, ctx);
    /* deliverable fields may also be templated, e.g. "aspect": "{{shot.aspect}}" */
    const aspectFill = fillTemplate(String(d.aspect || ''), ctx);
    const aspect = aspectFill.missing.length ? (d.aspect_default || aspectFill.text) : aspectFill.text;
    if (aspectFill.missing.length && !d.aspect_default) missing.push(...aspectFill.missing);
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
      aspect,
      ...(shot ? { shot: shot.name } : {}),
      duration_s: d.duration_s || null,
      count: d.count,
      depends_on: d.depends_on || null,
      prompt_file: `output/prompts/${promptFile}`,
      status: 'compiled',
    });
  }

  /* dependency-ordered: anything nothing depends on last, identities first */
  /* drop dependencies on passes this campaign skipped (e.g. no style frame for a shot) */
  const planned = new Set(plan.map((a) => a.id));
  for (const a of plan) {
    if (!a.depends_on) continue;
    const deps = [].concat(a.depends_on).filter((x) => planned.has(x));
    a.depends_on = deps.length ? (deps.length === 1 ? deps[0] : deps) : null;
  }
  plan.sort((a, b) => (a.depends_on ? 1 : 0) - (b.depends_on ? 1 : 0));

  const planOut = { project: slug, compiled_at: new Date().toISOString(), assets: plan };
  fs.writeFileSync(path.join(outDir, 'render-plan.json'), JSON.stringify(planOut, null, 2));
  return { plan: planOut, missing: allMissing, skipped, promptsDir };
}

module.exports = { loadConfig, loadProject, parseCampaign, compile, fillTemplate, expandCampaigns, STUDIO };
