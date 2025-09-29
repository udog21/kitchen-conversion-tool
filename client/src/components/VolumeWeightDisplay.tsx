import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UnitWheel } from "./UnitWheel";
import { FractionWheel } from "./FractionWheel";
import { DecimalKeypad } from "./DecimalKeypad";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Volume units
const VOLUME_UNITS = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon", "mL/cc", "liter"];
const IMPERIAL_VOLUME = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon"];
const METRIC_VOLUME = ["mL/cc", "liter"];

// Weight units
const WEIGHT_UNITS = ["ounce", "pound", "gram", "kilogram"];
const IMPERIAL_WEIGHT = ["ounce", "pound"];
const METRIC_WEIGHT = ["gram", "kilogram"];

// Weight conversions to grams (base unit)
const WEIGHT_TO_GRAMS: { [key: string]: number } = {
  "ounce": 28.3495,
  "pound": 453.592,
  "gram": 1,
  "kilogram": 1000,
};

// Volume conversions to mL (base unit)
const VOLUME_TO_ML: { [key: string]: number } = {
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

export function VolumeWeightDisplay() {
  const [inputAmount, setInputAmount] = useState("1");
  const [inputUnit, setInputUnit] = useState("cup");
  const [outputUnit, setOutputUnit] = useState("ounce");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [conversionMode, setConversionMode] = useState<"volume-to-weight" | "weight-to-volume">("volume-to-weight");
  const [showKeypad, setShowKeypad] = useState(false);

  // Fetch ingredients from API
  const { data: ingredients, isLoading: ingredientsLoading } = useQuery<any[]>({
    queryKey: ['/api/ingredients'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isInputMetric = conversionMode === "volume-to-weight" 
    ? METRIC_VOLUME.includes(inputUnit)
    : METRIC_WEIGHT.includes(inputUnit);

  // Auto-select appropriate output unit based on conversion mode and input unit
  useEffect(() => {
    if (conversionMode === "volume-to-weight") {
      // Volume to Weight
      if (IMPERIAL_VOLUME.includes(inputUnit) && METRIC_WEIGHT.includes(outputUnit)) {
        setOutputUnit("ounce");
      } else if (METRIC_VOLUME.includes(inputUnit) && IMPERIAL_WEIGHT.includes(outputUnit)) {
        setOutputUnit("gram");
      }
    } else {
      // Weight to Volume
      if (IMPERIAL_WEIGHT.includes(inputUnit) && METRIC_VOLUME.includes(outputUnit)) {
        setOutputUnit("cup");
      } else if (METRIC_WEIGHT.includes(inputUnit) && IMPERIAL_VOLUME.includes(outputUnit)) {
        setOutputUnit("mL/cc");
      }
    }
  }, [inputUnit, outputUnit, conversionMode]);

  const calculateConversion = (): number => {
    if (!selectedIngredient || !ingredients) return 0;

    const ingredient = ingredients.find((ing: any) => ing.name === selectedIngredient);
    if (!ingredient) return 0;

    const density = parseFloat(ingredient.density); // grams per mL
    const inputValue = isInputMetric ? parseFloat(inputAmount) : fractionToDecimal(inputAmount);

    if (conversionMode === "volume-to-weight") {
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
  };

  const result = calculateConversion();
  const availableInputUnits = conversionMode === "volume-to-weight" ? VOLUME_UNITS : WEIGHT_UNITS;
  const availableOutputUnits = conversionMode === "volume-to-weight" ? WEIGHT_UNITS : VOLUME_UNITS;

  const toggleConversionMode = () => {
    const newMode = conversionMode === "volume-to-weight" ? "weight-to-volume" : "volume-to-weight";
    setConversionMode(newMode);
    
    // Reset units to appropriate defaults
    if (newMode === "volume-to-weight") {
      setInputUnit("cup");
      setOutputUnit("ounce");
    } else {
      setInputUnit("ounce");
      setOutputUnit("cup");
    }
    setInputAmount("1");
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="text-center">
        <Button
          onClick={toggleConversionMode}
          variant="outline"
          size="sm"
          data-testid="toggle-conversion-mode"
          className="mb-4"
        >
          Switch to {conversionMode === "volume-to-weight" ? "Weight → Volume" : "Volume → Weight"}
        </Button>
      </div>

      {/* Ingredient Selection */}
      <div className="bg-muted/30 rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">Select Ingredient:</label>
        <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
          <SelectTrigger data-testid="ingredient-select">
            <SelectValue placeholder="Choose an ingredient..." />
          </SelectTrigger>
          <SelectContent>
            {ingredientsLoading ? (
              <SelectItem value="loading" disabled>Loading ingredients...</SelectItem>
            ) : (
              ingredients?.map((ingredient: any) => (
                <SelectItem key={ingredient.id} value={ingredient.name}>
                  {ingredient.name} ({ingredient.category})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        {selectedIngredient && !ingredientsLoading && (
          <div className="mt-2 text-sm text-muted-foreground">
            Density: {ingredients?.find((ing: any) => ing.name === selectedIngredient)?.density} g/mL
          </div>
        )}
      </div>

      {/* Conversion Display with Separate Cards */}
      {selectedIngredient && (
        <div>
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
                    units={availableInputUnits}
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
                    units={availableOutputUnits}
                    selectedUnit={outputUnit}
                    onUnitChange={setOutputUnit}
                    dataTestId="output-unit-wheel"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {conversionMode === "volume-to-weight" 
              ? `Converting volume to weight using ${selectedIngredient.toLowerCase()} density`
              : `Converting weight to volume using ${selectedIngredient.toLowerCase()} density`
            }
          </div>
        </div>
      )}

      {!selectedIngredient && (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-card-border">
          <h3 className="text-lg font-medium mb-2">Select an Ingredient</h3>
          <p>Choose an ingredient to convert between volume and weight measurements.</p>
        </div>
      )}

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