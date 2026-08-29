# Deploy Button Sandbox

A disposable static site for testing Deploy Button end to end. It has no runtime backend, database, real credentials, analytics, external assets, or paid dependencies. Repeated deployments only replace the same static site.

Published reference: [`GamablobYT/deploy-button-sandbox`](https://github.com/GamablobYT/deploy-button-sandbox), [`gamablobyt.github.io/deploy-button-sandbox`](https://gamablobyt.github.io/deploy-button-sandbox/), and [`deploy-button-sandbox-5o71ml5rw-gamablob.vercel.app`](https://deploy-button-sandbox-5o71ml5rw-gamablob.vercel.app/).

Recorded live evidence for commit `e5dad62`:

- required `unit-tests` run [`32713273058`](https://github.com/GamablobYT/deploy-button-sandbox/actions/runs/32713273058);
- Deploy Button-mediated GitHub Pages run [`32713926479`](https://github.com/GamablobYT/deploy-button-sandbox/actions/runs/32713926479);
- clean Deploy Button-mediated Vercel deployment [`dpl_C5Xw2oAUYFj9nkm8Bb5U1Xkirszw`](https://vercel.com/gamablob/deploy-button-sandbox/C5Xw2oAUYFj9nkm8Bb5U1Xkirszw).

The build emits `dist/deployment.json` with non-sensitive telemetry that can be shown in deployment UI and animation work:

- provider;
- environment;
- exact commit SHA;
- provider run/deployment URL when available;
- build timestamp.
- names-only environment-template discovery and present/missing configuration booleans.

## Environment-readiness fixture

The committed `.env.example` declares three names without values:

- `SANDBOX_REQUIRED_SECRET=` is credential-like and should be required by both GitHub Actions and direct Vercel readiness.
- `SANDBOX_PUBLIC_MESSAGE=` has no default and should be required by direct Vercel readiness. Deploy Button deliberately does not fetch GitHub Actions Variables because that API returns values.
- `SANDBOX_DEFAULTED_FLAG=enabled` should be discovered but should not block readiness because the template supplies a default.

Use harmless values such as `sandbox-only` and `hello-sandbox`; never use a real credential. Configure values directly in GitHub or Vercel, not in Deploy Button. The generated `deployment.json` and rendered page expose only whether each setting was present during the build.

## 1. Publish this folder as its own repository

Do not connect the parent Deploy Button monorepo. Copy this directory into a new empty directory, initialize it, and publish that directory as a disposable repository.

PowerShell:

```powershell
$sandboxCopy = Join-Path $env:TEMP "deploy-button-sandbox"
if (Test-Path -LiteralPath $sandboxCopy) { throw "Choose a new disposable directory: $sandboxCopy already exists." }
Copy-Item -Recurse examples/deploy-button-sandbox -Destination $sandboxCopy
Set-Location $sandboxCopy
git init -b main
git add .
git commit -m "Add disposable Deploy Button sandbox"
git remote add origin https://github.com/YOUR_NAME/deploy-button-sandbox.git
git push -u origin main
```

Create the empty GitHub repository before the final two commands. Keep it public or grant the Deploy Button GitHub App access to it.

## 2. Verify locally

Node.js 20 or newer is the only requirement.

```text
npm ci
npm run check
npm run preview
```

Open `http://127.0.0.1:4173`. Stop the preview with Ctrl+C.

## 3A. Deploy through GitHub Actions

This path publishes the site to GitHub Pages and uses one deliberately harmless repository/environment secret for readiness testing. The workflow accepts the exact inputs sent by Deploy Button:

```yaml
inputs:
  environment: production
  commit_sha: <verified Git commit>
  deployment_id: <stable idempotency identity>
```

It checks out `commit_sha` rather than the mutable branch head and includes `deployment_id` in the GitHub run name so a retry cannot attach to an older deployment of the same commit.

1. In the sandbox repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. In Deploy Button, connect the sandbox repository and inspect its capabilities.
3. Create/select a project with branch `main`, executor **GitHub Actions**, environment `production`, and workflow `.github/workflows/deploy-button.yml`.
4. If no branch-protection checks are configured, explicitly acknowledge that in the project setup.
5. Run readiness and confirm `SANDBOX_REQUIRED_SECRET` is reported missing.
6. In GitHub, add `SANDBOX_REQUIRED_SECRET=sandbox-only` as an Actions repository or `production` environment secret. Optionally add `SANDBOX_PUBLIC_MESSAGE=hello-sandbox` as an Actions variable to exercise the rendered build telemetry; Deploy Button will not fetch that variable.
7. Refresh readiness, then deploy. The workflow builds, verifies, uploads, and publishes the static artifact.
8. Follow the Actions run URL from the deployment record. The Pages URL appears on the workflow deployment job and reports only present/missing configuration booleans.

The workflow uses `GITHUB_TOKEN` only through GitHub's Pages actions with explicit `pages: write` and `id-token: write` permissions. The only additional protected value is the deliberately harmless `SANDBOX_REQUIRED_SECRET` readiness fixture; no real provider credential is required.

## 3B. Deploy through direct Vercel

1. Import the same sandbox repository as a new disposable Vercel project.
2. Accept the detected settings from `vercel.json`: build command `npm run build`, output directory `dist`.
3. In Deploy Button, connect Vercel and refresh project discovery.
4. Configure/select the sandbox project with executor **Direct Vercel**, branch `main`, environment `production`, and the disposable Vercel project.
5. Run readiness and confirm `SANDBOX_REQUIRED_SECRET` and `SANDBOX_PUBLIC_MESSAGE` are reported missing while `SANDBOX_DEFAULTED_FLAG` does not block.
6. In the Vercel project, add harmless production values for the two missing names. Refresh readiness, then deploy.
7. Deploy Button sends the linked repository, exact commit SHA, branch, environment, and idempotency key directly to Vercel. The deployed page reports only present/missing configuration booleans.

The repository contains no Vercel token or real secret. Deploy Button's Vercel connection supplies provider authorization outside this repository.

## Make another safe deployment

Change the launch sentence or capsule initials in `src/index.html`, commit, and push. Each commit gives readiness a new immutable SHA while keeping the deployment harmless and visible.

## Cleanup

Cleanup has no shared infrastructure dependencies:

1. Delete the disposable Vercel project from **Vercel → Project Settings → General → Delete Project**.
2. Delete the disposable GitHub repository, or disable Pages under **Settings → Pages** if you want to retain its history.
3. Remove the sandbox project and provider connection from Deploy Button if you no longer want their deployment history in the product.
4. Delete the local copied directory (`$env:TEMP\deploy-button-sandbox` in the example) only after confirming it is the disposable copy.

Deleting the GitHub or Vercel project removes its hosted copy. Deploy Button's audit records may remain by design; they contain deployment identifiers and status history, not repository secret values.
