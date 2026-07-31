/**
 * streak.js
 *
 * Generates the streak statistics SVG card.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │                                                  │
 * │     Current Streak    │    Longest Streak         │
 * │          12           │         47                │
 * │         days          │        days               │
 * │                       │                           │
 * │   Jul 20 – Aug 01     │   Mar 02 – Apr 18        │
 * │                                                  │
 * └──────────────────────────────────────────────────┘
 */

import { COLORS } from '../utils/colors.js';
import {
  wrapSVG,
  createText,
  createLine,
  createAnimatedStyle,
  formatDate,
} from '../utils/svg.js';


// ── Constants ─────────────────────────────────────────────────

const CARD_WIDTH = 495;
const CARD_HEIGHT = 195;
const COL_LEFT = CARD_WIDTH / 4;
const COL_RIGHT = (CARD_WIDTH / 4) * 3;


// ── Generator ─────────────────────────────────────────────────

/**
 * Generate the streak SVG card.
 *
 * @param {object} stats - Stats object from github.js
 * @returns {string} Complete SVG string
 */
export function generateStreakSVG(stats) {
  const parts = [];

  parts.push(createAnimatedStyle());

  // ── Column headers ──
  parts.push(createText('Current Streak', COL_LEFT, 44, {
    fontSize: 11,
    fill: COLORS.textSecondary,
    anchor: 'middle',
    className: 'fade-in',
  }));

  parts.push(createText('Longest Streak', COL_RIGHT, 44, {
    fontSize: 11,
    fill: COLORS.textSecondary,
    anchor: 'middle',
    className: 'fade-in',
  }));

  // ── Large numbers ──
  parts.push(createText(
    String(stats.currentStreak.count),
    COL_LEFT,
    90,
    { fontSize: 36, fontWeight: 'bold', fill: COLORS.text, anchor: 'middle', className: 'fade-in-d1' }
  ));

  parts.push(createText(
    String(stats.longestStreak.count),
    COL_RIGHT,
    90,
    { fontSize: 36, fontWeight: 'bold', fill: COLORS.text, anchor: 'middle', className: 'fade-in-d1' }
  ));

  // ── "days" labels ──
  parts.push(createText('days', COL_LEFT, 112, {
    fontSize: 12,
    fill: COLORS.textSecondary,
    anchor: 'middle',
    className: 'fade-in-d2',
  }));

  parts.push(createText('days', COL_RIGHT, 112, {
    fontSize: 12,
    fill: COLORS.textSecondary,
    anchor: 'middle',
    className: 'fade-in-d2',
  }));

  // ── Date ranges ──
  const currentRange = formatStreakRange(stats.currentStreak);
  const longestRange = formatStreakRange(stats.longestStreak);

  parts.push(createText(currentRange, COL_LEFT, 145, {
    fontSize: 11,
    fill: COLORS.textSecondary,
    anchor: 'middle',
    className: 'fade-in-d3',
  }));

  parts.push(createText(longestRange, COL_RIGHT, 145, {
    fontSize: 11,
    fill: COLORS.textSecondary,
    anchor: 'middle',
    className: 'fade-in-d3',
  }));

  // ── Vertical divider ──
  parts.push(createLine(
    CARD_WIDTH / 2, 30,
    CARD_WIDTH / 2, 165,
    { stroke: 'rgba(139, 148, 158, 0.25)', strokeWidth: 1 }
  ));

  return wrapSVG(parts.join('\n'), CARD_WIDTH, CARD_HEIGHT);
}


// ── Helpers ───────────────────────────────────────────────────

/**
 * Format a streak's date range: "Mar 15 – Apr 02"
 * Returns "–" if no streak data.
 */
function formatStreakRange(streak) {
  if (!streak.startDate || !streak.endDate) return '–';
  return `${formatDate(streak.startDate)} – ${formatDate(streak.endDate)}`;
}
