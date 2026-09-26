import React from 'react';
import { ChevronRight, ArrowLeft, Search, SlidersHorizontal, Plus, Download, Printer } from 'lucide-react';
import { CategoryItem } from '../types';

interface BreadcrumbsProps {
  breadcrumbs: CategoryItem[];
  currentPage: CategoryItem | null;
  onNavigate: (category: CategoryItem) => void;
  onNavigateBack?: () => void;
  canNavigateBack: boolean;
  filterText: string;
  onFilterChange: (text: string) => void;
  isAdmin: boolean;
  onOpenColumnEditor?: () => void;
  onAddRow?: () => void;
  onExportCsv?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs,
  currentPage,
  onNavigate,
  onNavigateBack,
  canNavigateBack,
  filterText,
  onFilterChange,
  isAdmin,
  onOpenColumnEditor,
  onAddRow,
  onExportCsv
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-xs transition-colors">
      {/* Trail and Back button */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
        {canNavigateBack && onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-400 text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Назад</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 overflow-x-auto py-0.5 scrollbar-thin">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={item.id}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
                <button
                  onClick={() => onNavigate(item)}
                  className={`hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors truncate max-w-[140px] sm:max-w-[200px] ${
                    isLast
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400 font-medium'
                  }`}
                >
                  {item.title}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Table search filter and Admin controls */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {currentPage?.type === 'page' && (
          <div className="relative flex-1 sm:flex-initial min-w-[170px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder="Фильтр таблицы..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 focus:border-cyan-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
            />
            {filterText && (
              <button
                onClick={() => onFilterChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Quick CSV Export */}
        {currentPage?.type === 'page' && onExportCsv && (
          <button
            onClick={onExportCsv}
            title="Экспорт таблицы в CSV"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white text-xs transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Print table */}
        {currentPage?.type === 'page' && (
          <button
            onClick={() => window.print()}
            title="Печать текущего прайса"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white text-xs transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Admin Tools for current page */}
        {isAdmin && currentPage?.type === 'page' && (
          <>
            {onOpenColumnEditor && (
              <button
                onClick={onOpenColumnEditor}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-cyan-800 dark:text-cyan-300 text-xs font-semibold transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Столбцы</span>
              </button>
            )}
            {onAddRow && (
              <button
                onClick={onAddRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Строка</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
