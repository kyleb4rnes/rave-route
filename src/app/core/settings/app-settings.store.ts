import { computed, Injectable, signal } from '@angular/core';

type StoredAppSettings = {
  homeBackgroundImageUrl?: string;
};

const storageKey = 'rave-route.settings.v1';

@Injectable({ providedIn: 'root' })
export class AppSettingsStore {
  private readonly settingsSignal = signal<StoredAppSettings>(this.readSettings());

  readonly homeBackgroundImageUrl = computed(() => this.settingsSignal().homeBackgroundImageUrl ?? '');

  saveHomeBackgroundImageUrl(imageUrl: string): boolean {
    const homeBackgroundImageUrl = imageUrl.trim();
    const settings = homeBackgroundImageUrl ? { homeBackgroundImageUrl } : {};

    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
      this.settingsSignal.set(settings);

      return true;
    } catch {
      return false;
    }
  }

  private readSettings(): StoredAppSettings {
    try {
      const storedSettings = localStorage.getItem(storageKey);

      if (!storedSettings) {
        return {};
      }

      const settings = JSON.parse(storedSettings) as StoredAppSettings;

      return typeof settings.homeBackgroundImageUrl === 'string' ? settings : {};
    } catch {
      return {};
    }
  }
}
