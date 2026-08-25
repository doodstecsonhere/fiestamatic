import { enforceRateLimit, json, requestIdentity, validatePost } from "../../../_lib/bayanihan.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const identity = await requestIdentity(request);
  context.waitUntil(env.DB.batch([
    env.DB.prepare(`
      UPDATE community_posts
      SET status = 'deleted', message = '', contact_info = NULL
      WHERE status != 'deleted' AND created_at <= datetime('now', '-90 days')
    `),
    env.DB.prepare(`
      DELETE FROM community_reports
      WHERE post_id IN (SELECT id FROM community_posts WHERE status = 'deleted')
    `),
  ]));
  const { results } = await env.DB.prepare(`
    SELECT id, author_name, post_type, barangay, message, contact_info,
           seats_available, created_at, owner_hash
    FROM community_posts
    WHERE status = 'visible' AND created_at > datetime('now', '-90 days')
    ORDER BY created_at DESC
    LIMIT 100
  `).all();
  return json(results.map(({ owner_hash, ...post }) => ({ ...post, owned: identity?.ownerHash === owner_hash })));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const identity = await requestIdentity(request);
  if (!identity) return json({ error: "A valid device credential is required" }, 401);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "JSON is required" }, 415);

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 10_000) return json({ error: "Request is too large" }, 413);
  const rawBody = await request.text();
  if (rawBody.length > 10_000) return json({ error: "Request is too large" }, 413);
  const body = (() => {
    try { return JSON.parse(rawBody); } catch { return null; }
  })();
  const parsed = validatePost(body);
  if (parsed.error) return json({ error: parsed.error }, 400);

  const ipAllowed = await enforceRateLimit(env.DB, `post-ip:${identity.clientHash}`, 5, 3600);
  const ownerAllowed = await enforceRateLimit(env.DB, `post-owner:${identity.ownerHash}`, 5, 3600);
  if (!ipAllowed || !ownerAllowed) return json({ error: "Posting limit reached. Please try again later." }, 429);

  const value = parsed.value;
  const duplicate = await env.DB.prepare(`
    SELECT id FROM community_posts
    WHERE owner_hash = ? AND lower(message) = lower(?) AND created_at > datetime('now', '-1 hour')
    LIMIT 1
  `).bind(identity.ownerHash, value.message).first();
  if (duplicate) return json({ error: "This message was already posted recently" }, 409);

  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO community_posts
      (id, owner_hash, author_name, post_type, barangay, message, contact_info, seats_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, identity.ownerHash, value.author_name, value.post_type, value.barangay,
    value.message, value.contact_info, value.seats_available).run();

  context.waitUntil(env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?")
    .bind(Math.floor(Date.now() / 1000) - 86400).run());
  return json({ id, ...value, created_at: new Date().toISOString(), owned: true }, 201);
}
