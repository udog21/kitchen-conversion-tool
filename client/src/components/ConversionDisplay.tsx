import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClickableButton } from "./ClickableButton";
import { AmountPicker } from "./AmountPicker";
import { UnitPicker } from "./UnitPicker";

// Volume units with their categories
const VOLUME_UNITS = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon", "mL/cc", "liter"];
const IMPERIAL_UNITS = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon"];
const METRIC_UNITS = ["mL/cc", "liter"];

// Conversion ratios to mL (base unit) - fallback values
const CONVERSIONS_TO_ML: { [key: string]: number } = {
  "teaspoon": 4.92892,
  "tablespoon": 14.7868,
  "cup": 236.588,
  "pint": 473.176,
  "quart": 946.353,
  "gallon": 3785.41,
  "mL/cc": 1,
  "liter": 1000,
};

function fractionToDecimal(fraction: string): number {
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

function formatResult(value: number): string {
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(3);
  if (value < 10) return value.toFixed(2);
  if (value < 100) return value.toFixed(1);
  return Math.round(value).toString();
}

export function ConversionDisplay() {
  const [inputAmount, setInputAmount] = useState("1");
  const [inputUnit, setInputUnit] = useState("cup");
  const [outputUnit, setOutputUnit] = useState("tablespoon");
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [showInputUnitPicker, setShowInputUnitPicker] = useState(false);
  const [showOutputUnitPicker, setShowOutputUnitPicker] = useState(false);

  // Fetch conversion ratios from API
  const { data: conversionRatios, isLoading } = useQuery({
    queryKey: ['/api/conversions'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isInputMetric = METRIC_UNITS.includes(inputUnit);
  const isOutputMetric = METRIC_UNITS.includes(outputUnit);

  // Auto-select appropriate output unit when input changes
  useEffect(() => {
    if (isInputMetric && IMPERIAL_UNITS.includes(outputUnit)) {
      setOutputUnit("mL/cc");
    } else if (!isInputMetric && METRIC_UNITS.includes(outputUnit)) {
      setOutputUnit("tablespoon");
    }
  }, [inputUnit, outputUnit, isInputMetric]);

  const calculateConversion = (): number => {
    const inputValue = isInputMetric ? parseFloat(inputAmount) : fractionToDecimal(inputAmount);
    
    // Try to use API data first, fallback to hardcoded values
    let conversionRatio = 1;
    
    if (conversionRatios && Array.isArray(conversionRatios)) {
      const ratio = conversionRatios.find((r: any) => 
        r.fromUnit === inputUnit && r.toUnit === outputUnit
      );
      if (ratio) {
        conversionRatio = parseFloat(ratio.ratio);
        return inputValue * conversionRatio;
      }
    }
    
    // Fallback calculation using hardcoded ratios
    const inputInMl = inputValue * CONVERSIONS_TO_ML[inputUnit];
    return inputInMl / CONVERSIONS_TO_ML[outputUnit];
  };

  const result = calculateConversion();

  return (
    <div className="space-y-6">

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {isLoading ? (
          "Loading conversion data..."
        ) : (
          isInputMetric 
            ? "Enter decimal amount, select metric unit to convert to imperial" 
            : "Use fraction wheel for imperial amounts to convert to metric"
        )}
      </div>

      {/* Decimal Keypad Modal */}
      {showKeypad && (
        <DecimalKeypad
          value={inputAmount}
          onChange={setInputAmount}
          onClose={() => setShowKeypad(false)}
          maxDecimalPlaces={2}
        />
      )}
    </div>
  );
}