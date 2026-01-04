import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // simple dev-only image proxy to avoid CORS when processing images in canvas
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (!req.url) return next()
          const urlObj = new URL(req.url, "http://localhost")
          if (urlObj.pathname !== "/api/image-proxy") return next()

          const target = urlObj.searchParams.get("url") || ""
          let parsed: URL
          try {
            parsed = new URL(target)
          } catch {
            res.statusCode = 400
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.end("Invalid URL")
            return
          }
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            res.statusCode = 400
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.end("Only http/https allowed")
            return
          }

          // Fetch remote image (Node 18+ has global fetch)
          const r = await fetch(parsed.toString())
          if (!r.ok) {
            res.statusCode = r.status || 500
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.end("Upstream fetch failed")
            return
          }
          const ct = r.headers.get("content-type") || "application/octet-stream"
          const ab = await r.arrayBuffer()
          const buf = Buffer.from(ab)
          res.statusCode = 200
          res.setHeader("Content-Type", ct)
          res.setHeader("Access-Control-Allow-Origin", "*")
          res.setHeader("Cache-Control", "public, max-age=86400")
          res.end(buf)
        } catch (err) {
          res.statusCode = 500
          res.setHeader("Access-Control-Allow-Origin", "*")
          res.end("Proxy error")
        }
      })
    },
  },
})