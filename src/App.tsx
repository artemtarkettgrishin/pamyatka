import React, { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from 'react';
import {
  loadAppData,
  saveAppData,
  resetAppData,
  exportDataAsJson,
  importDataFromJsonFile,
  getAdminAuthState,
  setAdminAuthState,
  getStoredTheme,
  setStoredTheme,
  getStoredScriptUrl,
  setStoredScriptUrl
} from './utils/storage';
import {
  loadFromGas,
  isValidGoogleScriptUrl
} from './utils/sync';
import {
  noteDraft,
  flushNow,
  acceptRemote, getReadVersion, getEditEpoch, subscribeData, switchEndpoint, resumeDraft, resolveBeforePull, pauseQueue, reportReadResult,
  startQueueService,
  subscribeQueue,
  getQueueSnapshot
} from './utils/writeQueue';
import { getSession, clearSession } from './utils/auth';
import { validateCatalog } from '../shared/catalog.js';
import { appConfig } from './config';
import {
  AppData,
  CategoryItem,
  CategoryType,
  ColumnDef,
  TableRow,
  RowHighlight,
  NoteBlock,
  ChangelogItem
} from './types';

// UI Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar, SyncBadgeState } from './components/Navbar';
import { TopCategoryTabs } from './components/TopCategoryTabs';
import { SidebarMenu } from './components/SidebarMenu';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SubLevelsNav } from './components/SubLevelsNav';
import { TableView } from './components/TableView';
import { AttentionNotes } from './components/AttentionNotes';
import { ChangelogView } from './components/ChangelogView';
import { InstallGuideSection } from './components/InstallGuideSection';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SellerCalculatorModal } from './components/SellerCalculatorModal';
import { AdminBar } from './components/AdminBar';
import { ToastContainer, ToastMessage } from './components/Toast';

// Admin Modals
import { LoginModal } from './components/AdminModals/LoginModal';
import { SyncModal } from './components/AdminModals/SyncModal';
import { CategoryEditorModal } from './components/AdminModals/CategoryEditorModal';
import { ColumnEditorModal } from './components/AdminModals/ColumnEditorModal';
import { NoteEditorModal } from './components/AdminModals/NoteEditorModal';
import { ScriptCodeModal } from './components/AdminModals/ScriptCodeModal';
import { CategoryTreeManagerModal } from './components/AdminModals/CategoryTreeManagerModal';

export function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());

  // Master State
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getAdminAuthState());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Queue State
  const queueState = useSyncExternalStore(subscribeQueue, getQueueSnapshot);

  // Navigation State
  const [activeRootId, setActiveRootId] = useState<string>('cat_updates');
  const [activePageId, setActivePageId] = useState<string>('');
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [tableFilterText, setTableFilterText] = useState<string>('');

  // Modals Visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScriptCodeOpen, setIsScriptCodeOpen] = useState(false);
  const [isTreeManagerOpen, setIsTreeManagerOpen] = useState(false);

  // Admin Modals State
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    editingItem: CategoryItem | null;
    defaultParentId: string | null;
    defaultType: CategoryType;
    preset?: 'sale' | 'month' | 'default';
  }>({
    isOpen: false,
    editingItem: null,
    defaultParentId: null,
    defaultType: 'page',
    preset: 'default'
  });

  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    editingNote: NoteBlock | null;
    defaultPosition: 'top' | 'bottom';
  }>({
    isOpen: false,
    editingNote: null,
    defaultPosition: 'top'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataRef = useRef(appData);
  const readingRef = useRef(false);
  const readPromiseRef = useRef<Promise<void> | null>(null);
  const editOpenRef = useRef(false);
  dataRef.current = appData;
  editOpenRef.current = categoryModal.isOpen || columnModalOpen || noteModal.isOpen || isTreeManagerOpen;

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => startQueueService(), []);
  useEffect(() => subscribeData(data => { dataRef.current = data; setAppData(data); }), []);
  useEffect(() => { resumeDraft(getStoredScriptUrl()); }, []);

  const pullFromGoogleSheets = useCallback(async (isSilent = false) => {
    if (readingRef.current) { await readPromiseRef.current; return; }
    const targetUrl = getStoredScriptUrl() || dataRef.current.settings?.googleScriptUrl || appConfig.gasUrl;
    if (!isValidGoogleScriptUrl(targetUrl)) return;
    if (isSilent && (getQueueSnapshot().dirty || getQueueSnapshot().inFlight || editOpenRef.current)) return;
    if (!isSilent && !(await resolveBeforePull())) return;
    const epoch = getEditEpoch();
    readingRef.current = true;
    if (!isSilent) setIsSyncing(true);
    const task = (async () => {
      try {
        const res = await loadFromGas(targetUrl, isSilent ? getReadVersion() : undefined);
        if (targetUrl !== (getStoredScriptUrl() || dataRef.current.settings?.googleScriptUrl || appConfig.gasUrl)) return;
        reportReadResult(res.ok, res.error);
        if (res.ok) {
          if (!res.unchanged && res.revision !== undefined && !editOpenRef.current) acceptRemote(res.data, res.revision, targetUrl, epoch);
          if (!isSilent) showToast(res.isEmpty ? 'Таблица пуста. Войдите и отправьте исходный каталог.' : 'Таблица синхронизирована', 'info');
        } else {
          if (!isSilent) showToast(res.error || 'Нет связи с таблицей', 'error');
        }
      } finally { readingRef.current = false; setIsSyncing(false); }
    })();
    readPromiseRef.current = task; await task;
  }, [showToast]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      if (document.visibilityState === 'visible') await pullFromGoogleSheets(true);
      if (!stopped) timer = setTimeout(poll, appConfig.autoPollMs + Math.random() * 1500);
    };
    void poll();
    const focus = () => { if (document.visibilityState === 'visible') void pullFromGoogleSheets(true); };
    window.addEventListener('focus', focus); window.addEventListener('online', focus);
    document.addEventListener('visibilitychange', focus);
    return () => { stopped = true; clearTimeout(timer); window.removeEventListener('focus', focus); window.removeEventListener('online', focus); document.removeEventListener('visibilitychange', focus); };
  }, [pullFromGoogleSheets]);

  // Side effects are outside React state updaters; they cannot run twice in StrictMode.
  const applyDataChange = useCallback((updater: (prev: AppData) => AppData) => {
    if (!getSession(getStoredScriptUrl())) { setIsAdmin(false); showToast('Войдите в режим администратора', 'error'); return false; }
    try {
      const next = updater(dataRef.current);
      validateCatalog(next);
      if (noteDraft(next)) { dataRef.current = next; setAppData(next); return true; }
      else showToast(getQueueSnapshot().message, 'error');
    } catch (e: any) { showToast(e.message, 'error'); }
    return false;
  }, [showToast]);

  // Map queue status to navbar badge state
  const syncBadgeState: SyncBadgeState = useMemo(() => {
    const targetUrl = getStoredScriptUrl() || appData.settings?.googleScriptUrl || appConfig.gasUrl;
    if (!isValidGoogleScriptUrl(targetUrl)) return 'unconfigured';
    if (isSyncing || ['idle', 'saving', 'queued', 'busy'].includes(queueState.status)) return 'syncing';
    if (queueState.status === 'error' || (queueState.status === 'readonly' && queueState.dirty)) return 'error';
    return 'saved';
  }, [appData.settings?.googleScriptUrl, isSyncing, queueState.status]);

  // Find active root category
  const activeRootCategory = useMemo(() => {
    return appData.categories.find((c) => c.id === activeRootId) || appData.categories[0] || null;
  }, [appData.categories, activeRootId]);

  // Find current active page
  const currentPage = useMemo(() => {
    if (!activePageId) return null;
    return appData.categories.find((c) => c.id === activePageId && c.type === 'page') || null;
  }, [appData.categories, activePageId]);

  useEffect(() => {
    if (activePageId && !appData.categories.some(c => c.id === activePageId)) setActivePageId('');
    if (!appData.categories.some(c => c.id === activeRootId)) setActiveRootId(appData.categories.find(c => !c.parentId)?.id || '');
  }, [appData.categories, activePageId, activeRootId]);

  // Find default start page for a category
  const resolveStartPage = useCallback((rootId: string): string => {
    const root = appData.categories.find((c) => c.id === rootId);
    if (!root) return '';
    if (root.type === 'changelog') return '';

    if (root.startPageId) {
      const target = appData.categories.find((c) => c.id === root.startPageId);
      if (target && target.type === 'page') return target.id;
    }

    const findFirstPage = (parentId: string): string => {
      const children = appData.categories
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.order - b.order);
      
      for (const child of children) {
        if (child.type === 'page') return child.id;
        const subPage = findFirstPage(child.id);
        if (subPage) return subPage;
      }
      return '';
    };

    return findFirstPage(rootId);
  }, [appData.categories]);

  // Select Root Category
  const handleSelectRootCategory = (categoryId: string) => {
    setActiveRootId(categoryId);
    setTableFilterText('');
    const root = appData.categories.find((c) => c.id === categoryId);
    if (root?.type === 'changelog') {
      setActivePageId('');
      setNavHistory([]);
    } else {
      const startPage = resolveStartPage(categoryId);
      if (startPage) {
        setActivePageId(startPage);
        setNavHistory([startPage]);
      } else {
        setActivePageId('');
        setNavHistory([]);
      }
    }
  };

  // Select Subpage
  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    setTableFilterText('');
    setNavHistory((prev) => [...prev, pageId]);
  };

  // Navigate Back up one level in hierarchy
  const handleNavigateBack = () => {
    if (currentPage && currentPage.parentId) {
      const parent = appData.categories.find((c) => c.id === currentPage.parentId);
      if (parent) {
        setActivePageId(parent.id);
        return;
      }
    }

    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop();
      const prevPageId = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setActivePageId(prevPageId);
    } else {
      const startPage = resolveStartPage(activeRootId);
      if (startPage && startPage !== activePageId) {
        setActivePageId(startPage);
      }
    }
  };

  const canNavigateBack = Boolean(currentPage && currentPage.parentId && currentPage.parentId !== activeRootId);

  // Initialize first page if none selected
  useEffect(() => {
    if (activeRootCategory && activeRootCategory.type !== 'changelog' && !activePageId) {
      const startPage = resolveStartPage(activeRootCategory.id);
      if (startPage) {
        setActivePageId(startPage);
        setNavHistory([startPage]);
      }
    }
  }, [activeRootCategory, activePageId, resolveStartPage]);

  // Build Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const list: CategoryItem[] = [];
    if (!activeRootCategory) return list;

    list.push(activeRootCategory);

    if (currentPage && currentPage.id !== activeRootCategory.id) {
      const subPath: CategoryItem[] = [];
      let current: CategoryItem | undefined = currentPage;
      while (current && current.parentId && current.parentId !== activeRootCategory.id) {
        const parent = appData.categories.find((c) => c.id === current?.parentId);
        if (parent) {
          subPath.unshift(parent);
          current = parent;
        } else {
          break;
        }
      }
      list.push(...subPath);
      list.push(currentPage);
    }

    return list;
  }, [activeRootCategory, currentPage, appData.categories]);

  // Handle Global Search Selection
  const handleSelectSearchResult = (categoryId: string, pageId?: string) => {
    setActiveRootId(categoryId);
    if (pageId) {
      setActivePageId(pageId);
      setNavHistory((prev) => [...prev, pageId]);
    }
  };

  // Admin Auth Handlers
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    resumeDraft(getStoredScriptUrl());
    void pullFromGoogleSheets(true);
    showToast('Вы вошли в режим администратора', 'success');
  };

  const handleLogout = () => {
    if (getQueueSnapshot().dirty && !confirm('Есть неотправленные правки. Выйти? Черновик сохранится на устройстве.')) return;
    pauseQueue();
    setIsAdmin(false);
    setAdminAuthState(false);
    showToast('Вы вышли из режима администратора', 'info');
  };

  // ===================== CRUD ОПЕРАЦИИ =====================

  // 1. Изменение ячейки
  const handleUpdateCell = (rowId: string, colKey: string, value: string) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) {
          const updatedRows = (cat.rows || []).map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                cells: { ...row.cells, [colKey]: value }
              };
            }
            return row;
          });
          return { ...cat, rows: updatedRows };
        }
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
  };

  // 2. Подсветка строки
  const handleUpdateRowHighlight = (rowId: string, highlight: RowHighlight) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) {
          const updatedRows = (cat.rows || []).map((row) => {
            if (row.id === rowId) return { ...row, highlight };
            return row;
          });
          return { ...cat, rows: updatedRows };
        }
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
  };

  // 3. Добавить строку
  const handleAddRow = () => {
    if (!currentPage) return;
    const firstColKey = currentPage.columns?.[0]?.key || 'name';
    const newRow: TableRow = {
      id: `row_${crypto.randomUUID()}`,
      highlight: 'none',
      cells: { [firstColKey]: 'Новая позиция' }
    };

    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) {
          return { ...cat, rows: [...(cat.rows || []), newRow] };
        }
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Строка добавлена', 'success');
  };

  // 4. Дублировать строку
  const handleDuplicateRow = (rowId: string) => {
    if (!currentPage) return;
    const targetRow = currentPage.rows?.find((r) => r.id === rowId);
    if (!targetRow) return;

    const clonedRow: TableRow = {
      id: `row_${crypto.randomUUID()}`,
      highlight: targetRow.highlight,
      note: targetRow.note,
      cells: { ...targetRow.cells }
    };

    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) {
          const idx = (cat.rows || []).findIndex((r) => r.id === rowId);
          const rowsCopy = [...(cat.rows || [])];
          rowsCopy.splice(idx + 1, 0, clonedRow);
          return { ...cat, rows: rowsCopy };
        }
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Строка дублирована', 'info');
  };

  // 5. Удалить строку
  const handleDeleteRow = (rowId: string) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) {
          return { ...cat, rows: (cat.rows || []).filter((r) => r.id !== rowId) };
        }
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Строка удалена', 'info');
  };

  // 6. Переместить строку
  const handleMoveRow = (rowId: string, direction: 'up' | 'down') => {
    if (!currentPage || !currentPage.rows) return;
    const rows = [...currentPage.rows];
    const idx = rows.findIndex((r) => r.id === rowId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === rows.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = rows[idx];
    rows[idx] = rows[targetIdx];
    rows[targetIdx] = temp;

    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) return { ...cat, rows };
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
  };

  // 7. Сохранить колонки
  const handleSaveColumns = (newColumns: ColumnDef[]) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) return { ...cat, columns: newColumns };
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Столбцы обновлены', 'success');
  };

  // 8. Сохранить блок внимания
  const handleSaveNote = (note: NoteBlock) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const existingNotes = prev.categories.find(c => c.id === currentPage.id)?.notes || [];
      const exists = existingNotes.some((n) => n.id === note.id);
      const updatedNotes = exists
        ? existingNotes.map((n) => (n.id === note.id ? note : n))
        : [...existingNotes, note];

      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) return { ...cat, notes: updatedNotes };
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Пометка сохранена', 'success');
  };

  // 9. Удалить блок внимания
  const handleDeleteNote = (noteId: string) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const updatedNotes = (prev.categories.find(c => c.id === currentPage.id)?.notes || []).filter((n) => n.id !== noteId);
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) return { ...cat, notes: updatedNotes };
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Пометка удалена', 'info');
  };

  // 10. Позиция блока внимания
  const handleToggleNotePosition = (noteId: string) => {
    if (!currentPage) return;
    if (!applyDataChange((prev) => {
      const updatedNotes = (prev.categories.find(c => c.id === currentPage.id)?.notes || []).map((n) => {
        if (n.id === noteId) {
          return { ...n, position: n.position === 'top' ? 'bottom' : ('top' as 'top' | 'bottom') };
        }
        return n;
      });
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === currentPage.id) return { ...cat, notes: updatedNotes };
        return cat;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
  };

  // 11. Создать/редактировать раздел/страницу
  const handleSaveCategory = (itemData: Partial<CategoryItem>) => {
    if (!applyDataChange((prev) => {
      const previousId = categoryModal.editingItem?.id;
      const existingIdx = previousId ? prev.categories.findIndex((c) => c.id === previousId) : -1;
      if (prev.categories.some(c => c.id === itemData.id && c.id !== previousId)) throw new Error('Этот ID раздела уже занят');
      let updatedCategories = [...prev.categories];

      if (existingIdx >= 0) {
        updatedCategories[existingIdx] = {
          ...updatedCategories[existingIdx],
          ...itemData
        } as CategoryItem;
      } else {
        let defaultCols: ColumnDef[] = [];
        let defaultRows: TableRow[] = [];

        if (itemData.color === 'red' || itemData.title?.toLowerCase().includes('распродажа')) {
          defaultCols = [
            { id: 'c1', title: 'Наименование / Декор', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
            { id: 'c2', title: 'Ширина / Размер', key: 'size', width: 130, headerColor: 'cyan', align: 'center' },
            { id: 'c3', title: 'Остаток на складе', key: 'stock', width: 140, headerColor: 'cyan', align: 'center' },
            { id: 'c4', title: 'Старая цена розн.', key: 'oldPrice', width: 130, headerColor: 'slate', align: 'right' },
            { id: 'c5', title: 'Цена РАСПРОДАЖА', key: 'salePrice', width: 140, headerColor: 'red', align: 'right' },
            { id: 'c6', title: 'Склад хранения', key: 'warehouse', width: 130, headerColor: 'cyan', align: 'center' }
          ];
          defaultRows = [
            { id: 'r1', highlight: 'red', cells: { name: 'Пример позиции распродажи', size: '3.0 м', stock: '12.5 м', oldPrice: '1 200 ₽', salePrice: '790 ₽', warehouse: 'Автомолл' } }
          ];
        } else if (itemData.color === 'amber' || itemData.title?.toLowerCase().includes('товары месяца')) {
          defaultCols = [
            { id: 'c1', title: 'Наименование коллекции', key: 'name', width: 230, headerColor: 'slate', isSticky: true },
            { id: 'c2', title: 'Характеристики', key: 'spec', width: 140, headerColor: 'cyan', align: 'center' },
            { id: 'c3', title: 'Розница (м²)', key: 'priceRetail', width: 130, headerColor: 'amber', align: 'right' },
            { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
            { id: 'c5', title: 'Бонус продавца', key: 'bonus', width: 130, headerColor: 'emerald', align: 'center' }
          ];
          defaultRows = [
            { id: 'r1', highlight: 'yellow', cells: { name: 'Хит месяца (пример)', spec: '33 класс 8мм', priceRetail: '1 490 ₽', specOpt: '1 090 ₽', bonus: '+35 ₽/м²' } }
          ];
        } else if (itemData.type === 'page') {
          defaultCols = [
            { id: 'c1', title: 'Наименование / Характеристика', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
            { id: 'c2', title: 'Цена розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
            { id: 'c3', title: 'Цена отрез (Строй52)', key: 'cutStroy', width: 140, headerColor: 'cyan', align: 'center' },
            { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'center' }
          ];
          defaultRows = [
            { id: 'r1', highlight: 'none', cells: { name: 'Пример товара 1', retail: '990 ₽', cutStroy: '650 ₽', specOpt: '580 ₽' } }
          ];
        }

        const newItem: CategoryItem = {
          id: itemData.id || `cat_${crypto.randomUUID()}`,
          title: itemData.title || 'Новый раздел',
          type: itemData.type || 'page',
          parentId: itemData.parentId !== undefined ? itemData.parentId : null,
          color: itemData.color || 'cyan',
          badge: itemData.badge,
          statusBadge: itemData.statusBadge,
          order: updatedCategories.length + 1,
          startPageId: itemData.startPageId,
          description: itemData.description,
          columns: defaultCols,
          rows: defaultRows
        };
        updatedCategories.push(newItem);

        if (newItem.type === 'page') {
          setActivePageId(newItem.id);
        }
      }

      const previousIdForRefs = categoryModal.editingItem?.id;
      if (previousIdForRefs && itemData.id && previousIdForRefs !== itemData.id) {
        updatedCategories = updatedCategories.map(c => ({...c,
          parentId: c.parentId === previousIdForRefs ? itemData.id! : c.parentId,
          startPageId: c.startPageId === previousIdForRefs ? itemData.id : c.startPageId
        }));
        if (activeRootId === previousIdForRefs) setActiveRootId(itemData.id);
        if (activePageId === previousIdForRefs) setActivePageId(itemData.id);
        return {...prev, categories: updatedCategories,
          settings: {...prev.settings, defaultCategoryId: prev.settings.defaultCategoryId === previousIdForRefs ? itemData.id : prev.settings.defaultCategoryId},
          changelog: prev.changelog.map(l => l.ownerId === previousIdForRefs ? {...l, ownerId: itemData.id} : l)
        };
      }
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast(`«${itemData.title || 'Раздел'}» сохранен`, 'success');
  };

  // 12. Удалить раздел/декор
  const handleDeleteCategory = (itemId: string) => {
    if (!applyDataChange((prev) => {
      const toDeleteIds = new Set<string>([itemId]);
      const collectChildren = (pid: string) => {
        prev.categories
          .filter((c) => c.parentId === pid)
          .forEach((c) => {
            toDeleteIds.add(c.id);
            collectChildren(c.id);
          });
      };
      collectChildren(itemId);

      const updatedCategories = prev.categories.filter((c) => !toDeleteIds.has(c.id)).map(c => toDeleteIds.has(c.startPageId || '') ? {...c, startPageId: undefined} : c);
      return { ...prev, categories: updatedCategories, changelog: prev.changelog.filter(l => !toDeleteIds.has(l.ownerId || prev.categories.find(c => c.type === 'changelog')?.id || '')) };
    })) return;

    const nextStart = resolveStartPage(activeRootId);
    setActivePageId(nextStart);
    showToast('Элемент удален', 'info');
  };

  // 13. Сортировка вверх/вниз
  const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
    if (!applyDataChange((prev) => {
      const target = prev.categories.find((c) => c.id === categoryId);
      if (!target) return prev;
      const parentId = target.parentId || null;
      const siblings = prev.categories
        .filter((c) => (parentId === null ? !c.parentId : c.parentId === parentId))
        .sort((a, b) => a.order - b.order);

      const idx = siblings.findIndex((c) => c.id === categoryId);
      if (idx < 0) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === siblings.length - 1) return prev;

      const targetSibling = siblings[direction === 'up' ? idx - 1 : idx + 1];
      const oldOrder = target.order;
      const newOrder = targetSibling.order;

      const updatedCategories = prev.categories.map((c) => {
        if (c.id === target.id) return { ...c, order: newOrder };
        if (c.id === targetSibling.id) return { ...c, order: oldOrder };
        return c;
      });

      return { ...prev, categories: updatedCategories };
    })) return;
  };

  // 14. Назначить стартовую страницу
  const handleSetStartPage = (groupId: string, pageId: string) => {
    if (!applyDataChange((prev) => {
      const updatedCategories = prev.categories.map((c) => {
        if (c.id === groupId) return { ...c, startPageId: pageId };
        return c;
      });
      return { ...prev, categories: updatedCategories };
    })) return;
    showToast('Стартовая страница раздела обновлена', 'success');
  };

  // 15. Журнал обновлений
  const handleAddChangelogItem = (itemData: Omit<ChangelogItem, 'id'>) => {
    const newItem: ChangelogItem = {
      id: `log_${crypto.randomUUID()}`,
      ...itemData,
      ownerId: activeRootCategory?.id
    };
    if (!applyDataChange((prev) => ({
      ...prev,
      changelog: [newItem, ...(prev.changelog || [])]
    }))) return;
    showToast('Запись добавлена в журнал', 'success');
  };

  const handleDeleteChangelogItem = (id: string) => {
    if (!applyDataChange((prev) => ({
      ...prev,
      changelog: (prev.changelog || []).filter((l) => l.id !== id)
    }))) return;
    showToast('Запись удалена', 'info');
  };

  // 16. Экспорт в CSV
  const handleExportCsv = () => {
    if (!currentPage || !currentPage.columns || !currentPage.rows) return;
    const headerRow = currentPage.columns.map((c) => `"${c.title.replace(/"/g, '""')}"`).join(';');
    const dataRows = currentPage.rows.map((row) => {
      return currentPage.columns!
        .map((col) => {
          const val = String(row.cells[col.key] ?? '');
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(';');
    });
    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Файл CSV экспортирован', 'success');
  };

  // 17. Ручное сохранение / обновление
  const handleManualDownloadFromSheets = async () => {
    await pullFromGoogleSheets(false);
  };

  const handleManualUploadToSheets = async () => {
    await flushNow(dataRef.current);
    const result = getQueueSnapshot();
    showToast(result.message, result.dirty || result.status === 'error' || result.status === 'readonly' ? 'warning' : 'success');
  };

  const handleUpdateScriptUrl = async (url: string) => {
    if (!isValidGoogleScriptUrl(url)) { showToast('Укажите корректный адрес /exec', 'error'); return; }
    try {
      if (getQueueSnapshot().dirty || getQueueSnapshot().inFlight) throw new Error('Сначала сохраните текущие правки.');
      setStoredScriptUrl(url);
      switchEndpoint(url);
      clearSession(); setIsAdmin(false);
      const next = {...dataRef.current, settings:{...dataRef.current.settings, googleScriptUrl:url}};
      dataRef.current=next; setAppData(next); saveAppData(next);
      // A response from an old endpoint must finish before reading the new one.
      await readPromiseRef.current;
      await pullFromGoogleSheets(false);
    } catch(e:any) { showToast(e.message, 'error'); }
  };

  // 18. Бэкап
  const handleExportBackup = () => {
    exportDataAsJson(appData);
    showToast('Резервная копия сохранена в JSON', 'success');
  };

  const handleImportBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedData = await importDataFromJsonFile(file);
      if (!applyDataChange(prev => ({...importedData, settings:{...importedData.settings, googleScriptUrl:prev.settings.googleScriptUrl}}))) return;
      showToast('База данных восстановлена из файла!', 'success');
    } catch (err: any) {
      showToast(`Ошибка импорта: ${err.message}`, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetDemo = () => {
    if (confirm('Сбросить все категории и таблицы до заводских демо-данных?')) {
      const reset = resetAppData();
      if (!applyDataChange(() => reset)) return;
      showToast('База данных возвращена к исходным значениям', 'info');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-200">
        {/* Hidden file input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Admin Ribbon (if logged in) */}
        {isAdmin && (
          <AdminBar
            onOpenSync={() => setIsSyncOpen(true)}
            onOpenTreeManager={() => setIsTreeManagerOpen(true)}
            onAddCategory={() =>
              setCategoryModal({
                isOpen: true,
                editingItem: null,
                defaultParentId: activeRootId,
                defaultType: 'page',
                preset: 'default'
              })
            }
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDemo={handleResetDemo}
            onOpenScriptCode={() => setIsScriptCodeOpen(true)}
            onLogout={handleLogout}
            onShowToast={showToast}
          />
        )}

        {/* Main Top Header Navbar with Live Sync State Indicator & Theme Toggle */}
        <Navbar
          appData={appData}
          isAdmin={isAdmin}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          syncState={syncBadgeState}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenSync={() => setIsSyncOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          onQuickSync={handleManualDownloadFromSheets}
        />

        {/* Top Colorful Category Tabs */}
        <TopCategoryTabs
          categories={appData.categories}
          selectedCategoryId={activeRootId}
          onSelectCategory={handleSelectRootCategory}
          isAdmin={isAdmin}
          onAddCategory={() =>
            setCategoryModal({
              isOpen: true,
              editingItem: null,
              defaultParentId: null,
              defaultType: 'group',
              preset: 'default'
            })
          }
          onEditCategory={(cat) =>
            setCategoryModal({
              isOpen: true,
              editingItem: cat,
              defaultParentId: cat.parentId || null,
              defaultType: cat.type,
              preset: 'default'
            })
          }
          onDeleteCategory={handleDeleteCategory}
        />

        {/* Main Body Content */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-5 flex flex-col gap-3 sm:gap-4 overflow-hidden">
          {/* If Active Root is Changelog */}
          {activeRootCategory?.type === 'changelog' ? (
            <ChangelogView
              changelog={appData.changelog.filter(l => l.ownerId ? l.ownerId === activeRootCategory.id : activeRootCategory.id === appData.categories.find(c => c.type === 'changelog')?.id)}
              isAdmin={isAdmin}
              onAddLogItem={handleAddChangelogItem}
              onDeleteLogItem={handleDeleteChangelogItem}
            />
          ) : (
            /* Regular Catalog Views (Sidebar + Page Content) */
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start w-full max-w-full">
              {/* Left Menu / Subcategories Drawer */}
              <SidebarMenu
                rootCategory={activeRootCategory}
                categories={appData.categories}
                selectedPageId={activePageId}
                onSelectPage={handleSelectPage}
                onNavigateBack={handleNavigateBack}
                canNavigateBack={canNavigateBack}
                isAdmin={isAdmin}
                onAddChildItem={(parentId, type, preset = 'default') =>
                  setCategoryModal({
                    isOpen: true,
                    editingItem: null,
                    defaultParentId: parentId,
                    defaultType: type,
                    preset: preset
                  })
                }
                onEditItem={(item) =>
                  setCategoryModal({
                    isOpen: true,
                    editingItem: item,
                    defaultParentId: item.parentId || null,
                    defaultType: item.type,
                    preset: 'default'
                  })
                }
                onDeleteItem={handleDeleteCategory}
                onSetStartPage={handleSetStartPage}
              />

              {/* Right Main Table & Content Area */}
              <div className="flex-1 w-full min-w-0 flex flex-col gap-3 overflow-hidden">
                {/* Breadcrumbs & Table Filter Strip */}
                <Breadcrumbs
                  breadcrumbs={breadcrumbs}
                  currentPage={currentPage}
                  onNavigate={(item) => {
                    if (item.parentId === null) {
                      handleSelectRootCategory(item.id);
                    } else {
                      handleSelectPage(item.id);
                    }
                  }}
                  onNavigateBack={handleNavigateBack}
                  canNavigateBack={canNavigateBack}
                  filterText={tableFilterText}
                  onFilterChange={setTableFilterText}
                  isAdmin={isAdmin}
                  onOpenColumnEditor={() => setColumnModalOpen(true)}
                  onAddRow={handleAddRow}
                  onExportCsv={handleExportCsv}
                />

                {/* Sub-Levels / Decors Navigator Bar & Switcher */}
                <SubLevelsNav
                  currentPage={currentPage}
                  allCategories={appData.categories}
                  onSelectPage={handleSelectPage}
                  isAdmin={isAdmin}
                  onAddSubLevel={(parentId) =>
                    setCategoryModal({
                      isOpen: true,
                      editingItem: null,
                      defaultParentId: parentId,
                      defaultType: 'page',
                      preset: 'default'
                    })
                  }
                />

                {/* Attention Notes ABOVE Table */}
                {currentPage?.notes && (
                  <AttentionNotes
                    notes={currentPage.notes}
                    position="top"
                    isAdmin={isAdmin}
                    onAddNote={(pos) =>
                      setNoteModal({
                        isOpen: true,
                        editingNote: null,
                        defaultPosition: pos
                      })
                    }
                    onEditNote={(note) =>
                      setNoteModal({
                        isOpen: true,
                        editingNote: note,
                        defaultPosition: note.position
                      })
                    }
                    onDeleteNote={handleDeleteNote}
                    onTogglePosition={handleToggleNotePosition}
                  />
                )}

                {/* Table View Component */}
                {currentPage && currentPage.columns ? (
                  <TableView
                    columns={currentPage.columns}
                    rows={currentPage.rows || []}
                    filterText={tableFilterText}
                    isAdmin={isAdmin}
                    onUpdateCell={handleUpdateCell}
                    onUpdateRowHighlight={handleUpdateRowHighlight}
                    onAddRow={handleAddRow}
                    onDeleteRow={handleDeleteRow}
                    onDuplicateRow={handleDuplicateRow}
                    onMoveRow={handleMoveRow}
                    onOpenColumnEditor={() => setColumnModalOpen(true)}
                  />
                ) : (
                  <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Выберите категорию или коллекцию в меню слева для просмотра таблицы цен
                    </p>
                  </div>
                )}

                {/* Decors below the table on mobile; desktop position is preserved. */}
                <SubLevelsNav
                  placement="below"
                  currentPage={currentPage}
                  allCategories={appData.categories}
                  onSelectPage={handleSelectPage}
                  isAdmin={isAdmin}
                  onAddSubLevel={(parentId) =>
                    setCategoryModal({
                      isOpen: true,
                      editingItem: null,
                      defaultParentId: parentId,
                      defaultType: 'page',
                      preset: 'default'
                    })
                  }
                />

                {/* Attention Notes BELOW Table */}
                {currentPage?.notes && (
                  <AttentionNotes
                    notes={currentPage.notes}
                    position="bottom"
                    isAdmin={isAdmin}
                    onAddNote={(pos) =>
                      setNoteModal({
                        isOpen: true,
                        editingNote: null,
                        defaultPosition: pos
                      })
                    }
                    onEditNote={(note) =>
                      setNoteModal({
                        isOpen: true,
                        editingNote: note,
                        defaultPosition: note.position
                      })
                    }
                    onDeleteNote={handleDeleteNote}
                    onTogglePosition={handleToggleNotePosition}
                  />
                )}
              </div>
            </div>
          )}

          {/* User Guide: How to Install App on Home Screen (iPhone, Android, Windows, Mac) */}
          <InstallGuideSection />
        </main>

        {/* Footer */}
        <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
          <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Памятка продавца — Каталог цен, остатков и характеристик © 2026</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsScriptCodeOpen(true)}
                className="text-cyan-700 dark:text-cyan-400 hover:underline font-semibold"
              >
                Google Таблица
              </button>
              <span>•</span>
              <button
                onClick={() => (isAdmin ? handleLogout() : setIsLoginOpen(true))}
                className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              >
                {isAdmin ? 'Выйти из админки' : 'Вход для администратора'}
              </button>
            </div>
          </div>
        </footer>

        {/* Global Modals */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          appData={appData}
          onSelectResult={handleSelectSearchResult}
        />

        <SellerCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          googleScriptUrl={getStoredScriptUrl()}
        />

        <SyncModal
          isOpen={isSyncOpen}
          onClose={() => setIsSyncOpen(false)}
          appData={appData}
          queueState={queueState}
          onUpdateScriptUrl={handleUpdateScriptUrl}
          onDownloadFromSheets={handleManualDownloadFromSheets}
          onUploadToSheets={handleManualUploadToSheets}
          onOpenScriptCode={() => {
            setIsSyncOpen(false);
            setIsScriptCodeOpen(true);
          }}
          isSyncing={isSyncing}
        />

        <ScriptCodeModal
          isOpen={isScriptCodeOpen}
          onClose={() => setIsScriptCodeOpen(false)}
          onShowToast={showToast}
        />

        {/* Admin Full Tree Manager Modal */}
        <CategoryTreeManagerModal
          isOpen={isTreeManagerOpen}
          onClose={() => setIsTreeManagerOpen(false)}
          categories={appData.categories}
          onAddCategory={(parentId, type, preset = 'default') =>
            setCategoryModal({
              isOpen: true,
              editingItem: null,
              defaultParentId: parentId,
              defaultType: type,
              preset: preset
            })
          }
          onEditCategory={(cat) =>
            setCategoryModal({
              isOpen: true,
              editingItem: cat,
              defaultParentId: cat.parentId || null,
              defaultType: cat.type,
              preset: 'default'
            })
          }
          onDeleteCategory={handleDeleteCategory}
          onMoveCategory={handleMoveCategory}
          onSelectCategory={handleSelectSearchResult}
        />

        {/* Admin Category Editor Modal */}
        <CategoryEditorModal
          isOpen={categoryModal.isOpen}
          onClose={() =>
            setCategoryModal({
              isOpen: false,
              editingItem: null,
              defaultParentId: null,
              defaultType: 'page',
              preset: 'default'
            })
          }
          editingItem={categoryModal.editingItem}
          defaultParentId={categoryModal.defaultParentId}
          defaultType={categoryModal.defaultType}
          preset={categoryModal.preset}
          allCategories={appData.categories}
          onSave={handleSaveCategory}
        />

        {/* Admin Column Editor Modal */}
        {currentPage?.columns && (
          <ColumnEditorModal
            isOpen={columnModalOpen}
            onClose={() => setColumnModalOpen(false)}
            columns={currentPage.columns}
            onSaveColumns={handleSaveColumns}
          />
        )}

        {/* Admin Note Editor Modal */}
        <NoteEditorModal
          isOpen={noteModal.isOpen}
          onClose={() =>
            setNoteModal({
              isOpen: false,
              editingNote: null,
              defaultPosition: 'top'
            })
          }
          editingNote={noteModal.editingNote}
          defaultPosition={noteModal.defaultPosition}
          onSaveNote={handleSaveNote}
        />

        {/* Toast Notification Container */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
