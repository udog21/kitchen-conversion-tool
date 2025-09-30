import { useState } from "react";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { DecimalKeypad } from "./DecimalKeypad";
import { ImperialFractionPicker } from "./ImperialFractionPicker";
import { UnitPicker } from "./UnitPicker";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  },
  {
    name: "buttermilk",
    baseAmount: 1,
    baseUnit: "cup",
    substitutes: [
      { amount: 1, unit: "cup", ingredient: "whole milk" },
      { amount: 1, unit: "tablespoon", ingredient: "lemon juice" },
    ],
  },
  {
    name: "baking powder",
    baseAmount: 1,
    baseUnit: "teaspoon",
    substitutes: [
      { amount: 0.25, unit: "teaspoon", ingredient: "baking soda" },
      { amount: 0.5, unit: "teaspoon", ingredient: "cream of tartar" },
    ],
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

export function SubstitutionsDisplay() {
  const [inputAmount, setInputAmount] = useState("1");
  const [inputUnit, setInputUnit] = useState("cup");
  const [selectedIngredient, setSelectedIngredient] = useState("light brown sugar");
  
  const [showAmountKeypad, setShowAmountKeypad] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);

  // Find the selected substitution recipe
  const recipe = HIGH_FIDELITY_SUBSTITUTIONS.find(
    (r) => r.name === selectedIngredient
  );

  // Calculate scaled substitutes
  const scaledSubstitutes: SubstituteItem[] = recipe
    ? recipe.substitutes.map((sub) => {
        const inputAmountNum = parseFloat(inputAmount) || 1;
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
              onClick={() => setShowAmountKeypad(true)}
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
              {inputUnit}
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
            {scaledSubstitutes.map((sub, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2"
                data-testid={`substitute-item-${index}`}
              >
                <OutputDisplay className="font-mono font-bold text-xl">
                  {formatAmount(sub.amount)}
                </OutputDisplay>
                <OutputDisplay className="text-xl">
                  {sub.unit}
                </OutputDisplay>
                <OutputDisplay className="text-xl">
                  {sub.ingredient}
                </OutputDisplay>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amount Input Dialog - Fraction Picker */}
      {showAmountKeypad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-md">
            <ImperialFractionPicker
              initialValue={inputAmount}
              onDone={(value) => {
                setInputAmount(value);
                setShowAmountKeypad(false);
              }}
              onCancel={() => setShowAmountKeypad(false)}
            />
          </div>
        </div>
      )}

      {/* Unit Picker Dialog */}
      <UnitPicker
        isOpen={showUnitPicker}
        onClose={() => setShowUnitPicker(false)}
        currentUnit={inputUnit}
        onUnitChange={setInputUnit}
        units={AVAILABLE_UNITS}
        title="Select Unit"
      />

      {/* Ingredient Picker Dialog */}
      <Dialog open={showIngredientPicker} onOpenChange={setShowIngredientPicker}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Select Ingredient</h3>
            <div className="space-y-2">
              {HIGH_FIDELITY_SUBSTITUTIONS.map((recipe) => (
                <ClickableButton
                  key={recipe.name}
                  onClick={() => handleIngredientSelect(recipe.name)}
                  data-testid={`button-ingredient-${recipe.name.replace(/\s+/g, "-")}`}
                  className="w-full text-xl"
                  showInnerBorder={selectedIngredient === recipe.name}
                >
                  {recipe.name}
                </ClickableButton>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ClickableButton
                onClick={() => setShowIngredientPicker(false)}
                data-testid="button-cancel-ingredient"
                showInnerBorder={false}
                className="text-base"
              >
                Cancel
              </ClickableButton>
              <ClickableButton
                onClick={() => handleIngredientSelect(selectedIngredient)}
                data-testid="button-done-ingredient"
                showInnerBorder={false}
                className="text-base"
              >
                Done
              </ClickableButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
