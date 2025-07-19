# AGENTS.md — Valid8 Project Handover

## 1. Project Purpose
Valid8 is a TypeScript-based toolkit for parsing and verifying mathematical logic notation, specifically supporting logical arguments in the form of premises and conclusions (P:/C: format). The core is a custom lexer and tokenization engine, designed to serve future development of parsing, logical verification, and user interfaces for teaching or validating logical reasoning.

## 2. Architecture Overview
- **Lexer (`src/lexer.ts`)**: Implements a stateful tokenization engine using a state machine. Recognizes labels (Premise/Conclusion), logical keywords (IF, THEN, NOT, AND, OR), identifiers, and punctuation. Designed to support context-aware lexing (e.g., distinguishing 'if' as a keyword vs identifier).
- **Token Types (`src/type.ts`)**: Enums and interfaces defining the types of tokens recognized (Premise, Conclusion, logical keywords, identifier, punctuation, etc.).
- **Utility (`src/util.ts`)**: Includes the `isLetter` function (character checks) and a custom `log` object for debug/info/error output, toggled via the `VALID8_DEBUG` environment variable.
- **Tests (`src/lexer.test.ts`)**: Jest-based unit tests focused on edge-case tokenization and label/keyword recognition.
- **Configuration**: TypeScript config is in `tsconfig.json`. All scripts run in CommonJS mode. Tests are managed via `jest` and `ts-jest`.
- **Documentation/Meta**: See Architecture.md for a high-level overview. OpenCode.md contains agentic guidelines (internal, not user-facing).
- **Roadmap/TODO**: See `todo.html` for a visual breakdown of current and future development phases, including lexer priorities, parser plans, and testing/documentation goals.

## 3. Key Files
- `src/lexer.ts`: Core lexer/state machine and tokenization logic
- `src/type.ts`: TokenType enum and Token interface
- `src/util.ts`: Logging and character utilities
- `src/lexer.test.ts`: Jest tests
- `package.json`: Project metadata and scripts
- `tsconfig.json`: TypeScript setup
- `todo.html`: Roadmap, priorities, phased goals, and notes
- `Architecture.md`: Quick project introduction
- `OpenCode.md`: Internal engineering/agentic notes

## 4. Development & Testing Workflow
- **Install dependencies:**  
  `npm install`
- **Run tests:**  
  `npm test` (runs Jest with ts-jest)
- **Add new tests:**  
  Place new `.test.ts` files alongside implementation files in `src/`. Use Jest syntax.
- **Type check:**  
  `npx tsc --noEmit` to type-check the codebase.
- **Debugging:**  
  Enable verbose debug output by running with `VALID8_DEBUG=1` as an environment variable. All `log.debug` messages will be printed.
- **Linting:**  
  *(No linter is currently configured; consider adding ESLint for code consistency.)*
- **Build/Run:**  
  There is no build step yet; all logic is run and tested via Jest/TypeScript.

## 5. Logging & Debugging
- Use the custom `log` object from `src/util.ts` for all debug/info/error output. This respects the `VALID8_DEBUG` variable.
- To trace lexer state or issues, add `log.debug` calls at state transitions or error points. This will not pollute the output unless debugging is enabled.
- Use Jest for test-driven debugging and to catch regressions.

## 6. Code Conventions
- **TypeScript strict mode** enforced.
- All files use ES2016/ESNext features; CommonJS modules.
- Keep all new logic in `src/`.
- Prefer explicit enums and interfaces for all tokens and AST node structures.
- Document functions and new types with TSDoc comments as the project grows.
- Follow the logging pattern (see `log` in util.ts) for all application-level output.

## 7. Maintenance & Extension Tips
- **Extending the lexer**: Add new token types to `src/type.ts`. Update the state machine in `src/lexer.ts` to recognize new patterns. Write tests before/after changes.
- **Parser**: The parser is not yet implemented—see `todo.html` and the roadmap for parser design and priorities. Start by drafting a grammar and recursive descent parser skeleton.
- **Testing**: Always add edge-case tests for new language features or tokens. Use real logic statements as test cases.
- **Documentation**: Expand this document and Architecture.md with any new modules, features, or tricky behaviors as you add them.
- **Error Handling**: Lexer returns EOF/NEWLINE tokens on end-of-input; consider extending with richer error handling for malformed logic as parser is implemented.
- **Roadmap**: Align new work with `todo.html` phases (Lexer, Parser, Verification Engine, UI, Testing/Docs).

## 8. Known Limitations, TODOs, & Open Issues
- **Parser, engine, and CLI not implemented** (see `todo.html` for phases 2–5)
- **Lexer improvements needed**: whitespace, punctuation, and context-aware keyword/identifier handling are still in progress
- **No linter configured**
- **No build/deploy scripts yet**
- **No user-facing documentation or examples yet**
- **Testing**: Focus is on lexer; integration tests and parser tests are pending

**See `todo.html` for a detailed, prioritized list of future tasks and notes.**

---
*This AGENTS.md was generated on departure of a lead engineer. Update regularly with architectural or process changes.*

