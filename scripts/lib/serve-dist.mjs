import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
};

/**
 * Serves dist/ on a free local port, in one of two modes.
 *
 * shell (prerender): every request that is not an existing asset gets the pristine
 *   app shell passed in — never an HTML file from disk. dist/index.html is overwritten
 *   by the prerendered homepage during the run; serving that to later routes would
 *   bake the homepage's markup and metadata into every page.
 *
 * no shell (verify): behaves like Azure Static Web Apps with no navigation fallback —
 *   /about-us serves about-us/index.html, anything unknown is a real 404 carrying
 *   404.html, and the globalHeaders from staticwebapp.config.json (the CSP above all)
 *   are sent, so a policy that breaks the app fails the build instead of production.
 */
export async function serveDist(dist, { shell, headers = {} } = {}) {
  const send = (res, status, file, body) => {
    res.writeHead(status, { ...headers, "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body ?? readFileSync(file));
  };
  const isFile = (file) => existsSync(file) && statSync(file).isFile();

  const server = createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const file = normalize(join(dist, urlPath));
      if (file !== dist && !file.startsWith(dist + sep)) return send(res, 403, "error.txt", "forbidden");

      if (shell !== undefined) {
        if (extname(file) !== ".html" && isFile(file)) return send(res, 200, file);
        return send(res, 200, "shell.html", shell);
      }

      if (isFile(file)) return send(res, 200, file);
      const index = join(file, "index.html");
      if (isFile(index)) return send(res, 200, index);
      const notFound = join(dist, "404.html");
      return isFile(notFound) ? send(res, 404, notFound) : send(res, 404, "error.txt", "not found");
    } catch {
      res.writeHead(500).end("error");
    }
  });

  const port = await new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server.address().port)));
  return { base: `http://127.0.0.1:${port}`, close: () => new Promise((ok) => server.close(ok)) };
}
