import type { Token, TokenType } from "../types/token";

abstract class Vertex {
	abstract TokenLiteral(): string;
	abstract string(): string;
}

abstract class Statement extends Vertex {
	abstract statementNode(): void;
}

abstract class Argument extends Vertex {
	abstract argumentNode(): void;
}

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

class LogicalStatement extends Statement {
	string(): string {
		return `${this.name?.TokenLiteral() || ""} ${this.value?.string() || ""}`;
	}
	public name: Identifier | undefined;
	public value: Argument | undefined; // WARN: could contain other function as well but should can be ignored in this case.

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		// This method is intentionally left empty.
	}

	TokenLiteral(): string {
		return this.token.Literal ?? this.token.Type;
	}
}

class QuantifierStatement extends Statement {
	string(): string {
		return `${this.token.Literal} ${this.name?.TokenLiteral()} ${this.value?.TokenLiteral()}`;
	}
	public name: Identifier | undefined;
	public value: Argument | undefined; // WARN: could contain other function as well but should can be ignored in this case.

	constructor(public token: Token) {
		super();
	}

	statementNode(): void {
		throw new Error("Method not implemented.");
	}
	TokenLiteral(): string {
		throw new Error("Method not implemented.");
	}
}

class Identifier extends Argument {
	string(): string {
		return this.value;
	}
	constructor(
		private token: TokenType,
		private value: string,
	) {
		super();
	}

	argumentNode(): void {
		// This method is intentionally left empty.
	}

	TokenLiteral(): string {
		return this.value;
	}
}

export {
	Vertex,
	Statement,
	Argument,
	Program,
	LogicalStatement,
	Identifier,
	QuantifierStatement,
};
