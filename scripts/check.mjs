import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(rootDirectory, "dist");
const workflowPath = join(rootDirectory, ".github", "workflows", "deploy-button.yml");
const requiredFiles = ["index.html", "styles.css", "app.js", "deployment.json"];

await Promise.all(requiredFiles.map((file) => access(join(outputDirectory, file))));

const html = await readFile(join(outputDirectory, "index.html"), "utf8");
const app = await readFile(join(outputDirectory, "app.js"), "utf8");
const workflow = await readFile(workflowPath, "utf8");
if (!html.includes("Deploy Button Sandbox") || !app.includes("deployment.json")) {
  throw new Error("The built site is missing its title or deployment metadata hook.");
}
for (const workflowContract of [
  "commit_sha:",
  "deployment_id:",
  "run-name: Deploy Button ${{ inputs.deployment_id }}",
  "ref: ${{ inputs.commit_sha }}",
]) {
  if (!workflow.includes(workflowContract)) throw new Error(`The workflow is missing ${workflowContract}.`);
}

const metadata = JSON.parse(await readFile(join(outputDirectory, "deployment.json"), "utf8"));
for (const key of ["provider", "environment", "commitSha", "builtAt"]) {
  if (typeof metadata[key] !== "string" || metadata[key].length === 0) {
    throw new Error(`deployment.json is missing ${key}.`);
  }
}

console.log(`Verified ${requiredFiles.length} build artifacts and deployment metadata.`);
