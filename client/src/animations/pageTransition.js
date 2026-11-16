import gsap from 'gsap';

/**
 * Full-screen Red Wipe Page Transition
 * Animates a full-screen red canvas slice covering and uncovering the screen.
 */
export function runPageTransition(onMidpoint) {
  const wipe = document.querySelector('.screen-wipe');
  if (!wipe) {
    if (onMidpoint) onMidpoint();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    if (onMidpoint) onMidpoint();
    return;
  }

  const tl = gsap.timeline();

  tl.set(wipe, { y: '100%', display: 'block' });

  // Wipe up to cover
  tl.to(wipe, {
    y: '0%',
    duration: 0.32,
    ease: 'power2.inOut',
    onComplete: () => {
      if (onMidpoint) onMidpoint();
    }
  });

  // Wipe up out of view
  tl.to(wipe, {
    y: '-100%',
    duration: 0.32,
    ease: 'power2.inOut',
    delay: 0.05,
    onComplete: () => {
      gsap.set(wipe, { y: '100%' });
    }
  });
}
