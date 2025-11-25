/**
 * Holographic 3D Hover Effect
 * Apply the class 'holographic-effect' to any image container
 */

class HolographicEffect {
  constructor(element) {
    this.element = element;
    this.boundingRect = element.getBoundingClientRect();
    
    // Create holographic overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'holographic-overlay';
    this.element.appendChild(this.overlay);
    
    // Bind event handlers
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    
    // Add event listeners
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
  }
  
  handleMouseEnter() {
    this.boundingRect = this.element.getBoundingClientRect();
    this.overlay.style.opacity = '1';
  }
  
  handleMouseMove(e) {
    const rect = this.boundingRect;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10;
    
    // Calculate percentage position for gradient
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    // Apply 3D transform
    this.element.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      scale3d(1.02, 1.02, 1.02)
    `;
    
    // Update holographic gradient position
    this.overlay.style.background = `
      radial-gradient(
        circle at ${percentX}% ${percentY}%,
        rgba(255, 255, 255, 0.3) 0%,
        rgba(147, 197, 253, 0.2) 20%,
        rgba(196, 181, 253, 0.2) 40%,
        rgba(251, 146, 213, 0.2) 60%,
        rgba(252, 211, 77, 0.2) 80%,
        transparent 100%
      )
    `;
  }
  
  handleMouseLeave() {
    // Reset transform
    this.element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    this.overlay.style.opacity = '0';
  }
  
  destroy() {
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

// Initialize holographic effect on all elements
function initHolographicEffect() {
  const elements = document.querySelectorAll('.holographic-effect');
  
  elements.forEach((el) => {
    // Clean up existing instance if it exists
    if (el._holographicEffect) {
      el._holographicEffect.destroy();
    }
    
    // Create new instance
    el._holographicEffect = new HolographicEffect(el);
  });
}

// Fix carousel hover pause - need to pause when hovering over any child
function fixCarouselHover() {
  const carouselWrapper = document.querySelector('#gallery-scroller');
  const carouselAnimation = document.querySelector('.animate-infinite-scroll');
  
  if (!carouselWrapper || !carouselAnimation) return;
  
  let isHovering = false;
  
  // Pause animation when hovering over the wrapper or any child
  carouselWrapper.addEventListener('mouseenter', () => {
    isHovering = true;
    carouselAnimation.style.animationPlayState = 'paused';
  });
  
  carouselWrapper.addEventListener('mouseleave', () => {
    isHovering = false;
    carouselAnimation.style.animationPlayState = 'running';
  });
  
  // Also handle direct hover on carousel items for better reliability
  const carouselItems = carouselWrapper.querySelectorAll('.holographic-effect');
  carouselItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      carouselAnimation.style.animationPlayState = 'paused';
    });
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHolographicEffect();
    fixCarouselHover();
  });
} else {
  initHolographicEffect();
  fixCarouselHover();
}

// Re-initialize after page transitions
window.addEventListener('pageTransitionComplete', () => {
  initHolographicEffect();
  fixCarouselHover();
});

