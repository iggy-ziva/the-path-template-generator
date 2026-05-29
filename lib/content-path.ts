/** Get/set nested values by dot path (supports array indices: faqItems[0].answer). */

function parsePath(path: string): (string | number)[] {
  const parts: (string | number)[] = [];
  const re = /([^[.\]]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path)) !== null) {
    if (m[1] !== undefined) parts.push(m[1]);
    else if (m[2] !== undefined) parts.push(Number(m[2]));
  }
  return parts;
}

export function getAtPath(obj: unknown, path: string): unknown {
  const parts = parsePath(path);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[p];
  }
  return cur;
}

export function setAtPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = parsePath(path);
  if (parts.length === 0) return obj;
  const root = structuredClone(obj) as Record<string, unknown>;
  let cur: Record<string, unknown> | unknown[] = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = parts[i + 1];
    if (Array.isArray(cur)) {
      const idx = key as number;
      if (cur[idx] == null || typeof cur[idx] !== "object") {
        cur[idx] = typeof next === "number" ? [] : {};
      }
      cur = cur[idx] as Record<string, unknown> | unknown[];
    } else {
      const k = String(key);
      if (cur[k] == null || typeof cur[k] !== "object") {
        cur[k] = typeof next === "number" ? [] : {};
      }
      cur = cur[k] as Record<string, unknown> | unknown[];
    }
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) cur[last as number] = value;
  else cur[String(last)] = value;
  return root as T;
}

export function deepMergeContent(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...base };
  for (const [key, val] of Object.entries(patch)) {
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMergeContent(out[key] as Record<string, unknown>, val as Record<string, unknown>);
    } else {
      out[key] = val;
    }
  }
  return out;
}
