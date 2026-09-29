import React from 'react';
import { Plus, Edit2, Trash2, Bell } from 'lucide-react';
import { CategoryItem } from '../types';

interface TopCategoryTabsProps {
  categories: CategoryItem[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  isAdmin: boolean;
  onAddCategory: () => void;
  onEditCategory: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const TopCategoryTabs: React.FC<TopCategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isAdmin,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}) => {
  // Only root categories (parentId === null)
  const rootCategories = categories
    .filter((cat) => !cat.parentId)
    .sort((a, b) => a.order - b.order);

  const getTabStyles = (cat: CategoryItem, isSelected: boolean) => {
    const color = cat.color || 'cyan';

    if (color === 'emerald') {
      return isSelected
        ? 'bg-emerald-600 text-white font-bold shadow-md border-b-2 border-emerald-400 dark:border-emerald-300'
        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 hover:text-emerald-950 dark:hover:text-white border-b-2 border-emerald-400/40 dark:border-emerald-700/50';
    }
    if (color === 'amber' || color === 'yellow') {
      return isSelected
        ? 'bg-amber-500 text-slate-950 font-black shadow-md border-b-2 border-amber-300'
        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70 hover:text-black dark:hover:text-amber-100 border-b-2 border-amber-400/40 dark:border-amber-700/50';
    }
    if (color === 'slate' || color === 'zinc') {
      return isSelected
        ? 'bg-slate-700 text-white font-bold shadow-md border-b-2 border-slate-400'
        : 'bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white border-b-2 border-slate-300 dark:border-slate-800';
    }
    if (color === 'red') {
      return isSelected
        ? 'bg-rose-600 text-white font-bold shadow-md border-b-2 border-rose-400'
        : 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/80 hover:text-rose-950 dark:hover:text-white border-b-2 border-rose-400/40 dark:border-rose-700/50';
    }
    if (color === 'purple') {
      return isSelected
        ? 'bg-purple-600 text-white font-bold shadow-md border-b-2 border-purple-400'
        : 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/80 hover:text-purple-950 dark:hover:text-white border-b-2 border-purple-400/40 dark:border-purple-700/50';
    }
    if (color === 'blue') {
      return isSelected
        ? 'bg-blue-600 text-white font-bold shadow-md border-b-2 border-blue-400'
        : 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/80 hover:text-blue-950 dark:hover:text-white border-b-2 border-blue-400/40 dark:border-blue-700/50';
    }

    // Default Cyan
    return isSelected
      ? 'bg-cyan-600 text-white font-bold shadow-md border-b-2 border-cyan-400 dark:border-cyan-300'
      : 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/80 hover:text-cyan-950 dark:hover:text-white border-b-2 border-cyan-400/40 dark:border-cyan-700/50';
  };

  return (
    <nav aria-label="Категории каталога" className="w-full max-w-full bg-slate-50/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 sticky top-15 sm:top-16 z-30 overflow-hidden transition-colors duration-200">
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-thin">
        {rootCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const tabStyle = getTabStyles(cat, isSelected);

          return (
            <div key={cat.id} className="relative group shrink-0 flex items-center">
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-t-xl text-xs sm:text-sm tracking-wide transition-all select-none whitespace-nowrap ${tabStyle}`}
              >
                {cat.id === 'cat_updates' && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {cat.id === 'cat_updates' ? <Bell className="w-3.5 h-3.5 shrink-0" /> : null}
                <span className="font-semibold">{cat.title}</span>
                {cat.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-black/20 dark:bg-white/20 text-current uppercase tracking-wider shrink-0">
                    {cat.badge}
                  </span>
                )}
              </button>

              {/* Admin Action Buttons on Tab */}
              {isAdmin && (
                <div className="opacity-0 group-hover:opacity-100 absolute -top-2 right-0 flex items-center gap-1 z-30 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xl transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(cat);
                    }}
                    title="Редактировать раздел меню"
                    className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-600 text-slate-700 dark:text-white hover:text-white rounded text-xs transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {cat.id !== 'cat_updates' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Удалить раздел меню «${cat.title}» и все его подкатегории?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      title="Удалить раздел меню"
                      className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 text-slate-700 dark:text-white hover:text-white rounded text-xs transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Category in Admin Mode */}
        {isAdmin && (
          <button
            onClick={onAddCategory}
            title="Добавить новый раздел в верхнее меню"
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-t-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-dashed border-cyan-500/50 hover:border-cyan-600 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>+ Меню</span>
          </button>
        )}
      </div>
    </nav>
  );
};
