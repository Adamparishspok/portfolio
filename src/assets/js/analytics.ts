// Portfolio Analytics - Track user interactions and engagement
// Requires PostHog to be loaded first

interface PostHogCaptureProperties {
  [key: string]: string | number | undefined;
}

interface PostHog {
  capture(event: string, properties?: PostHogCaptureProperties): void;
}

declare global {
  interface Window {
    posthog: PostHog;
  }
}

class PortfolioAnalytics {
  private pageLoadTime: number;

  constructor() {
    this.pageLoadTime = Date.now();
    this.init();
  }

  private init(): void {
    this.trackNavigationClicks();
    this.trackProjectClicks();
    this.trackContactInteractions();
    this.trackSectionVisibility();
    this.trackScrollDepth();
    this.trackTimeOnPage();
    this.handleAnchorScroll();
  }

  // Handle scrolling to anchor elements on page load
  private handleAnchorScroll(): void {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # from the hash
      const targetId = hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Wait a bit for the page to fully load, then scroll smoothly
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }

  // Track navigation menu clicks
  private trackNavigationClicks(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      if (!e.target || typeof (e.target as HTMLElement).closest !== 'function') return;
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      const text = link.textContent?.trim() || '';

      // Navigation links
      if (href === '#' || href === '/') {
        window.posthog.capture('navigation_click', {
          section: 'home',
          text: text,
          type: 'internal'
        });
      } else if (href === '#about' || href === '/#about') {
        window.posthog.capture('navigation_click', {
          section: 'about',
          text: text,
          type: 'internal'
        });
      }
      // Social media links
      else if (href?.includes('linkedin.com')) {
        window.posthog.capture('social_link_click', {
          platform: 'linkedin',
          url: href,
          type: 'external'
        });
      } else if (href?.includes('dribbble.com')) {
        window.posthog.capture('social_link_click', {
          platform: 'dribbble',
          url: href,
          type: 'external'
        });
      } else if (href?.includes('github.com')) {
        window.posthog.capture('social_link_click', {
          platform: 'github',
          url: href,
          type: 'external'
        });
      }
      // Project links
      else if (href?.startsWith('/mobile') || href?.startsWith('/startup')) {
        const projectCard = link.closest('[id]');
        const projectId = projectCard?.id || 'unknown';
        const projectName = projectCard?.querySelector('h3')?.textContent || 'unknown';

        window.posthog.capture('project_click', {
          project_id: projectId,
          project_name: projectName,
          url: href,
          type: 'internal'
        });
      }
    });
  }

  // Track project card interactions
  private trackProjectClicks(): void {
    // Track hover events on project cards (engagement signal)
    document.addEventListener('mouseenter', (e: MouseEvent) => {
      if (!e.target || typeof (e.target as HTMLElement).closest !== 'function') return;
      const projectCard = (e.target as HTMLElement).closest('[id*="financial"], [id*="startup"], [id*="banking"], [id*="monitor"]');
      if (projectCard) {
        const projectId = projectCard.id;
        const projectName = projectCard.querySelector('h3')?.textContent || 'unknown';

        window.posthog.capture('project_hover', {
          project_id: projectId,
          project_name: projectName,
          duration: 0 // Will be tracked if they hover long enough
        });

        // Track hover duration
        let hoverStart = Date.now();
        const trackHoverDuration = (): void => {
          const duration = Date.now() - hoverStart;
          if (duration > 1000) { // Only track if hover > 1 second
            window.posthog.capture('project_hover_duration', {
              project_id: projectId,
              project_name: projectName,
              duration_ms: duration
            });
          }
        };

        projectCard.addEventListener('mouseleave', trackHoverDuration, { once: true });
      }
    }, true);
  }

  // Track contact interactions
  private trackContactInteractions(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      if (!e.target || typeof (e.target as HTMLElement).closest !== 'function') return;
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;

      const href = link.getAttribute('href');

      // Email links
      if (href?.startsWith('mailto:')) {
        window.posthog.capture('contact_click', {
          type: 'email',
          email: href.replace('mailto:', ''),
          location: this.getElementLocation(link)
        });
      }
      // Resume download
      else if (link.textContent?.toLowerCase().includes('download resume') || link.textContent?.toLowerCase().includes('resume')) {
        window.posthog.capture('resume_download_click', {
          location: this.getElementLocation(link),
          button_text: link.textContent?.trim() || ''
        });
      }
    });
  }

  // Track when sections come into view
  private trackSectionVisibility(): void {
    const sections = ['home', 'about'];
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = (entry.target as HTMLElement).id;
          window.posthog.capture('section_view', {
            section: sectionId,
            time_spent_on_page: Date.now() - this.pageLoadTime
          });
        }
      });
    }, observerOptions);

    // Observe sections
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        observer.observe(section);
      }
    });

    // Track project cards visibility
    const projectCards = document.querySelectorAll('[id*="financial"], [id*="startup"], [id*="banking"], [id*="monitor"]');
    projectCards.forEach(card => {
      observer.observe(card);
    });
  }

  // Track scroll depth
  private trackScrollDepth(): void {
    let maxScrollDepth = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];

    const trackScroll = (): void => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        // Check if we've hit a threshold
        const hitThreshold = scrollThresholds.find(threshold => scrollPercent >= threshold && scrollPercent - 5 < threshold);
        if (hitThreshold) {
          window.posthog.capture('scroll_depth', {
            percentage: hitThreshold,
            max_scroll_depth: maxScrollDepth,
            time_spent_on_page: Date.now() - this.pageLoadTime
          });
        }
      }
    };

    // Throttle scroll events
    let scrollTimer: number | undefined;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(trackScroll, 100);
    });
  }

  // Track time on page before leaving
  private trackTimeOnPage(): void {
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - this.pageLoadTime;
      window.posthog.capture('page_exit', {
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.round(timeSpent / 1000),
        max_scroll_depth: this.getMaxScrollDepth()
      });
    });

    // Also track every 30 seconds for engaged users
    setInterval(() => {
      const timeSpent = Date.now() - this.pageLoadTime;
      if (timeSpent > 30000) { // Only track after 30 seconds
        window.posthog.capture('time_on_page', {
          time_spent_ms: timeSpent,
          time_spent_minutes: Math.round(timeSpent / 60000),
          scroll_depth: this.getScrollDepth()
        });
      }
    }, 30000);
  }

  // Helper functions
  private getElementLocation(element: HTMLElement): string {
    // Find which section the element is in
    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      if (current.id) {
        return current.id;
      }
      current = current.parentElement;
    }
    return 'unknown';
  }

  private getScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    return Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
  }

  private getMaxScrollDepth(): number {
    // This is a simplified version - in a real implementation you'd track this
    return this.getScrollDepth();
  }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAnalytics();
  });
} else {
  new PortfolioAnalytics();
}

