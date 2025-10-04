import { useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

const DEBOUNCE_DELAY = 2500;

function getOrCreateSessionId(): string {
  const SESSION_KEY = 'kitchen_conversion_session';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

function getUserContext() {
  return {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    },
    device: {
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isTablet: /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768,
      touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    },
    timing: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      timestamp: new Date().toISOString(),
    },
    page: {
      referrer: document.referrer,
      url: window.location.href,
      pathname: window.location.pathname,
    },
  };
}

export function useAnalytics() {
  const sessionId = useRef(getOrCreateSessionId());
  
  const trackTabVisit = useCallback((tabName: string) => {
    apiRequest('POST', '/api/analytics/tab-visit', {
      tabName,
      sessionId: sessionId.current,
      userContext: getUserContext(),
    }).catch(error => {
      console.error('Failed to track tab visit:', error);
    });
  }, []);

  const trackConversionEvent = useCallback((
    tabName: string,
    conversionType: string | null,
    inputValue: any,
    outputValue: any = null
  ) => {
    apiRequest('POST', '/api/analytics/conversion-event', {
      tabName,
      conversionType,
      inputValue,
      outputValue,
      sessionId: sessionId.current,
      userContext: getUserContext(),
    }).catch(error => {
      console.error('Failed to track conversion event:', error);
    });
  }, []);

  return {
    trackTabVisit,
    trackConversionEvent,
  };
}

export function useDebouncedConversionTracking(
  trackConversionEvent: (tabName: string, conversionType: string | null, inputValue: any, outputValue: any) => void,
  tabName: string,
  conversionType: string | null,
  inputValue: any,
  outputValue: any = null,
  dependencies: any[] = []
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (typeof trackConversionEvent !== 'function') {
      console.error('trackConversionEvent is not a function');
      return;
    }

    const currentInputValue = inputValue;
    const currentOutputValue = outputValue;

    timeoutRef.current = setTimeout(() => {
      if (typeof trackConversionEvent === 'function') {
        trackConversionEvent(tabName, conversionType, currentInputValue, currentOutputValue);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trackConversionEvent, tabName, conversionType, ...dependencies]);
}
