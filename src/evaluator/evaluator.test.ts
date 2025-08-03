import { Lexer } from "../lexer/lexer";
import type { Program } from "../parser/ast";
import { Parser } from "../parser/parser";
import { log } from "../util/log";
import { env } from "./environment";
import { Eval } from "./evaluator";

function setupTest(input: string): Program {
	const lexer = new Lexer(input);
	const parser = new Parser(lexer);
	const ast = parser.parseProgram();

	return ast;
}

describe("Eval Test", () => {
	it("should eval the atomic expression", () => {
		const input = `PREMISE: IS(x, udin);
THEREFORE: IS(x, udin);`;
		const ast = setupTest(input);
		log.debug("AST:", ast);
		expect(ast.predicates.length).toBe(2);
		const environment = env;

		const result = Eval(ast, environment);

		// check the environment for the atomic statement
		expect(env.isMap.get("x")).toBe("udin");
		expect(result).toBe(true);
	});

	it("should eval the compound expression", () => {
		const input = `PREMISE: IS(x, udin);
PREMISE: IS(y, udin);
THEREFORE: IS(x, y);`;

		const ast = setupTest(input);
		expect(ast.predicates.length).toBe(3);
		const environment = env;

		const result = Eval(ast, environment);
		expect(result).toBe(true);
	});
});
