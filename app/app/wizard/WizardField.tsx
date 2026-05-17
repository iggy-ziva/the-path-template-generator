"use client";

import { useState } from "react";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#1a1917",
  border: "1px solid #2a2926",
  borderRadius: "10px",
  color: "#f5f1ea",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
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
    <div style={{ marginBottom: "24px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#aaa", marginBottom: "8px" }}>
        {label} {required && <span style={{ color: "#D4A878" }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555", lineHeight: 1.4 }}>{hint}</p>}
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
      style={fieldStyle}
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
      style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
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
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
      <option value="">Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "20px" }}>
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #1a1917" }}>
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
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        background: "#1a1917",
        border: "1px dashed #2a2926",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "14px",
        color: "#888",
      }}>
        <span style={{ fontSize: "20px" }}>↑</span>
        <div>
          <div style={{ fontWeight: 600, color: "#f5f1ea" }}>{uploading ? "Uploading…" : label}</div>
          {currentUrl && !uploading && <div style={{ fontSize: "12px", color: "#D4A878", marginTop: "2px" }}>✓ File uploaded</div>}
        </div>
        <input type="file" accept={accept} onChange={handleFile} style={{ display: "none" }} disabled={uploading} />
      </label>
      {error && <p style={{ color: "#ff8a8a", fontSize: "12px", marginTop: "6px" }}>{error}</p>}
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {currentUrls.map((url) => (
            <div key={url} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1a1917", borderRadius: "8px", padding: "6px 12px", fontSize: "12px" }}>
              <span style={{ color: "#D4A878" }}>✓</span>
              <span style={{ color: "#888", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url.split("/").pop()}</span>
              <button onClick={() => remove(url)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "14px" }}>×</button>
            </div>
          ))}
        </div>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "#1a1917", border: "1px dashed #2a2926", borderRadius: "10px", cursor: "pointer", fontSize: "14px", color: "#888" }}>
        <span style={{ fontSize: "20px" }}>↑</span>
        <div>
          <div style={{ fontWeight: 600, color: "#f5f1ea" }}>{uploading ? "Uploading…" : label}</div>
          <div style={{ fontSize: "12px", marginTop: "2px" }}>Click to add files ({currentUrls.length} uploaded)</div>
        </div>
        <input type="file" accept={accept} multiple onChange={handleFiles} style={{ display: "none" }} disabled={uploading} />
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
    <div style={{ marginBottom: "24px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#aaa", marginBottom: "8px" }}>{label}</label>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder ?? "https://…"}
          style={{ ...fieldStyle, flex: 1 }}
        />
        <button onClick={add} style={{ padding: "12px 16px", background: "#D4A878", color: "#0f0e0c", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          + Add
        </button>
      </div>
      {value.map((url) => (
        <div key={url} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#1a1917", borderRadius: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "13px", color: "#D4A878", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{url}</span>
          <button onClick={() => remove(url)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "16px", flexShrink: 0, marginLeft: "8px" }}>×</button>
        </div>
      ))}
      {hint && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555" }}>{hint}</p>}
    </div>
  );
}
