import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/')) {
            // Remove query params for path resolution
            const urlPath = req.url.split('?')[0];
            const filePath = path.resolve(process.cwd(), `.${urlPath}.js`);
            
            if (fs.existsSync(filePath)) {
              try {
                // Read the body for POST requests
                let body = '';
                await new Promise((resolve) => {
                  req.on('data', chunk => body += chunk);
                  req.on('end', resolve);
                });

                if (body) {
                  try { req.body = JSON.parse(body); } catch (e) { req.body = body; }
                }

                // Add simple Vercel-like res helpers
                res.status = (code) => { res.statusCode = code; return res; };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                // Dynamic import the API handler
                const module = await server.ssrLoadModule(filePath);
                const handler = module.default;
                
                await handler(req, res);
                return;
              } catch (error) {
                console.error('API Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
                return;
              }
            }
          }
          next();
        });
      }
    }
  ],
})
