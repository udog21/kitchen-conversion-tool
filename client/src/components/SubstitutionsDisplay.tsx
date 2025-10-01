import { useState } from "react";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { AmountPicker } from "./AmountPicker";
import { UnitPicker } from "./UnitPicker";
import { fractionToDecimal, formatImperialAmount } from "@/lib/fractionUtils";

// High-fidelity substitutions that won't alter taste/texture significantly
type SubstituteItem = {
  amount: number;
  unit: string;
  ingredient: string;
};

type SubstitutionRecipe = {
  name: string;
  baseAmount: number;
  baseUnit: string;
  substitutes: SubstituteItem[];
  instructions: string;
  fidelity: "direct" | "near";
  specialInstructions?: string;
};

const HIGH_FIDELITY_SUBSTITUTIONS: SubstitutionRecipe[] = [
  {
    name: "baking powder",
    baseAmount: 1,
    baseUnit: "teaspoon",
    substitutes: [
      { amount: 0.25, unit: "teaspoon", ingredient: "baking soda" },
      { amount: 0.5, unit: "teaspoon", ingredient: "cream of tartar" },
    ],
    instructions: "Mix ingredients thoroughly.",
    fidelity: "direct",
  },
  {
    name: "buttermilk",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 1, unit: "cup", ingredient: "whole milk" },
      { amount: 1, unit: "tablespoon", ingredient: "lemon juice" },
    ],
    instructions: "Mix ingredients thoroughly.",
    fidelity: "direct",
  },
  {
    name: "cake flour",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 0.875, unit: "cup", ingredient: "all-purpose flour" },
      { amount: 2, unit: "tablespoon", ingredient: "cornstarch" },
    ],
    instructions: "Mix ingredients thoroughly.",
    fidelity: "direct",
  },
  {
    name: "light brown sugar",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 1, unit: "cup", ingredient: "white sugar" },
      { amount: 1, unit: "tablespoon", ingredient: "molasses" },
    ],
    instructions: "Mix ingredients thoroughly.",
    fidelity: "direct",
  },
  {
    name: "powdered sugar",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 1, unit: "cup", ingredient: "granulated sugar" },
      { amount: 1, unit: "tablespoon", ingredient: "cornstarch" },
    ],
    instructions: "Mix ingredients thoroughly.",
    fidelity: "direct",
    specialInstructions: "Blend until fine.",
  },
  {
    name: "self-raising flour",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 1, unit: "cup", ingredient: "all-purpose flour" },
      { amount: 1.5, unit: "teaspoon", ingredient: "baking powder" },
      { amount: 0.25, unit: "teaspoon", ingredient: "salt" },
    ],
    instructions: "Mix ingredients thoroughly.",
    fidelity: "direct",
  },
];

const AVAILABLE_UNITS = [
  "teaspoon",
  "tablespoon",
  "cup",
  "fluid ounce",
  "pint",
  "quart",
  "gallon",
  "milliliter",
  "liter",
  "gram",
  "kilogram",
  "ounce",
  "pound",
];

// Imperial units for determining which input method to show
const IMPERIAL_UNITS = [
  "teaspoon",
  "tablespoon",
  "cup",
  "fluid ounce",
  "pint",
  "quart",
  "gallon",
  "ounce",
  "pound",
];

// Unit conversion ratios (to teaspoons for volume, to grams for weight)
const UNIT_CONVERSIONS: { [key: string]: number } = {
  // Volume (base: teaspoon)
  "teaspoon": 1,
  "tablespoon": 3,
  "cup": 48,
  "fluid ounce": 6,
  "pint": 96,
  "quart": 192,
  "gallon": 768,
  "milliliter": 0.202884,
  "liter": 202.884,
  // Weight (base: gram)
  "gram": 1,
  "kilogram": 1000,
  "ounce": 28.3495,
  "pound": 453.592,
};

// Convert amount from one unit to another
function convertUnits(amount: number, fromUnit: string, toUnit: string): number {
  // If same unit, no conversion needed
  if (fromUnit === toUnit) return amount;
  
  // Check if both units are in the same category (volume or weight)
  const fromConversion = UNIT_CONVERSIONS[fromUnit];
  const toConversion = UNIT_CONVERSIONS[toUnit];
  
  if (!fromConversion || !toConversion) return amount;
  
  // Convert from source unit to base unit, then to target unit
  return (amount * fromConversion) / toConversion;
}

// Find the best unit to display an amount (prioritize input unit, then upscale to larger units)
function findBestDisplayUnit(amount: number, originalUnit: string, inputUnit: string): { amount: number; unit: string } {
  // Define unit hierarchies (smallest to largest)
  const volumeUnits = ["teaspoon", "tablespoon", "fluid ounce", "cup", "pint", "quart", "gallon"];
  const weightUnits = ["gram", "kilogram", "ounce", "pound"];
  const metricVolume = ["milliliter", "liter"];
  
  // Determine which hierarchy this unit belongs to
  let hierarchy: string[] = [];
  if (volumeUnits.includes(originalUnit)) hierarchy = volumeUnits;
  else if (weightUnits.includes(originalUnit)) hierarchy = weightUnits;
  else if (metricVolume.includes(originalUnit)) hierarchy = metricVolume;
  else return { amount, unit: originalUnit };
  
  // First, try the input unit if it's in the same hierarchy
  if (hierarchy.includes(inputUnit)) {
    const convertedAmount = convertUnits(amount, originalUnit, inputUnit);
    // If it's a reasonable amount (>= 0.125 or 1/8), use the input unit
    if (convertedAmount >= 0.125) {
      return { amount: convertedAmount, unit: inputUnit };
    }
  }
  
  // Try each unit in the hierarchy, starting from the largest
  for (let i = hierarchy.length - 1; i >= 0; i--) {
    const testUnit = hierarchy[i];
    const convertedAmount = convertUnits(amount, originalUnit, testUnit);
    
    // Use this unit if the amount is >= 0.125 (1/8) and the unit is not larger than input unit
    const inputUnitIndex = hierarchy.indexOf(inputUnit);
    const testUnitIndex = i;
    
    if (convertedAmount >= 0.125 && (inputUnitIndex === -1 || testUnitIndex <= inputUnitIndex)) {
      return { amount: convertedAmount, unit: testUnit };
    }
  }
  
  // If nothing works, return original
  return { amount, unit: originalUnit };
}

// Format amount based on whether it's imperial (use fractions) or metric (use decimals)
function formatAmount(amount: number, unit: string): string {
  const isImperial = IMPERIAL_UNITS.includes(unit);
  
  if (isImperial) {
    // Use the same fraction formatting logic as Volume & Weight tab
    return formatImperialAmount(amount, true);
  } else {
    // For metric, use decimals
    if (amount < 0.01) return amount.toFixed(4);
    if (amount < 1) return amount.toFixed(3);
    if (amount < 10) return amount.toFixed(2);
    if (amount < 100) return amount.toFixed(1);
    return Math.round(amount).toString();
  }
}

// Pluralize units based on amount
function pluralizeUnit(amount: number, unit: string): string {
  // Use singular for amounts between 0 and 1 (inclusive of 1)
  if (amount > 0 && amount <= 1) return unit;
  
  // Use plural for amounts greater than 1
  // Volume units
  if (unit === "teaspoon") return "teaspoons";
  if (unit === "tablespoon") return "tablespoons";
  if (unit === "cup") return "cups";
  if (unit === "fluid ounce") return "fluid ounces";
  if (unit === "pint") return "pints";
  if (unit === "quart") return "quarts";
  if (unit === "gallon") return "gallons";
  if (unit === "milliliter") return "milliliters";
  if (unit === "liter") return "liters";
  
  // Weight units
  if (unit === "gram") return "grams";
  if (unit === "kilogram") return "kilograms";
  if (unit === "ounce") return "ounces";
  if (unit === "pound") return "pounds";
  
  return unit;
}

// Pluralize ingredient names based on amount
function pluralizeIngredient(amount: number, ingredient: string): string {
  // Use singular for amounts between 0 and 1 (inclusive of 1)
  if (amount > 0 && amount <= 1) return ingredient;
  
  // Don't pluralize mass nouns and special cases
  const massNouns = [
    "sugar",
    "flour",
    "salt",
    "milk",
    "water",
    "oil",
    "butter",
    "molasses",
    "lemon juice",
    "vinegar",
    "cream of tartar",
    "baking soda",
    "baking powder",
    "all-purpose flour",
    "white sugar",
    "whole milk",
  ];
  
  if (massNouns.includes(ingredient.toLowerCase())) {
    return ingredient;
  }
  
  // For other ingredients, add 's' or 'es'
  if (ingredient.endsWith("s") || ingredient.endsWith("x") || ingredient.endsWith("ch")) {
    return ingredient + "es";
  }
  
  return ingredient + "s";
}

export function SubstitutionsDisplay() {
  const [inputAmount, setInputAmount] = useState("1");
  const [inputUnit, setInputUnit] = useState("cup");
  const [selectedIngredient, setSelectedIngredient] = useState("light brown sugar");
  
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  
  // Check if current unit is imperial (determines input method)
  const isInputMetric = !IMPERIAL_UNITS.includes(inputUnit);

  // Find the selected substitution recipe
  const recipe = HIGH_FIDELITY_SUBSTITUTIONS.find(
    (r) => r.name === selectedIngredient
  );

  // Calculate scaled substitutes with intelligent unit selection
  const scaledSubstitutes: Array<SubstituteItem & { displayAmount: number; displayUnit: string }> = recipe
    ? recipe.substitutes.map((sub) => {
        // Parse input amount (may be fraction like "1 1/2" or decimal)
        const inputAmountNum = isInputMetric ? parseFloat(inputAmount) : fractionToDecimal(inputAmount);
        
        // Convert input amount to the same unit as the base recipe
        const inputInBaseUnits = convertUnits(inputAmountNum, inputUnit, recipe.baseUnit);
        
        // Calculate scale factor
        const scaleFactor = inputInBaseUnits / recipe.baseAmount;
        
        // Calculate the scaled amount
        const scaledAmount = sub.amount * scaleFactor;
        
        // Find the best unit to display this amount
        const { amount: displayAmount, unit: displayUnit } = findBestDisplayUnit(scaledAmount, sub.unit, inputUnit);
        
        return {
          ...sub,
          amount: scaledAmount,
          displayAmount,
          displayUnit,
        };
      })
    : [];

  const handleIngredientSelect = (ingredient: string) => {
    setSelectedIngredient(ingredient);
    setShowIngredientPicker(false);
  };

  // Pluralize the input unit for display
  const inputAmountNum = isInputMetric ? parseFloat(inputAmount) : fractionToDecimal(inputAmount);
  const displayInputUnit = pluralizeUnit(inputAmountNum || 0, inputUnit);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border">
        <div className="space-y-4">
          {/* Replace text */}
          <div className="text-base font-semibold text-muted-foreground">Replace</div>

          {/* Amount + Unit + "of" + Ingredient */}
          <div className="flex flex-wrap items-center gap-2">
            <ClickableButton
              onClick={() => setShowAmountPicker(true)}
              data-testid="button-input-amount"
              className="font-mono font-bold text-xl"
            >
              {inputAmount}
            </ClickableButton>

            <ClickableButton
              onClick={() => setShowUnitPicker(true)}
              data-testid="button-input-unit"
              className="text-xl"
            >
              {displayInputUnit}
            </ClickableButton>

            <span className="text-xl text-muted-foreground">of</span>

            <ClickableButton
              onClick={() => setShowIngredientPicker(true)}
              data-testid="button-input-ingredient"
              className="text-xl"
            >
              {selectedIngredient}
            </ClickableButton>
          </div>

          {/* "with" text */}
          <div className="text-base font-semibold text-muted-foreground">with</div>

          {/* Substitutes List */}
          <div className="space-y-2">
            {scaledSubstitutes.map((sub, index) => {
              const amountStr = formatAmount(sub.displayAmount, sub.displayUnit);
              const unitStr = pluralizeUnit(sub.displayAmount, sub.displayUnit);
              const ingredientStr = pluralizeIngredient(sub.displayAmount, sub.ingredient);
              
              return (
                <div
                  key={index}
                  data-testid={`substitute-item-${index}`}
                  className="flex items-baseline gap-1 px-4 py-3 rounded-lg border-2 border-[#264653] text-[#2A9D8F] font-semibold min-h-[48px] text-xl"
                >
                  <span className="font-mono font-bold">{amountStr}</span>
                  <span>{unitStr}</span>
                  <span>of</span>
                  <span>{ingredientStr}</span>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          {recipe && (
            <div className="text-base font-semibold text-muted-foreground mt-4">
              {recipe.specialInstructions || recipe.instructions}
            </div>
          )}
        </div>
      </div>

      {/* Amount Picker Modal */}
      <AmountPicker
        isOpen={showAmountPicker}
        onClose={() => setShowAmountPicker(false)}
        currentAmount={inputAmount}
        onAmountChange={setInputAmount}
        isMetric={isInputMetric}
      />

      {/* Unit Picker Modal */}
      <UnitPicker
        isOpen={showUnitPicker}
        onClose={() => setShowUnitPicker(false)}
        currentUnit={inputUnit}
        onUnitChange={setInputUnit}
        units={AVAILABLE_UNITS}
        title="Select Unit"
      />

      {/* Ingredient Picker Modal */}
      <UnitPicker
        isOpen={showIngredientPicker}
        onClose={() => setShowIngredientPicker(false)}
        currentUnit={selectedIngredient}
        onUnitChange={handleIngredientSelect}
        units={HIGH_FIDELITY_SUBSTITUTIONS.map((recipe) => recipe.name)}
        title="Select Ingredient"
      />
    </div>
  );
}
