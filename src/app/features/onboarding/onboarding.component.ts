import {
  afterRenderEffect,
  Component,
  ElementRef,
  computed,
  inject,
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
  private readonly stepIndexSignal = signal(0);
  readonly motion = inject(MotionPreference);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('stepHeading');
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('demo');

  readonly steps: readonly OnboardingStep[] = [
    {
      title: 'Find your festival',
      description:
        'Browse the catalogue, search by location or genre, or add a festival of your own.',
      videoSrc: 'assets/onboarding/find-your-festival.webm',
      posterSrc: 'assets/onboarding/find-your-festival.png',
      videoLabel:
        'A demonstration of browsing and searching the festival catalogue',
    },
    {
      title: 'Build your route',
      description:
        'Explore set times, save the artists you cannot miss, and keep an eye on clashes.',
      videoSrc: 'assets/onboarding/build-your-route.webm',
      posterSrc: 'assets/onboarding/build-your-route.png',
      videoLabel: 'A demonstration of saving a must-see set in a line-up',
    },
    {
      title: 'Get festival-ready',
      description:
        'Keep tickets, travel, accommodation, and your packing list together.',
      videoSrc: 'assets/onboarding/get-festival-ready.webm',
      posterSrc: 'assets/onboarding/get-festival-ready.png',
      videoLabel: 'A demonstration of preparing practical festival details',
    },
    {
      title: 'Stay on top of it',
      description:
        'Track your budget, then return home for your next adventure whenever you need it.',
      videoSrc: 'assets/onboarding/stay-on-top.webm',
      posterSrc: 'assets/onboarding/stay-on-top.png',
      videoLabel: 'A demonstration of adding a festival expense',
    },
  ];
  readonly stepIndex = this.stepIndexSignal.asReadonly();
  readonly currentStep = computed(() => this.steps[this.stepIndex()]);
  readonly isFinalStep = computed(
    () => this.stepIndex() === this.steps.length - 1
  );
  readonly canGoBack = computed(() => this.stepIndex() > 0);

  constructor() {
    afterRenderEffect(() => this.heading()?.nativeElement.focus({ preventScroll: true }));
    afterRenderEffect(() => {
      if (this.motion.reduced()) this.video()?.nativeElement.pause();
    });
  }

  next(): void {
    if (this.isFinalStep()) this.skip();
    else this.stepIndexSignal.update((index) => index + 1);
  }

  previous(): void {
    if (this.canGoBack()) this.stepIndexSignal.update((index) => index - 1);
  }

  skip(): void {
    this.host.nativeElement.inert = true;
    this.video()?.nativeElement.pause();
    this.onboardingStore.complete();
  }
}
