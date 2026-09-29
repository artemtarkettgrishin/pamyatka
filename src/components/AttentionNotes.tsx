import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  Edit2,
  MoveVertical
} from 'lucide-react';
import { NoteBlock, NoteType } from '../types';

interface AttentionNotesProps {
  notes: NoteBlock[];
  position: 'top' | 'bottom';
  isAdmin: boolean;
  onAddNote?: (position: 'top' | 'bottom') => void;
  onEditNote?: (note: NoteBlock) => void;
  onDeleteNote?: (noteId: string) => void;
  onTogglePosition?: (noteId: string) => void;
}

export const AttentionNotes: React.FC<AttentionNotesProps> = ({
  notes,
  position,
  isAdmin,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePosition
}) => {
  const filteredNotes = notes.filter((n) => n.position === position);

  if (filteredNotes.length === 0 && !isAdmin) {
    return null;
  }

  const getNoteStyles = (type: NoteType) => {
    switch (type) {
      case 'danger':
        return {
          wrapper: 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/80 text-rose-950 dark:text-rose-100 shadow-xs',
          title: 'text-rose-900 dark:text-rose-200 font-black',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        };
      case 'warning':
        return {
          wrapper: 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500/80 text-amber-950 dark:text-amber-100 shadow-xs',
          title: 'text-amber-900 dark:text-amber-300 font-black',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        };
      case 'success':
        return {
          wrapper: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/80 text-emerald-950 dark:text-emerald-100 shadow-xs',
          title: 'text-emerald-900 dark:text-emerald-300 font-black',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        };
      case 'accent':
      case 'purple':
        return {
          wrapper: 'bg-purple-50 dark:bg-purple-950/80 border-purple-300 dark:border-purple-500/80 text-purple-950 dark:text-purple-100 shadow-xs',
          title: 'text-purple-900 dark:text-purple-300 font-black',
          icon: <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        };
      case 'info':
      default:
        return {
          wrapper: 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-500/80 text-cyan-950 dark:text-cyan-100 shadow-xs',
          title: 'text-cyan-900 dark:text-cyan-300 font-black',
          icon: <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        };
    }
  };

  return (
    <div className="flex flex-col gap-2.5 my-2">
      {filteredNotes.map((note) => {
        const style = getNoteStyles(note.type);
        return (
          <div
            key={note.id}
            className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 backdrop-blur-md transition-all ${style.wrapper}`}
          >
            {style.icon}
            <div className="flex-1 min-w-0">
              {note.title && (
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm sm:text-base tracking-tight ${style.title}`}>
                    {note.title}
                  </h4>
                </div>
              )}
              <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                {note.content}
              </p>
            </div>

            {isAdmin && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
                {onTogglePosition && (
                  <button
                    onClick={() => onTogglePosition(note.id)}
                    title={note.position === 'top' ? 'Переместить вниз' : 'Переместить вверх'}
                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MoveVertical className="w-3.5 h-3.5" />
                  </button>
                )}
                {onEditNote && (
                  <button
                    onClick={() => onEditNote(note)}
                    title="Редактировать пометку"
                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteNote && (
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    title="Удалить пометку"
                    className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isAdmin && onAddNote && (
        <button
          onClick={() => onAddNote(position)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Добавить блок внимания ({position === 'top' ? 'сверху' : 'снизу'})</span>
        </button>
      )}
    </div>
  );
};
