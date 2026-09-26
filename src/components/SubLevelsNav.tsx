import React from 'react';
import {
  FolderTree,
  Plus,
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';
import { CategoryItem } from '../types';

interface SubLevelsNavProps {
  placement?: 'above' | 'below';
  currentPage: CategoryItem | null;
  allCategories: CategoryItem[];
  onSelectPage: (pageId: string) => void;
  isAdmin: boolean;
  onAddSubLevel: (parentId: string) => void;
}

export const SubLevelsNav: React.FC<SubLevelsNavProps> = ({
  placement = 'above',
  currentPage,
  allCategories,
  onSelectPage,
  isAdmin,
  onAddSubLevel
}) => {
  if (!currentPage) return null;

  // Direct children of current page (Sub-levels / Decors)
  const childLevels = allCategories
    .filter((c) => c.parentId === currentPage.id)
    .sort((a, b) => a.order - b.order);

  // Sibling levels (if current page is a decor/child of something, show quick switcher)
  const parentCategory = currentPage.parentId
    ? allCategories.find((c) => c.id === currentPage.parentId)
    : null;

  const siblingLevels = parentCategory
    ? allCategories
        .filter((c) => c.parentId === parentCategory.id)
        .sort((a, b) => a.order - b.order)
    : [];

  const getStatusBadgeStyle = (statusBadge?: string) => {
    if (!statusBadge) return null;
    const lower = statusBadge.toLowerCase();
    if (lower.includes('в наличии') || lower.includes('актуал') || lower.includes('🟢')) {
      return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40';
    }
    if (lower.includes('заказ') || lower.includes('срок') || lower.includes('🟡')) {
      return 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
    }
    if (lower.includes('вывод') || lower.includes('распродаж') || lower.includes('🔴')) {
      return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40';
    }
    return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  if (placement === 'below' && childLevels.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2.5 my-1${placement === 'below' ? ' lg:hidden' : ''}`}>
      {/* 1. Sibling Switcher: If current page is inside a collection */}
      {placement === 'above' && parentCategory && siblingLevels.length > 1 && (
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>В коллекции {parentCategory.title}:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
            {siblingLevels.map((sibling) => {
              const isCurrent = sibling.id === currentPage.id;
              return (
                <button
                  key={sibling.id}
                  onClick={() => onSelectPage(sibling.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-400'
                      : 'bg-slate-100 dark:bg-slate-950/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{sibling.title}</span>
                  {sibling.statusBadge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-semibold border ${getStatusBadgeStyle(
                        sibling.statusBadge
                      )}`}
                    >
                      {sibling.statusBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Direct Sub-levels / Decors Grid */}
      {childLevels.length > 0 && (
        <div className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 border border-slate-200 dark:border-cyan-500/20 backdrop-blur-md shadow-xs flex flex-col gap-2.5${placement === 'above' ? ' hidden lg:flex' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                Декоры и подразделы коллекции ({childLevels.length})
              </h4>
            </div>

            {isAdmin && (
              <button
                onClick={() => onAddSubLevel(currentPage.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-400 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Добавить декор</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {childLevels.map((child) => {
              const statusStyle = getStatusBadgeStyle(child.statusBadge);

              return (
                <button
                  key={child.id}
                  onClick={() => onSelectPage(child.id)}
                  className="group relative p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 hover:bg-white dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500/60 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                        {child.title}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>

                  {/* Badges & Status */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {child.statusBadge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${statusStyle}`}
                      >
                        {child.statusBadge}
                      </span>
                    )}

                    {child.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 uppercase">
                        {child.badge}
                      </span>
                    )}

                    {child.rows && child.rows.length > 0 && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {child.rows.length} поз.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
