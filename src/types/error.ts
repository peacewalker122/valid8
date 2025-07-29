// src/types/error.ts
export class LexerError extends Error {
  constructor(
    public message: string,
    public line: number,
    public column: number,
    public value?: string
  ) {
    super(message);
    this.name = "LexerError";
  }
}

export class ParserError extends Error {
  constructor(
    public message: string,
    public line: number,
    public column: number,
    public token?: string
  ) {
    super(message);
    this.name = "ParserError";
  }
}
