import React, { useState } from 'react';
import { Calculator, X, Layers, Scissors } from 'lucide-react';

interface SellerCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellerCalculatorModal: React.FC<SellerCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'cut'>('packs');

  // Pack Calculator State
  const [roomArea, setRoomArea] = useState<number>(25);
  const [reservePercent, setReservePercent] = useState<number>(7);
  const [packSize, setPackSize] = useState<number>(2.13);
  const [pricePerSqM, setPricePerSqM] = useState<number>(1490);

  // Roll Cut Calculator State
  const [rollWidth, setRollWidth] = useState<number>(3.5);
  const [rollLength, setRollLength] = useState<number>(4.8);
  const [cutPricePerM2, setCutPricePerM2] = useState<number>(679);
  const [optPricePerM2, setOptPricePerM2] = useState<number>(382);

  if (!isOpen) return null;

  // Pack calculations
  const totalNeededArea = roomArea * (1 + reservePercent / 100);
  const totalPacks = packSize > 0 ? Math.ceil(totalNeededArea / packSize) : 0;
  const effectiveArea = totalPacks * packSize;
  const totalPackCost = effectiveArea * pricePerSqM;
  const remnantsArea = Math.max(0, effectiveArea - roomArea);

  // Roll Cut calculations
  const cutTotalArea = rollWidth * rollLength;
  const cutRetailTotal = cutTotalArea * cutPricePerM2;
  const cutOptTotal = cutTotalArea * optPricePerM2;
  const cutProfit = cutRetailTotal - cutOptTotal;
  const cutMarginPercent = cutRetailTotal > 0 ? (cutProfit / cutRetailTotal) * 100 : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Калькулятор продавца
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Быстрый расчет целых упаковок и нарезки рулонов
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('packs')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'packs'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Упаковки (м²)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cut')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cut'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Нарезка рулона</span>
          </button>
        </div>

        {/* Tab 1: Packs Calculator */}
        {activeTab === 'packs' && (
          <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[60vh] scrollbar-thin bg-white dark:bg-slate-900">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Площадь комнаты (м²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={roomArea || ''}
                  onChange={(e) => setRoomArea(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Запас на подрезку (%)
                </label>
                <div className="flex gap-1">
                  {[5, 7, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setReservePercent(pct)}
                      className={`flex-1 py-2 text-xs rounded-lg font-bold border transition-colors ${
                        reservePercent === pct
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  В одной пачке (м²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={packSize || ''}
                  onChange={(e) => setPackSize(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Цена за м² (₽)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={pricePerSqM || ''}
                  onChange={(e) => setPricePerSqM(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Result Card */}
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-slate-950 border border-cyan-200 dark:border-cyan-900 shadow-inner flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-2 border-b border-cyan-200 dark:border-slate-800">
                <span>Количество целых пачек:</span>
                <span className="text-xl font-black text-cyan-800 dark:text-cyan-300 font-mono">
                  {totalPacks} уп.
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>Итоговая площадь к покупке:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{effectiveArea.toFixed(2)} м²</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Остаток / Запас сверх чистой:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">+{remnantsArea.toFixed(2)} м²</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cyan-200 dark:border-cyan-900/60">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Итоговая стоимость:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {Math.round(totalPackCost).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Roll Cut Calculator */}
        {activeTab === 'cut' && (
          <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[60vh] scrollbar-thin bg-white dark:bg-slate-900">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Ширина рулона (м)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={rollWidth || ''}
                  onChange={(e) => setRollWidth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Длина отреза (пог.м)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={rollLength || ''}
                  onChange={(e) => setRollLength(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Цена розница за м² (₽)
                </label>
                <input
                  type="number"
                  step="1"
                  value={cutPricePerM2 || ''}
                  onChange={(e) => setCutPricePerM2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Оптовая цена за м² (₽)
                </label>
                <input
                  type="number"
                  step="1"
                  value={optPricePerM2 || ''}
                  onChange={(e) => setOptPricePerM2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Cut Result */}
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-slate-950 border border-cyan-200 dark:border-cyan-900 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-2 border-b border-cyan-200 dark:border-slate-800">
                <span>Общая площадь отреза:</span>
                <span className="text-base font-black text-cyan-800 dark:text-cyan-300 font-mono">
                  {cutTotalArea.toFixed(2)} м²
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>Себестоимость (Опт):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {Math.round(cutOptTotal).toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span>Маржинальная прибыль магазина:</span>
                <span className="font-mono font-bold">
                  +{Math.round(cutProfit).toLocaleString('ru-RU')} ₽ ({cutMarginPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cyan-200 dark:border-cyan-900/60">
                <span className="text-sm font-bold text-slate-900 dark:text-white">К оплате покупателем:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {Math.round(cutRetailTotal).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
