import posthog from 'posthog-js'

// Portfolio Analytics - Track user interactions and engagement

class PortfolioAnalytics {
  constructor() {
    this.pageLoadTime = Date.now()
    this.init()
  }

  init() {
    this.trackNavigationClicks()
    this.trackProjectClicks()
    this.trackContactInteractions()
    this.trackSectionVisibility()
    this.trackScrollDepth()
    this.trackTimeOnPage()
  }

  // Track navigation menu clicks
  trackNavigationClicks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      const text = link.textContent.trim()

      // Navigation links
      if (href === '#') {
        posthog.capture('navigation_click', {
          section: 'home',
          text: text,
          type: 'internal'
        })
      } else if (href === '#about') {
        posthog.capture('navigation_click', {
          section: 'about',
          text: text,
          type: 'internal'
        })
      }
      // Social media links
      else if (href?.includes('linkedin.com')) {
        posthog.capture('social_link_click', {
          platform: 'linkedin',
          url: href,
          type: 'external'
        })
      } else if (href?.includes('dribbble.com')) {
        posthog.capture('social_link_click', {
          platform: 'dribbble',
          url: href,
          type: 'external'
        })
      } else if (href?.includes('github.com')) {
        posthog.capture('social_link_click', {
          platform: 'github',
          url: href,
          type: 'external'
        })
      }
      // Project links
      else if (href?.startsWith('/mobile') || href?.startsWith('/startup')) {
        const projectCard = link.closest('[id]')
        const projectId = projectCard?.id || 'unknown'
        const projectName = projectCard?.querySelector('h3')?.textContent || 'unknown'

        posthog.capture('project_click', {
          project_id: projectId,
          project_name: projectName,
          url: href,
          type: 'internal'
        })
      }
    })
  }

  // Track project card interactions
  trackProjectClicks() {
    // Track hover events on project cards (engagement signal)
    document.addEventListener('mouseenter', (e) => {
      const projectCard = e.target.closest('[id*="financial"], [id*="startup"], [id*="banking"], [id*="monitor"]')
      if (projectCard) {
        const projectId = projectCard.id
        const projectName = projectCard.querySelector('h3')?.textContent || 'unknown'

        posthog.capture('project_hover', {
          project_id: projectId,
          project_name: projectName,
          duration: 0 // Will be tracked if they hover long enough
        })

        // Track hover duration
        let hoverStart = Date.now()
        const trackHoverDuration = () => {
          const duration = Date.now() - hoverStart
          if (duration > 1000) { // Only track if hover > 1 second
            posthog.capture('project_hover_duration', {
              project_id: projectId,
              project_name: projectName,
              duration_ms: duration
            })
          }
        }

        projectCard.addEventListener('mouseleave', trackHoverDuration, { once: true })
      }
    }, true)
  }

  // Track contact interactions
  trackContactInteractions() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')

      // Email links
      if (href?.startsWith('mailto:')) {
        posthog.capture('contact_click', {
          type: 'email',
          email: href.replace('mailto:', ''),
          location: this.getElementLocation(link)
        })
      }
      // Resume download
      else if (link.textContent.toLowerCase().includes('download resume') || link.textContent.toLowerCase().includes('resume')) {
        posthog.capture('resume_download_click', {
          location: this.getElementLocation(link),
          button_text: link.textContent.trim()
        })
      }
    })
  }

  // Track when sections come into view
  trackSectionVisibility() {
    const sections = ['home', 'about']
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          posthog.capture('section_view', {
            section: sectionId,
            time_spent_on_page: Date.now() - this.pageLoadTime
          })
        }
      })
    }, observerOptions)

    // Observe sections
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId)
      if (section) {
        observer.observe(section)
      }
    })

    // Track project cards visibility
    const projectCards = document.querySelectorAll('[id*="financial"], [id*="startup"], [id*="banking"], [id*="monitor"]')
    projectCards.forEach(card => {
      observer.observe(card)
    })
  }

  // Track scroll depth
  trackScrollDepth() {
    let maxScrollDepth = 0
    const scrollThresholds = [25, 50, 75, 90, 100]

    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100)

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent

        // Check if we've hit a threshold
        const hitThreshold = scrollThresholds.find(threshold => scrollPercent >= threshold && scrollPercent - 5 < threshold)
        if (hitThreshold) {
          posthog.capture('scroll_depth', {
            percentage: hitThreshold,
            max_scroll_depth: maxScrollDepth,
            time_spent_on_page: Date.now() - this.pageLoadTime
          })
        }
      }
    }

    // Throttle scroll events
    let scrollTimer
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(trackScroll, 100)
    })
  }

  // Track time on page before leaving
  trackTimeOnPage() {
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - this.pageLoadTime
      posthog.capture('page_exit', {
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.round(timeSpent / 1000),
        max_scroll_depth: this.getMaxScrollDepth()
      })
    })

    // Also track every 30 seconds for engaged users
    setInterval(() => {
      const timeSpent = Date.now() - this.pageLoadTime
      if (timeSpent > 30000) { // Only track after 30 seconds
        posthog.capture('time_on_page', {
          time_spent_ms: timeSpent,
          time_spent_minutes: Math.round(timeSpent / 60000),
          scroll_depth: this.getScrollDepth()
        })
      }
    }, 30000)
  }

  // Helper functions
  getElementLocation(element) {
    // Find which section the element is in
    let current = element
    while (current && current !== document.body) {
      if (current.id) {
        return current.id
      }
      current = current.parentElement
    }
    return 'unknown'
  }

  getScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    return Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
  }

  getMaxScrollDepth() {
    // This is a simplified version - in a real implementation you'd track this
    return this.getScrollDepth()
  }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAnalytics()
  })
} else {
  new PortfolioAnalytics()
}

// Export for potential use in other scripts
export default PortfolioAnalytics
