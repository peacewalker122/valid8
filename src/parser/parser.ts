import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../types/token";
import {
	Identifier,
	LogicalStatement,
	Program,
	QuantifierStatement,
	type Statement,
} from "./ast";

enum TokenGroup {
	LOGICAL,
	QUANTIFIER,
}

export class Parser {
	private lexer: Lexer;
	private curToken: Token;
	private peekToken: Token;
	public error: string[];

	private TokenComponents: Record<string, TokenGroup> = {
		ALL: TokenGroup.LOGICAL,
		SOME: TokenGroup.LOGICAL,
		NO: TokenGroup.LOGICAL,
		IS: TokenGroup.LOGICAL,
		IMPLIES: TokenGroup.LOGICAL,
		CAN: TokenGroup.LOGICAL,

		EXISTS: TokenGroup.QUANTIFIER,
		FORALL: TokenGroup.QUANTIFIER,
	};

	constructor(lexer: Lexer) {
		this.lexer = lexer;
		this.peekToken = this.lexer.GetNextToken();
		this.curToken = this.peekToken;

		this.peekToken = this.lexer.GetNextToken(); // lsp rewel

		this.error = [];
	}

	/**
	 * nextToken
	 */
	public nextToken() {
		this.curToken = this.peekToken;
		this.peekToken = this.lexer.GetNextToken();
	}

	public parseProgram(): Program {
		const ast: Program = new Program();

		while (this.curToken.Type !== TokenType.EOF) {
			let statement: Statement | undefined;

			switch (this.TokenComponents[this.curToken.Type]) {
				case TokenGroup.LOGICAL: {
					statement = this.parseLogicalExpression(this.curToken);
					break;
				}
				case TokenGroup.QUANTIFIER: {
					statement = this.parseQuantifierExpression(this.curToken);
					break;
				}
				// default:
				// 	console.error("not yet implemented");
			}

			if (statement !== undefined) {
				ast.predicates.push(statement);
			}

			this.nextToken();
		}

		return ast;
	}

	private parseQuantifierExpression(
		token: Token,
	): QuantifierStatement | undefined {
		const exprs = new QuantifierStatement(token);
		if (!this.peekCheck(TokenType.LPAREN)) {
			return undefined;
		}

		this.nextToken(); // current-token = (

		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			this.error.push(
				`Expected IDENTIFIER after LPAREN, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = IDENTIFIER

		exprs.name = new Identifier(
			this.curToken.Type,
			this.curToken.Literal ?? "",
		);

		if (!this.expectPeek(TokenType.COMMA)) {
			this.error.push(
				`Expected COMMA after IDENTIFIER, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = COMMA

		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			this.error.push(
				`Expected IDENTIFIER after COMMA, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = IDENTIFIER

		exprs.value = new Identifier(
			this.curToken.Type,
			this.curToken.Literal ?? "",
		);

		// check if they're going to EOF and still not found the RPAREN
		let foundRPAREN = false;
		while (
			!this.curTokenIs(TokenType.RPAREN) &&
			!this.curTokenIs(TokenType.SEMICOLON) // mean we are at the end of the statement
		) {
			this.nextToken();

			if (this.curTokenIs(TokenType.RPAREN)) {
				foundRPAREN = true;
				break;
			}
		}

		if (!foundRPAREN) {
			this.error.push(`Expected RPAREN but got ${this.curToken.Type}`);
			return undefined;
		}

		return exprs;
	}

	private parseLogicalExpression(token: Token): LogicalStatement | undefined {
		const exprs = new LogicalStatement(token);
		if (!this.peekCheck(TokenType.LPAREN)) {
			return undefined;
		}

		this.nextToken(); // current-token = (

		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			this.error.push(
				`Expected IDENTIFIER after LPAREN, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = IDENTIFIER

		exprs.name = new Identifier(
			this.curToken.Type,
			this.curToken.Literal ?? "",
		);

		if (!this.expectPeek(TokenType.COMMA)) {
			this.error.push(
				`Expected COMMA after IDENTIFIER, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = COMMA

		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			this.error.push(
				`Expected IDENTIFIER after COMMA, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = IDENTIFIER

		exprs.value = new Identifier(
			this.curToken.Type,
			this.curToken.Literal ?? "",
		);

		// check if they're going to EOF and still not found the RPAREN
		let foundRPAREN = false;
		while (
			!this.curTokenIs(TokenType.RPAREN) &&
			!this.curTokenIs(TokenType.SEMICOLON) // mean we are at the end of the statement
		) {
			this.nextToken();

			if (this.curTokenIs(TokenType.RPAREN)) {
				foundRPAREN = true;
				break;
			}
		}

		if (!foundRPAREN) {
			this.error.push(`Expected RPAREN but got ${this.curToken.Type}`);
			return undefined;
		}

		return exprs;
	}

	private peekCheck(expectedType: TokenType): boolean {
		if (this.peekToken.Type === expectedType) {
			return true;
		}
		this.error.push(`Expected ${expectedType} but got ${this.peekToken.Type}`);
		return false;
	}

	private expectPeek(expectedType: TokenType): boolean {
		return this.peekToken.Type === expectedType;
	}

	private curTokenIs(expectedType: TokenType): boolean {
		return this.curToken.Type === expectedType;
	}
}
