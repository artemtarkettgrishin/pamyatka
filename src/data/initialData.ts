import { AppData, CategoryItem, ChangelogItem } from '../types';

export const INITIAL_CHANGELOG: ChangelogItem[] = [
  {
    id: 'log-1',
    date: '19.05.2026',
    category: 'Ламинат',
    text: 'Anglettere для розницы Tarkett store / Новинка Kronospan Woodstyle omega',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-2',
    date: '19.05.2026',
    category: 'Сопутствующие товары',
    text: 'Гель для герметизации замков Rico Protect Click 125 мл / Холодная сварка Homakoll S401 60мл',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-3',
    date: '13.05.2026',
    category: 'Ламинат',
    text: 'НУЖНО ПРОВЕРИТЬ ПОЛНОСТЬЮ НА ВСЕХ САЙТАХ АКТУАЛЬНОСТЬ ДЕКОРОВ!!!! ВСЕХ КОЛЛЕКЦИЙ!!!',
    importance: 'critical',
    author: 'Руководитель'
  },
  {
    id: 'log-4',
    date: '13.05.2026',
    category: 'Ламинат',
    text: 'Обновлены оптовые прайсы Anglettere 33 класс 8мм',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-5',
    date: '08.05.2026',
    category: 'Линолеум',
    text: 'Добавлена новая коллекция Motive (полукоммерция) Tarkett',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-6',
    date: '04.05.2026',
    category: 'Сопутствующие товары',
    text: 'Пороги, Плинтус NMC, МДФ плинтус, Плинтус СОЛИД, Плинтус ЛУКА и все аксессуары к описанным плинтусам, Прочее от Мастер-Профиль',
    importance: 'high',
    author: 'Администратор'
  },
  {
    id: 'log-7',
    date: '04.05.2026',
    category: 'Ламинат',
    text: 'Обновление цен на коллекцию Kronospan Castello Classic',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-8',
    date: '01.05.2026',
    category: 'Линолеум',
    text: 'РАСПРОДАЖА! Нужно полностью проверить распродажу и спец-остатки',
    importance: 'critical',
    author: 'Руководитель'
  },
  {
    id: 'log-9',
    date: '28.04.2026',
    category: 'Ламинат',
    text: 'FloorWood — обновлены декоры и складские остатки',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-10',
    date: '28.04.2026',
    category: 'Сопутствующие товары',
    text: 'Исправлена опечатка цена сайтов и спец-опт Homakoll 777/798, Homakoll 208 и 228 выравняла цены',
    importance: 'high',
    author: 'Администратор'
  },
  {
    id: 'log-11',
    date: '28.04.2026',
    category: 'Ламинат',
    text: 'La Moena Bellamonte исправлена опечатка в цене розница',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-12',
    date: '26.04.2026',
    category: 'Ламинат',
    text: 'La Moena, Dongjia, Kastamonu Prime, Royce, AGT, Woodstyle Egger — синхронизация цен',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-13',
    date: '26.04.2026',
    category: 'Ламинат',
    text: 'Новинки: Bonkeel Prime / Woodstyle Pronto 4V / Egger pro 2026',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-14',
    date: '26.04.2026',
    category: 'Ламинат',
    text: 'Вывод: Woodstyle pronto без фаски / Egger pro 2023',
    importance: 'high',
    author: 'Администратор'
  },
  {
    id: 'log-15',
    date: '26.04.2026',
    category: 'Виниловые полы',
    text: 'Добавлены декоры Blackwood LVT клеевой',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-16',
    date: '26.04.2026',
    category: 'Сопутствующие товары',
    text: 'Новая подложка Bonkeel, Цена спец-опт Lexida, Homakoll (клей, сварка и медная лента)',
    importance: 'high',
    author: 'Администратор'
  },
  {
    id: 'log-17',
    date: '21.04.2026',
    category: 'Ламинат',
    text: 'Изменение цен на сайтах: Kronostar Dovod / SYNCHROPOLIS',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-18',
    date: '21.04.2026',
    category: 'Виниловые полы',
    text: 'Изменение цен на сайтах: Bass House SPC замковый',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-19',
    date: '21.04.2026',
    category: 'Ковровые покрытия',
    text: 'Изменены цены на рулонную нарезку Нева Тафт',
    importance: 'normal',
    author: 'Администратор'
  },
  {
    id: 'log-20',
    date: '17.04.2026',
    category: 'Услуги',
    text: 'Изменение цен в услугах укладки и доставки по городу',
    importance: 'high',
    author: 'Администратор'
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  // =================== 1. ОБНОВЛЕНИЯ ===================
  {
    id: 'cat_updates',
    title: 'Обновления',
    slug: 'updates',
    type: 'changelog',
    parentId: null,
    order: 1,
    color: 'emerald',
    icon: 'bell'
  },

  // =================== 2. ЛИНОЛЕУМ ===================
  {
    id: 'cat_linoleum',
    title: 'Линолеум',
    slug: 'linoleum',
    type: 'group',
    parentId: null,
    order: 2,
    color: 'cyan',
    icon: 'layers',
    startPageId: 'page_lino_ostin'
  },
  // Линолеум / Спец разделы
  {
    id: 'page_lino_sale',
    title: 'Распродажа',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 1,
    badge: 'СКИДКИ ДО -40%',
    color: 'red',
    icon: 'percent',
    columns: [
      { id: 'c1', title: 'Наименование / Артикул', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Ширина (м)', key: 'width', width: 110, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Остаток (пог.м)', key: 'stock', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Старая цена розн.', key: 'oldPrice', width: 140, headerColor: 'slate', align: 'right' },
      { id: 'c5', title: 'Цена РАСПРОДАЖА', key: 'salePrice', width: 150, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Склад хранения', key: 'warehouse', width: 150, headerColor: 'cyan', align: 'center' },
      { id: 'c7', title: 'Примечания', key: 'notes', width: 180, headerColor: 'slate', align: 'left' }
    ],
    rows: [
      {
        id: 'r_ls1',
        highlight: 'red',
        cells: {
          name: 'Tarkett Force Canasta 3',
          width: '3.0 м',
          stock: '14.5 м',
          oldPrice: '990 ₽',
          salePrice: '680 ₽',
          warehouse: 'Литвинова',
          notes: 'Последний рулон, целый'
        }
      },
      {
        id: 'r_ls2',
        highlight: 'yellow',
        cells: {
          name: 'Sinteros Bonus Vegas 2',
          width: '3.5 м',
          stock: '8.2 м',
          oldPrice: '620 ₽',
          salePrice: '450 ₽',
          warehouse: 'Автомолл',
          notes: 'Отрез без дефектов'
        }
      },
      {
        id: 'r_ls3',
        highlight: 'red',
        cells: {
          name: 'Juteks Forum Forest 1',
          width: '2.5 м',
          stock: '21.0 м',
          oldPrice: '850 ₽',
          salePrice: '590 ₽',
          warehouse: 'Базарная',
          notes: 'Спец-цена при заборе всего куска'
        }
      },
      {
        id: 'r_ls4',
        highlight: 'none',
        cells: {
          name: 'Tarkett Grand Aston 1',
          width: '4.0 м',
          stock: '6.4 м',
          oldPrice: '1150 ₽',
          salePrice: '790 ₽',
          warehouse: 'Герц',
          notes: 'Витринный отрез'
        }
      }
    ],
    notes: [
      {
        id: 'n_ls1',
        type: 'danger',
        position: 'top',
        title: 'УСЛОВИЯ РАСПРОДАЖИ ЛИНОЛЕУМА',
        content: 'Товары из раздела распродажи отпускаются без возврата. Перед оформлением брони обязательно уточнять физический метраж у кладовщика!'
      }
    ]
  },
  {
    id: 'page_lino_month',
    title: 'Товары месяца',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 2,
    badge: 'ХИТ ПРОДАЖ',
    color: 'amber',
    icon: 'star',
    columns: [
      { id: 'c1', title: 'Наименование коллекции', key: 'name', width: 230, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Доступные ширины', key: 'widths', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Толщина / Защита', key: 'thickness', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Розница (м²)', key: 'priceRetail', width: 130, headerColor: 'amber', align: 'right' },
      { id: 'c5', title: 'Отрез Строй52', key: 'priceCut', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c6', title: 'Рулон ОПТ', key: 'priceRoll', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c7', title: 'Бонус продавца', key: 'bonus', width: 130, headerColor: 'emerald', align: 'center' }
    ],
    rows: [
      {
        id: 'r_lm1',
        highlight: 'yellow',
        cells: {
          name: 'Sinteros Ostin (Все декоры)',
          widths: '1.5 / 2 / 2.5 / 3 / 3.5 / 4 м',
          thickness: '2.5 мм / 0.15 мм',
          priceRetail: '679 ₽',
          priceCut: '382 ₽',
          priceRoll: '345 ₽',
          bonus: '+25 ₽ / м²'
        }
      },
      {
        id: 'r_lm2',
        highlight: 'yellow',
        cells: {
          name: 'Tarkett Идиллия Нова Танго 4',
          widths: '2.5 / 3 / 3.5 / 4 м',
          thickness: '3.7 мм / 0.50 мм',
          priceRetail: '1 290 ₽',
          priceCut: '890 ₽',
          priceRoll: '795 ₽',
          bonus: '+40 ₽ / м²'
        }
      },
      {
        id: 'r_lm3',
        highlight: 'none',
        cells: {
          name: 'Tarkett Фаворит Стобо 1',
          widths: '3.0 / 3.5 / 4 м',
          thickness: '3.3 мм / 0.30 мм',
          priceRetail: '1 050 ₽',
          priceCut: '720 ₽',
          priceRoll: '640 ₽',
          bonus: '+30 ₽ / м²'
        }
      }
    ],
    notes: [
      {
        id: 'n_lm1',
        type: 'warning',
        position: 'top',
        title: 'Мотивационная программа Май 2026',
        content: 'За каждый проданный квадратный метр товаров месяца начисляется повышенная премия. Выплата в конце отчетного периода.'
      }
    ]
  },
  // Линолеум / Коллекции Sinteros (как на скриншоте 1)
  {
    id: 'page_lino_ostin',
    title: 'Sinteros Ostin',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 3,
    statusBadge: '🟢 Все ширины',
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Цена розница Автомолл, Базарная, Герц, Ковров', key: 'priceRetail1', width: 170, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Цена розница Литвинова, Моторный, сайт Tarkett Store', key: 'priceRetail2', width: 180, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Цена отрез Строй52', key: 'priceCutStroy', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c5', title: 'Цена отрез Линолеум52', key: 'priceCutLino', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c6', title: 'Цена рулон Строй52', key: 'priceRollStroy', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c7', title: 'Цена рулон Линолеум52', key: 'priceRollLino', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c8', title: 'Цена рулон Tarkett Store', key: 'priceRollStore', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c9', title: 'СПЕЦ-ОПТ Нарезка', key: 'specOpt', width: 130, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_o1', highlight: 'none', cells: { name: 'Ostin 3 1,5m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '382', priceCutLino: '382', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '382' } },
      { id: 'r_o2', highlight: 'none', cells: { name: 'Ostin 3 2,5m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '385', priceCutLino: '385', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '385' } },
      { id: 'r_o3', highlight: 'none', cells: { name: 'Ostin 3 3,5m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '413', priceCutLino: '413', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '413' } },
      { id: 'r_o4', highlight: 'none', cells: { name: 'Ostin 6 1,5m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '372', priceCutLino: '372', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '443' } },
      { id: 'r_o5', highlight: 'none', cells: { name: 'Ostin 6 2m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '372', priceCutLino: '372', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '443' } },
      { id: 'r_o6', highlight: 'none', cells: { name: 'Ostin 6 2,5m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '433', priceCutLino: '433', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '479' } },
      { id: 'r_o7', highlight: 'none', cells: { name: 'Ostin 6 3m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '412', priceCutLino: '412', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '443' } },
      { id: 'r_o8', highlight: 'none', cells: { name: 'Ostin 6 3,5m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '412', priceCutLino: '412', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '443' } },
      { id: 'r_o9', highlight: 'none', cells: { name: 'Ostin 6 4m', priceRetail1: '679', priceRetail2: '679', priceCutStroy: '412', priceCutLino: '412', priceRollStroy: 'нет', priceRollLino: 'нет', priceRollStore: 'нет', specOpt: '443' } }
    ],
    notes: [
      {
        id: 'n_o1',
        type: 'info',
        position: 'top',
        title: 'Особенности коллекции Sinteros Ostin',
        content: 'Бытовой линолеум на вспененной основе. Толщина покрытия 2.5 мм, защитный слой 0.15 мм. Идеален для спален и гостиных комнат.'
      }
    ]
  },
  // Уровень 4: Декор Ostin 3 (внутри Ostin)
  {
    id: 'page_lino_ostin_3',
    title: 'Декор Ostin 3 (Паркет)',
    type: 'page',
    parentId: 'page_lino_ostin',
    order: 1,
    statusBadge: '🟢 В наличии',
    columns: [
      { id: 'c1', title: 'Ширина рулона', key: 'width', width: 180, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Остаток пог.м (Автомолл)', key: 'stock1', width: 160, headerColor: 'emerald', align: 'center' },
      { id: 'c3', title: 'Остаток пог.м (Литвинова)', key: 'stock2', width: 160, headerColor: 'emerald', align: 'center' },
      { id: 'c4', title: 'Цена Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_o3_1', cells: { width: 'Ostin 3 (1.5 м)', stock1: '32.5 пог.м', stock2: '18.0 пог.м', retail: '679 ₽', specOpt: '382 ₽' } },
      { id: 'r_o3_2', cells: { width: 'Ostin 3 (2.5 м)', stock1: '45.0 пог.м', stock2: '28.4 пог.м', retail: '679 ₽', specOpt: '385 ₽' } },
      { id: 'r_o3_3', cells: { width: 'Ostin 3 (3.5 м)', stock1: '21.2 пог.м', stock2: '35.0 пог.м', retail: '679 ₽', specOpt: '413 ₽' } }
    ]
  },
  // Уровень 4: Декор Ostin 6 (внутри Ostin)
  {
    id: 'page_lino_ostin_6',
    title: 'Декор Ostin 6 (Дворцовый)',
    type: 'page',
    parentId: 'page_lino_ostin',
    order: 2,
    statusBadge: '🟢 В наличии',
    columns: [
      { id: 'c1', title: 'Ширина рулона', key: 'width', width: 180, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Остаток пог.м (Автомолл)', key: 'stock1', width: 160, headerColor: 'emerald', align: 'center' },
      { id: 'c3', title: 'Остаток пог.м (Литвинова)', key: 'stock2', width: 160, headerColor: 'emerald', align: 'center' },
      { id: 'c4', title: 'Цена Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_o6_1', cells: { width: 'Ostin 6 (2.0 м)', stock1: '54.0 пог.м', stock2: '40.0 пог.м', retail: '679 ₽', specOpt: '372 ₽' } },
      { id: 'r_o6_2', cells: { width: 'Ostin 6 (3.0 м)', stock1: '68.0 пог.м', stock2: '55.0 пог.м', retail: '679 ₽', specOpt: '412 ₽' } },
      { id: 'r_o6_3', cells: { width: 'Ostin 6 (4.0 м)', stock1: '82.0 пог.м', stock2: '60.0 пог.м', retail: '679 ₽', specOpt: '412 ₽' } }
    ]
  },
  {
    id: 'page_lino_sparta',
    title: 'Sinteros Sparta',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 4,
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Отрез Строй52', key: 'cutStroy', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Отрез Линолеум52', key: 'cutLino', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_sp1', cells: { name: 'Sparta 1 (1.5 / 2.0 / 2.5 м)', retail: '599', cutStroy: '345', cutLino: '345', specOpt: '320' } },
      { id: 'r_sp2', cells: { name: 'Sparta 2 (3.0 / 3.5 / 4.0 м)', retail: '599', cutStroy: '360', cutLino: '360', specOpt: '335' } }
    ]
  },
  {
    id: 'page_lino_delta',
    title: 'Sinteros Delta',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 5,
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Отрез', key: 'cut', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_d1', cells: { name: 'Delta 1 2.0m - 4.0m', retail: '540', cut: '310', specOpt: '290' } }
    ]
  },
  {
    id: 'page_lino_vesna',
    title: 'Sinteros Весна',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 6,
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Отрез', key: 'cut', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_v1', cells: { name: 'Весна 1 (все ширины)', retail: '510', cut: '295', specOpt: '275' } }
    ]
  },
  {
    id: 'page_lino_eruption',
    title: 'Sinteros Eruption',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 7,
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Отрез', key: 'cut', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_er1', cells: { name: 'Eruption 1 (2.5 / 3.0 / 3.5 / 4.0 м)', retail: '640', cut: '390', specOpt: '360' } }
    ]
  },
  {
    id: 'page_lino_bonus',
    title: 'Sinteros Bonus',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 8,
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Отрез', key: 'cut', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_b1', cells: { name: 'Bonus Vegas 1', retail: '620', cut: '380', specOpt: '350' } },
      { id: 'r_b2', cells: { name: 'Bonus Vegas 2', retail: '620', cut: '380', specOpt: '350' } },
      { id: 'r_b3', cells: { name: 'Bonus Denver 1', retail: '620', cut: '380', specOpt: '350' } }
    ]
  },
  {
    id: 'page_lino_activa',
    title: 'Sinteros Activa',
    type: 'page',
    parentId: 'cat_linoleum',
    order: 9,
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Отрез', key: 'cut', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'center' }
    ],
    rows: [
      { id: 'r_act1', cells: { name: 'Activa 1 (полукоммерция)', retail: '780', cut: '490', specOpt: '445' } }
    ]
  },

  // =================== 3. ЛАМИНАТ ===================
  {
    id: 'cat_laminate',
    title: 'Ламинат',
    slug: 'laminate',
    type: 'group',
    parentId: null,
    order: 3,
    color: 'blue',
    icon: 'grid',
    startPageId: 'page_lam_timber'
  },
  {
    id: 'page_lam_sale',
    title: 'Распродажа ламината',
    type: 'page',
    parentId: 'cat_laminate',
    order: 1,
    badge: 'ЛИКВИДАЦИЯ',
    color: 'red',
    columns: [
      { id: 'c1', title: 'Коллекция / Декор', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Класс / Толщина', key: 'spec', width: 140, headerColor: 'blue', align: 'center' },
      { id: 'c3', title: 'Остаток пачек (м²)', key: 'stock', width: 160, headerColor: 'blue', align: 'center' },
      { id: 'c4', title: 'Обычная цена (м²)', key: 'oldPrice', width: 140, headerColor: 'slate', align: 'right' },
      { id: 'c5', title: 'Цена РАСПРОДАЖА', key: 'salePrice', width: 150, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Склад', key: 'warehouse', width: 130, headerColor: 'blue', align: 'center' }
    ],
    rows: [
      { id: 'r_lams1', highlight: 'red', cells: { name: 'Kronospan Castello Дуб Сибирь', spec: '32 кл / 8 мм', stock: '24 уп (51.1 м²)', oldPrice: '1 250 ₽', salePrice: '890 ₽', warehouse: 'Моторный' } },
      { id: 'r_lams2', highlight: 'yellow', cells: { name: 'Egger Pro Classic Дуб Кортина', spec: '33 кл / 8 мм', stock: '12 уп (23.8 м²)', oldPrice: '1 690 ₽', salePrice: '1 190 ₽', warehouse: 'Автомолл' } },
      { id: 'r_lams3', highlight: 'red', cells: { name: 'Tarkett Cinema Брижит', spec: '32 кл / 8 мм 4V', stock: '8 уп (16.0 м²)', oldPrice: '1 550 ₽', salePrice: '990 ₽', warehouse: 'Базарная' } }
    ],
    notes: [
      {
        id: 'n_ls_lam1',
        type: 'danger',
        position: 'top',
        title: 'Внимание по остаткам распродажи',
        content: 'Товар бронировать строго пачками. Вскрытые пачки и бой не подлежат возврату.'
      }
    ]
  },
  // Ламинат -> Timber by Tarkett (как на скриншоте 2!)
  {
    id: 'page_lam_timber',
    title: 'Timber by Tarkett',
    type: 'page',
    parentId: 'cat_laminate',
    order: 2,
    badge: 'МОНАРХ',
    startPageId: 'page_lam_harvest',
    columns: [
      { id: 'c1', title: 'Коллекция', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Цена розница Автомолл, Базарная, Герц, Ковров', key: 'retail1', width: 170, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Цена розница Литвинова, Моторный, сайт Tarkett Store', key: 'retail2', width: 180, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Цена отрез Строй52', key: 'cutStroy', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c5', title: 'Цена отрез Линолеум52', key: 'cutLino', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c6', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 120, headerColor: 'red', align: 'center' },
      { id: 'c7', title: 'Очередность заказа у Дилеров', key: 'dealerOrder', width: 200, headerColor: 'cyan', align: 'center' }
    ],
    rows: [
      { id: 'r_t1', highlight: 'none', cells: { name: 'HARVEST 8/33 4V', retail1: '1919', retail2: '1989', cutStroy: '1675', cutLino: '1675', specOpt: '1336', dealerOrder: 'Мн эксклюзив' } },
      { id: 'r_t2', highlight: 'none', cells: { name: 'LUMBER 8/32 4V', retail1: '1699', retail2: '1769', cutStroy: '1480', cutLino: '1480', specOpt: '1189', dealerOrder: 'Мн эксклюзив' } },
      { id: 'r_t3', highlight: 'none', cells: { name: 'FORESTER 10/33 4V', retail1: '2279', retail2: '2399', cutStroy: '1990', cutLino: '1990', specOpt: '1608', dealerOrder: 'Мн эксклюзив' } }
    ],
    notes: [
      {
        id: 'n_t1',
        type: 'danger',
        position: 'bottom',
        title: 'УСЛОВИЯ ПРОДАЖИ С НДС',
        content: 'При продаже с НДС прибавлять не надо.'
      },
      {
        id: 'n_t2',
        type: 'warning',
        position: 'bottom',
        title: 'ЦЕНОВАЯ ПОЛИТИКА ДИЛЕРА',
        content: 'На эксклюзивы Монарха действует МРЦ.'
      }
    ]
  },
  // Уровень 3: Коллекция Harvest 8/33 4V (внутри Timber by Tarkett)
  {
    id: 'page_lam_harvest',
    title: 'Harvest 8/33 4V',
    type: 'page',
    parentId: 'page_lam_timber',
    order: 1,
    badge: '33 КЛАСС',
    statusBadge: '🟢 В наличии',
    startPageId: 'page_lam_harvest_oristano',
    columns: [
      { id: 'c1', title: 'Параметр коллекции', key: 'param', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение / Характеристика', key: 'val', width: 260, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Цена Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c5', title: 'Дилер для заказа', key: 'dealer', width: 150, headerColor: 'amber', align: 'center' }
    ],
    rows: [
      { id: 'r_h1', highlight: 'none', cells: { param: 'Класс износостойкости', val: '33 класс (коммерческий, АС5)', retail: '1 919 ₽', specOpt: '1 336 ₽', dealer: 'Монарх' } },
      { id: 'r_h2', highlight: 'none', cells: { param: 'Толщина и фаска', val: '8.0 мм с 4-сторонней крашеной фаской 4V', retail: '1 919 ₽', specOpt: '1 336 ₽', dealer: 'Монарх' } },
      { id: 'r_h3', highlight: 'none', cells: { param: 'Замковая система', val: 'TC-Lock с восковой пропиткой Tech3S', retail: '1 919 ₽', specOpt: '1 336 ₽', dealer: 'Монарх' } },
      { id: 'r_h4', highlight: 'none', cells: { param: 'Упаковка (м² / шт)', val: '2.005 м² в пачке (8 планок 1292х194 мм)', retail: '1 919 ₽', specOpt: '1 336 ₽', dealer: 'Монарх' } }
    ],
    notes: [
      {
        id: 'n_h1',
        type: 'warning',
        position: 'top',
        title: 'Условия продажи коллекции Harvest',
        content: 'Коллекция Timber Harvest является эксклюзивом дилера Монарх. Отгружается строго кратно пачкам (по 2.005 м²).'
      }
    ]
  },
  // Уровень 4: Декор "Дуб Ористано" (внутри Harvest)
  {
    id: 'page_lam_harvest_oristano',
    title: 'Дуб Ористано',
    type: 'page',
    parentId: 'page_lam_harvest',
    order: 1,
    badge: 'ХИТ',
    statusBadge: '🟢 В наличии',
    columns: [
      { id: 'c1', title: 'Характеристика декора', key: 'spec', width: 230, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение', key: 'val', width: 220, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Остаток на складах', key: 'stock', width: 170, headerColor: 'emerald', align: 'center' },
      { id: 'c4', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Сопутствующий плинтус', key: 'skirting', width: 200, headerColor: 'amber', align: 'left' }
    ],
    rows: [
      { id: 'r_o1', highlight: 'green', cells: { spec: 'Артикул производителя', val: '504415024 (Harvest)', stock: '227 м² (113 уп)', retail: '1 919 ₽', specOpt: '1 336 ₽', skirting: 'Royce 58 декор 214 Дуб Натур' } },
      { id: 'r_o2', highlight: 'none', cells: { spec: 'Склад Автомолл', val: 'В наличии в зале', stock: '142.3 м² (71 уп)', retail: '1 919 ₽', specOpt: '1 336 ₽', skirting: 'Углы и заглушки в наличии' } },
      { id: 'r_o3', highlight: 'none', cells: { spec: 'Склад Литвинова', val: 'В наличии на складе', stock: '84.8 м² (42 уп)', retail: '1 919 ₽', specOpt: '1 336 ₽', skirting: 'Ideal Deconika декор 55' } },
      { id: 'r_o4', highlight: 'none', cells: { spec: 'Порог стыковочный в тон', val: 'Лука 014 Анодированный', stock: '24 шт (0.9м / 1.8м)', retail: '390 ₽', specOpt: '245 ₽', skirting: 'Крепеж скрытый' } },
      { id: 'r_o5', highlight: 'none', cells: { spec: 'Рекомендованная подложка', val: 'Bonkeel SPC/LVT 1.5мм', stock: 'В наличии рулоны', retail: '145 ₽', specOpt: '95 ₽', skirting: '—' } }
    ],
    notes: [
      {
        id: 'n_oristano1',
        type: 'success',
        position: 'top',
        title: 'Статус декора: 🟢 В НАЛИЧИИ НА СКЛАДЕ',
        content: 'Декор Дуб Ористано является лидером продаж. Постоянный складской запас поддерживается на Автомолле и Литвинова.'
      }
    ]
  },
  // Уровень 4: Декор "Дуб Портофино" (внутри Harvest)
  {
    id: 'page_lam_harvest_portofino',
    title: 'Дуб Портофино',
    type: 'page',
    parentId: 'page_lam_harvest',
    order: 2,
    badge: 'СВЕТЛЫЙ',
    statusBadge: '🟡 Под заказ 3-5 дн.',
    columns: [
      { id: 'c1', title: 'Характеристика декора', key: 'spec', width: 230, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение', key: 'val', width: 220, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Срок поставки', key: 'leadTime', width: 170, headerColor: 'amber', align: 'center' },
      { id: 'c4', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Сопутствующий плинтус', key: 'skirting', width: 200, headerColor: 'amber', align: 'left' }
    ],
    rows: [
      { id: 'r_p1', highlight: 'yellow', cells: { spec: 'Артикул производителя', val: '504415025 (Портофино)', leadTime: '3-5 рабочих дней', retail: '1 919 ₽', specOpt: '1 336 ₽', skirting: 'Royce 58 декор 118 Дуб Пепельный' } },
      { id: 'r_p2', highlight: 'none', cells: { spec: 'Условия заказа', val: 'Предоплата 50%', leadTime: 'Поставка вторник/пятница', retail: '1 919 ₽', specOpt: '1 336 ₽', skirting: 'Ideal Deconika декор 71' } }
    ],
    notes: [
      {
        id: 'n_portofino1',
        type: 'warning',
        position: 'top',
        title: 'Статус декора: 🟡 ПОД ЗАКАЗ 3-5 ДНЕЙ',
        content: 'Поставка осуществляется с центрального распределительного склада дилера Монарх.'
      }
    ]
  },
  // Уровень 4: Декор "Дуб Корсика" (внутри Harvest)
  {
    id: 'page_lam_harvest_corsica',
    title: 'Дуб Корсика',
    type: 'page',
    parentId: 'page_lam_harvest',
    order: 3,
    badge: 'РАСПРОДАЖА',
    statusBadge: '🔴 Вывод (остаток 32 м²)',
    columns: [
      { id: 'c1', title: 'Характеристика декора', key: 'spec', width: 230, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение', key: 'val', width: 220, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Остаток к выкупу', key: 'stock', width: 170, headerColor: 'red', align: 'center' },
      { id: 'c4', title: 'Старая цена', key: 'oldPrice', width: 120, headerColor: 'slate', align: 'right' },
      { id: 'c5', title: 'Цена РАСПРОДАЖА', key: 'salePrice', width: 140, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Сопутствующий плинтус', key: 'skirting', width: 200, headerColor: 'amber', align: 'left' }
    ],
    rows: [
      { id: 'r_c1', highlight: 'red', cells: { spec: 'Артикул 504415028 (Корсика)', val: '33 класс / 8мм 4V фаска', stock: '32.08 м² (16 упаковок)', oldPrice: '1 919 ₽', salePrice: '1 490 ₽', skirting: 'Ideal Deconika декор 72' } },
      { id: 'r_c2', highlight: 'none', cells: { spec: 'Место хранения', val: 'Склад Литвинова (целые пачки)', stock: 'Только одним лотом', oldPrice: '—', salePrice: 'СПЕЦ-ОПТ 1 150 ₽', skirting: 'Порог Лука 028' } }
    ],
    notes: [
      {
        id: 'n_corsica1',
        type: 'danger',
        position: 'top',
        title: 'Статус декора: 🔴 ВЫВОДИТСЯ ИЗ АССОРТИМЕНТА',
        content: 'Декор выводится фабрикой. Дозаказ невозможен. Продавать только при условии, что клиенту хватает текущего складского остатка 32.08 м²!'
      }
    ]
  },
  // Уровень 3: Коллекция Lumber 8/32 4V
  {
    id: 'page_lam_lumber',
    title: 'Lumber 8/32 4V',
    type: 'page',
    parentId: 'page_lam_timber',
    order: 2,
    badge: '32 КЛАСС',
    statusBadge: '🟢 В наличии',
    startPageId: 'page_lam_lumber_chamonix',
    columns: [
      { id: 'c1', title: 'Параметр коллекции', key: 'param', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение', key: 'val', width: 250, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_l1', cells: { param: 'Класс износостойкости', val: '32 класс / 8мм / 4V фаска', retail: '1 699 ₽', specOpt: '1 189 ₽' } },
      { id: 'r_l2', cells: { param: 'Упаковка', val: '2.005 м² (8 планок)', retail: '1 699 ₽', specOpt: '1 189 ₽' } }
    ]
  },
  // Уровень 4: Декор Дуб Шамони (внутри Lumber)
  {
    id: 'page_lam_lumber_chamonix',
    title: 'Дуб Шамони',
    type: 'page',
    parentId: 'page_lam_lumber',
    order: 1,
    statusBadge: '🟢 В наличии',
    columns: [
      { id: 'c1', title: 'Параметр', key: 'p', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение', key: 'v', width: 240, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Остаток', key: 'stock', width: 160, headerColor: 'emerald', align: 'center' },
      { id: 'c4', title: 'Розница', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' }
    ],
    rows: [
      { id: 'r_ch1', cells: { p: 'Артикул', v: '504415011 (Шамони 32/8 4V)', stock: '185 м² (Автомолл + Литвинова)', retail: '1 699 ₽' } }
    ]
  },
  // Уровень 3: Коллекция Forester 10/33 4V
  {
    id: 'page_lam_forester',
    title: 'Forester 10/33 4V',
    type: 'page',
    parentId: 'page_lam_timber',
    order: 3,
    badge: '10 ММ ТОЛЩИНА',
    statusBadge: '🟢 В наличии',
    columns: [
      { id: 'c1', title: 'Параметр', key: 'p', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Значение', key: 'v', width: 240, headerColor: 'cyan', align: 'left' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_fo1', cells: { p: 'Характеристики', v: '33 класс / 10 мм толщина / 4V фаска', retail: '2 279 ₽', specOpt: '1 608 ₽' } },
      { id: 'r_fo2', cells: { p: 'Упаковка', v: '1.754 м² (7 планок)', retail: '2 279 ₽', specOpt: '1 608 ₽' } }
    ]
  },
  {
    id: 'page_lam_taiga',
    title: 'Taiga by Tarkett',
    type: 'page',
    parentId: 'cat_laminate',
    order: 3,
    columns: [
      { id: 'c1', title: 'Коллекция', key: 'name', width: 200, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Класс / Фаска', key: 'spec', width: 140, headerColor: 'blue', align: 'center' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'blue', align: 'right' },
      { id: 'c4', title: 'ОПТ (м²)', key: 'opt', width: 140, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_ta1', cells: { name: 'Taiga Сибирь 8мм', spec: '32 класс / без фаски', retail: '1 350 ₽', opt: '1 080 ₽', specOpt: '960 ₽' } },
      { id: 'r_ta2', cells: { name: 'Taiga Валдай 8мм 4V', spec: '33 класс / 4V фаска', retail: '1 590 ₽', opt: '1 270 ₽', specOpt: '1 140 ₽' } },
      { id: 'r_ta3', cells: { name: 'Taiga Алтай 10мм 4V', spec: '33 класс / 4V фаска', retail: '1 890 ₽', opt: '1 520 ₽', specOpt: '1 380 ₽' } }
    ]
  },
  {
    id: 'page_lam_kronospan',
    title: 'Kronospan',
    type: 'page',
    parentId: 'cat_laminate',
    order: 4,
    columns: [
      { id: 'c1', title: 'Коллекция / Декоры', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Характеристики', key: 'spec', width: 140, headerColor: 'blue', align: 'center' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'blue', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c5', title: 'Упаковка (м²)', key: 'pack', width: 120, headerColor: 'slate', align: 'center' }
    ],
    rows: [
      { id: 'r_k1', cells: { name: 'Castello Classic 8мм', spec: '32 кл / без фаски', retail: '1 240 ₽', specOpt: '890 ₽', pack: '2.22 м²' } },
      { id: 'r_k2', cells: { name: 'Woodstyle Omega 8мм 4V', spec: '33 кл / 4V фаска', retail: '1 490 ₽', specOpt: '1 090 ₽', pack: '2.13 м²' } },
      { id: 'r_k3', cells: { name: 'Woodstyle Pronto 4V 8мм', spec: '33 кл / 4V фаска', retail: '1 540 ₽', specOpt: '1 140 ₽', pack: '2.13 м²' } }
    ]
  },
  {
    id: 'page_lam_floorwood',
    title: 'FloorWood',
    type: 'page',
    parentId: 'cat_laminate',
    order: 5,
    columns: [
      { id: 'c1', title: 'Коллекция', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Параметры', key: 'spec', width: 140, headerColor: 'blue', align: 'center' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'blue', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_fw1', cells: { name: 'Primavera 8мм 4V', spec: '33 кл / влагостойкий', retail: '1 680 ₽', specOpt: '1 250 ₽' } },
      { id: 'r_fw2', cells: { name: 'Maxima 12мм 4V', spec: '34 кл / усиленный замковый', retail: '2 350 ₽', specOpt: '1 780 ₽' } }
    ]
  },

  // =================== 4. ВИНИЛОВЫЕ ПОЛЫ (LVT / SPC) ===================
  {
    id: 'cat_vinyl',
    title: 'Виниловые полы',
    slug: 'vinyl',
    type: 'group',
    parentId: null,
    order: 4,
    color: 'cyan',
    icon: 'layout',
    startPageId: 'page_vinyl_bonkeel'
  },
  {
    id: 'page_vinyl_bonkeel',
    title: 'Bonkeel SPC / Prime',
    type: 'page',
    parentId: 'cat_vinyl',
    order: 1,
    badge: 'ХИТ 2026',
    columns: [
      { id: 'c1', title: 'Коллекция / Толщина', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Тип замка / Подложка', key: 'lock', width: 160, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Защитный слой', key: 'wearLayer', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Упаковка (м²)', key: 'pack', width: 120, headerColor: 'slate', align: 'center' }
    ],
    rows: [
      { id: 'r_v_bk1', cells: { name: 'Bonkeel Prime 4.0 мм', lock: 'Замковый SPC (без подл.)', wearLayer: '0.30 мм (32 кл)', retail: '1 690 ₽', specOpt: '1 280 ₽', pack: '2.23 м²' } },
      { id: 'r_v_bk2', cells: { name: 'Bonkeel Style 4.5 мм IXPE', lock: 'Замковый + подложка IXPE', wearLayer: '0.50 мм (43 кл)', retail: '2 190 ₽', specOpt: '1 650 ₽', pack: '2.01 м²' } },
      { id: 'r_v_bk3', cells: { name: 'Bonkeel Woodstyle 5.0 мм', lock: 'Замковый премиум с фаской', wearLayer: '0.55 мм (43 кл)', retail: '2 590 ₽', specOpt: '1 980 ₽', pack: '1.85 м²' } }
    ],
    notes: [
      {
        id: 'n_vb1',
        type: 'info',
        position: 'top',
        title: 'Условия укладки SPC Bonkeel',
        content: 'Для коллекций со встроенной подложкой IXPE дополнительную подложку стелить ЗАПРЕЩЕНО. Перепад основания не более 2 мм на 2 погонных метра.'
      }
    ]
  },
  {
    id: 'page_vinyl_blackwood',
    title: 'Blackwood LVT (клеевой)',
    type: 'page',
    parentId: 'cat_vinyl',
    order: 2,
    columns: [
      { id: 'c1', title: 'Артикул / Декор', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Толщина / Защита', key: 'spec', width: 150, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c5', title: 'Рекомендуемый клей', key: 'glue', width: 180, headerColor: 'slate', align: 'left' }
    ],
    rows: [
      { id: 'r_vb_1', cells: { name: 'Blackwood Classic Oak 2.0мм', spec: '2.0 мм / 0.30 мм', retail: '1 190 ₽', specOpt: '890 ₽', glue: 'Homakoll 208 / Forbo 522' } },
      { id: 'r_vb_2', cells: { name: 'Blackwood Stone Effect 2.5мм', spec: '2.5 мм / 0.50 мм', retail: '1 490 ₽', specOpt: '1 120 ₽', glue: 'Homakoll 228 / Kesto Plasto' } }
    ]
  },
  {
    id: 'page_vinyl_bass',
    title: 'Bass House SPC',
    type: 'page',
    parentId: 'cat_vinyl',
    order: 3,
    columns: [
      { id: 'c1', title: 'Декор', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Характеристики', key: 'spec', width: 150, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_vba_1', cells: { name: 'Bass House Nordic 4mm', spec: '43 класс / SPC 4мм', retail: '1 850 ₽', specOpt: '1 390 ₽' } }
    ]
  },

  // =================== 5. ПАРКЕТНАЯ ДОСКА ===================
  {
    id: 'cat_parquet',
    title: 'Паркетная доска',
    slug: 'parquet',
    type: 'group',
    parentId: null,
    order: 5,
    color: 'cyan',
    icon: 'box',
    startPageId: 'page_parq_tarkett'
  },
  {
    id: 'page_parq_tarkett',
    title: 'Tarkett Salsa / Samba',
    type: 'page',
    parentId: 'cat_parquet',
    order: 1,
    columns: [
      { id: 'c1', title: 'Порода / Селекция', key: 'name', width: 230, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Покрытие', key: 'coating', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Толщина (мм)', key: 'thickness', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_pq1', cells: { name: 'Salsa Дуб Натур 3-пол.', coating: 'Лак Proteco', thickness: '14 мм', retail: '4 890 ₽', specOpt: '3 950 ₽' } },
      { id: 'r_pq2', cells: { name: 'Salsa Дуб Рустик 3-пол.', coating: 'Масло Proteco', thickness: '14 мм', retail: '4 450 ₽', specOpt: '3 590 ₽' } },
      { id: 'r_pq3', cells: { name: 'Samba Дуб Премиум 3-пол.', coating: 'Глянцевый лак', thickness: '14 мм', retail: '5 300 ₽', specOpt: '4 280 ₽' } }
    ],
    notes: [
      {
        id: 'n_pq1',
        type: 'warning',
        position: 'top',
        title: 'Условия транспортировки и акклиматизации',
        content: 'Паркетная доска должна вылежаться в заводской упаковке в помещении укладки не менее 48 часов при температуре 18–22 °C и влажности 40–60%.'
      }
    ]
  },
  {
    id: 'page_parq_barlinek',
    title: 'Barlinek',
    type: 'page',
    parentId: 'cat_parquet',
    order: 2,
    columns: [
      { id: 'c1', title: 'Коллекция / Дизайн', key: 'name', width: 230, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Полостность', key: 'planks', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Розница (м²)', key: 'retail', width: 140, headerColor: 'cyan', align: 'right' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 140, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_bar1', cells: { name: 'Pure Line Дуб Caramel', planks: '1-полосный', retail: '6 400 ₽', specOpt: '5 150 ₽' } },
      { id: 'r_bar2', cells: { name: 'Diana Дуб Standard', planks: '3-полосный', retail: '3 990 ₽', specOpt: '3 180 ₽' } }
    ]
  },

  // =================== 6. КОВРОВЫЕ ПОКРЫТИЯ ===================
  {
    id: 'cat_carpet',
    title: 'Ковровые покрытия',
    slug: 'carpet',
    type: 'group',
    parentId: null,
    order: 6,
    color: 'cyan',
    icon: 'disc',
    startPageId: 'page_carp_neva'
  },
  {
    id: 'page_carp_neva',
    title: 'Нева Тафт (бытовой & коммерческий)',
    type: 'page',
    parentId: 'cat_carpet',
    order: 1,
    columns: [
      { id: 'c1', title: 'Наименование / Артикул', key: 'name', width: 220, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Ворс / Основа', key: 'spec', width: 150, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Ширины в наличии', key: 'widths', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Розница отрез (м²)', key: 'cutPrice', width: 140, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'Рулон ОПТ (м²)', key: 'rollPrice', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c6', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' }
    ],
    rows: [
      { id: 'r_cp1', cells: { name: 'Нева Тафт Каскад', spec: 'Петлевой / Войлок', widths: '3.0 / 4.0 м', cutPrice: '690 ₽', rollPrice: '480 ₽', specOpt: '430 ₽' } },
      { id: 'r_cp2', cells: { name: 'Нева Тафт Панорама', spec: 'Разрезной ворс 8мм', widths: '3.0 / 3.5 / 4.0 м', cutPrice: '980 ₽', rollPrice: '710 ₽', specOpt: '640 ₽' } },
      { id: 'r_cp3', cells: { name: 'Нева Тафт Офис Про', spec: 'Коммерч. петля 33 кл', widths: '4.0 м', cutPrice: '1 150 ₽', rollPrice: '820 ₽', specOpt: '750 ₽' } }
    ],
    notes: [
      {
        id: 'n_cp1',
        type: 'info',
        position: 'bottom',
        title: 'Услуга обработки края (Оверлок)',
        content: 'Оверлок ковролина выполняется любой нитью в тон. Стоимость оверлока: 120 ₽ за погонный метр периметра.'
      }
    ]
  },

  // =================== 7. СОПУТСТВУЮЩИЕ ТОВАРЫ (как на скриншоте 3!) ===================
  {
    id: 'cat_accessories',
    title: 'Сопутствующие товары',
    slug: 'accessories',
    type: 'group',
    parentId: null,
    order: 7,
    color: 'slate',
    icon: 'tool',
    startPageId: 'page_acc_plintus_pvc'
  },
  // Сопутствующие товары / Плинтус ПВХ (ТОЧНО как на скриншоте 3)
  {
    id: 'page_acc_plintus_pvc',
    title: 'Плинтус ПВХ (Deconika, Royce, Lexida)',
    type: 'page',
    parentId: 'cat_accessories',
    order: 1,
    badge: 'ПВХ',
    columns: [
      { id: 'c1', title: 'Наименование', key: 'name', width: 280, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Stroy52, Linoleum52, TarkettStore розница', key: 'retailPrice', width: 170, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'TarkettStore сайт', key: 'tsSite', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Linoleum52 сайт', key: 'linoSite', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c5', title: 'Stroy52 сайт', key: 'stroySite', width: 110, headerColor: 'cyan', align: 'center' },
      { id: 'c6', title: 'СПЕЦ-ОПТ РЫБАКОВ', key: 'specRybakov', width: 130, headerColor: 'blue', align: 'center' },
      { id: 'c7', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 110, headerColor: 'red', align: 'center' },
      { id: 'c8', title: 'У кого брать', key: 'supplier', width: 140, headerColor: 'amber', align: 'center' }
    ],
    rows: [
      { id: 'r_p1', cells: { name: 'Ideal Deconika 2200*85*22мм шт.', retailPrice: '370', tsSite: '370', linoSite: '370', stroySite: '370', specRybakov: '169', specOpt: '211', supplier: 'Пахомов' } },
      { id: 'r_p2', cells: { name: 'Ideal Deconika угол внутренний шт.', retailPrice: '75', tsSite: '75', linoSite: '75', stroySite: '75', specRybakov: '26', specOpt: '32', supplier: 'Пахомов' } },
      { id: 'r_p3', cells: { name: 'Ideal Deconika угол наружный шт.', retailPrice: '75', tsSite: '75', linoSite: '75', stroySite: '75', specRybakov: '36', specOpt: '45', supplier: 'Пахомов' } },
      { id: 'r_p4', cells: { name: 'Ideal Deconika соединение шт.', retailPrice: '75', tsSite: '75', linoSite: '75', stroySite: '75', specRybakov: '21', specOpt: '26', supplier: 'Пахомов' } },
      { id: 'r_p5', cells: { name: 'Ideal Deconika заглушка шт.', retailPrice: '75', tsSite: '75', linoSite: '75', stroySite: '75', specRybakov: '21', specOpt: '26', supplier: 'Пахомов' } },
      { id: 'r_p6', cells: { name: 'Royce 2200*58*22мм шт.', retailPrice: '255', tsSite: '255', linoSite: '255', stroySite: '255', specRybakov: '97', specOpt: '121', supplier: 'Монарх' } },
      { id: 'r_p7', cells: { name: 'Royce 58 угол внутренний шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '16', specOpt: '20', supplier: 'Монарх' } },
      { id: 'r_p8', cells: { name: 'Royce 58 угол наружный шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '16', specOpt: '20', supplier: 'Монарх' } },
      { id: 'r_p9', cells: { name: 'Royce 58 соединение шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '16', specOpt: '20', supplier: 'Монарх' } },
      { id: 'r_p10', cells: { name: 'Royce 58 заглушка шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '15', specOpt: '19', supplier: 'Монарх' } },
      { id: 'r_p11', cells: { name: 'Royce 2200*55*22мм шт.', retailPrice: '290', tsSite: '290', linoSite: '290', stroySite: '290', specRybakov: '95', specOpt: '118', supplier: 'Монарх' } },
      { id: 'r_p12', cells: { name: 'Royce 55 угол внутренний шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '20', specOpt: '25', supplier: 'Монарх' } },
      { id: 'r_p13', cells: { name: 'Royce 55 угол наружный шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '20', specOpt: '25', supplier: 'Монарх' } },
      { id: 'r_p14', cells: { name: 'Royce 55 соединение шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '19', specOpt: '23', supplier: 'Монарх' } },
      { id: 'r_p15', cells: { name: 'Royce 55 заглушка шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '18', specOpt: '22', supplier: 'Монарх' } },
      { id: 'r_p16', cells: { name: 'Lexida L55 2200*55*22мм шт.', retailPrice: '255', tsSite: '255', linoSite: '255', stroySite: '255', specRybakov: '86', specOpt: '107', supplier: 'Бк Центр' } },
      { id: 'r_p17', cells: { name: 'Lexida L55 угол внутренний шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '17', specOpt: '21', supplier: 'Бк Центр' } },
      { id: 'r_p18', cells: { name: 'Lexida L55 угол наружный шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '22', specOpt: '27', supplier: 'Бк Центр' } },
      { id: 'r_p19', cells: { name: 'Lexida L55 соединение шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '14', specOpt: '17', supplier: 'Бк Центр' } },
      { id: 'r_p20', cells: { name: 'Lexida L55 заглушка шт.', retailPrice: '55', tsSite: '55', linoSite: '55', stroySite: '55', specRybakov: '13', specOpt: '16', supplier: 'Бк Центр' } },
      { id: 'r_p21', cells: { name: 'Royce 2200*75*18мм шт.', retailPrice: '390', tsSite: '390', linoSite: '390', stroySite: '390', specRybakov: '-', specOpt: '206', supplier: 'Монарх' } },
      { id: 'r_p22', cells: { name: 'Royce 75 угол внутренний шт.', retailPrice: '70', tsSite: '70', linoSite: '70', stroySite: '70', specRybakov: '-', specOpt: '25', supplier: 'Монарх' } },
      { id: 'r_p23', cells: { name: 'Royce 75 угол наружный шт.', retailPrice: '70', tsSite: '70', linoSite: '70', stroySite: '70', specRybakov: '-', specOpt: '25', supplier: 'Монарх' } },
      { id: 'r_p24', cells: { name: 'Royce 75 соединение шт.', retailPrice: '70', tsSite: '70', linoSite: '70', stroySite: '70', specRybakov: '-', specOpt: '19', supplier: 'Монарх' } },
      { id: 'r_p25', cells: { name: 'Royce 75 заглушка шт.', retailPrice: '70', tsSite: '70', linoSite: '70', stroySite: '70', specRybakov: '-', specOpt: '19', supplier: 'Монарх' } }
    ]
  },
  {
    id: 'page_acc_plintus_mdf',
    title: 'Плинтус МДФ (Лука, Деартио, Таркетт)',
    type: 'page',
    parentId: 'cat_accessories',
    order: 2,
    badge: 'МДФ',
    columns: [
      { id: 'c1', title: 'Наименование / Высота', key: 'name', width: 260, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Длина (м)', key: 'length', width: 110, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Розница шт.', key: 'retail', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'center' },
      { id: 'c5', title: 'Клипса / Крепеж', key: 'clipPrice', width: 140, headerColor: 'slate', align: 'center' },
      { id: 'c6', title: 'Поставщик', key: 'supplier', width: 140, headerColor: 'amber', align: 'center' }
    ],
    rows: [
      { id: 'r_mdf1', cells: { name: 'МДФ Лука прямой 80*16 мм под покраску', length: '2.4 м', retail: '490 ₽', specOpt: '295 ₽', clipPrice: 'Клипса 15 ₽/шт', supplier: 'Мастер-Профиль' } },
      { id: 'r_mdf2', cells: { name: 'МДФ Лука фигурный 100*16 мм белый', length: '2.4 м', retail: '590 ₽', specOpt: '365 ₽', clipPrice: 'Клипса 15 ₽/шт', supplier: 'Мастер-Профиль' } },
      { id: 'r_mdf3', cells: { name: 'Деартио 80 мм ламинированный в цвет', length: '2.0 м', retail: '450 ₽', specOpt: '280 ₽', clipPrice: 'Жидкие гвозди', supplier: 'Деартио' } },
      { id: 'r_mdf4', cells: { name: 'Tarkett МДФ 60 мм под ламинат', length: '2.4 м', retail: '420 ₽', specOpt: '260 ₽', clipPrice: 'Клипса Tarkett', supplier: 'Таркетт' } }
    ]
  },
  {
    id: 'page_acc_plintus_duro',
    title: 'Дюрополимер (NMC, ROYCE, Solid, Salag)',
    type: 'page',
    parentId: 'cat_accessories',
    order: 3,
    badge: 'ДЮРОПОЛИМЕР',
    columns: [
      { id: 'c1', title: 'Наименование / Бренд', key: 'name', width: 260, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Размер (В x Г x Д)', key: 'size', width: 150, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Розница шт.', key: 'retail', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'center' },
      { id: 'c5', title: 'Поставщик', key: 'supplier', width: 140, headerColor: 'amber', align: 'center' }
    ],
    rows: [
      { id: 'r_du1', cells: { name: 'Wallstyl NMC FT2 ударопрочный', size: '58*13*2000 мм', retail: '690 ₽', specOpt: '420 ₽', supplier: 'NMC' } },
      { id: 'r_du2', cells: { name: 'ROYCE HDPS дюрополимер белый', size: '80*15*2000 мм', retail: '540 ₽', specOpt: '315 ₽', supplier: 'Монарх' } },
      { id: 'r_du3', cells: { name: 'Solid UHD высокий 100 мм', size: '100*16*2000 мм', retail: '680 ₽', specOpt: '390 ₽', supplier: 'Солид' } },
      { id: 'r_du4', cells: { name: 'Decomaster водостойкий белый', size: '70*14*2000 мм', retail: '490 ₽', specOpt: '295 ₽', supplier: 'Декомастер' } }
    ]
  },
  {
    id: 'page_acc_underlay',
    title: 'Подложка (Bonkeel, Tuplex, Пробка, XPS)',
    type: 'page',
    parentId: 'cat_accessories',
    order: 4,
    columns: [
      { id: 'c1', title: 'Наименование / Тип', key: 'name', width: 250, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Толщина (мм)', key: 'thickness', width: 130, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Упаковка / Рулон', key: 'packing', width: 140, headerColor: 'cyan', align: 'center' },
      { id: 'c4', title: 'Розница (м²)', key: 'retail', width: 130, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 130, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Для теплого пола', key: 'underfloor', width: 140, headerColor: 'emerald', align: 'center' }
    ],
    rows: [
      { id: 'r_un1', highlight: 'yellow', cells: { name: 'Подложка Bonkeel LVT/SPC 1.5мм', thickness: '1.5 мм', packing: '10 м² (рулон)', retail: '145 ₽', specOpt: '95 ₽', underfloor: 'ДА (до 28°C)' } },
      { id: 'r_un2', cells: { name: 'Tuplex вентилируемая 3мм', thickness: '3.0 мм', packing: '10 м² (рулон)', retail: '210 ₽', specOpt: '145 ₽', underfloor: 'ДА' } },
      { id: 'r_un3', cells: { name: 'Пробка натуральная Португалия 2мм', thickness: '2.0 мм', packing: '10 м² (рулон)', retail: '280 ₽', specOpt: '195 ₽', underfloor: 'НЕТ' } },
      { id: 'r_un4', cells: { name: 'Пробка натуральная Португалия 3мм', thickness: '3.0 мм', packing: '10 м² (рулон)', retail: '390 ₽', specOpt: '275 ₽', underfloor: 'НЕТ' } },
      { id: 'r_un5', cells: { name: 'XPS листовая гармошка 3мм', thickness: '3.0 мм', packing: '6 м² (пачка)', retail: '75 ₽', specOpt: '48 ₽', underfloor: 'НЕТ' } },
      { id: 'r_un6', cells: { name: 'XPS перфорированная для теплых полов 2мм', thickness: '2.0 мм', packing: '10 м² (пачка)', retail: '95 ₽', specOpt: '62 ₽', underfloor: 'ДА' } }
    ]
  },
  {
    id: 'page_acc_glue',
    title: 'Клей, сварка и химия (Homakoll, Rico)',
    type: 'page',
    parentId: 'cat_accessories',
    order: 5,
    columns: [
      { id: 'c1', title: 'Наименование товара', key: 'name', width: 260, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Фасовка', key: 'pack', width: 120, headerColor: 'cyan', align: 'center' },
      { id: 'c3', title: 'Назначение', key: 'purpose', width: 170, headerColor: 'cyan', align: 'left' },
      { id: 'c4', title: 'Розница шт.', key: 'retail', width: 120, headerColor: 'cyan', align: 'right' },
      { id: 'c5', title: 'СПЕЦ-ОПТ', key: 'specOpt', width: 120, headerColor: 'red', align: 'right' },
      { id: 'c6', title: 'Расход', key: 'consumption', width: 140, headerColor: 'slate', align: 'center' }
    ],
    rows: [
      { id: 'r_gl1', cells: { name: 'Клей Homakoll 208 для ПВХ и линолеума', pack: '1.3 кг', purpose: 'Бытовой линолеум, ПВХ', retail: '390 ₽', specOpt: '265 ₽', consumption: '300-350 г/м²' } },
      { id: 'r_gl2', cells: { name: 'Клей Homakoll 208 ведро', pack: '6.0 кг', purpose: 'Бытовой линолеум, ПВХ', retail: '1 450 ₽', specOpt: '990 ₽', consumption: '300-350 г/м²' } },
      { id: 'r_gl3', cells: { name: 'Клей Homakoll 228 коммерческий', pack: '14.0 кг', purpose: 'Коммерч. покрытия, LVT', retail: '3 890 ₽', specOpt: '2 680 ₽', consumption: '300-400 г/м²' } },
      { id: 'r_gl4', cells: { name: 'Клей Homakoll 777 фиксация (липучка)', pack: '3.0 кг', purpose: 'Ковровая плитка, LVT', retail: '1 890 ₽', specOpt: '1 290 ₽', consumption: '150-200 г/м²' } },
      { id: 'r_gl5', cells: { name: 'Холодная сварка Homakoll S401 Type A', pack: '60 мл', purpose: 'Сварка швов линолеума', retail: '380 ₽', specOpt: '245 ₽', consumption: 'до 20 пог.м' } },
      { id: 'r_gl6', cells: { name: 'Гель для замков Rico Protect Click', pack: '125 мл', purpose: 'Герметизация замков ламината', retail: '340 ₽', specOpt: '215 ₽', consumption: 'на 10-12 м²' } },
      { id: 'r_gl7', cells: { name: 'Медная токопроводящая лента Homakoll', pack: '20 м', purpose: 'Антистатические полы', retail: '850 ₽', specOpt: '590 ₽', consumption: 'по проекту' } }
    ],
    notes: [
      {
        id: 'n_gl1',
        type: 'warning',
        position: 'top',
        title: 'Условия хранения клеевых составов',
        content: 'В зимний период клеи и сварку транспортировать и хранить только в теплом контуре (не допускать замораживания!). При разморозке теряют адгезию.'
      }
    ]
  },

  // =================== 8. УСЛУГИ ===================
  {
    id: 'cat_services',
    title: 'Услуги',
    slug: 'services',
    type: 'group',
    parentId: null,
    order: 8,
    color: 'amber',
    icon: 'briefcase',
    startPageId: 'page_services_list'
  },
  {
    id: 'page_services_list',
    title: 'Прайс-лист на услуги и укладку',
    type: 'page',
    parentId: 'cat_services',
    order: 1,
    badge: 'АКТУАЛЬНО 2026',
    color: 'amber',
    columns: [
      { id: 'c1', title: 'Вид услуги / Работы', key: 'name', width: 280, headerColor: 'slate', isSticky: true },
      { id: 'c2', title: 'Ед. изм.', key: 'unit', width: 100, headerColor: 'amber', align: 'center' },
      { id: 'c3', title: 'Стандартная цена', key: 'standardPrice', width: 150, headerColor: 'amber', align: 'right' },
      { id: 'c4', title: 'Спец. цена (при покупке у нас)', key: 'promoPrice', width: 180, headerColor: 'emerald', align: 'right' },
      { id: 'c5', title: 'Примечания и ограничения', key: 'notes', width: 220, headerColor: 'slate', align: 'left' }
    ],
    rows: [
      { id: 'r_sv1', highlight: 'none', cells: { name: 'Укладка ламината прямо (на подложку)', unit: 'м²', standardPrice: '350 ₽', promoPrice: '280 ₽', notes: 'Минимальный выезд 3 000 ₽' } },
      { id: 'r_sv2', highlight: 'none', cells: { name: 'Укладка ламината по диагонали', unit: 'м²', standardPrice: '450 ₽', promoPrice: '380 ₽', notes: 'Запас на подрезку 10-12%' } },
      { id: 'r_sv3', highlight: 'yellow', cells: { name: 'Укладка ламината «Ёлочка» (Herringbone)', unit: 'м²', standardPrice: '750 ₽', promoPrice: '620 ₽', notes: 'Требуется идеальная стяжка' } },
      { id: 'r_sv4', highlight: 'none', cells: { name: 'Настил линолеума бытового без клея', unit: 'м²', standardPrice: '250 ₽', promoPrice: '190 ₽', notes: 'Фиксация по периметру' } },
      { id: 'r_sv5', highlight: 'none', cells: { name: 'Настил линолеума с проклейкой по всей площади', unit: 'м²', standardPrice: '380 ₽', promoPrice: '300 ₽', notes: 'Клей оплачивается отдельно' } },
      { id: 'r_sv6', highlight: 'none', cells: { name: 'Холодная сварка стыков линолеума', unit: 'пог.м', standardPrice: '250 ₽', promoPrice: '180 ₽', notes: 'Включая состав' } },
      { id: 'r_sv7', highlight: 'none', cells: { name: 'Укладка замкового кварцвинила / SPC', unit: 'м²', standardPrice: '400 ₽', promoPrice: '320 ₽', notes: 'На ровное основание' } },
      { id: 'r_sv8', highlight: 'none', cells: { name: 'Укладка клеевого LVT винила', unit: 'м²', standardPrice: '550 ₽', promoPrice: '450 ₽', notes: 'С нанесением клея' } },
      { id: 'r_sv9', highlight: 'none', cells: { name: 'Монтаж пластикового плинтуса с кабель-каналом', unit: 'пог.м', standardPrice: '150 ₽', promoPrice: '120 ₽', notes: 'Сверление, дюбель' } },
      { id: 'r_sv10', highlight: 'none', cells: { name: 'Монтаж МДФ / Дюрополимер плинтуса под 45°', unit: 'пог.м', standardPrice: '350 ₽', promoPrice: '280 ₽', notes: 'Запил углов торцовочной пилой' } },
      { id: 'r_sv11', highlight: 'green', cells: { name: 'Оверлок ковровых покрытий', unit: 'пог.м', standardPrice: '150 ₽', promoPrice: '120 ₽', notes: 'Нить в тон покрытия' } },
      { id: 'r_sv12', highlight: 'none', cells: { name: 'Доставка по городу до подъезда', unit: 'рейс', standardPrice: '1 200 ₽', promoPrice: '900 ₽', notes: 'До 1.5 тонн, до 4 метров' } },
      { id: 'r_sv13', highlight: 'none', cells: { name: 'Подъем на этаж (с лифтом)', unit: 'подъем', standardPrice: '800 ₽', promoPrice: '600 ₽', notes: 'Если товар входит в лифт' } },
      { id: 'r_sv14', highlight: 'none', cells: { name: 'Подъем на этаж пешком (без лифта)', unit: 'этаж/уп', standardPrice: '50 ₽', promoPrice: '40 ₽', notes: 'За каждую пачку / рулон' } },
      { id: 'r_sv15', highlight: 'none', cells: { name: 'Выезд мастера-замерщика по городу', unit: 'выезд', standardPrice: '500 ₽', promoPrice: 'БЕСПЛАТНО', notes: 'Бесплатно при оформлении заказа' } }
    ],
    notes: [
      {
        id: 'n_sv1',
        type: 'success',
        position: 'top',
        title: 'Условия предоставления гарантии на укладку',
        content: 'При заказе комплексной укладки нашими мастерами предоставляется официальная гарантия 12 месяцев. Поверхность пола должна быть предварительно обеспылена.'
      }
    ]
  }
];

export const INITIAL_APP_DATA: AppData = {
  version: '3.1.0',
  appName: 'Памятка продавца',
  lastModified: new Date().toISOString(),
  categories: INITIAL_CATEGORIES,
  changelog: INITIAL_CHANGELOG,
  settings: {
    theme: 'dark',
    defaultCategoryId: 'cat_updates',
    currencySymbol: '₽',
    adminPasswordHash: '',
    compactMode: false,
    googleScriptUrl: '',
    lastSyncTime: '',
    autoSyncInterval: 0
  }
};
