/**
 * Motion - Simple animation utility inspired by Framer Motion
 * Provides similar API to GSAP but uses native Web Animations API
 */

class Motion {
  /**
   * Animate element(s) from one state to another
   * @param {Element|NodeList|string} target - Element(s) to animate
   * @param {Object} fromVars - Starting properties
   * @param {Object} toVars - Ending properties
   * @returns {Promise} Promise that resolves when animation completes
   */
  static fromTo(target, fromVars, toVars) {
    const elements = Motion.getElements(target);
    const {
      duration = 0.6,
      delay = 0,
      stagger = 0,
      ease = 'ease-out',
      onComplete,
    } = toVars;

    const promises = [];

    elements.forEach((element, index) => {
      const staggerDelay = (delay || 0) + index * stagger;
      const animDuration = duration * 1000; // Convert to ms

      // Set initial state
      Motion.applyStyles(element, fromVars);

      // Create keyframes
      const keyframes = [
        Motion.styleToKeyframe(fromVars),
        Motion.styleToKeyframe(toVars),
      ];

      // Start animation after delay
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          const animation = element.animate(keyframes, {
            duration: animDuration,
            easing: Motion.getEasing(ease),
            fill: 'forwards',
          });

          animation.onfinish = () => {
            // Apply final styles
            Motion.applyStyles(element, toVars);
            resolve();
          };
        }, staggerDelay * 1000);
      });

      promises.push(promise);
    });

    return Promise.all(promises).then(() => {
      if (onComplete) onComplete();
    });
  }

  /**
   * Animate element(s) to a target state
   * @param {Element|NodeList|string} target - Element(s) to animate
   * @param {Object} toVars - Ending properties
   * @returns {Promise} Promise that resolves when animation completes
   */
  static to(target, toVars) {
    const elements = Motion.getElements(target);
    const {
      duration = 0.6,
      delay = 0,
      stagger = 0,
      ease = 'ease-out',
      onComplete,
    } = toVars;

    const promises = [];

    elements.forEach((element, index) => {
      const staggerDelay = (delay || 0) + index * stagger;
      const animDuration = duration * 1000;

      // Get current computed styles
      const currentStyle = window.getComputedStyle(element);
      const fromVars = Motion.getCurrentStyles(element, Object.keys(toVars), currentStyle);

      // Create keyframes
      const keyframes = [
        Motion.styleToKeyframe(fromVars),
        Motion.styleToKeyframe(toVars),
      ];

      // Start animation after delay
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          const animation = element.animate(keyframes, {
            duration: animDuration,
            easing: Motion.getEasing(ease),
            fill: 'forwards',
          });

          animation.onfinish = () => {
            // Apply final styles
            Motion.applyStyles(element, toVars);
            resolve();
          };
        }, staggerDelay * 1000);
      });

      promises.push(promise);
    });

    return Promise.all(promises).then(() => {
      if (onComplete) onComplete();
    });
  }

  /**
   * Get elements from various selector types
   * @private
   */
  static getElements(target) {
    if (typeof target === 'string') {
      return Array.from(document.querySelectorAll(target));
    } else if (target instanceof NodeList) {
      return Array.from(target);
    } else if (target instanceof Element) {
      return [target];
    } else if (Array.isArray(target)) {
      return target;
    }
    return [];
  }

  /**
   * Get current styles for specified properties
   * @private
   */
  static getCurrentStyles(element, props, computedStyle) {
    const current = {};

    props.forEach((prop) => {
      switch (prop) {
        case 'opacity':
          current.opacity = parseFloat(computedStyle.opacity);
          break;
        case 'y':
          const transform = computedStyle.transform;
          if (transform && transform !== 'none') {
            const match = transform.match(/translateY\((.+?)px\)/);
            current.y = match ? parseFloat(match[1]) : 0;
          } else {
            current.y = 0;
          }
          break;
        case 'x':
          const xTransform = computedStyle.transform;
          if (xTransform && xTransform !== 'none') {
            const match = xTransform.match(/translateX\((.+?)px\)/);
            current.x = match ? parseFloat(match[1]) : 0;
          } else {
            current.x = 0;
          }
          break;
        case 'filter':
          current.filter = computedStyle.filter !== 'none' ? computedStyle.filter : 'blur(0px)';
          break;
      }
    });

    return current;
  }

  /**
   * Convert style object to keyframe format
   * @private
   */
  static styleToKeyframe(vars) {
    const keyframe = {};

    Object.keys(vars).forEach((key) => {
      switch (key) {
        case 'opacity':
          keyframe.opacity = vars.opacity;
          break;
        case 'y':
          keyframe.transform = `translateY(${vars.y}px)`;
          break;
        case 'x':
          keyframe.transform = `translateX(${vars.x}px)`;
          break;
        case 'filter':
          keyframe.filter = vars.filter;
          break;
        case 'duration':
        case 'delay':
        case 'stagger':
        case 'ease':
        case 'onComplete':
          // Skip animation control props
          break;
        default:
          keyframe[key] = vars[key];
      }
    });

    return keyframe;
  }

  /**
   * Apply styles directly to element
   * @private
   */
  static applyStyles(element, vars) {
    Object.keys(vars).forEach((key) => {
      switch (key) {
        case 'opacity':
          element.style.opacity = vars.opacity;
          break;
        case 'y':
          const currentX = Motion.getCurrentTranslateX(element);
          element.style.transform = `translate(${currentX}px, ${vars.y}px)`;
          break;
        case 'x':
          const currentY = Motion.getCurrentTranslateY(element);
          element.style.transform = `translate(${vars.x}px, ${currentY}px)`;
          break;
        case 'filter':
          element.style.filter = vars.filter;
          break;
        case 'duration':
        case 'delay':
        case 'stagger':
        case 'ease':
        case 'onComplete':
          // Skip animation control props
          break;
        default:
          element.style[key] = vars[key];
      }
    });
  }

  /**
   * Get current translateX value
   * @private
   */
  static getCurrentTranslateX(element) {
    const transform = window.getComputedStyle(element).transform;
    if (transform && transform !== 'none') {
      const match = transform.match(/matrix\((.+)\)/);
      if (match) {
        const values = match[1].split(', ');
        return parseFloat(values[4]) || 0;
      }
    }
    return 0;
  }

  /**
   * Get current translateY value
   * @private
   */
  static getCurrentTranslateY(element) {
    const transform = window.getComputedStyle(element).transform;
    if (transform && transform !== 'none') {
      const match = transform.match(/matrix\((.+)\)/);
      if (match) {
        const values = match[1].split(', ');
        return parseFloat(values[5]) || 0;
      }
    }
    return 0;
  }

  /**
   * Map ease string to CSS easing function
   * @private
   */
  static getEasing(ease) {
    const easings = {
      'linear': 'linear',
      'ease': 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'power2.in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      'power2.out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      'power2.inOut': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      'back.out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'circ.out': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    };

    return easings[ease] || ease;
  }
}

// Export for use
window.Motion = Motion;

