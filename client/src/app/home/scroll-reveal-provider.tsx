'use client';

import { useEffect } from 'react';

const SCROLL_REVEAL_SELECTOR = '[data-scroll-reveal]';

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export default function ScrollRevealProvider() {
  useEffect(() => {
    let elements: HTMLElement[] = [];

    const refreshElements = () => {
      elements = Array.from(
        document.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR)
      );
    };

    refreshElements();

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;

      if (prefersReducedMotion.matches) {
        elements.forEach((element) => {
          element.style.opacity = '1';
          element.style.transform = 'none';
        });
        return;
      }

      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.92;
      const end = viewportHeight * 0.6;
      const travel = start - end;

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const progress = clamp((start - rect.top) / travel);
        const translateY = Math.round((1 - progress) * 18);

        element.style.opacity = progress.toFixed(3);
        element.style.transform = `translateY(${translateY}px)`;
        element.style.transition =
          'opacity 120ms linear, transform 120ms linear';
      });
    };

    const requestUpdate = () => {
      if (animationFrame) return;

      animationFrame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    prefersReducedMotion.addEventListener('change', requestUpdate);
    const observer = new MutationObserver(() => {
      refreshElements();
      requestUpdate();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      prefersReducedMotion.removeEventListener('change', requestUpdate);
      observer.disconnect();
    };
  }, []);

  return null;
}
