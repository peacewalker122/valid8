import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../types/token";
import {
	Argument,
	Identifier,
	LogicalOperators,
	Program,
	Statement,
} from "./ast";

enum TokenGroup {
	LOGICAL,
	QUANTIFIER,
}

export class Parser {
	private lexer: Lexer;
	private curToken: Token;
	private peekToken: Token;

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
	}

	/**
	 * nextToken
	 */
	public nextToken() {
		this.curToken = this.peekToken;
		this.peekToken = this.lexer.GetNextToken();
	}

	public parseProgram(): Program {
		let ast: Program = new Program();

		while (this.curToken.Type !== TokenType.EOF) {
			let statement: Statement | undefined;

			switch (this.TokenComponents[this.curToken.Type]) {
				case TokenGroup.LOGICAL: {
					statement = this.parseLogicalExpression(this.curToken);
					break;
				}
				default:
					console.error("not yet implemented");
			}

			if (statement !== undefined) {
				ast.predicates.push(statement);
			}

			this.nextToken();
		}

		return ast;
	}

	private parseLogicalExpression(token: Token): LogicalOperators | undefined {
		const exprs = new LogicalOperators(token);
		this.nextToken(); // current-token = (

		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			return undefined;
		}
		this.nextToken(); // current-token = IDENTIFIER

		exprs.name = new Identifier(
			this.curToken.Type,
			this.curToken.Literal ?? "",
		);

		if (!this.expectPeek(TokenType.COMMA)) {
			return undefined;
		}
		this.nextToken(); // current-token = COMMA
		this.nextToken(); // current-token = IDENTIFIER

		let values: Identifier[] = [];
		values = [new Identifier(this.curToken.Type, this.curToken.Literal ?? "")];
		exprs.value = values;

		while (!this.curTokenIs(TokenType.RPAREN)) {
			this.nextToken();
		}

		return exprs;
	}

	private expectPeek(expectedType: TokenType): boolean {
		return this.peekToken.Type === expectedType;
	}

	private curTokenIs(expectedType: TokenType): boolean {
		return this.curToken.Type === expectedType;
	}
}
