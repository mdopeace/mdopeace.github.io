import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { assertOnlyVersionChanges, assertVersionFiles, bumpWorkspace, compareVersions, parseVersion, resolveVersion, verifyPackage, versionFiles } from "../scripts/ui-release-version.mjs";

const documents = () => [
  { name: "@mdopeace/ui", version: "0.1.0", license: "MIT", scripts: { build: "node build.mjs" } },
  { version: "4.0.0", dependencies: { "@mdopeace/ui": "0.1.0", react: "19.3.0" } },
  { version: "4.0.0", packages: { "": { dependencies: { "@mdopeace/ui": "0.1.0" } }, "packages/ui": { version: "0.1.0", license: "MIT" } } },
];
function workspace(directory, values = documents()) {
  values.forEach((value, index) => {
    const path = join(directory, versionFiles[index]);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
  });
}
function scratch(fn) {
  const directory = mkdtempSync(join(tmpdir(), "ui-release-test-"));
  try { return fn(directory); } finally { rmSync(directory, { recursive: true, force: true }); }
}

test("release versions reject malformed, oversized and shell-like input", () => {
  for (const version of ["v1.2.3", "01.2.3", "1.2", "1.2.3-beta", "1.2.3\nmain", "$(whoami)", "1.2.9007199254740992"]) {
    assert.throws(() => parseVersion(version));
  }
  assert.deepEqual(parseVersion("0.0.0"), [0, 0, 0]);
});
test("bumping handles carry/reset, numeric ordering, first publication and downgrades", () => {
  assert.equal(resolveVersion("1.9.9", "minor"), "1.10.0");
  assert.equal(resolveVersion("1.9.9", "major"), "2.0.0");
  assert.equal(resolveVersion("0.1.0", "patch"), "0.1.1");
  assert.equal(resolveVersion("0.1.0", "patch", "0.1.0"), "0.1.0");
  assert.equal(compareVersions("1.10.0", "1.9.9"), 1);
  assert.throws(() => resolveVersion("1.0.0", "patch", "0.9.9"));
  assert.throws(() => resolveVersion("1.0.0", "other"));
});
test("workspace bump updates the library and lock references without bumping the portfolio", () => scratch(directory => {
  workspace(directory);
  bumpWorkspace(directory, "0.2.0");
  const head = versionFiles.map(file => JSON.parse(readFileSync(join(directory, file), "utf8")));
  assert.equal(head[0].version, "0.2.0");
  assert.equal(head[1].version, "4.0.0");
  assert.equal(head[1].dependencies["@mdopeace/ui"], "0.2.0");
  assert.equal(head[2].packages["packages/ui"].version, "0.2.0");
  assertOnlyVersionChanges(documents(), head, "0.2.0");
  head[1].scripts = { postinstall: "unexpected code" };
  assert.throws(() => assertOnlyVersionChanges(documents(), head, "0.2.0"), /beyond/);
}));
test("inconsistent workspace versions fail before writing any files", () => scratch(directory => {
  const values = documents(); values[2].packages["packages/ui"].version = "0.0.1";
  workspace(directory, values);
  const before = readFileSync(join(directory, versionFiles[0]), "utf8");
  assert.throws(() => bumpWorkspace(directory, "0.2.0"), /inconsistent/);
  assert.equal(readFileSync(join(directory, versionFiles[0]), "utf8"), before);
}));
test("release PRs may only change expected version files and package identity must match", () => {
  assertVersionFiles(versionFiles);
  assert.throws(() => assertVersionFiles([...versionFiles, ".github/workflows/release.yml"]));
  verifyPackage(documents()[0], "0.1.0");
  for (const metadata of [{ name: "other", version: "0.1.0", license: "MIT" },
    { ...documents()[0], version: "0.2.0" }, { ...documents()[0], license: "UNLICENSED" }]) {
    assert.throws(() => verifyPackage(metadata, "0.1.0"));
  }
});

// Fake only the external CLIs: exercise the actual release orchestration without
// credentials, network mutations or a real repository push.
function releaseRun(mode, scenario = {}) {
  return scratch(directory => {
    workspace(directory);
    const bin = join(directory, "bin"); mkdirSync(bin);
    const commit = "a".repeat(40), head = "b".repeat(40), base = "c".repeat(40);
    const archiveRoot = join(directory, "archive"); mkdirSync(join(archiveRoot, "package"), { recursive: true });
    writeFileSync(join(archiveRoot, "package/package.json"), JSON.stringify(documents()[0]));
    const archive = join(directory, "mdopeace-ui-0.1.0.tgz");
    execFileSync("tar", ["-czf", archive, "-C", archiveRoot, "package"]);
    const config = { mode, commit, head, base, archive, directory, original: documents(), ...scenario };
    writeFileSync(join(directory, "scenario.json"), JSON.stringify(config));
    const cli = `#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const c=JSON.parse(fs.readFileSync(process.env.MOCK_SCENARIO,'utf8'));
const program=path.basename(process.argv[1]),args=process.argv.slice(2);
fs.appendFileSync(path.join(c.directory,'calls'),JSON.stringify({program,args})+'\\n');
const out=value=>{process.stdout.write(typeof value==='string'?value:JSON.stringify(value));process.exit(0);};
const missing=()=>{process.stderr.write('gh: Not Found (HTTP 404)');process.exit(1);};
if(program==='git'){if(args[0]==='rev-parse')out(args[1].startsWith('refs/tags/')?c.tagCommit:c.commit);out('');}
if(program==='npm'){fs.copyFileSync(c.archive,path.join(args[args.indexOf('--pack-destination')+1],path.basename(c.archive)));out([{filename:path.basename(c.archive),files:(c.packFiles||['LICENSE','NOTICE','README.md','package.json','dist/index.js','dist/index.d.ts','dist/tokens.css']).map(path=>({path}))}]);}
if(args[0]==='pr')out('');
if(args[0]==='release')out('');
const endpoint=args[3];const input=args.includes('--input')?JSON.parse(fs.readFileSync(0,'utf8')):null;
if(endpoint==='repos/mdopeace/mdopeace.github.io')out({allow_auto_merge:true});
if(endpoint.includes('/contents/')){const relative=endpoint.split('/contents/')[1].split('?')[0];const ref=endpoint.split('ref=')[1];const value=ref===c.base?c.original[['packages/ui/package.json','package.json','package-lock.json'].indexOf(relative)]:JSON.parse(fs.readFileSync(path.join(c.directory,relative),'utf8'));out({content:Buffer.from(JSON.stringify(value)).toString('base64')});}
if(endpoint.includes('/files?'))out(['packages/ui/package.json','package.json','package-lock.json'].map(filename=>({filename})));
const pr={number:1,html_url:'https://github.com/mdopeace/mdopeace.github.io/pull/1',state:'open',head:{sha:c.head,repo:{full_name:'mdopeace/mdopeace.github.io'}},base:{ref:'main',sha:c.base}};
if(endpoint.includes('/pulls?'))out([]);
if(endpoint.endsWith('/pulls'))out(pr);
if(endpoint.endsWith('/pulls/1'))out({...pr,state:'closed',merged_at:'2026-11-15',merge_commit_sha:c.commit});
if(endpoint.includes('/releases/tags/')){if(c.existingRelease)out(c.existingRelease);missing();}
if(endpoint.includes('/git/ref/tags/')){if(c.tagCommit)out({object:{sha:c.tagCommit}});missing();}
if(endpoint.includes('/git/ref/heads/'))missing();
if(endpoint.endsWith('/releases'))out({id:1,html_url:'https://github.com/mdopeace/mdopeace.github.io/releases/tag/ui-v0.1.0',target_commitish:c.commit,...input});
if(endpoint.endsWith('/releases/1'))out(input);
throw new Error('Unhandled CLI call '+JSON.stringify(args));
`;
    for (const program of ["git", "gh", "npm"]) {
      const file = join(bin, program); writeFileSync(file, cli); chmodSync(file, 0o755);
    }
    writeFileSync(join(bin, "package.json"), '{"type":"module"}');
    const result = spawnSync(process.execPath, [resolve(".github/scripts/release-ui.mjs"), mode], {
      cwd: directory, encoding: "utf8", env: { ...process.env, PATH: bin + ":" + process.env.PATH, TMPDIR: directory,
        MOCK_SCENARIO: join(directory, "scenario.json"), GITHUB_REPOSITORY: "mdopeace/mdopeace.github.io",
        GITHUB_RUN_ID: "1234", GITHUB_REF: "refs/heads/main", GITHUB_OUTPUT: join(directory, "outputs"),
        BUMP: "patch", EXACT_VERSION: scenario.exact || "", RELEASE_VERSION: "0.1.0", RELEASE_SHA: commit },
    });
    const calls = readFileSync(join(directory, "calls"), "utf8").trim().split("\n").map(line => JSON.parse(line));
    return { result, calls };
  });
}
test("initial publication resolves the protected commit without a direct main push", () => {
  const { result, calls } = releaseRun("prepare", { exact: "0.1.0" });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!calls.some(call => call.program === "git" && call.args[0] === "push"));
});
test("version release creates a branch PR and enables protected auto-merge without admin bypass", () => {
  const { result, calls } = releaseRun("prepare");
  assert.equal(result.status, 0, result.stderr);
  assert.ok(calls.some(call => call.program === "git" && call.args.join(" ") === "push --set-upstream origin release/ui-1234"));
  assert.ok(calls.some(call => call.program === "gh" && call.args.includes("--auto") && call.args.includes("--match-head-commit")));
  assert.ok(!calls.some(call => call.args.includes("--admin") || call.args.includes("--force")));
});
test("release publication stages assets in a draft before making it public", () => {
  const { result, calls } = releaseRun("publish");
  assert.equal(result.status, 0, result.stderr);
  const upload = calls.findIndex(call => call.program === "gh" && call.args[0] === "release");
  const publish = calls.findIndex(call => call.program === "gh" && call.args.includes("PATCH"));
  assert.ok(upload >= 0 && publish > upload);
});
test("publication refuses existing releases, conflicting tags and leaking source archives", () => {
  for (const scenario of [{ existingRelease: { draft: false } }, { tagCommit: "d".repeat(40) },
    { packFiles: ["LICENSE", "NOTICE", "dist/index.js", "dist/index.d.ts", "dist/tokens.css", "app/page.tsx"] }]) {
    const { result, calls } = releaseRun("publish", scenario);
    assert.notEqual(result.status, 0);
    assert.ok(!calls.some(call => call.program === "gh" && call.args.includes("POST")));
  }
});
