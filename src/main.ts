import * as fs from "node:fs";
import * as readline from "node:readline";
import { env } from "./evaluator/environment";
import { Eval } from "./evaluator/evaluator";
import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import { log } from "./util/log";

function processInput(input: string) {
	try {
		log.debug("Main: Starting input processing");
		const lexer = new Lexer(input);
		const parser = new Parser(lexer);
		const ast = parser.parseProgram();
		log.debug("Main: Parsed AST:", ast);
		const result = Eval(ast, env);
		log.debug(`Main: Evaluation result: ${result}`);
		const color = result ? "\x1b[92m" : "\x1b[91m";
		const reset = "\x1b[0m";
		console.log("Validity:", color + (result ? "Valid" : "Invalid") + reset);
	} catch (error) {
		log.error(
			"Main: Error processing input:",
			error instanceof Error ? error.message : String(error),
		);
		console.error(
			"Error:",
			error instanceof Error ? error.message : String(error),
		);
	}
}

function main() {
	const filePath = process.argv[2];
	if (filePath) {
		try {
			const input = fs.readFileSync(filePath, "utf-8");
			processInput(input);
		} catch (error) {
			console.error(
				"Error reading file:",
				error instanceof Error ? error.message : String(error),
			);
		}
		process.exit(0);
	}

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

			processInput(input);
			inputBuffer = ""; // Reset buffer after processing
		}

		rl.prompt();
	});

	rl.on("close", () => {
		process.exit(0);
	});
}

main();
