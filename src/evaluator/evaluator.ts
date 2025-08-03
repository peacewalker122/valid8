import type {
	AtomicStatement,
	LabelStatement,
	Program,
	Statement,
} from "../parser/ast";
import { TokenType } from "../types/token";
import { log } from "../util/log";
import type { Environment } from "./environment";

export const Eval = (ast: Program, env: Environment): boolean => {
	// problem here, how do we know what type of the AST were dealing with?

	for (const predicate of ast.predicates) {
		switch (predicate.type) {
			case "LabelStatement": {
				const label = predicate as LabelStatement;
				const literal = label.TokenLiteral();
				log.debug("Evaluating label:", {
					label: literal,
				});

				if (literal === TokenType.PREMISE) {
					// just a label, no inference happens here. skip to next.
					log.debug("Evaluating premise");
					evalPremise(label, env);
					break;
				}

				if (literal === TokenType.THEREFORE) {
					// inference happen here.
					// TODO: this is where we should evaluate the conclusion
					log.debug("Evaluating conclusion");
					return evalConclusion(label, env);
				}

				break;
			}
		}
	}

	return false;
};

const evalPremise = (node: Statement, env: Environment) => {
	switch (node.type) {
		case "AtomicStatement": {
			const atomic = node as AtomicStatement;

			if (!atomic.name || !atomic.value) {
				throw new Error("AtomicStatement must have a name and value.");
			}

			// Store the premise in the environment.
			env.map.set(atomic.name?.TokenLiteral(), atomic.value?.TokenLiteral());
			break;
		}
		case "LabelStatement": {
			const label = node as LabelStatement;

			if (!label.value) {
				throw new Error("LabelStatement must have a value.");
			}

			return evalPremise(label.value, env);
		}
	}
};

const evalConclusion = (node: Statement, env: Environment): boolean => {
	switch (node.type) {
		// TODO: adjust.
		case "AtomicStatement": {
			const atomic = node as AtomicStatement;
			// TODO: implement distinct function handling for premise and conclusion

			if (!atomic.name || !atomic.value) {
				throw new Error("AtomicStatement must have a name and value.");
			}

			// check is the value inside the statement are correct in the environment.
			const value = env.map.get(atomic.name?.TokenLiteral());
			log.debug("Evaluating conclusion for atomic statement:", {
				name: atomic.name?.TokenLiteral(),
				value: atomic.value?.TokenLiteral(),
				envValue: value,
			});
			if (value === atomic.value?.TokenLiteral()) {
				return true; // conclusion is valid.
			} else {
				return false; // conclusion is invalid.
			}
		}
		case "LabelStatement": {
			const label = node as LabelStatement;

			if (!label.value) {
				throw new Error("LabelStatement must have a value.");
			}

			return evalConclusion(label.value, env);
		}
	}
	return false; // if no conclusion is reached, return false.
};
