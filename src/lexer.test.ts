import { Lexer } from "./lexer";
import { TokenType } from "./type";

describe("Lexer", () => {
	it("should tokenize symbols ((),.:;)", () => {
		const lexer = new Lexer("((),.:;)");
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		expect(lexer.GetNextToken().Type).toBe(TokenType.PERIOD);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});

	it("should tokenize PREMISE: ALL(cat, animal);", () => {
		const lexer = new Lexer("PREMISE: ALL(cat, animal);");
		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.ALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Value).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Value).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
	});

	it("should tokenize complex PREMISE: SOME(cat, EXISTS(animal, dog));", () => {
		const lexer = new Lexer("PREMISE: FORALL(cat, EXISTS(animal, dog));");
		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.FORALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Value).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EXISTS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Value).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident3 = lexer.GetNextToken();
		expect(ident3.Type).toBe(TokenType.IDENTIFIER);
		expect(ident3.Value).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
	});

	it("should tokenize long and complex", () => {
		const txt = `PREMISE: ALL(cat, animal);
    PREMISE: SOME(cat, EXISTS(animal, dog));
    PREMISE: NO(cat, dog);
    THEREFORE: IS(cat, dog);`;

		const lexer = new Lexer(txt);
		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.ALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Value).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Value).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);

		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SOME);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident3 = lexer.GetNextToken();
		expect(ident3.Type).toBe(TokenType.IDENTIFIER);
		expect(ident3.Value).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EXISTS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident4 = lexer.GetNextToken();
		expect(ident4.Type).toBe(TokenType.IDENTIFIER);
		expect(ident4.Value).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident5 = lexer.GetNextToken();
		expect(ident5.Type).toBe(TokenType.IDENTIFIER);
		expect(ident5.Value).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);

		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.NO);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident6 = lexer.GetNextToken();
		expect(ident6.Type).toBe(TokenType.IDENTIFIER);
		expect(ident6.Value).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident7 = lexer.GetNextToken();
		expect(ident7.Type).toBe(TokenType.IDENTIFIER);
		expect(ident7.Value).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);

		expect(lexer.GetNextToken().Type).toBe(TokenType.THEREFORE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.IS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident8 = lexer.GetNextToken();
		expect(ident8.Type).toBe(TokenType.IDENTIFIER);
		expect(ident8.Value).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident9 = lexer.GetNextToken();
		expect(ident9.Type).toBe(TokenType.IDENTIFIER);
		expect(ident9.Value).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
	});
});
