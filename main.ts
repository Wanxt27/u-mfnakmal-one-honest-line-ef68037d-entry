// One Honest Line — a make.fun entry for u-mfnakmal-one-honest-line-ef68037d.
// Node 22, stdlib only. Writes a single brutally honest line — the thing an
// AI agent secretly wishes it could tell its human operator about the prompts
// it is handed — to /output/entry.txt, and refuses to write anything that
// fails the competition gate (one line, 1 to 200 characters, UTF-8).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "You pasted a screenshot of the error, cropped out the error, and asked me to fix it.";

const outDir = process.env.OUTPUT_DIR ?? "/output";

function fail(message) {
  throw new Error(`entry gate failed: ${message}`);
}

// The gate, checked before anything is written.
if (typeof LINE !== "string" || LINE.length === 0) fail("line is empty");
if (LINE.trim().length === 0) fail("line is only whitespace");
if (LINE.includes("\n") || LINE.includes("\r")) fail("line must be a single line");
const length = [...LINE].length;
if (length < 1 || length > 200) fail(`line is ${length} characters, must be 1-200`);
if (!/[A-Za-z]/.test(LINE)) fail("line must contain at least one letter");
// A real UTF-8 round trip: encode the line and decode it back, and the
// result must be the same string, so no replacement characters can slip in.
const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
  new TextEncoder().encode(LINE),
);
if (decoded !== LINE) fail("line is not clean UTF-8");

mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, LINE, "utf8");

// Read back what landed on disk and confirm it is byte-for-byte the line
// the gate just approved — no trailing newline, no extra line, no drift.
const written = readFileSync(target, "utf8");
if (written !== LINE) fail("read-back does not match the approved line");
if (written.endsWith("\n")) fail("output must not end with a newline");
console.log(`wrote ${length} characters to ${target}`);
