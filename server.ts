import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const stateFile = path.resolve(__dirname, 'public/data/store_state.json');
const distStateFile = path.resolve(__dirname, 'dist/data/store_state.json');

// Ensure data directory exists
const dataDir = path.dirname(stateFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readStoredState(): any {
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    }
  } catch (e) {
    console.warn('[server] Error reading store_state.json:', e);
  }
  return {};
}

function writeStoredState(state: any): boolean {
  try {
    const jsonStr = JSON.stringify(state, null, 2);
    fs.writeFileSync(stateFile, jsonStr, 'utf-8');

    // Also sync to dist if it exists
    const distDataDir = path.dirname(distStateFile);
    if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
      if (!fs.existsSync(distDataDir)) fs.mkdirSync(distDataDir, { recursive: true });
      fs.writeFileSync(distStateFile, jsonStr, 'utf-8');
    }
    return true;
  } catch (e) {
    console.error('[server] Error writing store_state.json:', e);
    return false;
  }
}

async function startServer() {
  const app = express();

  // Parse JSON payloads up to 50MB (for images/products)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API 1: GET /api/store-state
  app.get('/api/store-state', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    const state = readStoredState();
    res.json(state);
  });

  // API 2: POST /api/store-state
  app.post('/api/store-state', (req, res) => {
    try {
      const data = req.body || {};
      const current = readStoredState();

      if (data.settings) {
        current.settings = { ...(current.settings || {}), ...data.settings };
      }
      if (data.products && Array.isArray(data.products)) {
        current.products = data.products;
      }
      if (data.blocks && Array.isArray(data.blocks)) {
        current.blocks = data.blocks;
      }
      if (data.dictionary) {
        current.dictionary = { ...(current.dictionary || {}), ...data.dictionary };
      }
      current.updated_at = new Date().toISOString();

      const success = writeStoredState(current);
      if (success) {
        res.json({ success: true, state: current });
      } else {
        res.status(500).json({ success: false, error: 'Failed to write state file' });
      }
    } catch (err: any) {
      console.error('[server] POST /api/store-state error:', err);
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // API 3: POST /api/save-logo
  app.post('/api/save-logo', (req, res) => {
    try {
      const { image } = req.body || {};
      if (image && typeof image === 'string') {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const publicLogo = path.resolve(__dirname, 'public/logo.png');
        const brandDir = path.resolve(__dirname, 'public/brand');
        if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
        const brandLogo = path.resolve(brandDir, 'wu-official-logo.png');

        fs.writeFileSync(publicLogo, buffer);
        fs.writeFileSync(brandLogo, buffer);
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/apple-touch-icon.png'));
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/brand-touch-icon.png'));
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/brand-favicon.png'));

        try {
          const { execSync } = require('child_process');
          const potrace = require('potrace');
          const ogPreview = path.resolve(__dirname, 'public/og-preview.png');
          const brandOg = path.resolve(__dirname, 'public/brand/wu-og-preview.png');
          const favIco = path.resolve(__dirname, 'public/favicon.ico');
          execSync(`convert -size 1200x630 xc:'#000000' "${publicLogo}" -gravity center -composite -depth 8 "${ogPreview}"`);
          execSync(`cp "${ogPreview}" "${brandOg}"`);
          execSync(`convert "${publicLogo}" -background transparent \\( -clone 0 -resize 16x16 \\) \\( -clone 0 -resize 32x32 \\) \\( -clone 0 -resize 48x48 \\) -delete 0 "${favIco}"`);

          const tempMask = path.resolve(__dirname, 'public/temp-mask.png');
          execSync(`convert "${publicLogo}" -alpha extract -negate "${tempMask}"`);
          potrace.trace(tempMask, { threshold: 128, optTolerance: 0.05, turdSize: 1 }, (pErr: any, svgStr: string) => {
            if (!pErr && svgStr) {
              const m = svgStr.match(/d="([^"]+)"/);
              if (m) {
                const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" fill="none" aria-label="UNUSUAL">\n  <style>\n    .logo-path { fill: #000000; }\n    @media (prefers-color-scheme: dark) {\n      .logo-path { fill: #ffffff; }\n    }\n  </style>\n  <path class="logo-path" fill-rule="evenodd" clip-rule="evenodd" d="${m[1]}" />\n</svg>\n`;
                const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" fill="currentColor" aria-label="UNUSUAL">\n  <path fill-rule="evenodd" clip-rule="evenodd" d="${m[1]}" />\n</svg>\n`;
                fs.writeFileSync(path.resolve(__dirname, 'public/brand-icon.svg'), iconSvg);
                fs.writeFileSync(path.resolve(__dirname, 'public/icon.svg'), iconSvg);
                fs.writeFileSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'), monoSvg);
                fs.writeFileSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'), monoSvg);
              }
            }
          });
        } catch (genErr) {
          console.warn('[server] Warning generating derived preview/favicon:', genErr);
        }

        const distDir = path.resolve(__dirname, 'dist');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.resolve(distDir, 'logo.png'), buffer);
          fs.copyFileSync(publicLogo, path.resolve(distDir, 'apple-touch-icon.png'));
          fs.copyFileSync(publicLogo, path.resolve(distDir, 'brand-touch-icon.png'));
          fs.copyFileSync(publicLogo, path.resolve(distDir, 'brand-favicon.png'));
          if (fs.existsSync(path.resolve(__dirname, 'public/brand-icon.svg'))) {
            fs.copyFileSync(path.resolve(__dirname, 'public/brand-icon.svg'), path.resolve(distDir, 'brand-icon.svg'));
          }
          if (fs.existsSync(path.resolve(__dirname, 'public/icon.svg'))) {
            fs.copyFileSync(path.resolve(__dirname, 'public/icon.svg'), path.resolve(distDir, 'icon.svg'));
          }
          if (fs.existsSync(path.resolve(__dirname, 'public/og-preview.png'))) {
            fs.copyFileSync(path.resolve(__dirname, 'public/og-preview.png'), path.resolve(distDir, 'og-preview.png'));
          }
          if (fs.existsSync(path.resolve(__dirname, 'public/favicon.ico'))) {
            fs.copyFileSync(path.resolve(__dirname, 'public/favicon.ico'), path.resolve(distDir, 'favicon.ico'));
          }
          const distBrand = path.resolve(distDir, 'brand');
          if (!fs.existsSync(distBrand)) fs.mkdirSync(distBrand, { recursive: true });
          fs.writeFileSync(path.resolve(distBrand, 'wu-official-logo.png'), buffer);
          if (fs.existsSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'))) {
            fs.copyFileSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'), path.resolve(distBrand, 'brand-logo.svg'));
          }
          if (fs.existsSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'))) {
            fs.copyFileSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'), path.resolve(distBrand, 'wu-logo.svg'));
          }
        }

        return res.json({ success: true, url: `/logo.png?v=${Date.now()}` });
      }
      return res.status(400).json({ success: false, error: 'Invalid payload: image missing' });
    } catch (err: any) {
      console.error('[server] POST /api/save-logo error:', err);
      return res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // Serve static public assets
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProduction) {
    // Development mode: mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: serve dist static files and SPA fallback
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      const indexPath = path.resolve(__dirname, 'dist/index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        const host = req.get('x-forwarded-host') || req.get('host') || '';
        const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
        if (host) {
          const origin = `${proto}://${host}`;
          html = html.replace(/content="\/og-preview\.png"/g, `content="${origin}/og-preview.png"`);
          html = html.replace(/content="\/logo\.png"/g, `content="${origin}/logo.png"`);
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Wearing Unusual full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[server] Fatal start error:', err);
  process.exit(1);
});
