"use client";

import { createContext, useContext } from "react";
import type { FunnelContent } from "../funnel-types";
import type { FunnelPageKey } from "@/lib/funnel-export/config";
import { useEditorOptional } from "./EditorContext";

/**
 * Read-only funnel content for components that need to resolve their own
 * overrides (section backgrounds, per-text font/colour) outside of edit mode —
 * notably during export, where there is no EditorProvider. In the live preview
 * the editor's draftContent is the source of truth; this context is the fallback
 * used by the static export renderer.
 */
export const PageContentContext = createContext<FunnelContent | null>(null);

/** Resolve the content object for a single page from the editor (preview) or the export context. */
export function usePageContent(pageKey: FunnelPageKey): Record<string, unknown> | undefined {
  const editor = useEditorOptional();
  const exportContent = useContext(PageContentContext);
  const content = editor?.draftContent ?? exportContent ?? undefined;
  return content?.[pageKey] as Record<string, unknown> | undefined;
}
