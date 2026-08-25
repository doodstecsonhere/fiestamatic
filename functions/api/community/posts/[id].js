import { json, requestIdentity } from "../../../_lib/bayanihan.js";

export async function onRequestDelete({ request, env, params }) {
  const identity = await requestIdentity(request);
  if (!identity) return json({ error: "A valid device credential is required" }, 401);
  const result = await env.DB.prepare(`
    UPDATE community_posts
    SET status = 'deleted', message = '[content removed]', contact_info = NULL
    WHERE id = ? AND owner_hash = ? AND status IN ('visible', 'hidden')
  `).bind(String(params.id), identity.ownerHash).run();
  if (!result.meta.changes) return json({ error: "Post not found or not owned by this device" }, 404);
  await env.DB.prepare("INSERT INTO moderation_events (id, post_id, action, reason) VALUES (?, ?, 'owner_deleted', 'device_credential')")
    .bind(crypto.randomUUID(), String(params.id)).run();
  return new Response(null, { status: 204 });
}
