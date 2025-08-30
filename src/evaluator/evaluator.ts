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

					env.models?.push({
						operator: TokenType.IMPLIES,
						left: compound.left.TokenLiteral(),
						right: compound.right.TokenLiteral(),
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
	let result = false;
	let headers: string[] = [];
	let rows: boolean[] = [];

	console.debug("tipe node: ", node.type);
	switch (node.type) {
		case "IdentifierStatement": {
			const expr = node as IdentifierStatement;
			// append the headers and rows from the expression evaluation
			env.variables?.forEach((e) => {
				headers.push(e);
			});

			let lastModels: string = "";

			console.debug("model data: ", env.models);

			env.models?.forEach((el) => {
				if (headers.length === env.variables?.length) {
					const models = `${el.left} ${operatorSymbol(el.operator)} ${el.right}`;
					headers.push(models);
					lastModels = models;
				} else {
					const models = `${lastModels} ∧ ${el.left} ${operatorSymbol(el.operator)} ${el.right}`;
					headers.push(models);
					lastModels = models;
				}
			});
			// finally the conclusion itself.
			const conclusion = `${lastModels} ∧ ${expr.TokenLiteral()}`;
			headers.push(conclusion);

			// evaluate the expression based on the input variabls and models. Start with all true then all false.
			// tree? backtracking?
			//
			// eval into the conclusion then push the result iinto the rows.
			// Backtracing with various inputs. Now how?

			// 1. how to models the 2^n combinations of the variables.
			// 2. how to evaulaute the models based on the variables.
			// 3. how to evaulaute the conclusion based on the models.
			// 4. how to build the truth table based on the variables, models and conclusion
		}
	}

	console.log("headers: ", headers);
	printTable(headers, [true, true, true, true, true, true]);
	return result; // if no conclusion is reached, return false.
};

// to build the answer we need and
const evalExpression = (
	rows: [boolean][],
	left: boolean,
	right: boolean,
	models: string[],
	i: number,
): void => {
	//
	// backtracking
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
