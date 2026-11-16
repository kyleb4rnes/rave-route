import { Location } from '@angular/common';
import {
  Component,
  computed,
  afterNextRender,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
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
import {
  chevronBack,
  close,
  helpCircleOutline,
  homeOutline,
  menuOutline,
  settingsOutline,
} from 'ionicons/icons';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RaveRouteLogoComponent } from '../rave-route-logo/rave-route-logo.component';

addIcons({
  chevronBack,
  close,
  helpCircleOutline,
  homeOutline,
  menuOutline,
  settingsOutline,
});

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonButton,
    IonButtons,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    RaveRouteLogoComponent,
    RouterLink,
  ],
})
export class AppHeaderComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly menu = viewChild<ElementRef<HTMLDivElement>>('menu');
  private readonly menuTrigger = viewChild.required<unknown, ElementRef<HTMLElement>>('menuTrigger', { read: ElementRef });
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly title = input.required<string>();
  readonly showLogo = input(false);
  readonly interceptBack = input(false);
  readonly backRequested = output<void>();
  readonly settingsRequested = output<void>();
  readonly menuOpen = signal(false);
  readonly isHome = computed(() => this.currentUrl() === '/home');
  readonly isSettings = computed(() => this.currentUrl() === '/settings');
  readonly isHelp = computed(() => this.currentUrl() === '/help');
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

  openSettings(): void {
    this.menuOpen.set(false);
    if (this.isSettings()) {
      this.settingsRequested.emit();

      return;
    }

    void this.router.navigate(['/settings']);
  }

  openHelp(): void {
    this.menuOpen.set(false);
    if (this.isHelp()) {
      this.goBack();

      return;
    }

    void this.router.navigate(['/help']);
  }

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
      return;
    }

    this.menuOpen.set(true);
    afterNextRender(() => {
      this.menu()?.nativeElement.querySelector('button')?.focus();
    }, { injector: this.injector });
  }

  handleMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.closeMenu();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      this.menuTrigger().nativeElement.shadowRoot?.querySelector<HTMLElement>('[part="native"]')?.focus();
      return;
    }

    const menu = this.menu()?.nativeElement;
    if (!menu || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const items = Array.from(menu.querySelectorAll('button'));
    const index = items.findIndex((item) => item === event.target);
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (index + offset + items.length) % items.length;

    if (event.key === 'Home') {
      items[0]?.focus();
    } else if (event.key === 'End') {
      items.at(-1)?.focus();
    } else {
      items[nextIndex]?.focus();
    }
  }

  handleMenuFocusout(event: FocusEvent): void {
    const target = event.relatedTarget;
    if (target !== this.menuTrigger().nativeElement &&
      !(target instanceof Node && this.menu()?.nativeElement.contains(target))) {
      this.closeMenu();
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
