import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { assertOnlyVersionChanges, assertVersionFiles, bumpWorkspace, compareVersions, parseVersion, resolveVersion, verifyPackage, versionFiles } from "../../scripts/ui-release-version.mjs";

function command(program, args, options = {}) {
  return execFileSync(program, args, { encoding: "utf8", ...options }).trim();
}
function api(endpoint, { method = "GET", data, missing = false } = {}) {
  try {
    const args = ["api", "--method", method, endpoint];
    if (data) args.push("--input", "-");
    const result = command("gh", args, { input: data ? JSON.stringify(data) : undefined, stdio: ["pipe", "pipe", "pipe"] });
    return result ? JSON.parse(result) : null;
  } catch (error) {
    if (missing && String(error.stderr).includes("(HTTP 404)")) return null;
    throw error;
  }
}
function output(values) {
  for (const [key, value] of Object.entries(values)) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}
function sha(value) {
  if (!/^[a-f0-9]{40}$/.test(value || "")) throw new Error("Expected a full commit SHA");
  return value;
}
const repository = process.env.GITHUB_REPOSITORY;
if (repository !== "mdopeace/mdopeace.github.io") throw new Error("Unexpected release repository");
if (process.env.GITHUB_REF !== "refs/heads/main") throw new Error("Run releases from main only");
const endpoint = `repos/${repository}`;
const packageAt = ref => JSON.parse(Buffer.from(api(`${endpoint}/contents/packages/ui/package.json?ref=${encodeURIComponent(ref)}`).content, "base64").toString("utf8"));
const readPackage = () => JSON.parse(readFileSync("packages/ui/package.json", "utf8"));
function validateReleasePR(pr, version) {
  assertVersionFiles(api(`${endpoint}/pulls/${pr.number}/files?per_page=100`).map(file => file.filename));
  const documentsAt = ref => versionFiles.map(file => JSON.parse(Buffer.from(
    api(`${endpoint}/contents/${file}?ref=${sha(ref)}`).content, "base64",
  ).toString("utf8")));
  assertOnlyVersionChanges(documentsAt(pr.base.sha), documentsAt(pr.head.sha), version);
}

async function prepare() {
  if (process.env.GITHUB_REF !== "refs/heads/main") throw new Error("Run releases from main only");
  if (!/^\d+$/.test(process.env.GITHUB_RUN_ID || "")) throw new Error("Invalid workflow run ID");
  if (!api(endpoint).allow_auto_merge) throw new Error("Enable repository auto-merge before releasing");
  command("git", ["fetch", "origin", "main"]);
  command("git", ["checkout", "-B", "main", "origin/main"]);
  const current = readPackage().version;
  const branch = `release/ui-${process.env.GITHUB_RUN_ID}`;
  const owner = repository.split("/")[0];
  const matches = api(`${endpoint}/pulls?state=all&base=main&head=${encodeURIComponent(owner + ":" + branch)}`);
  if (matches.length > 1) throw new Error("More than one release PR matches this run");
  let pr = matches.length ? api(`${endpoint}/pulls/${matches[0].number}`) : null;
  let version;
  if (pr) {
    if (pr.head.repo?.full_name !== repository || pr.base.ref !== "main") throw new Error("Unexpected release PR source");
    version = packageAt(sha(pr.head.sha)).version;
    parseVersion(version);
    validateReleasePR(pr, version);
    if (compareVersions(version, current) < 0) throw new Error("A newer UI version is already on main");
  } else {
    const existingBranch = api(`${endpoint}/git/ref/heads/${branch}`, { missing: true });
    version = existingBranch
      ? packageAt(sha(existingBranch.object.sha)).version
      : resolveVersion(current, process.env.BUMP, process.env.EXACT_VERSION || "");
    parseVersion(version);
    if (compareVersions(version, current) < 0) throw new Error("Release branch is older than main");
    if (api(`${endpoint}/releases/tags/ui-v${version}`, { missing: true })?.draft === false) {
      throw new Error(`UI v${version} is already published; releases are never overwritten`);
    }
    if (version === current && !existingBranch) {
      // Initial publication needs no version edit. Validate this protected commit again before publishing.
      output({ version, tag: `ui-v${version}`, sha: sha(command("git", ["rev-parse", "HEAD"])) });
      return;
    }
    if (existingBranch) {
      command("git", ["fetch", "origin", `refs/heads/${branch}`]);
      command("git", ["checkout", "-B", branch, "FETCH_HEAD"]);
    } else {
      command("git", ["checkout", "-b", branch]);
      bumpWorkspace(process.cwd(), version);
      command("git", ["config", "user.name", "github-actions[bot]"]);
      command("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
      command("git", ["add", ...versionFiles]);
      command("git", ["commit", "-m", `Bump UI version to ${version}`]);
      command("git", ["push", "--set-upstream", "origin", branch]);
    }
    pr = api(`${endpoint}/pulls`, { method: "POST", data: {
      title: `Release UI v${version}`, head: branch, base: "main",
      body: `Bumps @mdopeace/ui to ${version}. Created by UI Release run ${process.env.GITHUB_RUN_ID}. Required CI and branch protection must pass before auto-merge.`,
    } });
    validateReleasePR(pr, version);
  }
  if (!pr.merged_at && pr.state !== "open") throw new Error("Release PR was closed without merging");
  if (!pr.merged_at) {
    command("gh", ["pr", "merge", String(pr.number), "--repo", repository, "--auto", "--squash", "--match-head-commit", sha(pr.head.sha)]);
    for (let attempt = 0; attempt < 60; attempt++) {
      pr = api(`${endpoint}/pulls/${pr.number}`);
      if (pr.merged_at) break;
      if (pr.state !== "open") throw new Error("Release PR was closed without merging");
      const state = JSON.parse(command("gh", ["pr", "view", String(pr.number), "--repo", repository, "--json", "mergeStateStatus"]));
      if (state.mergeStateStatus === "BEHIND") {
        api(`${endpoint}/pulls/${pr.number}/update-branch`, { method: "PUT", data: { expected_head_sha: sha(pr.head.sha) } });
      }
      console.log(`Waiting for required CI and auto-merge: ${pr.html_url} (${attempt + 1}/60)`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  if (!pr.merged_at) throw new Error("Release PR has not merged after 30 minutes; rerun after resolving CI");
  const merged = sha(pr.merge_commit_sha);
  verifyPackage(packageAt(merged), version);
  output({ version, tag: `ui-v${version}`, sha: merged });
}

function publish() {
  const version = process.env.RELEASE_VERSION;
  parseVersion(version);
  const commit = sha(process.env.RELEASE_SHA);
  const tag = `ui-v${version}`;
  if (command("git", ["rev-parse", "HEAD"]) !== commit) throw new Error("Checkout differs from the validated release SHA");
  command("git", ["fetch", "origin", "main"]);
  command("git", ["merge-base", "--is-ancestor", commit, "origin/main"]);
  verifyPackage(readPackage(), version);
  const existing = api(`${endpoint}/releases/tags/${tag}`, { missing: true });
  if (existing && !existing.draft) throw new Error("This version is already published; refusing to overwrite it");
  const ref = api(`${endpoint}/git/ref/tags/${tag}`, { missing: true });
  if (ref) {
    command("git", ["fetch", "origin", `refs/tags/${tag}:refs/tags/${tag}`]);
    if (command("git", ["rev-parse", `refs/tags/${tag}^{commit}`]) !== commit) throw new Error("Existing tag points at a different commit");
  }
  if (existing && existing.target_commitish !== commit) throw new Error("Existing draft belongs to a different commit");
  const directory = mkdtempSync(join(tmpdir(), "ui-release-"));
  const packed = JSON.parse(command("npm", ["pack", "--workspace", "@mdopeace/ui", "--ignore-scripts", "--json", "--pack-destination", directory]));
  if (packed.length !== 1) throw new Error("Expected one package archive");
  const archive = join(directory, basename(packed[0].filename));
  const files = packed[0].files.map(file => file.path);
  if (!["LICENSE", "NOTICE", "dist/index.js", "dist/index.d.ts", "dist/tokens.css"].every(file => files.includes(file))) {
    throw new Error("Package is missing required distribution files");
  }
  if (files.some(file => !["LICENSE", "NOTICE", "README.md", "package.json"].includes(file) && !file.startsWith("dist/"))) {
    throw new Error("Package includes unexpected source or portfolio files");
  }
  verifyPackage(JSON.parse(command("tar", ["-xOf", archive, "package/package.json"])), version);
  const checksum = archive + ".sha256";
  writeFileSync(checksum, `${createHash("sha256").update(readFileSync(archive)).digest("hex")}  ${basename(archive)}\n`);
  const release = existing || api(`${endpoint}/releases`, { method: "POST", data: {
    tag_name: tag, target_commitish: commit, name: `UI v${version}`, draft: true, prerelease: false, generate_release_notes: true,
  } });
  command("gh", ["release", "upload", tag, archive, checksum, "--repo", repository, "--clobber"]);
  api(`${endpoint}/releases/${release.id}`, { method: "PATCH", data: { draft: false, make_latest: "true" } });
  // Clean up only this run's merged release branch, never main or an unrelated branch.
  const branch = `release/ui-${process.env.GITHUB_RUN_ID}`;
  try {
    if (api(`${endpoint}/git/ref/heads/${branch}`, { missing: true })) {
      api(`${endpoint}/git/refs/heads/${branch}`, { method: "DELETE" });
    }
  } catch {
    console.warn(`::warning::Release is published, but ${branch} could not be removed. Clean up that merged branch manually.`);
  }
  console.log(`Published ${release.html_url} from ${commit}`);
}

if (process.argv[2] === "prepare") await prepare();
else if (process.argv[2] === "publish") publish();
else throw new Error("Choose prepare or publish");
