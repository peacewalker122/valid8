import { Lexer } from "../lexer/lexer";
import { TokenType } from "../types/token";
import { Identifier, type LogicalOperators } from "./ast";
import { Parser } from "./parser";

describe("Parser", () => {
	it("Should Parse Is Statement", () => {
		const input = `PREMISE: IS(dog, animal);
PREMISE: IS(cat,animal);
PREMISE: IS(fish,animal);`;

		// premise: is equal like let = in other programming language, the variable name is the first identifier within the logical_expr, value

		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const ast = parser.parseProgram();

		expect(ast.predicates.length).toBe(3);

		const expected = [
			{ name: "dog", value: "animal" },
			{ name: "cat", value: "animal" },
			{ name: "fish", value: "animal" },
		];
		ast.predicates.forEach((e, i) => {
			const logical = e as LogicalOperators;

			expect(logical.token.Type).toBe(TokenType.IS);
			expect(logical.name?.TokenLiteral()).toBe(expected[i].name);
			expect(logical.value?.length).toBe(1);

			const value = logical.value as NonNullable<typeof logical.value>;

			expect(value[0].TokenLiteral()).toBe(expected[i].value);
		});
	});
});
