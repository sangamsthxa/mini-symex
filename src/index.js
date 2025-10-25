// src/index.ts
// src/index.ts
import { readFileSync } from "fs";
import { check } from "./sym.js";
const fileArg = process.argv[2];
if (!fileArg) {
    throw new Error("No input file specified.");
}
const prog = JSON.parse(readFileSync(fileArg, "utf8"));
check(prog);
//# sourceMappingURL=index.js.map