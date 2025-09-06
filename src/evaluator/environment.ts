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

export interface Models {
	operator: string;
	left: string | Models;
	right: string;

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
