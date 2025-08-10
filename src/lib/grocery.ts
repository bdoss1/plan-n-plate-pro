export type Item = { name: string; quantity: number; unit?: string; note?: string; on_hand?: boolean };

export function normalize(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function mergeItems(items: Item[]): Item[] {
  const map = new Map<string, Item>();
  for (const it of items) {
    const key = `${normalize(it.name)}|${it.unit||''}`;
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, quantity: (prev.quantity || 0) + (it.quantity || 0) });
    } else {
      map.set(key, { ...it, name: normalize(it.name) });
    }
  }
  return Array.from(map.values());
}

export function scaleItems(items: Item[], factor: number) {
  return items.map(i => ({ ...i, quantity: Math.round((i.quantity || 0) * factor * 100) / 100 }));
}

export function excludePantry(items: Item[]) {
  return items.filter(i => !i.on_hand);
}
