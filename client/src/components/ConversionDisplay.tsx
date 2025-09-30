import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { AmountPicker } from "./AmountPicker";
import { UnitPicker } from "./UnitPicker";
import { 
  fractionToDecimal, 
  formatImperialAmount, 
  convertImperialToMetric, 
  convertMetricToImperial 
} from "@/lib/fractionUtils";

// Volume units with their categories
const VOLUME_UNITS = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon", "mL", "liter"];
const IMPERIAL_UNITS = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon"];
const METRIC_UNITS = ["mL", "liter"];

// Function to pluralize unit names based on amount
const pluralizeUnit = (unit: string, amount: number): string => {
  if (amount <= 1) return unit;
  
  const pluralMap: { [key: string]: string } = {
    "teaspoon": "teaspoons",
    "tablespoon": "tablespoons", 
    "cup": "cups",
    "pint": "pints",
    "quart": "quarts",
    "gallon": "gallons",
    "liter": "liters",
    "ounce": "ounces",
    "pound": "pounds",
    "gram": "grams",
    "kilogram": "kilograms"
  };
  
  return pluralMap[unit] || unit;
};

// Conversion ratios to mL (base unit) - fallback values
const CONVERSIONS_TO_ML: { [key: string]: number } = {
  "teaspoon": 4.92892,
  "tablespoon": 14.7868,
  "cup": 236.588,
  "pint": 473.176,
  "quart": 946.353,
  "gallon": 3785.41,
  "mL": 1,
  "liter": 1000,
};

function formatResult(value: number, isMetric: boolean): string {
  // For imperial, use fractions
  if (!isMetric) {
    return formatImperialAmount(value, true);
  }
  
  // For metric, use decimals
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(3);
  if (value < 10) return value.toFixed(2);
  if (value < 100) return value.toFixed(1);
  return Math.round(value).toString();
}

interface ConversionDisplayProps {
  system: string;
}

export function ConversionDisplay({ system }: ConversionDisplayProps) {
  const [inputAmount, setInputAmount] = useState("2 1/4");
  const [inputUnit, setInputUnit] = useState("cup");
  const [outputUnit, setOutputUnit] = useState("tablespoon");
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [showInputUnitPicker, setShowInputUnitPicker] = useState(false);
  const [showOutputUnitPicker, setShowOutputUnitPicker] = useState(false);
  const prevInputUnitRef = useRef(inputUnit);

  // Fetch conversion ratios from API (filtered by system)
  const { data: conversionRatios, isLoading } = useQuery({
    queryKey: ['/api/conversions', system],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isInputMetric = METRIC_UNITS.includes(inputUnit);
  const isOutputMetric = METRIC_UNITS.includes(outputUnit);

  // Extract available units from conversion ratios
  const availableUnits = useMemo(() => {
    if (!conversionRatios || !Array.isArray(conversionRatios)) {
      return VOLUME_UNITS; // Default to all units if data not loaded
    }
    
    const units = new Set<string>();
    conversionRatios.forEach((ratio: any) => {
      units.add(ratio.fromUnit);
      units.add(ratio.toUnit);
    });
    
    // Filter VOLUME_UNITS to maintain order
    return VOLUME_UNITS.filter(unit => units.has(unit));
  }, [conversionRatios]);

  const availableImperialUnits = useMemo(() => 
    availableUnits.filter(unit => IMPERIAL_UNITS.includes(unit)),
    [availableUnits]
  );

  const availableMetricUnits = useMemo(() => 
    availableUnits.filter(unit => METRIC_UNITS.includes(unit)),
    [availableUnits]
  );

  // Auto-adjust units if current selection is not available in new system
  useEffect(() => {
    if (!availableUnits.includes(inputUnit)) {
      // Try to select a similar unit or fallback to first available
      const fallback = availableImperialUnits[0] || availableMetricUnits[0] || "cup";
      setInputUnit(fallback);
    }
    if (!availableUnits.includes(outputUnit)) {
      const fallback = availableImperialUnits[0] || availableMetricUnits[0] || "tablespoon";
      setOutputUnit(fallback);
    }
  }, [system, availableUnits]);

  // Auto-convert input amount when unit system changes (imperial ↔ metric)
  useEffect(() => {
    const prevUnit = prevInputUnitRef.current;
    const wasMetric = METRIC_UNITS.includes(prevUnit);
    
    // If switching from imperial to metric
    if (!wasMetric && isInputMetric) {
      setInputAmount(convertImperialToMetric(inputAmount));
    }
    // If switching from metric to imperial
    else if (wasMetric && !isInputMetric) {
      setInputAmount(convertMetricToImperial(inputAmount));
    }
    
    prevInputUnitRef.current = inputUnit;
  }, [inputUnit]);

  // No longer auto-switching output units - users can convert within same system or between systems

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
              className="flex-1 font-mono font-bold"
            >
              {inputAmount}
            </ClickableButton>
            
            {/* Input Unit Button */}
            <ClickableButton
              onClick={() => setShowInputUnitPicker(true)}
              data-testid="input-unit-button" 
              className="flex-1"
            >
              {pluralizeUnit(inputUnit, fractionToDecimal(inputAmount))}
            </ClickableButton>
          </div>
        </div>
        
        {/* Equals Sign */}
        <div className="text-2xl sm:text-3xl text-muted-foreground font-light">=</div>
        
        {/* Output Card */}
        <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[280px]">
          <div className="flex flex-row gap-2 flex-wrap">
            {/* Output Amount Display */}
            <OutputDisplay
              data-testid="output-amount"
              className="flex-1 font-mono font-bold"
            >
              {formatResult(result, isOutputMetric)}
            </OutputDisplay>
            
            {/* Output Unit Button */}
            <ClickableButton
              onClick={() => setShowOutputUnitPicker(true)}
              data-testid="output-unit-button"
              className="flex-1"
            >
              {pluralizeUnit(outputUnit, result)}
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
        units={availableUnits}
        title="Select Input Unit"
      />

      {/* Output Unit Picker Modal */}
      <UnitPicker
        isOpen={showOutputUnitPicker}
        onClose={() => setShowOutputUnitPicker(false)}
        currentUnit={outputUnit}
        onUnitChange={setOutputUnit}
        units={availableUnits}
        title="Select Output Unit"
      />
    </div>
  );
}