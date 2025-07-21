import { Token, TokenType } from "../types/token";

abstract class Vertex {
	abstract TokenLiteral(): string;
}

abstract class Statement extends Vertex {
	abstract statementNode(): void;
}

abstract class Argument extends Vertex {
	abstract argumentNode(): void;
}

class Program extends Vertex {
	private predicates: Statement[] = [];

	constructor(predicates: Statement[]) {
		super();
		this.predicates = predicates;
	}

	TokenLiteral(): string {
		if (this.predicates.length > 0) {
			return this.predicates[0].TokenLiteral();
		}

		return "";
	}
}

class Premise extends Statement {
	constructor(
		private token: TokenType,
		private identifier: Identifier,
		private value: Argument,
	) {
		super();
	}

	statementNode(): void {
		// This method is intentionally left empty.
	}

	TokenLiteral(): string {
		return this.token;
	}
}

class Identifier extends Argument {
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
		return this.token;
	}
}
