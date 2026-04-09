/**
 * Generate effects.css from Figma JSON source.
 *
 * Source: src/json/effects/effects.tokens.json
 * Output: src/effects.css
 *
 * What this generates (from Figma):
 *   --effect-animation-duration-*   (ms) — instant, short-1/2/3, medium-1/2/3, long-1/2/3
 *   --effect-animation-delay-*      (ms) — instant, short-1/2/3, medium-1/2/3, long-1/2/3
 *   --effect-animation-easing-*     — ease-in, ease-out, ease-in-out, ease-in-out-back
 *   --effect-blur-*                 (px) — sm, md, lg
 *
 * What stays HAND-AUTHORED (not representable as Figma variables):
 *   --effect-motion-*               (shorthand: duration + easing combined)
 *   --effect-transition-*           (property-specific transition shorthands)
 *   --effect-inset-*, outset-*, surface-*, edge-*, overlay-*  (box-shadow tokens)
 *   --effect-focus-ring             (composite box-shadow)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');

const SOURCE = path.join(PKG_ROOT, 'src/json/effects/effects.tokens.json');
const OUTPUT  = path.join(PKG_ROOT, 'src/effects.css');

const generate = () => {
  const json = JSON.parse(readFileSync(SOURCE, 'utf8'));
  const lines = [];

  // ── blur ──────────────────────────────────────────────────────────────────
  lines.push('  /* Blur */');
  for (const [key, token] of Object.entries(json.blur)) {
    lines.push(`  --effect-blur-${key}: ${token.$value}px;`);
  }
  lines.push('');

  // ── animation duration ────────────────────────────────────────────────────
  lines.push('  /* Animation durations */');
  for (const [key, token] of Object.entries(json.animation.duration)) {
    lines.push(`  --effect-animation-duration-${key}: ${token.$value}ms;`);
  }
  lines.push('');

  // ── animation delay ───────────────────────────────────────────────────────
  lines.push('  /* Animation delays */');
  for (const [key, token] of Object.entries(json.animation.delay)) {
    lines.push(`  --effect-animation-delay-${key}: ${token.$value}ms;`);
  }
  lines.push('');

  // ── easing ────────────────────────────────────────────────────────────────
  lines.push('  /* Animation easing curves */');
  for (const [key, token] of Object.entries(json.animation.easing)) {
    lines.push(`  --effect-animation-easing-${key}: ${token.$value};`);
  }

  // ── hand-authored section ─────────────────────────────────────────────────
  const handAuthored = `

  /* ─────────────────────────────────────────────────────────────────────────
     HAND-AUTHORED — Motion presets and transition shorthands.
     These compose duration + easing together for convenience in components.
     Not representable as Figma variables (they combine multiple primitives).
     ───────────────────────────────────────────────────────────────────────── */

  /* Motion presets — use like: transition: color var(--effect-motion-short-2);
     Duration names match Figma: short-1/2/3, medium-1/2/3, long-1/2/3        */
  --effect-motion-instant:  var(--effect-animation-duration-instant)  var(--effect-animation-easing-ease-in-out);
  --effect-motion-short-1:  var(--effect-animation-duration-short-1)  var(--effect-animation-easing-ease-in-out);
  --effect-motion-short-2:  var(--effect-animation-duration-short-2)  var(--effect-animation-easing-ease-in-out);
  --effect-motion-short-3:  var(--effect-animation-duration-short-3)  var(--effect-animation-easing-ease-in-out);
  --effect-motion-medium-1: var(--effect-animation-duration-medium-1) var(--effect-animation-easing-ease-in-out);
  --effect-motion-medium-2: var(--effect-animation-duration-medium-2) var(--effect-animation-easing-ease-in-out);
  --effect-motion-medium-3: var(--effect-animation-duration-medium-3) var(--effect-animation-easing-ease-in-out);
  --effect-motion-long-1:   var(--effect-animation-duration-long-1)   var(--effect-animation-easing-ease-in-out);
  --effect-motion-long-2:   var(--effect-animation-duration-long-2)   var(--effect-animation-easing-ease-in-out);
  --effect-motion-long-3:   var(--effect-animation-duration-long-3)   var(--effect-animation-easing-ease-in-out);

  /* Interaction transition shorthands — names match Figma duration scale */
  --effect-transition-interaction-background-instant:  background-color var(--effect-motion-instant);
  --effect-transition-interaction-background-short-1:  background-color var(--effect-motion-short-1);
  --effect-transition-interaction-background-short-2:  background-color var(--effect-motion-short-2);
  --effect-transition-interaction-background-short-3:  background-color var(--effect-motion-short-3);
  --effect-transition-interaction-background-medium-1: background-color var(--effect-motion-medium-1);
  --effect-transition-interaction-background-medium-2: background-color var(--effect-motion-medium-2);
  --effect-transition-interaction-background-medium-3: background-color var(--effect-motion-medium-3);
  --effect-transition-interaction-background-long-1:   background-color var(--effect-motion-long-1);
  --effect-transition-interaction-background-long-2:   background-color var(--effect-motion-long-2);
  --effect-transition-interaction-background-long-3:   background-color var(--effect-motion-long-3);

  --effect-transition-interaction-color-instant:  color var(--effect-motion-instant);
  --effect-transition-interaction-color-short-1:  color var(--effect-motion-short-1);
  --effect-transition-interaction-color-short-2:  color var(--effect-motion-short-2);
  --effect-transition-interaction-color-short-3:  color var(--effect-motion-short-3);
  --effect-transition-interaction-color-medium-1: color var(--effect-motion-medium-1);
  --effect-transition-interaction-color-medium-2: color var(--effect-motion-medium-2);
  --effect-transition-interaction-color-medium-3: color var(--effect-motion-medium-3);
  --effect-transition-interaction-color-long-1:   color var(--effect-motion-long-1);
  --effect-transition-interaction-color-long-2:   color var(--effect-motion-long-2);
  --effect-transition-interaction-color-long-3:   color var(--effect-motion-long-3);

  --effect-transition-interaction-opacity-instant:  opacity var(--effect-motion-instant);
  --effect-transition-interaction-opacity-short-1:  opacity var(--effect-motion-short-1);
  --effect-transition-interaction-opacity-short-2:  opacity var(--effect-motion-short-2);
  --effect-transition-interaction-opacity-short-3:  opacity var(--effect-motion-short-3);
  --effect-transition-interaction-opacity-medium-1: opacity var(--effect-motion-medium-1);
  --effect-transition-interaction-opacity-medium-2: opacity var(--effect-motion-medium-2);
  --effect-transition-interaction-opacity-medium-3: opacity var(--effect-motion-medium-3);
  --effect-transition-interaction-opacity-long-1:   opacity var(--effect-motion-long-1);
  --effect-transition-interaction-opacity-long-2:   opacity var(--effect-motion-long-2);
  --effect-transition-interaction-opacity-long-3:   opacity var(--effect-motion-long-3);

  --effect-transition-interaction-border-color-instant:  border-color var(--effect-motion-instant);
  --effect-transition-interaction-border-color-short-1:  border-color var(--effect-motion-short-1);
  --effect-transition-interaction-border-color-short-2:  border-color var(--effect-motion-short-2);
  --effect-transition-interaction-border-color-short-3:  border-color var(--effect-motion-short-3);
  --effect-transition-interaction-border-color-medium-1: border-color var(--effect-motion-medium-1);
  --effect-transition-interaction-border-color-medium-2: border-color var(--effect-motion-medium-2);
  --effect-transition-interaction-border-color-medium-3: border-color var(--effect-motion-medium-3);
  --effect-transition-interaction-border-color-long-1:   border-color var(--effect-motion-long-1);
  --effect-transition-interaction-border-color-long-2:   border-color var(--effect-motion-long-2);
  --effect-transition-interaction-border-color-long-3:   border-color var(--effect-motion-long-3);

  --effect-transition-interaction-transform-instant:  transform var(--effect-motion-instant);
  --effect-transition-interaction-transform-short-1:  transform var(--effect-motion-short-1);
  --effect-transition-interaction-transform-short-2:  transform var(--effect-motion-short-2);
  --effect-transition-interaction-transform-short-3:  transform var(--effect-motion-short-3);
  --effect-transition-interaction-transform-medium-1: transform var(--effect-motion-medium-1);
  --effect-transition-interaction-transform-medium-2: transform var(--effect-motion-medium-2);
  --effect-transition-interaction-transform-medium-3: transform var(--effect-motion-medium-3);
  --effect-transition-interaction-transform-long-1:   transform var(--effect-motion-long-1);
  --effect-transition-interaction-transform-long-2:   transform var(--effect-motion-long-2);
  --effect-transition-interaction-transform-long-3:   transform var(--effect-motion-long-3);

  /* ─────────────────────────────────────────────────────────────────────────
     HAND-AUTHORED — Elevation / shadow tokens.
     Multi-layer box-shadows cannot be expressed as Figma number variables.
     These must remain hand-authored permanently.
     ───────────────────────────────────────────────────────────────────────── */

  --effect-inset-depressed:
    inset 0 1px 2px -0.5px var(--color-surface-shadow),
    inset 0 2px 4px -2px var(--color-surface-shadow),
    inset 0 0 0 var(--dimension-stroke-width-006) var(--color-surface-shadow);
  --effect-inset-flat:
    inset 0 0 0 var(--dimension-stroke-width-006) var(--color-surface-highlight);
  --effect-inset-elevated:
    inset 0 -4px 2px -4px var(--color-surface-shadow),
    inset 0 4px 2px -4px var(--color-surface-highlight),
    inset 0 0 0 var(--dimension-stroke-width-006) var(--color-surface-highlight);
  --effect-inset-floating:
    inset 0 -4px 2px -4px var(--color-surface-shadow),
    inset 0 4px 2px -4px var(--color-surface-highlight),
    inset 0 0 0 var(--dimension-stroke-width-006) var(--color-surface-highlight);

  --effect-outset-depressed:
    0 -4px 2px -4px var(--color-surface-shadow),
    0 4px 2px -4px var(--color-surface-highlight),
    0 0 0 var(--dimension-stroke-width-006) var(--color-surface-highlight);
  --effect-outset-flat:
    0 0 0 var(--dimension-stroke-width-006) var(--color-surface-shadow);
  --effect-outset-elevated:
    0 1px 2px -0.5px var(--color-surface-shadow),
    0 2px 4px -2px var(--color-surface-shadow),
    0 0 0 var(--dimension-stroke-width-006) var(--color-surface-shadow);
  --effect-outset-floating:
    0 4px 8px -2px var(--color-surface-shadow),
    0 8px 16px -4px var(--color-surface-shadow),
    0 0 0 var(--dimension-stroke-width-006) var(--color-surface-shadow);

  --effect-surface-depressed: var(--effect-inset-depressed), var(--effect-outset-depressed);
  --effect-surface-flat:      var(--effect-inset-flat),      var(--effect-outset-flat);
  --effect-surface-elevated:  var(--effect-inset-elevated),  var(--effect-outset-elevated);
  --effect-surface-floating:  var(--effect-inset-floating),  var(--effect-outset-floating);

  --effect-outset-overlay: var(--effect-outset-floating);

  --effect-inset-edge-left:  inset var(--dimension-stroke-width-006) 0 0 0 var(--color-surface-highlight);
  --effect-inset-edge-right: inset calc(-1 * var(--dimension-stroke-width-006)) 0 0 0 var(--color-surface-highlight);
  --effect-outset-edge-left:  calc(-1 * var(--dimension-stroke-width-006)) 0 0 0 var(--color-surface-shadow);
  --effect-outset-edge-right: var(--dimension-stroke-width-006) 0 0 0 var(--color-surface-shadow);

  --effect-surface-overlay-left:  var(--effect-outset-overlay), var(--effect-inset-edge-left);
  --effect-surface-overlay-right: var(--effect-outset-overlay), var(--effect-inset-edge-right);

  --effect-edge-top:
    inset 0 var(--dimension-stroke-width-006) 0 0 var(--color-surface-highlight),
    0 calc(-1 * var(--dimension-stroke-width-006)) 0 0 var(--color-surface-shadow);
  --effect-edge-right:
    inset calc(-1 * var(--dimension-stroke-width-006)) 0 0 0 var(--color-surface-highlight),
    var(--dimension-stroke-width-006) 0 0 0 var(--color-surface-shadow);
  --effect-edge-bottom:
    inset 0 calc(-1 * var(--dimension-stroke-width-006)) 0 0 var(--color-surface-highlight),
    0 var(--dimension-stroke-width-006) 0 0 var(--color-surface-shadow);
  --effect-edge-left:
    inset var(--dimension-stroke-width-006) 0 0 0 var(--color-surface-highlight),
    calc(-1 * var(--dimension-stroke-width-006)) 0 0 0 var(--color-surface-shadow);

  --effect-focus-ring:
    0 0 0 var(--dimension-space-025) transparent,
    0 0 0 calc(var(--dimension-space-025) + var(--dimension-stroke-width-025)) var(--color-foreground-medium-brand);`;

  const output = [
    '/* AUTO-GENERATED + HAND-AUTHORED. See scripts/generate-effects-tokens.mjs */',
    '/* Generated section: from src/json/effects/effects.tokens.json            */',
    '',
    ':root {',
    ...lines,
    handAuthored,
    '}',
    '',
  ].join('\n');

  writeFileSync(OUTPUT, output, 'utf8');

  const generated = lines.filter(l => l.includes('--effect-')).length;
  console.log(`    effects: ${generated} tokens generated → src/effects.css`);
};

generate();
