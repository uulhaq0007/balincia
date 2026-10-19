"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

type UIState = {
  searchOpen: boolean;
  menuOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
};

export const useUI = create<UIState>()((set) => ({
  searchOpen: false,
  menuOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));

/** True after the first client render — guards persisted (localStorage) state against hydration mismatch. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Lock body scroll while an overlay is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
