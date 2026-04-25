/**
 * pin-wall Notion mirror Worker (Cloudflare)
 *
 * Notion API 直叩きはCORS非対応のため、本Workerが thin proxy として
 * フロント(画鋲) → Notion API のリクエストを中継する。
 *
 * - PATは保持しない (フロントから X-Notion-Token ヘッダで毎回渡す)
 * - GET ?ping=1 → /v1/users/me で接続テスト
 * - POST /v1/pages にbodyを転送
 *
 * デプロイ:
 *   1. wrangler login
 *   2. このファイルを worker/ に置いて wrangler init で project化
 *      または直接 Cloudflare dashboard の Workers で本ファイル内容を貼り付け
 *   3. デプロイURLを画鋲の設定モーダルに貼る
 *   4. 接続テスト → 成功なら mirror toggle ON
 *
 * 想定 wrangler.toml:
 *   name = "pin-wall-mirror"
 *   main = "notion-mirror-worker.js"
 *   compatibility_date = "2025-01-01"
 */

const NOTION_API = "https://api.notion.com";
const NOTION_VERSION = "2022-06-28";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Notion-Token, Notion-Version",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const token = request.headers.get("X-Notion-Token");

    if (!token) {
      return json({ error: "X-Notion-Token header required" }, 400);
    }

    // GET ?ping=1 → 接続テスト
    if (request.method === "GET" && url.searchParams.get("ping") === "1") {
      try {
        const res = await fetch(`${NOTION_API}/v1/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Notion-Version": NOTION_VERSION
          }
        });
        const data = await res.json();
        return json({ ok: res.ok, status: res.status, bot: data.bot, user: data }, res.ok ? 200 : res.status);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // POST → /v1/pages 転送
    if (request.method === "POST") {
      try {
        const body = await request.text();
        const res = await fetch(`${NOTION_API}/v1/pages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json"
          },
          body
        });
        const data = await res.json();
        return json(data, res.status);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    return json({ error: "method not allowed" }, 405);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS }
  });
}
