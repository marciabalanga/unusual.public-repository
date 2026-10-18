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
    console.error('Failed to set VAPID details:', e);
  }
}

// Local file storage for subscriptions (provides high resilience across Node and Vercel environments)
function getSubsFilePath(): string {
  return path.resolve(process.cwd(), 'public/data/push_subscriptions.json');
}

function readLocalSubscriptions(): any[] {
  try {
    const filePath = getSubsFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

function saveLocalSubscription(sub: any) {
  try {
    const filePath = getSubsFilePath();
    const list = readLocalSubscriptions();
    const filtered = list.filter((item: any) => item.endpoint !== sub.endpoint);
    filtered.push(sub);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[push] Could not save local subscription:', e);
  }
}

function removeLocalSubscription(endpoint: string) {
  try {
    const filePath = getSubsFilePath();
    const list = readLocalSubscriptions();
    const filtered = list.filter((item: any) => item.endpoint !== endpoint);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[push] Could not remove local subscription:', e);
  }
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const incomingWebhookSecret = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
    const body = req.body || {};

    const clientKey = SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_O8oVIAZLkvJveyQ0Qiehhg_AX82Ehqw';
    const supabaseAdmin = createClient(SUPABASE_URL, clientKey);

    // 1. Direct subscription registration from frontend (called by subscribeAdminToPush)
    if (body.action === 'subscribe') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        return res.status(400).json({ error: 'Subscrição push incompleta ou inválida.' });
      }

      const record = {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_id: body.userId || 'admin',
        user_agent: req.headers['user-agent'] || '',
        updated_at: new Date().toISOString(),
      };

      // Save locally
      saveLocalSubscription(record);

      // Also attempt Supabase upsert
      try {
        await supabaseAdmin.from('admin_push_subscriptions').upsert(record, { onConflict: 'endpoint' });
      } catch (e) {
        console.warn('[push] Supabase upsert non-fatal error:', e);
      }

      return res.status(200).json({ success: true, message: 'Dispositivo registado com sucesso para notificações.' });
    }

    // 2. Unsubscribe request
    if (body.action === 'unsubscribe') {
      if (body.endpoint) {
        removeLocalSubscription(body.endpoint);
        try {
          await supabaseAdmin.from('admin_push_subscriptions').delete().eq('endpoint', body.endpoint);
        } catch {}
      }
      return res.status(200).json({ success: true, message: 'Subscrição cancelada com sucesso.' });
    }

    // 3. Test notification request or Order notification
    let isTestRequest = false;
    let pushPayload = {
      title: 'Wearing Unusual • Nova Encomenda',
      body: 'Foi registada uma nova encomenda na loja.',
      url: '/admin',
    };

    if (body.action === 'test') {
      isTestRequest = true;
      pushPayload = {
        title: 'Wearing Unusual • Teste Concluído',
        body: 'Notificações push configuradas com sucesso no seu iPhone.',
        url: '/admin',
      };
    } else {
      // Validate webhook secret ONLY if provided
      if (incomingWebhookSecret && incomingWebhookSecret !== WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Acesso não autorizado: x-webhook-secret inválido.' });
      }

      // Format payload from order data if available
      const record = body.record || body;
      const trackingCode = record.tracking_code || '';
      const customerName = record.customer_name || '';

      if (trackingCode) {
        pushPayload.body = `Nova encomenda ${trackingCode}${customerName ? ` (${customerName})` : ''} registada na loja.`;
      } else {
        pushPayload.body = 'Foi registada uma nova encomenda na loja.';
      }
    }

    // 4. Retrieve all active subscriptions from local storage AND Supabase
    const allSubsMap = new Map<string, any>();

    // From local JSON file
    const localSubs = readLocalSubscriptions();
    for (const s of localSubs) {
      if (s && s.endpoint && s.p256dh && s.auth) {
        allSubsMap.set(s.endpoint, s);
      }
    }

    // From Supabase database (with error shielding)
    try {
      const { data: dbSubs, error: dbError } = await supabaseAdmin
        .from('admin_push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth');
      if (!dbError && Array.isArray(dbSubs)) {
        for (const s of dbSubs) {
          if (s && s.endpoint && s.p256dh && s.auth) {
            allSubsMap.set(s.endpoint, s);
          }
        }
      }
    } catch (e) {
      console.warn('[push] Supabase select non-fatal notice:', e);
    }

    const subscriptions = Array.from(allSubsMap.values());

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum dispositivo de administrador subscrito no momento. Ative as notificações no painel administrativo.',
        sent: 0,
      });
    }

    let sentCount = 0;
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
        console.warn('[push] Push send error for endpoint:', status, sendErr.message);
        if (status === 410 || status === 404) {
          expiredEndpoints.push(subRecord.endpoint);
        }
      }
    }

    // Cleanup expired subscriptions
    for (const ep of expiredEndpoints) {
      removeLocalSubscription(ep);
      try {
        await supabaseAdmin.from('admin_push_subscriptions').delete().eq('endpoint', ep);
      } catch {}
    }

    return res.status(200).json({
      success: true,
      sent: sentCount,
      expiredRemoved: expiredEndpoints.length,
      totalTargeted: subscriptions.length,
      message: `Notificações processadas com sucesso (${sentCount} enviadas para aparelhos ativos).`,
    });
  } catch (err: any) {
    console.error('[push] Fatal error handling notification:', err);
    return res.status(500).json({ error: `Erro no envio de notificações: ${err.message}` });
  }
}
