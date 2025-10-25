# Mini-Symex: Symbolic Execution Engine

A lightweight symbolic execution engine implemented in TypeScript that analyzes programs for potential bugs and counterexamples using the Z3 theorem prover.

## Overview

Mini-Symex performs symbolic execution on programs written in a simple imperative language, exploring all possible execution paths and using constraint solving to find inputs that violate assertions or reach specific program states.

## Features

- **Symbolic Execution**: Explores all possible execution paths of a program
- **Constraint Solving**: Uses Z3 theorem prover for satisfiability checking
- **Bug Detection**: Finds counterexamples that violate assertions
- **Bounded Analysis**: Supports bounded loop unrolling for termination
- **TypeScript Implementation**: Modern, type-safe implementation

## Language Support

The engine supports a simple imperative language with the following constructs:

### Expressions
- **Variables**: `{ "tag": "Var", "name": "x" }`
- **Integers**: `{ "tag": "Int", "value": 42 }`
- **Arithmetic**: `{ "tag": "Add", "left": expr, "right": expr }`
- **Comparisons**: `{ "tag": "Lt", "left": expr, "right": expr }`

### Statements
- **Assignment**: `{ "tag": "Assign", "name": "x", "expr": expr }`
- **Conditional**: `{ "tag": "If", "cond": expr, "then": [stmt...], "els": [stmt...] }`
- **Loops**: `{ "tag": "While", "cond": expr, "body": [stmt...], "unroll": n }`
- **Assertions**: `{ "tag": "Assert", "cond": expr }`

### Programs
- **Program**: `{ "params": ["x", "y"], "body": [stmt...] }`

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mini-symex
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Quick Start

1. **Build the project**:
```bash
npm run build
```

2. **Run symbolic execution**:
```bash
npm start src/examples/abs.json
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled program
- `npm run dev` - Build and run in one command

### Example Program

The included example (`src/examples/abs.json`) implements an absolute value function:

```json
{
  "params": ["x"],
  "body": [
    {
      "tag": "If",
      "cond": { "tag": "Lt", "left": {"tag": "Var", "name": "x"}, "right": {"tag": "Int", "value": 0} },
      "then": [{ "tag": "Assign", "name": "x", "expr": { "tag": "Sub", "left": {"tag": "Int", "value": 0}, "right": {"tag": "Var", "name": "x"} } }],
      "els": []
    },
    {
      "tag": "Assert",
      "cond": { "tag": "Le", "left": {"tag": "Int", "value": 0}, "right": {"tag": "Var", "name": "x"} }
    }
  ]
}
```

This program:
1. Takes a parameter `x`
2. If `x < 0`, assigns `x = 0 - x` (absolute value)
3. Asserts that `x >= 0`

Running this example produces:
```
No counterexamples within bounds.
```

This means the assertion always holds - the absolute value function is correct!

## How It Works

1. **Symbolic State**: Each program variable is represented as a symbolic value (Z3 expression)
2. **Path Exploration**: The engine explores all possible execution paths by:
   - Following both branches of conditional statements
   - Unrolling loops a bounded number of times
   - Maintaining path conditions (constraints on symbolic variables)
3. **Constraint Solving**: For each assertion, the engine:
   - Negates the assertion condition
   - Adds all path conditions
   - Checks if the resulting constraint system is satisfiable
   - If satisfiable, reports a counterexample

## Project Structure

```
mini-symex/
├── src/
│   ├── ast.ts          # Abstract syntax tree definitions
│   ├── sym.ts          # Core symbolic execution engine
│   ├── index.ts        # Main entry point
│   └── examples/
│       └── abs.json    # Example program
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## Dependencies

- **z3-solver**: Z3 theorem prover for constraint solving
- **typescript**: TypeScript compiler
- **@types/node**: Node.js type definitions
- **ts-node**: TypeScript execution (development)

## Technical Details

- **Module System**: ES modules (`"type": "module"`)
- **Target**: ESNext with Node.js compatibility
- **Type Safety**: Strict TypeScript configuration
- **Async/Await**: Proper handling of Z3's asynchronous API

## Limitations

- **Bounded Analysis**: Loops are unrolled a fixed number of times
- **Integer Domain**: Only supports integer arithmetic
- **No Functions**: No support for function calls or recursion
- **No Arrays**: No support for array operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Example Output

When the engine finds a counterexample, it reports the model:

```
Counterexamples:
x = -1
```

This indicates that when `x = -1`, the assertion fails, helping you identify bugs in your program logic.
