import type {
	AtomicStatement,
	CompoundStatement,
	ExpressionStatement,
	IdentifierStatement,
	LabelStatement,
	Program,
	Statement,
} from "../parser/ast";
import { TokenType } from "../types/token";
import { log } from "../util/log";
import { printTable } from "../util/table";
import type { Environment, Models } from "./environment";

// implies(a, b) mean if a is true, then b must be true.
// so the atomic statement or the variable is the name and the value within the variable.
// treat the current "atomic" as context later on.
//
// but we got clarity here:
// 1. the variable is the name of the subject within the statement.
// 2. the current "atomic" is the context of the statement.
//    e.g  IS(John, human) -> John is a human -> John is a variable, human is the value within the variable.
// 3. on the result we need to build the truth table for the conclusion. Check every single premise to see and verify the conclusion. Is it true for every input of the models.

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

					if (label.value === undefined) {
						throw new Error("THEREFORE Can't be empty");
					}

					return evalConclusion(label.value, env);
				}

				break;
			}
		}
	}

	return false;
};

const evalPremise = (node: Statement, env: Environment) => {
	// for each premise within the program, we need to store the boolean model of the premises into the environment.
	// the question left: how do we store the premise models into the enviroment?
	// key value? Not really, confused how to store the logic models here.
	// Linked list? Maybe, potentially. P -> P -> Q, we can build an model using linked list. but we still have to Evaluate the truth table using and confusing to traverse the linked list.
	//
	// to model the premise and store the variable...
	//
	// The goals is to find the solution for creating the truth table of the evalConclusion
	// by storing the variable while also storing the context preeceding the variable.

	switch (node.type) {
		case "CompoundStatement": {
			const compound = node as CompoundStatement;

			if (!compound.left || !compound.right) {
				throw new Error("CompoundStatement must have complete expression");
			}

			switch (compound.token.Type) {
				case TokenType.IMPLIES: {
					env.variables?.push(
						compound.left.TokenLiteral(),
						compound.right.TokenLiteral(),
					);

					let prevModels: Models;
					if ((env.models?.length ?? 0) > 0) {
						prevModels = env.models?.[env.models.length - 1] as Models;
					}

					env.models?.push({
						operator: TokenType.IMPLIES,
						left: compound.left.TokenLiteral(),
						right: compound.right.TokenLiteral(),
						toToken(): string {
							if (prevModels) {
								return `(${prevModels.toToken()}) ${operatorSymbol("AND")} ${this.right}`;
							}

							return `${this.left} ${operatorSymbol(this.operator)} ${this.right}`;
						},
					});
					break;
				}
			}

			break;
		}
		case "AtomicStatement": {
			const atomic = node as AtomicStatement;

			if (!atomic.name || !atomic.value) {
				throw new Error("AtomicStatement must have a name and value.");
			}

			switch (atomic.token.Type) {
				case TokenType.IS: {
					// Store the premise in the environment.
					env.source.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
				case TokenType.HAS: {
					// Store the premise in the environment.
					env.source.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
				case TokenType.CAN: {
					// Store the premise in the environment.
					env.source.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
				case TokenType.ARE: {
					// Store the premise in the environment.
					env.source.set(
						atomic.name?.TokenLiteral(),
						atomic.value?.TokenLiteral(),
					);
					break;
				}
			}

			break;
		}
		case "IdentifierStatement": {
			const expr = node as IdentifierStatement;
			if (!expr) {
				throw new Error("IdentifierStatement must have a value.");
			}

			// identifier must be exist if there's previous model difined first.
			if ((env.models?.length ?? 0) === 0) {
				throw new Error(
					"IdentifierStatement must be preceded by a model definition.",
				);
			}

			// append the models with OR operator.
			const lastModel = env.models?.[env.models.length - 1];
			if (lastModel) {
				env.models?.push({
					operator: TokenType.OR,
					left: lastModel.toToken(),
					right: expr.TokenLiteral(),
					toToken(): string {
						return `(${this.left}) ${operatorSymbol(this.operator)} ${this.right}`;
					},
				});
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

// STATE MACHINE
// 1. Parse the conclusion and build the models of the logic expression. using the same format as the premise, AND(a, b), OR(a, b), NOT(a), IMPLIES(a, b) and so on.
//    STATE are:
//    a. BUILD_STRUCTURE: here the headers and the models were created.
//    b. EVALUTE: here the models and conclusion were evaluated based on the variables.
//    c. BUILD_TRUTH_TABLE: here the truth table were built based on the variables, models and conclusion.
// 2. Evaluate the models based on the variables.
// 3. Evaluate the conclusion based on the models.
// 2. Build the truth table based on the variables and models.
const evalConclusion = (node: Statement, env: Environment): boolean => {
	let headers: string[] = [];
	let rows: boolean[] = [];
	let valid = true;

	switch (node.type) {
		case "IdentifierStatement": {
			const expr = node as IdentifierStatement;
			// append the headers and rows from the expression evaluation
			env.variables?.forEach((e) => {
				headers.push(e);
			});

			let lastModels: string = "";
			env.models?.forEach((el) => {
				headers.push(el.toToken());
				lastModels = el.toToken();
			});
			// finally the conclusion itself.
			const conclusion = `(${lastModels}) ∧ ${expr.TokenLiteral()}`;
			headers.push(conclusion);

			// evaluate the expression based on the input variables and models.
			const uniqueVariables = [...new Set(env.variables || [])];
			const n = uniqueVariables.length;
			const total = 1 << n;
			valid = true;

			for (let mask = 0; mask < total; mask++) {
				const assignment: Record<string, boolean> = {};
				for (let i = 0; i < n; i++) {
					assignment[uniqueVariables[i]] = Boolean((mask >> i) & 1);
				}

				const row: boolean[] = [];
				// add variable values
				uniqueVariables.forEach((v) => row.push(assignment[v]));

				// compute cumulative AND of models
				let cum = true;
				env.models?.forEach((model) => {
					const val = evaluateModel(model, assignment);
					cum = cum && val;
					row.push(cum);
				});

				// conclusion value: cum && conclusion
				const concName = expr.TokenLiteral();
				const concVal = cum && assignment[concName];
				row.push(concVal);

				// check validity
				if (cum && !concVal) {
					valid = false;
				}

				// add to rows
				rows.push(...row);
			}
		}
	}

	printTable(headers, rows);
	return valid;
};

// the variables aren't limited to 2, it could be > 2 no maximum variables for now.
// the combination are 2^n, where n is the sets from the variables
const evalExpression = (
	variables: string[],
	expr: (assignment: Record<string, boolean>) => boolean,
): boolean[] => {
	const n = variables.length;
	const total = 1 << n;
	const results: boolean[] = [];

	for (let mask = 0; mask < total; mask++) {
		const assignment: Record<string, boolean> = {};

		for (let i = 0; i < n; i++) {
			assignment[variables[i]] = Boolean((mask >> i) & 1);
		}

		results.push(expr(assignment));
	}

	return results;
};

const operatorSymbol = (operator: string): string => {
	switch (operator) {
		case TokenType.AND:
			return "∧";
		case TokenType.OR:
			return "∨";
		case TokenType.NOT:
			return "¬";
		case TokenType.IMPLIES:
			return "→";
	}

	return "?";
};

const evaluateModel = (
	model: Models,
	assignment: Record<string, boolean>,
): boolean => {
	const leftVal = assignment[model.left];
	const rightVal = assignment[model.right];
	switch (model.operator) {
		case TokenType.IMPLIES:
			return !leftVal || rightVal;
		case TokenType.AND:
			return leftVal && rightVal;
		case TokenType.OR:
			return leftVal || rightVal;
		default:
			throw new Error(`Unsupported operator: ${model.operator}`);
	}
};
