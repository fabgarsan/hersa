const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(id: string, context?: string): void {
  if (!UUID_RE.test(id)) {
    throw new Error(`ID inválido${context ? ` en ${context}` : ""}: "${id}"`);
  }
}
