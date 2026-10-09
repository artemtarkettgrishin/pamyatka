import React, { useState, useEffect } from 'react';
import {
  X,
  FolderPlus,
  FilePlus,
  Palette,
  Tag,
  Pin,
  Flame,
  Star,
  Sparkles
} from 'lucide-react';
import { CategoryItem, CategoryType } from '../../types';

interface CategoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CategoryItem | null;
  defaultParentId: string | null;
  defaultType: CategoryType;
  preset?: 'sale' | 'month' | 'default';
  allCategories: CategoryItem[];
  onSave: (item: Partial<CategoryItem>) => void;
}

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  defaultParentId,
  defaultType,
  preset = 'default',
  allCategories,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [customId, setCustomId] = useState('');
  const [type, setType] = useState<CategoryType>(defaultType);
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [color, setColor] = useState('cyan');
  const [badge, setBadge] = useState('');
  const [statusBadge, setStatusBadge] = useState('');
  const [startPageId, setStartPageId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setCustomId(editingItem?.id || '');
    if (editingItem) {
      setTitle(editingItem.title || '');
      setType(editingItem.type || 'page');
      setParentId(editingItem.parentId !== undefined ? editingItem.parentId : null);
      setColor(editingItem.color || 'cyan');
      setBadge(editingItem.badge || '');
      setStatusBadge(editingItem.statusBadge || '');
      setStartPageId(editingItem.startPageId || '');
      setDescription(editingItem.description || '');
    } else {
      // Handle Quick Presets
      if (preset === 'sale') {
        setTitle('Распродажа');
        setType('page');
        setParentId(defaultParentId);
        setColor('red');
        setBadge('СКИДКИ ДО -40%');
        setStatusBadge('');
      } else if (preset === 'month') {
        setTitle('Товары месяца');
        setType('page');
        setParentId(defaultParentId);
        setColor('amber');
        setBadge('ХИТ ПРОДАЖ');
        setStatusBadge('');
      } else {
        setTitle('');
        setType(defaultType);
        setParentId(defaultParentId);
        setColor('cyan');
        setBadge('');
        setStatusBadge('');
      }
      setStartPageId('');
      setDescription('');
    }
  }, [editingItem, defaultParentId, defaultType, preset, isOpen]);

  if (!isOpen) return null;

  // Preset Applicator
  const applyPreset = (presetType: 'sale' | 'month' | 'group' | 'decor_in_stock' | 'decor_order' | 'decor_out') => {
    if (presetType === 'sale') {
      setTitle('Распродажа');
      setColor('red');
      setBadge('СКИДКИ ДО -40%');
      setType('page');
    } else if (presetType === 'month') {
      setTitle('Товары месяца');
      setColor('amber');
      setBadge('ХИТ МЕСЯЦА');
      setType('page');
    } else if (presetType === 'group') {
      setType('group');
      setColor('cyan');
    } else if (presetType === 'decor_in_stock') {
      setStatusBadge('🟢 В наличии');
      setType('page');
    } else if (presetType === 'decor_order') {
      setStatusBadge('🟡 Под заказ 3-5 дн.');
      setType('page');
    } else if (presetType === 'decor_out') {
      setStatusBadge('🔴 Вывод (остаток)');
      setType('page');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: customId.trim() || editingItem?.id || `cat_${crypto.randomUUID()}`,
      storageId: editingItem?.storageId || editingItem?.id,
      title: title.trim(),
      type: type,
      parentId: parentId,
      color: color,
      badge: badge.trim() || undefined,
      statusBadge: statusBadge.trim() || undefined,
      startPageId: startPageId || undefined,
      description: description.trim() || undefined,
      order: editingItem ? editingItem.order : 999
    });

    onClose();
  };

  // Helper to build recursive indented options for parent selector
  const buildParentTreeOptions = () => {
    const options: { id: string; title: string; depth: number }[] = [];

    const traverse = (pId: string | null, depth: number) => {
      const children = allCategories
        .filter((c) => (pId === null ? !c.parentId : c.parentId === pId))
        .filter((c) => !editingItem || c.id !== editingItem.id)
        .sort((a, b) => a.order - b.order);

      children.forEach((child) => {
        options.push({
          id: child.id,
          title: child.title,
          depth: depth
        });
        traverse(child.id, depth + 1);
      });
    };

    traverse(null, 0);
    return options;
  };

  const parentTreeOptions = buildParentTreeOptions();

  // List of potential child pages for startPageId selector
  const availableChildPages = allCategories.filter(
    (c) => c.type === 'page' && (!editingItem || c.parentId === editingItem.id || c.parentId === parentId)
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-thin text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              {type === 'group' ? <FolderPlus className="w-5 h-5" /> : <FilePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingItem ? 'Настройка элемента каталога' : 'Создание нового раздела / страницы'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Меню, подкатегории, группы, распродажи и декоры
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar (1-Click Setup) */}
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Быстрые шаблоны в 1 клик:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('sale')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/90 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-500/50 text-[11px] font-bold text-rose-900 dark:text-rose-200"
            >
              <Flame className="w-3 h-3 text-rose-500 dark:text-rose-400" />
              <span>«Распродажа»</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('month')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/90 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-500/50 text-[11px] font-bold text-amber-950 dark:text-amber-200"
            >
              <Star className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>«Товары месяца»</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('group')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200"
            >
              <FolderPlus className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Группа</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('decor_in_stock')}
              className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/90 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-500/50 text-[11px] font-bold text-emerald-900 dark:text-emerald-300"
            >
              🟢 Декор в наличии
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Название (Раздел / Коллекция / Декор) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Например: Sinteros Ostin, Harvest 8/33 4V, Дуб Ористано..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Editable category ID: requested v10 control */}
          <div>
            <label htmlFor="category-custom-id" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">ID раздела</label>
            <input
              id="category-custom-id"
              type="text"
              value={customId}
              onChange={(e) => {
                const value = e.target.value.trim();
                e.target.setCustomValidity(['__proto__', 'constructor', 'prototype'].includes(value) || allCategories.some(c => c.id === value && c.id !== editingItem?.id) ? 'Этот ID занят или недопустим. Укажите другой.' : '');
                setCustomId(e.target.value);
              }}
              placeholder="Пустое поле — ID создастся автоматически"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>
          {/* End editable category ID */}

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('page')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'page'
                  ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-900 dark:text-cyan-300 ring-1 ring-cyan-400'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>Страница с таблицей</span>
            </button>
            <button
              type="button"
              onClick={() => setType('group')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'group'
                  ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-950 dark:text-amber-300 ring-1 ring-amber-400'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Папка / Группа</span>
            </button>
          </div>

          {/* Parent Hierarchy Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Куда поместить (Родительский элемент):</span>
              <span className="text-[10px] text-slate-500 font-normal">Любая вложенность</span>
            </label>
            <select
              value={parentId || 'root'}
              onChange={(e) => setParentId(e.target.value === 'root' ? null : e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs sm:text-sm text-slate-900 dark:text-white outline-none cursor-pointer font-mono"
            >
              <option value="root">★ Верхнее главное меню (Корневой раздел на панели)</option>
              {parentTreeOptions.map((opt) => {
                const indent = '─ '.repeat(opt.depth);
                return (
                  <option key={opt.id} value={opt.id}>
                    {indent ? `${indent} ` : ''}{opt.title}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Badge (Decor Availability) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Статус наличия / заказа декора:</span>
            </label>
            <input
              type="text"
              value={statusBadge}
              onChange={(e) => setStatusBadge(e.target.value)}
              placeholder="🟢 В наличии / 🟡 Под заказ 3-5 дн. / 🔴 Вывод"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs text-slate-900 dark:text-white outline-none mb-1.5"
            />
            {/* Quick Status Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setStatusBadge('🟢 В наличии')}
                className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-[10px] font-bold text-emerald-900 dark:text-emerald-300"
              >
                🟢 В наличии
              </button>
              <button
                type="button"
                onClick={() => setStatusBadge('🟡 Под заказ 3-5 дн.')}
                className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-[10px] font-bold text-amber-950 dark:text-amber-300"
              >
                🟡 Под заказ 3-5 дн.
              </button>
              <button
                type="button"
                onClick={() => setStatusBadge('🔴 Вывод (остаток)')}
                className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-[10px] font-bold text-rose-900 dark:text-rose-300"
              >
                🔴 Вывод (остаток)
              </button>
              <button
                type="button"
                onClick={() => setStatusBadge('')}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              >
                Очистить
              </button>
            </div>
          </div>

          {/* Marketing Badge & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Бейдж (АКЦИЯ, ХИТ):</span>
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="ХИТ, МОНАРХ, СКИДКА..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Цвет кнопки:</span>
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="cyan">Циан (Основной)</option>
                <option value="red">Красный (Распродажа / Акция)</option>
                <option value="amber">Желтый (Товары месяца / Хит)</option>
                <option value="blue">Синий (Ламинат)</option>
                <option value="emerald">Зеленый (Обновления)</option>
                <option value="purple">Фиолетовый</option>
                <option value="slate">Серый (Сопутствующие)</option>
              </select>
            </div>
          </div>

          {/* Start Page */}
          {availableChildPages.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Стартовая страница при клике</span>
              </label>
              <select
                value={startPageId}
                onChange={(e) => setStartPageId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="">По умолчанию (первая страница / текущая)</option>
                {availableChildPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    📄 {page.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
            >
              {editingItem ? 'Сохранить изменения' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
