import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { ColumnDef, HeaderColor } from '../../types';

interface ColumnEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDef[];
  onSaveColumns: (columns: ColumnDef[]) => void;
}

export const ColumnEditorModal: React.FC<ColumnEditorModalProps> = ({
  isOpen,
  onClose,
  columns,
  onSaveColumns
}) => {
  const [cols, setCols] = useState<ColumnDef[]>(() => JSON.parse(JSON.stringify(columns)));
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState<HeaderColor>('cyan');
  const [newColAlign] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => { if (isOpen) setCols(structuredClone(columns)); }, [isOpen, columns]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    const colKey = `col_${crypto.randomUUID()}`;
    const newCol: ColumnDef = {
      id: `c_${crypto.randomUUID()}`,
      title: newColTitle.trim(),
      key: colKey,
      width: 130,
      headerColor: newColColor,
      align: newColAlign,
      isSticky: false
    };
    setCols([...cols, newCol]);
    setNewColTitle('');
  };

  const handleUpdateTitle = (idx: number, title: string) => {
    const updated = [...cols];
    updated[idx].title = title;
    setCols(updated);
  };

  const handleUpdateColor = (idx: number, color: HeaderColor) => {
    const updated = [...cols];
    updated[idx].headerColor = color;
    setCols(updated);
  };

  const handleUpdateAlign = (idx: number, align: 'left' | 'center' | 'right') => {
    const updated = [...cols];
    updated[idx].align = align;
    setCols(updated);
  };

  const handleUpdateWidth = (idx: number, width: number) => {
    const updated = [...cols];
    updated[idx].width = width;
    setCols(updated);
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    if (idx === 0 && direction === 'up') return;
    if (idx === cols.length - 1 && direction === 'down') return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...cols];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCols(updated);
  };

  const handleDelete = (idx: number) => {
    if (cols.length <= 1) {
      alert('В таблице должен оставаться хотя бы 1 столбец');
      return;
    }
    const updated = cols.filter((_, i) => i !== idx);
    setCols(updated);
  };

  const handleSave = () => {
    onSaveColumns(cols);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Редактор столбцов таблицы</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Настройка названий, цветов шапок и порядка столбцов
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Columns List */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Текущие столбцы ({cols.length}):
          </label>
          <div className="flex flex-col gap-2 max-h-[42vh] overflow-y-auto p-1 scrollbar-thin">
            {cols.map((col, idx) => {
              const isFirst = idx === 0;

              return (
                <div
                  key={col.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono text-slate-400 w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                      placeholder="Название столбца"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                    />
                  </div>

                  {/* Settings row */}
                  <div className="flex items-center gap-1.5 justify-between sm:justify-end flex-wrap">
                    {/* Color picker */}
                    <select
                      value={col.headerColor || 'slate'}
                      onChange={(e) => handleUpdateColor(idx, e.target.value as HeaderColor)}
                      className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="slate">Серый (Стандарт)</option>
                      <option value="cyan">Циан (Основной)</option>
                      <option value="blue">Синий</option>
                      <option value="red">Красный (СПЕЦ-ОПТ)</option>
                      <option value="amber">Желтый (Поставщик)</option>
                      <option value="emerald">Зеленый</option>
                    </select>

                    {/* Alignment */}
                    <div className="flex rounded-lg bg-white dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleUpdateAlign(idx, 'left')}
                        className={`p-1 rounded ${col.align === 'left' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                      >
                        <AlignLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAlign(idx, 'center')}
                        className={`p-1 rounded ${col.align === 'center' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                      >
                        <AlignCenter className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateAlign(idx, 'right')}
                        className={`p-1 rounded ${col.align === 'right' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                      >
                        <AlignRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Width */}
                    <input
                      type="number"
                      step="10"
                      min="70"
                      max="500"
                      value={col.width || (isFirst ? 220 : 130)}
                      onChange={(e) => handleUpdateWidth(idx, parseInt(e.target.value) || 120)}
                      title="Ширина в px"
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-center text-slate-900 dark:text-slate-300 font-mono"
                    />

                    {/* Reorder Up/Down */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-black dark:hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cols.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-black dark:hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Column Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            placeholder="Название нового столбца..."
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-xs text-slate-900 dark:text-white outline-none"
          />
          <select
            value={newColColor}
            onChange={(e) => setNewColColor(e.target.value as HeaderColor)}
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="cyan">Цвет: Циан</option>
            <option value="red">Цвет: Красный (СПЕЦ-ОПТ)</option>
            <option value="blue">Цвет: Синий</option>
            <option value="amber">Цвет: Желтый</option>
            <option value="slate">Цвет: Серый</option>
          </select>
          <button
            type="button"
            onClick={handleAddColumn}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить</span>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
          >
            Применить столбцы
          </button>
        </div>
      </div>
    </div>
  );
};
