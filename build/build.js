#!/usr/bin/env node
/* Assembles the self-contained index.html:
 * 1. Compiles Tailwind from the classes used in index.src.html
 * 2. Inlines the compiled CSS, jsPDF, and signature_pad into the template
 *
 * Usage: node build/build.js  (run from the repo root)
 * Requires: npx tailwindcss@3 available (network only needed the first time)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const srcPath = path.join(__dirname, 'index.src.html');
const cssInput = path.join(__dirname, 'tw-input.css');
const cssOutput = path.join(__dirname, 'tw-output.css');

fs.writeFileSync(cssInput, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
execSync(`npx -y tailwindcss@3.4.17 -i "${cssInput}" -o "${cssOutput}" --content "${srcPath}" --minify`, { stdio: 'inherit' });

const css = fs.readFileSync(cssOutput, 'utf8');
const jspdf = fs.readFileSync(path.join(__dirname, 'vendor-jspdf.js'), 'utf8');
const sigpad = fs.readFileSync(path.join(__dirname, 'vendor-sigpad.js'), 'utf8');

for (const [name, content] of [['jsPDF', jspdf], ['signature_pad', sigpad]]) {
  if (/<\/script/i.test(content) || content.includes('<!--')) {
    throw new Error(name + ' contains markup that would break inlining in a script tag.');
  }
}
if (/<\/style/i.test(css)) {
  throw new Error('Compiled CSS contains a closing style tag.');
}

let html = fs.readFileSync(srcPath, 'utf8');
html = html.replace('/*__TAILWIND_CSS__*/', () => css.trim());
html = html.replace('/*__JSPDF__*/', () => jspdf.trim());
html = html.replace('/*__SIGPAD__*/', () => sigpad.trim());

if (/\/\*__[A-Z_]+__\*\//.test(html)) {
  throw new Error('Unreplaced build marker remains in output.');
}

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Built index.html (' + Math.round(html.length / 1024) + ' KB)');
