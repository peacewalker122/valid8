import type { Lexer } from "../lexer/lexer";
import type { Token } from "../types/token";

class Parser {
	private lexer: Lexer;
	private curToken: Token;
	private peekToken: Token;

	constructor(lexer: Lexer) {
		this.lexer = lexer;
		this.peekToken = this.lexer.GetNextToken();

		this.nextToken();
	}

	/**
	 * nextToken
	 */
	public nextToken() {
		this.curToken = this.peekToken;
		this.peekToken = this.lexer.GetNextToken();
	}

	public parseProgram(): void {}
}
