import { type Token, TokenType } from "../types/token";
import { LexerError } from "../types/error";
import { log } from "../util/log";
import { isLetter } from "../util/util";

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
	private state: LexerState = LexerState.EXPECTING_LABEL;
	private line = 1; // Track line number for debugging
	private column = 1; // Track column number for debugging
	private knownLabel: Record<string, TokenType> = {
		PREMISE: TokenType.PREMISE,
		THEREFORE: TokenType.THEREFORE,
	};
	private logicalKeywords: Record<string, TokenType> = {
		ALL: TokenType.ALL,
		SOME: TokenType.SOME,
		NO: TokenType.NOT,
		IS: TokenType.IS,
		IMPLIES: TokenType.IMPLIES,
		CAN: TokenType.CAN,
		// EXISTS: TokenType.EXISTS,
		// FORALL: TokenType.FORALL,
		AND: TokenType.AND,
		HAS: TokenType.HAS,
	};
	private symbols: Record<string, TokenType> = {
		"(": TokenType.LPAREN,
		")": TokenType.RPAREN,
		",": TokenType.COMMA,
		".": TokenType.PERIOD,
		":": TokenType.COLON,
		";": TokenType.SEMICOLON,
	};

	constructor(input: string) {
		this.input = input;
		this.position = 0;
		this.ch = this.input[this.position];
	}

	public GetNextToken(): Token {
		let tok: Token;
		// Handle each token based on current state.
		switch (this.state) {
			case LexerState.EXPECTING_LABEL: {
				// Expecting a label like "P:" or "C:"
				this.skipWhitespace();
				const word = this.peekNextWord();
				log.debug("Lexer: Expecting label, current word:", word);
				if (word in this.knownLabel) {
					tok = {
						Type: this.knownLabel[word],
						Line: this.line,
						Column: this.column,
					};
					this.position += word.length; // Move position past the known
					this.ch = this.input[this.position]; // Update current char
					this.state = LexerState.EXPECTING_STATEMENT; // Move to next state

					return tok;
				}

				const ident = this.readIdentifier();
				ident.Line = this.line;
				ident.Column = this.column;
				return ident; // mean it's just identifier...
			}
			case LexerState.EXPECTING_STATEMENT: {
				log.debug("Lexer: Expecting statement, current char:", this.ch);
				this.skipWhitespace();
				// expecting something like ALL, SOME, NO, IS, ARE, etc.
				const word = this.peekNextWord();
				log.debug("Lexer: Next word in statement:", word);
				if (word in this.logicalKeywords) {
					// if the next word is a logical keyword, read it and update the state to expect identifier
					this.state = LexerState.IN_IDENTIFIER;
					return this.readWord(this.logicalKeywords[word]);
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
		this.skipWhitespace();
		const lastPos = this.position;
		let wordPos = this.position;
		let ch = this.ch;

		while (ch && isLetter(ch)) {
			wordPos += 1;
			ch = this.input[wordPos];
		}



		return this.input.slice(lastPos, wordPos);
	}

	private readWord(expectedType: TokenType): Token {
		// iterate until we found the next word
		const lastPos = this.position;

		while (this.ch && isLetter(this.ch)) {
			this.readChar();
		}

		return {
			Type: expectedType,
			Literal: this.input.slice(lastPos, this.position),
			Line: this.line,
			Column: this.column,
		};
	}

	private readIdentifier(): Token {
		this.skipWhitespace();
		const startpost = this.position;

		if (!this.ch) {
			log.debug("Lexer: End of input reached, current position:", this.position);
			return {
				Type: TokenType.EOF,
				Line: this.line,
				Column: this.column,
			};
		}

		if (!isLetter(this.ch) && !this.symbols[this.ch]) {
			log.error(`Lexer: Unexpected character '${this.ch}' at line ${this.line}, column ${this.column}`);
			throw new LexerError(
				`Unexpected character '${this.ch}'`,
				this.line,
				this.column,
				this.ch,
			);
		}

		const word = this.peekNextWord();

		// if the next word is not a symbol, it must be an identifier
		if (word && !this.symbols[word] && word.length > 0) {
			// letters of identifier found
			// NOTE: there's some problem regarding the tokentype here. The type here isn't always IDENTIFIER, it could be a quantifier or logical keyword.
			log.debug("Lexer: Found identifier word:", word);
			return this.readWord(this.logicalKeywords[word] || TokenType.IDENTIFIER);
		}

		while (this.ch) {
			switch (this.ch) {
				case ";": {
					this.readChar();
					this.state = LexerState.EXPECTING_LABEL; // reset
					return {
						Type: TokenType.SEMICOLON,
						Line: this.line,
						Column: this.column,
					};
				}
				case "(": {
					this.readChar();
					return {
						Type: TokenType.LPAREN,
						Line: this.line,
						Column: this.column,
					};
				}
				case ")": {
					this.readChar();
					return {
						Type: TokenType.RPAREN,
						Line: this.line,
						Column: this.column,
					};
				}
				case ",": {
					this.readChar();
					return {
						Type: TokenType.COMMA,
						Line: this.line,
						Column: this.column,
					};
				}
				case ".": {
					this.readChar();
					return {
						Type: TokenType.PERIOD,
						Line: this.line,
						Column: this.column,
					};
				}
				case ":": {
					this.readChar();
					this.state = LexerState.IN_LOGICAL_EXPRESSION;
					return {
						Type: TokenType.COLON,
						Line: this.line,
						Column: this.column,
					};
				}
			}

			// keep going until it goes out of letters
			this.readChar();
		}

		return {
			Type: TokenType.IDENTIFIER,
			Literal: this.input.slice(startpost, this.position),
			Line: this.line,
			Column: this.column,
		};
	}

	private readChar() {
		if (this.input.length >= this.position) {
			if (this.ch === "\n") {
				this.line++;
				this.column = 1;
			} else {
				this.column++;
			}
			this.position++;
			this.ch = this.input[this.position];
		}
	}

	private skipWhitespace() {
		while (
			this.ch === " " ||
			this.ch === "\t" ||
			this.ch === "\r" ||
			this.ch === "\n"
		) {
			this.readChar();
		}
	}



	// private lookupIdent(ident: string): TokenType {
	// 	if (ident in this.keywords) {
	// 		return this.keywords[ident];
	// 	}

	// 	return TokenType.IDENT;
	// }
}
