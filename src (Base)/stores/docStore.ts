// store/docStore.ts

"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { features } from "@/config/features";
import { getItem, setItem, removeItem } from "@/lib/storagezdomin/storage"; // ajusta path a tu /lib/storage.ts
import type { DocumentModel, DetailRow } from "@/types/document";

const AUTOSAVE_KEY = "current_document";

function nowISO() {
  return new Date().toISOString();
}

function createEmptyDoc(): DocumentModel {
  return {
    schemaVersion: 1,
    meta: {
      id: nanoid(),
      status: "editing",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      title: "Documentación Mesa de Servicios",
    },
    primary: {},
    details: { rows: [] },
  };
}

type DocState = {
  step: 1 | 2 | 3;
  doc: DocumentModel;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setStep: (step: 1 | 2 | 3) => void;

  updatePrimary: (patch: Partial<DocumentModel["primary"]>) => void;

  addRow: () => void;
  updateRow: (rowId: string, patch: Partial<DetailRow>) => void;
  deleteRow: (rowId: string) => void;

  resetAll: () => Promise<void>;
};

export const useDocStore = create<DocState>((set, get) => ({
  step: 1,
  doc: createEmptyDoc(),
  hydrated: false,

  hydrate: async () => {
    if (!features.autosave) {
      set({ hydrated: true });
      return;
    }

    const saved = await getItem<DocumentModel>(AUTOSAVE_KEY);
    if (saved) {
      set({
        doc: saved,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },

  setStep: (step) => set({ step }),

  updatePrimary: (patch) => {
    const state = get();
    const next: DocumentModel = {
      ...state.doc,
      meta: { ...state.doc.meta, updatedAt: nowISO() },
      primary: { ...state.doc.primary, ...patch },
    };
    set({ doc: next });

    if (features.autosave) {
      void setItem(AUTOSAVE_KEY, next);
    }
  },

  addRow: () => {
    const state = get();
    const newRow: DetailRow = { id: nanoid() };

    const next: DocumentModel = {
      ...state.doc,
      meta: { ...state.doc.meta, updatedAt: nowISO() },
      details: { rows: [...state.doc.details.rows, newRow] },
    };

    set({ doc: next });
    if (features.autosave) void setItem(AUTOSAVE_KEY, next);
  },

  updateRow: (rowId, patch) => {
    const state = get();
    const rows = state.doc.details.rows.map((r) =>
      r.id === rowId ? { ...r, ...patch } : r
    );

    const next: DocumentModel = {
      ...state.doc,
      meta: { ...state.doc.meta, updatedAt: nowISO() },
      details: { rows },
    };

    set({ doc: next });
    if (features.autosave) void setItem(AUTOSAVE_KEY, next);
  },

  deleteRow: (rowId) => {
    const state = get();
    const rows = state.doc.details.rows.filter((r) => r.id !== rowId);

    const next: DocumentModel = {
      ...state.doc,
      meta: { ...state.doc.meta, updatedAt: nowISO() },
      details: { rows },
    };

    set({ doc: next });
    if (features.autosave) void setItem(AUTOSAVE_KEY, next);
  },

  resetAll: async () => {
    const fresh = createEmptyDoc();
    set({ doc: fresh, step: 1 });
    if (features.autosave) {
      await removeItem(AUTOSAVE_KEY);
      await setItem(AUTOSAVE_KEY, fresh);
    }
  },
}));
