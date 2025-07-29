import type { Token, TokenType } from "../types/token";
import { Expression } from "../types/type";

abstract class Vertex {
	abstract TokenLiteral(): string;
	abstract string(): string;
}

abstract class Statement extends Vertex {
	abstract statementNode(): void;
}

// expression
// abstract class Argument extends Vertex {
// 	abstract argumentNode(): void;
// }

class Program extends Vertex {
	string(): string {
		return this.predicates.map((p) => p.string()).join("\n");
	}
	public predicates: Statement[] = [];

	TokenLiteral(): string {
		if (this.predicates.length > 0) {
			return this.predicates[0].TokenLiteral();
		}

		return "";
	}
}

// LogicalStatement is used for statements like "IS", "LIKES", etc.
class AtomicStatement extends Statement {
	public name: IdentifierStatement | undefined;
	public value: Statement | undefined; // WARN: could contain other function as well but should can be ignored in this case.

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		// This method is intentionally left empty.
	}

	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type;
	}

	string(): string {
		return `${this.name?.TokenLiteral() || ""} ${this.value?.string() || ""}`;
	}
}

// QuantifierStatement is used for statements like "FORALL", "EXISTS", etc.
class QuantifierStatement extends Statement {
	string(): string {
		return `${this.token.Literal} ${this.name?.TokenLiteral()} ${this.value?.TokenLiteral()}`;
	}
	public name: IdentifierStatement | undefined;
	public value: Statement | undefined; // recursive structure, can be another Expression or AtomicStatement

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		throw new Error("Method not implemented.");
	}
	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type; // return the literal value of the token, if available, otherwise the token type
	}
}

class ExpressionStatement extends Statement {
	public expression: Statement | undefined;

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		// This method is intentionally left empty.
	}
	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type; // return the literal value of the token, if available, otherwise the token type
	}
	string(): string {
		if (this.expression) {
			return this.expression.toString();
		}
		return "";
	}
}

class CompoundStatement extends Statement {
	string(): string {
		return `${this.left?.string() || ""} ${this.token.Literal} ${this.right?.string() || ""}`;
	}
	public left: Statement | undefined;
	public right: Statement | undefined;

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		// This method is intentionally left empty.
	}

	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type; // return the literal value of the token, if available, otherwise the token type
	}
}

class NegationStatement extends Statement {
	string(): string {
		return `NOT ${this.value?.string() || ""}`;
	}
	public value: Statement | undefined;

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		// This method is intentionally left empty.
	}

	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type; // return the literal value of the token, if available, otherwise the token type
	}
}

class IdentifierStatement extends Statement {
	statementNode(): void {
		// This method is intentionally left empty.
	}
	string(): string {
		return this.value;
	}
	constructor(
		public token: TokenType,
		public value: string,
	) {
		super();
	}

	TokenLiteral(): string {
		return this.value;
	}
}

class LabelStatement extends Statement {
	statementNode(): void {}
	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type; // return the literal value of the token, if available, otherwise the token type
	}
	string(): string {
		return this.token.Literal || this.token.Type;
	}

	constructor(private token: Token) {
		super();
	}
}

export {
	Vertex,
	Statement,
	Program,
	AtomicStatement,
	IdentifierStatement,
	QuantifierStatement,
	ExpressionStatement,
	CompoundStatement,
	NegationStatement,
	LabelStatement,
};
