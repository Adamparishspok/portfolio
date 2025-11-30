#!/usr/bin/env node

/**
 * Build TypeScript files for the browser using esbuild
 */

import { build } from 'esbuild';
import { readdir } from 'fs/promises';
import { join } from 'path';

const srcDir = 'src/assets/js';
const outDir = '_site/assets/js';

async function buildTypeScript() {
  try {
    // Get all .ts files in the src directory
    const files = await readdir(srcDir);
    const tsFiles = files.filter((file) => file.endsWith('.ts')).map((file) => join(srcDir, file));

    if (tsFiles.length === 0) {
      console.log('No TypeScript files found to build.');
      return;
    }

    // Build all TypeScript files
    await build({
      entryPoints: tsFiles,
      bundle: false,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      target: 'es2020',
      format: 'esm',
      outdir: outDir,
      platform: 'browser',
      logLevel: 'info',
    });

    console.log('✓ TypeScript files compiled successfully');
  } catch (error) {
    console.error('Error building TypeScript:', error);
    process.exit(1);
  }
}

buildTypeScript();
