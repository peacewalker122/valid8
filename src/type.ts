export enum TokenType {
	Premise = "PREMISE",
	Conclusion = "CONCLUSION",
	IF = "IF",
	THEN = "THEN",
	NOT = "NOT",
	AND = "AND",
	NEWLINE = "\n",
	COMMA = "COMMA",
	EOF = "EOF",
	IDENT = "IDENT",
	OR = "OR",
}

export interface Token {
	Type: TokenType;
	Value?: string | null;
}
