---
title: type-challengesのeasyは数個の型テクニックの組み合わせで解ける
date: 2026-10-28
tags: [typescript, type-challenges]
description: easy 13問はMapped Types・Indexed Access・Conditional Types・infer・再帰・スプレッドの組み合わせで解けた。
---

[type-challenges](https://github.com/type-challenges/type-challenges)のeasy 13問と、mediumの00002を解いた。使った道具は次のとおりで、ほとんどの問題はこれらの組み合わせで解ける。

| 道具 | 書き方 | 使った問題 |
|---|---|---|
| キーのユニオン | `keyof T` | Pick |
| 制約 | `K extends keyof T` | Pick, TupleToObject |
| ループ（Mapped Types） | `{ [P in K]: T[P] }` | Pick, Readonly, TupleToObject |
| 修飾子 | `readonly [P in keyof T]` | Readonly |
| 要素のユニオン | `T[number]` | TupleToObject |
| 長さ | `T['length']` | First, Length |
| 条件分岐 | `A extends B ? X : Y` | If, First, Exclude |
| 分配 | ユニオンに条件型を当てると1つずつ評価される | Exclude |
| 取り出し | `T extends Promise<infer U> ? U : never` | Awaited, Parameters, ReturnType |
| 先頭と残り | `T extends [infer F, ...infer R]` | Includes |
| 再帰 | 型の中で自分自身を呼ぶ | Awaited, Includes |
| 結合 | `[...T, ...U]`, `[...T, U]` | Concat, Push, Unshift |

## ハマった点

- 型の世界に `for`・`.`・`=`・`+` はない。ループは `in`、プロパティ参照は `T['length']`、比較は `extends` で書く
- `{ [P in ...]: ... }` は必ずオブジェクト型になる。単一の型を返したいときは使わない
- `infer` は条件型の `extends` の右側でしか使えない。ジェネリクスの制約の中では使えない
- `extends` は「当てはまるか」であって「等しいか」ではない。`{ a: 'A' } extends {}` は真になる。完全一致が必要なIncludesでは `Equal` と再帰を組み合わせた
- 型は名前ではなく構造で判定される（構造的型付け）。`then` だけを持つオブジェクトは `PromiseLike` には当てはまるが、`catch` などがないので `Promise` には当てはまらない
- 「1以上」のような条件は書きにくい。`T['length'] extends 0 ? never : T[0]` のように、条件を反転して分岐を入れ替える
- easyのIncludes（00898）だけは実質medium〜hardの難しさ

## 進め方

- ローカルでは `pnpm generate ja` で `playground/` に問題ファイルを生成し、エディタの赤線が消えれば正解
- `npx tsc --noEmit --strict <ファイル>` でコマンドラインからも判定できる
- 詰まったら、テストを種類分けして簡単なグループから通す。分からない型はhoverやCmd+クリックで中身を見る
- 参考：[TypeScript Handbook - Type Manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
