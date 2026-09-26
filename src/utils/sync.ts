import { AppData } from '../types';
import { GAS_TARGET_VERSION } from '../config';
import { validateCatalog } from '../../shared/catalog.js';
import { getSession, saveSession, clearSession } from './auth';
export type PushReason = 'ok' | 'busy' | 'network' | 'timeout' | 'outdated' | 'server' | 'http' | 'conflict' | 'unauthorized';
export interface LoadGasResult { ok: boolean; data?: AppData; revision?: number; unchanged?: boolean; isEmpty?: boolean; gasVersion?: number; error?: string; isOutdated?: boolean }
export interface PushResult { ok: boolean; reason: PushReason; detail: string; data?: AppData; revision?: number }
export function isValidGoogleScriptUrl(raw?: string): boolean {
  if (!raw) return false;
  try { const u = new URL(raw.trim()); return u.protocol === 'https:' && u.hostname === 'script.google.com' && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname) && !u.search && !u.hash && !u.username && !u.password; } catch { return false; }
}
export async function requestGas(url: string, payload?: object, params: Record<string, string> = {}, timeout = 35000): Promise<any> {
  if (!isValidGoogleScriptUrl(url)) throw new Error('Укажите URL Google Apps Script, заканчивающийся на /exec');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const target = new URL(url);
    if (!payload) { for (const [k,v] of Object.entries(params)) target.searchParams.set(k,v); target.searchParams.set('_', String(Date.now())); }
    const res = await fetch(target.toString(), { method: payload ? 'POST' : 'GET', ...(payload ? { body: JSON.stringify(payload), headers: {'Content-Type': 'text/plain;charset=utf-8'} } : {cache: 'no-store' as RequestCache}), signal: controller.signal, redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (json.gasVersion !== GAS_TARGET_VERSION) throw new Error('Обновите Backend.gs до версии ' + GAS_TARGET_VERSION + ' и опубликуйте новую версию развёртывания.');
    return json;
  } finally { clearTimeout(timer); }
}
export async function loginAdmin(url: string, password: string): Promise<void> {
  const res = await requestGas(url, {action:'login', password});
  if (res.status !== 'ok' || !res.token) throw new Error(res.error || 'Не удалось войти');
  saveSession({token:res.token, expiresAt:res.expiresAt, url});
}
export async function getGasVersion(url: string): Promise<number> {
  try { return (await requestGas(url, undefined, {action:'ping'}, 15000)).gasVersion; } catch { return -1; }
}
export function normalizeAppData(raw: unknown): AppData {
  const data = validateCatalog(raw);
  return {...data, settings:{...data.settings, adminPasswordHash:'', googleScriptUrl:'', theme:'dark', compactMode:false}};
}
export async function loadFromGas(url: string, revision?: number): Promise<LoadGasResult> {
  try {
    const json = await requestGas(url, undefined, {action:'getData', ...(revision !== undefined ? {revision:String(revision)} : {})});
    if (json.status === 'unchanged') return {ok:true, unchanged:true, revision:json.revision};
    if (json.status === 'empty') return {ok:true, isEmpty:true, revision:0};
    if (json.status !== 'ok' || !Number.isSafeInteger(json.revision)) return {ok:false, error:json.error || 'Неверный ответ сервера'};
    return {ok:true, data:normalizeAppData(json.data), revision:json.revision, gasVersion:json.gasVersion};
  } catch (e: any) { return {ok:false, error:e.name === 'AbortError' ? 'Нет ответа от Google Таблицы: показана локальная копия' : e.message}; }
}
export async function pushToGasDetailed(url: string, data: AppData, revision: number, requestId: string): Promise<PushResult> {
  const session = getSession(url);
  if (!session) return {ok:false, reason:'unauthorized', detail:'Войдите в режим администратора заново. Черновик сохранён.'};
  try {
    const json = await requestGas(url, {action:'saveData', data, baseRevision:revision, requestId, token:session.token});
    if (json.status === 'unauthorized') clearSession();
    if (json.status === 'ok' || json.status === 'conflict') {
      if (!Number.isSafeInteger(json.revision)) throw new Error('Неверная версия данных');
      return {ok:json.status === 'ok', reason:json.status, detail:json.status === 'ok' ? 'Записано в таблицу' : 'Данные изменены на другом устройстве', data:normalizeAppData(json.data), revision:json.revision};
    }
    return {ok:false, reason:json.status === 'busy' ? 'busy' : json.status === 'unauthorized' ? 'unauthorized' : 'server', detail:json.error || 'Ошибка сервера'};
  } catch (e:any) { return {ok:false, reason:e.name === 'AbortError' ? 'timeout' : 'network', detail:e.message || 'Сбой соединения'}; }
}
