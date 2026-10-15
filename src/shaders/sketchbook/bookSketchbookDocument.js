/**
 * bookSketchbookDocument.js
 *
 * Warm Aesthetic Sketchbook Engine (Untuk Aneska):
 * - Estetika hangat: Palet kertas ivory/cream (#ece7dc, #fbf8f2), tinta bistre (#2b2721),
 *   aksen burgundy (#7a2b37) & hazel (#9a6a3e).
 * - Tanpa nuansa gelap (bukan dark theme, melainkan buku fisik elegan di atas meja terang).
 * - Tanpa kaca pembesar (clean, responsif, fokus ke konten).
 * - Layout anti-overflow: Teks diproteksi dengan text wrapping ketat dan pembatas tinggi halaman
 *   sehingga tidak ada teks yang keluar dari margin canvas.
 */

export function createBookSketchbookDocument(assetBaseUrl = '/sketchbook/', chapters = []) {
  const base = assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`;

  // Safely serialize chapters to inline JSON
  const chaptersJSON = JSON.stringify(chapters)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catatan Observasi Tentang Aneska</title>
<style>
@font-face{font-family:'Instrument Serif';font-style:normal;font-weight:400;font-display:block;
  src:url(${base}instrument-serif.woff2) format('woff2')}
@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-display:block;
  src:url(${base}instrument-serif-italic.woff2) format('woff2')}
@font-face{font-family:'Newsreader';font-style:normal;font-weight:200 600;font-display:swap;
  src:url(${base}newsreader.woff2) format('woff2')}

:root{
  --paper:#ece7dc;
  --ink:#2b2721;
  --ink-soft:rgba(43,39,33,.62);
  --ink-faint:rgba(43,39,33,.38);
  --hairline:rgba(43,39,33,.14);
  --earth:#9a6a3e;
  --burgundy:#7a2b37;
  --display:'Instrument Serif',Georgia,'Times New Roman',serif;
  --font:'Newsreader',Georgia,'Times New Roman',serif;
  --track-caps:.22em;
  --track-nav:.06em;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;min-height:0}
body{font-family:var(--font);background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased}
button{font:inherit}

#loadMsg{
  position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;font-size:11px;letter-spacing:var(--track-caps);text-transform:uppercase;color:var(--ink-faint);
  background:var(--paper);z-index:99;
}
#loadBar{
  width:160px;height:2px;background:var(--hairline);border-radius:2px;overflow:hidden;
}
#loadFill{
  height:100%;background:var(--earth);border-radius:2px;width:0%;transition:width .25s ease;
}

#app{display:none;width:100%;height:100%}

/* ---- sketchbook wrap ---- */
.sb-wrap{display:grid;justify-items:center;gap:12px;width:100%;position:relative;z-index:2;padding:10px 0 6px}
.sb-stage{display:flex;align-items:center;justify-content:center;width:100%;position:relative;touch-action:pan-y}
.sb-arrow{
  flex:none;display:inline-flex;align-items:center;justify-content:center;padding:8px 4px;
  border:0;background:transparent;color:var(--ink-faint);cursor:pointer;transition:color .2s,transform .2s;
  -webkit-tap-highlight-color:transparent;z-index:8;
}
.sb-arrow:hover{color:var(--ink);transform:scale(1.15)}

/* 3D container */
.sb-3d{position:relative;flex:1 1;min-width:0;max-width:900px;perspective:1750px;perspective-origin:50% 46%}
.sb-tilt{
  position:relative;transform-style:preserve-3d;
  transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--zoom,1));
  will-change:transform;
}
.sb-book{position:relative;width:100%;aspect-ratio:1760/1240;transform-style:preserve-3d;z-index:1}

/* shadows */
.sb-cast{position:absolute;pointer-events:none;z-index:0}
.sb-cast.ambient{left:5%;right:5%;top:27%;bottom:2%;background:radial-gradient(50% 50% at 50% 58%,rgba(58,44,26,.32) 0%,rgba(58,44,26,.18) 40%,rgba(58,44,26,0) 74%);filter:blur(26px);opacity:calc(1 - var(--shade,0) * .42)}
.sb-cast.contact{left:9%;right:9%;top:62%;bottom:10%;background:radial-gradient(50% 44% at 50% 42%,rgba(44,32,14,.38) 0%,rgba(44,32,14,.16) 48%,rgba(44,32,14,0) 78%);filter:blur(11px);opacity:calc(1 - var(--shade,0) * .5)}
.sb-cast.hair{left:12%;right:12%;top:70%;bottom:17%;background:radial-gradient(50% 52% at 50% 40%,rgba(40,28,10,.32) 0%,rgba(40,28,10,0) 76%);filter:blur(4px);opacity:calc(1 - var(--shade,0) * .62)}

/* spread images */
.sb-full{position:absolute;inset:0}
.sb-full img{width:100%;height:auto;display:block;border-radius:2px;box-shadow:0 10px 30px -8px rgba(43,39,33,.28)}
.sb-half{position:absolute;top:0;bottom:0;width:50%;overflow-x:clip;overflow-y:visible}
.sb-half.left{left:0}
.sb-half.right{left:50%}
.sb-half-img{width:200%;max-width:none;height:auto;display:block}
.sb-half-img.right{margin-left:-100%}
.gutter-shade{position:absolute;top:var(--pg,21.8%);bottom:var(--pg,21.8%);width:46%;pointer-events:none;opacity:calc(var(--shade,0) * .62);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%)}
.gutter-shade.left{right:0;background:linear-gradient(270deg,rgba(52,38,20,.30),rgba(52,38,20,0) 82%)}
.gutter-shade.right{left:0;background:linear-gradient(90deg,rgba(52,38,20,.24),rgba(52,38,20,0) 82%)}

/* ---- 18-strip page curl ---- */
.curl{position:absolute;top:0;height:100%;width:calc(var(--bw,0px) * var(--span));transform-style:preserve-3d;z-index:6}
.curl.next{left:50%;transform-origin:left center;transform:rotateY(calc(-1 * var(--tt,0deg)))}
.curl.prev{right:50%;transform-origin:right center;transform:rotateY(var(--tt,0deg))}
.strip{position:absolute;top:0;height:100%;width:calc(var(--bw,0px) * var(--span) / var(--n));transform-style:preserve-3d}
.curl.next .strip{transform-origin:left center}
.curl.prev .strip{transform-origin:right center}
.curl.next>.strip{left:0}
.curl.prev>.strip{right:0;left:auto}
.curl.next .strip .strip{left:100%;transform:rotateY(var(--td,0deg))}
.curl.prev .strip .strip{right:100%;transform:rotateY(calc(-1 * var(--td,0deg)))}
.face{position:absolute;top:0;bottom:0;left:0;right:-1.1px;backface-visibility:hidden;-webkit-backface-visibility:hidden;background-repeat:no-repeat;background-size:var(--bw,0px) auto}
.face.back{transform:rotateY(180deg)}
.face .sh,.face .gl{-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%)}
.strip.edge .face .sh,.strip.edge .face .gl{-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 9%,#000 91%,transparent 100%),var(--hf);mask-image:linear-gradient(180deg,transparent 0,#000 9%,#000 91%,transparent 100%),var(--hf);-webkit-mask-composite:source-in;mask-composite:intersect}
.curl.next .strip.edge .face.front,.curl.prev .strip.edge .face.back{--hf:linear-gradient(90deg,#000 0 22%,transparent 96%)}
.curl.next .strip.edge .face.back,.curl.prev .strip.edge .face.front{--hf:linear-gradient(270deg,#000 0 22%,transparent 96%)}
.face .sh{position:absolute;left:0;right:0;top:var(--pg,21.8%);bottom:var(--pg,21.8%);pointer-events:none}
.curl.next .face.front .sh,.curl.prev .face.back .sh{background:linear-gradient(90deg,rgba(58,43,20,var(--a1,0)),rgba(58,43,20,var(--a2,0)))}
.curl.next .face.back .sh,.curl.prev .face.front .sh{background:linear-gradient(90deg,rgba(58,43,20,var(--a2,0)),rgba(58,43,20,var(--a1,0)))}
.face .gl{position:absolute;left:0;right:0;top:var(--pg,21.8%);bottom:var(--pg,21.8%);pointer-events:none;background:#fffaf0;opacity:calc(var(--shade,0) * var(--lit,1) * var(--lit,1) * .20)}

/* ---- toolbar ---- */
.sb-tools{display:flex;align-items:center;gap:6px;border:1px solid var(--hairline);border-radius:999px;padding:4px 8px;background:rgba(250,246,238,.75);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(43,39,33,.08)}
.tool{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:var(--ink-soft);cursor:pointer;transition:background-color .18s ease,color .18s ease}
.tool:hover{background:rgba(255,252,244,.9);color:var(--ink)}
.tool:disabled{opacity:.28;cursor:default;background:transparent}
.tool svg{width:15px;height:15px;display:block}
.zoom-read{font-size:11px;letter-spacing:.08em;color:var(--ink-faint);min-width:38px;text-align:center;font-variant-numeric:tabular-nums;font-weight:500}

.sb-zone{position:absolute;top:0;bottom:0;border:0;background:transparent;cursor:grab;z-index:60;-webkit-tap-highlight-color:transparent}
.sb-zone:active{cursor:grabbing}
.sb-prev{left:0;width:50%}
.sb-next{right:0;width:50%}

.sb-captions{display:grid;justify-items:center;min-height:18px}
.sb-captions>*{grid-area:1/1;margin:0}
.sb-caption{font-size:11.5px;letter-spacing:var(--track-caps);text-transform:uppercase;color:var(--ink-soft);animation:sb-cap-in .5s ease both}
.sb-caption.live{animation:none}
@keyframes sb-cap-in{0%{opacity:0}}

.sb-hint{margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);transition:opacity .4s ease}
.sb-hint.gone{opacity:0}

@media (max-width:640px){
  .sb-wrap{width:100vw;margin-inline:calc(50% - 50vw);padding:6px 0 2px}
  .sb-arrow{position:absolute;top:50%;transform:translateY(-50%);background:rgba(250,246,238,.9);border-radius:50%;width:34px;height:34px;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.12)}
  .sb-arrow.left{left:4px}
  .sb-arrow.right{right:4px}
  .sb-3d{max-width:none}
  .sb-hint{font-size:9.5px;padding:0 16px;text-align:center}
}
</style>
</head>
<body>

<div id="loadMsg">
  <span id="loadText">Mempersiapkan buku…</span>
  <div id="loadBar"><div id="loadFill"></div></div>
</div>

<div id="app">
  <div class="sb-wrap" id="sbWrap">
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <filter id="sb-mblur-1"><feGaussianBlur stdDeviation="5 0"/></filter>
      <filter id="sb-mblur-2"><feGaussianBlur stdDeviation="14 0"/></filter>
    </svg>
    <div class="sb-stage" id="sbStage">
      <button class="sb-arrow left" id="sbLeft" aria-label="halaman sebelumnya">
        <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
          <polyline points="11,3 3,22 11,41" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="sb-3d" id="sb3d">
        <div class="sb-tilt" id="sbTilt">
          <div class="sb-cast ambient" aria-hidden="true"></div>
          <div class="sb-cast contact" aria-hidden="true"></div>
          <div class="sb-cast hair" aria-hidden="true"></div>
          <div class="sb-book" id="sbBook"></div>
        </div>
      </div>
      <button class="sb-arrow right" id="sbRight" aria-label="halaman berikutnya">
        <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
          <polyline points="3,3 11,22 3,41" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="sb-captions" id="sbCaptions"></div>
    <div class="sb-tools" role="group" aria-label="kontrol zoom">
      <button class="tool" id="zOut" aria-label="perkecil">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
          <circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8"/>
        </svg>
      </button>
      <span class="zoom-read" id="zRead">100%</span>
      <button class="tool" id="zIn" aria-label="perbesar">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
          <circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8"/>
        </svg>
      </button>
    </div>
    <p class="sb-hint" id="sbHint">Buka buku dengan menggeser halaman atau klik panah kanan →</p>
  </div>
</div>

<script>
/* ===================================================================
   DATA — chapters injected from bookContent.js
   =================================================================== */
const CHAPTERS = ${chaptersJSON};

/* ===================================================================
   CANVAS PAGE RENDERER (WARM AESTHETIC PAPER & ANTI-OVERFLOW TYPOGRAPHY)
   =================================================================== */
const PW = 880, PH = 620;
const PAD = 40;
const C_INK      = '#2b2721';
const C_SOFT     = 'rgba(43,39,33,.62)';
const C_FAINT    = 'rgba(43,39,33,.38)';
const C_HAIRLINE = 'rgba(43,39,33,.16)';
const C_EARTH    = '#9a6a3e';
const C_BURGUNDY = '#7a2b37';
const C_PAPER    = '#fbf8f2';
const DISP = "'Instrument Serif',Georgia,'Times New Roman',serif";
const BODY = "'Newsreader',Georgia,'Times New Roman',serif";

/* Safe image loader with timeout */
function loadImg(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 2500);
    img.src = src;
  });
}

/* Fill warm paper background with subtle crease and vignette */
function fillPaper(ctx) {
  ctx.fillStyle = C_PAPER;
  ctx.fillRect(0, 0, PW, PH);

  // Soft page edge vignette
  const vig = ctx.createRadialGradient(PW/2, PH/2, PH*0.28, PW/2, PH/2, PH*0.84);
  vig.addColorStop(0, 'rgba(255,255,255,.3)');
  vig.addColorStop(1, 'rgba(43,39,33,.06)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, PW, PH);

  // Gutter shadow down the spine
  const gut = ctx.createLinearGradient(PW/2 - 28, 0, PW/2 + 28, 0);
  gut.addColorStop(0,   'rgba(43,39,33,0)');
  gut.addColorStop(0.38,'rgba(43,39,33,.10)');
  gut.addColorStop(0.5, 'rgba(43,39,33,.18)');
  gut.addColorStop(0.62,'rgba(43,39,33,.10)');
  gut.addColorStop(1,   'rgba(43,39,33,0)');
  ctx.fillStyle = gut;
  ctx.fillRect(PW/2 - 28, 0, 56, PH);

  // Subtle binding stitch in the center
  ctx.strokeStyle = 'rgba(43,39,33,.14)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(PW/2, 24); ctx.lineTo(PW/2, PH - 24);
  ctx.stroke();
}

/* Clean text wrapper */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line); line = word;
    } else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}

/* Draw cover image inside rectangle with object-fit:cover */
function drawCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const ir = img.width / img.height, fr = w / h;
  let sx, sy, sw, sh;
  if (ir > fr) { sh = img.height; sw = sh * fr; sx = (img.width - sw) / 2; sy = 0; }
  else         { sw = img.width;  sh = sw / fr; sx = 0; sy = (img.height - sh) / 2; }
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

/* Ornamental warm divider */
function divider(ctx, x, y, w) {
  ctx.save();
  ctx.strokeStyle = C_HAIRLINE;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  const mx = x + w / 2, r = 2.4;
  ctx.fillStyle = C_EARTH;
  ctx.beginPath();
  ctx.moveTo(mx, y - r); ctx.lineTo(mx + r, y); ctx.lineTo(mx, y + r); ctx.lineTo(mx - r, y);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* Botanical leaf decoration (uses PH safely, no reference errors) */
function drawLeaf(ctx, cx, cy, size, angle, alpha) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(angle);
  ctx.fillStyle = 'rgba(43,39,33,' + (alpha || 0.05) + ')';
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo( size*.55, -size*.38,  size*.55,  size*.38, 0,  size);
  ctx.bezierCurveTo(-size*.55,  size*.38, -size*.55, -size*.38, 0, -size);
  ctx.fill();
  ctx.strokeStyle = 'rgba(43,39,33,' + ((alpha || 0.05) * 0.5) + ')';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(0, size); ctx.stroke();
  ctx.restore();
}

function drawBotanicals(ctx, cx, cy) {
  const leaves = [
    [-65, -PH * 0.18, 38, -0.32], [ 55, -PH * 0.20, 32,  0.42],
    [-40, -PH * 0.12, 26, -0.78], [ 65,  PH * 0.18, 36,  0.28],
    [-50,  PH * 0.20, 28, -0.52], [ 45,  PH * 0.24, 24,  0.68],
    [  0, -PH * 0.26, 22,  0.1 ], [-15,  PH * 0.28, 20,  0.85],
  ];
  for (const [dx, dy, s, a] of leaves) {
    drawLeaf(ctx, cx + dx, cy + dy, s, a, 0.045);
  }
}

/* Archival folio footer */
function pageFooter(ctx, leftNum, rightNum, labelLeft, labelRight) {
  ctx.save();
  ctx.font = '300 10.5px ' + BODY;
  ctx.fillStyle = C_FAINT;
  ctx.textAlign = 'left';
  ctx.fillText('FOLIO ' + String(leftNum).padStart(2,'0'), PAD, PH - 24);
  ctx.textAlign = 'right';
  ctx.fillText('FOLIO ' + String(rightNum).padStart(2,'0'), PW - PAD, PH - 24);
  if (labelLeft || labelRight) {
    ctx.textAlign = 'center';
    const tag = [labelLeft, labelRight].filter(Boolean).join(' · ').toUpperCase();
    ctx.fillText(tag, PW / 2, PH - 24);
  }
  ctx.restore();
}

/* ===================================================================
   COVER SPREAD: ELEGANT TITLE OPENING SPREAD
   Warm cream paper, polaroid photo of flowers/bouquet on left,
   and beautifully balanced literary title on the right.
   =================================================================== */
async function renderCover(ch) {
  const canvas = document.createElement('canvas');
  canvas.width = PW; canvas.height = PH;
  const ctx = canvas.getContext('2d');
  fillPaper(ctx);

  const half = PW / 2;

  /* ── 1. LEFT HALF: POLAROID OF FLOWER BOUQUET WITH WARM BOTANICALS ── */
  drawBotanicals(ctx, half / 2, PH / 2);

  const img = ch.photo ? await loadImg(ch.photo) : null;
  if (img) {
    const pw = half - 100, ph = PH * 0.50;
    const px = (half - pw) / 2, py = (PH - ph) / 2 - 16;

    // Polaroid card
    ctx.save();
    ctx.shadowColor = 'rgba(43,39,33,.20)';
    ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fdfaf5';
    ctx.fillRect(px - 7, py - 7, pw + 14, ph + 42);
    ctx.restore();

    drawCover(ctx, img, px, py, pw, ph);

    // Fine border
    ctx.strokeStyle = 'rgba(43,39,33,.12)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(px, py, pw, ph);

    // Caption wrapped strictly within polaroid width
    if (ch.photoCaption) {
      ctx.font = 'italic 300 11.5px ' + BODY;
      ctx.fillStyle = C_FAINT;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, ch.photoCaption, pw);
      let cy = py + ph + 20;
      for (const cln of lines.slice(0, 2)) {
        ctx.fillText(cln, px + pw / 2, cy);
        cy += 14;
      }
    }
  }

  /* ── 2. RIGHT HALF: REFINED LITERARY COVER TITLE BLOCK ── */
  const rx = half + 40, rw = half - 80;
  let ry = 64;

  // Header tag
  ctx.font = '500 9.5px ' + BODY;
  ctx.fillStyle = C_EARTH;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0.22em';
  ctx.fillText((ch.tag || 'MONOGRAF OBSERVASI · VOL. 01').toUpperCase(), rx, ry);
  ry += 18;

  divider(ctx, rx, ry, rw * 0.42);
  ry += 24;

  // Book Title
  ctx.font = 'italic 400 30px ' + DISP;
  ctx.fillStyle = C_INK;
  for (const ln of wrapText(ctx, ch.title || 'STUDI TENTANG ANESKA', rw)) {
    ctx.fillText(ln, rx, ry);
    ry += 35;
  }
  ry += 4;

  // Subtitle
  if (ch.subtitle) {
    ctx.font = 'italic 300 12.5px ' + BODY;
    ctx.fillStyle = C_SOFT;
    for (const ln of wrapText(ctx, ch.subtitle, rw)) {
      ctx.fillText(ln, rx, ry);
      ry += 17;
    }
    ry += 8;
  }

  divider(ctx, rx, ry, rw * 0.65);
  ry += 22;

  // Preface / Introduction text
  if (ch.preface && ch.preface.length) {
    ctx.font = '300 12px ' + BODY;
    ctx.fillStyle = C_INK;
    const lh = 17.5;
    for (const p of ch.preface) {
      for (const ln of wrapText(ctx, p, rw)) {
        if (ry + lh > PH - 130) break;
        ctx.fillText(ln, rx, ry);
        ry += lh;
      }
      ry += 8;
    }
    ry += 8;
  }

  // Key Quote with Burgundy accent
  if (ch.quote) {
    ctx.strokeStyle = C_BURGUNDY;
    ctx.lineWidth = 1.5;
    const qLines = wrapText(ctx, ch.quote, rw - 16);
    const qHeight = qLines.length * 16.5;
    ctx.beginPath(); ctx.moveTo(rx, ry - 3); ctx.lineTo(rx, ry + qHeight - 2); ctx.stroke();

    ctx.font = 'italic 400 11.5px ' + DISP;
    ctx.fillStyle = C_BURGUNDY;
    for (const ln of qLines) {
      ctx.fillText(ln, rx + 10, ry + 9);
      ry += 16.5;
    }
    ry += 16;
  }

  // Signature at bottom right
  if (ch.signature) {
    ctx.font = 'italic 400 12.5px ' + DISP;
    ctx.fillStyle = C_SOFT;
    ctx.fillText(ch.signature, rx, Math.min(ry + 10, PH - 58));
  }

  pageFooter(ctx, 1, 2, ch.place || 'Jakarta', ch.date || 'Edisi 1/1');
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ===================================================================
   CHAPTER SPREAD: NORMAL BOOK PAGES (ANTI-OVERFLOW ENGINE)
   Left: Polaroid photo + caption.
   Right: Category tag, title, subtitle, quote, and tightly budgeted paragraphs.
   =================================================================== */
async function renderChapter(ch, pageIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = PW; canvas.height = PH;
  const ctx = canvas.getContext('2d');
  fillPaper(ctx);

  const half = PW / 2;

  /* ── 1. LEFT PAGE: MOUNTED FIELD PHOTO ── */
  const img = ch.photo ? await loadImg(ch.photo) : null;
  if (img) {
    const pw = half - 96, ph = PH * 0.52;
    const px = (half - pw) / 2, py = (PH - ph) / 2 - 16;

    // Archival polaroid mount
    ctx.save();
    ctx.shadowColor = 'rgba(43,39,33,.22)';
    ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fdfaf5';
    ctx.fillRect(px - 7, py - 7, pw + 14, ph + 42);
    ctx.restore();

    drawCover(ctx, img, px, py, pw, ph);

    // Subtle photo border
    ctx.strokeStyle = 'rgba(43,39,33,.12)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(px, py, pw, ph);

    // Photo Caption — WRAPPED so it never spills out of the polaroid
    if (ch.photoCaption) {
      ctx.font = 'italic 300 11px ' + BODY;
      ctx.fillStyle = C_FAINT;
      ctx.textAlign = 'center';
      const capLines = wrapText(ctx, ch.photoCaption, pw - 8);
      let cy = py + ph + 20;
      for (const cln of capLines.slice(0, 2)) {
        ctx.fillText(cln, half / 2, cy);
        cy += 14;
      }
    }
  } else {
    drawBotanicals(ctx, half / 2, PH / 2);
    ctx.font = 'italic 400 24px ' + DISP;
    ctx.fillStyle = 'rgba(43,39,33,.08)';
    ctx.textAlign = 'center';
    ctx.fillText(ch.place || '[ CATATAN ARSIP ]', half / 2, PH / 2 + 8);
  }

  /* ── 2. RIGHT PAGE: ESSAY & OBSERVATION TEXT ── */
  const rx = half + 38, rw = half - 76;
  let ry = 52;

  // Category Tag
  ctx.font = '600 9px ' + BODY;
  ctx.fillStyle = C_EARTH;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0.18em';
  ctx.fillText((ch.tag || 'OBSERVASI LAPANGAN').toUpperCase(), rx, ry);
  ry += 16;

  divider(ctx, rx, ry, rw * 0.35);
  ry += 20;

  // Chapter Title
  ctx.font = 'italic 400 23px ' + DISP;
  ctx.fillStyle = C_INK;
  for (const ln of wrapText(ctx, ch.title || '', rw)) {
    ctx.fillText(ln, rx, ry);
    ry += 28;
  }
  ry += 3;

  // Subtitle
  if (ch.subtitle) {
    ctx.font = 'italic 300 11.5px ' + BODY;
    ctx.fillStyle = C_SOFT;
    for (const ln of wrapText(ctx, ch.subtitle, rw)) {
      ctx.fillText(ln, rx, ry);
      ry += 16;
    }
    ry += 6;
  }

  divider(ctx, rx, ry, rw * 0.55);
  ry += 16;

  // Key Thesis Quote with subtle left bar
  if (ch.quote) {
    ctx.strokeStyle = C_EARTH;
    ctx.lineWidth = 1.4;
    const qLines = wrapText(ctx, ch.quote, rw - 14);
    const qHeight = qLines.length * 15.5;
    ctx.beginPath(); ctx.moveTo(rx, ry - 3); ctx.lineTo(rx, ry + qHeight - 2); ctx.stroke();

    ctx.font = 'italic 400 11px ' + DISP;
    ctx.fillStyle = '#6a4725';
    for (const ln of qLines) {
      ctx.fillText(ln, rx + 9, ry + 8);
      ry += 15.5;
    }
    ry += 12;
  }

  // Analytical Paragraphs — STRICT OVERFLOW PROTECTION
  if (ch.paragraphs && ch.paragraphs.length) {
    ctx.font = '300 11.5px ' + BODY;
    ctx.fillStyle = C_INK;
    const lh = 16.5;
    const maxBottom = PH - 64; // strictly never draw below this boundary
    let stopped = false;

    for (const para of ch.paragraphs) {
      if (stopped) break;
      const lines = wrapText(ctx, para, rw);
      for (let li = 0; li < lines.length; li++) {
        if (ry + lh > maxBottom) {
          stopped = true;
          break;
        }
        ctx.fillText(lines[li], rx, ry);
        ry += lh;
      }
      ry += 7; // small paragraph gap
    }
  }

  // Signature at bottom right
  if (ch.signature) {
    ctx.font = 'italic 400 12px ' + DISP;
    ctx.fillStyle = C_SOFT;
    ctx.fillText(ch.signature, rx, PH - 48);
  }

  const pn = (pageIndex + 1) * 2;
  pageFooter(ctx, pn - 1, pn, ch.place, ch.date);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ===================================================================
   SKETCHBOOK ENGINE
   =================================================================== */
let PAGES = [], M = 0;

const stage   = document.getElementById('sbStage');
const sb3d    = document.getElementById('sb3d');
const book    = document.getElementById('sbBook');
const capBox  = document.getElementById('sbCaptions');
const hint    = document.getElementById('sbHint');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const N = 18, SPAN = 0.449, BETA = 0.60;
let idx = 0, turn = null, strips = [];

function mk(t, c) { const e = document.createElement(t); if (c) e.className = c; return e; }

function imgEl(i, side) {
  const im = new Image();
  im.className = 'sb-half-img ' + side;
  im.draggable = false; im.alt = ''; im.src = PAGES[i].url;
  return im;
}
function halfEl(pos, i) {
  const d = mk('div', 'sb-half ' + pos);
  d.appendChild(imgEl(i, pos));
  return d;
}

function buildCurl(dir) {
  const curl = mk('div', 'curl ' + dir);
  strips = [];
  let parent = curl;
  for (let s = 0; s < N; s++) {
    const st = mk('div', 'strip' + (s === N - 1 ? ' edge' : ''));
    const fF = mk('div', 'face front');
    const fB = mk('div', 'face back');
    fF.appendChild(mk('div', 'sh')); fF.appendChild(mk('div', 'gl'));
    fB.appendChild(mk('div', 'sh')); fB.appendChild(mk('div', 'gl'));
    st.appendChild(fF); st.appendChild(fB);
    parent.appendChild(st);
    strips.push({ st, fF, fB });
    parent = st;
  }
  return curl;
}

function updateStripFaces(iF, iB) {
  const uF = 'url("' + PAGES[iF].url + '")', uB = 'url("' + PAGES[iB].url + '")';
  const bw = book.clientWidth;
  const off = (1 - SPAN) / 2;
  for (let s = 0; s < N; s++) {
    const fF = strips[s].fF, fB = strips[s].fB;
    fF.style.backgroundImage = uF;
    fB.style.backgroundImage = uB;
    const xF = -(off + (s / N) * SPAN) * bw;
    const xB = -((1 - off) - ((s + 1) / N) * SPAN) * bw;
    fF.style.backgroundPosition = xF.toFixed(2) + 'px 0';
    fB.style.backgroundPosition = xB.toFixed(2) + 'px 0';
  }
}

function bend(t, dir) {
  const tt = Math.sin(t * Math.PI * 0.5) * 180;
  const a = Math.pow(Math.sin(t * Math.PI), BETA);
  const td = (dir === 'next' ? -1 : 1) * a * (180 / N);
  book.style.setProperty('--tt', tt.toFixed(3) + 'deg');
  book.style.setProperty('--td', td.toFixed(3) + 'deg');
  const a1 = Math.sin(t * Math.PI) * 0.40, a2 = Math.sin(t * Math.PI) * 0.14;
  book.style.setProperty('--a1', a1.toFixed(3));
  book.style.setProperty('--a2', a2.toFixed(3));
  const lit = 0.5 + 0.5 * Math.cos(t * Math.PI);
  book.style.setProperty('--lit', lit.toFixed(3));
  const shade = Math.sin(t * Math.PI);
  book.style.setProperty('--shade', shade.toFixed(3));
}

function updateCaptions() {
  capBox.textContent = '';
  const c = mk('p', 'sb-caption live');
  c.textContent = PAGES[idx].title || '';
  capBox.appendChild(c);
}

function paint() {
  book.textContent = '';
  const bw = book.clientWidth;
  book.style.setProperty('--bw', bw + 'px');
  book.style.setProperty('--span', SPAN);
  book.style.setProperty('--n', N);

  if (!turn) {
    const full = mk('div', 'sb-full');
    const im = new Image();
    im.draggable = false; im.alt = ''; im.src = PAGES[idx].url;
    full.appendChild(im);
    book.appendChild(full);
    book.style.setProperty('--shade', '0');
  } else {
    const dir = turn.dir;
    const iUnder = dir === 'next' ? turn.to : turn.from;
    const iTop   = dir === 'next' ? turn.from : turn.to;
    if (dir === 'next') {
      book.appendChild(halfEl('left', iTop));
      book.appendChild(halfEl('right', iUnder));
    } else {
      book.appendChild(halfEl('left', iUnder));
      book.appendChild(halfEl('right', iTop));
    }
    const gL = mk('div', 'gutter-shade left');
    const gR = mk('div', 'gutter-shade right');
    book.appendChild(gL); book.appendChild(gR);

    const curl = buildCurl(dir);
    book.appendChild(curl);
    if (dir === 'next') updateStripFaces(turn.from, turn.to);
    else updateStripFaces(turn.to, turn.from);
    bend(turn.t, dir);
  }

  const zL = mk('button', 'sb-zone sb-prev');
  zL.setAttribute('aria-label', 'halaman sebelumnya');
  const zR = mk('button', 'sb-zone sb-next');
  zR.setAttribute('aria-label', 'halaman berikutnya');
  zL.addEventListener('pointerdown', e => onZoneDown(e, 'prev'));
  zR.addEventListener('pointerdown', e => onZoneDown(e, 'next'));
  book.appendChild(zL); book.appendChild(zR);

  updateCaptions();
}

/* ---- view transform & controls ---- */
const view = { rx: 0, ry: 0, trx: 0, try_: 0, z: 1, tz: 1 };
const ZOOM_MIN = 0.85, ZOOM_MAX = 2.0;
let rafId = null;

function kick() { if (!rafId) rafId = requestAnimationFrame(frame); }
function setView(rx, ry, z) {
  view.trx = Math.max(-14, Math.min(14, rx));
  view.try_ = Math.max(-18, Math.min(18, ry));
  view.tz  = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  kick();
}
function applyView() {
  book.style.setProperty('--rx', view.rx.toFixed(2) + 'deg');
  book.style.setProperty('--ry', view.ry.toFixed(2) + 'deg');
  book.style.setProperty('--zoom', view.z.toFixed(4));
}
function hideHint() { if (hint) hint.classList.add('gone'); }

/* ---- tilt on mouse move ---- */
addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const nx = (e.clientX / window.innerWidth - 0.5) * 2;
  const ny = (e.clientY / window.innerHeight - 0.5) * 2;
  setView(-ny * 4.5, nx * 6.5, view.tz);
});

/* ---- page flip spring physics ---- */
let spring = null;
function springStep(dt) {
  if (!spring) return false;
  const k = spring.k || 180, d = spring.d || 22;
  const f = -k * (spring.x - spring.target) - d * spring.v;
  spring.v += f * dt; spring.x += spring.v * dt;
  if (Math.abs(spring.x - spring.target) < 0.001 && Math.abs(spring.v) < 0.01) {
    const end = spring.onEnd; spring = null; if (end) end(); return false;
  }
  return true;
}
function animateTo(target, onEnd, k, d) {
  spring = { x: turn ? turn.t : 0, target, v: 0, k, d, onEnd };
  kick();
}

function frame() {
  rafId = null;
  const dt = 1 / 60;
  let work = false;
  const vx = (view.trx - view.rx) * 0.16, vy = (view.try_ - view.ry) * 0.16;
  const vz = (view.tz  - view.z)  * 0.18;
  if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01 || Math.abs(vz) > 0.001) {
    view.rx += vx; view.ry += vy; view.z += vz; applyView(); work = true;
  }
  if (springStep(dt)) {
    if (turn) { turn.t = Math.max(0, Math.min(1, spring.x)); bend(turn.t, turn.dir); }
    work = true;
  }
  if (work) kick();
}

/* ---- drag-to-turn ---- */
let drag = null;
function onZoneDown(e, dir) {
  if (e.button !== 0) return;
  e.preventDefault(); e.stopPropagation();
  hideHint();
  stage.setPointerCapture(e.pointerId);
  const w = book.clientWidth;
  drag = { pid: e.pointerId, dir, x0: e.clientX, t0: 0, w };
  startTurn(dir, 0);
}
stage.addEventListener('pointermove', e => {
  if (!drag || drag.pid !== e.pointerId) return;
  const dx = e.clientX - drag.x0;
  const span = drag.w * 0.82;
  let t = (drag.dir === 'next' ? -dx : dx) / span;
  t = Math.max(0, Math.min(1, t));
  if (turn) { turn.t = t; bend(t, turn.dir); }
});
function endDrag(e) {
  if (!drag || drag.pid !== e.pointerId) return;
  try { stage.releasePointerCapture(drag.pid); } catch (_) {}
  const t = turn ? turn.t : 0;
  drag = null;
  if (t > 0.24) commit(); else cancel();
}
stage.addEventListener('dragstart',   e => e.preventDefault());
stage.addEventListener('selectstart', e => e.preventDefault());
stage.addEventListener('pointerup',     endDrag);
stage.addEventListener('pointercancel', endDrag);

function startTurn(dir, t) {
  spring = null;
  if (turn) { idx = turn.to; turn = null; }
  const from = idx;
  turn = { dir, from, to: dir === 'next' ? (from + 1) % M : (from - 1 + M) % M, t: t || 0 };
  paint();
}
function commit() {
  if (!turn) return;
  if (REDUCED) { idx = turn.to; turn = null; paint(); return; }
  animateTo(1, () => { idx = turn.to; turn = null; paint(); }, 170, 26);
  kick();
}
function cancel() {
  if (!turn) return;
  animateTo(0, () => { turn = null; paint(); }, 150, 24);
  kick();
}
function step(dir) {
  if (turn) { idx = turn.to; turn = null; }
  startTurn(dir, 0);
  commit();
}

document.getElementById('sbLeft').onclick  = () => step('prev');
document.getElementById('sbRight').onclick = () => step('next');
addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  e.preventDefault(); hideHint();
  step(e.key === 'ArrowRight' ? 'next' : 'prev');
});

/* ---- zoom toolbar buttons ---- */
const zRead   = document.getElementById('zRead');
const zInBtn  = document.getElementById('zIn');
const zOutBtn = document.getElementById('zOut');

function syncZoom() {
  zRead.textContent = Math.round(view.tz * 100) + '%';
  zOutBtn.disabled = view.tz <= ZOOM_MIN + 0.001;
  zInBtn.disabled  = view.tz >= ZOOM_MAX - 0.001;
}
zInBtn.onclick  = () => { setView(view.trx, view.try_, view.tz * 1.15); hideHint(); syncZoom(); };
zOutBtn.onclick = () => { setView(view.trx, view.try_, view.tz / 1.15); hideHint(); syncZoom(); };

/* ===================================================================
   BOOT — render all spreads with error resilience
   =================================================================== */
(async function boot() {
  await document.fonts.ready.catch(() => {});

  const loadText = document.getElementById('loadText');
  const loadFill = document.getElementById('loadFill');
  const loadMsg  = document.getElementById('loadMsg');
  const app      = document.getElementById('app');

  const rendered = [];
  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    if (loadText) loadText.textContent = 'Membuka bab ' + (i+1) + ' dari ' + CHAPTERS.length + '…';
    if (loadFill) loadFill.style.width = ((i / CHAPTERS.length) * 100).toFixed(0) + '%';
    let url;
    try {
      url = ch.isCover ? await renderCover(ch) : await renderChapter(ch, i);
    } catch (err) {
      console.warn('Fallback rendering spread', i, err);
      const canvas = document.createElement('canvas');
      canvas.width = PW; canvas.height = PH;
      const ctx = canvas.getContext('2d');
      fillPaper(ctx);
      ctx.font = 'italic 400 24px ' + DISP;
      ctx.fillStyle = C_INK;
      ctx.textAlign = 'center';
      ctx.fillText(ch.title || 'Arsip ' + (i+1), PW / 2, PH / 2);
      url = canvas.toDataURL('image/jpeg', 0.90);
    }
    rendered.push({ url, title: ch.title, place: ch.place || '' });
  }

  PAGES = rendered; M = PAGES.length;

  if (loadFill) loadFill.style.width = '100%';
  await new Promise(r => setTimeout(r, 220));
  if (loadMsg) loadMsg.style.display = 'none';
  if (app) app.style.display = 'block';

  idx = 0;
  paint(); applyView(); syncZoom();
})();
</script>
</body>
</html>`;
}
