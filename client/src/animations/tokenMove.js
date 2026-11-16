import gsap from 'gsap';

/**
 * Hop a token along coordinates with a clean arc bounce
 */
export function animateTokenHop(element, fromX, fromY, toX, toY, onComplete) {
  if (!element) {
    if (onComplete) onComplete();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.set(element, { x: toX, y: toY });
    if (onComplete) onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });

  // Move X and Y with an upward bounce arc
  tl.to(element, {
    x: toX,
    y: toY - 14, // jump up
    duration: 0.18,
    ease: 'power1.out'
  });

  tl.to(element, {
    y: toY, // land down
    duration: 0.14,
    ease: 'bounce.out'
  });
}

/**
 * Capture animation: Token shakes rapidly then shrinks into base
 */
export function animateTokenCapture(element, onComplete) {
  if (!element) {
    if (onComplete) onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });

  tl.to(element, {
    x: '+=6',
    yoyo: true,
    repeat: 5,
    duration: 0.05,
    ease: 'power1.inOut'
  });

  tl.to(element, {
    scale: 0,
    opacity: 0,
    duration: 0.25,
    ease: 'back.in(1.7)'
  });
}

/**
 * Pulse animation for tokens that have legal moves available
 */
export function pulseMovableToken(element) {
  if (!element) return null;

  return gsap.to(element, {
    scale: 1.18,
    transformOrigin: '50% 50%',
    repeat: -1,
    yoyo: true,
    duration: 0.55,
    ease: 'sine.inOut'
  });
}
