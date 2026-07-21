import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonIcon,
  IonItem,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { AppSettingsStore } from '../../core/settings/app-settings.store';

addIcons({ chevronBack });

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.page.html',
  styleUrls: ['./app-settings.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonIcon,
    IonItem,
    IonList,
    IonNote,
    IonTitle,
    IonToolbar,
    ReactiveFormsModule,
  ],
})
export class AppSettingsPage {
  private readonly router = inject(Router);
  private readonly appSettingsStore = inject(AppSettingsStore);

  readonly saveError = signal<string | null>(null);
  readonly isClosing = signal(false);
  readonly form = new FormGroup({
    homeBackgroundImageUrl: new FormControl(this.appSettingsStore.homeBackgroundImageUrl(), {
      nonNullable: true,
      validators: [Validators.pattern(/^\s*(https?:\/\/|data:image\/).+\s*$/)],
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

    const saved = this.appSettingsStore.saveHomeBackgroundImageUrl(
      this.form.controls.homeBackgroundImageUrl.value,
    );

    if (!saved) {
      this.saveError.set('We could not save your settings. Please try again.');

      return;
    }

    this.closeSettings();
  }

  closeSettings(): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);
    setTimeout(() => void this.router.navigate(['/home']), 650);
  }
}
