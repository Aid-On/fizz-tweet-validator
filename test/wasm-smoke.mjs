import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/tw.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
const enc = new TextEncoder();
function set(text) { const b = enc.encode(text); const p = ex.tw_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); }
let ok = true; const ck = (g, w, m) => { if (g !== w) { console.error(`FAIL ${m}: ${g}!=${w}`); ok = false; } };
set("hello"); ck(ex.tw_weighted_length(), 5, "ascii 5"); ck(ex.tw_remaining(), 275, "remaining"); ck(ex.tw_is_valid(), 1, "valid");
set("こんにちは"); ck(ex.tw_weighted_length(), 10, "kana 10");
set("漢字aあ"); ck(ex.tw_weighted_length(), 7, "mixed 7");  // 2+2+1+2
set(""); ck(ex.tw_is_valid(), 0, "empty NG");
console.log(ok ? "wasm OK — weighted count matches native" : "FAIL"); if (!ok) process.exit(1);
