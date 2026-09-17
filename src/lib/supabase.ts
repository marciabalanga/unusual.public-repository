import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  'https://tmryqhilyisbfdpnsiwo.supabase.co';
export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_O8oVIAZLkvJveyQ0Qiehhg_AX82Ehqw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealth {
  connected: boolean;
  url: string;
  hasTables: boolean;
  missingTables: string[];
  availableTables: string[];
  error?: string;
}

export async function testSupabaseConnection(): Promise<SupabaseHealth> {
  const tables = ['products', 'orders', 'site_blocks', 'site_dictionary', 'site_settings'];
  const missing: string[] = [];
  const available: string[] = [];

  try {
    // Run table checks in parallel to eliminate multi-second connection testing lag
    const results = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase.from(table).select('*').limit(1);
        return { table, error };
      })
    );

    for (const { table, error } of results) {
      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.message?.includes('not find the table') ||
          error.message?.includes('schema cache')
        ) {
          missing.push(table);
        } else {
          available.push(table);
        }
      } else {
        available.push(table);
      }
    }

    const hasAllCoreTables = !missing.includes('products') && !missing.includes('orders');

    return {
      connected: true,
      url: SUPABASE_URL,
      hasTables: hasAllCoreTables && missing.length === 0,
      missingTables: missing,
      availableTables: available,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      url: SUPABASE_URL,
      hasTables: false,
      missingTables: tables,
      availableTables: [],
      error: errorMsg,
    };
  }
}

/**
 * Uploads a payment receipt file to Supabase Storage bucket 'receipts'
 * Returns the public URL of the uploaded receipt.
 * If Supabase Storage upload encounters an issue or takes too long,
 * it safely falls back to a base64 Data URL so the order is completed without blocking.
 */
export async function uploadReceiptToSupabase(file: File, trackingCode: string): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = fileExt.replace(/[^a-z0-9]/g, '') || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  const fileName = `${trackingCode}_${timestamp}_${randomStr}.${cleanExt}`;

  // Race Supabase storage attempt with a 3.5s timeout so user is never kept waiting
  try {
    const uploadPromise = (async (): Promise<string | null> => {
      const targetBuckets = ['receipts', 'comprovativos'];
      for (const bucketName of targetBuckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || undefined,
            });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              return publicUrlData.publicUrl;
            }
          }
        } catch {
          // Proceed to next bucket or fallback
        }
      }
      return null;
    })();

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
    const resultUrl = await Promise.race([uploadPromise, timeoutPromise]);
    if (resultUrl) return resultUrl;
  } catch (err) {
    console.warn('[Supabase Storage] Falha ao enviar para bucket, usando fallback local:', err);
  }

  // Resilient fallback: Convert to Data URL (base64) so the receipt is never lost
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        resolve('');
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a general image (product photo, lookbook, banner, etc.) to Supabase Storage
 * Tries the 'products' or 'media' bucket, falling back to base64 Data URL if needed.
 */
export async function uploadImageToSupabase(file: File, folder = 'products'): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = fileExt.replace(/[^a-z0-9]/g, '') || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  const fileName = `${folder}/${timestamp}_${randomStr}.${cleanExt}`;

  // Try uploading to 'products' bucket first, then 'receipts'
  const bucketsToTry = ['products', 'media', 'receipts'];

  for (const bucket of bucketsToTry) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || undefined,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch {
      // Continue to next bucket or fallback
    }
  }

  // Resilient fallback: Data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Erro ao processar imagem'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler ficheiro de imagem'));
    reader.readAsDataURL(file);
  });
}

