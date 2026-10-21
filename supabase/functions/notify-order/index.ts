// Supabase Edge Function: notify-order
// Runtime: Deno (Supabase Edge Runtime)
// Uses native Web Crypto & RFC 8291/8292 implementation via jsr:@negrel/webpush

import { createClient } from "npm:@supabase/supabase-js@2.48.1";
import {
  ApplicationServer,
  importVapidKeys,
  type PushSubscription as NegrelPushSubscription,
} from "jsr:@negrel/webpush@0.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET") || "wu_webhook_secret_2026";

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@wearingunusual.com";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do servidor Supabase incompleta (URL ou Service Role Key em falta)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: "Chaves VAPID não configuradas nos Secrets do Supabase (VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase Admin Client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let isTestRequest = false;
    let targetUserId: string | null = null;
    let pushPayload = {
      title: "Wearing Unusual • Nova Encomenda",
      body: "Foi registada uma nova encomenda na loja.",
      url: "/admin",
    };

    // 2. Authentication & Authorization Check
    const authHeader = req.headers.get("Authorization");
    const incomingWebhookSecret = req.headers.get("x-webhook-secret");

    const bodyText = await req.text();
    let bodyData: Record<string, unknown> = {};
    if (bodyText) {
      try {
        bodyData = JSON.parse(bodyText);
      } catch {
        // Ignored if non-json
      }
    }

    // Case A: Test Request from authenticated administrator in /admin
    if (bodyData.action === "test") {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Cabeçalho de autorização em falta para pedido de teste." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const { data: { user }, error: userError } = await adminClient.auth.getUser(token);

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Sessão inválida ou utilizador não autenticado." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      isTestRequest = true;
      targetUserId = user.id;

      const testType = bodyData.eventType || "test";
      if (testType === "pre_order") {
        pushPayload = {
          title: "Nova pré-encomenda",
          body: "Pré-encomenda WU-PRE-774422 • CÁPSULA TIMELESS HOODIE (Teste Admin)",
          url: "/admin?category=pre_orders",
        };
      } else if (testType === "restock_request") {
        pushPayload = {
          title: "Novo pedido de reposição",
          body: 'Pedido de reposição para "LUANDA VINTAGE TEE" registado no atelier.',
          url: "/admin?category=restock_requests",
        };
      } else if (testType === "order") {
        pushPayload = {
          title: "Wearing Unusual • Nova Encomenda",
          body: "Nova encomenda WU-998811 (Teste Admin) registada na loja.",
          url: "/admin?category=regular_orders",
        };
      } else {
        pushPayload = {
          title: "Wearing Unusual • Teste Concluído",
          body: "Notificações push configuradas com sucesso no seu iPhone.",
          url: "/admin",
        };
      }
    } else {
      // Case B: Real Webhook triggered by INSERT on orders or restock_requests
      if (!webhookSecret) {
        return new Response(
          JSON.stringify({ error: "WEBHOOK_SECRET não configurado nos Secrets da Edge Function." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (incomingWebhookSecret && incomingWebhookSecret !== webhookSecret) {
        return new Response(
          JSON.stringify({ error: "Acesso não autorizado: x-webhook-secret inválido ou ausente." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If Database Webhook, ensure it is strictly an INSERT operation (deduplication)
      if (bodyData.type && bodyData.type !== "INSERT") {
        return new Response(
          JSON.stringify({ message: "Operação ignorada: apenas novos INSERTs acionam notificações." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const record = (bodyData.record || bodyData) as Record<string, any>;
      const table = String(bodyData.table || record.table || "").toLowerCase();
      const specifiedType = String(bodyData.event_type || record.event_type || "").toLowerCase();

      const isRestock =
        specifiedType === "restock_request" ||
        table === "restock_requests" ||
        Boolean(record.product_id && !record.tracking_code && record.collection_name);

      const isPreOrder =
        !isRestock &&
        (specifiedType === "pre_order" ||
          record.order_type === "pre_order" ||
          Boolean(record.is_pre_order) ||
          (Array.isArray(record.items) && record.items.some((i: any) => i && i.is_pre_order)));

      if (isRestock) {
        const productName = String(record.product_name || record.productName || "Peça").trim();
        pushPayload = {
          title: "Novo pedido de reposição",
          body: `Pedido de reposição para "${productName}" registado no atelier.`,
          url: "/admin?category=restock_requests",
        };
      } else if (isPreOrder) {
        const trackingCode = String(record.tracking_code || "").trim();
        const customerName = String(record.customer_name || "").trim();
        let productName = String(record.product_name || "").trim();
        if (!productName && Array.isArray(record.items) && record.items.length > 0) {
          const first = record.items[0];
          productName = String(first.product_name || first.name || first.title || "").trim();
        }

        let bodyText = "";
        if (trackingCode && productName) {
          bodyText = `Pré-encomenda ${trackingCode} • ${productName}${customerName ? ` (${customerName})` : ""}`;
        } else if (trackingCode) {
          bodyText = `Pré-encomenda ${trackingCode}${customerName ? ` (${customerName})` : ""} registada no atelier.`;
        } else if (productName) {
          bodyText = `Nova pré-encomenda de "${productName}" registada no atelier.`;
        } else {
          bodyText = "Nova pré-encomenda registada no atelier.";
        }

        pushPayload = {
          title: "Nova pré-encomenda",
          body: bodyText,
          url: "/admin?category=pre_orders",
        };
      } else {
        const trackingCode = String(record.tracking_code || "").trim();
        const customerName = String(record.customer_name || "").trim();
        pushPayload = {
          title: "Wearing Unusual • Nova Encomenda",
          body: trackingCode
            ? `Nova encomenda ${trackingCode}${customerName ? ` (${customerName})` : ""} registada na loja.`
            : "Foi registada uma nova encomenda na loja.",
          url: "/admin?category=regular_orders",
        };
      }
    }

    // 3. Fetch Push Subscriptions from public.admin_push_subscriptions
    let query = adminClient.from("admin_push_subscriptions").select("id, user_id, endpoint, p256dh, auth");
    if (isTestRequest && targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) {
      return new Response(
        JSON.stringify({ error: `Erro ao obter subscrições: ${subsError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          message: isTestRequest
            ? "Nenhum dispositivo registado para a sua conta de administrador. Ative primeiro o botão no painel."
            : "Nenhum administrador com notificações push ativas no momento.",
          sent: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Initialize VAPID ApplicationServer using native Deno Web Crypto (jsr:@negrel/webpush)
    const vapidKeys = await importVapidKeys({
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey,
    }, { extractable: false });

    const appServer = await ApplicationServer.new({
      contactInformation: vapidSubject,
      vapidKeys,
    });

    let sentCount = 0;
    const expiredIds: string[] = [];

    // 5. Send notifications and auto-prune expired subscriptions (HTTP 410 Gone / 404)
    for (const subRecord of subscriptions as PushSubscriptionRecord[]) {
      try {
        const sub: NegrelPushSubscription = {
          endpoint: subRecord.endpoint,
          keys: {
            p256dh: subRecord.p256dh,
            auth: subRecord.auth,
          },
        };

        const res = await appServer.sendNotification(sub, JSON.stringify(pushPayload), {
          urgency: "high",
          ttl: 60 * 60 * 24, // 24 hours
        });

        if (res.ok) {
          sentCount++;
        } else if (res.status === 410 || res.status === 404) {
          // Device has unsubscribed or revoked permission
          expiredIds.push(subRecord.id);
        }
      } catch (sendErr: unknown) {
        const errStr = String(sendErr);
        if (errStr.includes("410") || errStr.includes("404") || errStr.includes("unregistered") || errStr.includes("expired")) {
          expiredIds.push(subRecord.id);
        }
      }
    }

    // 6. Clean up obsolete subscriptions from database
    if (expiredIds.length > 0) {
      await adminClient.from("admin_push_subscriptions").delete().in("id", expiredIds);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        expiredRemoved: expiredIds.length,
        totalTargeted: subscriptions.length,
        message: `Notificações processadas com sucesso (${sentCount} enviadas).`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `Erro interno no envio de notificações: ${errorMsg}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
