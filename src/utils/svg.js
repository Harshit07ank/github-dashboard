/**
 * svg.js
 * 
 * Reusable SVG building blocks.
 * Every generator uses these helpers — zero SVG duplication.
 */

import { COLORS } from './colors.js';


// ── Root wrapper ──────────────────────────────────────────────

/**
 * Wrap content in a complete SVG document.
 * Sets viewBox, namespace, and the dark card background.
 */
export function wrapSVG(content, width, height) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">`,
    content,
    `</svg>`,
  ].join('\n');
}


// ── Primitives ────────────────────────────────────────────────

/**
 * Create a rounded rectangle element.
 */
export function createRect(x, y, w, h, opts = {}) {
  const {
    rx = 8,
    fill = COLORS.surface,
    stroke = COLORS.border,
    strokeWidth = 1,
    className = '',
  } = opts;

  const cls = className ? ` class="${className}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${cls}/>`;
}


/**
 * Create a text element.
 */
export function createText(text, x, y, opts = {}) {
  const {
    fontSize = 14,
    fill = COLORS.text,
    fontFamily = "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
    fontWeight = 'normal',
    anchor = 'start',
    className = '',
  } = opts;

  const cls = className ? ` class="${className}"` : '';
  return `<text x="${x}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}" text-anchor="${anchor}"${cls}>${escapeXml(text)}</text>`;
}


/**
 * Create a group element wrapping children.
 */
export function createGroup(children, opts = {}) {
  const { transform = '', className = '', opacity = '' } = opts;
  const attrs = [
    transform ? `transform="${transform}"` : '',
    className ? `class="${className}"` : '',
    opacity ? `opacity="${opacity}"` : '',
  ].filter(Boolean).join(' ');

  return [
    `<g ${attrs}>`,
    ...children.map(c => `  ${c}`),
    `</g>`,
  ].join('\n');
}


/**
 * Create a horizontal line (divider).
 */
export function createLine(x1, y1, x2, y2, opts = {}) {
  const {
    stroke = COLORS.border,
    strokeWidth = 1,
    className = '',
  } = opts;

  const cls = className ? ` class="${className}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}"${cls}/>`;
}


// ── Animation styles ──────────────────────────────────────────

/**
 * Returns a <style> block with reusable CSS keyframe animations.
 */
export function createAnimatedStyle() {
  return `
  <style>
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes drawLine {
      from { stroke-dashoffset: var(--path-length); }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes pulse {
      0%, 100% { r: 4; opacity: 1; }
      50%      { r: 6; opacity: 0.6; }
    }
    @keyframes growWidth {
      from { width: 0; }
    }
    .fade-in         { animation: fadeIn 0.6s ease-out both; }
    .fade-in-d1      { animation: fadeIn 0.6s ease-out 0.1s both; }
    .fade-in-d2      { animation: fadeIn 0.6s ease-out 0.2s both; }
    .fade-in-d3      { animation: fadeIn 0.6s ease-out 0.3s both; }
    .slide-up        { animation: slideUp 0.5s ease-out both; }
    .slide-up-d1     { animation: slideUp 0.5s ease-out 0.15s both; }
    .slide-up-d2     { animation: slideUp 0.5s ease-out 0.30s both; }
    .slide-up-d3     { animation: slideUp 0.5s ease-out 0.45s both; }
    .slide-up-d4     { animation: slideUp 0.5s ease-out 0.60s both; }
    .slide-up-d5     { animation: slideUp 0.5s ease-out 0.75s both; }
  </style>`;
}


// ── Helpers ───────────────────────────────────────────────────

/**
 * Escape special XML characters in text content.
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}


/**
 * Format a number with commas: 1234 → "1,234"
 */
export function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}


/**
 * Format a date as "MMM DD": 2024-03-15 → "Mar 15"
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
