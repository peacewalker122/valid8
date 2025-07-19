import { Lexer } from "./lexer";
import { TokenType } from "./type";

describe("Lexer", () => {
	it("should tokenize P:/C: labels", () => {
		const lexer = new Lexer("P:\nC:\n");
		expect(lexer.GetNextToken().Type).toBe(TokenType.Premise);
		expect(lexer.GetNextToken().Type).toBe(TokenType.NEWLINE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.Conclusion);
		expect(lexer.GetNextToken().Type).toBe(TokenType.NEWLINE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});

	it("should tokenize IF THEN NOT AND OR", () => {
		const lexer = new Lexer("P: IF THEN NOT AND OR");
		expect(lexer.GetNextToken().Type).toBe(TokenType.Premise);
		expect(lexer.GetNextToken().Type).toBe(TokenType.IF);
		expect(lexer.GetNextToken().Type).toBe(TokenType.THEN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.NOT);
		expect(lexer.GetNextToken().Type).toBe(TokenType.AND);
		expect(lexer.GetNextToken().Type).toBe(TokenType.OR);
	});

	it("should tokenize identifiers and comma", () => {
		const lexer = new Lexer("P: hello, world");
		expect(lexer.GetNextToken().Type).toBe(TokenType.Premise);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENT);
		expect(ident1.Value).toContain("HELLO");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENT);
		expect(ident2.Value).toContain("WORLD");
	});
});
