import * as ast from "../parser/ast";
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

export const Eval = (ast: ast.Program, env: Environment): boolean => {
	log.debug(
		`Evaluator: Starting evaluation of ${ast.predicates.length} predicates`,
	);
	// problem here, how do we know what type of the AST were dealing with?
	for (const predicate of ast.predicates) {
		switch (predicate.type) {
			case "LabelStatement": {
				const label = predicate as ast.LabelStatement;
				const literal = label.TokenLiteral();
				log.debug("Evaluator: Evaluating label:", {
					label: literal,
				});

				if (literal === TokenType.PREMISE) {
					log.debug("Evaluator: Evaluating premise");
					evalPremise(label, env);
					break;
				}

				if (literal === TokenType.THEREFORE) {
					log.debug("Evaluator: Evaluating conclusion");

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

const evalPremise = (node: ast.Statement, env: Environment) => {
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
			const compound = node as ast.CompoundStatement;

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
						stmt: compound,
						toToken(): string {
							if (prevModels) {
								return `(${prevModels.toToken()}) ∧ ${compound.right?.TokenLiteral()}`;
							}

							return `${compound.left?.TokenLiteral()} → ${compound.right?.TokenLiteral()}`;
						},
					});
					break;
				}
			}

			break;
		}
		case "AtomicStatement": {
			const atomic = node as ast.AtomicStatement;

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
			const expr = node as ast.IdentifierStatement;
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
				const compound = new ast.CompoundStatement({
					Type: TokenType.AND,
					Literal: "∧",
				});
				compound.left = lastModel.stmt;
				compound.right = expr;
				env.models?.push({
					stmt: compound,
					toToken(): string {
						return `(${lastModel.toToken()}) ∧ ${expr.TokenLiteral()}`;
					},
				});
			}

			break;
		}
		case "NegationStatement": {
			const negation = node as ast.NegationStatement;
			if (!negation.value) {
				throw new Error("NegationStatement must have a value.");
			}

			// negation must be exist if there's previous model difined first.
			if ((env.models?.length ?? 0) === 0) {
				throw new Error(
					"NegationStatement must be preceded by a model definition.",
				);
			}

			// append the models with NOT operator.
			const lastModel = env.models?.[env.models.length - 1];
			if (lastModel) {
				const compound = new ast.CompoundStatement({
					Type: TokenType.AND,
					Literal: "∧",
				});
				compound.left = lastModel.stmt;
				compound.right = negation;
				env.models?.push({
					stmt: compound,
					toToken: (): string => {
						return `(${lastModel.toToken()}) ∧ ¬${negation.value?.TokenLiteral()}`;
					},
				});
			}

			break;
		}
		case "LabelStatement": {
			const label = node as ast.LabelStatement;

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
const evalConclusion = (node: ast.Statement, env: Environment): boolean => {
	let headers: string[] = [];
	let rows: boolean[] = [];
	let valid = true;

	switch (node.type) {
		case "IdentifierStatement": {
			const expr = node as ast.IdentifierStatement;

			// append the headers and rows from the expression evaluation
			env.variables?.forEach((e) => {
				headers.push(e);
			});
			env.models?.forEach((el) => {
				headers.push(el.toToken());
			});

			// finally the conclusion itself.
			const lastModels = env.models?.[env.models.length - 1] as Models;
			const conclusion = `(${lastModels.toToken()}) ${OPERATOR_SYMBOLS[TokenType.IMPLIES]} ${expr.TokenLiteral()}`;
			headers.push(conclusion);
			const compound = new ast.CompoundStatement({
				Type: TokenType.IMPLIES,
				Literal: "→",
			});
			compound.left = lastModels.stmt;
			compound.right = expr;
			env.models.push({
				stmt: compound,
				toToken: (): string => conclusion,
			});

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
				uniqueVariables.forEach((v) => {
					row.push(assignment[v]);
				});

				// compute cumulative AND of models
				env.models?.forEach((model) => {
					const val = evaluateModel(model, assignment);
					row.push(val);
				});

				// we only need to care about the last model which is the conclusion.
				const lastModelValue = env.models?.[env.models.length - 1]?.result;
				valid = valid && lastModelValue === true;

				// add to rows
				rows.push(...row);
				// reset model results
				env.models?.forEach((model) => {
					model.result = undefined;
				});
			}

			break;
		}

		case "NegationStatement": {
			const expr = node as ast.NegationStatement;

			// append the headers and rows from the expression evaluation
			env.variables?.forEach((e) => {
				headers.push(e);
			});
			env.models?.forEach((el) => {
				headers.push(el.toToken());
			});

			// finally the conclusion itself.
			const lastModels = env.models?.[env.models.length - 1] as Models;
			const conclusion = `(${lastModels.toToken()}) ${OPERATOR_SYMBOLS[TokenType.IMPLIES]} ${OPERATOR_SYMBOLS[TokenType.NOT]}${expr.value?.TokenLiteral()}`;
			headers.push(conclusion);
			const compound = new ast.CompoundStatement({
				Type: TokenType.IMPLIES,
				Literal: "→",
			});
			compound.left = lastModels.stmt;
			compound.right = expr;
			env.models.push({
				stmt: compound,
				toToken: (): string => conclusion,
			});

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
				uniqueVariables.forEach((v) => {
					row.push(assignment[v]);
				});

				// compute cumulative AND of models
				env.models?.forEach((model) => {
					const val = evaluateModel(model, assignment);
					row.push(val);
				});

				// we only need to care about the last model which is the conclusion.
				const lastModelValue = env.models?.[env.models.length - 1]?.result;
				valid = valid && lastModelValue === true;

				// add to rows
				rows.push(...row);
				// reset model results
				env.models?.forEach((model) => {
					model.result = undefined;
				});
			}
		}
	}

	printTable(headers, rows);
	log.debug(`Evaluator: Evaluation completed, result: ${valid}`);
	return valid;
};

const OPERATOR_SYMBOLS: Record<string, string> = {
	[TokenType.AND]: "∧",
	[TokenType.OR]: "∨",
	[TokenType.NOT]: "¬",
	[TokenType.IMPLIES]: "→",
};

const evaluateStatement = (
	stmt: ast.Statement,
	assignment: Record<string, boolean>,
): boolean => {
	switch (stmt.type) {
		case "CompoundStatement": {
			const compound = stmt as ast.CompoundStatement;
			if (!compound.left || !compound.right) {
				throw new Error("CompoundStatement must have left and right");
			}
			const leftVal = evaluateStatement(compound.left, assignment);
			const rightVal = evaluateStatement(compound.right, assignment);
			switch (compound.token.Type) {
				case TokenType.IMPLIES:
					return !leftVal || rightVal;
				case TokenType.AND:
					return leftVal && rightVal;
				case TokenType.OR:
					return leftVal || rightVal;
				default:
					throw new Error(`Unsupported operator: ${compound.token.Type}`);
			}
		}
		case "IdentifierStatement": {
			const ident = stmt as ast.IdentifierStatement;
			return assignment[ident.TokenLiteral()];
		}
		case "NegationStatement": {
			const neg = stmt as ast.NegationStatement;
			if (!neg.value) {
				throw new Error("NegationStatement must have value");
			}

			return !evaluateStatement(neg.value, assignment);
		}
		case "AtomicStatement":
			// For now, assume atomic is true, but may need to handle differently
			return true;
		case "LabelStatement": {
			const label = stmt as ast.LabelStatement;
			if (!label.value) {
				throw new Error("LabelStatement must have value");
			}
			return evaluateStatement(label.value, assignment);
		}
		default:
			throw new Error(`Unsupported statement type: ${stmt.type}`);
	}
};

const evaluateModel = (
	model: Models,
	assignment: Record<string, boolean>,
): boolean => {
	if (model.result !== undefined) {
		return model.result;
	}

	model.result = evaluateStatement(model.stmt, assignment);

	return model.result;
};
