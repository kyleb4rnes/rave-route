import {
  Component,
  computed,
  DestroyRef,
  afterRenderEffect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { OnboardingStore } from '../../core/onboarding/onboarding.store';
import { MotionPreference } from '../../core/motion/motion-preference';

type OnboardingStep = {
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  videoLabel: string;
};

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class OnboardingComponent {
  private readonly onboardingStore = inject(OnboardingStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stepIndexSignal = signal(0);
  private readonly isChangingSignal = signal(false);
  private readonly isLeavingSignal = signal(false);
  private readonly mediaEnabledSignal = signal(false);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('stepHeading');

  readonly ready = input(false);
  readonly motion = inject(MotionPreference);

  readonly steps: readonly OnboardingStep[] = [
    {
      title: 'Find your festival',
      description:
        'Browse the catalogue, search by location or genre, or add a festival of your own.',
      videoSrc: 'assets/onboarding/find-your-festival.webm',
      posterSrc: 'assets/onboarding/find-your-festival.webp',
      videoLabel:
        'A demonstration of browsing and searching the festival catalogue',
    },
    {
      title: 'Build your route',
      description:
        'Explore set times, save the artists you cannot miss, and keep an eye on clashes.',
      videoSrc: 'assets/onboarding/build-your-route.webm',
      posterSrc: 'assets/onboarding/build-your-route.webp',
      videoLabel: 'A demonstration of saving a must-see set in a line-up',
    },
    {
      title: 'Get festival-ready',
      description:
        'Keep tickets, travel, accommodation, and your packing list together.',
      videoSrc: 'assets/onboarding/get-festival-ready.webm',
      posterSrc: 'assets/onboarding/get-festival-ready.webp',
      videoLabel: 'A demonstration of preparing practical festival details',
    },
    {
      title: 'Stay on top of it',
      description:
        'Track your budget, then return home for your next adventure whenever you need it.',
      videoSrc: 'assets/onboarding/stay-on-top.webm',
      posterSrc: 'assets/onboarding/stay-on-top.webp',
      videoLabel: 'A demonstration of adding a festival expense',
    },
  ];
  readonly stepIndex = this.stepIndexSignal.asReadonly();
  readonly isChanging = this.isChangingSignal.asReadonly();
  readonly isLeaving = this.isLeavingSignal.asReadonly();
  readonly mediaEnabled = this.mediaEnabledSignal.asReadonly();
  readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  readonly currentStep = computed(() => this.steps[this.stepIndex()]);
  readonly isFinalStep = computed(
    () => this.stepIndex() === this.steps.length - 1
  );
  readonly canGoBack = computed(() => this.stepIndex() > 0);

  constructor() {
    const mediaTimer = setTimeout(() => this.enableMedia(), 8000);
    this.destroyRef.onDestroy(() => clearTimeout(mediaTimer));
    afterRenderEffect(() => {
      this.stepIndex();
      this.heading()?.nativeElement.focus({ preventScroll: true });
    });
    afterRenderEffect(() => {
      if (this.ready()) this.enableMedia();
    });
  }

  enableMedia(): void {
    this.mediaEnabledSignal.set(true);
  }

  next(): void {
    if (this.isChanging()) {
      return;
    }

    if (this.isFinalStep()) {
      this.leaveOnboarding();

      return;
    }

    this.enableMedia();
    this.changeStep(this.stepIndex() + 1);
  }

  previous(): void {
    if (this.canGoBack() && !this.isChanging()) {
      this.enableMedia();
      this.changeStep(this.stepIndex() - 1);
    }
  }

  skip(): void {
    this.leaveOnboarding();
  }

  private changeStep(nextIndex: number): void {
    this.isChangingSignal.set(true);
    setTimeout(() => {
      this.stepIndexSignal.set(nextIndex);
      this.isChangingSignal.set(false);
    }, 170);
  }

  private leaveOnboarding(): void {
    if (this.isLeaving()) {
      return;
    }

    this.isLeavingSignal.set(true);
    setTimeout(() => this.onboardingStore.complete(), 520);
  }
}
