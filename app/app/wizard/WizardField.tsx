"use client";

import { useState } from "react";

const Z = {
  cream:    "#FCFAF6",
  creamMid: "#FCF8EF",
  creamDeep:"#F5EEE0",
  charcoal: "#2E2E2E",
  muted:    "#8A7A6A",
  faint:    "#C8B8A4",
  pink:     "#FF007E",
  coral:    "#FA2A45",
  white:    "#FFFFFF",
  font:     'var(--font-barlow), -apple-system, sans-serif',
};

const fieldBase: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  background: Z.white,
  border: "1.5px solid #C8B8A4",
  borderRadius: 10,
  color: Z.charcoal,
  fontSize: 14,
  fontFamily: Z.font,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label
        style={{
          display: "block",
          fontFamily: Z.font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: Z.charcoal,
          marginBottom: 8,
        }}
      >
        {label}{" "}
        {required && <span style={{ color: Z.pink }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ margin: "6px 0 0", fontFamily: Z.font, fontSize: 12, color: Z.faint, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={fieldBase}
      onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...fieldBase, resize: "vertical", lineHeight: 1.65 }}
      onFocus={(e) => { const el = e.target as HTMLTextAreaElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLTextAreaElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...fieldBase, cursor: "pointer" }}
      onFocus={(e) => { const el = e.target as HTMLSelectElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
      onBlur={(e)  => { const el = e.target as HTMLSelectElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
    >
      <option value="">Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3
        style={{
          fontFamily: Z.font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: Z.pink,
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: `1px solid ${Z.creamDeep}`,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FileUpload({
  label,
  accept,
  onUpload,
  currentUrl,
  bucket = "wizard-uploads",
}: {
  label: string;
  accept: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  bucket?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      const res = await fetch("/api/wizard/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onUpload(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          background: Z.white,
          border: "1.5px dashed #C8B8A4",
          borderRadius: 12,
          cursor: uploading ? "not-allowed" : "pointer",
          fontFamily: Z.font,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = Z.pink; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = "#C8B8A4"; }}
      >
        <span style={{ fontSize: 22, opacity: 0.5 }}>↑</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: Z.charcoal }}>
            {uploading ? "Uploading…" : label}
          </div>
          {currentUrl && !uploading && (
            <div style={{ fontSize: 12, color: Z.pink, marginTop: 2, fontWeight: 600 }}>
              ✓ File uploaded
            </div>
          )}
          {!currentUrl && !uploading && (
            <div style={{ fontSize: 12, color: Z.faint, marginTop: 2 }}>
              Click to browse
            </div>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleFile}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>
      {error && (
        <p style={{ color: Z.coral, fontFamily: Z.font, fontSize: 12, marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}

export function MultipleFileUpload({
  label,
  accept,
  onUpload,
  currentUrls,
}: {
  label: string;
  accept: string;
  onUpload: (urls: string[]) => void;
  currentUrls: string[];
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/wizard/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (json.url) uploaded.push(json.url);
      }
      onUpload([...currentUrls, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    onUpload(currentUrls.filter((u) => u !== url));
  }

  return (
    <div>
      {currentUrls.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {currentUrls.map((url) => (
            <div
              key={url}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: Z.creamMid,
                border: `1px solid ${Z.creamDeep}`,
                borderRadius: 8,
                padding: "5px 10px",
                fontFamily: Z.font,
                fontSize: 12,
              }}
            >
              <span style={{ color: Z.pink, fontWeight: 700 }}>✓</span>
              <span style={{ color: Z.muted, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {url.split("/").pop()}
              </span>
              <button
                onClick={() => remove(url)}
                style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          background: Z.white,
          border: "1.5px dashed #C8B8A4",
          borderRadius: 12,
          cursor: uploading ? "not-allowed" : "pointer",
          fontFamily: Z.font,
        }}
      >
        <span style={{ fontSize: 22, opacity: 0.5 }}>↑</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: Z.charcoal }}>
            {uploading ? "Uploading…" : label}
          </div>
          <div style={{ fontSize: 12, color: Z.faint, marginTop: 2 }}>
            {currentUrls.length} file{currentUrls.length !== 1 ? "s" : ""} uploaded · click to add more
          </div>
        </div>
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFiles}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>
    </div>
  );
}

export function UrlListInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const url = input.trim();
    if (url && !value.includes(url)) {
      onChange([...value, url]);
      setInput("");
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <label
        style={{
          display: "block",
          fontFamily: Z.font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: Z.charcoal,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder ?? "https://…"}
          style={{ ...fieldBase, flex: 1 }}
          onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = Z.pink; el.style.boxShadow = "0 0 0 3px rgba(255,0,126,0.1)"; }}
          onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "#C8B8A4"; el.style.boxShadow = "none"; }}
        />
        <button
          onClick={add}
          style={{
            padding: "12px 18px",
            background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`,
            color: Z.white,
            border: "none",
            borderRadius: 10,
            fontFamily: Z.font,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(250,42,69,0.2)",
          }}
        >
          + Add
        </button>
      </div>
      {value.map((url) => (
        <div
          key={url}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 14px",
            background: Z.creamMid,
            border: `1px solid ${Z.creamDeep}`,
            borderRadius: 8,
            marginBottom: 6,
            fontFamily: Z.font,
          }}
        >
          <span style={{ fontSize: 13, color: Z.pink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: 600 }}>
            {url}
          </span>
          <button
            onClick={() => remove(url)}
            style={{ background: "none", border: "none", color: Z.faint, cursor: "pointer", fontSize: 18, flexShrink: 0, marginLeft: 8, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
      {hint && <p style={{ margin: "6px 0 0", fontFamily: Z.font, fontSize: 12, color: Z.faint }}>{hint}</p>}
    </div>
  );
}
