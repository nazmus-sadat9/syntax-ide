export type Token = {
  type: string; // keyword
  value: string; // matched text
  start: number; // index of the first character
  end: number; // index of the last character
};

export type Rule = [type: string, pattern: RegExp];

export type Grammar = {
  keywords: string[];
  rules: Rule[];
};

