import * as readline from "node:readline";
import { env } from "./evaluator/environment";
import { Eval } from "./evaluator/evaluator";
import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import { log } from "./util/log";

function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: "valid8> ",
	});

	let inputBuffer = "";

	rl.prompt();

	rl.on("line", (line) => {
		const trimmed = line.trim();
		if (trimmed === "exit" || trimmed === "quit") {
			rl.close();
			return;
		}

		// Accumulate the line
		inputBuffer += line + "\n";

		// Check if buffer contains THEREFORE
		if (inputBuffer.includes("THEREFORE")) {
			// Process the accumulated buffer
			const input = inputBuffer.trim();
			if (input === "") {
				console.log("No input to process.");
				rl.prompt();
				return;
			}

			try {
				// Note: env is persistent, not reset here
				const lexer = new Lexer(input);
				const parser = new Parser(lexer);
				const ast = parser.parseProgram();
				log.debug("Parsed AST:", ast);
				const result = Eval(ast, env);
				console.log("Validity:", result ? "Valid" : "Invalid");
			} catch (error) {
				console.error(
					"Error:",
					error instanceof Error ? error.message : String(error),
				);
			}

			inputBuffer = ""; // Reset buffer after processing
		}

		rl.prompt();
	});

	rl.on("close", () => {
		console.log("Goodbye!");
		process.exit(0);
	});
}

main();
