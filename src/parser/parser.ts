import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../types/token";
import {
	Expression,
	type infixParsefn,
	type prefixParsefn,
} from "../types/type";
import {
	ExpressionStatement,
	Identifier,
	LogicalStatement,
	Program,
	QuantifierStatement,
	type Statement,
} from "./ast";

enum TokenGroup {
	LOGICAL,
	QUANTIFIER,
	PUNCTUATION,
	LABEL,
}

export class Parser {
	private lexer: Lexer;
	private curToken: Token;
	private peekToken: Token;
	public error: string[];

	private prefixParseFns: Map<TokenType, prefixParsefn> = new Map();
	private infixParseFns: Map<TokenType, infixParsefn> = new Map();

	private TokenComponents: Record<string, TokenGroup> = {
		ALL: TokenGroup.LOGICAL,
		SOME: TokenGroup.LOGICAL,
		NO: TokenGroup.LOGICAL,
		IS: TokenGroup.LOGICAL,
		IMPLIES: TokenGroup.LOGICAL,
		CAN: TokenGroup.LOGICAL,

		EXISTS: TokenGroup.QUANTIFIER,
		FORALL: TokenGroup.QUANTIFIER,

		// punctuation
		LPAREN: TokenGroup.PUNCTUATION,
		RPAREN: TokenGroup.PUNCTUATION,
		COMMA: TokenGroup.PUNCTUATION,
		SEMICOLON: TokenGroup.PUNCTUATION,
		COLON: TokenGroup.PUNCTUATION,

		// labels
		PREMISE: TokenGroup.LABEL,
		CONCLUSION: TokenGroup.LABEL,
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
			const tokengroup = this.TokenComponents[this.curToken.Type]; // skip if the type if punctuation or keyword like "PREMISE", "CONCLUSION", etc.

			if (
				tokengroup === TokenGroup.PUNCTUATION ||
				tokengroup === TokenGroup.LABEL
			) {
				this.nextToken();
				continue; // skip punctuation and labels
			}

			switch (tokengroup) {
				case TokenGroup.LOGICAL: {
					statement = this.parseLogicalExpression(this.curToken);
					break;
				}
				case TokenGroup.QUANTIFIER: {
					statement = this.parseQuantifierExpression(this.curToken);
					break;
				}
				default: {
					statement = this.ParseExpressionStatement();
				}
			}

			if (statement !== undefined) {
				ast.predicates.push(statement);
			}

			this.nextToken();
		}

		return ast;
	}

	private ParseExpressionStatement(): ExpressionStatement | undefined {
		const expr = new ExpressionStatement(this.curToken);

		expr.expression = this.parseExpression(Expression.LOWEST);

		if (this.peekToken.Type === TokenType.SEMICOLON) {
			this.nextToken(); // consume the semicolon
		}

		return expr;
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

	private parseExpression(
		precedence: Expression,
	): ExpressionStatement | undefined {
		const prefix = this.prefixParseFns.get(this.curToken.Type);

		if (prefix === undefined) {
			return undefined;
		}

		const leftExp = prefix();

		return leftExp;
	}

	private registerPrefix(token: TokenType, fn: prefixParsefn): void {
		this.prefixParseFns.set(token, fn);
	}

	private registerInfix(fn: infixParsefn, token: TokenType): void {
		this.infixParseFns.set(token, fn);
	}
}
