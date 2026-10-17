import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import potrace from 'potrace';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const portArgIdx = process.argv.indexOf('--port');
const cliPort = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? Number(process.argv[portArgIdx + 1]) : null;
const PORT = cliPort && !isNaN(cliPort) && cliPort > 0 ? cliPort : (Number(process.env.PORT) || 3000);
const APP_VERSION = '20261004_v9';

const SUPABASE_URL = 'https://tmryqhilyisbfdpnsiwo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_O8oVIAZLkvJveyQ0Qiehhg_AX82Ehqw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const stateFile = path.resolve(__dirname, 'public/data/store_state.json');
const distStateFile = path.resolve(__dirname, 'dist/data/store_state.json');

// Ensure data directory exists
const dataDir = path.dirname(stateFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function sanitizeVariants(product: any): any {
  if (!product) return product;

  let colors = Array.isArray(product.colors) ? [...product.colors] : [];

  const isLuandaTee =
    product.id === 'prod-void-tee' ||
    product.id === 'prod-1790698781209' ||
    (product.slug && product.slug.includes('welcome-to-luanda')) ||
    (product.name && product.name.toLowerCase().includes('welcome to luanda'));

  if (isLuandaTee) {
    colors = [
      {
        hex: '#ffffff',
        name: 'Pure White',
        in_stock: false,
        image_url:
          (product.images && product.images[0]) ||
          'https://tmryqhilyisbfdpnsiwo.supabase.co/storage/v1/object/public/receipts/products/1789571217741_24y7a.jpeg',
      },
    ];
  } else {
    const seen = new Set<string>();
    colors = colors.filter((c: any) => {
      if (!c || !c.name || typeof c.name !== 'string') return false;
      const lower = c.name.trim().toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }

  const allSizesOutOfStock =
    Array.isArray(product.sizes) &&
    product.sizes.length > 0 &&
    product.sizes.every((s: any) => !s.in_stock);

  let currentBadge = product.badge;
  if (isLuandaTee || allSizesOutOfStock || (currentBadge && currentBadge.trim().toUpperCase() === 'ESGOTADO')) {
    currentBadge = 'ESGOTADO';
  }

  return {
    ...product,
    badge: currentBadge,
    colors,
  };
}

let lastSupabaseSyncTime = 0;

async function syncSupabaseToStoreState(): Promise<boolean> {
  try {
    const [prodRes, blockRes, dictRes, setRes] = await Promise.all([
      supabase.from('products').select('*').order('order_index', { ascending: true }),
      supabase.from('site_blocks').select('*').order('order_index', { ascending: true }),
      supabase.from('site_dictionary').select('*'),
      supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle(),
    ]);

    if (prodRes.error) {
      console.warn('[server] Warning fetching Supabase products:', prodRes.error.message);
      return false;
    }

    const state = readStoredState();
    const rawProducts = (prodRes.data || []).map((p: any) => {
      let meta: any = {};
      let userDetails = p.details || '';
      if (typeof p.details === 'string' && p.details.trim().startsWith('{')) {
        try {
          meta = JSON.parse(p.details);
          if (meta && typeof meta === 'object') {
            userDetails = meta.user_details !== undefined ? meta.user_details : userDetails;
          }
        } catch {}
      }
      return {
        ...p,
        details: userDetails,
        enable_pre_order: meta.enable_pre_order !== undefined ? Boolean(meta.enable_pre_order) : Boolean(p.enable_pre_order),
        pre_order_price_aoa: meta.pre_order_price_aoa !== undefined ? meta.pre_order_price_aoa : p.pre_order_price_aoa,
        pre_order_estimated_delivery: meta.pre_order_estimated_delivery !== undefined ? meta.pre_order_estimated_delivery : p.pre_order_estimated_delivery,
        pre_order_start_date: meta.pre_order_start_date !== undefined ? meta.pre_order_start_date : p.pre_order_start_date,
        pre_order_end_date: meta.pre_order_end_date !== undefined ? meta.pre_order_end_date : p.pre_order_end_date,
        pre_order_max_quantity: meta.pre_order_max_quantity !== undefined ? meta.pre_order_max_quantity : p.pre_order_max_quantity,
        pre_order_custom_notice: meta.pre_order_custom_notice !== undefined ? meta.pre_order_custom_notice : p.pre_order_custom_notice,
        coming_soon_badge: meta.coming_soon_badge !== undefined ? Boolean(meta.coming_soon_badge) : Boolean(p.coming_soon_badge),
        return_date: meta.return_date || p.return_date || undefined,
        enable_request_restock: meta.enable_request_restock !== undefined ? Boolean(meta.enable_request_restock) : Boolean(p.enable_request_restock),
        fit_guide: meta.fit_guide || p.fit_guide || p.size_guide,
      };
    });

    const sanitizedProducts = rawProducts.map(sanitizeVariants);

    const dictMap: Record<string, any> = {};
    if (dictRes.data && Array.isArray(dictRes.data)) {
      dictRes.data.forEach((d: any) => {
        if (d && d.key) dictMap[d.key] = d;
      });
    }

    const blocks = blockRes.data && Array.isArray(blockRes.data) && blockRes.data.length > 0
      ? blockRes.data
      : (state.published?.blocks || state.draft?.blocks || []);

    const settings = setRes.data
      ? { ...(state.published?.settings || {}), ...setRes.data }
      : (state.published?.settings || {});

    const nowIso = new Date().toISOString();

    state.published = {
      products: sanitizedProducts,
      blocks,
      settings,
      dictionary: dictMap,
    };
    state.published_at = nowIso;
    state.updated_at = nowIso;

    if (!state.draft || !state.draft.products || state.draft.products.length === 0) {
      state.draft = JSON.parse(JSON.stringify(state.published));
    }

    writeStoredState(state);
    lastSupabaseSyncTime = Date.now();
    console.log(`[server] Synced ${sanitizedProducts.length} published products from Supabase.`);
    return true;
  } catch (err) {
    console.warn('[server] Error syncing Supabase to store_state:', err);
    return false;
  }
}

function normalizeState(raw: any): any {
  if (raw && raw.draft && raw.published) {
    return raw;
  }
  const base = {
    products: Array.isArray(raw?.products) ? raw.products.map(sanitizeVariants) : [],
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
  // Sync Supabase on initial startup
  await syncSupabaseToStoreState();

  const app = express();

  // Parse JSON payloads up to 50MB (for images/products)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API 1: GET /api/store-state
  app.get('/api/store-state', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/json');

    // If more than 20 seconds since last sync, trigger background sync
    if (Date.now() - lastSupabaseSyncTime > 20000) {
      syncSupabaseToStoreState().catch(() => {});
    }

    const state = readStoredState();
    const published = state.published || {};
    const draft = state.draft || {};
    const scope = req.query.scope as string;

    if (scope === 'draft') {
      return res.json({
        ...draft,
        version: APP_VERSION,
        published_at: state.published_at,
        updated_at: state.updated_at,
      });
    }

    if (scope === 'published') {
      return res.json({
        ...published,
        version: APP_VERSION,
        published_at: state.published_at,
        updated_at: state.updated_at,
      });
    }

    // Default response: provide top-level published fields AND full state structure
    return res.json({
      success: true,
      products: published.products || [],
      blocks: published.blocks || [],
      settings: published.settings || {},
      dictionary: published.dictionary || {},
      published,
      draft,
      has_changes: Boolean(state.has_changes),
      published_at: state.published_at || new Date().toISOString(),
      updated_at: state.updated_at || new Date().toISOString(),
      version: APP_VERSION,
    });
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

        try {
          const trimmedWhite = path.resolve(__dirname, 'public/temp-trimmed-white.png');
          const trimmedBlack = path.resolve(__dirname, 'public/temp-trimmed-black.png');
          const bg180 = path.resolve(__dirname, 'public/temp-bg180.png');
          const fg140 = path.resolve(__dirname, 'public/temp-fg140.png');
          const bg192 = path.resolve(__dirname, 'public/temp-bg192.png');
          const fg150 = path.resolve(__dirname, 'public/temp-fg150.png');
          const bg1200 = path.resolve(__dirname, 'public/temp-bg1200.png');
          const fg500 = path.resolve(__dirname, 'public/temp-fg500.png');
          const fav16 = path.resolve(__dirname, 'public/temp-fav16.png');
          const fav32 = path.resolve(__dirname, 'public/temp-fav32.png');
          const fav48 = path.resolve(__dirname, 'public/temp-fav48.png');

          // 1. Trim master logo to get exact content bounds
          execSync(`convert "${publicLogo}" -trim +repage "${trimmedWhite}"`);
          execSync(`convert "${trimmedWhite}" -channel RGB -negate +channel "${trimmedBlack}"`);

          // 2. Generate Apple Touch Icon (180x180) on solid brutalist background #080808
          execSync(`convert -size 180x180 xc:"#080808" "${bg180}"`);
          execSync(`convert "${trimmedWhite}" -resize 140x140 "${fg140}"`);
          execSync(`composite -gravity center "${fg140}" "${bg180}" "${path.resolve(__dirname, 'public/apple-touch-icon.png')}"`);
          fs.copyFileSync(path.resolve(__dirname, 'public/apple-touch-icon.png'), path.resolve(__dirname, 'public/apple-touch-icon-precomposed.png'));
          fs.copyFileSync(path.resolve(__dirname, 'public/apple-touch-icon.png'), path.resolve(__dirname, 'public/brand-touch-icon.png'));
          fs.copyFileSync(path.resolve(__dirname, 'public/apple-touch-icon.png'), brandSquare);
          fs.copyFileSync(path.resolve(__dirname, 'public/apple-touch-icon.png'), brandMonogram);
          fs.copyFileSync(path.resolve(__dirname, 'public/apple-touch-icon.png'), brandLogo);

          // 3. Generate Favicons: 192x192, 32x32
          execSync(`convert -size 192x192 xc:"#080808" "${bg192}"`);
          execSync(`convert "${trimmedWhite}" -resize 150x150 "${fg150}"`);
          execSync(`composite -gravity center "${fg150}" "${bg192}" "${path.resolve(__dirname, 'public/brand-favicon.png')}"`);

          // 4. Generate multi-resolution favicon.ico
          execSync(`convert "${path.resolve(__dirname, 'public/brand-favicon.png')}" -resize 16x16 "${fav16}"`);
          execSync(`convert "${path.resolve(__dirname, 'public/brand-favicon.png')}" -resize 32x32 "${fav32}"`);
          execSync(`convert "${path.resolve(__dirname, 'public/brand-favicon.png')}" -resize 48x48 "${fav48}"`);
          execSync(`convert "${fav16}" "${fav32}" "${fav48}" "${path.resolve(__dirname, 'public/favicon.ico')}"`);

          // 5. Generate high-resolution social preview (og-preview.png: 1200x630)
          const ogPreview = path.resolve(__dirname, 'public/og-preview.png');
          const brandOg = path.resolve(__dirname, 'public/brand/wu-og-preview.png');
          execSync(`convert -size 1200x630 xc:"#080808" "${bg1200}"`);
          execSync(`convert "${trimmedWhite}" -resize 500x300 "${fg500}"`);
          execSync(`composite -gravity center "${fg500}" "${bg1200}" "${ogPreview}"`);
          fs.copyFileSync(ogPreview, brandOg);

          // 6. Generate adaptive brand-icon.svg & icon.svg
          const whiteB64 = fs.readFileSync(trimmedWhite).toString('base64');
          const blackB64 = fs.readFileSync(trimmedBlack).toString('base64');
          const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" aria-label="UNUSUAL">
  <style>
    .theme-light { display: block; }
    .theme-dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .theme-light { display: none; }
      .dark-theme { display: block; }
      .theme-dark { display: block; }
    }
  </style>
  <image class="theme-light" href="data:image/png;base64,${blackB64}" x="10" y="10" width="380" height="380" preserveAspectRatio="xMidYMid meet" />
  <image class="theme-dark" href="data:image/png;base64,${whiteB64}" x="10" y="10" width="380" height="380" preserveAspectRatio="xMidYMid meet" />
</svg>\n`;

          fs.writeFileSync(path.resolve(__dirname, 'public/brand-icon.svg'), adaptiveSvg);
          fs.writeFileSync(path.resolve(__dirname, 'public/icon.svg'), adaptiveSvg);
          fs.writeFileSync(path.resolve(__dirname, 'public/brand/brand-logo.svg'), adaptiveSvg);
          fs.writeFileSync(path.resolve(__dirname, 'public/brand/wu-logo.svg'), adaptiveSvg);

          // Cleanup temp files
          [trimmedWhite, trimmedBlack, bg180, fg140, bg192, fg150, bg1200, fg500, fav16, fav32, fav48].forEach((f) => {
            if (fs.existsSync(f)) {
              try { fs.unlinkSync(f); } catch {}
            }
          });
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

  // Helper to format HTML with absolute Open Graph tags and canonical URLs for Instagram & social platforms
  function formatHtmlResponse(rawHtml: string, req: express.Request): string {
    const host = req.get('x-forwarded-host') || req.get('host') || 'wearingunusual.com';
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const origin = `${proto}://${host}`;
    const cleanPath = req.path || '/';
    const currentUrl = `${origin}${cleanPath}`;

    let html = rawHtml;

    // Detect if this is a product page (/produto/:slug or /peca/:slug)
    const productMatch = cleanPath.match(/^\/(produto|peca)\/([^\/?#]+)/i);
    if (productMatch) {
      const slug = decodeURIComponent(productMatch[2]);
      const state = readStoredState();
      const prods = (state.published && state.published.products) || [];
      const prod = prods.find((p: any) => p.slug === slug || p.id === slug);
      if (prod) {
        const prodTitle = `${prod.name.toUpperCase()} | WEARING UNUSUAL`;
        const prodDesc = prod.description || 'Wearing Unusual – Inspired by the fear of being average.';
        const prodImg = (prod.images && prod.images[0]) || `${origin}/og-preview.png?v=${APP_VERSION}`;

        html = html.replace(/<title>.*?<\/title>/gi, `<title>${prodTitle}</title>`);
        html = html.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${prodDesc}" />`);
        html = html.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${prodTitle}" />`);
        html = html.replace(/<meta property="og:description" content=".*?" \/>/gi, `<meta property="og:description" content="${prodDesc}" />`);
        html = html.replace(/<meta property="og:image" content=".*?" \/>/gi, `<meta property="og:image" content="${prodImg}" />`);
        html = html.replace(/<meta property="og:image:secure_url" content=".*?" \/>/gi, `<meta property="og:image:secure_url" content="${prodImg}" />`);
        html = html.replace(/<meta name="twitter:title" content=".*?" \/>/gi, `<meta name="twitter:title" content="${prodTitle}" />`);
        html = html.replace(/<meta name="twitter:description" content=".*?" \/>/gi, `<meta name="twitter:description" content="${prodDesc}" />`);
        html = html.replace(/<meta name="twitter:image" content=".*?" \/>/gi, `<meta name="twitter:image" content="${prodImg}" />`);
      }
    }

    // Replace relative assets with absolute URLs
    html = html.replace(/content="\/og-preview\.png"/g, `content="${origin}/og-preview.png?v=${APP_VERSION}"`);
    html = html.replace(/content="\/logo\.png"/g, `content="${origin}/logo.png?v=${APP_VERSION}"`);

    // Ensure Canonical & OpenGraph URL
    html = html.replace(/<link rel="canonical"[^>]*\/>/gi, '');
    html = html.replace(/<meta property="og:url"[^>]*\/>/gi, '');
    html = html.replace(/<meta name="twitter:url"[^>]*\/>/gi, '');

    const tagsToInject = `  <link rel="canonical" href="${currentUrl}" />\n  <meta property="og:url" content="${currentUrl}" />\n  <meta name="twitter:url" content="${currentUrl}" />\n`;
    html = html.replace('</head>', `${tagsToInject}</head>`);

    return html;
  }

  if (!isProduction) {
    // Development mode: mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    // Intercept HTML requests in dev mode to format OpenGraph and Canonical tags for crawlers & visitors
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      const isHtmlRequest =
        !url.startsWith('/api/') &&
        !url.includes('@vite') &&
        !url.includes('@react-refresh') &&
        !url.includes('/src/') &&
        !path.extname(url.split('?')[0]);

      if (isHtmlRequest) {
        try {
          const indexPath = path.resolve(__dirname, 'index.html');
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          const finalHtml = formatHtmlResponse(template, req);

          res.status(200);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          return res.end(finalHtml);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          return next(e);
        }
      }
      return vite.middlewares(req, res, next);
    });
  } else {
    // Production mode: serve dist static files and SPA fallback with formatHtmlResponse
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      const indexPath = path.resolve(__dirname, 'dist/index.html');
      if (fs.existsSync(indexPath)) {
        let rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const finalHtml = formatHtmlResponse(rawHtml, req);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.send(finalHtml);
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
