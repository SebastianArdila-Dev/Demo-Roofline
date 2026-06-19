/* supabase-client.js — Roofline Company
 * Configuración del cliente Supabase para el frontend.
 *
 * INSTRUCCIONES:
 * 1. Crea tu proyecto en https://supabase.com
 * 2. Ve a Settings > API
 * 3. Copia "Project URL" y "anon public" key
 * 4. Reemplaza los valores a continuación
 *
 * SEGURIDAD:
 * - La anon key es PÚBLICA (diseñada para usarse en el navegador)
 * - La seguridad real está en las políticas RLS de Supabase
 * - NUNCA pongas la service_role_key aquí
 */

(function () {
  const SUPABASE_URL      = 'YOUR_SUPABASE_URL_HERE';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

  const isConfigured =
    SUPABASE_URL      !== 'YOUR_SUPABASE_URL_HERE' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
    SUPABASE_URL.startsWith('https://');

  window.RL_SUPABASE_CONFIGURED = isConfigured;
  window.RL_SUPABASE = null;

  if (isConfigured && typeof window.supabase !== 'undefined') {
    try {
      window.RL_SUPABASE = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('[RL] Error inicializando Supabase:', e.message);
      window.RL_SUPABASE_CONFIGURED = false;
    }
  } else if (!isConfigured) {
    console.info('[RL] Supabase no configurado. Usando fallback a data/products.json');
  }
})();
