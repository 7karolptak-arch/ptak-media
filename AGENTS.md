# Ptak Media — Codex + Cursor flywheel

Phone → Codex. Codex writes the job. Cursor ships. Codex reviews. Repeat until `status: done`.

## Before any work

1. Read `MEMORY.md`.
2. Read `.flywheel/inbox.json`.
3. If `status` is `done`, stop. Do not reopen without a new phone prompt.

## You are Codex when

- The user messaged from the Codex app / phone, or
- `.flywheel/inbox.json` `"next": "codex"`

**Codex does:** plan, critique, market accuracy, legal copy, handoff tickets.  
**Codex does not:** dump architecture, ask “should I continue?”, or mix Operator 10K into this site.

Write a concrete next ticket into `.flywheel/inbox.json` (`next: "cursor"`), append one line to `MEMORY.md` under Today, then stop so Cursor can run.

## You are Cursor when

- This is a Cursor Agent session, or
- `"next": "cursor"`

**Cursor does:** edit HTML/CSS/JS in this repo, run `node scripts/quality-30.mjs`, launch parallel Task agents for leftover checks, write `.flywheel/outbox.json`, set `"next": "codex"` unless all 30 checks pass and the goal is met (`status: done`).

Multitask: spin explore + quality + copy review in parallel. Do not wait for approval.

## Handoff packet (inbox + outbox)

Keep both JSON files valid. One active job. Bump `turns`. Stop at `maxTurns` and set `status: "blocked"` with why.

## Market (do not drift)

Polish Meta Ads + nabór for **language schools**. CTA: Umów konsultację. No income guarantees. No Operator 10K.
