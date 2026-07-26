import { AnimationBuilder, createAnimation } from '@ionic/angular/standalone';

type PageTransitionOptions = {
  direction?: 'back' | 'forward';
  enteringEl?: HTMLElement;
  leavingEl?: HTMLElement;
};

export const raveRoutePageTransition: AnimationBuilder = (_baseEl, options) => {
  const { direction, enteringEl, leavingEl } = options as PageTransitionOptions;

  if (!enteringEl || containsSettingsPage(enteringEl) || containsSettingsPage(leavingEl)) {
    return createAnimation('rave-route-settings-transition').duration(0);
  }

  const movingBack = direction === 'back';
  const enteringOffset = movingBack ? '-0.75rem' : '0.75rem';
  const leavingOffset = movingBack ? '0.5rem' : '-0.5rem';
  const transition = createAnimation('rave-route-page-transition')
    .duration(180)
    .easing('cubic-bezier(0.2, 0, 0, 1)');

  transition.addAnimation(
    createAnimation()
      .addElement(enteringEl)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', `translateY(${enteringOffset})`, 'translateY(0)'),
  );

  if (leavingEl) {
    transition.addAnimation(
      createAnimation()
        .addElement(leavingEl)
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateY(0)', `translateY(${leavingOffset})`),
    );
  }

  return transition;
};

function containsSettingsPage(page: HTMLElement | undefined): boolean {
  return page?.matches('app-settings') || page?.querySelector('app-settings') !== null;
}
