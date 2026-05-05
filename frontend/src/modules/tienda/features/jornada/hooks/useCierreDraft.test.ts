import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { MockInstance } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCierreDraft } from "./useCierreDraft";
import type { CierreDraft } from "../types";

describe("useCierreDraft", () => {
  let getItemSpy: MockInstance<typeof Storage.prototype.getItem>;
  let setItemSpy: MockInstance<typeof Storage.prototype.setItem>;
  let removeItemSpy: MockInstance<typeof Storage.prototype.removeItem>;

  const validJornadaId = "550e8400-e29b-41d4-a716-446655440000";
  const invalidJornadaId = "not-a-uuid";

  const validDraft: CierreDraft = {
    conteos: [
      {
        productoId: "prod-123",
        productoNombre: "Producto A",
        stockInicial: 100,
        cantidadContada: 95,
      },
    ],
    billetes: [{ denominacion: 50000, cantidad: 5 }],
    totalEfectivoDeclarado: "250000",
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should have null draft when localStorage is empty", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should load draft from localStorage on init if it exists", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      localStorage.setItem(key, JSON.stringify(validDraft));

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toEqual(validDraft);
    });

    it("should handle corrupt JSON gracefully (return null)", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      localStorage.setItem(key, "{ invalid json");

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should ignore data that fails Zod validation", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      // Missing required 'conteos' field
      const invalidData = {
        billetes: [{ denominacion: 50000, cantidad: 5 }],
        totalEfectivoDeclarado: "250000",
      };
      localStorage.setItem(key, JSON.stringify(invalidData));

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });
  });

  describe("saveDraft", () => {
    it("should persist draft to localStorage under correct key", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      const key = `tienda:cierre_draft:${validJornadaId}`;
      const stored = localStorage.getItem(key);
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(validDraft);
    });

    it("should update local draft state after saving", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      expect(result.current.draft).toEqual(validDraft);
    });

    it("should be a no-op with non-UUID jornadaId (no localStorage write)", () => {
      const { result } = renderHook(() => useCierreDraft(invalidJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      expect(setItemSpy).not.toHaveBeenCalled();
      expect(result.current.draft).toBeNull();
    });

    it("should call setItem with correct arguments", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      const key = `tienda:cierre_draft:${validJornadaId}`;
      expect(setItemSpy).toHaveBeenCalledWith(
        key,
        JSON.stringify(validDraft)
      );
    });

    it("should handle multiple saves (overwrites previous draft)", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      const firstDraft: CierreDraft = {
        conteos: [],
        billetes: [],
        totalEfectivoDeclarado: "0",
      };

      act(() => {
        result.current.saveDraft(firstDraft);
      });

      const secondDraft: CierreDraft = {
        conteos: validDraft.conteos,
        billetes: validDraft.billetes,
        totalEfectivoDeclarado: "500000",
      };

      act(() => {
        result.current.saveDraft(secondDraft);
      });

      const key = `tienda:cierre_draft:${validJornadaId}`;
      expect(JSON.parse(localStorage.getItem(key)!)).toEqual(secondDraft);
    });
  });

  describe("clearDraft", () => {
    it("should remove draft from localStorage", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      act(() => {
        result.current.clearDraft();
      });

      const key = `tienda:cierre_draft:${validJornadaId}`;
      expect(localStorage.getItem(key)).toBeNull();
    });

    it("should set local draft state to null", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      expect(result.current.draft).not.toBeNull();

      act(() => {
        result.current.clearDraft();
      });

      expect(result.current.draft).toBeNull();
    });

    it("should be a no-op with non-UUID jornadaId (no localStorage removal)", () => {
      // Pre-populate localStorage with a key for invalid jornada
      const invalidKey = `tienda:cierre_draft:${invalidJornadaId}`;
      localStorage.setItem(invalidKey, JSON.stringify(validDraft));

      const { result } = renderHook(() => useCierreDraft(invalidJornadaId));

      act(() => {
        result.current.clearDraft();
      });

      expect(removeItemSpy).not.toHaveBeenCalled();
      expect(localStorage.getItem(invalidKey)).toBe(JSON.stringify(validDraft));
    });

    it("should handle clearing when no draft exists", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.clearDraft();
      });

      expect(result.current.draft).toBeNull();
      const key = `tienda:cierre_draft:${validJornadaId}`;
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe("readFromStorage", () => {
    it("should return null for non-UUID jornadaId", () => {
      const key = `tienda:cierre_draft:${invalidJornadaId}`;
      localStorage.setItem(key, JSON.stringify(validDraft));

      const { result } = renderHook(() => useCierreDraft(invalidJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should return null when storage key does not exist", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      localStorage.setItem(key, "not valid json at all");

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should return null for incomplete Zod schema (missing conteos)", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      const incomplete = {
        billetes: validDraft.billetes,
        totalEfectivoDeclarado: validDraft.totalEfectivoDeclarado,
        // missing conteos
      };
      localStorage.setItem(key, JSON.stringify(incomplete));

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should return null for incomplete Zod schema (missing billetes)", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      const incomplete = {
        conteos: validDraft.conteos,
        totalEfectivoDeclarado: validDraft.totalEfectivoDeclarado,
        // missing billetes
      };
      localStorage.setItem(key, JSON.stringify(incomplete));

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should return null for incomplete Zod schema (missing totalEfectivoDeclarado)", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      const incomplete = {
        conteos: validDraft.conteos,
        billetes: validDraft.billetes,
        // missing totalEfectivoDeclarado
      };
      localStorage.setItem(key, JSON.stringify(incomplete));

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });

    it("should validate nested conteos structure", () => {
      const key = `tienda:cierre_draft:${validJornadaId}`;
      const invalidConteos = {
        conteos: [
          {
            productoId: "prod-123",
            // missing productoNombre
            stockInicial: 100,
            cantidadContada: 95,
          },
        ],
        billetes: validDraft.billetes,
        totalEfectivoDeclarado: validDraft.totalEfectivoDeclarado,
      };
      localStorage.setItem(key, JSON.stringify(invalidConteos));

      const { result } = renderHook(() => useCierreDraft(validJornadaId));
      expect(result.current.draft).toBeNull();
    });
  });

  describe("storage key format", () => {
    it("should use format 'tienda:cierre_draft:<jornadaId>'", () => {
      const { result } = renderHook(() => useCierreDraft(validJornadaId));

      act(() => {
        result.current.saveDraft(validDraft);
      });

      const expectedKey = `tienda:cierre_draft:${validJornadaId}`;
      expect(localStorage.getItem(expectedKey)).toBeDefined();
    });

    it("should use different keys for different jornadaIds", () => {
      const jornada1 = "550e8400-e29b-41d4-a716-446655440001";
      const jornada2 = "550e8400-e29b-41d4-a716-446655440002";

      const { result: result1 } = renderHook(() => useCierreDraft(jornada1));
      const { result: result2 } = renderHook(() => useCierreDraft(jornada2));

      act(() => {
        result1.current.saveDraft(validDraft);
      });

      const draft2: CierreDraft = {
        ...validDraft,
        totalEfectivoDeclarado: "999999",
      };

      act(() => {
        result2.current.saveDraft(draft2);
      });

      const key1 = `tienda:cierre_draft:${jornada1}`;
      const key2 = `tienda:cierre_draft:${jornada2}`;

      expect(JSON.parse(localStorage.getItem(key1)!)).toEqual(validDraft);
      expect(JSON.parse(localStorage.getItem(key2)!)).toEqual(draft2);
    });
  });
});
