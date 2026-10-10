import type { Grammar } from "../types"

export const c: Grammar = {
  keywords: [
    "auto", "break", "case", "char", "const", "continue", "default",
    "do", "double", "else", "enum", "extern", "float", "for", "goto",
    "if", "inline", "int", "long", "register", "restrict", "return",
    "short", "signed", "sizeof", "static", "struct", "switch",
    "typedef", "union", "unsigned", "void", "volatile", "while",
    "bool", "true", "false", "NULL",
  ],

  rules: [
    ["whitespace", /\s+/y],
    ["comment", /\/\/.*|\/\*[\s\S]*?\*\//y],
    ["preprocessor", /#[ \t]*\w+.*/y],
    ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
    ["number", /0[xX][\da-fA-F]+[uUlL]*|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFuUlL]*/y],
    ["word", /[A-Za-z_][\w]*/y],
    ["punctuation", /[{}()[\];,.]/y],
    ["operator", /[+\-*/%=<>!&|^~?:]+/y],
  ],
};
