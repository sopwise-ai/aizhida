import "@testing-library/jest-dom/vitest";

/**
 * jsdom 未实现的浏览器 API polyfill。
 * Radix UI（Dialog/Sheet/Command）、next-themes 依赖以下三项。
 */
function installJsdomPolyfills() {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver ??=
    ResizeObserverMock as unknown as typeof ResizeObserver;

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function scrollIntoView() {};
  }

  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
}

installJsdomPolyfills();
