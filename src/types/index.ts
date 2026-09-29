export type HeaderColor = 
  | 'slate' 
  | 'cyan' 
  | 'blue' 
  | 'red' 
  | 'emerald' 
  | 'amber' 
  | 'purple' 
  | 'zinc' 
  | 'orange';

export type NoteType = 'danger' | 'warning' | 'info' | 'success' | 'accent' | 'purple';

export type RowHighlight = 'none' | 'yellow' | 'red' | 'green' | 'blue';

export interface ColumnDef {
  id: string;
  title: string;
  key: string;
  width?: number; // min-width in px
  headerColor?: HeaderColor;
  align?: 'left' | 'center' | 'right';
  isSticky?: boolean;
}

export interface TableRow {
  id: string;
  highlight?: RowHighlight;
  note?: string;
  cells: Record<string, string | number>;
}

export interface NoteBlock {
  id: string;
  type: NoteType;
  icon?: string; // 'alert-triangle' | 'alert-circle' | 'tag' | 'info' | 'check' | 'dollar' | 'truck'
  title?: string;
  content: string;
  position: 'top' | 'bottom';
}

export type CategoryType = 'group' | 'page' | 'changelog';

export interface CategoryItem {
  storageId?: string; // stable sheet identity, independent of the visible editable ID
  id: string;
  title: string;
  slug?: string;
  badge?: string; // e.g. 'NEW', 'АКЦИЯ', 'ХИТ', 'МОНАРХ'
  statusBadge?: string; // e.g. '🟢 В наличии', '🟡 Под заказ', '🔴 Выведен из программы'
  color?: string; // e.g. 'emerald', 'cyan', 'blue', 'slate', 'amber', 'red', 'purple'
  icon?: string;
  type: CategoryType;
  parentId?: string | null; // null for top-level root categories
  order: number;
  startPageId?: string; // Default landing page when clicking this category
  
  // Page table & content data (can exist on ANY category/page/decor level)
  columns?: ColumnDef[];
  rows?: TableRow[];
  notes?: NoteBlock[];
  description?: string;
  lastUpdated?: string;
}

export type ChangelogImportance = 'critical' | 'high' | 'normal' | 'info';

export interface ChangelogItem {
  ownerId?: string; // independent journal tab
  id: string;
  date: string; // e.g. '19.05.2026'
  category: string;
  text: string;
  importance: ChangelogImportance;
  author?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultCategoryId?: string;
  currencySymbol: string;
  adminPasswordHash: string; // default hashed or checked
  compactMode: boolean;
  googleScriptUrl: string;
  lastSyncTime?: string;
  autoSyncInterval?: number; // minutes, 0 = off
}

export interface AppData {
  version: string;
  appName: string;
  lastModified: string;
  categories: CategoryItem[];
  changelog: ChangelogItem[];
  settings: AppSettings;
}

export interface SearchResult {
  type: 'product' | 'page' | 'category' | 'note' | 'changelog';
  title: string;
  subtitle?: string;
  categoryId: string;
  pageId?: string;
  categoryPath: string[];
  matchedText?: string;
  price?: string | number;
}
