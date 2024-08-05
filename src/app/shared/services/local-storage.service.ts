import {
  inject,
  Injectable,
  InjectionToken,
  Provider,
  signal
} from '@angular/core';

const STORAGE_TOKEN = new InjectionToken<Storage>(
  'Web Storage Injection Token'
);

function injectStorage(): Storage {
  return inject(STORAGE_TOKEN);
}

export function provideStorage<T>(instance: T): Provider {
  return { provide: STORAGE_TOKEN, useValue: instance };
}

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  // private readonly _logService = inject(LogService);
  private readonly _localStorage = injectStorage();
  private readonly _isEnabled: boolean;
  private readonly _$key = signal<string | null>(null);
  constructor() {
    if (!window.localStorage) {
      this._isEnabled = false;
      // this._logService.error("Current browser does not support Local Storage");
      return;
    }
    this._isEnabled = true;
    // this._localStorage = window.localStorage;
  }

  set(key: string, value: string): void {
    if (this._isEnabled) {
      this._localStorage.setItem(key, value);
    }
  }

  get(key: string): string {
    if (!this._isEnabled) {
      return '';
    }

    return this._localStorage.getItem(key) || '';
  }

  setObject(key: string, value: unknown): void {
    if (!this._isEnabled) {
      return;
    }
    const stringified = JSON.stringify(value);
    this._localStorage.setItem(key, stringified);

    const storageEvent = new StorageEvent('storage', {
      key: key,
      newValue: stringified,
      storageArea: this._localStorage,
    });

    window.dispatchEvent(storageEvent);

    this._$key.set(key);
  }

  getObject<TType = unknown>(key: string): TType | null {
    if (!this._isEnabled) {
      return null;
    }

    const json = this._localStorage.getItem(key);
    if (!json) {
      return null;
    }

    return JSON.parse(json);
  }

  remove(key: string): void {
    if (!this._isEnabled) {
      return;
    }
    this._localStorage.removeItem(key);
  }

  clear(): void {
    this._localStorage.clear();
  }
}
