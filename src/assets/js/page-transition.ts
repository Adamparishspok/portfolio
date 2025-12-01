/**
 * Simple SPA navigation with View Transitions API
 * Keeps background animation persistent during page transitions
 */

function navigate(url: string, shouldScroll = true): void {
  if (!document.startViewTransition) {
    console.log('❌ View Transitions API not supported');
    window.location.href = url;
    return;
  }

  console.log('🚀 Starting View Transition to:', url);

  const targetUrl = new URL(url, window.location.origin);
  const hash = targetUrl.hash;

  document.startViewTransition(async () => {
    console.log('⏳ View Transition callback started');
    
    // Fetch new page (without hash)
    const fetchUrl = url.split('#')[0];
    const response = await fetch(fetchUrl);
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

    // Reset scroll position to top
    if (shouldScroll) {
      window.scrollTo(0, 0);
    }

    // Update URL
    history.pushState(null, '', url);

    // Reinit icons
    if (window.lucide) window.lucide.createIcons();

    // Dispatch event for other scripts (like GSAP animations) to hook into
    document.dispatchEvent(new CustomEvent('navigationcomplete'));
    console.log('🎬 Navigation complete event dispatched');

    // Handle hash scroll after content is loaded
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  });
}

function smoothScrollToHash(hash: string): void {
  const element = document.querySelector(hash);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Intercept link clicks
document.addEventListener('click', (e: MouseEvent) => {
  const link = (e.target as HTMLElement).closest('a');
  if (!link || link.target === '_blank') return;

  const url = new URL(link.href);
  if (url.origin !== location.origin) return;

  const currentUrl = new URL(location.href);
  const isSamePage = url.pathname === currentUrl.pathname;

  // Handle same-page hash links (just scroll)
  if (isSamePage && url.hash) {
    e.preventDefault();
    smoothScrollToHash(url.hash);
    history.pushState(null, '', url.href);
    return;
  }

  // Handle clicking home link while on home page (do nothing)
  if (isSamePage && !url.hash) {
    e.preventDefault();
    return;
  }

  // Handle cross-page navigation
  if (!isSamePage) {
    e.preventDefault();
    navigate(url.href);
  }
});

// Handle back/forward
window.addEventListener('popstate', () => {
  navigate(location.href, false);
});

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

export {};

