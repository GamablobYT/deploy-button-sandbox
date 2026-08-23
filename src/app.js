const fields = {
  provider: document.querySelector("#provider"),
  environment: document.querySelector("#environment"),
  commit: document.querySelector("#commit"),
  builtAt: document.querySelector("#built-at"),
  link: document.querySelector("#deployment-link"),
  status: document.querySelector("#status")
};

function shortCommit(value) {
  return value === "local-build" ? value : value.slice(0, 8);
}

try {
  const response = await fetch("./deployment.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`metadata request returned ${response.status}`);
  const metadata = await response.json();

  fields.provider.textContent = metadata.provider;
  fields.environment.textContent = metadata.environment;
  fields.commit.textContent = shortCommit(metadata.commitSha);
  fields.commit.title = metadata.commitSha;
  fields.builtAt.textContent = new Date(metadata.builtAt).toLocaleString();
  fields.status.textContent = "Deployment telemetry received. Launch confirmed.";

  if (metadata.deploymentUrl) {
    fields.link.href = metadata.deploymentUrl;
    fields.link.hidden = false;
  }
} catch (error) {
  fields.status.textContent = `Site loaded, but telemetry was unavailable: ${error.message}`;
}

