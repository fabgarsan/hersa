import { useCallback, useState } from "react";

import { cierreDraftSchema } from "../schemas";
import type { CierreDraft, UseCierreDraftReturn } from "../types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_RE.test(id);
}

function buildKey(jornadaId: string): string {
  return `tienda:cierre_draft:${jornadaId}`;
}

function readFromStorage(jornadaId: string): CierreDraft | null {
  if (!isValidUuid(jornadaId)) return null;
  try {
    const raw = localStorage.getItem(buildKey(jornadaId));
    if (!raw) return null;
    const parsed = cierreDraftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function useCierreDraft(jornadaId: string): UseCierreDraftReturn {
  const [draft, setDraft] = useState<CierreDraft | null>(() => readFromStorage(jornadaId));

  const saveDraft = useCallback(
    (newDraft: CierreDraft) => {
      if (!isValidUuid(jornadaId)) return;
      localStorage.setItem(buildKey(jornadaId), JSON.stringify(newDraft));
      setDraft(newDraft);
    },
    [jornadaId],
  );

  const clearDraft = useCallback(() => {
    if (!isValidUuid(jornadaId)) return;
    localStorage.removeItem(buildKey(jornadaId));
    setDraft(null);
  }, [jornadaId]);

  return { draft, saveDraft, clearDraft };
}
