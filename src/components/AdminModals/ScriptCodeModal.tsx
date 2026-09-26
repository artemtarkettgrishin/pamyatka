import React, { useState } from 'react';
import { FileCode, Copy, Check, X, ExternalLink, HelpCircle } from 'lucide-react';

interface ScriptCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: 'success' | 'info') => void;
}

import GOOGLE_APPS_SCRIPT_CODE from '../../../public/google-apps-script.js?raw';

export const ScriptCodeModal: React.FC<ScriptCodeModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
    await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onShowToast) {
      onShowToast('Код Google Apps Script скопирован в буфер обмена!', 'success');
    }
    } catch { onShowToast?.('Браузер не разрешил копирование. Используйте файл public/google-apps-script.js.', 'info'); }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Код Google Apps Script (Live Sync v10)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Вставьте этот код в редактор Apps Script вашей Google Таблицы
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Файл: <code>google-apps-script.js</code></span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать весь код'}</span>
          </button>
        </div>

        {/* Code viewer */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] sm:text-xs text-slate-200 leading-relaxed scrollbar-thin">
          <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_CODE}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-700 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <span>Открыть Google Таблицу</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
