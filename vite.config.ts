import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function brandLogoSaverPlugin(): Plugin {
  return {
    name: 'brand-logo-saver',
    configureServer(server) {
      server.middlewares.use('/api/save-logo', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const image = data.image;
              if (image && typeof image === 'string') {
                const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const publicLogo = path.resolve(process.cwd(), 'public/logo.png');
                const brandDir = path.resolve(process.cwd(), 'public/brand');
                if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
                const brandLogo = path.resolve(brandDir, 'wu-official-logo.png');
                fs.writeFileSync(publicLogo, buffer);
                fs.writeFileSync(brandLogo, buffer);

                const distDir = path.resolve(process.cwd(), 'dist');
                if (fs.existsSync(distDir)) {
                  fs.writeFileSync(path.resolve(distDir, 'logo.png'), buffer);
                  const distBrand = path.resolve(distDir, 'brand');
                  if (!fs.existsSync(distBrand)) fs.mkdirSync(distBrand, { recursive: true });
                  fs.writeFileSync(path.resolve(distBrand, 'wu-official-logo.png'), buffer);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, url: `/logo.png?v=${Date.now()}` }));
                return;
              }
            } catch (err) {
              console.error('Failed to parse /api/save-logo body:', err);
            }
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), brandLogoSaverPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
