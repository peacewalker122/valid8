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

		// Reset the environment after evaluation
		env.source.clear();
		env.variables = [];
		env.models = [];
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
	// Check for help flag
	if (process.argv.includes('-h') || process.argv.includes('--help')) {
		console.log(`Valid8 - Logical Argument Validator

Usage:
  valid8 [options] [file]

Options:
  -h, --help     Show this help message
  -v             Enable verbose logging
  --version      Show version

Examples:
  valid8                        # Interactive mode
  valid8 assets/modus_ponens.txt # Validate file
  valid8 -v assets/modus_ponens.txt # Verbose output
  valid8 --help                 # Show help

Environment:
  VALID8_DEBUG=1  Enable debug logging (same as -v)

For more info, see README.md`);
		process.exit(0);
	}

	// Check for -v flag
	if (process.argv.includes('-v')) {
		process.env.VALID8_VERBOSE = '1';
		process.argv.splice(process.argv.indexOf('-v'), 1);
	}

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
