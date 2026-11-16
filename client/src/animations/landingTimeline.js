import gsap from 'gsap';

/**
 * GSAP Landing Page Entrance Timeline
 * - Animates Hero dice pop
 * - Staggers each individual letter of "LUDO"
 * - Fades in tagline & buttons with playful back.out pop
 */
export function animateLandingEntrance(containerRef) {
  if (!containerRef || !containerRef.current) return;

  const ctx = gsap.context(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(['.hero-dice-container', '.letter-char', '.hero-tagline', '.hero-btn-group', '.landing-footer'], {
        opacity: 1,
        y: 0,
        scale: 1
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Hero 3D Dice pops in with gentle bounce
    tl.fromTo(
      '.hero-dice-container',
      { scale: 0.4, opacity: 0, y: -30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );

    // 2. Letters of "LUDO" stagger in
    tl.fromTo(
      '.letter-char',
      { y: 50, opacity: 0, rotate: -8 },
      { y: 0, opacity: 1, rotate: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' },
      '-=0.4'
    );

    // 3. Tagline fades and slides up
    tl.fromTo(
      '.hero-tagline',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 0.9, duration: 0.5 },
      '-=0.2'
    );

    // 4. CTA Buttons pop in together
    tl.fromTo(
      '.hero-btn-group',
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' },
      '-=0.2'
    );

    // 5. Footer fades in softly
    tl.fromTo(
      '.landing-footer',
      { opacity: 0 },
      { opacity: 0.8, duration: 0.4 },
      '-=0.2'
    );
  }, containerRef);

  return () => ctx.revert();
}
