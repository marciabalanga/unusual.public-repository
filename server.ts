import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import potrace from 'potrace';

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

function normalizeState(raw: any): any {
  if (raw && raw.draft && raw.published) {
    return raw;
  }
  const base = {
    products: Array.isArray(raw?.products) ? raw.products : [],
    blocks: Array.isArray(raw?.blocks) ? raw.blocks : [],
    settings: typeof raw?.settings === 'object' && raw.settings ? raw.settings : {},
    dictionary: typeof raw?.dictionary === 'object' && raw.dictionary ? raw.dictionary : {},
    deletedCustomIds: Array.isArray(raw?.deletedCustomIds) ? raw.deletedCustomIds : [],
  };
  return {
    draft: { ...base },
    published: { ...base },
    published_at: raw?.published_at || new Date().toISOString(),
    updated_at: raw?.updated_at || new Date().toISOString(),
    has_changes: false,
  };
}

function readStoredState(): any {
  try {
    if (fs.existsSync(stateFile)) {
      const raw = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      return normalizeState(raw);
    }
  } catch (e) {
    console.warn('[server] Error reading store_state.json:', e);
  }
  return normalizeState({});
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
  app.get('/api/store-state', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    const state = readStoredState();
    const scope = req.query.scope as string;
    if (scope === 'draft') {
      res.json(state.draft || {});
    } else if (scope === 'published') {
      res.json(state.published || {});
    } else {
      res.json(state);
    }
  });

  // API 2: POST /api/store-state (Saves to DRAFT by default)
  app.post('/api/store-state', (req, res) => {
    try {
      const data = req.body || {};
      const state = readStoredState();

      if (data.publish === true) {
        state.published = JSON.parse(JSON.stringify(state.draft));
        state.published_at = new Date().toISOString();
        state.has_changes = false;
      } else {
        const target = state.draft || {};
        if (data.settings) {
          target.settings = { ...(target.settings || {}), ...data.settings };
        }
        if (data.products && Array.isArray(data.products)) {
          target.products = data.products;
        }
        if (data.blocks && Array.isArray(data.blocks)) {
          target.blocks = data.blocks;
        }
        if (data.dictionary) {
          target.dictionary = { ...(target.dictionary || {}), ...data.dictionary };
        }
        if (data.deletedCustomIds && Array.isArray(data.deletedCustomIds)) {
          target.deletedCustomIds = data.deletedCustomIds;
        }
        state.draft = target;
        state.has_changes = true;
      }
      state.updated_at = new Date().toISOString();

      const success = writeStoredState(state);
      if (success) {
        res.json({ success: true, state });
      } else {
        res.status(500).json({ success: false, error: 'Failed to write state file' });
      }
    } catch (err: any) {
      console.error('[server] POST /api/store-state error:', err);
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // API 2b: POST /api/publish-draft (Explicitly promotes DRAFT -> PUBLISHED)
  app.post('/api/publish-draft', (req, res) => {
    try {
      const state = readStoredState();
      const payload = req.body || {};

      if (payload.draft) {
        state.draft = { ...state.draft, ...payload.draft };
      }
      state.published = JSON.parse(JSON.stringify(state.draft));
      state.published_at = new Date().toISOString();
      state.has_changes = false;
      state.updated_at = new Date().toISOString();

      const success = writeStoredState(state);
      if (success) {
        res.json({ success: true, state });
      } else {
        res.status(500).json({ success: false, error: 'Failed to publish state' });
      }
    } catch (err: any) {
      console.error('[server] POST /api/publish-draft error:', err);
      res.status(500).json({ success: false, error: err?.message || String(err) });
    }
  });

  // API 3: POST /api/save-logo
  app.post('/api/save-logo', (req, res) => {
    try {
      const { image } = req.body || {};
      if (image && typeof image === 'string') {
        const isSvg = image.includes('image/svg+xml') || image.trim().startsWith('<svg');
        const publicLogo = path.resolve(__dirname, 'public/logo.png');
        const brandDir = path.resolve(__dirname, 'public/brand');
        if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
        const brandLogo = path.resolve(brandDir, 'wu-official-logo.png');
        const brandSquare = path.resolve(brandDir, 'wu-square-1024.png');
        const brandMonogram = path.resolve(brandDir, 'wu-monogram.png');

        if (isSvg) {
          let svgContent = '';
          if (image.includes('base64,')) {
            const b64 = image.split('base64,')[1];
            svgContent = Buffer.from(b64, 'base64').toString('utf-8');
          } else if (image.includes('data:image/svg+xml')) {
            svgContent = decodeURIComponent(image.split('data:image/svg+xml,')[1] || image.split('data:image/svg+xml;utf8,')[1] || image);
          } else {
            svgContent = image;
          }

          const dynamicSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" fill="none" aria-label="UNUSUAL">\n  <style>\n    .logo-path { fill: #000000; }\n    @media (prefers-color-scheme: dark) {\n      .logo-path { fill: #ffffff; }\n    }\n  </style>\n  ${svgContent.replace(/<\/?svg[^>]*>/gi, '')}\n</svg>\n`;
          const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" fill="currentColor" aria-label="UNUSUAL">\n  ${svgContent.replace(/<\/?svg[^>]*>/gi, '')}\n</svg>\n`;

          fs.writeFileSync(path.resolve(__dirname, 'public/brand-icon.svg'), dynamicSvg);
          fs.writeFileSync(path.resolve(__dirname, 'public/icon.svg'), dynamicSvg);
          fs.writeFileSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'), monoSvg);
          fs.writeFileSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'), monoSvg);

          // Convert SVG to PNG master
          try {
            execSync(`convert -background transparent -density 300 "${path.resolve(__dirname, 'public/brand-icon.svg')}" -resize 400x400 "${publicLogo}"`);
            fs.copyFileSync(publicLogo, brandLogo);
          } catch (e) {
            console.warn('[server] SVG to PNG conversion warning:', e);
          }
        } else {
          const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          fs.writeFileSync(publicLogo, buffer);
          fs.writeFileSync(brandLogo, buffer);
        }

        // Copy high-resolution PNGs to all Apple touch icon and favicon paths
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/apple-touch-icon.png'));
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/apple-touch-icon-precomposed.png'));
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/brand-touch-icon.png'));
        fs.copyFileSync(publicLogo, path.resolve(__dirname, 'public/brand-favicon.png'));
        fs.copyFileSync(publicLogo, brandSquare);
        fs.copyFileSync(publicLogo, brandMonogram);

        try {
          const ogPreview = path.resolve(__dirname, 'public/og-preview.png');
          const brandOg = path.resolve(__dirname, 'public/brand/wu-og-preview.png');
          const favIco = path.resolve(__dirname, 'public/favicon.ico');
          execSync(`convert -size 1200x630 xc:'#000000' "${publicLogo}" -gravity center -composite -depth 8 "${ogPreview}"`);
          execSync(`cp "${ogPreview}" "${brandOg}"`);
          execSync(`convert "${publicLogo}" -background transparent \\( -clone 0 -resize 16x16 \\) \\( -clone 0 -resize 32x32 \\) \\( -clone 0 -resize 48x48 \\) -delete 0 "${favIco}"`);

          if (!isSvg) {
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
          }
        } catch (genErr) {
          console.warn('[server] Warning generating derived preview/favicon:', genErr);
        }

        // Update persistent store_state.json so /api/store-state immediately reflects the new logo
        try {
          const state = readStoredState();
          const timestamp = new Date().toISOString();
          if (!state.draft.settings) state.draft.settings = {};
          if (!state.published.settings) state.published.settings = {};
          state.draft.settings.site_logo_url = image;
          state.draft.settings.logo_url = image;
          state.draft.settings.updated_at = timestamp;
          state.published.settings.site_logo_url = image;
          state.published.settings.logo_url = image;
          state.published.settings.updated_at = timestamp;
          state.updated_at = timestamp;
          writeStoredState(state);
        } catch (stateErr) {
          console.warn('[server] Warning updating store_state with new logo:', stateErr);
        }

        const distDir = path.resolve(__dirname, 'dist');
        if (fs.existsSync(distDir)) {
          try {
            fs.copyFileSync(publicLogo, path.resolve(distDir, 'logo.png'));
            fs.copyFileSync(publicLogo, path.resolve(distDir, 'apple-touch-icon.png'));
            fs.copyFileSync(publicLogo, path.resolve(distDir, 'apple-touch-icon-precomposed.png'));
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
            fs.copyFileSync(brandLogo, path.resolve(distBrand, 'wu-official-logo.png'));
            fs.copyFileSync(brandSquare, path.resolve(distBrand, 'wu-square-1024.png'));
            fs.copyFileSync(brandMonogram, path.resolve(distBrand, 'wu-monogram.png'));
            if (fs.existsSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'))) {
              fs.copyFileSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'), path.resolve(distBrand, 'brand-logo.svg'));
            }
            if (fs.existsSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'))) {
              fs.copyFileSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'), path.resolve(distBrand, 'wu-logo.svg'));
            }
          } catch (syncDistErr) {
            console.warn('[server] Warning syncing to dist:', syncDistErr);
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

  // Serve static public assets with must-revalidate for brand icons
  app.use((req, res, next) => {
    if (req.path.match(/\.(ico|svg|png|webmanifest)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    next();
  });
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
