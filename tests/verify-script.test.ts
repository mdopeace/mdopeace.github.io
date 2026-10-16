import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";

// The deploy-critical claim is "the build emits .nojekyll". Asserting
// existsSync("out/.nojekyll") only proves some earlier build ran — it passes
// on a dirty machine and fails on a clean checkout. These tests run the real
// script against a throwaway output directory.

const dirFor = (name: string) => `out-verify-${name}`;

/** Runs scripts/verify.mjs with its output directory swapped for a temp one. */
function runVerify(dir: string, probeName: string) {
  // verify.mjs refers to the output dir as the "out/" prefix throughout.
  const script = readFileSync("scripts/verify.mjs", "utf8").replaceAll(
    '"out/',
    `"${dir}/`,
  );
  const tmp = `scripts/.probe-${probeName}.mjs`;
  writeFileSync(tmp, script);
  try {
    return execFileSync(process.execPath, [tmp], {
      encoding: "utf8",
      stdio: "pipe",
    });
  } finally {
    rmSync(tmp, { force: true });
  }
}

test("verify.mjs emits .nojekyll into the build output", () => {
  const dir = dirFor("ok");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, "<!doctype html><title>probe</title>");
  writeFileSync(`${dir}/404.html`, "<!doctype html><title>404</title>");
  // Deliberately no .nojekyll.

  try {
    const out = runVerify(dir, "ok");
    assert.match(out, /Build output OK/);
    assert.ok(existsSync(`${dir}/.nojekyll`), "verify.mjs did not create .nojekyll");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("verify.mjs fails loudly when the build produced nothing", () => {
  const dir = dirFor("empty");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  try {
    let failed = false;
    try {
      runVerify(dir, "empty");
    } catch {
      failed = true;
    }
    assert.ok(failed, "verify.mjs exited 0 on an empty output directory");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});