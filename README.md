# TokoMo

An open-source design token system — colors, dimensions, typography, and effects delivered as CSS custom properties, JSON, and TypeScript constants.

Figma-first: tokens are exported from Figma variables and built into CSS via generator scripts. One source of truth, zero manual maintenance.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@tokomo/tokens`](./packages/tokens) | Design tokens as CSS custom properties, JSON, and TypeScript constants | **Ready** |
| [`@tokomo/components`](./packages/components) | React UI components built on the token system | Scaffold |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build tokens only
pnpm build:tokens
```

## Using in a Project

### Option 1 — npm (once published)

```bash
npm install @tokomo/tokens
# or
pnpm add @tokomo/tokens
```

### Option 2 — Local development (file reference)

```bash
# In your consuming project:
pnpm add ../path/to/tokomo/packages/tokens
# or via npm:
npm install file:../path/to/tokomo/packages/tokens
```

### Option 3 — Direct from GitHub (no npm publish needed)

```bash
npm install github:your-username/tokomo
```

### Import Tokens

```css
/* In your entry CSS — import all tokens */
@import '@tokomo/tokens';

/* Or selectively */
@import '@tokomo/tokens/colors';
@import '@tokomo/tokens/dimensions';
@import '@tokomo/tokens/typography';
@import '@tokomo/tokens/effects';

/* Optional: global base styles (font, focus rings, reduced-motion) */
@import '@tokomo/tokens/globals';

/* Optional: CSS reset */
@import '@tokomo/tokens/reset';
```

```ts
// TypeScript — type-safe token name constants
import { colorBackgroundPrimary, dimensionSpace200 } from '@tokomo/tokens/ts';
// colorBackgroundPrimary === '--color-background-primary'
element.style.setProperty(colorBackgroundPrimary, 'red');
```

## Architecture

```
tokomo/
├── packages/
│   ├── tokens/          @tokomo/tokens — CSS variables, JSON, TypeScript
│   └── components/      @tokomo/components — React components (scaffold)
├── apps/
│   └── docs/            Storybook documentation (planned)
├── turbo.json           Turborepo configuration
├── pnpm-workspace.yaml  Workspace definition
└── tsconfig.base.json   Shared TypeScript config
```

### Token Pipeline

```
Figma Variables → JSON export → generator scripts → CSS custom properties
                                                  → dist/tokens.json
                                                  → TypeScript constants
```

1. Figma variables are exported as JSON into `packages/tokens/src/json/`
2. Generator scripts (`scripts/generate-*.mjs`) produce CSS from JSON
3. CSS files define all tokens in `:root` with light/dark theme overrides
4. Consuming apps import CSS and use `var(--token-name)` anywhere
5. TypeScript constants enable type-safe token references in JS/TS

### Token Categories

| Category | CSS prefix | Notes |
|---|---|---|
| Colors | `--color-*` | Semantic + reference palette + data visualization |
| Dimensions | `--dimension-*` | Space, radius, size, stroke — all `calc()` from `--dimension-base` |
| Typography | `--typography-*` | Weight, size, line-height, letter-spacing + `.text-*` classes |
| Effects | `--effect-*` | Blur, animation timing, easing, elevation shadows |

### Design Principles

- **Token-driven**: Every visual value comes from a token
- **8px grid**: All dimensions derived from `--dimension-base: 8px`
- **Theme-ready**: Light/dark via `data-theme` attribute on `<html>`
- **Framework-agnostic**: CSS custom properties work everywhere
- **Figma-first**: Token names match Figma variable names exactly

## Development

```bash
# Watch mode (rebuilds on JSON/CSS changes)
pnpm dev

# After updating Figma JSON sources, regenerate CSS:
cd packages/tokens && node scripts/build.mjs
```

## Versioning

Uses [Changesets](https://github.com/changesets/changesets):

- Token additions → `minor`
- Token renames/removals → `major`
- Bug fixes → `patch`

```bash
pnpm changeset     # create a changeset
pnpm release       # build + publish
```

## License

MIT
