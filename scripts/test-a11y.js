#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const axeCorePath = join(__dirname, '../node_modules/axe-core/axe.min.js');
const axeCoreSource = readFileSync(axeCorePath, 'utf8');

async function runAccessibilityTest(url, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the page
    console.log(`Testing accessibility for: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Inject axe-core
    await page.evaluate(axeCoreSource);

    // Run axe-core
    const results = await page.evaluate((options) => {
      return new Promise((resolve) => {
        axe.run(options, (err, results) => {
          if (err) throw err;
          resolve(results);
        });
      });
    }, options);

    return results;
  } finally {
    await browser.close();
  }
}

function formatResults(results) {
  const { violations, passes, incomplete } = results;

  console.log('\n=== ACCESSIBILITY TEST RESULTS ===\n');

  // Summary
  console.log(`✅ Passed: ${passes.length} rules`);
  console.log(`❌ Violations: ${violations.length} issues`);
  console.log(`⚠️  Incomplete: ${incomplete.length} items\n`);

  if (violations.length > 0) {
    console.log('🚨 VIOLATIONS:\n');

    violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.help} (${violation.id})`);
      console.log(`   Impact: ${violation.impact}`);
      console.log(`   WCAG: ${violation.tags.filter((tag) => tag.startsWith('wcag')).join(', ')}`);
      console.log(`   Help: ${violation.helpUrl}`);

      if (violation.nodes.length > 0) {
        console.log(`   Affected elements: ${violation.nodes.length}`);
        violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
          console.log(`     ${nodeIndex + 1}. ${node.target.join(' ')}`);
          if (node.html) {
            console.log(
              `        HTML: ${node.html.slice(0, 100)}${node.html.length > 100 ? '...' : ''}`
            );
          }
        });
        if (violation.nodes.length > 3) {
          console.log(`     ... and ${violation.nodes.length - 3} more`);
        }
      }
      console.log('');
    });
  }

  if (incomplete.length > 0) {
    console.log('⚠️  INCOMPLETE CHECKS:\n');

    incomplete.forEach((item, index) => {
      console.log(`${index + 1}. ${item.help} (${item.id})`);
      console.log(`   Reason: Manual review required`);
      console.log('');
    });
  }

  return violations.length;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const url = args[0] || 'http://localhost:8080';

  try {
    console.log('Starting accessibility test with axe-core...\n');

    const results = await runAccessibilityTest(url, {
      rules: {
        // You can customize rules here
        // For example, disable certain rules if needed:
        // 'color-contrast': { enabled: false }
      },
    });

    const violationCount = formatResults(results);

    if (violationCount > 0) {
      console.log(`❌ Found ${violationCount} accessibility violations`);
      process.exit(1);
    } else {
      console.log('✅ No accessibility violations found!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running accessibility test:', error.message);
    process.exit(1);
  }
}

main();
