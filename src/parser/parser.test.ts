import { Lexer } from "../lexer/lexer";
import { TokenType } from "../types/token";
import type { AtomicStatement, CompoundStatement, LabelStatement } from "./ast";
import { Parser } from "./parser";

describe("Parser", () => {
	it("Should Parse Is Statement", () => {
		const input = `PREMISE: IS(dog, animal);
PREMISE: IS(cat,animal);
PREMISE: IS(fish,animal);`;

		// premise: is equal like let = in other programming language, the variable name is the first identifier within the logical_expr, value

		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();

		// expect(ast.predicates.length).toBe(3);

		const expected = [
			{ name: "dog", value: "animal" },
			{ name: "cat", value: "animal" },
			{ name: "fish", value: "animal" },
		];
		// Check both premise label and logical statement in a single iteration
		for (let i = 0; i < expected.length; i++) {
			const label = ast.predicates[i] as LabelStatement;
			const logical = label.value as AtomicStatement;
			expect(label.token.Type).toBe(TokenType.PREMISE);
			expect(logical.token.Type).toBe(TokenType.IS);
			expect(logical.name?.TokenLiteral()).toBe(expected[i].name);
			expect(logical.value).toBeDefined();
			const value = logical.value as NonNullable<typeof logical.value>;
			expect(value.TokenLiteral()).toBe(expected[i].value);
		}
	});

	it("should have parsing error", () => {
		const input = `PREMISE: IS(dog animal);
PREMISE: IS(cat, animal
PREMISE: IS(fish, animal);`;

		const statements = input.split(/\n+/).filter(Boolean);
		let errorCount = 0;
		statements.forEach((stmt) => {
			const lexer = new Lexer(stmt.endsWith(";") ? stmt : stmt + ";");
			const parser = new Parser(lexer);
			try {
				parser.parseProgram();
			} catch (err: any) {
				if (err.name === "ParserError") {
					errorCount++;
					expect(err.message).toBeDefined();
					expect(typeof err.line).toBe("number");
					expect(typeof err.column).toBe("number");
					expect(err.token).toBeDefined();
				}
			}

			expect(errorCount).toBeGreaterThan(0);
		});
	});

	it("should parse compound and atomic statements", () => {
		const input = `PREMISE: AND(IS(dog, cat), IS(cat, animal));`;

		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);
		const ast = parser.parseProgram();

		const label = ast.predicates[0] as LabelStatement;
		expect(label.token.Type).toBe(TokenType.PREMISE);

		const compound = label.value as CompoundStatement;
		expect(compound.token.Type).toBe(TokenType.AND);

		const left = compound.left as AtomicStatement;
		expect(left.token.Type).toBe(TokenType.IS);
		expect(left.name?.TokenLiteral()).toBe("dog");
		expect(left.value?.TokenLiteral()).toBe("cat");

		const right = compound.right as AtomicStatement;
		expect(right.token.Type).toBe(TokenType.IS);
		expect(right.name?.TokenLiteral()).toBe("cat");
		expect(right.value?.TokenLiteral()).toBe("animal");
	});

	it("should parse complex logical expressions", () => {
		const input = `PREMISE: AND(IS(cat, animal), IS(cat, black));`;
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();

		const label = ast.predicates[0] as LabelStatement;
		expect(label.token.Type).toBe(TokenType.PREMISE);

		const compound = label.value as CompoundStatement;
		expect(compound.token.Type).toBe(TokenType.AND);
		expect(compound.left).toBeDefined();
		expect(compound.right).toBeDefined();

		const left = compound.left as AtomicStatement;
		expect(left.token.Type).toBe(TokenType.IS);
		expect(left.name?.TokenLiteral()).toBe("cat");
		expect(left.value?.TokenLiteral()).toBe("animal");

		const right = compound.right as AtomicStatement;
		expect(right.token.Type).toBe(TokenType.IS);
		expect(right.name?.TokenLiteral()).toBe("cat");
		expect(right.value?.TokenLiteral()).toBe("black");
	});

	it("should parse complete logical expression with therefore", () => {
		const input = `PREMISE: AND(IS(cat, animal), IS(cat, black));\nTHEREFORE: IS(dog, animal);`;

		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();

		expect(ast.predicates.length).toBe(2);

		// Check the premise
		const premiseLabel = ast.predicates[0] as LabelStatement;
		expect(premiseLabel.token.Type).toBe(TokenType.PREMISE);

		const premiseCompound = premiseLabel.value as CompoundStatement;
		expect(premiseCompound.token.Type).toBe(TokenType.AND);

		const firstPremiseCondition = premiseCompound.left as AtomicStatement;
		expect(firstPremiseCondition.token.Type).toBe(TokenType.IS);
		expect(firstPremiseCondition.name?.TokenLiteral()).toBe("cat");
		expect(firstPremiseCondition.value?.TokenLiteral()).toBe("animal");

		const secondPremiseCondition = premiseCompound.right as AtomicStatement;
		expect(secondPremiseCondition.token.Type).toBe(TokenType.IS);
		expect(secondPremiseCondition.name?.TokenLiteral()).toBe("cat");
		expect(secondPremiseCondition.value?.TokenLiteral()).toBe("black");

		// Check the conclusion
		const conclusionLabel = ast.predicates[1] as LabelStatement;
		expect(conclusionLabel.token.Type).toBe(TokenType.THEREFORE);

		const conclusionStatement = conclusionLabel.value as AtomicStatement;
		expect(conclusionStatement.token.Type).toBe(TokenType.IS);
		expect(conclusionStatement.name?.TokenLiteral()).toBe("dog");
		expect(conclusionStatement.value?.TokenLiteral()).toBe("animal");
	});

	it("should return correct debug string from string() method", () => {
		const input = "PREMISE: IS(dog, animal);";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();

		// The string() method should return "dog animal"
		expect(ast.predicates.length).toBe(1);
		const label = ast.predicates[0] as LabelStatement;
		const logicalStatement = label.value as AtomicStatement;
		expect(logicalStatement.string()).toBe("dog animal");
		expect(logicalStatement.TokenLiteral()).toBe("IS");
		expect(logicalStatement.name?.TokenLiteral()).toBe("dog");
	});

	it("should return expression identifier", () => {
		const input = "identifier"; // arbitrary identifier
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();
		expect(ast.predicates.length).toBe(1);
		const node = ast.predicates[0];
		if ("value" in node && typeof node.value !== "undefined") {
			// It's a LabelStatement with a value
			expect(node.value).toBeDefined();
			expect((node.value as any)?.TokenLiteral()).toBe("identifier");
		} else {
			// It's a direct IdentifierStatement
			expect((node as any).TokenLiteral()).toBe("identifier");
		}
	});
});
