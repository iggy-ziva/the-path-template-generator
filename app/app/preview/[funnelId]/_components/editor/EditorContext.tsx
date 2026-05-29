"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FunnelContent } from "../funnel-types";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { getAtPath, setAtPath } from "@/lib/content-path";

export type ContentPath = string;

interface EditorContextValue {
  isEditMode: boolean;
  setEditMode: (on: boolean) => void;
  draftContent: FunnelContent;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
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
  children: ReactNode;
}

export function EditorProvider({ funnelId, initialContent, children }: Props) {
  const [isEditMode, setEditMode] = useState(false);
  const [savedContent, setSavedContent] = useState<FunnelContent>(initialContent);
  const [draftContent, setDraftContent] = useState<FunnelContent>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

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
    updateField,
    addListItem,
    removeListItem,
    save,
    discard,
    getPageContent,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
