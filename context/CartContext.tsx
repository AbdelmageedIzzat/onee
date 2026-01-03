"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

type CartItem = { product: Product; quantity: number };
type CartContextType = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

const LS_KEY = "cart:items";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setItems(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (p: Product) => {
    setItems(prev => {
      const i = prev.find(x => x.product.id === p.id);
      if (i) return prev.map(x => x.product.id === p.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { product: p, quantity: 1 }];
    });
  };
  const remove = (id: string) => setItems(prev => prev.filter(x => x.product.id !== id));
  const setQty = (id: string, qty: number) => setItems(prev => prev.map(x => x.product.id === id ? { ...x, quantity: Math.max(1, qty) } : x));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((s, i) => s + i.product.price * i.quantity, 0), [items]);

  const value = { items, add, remove, setQty, clear, total };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartContext missing");
  return ctx;
};
