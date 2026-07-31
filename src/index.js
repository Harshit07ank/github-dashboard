/**
 * index.js
 *
 * Orchestrator: fetch → generate → write.
 * This is the single entry point invoked by GitHub Actions.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchGitHubStats } from './api/github.js';
import { generateContributionSVG } from './generators/contribution.js';
import { generateStreakSVG } from './generators/streak.js';
import { generateLanguagesSVG } from './generators/languages.js';


// ── Config ────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output');

const USERNAME = process.env.GITHUB_USERNAME || 'Harshit07ank';
const TOKEN = process.env.GH_TOKEN;


// ── Main ──────────────────────────────────────────────────────

async function main() {
  if (!TOKEN) {
    console.error('❌ GH_TOKEN environment variable is required.');
    console.error('   Set it with: set GH_TOKEN=ghp_your_token_here');
    process.exit(1);
  }

  console.log(`\n⏳ Fetching GitHub stats for @${USERNAME}...\n`);
  const stats = await fetchGitHubStats(USERNAME, TOKEN);

  console.log(`   Total contributions: ${stats.totalContributions}`);
  console.log(`   Current streak:      ${stats.currentStreak.count} days`);
  console.log(`   Longest streak:      ${stats.longestStreak.count} days`);
  console.log(`   Active days:         ${stats.activeDays}`);
  console.log(`   Languages:           ${stats.languages.length}`);
  console.log(`   Repositories:        ${stats.repositories}\n`);

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate and write SVGs
  const cards = [
    { name: 'contribution.svg', svg: generateContributionSVG(stats) },
    { name: 'streak.svg',       svg: generateStreakSVG(stats) },
    { name: 'languages.svg',    svg: generateLanguagesSVG(stats) },
  ];

  for (const card of cards) {
    const path = join(OUTPUT_DIR, card.name);
    writeFileSync(path, card.svg, 'utf-8');
    console.log(`   ✅ ${card.name} → ${path}`);
  }

  console.log('\n🎉 All cards generated successfully.\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
