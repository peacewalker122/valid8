# AGENTS.md — Valid8 Project Handover

## 1. Project Purpose
Valid8 is a TypeScript-based toolkit for parsing and verifying mathematical logic notation, specifically supporting logical arguments in the form of premises and conclusions (P:/C: format). The core is a custom lexer and tokenization engine, designed to serve future development of parsing, logical verification, and user interfaces for teaching or validating logical reasoning.

## 2. Architecture Overview
- **Lexer (`src/lexer/lexer.ts`)**: Stateful tokenization engine using a state machine. Recognizes labels (Premise/Conclusion), logical keywords (IF, THEN, NOT, AND, OR), identifiers, punctuation. Supports context-aware lexing.
- **Parser (`src/parser/parser.ts`)**: Consumes lexer tokens, constructs AST nodes; supports quantifiers, logical/atomic statements, compound expressions. Key node types: ExpressionStatement, QuantifierStatement, AtomicStatement.
- **AST Node Types (`src/parser/ast.ts`)**: Defines Statement, ExpressionStatement, QuantifierStatement, AtomicStatement (with token, name, value properties). Logical and quantifier nodes can act as both Statements and Arguments, per project comments.
- **Token Types (`src/types/token.ts`)**: TokenType enum and token structure used by all AST nodes.
- **Utility (`src/util/log.ts`)**: Project-specific logging helper, plus other utilities in util/ if needed.
- **Tests:**
   - Lexer: `src/lexer/lexer.test.ts`
   - Parser/AST: `src/parser/parser.test.ts`
   - Integration: `tests/` directory planned for future scenario-based tests.
- **Configuration:** TypeScript config in `tsconfig.json`, CommonJS modules, Jest via `ts-jest` for all tests.
- **Documentation/Meta:**
   - Architecture.md: High-level technical overview
   - OpenCode.md: Internal agent/debug/test notes
   - AGENTS.md: Engineering handover & guidance
- **Roadmap/TODO:** See `todo.html` for phased development (Lexer, Parser, Engine, UI, Testing/Docs).

## 3. Key Files
- `src/lexer.ts`: Core lexer/state machine and tokenization logic
- `src/type.ts`: TokenType enum and Token interface
- `src/util.ts`: Logging and character utilities
- `src/lexer.test.ts`: Jest lexer tests
- `src/parser.ts`: Parser stub (empty)
- `src/parser.test.ts`: Parser test stub (empty)
- `package.json`: Project metadata, scripts, and test setup (see below)
- `tsconfig.json`: TypeScript setup
- `todo.html`: Roadmap, priorities, phased goals, and notes
- `OpenCode.md`: Internal engineering/agentic notes (agentic/debug/test instructions)

## 4. Development & Testing Workflow
- **Install dependencies:**
  `npm install`
- **Run tests:**
  `npm test` (runs Jest with ts-jest, see `package.json`)
- **Add new tests:**
  Place new `.test.ts` files alongside implementation files in `src/`. Use Jest syntax. Lexer is covered in `lexer.test.ts`, parser is stubbed only.
- **Type check:**
  `npx tsc --noEmit` to type-check the codebase.
- **Debugging:**
  Enable verbose debug output by running with `VALID8_DEBUG=1` as an environment variable. All `log.debug` messages will be printed (see `src/util.ts`).
- **Linting:**
  *(No linter is currently configured; consider adding ESLint for code consistency in future phases.)*
- **Build/Run:**
  There is no build step yet; all logic is run and tested via Jest/TypeScript. CLI/UI not yet started (see roadmap).

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
- **Extending the lexer**: Add new token types to `src/type.ts`. Update the state machine in `src/lexer.ts` to recognize new patterns. Write tests before/after changes. Lexer improvements are the top priority (see `todo.html` Phase 1).
- **Parser (`src/parser.ts`, `src/parser.test.ts`)**: Parser skeleton files exist but currently have no logic. See `todo.html` and the roadmap for parser design and priorities. Start by drafting a grammar and recursive descent parser skeleton as described in the roadmap.
- **Testing**: Always add edge-case tests for new language features or tokens. Use real logic statements as test cases. Jest is configured for all `.test.ts` in `src/` (see `package.json` and `OpenCode.md`).
- **Documentation**: Expand this document and create or update Architecture.md with any new modules, features, or tricky behaviors as you add them.
- **Error Handling**: Lexer returns EOF/NEWLINE tokens on end-of-input; consider extending with richer error handling for malformed logic as parser is implemented.
- **Debugging/Logging**: Use `log.debug`/`log.info`/`log.error` from `src/util.ts` for contextual logging (see `OpenCode.md`).
- **Roadmap**: Align new work with `todo.html` phases (Lexer, Parser, Verification Engine, UI, Testing/Docs). See key implementation notes at the end of `todo.html`.

## 8. Known Limitations, TODOs, & Open Issues
- **Parser, engine, and CLI not implemented**: Parser skeleton exists but no logic. Engine, CLI, UI, and file I/O are not started (see `todo.html` for phases 2–5).
- **Lexer improvements needed**: Whitespace, punctuation, and context-aware keyword/identifier handling are still in progress and are the highest priority for enabling the parser and later phases.
- **No linter configured**: Codebase consistency is manual.
- **No build/deploy scripts yet**: Only test/typecheck scripts in `package.json`.
- **No user-facing documentation or examples yet**: Only code and comments. Please update this AGENTS.md and create API/user docs as new features are added.
- **Testing**: Focus is on lexer; parser and integration tests are stubs only.

**See `todo.html` for a detailed, prioritized list of future tasks and notes.**

---
*This AGENTS.md was generated on departure of a lead engineer. Update regularly with architectural or process changes.*

