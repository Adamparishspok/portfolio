/**
 * Sidebar staggered blur fade animation
 */

declare global {
  interface Window {
    gsap?: any;
  }
}

function initSidebarAnimation(): void {
  // Wait for GSAP to load
  if (!window.gsap) {
    // Retry after a short delay if GSAP isn't loaded yet
    setTimeout(initSidebarAnimation, 50);
    return;
  }

  const { gsap } = window;

  // Animate experience sidebar items
  const experienceItems = document.querySelectorAll('.experience-item');
  if (experienceItems.length > 0) {
    gsap.from(experienceItems, {
      opacity: 0,
      filter: 'blur(10px)',
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }

  // Animate project metadata sections
  const metadataSections = document.querySelectorAll('.metadata-section');
  if (metadataSections.length > 0) {
    gsap.from(metadataSections, {
      opacity: 0,
      filter: 'blur(10px)',
      y: 20,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebarAnimation);
} else {
  initSidebarAnimation();
}

// Re-initialize after page transitions
document.addEventListener('navigationcomplete', initSidebarAnimation);

