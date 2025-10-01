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
import { useAnalytics, useDebouncedConversionTracking } from "@/hooks/use-analytics";

// Volume units
const VOLUME_UNITS = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon", "mL", "liter"];
const IMPERIAL_VOLUME = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon"];
const METRIC_VOLUME = ["mL", "liter"];

// Weight units
const WEIGHT_UNITS = ["ounce", "pound", "gram", "kilogram"];
const IMPERIAL_WEIGHT = ["ounce", "pound"];
const METRIC_WEIGHT = ["gram", "kilogram"];

// All units combined
const ALL_UNITS = [...VOLUME_UNITS, ...WEIGHT_UNITS];

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

// Helper functions to determine unit types
const isVolumeUnit = (unit: string) => VOLUME_UNITS.includes(unit);
const isWeightUnit = (unit: string) => WEIGHT_UNITS.includes(unit);

// Volume conversions to mL (base unit) - fallback values
const VOLUME_TO_ML: { [key: string]: number } = {
  "teaspoon": 4.92892,
  "tablespoon": 14.7868,
  "cup": 236.588,
  "pint": 473.176,
  "quart": 946.353,
  "gallon": 3785.41,
  "mL": 1,
  "liter": 1000,
};

// Weight conversions to grams (base unit)
const WEIGHT_TO_GRAMS: { [key: string]: number } = {
  "ounce": 28.3495,
  "pound": 453.592,
  "gram": 1,
  "kilogram": 1000,
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
  const [selectedIngredient, setSelectedIngredient] = useState("anything");
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [showInputUnitPicker, setShowInputUnitPicker] = useState(false);
  const [showOutputUnitPicker, setShowOutputUnitPicker] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const prevInputUnitRef = useRef(inputUnit);
  
  const { trackTabVisit, trackConversionEvent } = useAnalytics();

  useEffect(() => {
    trackTabVisit("Volume & Weight");
  }, [trackTabVisit]);

  // Fetch conversion ratios from API (filtered by system)
  const { data: conversionRatios, isLoading: conversionLoading } = useQuery({
    queryKey: ['/api/conversions', system],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch ingredients from API
  const { data: ingredients, isLoading: ingredientsLoading } = useQuery<any[]>({
    queryKey: ['/api/ingredients'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isInputVolume = isVolumeUnit(inputUnit);
  const isOutputVolume = isVolumeUnit(outputUnit);
  const isCrossCategory = (isInputVolume && !isOutputVolume) || (!isInputVolume && isOutputVolume);

  const isInputMetric = METRIC_VOLUME.includes(inputUnit) || METRIC_WEIGHT.includes(inputUnit);
  const isOutputMetric = METRIC_VOLUME.includes(outputUnit) || METRIC_WEIGHT.includes(outputUnit);

  // Extract available units from conversion ratios
  const availableUnits = useMemo(() => {
    if (!conversionRatios || !Array.isArray(conversionRatios)) {
      return ALL_UNITS; // Default to all units if data not loaded
    }
    
    const units = new Set<string>();
    conversionRatios.forEach((ratio: any) => {
      units.add(ratio.fromUnit);
      units.add(ratio.toUnit);
    });
    
    // Add weight units (they may not be in conversion ratios)
    WEIGHT_UNITS.forEach(unit => units.add(unit));
    
    // Filter ALL_UNITS to maintain order
    return ALL_UNITS.filter(unit => units.has(unit));
  }, [conversionRatios]);

  // Auto-adjust units if current selection is not available in new system
  useEffect(() => {
    if (!availableUnits.includes(inputUnit)) {
      const fallback = availableUnits[0] || "cup";
      setInputUnit(fallback);
    }
    if (!availableUnits.includes(outputUnit)) {
      const fallback = availableUnits[1] || "tablespoon";
      setOutputUnit(fallback);
    }
  }, [system, availableUnits]);

  // Auto-convert input amount when unit system changes (imperial ↔ metric)
  useEffect(() => {
    const prevUnit = prevInputUnitRef.current;
    const wasMetric = METRIC_VOLUME.includes(prevUnit) || METRIC_WEIGHT.includes(prevUnit);
    
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

  // Auto-select water when switching to cross-category conversion
  useEffect(() => {
    if (isCrossCategory && selectedIngredient === "anything") {
      setSelectedIngredient("water");
    } else if (!isCrossCategory && selectedIngredient !== "anything") {
      // Optionally reset to "anything" when switching back to same-category
      // Commenting this out to preserve user's ingredient selection
      // setSelectedIngredient("anything");
    }
  }, [isCrossCategory]);

  const calculateConversion = (): number => {
    const inputValue = isInputMetric ? parseFloat(inputAmount) : fractionToDecimal(inputAmount);
    
    // Cross-category conversion (volume ↔ weight)
    if (isCrossCategory) {
      // Need ingredient density
      if (selectedIngredient === "anything" || !ingredients) {
        return 0; // Can't convert without ingredient
      }

      const ingredient = ingredients.find((ing: any) => ing.name === selectedIngredient);
      if (!ingredient) return 0;

      const density = parseFloat(ingredient.density); // grams per mL

      if (isInputVolume && !isOutputVolume) {
        // Volume to Weight: Volume × Density = Weight
        const inputInMl = inputValue * VOLUME_TO_ML[inputUnit];
        const weightInGrams = inputInMl * density;
        return weightInGrams / WEIGHT_TO_GRAMS[outputUnit];
      } else {
        // Weight to Volume: Weight ÷ Density = Volume
        const inputInGrams = inputValue * WEIGHT_TO_GRAMS[inputUnit];
        const volumeInMl = inputInGrams / density;
        return volumeInMl / VOLUME_TO_ML[outputUnit];
      }
    }
    
    // Same-category conversion (volume-to-volume or weight-to-weight)
    if (isInputVolume && isOutputVolume) {
      // Volume-to-volume
      // Try to use API data first
      if (conversionRatios && Array.isArray(conversionRatios)) {
        const ratio = conversionRatios.find((r: any) => 
          r.fromUnit === inputUnit && r.toUnit === outputUnit
        );
        if (ratio) {
          return inputValue * parseFloat(ratio.ratio);
        }
      }
      
      // Fallback calculation
      const inputInMl = inputValue * VOLUME_TO_ML[inputUnit];
      return inputInMl / VOLUME_TO_ML[outputUnit];
    } else {
      // Weight-to-weight
      const inputInGrams = inputValue * WEIGHT_TO_GRAMS[inputUnit];
      return inputInGrams / WEIGHT_TO_GRAMS[outputUnit];
    }
  };

  const result = calculateConversion();

  const conversionType = isCrossCategory 
    ? (isInputVolume ? "volume-to-weight" : "weight-to-volume")
    : (isInputVolume ? "volume-to-volume" : "weight-to-weight");

  useDebouncedConversionTracking(
    trackConversionEvent,
    "Volume & Weight",
    conversionType,
    {
      amount: inputAmount,
      inputUnit,
      outputUnit,
      ingredient: selectedIngredient,
      system,
    },
    { 
      result: formatResult(result, isOutputMetric),
      resultNumeric: result,
    },
    [inputAmount, inputUnit, outputUnit, selectedIngredient, system]
  );

  // Prepare ingredient list with "anything" as first option, then alphabetically sorted
  const ingredientOptions = useMemo(() => {
    const options = [{ id: 0, name: "anything", category: "general" }];
    if (ingredients) {
      const sortedIngredients = [...ingredients].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      options.push(...sortedIngredients);
    }
    return options;
  }, [ingredients]);

  return (
    <div className="space-y-6">
      {/* Conversion Display with Separate Cards */}
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 w-full">
          {/* Input Card */}
          <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[280px]">
            <div className="flex flex-row gap-2 flex-wrap">
              {/* Input Amount Button */}
              <ClickableButton
                onClick={() => setShowAmountPicker(true)}
                data-testid="input-amount-button"
                className="flex-1 font-mono font-bold text-xl"
              >
                {inputAmount}
              </ClickableButton>
              
              {/* Input Unit Button */}
              <ClickableButton
                onClick={() => setShowInputUnitPicker(true)}
                data-testid="input-unit-button" 
                className="flex-1 text-xl"
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
                className="flex-1 font-mono font-bold text-xl"
              >
                {isCrossCategory && selectedIngredient === "anything" ? "—" : formatResult(result, isOutputMetric)}
              </OutputDisplay>
              
              {/* Output Unit Button */}
              <ClickableButton
                onClick={() => setShowOutputUnitPicker(true)}
                data-testid="output-unit-button"
                className="flex-1 text-xl"
              >
                {pluralizeUnit(outputUnit, result)}
              </ClickableButton>
            </div>
          </div>
        </div>

        {/* "of" and Ingredient Selector */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xl">of</span>
          <ClickableButton
            onClick={() => setShowIngredientPicker(true)}
            data-testid="ingredient-button"
            className="min-w-[150px] text-xl lowercase"
          >
            {selectedIngredient}
          </ClickableButton>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {conversionLoading ? (
          "Loading conversion data..."
        ) : isCrossCategory && selectedIngredient === "anything" ? (
          "Select an ingredient to convert between volume and weight"
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

      {/* Ingredient Picker Modal */}
      <UnitPicker
        isOpen={showIngredientPicker}
        onClose={() => setShowIngredientPicker(false)}
        currentUnit={selectedIngredient}
        onUnitChange={setSelectedIngredient}
        units={ingredientOptions.map(ing => ing.name)}
        title="Select Ingredient"
      />
    </div>
  );
}
