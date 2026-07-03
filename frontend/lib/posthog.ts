import posthog from 'posthog-js';

// Helper to check if PostHog is loaded and ready
const isPostHogReady = (): boolean => {
  return typeof window !== 'undefined' && posthog.__loaded;
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (isPostHogReady()) {
    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog tracking failed:', error);
      }
    }
  }
};

export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  trackEvent('$pageview', { page: pageName, ...properties });
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (isPostHogReady()) {
    try {
      posthog.identify(userId, properties);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog identify failed:', error);
      }
    }
  }
};

export const resetUser = () => {
  if (isPostHogReady()) {
    try {
      posthog.reset();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog reset failed:', error);
      }
    }
  }
};

export { posthog };
