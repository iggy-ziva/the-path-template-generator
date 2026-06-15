"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FunnelContent } from "../funnel-types";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { getAtPath, setAtPath } from "@/lib/content-path";
import type { ImageLibraryItem } from "./wizard-image-library";
import type { BrandColorOption } from "./brand-palette";

export type ContentPath = string;

interface EditorContextValue {
  isEditMode: boolean;
  setEditMode: (on: boolean) => void;
  draftContent: FunnelContent;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  /** Images the user uploaded during the wizard, offered for reuse in the image picker. */
  imageLibrary: ImageLibraryItem[];
  /** Re-fetch and merge the user's image library (call after a new upload). */
  refreshImageLibrary: () => void;
  /** Brand colours the user entered in the wizard, offered in the text colour picker. */
  colorPalette: BrandColorOption[];
  updateField: (pageKey: FunnelPageKey, path: ContentPath, value: unknown) => void;
  addListItem: (pageKey: FunnelPageKey, path: ContentPath, item: unknown) => void;
  removeListItem: (pageKey: FunnelPageKey, path: ContentPath, index: number) => void;
  save: () => Promise<boolean>;
  discard: () => void;
  getPageContent: <K extends FunnelPageKey>(pageKey: K) => FunnelContent[K] | undefined;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

export function useEditorOptional(): EditorContextValue | null {
  return useContext(EditorContext);
}

interface Props {
  funnelId: string;
  initialContent: FunnelContent;
  imageLibrary?: ImageLibraryItem[];
  colorPalette?: BrandColorOption[];
  children: ReactNode;
}

export function EditorProvider({
  funnelId,
  initialContent,
  imageLibrary: snapshotLibrary = [],
  colorPalette = [],
  children,
}: Props) {
  const [isEditMode, setEditMode] = useState(false);
  const [savedContent, setSavedContent] = useState<FunnelContent>(initialContent);
  const [draftContent, setDraftContent] = useState<FunnelContent>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Start with the wizard snapshot items so the library is immediately available,
  // then replace with the authoritative user-scoped list from the server.
  // This ensures it is structurally impossible for another user's images to appear.
  const [imageLibrary, setImageLibrary] = useState<ImageLibraryItem[]>(snapshotLibrary);

  const buildLibrary = useCallback((urls: string[], snapshot: ImageLibraryItem[]) => {
    // Prefer snapshot labels (e.g. "Hero image 1", "Lifestyle 3") over generic "Upload N".
    const snapshotLabels = new Map(snapshot.map((item) => [item.url, item.label]));
    const seen = new Set<string>();
    const merged: ImageLibraryItem[] = [];
    let uploadIdx = 0;
    urls.forEach((url) => {
      if (!seen.has(url)) {
        seen.add(url);
        merged.push({ url, label: snapshotLabels.get(url) ?? `Upload ${++uploadIdx}` });
      }
    });
    snapshot.forEach((item) => {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        merged.push(item);
      }
    });
    return merged;
  }, []);

  const refreshImageLibrary = useCallback(() => {
    fetch("/api/wizard/images")
      .then((r) => r.json())
      .then(({ urls }: { urls?: string[] }) => {
        if (!Array.isArray(urls) || urls.length === 0) return;
        setImageLibrary((prev) => buildLibrary(urls, prev));
      })
      .catch(() => {/* keep current library on error */});
  }, [buildLibrary]);

  // Initial load — runs once on mount.
  useEffect(() => {
    refreshImageLibrary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(draftContent) !== JSON.stringify(savedContent),
    [draftContent, savedContent],
  );

  const updateField = useCallback((pageKey: FunnelPageKey, path: ContentPath, value: unknown) => {
    setDraftContent((prev) => {
      const page = (prev[pageKey] as Record<string, unknown> | undefined) ?? {};
      const updated = setAtPath({ ...page }, path, value);
      return { ...prev, [pageKey]: updated };
    });
  }, []);

  const addListItem = useCallback((pageKey: FunnelPageKey, path: ContentPath, item: unknown) => {
    setDraftContent((prev) => {
      const page = structuredClone((prev[pageKey] as Record<string, unknown>) ?? {});
      const current = getAtPath(page, path);
      const arr = Array.isArray(current) ? [...current, item] : [item];
      const updated = setAtPath(page, path, arr);
      return { ...prev, [pageKey]: updated };
    });
  }, []);

  const removeListItem = useCallback((pageKey: FunnelPageKey, path: ContentPath, index: number) => {
    setDraftContent((prev) => {
      const page = structuredClone((prev[pageKey] as Record<string, unknown>) ?? {});
      const current = getAtPath(page, path);
      const arr = Array.isArray(current) ? [...current] : [];
      arr.splice(index, 1);
      const updated = setAtPath(page, path, arr);
      return { ...prev, [pageKey]: updated };
    });
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/wizard/funnels/${funnelId}/content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draftContent }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setSavedContent(draftContent);
      setLastSavedAt(data.updatedAt ?? new Date().toISOString());
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [funnelId, draftContent]);

  const discard = useCallback(() => {
    setDraftContent(savedContent);
  }, [savedContent]);

  const getPageContent = useCallback(
    <K extends FunnelPageKey>(pageKey: K) => draftContent[pageKey],
    [draftContent],
  );

  const value: EditorContextValue = {
    isEditMode,
    setEditMode,
    draftContent,
    isDirty,
    isSaving,
    lastSavedAt,
    imageLibrary,
    refreshImageLibrary,
    colorPalette,
    updateField,
    addListItem,
    removeListItem,
    save,
    discard,
    getPageContent,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export type { EditorContextValue };

/**
 * Re-provide an existing editor value into a separate React tree (e.g. the
 * mobile preview iframe's own root), so editor state stays a single source of
 * truth across both roots.
 */
export function EditorValueProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: ReactNode;
}) {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
