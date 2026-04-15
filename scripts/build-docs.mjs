/**
 * build-docs.mjs
 *
 * Generates a fully self-contained docs/index.html by:
 *   1. Reading scripts/docs-template.html
 *   2. Inlining all token CSS (colors, dimensions, typography, effects)
 *   3. Parsing token data from dist/ CSS files
 *   4. Writing docs/index.html — no external assets needed
 *
 * Run after `npm run build`:
 *   npm run build && npm run build:docs
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const docsDir = join(root, 'docs');

mkdirSync(docsDir, { recursive: true });

// ── Read dist CSS files ─────────────────────────────────────────────────────

const colorsCss    = readFileSync(join(distDir, 'colors.css'),     'utf8');
const dimensionsCss = readFileSync(join(distDir, 'dimensions.css'), 'utf8');
const typographyCss = readFileSync(join(distDir, 'typography.css'), 'utf8');
const effectsCss    = readFileSync(join(distDir, 'effects.css'),    'utf8');

// ── Inline token CSS (for live CSS variable resolution in browser) ──────────

const TOKEN_CSS = [colorsCss, dimensionsCss, typographyCss, effectsCss].join('\n\n');

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract all CSS custom property declarations from the :root section of a
 * CSS file (stops before any data-theme override blocks).
 */
function parseVars(css) {
  const lightSection = css.split(':root[data-theme')[0];
  const result = [];
  for (const [, name, value] of lightSection.matchAll(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/gm)) {
    result.push({ name, value: value.trim() });
  }
  return result;
}

/**
 * Evaluate a dimension CSS value to a pixel number.
 * All dimension tokens use calc() relative to an 8px base.
 */
function toPx(value) {
  if (!value || value === '0') return 0;
  if (value === '9999px') return 9999;
  if (/^[\d.]+%$/.test(value)) return null;   // e.g. 100%

  // Direct px value (e.g. "8px", "400px")
  const pxMatch = value.match(/^([\d.]+)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]);

  // Unitless (z-index, scale)
  const numMatch = value.match(/^([\d.]+)$/);
  if (numMatch) return parseFloat(numMatch[1]);

  // var(--dimension-*-base) → 8
  if (/^var\(--dimension-[a-z-]+-base\)$/.test(value)) return 8;

  // calc(...) — replace the base variable references then evaluate the arithmetic
  const calcBody = value.match(/^calc\((.+)\)$/)?.[1];
  if (!calcBody) return null;

  const expr = calcBody.replace(/var\(--dimension-[a-z-]+-base\)/g, '8');
  // Only allow safe characters before evaluating
  if (!/^[\d.\s*/+\-()]+$/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + expr + ')')();
    return Math.round(result * 100) / 100;
  } catch {
    return null;
  }
}

// ── Color tokens ─────────────────────────────────────────────────────────────

function getColorGroup(name) {
  if (name.startsWith('--color-reference-')) return 'reference';
  if (name.startsWith('--color-data-'))      return 'data';
  if (
    name.startsWith('--color-driver-status-')   ||
    name.startsWith('--color-entity-')           ||
    name.startsWith('--color-geofence-')         ||
    name.startsWith('--color-location-marker-')  ||
    name.startsWith('--color-safety-score-')     ||
    name.startsWith('--color-settings-')
  ) return 'domain';
  return 'semantic';
}

const colors = parseVars(colorsCss).map(({ name }) => ({
  name,
  group: getColorGroup(name),
  label: name.slice(2), // strip '--'
}));

console.log(`  ✓ colors        (${colors.length} tokens)`);

// ── Dimension tokens ─────────────────────────────────────────────────────────

const DIM_GROUPS = [
  ['--dimension-space-',              'space'],
  ['--dimension-radius-',             'radius'],
  ['--dimension-stroke-width-',       'stroke'],
  ['--dimension-size-',               'size'],
  ['--dimension-iconography-',        'iconography'],
  ['--dimension-card-width-',         'layout'],
  ['--dimension-modal-width-',        'layout'],
  ['--dimension-form-width-',         'layout'],
  ['--dimension-table-column-width-', 'layout'],
  ['--dimension-menu-width-',         'layout'],
  ['--dimension-tooltip-width-',      'layout'],
  ['--dimension-panel-width-',        'layout'],
  ['--dimension-offset-',             'offset'],
  ['--dimension-scale-',              'scale'],
  ['--dimension-z-index-',            'z-index'],
];

function getDimGroup(name) {
  for (const [prefix, group] of DIM_GROUPS) {
    if (name.startsWith(prefix)) return group;
  }
  return 'other';
}

const dimensions = parseVars(dimensionsCss)
  .filter(({ name }) => name !== '--dimension-base' && !name.endsWith('-base'))
  .map(({ name, value }) => ({
    name,
    group: getDimGroup(name),
    label: name.slice(2),
    value,
    px: toPx(value),
  }));

console.log(`  ✓ dimensions    (${dimensions.length} tokens)`);

// ── Typography tokens ─────────────────────────────────────────────────────────

const TYPO_GROUPS = [
  ['--typography-weight-',           'weight'],
  ['--typography-fontsize-',         'fontsize'],
  ['--typography-lineheight-',       'lineheight'],
  ['--typography-letterspacing-',    'letterspacing'],
  ['--typography-paragraphspacing-', 'paragraphspacing'],
];

function getTypoGroup(name) {
  for (const [prefix, group] of TYPO_GROUPS) {
    if (name.startsWith(prefix)) return group;
  }
  return 'other';
}

const typography = parseVars(typographyCss).map(({ name, value }) => ({
  name,
  group: getTypoGroup(name),
  label: name.slice(2),
  value,
  numeric: parseFloat(value) || null,
}));

// Append hand-authored text style classes (parsed from the CSS)
const textStyleClasses = [
  ...typographyCss.matchAll(/^\.(text-[\w-]+)\s*\{/gm),
].map(([, cls]) => cls);

for (const cls of textStyleClasses) {
  typography.push({
    name: '.' + cls,
    group: 'textstyle',
    label: cls,
    value: null,
    numeric: null,
  });
}

console.log(`  ✓ typography    (${typography.length} tokens)`);

// ── Effects tokens ────────────────────────────────────────────────────────────

const FX_GROUPS = [
  ['--effect-blur-',                          'blur'],
  ['--effect-animation-duration-',            'duration'],
  ['--effect-animation-delay-',               'delay'],
  ['--effect-animation-easing-',              'easing'],
  ['--effect-motion-',                        'motion'],
  ['--effect-transition-interaction-',        'transition'],
  ['--effect-shadow-',                        'elevation'],
  ['--effect-highlight-',                     'elevation'],
  ['--effect-elevation-',                     'elevation'],
  ['--effect-focus-ring',                     'elevation'],
];

function getFxGroup(name) {
  for (const [prefix, group] of FX_GROUPS) {
    if (name.startsWith(prefix)) return group;
  }
  return 'other';
}

const effects = parseVars(effectsCss).map(({ name, value }) => ({
  name,
  group: getFxGroup(name),
  label: name.slice(2),
  value,
  numeric: parseFloat(value) || null,
}));

console.log(`  ✓ effects       (${effects.length} tokens)`);

// ── Build token data ──────────────────────────────────────────────────────────

const total = colors.length + dimensions.length + typography.length + effects.length;
console.log(`  ✓ total         (${total} tokens)\n`);

const TOKEN_DATA_JS =
  `const TOKEN_DATA = ${JSON.stringify({ colors, dimensions, typography, effects })};`;

// ── Generate HTML ─────────────────────────────────────────────────────────────

let html = readFileSync(join(__dirname, 'docs-template.html'), 'utf8');
html = html.replace('/* @@TOKEN_CSS@@ */',  TOKEN_CSS);
html = html.replace('/* @@TOKEN_DATA@@ */', TOKEN_DATA_JS);

writeFileSync(join(docsDir, 'index.html'), html);

const kbSize = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
console.log(`  ✓ docs/index.html  (${kbSize}KB, self-contained)\n\nDocs ready → docs/index.html`);
