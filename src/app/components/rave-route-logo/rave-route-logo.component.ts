import { Component, computed, inject, input } from '@angular/core';
import { AppSettingsStore } from '../../core/settings/app-settings.store';

@Component({
  selector: 'app-rave-route-logo',
  templateUrl: './rave-route-logo.component.html',
  styleUrls: ['./rave-route-logo.component.scss'],
  standalone: true,
})
export class RaveRouteLogoComponent {
  private readonly appSettingsStore = inject(AppSettingsStore);

  readonly variant = input<'default' | 'launch'>('default');
  readonly logoSrc = computed(() =>
    `assets/brand/rave-route-logo-${this.appSettingsStore.themeColour()}-${this.appSettingsStore.appearanceMode()}.svg`,
  );
}
