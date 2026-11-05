---
title: （仮）Dockerのimageの違い
date: 2026-11-05T22:37:42+09:00
tags: [docker]
draft: true
---

<!--
材料メモ（書き終えたら消す）

どの「違い」を書くか決める
- イメージとコンテナの違い（「イメージには実態がない？」の疑問）
- ベースイメージの違い（ubuntu / debian-slim / alpine / distroless など、中身とサイズ）
- ビルドの違い（マルチステージビルドで最終イメージを小さくする）

問い（1つずつ）
- イメージの正体は何か。レイヤとマニフェストはどう構成されているか
- 起動したコンテナは、イメージのレイヤの上に何を重ねているのか
- alpineはなぜ小さいのか。何を削っているのか

一次情報
- OCIイメージの仕様: https://github.com/opencontainers/image-spec/blob/main/spec.md
- マニフェストの仕様: https://github.com/opencontainers/image-spec/blob/main/manifest.md
- Dockerのイメージの説明: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
- レイヤの説明: https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/
- overlayfsでの重ね方: https://docs.docker.com/engine/storage/drivers/overlayfs-driver/
- マルチステージビルド: https://docs.docker.com/build/building/multi-stage/

確かめ方の候補
- docker image inspect / docker history でレイヤを見る
- docker save で書き出したtarを展開して、マニフェストとレイヤの中身を見る
-->
