import { useState, useEffect } from 'react';

/**
 * Custom Hook: Detects low-end devices or user preferences
 * - Few CPU cores (<= 4)
 * - Small mobile screens with limited GPU
 * - Missing WebGL context
 * - prefers-reduced-motion media query
 */
export default function useIsLowEnd() {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsLowEnd(true);
      return;
    }

    // 2. Hardware Concurrency check
    const cores = navigator.hardwareConcurrency || 4;
    const isSmallScreen = window.innerWidth <= 480;

    // 3. WebGL support check
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL || (cores <= 2 && isSmallScreen)) {
      setIsLowEnd(true);
    }
  }, []);

  return isLowEnd;
}
