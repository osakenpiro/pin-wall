# 画鋲（gabyo / pin-wall）

> 思想とは関係なく、いま作った画像を貼る場。
> 削除なし、整理なし — **腐葉土設計の即時実装**。

osakenpiroのフロント4種体制（TOP / どこでもドア / 僕の惑星 / **画鋲**）の4枚目。
即興・ラフ・チラシ的なAI生成画像を「思いついたまま」貼り続けるための単一HTMLツール。

[👉 デモを開く（GitHub Pages）](https://osakenpiro.github.io/pin-wall/)

---

## 何ができるか

- AI生成画像（ChatGPT Images / Midjourney / その他）をピンとして貼る
- 画像URL貼り付け / ファイルアップロード / メモのみ の3経路
- プロンプト・タグ・モデル名・生成日時を一緒に記録
- タグでフィルタ
- グリッド配置 ⇄ 散布配置 切替
- JSONエクスポート / インポート

## 何が**できない**か（意図的）

- **削除**できない（腐葉土の原則）
- **編集**できない（修正したければ新規ピン）
- **アカウント**ない（localStorage のみ、外部送信なし）

---

## デザイン原則: 「無秩序」側に倒す

整いすぎは画鋲の機能を殺す。本ツールは以下の手段で **無秩序感** を担保:

- ピンごとにランダムな回転（-4.5° 〜 +4.5°）
- ピンごとにランダムな付箋色（黄/ピンク/水色/萌黄/紫）
- グリッド内の幅揺れ（85% 〜 115%）と justify-self ランダム
- 散布モードでは絶対配置で重なりを許容
- ピン頭（赤い丸い鋲）は中央上部に出現

「整列されたカードグリッド」ではなく「コルクボードに無造作に刺された画鋲」を目指す。

---

## データ構造（v1.0）

```json
{
  "schema_version": "1.0",
  "pins": [
    {
      "id": "pin_20260425193045_a3f1",
      "image_url": "https://.../pin_001.png",
      "title": "砂の三面図テスト",
      "prompt_text": "サハラ砂漠の砂粒、正面・側面・断面・微細拡大の四方向図...",
      "model": "gpt-image-2",
      "generated_at": "2026-04-25T19:30:00+09:00",
      "tags": ["素材図鑑", "第1章砂", "三面図"],
      "linked_project": "kdp-shibainai-zukan",
      "decay_protected": true,
      "rotation_deg": 2.5,
      "color_class": "c-yellow",
      "width_pct": 102.3,
      "z_index": 1,
      "schema_version": "1.0",
      "history": [
        { "ts": "2026-04-25T19:30:00+09:00", "event": "created", "model": "gpt-image-2" }
      ]
    }
  ],
  "settings": {
    "layout_mode": "grid",
    "filter_tags": [],
    "show_meta": false
  },
  "history": [
    { "ts": "2026-04-25T00:00:00+09:00", "event": "init" }
  ]
}
```

サンプルは [`data/pins.example.json`](data/pins.example.json) を参照。

---

## AI進化織り込み 6原則（遵守）

本ツールは「ChatGPT Images 2.0は数ヶ月で別モデルに置き換わる」という前提で設計されている。

1. **データレイヤと描画レイヤの分離** — JSONとHTML/CSS/JSを完全分離
2. **生成元API非依存** — `<img src={pin.image_url}>` だけ。フロント側でモデル判別しない
3. **schema_version の明示** — 各pinとstate全体に埋める。将来migration可
4. **プロンプトの保存** — 別モデルで再生成できる種を残す
5. **メタ情報の追記型管理** — `history[]` に追記、古い情報は消さない
6. **3経路の画像追加** — URL / アップロード(base64) / 画像なし(メモのみ)

---

## 技術スタック

- 単一HTML（CSS + JS全部入り、外部依存ゼロ）
- localStorage 永続化
- ゼロコスト・ゼロメンテナンス（GitHub Pages 想定）

将来的に Cloudflare Worker 経由のAPI連携を追加するときも、データ構造は変えない。

---

## 既知の制限

- localStorage 上限（〜5-10MB）— base64 で大量画像を貼ると到達する。長期運用ではURL貼り付け推奨
- 同期機能なし — 端末をまたいだ共有が必要なら export → import で
- インポートは現状「id重複skipで統合」。マージ戦略は将来 v2 で検討

---

## ロードマップ

### v0.1（本リリース）
- [x] 基本機能（追加・表示・詳細・タグフィルタ・export/import・レイアウト切替）
- [x] AI進化織り込み6原則実装
- [x] 無秩序デザイン

### v0.2 候補
- [ ] 「別バージョン」グルーピング（同プロンプトの再生成を並べる）
- [ ] 時系列ソート / シャッフル配置の固定保存
- [ ] Notion連携（ピン追加時にNotion DBにmirror）
- [ ] OpenAI API直接呼び出し（API入金後）

### v1.0 候補（将来）
- [ ] Cloudflare Worker経由のクラウド同期
- [ ] 「掲示板扉」をDDに追加して訪問動線を確立

---

## 関連

- フロント4種設計: `claude-shared/architecture/frontend-4-types.md`
- 起案handoff: `handoff-2026-04-25-cowork-full-batch.md`
- 思想: 腐葉土設計 / Boolean→Float / Hi-Me TooL（Visionium / TRBP配下）

---

## ライセンス

MIT — 自由に使ってください。

---

*画鋲 v0.1 — osakenpiro / 2026-04-25*
