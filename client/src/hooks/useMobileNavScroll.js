import { useState, useEffect } from 'react';

// Shared singleton state to prevent duplicate window scroll event listeners
let listeners = new Set();
let isAttached = false;
let isNavHidden = false;
let isScrolled = false;
let lastScrollY = 0;
let rafId = null;

const SCROLL_THRESHOLD = 12;
const TOP_THRESHOLD = 20;

const isModalOrInputActive = () => {
  if (typeof document === 'undefined') return false;

  // 1. Check body classes / style for open drawer or modal
  if (
    document.body.classList.contains('mobile-drawer-open') ||
    document.body.classList.contains('modal-open') ||
    document.body.style.overflow === 'hidden'
  ) {
    return true;
  }

  // 2. Check for dialog/modal elements currently displayed
  const dialogEl = document.querySelector('[role="dialog"], .modal, [data-modal="true"]');
  if (dialogEl && window.getComputedStyle(dialogEl).display !== 'none') {
    return true;
  }

  // 3. Check if an input, textarea, select, or contenteditable is focused
  const activeEl = document.activeElement;
  if (activeEl) {
    const tag = activeEl.tagName;
    if (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      activeEl.isContentEditable ||
      activeEl.getAttribute('role') === 'textbox'
    ) {
      return true;
    }
  }

  return false;
};

const notifyListeners = () => {
  const state = { isNavHidden, isScrolled };
  listeners.forEach((listener) => {
    listener.notify(state);
  });
};

const evaluateScrollState = () => {
  if (typeof window === 'undefined') return;

  const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  // 1. Check top scrolled state for transparent/solid navbar background
  const newIsScrolled = currentScrollY > TOP_THRESHOLD;

  // 2. On desktop (> 768px), navbars are NEVER hidden
  const isDesktop = window.innerWidth > 768;

  // 3. Check if any subscriber requested disabled or if input/modal/drawer is active
  const isAnyDisabled = Array.from(listeners).some((l) => l.disabled);
  const isUXProtected = isModalOrInputActive();

  if (isDesktop || currentScrollY <= TOP_THRESHOLD || isAnyDisabled || isUXProtected) {
    if (isNavHidden !== false || isScrolled !== newIsScrolled) {
      isNavHidden = false;
      isScrolled = newIsScrolled;
      lastScrollY = currentScrollY;
      notifyListeners();
    } else {
      lastScrollY = currentScrollY;
    }
    return;
  }

  // Ignore iOS bottom bounce
  if (currentScrollY >= maxScrollY - 10) {
    if (isScrolled !== newIsScrolled) {
      isScrolled = newIsScrolled;
      notifyListeners();
    }
    return;
  }

  // Calculate scroll difference from previous anchor
  const diff = currentScrollY - lastScrollY;

  // Only change hide/show state if scroll difference exceeds threshold (prevents flicker)
  if (Math.abs(diff) >= SCROLL_THRESHOLD) {
    const newIsNavHidden = diff > 0 && currentScrollY > 40;
    if (isNavHidden !== newIsNavHidden || isScrolled !== newIsScrolled) {
      isNavHidden = newIsNavHidden;
      isScrolled = newIsScrolled;
      lastScrollY = currentScrollY;
      notifyListeners();
    } else {
      lastScrollY = currentScrollY;
    }
  } else if (isScrolled !== newIsScrolled) {
    isScrolled = newIsScrolled;
    notifyListeners();
  }
};

const handleScroll = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    evaluateScrollState();
  });
};

const handleResize = () => {
  evaluateScrollState();
};

const attachListenersIfNeeded = () => {
  if (!isAttached && typeof window !== 'undefined') {
    isAttached = true;
    lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
  }
};

const detachListenersIfEmpty = () => {
  if (listeners.size === 0 && isAttached && typeof window !== 'undefined') {
    isAttached = false;
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }
};

export function useMobileNavScroll({ disabled = false } = {}) {
  const [state, setState] = useState(() => ({
    isNavHidden: false,
    isScrolled: typeof window !== 'undefined' ? (window.scrollY || 0) > TOP_THRESHOLD : false,
  }));

  useEffect(() => {
    const subscriber = {
      disabled,
      notify: (newState) => {
        setState(newState);
      },
    };

    listeners.add(subscriber);
    attachListenersIfNeeded();

    // Immediately evaluate state in case disabled changed or initial check needed
    evaluateScrollState();

    return () => {
      listeners.delete(subscriber);
      detachListenersIfEmpty();
    };
  }, [disabled]);

  return state;
}
