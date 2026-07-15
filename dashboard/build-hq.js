#!/usr/bin/env node
/* ============================================================================
   build-hq.js — encrypt the mission-control dashboard into site/hq/index.html
   ----------------------------------------------------------------------------
   The DEPLOYED page (site/hq/index.html) is pure AES-256-GCM ciphertext plus a
   small lock screen. The passphrase is NEVER written to any file — it is read
   from the HQ_PASSPHRASE env var at build time and typed by you at view time.
   Decryption happens entirely in your browser via Web Crypto. Even though the
   repo is public and the URL is guessable, nobody without the passphrase can
   read a single number.

   Usage:  HQ_PASSPHRASE='your-passphrase' node dashboard/build-hq.js
   ============================================================================ */
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PASS = process.env.HQ_PASSPHRASE;
if (!PASS) { console.error('ERROR: set HQ_PASSPHRASE env var'); process.exit(1); }
const ITER = 250000; // PBKDF2 rounds — matched on the browser side

const b64file = (rel) => fs.readFileSync(path.join(ROOT, rel)).toString('base64');

/* 1 ── self-contained payload: the dashboard with both fonts inlined so it has
        no path dependencies once decrypted and written into the page. */
let payload = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
payload = payload
  .replace("url('../site/assets/fonts/JayaGiriSans.woff2') format('woff2')",
           `url(data:font/woff2;base64,${b64file('site/assets/fonts/JayaGiriSans.woff2')}) format('woff2')`)
  .replace("url('../site/assets/fonts/DMSans-Variable.woff2') format('woff2')",
           `url(data:font/woff2;base64,${b64file('site/assets/fonts/DMSans-Variable.woff2')}) format('woff2')`);

/* 2 ── encrypt (AES-256-GCM, key from PBKDF2-SHA256). Web Crypto expects the
        16-byte GCM auth tag appended to the ciphertext, so we concat it. */
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(PASS, salt, ITER, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const BLOB = Buffer.concat([salt, iv, ct, tag]).toString('base64'); // salt|iv|ct|tag

/* 3 ── the lock-screen shell (self-contained: display font inlined for the mark). */
const JAYA = b64file('site/assets/fonts/JayaGiriSans.woff2');
const shell = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>avatiser — hq</title>
<meta name="theme-color" content="#080808">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23080808'/%3E%3Ctext x='32' y='46' font-family='Arial,sans-serif' font-size='40' font-weight='900' fill='%23F8F8F8' text-anchor='middle'%3Ea%3C/text%3E%3Ccircle cx='51' cy='44' r='4' fill='%23B8B8B8'/%3E%3C/svg%3E">
<style>
@font-face { font-family:'JA Jayagiri Sans'; src:url(data:font/woff2;base64,${JAYA}) format('woff2'); font-weight:100 900; font-display:swap; }
* { margin:0; box-sizing:border-box; }
html,body { height:100%; }
body { background:#080808; color:#B8B8B8; font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; display:flex; align-items:center; justify-content:center; padding:24px; }
.lock { width:100%; max-width:360px; text-align:center; }
.mark { font-family:'JA Jayagiri Sans',sans-serif; font-weight:900; font-size:34px; letter-spacing:-.04em; color:#F8F8F8; line-height:1; margin-bottom:8px; }
.mark i { font-style:normal; color:#B8B8B8; }
.sub { font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:#6E6E6E; margin-bottom:40px; }
.field { display:flex; gap:8px; }
input { flex:1; background:#0F0F0F; border:1px solid #2E2E2E; color:#F8F8F8; font-family:inherit; font-size:15px; padding:14px 16px; border-radius:10px; outline:none; transition:border-color .2s; -webkit-appearance:none; }
input:focus { border-color:#B8B8B8; }
button { font-family:'JA Jayagiri Sans',sans-serif; font-weight:800; font-size:13px; letter-spacing:.04em; color:#080808; background:#F8F8F8; border:none; padding:0 22px; border-radius:10px; cursor:pointer; transition:background .2s; }
button:hover { background:#D0D0D0; }
button:disabled { opacity:.5; cursor:default; }
.err { font-size:12px; color:#D08080; margin-top:14px; min-height:16px; transition:opacity .2s; opacity:0; }
.err.show { opacity:1; }
.hint { margin-top:34px; font-size:11px; color:#484848; line-height:1.6; }
.lock.shake { animation:shake .4s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
.spin { display:inline-block; width:13px; height:13px; border:2px solid rgba(8,8,8,.3); border-top-color:#080808; border-radius:50%; animation:sp .6s linear infinite; vertical-align:-2px; }
@keyframes sp { to{transform:rotate(360deg)} }
@media (prefers-reduced-motion: reduce) { .lock.shake{animation:none} .spin{animation:none} }
</style>
</head>
<body>
<div class="lock" id="lock">
  <div class="mark">avatiser<i>.</i></div>
  <div class="sub">mission control</div>
  <form class="field" id="f">
    <input id="p" type="password" inputmode="text" autocomplete="current-password" placeholder="passphrase" aria-label="Passphrase" autofocus>
    <button id="b" type="submit">unlock</button>
  </form>
  <div class="err" id="e" role="alert"></div>
  <div class="hint">private · encrypted · avatiser. studios</div>
</div>
<script>
var ITER = ${ITER};
var BLOB = "${BLOB}";
function bytes(b64){ var s=atob(b64), u=new Uint8Array(s.length); for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i); return u; }
function reveal(html){ document.open(); document.write(html); document.close(); }
async function unlock(pass){
  var raw = bytes(BLOB);
  var salt = raw.slice(0,16), iv = raw.slice(16,28), data = raw.slice(28);
  var km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  var key = await crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:ITER,hash:'SHA-256'}, km, {name:'AES-GCM',length:256}, false, ['decrypt']);
  var pt = await crypto.subtle.decrypt({name:'AES-GCM',iv:iv}, key, data);
  return new TextDecoder().decode(pt);
}
var lock=document.getElementById('lock'), inp=document.getElementById('p'), btn=document.getElementById('b'), err=document.getElementById('e');
function fail(msg){ err.textContent=msg; err.classList.add('show'); lock.classList.remove('shake'); void lock.offsetWidth; lock.classList.add('shake'); btn.disabled=false; btn.textContent='unlock'; inp.select(); }
async function attempt(pass, quiet){
  if(!pass) return;
  btn.disabled=true; btn.innerHTML='<span class="spin"></span>';
  try {
    var html = await unlock(pass);
    try { sessionStorage.setItem('hq_p', pass); } catch(_) {}
    reveal(html);
  } catch(_) {
    try { sessionStorage.removeItem('hq_p'); } catch(__){}
    if(!quiet) fail('wrong passphrase'); else { btn.disabled=false; btn.textContent='unlock'; }
  }
}
document.getElementById('f').addEventListener('submit', function(ev){ ev.preventDefault(); attempt(inp.value, false); });
inp.addEventListener('input', function(){ err.classList.remove('show'); });
/* auto-unlock within the same browser session (cleared when the tab/app closes) */
(function(){ var saved=null; try{ saved=sessionStorage.getItem('hq_p'); }catch(_){} if(saved) attempt(saved, true); })();
if(!(window.crypto && crypto.subtle)) fail('this browser blocks in-page decryption — open over https');
</script>
</body>
</html>`;

fs.mkdirSync(path.join(ROOT, 'site/hq'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'site/hq/index.html'), shell);
console.log('built site/hq/index.html  (' + Math.round(shell.length / 1024) + ' KB, payload encrypted)');
