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

        const distDir = path.resolve(__dirname, 'dist');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.resolve(distDir, 'logo.png'), buffer);
          const distBrand = path.resolve(distDir, 'brand');
          if (!fs.existsSync(distBrand)) fs.mkdirSync(distBrand, { recursive: true });
          fs.writeFileSync(path.resolve(distBrand, 'wu-official-logo.png'), buffer);
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
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
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
