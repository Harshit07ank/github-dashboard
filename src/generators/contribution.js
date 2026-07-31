/**
 * contribution.js
 *
 * Generates the contribution statistics SVG card.
 * 
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │  1,247                                           │
 * │  Contributions in the last year                  │
 * │                                                  │
 * │  ┌─ Active Days ─┐  ┌─ Best Week ─┐             │
 * │  │    234         │  │    47       │             │
 * │  └────────────────┘  └────────────┘              │
 * │                                                  │
 * │  ╭── smooth bezier curve ──────────╮             │
 * │  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ●           │
 * │  └─────────────────────────────────╯             │
 * └──────────────────────────────────────────────────┘
 */

import { COLORS } from '../utils/colors.js';
import {
  wrapSVG,
  createRect,
  createText,
  createAnimatedStyle,
  formatNumber,
} from '../utils/svg.js';
import { createGraphSVG } from '../utils/graph.js';


// ── Constants ─────────────────────────────────────────────────

const CARD_WIDTH = 495;
const CARD_HEIGHT = 240;
const PADDING = 30;
const GRAPH_HEIGHT = 80;


// ── Generator ─────────────────────────────────────────────────

/**
 * Generate the contribution SVG card.
 *
 * @param {object} stats - Stats object from github.js
 * @returns {string} Complete SVG string
 */
export function generateContributionSVG(stats) {
  const parts = [];

  // Animation styles
  parts.push(createAnimatedStyle());

  // ── Header: large contribution count (Left side) ──
  parts.push(createText(
    formatNumber(stats.totalContributions),
    PADDING,
    52,
    { fontSize: 28, fontWeight: 'bold', fill: COLORS.text, className: 'fade-in' }
  ));

  parts.push(createText(
    'Contributions in the last year',
    PADDING,
    74,
    { fontSize: 12, fill: COLORS.textSecondary, className: 'fade-in-d1' }
  ));

  // ── Stat texts (Right side, stacked, no borders) ──
  const rightX = CARD_WIDTH - PADDING;

  // Active Days (top)
  parts.push(createText(
    formatNumber(stats.activeDays),
    rightX,
    52,
    { fontSize: 16, fontWeight: 'bold', fill: COLORS.text, anchor: 'end', className: 'fade-in-d1' }
  ));
  parts.push(createText(
    'Active Days',
    rightX,
    68,
    { fontSize: 11, fill: COLORS.textSecondary, anchor: 'end', className: 'fade-in-d1' }
  ));

  // Best Week (bottom)
  parts.push(createText(
    formatNumber(stats.bestWeek.count),
    rightX,
    94,
    { fontSize: 16, fontWeight: 'bold', fill: COLORS.text, anchor: 'end', className: 'fade-in-d2' }
  ));
  parts.push(createText(
    'Best Week',
    rightX,
    110,
    { fontSize: 11, fill: COLORS.textSecondary, anchor: 'end', className: 'fade-in-d2' }
  ));

  // ── Contribution graph ──
  const graphY = 130;
  const graphWidth = CARD_WIDTH - PADDING * 2;

  const weeklyData = stats.weeklyContributions.map(w => w.count);
  parts.push(createGraphSVG(weeklyData, {
    x: PADDING,
    y: graphY,
    width: graphWidth,
    height: GRAPH_HEIGHT,
  }));

  return wrapSVG(parts.join('\n'), CARD_WIDTH, CARD_HEIGHT);
}
