import { Lexer } from "../lexer/lexer";
import { TokenType } from "../types/token";
import type {
	AtomicStatement,
	QuantifierStatement,
	CompoundStatement,
	LabelStatement,
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

			const label = ast.predicates[0] as LabelStatement;
			expect(label.token.Type).toBe(TokenType.PREMISE);

			const quant = label.value as QuantifierStatement;

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
		});
		expect(errorCount).toBeGreaterThan(0);
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

	it("should parse multiple layer of quantifer, compound and atomic", () => {
		const input = `PREMISE: FORALL(x, IS(x, cat));`;

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
				value: "IS",
			},
			{
				type: TokenType.IS,
				name: "x",
				value: "cat",
			},
		];
		// expect(ast.predicates.length).toBe(3);

		const label = ast.predicates[0] as LabelStatement;
		expect(label.token.Type).toBe(TokenType.PREMISE);

		const quantifier = label.value as QuantifierStatement;
		expect(quantifier.token.Type).toBe(expected_token[1].type);
		expect(quantifier.name?.TokenLiteral()).toBe(expected_token[1].name);

		// check what inside that quantifier
		const logicalStatement = quantifier.value as AtomicStatement;
		expect(logicalStatement.token.Type).toBe(expected_token[2].type);
		expect(logicalStatement.name?.TokenLiteral()).toBe(expected_token[2].name);
		expect(logicalStatement.value?.TokenLiteral()).toBe(
			expected_token[2].value,
		);
	});

	it("should parse complex logical expressions", () => {
		const input = `PREMISE: FORALL(x, AND(IS(x, cat), IS(x, black)));`;
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();

		const label = ast.predicates[0] as LabelStatement;
		expect(label.token.Type).toBe(TokenType.PREMISE);

		const quantifier = label.value as QuantifierStatement;
		expect(quantifier.token.Type).toBe(TokenType.FORALL);
		expect(quantifier.name?.TokenLiteral()).toBe("x");

		const logicalStatement = quantifier.value as CompoundStatement;
		expect(logicalStatement.token.Type).toBe(TokenType.AND);

		const firstCondition = logicalStatement.left as AtomicStatement;
		expect(firstCondition.token.Type).toBe(TokenType.IS);
		expect(firstCondition.name?.TokenLiteral()).toBe("x");
		expect(firstCondition.value?.TokenLiteral()).toBe("cat");

		const secondCondition = logicalStatement.right as AtomicStatement;
		expect(secondCondition).toBeDefined();
		expect(secondCondition.token.Type).toBe(TokenType.IS);
		expect(secondCondition.name?.TokenLiteral()).toBe("x");
		expect(secondCondition.value?.TokenLiteral()).toBe("black");
	});

	it("should parse complete logical expression with therefore", () => {
		const input = `PREMISE: FORALL(x, AND(IS(x, cat), IS(x, black)));
THEREFORE: EXISTS(y, IS(y, dog));`;

		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		expect(parser.error.length).toBe(0);

		const ast = parser.parseProgram();

		expect(ast.predicates.length).toBe(2);

		// Check the premise
		const premiseLabel = ast.predicates[0] as LabelStatement;
		expect(premiseLabel.token.Type).toBe(TokenType.PREMISE);

		const premiseQuantifier = premiseLabel.value as QuantifierStatement;
		expect(premiseQuantifier.token.Type).toBe(TokenType.FORALL);
		expect(premiseQuantifier.name?.TokenLiteral()).toBe("x");

		const premiseLogicalStatement =
			premiseQuantifier.value as CompoundStatement;
		expect(premiseLogicalStatement.token.Type).toBe(TokenType.AND);

		const firstPremiseCondition =
			premiseLogicalStatement.left as AtomicStatement;
		expect(firstPremiseCondition.token.Type).toBe(TokenType.IS);
		expect(firstPremiseCondition.name?.TokenLiteral()).toBe("x");
		expect(firstPremiseCondition.value?.TokenLiteral()).toBe("cat");

		const secondPremiseCondition =
			premiseLogicalStatement.right as AtomicStatement;
		expect(secondPremiseCondition.token.Type).toBe(TokenType.IS);
		expect(secondPremiseCondition.name?.TokenLiteral()).toBe("x");
		expect(secondPremiseCondition.value?.TokenLiteral()).toBe("black");

		// Check the conclusion
		const conclusionLabel = ast.predicates[1] as LabelStatement;
		expect(conclusionLabel.token.Type).toBe(TokenType.THEREFORE);

		const conclusionQuantifier = conclusionLabel.value as QuantifierStatement;
		expect(conclusionQuantifier.token.Type).toBe(TokenType.EXISTS);
		expect(conclusionQuantifier.name?.TokenLiteral()).toBe("y");

		const conclusionLogicalStatement =
			conclusionQuantifier.value as AtomicStatement;
		expect(conclusionLogicalStatement.token.Type).toBe(TokenType.IS);
		expect(conclusionLogicalStatement.name?.TokenLiteral()).toBe("y");
		expect(conclusionLogicalStatement.value?.TokenLiteral()).toBe("dog");
	});
});
