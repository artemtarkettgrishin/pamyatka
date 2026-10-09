import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { NoteBlock, NoteType } from '../../types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote: NoteBlock | null;
  defaultPosition: 'top' | 'bottom';
  onSaveNote: (note: NoteBlock) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  editingNote,
  defaultPosition,
  onSaveNote
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('warning');
  const [position, setPosition] = useState<'top' | 'bottom'>(defaultPosition);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setType(editingNote.type || 'warning');
      setPosition(editingNote.position || defaultPosition);
    } else {
      setTitle('');
      setContent('');
      setType('warning');
      setPosition(defaultPosition);
    }
  }, [editingNote, defaultPosition, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSaveNote({
      id: editingNote ? editingNote.id : `note_${crypto.randomUUID()}`,
      title: title.trim() || undefined,
      content: content.trim(),
      type: type,
      position: position
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-600/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingNote ? 'Редактировать блок внимания' : 'Новый блок внимания'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Пометки над или под таблицей</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Position Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Расположение на странице
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPosition('top')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  position === 'top'
                    ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-900 dark:text-cyan-300 ring-1 ring-cyan-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                ▲ Сверху над таблицей
              </button>
              <button
                type="button"
                onClick={() => setPosition('bottom')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  position === 'bottom'
                    ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-900 dark:text-cyan-300 ring-1 ring-cyan-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                ▼ Снизу под таблицей
              </button>
            </div>
          </div>

          {/* Type / Color Style */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Тип и оформление блока
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('danger')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'danger'
                    ? 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Красный</span>
              </button>

              <button
                type="button"
                onClick={() => setType('warning')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-950 dark:text-amber-200 ring-1 ring-amber-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Желтый</span>
              </button>

              <button
                type="button"
                onClick={() => setType('info')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'info'
                    ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-900 dark:text-cyan-200 ring-1 ring-cyan-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Синий</span>
              </button>

              <button
                type="button"
                onClick={() => setType('success')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  type === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Зеленый</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Заголовок (необязательно)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: УСЛОВИЯ ПРОДАЖИ С НДС, МРЦ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Текст сообщения *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              placeholder="Текст памятки или предупреждения..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-sm text-slate-900 dark:text-white outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
