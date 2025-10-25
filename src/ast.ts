// src/ast.ts
export type Expr =
  | { tag: "Var"; name: string }
  | { tag: "Int"; value: number }
  | { tag: "Add"|"Sub"|"Mul"|"Lt"|"Le"|"Eq"; left: Expr; right: Expr };

export type Stmt =
  | { tag: "Assign"; name: string; expr: Expr }
  | { tag: "If"; cond: Expr; then: Stmt[]; els: Stmt[] }
  | { tag: "While"; cond: Expr; body: Stmt[]; unroll: number } // bounded
  | { tag: "Assert"; cond: Expr };

export type Program = { params: string[]; body: Stmt[] };
