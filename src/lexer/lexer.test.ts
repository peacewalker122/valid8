import { TokenType } from "../types/token";
import { Lexer } from "./lexer";

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
		expect(ident1.Literal).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Literal).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});

	it("should tokenize complex PREMISE: SOME(cat, EXISTS(animal, dog));", () => {
		const lexer = new Lexer("PREMISE: FORALL(cat, EXISTS(animal, dog));");
		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.FORALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Literal).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EXISTS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Literal).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident3 = lexer.GetNextToken();
		expect(ident3.Type).toBe(TokenType.IDENTIFIER);
		expect(ident3.Literal).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});

	it("should tokenize long and complex", () => {
		const txt = `PREMISE: ALL(cat, animal);
    PREMISE: SOME(cat, EXISTS(animal, dog));
    PREMISE: FORALL(cat, dog);
    THEREFORE: IS(cat, dog);`;

		const lexer = new Lexer(txt);
		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.ALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Literal).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Literal).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);

		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SOME);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident3 = lexer.GetNextToken();
		expect(ident3.Type).toBe(TokenType.IDENTIFIER);
		expect(ident3.Literal).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EXISTS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident4 = lexer.GetNextToken();
		expect(ident4.Type).toBe(TokenType.IDENTIFIER);
		expect(ident4.Literal).toBe("animal");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident5 = lexer.GetNextToken();
		expect(ident5.Type).toBe(TokenType.IDENTIFIER);
		expect(ident5.Literal).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);

		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.FORALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident6 = lexer.GetNextToken();
		expect(ident6.Type).toBe(TokenType.IDENTIFIER);
		expect(ident6.Literal).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident7 = lexer.GetNextToken();
		expect(ident7.Type).toBe(TokenType.IDENTIFIER);
		expect(ident7.Literal).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);

		expect(lexer.GetNextToken().Type).toBe(TokenType.THEREFORE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.IS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident8 = lexer.GetNextToken();
		expect(ident8.Type).toBe(TokenType.IDENTIFIER);
		expect(ident8.Literal).toBe("cat");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident9 = lexer.GetNextToken();
		expect(ident9.Type).toBe(TokenType.IDENTIFIER);
		expect(ident9.Literal).toBe("dog");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});

	it("should tokenize logical expression without quantifiers", () => {
		const lexer = new Lexer("IS(cat, animal);");
		expect(lexer.GetNextToken().Type).toBe(TokenType.IS);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);

		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Literal).toBe("cat");

		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);

		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Literal).toBe("animal");

		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});

	it("should tokenize identifiers", () => {
		const lexer = new Lexer("PREMISE: FORALL(x,y);");
		expect(lexer.GetNextToken().Type).toBe(TokenType.PREMISE);
		expect(lexer.GetNextToken().Type).toBe(TokenType.COLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.FORALL);
		expect(lexer.GetNextToken().Type).toBe(TokenType.LPAREN);
		const ident1 = lexer.GetNextToken();
		expect(ident1.Type).toBe(TokenType.IDENTIFIER);
		expect(ident1.Literal).toBe("x");
		expect(lexer.GetNextToken().Type).toBe(TokenType.COMMA);
		const ident2 = lexer.GetNextToken();
		expect(ident2.Type).toBe(TokenType.IDENTIFIER);
		expect(ident2.Literal).toBe("y");
		expect(lexer.GetNextToken().Type).toBe(TokenType.RPAREN);
		expect(lexer.GetNextToken().Type).toBe(TokenType.SEMICOLON);
		expect(lexer.GetNextToken().Type).toBe(TokenType.EOF);
	});
});
