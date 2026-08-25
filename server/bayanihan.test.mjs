import test from "node:test";
import assert from "node:assert/strict";
import { validatePost, validOwnerToken } from "../functions/_lib/bayanihan.js";

const valid = {
  author_name: "Test Neighbor",
  post_type: "general",
  barangay: "Bagacay",
  message: "This is a fictional community test post.",
  contact_info: "",
  website: "",
};

test("accepts a valid fictional post", () => {
  assert.ok(validatePost(valid).value);
});

test("rejects automation honeypot, invalid barangay, and repeated spam", () => {
  assert.ok(validatePost({ ...valid, website: "spam" }).error);
  assert.ok(validatePost({ ...valid, barangay: "Elsewhere" }).error);
  assert.ok(validatePost({ ...valid, message: "aaaaaaaaaaaa spam" }).error);
});

test("requires a 256-bit hexadecimal device credential", () => {
  assert.equal(validOwnerToken("a".repeat(64)), true);
  assert.equal(validOwnerToken("short"), false);
});
