import { computed, inject, Injectable, signal } from '@angular/core';
import { ImageStorageService } from '../images/image-storage.service';
import { AppearanceMode, appearanceModeOptions } from './appearance-modes';
import { ThemeColour, themeColourPresets } from './theme-colours';
import { AppLanguage, defaultAppLanguage, isAppLanguage } from '../i18n/app-language';

type StoredAppSettings = {
  homeBackgroundImageUrl?: string;
  homeBackgroundImagePosition?: BackgroundImagePosition;
  themeColour?: ThemeColour;
  appearanceMode?: AppearanceMode;
  language?: AppLanguage;
};

export type BackgroundImagePosition = { x: number; y: number };

const storageKey = 'rave-route.settings.v1';
const defaultBackgroundImagePosition: BackgroundImagePosition = { x: 50, y: 50 };
const defaultThemeColour: ThemeColour = 'red';
const defaultAppearanceMode: AppearanceMode = 'light';

@Injectable({ providedIn: 'root' })
export class AppSettingsStore {
  private readonly imageStorage = inject(ImageStorageService);
  private readonly settingsSignal = signal<StoredAppSettings>(this.readSettings());

  readonly homeBackgroundImageUrl = computed(() => this.settingsSignal().homeBackgroundImageUrl ?? '');
  readonly homeBackgroundImagePosition = computed(
    () => this.settingsSignal().homeBackgroundImagePosition ?? defaultBackgroundImagePosition
  );
  readonly themeColour = computed(() => this.settingsSignal().themeColour ?? 'red');
  readonly appearanceMode = computed(() => this.settingsSignal().appearanceMode ?? 'light');
  readonly language = computed(() => this.settingsSignal().language ?? defaultAppLanguage);

  constructor() {
    void this.migrateStoredBackgroundImage();
  }

  updateAppearance(themeColour: ThemeColour, appearanceMode: AppearanceMode): void {
    this.persistSettings({ ...this.settingsSignal(), themeColour, appearanceMode });
  }

  resetAppearance(): void {
    this.persistSettings({
      ...this.settingsSignal(),
      themeColour: defaultThemeColour,
      appearanceMode: defaultAppearanceMode,
    });
  }

  updateLanguage(language: AppLanguage): void {
    this.persistSettings({ ...this.settingsSignal(), language });
  }

  async updateBackgroundImage(
    imageUrl: string,
    position: BackgroundImagePosition = defaultBackgroundImagePosition
  ): Promise<boolean> {
    try {
      const previousImageUrl = this.settingsSignal().homeBackgroundImageUrl;
      const homeBackgroundImageUrl = await this.imageStorage.storeImage(imageUrl.trim());
      const settings: StoredAppSettings = {
        ...this.settingsSignal(),
        ...(homeBackgroundImageUrl ? { homeBackgroundImageUrl } : {}),
        ...(homeBackgroundImageUrl
          ? { homeBackgroundImagePosition: normaliseBackgroundImagePosition(position) }
          : {}),
      };

      this.persistSettings(settings);
      if (previousImageUrl !== homeBackgroundImageUrl) {
        void this.imageStorage.removeImage(previousImageUrl);
      }

      return true;
    } catch {
      return false;
    }
  }

  updateBackgroundImagePosition(position: BackgroundImagePosition): void {
    if (!this.homeBackgroundImageUrl()) {
      return;
    }

    this.persistSettings({
      ...this.settingsSignal(),
      homeBackgroundImagePosition: normaliseBackgroundImagePosition(position),
    });
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
        appearanceModeOptions.find(({ id }) => id === settings.appearanceMode)?.id
        ?? defaultAppearanceMode;
      const language = isAppLanguage(settings.language) ? settings.language : defaultAppLanguage;
      const homeBackgroundImagePosition = normaliseStoredBackgroundImagePosition(
        settings.homeBackgroundImagePosition
      );

      return {
        themeColour,
        appearanceMode,
        language,
        ...(homeBackgroundImageUrl
          ? { homeBackgroundImageUrl, homeBackgroundImagePosition }
          : {}),
      };
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
      this.persistSettings(migratedSettings);
    } catch {
      // Preserve the old image if migration cannot complete, rather than losing it.
    }
  }

  private persistSettings(settings: StoredAppSettings): void {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    this.settingsSignal.set(settings);
  }
}

function normaliseStoredBackgroundImagePosition(position: unknown): BackgroundImagePosition {
  if (!position || typeof position !== 'object') {
    return defaultBackgroundImagePosition;
  }

  const { x, y } = position as Partial<BackgroundImagePosition>;

  return normaliseBackgroundImagePosition({ x: Number(x), y: Number(y) });
}

function normaliseBackgroundImagePosition(
  position: BackgroundImagePosition
): BackgroundImagePosition {
  return { x: clampPercentage(position.x), y: clampPercentage(position.y) };
}

function clampPercentage(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;
}
