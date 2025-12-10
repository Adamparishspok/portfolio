/**
 * GSAP Content Animations
 * Handles staggered animations for page content on initial load and page transitions
 */

declare global {
  interface Window {
    gsap?: any;
  }
}

// Animation configuration
const ANIMATION_CONFIG = {
  hero: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
  },
  section: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    duration: 0.5,
    stagger: 0.15,
    delay: 0.3,
    ease: 'power2.out',
  },
};

// Store active animations for cleanup
let activeAnimations: any[] = [];

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Kill all active animations
 */
function killActiveAnimations(): void {
  activeAnimations.forEach((anim) => {
    if (anim && typeof anim.kill === 'function') {
      anim.kill();
    }
  });
  activeAnimations = [];
}

/**
 * Animate content elements
 */
function animateContent(): void {
  // Check if GSAP is loaded
  if (!window.gsap) {
    console.warn('GSAP not loaded, skipping animations');
    return;
  }

  // Skip animations if user prefers reduced motion
  if (prefersReducedMotion()) {
    // Immediately show all content (CSS already handles this)
    window.gsap.set('[data-animate]', { opacity: 1, filter: 'blur(0px)', y: 0, clearProps: 'all' });
    return;
  }

  // Kill any existing animations
  killActiveAnimations();

  const gsap = window.gsap;

  // Animate hero elements first - using .to() to animate TO visible
  const heroElements = document.querySelectorAll('[data-animate="hero"]');
  if (heroElements.length > 0) {
    const heroAnim = gsap.to(heroElements, ANIMATION_CONFIG.hero);
    activeAnimations.push(heroAnim);
  }

  // Animate sections after hero - using .to() to animate TO visible
  const sectionElements = document.querySelectorAll('[data-animate="section"]');
  if (sectionElements.length > 0) {
    const sectionAnim = gsap.to(sectionElements, ANIMATION_CONFIG.section);
    activeAnimations.push(sectionAnim);
  }

  // Animate cards/items if present - using .to() to animate TO visible
  const cardElements = document.querySelectorAll('[data-animate="card"]');
  if (cardElements.length > 0) {
    const cardAnim = gsap.to(cardElements, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.5,
      ease: 'power2.out',
    });
    activeAnimations.push(cardAnim);
  }

  // Animate sidebar items - using .to() to animate TO visible
  const sidebarElements = document.querySelectorAll('[data-animate="sidebar-item"]');
  if (sidebarElements.length > 0) {
    const sidebarAnim = gsap.to(sidebarElements, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      delay: 0.4,
      ease: 'power2.out',
    });
    activeAnimations.push(sidebarAnim);
  }
}

/**
 * Initialize animations on page load
 */
function initAnimations(): void {
  // Wait for GSAP to be available
  if (window.gsap) {
    animateContent();
  } else {
    // Wait for GSAP to load
    const checkGsap = setInterval(() => {
      if (window.gsap) {
        clearInterval(checkGsap);
        animateContent();
      }
    }, 50);

    // Timeout after 2 seconds - show content if GSAP fails to load
    setTimeout(() => {
      clearInterval(checkGsap);
      if (!window.gsap) {
        console.warn('GSAP failed to load, showing content immediately');
        // Force show all animated elements
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.filter = 'none';
          (el as HTMLElement).style.transform = 'none';
        });
      }
    }, 2000);
  }
}

// Run on initial page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Run on page transitions (triggered by page-transition.ts)
document.addEventListener('navigationcomplete', () => {
  animateContent();
});

// Handle browser back/forward
window.addEventListener('pageshow', (event) => {
  // Only animate if this is a back/forward navigation (persisted)
  if (event.persisted) {
    animateContent();
  }
});

