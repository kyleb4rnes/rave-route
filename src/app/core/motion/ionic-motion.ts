import { createAnimation } from '@ionic/core/components';

const enterEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
const exitEase = 'cubic-bezier(0.4, 0, 1, 1)';

export function routeMotion(
  _: HTMLElement,
  {
    enteringEl,
    leavingEl,
    direction,
  }: {
    enteringEl: HTMLElement;
    leavingEl?: HTMLElement;
    direction?: 'forward' | 'back';
  }
) {
  const accentSelector = '.settings-page__backdrop, .help-page__backdrop';
  const enteringAccent = enteringEl.querySelector(accentSelector);
  const leavingAccent = leavingEl?.querySelector(accentSelector);
  const duration = enteringAccent ? 420 : 240;
  const animation = createAnimation()
    .duration(duration)
    .easing(enterEase);
  const isBack = direction === 'back';
  const enteringOffset = isBack ? -12 : 16;
  const leavingOffset = isBack ? 8 : -8;

  if (leavingEl) {
    animation.beforeAddWrite(() => leavingEl.setAttribute('aria-hidden', 'true'));
    animation.onFinish((step) => {
      if (step === 0) leavingEl.removeAttribute('aria-hidden');
    });
  }

  if (enteringAccent) {
    animation.addAnimation(createAnimation().addElement(enteringAccent)
      .fromTo('transform', 'scaleY(0)', 'scaleY(1)'));
  }
  if (leavingAccent) {
    animation.addAnimation(createAnimation().addElement(leavingAccent)
      .easing(exitEase).fromTo('transform', 'scaleY(1)', 'scaleY(0)'));
  }

  animation.addAnimation(
    createAnimation()
      .addElement(enteringEl)
      .fromTo('opacity', 1, 1)
      .fromTo(
        'transform',
        `translateX(${enteringOffset}px)`,
        'translateX(0)'
      )
  );

  if (leavingEl) {
    animation.addAnimation(
      createAnimation()
        .addElement(leavingEl)
        .easing(exitEase)
        .fromTo('opacity', 1, 0.35)
        .fromTo(
          'transform',
          'translateX(0)',
          `translateX(${leavingOffset}px)`
        )
    );
  }

  return animation;
}

export function overlayMotion(selector: string, offset: number, entering: boolean) {
  return (base: HTMLElement) => {
    const root = base.shadowRoot ?? base;
    const surface = root.querySelector(selector);
    const backdrop = root.querySelector('ion-backdrop');
    const animation = createAnimation().duration(entering ? 180 : 140)
      .easing(entering ? enterEase : exitEase);
    if (surface) {
      const surfaceAnimation = createAnimation().addElement(surface)
        .fromTo('opacity', entering ? 0 : 1, entering ? 1 : 0);
      if (offset) {
        const shifted = `translateY(${offset}px)`;
        surfaceAnimation.fromTo('transform', entering ? shifted : 'translateY(0)', entering ? 'translateY(0)' : shifted);
      }
      animation.addAnimation(surfaceAnimation);
    }
    if (backdrop) {
      const shown = 'var(--backdrop-opacity)';
      animation.addAnimation(createAnimation().addElement(backdrop)
        .fromTo('opacity', entering ? 0 : shown, entering ? shown : 0));
    }
    return animation;
  };
}
