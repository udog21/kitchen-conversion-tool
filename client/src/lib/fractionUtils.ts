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
    { numerator: 1, denominator: 16, value: 1/16 },
    { numerator: 3, denominator: 16, value: 3/16 },
    { numerator: 5, denominator: 16, value: 5/16 },
    { numerator: 7, denominator: 16, value: 7/16 },
    { numerator: 9, denominator: 16, value: 9/16 },
    { numerator: 11, denominator: 16, value: 11/16 },
    { numerator: 13, denominator: 16, value: 13/16 },
    { numerator: 15, denominator: 16, value: 15/16 },
    // Thirty-seconds (useful for precise measurements)
    { numerator: 1, denominator: 32, value: 1/32 },
    { numerator: 3, denominator: 32, value: 3/32 },
    { numerator: 5, denominator: 32, value: 5/32 },
    { numerator: 7, denominator: 32, value: 7/32 },
    { numerator: 9, denominator: 32, value: 9/32 },
    { numerator: 11, denominator: 32, value: 11/32 },
    { numerator: 13, denominator: 32, value: 13/32 },
    { numerator: 15, denominator: 32, value: 15/32 },
    { numerator: 17, denominator: 32, value: 17/32 },
    { numerator: 19, denominator: 32, value: 19/32 },
    { numerator: 21, denominator: 32, value: 21/32 },
    { numerator: 23, denominator: 32, value: 23/32 },
    { numerator: 25, denominator: 32, value: 25/32 },
    { numerator: 27, denominator: 32, value: 27/32 },
    { numerator: 29, denominator: 32, value: 29/32 },
    { numerator: 31, denominator: 32, value: 31/32 },
    // Sixty-fourths (very precise measurements)
    { numerator: 1, denominator: 64, value: 1/64 },
    { numerator: 3, denominator: 64, value: 3/64 },
    { numerator: 5, denominator: 64, value: 5/64 },
    { numerator: 7, denominator: 64, value: 7/64 },
    { numerator: 9, denominator: 64, value: 9/64 },
    { numerator: 11, denominator: 64, value: 11/64 },
    { numerator: 13, denominator: 64, value: 13/64 },
    { numerator: 15, denominator: 64, value: 15/64 },
    { numerator: 17, denominator: 64, value: 17/64 },
    { numerator: 19, denominator: 64, value: 19/64 },
    { numerator: 21, denominator: 64, value: 21/64 },
    { numerator: 23, denominator: 64, value: 23/64 },
    { numerator: 25, denominator: 64, value: 25/64 },
    { numerator: 27, denominator: 64, value: 27/64 },
    { numerator: 29, denominator: 64, value: 29/64 },
    { numerator: 31, denominator: 64, value: 31/64 },
    { numerator: 33, denominator: 64, value: 33/64 },
    { numerator: 35, denominator: 64, value: 35/64 },
    { numerator: 37, denominator: 64, value: 37/64 },
    { numerator: 39, denominator: 64, value: 39/64 },
    { numerator: 41, denominator: 64, value: 41/64 },
    { numerator: 43, denominator: 64, value: 43/64 },
    { numerator: 45, denominator: 64, value: 45/64 },
    { numerator: 47, denominator: 64, value: 47/64 },
    { numerator: 49, denominator: 64, value: 49/64 },
    { numerator: 51, denominator: 64, value: 51/64 },
    { numerator: 53, denominator: 64, value: 53/64 },
    { numerator: 55, denominator: 64, value: 55/64 },
    { numerator: 57, denominator: 64, value: 57/64 },
    { numerator: 59, denominator: 64, value: 59/64 },
    { numerator: 61, denominator: 64, value: 61/64 },
    { numerator: 63, denominator: 64, value: 63/64 },
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
