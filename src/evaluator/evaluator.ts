import type {
	AtomicStatement,
	CompoundStatement,
	LabelStatement,
	Program,
	QuantifierStatement,
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
					log.debug("Evaluating premise");
					evalPremise(label, env);
					break;
				}

				if (literal === TokenType.THEREFORE) {
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

			switch (atomic.token.Type) {
				case TokenType.IS: {
					// Store the premise in the environment.
					env.isMap.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
				case TokenType.HAS: {
					// Store the premise in the environment.
					env.hasMap.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
				case TokenType.CAN: {
					// Store the premise in the environment.
					env.canMap.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
				case TokenType.ARE: {
					// Store the premise in the environment.
					env.areMap.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
			}

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
		case "AtomicStatement": {
			const atomic = node as AtomicStatement;
			if (!atomic.name || !atomic.value) {
				throw new Error("AtomicStatement must have a name and value.");
			}

			switch (atomic.token.Type) {
				case TokenType.IS: {
					// check is the value inside the statement are correct in the environment.
					const value = env.isMap.get(atomic.name?.TokenLiteral());
					log.debug("Evaluating conclusion for atomic statement:", {
						name: atomic.name?.TokenLiteral(),
						value: atomic.value?.TokenLiteral(),
						envValue: value,
					});
					let valueToCheck = atomic.value?.TokenLiteral();

					// check is the value inside the statement are exist in the environment too.
					const valueKey = env.getValue(atomic.value.TokenLiteral());
					if (valueKey) {
						valueToCheck = valueKey;
					}

					log.debug("Value to check:", {
						value,
						valueToCheck,
					});

					return value === valueToCheck;
				}
				case TokenType.HAS: {
					// check is the value inside the statement are correct in the environment.
					const value = env.hasMap.get(atomic.name?.TokenLiteral());
					log.debug("Evaluating conclusion for atomic statement:", {
						name: atomic.name?.TokenLiteral(),
						value: atomic.value?.TokenLiteral(),
						envValue: value,
					});

					return value === atomic.value?.TokenLiteral();
				}
				case TokenType.CAN: {
					// check is the value inside the statement are correct in the environment.
					const value = env.canMap.get(atomic.name?.TokenLiteral());
					log.debug("Evaluating conclusion for atomic statement:", {
						name: atomic.name?.TokenLiteral(),
						value: atomic.value?.TokenLiteral(),
						envValue: value,
					});

					return value === atomic.value?.TokenLiteral();
				}
				case TokenType.ARE: {
					// check is the value inside the statement are correct in the environment.
					const value = env.areMap.get(atomic.name?.TokenLiteral());
					log.debug("Evaluating conclusion for atomic statement:", {
						name: atomic.name?.TokenLiteral(),
						value: atomic.value?.TokenLiteral(),
						envValue: value,
					});

					return value === atomic.value?.TokenLiteral();
				}
			}

			break;
		}
		case "LabelStatement": {
			const label = node as LabelStatement;

			if (!label.value) {
				throw new Error("LabelStatement must have a value.");
			}

			return evalConclusion(label.value, env);
		}
		case "QuantifierStatement": {
			const quantifier = node as QuantifierStatement;

			if (!quantifier.value) {
				throw new Error("QuantifierStatement must have a value.");
			}

			// Evaluate the value inside the quantifier.
			return evalConclusion(quantifier.value, env);
		}
		case "CompoundStatement": {
			const compound = node as CompoundStatement;
			if (!compound.left || !compound.right) {
				throw new Error(
					"CompoundStatement must have left and right statements.",
				);
			}

			const leftEval = evalConclusion(compound.left, env);
			const rightEval = evalConclusion(compound.right, env);

			switch (compound.token.Type) {
				case TokenType.AND: {
					return leftEval && rightEval; // Both conditions must be true.
				}
				case TokenType.OR: {
					return leftEval || rightEval; // At least one condition must be true.
				}
				case TokenType.IMPLIES: {
					return !leftEval || rightEval; // If left is true, right must be true.
				}
			}
		}
	}
	return false; // if no conclusion is reached, return false.
};
