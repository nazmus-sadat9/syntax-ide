import type { Grammer } from "../types"

export const js: Grammer = {
  keywords: [
    "const", "let", "var", "function", "return", "if", "else",
    "for", "while", "break", "continue", "switch", "case",
    "new", "class", "extends", "import", "export", "from",
    "default", "async", "await", "try", "catch", "throw",
    "true", "false", "null", "undefined", "this",
  ],

  rules: [
    ["whitespace", /\s+/y],
    ["comment", /\/\/.*|\/\*[\s\S]*?\*\//y],
    ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y],
    ["number", /\d+(?:\.\d+)?/y],
    ["word", /[A-Za-z_$][\w$]*/y],
    ["punctuation", /[{}()[\];,.]/y],
    ["operator", /[+\-*/%=<>!&|^~?:]+/y],
  ],
};
