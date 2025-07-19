# Preface
`Valid8` is an weekend project with a single purpose to verify any mathematical logic notation.

# Grammar
```
# Complete Grammar for Logical Reasoning DSL

# Top-level structure
<program>        ::= <statement>+
<statement>      ::= <premise> | <conclusion>

<premise>        ::= "PREMISE" ":" <logical_expr> "."
<conclusion>     ::= "THEREFORE" ":" <logical_expr> "."

# Logical expressions (the core of the language)
<logical_expr>   ::= <quantified_expr> | <atomic_expr> | <compound_expr>

# Quantified expressions
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

# Examples of valid expressions:
# PREMISE: FORALL(x, IMPLIES(IS(x, cat), IS(x, animal))).
# PREMISE: EXISTS(y, AND(IS(y, bird), CAN(y, fly))).
# PREMISE: IS(fluffy, cat).
# THEREFORE: IS(fluffy, animal).
```
