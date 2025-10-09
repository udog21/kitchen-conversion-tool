// Utility functions for converting between fractions and decimals

// Convert fraction string to decimal number
export function fractionToDecimal(fraction: string): number {
  if (fraction.includes(" ")) {
    const [whole, frac] = fraction.split(" ");
    return parseFloat(whole) + fractionToDecimal(frac);
  }
  
  if (fraction.includes("/")) {
    const [num, den] = fraction.split("/").map(Number);
    return num / den;
  }
  
  return parseFloat(fraction);
}

// Convert decimal to nearest fraction (eighths, quarters, thirds, or halves)
export function decimalToFraction(decimal: number): {
  display: string;
  actual: number;
  error: number;
} {
  const whole = Math.floor(decimal);
  const remainder = decimal - whole;
  
  // If no remainder, just return whole number
  if (remainder < 0.001) {
    return {
      display: whole.toString(),
      actual: whole,
      error: 0
    };
  }
  
  // If remainder is very close to 1.0, round up to next whole number
  if (remainder > 0.99) {
    return {
      display: (whole + 1).toString(),
      actual: whole + 1,
      error: 0
    };
  }
  
  // Define fraction options (sorted by precedence)
  const fractions = [
    // Halves
    { numerator: 1, denominator: 2, value: 0.5 },
    // Thirds
    { numerator: 1, denominator: 3, value: 1/3 },
    { numerator: 2, denominator: 3, value: 2/3 },
    // Quarters
    { numerator: 1, denominator: 4, value: 0.25 },
    { numerator: 3, denominator: 4, value: 0.75 },
    // Eighths
    { numerator: 1, denominator: 8, value: 0.125 },
    { numerator: 3, denominator: 8, value: 0.375 },
    { numerator: 5, denominator: 8, value: 0.625 },
    { numerator: 7, denominator: 8, value: 0.875 },
    // Sixteenths
    { numerator: 1, denominator: 16, value: 0.0625 },
    { numerator: 3, denominator: 16, value: 0.1875 },
    { numerator: 5, denominator: 16, value: 0.3125 },
    { numerator: 7, denominator: 16, value: 0.4375 },
    { numerator: 9, denominator: 16, value: 0.5625 },
    { numerator: 11, denominator: 16, value: 0.6875 },
    { numerator: 13, denominator: 16, value: 0.8125 },
    { numerator: 15, denominator: 16, value: 0.9375 },
  ];
  
  // Find the closest fraction
  let bestFraction = fractions[0];
  let bestError = Math.abs(remainder - fractions[0].value);
  
  for (const frac of fractions) {
    const error = Math.abs(remainder - frac.value);
    if (error < bestError) {
      bestError = error;
      bestFraction = frac;
    }
  }
  
  // Calculate actual value and percentage error
  const actualValue = whole + bestFraction.value;
  const errorPercent = Math.abs((actualValue - decimal) / decimal) * 100;
  
  // Format display string
  const fractionStr = `${bestFraction.numerator}/${bestFraction.denominator}`;
  const display = whole > 0 ? `${whole} ${fractionStr}` : fractionStr;
  
  return {
    display,
    actual: actualValue,
    error: errorPercent
  };
}

// Format imperial amount as fraction with optional tilde
export function formatImperialAmount(value: number, showTilde: boolean = false): string {
  const result = decimalToFraction(value);
  
  // Add tilde if error > 2%
  if (showTilde && result.error > 2) {
    return `~${result.display}`;
  }
  
  return result.display;
}

// Convert imperial fraction to metric decimal (for auto-conversion)
export function convertImperialToMetric(fraction: string): string {
  const decimal = fractionToDecimal(fraction);
  return decimal.toString();
}

// Convert metric decimal to imperial fraction (for auto-conversion)
export function convertMetricToImperial(decimal: string): string {
  const value = parseFloat(decimal);
  const result = decimalToFraction(value);
  return result.display;
}
