import {
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { LocalStorageService } from '@shared/services';

export const formStorage = <TValue>(
  key: string
): WritableSignal<TValue | null> => {
  const storage = inject(LocalStorageService);
  const initialValue = storage.getObject<TValue>(key);

  const $value = signal<TValue | null>(initialValue);

  const writeToStorageOnUpdateEffect = effect(() => {
    const updated = $value();
    untracked(() => {
       storage.setObject(key, updated);

    });
  });

  const storageEventListener = (event: StorageEvent) => {
    const isWatchedValueTargeted = event.key === key;
    if (!isWatchedValueTargeted) {
      return;
    }

    const currentValue = $value();
    const newValue = storage.getObject<TValue>(key);

    const hasValueChanged = currentValue !== newValue;

    if (hasValueChanged) {
      $value.set(newValue);
    }
  };


  window.addEventListener('storage', storageEventListener);

  inject(DestroyRef).onDestroy(() => {
    writeToStorageOnUpdateEffect.destroy();
    window.removeEventListener('storage', storageEventListener);
  });

  return $value;
};
