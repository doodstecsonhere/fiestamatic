import { cleanText, enforceRateLimit, json, requestIdentity } from "../../../../_lib/bayanihan.js";

export async function onRequestPost({ request, env, params }) {
  const identity = await requestIdentity(request);
  if (!identity) return json({ error: "A valid device credential is required" }, 401);
  const allowed = await enforceRateLimit(env.DB, `report:${identity.clientHash}`, 20, 3600);
  if (!allowed) return json({ error: "Reporting limit reached. Please try again later." }, 429);

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 2_000) return json({ error: "Request is too large" }, 413);
  const rawBody = await request.text();
  if (rawBody.length > 2_000) return json({ error: "Request is too large" }, 413);
  const body = (() => {
    try { return JSON.parse(rawBody); } catch { return {}; }
  })();
  const reason = body.reason === "community_safety" ? body.reason : "other";
  const details = cleanText(body.details, 300);
  const post = await env.DB.prepare("SELECT owner_hash, status FROM community_posts WHERE id = ?")
    .bind(String(params.id)).first();
  if (!post || post.status !== "visible") return json({ error: "Post not found" }, 404);
  if (post.owner_hash === identity.ownerHash) return json({ error: "You cannot report your own post" }, 400);

  try {
    await env.DB.prepare(`
      INSERT INTO community_reports (id, post_id, reporter_hash, reason, details)
      VALUES (?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), String(params.id), identity.ownerHash, reason, details).run();
  } catch (error) {
    if (String(error).includes("UNIQUE")) return json({ error: "This device already reported the post" }, 409);
    throw error;
  }

  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM community_reports WHERE post_id = ?")
    .bind(String(params.id)).first("total");
  if (Number(count) >= 3) {
    await env.DB.batch([
      env.DB.prepare("UPDATE community_posts SET status = 'hidden', report_count = ? WHERE id = ? AND status = 'visible'")
        .bind(Number(count), String(params.id)),
      env.DB.prepare("INSERT INTO moderation_events (id, post_id, action, reason) VALUES (?, ?, 'auto_hidden', 'three_independent_reports')")
        .bind(crypto.randomUUID(), String(params.id)),
    ]);
  }
  return json({ reported: true });
}
