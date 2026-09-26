import { AppData } from '../types';
import { appConfig } from '../config';
import { getSession } from './auth';
import { loadFromGas, pushToGasDetailed } from './sync';
import { canonical, mergeCatalog, sharedData, validateCatalog } from '../../shared/catalog.js';
export type QueueStatus = 'idle' | 'saving' | 'saved' | 'busy' | 'queued' | 'error' | 'readonly';
export interface SyncLogEntry { id:string; at:string; ok:boolean; where:string; detail:string }
export interface QueueState { status:QueueStatus; message:string; nextAt:number|null; attempts:number; inFlight:boolean; dirty:boolean; lastSuccessfulHash:string|null; lastSyncTime:string|null; logs:SyncLogEntry[] }
export const STORAGE_KEYS = {DATA:'pamyatka_data_v7', THEME:'pamyatka_theme_v7', ADMIN_AUTH:'pamyatka_admin_auth_v7', SCRIPT_URL:'pamyatka_script_url_v7'};
let state:QueueState={status:'idle',message:'Загрузка данных…',nextAt:null,attempts:0,inFlight:false,dirty:false,lastSuccessfulHash:null,lastSyncTime:null,logs:[]};
const listeners=new Set<()=>void>(), dataListeners=new Set<(data:AppData)=>void>();
let base:AppData|null=null, latest:AppData|null=null, revision:number|undefined, endpoint='', epoch=0;
let timer:ReturnType<typeof setTimeout>|undefined, running:Promise<void>|null=null;
let request:{id:string; data:AppData; revision:number}|null=null;
let draftKey='';
function update(part:Partial<QueueState>) { state={...state,...part}; listeners.forEach(l=>l()); }
export function subscribeQueue(l:()=>void) { listeners.add(l); return ()=>{listeners.delete(l);}; }
export function subscribeData(l:(data:AppData)=>void) { dataListeners.add(l); return ()=>{dataListeners.delete(l);}; }
export function getQueueSnapshot() { return state; }
export function getReadVersion() { return revision; }
export function getEditEpoch() { return epoch; }
export function computeDataHash(data:AppData|null) { return data ? canonical(sharedData(data)):''; }
export function writeSyncLog(e:{ok:boolean;where:string;detail:string}) {
  update({logs:[{...e,id:crypto.randomUUID(),at:new Date().toLocaleTimeString('ru-RU')},...state.logs].slice(0,20)});
}
export function saveLocal(data:AppData) { try { localStorage.setItem(STORAGE_KEYS.DATA,JSON.stringify(data)); } catch { /* cache is optional; draft persistence reports errors */ } }
function publish(data:AppData) { latest=data; saveLocal(data); dataListeners.forEach(l=>l(data)); }
function persist() {
  try {
    if (!draftKey) { draftKey='pamyatka_draft_v8_'+crypto.randomUUID(); sessionStorage.setItem('pamyatka_draft_key_v8',draftKey); }
    localStorage.setItem(draftKey,JSON.stringify({endpoint,base,latest,revision,request,at:Date.now()}));
  } catch { update({status:'error',message:'Не удалось сохранить черновик на устройстве. Не закрывайте вкладку; экспортируйте JSON.'}); }
}
function clearDraft() { try { if (draftKey) localStorage.removeItem(draftKey); } catch {} }
export function acceptRemote(data:AppData|undefined, rev:number, url:string, readEpoch:number):boolean {
  if (readEpoch!==epoch || state.dirty || state.inFlight || (revision!==undefined && endpoint===url && rev<revision)) return false;
  endpoint=url; revision=rev; base=data || null;
  if (data) publish({...data,settings:{...data.settings,googleScriptUrl:url}});
  update({status:'saved', message:data ? 'Данные актуальны':'Таблица пуста. Войдите и отправьте исходный каталог.',lastSyncTime:new Date().toLocaleTimeString('ru-RU')});
  return true;
}
export function switchEndpoint(url:string) {
  if (state.dirty || state.inFlight) throw new Error('Сначала сохраните текущие правки или экспортируйте и отмените черновик.');
  epoch++; endpoint=url; revision=undefined; base=null; latest=null; request=null;
  update({status:'idle',message:'Подключаем таблицу…'});
}
export function noteDraft(data:AppData):boolean {
  if (!getSession(endpoint)) { update({status:'readonly',message:'Войдите в режим администратора'}); return false; }
  if (revision===undefined) { update({status:'error',message:'Сначала загрузите текущие данные из Google Таблицы'}); return false; }
  try { validateCatalog(data); } catch(e:any) { update({status:'error',message:e.message}); return false; }
  if (base && computeDataHash(base)===computeDataHash(data) && !state.dirty) return true;
  latest=data; epoch++; saveLocal(data);
  update({dirty:true,status:'queued',message:'Правки ожидают отправки',attempts:0}); persist(); schedule(900); return true;
}
function schedule(ms:number) {
  clearTimeout(timer); update({nextAt:Date.now()+ms});
  timer=setTimeout(()=>{void flushNow();},ms);
}
function overlayLocal(shared:AppData, local:AppData):AppData {
  return {...shared,settings:{...shared.settings,googleScriptUrl:endpoint,adminPasswordHash:'',theme:local.settings.theme,compactMode:local.settings.compactMode}};
}
async function run() {
  if (!state.dirty || !latest || revision===undefined) return;
  if (!getSession(endpoint)) { update({status:'readonly',message:'Войдите заново. Черновик сохранён.',nextAt:null}); return; }
  if (!navigator.onLine) { update({status:'queued',message:'Нет сети. Черновик сохранён на устройстве.',nextAt:null}); return; }
  update({inFlight:true,status:'saving',nextAt:null,message:'Записываем в таблицу…'});
  try {
    // One exact request ID/body persists across ambiguous network failures and reloads.
    if (!request) request={id:crypto.randomUUID(),data:sharedData(latest),revision};
    persist(); const sent=request;
    const result=await pushToGasDetailed(endpoint,sent.data,sent.revision,sent.id);
    if (result.ok && result.data && result.revision!==undefined) {
      const rebased=mergeCatalog(sent.data,sharedData(latest!),sharedData(result.data));
      request=null; base=result.data; revision=result.revision;
      publish(overlayLocal(rebased.data,latest!));
      const dirty=computeDataHash(latest)!==computeDataHash(base);
      update({dirty,status:dirty?'queued':'saved',attempts:0,message:dirty?'Отправляем следующие правки…':'Записано в таблицу',lastSyncTime:new Date().toLocaleTimeString('ru-RU')});
      if (dirty) { persist(); if(rebased.conflicts.length) update({status:'error',message:'Конфликт после повторного запроса. Черновик сохранён.'}); else schedule(900); } else clearDraft();
    } else if (result.reason==='conflict' && result.data && result.revision!==undefined) {
      if (!base) { update({status:'error',message:'Таблица уже заполнена. Экспортируйте черновик и загрузите данные сервера.'}); return; }
      const merged=mergeCatalog(sharedData(base),sharedData(latest!),sharedData(result.data));
      if (merged.conflicts.length) {
        update({status:'error',message:'Конфликт в полях: '+merged.conflicts.slice(0,4).join(', ')+'. Черновик сохранён. Нажмите «Загрузить из таблицы» для выбора.'});
        return;
      }
      try { validateCatalog(merged.data); } catch { update({status:'error',message:'Конфликт структуры каталога. Черновик сохранён; загрузите данные сервера после экспорта.'}); return; }
      request=null; base=result.data; revision=result.revision; publish(overlayLocal(merged.data,latest!)); persist();
      const attempts=state.attempts+1;
      update({status:attempts<=6?'queued':'error',message:'Каталог изменился на другом устройстве. Независимые правки объединены.',attempts});
      if(attempts<=6) schedule(300+Math.random()*700);
    } else {
      const attempts=state.attempts+1;
      const retry=['network','timeout','busy'].includes(result.reason) && attempts<=6;
      update({status:retry?'queued':'error',attempts,message:result.detail});
      writeSyncLog({ok:false,where:'Запись',detail:result.detail}); persist();
      if(retry) schedule(Math.min(60000,2000*2**attempts)+Math.random()*1000);
    }
  } finally { update({inFlight:false}); }
}
export async function flushNow(data?:AppData):Promise<void> {
  if (data && !state.dirty && !noteDraft(data)) return;
  clearTimeout(timer);
  if (running) { await running; if(state.dirty && state.status!=='error') return flushNow(); return; }
  running=run(); try { await running; } finally { running=null; }
}
export async function retryNow() { update({attempts:0}); await flushNow(); }
export async function flushBeforePull():Promise<boolean> { if(state.dirty) await flushNow(); return !state.dirty && !state.inFlight; }
export function getDraftData() { return latest; }
export async function resolveBeforePull():Promise<boolean> {
  if (!state.dirty) return true;
  await flushNow(); if (!state.dirty) return true;
  const res=await loadFromGas(endpoint);
  if(!res.ok || !res.data || res.revision===undefined || !base || !latest) return false;
  const merged=mergeCatalog(sharedData(base),sharedData(latest),sharedData(res.data));
  if(merged.conflicts.length && confirm('Другое устройство изменило те же поля:\n'+merged.conflicts.slice(0,8).join('\n')+'\n\nОК — сохранить ваши значения в этих полях и объединить остальные правки. Отмена — оставить черновик без отправки.')) {
    try { validateCatalog(merged.data); } catch(e:any) { update({status:'error',message:e.message}); return false; }
    request=null; base=res.data; revision=res.revision; publish(overlayLocal(merged.data,latest)); persist(); await retryNow(); return !state.dirty;
  }
  if(confirm('Загрузить серверную версию и отменить местные правки? Перед отменой черновик будет скачан в JSON.')) {
    const blob=new Blob([JSON.stringify(latest,null,2)],{type:'application/json'}), a=document.createElement('a'), url=URL.createObjectURL(blob);
    a.href=url; a.download='catalog-conflict-draft.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    epoch++; request=null; clearTimeout(timer); clearDraft(); update({dirty:false}); return true;
  }
  return false;
}
export function resumeDraft(url:string) {
  if (!getSession(url) || state.dirty) return;
  try {
    let key=sessionStorage.getItem('pamyatka_draft_key_v8');
    if (!key || !localStorage.getItem(key)) {
      const available=Object.keys(localStorage).filter(k=>k.startsWith('pamyatka_draft_v8_')).map(k=>({k,v:JSON.parse(localStorage.getItem(k)!)})).filter(x=>x.v.endpoint===url).sort((a,b)=>b.v.at-a.v.at);
      if(available.length && confirm('Найден несохранённый черновик. Восстановить его? Убедитесь, что исходная вкладка закрыта.')) key=available[0].k;
    }
    const saved=key && JSON.parse(localStorage.getItem(key)||'null');
    if (saved && saved.endpoint===url && saved.latest && Number.isSafeInteger(saved.revision)) {
      validateCatalog(saved.latest); if(saved.base) validateCatalog(saved.base);
      draftKey=key!; sessionStorage.setItem('pamyatka_draft_key_v8',draftKey); endpoint=url; base=saved.base; latest=saved.latest; revision=saved.revision; request=saved.request || null; epoch++;
      publish(latest!); update({dirty:true,status:'queued',message:'Восстановлен несохранённый черновик'}); schedule(1000);
    }
  } catch { update({status:'error',message:'Не удалось восстановить черновик. Исходная запись сохранена на устройстве.'}); }
}
export function startQueueService() {
  if (state.dirty && getSession(endpoint)) schedule(1000);
  const online=()=>{if(state.dirty) schedule(1000);};
  const before=(event:BeforeUnloadEvent)=>{if(state.dirty || state.inFlight) {event.preventDefault();event.returnValue='';}};
  window.addEventListener('online',online); window.addEventListener('beforeunload',before);
  return ()=>{window.removeEventListener('online',online);window.removeEventListener('beforeunload',before);clearTimeout(timer);};
}
export function pauseQueue() { clearTimeout(timer); }
export function getEndpoint() { return endpoint || appConfig.gasUrl; }

export function reportReadResult(ok:boolean, error?:string) {
  if (state.dirty || state.inFlight) return;
  update({status:ok?'saved':'error',message:ok?'Данные актуальны':(error || 'Нет связи. Показана локальная копия.')});
}
