import type { Token, Grammer } from "./types";
import { js } from "./languages/js";

const grammers: Record<string, Grammer> = {
  js,
}

export function tokenize(code: string, language: string = "js"): Token[] {

  const grammer = grammers[language] || js

  const tokens: Token[] = [];
  let index: number = 0;

  // tokenize from code
  while (index < code.length) {
    let matched: boolean = false;

    for (const [type, pattern] of grammer.rules) {
      pattern.lastIndex = index;
      const match = pattern.exec(code);

      if (match && match.index === index) {
        const value = match[0];
        let tokenType = type;

        if (type === "word" && grammer.keywords.includes(value)) {
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
