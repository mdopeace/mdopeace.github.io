import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

export const versionFiles = ["packages/ui/package.json", "package.json", "package-lock.json"];

export function parseVersion(value) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) {
    throw new Error("Version must be MAJOR.MINOR.PATCH without prefixes or leading zeros");
  }
  const parts = value.split(".").map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error("Version number is too large");
  return parts;
}

export function compareVersions(left, right) {
  const a = parseVersion(left), b = parseVersion(right);
  for (let index = 0; index < 3; index++) if (a[index] !== b[index]) return Math.sign(a[index] - b[index]);
  return 0;
}

export function resolveVersion(current, bump, exact = "") {
  const parts = parseVersion(current);
  if (!["patch", "minor", "major"].includes(bump)) throw new Error("Invalid version bump");
  const index = { major: 0, minor: 1, patch: 2 }[bump];
  if (!exact) {
    parts[index]++;
    parts.fill(0, index + 1);
  }
  const version = exact || parts.join(".");
  parseVersion(version);
  if (compareVersions(version, current) < 0) throw new Error("Releases cannot downgrade the UI version");
  return version;
}

export function assertVersionFiles(files) {
  if (files.length !== versionFiles.length || !versionFiles.every(file => files.includes(file))) {
    throw new Error("A release PR must change only the three workspace version files");
  }
}

function updatedDocuments(documents, version, allowSame = false) {
  parseVersion(version);
  const copies = structuredClone(documents);
  const [ui, app, lock] = copies;
  const current = ui.version;
  if (ui.name !== "@mdopeace/ui" || app.dependencies[ui.name] !== current ||
      lock.packages[""].dependencies[ui.name] !== current || lock.packages["packages/ui"].version !== current) {
    throw new Error("Workspace versions are inconsistent; fix them before releasing");
  }
  const comparison = compareVersions(version, current);
  if (comparison < 0 || (comparison === 0 && !allowSame)) throw new Error("A version bump must increase the UI version");
  ui.version = version;
  app.dependencies[ui.name] = version;
  lock.packages[""].dependencies[ui.name] = version;
  lock.packages["packages/ui"].version = version;
  return copies;
}

export function assertOnlyVersionChanges(base, head, version) {
  if (!isDeepStrictEqual(updatedDocuments(base, version, true), head)) {
    throw new Error("Release PR includes changes beyond the UI version and workspace references");
  }
}

export function bumpWorkspace(directory, version) {
  const documents = versionFiles.map(file => JSON.parse(readFileSync(join(directory, file), "utf8")));
  updatedDocuments(documents, version).forEach((document, index) => writeFileSync(join(directory, versionFiles[index]), JSON.stringify(document, null, 2) + "\n"));
}

export function verifyPackage(metadata, version) {
  parseVersion(version);
  if (metadata.name !== "@mdopeace/ui" || metadata.version !== version || metadata.license !== "MIT") {
    throw new Error("Archive identity, version or license does not match the release");
  }
}
