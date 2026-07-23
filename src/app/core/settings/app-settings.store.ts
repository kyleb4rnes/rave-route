import { computed, Injectable, signal } from '@angular/core';
import { ThemeColour, themeColourPresets } from './theme-colours';

type StoredAppSettings = {
  homeBackgroundImageUrl?: string;
  themeColour?: ThemeColour;
};

const storageKey = 'rave-route.settings.v1';

@Injectable({ providedIn: 'root' })
export class AppSettingsStore {
  private readonly settingsSignal = signal<StoredAppSettings>(this.readSettings());

  readonly homeBackgroundImageUrl = computed(() => this.settingsSignal().homeBackgroundImageUrl ?? '');
  readonly themeColour = computed(() => this.settingsSignal().themeColour ?? 'red');

  saveSettings(imageUrl: string, themeColour: ThemeColour): boolean {
    const homeBackgroundImageUrl = imageUrl.trim();
    const settings: StoredAppSettings = {
      themeColour,
      ...(homeBackgroundImageUrl ? { homeBackgroundImageUrl } : {}),
    };

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

      const homeBackgroundImageUrl =
        typeof settings.homeBackgroundImageUrl === 'string' ? settings.homeBackgroundImageUrl : undefined;
      const themeColour =
        typeof settings.themeColour === 'string' && settings.themeColour in themeColourPresets
          ? settings.themeColour as ThemeColour
          : 'red';

      return { themeColour, ...(homeBackgroundImageUrl ? { homeBackgroundImageUrl } : {}) };
    } catch {
      return {};
    }
  }
}
