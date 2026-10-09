import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Apple,
  Share2,
  PlusSquare,
  MoreVertical,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const InstallGuideSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'iphone' | 'android' | 'pc' | 'mac'>('iphone');

  return (
    <section className="w-full mt-6 sm:mt-8 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-2xl p-4 sm:p-6 backdrop-blur-xl transition-colors">
      {/* Header Banner Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Как добавить памятку на экран телефона (iPhone / Android) и ПК</span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 uppercase">
                PWA / 1 клик
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Работает как мобильное приложение: открывается во весь экран без адресной строки
            </p>
          </div>
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-800 dark:text-cyan-400 text-xs font-bold transition-colors shrink-0 shadow-xs"
        >
          <span>{isExpanded ? 'Свернуть' : 'Инструкция'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content with Tabs */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Platform Tab Buttons */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActivePlatform('iphone')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlatform === 'iphone'
                  ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>iPhone / iPad (Safari)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('android')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlatform === 'android'
                  ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android (Chrome / Яндекс)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('pc')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlatform === 'pc'
                  ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Компьютер Windows / Chrome</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('mac')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlatform === 'mac'
                  ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Mac (Safari / Chrome)</span>
            </button>
          </div>

          {/* Platform Specific Guides */}
          {activePlatform === 'iphone' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Откройте в Safari</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Перейдите по ссылке на сайт памятки через браузер <strong>Safari</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Нажмите «Поделиться»</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  В нижней панели нажмите иконку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PlusSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>«На экран "Домой"»</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Прокрутите список и нажмите <strong>«На экран "Домой"»</strong> ➔ <strong>«Добавить»</strong>.
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'android' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">В Chrome / Яндекс</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Откройте ссылку на памятку в браузере <strong>Google Chrome</strong> или <strong>Яндекс</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MoreVertical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Меню «три точки»</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  В правом верхнем углу браузера нажмите <strong>три точки меню</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>«Добавить на главный экран»</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Выберите пункт <strong>«Добавить на главный экран»</strong> или <strong>«Установить»</strong>.
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'pc' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">В адресной строке</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Справа в строке адреса нажмите значок <strong>«Установить приложение»</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Через меню Chrome</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Меню ➔ <strong>«Трансляция, сохранение и отправка»</strong> ➔ <strong>«Установить Памятку»</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ярлык на рабочем столе</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Сайт откроется как программа без рамок браузера и будет доступен в меню «Пуск».
                </p>
              </div>
            </div>
          )}

          {activePlatform === 'mac' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  Safari Mac
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">«Файл» ➔ «Добавить в Dock»</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  В верхнем меню Safari выберите <strong>Файл</strong> ➔ <strong>«Добавить в Dock...»</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-800 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                  Chrome Mac
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Иконка установки</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Нажмите на значок установки в адресной строке Chrome или Меню ➔ «Установить приложение».
                </p>
              </div>
            </div>
          )}

          {/* Quick Perks */}
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between text-xs text-cyan-900 dark:text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>
                <strong>Преимущества:</strong> Быстрый запуск в 1 тап, полный экран, работает даже при плохом мобильном интернете!
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
