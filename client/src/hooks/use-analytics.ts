import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const DEBOUNCE_DELAY = 2500;
const DEVICE_ID_KEY = 'kitchen_conversion_device_id';
const SESSION_KEY = 'kitchen_conversion_session';

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${crypto.randomUUID()}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

function getDeviceContext() {
  const userContext = getUserContext();
  return {
    browser: userContext.browser,
    device: userContext.device,
    timing: {
      timezone: userContext.timing.timezone,
      timezoneOffset: userContext.timing.timezoneOffset,
    },
  };
}

function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
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
  const deviceId = useRef(getOrCreateDeviceId());
  const sessionCreated = useRef(false);
  
  // Create or update session when tab changes
  const trackTabVisit = useCallback(async (tabName: string) => {
    if (!supabase) {
      return; // Silently skip if Supabase is not configured
    }
    
    try {
      // Check if session exists in database (don't rely on local ref)
      const { data: existingSession, error: checkError } = await supabase
        .from('sessions')
        .select('id, unique_tabs_visited, tab_visit_count')
        .eq('session_id', sessionId.current)
        .maybeSingle();
      
      if (!existingSession) {
        // Session doesn't exist, create it
        // Check if device is returning by querying existing sessions
        const { data: existingSessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('device_id', deviceId.current)
          .limit(1);
        
        const isReturningDevice = existingSessions && existingSessions.length > 0;
        
        // Create new session
        const { error: sessionError } = await supabase
          .from('sessions')
          .insert({
            session_id: sessionId.current,
            device_id: deviceId.current,
            first_tab: tabName,
            last_tab: tabName,
            tab_visit_count: 1,
            unique_tabs_visited: [tabName],
            is_returning_device: isReturningDevice,
            device_context: getDeviceContext(),
            timezone: getTimezone(),
          });
        
        if (sessionError) {
          // If it's a conflict error (409), session was created by another function
          // Fall back to update instead
          if (sessionError.code === '23505') { // PostgreSQL unique violation
            // Fetch the existing session and update it
            const { data: currentSession } = await supabase
              .from('sessions')
              .select('unique_tabs_visited, tab_visit_count')
              .eq('session_id', sessionId.current)
              .single();
            
            if (currentSession) {
              const uniqueTabs = currentSession.unique_tabs_visited || [];
              const updatedTabs = uniqueTabs.includes(tabName) 
                ? uniqueTabs 
                : [...uniqueTabs, tabName];
              
              await supabase
                .from('sessions')
                .update({
                  last_tab: tabName,
                  tab_visit_count: (currentSession.tab_visit_count || 0) + 1,
                  unique_tabs_visited: updatedTabs,
                  updated_at: new Date().toISOString(),
                })
                .eq('session_id', sessionId.current);
            }
          } else {
            console.error('Failed to create session:', sessionError);
          }
          return;
        }
        
        sessionCreated.current = true;
      } else {
        // Session exists, update it
        sessionCreated.current = true;
        
        const uniqueTabs = existingSession.unique_tabs_visited || [];
        const updatedTabs = uniqueTabs.includes(tabName) 
          ? uniqueTabs 
          : [...uniqueTabs, tabName];
        
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            last_tab: tabName,
            tab_visit_count: (existingSession.tab_visit_count || 0) + 1,
            unique_tabs_visited: updatedTabs,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId.current);
        
        if (updateError) {
          console.error('Failed to update session:', updateError);
        }
      }
    } catch (error) {
      console.error('Failed to track tab visit:', error);
    }
  }, []);

  const trackConversionEvent = useCallback(async (
    tabName: string,
    conversionType: string | null,
    inputValue: any,
    outputValue: any = null
  ) => {
    if (!supabase) {
      return; // Silently skip if Supabase is not configured
    }
    
    try {
      // Track conversion event
      const { error: eventError } = await supabase
        .from('conversion_events')
        .insert({
          tab_name: tabName,
          conversion_type: conversionType,
          input_value: inputValue,
          output_value: outputValue,
          session_id: sessionId.current,
          device_id: deviceId.current,
          timezone: getTimezone(),
          user_context: getUserContext(),
        });
      
      if (eventError) {
        console.error('Failed to track conversion event:', eventError);
        return;
      }
      
      // Update session conversion count
      if (sessionCreated.current) {
        const { data: currentSession } = await supabase
          .from('sessions')
          .select('conversion_event_count')
          .eq('session_id', sessionId.current)
          .single();
        
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            conversion_event_count: (currentSession?.conversion_event_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId.current);
        
        if (updateError) {
          console.error('Failed to update session conversion count:', updateError);
        }
      }
    } catch (error) {
      console.error('Failed to track conversion event:', error);
    }
  }, []);

  const trackPreferenceChange = useCallback(async (
    preferenceType: 'display_mode' | 'measure_sys',
    value: string
  ) => {
    if (!supabase) {
      return; // Silently skip if Supabase is not configured
    }
    
    try {
      // Check if session exists in database (don't rely on local ref)
      const { data: existingSession, error: checkError } = await supabase
        .from('sessions')
        .select('id')
        .eq('session_id', sessionId.current)
        .single();
      
      // If session doesn't exist, create it
      if (!existingSession || checkError) {
        // Check if device is returning
        const { data: existingSessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('device_id', deviceId.current)
          .limit(1);
        
        const isReturningDevice = existingSessions && existingSessions.length > 0;
        
        // Create session
        const { error: sessionError } = await supabase
          .from('sessions')
          .insert({
            session_id: sessionId.current,
            device_id: deviceId.current,
            first_tab: 'Volume & Weight', // Default
            last_tab: 'Volume & Weight',
            tab_visit_count: 0,
            unique_tabs_visited: [],
            is_returning_device: isReturningDevice,
            device_context: getDeviceContext(),
            timezone: getTimezone(),
          });
        
        if (sessionError) {
          console.error('Failed to create session:', sessionError);
          return;
        }
        
        sessionCreated.current = true;
      } else {
        // Session exists, update our local ref
        sessionCreated.current = true;
      }
      
      // Fetch current session to get existing changes
      const { data: currentSession } = await supabase
        .from('sessions')
        .select('display_mode_changes, measure_sys_changes')
        .eq('session_id', sessionId.current)
        .single();
      
      // Get existing changes array or initialize empty array
      const existingChanges = preferenceType === 'display_mode'
        ? (currentSession?.display_mode_changes || [])
        : (currentSession?.measure_sys_changes || []);
      
      // Create new change entry
      const newChange = {
        value: value,
        changed_at: new Date().toISOString()
      };
      
      // Append to existing changes
      const updatedChanges = [...existingChanges, newChange];
      
      // Update both the final value and the changes array
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      
      if (preferenceType === 'display_mode') {
        updateData.display_mode_set_to = value;
        updateData.display_mode_changes = updatedChanges;
      } else if (preferenceType === 'measure_sys') {
        updateData.measure_sys_set_to = value;
        updateData.measure_sys_changes = updatedChanges;
      }
      
      const { error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('session_id', sessionId.current);
      
      if (error) {
        console.error('Failed to track preference change:', error);
      }
    } catch (error) {
      console.error('Failed to track preference change:', error);
    }
  }, []);

  return {
    sessionId: sessionId.current,
    deviceId: deviceId.current,
    trackTabVisit,
    trackConversionEvent,
    trackPreferenceChange,
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
