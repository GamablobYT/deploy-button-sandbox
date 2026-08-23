import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(rootDirectory, "dist");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = resolve(outputDirectory, normalize(relativePath));

  if (filePath !== outputDirectory && !filePath.startsWith(`${outputDirectory}\\`) && !filePath.startsWith(`${outputDirectory}/`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const details = await stat(filePath);
    if (!details.isFile()) throw new Error("not_a_file");
    response.writeHead(200, { "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Deploy Button sandbox: http://127.0.0.1:${port}`);
});
