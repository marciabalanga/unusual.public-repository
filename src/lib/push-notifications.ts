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
    const registration = await navigator.serviceWorker.getRegistration('/sw.js') || await navigator.serviceWorker.ready;
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
    // 1. Register Service Worker
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

    // 3. Obtain VAPID Public Key
    const rawVapidKey = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim();
    if (!rawVapidKey) {
      return {
        success: false,
        error: 'Chave pública VAPID (VITE_VAPID_PUBLIC_KEY) não configurada no ambiente.',
      };
    }

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

    // 5. Save to Supabase public.admin_push_subscriptions with strict RLS (auth.uid() = user_id)
    const { error: dbError } = await supabase
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

    if (dbError) {
      return {
        success: false,
        error: `Erro ao registar subscrição na base de dados: ${dbError.message}`,
      };
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
        await supabase
          .from('admin_push_subscriptions')
          .delete()
          .eq('endpoint', endpoint)
          .eq('user_id', userId);
      }
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
      return { success: false, error: 'Sessão de administrador não encontrada ou expirada.' };
    }

    // Try local / Vercel API endpoint first, fallback to Supabase Edge Function
    let res: Response | null = null;
    let lastError = '';

    try {
      res = await fetch('/api/notify-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'test' }),
      });
    } catch (e: any) {
      lastError = e?.message || '';
    }

    if (!res || !res.ok) {
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/notify-order`;
      try {
        const edgeRes = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'test' }),
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

    if (!res || !res.ok) {
      const errText = res ? await res.text().catch(() => '') : lastError;
      return {
        success: false,
        error: `A função de notificações respondeu com erro (${res?.status || 'falha de rede'}): ${errText || 'Serviço indisponível'}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      message: data.message || 'Notificação de teste enviada com sucesso para os seus dispositivos.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Falha ao contactar servidor de notificações: ${msg}` };
  }
}
