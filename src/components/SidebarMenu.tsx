import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Percent,
  Star,
  FileText,
  Folder,
  Pin,
  Sparkles,
  Flame
} from 'lucide-react';
import { CategoryItem } from '../types';

interface SidebarMenuProps {
  rootCategory: CategoryItem | null;
  categories: CategoryItem[];
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
  onNavigateBack?: () => void;
  canNavigateBack: boolean;
  isAdmin: boolean;
  onAddChildItem: (parentId: string, type: 'group' | 'page', preset?: 'sale' | 'month' | 'default') => void;
  onEditItem: (item: CategoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSetStartPage: (groupId: string, pageId: string) => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  rootCategory,
  categories,
  selectedPageId,
  onSelectPage,
  onNavigateBack,
  canNavigateBack,
  isAdmin,
  onAddChildItem,
  onEditItem,
  onDeleteItem,
  onSetStartPage
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  if (!rootCategory) return null;

  // Toggle group accordion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === false ? true : false
    }));
  };

  // Get direct children of a parent
  const getChildren = (parentId: string) => {
    return categories
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const directChildren = getChildren(rootCategory.id);

  // Separate special buttons: Sale & Items of Month
  const saleItem = directChildren.find(
    (c) => c.color === 'red' || c.title.toLowerCase().includes('распродажа')
  );
  const monthItem = directChildren.find(
    (c) =>
      c.color === 'amber' ||
      c.color === 'yellow' ||
      c.title.toLowerCase().includes('товары месяца') ||
      c.title.toLowerCase().includes('хит месяца')
  );

  const regularItems = directChildren.filter(
    (c) => c.id !== saleItem?.id && c.id !== monthItem?.id
  );

  // Status badge styling helper
  const getStatusBadgeStyle = (statusBadge?: string) => {
    if (!statusBadge) return null;
    const lower = statusBadge.toLowerCase();
    if (lower.includes('в наличии') || lower.includes('актуал') || lower.includes('🟢')) {
      return 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40';
    }
    if (lower.includes('заказ') || lower.includes('срок') || lower.includes('🟡')) {
      return 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
    }
    if (lower.includes('вывод') || lower.includes('распродаж') || lower.includes('🔴')) {
      return 'bg-rose-100 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40';
    }
    return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  // Recursive tree renderer for nested groups & multi-level decors
  const renderItemTree = (item: CategoryItem, depth = 0) => {
    const isSelected = selectedPageId === item.id;
    const isPage = item.type === 'page';
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedGroups[item.id] !== false;
    const isStartPage = rootCategory.startPageId === item.id;
    const statusStyle = getStatusBadgeStyle(item.statusBadge);

    return (
      <div key={item.id} className="flex flex-col select-none">
        <div
          className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            isSelected
              ? 'bg-cyan-600 text-white font-bold shadow-md ring-1 ring-cyan-300'
              : depth === 0
              ? 'text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs'
              : depth === 1
              ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/90 hover:text-black dark:hover:text-white bg-slate-50 dark:bg-slate-900/40 border-l-2 border-slate-300 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-slate-100 bg-transparent border-l-2 border-cyan-400 dark:border-cyan-500/40'
          }`}
          style={{ paddingLeft: `${Math.max(10, depth * 14 + 10)}px` }}
        >
          <div
            onClick={() => {
              onSelectPage(item.id);
              if (hasChildren && !isExpanded) {
                toggleGroup(item.id);
              }
            }}
            className="flex items-center gap-1.5 flex-1 cursor-pointer min-w-0"
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroup(item.id);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5 rounded shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            ) : isPage ? (
              <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`} />
            ) : (
              <Folder className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
            )}

            <span className="truncate">{item.title}</span>

            {isStartPage && (
              <span title="Стартовая страница раздела" className="text-[10px] text-amber-500 dark:text-amber-300 ml-0.5 shrink-0">
                <Pin className="w-3 h-3 fill-amber-500 dark:fill-amber-300" />
              </span>
            )}

            {/* Status or Badges */}
            {item.statusBadge && (
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-semibold shrink-0 border ${statusStyle}`}
              >
                {item.statusBadge}
              </span>
            )}

            {item.badge && !item.statusBadge && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300 shrink-0 border border-cyan-300 dark:border-cyan-700/50">
                {item.badge}
              </span>
            )}

            {hasChildren && (
              <span className="text-[9px] text-slate-400 font-mono ml-auto mr-1 shrink-0 opacity-70">
                ({children.length})
              </span>
            )}
          </div>

          {/* Admin Context Action Buttons */}
          {isAdmin && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0 ml-1 bg-white dark:bg-slate-900/90 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildItem(item.id, 'page');
                }}
                title="Добавить вложенный декор / подстраницу"
                className="p-1 rounded text-cyan-700 dark:text-cyan-400 hover:text-white hover:bg-cyan-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetStartPage(rootCategory.id, item.id);
                }}
                title="Сделать стартовой страницей"
                className={`p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-600/30 transition-colors ${
                  isStartPage ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-amber-600'
                }`}
              >
                <Pin className="w-3 h-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                title="Редактировать"
                className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Удалить «${item.title}» и все его подуровни?`)) {
                    onDeleteItem(item.id);
                  }
                }}
                title="Удалить"
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Render child elements if expanded */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col gap-1 mt-1 pl-1.5 border-l border-slate-200 dark:border-slate-800 ml-2.5">
            {children.map((child) => renderItemTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
      {/* Back button */}
      {canNavigateBack && onNavigateBack && (
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-semibold text-xs sm:text-sm transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Назад на уровень выше</span>
        </button>
      )}

      {/* Main Header "МЕНЮ: РАЗДЕЛ" */}
      <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white font-extrabold text-sm sm:text-base py-2.5 sm:py-3 px-4 rounded-xl text-center shadow-md shadow-cyan-600/20 tracking-wider flex items-center justify-between">
        <span className="flex-1 text-center font-black">МЕНЮ: {rootCategory.title.toUpperCase()}</span>
        {isAdmin && (
          <button
            onClick={() => onAddChildItem(rootCategory.id, 'page')}
            title="Добавить страницу в этот раздел"
            className="p-1 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Special Highlights: Red "Распродажа" Button with FULL ADMIN CONTROLS */}
      {saleItem ? (
        <div className="relative group/sale">
          <button
            onClick={() => onSelectPage(saleItem.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md select-none ${
              selectedPageId === saleItem.id
                ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-rose-600/40'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1 rounded bg-white/20">
                <Percent className="w-4 h-4 text-white" />
              </div>
              <span className="truncate">{saleItem.title}</span>
            </div>
            {saleItem.badge && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-rose-700 shrink-0 ml-1">
                {saleItem.badge}
              </span>
            )}
          </button>

          {/* Admin Edit/Delete for Sale Button */}
          {isAdmin && (
            <div className="opacity-0 group-hover/sale:opacity-100 absolute top-2 right-2 flex items-center gap-1 z-30 bg-white dark:bg-slate-900/95 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl transition-all">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(saleItem);
                }}
                title="Настроить страницу распродажи"
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Удалить кнопку «${saleItem.title}» из этого раздела?`)) {
                    onDeleteItem(saleItem.id);
                  }
                }}
                title="Удалить распродажу из этого раздела"
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        isAdmin && (
          <button
            onClick={() => onAddChildItem(rootCategory.id, 'page', 'sale')}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/70 border border-dashed border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>+ Добавить кнопку «Распродажа»</span>
          </button>
        )
      )}

      {/* Special Highlights: Yellow "Товары месяца" Button with FULL ADMIN CONTROLS */}
      {monthItem ? (
        <div className="relative group/month">
          <button
            onClick={() => onSelectPage(monthItem.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md select-none ${
              selectedPageId === monthItem.id
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/40'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1 rounded bg-black/15">
                <Star className="w-4 h-4 text-slate-950 fill-slate-950" />
              </div>
              <span className="truncate">{monthItem.title}</span>
            </div>
            {monthItem.badge && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-950 text-amber-300 shrink-0 ml-1">
                {monthItem.badge}
              </span>
            )}
          </button>

          {/* Admin Edit/Delete for Month Button */}
          {isAdmin && (
            <div className="opacity-0 group-hover/month:opacity-100 absolute top-2 right-2 flex items-center gap-1 z-30 bg-white dark:bg-slate-900/95 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl transition-all">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(monthItem);
                }}
                title="Настроить товары месяца"
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Удалить кнопку «${monthItem.title}» из этого раздела?`)) {
                    onDeleteItem(monthItem.id);
                  }
                }}
                title="Удалить товары месяца из этого раздела"
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        isAdmin && (
          <button
            onClick={() => onAddChildItem(rootCategory.id, 'page', 'month')}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/70 border border-dashed border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>+ Добавить кнопку «Товары месяца»</span>
          </button>
        )
      )}

      {/* Subcategory tree list */}
      <div className="flex flex-col gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-xs max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        {regularItems.length === 0 && !saleItem && !monthItem && (
          <div className="p-4 text-center text-xs text-slate-500 italic">
            В этом разделе пока нет страниц.
          </div>
        )}

        {regularItems.map((item) => renderItemTree(item))}

        {/* Clear Admin Action Ribbon for adding pages/groups */}
        {isAdmin && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 mt-1">
            <div className="flex gap-2">
              <button
                onClick={() => onAddChildItem(rootCategory.id, 'page')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>+ Страница</span>
              </button>
              <button
                onClick={() => onAddChildItem(rootCategory.id, 'group')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-amber-400 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors"
              >
                <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>+ Группа</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
