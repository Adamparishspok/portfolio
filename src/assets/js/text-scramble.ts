/**
 * Text Scramble Effect
 * Apply the class 'text-scramble' to any text element to enable hover scramble effect
 */

interface QueueItem {
  from: string;
  to: string;
  start: number;
  end: number;
  char?: string;
}

interface HTMLElementWithScramble extends HTMLElement {
  _textScramble?: TextScramble;
}

class TextScramble {
  private el: HTMLElement;
  private chars: string;
  private originalText: string;
  private isScrambling: boolean;
  private queue: QueueItem[];
  private frame: number;
  private frameRequest: number;
  private resolve: () => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.originalText = el.textContent || '';
    this.isScrambling = false;
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.textContent || '';
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  private update(): void {
    let output = '';
    let complete = 0;
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="text-scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    }
  }

  private randomChar(): string {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  scramble(): void {
    if (this.isScrambling) return;
    
    this.isScrambling = true;
    this.setText(this.originalText).then(() => {
      this.isScrambling = false;
    });
  }
}

// Initialize text scramble on all elements with the class
function initTextScramble(): void {
  const elements = document.querySelectorAll<HTMLElementWithScramble>('.text-scramble');
  
  elements.forEach((el) => {
    const fx = new TextScramble(el);
    
    // Store the instance on the element for potential future use
    el._textScramble = fx;
    
    // Trigger scramble on hover
    el.addEventListener('mouseenter', () => {
      fx.scramble();
    });
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextScramble);
} else {
  initTextScramble();
}

// Re-initialize after page transitions
window.addEventListener('pageTransitionComplete', initTextScramble);

