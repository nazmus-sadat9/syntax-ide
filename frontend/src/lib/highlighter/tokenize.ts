import type { Token, Grammar } from "./types";
import { js } from "./languages/js";
import { cpp } from "./languages/cpp";
import { c } from "./languages/c";
import { go } from "./languages/go"

const grammars: Record<string, Grammar> = {
  js,
  c,
  cpp,
  go,
}

export function tokenize(code: string, language: string = "js"): Token[] {

  const grammar = grammars[language] || js

  const tokens: Token[] = [];
  let index: number = 0;
  // tokenize from code
  while (index < code.length) {
    let matched: boolean = false;

    for (const [type, pattern] of grammar.rules) {
      pattern.lastIndex = index;
      const match = pattern.exec(code);

      if (match && match.index === index) {
        const value = match[0];
        let tokenType = type;

        if (type === "word" && grammar.keywords.includes(value)) {
          tokenType = "keyword"
        }

        tokens.push({
          type: tokenType,
          value,
          start: index,
          end: index + value.length,
        });

        index += value.length;
        matched = true;
        break;
      }
    }

    // fallback for unhandled character
    if (!matched) {
      tokens.push({
        type: "unknown",
        value: code[index],
        start: index,
        end: index + 1,
      });

      index++
    }
  }

  return tokens;
}
