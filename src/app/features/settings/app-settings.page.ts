import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonContent } from '@ionic/angular/ion-content';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppSettingsStore, BackgroundImagePosition } from '../../core/settings/app-settings.store';
import { ImageStorageService } from '../../core/images/image-storage.service';
import { AppearanceMode, appearanceModeOptions } from '../../core/settings/appearance-modes';
import { ThemeColour, themeColourOptions } from '../../core/settings/theme-colours';
import { AppLanguage, appLanguageOptions } from '../../core/i18n/app-language';
import { TranslationKey, TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.page.html',
  styleUrls: ['./app-settings.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
  ],
})
export class AppSettingsPage {
  private readonly router = inject(Router);
  private readonly appSettingsStore = inject(AppSettingsStore);
  private readonly imageStorage = inject(ImageStorageService);
  private readonly translationService = inject(TranslationService);

  readonly imageSelectionError = signal<string | null>(null);
  readonly imagePreviewUrl = signal('');
  readonly themeColourOptions = themeColourOptions;
  readonly appearanceModeOptions = appearanceModeOptions;
  readonly appLanguageOptions = appLanguageOptions;
  readonly themeColour = this.appSettingsStore.themeColour;
  readonly appearanceMode = this.appSettingsStore.appearanceMode;
  readonly language = this.appSettingsStore.language;
  private readonly draggedPosition = signal<BackgroundImagePosition | null>(null);
  readonly backgroundImagePosition = computed(() =>
    this.draggedPosition() ?? this.appSettingsStore.homeBackgroundImagePosition()
  );
  readonly hasBackgroundImage = () => Boolean(this.appSettingsStore.homeBackgroundImageUrl());
  private backgroundDrag: {
    pointerId: number;
    startX: number;
    startY: number;
    position: BackgroundImagePosition;
    width: number;
    height: number;
  } | null = null;
  readonly t = (key: TranslationKey): string => this.translationService.translate(key);

  constructor() {
    this.resolveImagePreview(this.appSettingsStore.homeBackgroundImageUrl());
  }

  selectThemeColour(themeColour: ThemeColour): void {
    this.appSettingsStore.updateAppearance(themeColour, this.appearanceMode());
  }

  selectAppearanceMode(appearanceMode: AppearanceMode): void {
    this.appSettingsStore.updateAppearance(this.themeColour(), appearanceMode);
  }

  selectLanguage(language: AppLanguage): void {
    this.appSettingsStore.updateLanguage(language);
  }

  themeColourLabel(themeColour: ThemeColour): string {
    const keyByTheme: Record<ThemeColour, TranslationKey> = {
      red: 'settings.themeRed',
      blue: 'settings.themeBlue',
      green: 'settings.themeGreen',
      purple: 'settings.themePurple',
      pink: 'settings.themePink',
    };

    return this.t(keyByTheme[themeColour]);
  }

  appearanceModeLabel(appearanceMode: AppearanceMode): string {
    return this.t(appearanceMode === 'light' ? 'settings.light' : 'settings.dark');
  }

  resetAppearance(): void {
    this.appSettingsStore.resetAppearance();
  }

  handleThemeColourKeydown(event: KeyboardEvent, index: number): void {
    const nextIndex = this.getRadioOptionIndex(event.key, index, this.themeColourOptions.length);
    if (nextIndex === null) return;

    event.preventDefault();
    this.selectThemeColour(this.themeColourOptions[nextIndex].id);
    this.focusRadioOption(event.currentTarget, nextIndex);
  }

  handleAppearanceModeKeydown(event: KeyboardEvent, index: number): void {
    const nextIndex = this.getRadioOptionIndex(event.key, index, this.appearanceModeOptions.length);
    if (nextIndex === null) return;

    event.preventDefault();
    this.selectAppearanceMode(this.appearanceModeOptions[nextIndex].id);
    this.focusRadioOption(event.currentTarget, nextIndex);
  }

  async selectBackgroundImage(): Promise<void> {
    this.imageSelectionError.set(null);

    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        width: 1600,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      if (!photo.dataUrl) return;

      const saved = await this.appSettingsStore.updateBackgroundImage(photo.dataUrl);
      if (!saved) {
        this.imageSelectionError.set(this.t('settings.imageSaveError'));
        return;
      }

      this.resolveImagePreview(this.appSettingsStore.homeBackgroundImageUrl());
    } catch {
      this.imageSelectionError.set(this.t('settings.imageSelectError'));
    }
  }

  startBackgroundDrag(event: PointerEvent): void {
    const preview = event.currentTarget as HTMLElement;
    if (this.backgroundDrag || event.button !== 0) return;
    const { width, height } = preview.getBoundingClientRect();
    if (!width || !height) return;
    preview.setPointerCapture(event.pointerId);
    this.backgroundDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      position: this.backgroundImagePosition(),
      width,
      height,
    };
    event.preventDefault();
  }

  moveBackgroundDrag(event: PointerEvent): void {
    if (!this.backgroundDrag || this.backgroundDrag.pointerId !== event.pointerId) return;

    const drag = this.backgroundDrag;
    this.draggedPosition.set({
      x: Math.max(0, Math.min(100, drag.position.x - ((event.clientX - drag.startX) / drag.width) * 100)),
      y: Math.max(0, Math.min(100, drag.position.y - ((event.clientY - drag.startY) / drag.height) * 100)),
    });
    event.preventDefault();
  }

  endBackgroundDrag(event: PointerEvent): void {
    if (this.backgroundDrag?.pointerId !== event.pointerId) return;

    this.backgroundDrag = null;
    const position = this.draggedPosition();
    this.draggedPosition.set(null);
    if (position && event.type === 'pointerup') {
      this.appSettingsStore.updateBackgroundImagePosition(position);
    }
    const preview = event.currentTarget as HTMLElement;
    if (preview.hasPointerCapture(event.pointerId)) preview.releasePointerCapture(event.pointerId);
  }

  moveBackgroundWithKeyboard(event: KeyboardEvent): void {
    const offsets: Record<string, readonly [number, number]> = {
      ArrowLeft: [5, 0],
      ArrowRight: [-5, 0],
      ArrowUp: [0, 5],
      ArrowDown: [0, -5],
    };
    const offset = offsets[event.key];
    if (!offset || this.backgroundDrag) return;
    event.preventDefault();
    const { x, y } = this.backgroundImagePosition();
    this.appSettingsStore.updateBackgroundImagePosition({ x: x + offset[0], y: y + offset[1] });
  }

  async clearBackgroundImage(): Promise<void> {
    const cleared = await this.appSettingsStore.updateBackgroundImage('');
    if (cleared) this.imagePreviewUrl.set('');
    else this.imageSelectionError.set(this.t('settings.imageRemoveError'));
  }

  closeSettings(): void {
    void this.router.navigate(['/home']);
  }

  private resolveImagePreview(imageUrl: string): void {
    void this.imageStorage.resolveImageUrl(imageUrl)
      .then((resolvedUrl) => {
        if (this.appSettingsStore.homeBackgroundImageUrl() === imageUrl) this.imagePreviewUrl.set(resolvedUrl);
      })
      .catch(() => {
        if (this.appSettingsStore.homeBackgroundImageUrl() === imageUrl) this.imagePreviewUrl.set('');
      });
  }

  private getRadioOptionIndex(key: string, currentIndex: number, optionCount: number): number | null {
    if (key === 'Home') return 0;
    if (key === 'End') return optionCount - 1;
    if (key === 'ArrowRight' || key === 'ArrowDown') return (currentIndex + 1) % optionCount;
    if (key === 'ArrowLeft' || key === 'ArrowUp') return (currentIndex - 1 + optionCount) % optionCount;
    return null;
  }

  private focusRadioOption(currentTarget: EventTarget | null, nextIndex: number): void {
    const radioGroup = (currentTarget as HTMLElement | null)?.closest('[role="radiogroup"]');
    radioGroup?.querySelectorAll<HTMLButtonElement>('[role="radio"]').item(nextIndex)?.focus();
  }
}
