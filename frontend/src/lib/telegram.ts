import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export const tg = {
  get webApp() {
    return typeof window !== 'undefined' ? WebApp : null;
  },

  get isAvailable() {
    return typeof window !== 'undefined' && Boolean(WebApp?.initData);
  },

  get user(): TelegramUser | null {
    if (typeof window === 'undefined') return null;
    return (WebApp?.initDataUnsafe?.user as TelegramUser) || null;
  },

  get initData(): string {
    return typeof window !== 'undefined' ? WebApp?.initData || '' : '';
  },

  get colorScheme(): 'dark' | 'light' {
    return (WebApp?.colorScheme as 'dark' | 'light') || 'dark';
  },

  ready() {
    try {
      WebApp?.ready?.();
    } catch (e) {
      console.warn('Telegram WebApp ready error', e);
    }
  },

  expand() {
    try {
      WebApp?.expand?.();
    } catch (e) {
      console.warn('Telegram WebApp expand error', e);
    }
  },

  // Haptic Feedback
  haptic: {
    impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
      try {
        WebApp?.HapticFeedback?.impactOccurred(style);
      } catch (e) {
        // Fallback for vibration API if available
        if ('vibrate' in navigator) navigator.vibrate(15);
      }
    },
    notification(type: 'error' | 'success' | 'warning') {
      try {
        WebApp?.HapticFeedback?.notificationOccurred(type);
      } catch (e) {
        if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
      }
    },
    selection() {
      try {
        WebApp?.HapticFeedback?.selectionChanged();
      } catch (e) {
        if ('vibrate' in navigator) navigator.vibrate(10);
      }
    },
  },

  // MainButton Wrapper
  mainButton: {
    setText(text: string) {
      try {
        WebApp?.MainButton?.setText(text);
      } catch (e) {}
    },
    show() {
      try {
        WebApp?.MainButton?.show();
      } catch (e) {}
    },
    hide() {
      try {
        WebApp?.MainButton?.hide();
      } catch (e) {}
    },
    enable() {
      try {
        WebApp?.MainButton?.enable();
      } catch (e) {}
    },
    disable() {
      try {
        WebApp?.MainButton?.disable();
      } catch (e) {}
    },
    showProgress(leaveActive = false) {
      try {
        WebApp?.MainButton?.showProgress(leaveActive);
      } catch (e) {}
    },
    hideProgress() {
      try {
        WebApp?.MainButton?.hideProgress();
      } catch (e) {}
    },
    onClick(callback: () => void) {
      try {
        WebApp?.MainButton?.onClick(callback);
        return () => WebApp?.MainButton?.offClick(callback);
      } catch (e) {
        return () => {};
      }
    },
  },

  // BackButton Wrapper
  backButton: {
    show() {
      try {
        WebApp?.BackButton?.show();
      } catch (e) {}
    },
    hide() {
      try {
        WebApp?.BackButton?.hide();
      } catch (e) {}
    },
    onClick(callback: () => void) {
      try {
        WebApp?.BackButton?.onClick(callback);
        return () => WebApp?.BackButton?.offClick(callback);
      } catch (e) {
        return () => {};
      }
    },
  },
};
