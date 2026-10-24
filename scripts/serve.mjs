// Tiny static server for the test suite (and for previewing the built site):
//   node scripts/serve.mjs [port]
// Serves the repo root the way GitHub Pages does. No dependencies.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.argv[2] || 4173);
const root = process.cwd();
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".css": "text/css", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) throw new Error("forbidden");
    if ((await stat(file)).isDirectory()) { res.writeHead(301, { Location: path + "/" }); return res.end(); }
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} at http://127.0.0.1:${port}/`));
