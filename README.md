# TIL

毎日の小さな調査メモ（Today I Learned）。Astro + Pagefind + Cloudflare Pages。

## 書く

```sh
npm run new -- my-slug "タイトル" tag1,tag2   # src/content/til/YYYY-MM-DD-my-slug.md を作る
```

frontmatter に `draft: true` を付けると本番には出ない（`npm run dev` では表示される）。

## 確認

```sh
npm run dev                     # 執筆中の確認（検索は動かない）
npm run build && npm run preview  # 検索込みの確認
```

## デプロイ（Cloudflare Pages）

- Build command: `npm run build`
- Build output directory: `dist`
- 環境変数: `NODE_VERSION=22`
