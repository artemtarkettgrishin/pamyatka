import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Folder,
  FileText,
  Flame,
  Star,
  Layers,
  Search
} from 'lucide-react';
import { CategoryItem, CategoryType } from '../../types';

interface CategoryTreeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (parentId: string | null, type: CategoryType, preset?: 'sale' | 'month' | 'default') => void;
  onEditCategory: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
  onMoveCategory: (categoryId: string, direction: 'up' | 'down') => void;
  onSelectCategory: (categoryId: string, pageId?: string) => void;
}

export const CategoryTreeManagerModal: React.FC<CategoryTreeManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
  onSelectCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Get direct children of a parent
  const getChildren = (parentId: string | null) => {
    return categories
      .filter((c) => (parentId === null ? !c.parentId : c.parentId === parentId))
      .sort((a, b) => a.order - b.order);
  };

  const rootCategories = getChildren(null);

  const renderTreeItem = (item: CategoryItem, depth = 0) => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const isPage = item.type === 'page';

    const matchesSearch =
      !searchTerm.trim() ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.statusBadge && item.statusBadge.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div key={item.id} className={`flex flex-col select-none ${matchesSearch ? 'block' : 'hidden'}`}>
        <div
          className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 border ${
            depth === 0
              ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white'
              : depth === 1
              ? 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
              : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300'
          }`}
          style={{ marginLeft: `${depth * 18}px` }}
        >
          {/* Title & Icon */}
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
            {item.color === 'red' || item.title.toLowerCase().includes('распродажа') ? (
              <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            ) : item.color === 'amber' || item.title.toLowerCase().includes('товары месяца') ? (
              <Star className="w-4 h-4 text-amber-500 shrink-0" />
            ) : isPage ? (
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
            )}

            <span className="truncate">{item.title}</span>

            {item.statusBadge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shrink-0">
                {item.statusBadge}
              </span>
            )}

            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 uppercase shrink-0">
                {item.badge}
              </span>
            )}

            {isPage && item.rows && (
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                ({item.rows.length} строк)
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* View Page */}
            <button
              onClick={() => {
                onSelectCategory(item.parentId || item.id, item.id);
                onClose();
              }}
              title="Перейти к этой таблице"
              className="p-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-cyan-600 text-slate-700 dark:text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
            >
              Открыть
            </button>

            {/* Add Child Page / Subcategory */}
            <button
              onClick={() => onAddCategory(item.id, 'page')}
              title="Добавить страницу / декор внутрь"
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Move Up / Down */}
            <button
              onClick={() => onMoveCategory(item.id, 'up')}
              title="Переместить выше"
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveCategory(item.id, 'down')}
              title="Переместить ниже"
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Edit */}
            <button
              onClick={() => onEditCategory(item)}
              title="Редактировать параметры"
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-cyan-600 text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                if (confirm(`Вы действительно хотите удалить «${item.title}» и всё его содержимое?`)) {
                  onDeleteCategory(item.id);
                }
              }}
              title="Удалить этот элемент"
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 text-slate-700 dark:text-slate-300 hover:text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="flex flex-col gap-1 mt-1 pl-2 border-l border-slate-200 dark:border-slate-800 ml-3">
            {children.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Управление структурой каталога и меню
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Добавление, удаление, сортировка разделов, коллекций, распродаж и декоров
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

        {/* Search & Add New Root Category Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по дереву разделов и декоров..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={() => onAddCategory(null, 'group')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Новый раздел в главное меню</span>
          </button>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2 scrollbar-thin">
          {rootCategories.map((root) => renderTreeItem(root, 0))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <span>Всего элементов в каталоге: {categories.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
