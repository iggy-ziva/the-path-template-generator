"use client";

import { createContext, useContext, useMemo } from "react";

/**
 * The document/window the editor UI should target for portals, selection,
 * outside-click listeners and viewport math.
 *
 * On the desktop canvas this is just the main document. Inside the mobile
 * preview iframe (when editing) it is the iframe's own document/window, so
 * popovers anchor correctly, contentEditable selection works, and modals stay
 * within the same document as the React root that owns them (React events do
 * not cross the iframe boundary, so everything an interactive editor renders
 * must live in the same document as its root).
 */
export interface EditSurface {
  doc: Document;
  win: Window;
}

const EditSurfaceContext = createContext<EditSurface | null>(null);

export const EditSurfaceProvider = EditSurfaceContext.Provider;

/**
 * Resolve the active edit surface. Falls back to the main document/window when
 * no provider is present (the desktop canvas). Returns an inert stub during SSR
 * — the editor UI that reads it only renders on the client.
 */
export function useEditSurface(): EditSurface {
  const ctx = useContext(EditSurfaceContext);
  // Memoise so the returned object keeps a stable identity across renders —
  // consumers use it in effect dependency arrays (e.g. selection/outside-click).
  return useMemo<EditSurface>(() => {
    if (ctx) return ctx;
    if (typeof window !== "undefined") return { doc: document, win: window };
    return { doc: undefined as unknown as Document, win: undefined as unknown as Window };
  }, [ctx]);
}
