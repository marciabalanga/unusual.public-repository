# Plano de Implementação Final: Notificações Push no iPhone (Wearing Unusual)

Este documento estabelece o plano final e validado tecnicamente para entrega de notificações Web Push reais no iPhone (Safari / PWA no Ecrã Principal) para novas encomendas na Wearing Unusual.

---

## 1. Verificação Técnica da Biblioteca Deno & Cifragem Web Push

### A. Diagnóstico da Biblioteca
* A biblioteca tradicional `npm:web-push` depende internamente de módulos legados do Node.js (`crypto.createECDH`, `crypto.createCipheriv`), propensos a incompatibilidades no runtime Deno das Edge Functions da Supabase.
* **Solução Oficial e Comprovada:** `jsr:@negrel/webpush`
  * Desenvolvida especificamente para Deno e Web Standards.
  * Suporta integralmente o padrão **RFC 8292** (VAPID com curva P-256) e a cifragem **RFC 8291** (`aes128gcm` via Web Crypto API nativa `crypto.subtle`).
  * 100% compatível com os servidores de push da Apple (`https://web.push.apple.com`) utilizados pelo Safari no iOS 16.4+.

---

## 2. Reforço da Autorização na Base de Dados e na Edge Function

### A. Autorização da Tabela `public.admin_push_subscriptions`
Para assegurar que clientes da loja ou utilizadores anónimos não têm acesso às subscrições dos administradores:
1. `REVOKE ALL ON public.admin_push_subscriptions FROM anon;`
2. `GRANT ALL ON public.admin_push_subscriptions TO authenticated, service_role;`
3. Políticas RLS exigem cumulativamente:
   * `auth.role() = 'authenticated'` (apenas administradores criados no Supabase Auth)
   * `auth.uid() = user_id` (cada administrador gere apenas o seu próprio aparelho)

### B. Proteção do Endpoint da Edge Function
* **Disparo Automático (Webhook de Encomenda):** Validação obrigatória do cabeçalho `x-webhook-secret: <WEBHOOK_SECRET>`.
* **Disparo de Teste (Admin Autenticado):** Validação obrigatória do JWT no cabeçalho `Authorization: Bearer <TOKEN>`, filtrando o envio exclusivamente para o `user_id` correspondente. Não insere encomendas nem toca em tabelas de venda.

---

## 3. Ficheiros a Criar e Alterar

| Ficheiro | Ação | Descrição |
| :--- | :--- | :--- |
| `public/sw.js` | Criar | Service Worker que escuta eventos `push` (exibe notificação sem PII) e `notificationclick` (abre `/admin`). |
| `src/lib/push-notifications.ts` | Criar | Funções de verificação iOS/PWA, subscrição no PushManager, teste e sincronização com Supabase. |
| `supabase/functions/notify-order/index.ts` | Criar | Edge Function Deno com validação de segredo, envio seguro via `jsr:@negrel/webpush` e auto-remoção de subscrições 410/404. |
| `index.html` | Alterar | Remover desregisto forçado de Service Workers para permitir persistência do `sw.js`. |
| `src/components/admin/admin-panel.tsx` | Alterar | Adicionar secção de gestão de notificações no iPhone com guia PWA, botão de ativação e botão de teste. |
| `.env.example` | Alterar | Documentar variável `VITE_VAPID_PUBLIC_KEY`. |

---

## 4. Passos de Execução & Testes

1. Ajustar `index.html` (preservando limpezas de cache de dados).
2. Criar `public/sw.js`.
3. Criar `src/lib/push-notifications.ts`.
4. Integrar componentes no painel `/admin` (`src/components/admin/admin-panel.tsx`).
5. Criar ficheiro da Edge Function em `supabase/functions/notify-order/index.ts`.
6. Atualizar `.env.example`.
7. Executar verificações de TypeScript (`tsc --noEmit`) e compilação de produção (`vite build`).
