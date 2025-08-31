import * as readline from 'readline';
import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { Eval } from './evaluator/evaluator';
import { env } from './evaluator/environment';
import { log } from './util/log';

function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'valid8> '
    });

    rl.prompt();

    rl.on('line', (line) => {
        const input = line.trim();
        if (input === 'exit' || input === 'quit') {
            rl.close();
            return;
        }

        if (input === '') {
            rl.prompt();
            return;
        }

        try {
            // Reset environment for each input
            env.variables = [];
            env.models = [];
            env.source.clear();

            const lexer = new Lexer(input);
            const parser = new Parser(lexer);
            const ast = parser.parseProgram();
            log.debug('Parsed AST:', ast);
            const result = Eval(ast, env);
            console.log('Validity:', result ? 'Valid' : 'Invalid');
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : String(error));
        }

        rl.prompt();
    });

    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });
}

main();