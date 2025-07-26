import { log } from "../util/log";
import type { Lexer } from "../lexer/lexer";
import { type Token, TokenType } from "../types/token";
import {
	Expression,
	type infixParsefn,
	type prefixParsefn,
} from "../types/type";
import {
	CompoundStatement,
	ExpressionStatement,
	IdentifierStatement,
	AtomicStatement,
	NegationStatement,
	Program,
	QuantifierStatement,
	type Statement,
	LabelStatement,
} from "./ast";

enum TokenGroup {
	ATOMIC,
	QUANTIFIER,
	PUNCTUATION,
	LABEL,
	COMPOUND,
	NEGATION,
}

export class Parser {
	private lexer: Lexer;
	private curToken: Token;
	private peekToken: Token;
	public error: string[];

	private prefixParseFns: Map<TokenType, prefixParsefn> = new Map();
	private infixParseFns: Map<TokenType, infixParsefn> = new Map();

	private TokenComponents: Record<string, TokenGroup> = {
		IS: TokenGroup.ATOMIC,
		HAS: TokenGroup.ATOMIC,
		CAN: TokenGroup.ATOMIC,
		ARE: TokenGroup.ATOMIC,

		NOT: TokenGroup.NEGATION,

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
		THEREFORE: TokenGroup.LABEL,

		// COMPOUND
		AND: TokenGroup.COMPOUND,
		OR: TokenGroup.COMPOUND,
		IMPLIES: TokenGroup.COMPOUND,
	};

	constructor(lexer: Lexer) {
		this.lexer = lexer;
		this.peekToken = this.lexer.GetNextToken();

		this.curToken = this.peekToken;
		this.peekToken = this.lexer.GetNextToken(); // lsp rewel

		// TODO: add other registerPrefix functions as well
		this.registerPrefix(TokenType.IDENTIFIER, (): Statement | undefined => {
			log.debug("parseIdentifier called");
			return this.parseIdentifier();
		});
		this.registerPrefix(TokenType.FORALL, (): Statement | undefined => {
			log.debug("parseQuantifierExpression called");
			return this.parseQuantifierStatement();
		});

		this.error = [];
	}

	/**
	 * nextToken
	 */
	public nextToken() {
		log.debug(
			`nextToken called, current token: ${this.curToken.Type}, peek token: ${this.peekToken.Type}`,
		);
		this.curToken = this.peekToken;
		this.peekToken = this.lexer.GetNextToken();
	}

	public parseProgram(): Program {
		const ast: Program = new Program();

		while (this.curToken.Type !== TokenType.EOF) {
			let statement: Statement | undefined;
			const tokengroup = this.TokenComponents[this.curToken.Type]; // skip if the type if punctuation or keyword like "PREMISE", "CONCLUSION", etc.

			if (tokengroup === TokenGroup.PUNCTUATION) {
				this.nextToken();
				continue; // skip punctuation and labels
			}

			switch (tokengroup) {
				case TokenGroup.LABEL: {
					log.debug("ParseLabelStatement called");
					statement = this.ParseLabelStatement();
					break;
				}
				case TokenGroup.ATOMIC: {
					log.debug("parseAtomicStatement called");
					statement = this.parseAtomicStatement(this.curToken);
					break;
				}
				case TokenGroup.QUANTIFIER: {
					log.debug("parseQuantifierStatement called");
					statement = this.parseQuantifierStatement();
					break;
				}
				case TokenGroup.NEGATION: {
					log.debug("ParseNegationStatement called");
					statement = this.ParseNegationStatement();
					break;
				}
				case TokenGroup.COMPOUND: {
					log.debug("ParseCompoundStatement called");
					statement = this.ParseCompoundStatement();
					break;
				}
				default: {
					log.debug("ParseExpressionStatement called");
					statement = this.ParseExpressionStatement();
					break;
				}
			}

			if (statement !== undefined) {
				ast.predicates.push(statement);
			}

			this.nextToken();
		}

		return ast;
	}

	private parseIdentifier(): IdentifierStatement | undefined {
		if (!this.curTokenIs(TokenType.IDENTIFIER)) {
			this.error.push(`Expected IDENTIFIER but got ${this.curToken.Type}`);
			return undefined;
		}

		const ident = new IdentifierStatement(
			this.curToken.Type,
			this.curToken.Literal ?? "",
		);
		this.nextToken(); // consume the identifier token

		console.debug(`Parsed identifier: ${ident.TokenLiteral()}`);
		return ident;
	}

	private ParseCompoundStatement(): CompoundStatement | undefined {
		const compound = new CompoundStatement(this.curToken);
		if (!this.peekCheck(TokenType.LPAREN)) {
			this.error.push(
				`Expected LPAREN after ${this.curToken.Type}, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = (

		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			this.error.push(
				`Expected IDENTIFIER after LPAREN, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token

		compound.left = this.parseExpression(Expression.LOWEST);

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
		this.nextToken(); // current-token

		compound.right = this.parseExpression(Expression.LOWEST);

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

		return compound;
	}

	private ParseNegationStatement(): NegationStatement | undefined {
		const negation = new NegationStatement(this.curToken);

		if (!this.peekCheck(TokenType.LPAREN)) {
			this.error.push(`Expected LPAREN after NOT, got ${this.peekToken.Type}`);
			return undefined;
		}

		this.nextToken(); // current-token = (
		if (!this.expectPeek(TokenType.IDENTIFIER)) {
			this.error.push(
				`Expected IDENTIFIER after LPAREN, got ${this.peekToken.Type}`,
			);
			return undefined;
		}
		this.nextToken(); // current-token = Identifier

		negation.value = new IdentifierStatement(
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

		return negation;
	}

	private ParseExpressionStatement(): ExpressionStatement | undefined {
		const expr = new ExpressionStatement(this.curToken);

		expr.expression = this.parseExpression(Expression.LOWEST);

		if (this.peekToken.Type === TokenType.SEMICOLON) {
			this.nextToken(); // consume the semicolon
		}

		return expr;
	}

	private ParseLabelStatement(): LabelStatement | undefined {
		const label = new LabelStatement(this.curToken);
		if (!this.peekCheck(TokenType.COLON)) {
			this.error.push(
				`Expected COLON after ${this.curToken.Type}, got ${this.peekToken.Type}`,
			);
			return undefined;
		}

		this.nextToken(); // current-token = COLON

		return label;
	}

	private parseQuantifierStatement(): QuantifierStatement | undefined {
		const exprs = new QuantifierStatement(this.curToken);
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

		exprs.name = new IdentifierStatement(
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

		exprs.value = this.parseExpression(Expression.LOWEST); // NOTE: when this parsing something, the exprs return undefined...

		// check if they're going to EOF and still not found the RPAREN
		// let foundRPAREN = false;
		// while (
		// 	!this.curTokenIs(TokenType.RPAREN) &&
		// 	!this.curTokenIs(TokenType.SEMICOLON) // mean we are at the end of the statement
		// ) {
		// 	this.nextToken();

		// 	if (this.curTokenIs(TokenType.RPAREN)) {
		// 		foundRPAREN = true;
		// 		break;
		// 	}
		// }
		// if (!foundRPAREN) {
		// 	console.error(`Expected RPAREN but got ${this.curToken.Type}`);
		// 	this.error.push(`Expected RPAREN but got ${this.curToken.Type}`);
		// 	return undefined;
		// }

		return exprs;
	}

	private parseAtomicStatement(token: Token): AtomicStatement | undefined {
		const exprs = new AtomicStatement(token);
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

		exprs.name = new IdentifierStatement(
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

		exprs.value = new IdentifierStatement(
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

	private parseExpression(_precedence: Expression): Statement | undefined {
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

	// private registerInfix(fn: infixParsefn, token: TokenType): void {
	// 	this.infixParseFns.set(token, fn);
	// }
}
