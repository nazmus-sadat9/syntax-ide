import type { Grammar } from "../types"

export const go: Grammar = {
  keywords: [
    "break", "case", "chan", "const", "continue", "default", "defer",
    "else", "fallthrough", "for", "func", "go", "goto", "if", "import",
    "interface", "map", "package", "range", "return", "select",
    "struct", "switch", "type", "var",
    "true", "false", "nil", "iota",
  ],

  rules: [
    ["whitespace", /\s+/y],
    ["comment", /\/\/.*|\/\*[\s\S]*?\*\//y],
    ["string", /"(?:\\.|[^"\\])*"|`[^`]*`|'(?:\\.|[^'\\])*'/y],
    ["number", /0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?i?/y],
    ["word", /[\p{L}_][\p{L}\p{N}_]*/uy],
    ["punctuation", /[{}()[\];,.]/y],
    ["operator", /[+\-*/%=<>!&|^~?:]+/y],
  ],
};
