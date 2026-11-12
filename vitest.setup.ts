import "@testing-library/jest-dom/vitest";

// Radix UI（Dialog/Sheet/Command）依赖 ResizeObserver；jsdom 未内置。
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??=
  ResizeObserverMock as unknown as typeof ResizeObserver;

// Radix UI 的列表滚动定位依赖 scrollIntoView；jsdom 未内置。
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// next-themes 与若干 Radix 组件依赖 matchMedia；jsdom 未内置。
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
