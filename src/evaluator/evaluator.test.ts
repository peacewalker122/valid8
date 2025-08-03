import { Lexer } from "../lexer/lexer";
import type { Program } from "../parser/ast";
import { Parser } from "../parser/parser";
import { log } from "../util/log";
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
		const env = {
			map: new Map<string, string | undefined>(),
		};

		const result = Eval(ast, env);

		// check the environment for the atomic statement
		expect(env.map.get("x")).toBe("udin");
		expect(result).toBe(true);
	});
});
