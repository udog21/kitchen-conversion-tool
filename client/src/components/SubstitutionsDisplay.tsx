import { useState } from "react";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { AmountPicker } from "./AmountPicker";
import { UnitPicker } from "./UnitPicker";
import { fractionToDecimal } from "@/lib/fractionUtils";

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
};

const HIGH_FIDELITY_SUBSTITUTIONS: SubstitutionRecipe[] = [
  {
    name: "light brown sugar",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 1, unit: "cup", ingredient: "white sugar" },
      { amount: 1, unit: "tablespoon", ingredient: "molasses" },
    ],
    instructions: "Mix ingredients thoroughly.",
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
  },
  {
    name: "baking powder",
    baseAmount: 1,
    baseUnit: "teaspoon",
    substitutes: [
      { amount: 0.25, unit: "teaspoon", ingredient: "baking soda" },
      { amount: 0.5, unit: "teaspoon", ingredient: "cream of tartar" },
    ],
    instructions: "Mix ingredients thoroughly.",
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

// Format a number for display, handling fractions intelligently
function formatAmount(amount: number): string {
  // Check if it's a whole number
  if (amount === Math.floor(amount)) {
    return amount.toString();
  }

  // Try common fractions
  const fractions: [number, string][] = [
    [0.125, "1/8"],
    [0.25, "1/4"],
    [0.333, "1/3"],
    [0.5, "1/2"],
    [0.667, "2/3"],
    [0.75, "3/4"],
  ];

  for (const [decimal, frac] of fractions) {
    if (Math.abs(amount - decimal) < 0.01) {
      return frac;
    }
    // Check for whole number + fraction
    const whole = Math.floor(amount);
    if (whole > 0 && Math.abs(amount - whole - decimal) < 0.01) {
      return `${whole} ${frac}`;
    }
  }

  // Fall back to decimal with 2 places
  return amount.toFixed(2).replace(/\.?0+$/, "");
}

// Pluralize units based on amount
function pluralizeUnit(amount: number, unit: string): string {
  if (amount === 1) return unit;
  
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
  if (amount === 1) return ingredient;
  
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

  // Calculate scaled substitutes
  const scaledSubstitutes: SubstituteItem[] = recipe
    ? recipe.substitutes.map((sub) => {
        // Parse input amount (may be fraction like "1 1/2" or decimal)
        const inputAmountNum = isInputMetric ? parseFloat(inputAmount) : fractionToDecimal(inputAmount);
        const scaleFactor = inputAmountNum / recipe.baseAmount;
        return {
          ...sub,
          amount: sub.amount * scaleFactor,
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
              const amountStr = formatAmount(sub.amount);
              const unitStr = pluralizeUnit(sub.amount, sub.unit);
              const ingredientStr = pluralizeIngredient(sub.amount, sub.ingredient);
              
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
              {recipe.instructions}
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
