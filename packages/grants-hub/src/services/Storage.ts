/* eslint-disable */

export interface IStorageItem {
  key: string;

  value: any;
}

export class StorageItem {
  key: string;

  value: any;

  constructor(data: IStorageItem) {
    this.key = data.key;
    this.value = data.value;
  }
}

export type StorageSizeInfo = { spaceUsed: number; spaceLeft: number };

export class LocalStorage {
  supported: boolean;

  constructor() {
    this.supported =
      typeof window["localStorage"] !== "undefined" &&
      window["localStorage"] !== null;
  }

  add(key: string, item: string) {
    if (this.getStorageSizeInfo().spaceLeft < 0.5) {
      this.clear();
    }
    localStorage.setItem(key, item);
  }

  getAllItems(): Array<StorageItem> {
    const list = new Array<StorageItem>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) {
        continue;
      }
      const value = localStorage.getItem(key);

      list.push(
        new StorageItem({
          key: key,
          value: value,
        })
      );
    }

    return list;
  }

  getAllValues(): Array<any> {
    const list = new Array<any>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) {
        continue;
      }

      const value = localStorage.getItem(key);

      list.push(value);
    }

    return list;
  }

  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  getStorageSizeInfo(): StorageSizeInfo {
    let lsTotal = 0,
      itemLen,
      item;
    for (item in localStorage) {
      if (!localStorage.hasOwnProperty(item)) continue;
      itemLen = (localStorage[item].length + item.length) * 2;
      lsTotal += itemLen;
    }
    return {
      spaceUsed: 5120 / 1024 - lsTotal / 1024,
      spaceLeft: lsTotal / 1024,
    };
  }
}
