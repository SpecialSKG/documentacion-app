// lib/storage.ts
import localforage from "localforage";

export const docStorage = localforage.createInstance({
  name: "docms",
  storeName: "autosave_v1",
});

export async function getItem<T>(key: string): Promise<T | null> {
  return (await docStorage.getItem<T>(key)) ?? null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await docStorage.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  await docStorage.removeItem(key);
}
