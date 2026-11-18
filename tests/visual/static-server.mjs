import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, relative, resolve } from "node:path";

const root = resolve("out");
const port = 3107;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
    let filePath = resolve(root, `.${pathname}`);
    if (relative(root, filePath).startsWith("..")) throw new Error("Invalid path");
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = join(filePath, "index.html");
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

export function startStaticServer() {
  return new Promise((resolveStart, rejectStart) => {
    server.once("error", rejectStart);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", rejectStart);
      resolveStart(server);
    });
  });
}
