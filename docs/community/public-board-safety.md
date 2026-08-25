# Bayanihan public board safety and data handling

## Minimum launch protections

- Posts are shared publicly through the same-origin `/api/community/posts` API.
- A random device credential is stored in the browser. Its SHA-256 hash, never
  the credential itself, is stored so that only the posting device can delete
  its post.
- Display names are unverified and are never presented as authenticated names.
- The server validates length, post type, barangay, carpool seats, links, and
  common repeated-character spam. A hidden honeypot rejects simple bots.
- Posting is limited to five posts per hour by both device and hashed network
  identity. Exact duplicate posts are rejected for one hour.
- Any visitor can report a post once per device. A post is hidden after three
  independent reports, and the moderation action is recorded.
- Raw IP addresses and full user-agent strings are not stored. A one-way hash
  of the current IP and user agent is used only for rate limiting.
- Public message and optional contact data are retained for at most 90 days.
  Expired and owner-deleted posts have their message and contact fields erased.

## Owner and visitor limitations

This is intentionally a minimum public board, not a verified identity system.
Losing browser storage loses the device deletion credential. In that case, the
visitor can report the post, and the project owner can review the D1 database
from the Cloudflare dashboard. There is no public administrator endpoint and no
administrator secret in the browser bundle.

Visitors should not publish sensitive personal data. Contact information is
optional and public when supplied. Reports should describe the safety concern
without adding private information.

## Abuse response

1. Reports are recorded without exposing reporter identity publicly.
2. Three independent device reports automatically hide a post.
3. The Cloudflare account owner can inspect hidden posts and the append-only
   moderation event record in D1.
4. Severe abuse can be removed directly from the Cloudflare owner dashboard;
   this is an exceptional owner operation and should be documented when used.

## Data deletion

The posting device can delete its own visible post using the trash button.
Deletion immediately removes public visibility and erases its message and
contact information. Posts also expire after 90 days. A person who lost the
original device credential must contact the project owner with enough
non-sensitive detail to identify the post.

## Zero-dollar boundary

The board is designed for Cloudflare Workers Free plus D1 Free. If a free daily
limit is reached, requests fail until the allowance resets; the project must
not be upgraded to a paid plan or allowed to incur overages without explicit
owner approval.
