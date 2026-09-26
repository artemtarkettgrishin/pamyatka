import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ChevronRight,
  FileText,
  AlertCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { AppData, SearchResult } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onSelectResult: (categoryId: string, pageId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  appData,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Helper to build path of titles for any category
  const buildCategoryPath = (catId: string): string[] => {
    const path: string[] = [];
    let current = appData.categories.find((c) => c.id === catId);
    while (current) {
      path.unshift(current.title);
      if (!current.parentId) break;
      current = appData.categories.find((c) => c.id === current?.parentId);
    }
    return path;
  };

  // Helper to find root category ID for a page
  const findRootCategoryId = (catId: string): string => {
    let current = appData.categories.find((c) => c.id === catId);
    while (current && current.parentId) {
      const parent = appData.categories.find((c) => c.id === current?.parentId);
      if (!parent) break;
      current = parent;
    }
    return current ? current.id : catId;
  };

  // Search execution
  const results: SearchResult[] = [];
  const q = query.trim().toLowerCase();

  if (q.length >= 2) {
    // 1. Search in pages & table rows
    appData.categories.forEach((page) => {
      if (page.type === 'page') {
        const rootId = findRootCategoryId(page.id);
        const path = buildCategoryPath(page.id);

        // Match page title
        if (page.title.toLowerCase().includes(q)) {
          results.push({
            type: 'page',
            title: page.title,
            subtitle: `Страница каталога (${page.rows?.length || 0} позиций)`,
            categoryId: rootId,
            pageId: page.id,
            categoryPath: path,
            matchedText: page.description
          });
        }

        // Match in rows
        if (page.rows && page.columns) {
          page.rows.forEach((row) => {
            const firstColKey = page.columns?.[0]?.key || 'name';
            const productName = String(row.cells[firstColKey] || 'Без названия');
            let matched = false;
            let matchedVal = '';
            let priceVal = '';

            Object.entries(row.cells).forEach(([key, val]) => {
              const strVal = String(val || '');
              if (strVal.toLowerCase().includes(q)) {
                matched = true;
                matchedVal = `${key}: ${strVal}`;
              }
              if (
                key.toLowerCase().includes('price') ||
                key.toLowerCase().includes('розниц') ||
                key.toLowerCase().includes('опт')
              ) {
                if (!priceVal && strVal) priceVal = strVal;
              }
            });

            if (matched) {
              results.push({
                type: 'product',
                title: productName,
                subtitle: `В разделе: ${page.title}`,
                categoryId: rootId,
                pageId: page.id,
                categoryPath: path,
                matchedText: matchedVal,
                price: priceVal
              });
            }
          });
        }

        // Match in notes
        if (page.notes) {
          page.notes.forEach((note) => {
            if (
              note.content.toLowerCase().includes(q) ||
              (note.title && note.title.toLowerCase().includes(q))
            ) {
              results.push({
                type: 'note',
                title: note.title || 'Пометка к разделу',
                subtitle: `В разделе: ${page.title}`,
                categoryId: rootId,
                pageId: page.id,
                categoryPath: path,
                matchedText: note.content
              });
            }
          });
        }
      }
    });

    // 2. Search in changelog
    appData.changelog.forEach((log) => {
      if (
        log.text.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q) ||
        log.date.includes(q)
      ) {
        results.push({
          type: 'changelog',
          title: `[Обновление ${log.date}] ${log.category}`,
          subtitle: log.text,
          categoryId: 'cat_updates',
          categoryPath: ['Обновления', log.category],
          matchedText: log.text
        });
      }
    });
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 md:pt-16 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[85vh] text-slate-900 dark:text-slate-100"
      >
        {/* Search Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5 sm:gap-3 bg-slate-50 dark:bg-slate-950">
          <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по декорам, артикулам, ценам, поставщикам..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none pr-7"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-0 p-1 text-slate-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                title="Очистить строку"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 shrink-0">
            ESC
          </kbd>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Закрыть поиск"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-3 overflow-y-auto max-h-[60vh] flex flex-col gap-2 scrollbar-thin bg-white dark:bg-slate-900">
          {q.length < 2 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              <p>Введите минимум 2 символа для быстрого поиска...</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['Ostin', 'Timber', 'Deconika', 'Homakoll', 'Распродажа'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 cursor-pointer text-xs font-semibold shadow-xs transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              По запросу <span className="text-slate-900 dark:text-white font-bold">"{query}"</span> ничего не найдено.
            </div>
          ) : (
            results.slice(0, 30).map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectResult(res.categoryId, res.pageId);
                  onClose();
                }}
                className="group flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all text-left"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800 shrink-0 mt-0.5">
                    {res.type === 'product' && <FileText className="w-4 h-4" />}
                    {res.type === 'page' && <FileText className="w-4 h-4 text-amber-500" />}
                    {res.type === 'note' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    {res.type === 'changelog' && <Bell className="w-4 h-4 text-emerald-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-0.5 truncate">
                      {res.categoryPath.map((item, pIdx) => (
                        <React.Fragment key={pIdx}>
                          {pIdx > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-400 dark:text-slate-600 shrink-0" />}
                          <span className="truncate">{item}</span>
                        </React.Fragment>
                      ))}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors truncate">
                      {res.title}
                    </h4>

                    {res.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {res.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {res.price && (
                    <span className="px-2 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-300 font-mono text-xs font-bold">
                      {res.price}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info & Close Button */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>Найдено: {results.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
