import { useSyncExternalStore } from "react";

// The cart only stores product references. Prices are never trusted from here: the server recalculates them.
export type CartItem = { type: "program" | "tool"; id: string };
const KEY = "ph-cart";
const listeners = new Set<() => void>();
let cache: CartItem[] = read();

function read(): CartItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((i) => (i.type === "program" || i.type === "tool") && typeof i.id === "string") : [];
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  cache = items;
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}
export const cart = {
  add: (i: CartItem) => { if (!cache.some((c) => c.type === i.type && c.id === i.id)) write([...cache, i]); },
  remove: (i: CartItem) => write(cache.filter((c) => !(c.type === i.type && c.id === i.id))),
  clear: () => write([]),
};
export const useCart = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => cache);
