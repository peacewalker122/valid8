import { AtomicStatement, Program, Vertex } from "../parser/ast";
import { Environment } from "./environment";

type SpeakReturnType<T> = T extends { speak: (...args: any[]) => infer R }
	? R
	: never;

export const Eval = (ast: Program, env: Environment) => {
	// problem here, how do we know what type of the AST were dealing with?

	for (const predicate of ast.predicates) {
		switch (predicate.type) {
			case "AtomicStatement": {
				const atomic = predicate as AtomicStatement;

				if (!atomic.name || !atomic.value) {
					throw new Error("AtomicStatement must have a name and value.");
				}

				env.map.set(atomic.name?.TokenLiteral(), atomic.value?.TokenLiteral());
				break;
			}
			default:
				break;
		}
	}
};
