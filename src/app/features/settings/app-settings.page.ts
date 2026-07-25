import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonNote,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppSettingsStore } from '../../core/settings/app-settings.store';
import { AppearanceMode, appearanceModeOptions } from '../../core/settings/appearance-modes';
import { ThemeColour, themeColourOptions } from '../../core/settings/theme-colours';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.page.html',
  styleUrls: ['./app-settings.page.scss'],
  standalone: true,
  imports: [
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonNote,
    ReactiveFormsModule,
  ],
})
export class AppSettingsPage {
  private readonly location = inject(Location);
  private readonly appSettingsStore = inject(AppSettingsStore);

  readonly saveError = signal<string | null>(null);
  readonly imageSelectionError = signal<string | null>(null);
  readonly isClosing = signal(false);
  readonly themeColourOptions = themeColourOptions;
  readonly appearanceModeOptions = appearanceModeOptions;
  readonly form = new FormGroup({
    homeBackgroundImageUrl: new FormControl(this.appSettingsStore.homeBackgroundImageUrl(), { nonNullable: true }),
    themeColour: new FormControl<ThemeColour>(this.appSettingsStore.themeColour(), {
      nonNullable: true,
    }),
    appearanceMode: new FormControl<AppearanceMode>(this.appSettingsStore.appearanceMode(), {
      nonNullable: true,
    }),
  });
  saveSettings(): void {
    this.form.markAllAsTouched();
    this.saveError.set(null);

    if (this.form.invalid) {
      return;
    }

    const saved = this.appSettingsStore.saveSettings(
      this.form.controls.homeBackgroundImageUrl.value,
      this.form.controls.themeColour.value,
      this.form.controls.appearanceMode.value,
    );

    if (!saved) {
      this.saveError.set('We could not save your settings. Please try again.');

      return;
    }

    this.closeSettings();
  }

  selectThemeColour(themeColour: ThemeColour): void {
    this.form.controls.themeColour.setValue(themeColour);
  }

  selectAppearanceMode(appearanceMode: AppearanceMode): void {
    this.form.controls.appearanceMode.setValue(appearanceMode);
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

      if (photo.dataUrl) {
        this.form.controls.homeBackgroundImageUrl.setValue(photo.dataUrl);
      }
    } catch {
      this.imageSelectionError.set('We could not select that image. Please try again.');
    }
  }

  clearBackgroundImage(): void {
    this.form.controls.homeBackgroundImageUrl.setValue('');
  }

  closeSettings(): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);
    setTimeout(() => this.location.back(), 650);
  }
}
