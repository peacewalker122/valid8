import { Lexer } from "../lexer/lexer";
import { TokenType } from "../types/token";
import {
	ExpressionStatement,
	AtomicStatement,
	QuantifierStatement,
} from "./ast";
import { Parser } from "./parser";

describe("Parser", () => {
	it("should parse quantifier expressions", () => {
		const cases = [
			"PREMISE: FORALL(x, y);",
			"PREMISE: EXISTS(a, b);",
			"PREMISE: FORALL(z, t);",
		];
		const expecteds = [
			{ type: TokenType.FORALL, name: "x", value: "y" },
			{ type: TokenType.EXISTS, name: "a", value: "b" },
			{ type: TokenType.FORALL, name: "z", value: "t" },
		];
		cases.forEach((input, idx) => {
			const lexer = new Lexer(input);
			const parser = new Parser(lexer);
			expect(parser.error.length).toBe(0);
			const ast = parser.parseProgram();
			// expect(ast.predicates.length).toBe(1);

			const label = ast.predicates[0] as ExpressionStatement;
			expect(label.token.Type).toBe(TokenType.PREMISE);

			const quant = ast.predicates[1] as AtomicStatement | QuantifierStatement;

			expect(quant).toBeDefined();
			expect(quant.token.Type).toBe(expecteds[idx].type);
			expect(quant.name?.TokenLiteral()).toBe(expecteds[idx].name);
			expect(quant.value?.TokenLiteral()).toBe(expecteds[idx].value);
		});
	});

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
			const label = ast.predicates[i * 2] as ExpressionStatement;
			const logical = ast.predicates[i * 2 + 1] as AtomicStatement;
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
		const errors: string[] = [];
		statements.forEach((stmt) => {
			const lexer = new Lexer(stmt.endsWith(";") ? stmt : stmt + ";");
			const parser = new Parser(lexer);
			parser.parseProgram();
			errors.push(...parser.error);
		});
		expect(errors.length).toBeGreaterThan(0);
		console.log("Errors:", errors);
	});

	it("should return correct debug string from string() method", () => {
		const input = "PREMISE: IS(dog, animal);";
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();
		// The string() method should return "dog animal"
		expect(ast.predicates.length).toBe(2);
		const logicalStatement = ast.predicates[1] as AtomicStatement;
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
		const identifier = ast.predicates[0];
		expect(identifier.TokenLiteral()).toBe("identifier");
	});

	it("should parse multiple layer of quantifer, compound and atomic", () => {
		const input = `PREMISE: FORALL(x, y);`;

		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);
		const ast = parser.parseProgram();

		const expected_token = [
			{
				type: TokenType.PREMISE,
			},
			{
				type: TokenType.FORALL,
				name: "x",
				value: "y",
			},
			{
				type: TokenType.IS,
				name: "x",
				value: "cat",
			},
		];
		expect(ast.predicates.length).toBe(2);

		const first_token = ast.predicates[0] as ExpressionStatement;
		expect(first_token.token.Type).toBe(TokenType.PREMISE);

		const quantifier = ast.predicates[1] as QuantifierStatement;
		expect(quantifier.token.Type).toBe(TokenType.FORALL);
		expect(quantifier.name?.TokenLiteral()).toBe(expected_token[1].name);
		expect(quantifier.value?.TokenLiteral()).toBe(expected_token[1].value);

		// const logicalStatement = ast.predicates[2] as AtomicStatement;
		// expect(logicalStatement.token.Type).toBe(TokenType.IS);
		// expect(logicalStatement.name?.TokenLiteral()).toBe(expected_token[2].name);
		// expect(logicalStatement.value?.TokenLiteral()).toBe(
		// 	expected_token[2].value,
		// );
	});
});
