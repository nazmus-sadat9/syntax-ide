import type { Grammar } from "../types"

export const cpp: Grammar = {
  keywords: [
    "alignas", "alignof", "auto", "bool", "break", "case", "catch",
    "char", "class", "const", "constexpr", "const_cast", "continue",
    "decltype", "default", "delete", "do", "double", "dynamic_cast",
    "else", "enum", "explicit", "export", "extern", "false", "final",
    "float", "for", "friend", "goto", "if", "inline", "int", "long",
    "mutable", "namespace", "new", "noexcept", "nullptr", "operator",
    "override", "private", "protected", "public", "register",
    "reinterpret_cast", "return", "short", "signed", "sizeof",
    "static", "static_assert", "static_cast", "struct", "switch",
    "template", "this", "throw", "true", "try", "typedef", "typeid",
    "typename", "union", "unsigned", "using", "virtual", "void",
    "volatile", "while",
  ],

  rules: [
    ["whitespace", /\s+/y],
    ["comment", /\/\/.*|\/\*[\s\S]*?\*\//y],
    ["preprocessor", /#[ \t]*\w+.*/y],
    ["string", /R"\(.*?\)"|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
    ["number", /0[xX][\da-fA-F']+[uUlL]*|0[bB][01']+|\d[\d']*(?:\.\d+)?(?:[eE][+-]?\d+)?[fFuUlL]*/y],
    ["word", /[A-Za-z_][\w]*/y],
    ["punctuation", /[{}()[\];,.]/y],
    ["operator", /[+\-*/%=<>!&|^~?:]+/y],
  ],
};
