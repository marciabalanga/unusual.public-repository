import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Generate NIST P-256 (prime256v1) keypair using native cryptographically secure PRNG (RFC 8292 standard)
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();

// Encode in URL-safe Base64 without padding (standard for Web Push / VAPID)
const publicKey = ecdh.getPublicKey('base64url');
const privateKey = ecdh.getPrivateKey('base64url');

console.log('\n================================================================');
console.log('  WEARING UNUSUAL • GERADOR SEGURO DE CHAVES VAPID (WEB PUSH)');
console.log('================================================================\n');

console.log('✓ Par de chaves criptográficas gerado com sucesso (Curva NIST P-256):\n');
console.log('----------------------------------------------------------------');
console.log('1. VAPID_PUBLIC_KEY (Pública - Frontend e Vercel):');
console.log('----------------------------------------------------------------');
console.log(publicKey);
console.log('\n----------------------------------------------------------------');
console.log('2. VAPID_PRIVATE_KEY (Privada - Apenas Secrets do Supabase):');
console.log('----------------------------------------------------------------');
console.log(privateKey);
console.log('\n----------------------------------------------------------------');
console.log('3. ONDE CONFIGURAR CADA CHAVE:');
console.log('----------------------------------------------------------------');
console.log('A. NO SEU FICHEIRO .env E NAS VARIÁVEIS DA VERCEL:');
console.log(`   VITE_VAPID_PUBLIC_KEY="${publicKey}"\n`);
console.log('B. NOS SECRETS DO SUPABASE (Dashboard > Edge Functions > Secrets):');
console.log(`   VAPID_PUBLIC_KEY="${publicKey}"`);
console.log(`   VAPID_PRIVATE_KEY="${privateKey}"`);
console.log('   VAPID_SUBJECT="mailto:admin@wearingunusual.com"');
console.log('================================================================\n');

// Guardar de forma segura em .vapid-keys.json (ignorado pelo git)
const outputFilePath = path.join(rootDir, '.vapid-keys.json');
try {
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(
      {
        created_at: new Date().toISOString(),
        VAPID_PUBLIC_KEY: publicKey,
        VAPID_PRIVATE_KEY: privateKey,
        VAPID_SUBJECT: 'mailto:admin@wearingunusual.com',
      },
      null,
      2
    ),
    { mode: 0o600 }
  );

  console.log('🔒 Cópia de segurança gravada com permissões restritas em:');
  console.log(`   ${outputFilePath} (ignorado pelo Git)\n`);
} catch (e) {
  // Ignored if file write fails in read-only environment
}
