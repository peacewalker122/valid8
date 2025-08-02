import { Lexer } from "../lexer/lexer";
import type { Program } from "../parser/ast";
import { Parser } from "../parser/parser";
import { Eval } from "./evaluator";

function setupTest(input: string): Program {
	const lexer = new Lexer(input);
	const parser = new Parser(lexer);
	const ast = parser.parseProgram();

	return ast;
}

describe("Eval Test", () => {
	it("should eval the atomic expression", () => {
		const input = "IS(x, udin);";
		const ast = setupTest(input);
		const env = {
			map: new Map<string, string | undefined>(),
		};

		Eval(ast, env);

		// check the environment for the atomic statement
		expect(env.map.get("x")).toBe("udin");
	});
});
