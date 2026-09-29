import React from 'react';
import {
  ShieldAlert,
  Cloud,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Unlock,
  FileCode,
  FolderTree
} from 'lucide-react';

interface AdminBarProps {
  onOpenSync: () => void;
  onAddCategory: () => void;
  onOpenTreeManager: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetDemo: () => void;
  onOpenScriptCode: () => void;
  onLogout: () => void;
  onShowToast?: (message: string, type: 'success' | 'info') => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  onOpenSync,
  onAddCategory,
  onOpenTreeManager,
  onExportBackup,
  onImportBackup,
  onResetDemo,
  onOpenScriptCode,
  onLogout
}) => {
  return (
    <aside aria-label="Панель администратора" className="w-full max-w-full bg-slate-900 dark:bg-gradient-to-r dark:from-cyan-950 dark:via-slate-900 dark:to-indigo-950 border-b border-cyan-500/40 px-2.5 sm:px-4 md:px-6 py-2 shadow-md sticky top-0 z-50 overflow-x-auto no-scrollbar">
      <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between gap-2 shrink-0">
        {/* Admin Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/30 uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" />
            Администратор
          </span>
          <span className="text-[11px] text-cyan-200 hidden lg:inline font-medium">
            Прямое редактирование ячеек таблицы
          </span>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tree Manager Button */}
          <button
            onClick={onOpenTreeManager}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Структура меню</span>
          </button>

          {/* Google Sheets Sync */}
          <button
            onClick={onOpenSync}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Sheets</span>
          </button>

          {/* Add Category */}
          <button
            onClick={onAddCategory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">+ Раздел</span>
          </button>

          {/* Google Apps Script code */}
          <button
            onClick={onOpenScriptCode}
            title="Посмотреть код Google Apps Script"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Скрипт</span>
          </button>

          {/* Export JSON backup */}
          <button
            onClick={onExportBackup}
            title="Скачать JSON бэкап"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import JSON backup */}
          <button
            onClick={onImportBackup}
            title="Импорт базы из JSON"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            title="Сбросить до демо-данных"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-900 border border-slate-600 text-slate-300 hover:text-amber-200 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-semibold transition-colors"
          >
            <Unlock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
