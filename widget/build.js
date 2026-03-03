#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const DIR = __dirname;

// ── 1. Read source files ────────────────────────────────────
let js = fs.readFileSync(path.join(DIR, "knock-knock.js"), "utf8");
let css = fs.readFileSync(path.join(DIR, "knock-knock.css"), "utf8");

// ── 1b. Read and inject SVG icons ───────────────────────────
const svgDefault = fs.readFileSync(path.join(DIR, "icons", "please knock.svg"), "utf8")
  .replace("<svg ", '<svg class="kk-hand-open" ')
  .replace(/\n/g, "");
const svgKnock = fs.readFileSync(path.join(DIR, "icons", "knock knock.svg"), "utf8")
  .replace("<svg ", '<svg class="kk-hand-fist" ')
  .replace(/\n/g, "");

js = js.replace("<!--__KK_SVG_DEFAULT__-->", svgDefault);
js = js.replace("<!--__KK_SVG_KNOCK__-->", svgKnock);

// ── 2. Resolve color tokens ─────────────────────────────────
// Primary blue — change this one value to re-theme the widget
const KK_BLUE = "#0B56CF";

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}
function mixWithWhite(hex, pct) {
  const [r, g, b] = hexToRgb(hex);
  const w = pct / 100;
  return rgbToHex(
    Math.round(r + (255 - r) * w),
    Math.round(g + (255 - g) * w),
    Math.round(b + (255 - b) * w)
  );
}

const KK_BLUE_LIGHT = mixWithWhite(KK_BLUE, 85);

css = css.replace(/var\(--kk-blue-light\)/g, KK_BLUE_LIGHT);
css = css.replace(/var\(--kk-blue\)/g, KK_BLUE);

// ── 3. Base64-encode fonts into CSS @font-face urls ─────────
css = css.replace(/url\(fonts\/([\w-]+\.woff2)\)/g, (match, filename) => {
  const fontPath = path.join(DIR, "fonts", filename);
  const b64 = fs.readFileSync(fontPath).toString("base64");
  return `url(data:font/woff2;base64,${b64})`;
});

// ── 4. Minify CSS (simple: collapse whitespace & comments) ──
css = css
  .replace(/\/\*[\s\S]*?\*\//g, "")   // remove comments
  .replace(/\s*([{}:;,>~+])\s*/g, "$1") // collapse around punctuation
  .replace(/\s+/g, " ")                // collapse whitespace
  .replace(/;}/g, "}")                 // drop trailing semicolons
  .trim();

// ── 5. Inject CSS into JS (replace placeholder) ────────────
// Escape CSS for use inside a JS string literal (single-quoted)
const cssEscaped = css
  .replace(/\\/g, "\\\\")
  .replace(/'/g, "\\'")
  .replace(/"/g, '\\"');

let combined = js.replace("/*__KK_CSS__*/", cssEscaped);

// ── 6. Minify JS with terser ────────────────────────────────
(async () => {
  const result = await minify(combined, {
    compress: { passes: 2 },
    mangle: true,
    output: { comments: false },
  });

  if (result.error) {
    console.error("Terser error:", result.error);
    process.exit(1);
  }

  const outPath = path.join(DIR, "knock-knock.min.js");
  fs.writeFileSync(outPath, result.code, "utf8");

  const sizeKB = (Buffer.byteLength(result.code) / 1024).toFixed(1);
  console.log(`Built ${outPath} (${sizeKB} KB)`);
})();
