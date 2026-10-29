---
title: Playwright for PythonはNode.jsのdriverとパイプでJSONをやり取りしている
date: 2026-10-28T22:38:04+09:00
tags: [python, playwright]
description: Python版Playwrightはブラウザを直接操作せず、wheelに同梱したNode.jsのdriverを子プロセスで起動し、stdin/stdoutで「4バイトの長さ+JSON」を送り合っている。
---

Python版Playwrightは、自分ではブラウザを操作しない。wheelに同梱したNode.js製のdriverを子プロセスとして起動し、stdin/stdoutのパイプでJSONのメッセージを送るだけのクライアントになっている。ブラウザを操作するのはdriverで、Chromiumとはさらに CDP（Chrome DevTools Protocol）で話す。

```
Python ──パイプ(4バイト長+JSON)──> Node.js driver ──パイプ(CDP)──> Chromium
```

## 仕組み

- `pip`（`uv add`）で入るwheelに、Node.jsのバイナリ（`playwright/driver/node`、arm64のMacで約120MB）とPlaywright本体（`driver/package/cli.js`）が入っている。Node.jsを別に入れなくても動き、`which node` も変わらない
- wheelがOS・CPUごとに8種類あるのは、同梱するNode.jsのバイナリがOS・CPUごとに別物になるから
- `playwright/_impl/transport.py` が `node cli.js run-driver` をstdin/stdoutをパイプにした状態で起動する
- メッセージの区切りは「4バイトのリトルエンディアンの長さ + JSON本体」。Node側の `pipeTransport.ts` も `writeUInt32LE` / `readUInt32LE` で同じ規則を使う
- プロトコルは `packages/protocol/spec/*.yml` に定義されていて、Python側の `protocol_channels.py` はそこから自動生成される。Java版や.NET版も同じdriverを使う
- `uv run playwright install chromium` も、Python側の `__main__.py` が引数をそのまま `node cli.js` に渡しているだけ

## 流れるJSONを見る

`transport.py` は環境変数 `DEBUGP` があると送受信したメッセージを表示する。

```bash
DEBUGP=1 uv run python goto.py
```

`page.goto()` の部分はこうなる。

```
SEND> id: lnsv@5, guid: frame@..., method: goto
RECV> method: __create__ (Request)
RECV> method: __create__ (Response)
RECV> id: lnsv@5, result: { response: { guid: response@... } }
```

- 命令には `id` が付き、返事は同じ `id` で返ってくる。`id` のないものはイベント
- Python側のオブジェクトはNode側のオブジェクトを `guid` で指す「リモコン」。返事より先に `__create__` が届くので、Python側はIDからオブジェクトを引き当てられる
- `page.goto()` の宛先はPageではなくFrame（`page.py` の `goto` がメインフレームに委譲しているのとソースどおり）
- `browser.new_page()` 1回で `newContext` と `newPage` の2命令が送られている
- `__adopt__` で親子関係の付け替え、終了時は `__dispose__` が Page → BrowserContext → Browser の順に届く
- 各命令の `metadata.location` に、呼び出し元のPythonファイル名と行番号が入っている

## 別言語どうしが会話できる理由

PythonとNode.jsは、それぞれのランタイム（CPython / Node.js、どちらもOSから見ればただの実行ファイル）を持つ別プロセスで、お互いのメモリは見えない。プロセス間をつなぐパイプはカーネルが用意し、そこを流れるバイト列の形式だけを両側で揃えている。言語どうしを直接つないでいるわけではない。

参考にしたソース: microsoft/playwright-python `5306360`、microsoft/playwright `b4695e3`（playwright-pythonの `DRIVER_VERSION`）
