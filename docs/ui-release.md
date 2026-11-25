# UI releases and merge protection

The UI package is distributed as a versioned GitHub Release archive, not through
npm publishing. Its npm `private` flag remains enabled. The portfolio continues
to consume the same package through the local workspace.

## Flow

Run the **UI Release** workflow from `main`. Choose `patch`, `minor` or `major`,
or enter an exact `MAJOR.MINOR.PATCH` version. To publish the initial package at
its existing version, enter `0.1.0` explicitly.

1. A repository-scoped GitHub App token creates `release/ui-<run ID>` and a PR.
   Only the UI version, the portfolio's workspace dependency and their lockfile
   references may change. Both file names and JSON contents are checked.
2. The PR must pass the required GitHub Actions `test` check against up-to-date
   `main`, with all conversations resolved. The workflow enables squash
   auto-merge; it does not use an admin bypass or push directly to `main`.
3. The publisher checks out the PR's exact merged commit, not a newer `main` tip,
   and runs all validation again. A first publication at the current version
   makes no source edit or PR; it validates the existing protected main commit.
4. The publisher packs `@mdopeace/ui`, checks archive identity, version, license
   and allowed files, and computes SHA-256. It stages both files in a draft.
5. The draft becomes public as `ui-v<version>` / **UI v<version>** only after
   uploads succeed. Existing published releases and conflicting tags are never
   overwritten. Only that run's merged release branch is cleaned up.

Releases are serialized and are not cancelled mid-publication. Reruns reuse the
run's PR and version rather than bumping again. Closed unmerged PRs, inconsistent
workspace versions, downgrades and unexpected changes stop the workflow. If a PR
is behind main, the App requests a normal branch update and CI runs again. A
30-minute wait limit leaves the PR available for inspection; rerun after fixing
the issue. Already published versions are refused rather than silently replaced.

For use in another React site, install the release's `.tgz` download URL and import
`@mdopeace/ui/tokens.css` once. Pin a specific release URL instead of a moving
`latest` URL, and verify the accompanying `.sha256` file when downloading manually.

## One-time App configuration

Use the private `mdopeace-ui-release-bot` App owned by `mdopeace`. Its
installation is limited to `mdopeace/mdopeace.github.io`, with repository **Contents: read and write** and
**Pull requests: read and write**. It needs no branch-protection bypass,
administration write access or review-approval permission.

Configure these repository Actions secrets:

- `RELEASE_APP_ID`: the App ID.
- `RELEASE_APP_PRIVATE_KEY`: the App's PEM private key.

Private key material belongs in GitHub Actions secrets, never in source files,
issues or chat. GitHub does not allow reading back or copying another repository's
encrypted secret values. Missing secrets or installation permissions stop the
workflow before a release PR or tag is created.

The App identity is important: ordinary `GITHUB_TOKEN` pushes do not trigger
downstream push workflows, and automation-created PR runs may require approval.
App tokens let normal CI and Pages workflows run without weakening their gates.
See [GitHub's workflow-trigger documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

## Repository settings

`main` should retain all these settings:

- PRs required, stale review dismissal enabled, and unresolved conversations
  block merging. The solo-maintainer configuration uses zero mandatory reviews,
  matching the Vidp reference; this does not waive CI or discussion resolution.
- GitHub Actions `test` is required, with strict/up-to-date branch checking.
- Protections apply to administrators. Force pushes and branch deletion are
  disallowed. No App is granted a bypass.
- Repository auto-merge is enabled, allowing the protected release PR flow.
- The default Actions token is read-only and cannot approve PR reviews. Jobs
  request additional permissions explicitly; only the Pages deploy job receives
  Pages/OIDC publishing rights, and release writes use the scoped App token.

The `test` job name is intentionally stable because the branch rule requires it.
Release and Pages jobs use different job names. Do not skip CI for App/bot PRs.

## Validation

[The composite validation action](../.github/actions/validate/action.yml) is shared
by PR CI, Pages builds and release publishing. It runs pinned/checksummed
actionlint, ESLint, release protocol
tests, component tests, the static build, exported-page/link checks, browser
tests and the independently installed package test on Node 26.

Local checks:

```sh
actionlint
npm run test:release
npm run lint
npm run test:ui
npm run build
npm test
npm run test:e2e
npm run test:package
```

Release protocol tests simulate Git/GitHub/npm commands locally. They cover
version synchronization, version-only PRs, protected auto-merge, draft-before-
publication ordering and refusal to replace published releases or conflicting
tags. They do not prove that an App installation or its secrets are configured.
End-to-end publishing can only be verified after the workflow reaches `main`,
the App is configured, and a maintainer explicitly starts an actual release.
