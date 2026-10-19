import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmryqhilyisbfdpnsiwo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'wu_webhook_secret_2026';

const VAPID_PUBLIC_KEY =
  process.env.VITE_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  'BB6OqfeKOSrINtwTJ5BxZXx4By6atSWSLnUAuy9EntqGlQkCKbdkuavDXrdZUWx0uCIO_oFt3PP91274QDXlTBs';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'G9Z-5Tv0HqZFTVY7G8ASBVMvDBBdcayMSeKMCf7e43Y';

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@wearingunusual.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (e) {
    console.error('[push] Failed to set VAPID details:', e);
  }
}

// In-memory cache to ensure instant subscription access within the runtime container
const memorySubscriptions = new Map<string, any>();

// Multi-environment file storage path (/tmp for serverless Vercel/Lambda, public/data for local Node)
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
  // 1. Load from file
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

  // 2. Merge memory subscriptions
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

// Helper to instantiate the appropriate Supabase client
function getSupabaseClient(req: any) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token =
    typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : '';

  // 1. If service role key is securely configured in server environment, use it
  if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY.trim() !== '') {
    return {
      client: createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.trim(), {
        auth: { persistSession: false },
      }),
      isServiceRole: true,
      hasAuth: true,
    };
  }

  // 2. If caller passed user JWT token, use authenticated role (respects RLS for auth.uid() = user_id)
  if (token) {
    return {
      client: createClient(SUPABASE_URL, 'sb_publishable_O8oVIAZLkvJveyQ0Qiehhg_AX82Ehqw', {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      }),
      isServiceRole: false,
      hasAuth: true,
    };
  }

  // 3. Fallback to public anon client
  return {
    client: createClient(SUPABASE_URL, 'sb_publishable_O8oVIAZLkvJveyQ0Qiehhg_AX82Ehqw', {
      auth: { persistSession: false },
    }),
    isServiceRole: false,
    hasAuth: false,
  };
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, x-webhook-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const local = readLocalSubscriptions();
    return res.status(200).json({ status: 'ok', activeSubscriptionsCount: local.length });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const incomingWebhookSecret = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
    const body = req.body || {};
    const { client: supabaseClient, isServiceRole, hasAuth } = getSupabaseClient(req);

    // 1. ACTION: subscribe
    if (body.action === 'subscribe') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        return res.status(400).json({
          success: false,
          error: 'Subscrição push incompleta ou parâmetros criptográficos ausentes (endpoint/keys).',
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

      // Always save to high-resilience local cache
      saveLocalSubscription(record);

      // Attempt database upsert
      let dbError: string | null = null;
      try {
        const { error: upsertErr } = await supabaseClient
          .from('admin_push_subscriptions')
          .upsert(record, { onConflict: 'endpoint' });

        if (upsertErr) {
          dbError = upsertErr.message;
          console.warn('[push] Supabase upsert notice:', upsertErr.code, upsertErr.message);
        }
      } catch (e: any) {
        dbError = e?.message || String(e);
      }

      return res.status(200).json({
        success: true,
        message: 'Dispositivo registado com sucesso para notificações push.',
        savedToDatabase: !dbError,
        databaseNote: dbError ? `Nota base de dados: ${dbError}` : undefined,
      });
    }

    // 2. ACTION: unsubscribe
    if (body.action === 'unsubscribe') {
      if (body.endpoint) {
        removeLocalSubscription(body.endpoint);
        try {
          await supabaseClient.from('admin_push_subscriptions').delete().eq('endpoint', body.endpoint);
        } catch {}
      }
      return res.status(200).json({ success: true, message: 'Subscrição cancelada com sucesso.' });
    }

    // 3. ACTION: test OR new order webhook
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

    // 4. Gather all active subscriptions
    const allSubsMap = new Map<string, any>();

    // A. Local file & in-memory subscriptions
    const localSubs = readLocalSubscriptions();
    for (const s of localSubs) {
      if (s && s.endpoint && s.p256dh && s.auth) {
        allSubsMap.set(s.endpoint, s);
      }
    }

    // B. Direct current subscription if passed during test (ensures immediate targeted delivery to the iPhone)
    const currentSub = body.currentSubscription || body.subscription;
    if (currentSub && currentSub.endpoint && currentSub.keys?.p256dh && currentSub.keys?.auth) {
      const directRecord = {
        endpoint: currentSub.endpoint,
        p256dh: currentSub.keys.p256dh,
        auth: currentSub.keys.auth,
        user_id: body.userId || null,
        user_agent: req.headers['user-agent'] || '',
        updated_at: new Date().toISOString(),
      };
      allSubsMap.set(directRecord.endpoint, directRecord);
      saveLocalSubscription(directRecord);

      // Upsert to database as well
      try {
        await supabaseClient
          .from('admin_push_subscriptions')
          .upsert(directRecord, { onConflict: 'endpoint' });
      } catch {}
    }

    // C. Supabase database query
    try {
      const { data: dbSubs, error: dbErr } = await supabaseClient
        .from('admin_push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth');

      if (!dbErr && Array.isArray(dbSubs)) {
        for (const s of dbSubs) {
          if (s && s.endpoint && s.p256dh && s.auth) {
            allSubsMap.set(s.endpoint, s);
          }
        }
      } else if (dbErr) {
        console.warn('[push] Database select notice:', dbErr.code, dbErr.message);
      }
    } catch (e: any) {
      console.warn('[push] Supabase select catch notice:', e?.message || e);
    }

    const subscriptions = Array.from(allSubsMap.values());

    // 5. IF NO SUBSCRIPTIONS FOUND:
    // Return explicit HTTP 404 with success: false (allows frontend to distinguish from sent notifications)
    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        sent: 0,
        totalTargeted: 0,
        error: 'Nenhum dispositivo de administrador subscrito no momento. Toque primeiro em «Ativar Notificações no iPhone».',
      });
    }

    // 6. Send push notifications via Web Push
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
        const msg = sendErr.body || sendErr.message || String(sendErr);
        console.warn('[push] Send error for endpoint:', status, msg);

        if (status === 410 || status === 404) {
          // Device has revoked permissions or subscription has expired
          expiredEndpoints.push(subRecord.endpoint);
        } else {
          sendErrors.push(`(HTTP ${status || 'err'}): ${msg}`);
        }
      }
    }

    // 7. Cleanup expired subscriptions
    for (const ep of expiredEndpoints) {
      removeLocalSubscription(ep);
      try {
        await supabaseClient.from('admin_push_subscriptions').delete().eq('endpoint', ep);
      } catch {}
    }

    // 8. EVALUATE DELIVERY RESULT
    if (sentCount === 0) {
      return res.status(502).json({
        success: false,
        sent: 0,
        totalTargeted: subscriptions.length,
        error: `Falha na entrega da notificação push aos servidores da Apple: ${sendErrors.join(', ') || 'Dispositivo inacessível'}`,
      });
    }

    return res.status(200).json({
      success: true,
      sent: sentCount,
      expiredRemoved: expiredEndpoints.length,
      totalTargeted: subscriptions.length,
      message: isTestRequest
        ? `Notificação de teste enviada com sucesso para o seu iPhone (${sentCount} aparelho(s) ativo(s)).`
        : `Notificações processadas com sucesso (${sentCount} enviadas para aparelhos ativos).`,
    });
  } catch (err: any) {
    console.error('[push] Fatal error in notify-order handler:', err);
    return res.status(500).json({
      success: false,
      error: `Erro no servidor de notificações: ${err?.message || String(err)}`,
    });
  }
}

