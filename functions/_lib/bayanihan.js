export const BARANGAYS = new Set([
  "Bagacay", "Bajumpandan", "Balugo", "Banilad", "Bantayan", "Batinguel",
  "Buñao", "Cadawinonan", "Calindagan", "Camanjac", "Candau-ay", "Cantil-e",
  "Daro", "Junob", "Looc", "Mangnao", "Motong", "Piapi",
  "Poblacion 1 (Tinago)", "Poblacion 2 (Upper Luke Wright)",
  "Poblacion 3 (Business District)", "Poblacion 4 (Rizal Boulevard)",
  "Poblacion 5 (Silliman Area)", "Poblacion 6 (Cambagroy)",
  "Poblacion 7 (Mangga)", "Poblacion 8 (Cervantes)", "Pulantubig",
  "Tabuc-tubig", "Taclobo", "Talay",
]);

const TYPES = new Set(["carpool", "shared_table", "general"]);

export function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function validatePost(input) {
  const author_name = cleanText(input?.author_name, 80);
  const post_type = cleanText(input?.post_type, 20);
  const barangay = cleanText(input?.barangay, 80);
  const message = cleanText(input?.message, 500);
  const contact_info = cleanText(input?.contact_info, 120) || null;
  const seats = input?.seats_available == null || input.seats_available === "" ? null : Number(input.seats_available);

  if (cleanText(input?.website, 200)) return { error: "Automated submission rejected" };
  if (author_name.length < 2) return { error: "Display name must be at least 2 characters" };
  if (!TYPES.has(post_type)) return { error: "Invalid post type" };
  if (!BARANGAYS.has(barangay)) return { error: "Invalid barangay" };
  if (message.length < 10) return { error: "Message must be at least 10 characters" };
  if ((message.match(/https?:\/\//gi) || []).length > 1) return { error: "Only one link is allowed" };
  if (/(.)\1{9,}/iu.test(message)) return { error: "Message appears to contain repeated spam" };
  if (post_type === "carpool" && (!Number.isInteger(seats) || seats < 1 || seats > 20)) {
    return { error: "Carpool posts require 1 to 20 available seats" };
  }
  return { value: { author_name, post_type, barangay, message, contact_info, seats_available: seats } };
}

export function validOwnerToken(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

export async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function requestIdentity(request) {
  const token = request.headers.get("X-Bayanihan-Owner") || "";
  if (!validOwnerToken(token)) return null;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const userAgent = request.headers.get("User-Agent") || "unknown";
  return { ownerHash: await sha256(token), clientHash: await sha256(`${ip}|${userAgent}`) };
}

export async function enforceRateLimit(db, key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;
  await db.prepare(`
    INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_start < ? THEN 1 ELSE count + 1 END,
      window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END
  `).bind(key, now, windowStart, windowStart).run();
  const row = await db.prepare("SELECT count FROM rate_limits WHERE key = ?").bind(key).first();
  return Number(row?.count || 0) <= limit;
}
