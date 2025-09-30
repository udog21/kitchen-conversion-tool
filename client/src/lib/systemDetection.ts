// System detection and management utilities

export type MeasurementSystem = "US" | "UK_METRIC" | "UK_IMPERIAL" | "AU_NZ" | "CA" | "EU";

export interface SystemInfo {
  id: MeasurementSystem;
  name: string;
  flag: string;
  icon?: string; // For UK_IMPERIAL (crown)
}

export const SYSTEMS: SystemInfo[] = [
  { id: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  { id: "UK_METRIC", name: "United Kingdom (Metric)", flag: "\u{1F1EC}\u{1F1E7}" },
  { id: "UK_IMPERIAL", name: "Imperial (Traditional)", flag: "", icon: "\u{1F451}" },
  { id: "AU_NZ", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  { id: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  { id: "EU", name: "European Union", flag: "\u{1F1EA}\u{1F1FA}" },
];

// Map country codes to measurement systems
const COUNTRY_TO_SYSTEM: Record<string, MeasurementSystem> = {
  // United States
  US: "US",
  
  // United Kingdom (defaults to UK_METRIC)
  GB: "UK_METRIC",
  
  // Australia & New Zealand
  AU: "AU_NZ",
  NZ: "AU_NZ",
  
  // Canada
  CA: "CA",
  
  // EU countries (all use EU system)
  AT: "EU", BE: "EU", BG: "EU", HR: "EU", CY: "EU",
  CZ: "EU", DK: "EU", EE: "EU", FI: "EU", FR: "EU",
  DE: "EU", GR: "EU", HU: "EU", IE: "EU", IT: "EU",
  LV: "EU", LT: "EU", LU: "EU", MT: "EU", NL: "EU",
  PL: "EU", PT: "EU", RO: "EU", SK: "EU", SI: "EU",
  ES: "EU", SE: "EU",
};

// Detect system based on browser location
export async function detectSystemFromLocation(): Promise<MeasurementSystem> {
  try {
    // Try to get timezone-based country code
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryCode = getCountryFromTimezone(timezone);
    
    if (countryCode && COUNTRY_TO_SYSTEM[countryCode]) {
      return COUNTRY_TO_SYSTEM[countryCode];
    }
    
    // Fallback: Try geolocation API (requires user permission)
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 300000, // 5 minutes cache
      });
    });
    
    // Use reverse geocoding API if needed (would require external service)
    // For now, we'll just default to US if we can't determine
    return "US";
  } catch (error) {
    // Default to US if detection fails
    return "US";
  }
}

// Simple timezone to country mapping (not exhaustive)
function getCountryFromTimezone(timezone: string): string | null {
  const parts = timezone.split('/');
  if (parts.length < 2) return null;
  
  const region = parts[0];
  const city = parts[1];
  
  // Map common timezones to countries
  const timezoneMap: Record<string, string> = {
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "Europe/London": "GB",
    "Europe/Dublin": "IE",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Europe/Rome": "IT",
    "Europe/Madrid": "ES",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Brisbane": "AU",
    "Pacific/Auckland": "NZ",
  };
  
  const fullTimezone = `${region}/${city}`;
  const country = timezoneMap[fullTimezone];
  
  if (country) return country;
  
  // Fallback: guess from region
  if (region === "America") {
    if (city.includes("Toronto") || city.includes("Vancouver") || city.includes("Montreal")) {
      return "CA";
    }
    return "US";
  } else if (region === "Europe") {
    if (city === "London") return "GB";
    return "EU"; // Default EU countries to EU system
  } else if (region === "Australia") {
    return "AU";
  } else if (region === "Pacific" && city === "Auckland") {
    return "NZ";
  }
  
  return null;
}

// Get system from localStorage or detect
export function getStoredSystem(): MeasurementSystem | null {
  const stored = localStorage.getItem("measurementSystem");
  if (stored && SYSTEMS.some(s => s.id === stored)) {
    return stored as MeasurementSystem;
  }
  return null;
}

// Store system in localStorage
export function storeSystem(system: MeasurementSystem): void {
  localStorage.setItem("measurementSystem", system);
}

// Get system info by ID
export function getSystemInfo(systemId: MeasurementSystem): SystemInfo {
  return SYSTEMS.find(s => s.id === systemId) || SYSTEMS[0];
}
