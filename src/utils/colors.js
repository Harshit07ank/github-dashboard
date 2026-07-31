/**
 * colors.js
 * 
 * Single source of truth for every color in the project.
 * Pure grey monochrome — no accent colors, no backgrounds.
 */

// ── Core palette ──────────────────────────────────────────────

export const COLORS = Object.freeze({
  bg:            'none',
  surface:       'none',
  border:        'none',
  text:          '#c9d1d9',
  textSecondary: '#6e7681',
  accent:        '#8b949e',

  // Graph-specific
  graphLine:     '#8b949e',
  graphArea:     'rgba(139, 148, 158, 0.06)',
  graphDot:      '#8b949e',

  // Progress bar background
  barTrack:      'rgba(139, 148, 158, 0.12)',
});


// ── Language colors ───────────────────────────────────────────
// All grey — no per-language colors. Uniform monochrome.

export const LANGUAGE_COLORS = Object.freeze({});


/**
 * Get the display color for a language.
 * Always returns grey — monochrome only.
 */
export function getLanguageColor(_language) {
  return '#8b949e';
}
