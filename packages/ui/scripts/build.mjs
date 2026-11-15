import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const destination = join(root, "dist");
const output = mkdtempSync(join(tmpdir(), "mdopeace-ui-build-"));
try {
  execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", join(root, "tsconfig.json"), "--outDir", output], { stdio: "inherit" });

  // Keep modules separate so React client boundaries and tree shaking survive.
  for (const entry of readdirSync(output, { recursive: true })) {
    if (!entry.endsWith(".js") && !entry.endsWith(".d.ts")) continue;
    const file = join(output, entry);
    writeFileSync(file, readFileSync(file, "utf8").replace(
      /(from\s+|import\s*)(["'])(\.[^"']+)\2/g,
      (match, prefix, quote, specifier) => /\.(?:js|css)$/.test(specifier) ? match : `${prefix}${quote}${specifier}.js${quote}`,
    ));
  }
  for (const entry of readdirSync(join(root, "src"))) {
    if (entry.endsWith(".css")) cpSync(join(root, "src", entry), join(output, entry));
  }
  cpSync(join(root, "styles/tokens.css"), join(output, "tokens.css"));
  cpSync(join(root, "src/css.d.ts"), join(output, "css.d.ts"));
  // Do not remove live output first: Next's file watcher may cache missing imports.
  cpSync(output, destination, { recursive: true });
  for (const entry of readdirSync(destination, { recursive: true })) {
    if (!existsSync(join(output, entry))) rmSync(join(destination, entry), { recursive: true, force: true });
  }
} finally {
  rmSync(output, { recursive: true, force: true });
}
