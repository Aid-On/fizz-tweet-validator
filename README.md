# fizz-tweet-validator

Fizz の **X ツイート文字数カウント / 上限検証**(§9 X連携)。X (twitter-text) の
**重み付き文字数**を数え、280 上限に収まるか判定する。

X は文字を一律 1 ではなく重み付きで数える: **CJK 漢字 / ひらがな / カタカナ / ハングル /
全角記号などは 2**、ASCII・ラテン等は 1。openaituber の現状は単純な `.length` だが、
本家 X の挙動に合わせた重み付きカウントを実装(日本語ツイートで残り文字数が正しく出る)。

文字列を入れて **Int(長さ)/ Bool(可否)** を返すので wasm でも安全(文字列を跨がない)。
投稿/UI 表示は Node/ブラウザ、カウントは Almide。

> 注: URL を 23 文字固定で数える t.co 換算は未実装(URL 検出が要る)。本文の重み計算が対象。

## API

`weighted_length(text)` / `remaining(text)`(負=超過)/ `is_valid(text)`(空でなく ≤280)/
`codepoint_length(text)` / `char_weight(codepoint)`。

## native

```sh
almide build src/main.almd -o build/fizz-tweet-validator
printf 'こんにちは、世界！\n' | ./build/fizz-tweet-validator
# 18/280	ok	こんにちは、世界！   (9 文字 × 2)
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/tw.wasm
```

`tw_alloc(len)` で本文を線形メモリに書く → `tw_weighted_length()` / `tw_remaining()` /
`tw_is_valid()` が Int を返す。グルー例 [`browser/tweet-driver.js`](./browser/tweet-driver.js)。
CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
