import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const migration = readFileSync(new URL("../migrations/0001_bayanihan_public_board.sql", import.meta.url), "utf8");

test("Bayanihan migration creates the expected schema in a disposable database", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(migration);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map((row) => row.name);
  assert.deepEqual(tables, ["community_posts", "community_reports", "moderation_events", "rate_limits"]);
  assert.throws(() => db.prepare(`
    INSERT INTO community_posts (id, owner_hash, author_name, post_type, barangay, message)
    VALUES ('bad', 'owner', 'A', 'general', 'Bagacay', 'too short')
  `).run());
  db.prepare(`
    INSERT INTO community_posts (id, owner_hash, author_name, post_type, barangay, message)
    VALUES ('owned', 'owner', 'Test Neighbor', 'general', 'Bagacay', 'Temporary fictional message')
  `).run();
  db.prepare(`
    UPDATE community_posts
    SET status = 'deleted', message = '[content removed]', contact_info = NULL
    WHERE id = 'owned'
  `).run();
  const deleted = db.prepare("SELECT status, message FROM community_posts WHERE id = 'owned'").get();
  assert.equal(deleted.status, "deleted");
  assert.equal(deleted.message, "[content removed]");
  db.close();
});
