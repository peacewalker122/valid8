import { Lexer } from "../lexer/lexer";
import type { Program } from "../parser/ast";
import { Parser } from "../parser/parser";
import { env, Environment } from "./environment";
import { Eval } from "./evaluator";

function setupTest(input: string): Program {
	const lexer = new Lexer(input);
	const parser = new Parser(lexer);
	const ast = parser.parseProgram();

	return ast;
}

const createNewENV = (): Environment => {
	return {
		source: new Map<string, string | undefined>(),
		variables: [],
		getValue: function (key: string): string | undefined {
			if (this.source.has(key)) {
				return this.source.get(key);
			}
			return undefined;
		},
		models: [],
	};
};

describe("Eval Test", () => {
	it("should eval the atomic expression", () => {
		const input = `PREMISE: IMPLIES(x, udin);
PREMISE: x;
THEREFORE: udin;`;
		const ast = setupTest(input);
		expect(ast.predicates.length).toBe(3);
		const environment = createNewENV();

		const result = Eval(ast, environment);

		expect(result).toBe(true);
	});

	it("should eval the compound expression", () => {
		const input = `PREMISE: IS(x, udin);
PREMISE: IS(y, udin);
THEREFORE: IS(x, y);`;

		const ast = setupTest(input);
		expect(ast.predicates.length).toBe(3);
		const environment = createNewENV();

		const result = Eval(ast, environment);
		expect(result).toBe(true);
	});

	it("should eval the negation expression", () => {
		const input = `PREMISE: IMPLIES(p,q);
    PREMISE: NOT(q);
    THEREFORE: NOT(p);`;

		const ast = setupTest(input);
		expect(ast.predicates.length).toBe(3);
		const environment = createNewENV();

		const result = Eval(ast, environment);
		expect(result).toBe(true);
	});
});
