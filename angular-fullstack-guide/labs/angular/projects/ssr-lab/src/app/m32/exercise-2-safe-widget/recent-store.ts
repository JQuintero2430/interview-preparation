import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { LAB_M32_EX2_KEY, labM32Ex2Parse } from './recent-list';

/** Where the recent items live; the component asks for this, never for `localStorage`. */
export interface LabM32Ex2RecentStore {
  read(): string[];
  write(items: readonly string[]): void;
}

export const LAB_M32_EX2_RECENT_STORE = new InjectionToken<LabM32Ex2RecentStore>('lab-m32-ex2 recent store');

class LabM32Ex2BrowserStore implements LabM32Ex2RecentStore {
  constructor(private readonly storage: Storage) {}

  read(): string[] {
    return labM32Ex2Parse(this.storage.getItem(LAB_M32_EX2_KEY));
  }

  write(items: readonly string[]): void {
    this.storage.setItem(LAB_M32_EX2_KEY, items.join(','));
  }
}

const NO_STORE: LabM32Ex2RecentStore = { read: () => [], write: () => undefined };

/** The browser gets the `localStorage` store; every other platform gets one that stores nothing. */
export function labM32Ex2RecentStoreFactory(): LabM32Ex2RecentStore {
  const storage = isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).defaultView?.localStorage : undefined;
  return storage ? new LabM32Ex2BrowserStore(storage) : NO_STORE;
}
