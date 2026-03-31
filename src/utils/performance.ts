// Performance utilities for low-end hardware optimization

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: any;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export class Disposable {
  private disposables: Array<() => void> = [];

  add(dispose: () => void) {
    this.disposables.push(dispose);
  }

  dispose() {
    for (const dispose of this.disposables) {
      try {
        dispose();
      } catch (err) {
        // Silent cleanup
      }
    }
    this.disposables.length = 0;
  }
}

export function createIntersectionObserver(
  element: HTMLElement,
  onVisible: () => void,
  onHidden: () => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onVisible();
        } else {
          onHidden();
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(element);
  return observer;
}

export function freezeConfig<T extends object>(config: T): Readonly<T> {
  return Object.freeze(config);
}
