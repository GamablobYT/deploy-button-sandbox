import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = join(rootDirectory, "src");
const outputDirectory = join(rootDirectory, "dist");

if (dirname(outputDirectory) !== rootDirectory) {
  throw new Error("Refusing to clean an output directory outside the sandbox root.");
}

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const metadata = {
  provider: process.env.DEPLOY_PROVIDER ?? (process.env.VERCEL === "1" ? "vercel" : "local"),
  environment: process.env.DEPLOY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? "local",
  commitSha: process.env.DEPLOY_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "local-build",
  deploymentUrl: process.env.DEPLOY_RUN_URL ?? vercelUrl,
  configuration: {
    requiredSecretPresent: Boolean(process.env.SANDBOX_REQUIRED_SECRET),
    publicMessagePresent: Boolean(process.env.SANDBOX_PUBLIC_MESSAGE),
    defaultedFlagPresent: Boolean(process.env.SANDBOX_DEFAULTED_FLAG)
  },
  builtAt: new Date().toISOString()
};

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(sourceDirectory, outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, "deployment.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

console.log(`Built Deploy Button sandbox in ${outputDirectory}`);
