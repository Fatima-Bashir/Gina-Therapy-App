// @author: fatima bashir

export function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function clearAuth() {
  try { localStorage.removeItem('token'); } catch {}
  try { sessionStorage.clear(); } catch {}
  try {
    const parts = document.cookie.split(';');
    for (const p of parts) {
      const name = p.split('=')[0].trim();
      if (!name) continue;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  } catch {}
  if ('caches' in window) {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {});
  }
}

export function logoutAndRedirect(path = '/auth') {
  clearAuth();
  window.location.replace(path);
}



