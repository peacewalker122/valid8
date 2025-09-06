# Valid8 Project Documentation

## Project Overview
Valid8 is a fun weekend project built to check if logical arguments make sense in math and computer science. It uses a simple language to write down "premises" (facts or rules) and a "conclusion" (what you want to prove), then verifies if the conclusion logically follows from the premises.

## Language Grammar
The DSL (Domain-Specific Language) has a clear structure for writing logical statements. Note: Quantified expressions (using FORALL or EXISTS) are defined in the grammar but not yet implemented in the current version.

```
# Complete Grammar for Logical Reasoning DSL

# Top-level structure
<program>        ::= <statement>+
<statement>      ::= <premise> | <conclusion>

<premise>        ::= "PREMISE" ":" <logical_expr> "."
<conclusion>     ::= "THEREFORE" ":" <logical_expr> "."

# Logical expressions (the core of the language)
<logical_expr>   ::= <quantified_expr> | <atomic_expr> | <compound_expr>

# Quantified expressions (planned but not implemented)
<quantified_expr> ::= <quantifier> "(" <variable> "," <logical_expr> ")"
<quantifier>     ::= "FORALL" | "EXISTS"

# Atomic expressions (basic facts)
<atomic_expr>    ::= <predicate> "(" <term_list> ")"
<predicate>      ::= "IS" | "ARE" | "HAS" | "CAN" | "LIKES" | <custom_predicate>

# Compound expressions (logical operators)
<compound_expr>  ::= <negation> | <conjunction> | <disjunction> | <implication>
<negation>       ::= "NOT" "(" <logical_expr> ")"
<conjunction>    ::= "AND" "(" <logical_expr> "," <logical_expr> ")"
<disjunction>    ::= "OR" "(" <logical_expr> "," <logical_expr> ")"
<implication>    ::= "IMPLIES" "(" <logical_expr> "," <logical_expr> ")"

# Terms that can appear in predicates
<term_list>      ::= <term> | <term> "," <term_list>
<term>           ::= <variable> | <constant>

# Variables and constants
<variable>       ::= <lowercase_identifier>
<constant>       ::= <identifier>
<custom_predicate> ::= <uppercase_identifier>

# Lexical rules
<lowercase_identifier> ::= [a-z] [a-z0-9_]*
<uppercase_identifier> ::= [A-Z] [A-Z0-9_]*
<identifier>     ::= [a-zA-Z] [a-zA-Z0-9_]*
```

### Basic Structure Explanation
- **Basic Structure**: A program is a list of statements, each being either a premise (starting with "PREMISE:") or a conclusion (starting with "THEREFORE:").
- **Statements**:
  - Premise: `"PREMISE" ":" <logical_expr> "."`
  - Conclusion: `"THEREFORE" ":" <logical_expr> "."`
- **Logical Expressions** (the heart of the language):
  - **Quantified** (planned but not implemented): Would use "FORALL" (for all) or "EXISTS" (there exists) to talk about variables, like "FORALL(x, ...)" meaning "for every x".
  - **Atomic**: Simple facts, like "IS(x, cat)" meaning "x is a cat". Predicates include IS, ARE, HAS, CAN, LIKES, or custom ones.
  - **Compound**: Combines expressions with NOT (negation), AND (both true), OR (at least one true), IMPLIES (if-then).
- **Terms**: Things in predicates can be variables (like x, y – lowercase) or constants (like fluffy – any word).
- **Rules for Words**: Identifiers (names) start with a letter and can have letters, numbers, or underscores.

## Code Examples
Here are some examples of valid statements in the language. Note: The first two examples use quantifiers, which are not yet supported in the current implementation.

## How to Run the App
To run Valid8 on your machine:
1. **Install dependencies**: Run `npm install` in the project directory to download all required packages.
2. **Build the project**: Run `npm run build` to compile the TypeScript code into JavaScript (this creates the `dist/` folder).
3. **Start the app**:
   - **Interactive mode**: Run `npm start` (or `node dist/main.js`) to enter interactive mode. Type premises and conclusions, ending with "THEREFORE" to process.
   - **File mode**: Run `npm start some.txt` (or `node dist/main.js some.txt`) to read and verify logical statements from a file.
   - For debugging output, use `VALID8_DEBUG=1 npm start` to see detailed logs.
Make sure you have Node.js and npm installed. The app currently supports atomic and compound expressions for verification.

## Expected Result
Valid8 parses these statements and checks if the conclusion is logically valid based on the premises. For the examples above, it should confirm that "Fluffy is an animal" is true, because the premises say all cats are animals and Fluffy is a cat. If the logic doesn't hold, it would flag it as invalid. This helps in reasoning about arguments, like in proofs or AI logic systems. Currently, only atomic and compound expressions are supported for verification.
