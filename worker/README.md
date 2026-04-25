# Notion mirror Worker — デプロイ手順 (5分)

画鋲(pin-wall)からNotion APIを叩くためのCloudflare Worker thin proxy。
CORS問題を回避する以外の機能は持たず、PATは保持しない。

## 前提

- Cloudflareアカウント (無料)
- Notion Internal Integration が作成済み + PAT取得済み
- 画鋲DB (`7ec3970d-7308-46d4-9830-27fcbbeb3824`) にIntegrationが招待済み

## デプロイ手順

### 方法A: Cloudflare Dashboard (最速、5分)

1. https://dash.cloudflare.com/?to=/:account/workers/services にログイン
2. 「Create Worker」クリック → 名前 `pin-wall-mirror` 入力 → Deploy
3. デフォルトの hello-world コードを **本リポジトリの `notion-mirror-worker.js` の内容で全置換**
4. Save and deploy
5. 表示されるURL (例: `https://pin-wall-mirror.<account>.workers.dev`) をコピー
6. 画鋲の ⚙設定モーダル → Worker URL 欄に貼り付け
7. PAT入力 → 「接続テスト」 → ✓ 接続成功 を確認
8. mirror有効化チェック → 保存

### 方法B: wrangler CLI (慣れてる人向け)

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler deploy
```

## Notion Integration の設定

1. https://www.notion.so/my-integrations から新規Integration作成
2. PATをコピー (`ntn_...`)
3. Notionで `📌 画鋲DB` を開き、`...` → 「Connections」 → 作成したIntegrationを招待

## 動作確認

```bash
# 接続テスト (ping)
curl "https://pin-wall-mirror.<account>.workers.dev/?ping=1" \
  -H "X-Notion-Token: ntn_xxxxx"
# → {"ok":true, "bot":{...}}

# ピン投入テスト
curl -X POST "https://pin-wall-mirror.<account>.workers.dev/" \
  -H "X-Notion-Token: ntn_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"parent":{"database_id":"7ec3970d-7308-46d4-9830-27fcbbeb3824"},"properties":{"タイトル":{"title":[{"text":{"content":"test from curl"}}]}}}'
```

## セキュリティメモ

- PATはWorkerに保持せず、フロントから毎回渡す方式
- WorkerURLが漏れても、PATがなければNotion APIには叩けない
- それでも不安なら Worker側で CORS Allow-Origin を `*` から自分のGitHub Pages URLに絞る
