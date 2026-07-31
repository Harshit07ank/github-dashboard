/**
 * test-generators.js
 *
 * Quick smoke test: feeds mock data into all generators
 * and writes SVGs to output/ to verify they render correctly.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateContributionSVG } from './generators/contribution.js';
import { generateStreakSVG } from './generators/streak.js';
import { generateLanguagesSVG } from './generators/languages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output');

// ── Mock data ─────────────────────────────────────────────────

const mockStats = {
  totalContributions: 1247,
  currentStreak: {
    count: 12,
    startDate: '2026-07-20',
    endDate: '2026-08-01',
  },
  longestStreak: {
    count: 47,
    startDate: '2026-03-02',
    endDate: '2026-04-18',
  },
  activeDays: 234,
  bestWeek: { count: 47, week: 32 },
  languages: [
    { name: 'JavaScript',  percentage: 42.3, bytes: 523000, repos: 5, color: '#f0db4f' },
    { name: 'Python',      percentage: 22.1, bytes: 273000, repos: 3, color: '#3572a5' },
    { name: 'TypeScript',  percentage: 15.7, bytes: 194000, repos: 2, color: '#3178c6' },
    { name: 'CSS',         percentage: 8.4,  bytes: 104000, repos: 4, color: '#563d7c' },
    { name: 'HTML',        percentage: 7.2,  bytes: 89000,  repos: 5, color: '#e34c26' },
    { name: 'Shell',       percentage: 4.3,  bytes: 53000,  repos: 2, color: '#89e051' },
  ],
  weeklyContributions: Array.from({ length: 52 }, (_, i) => ({
    week: i,
    count: Math.floor(Math.sin(i * 0.3) * 15 + 20 + Math.random() * 10),
  })),
  repositories: 8,
};


// ── Generate ──────────────────────────────────────────────────

mkdirSync(OUTPUT_DIR, { recursive: true });

const cards = [
  { name: 'contribution.svg', svg: generateContributionSVG(mockStats) },
  { name: 'streak.svg',       svg: generateStreakSVG(mockStats) },
  { name: 'languages.svg',    svg: generateLanguagesSVG(mockStats) },
];

for (const card of cards) {
  const path = join(OUTPUT_DIR, card.name);
  writeFileSync(path, card.svg, 'utf-8');
  console.log(`✅ ${card.name} (${card.svg.length} bytes)`);
}

console.log('\n🎉 Test SVGs generated in output/');
