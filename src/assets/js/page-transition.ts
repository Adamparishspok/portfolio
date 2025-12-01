/**
 * Simple SPA navigation with View Transitions API
 * Keeps background animation persistent during page transitions
 */

function navigate(url: string): void {
  if (!document.startViewTransition) {
    console.log('❌ View Transitions API not supported');
    window.location.href = url;
    return;
  }

  console.log('🚀 Starting View Transition to:', url);

  document.startViewTransition(async () => {
    console.log('⏳ View Transition callback started');
    
    // Fetch new page
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    // Update title
    document.title = newDoc.title;

    // Update main content innerHTML instead of replacing the element
    const main = document.querySelector('main');
    const newMain = newDoc.querySelector('main');
    if (main && newMain) {
      main.innerHTML = newMain.innerHTML;
      console.log('✅ Main content updated (innerHTML)');
    }

    // Update URL
    history.pushState(null, '', url);

    // Reinit icons
    if (window.lucide) window.lucide.createIcons();

    // Dispatch event for other scripts (like GSAP animations) to hook into
    document.dispatchEvent(new CustomEvent('navigationcomplete'));
    console.log('🎬 Navigation complete event dispatched');
  });
}

// Intercept link clicks
document.addEventListener('click', (e: MouseEvent) => {
  const link = (e.target as HTMLElement).closest('a');
  if (!link || link.target === '_blank') return;

  const url = new URL(link.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname) return;

  e.preventDefault();
  navigate(url.href);
});

// Handle back/forward
window.addEventListener('popstate', () => {
  navigate(location.href);
});

declare global {
  interface Document {
    startViewTransition?: (callback: () => Promise<void>) => void;
  }
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

