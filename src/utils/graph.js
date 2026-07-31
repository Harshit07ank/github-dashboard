/**
 * graph.js
 * 
 * Pure math + SVG path generation for contribution line graphs.
 * No side effects — every function is a transform from data → string.
 */

import { COLORS } from './colors.js';


// ── Data transforms ───────────────────────────────────────────

/**
 * Normalize an array of numbers to fit within a pixel height.
 * Returns an array of { x, y } points ready for SVG rendering.
 *
 * @param {number[]} data   - Raw contribution counts per week
 * @param {number}   width  - Available pixel width
 * @param {number}   height - Available pixel height
 * @param {number}   padY   - Vertical padding so peaks don't clip
 * @returns {{ x: number, y: number }[]}
 */
export function normalizeData(data, width, height, padY = 12) {
  if (!data.length) return [];

  const max = Math.max(...data, 1); // avoid division by zero
  const stepX = width / Math.max(data.length - 1, 1);
  const usableH = height - padY * 2;

  return data.map((val, i) => ({
    x: Math.round(i * stepX * 100) / 100,
    y: Math.round((padY + usableH - (val / max) * usableH) * 100) / 100,
  }));
}


// ── Path builders ─────────────────────────────────────────────

/**
 * Build a smooth cubic-bezier SVG path through the given points.
 * Uses Catmull-Rom → cubic bezier conversion for natural curves.
 *
 * @param {{ x: number, y: number }[]} points
 * @returns {string} SVG path d-attribute
 */
export function createSmoothPath(points) {
  if (points.length < 2) return '';

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    // Catmull-Rom to cubic bezier control points (tension = 0.3)
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${r(cp1x)},${r(cp1y)} ${r(cp2x)},${r(cp2y)} ${r(p2.x)},${r(p2.y)}`;
  }

  return d;
}


/**
 * Build a closed area path — the line path + vertical drops to baseline.
 * Used for the semi-transparent fill under the curve.
 *
 * @param {{ x: number, y: number }[]} points
 * @param {number} baseline - Y coordinate of the bottom edge
 * @returns {string} SVG path d-attribute (closed)
 */
export function createAreaPath(points, baseline) {
  if (points.length < 2) return '';

  const linePath = createSmoothPath(points);
  const lastX = points[points.length - 1].x;
  const firstX = points[0].x;

  return `${linePath} L ${lastX},${baseline} L ${firstX},${baseline} Z`;
}


// ── Composite graph ───────────────────────────────────────────

/**
 * Assemble a complete contribution graph:
 * area fill + line stroke + animated endpoint dot.
 *
 * @param {number[]} data    - Weekly contribution counts
 * @param {object}   opts
 * @param {number}   opts.x       - Left offset
 * @param {number}   opts.y       - Top offset
 * @param {number}   opts.width   - Graph width
 * @param {number}   opts.height  - Graph height
 * @returns {string} SVG fragment
 */
export function createGraphSVG(data, { x = 0, y = 0, width = 420, height = 100 } = {}) {
  const points = normalizeData(data, width, height);
  if (points.length < 2) return '';

  const linePath = createSmoothPath(points);
  const areaPath = createAreaPath(points, height);

  // Approximate path length for dash animation
  const pathLength = estimatePathLength(points);

  const lastPoint = points[points.length - 1];

  return [
    `<g transform="translate(${x}, ${y})">`,

    // Area fill
    `  <path d="${areaPath}" fill="${COLORS.graphArea}" class="fade-in-d2"/>`,

    // Line stroke with draw animation
    `  <path`,
    `    d="${linePath}"`,
    `    fill="none"`,
    `    stroke="${COLORS.graphLine}"`,
    `    stroke-width="2"`,
    `    stroke-linecap="round"`,
    `    stroke-linejoin="round"`,
    `    stroke-dasharray="${pathLength}"`,
    `    stroke-dashoffset="${pathLength}"`,
    `    style="--path-length: ${pathLength}; animation: drawLine 2s ease-out 0.3s forwards;"`,
    `  />`,

    // Animated endpoint dot
    `  <circle`,
    `    cx="${r(lastPoint.x)}"`,
    `    cy="${r(lastPoint.y)}"`,
    `    r="4"`,
    `    fill="${COLORS.graphDot}"`,
    `    style="animation: pulse 2s ease-in-out 2.3s infinite, fadeIn 0.3s ease-out 2.3s both;"`,
    `  />`,

    `</g>`,
  ].join('\n');
}


// ── Internal helpers ──────────────────────────────────────────

/** Round to 2 decimal places */
function r(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Rough path length estimate via summing segment distances.
 * Good enough for stroke-dasharray animation.
 */
function estimatePathLength(points) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.round(length * 1.35); // bezier curves are longer than straight lines
}
