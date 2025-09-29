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
      {/* Conversion Display with Separate Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
        {/* Input Card */}
        <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[280px]">
          <div className="flex flex-row gap-2 flex-wrap">
            {/* Input Amount Button */}
            <ClickableButton
              onClick={() => setShowAmountPicker(true)}
              data-testid="input-amount-button"
              className="flex-1 text-lg sm:text-xl font-mono font-bold"
            >
              {inputAmount}
            </ClickableButton>
            
            {/* Input Unit Button */}
            <ClickableButton
              onClick={() => setShowInputUnitPicker(true)}
              data-testid="input-unit-button" 
              className="flex-1 kitchen-key--unit"
            >
              {inputUnit}
            </ClickableButton>
          </div>
        </div>
        
        {/* Equals Sign */}
        <div className="text-2xl sm:text-3xl text-muted-foreground font-light">=</div>
        
        {/* Output Card */}
        <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[280px]">
          <div className="flex flex-row gap-2">
            {/* Output Amount Display */}
            <div 
              className="flex-1 min-h-10" 
              data-testid="output-amount"
            >
              <svg 
                viewBox="0 0 100 60" 
                className="w-full h-full min-h-10"
              >
                {/* Outer shell - Persian green frame for output */}
                <rect 
                  className="fill-transparent" 
                  style={{ strokeWidth: "2px", stroke: "#2A9D8F" }}
                  x="5" y="5" width="90" height="50" rx="8" ry="8"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Inner display area - Persian green, no reflection gap since it's not interactive */}
                <rect 
                  className="fill-transparent" 
                  style={{ strokeWidth: "2px", stroke: "#2A9D8F" }}
                  x="12" y="12" width="76" height="36" rx="6" ry="6"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Text - Charcoal */}
                <text 
                  className="font-semibold" 
                  style={{ fill: "#264653", fontSize: "12px" }}
                  x="50" y="30" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                >
                  {formatResult(result)}
                </text>
              </svg>
            </div>
            
            {/* Output Unit Button */}
            <ClickableButton
              onClick={() => setShowOutputUnitPicker(true)}
              data-testid="output-unit-button"
              className="flex-1 min-w-0 kitchen-key--unit"
            >
              {outputUnit}
            </ClickableButton>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {isLoading ? (
          "Loading conversion data..."
        ) : (
          "Tap any button to change values and units"
        )}
      </div>

      {/* Amount Picker Modal */}
      <AmountPicker
        isOpen={showAmountPicker}
        onClose={() => setShowAmountPicker(false)}
        currentAmount={inputAmount}
        onAmountChange={setInputAmount}
        isMetric={isInputMetric}
      />

      {/* Input Unit Picker Modal */}
      <UnitPicker
        isOpen={showInputUnitPicker}
        onClose={() => setShowInputUnitPicker(false)}
        currentUnit={inputUnit}
        onUnitChange={setInputUnit}
        units={VOLUME_UNITS}
        title="Select Input Unit"
      />

      {/* Output Unit Picker Modal */}
      <UnitPicker
        isOpen={showOutputUnitPicker}
        onClose={() => setShowOutputUnitPicker(false)}
        currentUnit={outputUnit}
        onUnitChange={setOutputUnit}
        units={isInputMetric ? IMPERIAL_UNITS : METRIC_UNITS}
        title="Select Output Unit"
      />
    </div>
  );
}