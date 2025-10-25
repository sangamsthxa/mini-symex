// src/sym.ts
import { init } from "z3-solver";
export async function check(program) {
    const { Context } = await init();
    const Z3 = Context("main");
    const Int = Z3.Int;
    const Solver = Z3.Solver;
    // Create symbolic params
    const initEnv = new Map();
    for (const p of program.params)
        initEnv.set(p, { z3: Z3.Int.const(p) });
    const worklist = [{ env: initEnv, path: [] }];
    const bugs = [];
    const evalExpr = (e, env) => {
        switch (e.tag) {
            case "Var": return env.get(e.name).z3;
            case "Int": return Z3.Int.val(e.value);
            default: {
                const l = evalExpr(e.left, env), r = evalExpr(e.right, env);
                switch (e.tag) {
                    case "Add": return l.add(r);
                    case "Sub": return l.sub(r);
                    case "Mul": return l.mul(r);
                    case "Lt": return l.lt(r);
                    case "Le": return l.le(r);
                    case "Eq": return l.eq(r);
                }
            }
        }
    };
    const step = async (st, stmt, k = 0) => {
        const { env, path } = st;
        switch (stmt.tag) {
            case "Assign": {
                const v = evalExpr(stmt.expr, env);
                const newEnv = new Map(env);
                newEnv.set(stmt.name, { z3: v });
                return [{ env: newEnv, path }];
            }
            case "If": {
                const c = evalExpr(stmt.cond, env);
                const t = { env: new Map(env), path: [...path, c] };
                const e = { env: new Map(env), path: [...path, c.not()] };
                let thenStates = [t];
                for (const s of stmt.then) {
                    const newStates = [];
                    for (const stt of thenStates) {
                        const states = await step(stt, s);
                        newStates.push(...states);
                    }
                    thenStates = newStates;
                }
                let elseStates = [e];
                for (const s of stmt.els) {
                    const newStates = [];
                    for (const ste of elseStates) {
                        const states = await step(ste, s);
                        newStates.push(...states);
                    }
                    elseStates = newStates;
                }
                return [...thenStates, ...elseStates];
            }
            case "While": {
                // Unroll `stmt.unroll` times: while (cond) body
                let states = [{ env: new Map(env), path: [...path] }];
                for (let i = 0; i < stmt.unroll; i++) {
                    const newStates = [];
                    for (const s0 of states) {
                        const c = evalExpr(stmt.cond, s0.env);
                        const inBody = { env: new Map(s0.env), path: [...s0.path, c] };
                        const after = { env: new Map(s0.env), path: [...s0.path, c.not()] };
                        let bodyStates = [inBody];
                        for (const b of stmt.body) {
                            const newStates = [];
                            for (const ss of bodyStates) {
                                const states = await step(ss, b);
                                newStates.push(...states);
                            }
                            bodyStates = newStates;
                        }
                        newStates.push(...bodyStates, after);
                    }
                    states = newStates;
                }
                return states;
            }
            case "Assert": {
                const neg = evalExpr(stmt.cond, env).not();
                const s = new Solver();
                for (const pc of path)
                    s.add(pc);
                s.add(neg);
                if (await s.check() === "sat") {
                    console.log("❌ Assertion failed! Counterexample:");
                    console.log(s.model().toString());
                }
                else {
                    console.log("✅ Assertion holds under path:", path.map(p => p.toString()));
                }
                return [st];
            }
        }
    };
    // Initialize environment
    const initEnv2 = new Map();
    for (const p of program.params)
        initEnv2.set(p, { z3: Z3.Int.const(p) });
    // Run program
    let frontier = [{ env: initEnv2, path: [] }];
    for (const stmt of program.body) {
        // Await all steps for the current frontier, flattening as we go
        const newFrontier = [];
        for (const st of frontier) {
            const res = await step(st, stmt);
            newFrontier.push(...res);
        }
        frontier = newFrontier;
    }
    console.log("✅ Symbolic execution completed.");
}
//# sourceMappingURL=sym.js.map