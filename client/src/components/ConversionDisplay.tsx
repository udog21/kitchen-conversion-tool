import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnitWheel } from "./UnitWheel";
import { FractionWheel } from "./FractionWheel";
import { DecimalKeypad } from "./DecimalKeypad";
import { Button } from "@/components/ui/button";

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
  const [showKeypad, setShowKeypad] = useState(false);

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
      {/* Conversion Display with Separate Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
        {/* Input Card */}
        <div className="bg-card p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[200px]">
          <div className="text-center space-y-4">
            {/* Input Amount */}
            <div className="relative">
              {isInputMetric ? (
                <Button
                  variant="ghost"
                  className="h-auto p-2 text-2xl font-mono font-bold text-conversion-accent hover:bg-conversion-accent/10"
                  onClick={() => setShowKeypad(true)}
                  data-testid="input-amount-metric"
                >
                  {inputAmount}
                </Button>
              ) : (
                <div data-testid="input-amount-fraction" className="px-2">
                  <FractionWheel 
                    value={inputAmount} 
                    onChange={setInputAmount}
                    dataTestId="input-amount-wheel"
                  />
                </div>
              )}
            </div>
            
            {/* Input Unit */}
            <div data-testid="input-unit">
              <UnitWheel
                units={VOLUME_UNITS}
                selectedUnit={inputUnit}
                onUnitChange={setInputUnit}
                dataTestId="input-unit-wheel"
              />
            </div>
          </div>
        </div>
        
        {/* Equals Sign */}
        <div className="text-3xl text-muted-foreground font-light">=</div>
        
        {/* Output Card */}
        <div className="bg-card p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[200px]">
          <div className="text-center space-y-4">
            {/* Output Amount */}
            <div className="text-2xl font-bold text-conversion-accent font-mono pt-8" data-testid="output-amount">
              {formatResult(result)}
            </div>
            
            {/* Output Unit */}
            <div data-testid="output-unit">
              <UnitWheel
                units={isInputMetric ? IMPERIAL_UNITS : METRIC_UNITS}
                selectedUnit={outputUnit}
                onUnitChange={setOutputUnit}
                dataTestId="output-unit-wheel"
              />
            </div>
          </div>
        </div>
      </div>

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