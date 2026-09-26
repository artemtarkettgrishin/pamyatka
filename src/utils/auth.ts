const KEY = 'pamyatka_session_v8';
interface Session { token: string; url: string; expiresAt: number }
export function getSession(url?: string): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    return s && s.expiresAt > Date.now() && (!url || s.url === url) ? s : null;
  } catch { return null; }
}
export function saveSession(s: Session) { sessionStorage.setItem(KEY, JSON.stringify(s)); }
export function clearSession() { try { sessionStorage.removeItem(KEY); } catch { /* memory-only browser */ } }
