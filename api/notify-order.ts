import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmryqhilyisbfdpnsiwo.supabase.co';
// In Supabase, service_role key allows querying admin_push_subscriptions with RLS bypass on the server
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

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, x-webhook-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const incomingWebhookSecret = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
    const body = req.body || {};

    let isTestRequest = false;
    let targetUserId: string | null = null;
    let pushPayload = {
      title: 'Wearing Unusual • Nova Encomenda',
      body: 'Foi registada uma nova encomenda na loja.',
      url: '/admin',
    };

    // Client with service role or publishable key
    const clientKey = SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_O8oVIAZLkvJveyQ0Qiehhg_AX82Ehqw';
    const supabaseAdmin = createClient(SUPABASE_URL, clientKey);

    if (body.action === 'test') {
      if (!authHeader) {
        return res.status(401).json({ error: 'Cabeçalho de autorização em falta para pedido de teste.' });
      }

      const token = String(authHeader).replace(/^Bearer\s+/i, '').trim();
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

      if (userError || !user) {
        return res.status(401).json({ error: 'Sessão inválida ou administrador não autenticado.' });
      }

      isTestRequest = true;
      targetUserId = user.id;
      pushPayload = {
        title: 'Wearing Unusual • Teste Concluído',
        body: 'Notificações push configuradas com sucesso no seu iPhone.',
        url: '/admin',
      };
    } else {
      // Webhook validation
      if (incomingWebhookSecret && incomingWebhookSecret !== WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Acesso não autorizado: x-webhook-secret inválido.' });
      }

      if (body.type && body.type !== 'INSERT') {
        return res.status(200).json({ message: 'Operação ignorada: apenas novos INSERTs acionam notificações.' });
      }
    }

    // Query active subscriptions (use authenticated user client for test requests to satisfy RLS)
    const token = isTestRequest && authHeader ? String(authHeader).replace(/^Bearer\s+/i, '').trim() : '';
    const queryClient = isTestRequest && token
      ? createClient(SUPABASE_URL, clientKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
      : supabaseAdmin;

    let query = queryClient.from('admin_push_subscriptions').select('id, user_id, endpoint, p256dh, auth');
    if (isTestRequest && targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) {
      return res.status(500).json({ error: `Erro ao obter subscrições: ${subsError.message}` });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        message: isTestRequest
          ? 'Nenhum dispositivo registado para a sua conta de administrador. Ative primeiro o botão no painel.'
          : 'Nenhum administrador com notificações ativas no momento.',
        sent: 0,
      });
    }

    let sentCount = 0;
    const expiredIds: string[] = [];

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
        if (status === 410 || status === 404) {
          expiredIds.push(subRecord.id);
        }
      }
    }

    if (expiredIds.length > 0) {
      await supabaseAdmin.from('admin_push_subscriptions').delete().in('id', expiredIds);
    }

    return res.status(200).json({
      success: true,
      sent: sentCount,
      expiredRemoved: expiredIds.length,
      totalTargeted: subscriptions.length,
      message: `Notificações processadas com sucesso (${sentCount} enviadas).`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Erro no envio de notificações: ${err.message}` });
  }
}
