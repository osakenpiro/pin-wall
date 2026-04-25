# 画鋲（gabyo / pin-wall）

> 思想とは関係なく、いま作った画像を貼る場。
> 削除なし、整理なし — **腐葉土設計の即時実装**。

osakenpiroのフロント4種体制（TOP / どこでもドア / 僕の惑星 / **画鋲**）の4枚目。
即興・ラフ・チラシ的なAI生成画像を「思いついたまま」貼り続けるための単一HTMLツール。

[👉 デモを開く（GitHub Pages）](https://osakenpiro.github.io/pin-wall/)

---

## v0.2 で追加された3機能

### A. グルーピング (同プロンプト自動まとめ)

同じ `プロンプト` を持つピンは自動的に同じ `group_key` を付与され、表示時に **隣接配置 + ×N バッジ** が出る。
gpt-image-2 の n=4 一貫生成（同プロンプトで複数バリエーション）を「並べて評価」する運用に最適化。

詳細モーダルで group内の他ピンに直接ジャンプ可能。

### B. 固定ソート (newest / oldest / shuffle)

ツールバーのプルダウンで切替可能：
- **newest** (既定): 新しい順
- **oldest**: 古い順
- **shuffle**: ランダム配置を **localStorage に固定保存**。次回開いても同じ配置（再シャッフルボタンで明示的に変更可）

shuffle時はグルーピングを抑制し、混沌を最大化（osakenpiro原則: 整理より熱量）。

### C. Notion mirror (任意トグル)

ピン追加時に Notion の `📌 画鋲DB` (`7ec3970d-7308-46d4-9830-27fcbbeb3824`) に自動投入。
- Cloudflare Worker thin proxy 経由（CORS回避、PATは保持しない）
- Worker雛形は [`worker/`](worker/) 配下、デプロイ手順は [worker/README.md](worker/README.md)
- 設定モーダル ⚙ で Worker URL / PAT / mirror toggle を管理
- 既存ピンの一括mirror も可能（バッチボタン）

---

## 何ができるか (v0.1 + v0.2)

- AI生成画像をピンとして貼る (URL / アップロード / メモのみ)
- プロンプト・タグ・モデル名・生成日時を一緒に記録
- タグでフィルタ
- グリッド ⇄ 散布配置 切替
- newest / oldest / shuffle ソート (永続)
- 同プロンプト自動グループ化
- Notion DB自動mirror (任意)
- JSONエクスポート / インポート

## 何が**できない**か（意図的）

- **削除**できない（腐葉土の原則）
- **編集**できない（修正したければ新規ピン）
- **アカウント**ない（localStorage のみ、外部送信は Notion mirror時の Worker 経由のみ）

---

## デザイン原則: 「無秩序」側に倒す

整いすぎは画鋲の機能を殺す:
- ピンごとにランダムな回転（-4.5° 〜 +4.5°）
- 5色付箋（黄/ピンク/水色/萌黄/紫）ランダム
- グリッド内の幅揺れ + justify-self ランダム
- shuffle 時はグループ化なしで完全にカオス
- 散布モードでは絶対配置で重なりを許容

---

## データ構造（schema_version 1.1）

```json
{
  "schema_version": "1.1",
  "pins": [
    {
      "id": "pin_20260425193045_a3f1",
      "image_url": "https://.../pin_001.png",
      "title": "砂の三面図テスト",
      "prompt_text": "サハラ砂漠の砂粒、正面・側面・断面...",
      "model": "gpt-image-2",
      "generated_at": "2026-04-25T19:30:00+09:00",
      "tags": ["素材図鑑", "第1章砂", "三面図"],
      "linked_project": "kdp-jinrui-no-sozai-zukan",
      "decay_protected": true,
      "rotation_deg": 2.5,
      "color_class": "c-yellow",
      "width_pct": 102.3,
      "z_index": 1,
      "schema_version": "1.1",
      "group_key": "g_a3f8b21c",         // ← v0.2 追加
      "notion_page_id": null,             // ← v0.2 追加
      "notion_page_url": null,            // ← v0.2 追加
      "history": [...]
    }
  ],
  "settings": {
    "layout_mode": "grid",
    "sort_mode": "newest",                // ← v0.2 追加
    "shuffled_order": [],                 // ← v0.2 追加
    "filter_tags": [],
    "show_meta": false,
    "mirror_enabled": false               // ← v0.2 追加
  }
}
```

v0.1 → v0.2 のmigrationは自動 (loadState時に`group_key`を再計算)。

---

## AI進化織り込み 6原則 (継続遵守)

1. データ層と描画層分離 — JSONとHTML/CSS/JSを完全分離
2. 生成元API非依存 — `<img src={pin.image_url}>` だけ
3. schema_version の明示 — 各pinとstate全体に埋める
4. プロンプトの保存 — 別モデルで再生成可能
5. メタ情報の追記型管理 — `history[]` に追記
6. 3経路の画像追加 — URL / Upload(base64) / メモのみ

---

## 技術スタック

- 単一HTML（CSS + JS全部入り、外部依存ゼロ）
- localStorage 永続化（PAT含む、外部送信は Worker経由のmirror時のみ）
- Cloudflare Worker thin proxy (CORS回避、PAT保持しない)
- ゼロコスト・ゼロメンテナンス

---

## 既知の制限

- localStorage 上限（〜5-10MB）— base64大量で到達する。長期はURL推奨
- 端末間同期なし — Notion mirror or export/import で
- Worker URL未設定だと mirror 無効

---

## ロードマップ

### v0.2（本リリース）✅
- [x] グルーピング機能（同プロンプト自動まとめ）
- [x] 固定ソート（newest/oldest/shuffle、shuffleは永続）
- [x] Notion mirror (Cloudflare Worker proxy 経由)
- [x] 設定モーダル（PAT/Worker URL/mirror toggle）

### v0.3 候補
- [ ] OpenAI API直接呼び出し (API課金問題解決後)
- [ ] 画像URL → base64 変換ボタン (URL消失対策)
- [ ] Notion → 画鋲 逆方向同期
- [ ] 画鋲扉 (DD配下に追加するか判断後)

### v1.0 候補
- [ ] CloudFlare Workers KV/R2 でクラウド同期
- [ ] 共同編集モード (家族・パートナー用)

---

## 関連

- フロント4種設計: [claude-shared/architecture/frontend-4-types.md](https://github.com/osakenpiro/claude-shared/blob/main/architecture/frontend-4-types.md)
- 起案handoff: handoff-2026-04-25-cowork-full-batch.md
- v0.2 起案: チャット会話 (2026-04-25b セッション)
- 思想: 腐葉土設計 / Boolean→Float / Hi-Me TooL（Visionium / TRBP配下）

---

## ライセンス

MIT — 自由に使ってください。

---

*画鋲 v0.2 — osakenpiro / 2026-04-25*
