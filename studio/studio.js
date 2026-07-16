#!/usr/bin/env node
'use strict';
/* studio.js — avatiser. studio engine CLI
   new <slug>     start a project from projects/_template
   compile <slug> sheets + templates -> output/prompts + render-plan.json
   render <slug>  execute the plan through lib/adapters (needs API keys in studio/.env)
   status <slug>  show plan progress */
const fs = require('fs');
const path = require('path');
const { compile, STUDIO } = require('./lib/pipeline');

const [, , cmd, slug] = process.argv;

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }

function loadEnv() {
  const envPath = path.join(STUDIO, '.env');
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[2]) env[m[1]] = m[2];
    }
  }
  return env;
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

const commands = {
  new() {
    if (!slug) die('usage: studio.js new <slug>');
    const dst = path.join(STUDIO, 'projects', slug);
    if (fs.existsSync(dst)) die(`project ${slug} already exists`);
    copyDir(path.join(STUDIO, 'projects/_template'), dst);
    console.log(`✓ created studio/projects/${slug}`);
    console.log('  next: drop product photos in refs/product/, fill brief.json,');
    console.log('  build the 3 sheets (prompts/sheets/*.md are the builder prompts),');
    console.log(`  then: node studio/studio.js compile ${slug}`);
  },

  compile() {
    if (!slug) die('usage: studio.js compile <slug>');
    const { plan, missing } = compile(slug);
    console.log(`✓ compiled ${plan.assets.length} assets → studio/projects/${slug}/output/`);
    for (const a of plan.assets) {
      console.log(`  [${a.type}] ${a.campaign}/${a.id} → ${a.model} (${a.aspect}${a.duration_s ? `, ${a.duration_s}s` : ''}) ×${a.count}${a.depends_on ? `  ⇠ needs ${a.depends_on}` : ''}`);
    }
    const gaps = Object.keys(missing);
    if (gaps.length) {
      console.log(`\n⚠ ${gaps.length} prompts have unfilled sheet fields (search ⚠MISSING in output/prompts/):`);
      for (const k of gaps) console.log(`  ${k}: ${missing[k].join(', ')}`);
    }
  },

  render() {
    if (!slug) die('usage: studio.js render <slug>');
    const planPath = path.join(STUDIO, 'projects', slug, 'output/render-plan.json');
    if (!fs.existsSync(planPath)) die(`no render plan — run compile first`);
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    const env = loadEnv();
    let ready = 0, blocked = 0;
    for (const a of plan.assets) {
      const adapter = require(`./lib/adapters/${a.adapter}`);
      const hasKey = !!env[a.env_key];
      if (!hasKey) {
        blocked++;
        console.log(`⏸ ${a.campaign}/${a.id}: set ${a.env_key} in studio/.env to render via ${a.model}`);
        continue;
      }
      ready++;
      console.log(`→ ${a.campaign}/${a.id} via ${a.model}...`);
      adapter.describe(a); // adapters are scaffolds: they print the exact call to wire
    }
    console.log(`\n${ready} ready, ${blocked} waiting on keys. Adapters in studio/lib/adapters/ document each provider's request shape — wire the fetch call and re-run.`);
  },

  status() {
    if (!slug) die('usage: studio.js status <slug>');
    const dir = path.join(STUDIO, 'projects', slug);
    const planPath = path.join(dir, 'output/render-plan.json');
    if (!fs.existsSync(planPath)) return console.log('not compiled yet');
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    const rendersDir = path.join(dir, 'renders');
    for (const a of plan.assets) {
      const done = fs.existsSync(path.join(rendersDir, a.id));
      console.log(`${done ? '✓' : '·'} ${a.campaign}/${a.id} (${a.model})`);
    }
  },
};

if (!commands[cmd]) {
  console.log('avatiser. studio engine\n  usage: node studio/studio.js <new|compile|render|status> <slug>');
  process.exit(cmd ? 1 : 0);
}
commands[cmd]();
