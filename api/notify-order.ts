import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load local environment variables if present
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmryqhilyisbfdpnsiwo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '').trim();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'wu_webhook_secret_2026';

const VAPID_PUBLIC_KEY = (
  process.env.VITE_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  'BB6OqfeKOSrINtwTJ5BxZXx4By6atSWSLnUAuy9EntqGlQkCKbdkuavDXrdZUWx0uCIO_oFt3PP91274QDXlTBs'
).trim();

const VAPID_PRIVATE_KEY = (
  process.env.VAPID_PRIVATE_KEY ||
  'G9Z-5Tv0HqZFTVY7G8ASBVMvDBBdcayMSeKMCf7e43Y'
).trim();

const VAPID_SUBJECT = (process.env.VAPID_SUBJECT || 'mailto:admin@wearingunusual.com').trim();

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (e) {
    console.error('[push] Failed to set VAPID details:', e);
  }
}

// In-memory cache as secondary fallback within the active container
const memorySubscriptions = new Map<string, any>();

function getSubsFilePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/push_subscriptions.json';
  }
  const localPath = path.resolve(process.cwd(), 'public/data/push_subscriptions.json');
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return localPath;
  } catch {
    return '/tmp/push_subscriptions.json';
  }
}

function readLocalSubscriptions(): any[] {
  const result: any[] = [];
  try {
    const filePath = getSubsFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.endpoint) {
            result.push(item);
            memorySubscriptions.set(item.endpoint, item);
          }
        }
      }
    }
  } catch {}

  for (const item of memorySubscriptions.values()) {
    if (!result.some((r) => r.endpoint === item.endpoint)) {
      result.push(item);
    }
  }
  return result;
}

function saveLocalSubscription(sub: any) {
  if (!sub || !sub.endpoint) return;
  memorySubscriptions.set(sub.endpoint, sub);
  try {
    const filePath = getSubsFilePath();
    let list: any[] = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) list = parsed;
    }
    const filtered = list.filter((item: any) => item && item.endpoint !== sub.endpoint);
    filtered.push(sub);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[push] Could not write local subscription file:', e);
  }
}

function removeLocalSubscription(endpoint: string) {
  if (!endpoint) return;
  memorySubscriptions.delete(endpoint);
  try {
    const filePath = getSubsFilePath();
    let list: any[] = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) list = parsed;
    }
    const filtered = list.filter((item: any) => item && item.endpoint !== endpoint);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[push] Could not remove local subscription:', e);
  }
}

// Helper to obtain privileged Supabase Admin client with service_role key
function getSupabaseAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, x-webhook-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check & status verification
  if (req.method === 'GET') {
    const isServiceRoleAvailable = Boolean(SUPABASE_SERVICE_ROLE_KEY);
    const local = readLocalSubscriptions();
    return res.status(200).json({
      status: 'ok',
      serviceRoleConfigured: isServiceRoleAvailable,
      vapidConfigured: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
      localCacheCount: local.length,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const incomingWebhookSecret = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
    const body = req.body || {};

    // 1. ACTION: subscribe
    if (body.action === 'subscribe') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        return res.status(400).json({
          success: false,
          savedToDatabase: false,
          error: 'Subscrição push incompleta: parâmetros criptográficos (endpoint, p256dh, auth) ausentes.',
        });
      }

      // Check if SUPABASE_SERVICE_ROLE_KEY is configured
      const supabaseAdmin = getSupabaseAdminClient();
      if (!supabaseAdmin) {
        console.error('[push] SUPABASE_SERVICE_ROLE_KEY ausente no servidor.');
        return res.status(500).json({
          success: false,
          savedToDatabase: false,
          code: 'MISSING_SERVICE_ROLE_KEY',
          error: 'Configuração do servidor incompleta: A variável SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor (Vercel). É obrigatória para persistir subscrições na base de dados com RLS ativo.',
        });
      }

      const record = {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_id: body.userId || null,
        user_agent: req.headers['user-agent'] || '',
        updated_at: new Date().toISOString(),
      };

      // Perform privileged upsert to public.admin_push_subscriptions
      const { error: upsertErr } = await supabaseAdmin
        .from('admin_push_subscriptions')
        .upsert(record, { onConflict: 'endpoint' });

      if (upsertErr) {
        console.error('[push] Erro ao gravar subscrição no Supabase:', upsertErr.message);
        return res.status(500).json({
          success: false,
          savedToDatabase: false,
          code: 'DATABASE_SAVE_FAILED',
          error: `Falha ao gravar subscrição na base de dados Supabase: ${upsertErr.message}`,
        });
      }

      // Verify immediate persistence in database
      const { data: verified, error: verifyErr } = await supabaseAdmin
        .from('admin_push_subscriptions')
        .select('id, endpoint')
        .eq('endpoint', record.endpoint)
        .maybeSingle();

      if (verifyErr || !verified) {
        console.error('[push] Falha na verificação pós-gravação:', verifyErr?.message);
        return res.status(500).json({
          success: false,
          savedToDatabase: false,
          code: 'VERIFICATION_FAILED',
          error: 'A subscrição foi enviada para o Supabase mas a confirmação de persistência na base de dados falhou.',
        });
      }

      // Save to local cache as secondary safeguard
      saveLocalSubscription(record);

      return res.status(200).json({
        success: true,
        savedToDatabase: true,
        message: 'Dispositivo registado e confirmado com sucesso na base de dados Supabase.',
      });
    }

    // 2. ACTION: unsubscribe
    if (body.action === 'unsubscribe') {
      if (body.endpoint) {
        removeLocalSubscription(body.endpoint);
        const supabaseAdmin = getSupabaseAdminClient();
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('admin_push_subscriptions').delete().eq('endpoint', body.endpoint);
          } catch {}
        }
      }
      return res.status(200).json({ success: true, message: 'Subscrição cancelada com sucesso.' });
    }

    // 3. ACTION: test OR new order notification
    const isTestRequest = body.action === 'test';
    let pushPayload = {
      title: 'Wearing Unusual • Nova Encomenda',
      body: 'Foi registada uma nova encomenda na loja.',
      url: '/admin',
    };

    if (isTestRequest) {
      pushPayload = {
        title: 'Wearing Unusual • Teste Concluído',
        body: 'Notificações push configuradas com sucesso no seu iPhone.',
        url: '/admin',
      };
    } else {
      // Validate webhook secret ONLY if provided by caller
      if (incomingWebhookSecret && incomingWebhookSecret !== WEBHOOK_SECRET) {
        return res.status(401).json({ success: false, error: 'Acesso não autorizado: x-webhook-secret inválido.' });
      }

      // Format payload from order data
      const record = body.record || body;
      const trackingCode = record.tracking_code || '';
      const customerName = record.customer_name || '';

      if (trackingCode) {
        pushPayload.body = `Nova encomenda ${trackingCode}${customerName ? ` (${customerName})` : ''} registada na loja.`;
      } else {
        pushPayload.body = 'Foi registada uma nova encomenda na loja.';
      }
    }

    // Check SUPABASE_SERVICE_ROLE_KEY
    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      console.error('[push] SUPABASE_SERVICE_ROLE_KEY ausente no envio de notificações.');
      return res.status(500).json({
        success: false,
        code: 'MISSING_SERVICE_ROLE_KEY',
        error: 'Configuração do servidor incompleta: SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor. O envio de notificações exige esta credencial para aceder à tabela de subscrições sob RLS.',
      });
    }

    // If test request includes current subscription, ensure it is upserted to database
    const currentSub = body.currentSubscription || body.subscription;
    if (isTestRequest && currentSub?.endpoint && currentSub.keys?.p256dh && currentSub.keys?.auth) {
      try {
        await supabaseAdmin.from('admin_push_subscriptions').upsert(
          {
            endpoint: currentSub.endpoint,
            p256dh: currentSub.keys.p256dh,
            auth: currentSub.keys.auth,
            user_id: body.userId || null,
            user_agent: req.headers['user-agent'] || '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' }
        );
      } catch (e) {
        console.warn('[push] Aviso ao gravar subscrição de teste:', e);
      }
    }

    // Query active subscriptions from public.admin_push_subscriptions via service_role
    let query = supabaseAdmin.from('admin_push_subscriptions').select('id, user_id, endpoint, p256dh, auth');
    if (isTestRequest && body.userId) {
      // For test, target authenticated admin if provided
      query = query.eq('user_id', body.userId);
    }

    const { data: dbSubs, error: dbErr } = await query;

    if (dbErr) {
      console.error('[push] Erro ao consultar admin_push_subscriptions:', dbErr.message);
      return res.status(500).json({
        success: false,
        error: `Erro ao consultar subscrições na base de dados: ${dbErr.message}`,
      });
    }

    // Deduplicate subscriptions by endpoint
    const subsMap = new Map<string, any>();
    if (Array.isArray(dbSubs)) {
      for (const s of dbSubs) {
        if (s?.endpoint && s.p256dh && s.auth) {
          subsMap.set(s.endpoint, s);
        }
      }
    }

    // Fallback: If test has direct subscription and DB was empty, include it
    if (isTestRequest && currentSub?.endpoint && currentSub.keys?.p256dh && currentSub.keys?.auth) {
      if (!subsMap.has(currentSub.endpoint)) {
        subsMap.set(currentSub.endpoint, {
          endpoint: currentSub.endpoint,
          p256dh: currentSub.keys.p256dh,
          auth: currentSub.keys.auth,
        });
      }
    }

    const subscriptions = Array.from(subsMap.values());

    // 4. If no subscriptions found in database: return explicit HTTP 404
    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        sent: 0,
        totalTargeted: 0,
        error: 'Nenhum dispositivo de administrador subscrito na base de dados. Toque primeiro em «Ativar Notificações no iPhone» no painel administrativo.',
      });
    }

    // 5. Send push notifications via Web Push
    let sentCount = 0;
    const sendErrors: string[] = [];
    const expiredEndpoints: string[] = [];

    for (const subRecord of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subRecord.endpoint,
          keys: {
            p256dh: subRecord.p256dh,
            auth: subRecord.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(pushPayload), {
          urgency: 'high',
          TTL: 60 * 60 * 24,
        });

        sentCount++;
      } catch (sendErr: any) {
        const status = sendErr.statusCode || sendErr.status;
        const safeError = `HTTP ${status || 'err'}: ${sendErr.message || 'Falha Web Push'}`;
        console.warn('[push] Erro no envio Web Push para dispositivo:', safeError);

        if (status === 410 || status === 404) {
          expiredEndpoints.push(subRecord.endpoint);
        } else {
          sendErrors.push(safeError);
        }
      }
    }

    // 6. Cleanup expired endpoints from Supabase using service_role
    if (expiredEndpoints.length > 0) {
      try {
        await supabaseAdmin.from('admin_push_subscriptions').delete().in('endpoint', expiredEndpoints);
        for (const ep of expiredEndpoints) removeLocalSubscription(ep);
      } catch (e) {
        console.warn('[push] Aviso ao limpar subscrições expiradas:', e);
      }
    }

    // 7. Verify delivery outcome
    if (sentCount === 0) {
      return res.status(502).json({
        success: false,
        sent: 0,
        totalTargeted: subscriptions.length,
        error: `Falha na entrega da notificação Web Push: ${sendErrors.join('; ') || 'Servidor de notificações rejeitou o envio.'}`,
      });
    }

    return res.status(200).json({
      success: true,
      sent: sentCount,
      totalTargeted: subscriptions.length,
      expiredRemoved: expiredEndpoints.length,
      message: isTestRequest
        ? `Notificação de teste enviada com sucesso para o seu iPhone (${sentCount} dispositivo(s) notificado(s)).`
        : `Notificação enviada com sucesso (${sentCount} dispositivo(s) notificado(s)).`,
    });
  } catch (err: any) {
    console.error('[push] Erro fatal no processamento:', err);
    return res.status(500).json({
      success: false,
      error: `Erro no servidor de notificações: ${err?.message || String(err)}`,
    });
  }
}
