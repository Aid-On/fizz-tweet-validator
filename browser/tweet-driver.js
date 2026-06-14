// tweet-driver.js — X UI のツイート文字数カウントのグルー例。カウント=Almide(wasm)、UI=JS。
export async function loadTweetValidator(wasmUrl) {
  const bytes = await (await fetch(wasmUrl)).arrayBuffer();
  const mod = await WebAssembly.compile(bytes);
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  const enc = new TextEncoder();
  const set = (text) => { const b = enc.encode(text); const p = ex.tw_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); };
  return {
    weightedLength(text) { set(text); return ex.tw_weighted_length(); },
    remaining(text) { set(text); return ex.tw_remaining(); },     // 残り文字数 (負=超過)
    isValid(text) { set(text); return ex.tw_is_valid() === 1; },
  };
}
