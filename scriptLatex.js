/**
 * stripLatex.js: turns LaTeX in a model answer into plain text.
 *
 *   const { stripLatex } = require("./stripLatex");
 *   res.json({ answer: stripLatex(out.text), sources });
 *
 * Handles $...$, $$...$$, \( ... \), \[ ... \]. A "$...$" pair is only treated as math if it
 * contains a LaTeX marker (\ _ ^ { }), so "costs $50 and $100" is left alone.
 */

const SYMBOLS = {
  "\\times": "×", "\\cdot": "·", "\\rightarrow": "→", "\\to": "→", "\\leftarrow": "←",
  "\\leftrightarrow": "↔", "\\approx": "≈", "\\leq": "≤", "\\le": "≤", "\\geq": "≥", "\\ge": "≥",
  "\\neq": "≠", "\\pm": "±", "\\circ": "°", "\\degree": "°", "\\infty": "∞", "\\%": "%",
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ", "\\mu": "μ", "\\Delta": "Δ",
  "\\,": " ", "\\;": " ", "\\:": " ", "\\!": "", "\\ ": " ", "\\quad": " ", "\\qquad": " ",
};

function convertMath(m) {
  let t = m;
  // \text{NH}, \mathrm{...}, \ce{...} -> contents
  t = t.replace(/\\(?:text|textrm|textbf|mathrm|mathbf|mathit|ce)\s*\{([^{}]*)\}/g, "$1");
  // symbol commands; unknown commands are dropped
  t = t.replace(/\\[a-zA-Z]+|\\[%,;:! ]/g, (cmd) => (cmd in SYMBOLS ? SYMBOLS[cmd] : ""));
  // subscripts: NH_4, C_{12} -> NH4, C12
  t = t.replace(/_\{([^{}]*)\}/g, "$1").replace(/_([A-Za-z0-9])/g, "$1");
  // superscripts: ^{2}, ^2 -> ^2 ; degree sign: ^° -> °
  t = t.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/\^°/g, "°");
  // leftover braces and runs of spaces
  t = t.replace(/[{}]/g, "").replace(/[ \t]{2,}/g, " ");
  return t.trim();
}

function stripLatex(s) {
  if (!s) return s;
  const isMath = (inner) => /[\\_^{}]/.test(inner);
  const sub = (full, inner) => (isMath(inner) ? convertMath(inner) : full);
  return s
    .replace(/\$\$([\s\S]+?)\$\$/g, (full, a) => sub(full, a))
    .replace(/\\\[([\s\S]+?)\\\]/g, (full, a) => sub(full, a))
    .replace(/\\\(([\s\S]+?)\\\)/g, (full, a) => sub(full, a))
    .replace(/\$([^$\n]+?)\$/g, (full, a) => sub(full, a));
}

module.exports = { stripLatex };
