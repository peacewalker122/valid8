import type { Statement } from "../parser/ast";

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export enum Expression {
	LOWEST,
	CALL,
}

export type prefixParsefn = () => Statement | undefined;
export type infixParsefn = (left: Statement) => Statement | undefined;
