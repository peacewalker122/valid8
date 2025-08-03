/**
 * 		IS: TokenGroup.ATOMIC,
		HAS: TokenGroup.ATOMIC,
		CAN: TokenGroup.ATOMIC,
		ARE: TokenGroup.ATOMIC,

 */
export interface Environment {
	isMap: Map<string, string | undefined>; // Store the environment variables from the parser.
	hasMap: Map<string, string | undefined>; // Store the hasMap variables from the parser.
	canMap: Map<string, string | undefined>; // Store the canMap variables from the parser.
	areMap: Map<string, string | undefined>; // Store the areMap variables from the parser.

	getValue(key: string): string | undefined;
}

export const env: Environment = {
	isMap: new Map<string, string | undefined>(), // Store the environment variables from the parser.
	hasMap: new Map<string, string | undefined>(), // Store the hasMap variables from the parser.
	canMap: new Map<string, string | undefined>(), // Store the canMap variables from the parser.
	areMap: new Map<string, string | undefined>(),
	getValue: function (key: string): string | undefined {
		if (this.isMap.has(key)) {
			return this.isMap.get(key);
		} else if (this.hasMap.has(key)) {
			return this.hasMap.get(key);
		} else if (this.canMap.has(key)) {
			return this.canMap.get(key);
		} else if (this.areMap.has(key)) {
			return this.areMap.get(key);
		}

		return undefined;
	},
};
