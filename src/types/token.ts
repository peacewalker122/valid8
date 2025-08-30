// This file defines the TokenType enum and the Token interface used in the logical reasoning system.
// Genrally, tokens represent the various components of logical statements, such as premises, conclusions, operators, and identifiers.
export enum TokenType {
	// LABEL
	PREMISE = "PREMISE",
	THEREFORE = "THEREFORE",

	// Logical operators
	ALL = "ALL",
	SOME = "SOME",
	NOT = "NO",
	IS = "IS",
	IMPLIES = "IMPLIES",
	CAN = "CAN",
	AND = "AND",
	HAS = "HAS",
	ARE = "ARE",
	OR = "OR",

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
	Literal?: string | null;
	Line?: number;
	Column?: number;
}
