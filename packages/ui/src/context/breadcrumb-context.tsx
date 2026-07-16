"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface BreadcrumbContextType {
  pathMap: Record<string, string>;
  setPathName: (path: string, name: string) => void;
  removePathName: (path: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [pathMap, setPathMap] = useState<Record<string, string>>({});

  const setPathName = useCallback((path: string, name: string) => {
    setPathMap((prev) => ({ ...prev, [path]: name }));
  }, []);

  const removePathName = useCallback((path: string) => {
    setPathMap((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{ pathMap, setPathName, removePathName }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
}
