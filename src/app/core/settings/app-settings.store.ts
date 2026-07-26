import { computed, inject, Injectable, signal } from '@angular/core';
import { ImageStorageService } from '../images/image-storage.service';
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
  private readonly imageStorage = inject(ImageStorageService);
  private readonly settingsSignal = signal<StoredAppSettings>(this.readSettings());

  readonly homeBackgroundImageUrl = computed(() => this.settingsSignal().homeBackgroundImageUrl ?? '');
  readonly themeColour = computed(() => this.settingsSignal().themeColour ?? 'red');
  readonly appearanceMode = computed(() => this.settingsSignal().appearanceMode ?? 'light');

  constructor() {
    void this.migrateStoredBackgroundImage();
  }

  async saveSettings(imageUrl: string, themeColour: ThemeColour, appearanceMode: AppearanceMode): Promise<boolean> {
    try {
      const previousImageUrl = this.settingsSignal().homeBackgroundImageUrl;
      const homeBackgroundImageUrl = await this.imageStorage.storeImage(imageUrl.trim());
      const settings: StoredAppSettings = {
        themeColour,
        appearanceMode,
        ...(homeBackgroundImageUrl ? { homeBackgroundImageUrl } : {}),
      };

      localStorage.setItem(storageKey, JSON.stringify(settings));
      this.settingsSignal.set(settings);
      if (previousImageUrl !== homeBackgroundImageUrl) {
        void this.imageStorage.removeImage(previousImageUrl);
      }

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

  private async migrateStoredBackgroundImage(): Promise<void> {
    const settings = this.settingsSignal();
    const homeBackgroundImageUrl = settings.homeBackgroundImageUrl;

    if (!homeBackgroundImageUrl) {
      return;
    }

    try {
      const migratedImageUrl = await this.imageStorage.storeImage(homeBackgroundImageUrl);

      if (migratedImageUrl === homeBackgroundImageUrl) {
        return;
      }

      const migratedSettings = { ...settings, homeBackgroundImageUrl: migratedImageUrl };
      localStorage.setItem(storageKey, JSON.stringify(migratedSettings));
      this.settingsSignal.set(migratedSettings);
    } catch {
      // Preserve the old image if migration cannot complete, rather than losing it.
    }
  }
}
