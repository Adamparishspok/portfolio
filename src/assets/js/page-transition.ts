/**
 * PageTransition - Handles smooth client-side page transitions
 */

interface Motion {
  to(element: HTMLElement, options: AnimationOptions): Promise<void>;
  from(element: HTMLElement, options: AnimationOptions): Promise<void>;
}

interface AnimationOptions {
  opacity?: number;
  y?: number;
  duration?: number;
  delay?: number;
}

interface ViewTransition {
  finished: Promise<void>;
}

declare global {
  interface Window {
    Motion?: Motion;
    lucide?: {
      createIcons(): void;
    };
    posthog?: {
      capture(event: string, properties?: Record<string, any>): void;
    };
    TextScramble?: new (element: HTMLElement) => {
      setText(text: string): void;
    };
    HolographicEffect?: new (element: HTMLElement) => void;
  }

  interface Document {
    startViewTransition(callback: () => void): ViewTransition;
  }
}

export class PageTransition {
  private mainContent: HTMLElement | null;
  private overlay: HTMLElement | null;
  private isTransitioning: boolean;
  private supportsVT: boolean;

  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.overlay = document.getElementById('page-transition');
    this.isTransitioning = false;
    this.supportsVT = 'startViewTransition' in document;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.animateInitialContent();
  }

  private bindEvents(): void {
    document.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('popstate', () => this.handleNavigation(location.href));
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement | null;
    if (!link) return;

    const href = link.href;
    const url = new URL(href, location.href);

    // Skip external links, downloads, etc.
    if (
      url.origin !== location.origin ||
      link.hasAttribute('download') ||
      link.hasAttribute('target') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      return;
    }

    e.preventDefault();

    // Handle hash-only navigation
    if (url.pathname === location.pathname && url.hash) {
      history.replaceState(null, '', url.hash);
      this.scrollToHash(url.hash.slice(1));
      return;
    }

    this.handleNavigation(href);
  }

  private async handleNavigation(url: string): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const targetUrl = new URL(url, location.href);
    const hash = targetUrl.hash.slice(1);

    // Build the fetch URL - append .html if needed
    let fetchUrl = targetUrl.pathname;
    if (fetchUrl === '/' || fetchUrl.endsWith('/')) {
      fetchUrl = fetchUrl + 'index.html';
    } else if (!fetchUrl.endsWith('.html')) {
      fetchUrl = fetchUrl + '.html';
    }
    // Preserve search params if any
    if (targetUrl.search) fetchUrl += targetUrl.search;

    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newContent = doc.querySelector('#main-content');
      const newTitle = doc.querySelector('title')?.textContent || 'Adam Parish';

      if (newContent && this.mainContent) {
        document.title = newTitle;

        if (this.supportsVT && document.startViewTransition) {
          const transition = document.startViewTransition(() => {
            this.mainContent!.innerHTML = newContent.innerHTML;
            this.reinitDynamicContent();
            window.scrollTo(0, 0);
          });
          await transition.finished;
        } else {
          this.showOverlay();
          await window.Motion?.to(this.mainContent, { opacity: 0, duration: 0.3 });
          this.mainContent.innerHTML = newContent.innerHTML;
          this.reinitDynamicContent();
          window.scrollTo(0, 0);
          await window.Motion?.to(this.mainContent, { opacity: 1, duration: 0.5 });
          this.hideOverlay();
        }

        // Use the original URL (not the .html one) for history
        const finalUrl = hash
          ? `${targetUrl.pathname}${targetUrl.search}#${hash}`
          : targetUrl.pathname + targetUrl.search;
        history.pushState({ url: finalUrl }, '', finalUrl);

        this.animateInContent();

        if (hash) {
          setTimeout(() => this.scrollToHash(hash), 100);
        }
      } else {
        // If no #main-content found, fallback to full reload
        location.href = url;
      }
    } catch (_err) {
      // Hard fallback on error
      location.href = url;
    } finally {
      this.isTransitioning = false;
    }
  }

  private scrollToHash(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private animateInitialContent(): void {
    if (!this.mainContent) return;
    const items = this.mainContent.querySelectorAll('[data-animate]');
    items.forEach((item, i) => {
      if (window.Motion) {
        window.Motion.from(item as HTMLElement, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: i * 0.1,
        });
      }
    });
  }

  private animateInContent(): void {
    if (!this.mainContent) return;
    const items = this.mainContent.querySelectorAll('[data-animate]');
    items.forEach((item, i) => {
      if (window.Motion) {
        window.Motion.from(item as HTMLElement, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: i * 0.1,
        });
      }
    });
  }

  private showOverlay(): void {
    if (!this.overlay) return;
    this.overlay.style.pointerEvents = 'auto';
    if (window.Motion) {
      window.Motion.to(this.overlay, { opacity: 1, duration: 0.3 });
    }
  }

  private hideOverlay(): void {
    if (!this.overlay) return;
    if (window.Motion) {
      window.Motion.to(this.overlay, { opacity: 0, duration: 0.3 }).then(() => {
        if (this.overlay) this.overlay.style.pointerEvents = 'none';
      });
    }
  }

  private reinitDynamicContent(): void {
    // Reinitialize Lucide icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Reinitialize text scramble effects
    const TextScrambleClass = window.TextScramble;
    if (TextScrambleClass) {
      const elements = document.querySelectorAll('[data-scramble]');
      elements.forEach((el) => {
        const textContent = (el as HTMLElement).textContent;
        if (textContent) {
          const scrambler = new TextScrambleClass(el as HTMLElement);
          scrambler.setText(textContent);
        }
      });
    }

    // Reinitialize holographic effects
    const HolographicEffectClass = window.HolographicEffect;
    if (HolographicEffectClass) {
      const cards = document.querySelectorAll('[data-holographic]');
      cards.forEach((card) => {
        new HolographicEffectClass(card as HTMLElement);
      });
    }

    // Re-track PostHog page view
    if (window.posthog) {
      window.posthog.capture('$pageview');
    }
  }
}

// Auto-initialize when Motion is available
function initPageTransition(): void {
  if (window.Motion) {
    new PageTransition();
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      if (window.Motion || attempts++ > 100) {
        clearInterval(interval);
        if (window.Motion) {
          new PageTransition();
        }
      }
    }, 50);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageTransition);
} else {
  initPageTransition();
}

