#!/usr/bin/env node
/**
 * Codex (phone) and Cursor share .flywheel/inbox.json + outbox.json.
 *   node scripts/flywheel.mjs status
 *   node scripts/flywheel.mjs ticket --from codex --next cursor --goal "..." --ticket "..."
 *   node scripts/flywheel.mjs handoff --from cursor --summary "..." --ask "..."
 *   node scripts/flywheel.mjs done --summary "..."
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inboxPath = path.join(root, ".flywheel", "inbox.json");
const outboxPath = path.join(root, ".flywheel", "outbox.json");
const memoryPath = path.join(root, "MEMORY.md");

const args = process.argv.slice(2);
const cmd = args[0] || "status";
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : "";
};

const readJson = (p, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
};

const writeJson = (p, obj) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
};

const appendMemory = (line) => {
  const stamp = new Date().toISOString().slice(0, 16);
  fs.appendFileSync(memoryPath, `\n- ${stamp} ${line}`);
};

const quality = () => {
  const r = spawnSync(process.execPath, [path.join(root, "scripts", "quality-30.mjs")], {
    encoding: "utf8",
    cwd: root,
  });
  return {
    ok: r.status === 0,
    report: (r.stdout || "") + (r.stderr || ""),
  };
};

let inbox = readJson(inboxPath, {
  id: "job-1",
  from: "phone-codex",
  next: "cursor",
  status: "open",
  turns: 0,
  maxTurns: 12,
  goal: "",
  ticket: "",
  notes: [],
});

if (cmd === "status") {
  const q = quality();
  console.log(JSON.stringify({ inbox, qualityOk: q.ok, lastLines: q.report.trim().split("\n").slice(-3) }, null, 2));
  process.exit(q.ok ? 0 : 1);
}

if (cmd === "ticket") {
  inbox = {
    ...inbox,
    id: flag("id") || `job-${Date.now()}`,
    from: flag("from") || "codex",
    next: flag("next") || "cursor",
    status: "open",
    turns: Number(inbox.turns || 0),
    maxTurns: Number(flag("max") || inbox.maxTurns || 12),
    goal: flag("goal") || inbox.goal,
    ticket: flag("ticket") || inbox.ticket,
    notes: inbox.notes || [],
  };
  writeJson(inboxPath, inbox);
  appendMemory(`Codex ticket → Cursor: ${inbox.ticket}`);
  console.log("inbox ready for Cursor");
  process.exit(0);
}

if (cmd === "handoff") {
  const q = quality();
  const passed = (q.report.match(/PASS /g) || []).length;
  const failed = (q.report.match(/FAIL /g) || []).length;
  inbox.turns = Number(inbox.turns || 0) + 1;
  inbox.from = flag("from") || "cursor";
  inbox.next = "codex";
  inbox.status = inbox.turns >= inbox.maxTurns ? "blocked" : "review";
  inbox.notes = [...(inbox.notes || []), flag("summary") || "cursor shipped"];
  writeJson(inboxPath, inbox);
  writeJson(outboxPath, {
    jobId: inbox.id,
    from: "cursor",
    status: q.ok ? "checks-pass" : "checks-fail",
    summary: flag("summary") || "",
    quality: { passed, failed, report: q.report },
    filesTouched: (flag("files") || "").split(",").filter(Boolean),
    askCodex: flag("ask") || "Review outbox, write the next ticket or mark done.",
  });
  appendMemory(`Cursor handoff (${passed}/30): ${flag("summary") || "shipped"}`);
  console.log(q.report);
  console.log("handed to Codex");
  process.exit(0);
}

if (cmd === "done") {
  inbox.status = "done";
  inbox.next = "none";
  writeJson(inboxPath, inbox);
  writeJson(outboxPath, {
    ...readJson(outboxPath, {}),
    status: "done",
    summary: flag("summary") || "goal met, 30/30",
  });
  appendMemory(`DONE: ${flag("summary") || inbox.goal}`);
  console.log("flywheel closed");
  process.exit(0);
}

console.error("unknown command");
process.exit(2);
