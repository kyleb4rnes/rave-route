import { Location } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, homeOutline, settingsOutline } from 'ionicons/icons';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RaveRouteLogoComponent } from '../rave-route-logo/rave-route-logo.component';

addIcons({ chevronBack, homeOutline, settingsOutline });

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, RaveRouteLogoComponent, RouterLink],
})
export class AppHeaderComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly title = input.required<string>();
  readonly showLogo = input(false);
  readonly interceptBack = input(false);
  readonly backRequested = output<void>();
  readonly isHome = computed(() => this.currentUrl() === '/home');
  readonly canGoBack = computed(() => {
    this.currentUrl();

    return (window.history.state?.navigationId ?? 1) > 1;
  });

  goBack(): void {
    if (this.interceptBack()) {
      this.backRequested.emit();

      return;
    }

    this.location.back();
  }
}
