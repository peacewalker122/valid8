import { Statement } from "../parser/ast";

/**
 * 		IS: TokenGroup.ATOMIC,
		HAS: TokenGroup.ATOMIC,
		CAN: TokenGroup.ATOMIC,
		ARE: TokenGroup.ATOMIC,

 */
export interface Environment {
	source: Map<string, string | undefined>;

	// to store all variable name
	variables: string[];

	// to store the premise models
	models: Models[];

	getValue(key: string): string | undefined;
}

// So, when there's an expression like AND between we could use the CompoundStatement for that while also ensuring the stmt contains either AtomicStatement or CompoundStatement
// And by that we could recurisvely evaluate the statement
//
// Models here act as an absctraction layer for the Statement interface
export interface Models {
	stmt: Statement;

	// to store the evalution result of the model
	result?: boolean | undefined;

	toToken(): string;
}

export const env: Environment = {
	source: new Map<string, string | undefined>(),
	variables: [],
	getValue: function (key: string): string | undefined {
		if (this.source.has(key)) {
			return this.source.get(key);
		}

		return undefined;
	},
	models: [],
};
