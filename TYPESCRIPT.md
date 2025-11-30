# TypeScript Setup

This project uses TypeScript with JSDoc annotations for type safety.

## What's Included

- **TypeScript** (`typescript`) - Type checker
- **TSX** (`tsx`) - TypeScript execution engine for running .ts files
- **Type definitions** (`@types/node`) - Node.js type definitions
- **ESLint TypeScript support** - TypeScript linting via `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`

## Configuration Files

- `tsconfig.json` - TypeScript configuration with strict mode enabled
- `eslint.config.mjs` - Updated to support both `.js` and `.ts` files
- `src/types/eleventy.d.ts` - Custom type definitions for Eleventy packages

## Usage

### Type Checking

Run type checking across your entire project:

```bash
pnpm run type-check
```

### Writing TypeScript Files

You can write TypeScript in two ways:

#### 1. Pure TypeScript Files (`.ts`)

For scripts and utilities in the `scripts/` folder or `src/` folder:

```typescript
// scripts/example.ts
import fs from 'fs';

const data: string = 'Hello World';
console.log(data);
```

Run with tsx:
```bash
tsx scripts/example.ts
```

#### 2. JavaScript with JSDoc Type Annotations (`.js`)

For Eleventy config and other files that need to be directly executed by Node:

```javascript
// @ts-check

/**
 * @param {string} name
 * @returns {string}
 */
function greet(name) {
  return `Hello, ${name}!`;
}
```

The `@ts-check` comment at the top enables TypeScript checking for the file.

## Eleventy Config

The `eleventy.config.js` file uses JSDoc annotations for type safety. This approach:
- Provides full TypeScript checking without transpilation
- Works natively with Eleventy
- Is the officially recommended approach

Example:
```javascript
// @ts-check
/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
export default function (eleventyConfig) {
  // Your configuration with full type checking
}
```

## Adding Types for Third-Party Packages

If a package doesn't have types, you can:

1. Install types from DefinitelyTyped:
```bash
pnpm add -D @types/package-name
```

2. Create custom type definitions in `src/types/`:
```typescript
// src/types/my-package.d.ts
declare module 'my-package' {
  export function doSomething(): void;
}
```

## Scripts

- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run lint` - Lint all files (includes TypeScript)
- `pnpm run lint:fix` - Auto-fix linting issues

## Benefits

- **Type Safety** - Catch errors before runtime
- **IntelliSense** - Better autocomplete in your editor
- **Refactoring** - Safely rename and restructure code
- **Documentation** - Self-documenting code with types

