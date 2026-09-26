// Shared pure data contract. Also embedded verbatim in Backend.gs by build-backend.mjs.
export function canonical(value) {
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function sharedData(data) {
  const result = JSON.parse(JSON.stringify(data));
  delete result.lastModified;
  for (const key of ['googleScriptUrl', 'adminPasswordHash', 'lastSyncTime', 'theme', 'compactMode', 'autoSyncInterval']) delete result.settings[key];
  return result;
}
export function validateCatalog(data) {
  const fail = message => { throw new Error('Некорректные данные: ' + message); };
  if (!data || typeof data !== 'object' || !Array.isArray(data.categories) || !Array.isArray(data.changelog) || !data.settings || typeof data.settings !== 'object') fail('структура каталога');
  if (typeof data.appName !== 'string' || typeof data.version !== 'string') fail('название/версия');
  function checkKeys(value, depth = 0) {
    if (depth > 30) fail('слишком глубокая структура');
    if (value && typeof value === 'object') for (const k of Object.keys(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(k)) fail('недопустимое поле');
      checkKeys(value[k], depth + 1);
    }
  }
  checkKeys(data);
  const unique = (items, label) => {
    if (!Array.isArray(items)) fail(label);
    const seen = new Set();
    for (const item of items) {
      if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id)) fail('повторяющийся или пустой ID: ' + label);
      seen.add(item.id);
    }
  };
  unique(data.categories, 'разделы'); unique(data.changelog, 'журнал');
  const optionalText = (value, keys) => { for (const k of keys) if (value[k] !== undefined && typeof value[k] !== 'string') fail('поле ' + k); };
  const cats = new Map(data.categories.map(c => [c.id, c]));
  for (const c of data.categories) {
    optionalText(c, ['slug', 'badge', 'statusBadge', 'color', 'icon', 'startPageId', 'description', 'lastUpdated']);
    if (c.parentId != null && typeof c.parentId !== 'string') fail('родитель');
    if (typeof c.title !== 'string' || !['page', 'group', 'changelog'].includes(c.type) || !Number.isFinite(c.order)) fail('поля раздела ' + c.id);
    if (c.parentId && !cats.has(c.parentId)) fail('нет родителя ' + c.id);
    const seen = new Set([c.id]); let parent = c.parentId;
    while (parent) {
      if (seen.has(parent)) fail('цикл разделов');
      seen.add(parent); parent = cats.get(parent)?.parentId;
    }
    if (c.startPageId && !cats.has(c.startPageId)) fail('нет стартовой страницы ' + c.id);
    for (const field of ['columns', 'rows', 'notes']) if (c[field] !== undefined) unique(c[field], c.id + '/' + field);
    const keys = new Set();
    for (const col of c.columns || []) {
      if (typeof col.key !== 'string' || !col.key || keys.has(col.key) || typeof col.title !== 'string') fail('ключ столбца ' + c.id);
      if (col.width !== undefined && (!Number.isFinite(col.width) || col.width <= 0)) fail('ширина столбца');
      keys.add(col.key);
    }
    for (const row of c.rows || []) {
      optionalText(row, ['note']);
      if (row.highlight !== undefined && !['none','yellow','red','green','blue'].includes(row.highlight)) fail('подсветка строки');
      if (!row.cells || typeof row.cells !== 'object' || Array.isArray(row.cells)) fail('ячейки ' + row.id);
      for (const v of Object.values(row.cells)) if (typeof v !== 'string' && !(typeof v === 'number' && Number.isFinite(v))) fail('значение ячейки');
    }
    for (const n of c.notes || []) {
      optionalText(n, ['title', 'icon']);
      if (typeof n.content !== 'string' || !['top', 'bottom'].includes(n.position) || !['danger','warning','info','success','accent','purple'].includes(n.type)) fail('пометка');
    }
  }
  for (const l of data.changelog) if (['date', 'category', 'text'].some(k => typeof l[k] !== 'string')) fail('запись журнала');
  return data;
}
// Three-way merge by stable entity IDs; values edited on both sides are never silently overwritten.
export function mergeCatalog(base, local, remote) {
  const conflicts = [];
  const eq = (a, b) => canonical(a) === canonical(b);
  const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const keyed = v => Array.isArray(v) && v.every(x => obj(x) && typeof x.id === 'string');
  function merge(b, l, r, path) {
    if (eq(l, b)) return r;
    if (eq(r, b) || eq(l, r)) return l;
    if (keyed(b) && keyed(l) && keyed(r)) {
      const bm = new Map(b.map(x => [x.id, x])), lm = new Map(l.map(x => [x.id, x])), rm = new Map(r.map(x => [x.id, x]));
      const ids = [...new Set([...r.map(x => x.id), ...l.map(x => x.id)])];
      const merged = new Map(ids.map(id => [id, merge(bm.get(id), lm.get(id), rm.get(id), path + '/' + id)]));
      const common = b.map(x => x.id).filter(id => lm.has(id) && rm.has(id));
      const order = arr => arr.map(x => x.id).filter(id => common.includes(id));
      const lo = order(l), ro = order(r);
      if (!eq(lo, common) && !eq(ro, common) && !eq(lo, ro)) conflicts.push(path + '/порядок');
      const primary = !eq(lo, common) ? l : r;
      const sequence = primary.map(x => x.id);
      // Insert additions missing from the primary sequence near their previous neighbour.
      for (const other of [r, l]) other.forEach((x, i) => {
        if (sequence.includes(x.id)) return;
        const previous = other.slice(0, i).reverse().find(y => sequence.includes(y.id));
        sequence.splice(previous ? sequence.indexOf(previous.id) + 1 : 0, 0, x.id);
      });
      return sequence.map(id => merged.get(id)).filter(x => x !== undefined);
    }
    if (obj(b) && obj(l) && obj(r)) {
      const out = {};
      for (const key of new Set([...Object.keys(b), ...Object.keys(l), ...Object.keys(r)])) {
        const v = merge(b[key], l[key], r[key], path + '/' + key);
        if (v !== undefined) out[key] = v;
      }
      return out;
    }
    conflicts.push(path); return l;
  }
  return { data: merge(base, local, remote, ''), conflicts };
}
