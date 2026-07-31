/**
 * languages.js
 *
 * Generates the top languages SVG card.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │                                                  │
 * │  Top Languages                                   │
 * │                                                  │
 * │  JavaScript    ██████████████████░░░░  72.3%     │
 * │                                       4 repos    │
 * │                                                  │
 * │  Python        ████████░░░░░░░░░░░░░  18.1%     │
 * │                                       2 repos    │
 * │  ...                                             │
 * └──────────────────────────────────────────────────┘
 */

import { COLORS, getLanguageColor } from '../utils/colors.js';
import {
  wrapSVG,
  createText,
  createRect,
  createAnimatedStyle,
} from '../utils/svg.js';


// ── Constants ─────────────────────────────────────────────────

const CARD_WIDTH = 495;
const PADDING = 30;
const MAX_LANGUAGES = 6;
const BAR_HEIGHT = 8;
const BAR_WIDTH = 220;
const ROW_HEIGHT = 52;
const LABEL_X = PADDING;
const BAR_X = 160;
const PERCENT_X = BAR_X + BAR_WIDTH + 14;


// ── Generator ─────────────────────────────────────────────────

/**
 * Generate the languages SVG card.
 *
 * @param {object} stats - Stats object from github.js
 * @returns {string} Complete SVG string
 */
export function generateLanguagesSVG(stats) {
  const langs = stats.languages.slice(0, MAX_LANGUAGES);
  const cardHeight = 70 + langs.length * ROW_HEIGHT;
  const parts = [];

  parts.push(createAnimatedStyle());

  // Add bar animation style
  parts.push(barAnimationStyle());

  // Add mesh pattern
  parts.push(`
  <defs>
    <pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M0 4L4 0" stroke="rgba(139, 148, 158, 0.3)" stroke-width="1"/>
    </pattern>
  </defs>`);

  // ── Title ──
  parts.push(createText('Top Languages', PADDING, 42, {
    fontSize: 14,
    fontWeight: 'bold',
    fill: COLORS.text,
    className: 'fade-in',
  }));

  // ── Language rows ──
  langs.forEach((lang, i) => {
    const y = 72 + i * ROW_HEIGHT;
    const delayClass = `slide-up-d${Math.min(i + 1, 5)}`;

    parts.push(languageRow(lang, y, i, delayClass));
  });

  return wrapSVG(parts.join('\n'), CARD_WIDTH, cardHeight);
}


// ── Helpers ───────────────────────────────────────────────────

/**
 * Render one language row: name, progress bar, percentage, repo count.
 */
function languageRow(lang, y, index, className) {
  const barFillWidth = Math.max((lang.percentage / 100) * BAR_WIDTH, 2);
  const color = getLanguageColor(lang.name);
  const repoLabel = lang.repos === 1 ? '1 repo' : `${lang.repos} repos`;

  // Animation delay for staggered bar growth
  const animDelay = `${0.3 + index * 0.12}s`;

  return [
    // Language name
    createText(lang.name, LABEL_X, y + 12, {
      fontSize: 13,
      fill: COLORS.text,
      className,
    }),

    // Bar track (background mesh)
    createRect(BAR_X, y + 2, BAR_WIDTH, BAR_HEIGHT, {
      rx: 0,
      fill: 'url(#mesh)',
      stroke: 'none',
      strokeWidth: 0,
      className,
    }),

    // Bar fill (animated width, sharp corners)
    `<rect x="${BAR_X}" y="${y + 2}" width="${barFillWidth}" height="${BAR_HEIGHT}" rx="0" fill="${color}" class="${className}" style="animation: growWidth 0.8s ease-out ${animDelay} both;"/>`,

    // Percentage
    createText(`${lang.percentage}%`, PERCENT_X, y + 12, {
      fontSize: 12,
      fill: COLORS.textSecondary,
      className,
    }),

    // Repo count
    createText(repoLabel, PERCENT_X, y + 30, {
      fontSize: 10,
      fill: COLORS.textSecondary,
      className,
    }),
  ].join('\n');
}


/**
 * Additional animation style for progress bar width growth.
 */
function barAnimationStyle() {
  return `
  <style>
    @keyframes growWidth {
      from { transform: scaleX(0); transform-origin: left; }
      to   { transform: scaleX(1); transform-origin: left; }
    }
  </style>`;
}
