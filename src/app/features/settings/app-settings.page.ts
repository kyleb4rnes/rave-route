import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonNote,
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppSettingsStore } from '../../core/settings/app-settings.store';
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
    IonInput,
    IonItem,
    IonList,
    IonNote,
    ReactiveFormsModule,
  ],
})
export class AppSettingsPage {
  private readonly location = inject(Location);
  private readonly appSettingsStore = inject(AppSettingsStore);

  readonly saveError = signal<string | null>(null);
  readonly isClosing = signal(false);
  readonly themeColourOptions = themeColourOptions;
  readonly form = new FormGroup({
    homeBackgroundImageUrl: new FormControl(this.appSettingsStore.homeBackgroundImageUrl(), {
      nonNullable: true,
      validators: [Validators.pattern(/^\s*(https?:\/\/|data:image\/).+\s*$/)],
    }),
    themeColour: new FormControl<ThemeColour>(this.appSettingsStore.themeColour(), {
      nonNullable: true,
    }),
  });
  readonly isBackgroundImageInvalid = computed(() => {
    const control = this.form.controls.homeBackgroundImageUrl;

    return control.invalid && control.touched;
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

  closeSettings(): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);
    setTimeout(() => this.location.back(), 650);
  }
}
