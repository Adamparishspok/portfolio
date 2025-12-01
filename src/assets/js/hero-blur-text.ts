/**
 * Hero Blur Text Animation
 * Animates hero heading with sequential character blur fade-in effect
 */

declare global {
  interface Window {
    gsap?: any;
  }
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Wrap each character in a span
 */
function wrapCharacters(element: HTMLElement): void {
  // Replace <br> tags with spaces before processing
  const brTags = element.querySelectorAll('br');
  brTags.forEach((br) => {
    const space = document.createTextNode(' ');
    br.parentNode?.replaceChild(space, br);
  });
  
  const text = element.textContent || '';
  const chars = text.split('');
  
  element.innerHTML = chars
    .map((char) => {
      // Preserve spaces - wrap in span but mark as space for exclusion from animation
      if (char === ' ') {
        return `<span class="char-space" style="display: inline;"> </span>`;
      }
      return `<span class="char-letter" style="display: inline;">${char}</span>`;
    })
    .join('');
}

/**
 * Animate hero heading with blur fade effect
 */
function animateHeroHeading(): void {
  // Check if GSAP is loaded
  if (!window.gsap) {
    console.warn('GSAP not loaded, skipping hero blur animation');
    return;
  }

  const gsap = window.gsap;
  
  // Find hero heading
  const heroHeading = document.querySelector('[data-hero-blur]') as HTMLElement;
  
  if (!heroHeading) {
    return;
  }

  // Skip animations if user prefers reduced motion
  if (prefersReducedMotion()) {
    gsap.set(heroHeading, { opacity: 1, filter: 'blur(0px)' });
    return;
  }

  // Wrap each character in a span
  wrapCharacters(heroHeading);

  // Get only letter spans (not spaces) for animation
  const chars = heroHeading.querySelectorAll('.char-letter');

  // Set initial state - invisible and blurred
  gsap.set(chars, {
    opacity: 0,
    filter: 'blur(8px)',
  });

  // Animate each character sequentially
  gsap.to(chars, {
    opacity: 1,
    filter: 'blur(0px)',
    duration: 0.5,
    stagger: 0.03,
    ease: 'power2.out',
    delay: 0.2,
  });
}

/**
 * Initialize animation on page load
 */
function initHeroBlurAnimation(): void {
  // Wait for GSAP to be available
  if (window.gsap) {
    animateHeroHeading();
  } else {
    // Wait for GSAP to load
    const checkGsap = setInterval(() => {
      if (window.gsap) {
        clearInterval(checkGsap);
        animateHeroHeading();
      }
    }, 50);

    // Timeout after 2 seconds
    setTimeout(() => clearInterval(checkGsap), 2000);
  }
}

// Run on initial page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroBlurAnimation);
} else {
  initHeroBlurAnimation();
}

// Run on page transitions
document.addEventListener('navigationcomplete', () => {
  animateHeroHeading();
});

// Handle browser back/forward
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    animateHeroHeading();
  }
});

