import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  FileCode,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
  AlertTriangle,
  Upload,
  Download,
  FileSpreadsheet,
  Clock,
  History
} from 'lucide-react';
import { AppData } from '../../types';
import { isValidGoogleScriptUrl, getGasVersion } from '../../utils/sync';
import { QueueState, retryNow } from '../../utils/writeQueue';
import { GAS_TARGET_VERSION } from '../../config';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  queueState: QueueState;
  onUpdateScriptUrl: (url: string) => Promise<void>;
  onDownloadFromSheets: () => Promise<void>;
  onUploadToSheets: () => Promise<void>;
  onOpenScriptCode: () => void;
  isSyncing: boolean;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  appData,
  queueState,
  onUpdateScriptUrl,
  onDownloadFromSheets,
  onUploadToSheets,
  onOpenScriptCode,
  isSyncing
}) => {
  const [urlInput, setUrlInput] = useState(appData.settings?.googleScriptUrl || '');
  const [showInstructions, setShowInstructions] = useState(false);
  const [pingState, setPingState] = useState<{ testing: boolean; result: string | null; ok: boolean | null; version: number }>({
    testing: false,
    result: null,
    ok: null,
    version: 0
  });

  useEffect(() => { if (isOpen) setUrlInput(appData.settings?.googleScriptUrl || ''); }, [isOpen, appData.settings?.googleScriptUrl]);

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    const trimmed = urlInput.trim();
    await onUpdateScriptUrl(trimmed);
  };

  const handleTestConnection = async () => {
    const trimmed = urlInput.trim();
    if (!isValidGoogleScriptUrl(trimmed)) {
      setPingState({
        testing: false,
        result: 'URL должен начинаться с https://script.google.com/macros/s/ и заканчиваться на /exec',
        ok: false,
        version: 0
      });
      return;
    }

    setPingState({ testing: true, result: 'Проверка связи с Google Таблицей...', ok: null, version: 0 });
    const version = await getGasVersion(trimmed);
    if (version >= GAS_TARGET_VERSION) {
      setPingState({
        testing: false,
        result: `Связь установлена! Версия скрипта ${version}. Все листы готовы к синхронизации.`,
        ok: true,
        version
      });
    } else if (version > 0) {
      setPingState({
        testing: false,
        result: `Внимание: в таблице версия ${version}, а требуется ${GAS_TARGET_VERSION}. Скопируйте Backend.gs и сделайте Новое развёртывание.`,
        ok: false,
        version
      });
    } else {
      setPingState({
        testing: false,
        result: 'Google Таблица не отвечает. Проверьте: тип «Веб-приложение», доступ «Все» и окончание на /exec.',
        ok: false,
        version: 0
      });
    }
  };

  const remainingSeconds = queueState.nextAt ? Math.max(0, Math.ceil((queueState.nextAt - Date.now()) / 1000)) : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-thin text-slate-900 dark:text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Подключение Google Таблицы</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                  Backend.gs v{GAS_TARGET_VERSION}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Единый источник правды: каждая сущность на отдельном листе с жёлтой шапкой
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Explanation */}
        <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-slate-950 border border-cyan-200 dark:border-cyan-900 flex items-start gap-3">
          <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Автоматическая синхронизация:</strong> Вы вставляете URL скрипта один раз (или в <code>src/config.ts</code>). 
            Любые изменения на сайте (с ПК или телефона) сразу сохраняются в Google Таблицу на нужные листы с жёлтыми шапками, а все продавцы автоматически видят актуальные цены!
          </div>
        </div>

        {/* Script URL Input & Test Ping */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>URL веб-приложения Google Apps Script (заканчивается на /exec):</span>
            <button
              type="button"
              onClick={onOpenScriptCode}
              className="text-cyan-700 dark:text-cyan-400 hover:underline text-xs flex items-center gap-1 font-semibold"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Код Backend.gs для таблицы</span>
            </button>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setPingState({ testing: false, result: null, ok: null, version: 0 });
              }}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={pingState.testing || !urlInput.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              {pingState.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />}
              <span>Проверить скрипт (ping)</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Сохранить и связать</span>
            </button>
          </div>

          {/* Test Ping Result */}
          {pingState.result && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                pingState.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              {pingState.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{pingState.result}</span>
            </div>
          )}
        </div>

        {/* Queue State & Action Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {queueState.status === 'saved' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {queueState.status === 'saving' && <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />}
              {(queueState.status === 'busy' || queueState.status === 'queued') && <Clock className="w-4 h-4 text-amber-500" />}
              {queueState.status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
              {queueState.status === 'readonly' && <AlertTriangle className="w-4 h-4 text-slate-400" />}

              <span className="font-bold text-slate-900 dark:text-white">Состояние: </span>
              <span className="text-slate-700 dark:text-slate-300">{queueState.message}</span>
            </div>

            {remainingSeconds > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                повтор через {remainingSeconds} с
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDownloadFromSheets}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Загрузить из таблицы</span>
              </button>

              <button
                type="button"
                onClick={onUploadToSheets}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Отправить в таблицу</span>
              </button>

              {(queueState.dirty || queueState.status === 'error' || queueState.status === 'queued') && (
                <button
                  type="button"
                  onClick={() => retryNow()}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Отправить сейчас
                </button>
              )}
            </div>

            {queueState.lastSyncTime && (
              <span className="text-[11px] text-slate-500 font-mono">
                Посл. активность: {queueState.lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* Журнал синхронизации (последние 3 записи) */}
        {queueState.logs && queueState.logs.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Журнал операций (последние события):</span>
            </label>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 text-xs font-mono">
              {queueState.logs.slice(0, 3).map((l) => (
                <div key={l.id} className="flex items-start gap-2 text-[11px] leading-snug">
                  <span className="text-slate-400">{l.at}</span>
                  <span className={l.ok ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                    [{l.where}]
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 flex-1">{l.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Guide for Google Apps Script */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white py-1"
          >
            <span className="flex items-center gap-1.5 font-semibold text-cyan-700 dark:text-cyan-300">
              <HelpCircle className="w-4 h-4" />
              Инструкция: как подключить Google Таблицу за 2 минуты
            </span>
            <span>{showInstructions ? '▲ Скрыть' : '▼ Показать'}</span>
          </button>

          {showInstructions && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex flex-col gap-2 leading-relaxed animate-in fade-in">
              <p>
                <strong>1. Откройте Google Таблицу</strong> на{' '}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-700 dark:text-cyan-400 underline inline-flex items-center gap-1 font-semibold"
                >
                  sheets.new <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p>
                <strong>2. Вставьте Backend.gs:</strong> В меню таблицы нажмите <em>Расширения ➔ Apps Script</em>, скопируйте код скрипта (кнопка вверху) и вставьте вместо существующего. Нажмите Сохранить (Ctrl+S).
              </p>
              <p>
                <strong>3. Опубликуйте как Веб-приложение:</strong> Нажмите <em>Развернуть ➔ Новое развертывание ➔ Веб-приложение</em>. Выполнять: <strong>Я</strong>, доступ: <strong>«Все» (Anyone)</strong> — ОБЯЗАТЕЛЬНО! Скопируйте полученный URL (.../exec), вставьте в поле выше и нажмите «Сохранить и связать».
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
