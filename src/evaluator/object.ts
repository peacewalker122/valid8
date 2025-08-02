import { TokenType } from "../types/token";

export interface Object<T> {
	type: TokenType;
	value: T;
	Inspect(): string; // returns a string representation of the object
}

export const identifier = {
	type: TokenType.IDENTIFIER,
	value: "",
	Inspect(): string {
		return this.value;
	},
};
