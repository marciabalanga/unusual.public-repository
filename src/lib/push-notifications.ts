import { supabase, SUPABASE_URL } from './supabase';

// Convert base64url string to Uint8Array for PushManager applicationServerKey
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Detect if current browser / device supports Web Push
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Detect if device is iOS (iPhone/iPad/iPod)
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Detect if application is currently running in standalone PWA mode (Add to Home Screen)
export function isIOSStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as unknown as { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  );
}

// Retrieve active PushSubscription from the browser
export async function getBrowserPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration =
      (await navigator.serviceWorker.ready) ||
      (await navigator.serviceWorker.getRegistration('/admin')) ||
      (await navigator.serviceWorker.getRegistration('/')) ||
      (await navigator.serviceWorker.getRegistration());
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// Check if current device is subscribed in the browser
export async function isSubscribedToPush(): Promise<boolean> {
  const sub = await getBrowserPushSubscription();
  return sub !== null;
}

export interface PushSubscriptionResult {
  success: boolean;
  error?: string;
  isIOSInBrowser?: boolean;
}

// Subscribe the authenticated administrator's device to Web Push
export async function subscribeAdminToPush(userId: string): Promise<PushSubscriptionResult> {
  // On iOS, Safari hides window.Notification and PushManager until opened from Home Screen (PWA)
  if (isIOS() && !isIOSStandalone()) {
    return {
      success: false,
      isIOSInBrowser: true,
      error: 'No iPhone, é obrigatório adicionar a aplicação ao Ecrã Principal para ativar as notificações. Siga os 3 passos indicados no quadro acima.',
    };
  }

  if (!isPushSupported()) {
    return {
      success: false,
      error: 'O seu navegador ou versão do iOS não suporta notificações Web Push.',
    };
  }

  try {
    // 1. Register Service Worker with scope / to control all routes including /admin
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 2. Request user notification permission via explicit click
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error: permission === 'denied'
          ? 'Permissão de notificações recusada nas definições do dispositivo.'
          : 'Pedido de permissão de notificações não foi autorizado.',
      };
    }

    // 3. Obtain VAPID Public Key (with built-in official key fallback)
    const rawVapidKey =
      (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim() ||
      'BB6OqfeKOSrINtwTJ5BxZXx4By6atSWSLnUAuy9EntqGlQkCKbdkuavDXrdZUWx0uCIO_oFt3PP91274QDXlTBs';

    // 4. Subscribe on PushManager
    const applicationServerKey = urlBase64ToUint8Array(rawVapidKey);
    const existingSub = await registration.pushManager.getSubscription();
    const subscription = existingSub || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const subJson = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return {
        success: false,
        error: 'Não foi possível extrair as credenciais criptográficas da subscrição.',
      };
    }

    // Get current auth session to attach bearer token
    const { data: { session } } = await supabase.auth.getSession();

    // 5. Save to /api/notify-order backend for immediate high-resilience push delivery
    let apiSuccess = false;
    let apiError: string | null = null;
    try {
      const apiRes = await fetch('/api/notify-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          action: 'subscribe',
          userId,
          subscription: {
            endpoint,
            keys: { p256dh, auth },
          },
        }),
      });

      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success) {
        apiSuccess = true;
      } else {
        apiError = apiData.error || `Erro HTTP ${apiRes.status}`;
      }
    } catch (apiErr: any) {
      apiError = apiErr?.message || String(apiErr);
      console.warn('[push] Aviso ao sincronizar com /api/notify-order:', apiErr);
    }

    // 6. Save to Supabase public.admin_push_subscriptions with strict RLS (auth.uid() = user_id)
    let dbSuccess = false;
    let dbError: string | null = null;
    try {
      const { error: upsertErr } = await supabase
        .from('admin_push_subscriptions')
        .upsert(
          {
            user_id: userId,
            endpoint,
            p256dh,
            auth,
            user_agent: navigator.userAgent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' }
        );

      if (!upsertErr) {
        dbSuccess = true;
      } else {
        dbError = upsertErr.message;
        console.warn('[push] Erro ao sincronizar com Supabase:', upsertErr.code, upsertErr.message);
      }
    } catch (dbErr: any) {
      dbError = dbErr?.message || String(dbErr);
      console.warn('[push] Aviso de exceção na base de dados:', dbErr);
    }

    // REQUIREMENT 3: Only report success if the subscription has been effectively saved!
    if (!apiSuccess && !dbSuccess) {
      return {
        success: false,
        error: `A permissão foi concedida, mas a subscrição não pôde ser guardada no servidor: ${dbError || apiError || 'Falha de comunicação.'}`,
      };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('wu_push_device_subscribed', 'true');
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Falha ao ativar notificações: ${msg}`,
    };
  }
}

// Unsubscribe the current device
export async function unsubscribeAdminFromPush(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const sub = await getBrowserPushSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();

      if (userId) {
        try {
          await supabase
            .from('admin_push_subscriptions')
            .delete()
            .eq('endpoint', endpoint)
            .eq('user_id', userId);
        } catch {}
      }

      try {
        await fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'unsubscribe',
            endpoint,
          }),
        });
      } catch {}
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('wu_push_device_subscribed');
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// Send isolated test push to authenticated administrator only (no fake orders created)
export async function sendTestPushNotification(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Sessão de administrador não encontrada ou expirada. Inicie sessão novamente.' };
    }

    // Extract current device subscription to guarantee direct, targeted delivery without duplicates
    const sub = await getBrowserPushSubscription();
    let currentSubscription: { endpoint: string; keys: Record<string, string> } | null = null;
    if (sub) {
      const subJson = sub.toJSON();
      if (sub.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
        currentSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
          },
        };
      }
    }

    const payload = {
      action: 'test',
      currentSubscription,
    };

    // Call /api/notify-order with authentication header and current subscription
    let res: Response | null = null;
    let lastError = '';

    try {
      res = await fetch('/api/notify-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      lastError = e?.message || 'Falha de rede';
    }

    // If fetch failed or server error, attempt fallback to Supabase Edge Function if deployed
    if (!res || !res.ok) {
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/notify-order`;
      try {
        const edgeRes = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        });
        if (edgeRes.ok) {
          res = edgeRes;
        } else if (!res) {
          res = edgeRes;
        }
      } catch (e: any) {
        lastError = e?.message || lastError;
      }
    }

    if (!res) {
      return {
        success: false,
        error: `Falha ao contactar servidor de notificações: ${lastError || 'Serviço indisponível'}`,
      };
    }

    const data = await res.json().catch(() => ({}));

    // REQUIREMENT 4: Check res.ok AND data.success to prevent false positives
    if (!res.ok || data.success === false) {
      const errorMsg = data.error || data.message || `Servidor respondeu com código ${res.status}`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      message: data.message || 'Notificação de teste enviada com sucesso para o seu iPhone.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Falha ao enviar notificação de teste: ${msg}` };
  }
}
