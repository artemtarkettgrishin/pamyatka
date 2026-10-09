import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Filter,
  Sparkles
} from 'lucide-react';
import { ChangelogItem, ChangelogImportance } from '../types';

interface ChangelogViewProps {
  changelog: ChangelogItem[];
  isAdmin: boolean;
  onAddLogItem?: (item: Omit<ChangelogItem, 'id'>) => void;
  onDeleteLogItem?: (id: string) => void;
}

export const ChangelogView: React.FC<ChangelogViewProps> = ({
  changelog,
  isAdmin,
  onAddLogItem,
  onDeleteLogItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new log entry
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  });
  const [newCategory, setNewCategory] = useState('Ламинат');
  const [newText, setNewText] = useState('');
  const [newImportance, setNewImportance] = useState<ChangelogImportance>('normal');

  // Categories list for filtering
  const categories = ['all', ...Array.from(new Set(changelog.map((c) => c.category)))];

  const filteredLog = changelog.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesImportance =
      selectedImportance === 'all' || item.importance === selectedImportance;

    return matchesSearch && matchesCategory && matchesImportance;
  });

  const getImportanceBadge = (importance: ChangelogImportance) => {
    switch (importance) {
      case 'critical':
        return {
          row: 'bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border-l-4 border-l-rose-500',
          icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        };
      case 'high':
        return {
          row: 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 border-l-4 border-l-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'info':
        return {
          row: 'bg-cyan-50 dark:bg-cyan-950/10 hover:bg-cyan-100 dark:hover:bg-cyan-950/30 border-l-4 border-l-cyan-500',
          icon: <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
        };
      case 'normal':
      default:
        return {
          row: 'bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-l-4 border-l-slate-300 dark:border-l-slate-700',
          icon: <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
        };
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !onAddLogItem) return;

    onAddLogItem({
      date: newDate,
      category: newCategory,
      text: newText.trim(),
      importance: newImportance,
      author: 'Администратор'
    });

    setNewText('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-950/80 dark:via-slate-900 dark:to-slate-950 border border-emerald-500/30 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-emerald-600/20 border border-white/30 dark:border-emerald-500/40 flex items-center justify-center text-white dark:text-emerald-400 shadow-md shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
              Журнал изменений и переоценок
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                {changelog.length} записей
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 dark:text-slate-400 mt-0.5">
              Ежедневные переоценки, новинки коллекций и актуальность для продавцов
            </p>
          </div>
        </div>

        {isAdmin && onAddLogItem && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-emerald-600 hover:bg-slate-100 dark:hover:bg-emerald-500 text-emerald-900 dark:text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить запись</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по журналу..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
          />
        </div>

        {/* Category & Importance Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Все категории</option>
              {categories
                .filter((c) => c !== 'all')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedImportance}
              onChange={(e) => setSelectedImportance(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Любая важность</option>
              <option value="critical">❗ Критичные</option>
              <option value="high">⚠️ Важные</option>
              <option value="normal">📌 Обычные</option>
              <option value="info">ℹ️ Инфо</option>
            </select>
          </div>
        </div>
      </div>

      {/* Changelog Spreadsheet */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md scrollbar-thin">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase text-[11px] font-bold border-b-2 border-slate-300 dark:border-slate-700 select-none">
              <th className="p-3 w-44 border-r border-slate-200 dark:border-slate-700">Категория</th>
              <th className="p-3 w-32 border-r border-slate-200 dark:border-slate-700 text-center">Дата</th>
              <th className="p-3 border-r border-slate-200 dark:border-slate-700">Изменения</th>
              {isAdmin && <th className="p-3 w-16 text-center">Удалить</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {filteredLog.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  className="p-8 text-center text-slate-500 italic bg-slate-50 dark:bg-slate-900/30"
                >
                  Записи не найдены
                </td>
              </tr>
            ) : (
              filteredLog.map((item) => {
                const style = getImportanceBadge(item.importance);

                return (
                  <tr key={item.id} className={`transition-colors ${style.row}`}>
                    {/* Category */}
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-200">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-xs">
                        {item.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-700 dark:text-slate-300">
                      <div className="inline-flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{item.date}</span>
                      </div>
                    </td>

                    {/* Change Description */}
                    <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">{style.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                            {item.text}
                          </p>
                          {item.importance === 'critical' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/50 uppercase tracking-wider">
                              Критически важно
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Admin Delete */}
                    {isAdmin && onDeleteLogItem && (
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Удалить эту запись из журнала?')) {
                              onDeleteLogItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Changelog Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                <span>Добавить запись в журнал</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Дата (ДД.ММ.ГГГГ)
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 text-sm outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Категория
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    placeholder="Ламинат, Линолеум..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 text-sm outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Важность записи
                </label>
                <select
                  value={newImportance}
                  onChange={(e) => setNewImportance(e.target.value as ChangelogImportance)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 text-sm outline-none cursor-pointer text-slate-900 dark:text-white"
                >
                  <option value="normal">📌 Обычная новость / обновление цен</option>
                  <option value="high">⚠️ Важное изменение / акция</option>
                  <option value="critical">❗ Критично (Срочно проверить распродажу/актуальность)</option>
                  <option value="info">ℹ️ Информационное сообщение</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Текст изменения
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  required
                  rows={3}
                  placeholder="Опишите новинки, изменения в ценах, выведенные декоры..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 text-sm outline-none resize-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Опубликовать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
