export enum TokenType {
	// LABEL
	PREMISE = "PREMISE",
	THEREFORE = "THEREFORE",

	// Logical operators
	ALL = "ALL",
	SOME = "SOME",
	NO = "NO",
	IS = "IS",
	IMPLIES = "IMPLIES",
	CAN = "CAN",

	// Structural elements
	LPAREN = "LPAREN",
	RPAREN = "RPAREN",
	COMMA = "COMMA",
	PERIOD = "PERIOD",
	COLON = "COLON",
	SEMICOLON = "SEMICOLON",

	// Quantifiers
	EXISTS = "EXISTS",
	FORALL = "FORALL",

	// Content identifiers
	IDENTIFIER = "IDENTIFIER",
	WHITESPACE = "WHITESPACE",
	EOF = "EOF",
}

export interface Token {
	Type: TokenType;
	Value?: string | null;
}
