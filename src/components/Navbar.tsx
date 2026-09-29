import React from 'react';
import {
  Search,
  Calculator,
  Lock,
  Unlock,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { AppData } from '../types';
import { getTodayDateString } from '../config';

export type SyncBadgeState = 'idle' | 'syncing' | 'saved' | 'error' | 'unconfigured';

interface NavbarProps {
  appData: AppData;
  isAdmin: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  syncState: SyncBadgeState;
  onOpenSearch: () => void;
  onOpenCalculator: () => void;
  onOpenSync: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onQuickSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appData,
  isAdmin,
  theme,
  onToggleTheme,
  syncState,
  onOpenSearch,
  onOpenCalculator,
  onOpenSync,
  onOpenLogin,
  onLogout,
  onQuickSync
}) => {
  const hasScriptUrl = Boolean(appData.settings?.googleScriptUrl);
  const todayFormatted = getTodayDateString();

  const getSyncStatusBadge = () => {
    if (syncState === 'syncing') {
      return (
        <button
          onClick={onQuickSync}
          title="Загрузка данных из Google Таблицы..."
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-400 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300 text-xs font-semibold animate-pulse"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600 dark:text-cyan-400" />
          <span className="hidden xl:inline">Синхронизация…</span>
        </button>
      );
    }

    if (syncState === 'error') {
      return (
        <button
          onClick={onOpenSync}
          title="Ошибка связи с Google Таблицей — нажмите для настройки"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-400 dark:border-rose-500/50 text-rose-800 dark:text-rose-300 text-xs font-semibold"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="hidden sm:inline">Ошибка связи</span>
        </button>
      );
    }

    if (syncState === 'saved' || hasScriptUrl) {
      return (
        <button
          onClick={onQuickSync}
          title="Google Таблица подключена. Нажмите для обновления."
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">Google Таблица</span>
        </button>
      );
    }

    return (
      <button
        onClick={onOpenSync}
        title="Подключить Google Таблицу"
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/80 border border-amber-400 dark:border-amber-500/50 text-amber-900 dark:text-amber-300 text-xs font-semibold transition-colors"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span className="hidden md:inline">Подключить</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md transition-colors duration-200">
      <div className="w-full max-w-[1920px] mx-auto px-2.5 sm:px-4 md:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-3 overflow-hidden">
        {/* Brand & Compact Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                Памятка
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-mono shrink-0">
                {todayFormatted}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate hidden xs:block font-medium">
              Каталог цен и остатков
            </span>
          </div>
        </div>

        {/* Global Search Bar (Trigger) */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-[180px] sm:max-w-xs md:max-w-md hidden sm:flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/60 hover:border-cyan-500 text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate">Поиск декоров, цен...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Icon */}
          <button
            onClick={onOpenSearch}
            aria-label="Поиск"
            className="sm:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600"
          >
            <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </button>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-amber-600 dark:text-amber-300 transition-colors shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Calculator */}
          <button
            onClick={onOpenCalculator}
            title="Калькулятор упаковок и нарезки"
            className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="hidden lg:inline">Калькулятор</span>
          </button>

          {/* Google Sheets Sync Status Badge */}
          {getSyncStatusBadge()}

          {/* Admin Mode Toggle */}
          {isAdmin ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold hover:bg-rose-200 dark:hover:bg-rose-900 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              aria-label="Вход"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Вход</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
