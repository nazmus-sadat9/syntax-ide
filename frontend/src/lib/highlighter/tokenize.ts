import type { Token, Grammer } from "./types";

export function tokenize(code: string, grammer: Grammer[]): Token[] {

  const token: Token[] = [{ type: "variable", value: "const", start: 0, end: 5 }];

  return token;
}
