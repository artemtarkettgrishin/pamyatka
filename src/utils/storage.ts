import { getSession, clearSession } from './auth';
import { validateCatalog } from '../../shared/catalog.js';
import { AppData } from '../types';
import { INITIAL_APP_DATA } from '../data/initialData';
import { appConfig } from '../config';
import { isValidGoogleScriptUrl } from './sync';
import { STORAGE_KEYS } from './writeQueue';

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {}
  return 'dark';
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try { localStorage.setItem(STORAGE_KEYS.THEME, theme); } catch {}
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/**
 * Получение активного URL Google Таблицы:
 * 1. appConfig.gasUrl (если прописан в config.ts)
 * 2. URL query параметр (?sheet= или ?script=)
 * 3. LocalStorage
 */
export function getStoredScriptUrl(): string {
  // Config does not depend on browser storage availability.
  if (isValidGoogleScriptUrl(appConfig.gasUrl)) return appConfig.gasUrl.trim();
  try {
    // 1. Если прописан в config.ts appConfig.gasUrl — используем его для всех устройств!
    if (isValidGoogleScriptUrl(appConfig.gasUrl)) {
      return appConfig.gasUrl.trim();
    }

    // 2. URL query параметр (?sheet= или ?script=)
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const urlFromQuery = params.get('sheet') || params.get('script') || params.get('url');
      if (urlFromQuery && isValidGoogleScriptUrl(urlFromQuery)) {
        try { localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, urlFromQuery.trim()); } catch {}
        return urlFromQuery.trim();
      }
    }

    // 3. LocalStorage
    const saved = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
    if (saved && isValidGoogleScriptUrl(saved)) {
      return saved.trim();
    }
  } catch (e) {}
  return '';
}

export function setStoredScriptUrl(url: string): void {
  if (!isValidGoogleScriptUrl(url)) throw new Error('Неверный адрес Google Apps Script');
  if (isValidGoogleScriptUrl(appConfig.gasUrl) && appConfig.gasUrl !== url) throw new Error('Адрес задан в src/config.ts; измените его и пересоберите приложение.');
  localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url.trim());
  const page = new URL(window.location.href);
  for (const key of ['sheet', 'script', 'url']) page.searchParams.delete(key);
  window.history.replaceState(null, '', page.toString());
}

export function loadAppData(): AppData {
  const activeScriptUrl = getStoredScriptUrl();

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DATA);
    if (!raw) {
      const initialWithConfig: AppData = {
        ...INITIAL_APP_DATA,
        settings: {
          ...INITIAL_APP_DATA.settings,
          googleScriptUrl: activeScriptUrl
        }
      };
      return initialWithConfig;
    }

    const parsed = validateCatalog(JSON.parse(raw));
    if (activeScriptUrl && parsed.settings.googleScriptUrl !== activeScriptUrl) return {...INITIAL_APP_DATA, settings:{...INITIAL_APP_DATA.settings,googleScriptUrl:activeScriptUrl}};
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      return {...INITIAL_APP_DATA, settings:{...INITIAL_APP_DATA.settings,googleScriptUrl:activeScriptUrl}};
    }

    parsed.settings = {
      ...parsed.settings,
      googleScriptUrl: activeScriptUrl || parsed.settings?.googleScriptUrl || ''
    };

    return parsed;
  } catch (e) {
    return {...INITIAL_APP_DATA, settings:{...INITIAL_APP_DATA.settings,googleScriptUrl:activeScriptUrl}};
  }
}

export function saveAppData(data: AppData): void {
  try {
    const updatedData = data;
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(updatedData));

  } catch (e) {}
}

export function resetAppData(): AppData {
  const activeScriptUrl = getStoredScriptUrl();
  const initialWithConfig: AppData = {
    ...INITIAL_APP_DATA,
    settings: {
      ...INITIAL_APP_DATA.settings,
      googleScriptUrl: activeScriptUrl
    }
  };
  return initialWithConfig;
}

export function exportDataAsJson(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `seller-handbook-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDataFromJsonFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AppData;
        if (!parsed.categories || !Array.isArray(parsed.categories)) {
          throw new Error('Файл не содержит корректной структуры категорий');
        }
        validateCatalog(parsed);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsText(file);
  });
}

export function getAdminAuthState(): boolean { return !!getSession(getStoredScriptUrl()); }
export function setAdminAuthState(isAuth: boolean): void { if (!isAuth) clearSession(); }
