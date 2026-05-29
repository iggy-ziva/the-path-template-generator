"use client";

import React from "react";
import EditableText from "./EditableText";
import { useEditorOptional } from "./EditorContext";
import type { FunnelPageKey } from "@/lib/funnel-export/config";

/** Plain-text edit of an HTML string field (strips tags in edit UI). */
export function htmlPlain(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

interface PageTextProps {
  pageKey: FunnelPageKey;
  path: string;
  children: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  html?: boolean;
  /** When false, hide unless edit mode (default: show when children non-empty). */
  forceShow?: boolean;
}

export function PageText({
  pageKey,
  path,
  children,
  as = "span",
  className,
  style,
  html = false,
  forceShow,
}: PageTextProps) {
  const editor = useEditorOptional();
  const value = children ?? "";
  const visible = forceShow ?? (Boolean(value.trim()) || Boolean(editor?.isEditMode));
  if (!visible) return null;

  const editValue = html ? htmlPlain(value) : value;
  return (
    <EditableText pageKey={pageKey} path={path} as={as} className={className} style={style} html={html && !editor?.isEditMode}>
      {editValue}
    </EditableText>
  );
}

interface PageLinkProps {
  pageKey: FunnelPageKey;
  path: string;
  href: string;
  className?: string;
  children: string;
  onEditClick?: (e: React.MouseEvent) => void;
}

/** CTA link with editable label — prevents navigation in edit mode. */
export function PageLink({ pageKey, path, href, className, children, onEditClick }: PageLinkProps) {
  const editor = useEditorOptional();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (editor?.isEditMode) {
          e.preventDefault();
          onEditClick?.(e);
        }
      }}
    >
      <EditableText pageKey={pageKey} path={path} as="span">{children}</EditableText>
    </a>
  );
}

export function useEditMode(): boolean {
  return useEditorOptional()?.isEditMode ?? false;
}
