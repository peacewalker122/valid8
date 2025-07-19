import { type Token, TokenType } from "./type";
import { isLetter, log } from "./util";

enum LexerState {
	EXPECTING_LABEL, // Looking for "P:" or "C:"
	EXPECTING_STATEMENT, // After "P:" or "C:", parsing the logic
	IN_LOGICAL_EXPRESSION, // Inside "if...then" construct
	IN_IDENTIFIER, // Reading a general identifier
}

export class Lexer {
	private input: string;
	private position: number;
	private ch: string; //currentChar
	private keywords: Record<string, TokenType> = {
		"P:": TokenType.Premise,
		"C:": TokenType.Conclusion,
		IF: TokenType.IF,
		THEN: TokenType.THEN,
		NOT: TokenType.NOT,
	};
	private state: LexerState = LexerState.EXPECTING_LABEL;
	private logicalKeywords: Record<string, TokenType> = {
		IF: TokenType.IF,
		THEN: TokenType.THEN,
		NOT: TokenType.NOT,
		AND: TokenType.AND,
		OR: TokenType.OR,
	};

	constructor(input: string) {
		this.input = input.toUpperCase();
		this.position = 0;
		this.ch = this.input[this.position];
	}

	public GetNextToken(): Token {
		let tok: Token;
		// Handle each token based on current state.
		switch (this.state) {
			case LexerState.EXPECTING_LABEL: {
				// Expecting a label like "P:" or "C:"
				if (this.ch === "P" && this.peekChar() === ":") {
					tok = {
						Type: TokenType.Premise,
					};
					this.state = LexerState.EXPECTING_STATEMENT;
					this.position += 2; // Skip the "P:"
					this.ch = this.input[this.position]; // Update current char
					log.debug("Tokenized Premise", {
						input: this.input,
						position: this.position,
						state: this.state,
					});
					return tok;
				}

				if (this.ch === "C" && this.peekChar() === ":") {
					tok = {
						Type: TokenType.Conclusion,
					};
					this.state = LexerState.EXPECTING_STATEMENT;
					this.position += 2; // Skip the "C:"
					this.ch = this.input[this.position]; // Update current char
					log.debug("Tokenized Conclusion", {
						input: this.input,
						position: this.position,
						state: this.state,
					});
					return tok;
				}

				return this.readIdentifier(); // mean it's just identifier...
			}
			case LexerState.EXPECTING_STATEMENT: {
				log.debug("Expecting statement, current char:", this.ch);
				this.skipWhitespace();
				// expecting something like "IF", ""
				if (this.ch === "I" && this.peekChar() === "F") {
					tok = {
						Type: TokenType.IF,
					};
					this.state = LexerState.IN_LOGICAL_EXPRESSION;
					this.position += 2; // Skip the "IF"
					this.ch = this.input[this.position]; // Update current char
					log.debug("Tokenized IF", {
						input: this.input,
						position: this.position,
						state: this.state,
					});
					return tok;
				}

				// otherwise, read an identifier
				this.state = LexerState.IN_IDENTIFIER;
				return this.readIdentifier();
			}
			case LexerState.IN_LOGICAL_EXPRESSION: {
				this.skipWhitespace();
				const nextWord = this.peekNextWord();

				if (nextWord in this.logicalKeywords) {
					return this.readWord(this.logicalKeywords[nextWord]);
				}

				return this.readIdentifier();
			}
			case LexerState.IN_IDENTIFIER: {
				return this.readIdentifier();
			}
		}
	}

	// HELPER ====================
	private peekNextWord(): string {
		const lastPos = this.position;

		while (this.ch && isLetter(this.ch)) {
			this.readChar();
		}

		return this.input.slice(lastPos, this.position);
	}

	private readWord(expectedType: TokenType): Token {
		// iterate until we found the next word
		const lastPos = this.position;

		while (this.ch && isLetter(this.ch)) {
			this.readChar();
		}

		return {
			Type: expectedType,
			Value: this.input.slice(lastPos, this.position),
		};
	}

	private readIdentifier(): Token {
		this.skipWhitespace();
		const startpost = this.position;

		if (!this.ch) {
			console.debug("End of input reached, current position:", this.position);
			return {
				Type: TokenType.EOF,
			};
		}

		while (this.ch) {
			console.debug("Reading identifier, current char:", this.ch);
			switch (this.ch) {
				case "\n": {
					this.readChar();
					this.state = LexerState.EXPECTING_LABEL; // reset
					return {
						Type: TokenType.NEWLINE,
					};
				}
				case ",": {
					// handle case when we are in the middle of reading an identifier and suddenly encounter a comma...
					if (this.position !== startpost) {
						console.debug("Found comma, current position:", this.position);
						return {
							Type: TokenType.IDENT,
							Value: this.input.slice(startpost, this.position),
						};
					}

					console.debug("Reading comma, current position:", this.position);
					this.readChar();
					return {
						Type: TokenType.COMMA,
					};
				}
			}

			// keep going until it goes out of letters
			this.readChar();
		}

		return {
			Type: TokenType.IDENT,
			Value: this.input.slice(startpost, this.position),
		};
	}

	private readChar() {
		if (this.input.length >= this.position) {
			this.position++;
			this.ch = this.input[this.position];
		}
	}

	private skipWhitespace() {
		while (this.ch === " " || this.ch === "\t" || this.ch === "\r") {
			this.readChar();
		}
	}

	private peekChar() {
		if (this.input.length >= this.position) {
			return this.input[this.position + 1]; // peek the next char
		} else {
			return "";
		}
	}

	private lookupIdent(ident: string): TokenType {
		if (ident in this.keywords) {
			return this.keywords[ident];
		}

		return TokenType.IDENT;
	}
}
