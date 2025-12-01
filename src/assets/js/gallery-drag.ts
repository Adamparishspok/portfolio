/**
 * Gallery Drag - GSAP Draggable implementation for smooth carousel dragging
 * Supports both automatic scrolling and manual drag interaction
 * Uses GSAP Draggable and InertiaPlugin for physics-based momentum
 */

function initGalleryDrag(): void {
  const gallery = document.getElementById('gallery-scroller');
  if (!gallery) return;

  // Check if GSAP and plugins are loaded
  if (typeof window.gsap === 'undefined') {
    console.warn('GSAP not loaded, gallery drag disabled');
    return;
  }

  const container = gallery.querySelector('.animate-infinite-scroll') as HTMLElement;
  if (!container) return;

  let resumeAnimationTimeout: number | null = null;

  // Helper functions for animation control
  const pauseAnimation = () => {
    container.style.animationPlayState = 'paused';
    if (resumeAnimationTimeout) {
      clearTimeout(resumeAnimationTimeout);
      resumeAnimationTimeout = null;
    }
  };

  const resumeAnimation = (delay: number = 2000) => {
    if (resumeAnimationTimeout) {
      clearTimeout(resumeAnimationTimeout);
    }
    resumeAnimationTimeout = window.setTimeout(() => {
      container.style.animationPlayState = 'running';
    }, delay);
  };

  try {
    // Load Draggable plugin
    const Draggable = window.gsap.registerPlugin(window.Draggable);
    
    // Create draggable instance
    window.Draggable.create(container, {
      type: 'x',
      bounds: gallery,
      inertia: true,
      throwProps: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDragStart: function() {
        pauseAnimation();
      },
      onDrag: function() {
        // Prevent text selection during drag
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }
      },
      onDragEnd: function() {
        resumeAnimation(3000);
      },
      onClick: function(e: MouseEvent) {
        // Prevent clicks during drag
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Add grab cursor styling
    gallery.style.cursor = 'grab';
    
    // Prevent image dragging
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      img.setAttribute('draggable', 'false');
      (img as HTMLElement).style.pointerEvents = 'none';
    });

  } catch (error) {
    console.warn('GSAP Draggable not available, using fallback drag implementation');
    
    // Fallback: simple drag implementation
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    gallery.style.cursor = 'grab';

    gallery.addEventListener('mousedown', (e: MouseEvent) => {
      isDown = true;
      gallery.style.cursor = 'grabbing';
      startX = e.pageX - gallery.offsetLeft;
      scrollLeft = gallery.scrollLeft;
      pauseAnimation();
    });

    gallery.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        gallery.style.cursor = 'grab';
        resumeAnimation(3000);
      }
    });

    gallery.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        gallery.style.cursor = 'grab';
        resumeAnimation(3000);
      }
    });

    gallery.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - gallery.offsetLeft;
      const walk = (x - startX) * 2;
      gallery.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    gallery.addEventListener('touchstart', (e: TouchEvent) => {
      isDown = true;
      startX = e.touches[0].pageX - gallery.offsetLeft;
      scrollLeft = gallery.scrollLeft;
      pauseAnimation();
    });

    gallery.addEventListener('touchend', () => {
      if (isDown) {
        isDown = false;
        resumeAnimation(3000);
      }
    });

    gallery.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - gallery.offsetLeft;
      const walk = (x - startX) * 2;
      gallery.scrollLeft = scrollLeft - walk;
    });

    // Prevent image dragging
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      img.setAttribute('draggable', 'false');
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalleryDrag);
} else {
  initGalleryDrag();
}

