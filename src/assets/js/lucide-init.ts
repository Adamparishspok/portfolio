/**
 * Lucide Icons Initialization
 */

export {}; // Make this an ES module

declare global {
  interface Window {
    lucide?: {
      createIcons(): void;
    };
  }
}

function initLucideIcons(): void {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  } else {
    // Retry if lucide hasn't loaded yet
    setTimeout(initLucideIcons, 50);
  }
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLucideIcons);
} else {
  initLucideIcons();
}

