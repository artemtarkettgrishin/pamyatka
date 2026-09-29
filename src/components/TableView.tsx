import React, { useState } from 'react';
import {
  Copy,
  Check,
  Trash2,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  Plus,
  SlidersHorizontal,
  Palette
} from 'lucide-react';
import { ColumnDef, TableRow, HeaderColor, RowHighlight } from '../types';

interface TableViewProps {
  columns: ColumnDef[];
  rows: TableRow[];
  filterText?: string;
  isAdmin: boolean;
  onUpdateCell?: (rowId: string, colKey: string, value: string) => void;
  onUpdateRowHighlight?: (rowId: string, highlight: RowHighlight) => void;
  onAddRow?: () => void;
  onDeleteRow?: (rowId: string) => void;
  onDuplicateRow?: (rowId: string) => void;
  onMoveRow?: (rowId: string, direction: 'up' | 'down') => void;
  onOpenColumnEditor?: () => void;
  onShowToast?: (message: string, type: 'success' | 'info') => void;
}

export const TableView: React.FC<TableViewProps> = ({
  columns,
  rows,
  filterText = '',
  isAdmin,
  onUpdateCell,
  onUpdateRowHighlight,
  onAddRow,
  onDeleteRow,
  onDuplicateRow,
  onMoveRow,
  onOpenColumnEditor,
  onShowToast: _onShowToast
}) => {
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);

  // Filter rows based on search text
  const filteredRows = rows.filter((row) => {
    if (!filterText.trim()) return true;
    const searchLower = filterText.toLowerCase();
    return Object.values(row.cells).some((val) =>
      String(val ?? '').toLowerCase().includes(searchLower)
    );
  });

  // Copy cell value to clipboard
  const handleCopyCell = async (text: string, cellKey: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopiedCell(cellKey);
      setTimeout(() => setCopiedCell(null), 1500);
    } catch { _onShowToast?.('Браузер не разрешил копирование. Выделите текст вручную.', 'info'); }
  };

  const getHeaderColorStyle = (color?: HeaderColor, isFirstCol = false) => {
    if (isFirstCol) {
      return 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-cyan-300 border-slate-300 dark:border-slate-700 font-bold';
    }
    switch (color) {
      case 'cyan':
        return 'bg-cyan-600 text-white font-bold border-cyan-500';
      case 'blue':
        return 'bg-blue-600 text-white font-bold border-blue-500';
      case 'red':
        return 'bg-rose-600 text-white font-black border-rose-500 shadow-inner';
      case 'amber':
      case 'orange':
        return 'bg-amber-400 dark:bg-amber-500 text-slate-950 font-black border-amber-400';
      case 'emerald':
        return 'bg-emerald-600 text-white font-bold border-emerald-500';
      case 'purple':
        return 'bg-purple-600 text-white font-bold border-purple-500';
      case 'zinc':
      case 'slate':
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold border-slate-300 dark:border-slate-700';
    }
  };

  const getRowHighlightStyle = (highlight?: RowHighlight) => {
    switch (highlight) {
      case 'red':
        return 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-500/30 text-rose-950 dark:text-rose-100 font-semibold';
      case 'yellow':
        return 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-100 font-semibold';
      case 'green':
        return 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-semibold';
      case 'blue':
        return 'bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 border-cyan-200 dark:border-cyan-500/30 text-cyan-950 dark:text-cyan-100 font-semibold';
      case 'none':
      default:
        return 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-200';
    }
  };

  const getRowStickyCellStyle = (highlight?: RowHighlight) => {
    switch (highlight) {
      case 'red':
        return 'bg-rose-100 dark:bg-rose-950/95 text-rose-950 dark:text-white font-bold';
      case 'yellow':
        return 'bg-amber-100 dark:bg-amber-950/95 text-amber-950 dark:text-amber-200 font-bold';
      case 'green':
        return 'bg-emerald-100 dark:bg-emerald-950/95 text-emerald-950 dark:text-emerald-200 font-bold';
      case 'blue':
        return 'bg-cyan-100 dark:bg-cyan-950/95 text-cyan-950 dark:text-cyan-200 font-bold';
      case 'none':
      default:
        return 'bg-slate-50 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 font-semibold';
    }
  };

  if (!columns || columns.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <p className="text-slate-500 dark:text-slate-400 text-sm">В этой таблице еще нет столбцов.</p>
        {isAdmin && onOpenColumnEditor && (
          <button
            onClick={onOpenColumnEditor}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Настроить столбцы таблицы</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-full overflow-hidden">
      {/* Scrollable Table Viewport with Mobile Optimizations */}
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[72vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md dark:shadow-2xl relative scrollbar-thin">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-full">
          {/* Sticky Table Header */}
          <thead>
            <tr>
              {columns.map((col, index) => {
                const isFirst = index === 0;
                const headerStyle = getHeaderColorStyle(col.headerColor, isFirst);

                return (
                  <th
                    key={col.id || col.key}
                    style={{
                      minWidth: isFirst ? undefined : col.width ? `${col.width}px` : '120px',
                      width: isFirst ? undefined : col.width ? `${col.width}px` : undefined
                    }}
                    className={`p-2.5 sm:p-3.5 border-b-2 border-r border-slate-300 dark:border-slate-700/60 uppercase tracking-wider text-[11px] sm:text-xs select-none transition-colors ${headerStyle} ${
                      isFirst
                        ? 'sticky left-0 top-0 z-30 shadow-[3px_0_10px_rgba(0,0,0,0.1)] dark:shadow-[3px_0_10px_rgba(0,0,0,0.6)] w-[44vw] max-w-[45vw] min-w-[130px] sm:w-[240px] sm:max-w-[280px] sm:min-w-[200px]'
                        : 'sticky top-0 z-20 shadow-xs'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center text-center'
                          : col.align === 'right'
                          ? 'justify-end text-right'
                          : 'justify-between'
                      }`}
                    >
                      <span className="leading-tight whitespace-normal break-words">{col.title}</span>
                    </div>
                  </th>
                );
              })}

              {/* Admin Actions Header Column */}
              {isAdmin && (
                <th className="sticky top-0 right-0 z-20 w-16 p-2 bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase select-none">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (isAdmin ? 1 : 0)}
                  className="p-8 text-center text-slate-500 italic bg-slate-50 dark:bg-slate-900/30"
                >
                  {filterText ? 'Ничего не найдено по данному фильтру' : 'В таблице пока нет данных'}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rowIndex) => {
                const rowStyle = getRowHighlightStyle(row.highlight);
                const stickyCellStyle = getRowStickyCellStyle(row.highlight);

                return (
                  <tr key={row.id || rowIndex} className={`group transition-colors ${rowStyle}`}>
                    {columns.map((col, colIndex) => {
                      const isFirst = colIndex === 0;
                      const cellVal = row.cells[col.key] !== undefined ? String(row.cells[col.key]) : '';
                      const cellKey = `${row.id}_${col.key}`;
                      const isCopied = copiedCell === cellKey;

                      // Highlight filtered search terms
                      const isMatchingFilter =
                        filterText.trim() &&
                        cellVal.toLowerCase().includes(filterText.toLowerCase());

                      return (
                        <td
                          key={col.id || col.key}
                          style={{
                            minWidth: isFirst ? undefined : col.width ? `${col.width}px` : '120px',
                            width: isFirst ? undefined : col.width ? `${col.width}px` : undefined
                          }}
                          className={`p-2 sm:p-2.5 border-r border-slate-200 dark:border-slate-800/60 transition-colors ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right font-mono'
                              : 'text-left'
                          } ${
                            isFirst
                              ? `sticky left-0 z-10 shadow-[3px_0_10px_rgba(0,0,0,0.06)] dark:shadow-[3px_0_10px_rgba(0,0,0,0.5)] ${stickyCellStyle} w-[44vw] max-w-[45vw] min-w-[130px] sm:w-[240px] sm:max-w-[280px] sm:min-w-[200px]`
                              : ''
                          }`}
                        >
                          {isAdmin ? (
                            /* Admin Inline Editable Cell */
                            <div className="relative flex items-center group/cell w-full">
                              {isFirst ? (
                                <textarea
                                  rows={Math.max(1, Math.min(3, Math.ceil(cellVal.length / 18)))}
                                  value={cellVal}
                                  onChange={(e) => {
                                    if (onUpdateCell) {
                                      onUpdateCell(row.id, col.key, e.target.value);
                                    }
                                  }}
                                  className="w-full bg-slate-50 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-950 focus:bg-white dark:focus:bg-slate-950 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-cyan-500 rounded px-1.5 py-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors whitespace-normal break-words resize-none"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={cellVal}
                                  onChange={(e) => {
                                    if (onUpdateCell) {
                                      onUpdateCell(row.id, col.key, e.target.value);
                                    }
                                  }}
                                  className={`w-full bg-slate-50 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-950 focus:bg-white dark:focus:bg-slate-950 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-cyan-500 rounded px-1.5 py-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors ${
                                    col.align === 'center'
                                      ? 'text-center'
                                      : col.align === 'right'
                                      ? 'text-right font-mono'
                                      : 'text-left'
                                  }`}
                                />
                              )}
                            </div>
                          ) : (
                            /* Public Seller View: 1-Click Copy Cell with responsive wrap */
                            <button
                              onClick={() => handleCopyCell(cellVal, cellKey)}
                              title="Нажмите, чтобы скопировать"
                              className={`w-full group/btn text-left flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${
                                col.align === 'center'
                                  ? 'justify-center text-center'
                                  : col.align === 'right'
                                  ? 'justify-end text-right'
                                  : ''
                              }`}
                            >
                              <span
                                className={`whitespace-normal break-words leading-snug text-xs sm:text-sm ${
                                  isFirst ? 'font-semibold' : ''
                                } ${
                                  isMatchingFilter ? 'bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 px-1 rounded' : ''
                                }`}
                              >
                                {cellVal || '—'}
                              </span>

                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-in zoom-in" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-60 text-slate-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Admin Row Actions Menu */}
                    {isAdmin && (
                      <td className="p-1.5 text-center bg-slate-50 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-center gap-1">
                          {/* Color Highlight Picker */}
                          <div className="relative group/color">
                            <button
                              onClick={() =>
                                setActiveRowMenu(activeRowMenu === row.id ? null : row.id)
                              }
                              title="Выделить строку цветом"
                              className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              <Palette className="w-3 h-3" />
                            </button>

                            {/* Dropdown color palette */}
                            {activeRowMenu === row.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl flex items-center gap-1 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => {
                                    onUpdateRowHighlight?.(row.id, 'none');
                                    setActiveRowMenu(null);
                                  }}
                                  title="Обычный"
                                  className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-500 hover:scale-110"
                                />
                                <button
                                  onClick={() => {
                                    onUpdateRowHighlight?.(row.id, 'yellow');
                                    setActiveRowMenu(null);
                                  }}
                                  title="Желтый (Внимание)"
                                  className="w-5 h-5 rounded-full bg-amber-400 border border-amber-300 hover:scale-110"
                                />
                                <button
                                  onClick={() => {
                                    onUpdateRowHighlight?.(row.id, 'red');
                                    setActiveRowMenu(null);
                                  }}
                                  title="Красный (Спец / Акция)"
                                  className="w-5 h-5 rounded-full bg-rose-500 border border-rose-400 hover:scale-110"
                                />
                                <button
                                  onClick={() => {
                                    onUpdateRowHighlight?.(row.id, 'green');
                                    setActiveRowMenu(null);
                                  }}
                                  title="Зеленый (Выгодно)"
                                  className="w-5 h-5 rounded-full bg-emerald-500 border border-emerald-400 hover:scale-110"
                                />
                              </div>
                            )}
                          </div>

                          {/* Duplicate Row */}
                          {onDuplicateRow && (
                            <button
                              onClick={() => onDuplicateRow(row.id)}
                              title="Дублировать строку"
                              className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              <CopyPlus className="w-3 h-3" />
                            </button>
                          )}

                          {/* Move Row Up/Down */}
                          {onMoveRow && (
                            <>
                              <button
                                onClick={() => onMoveRow(row.id, 'up')}
                                title="Вверх"
                                className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onMoveRow(row.id, 'down')}
                                title="Вниз"
                                className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          {/* Delete Row */}
                          {onDeleteRow && (
                            <button
                              onClick={() => onDeleteRow(row.id)}
                              title="Удалить строку"
                              className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Bottom Row Actions */}
      {isAdmin && onAddRow && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить новую строку в таблицу</span>
          </button>

          {onOpenColumnEditor && (
            <button
              onClick={onOpenColumnEditor}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Редактор столбцов</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
