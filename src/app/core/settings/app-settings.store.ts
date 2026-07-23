import { computed, Injectable, signal } from '@angular/core';
import { AppearanceMode, appearancePalettes } from './appearance-modes';
import { ThemeColour, themeColourPresets } from './theme-colours';

type StoredAppSettings = {
  homeBackgroundImageUrl?: string;
  themeColour?: ThemeColour;
  appearanceMode?: AppearanceMode;
};

const storageKey = 'rave-route.settings.v1';

@Injectable({ providedIn: 'root' })
export class AppSettingsStore {
  private readonly settingsSignal = signal<StoredAppSettings>(this.readSettings());

  readonly homeBackgroundImageUrl = computed(() => this.settingsSignal().homeBackgroundImageUrl ?? '');
  readonly themeColour = computed(() => this.settingsSignal().themeColour ?? 'red');
  readonly appearanceMode = computed(() => this.settingsSignal().appearanceMode ?? 'light');

  saveSettings(imageUrl: string, themeColour: ThemeColour, appearanceMode: AppearanceMode): boolean {
    const homeBackgroundImageUrl = imageUrl.trim();
    const settings: StoredAppSettings = {
      themeColour,
      appearanceMode,
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
      const appearanceMode =
        typeof settings.appearanceMode === 'string' && settings.appearanceMode in appearancePalettes
          ? settings.appearanceMode as AppearanceMode
          : 'light';

      return { themeColour, appearanceMode, ...(homeBackgroundImageUrl ? { homeBackgroundImageUrl } : {}) };
    } catch {
      return {};
    }
  }
}
