export const GAS_TARGET_VERSION = 10;

export interface AppConfig {
  gasUrl: string;
  dataSource: 'local' | 'gas';
  autoPollMs: number;
  appName: string;
}

export const appConfig: AppConfig = {
  // Вставьте полученный URL веб-приложения Google Apps Script (.../exec) ниже в кавычки:
  gasUrl: 'https://script.google.com/macros/s/AKfycbxcG1E4QbllVP0pC_lHo_seK-5QolTNeIMjH7Q3Jzs58OHx1H6Bo95laSjTNF5pJDv6BA/exec',
  dataSource: 'gas',
  autoPollMs: 10000, // Проверка версии каждые 10–12 секунд + время ответа Google
  appName: 'Памятка продавца'
};

export function getTodayDateString(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
