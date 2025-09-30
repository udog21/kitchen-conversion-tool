import { useState, useEffect } from "react";
import { SelectableButton } from "./SelectableButton";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ImperialFractionPickerProps {
  initialValue: string;
  onDone: (value: string) => void;
  onCancel: () => void;
}

type FractionType = "none" | "halves" | "thirds" | "quarters" | "eighths";

// Parse fraction string like "2 1/4" into parts
function parseFraction(value: string): { whole: number; numerator: number; denominator: number } {
  const parts = value.trim().split(" ");
  
  if (parts.length === 2) {
    // Has whole and fraction
    const whole = parseInt(parts[0]) || 0;
    const [num, den] = parts[1].split("/").map(Number);
    return { whole, numerator: num || 0, denominator: den || 4 };
  } else if (parts.length === 1 && parts[0].includes("/")) {
    // Just fraction
    const [num, den] = parts[0].split("/").map(Number);
    return { whole: 0, numerator: num || 0, denominator: den || 4 };
  } else {
    // Just whole number
    return { whole: parseInt(parts[0]) || 0, numerator: 0, denominator: 4 };
  }
}

// Determine fraction type from denominator
function getFractionType(denominator: number): FractionType {
  switch (denominator) {
    case 2: return "halves";
    case 3: return "thirds";
    case 4: return "quarters";
    case 8: return "eighths";
    default: return "quarters";
  }
}

// Get available fractions for a type
function getFractions(type: FractionType): string[] {
  switch (type) {
    case "halves": return ["1/2"];
    case "thirds": return ["1/3", "2/3"];
    case "quarters": return ["1/4", "3/4"];
    case "eighths": return ["1/8", "3/8", "5/8", "7/8"];
    default: return [];
  }
}

export function ImperialFractionPicker({ initialValue, onDone, onCancel }: ImperialFractionPickerProps) {
  const parsed = parseFraction(initialValue);
  const initialFractionType = parsed.numerator > 0 ? getFractionType(parsed.denominator) : "quarters";
  const initialUseFraction = parsed.numerator > 0;
  
  const [useFraction, setUseFraction] = useState(initialUseFraction);
  const [fractionType, setFractionType] = useState<FractionType>(initialFractionType);
  const [wholeNumber, setWholeNumber] = useState(parsed.whole);
  const [selectedFraction, setSelectedFraction] = useState(
    parsed.numerator > 0 ? `${parsed.numerator}/${parsed.denominator}` : ""
  );
  const [showWholeNumberPicker, setShowWholeNumberPicker] = useState(false);

  // Update selected fraction when fraction type changes
  useEffect(() => {
    if (useFraction) {
      const fractions = getFractions(fractionType);
      // Try to keep a similar fraction value, or default to the last option
      if (!fractions.includes(selectedFraction)) {
        setSelectedFraction(fractions[fractions.length - 1] || "");
      }
    }
  }, [fractionType, useFraction]);

  const handleDone = () => {
    let result = wholeNumber.toString();
    if (useFraction && selectedFraction) {
      result = wholeNumber > 0 ? `${wholeNumber} ${selectedFraction}` : selectedFraction;
    }
    onDone(result);
  };

  const [keypadValue, setKeypadValue] = useState(wholeNumber.toString());
  const [isFirstDigit, setIsFirstDigit] = useState(true);

  // Sync keypad value when picker opens
  useEffect(() => {
    if (showWholeNumberPicker) {
      setKeypadValue(wholeNumber.toString());
      setIsFirstDigit(true);
    }
  }, [showWholeNumberPicker, wholeNumber]);

  const handleKeypadDigit = (digit: string) => {
    if (isFirstDigit) {
      // Replace the current value on first digit
      setKeypadValue(digit);
      setIsFirstDigit(false);
    } else {
      // Append subsequent digits
      setKeypadValue((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setKeypadValue((prev) => prev.slice(0, -1) || "0");
    setIsFirstDigit(false);
  };

  const handleKeypadDone = () => {
    const num = parseInt(keypadValue) || 0;
    setWholeNumber(num);
    setShowWholeNumberPicker(false);
  };

  const handleKeypadCancel = () => {
    setKeypadValue(wholeNumber.toString());
    setShowWholeNumberPicker(false);
  };

  if (showWholeNumberPicker) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Enter Whole Number</h3>
        
        {/* Display current value */}
        <OutputDisplay
          data-testid="keypad-display"
          className="text-lg font-mono font-bold"
        >
          {keypadValue}
        </OutputDisplay>

        {/* Keypad grid: 1-9, then 0 */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <ClickableButton
              key={digit}
              onClick={() => handleKeypadDigit(digit.toString())}
              data-testid={`keypad-${digit}`}
              className="text-base font-mono font-bold"
              showInnerBorder={false}
            >
              {digit}
            </ClickableButton>
          ))}
          <ClickableButton
            onClick={() => handleKeypadDigit("0")}
            data-testid="keypad-0"
            className="text-base font-mono font-bold col-start-2"
            showInnerBorder={false}
          >
            0
          </ClickableButton>
          <ClickableButton
            onClick={handleKeypadBackspace}
            data-testid="keypad-backspace"
            className="text-base font-mono"
            showInnerBorder={false}
          >
            ⌫
          </ClickableButton>
        </div>

        {/* Cancel/Done buttons */}
        <div className="grid grid-cols-2 gap-2">
          <ClickableButton
            onClick={handleKeypadCancel}
            data-testid="keypad-cancel"
            showInnerBorder={false}
            className="text-base"
          >
            Cancel
          </ClickableButton>
          <ClickableButton
            onClick={handleKeypadDone}
            data-testid="keypad-done"
            showInnerBorder={false}
            className="text-base"
          >
            Done
          </ClickableButton>
        </div>
      </div>
    );
  }

  const fractionTypes: { value: FractionType; label: string }[] = [
    { value: "halves", label: "halves" },
    { value: "thirds", label: "thirds" },
    { value: "quarters", label: "quarters" },
    { value: "eighths", label: "eighths" },
  ];

  const fractions = getFractions(fractionType);

  return (
    <div className="space-y-4">
      {/* Row 1: Fraction Toggle */}
      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
        <Label htmlFor="fraction-toggle" className="text-sm font-semibold">
          Use Fractions
        </Label>
        <Switch
          id="fraction-toggle"
          checked={useFraction}
          onCheckedChange={setUseFraction}
          data-testid="toggle-use-fraction"
        />
      </div>

      {/* Row 2: Fraction Type Selector - only shown when fractions enabled */}
      {useFraction && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Fraction Type</h3>
          <div className="flex flex-wrap gap-2">
            {fractionTypes.map((type) => (
              <SelectableButton
                key={type.value}
                onClick={() => setFractionType(type.value)}
                isActive={fractionType === type.value}
                data-testid={`button-fraction-type-${type.value}`}
                className="flex-shrink-0"
              >
                {type.label}
              </SelectableButton>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Fraction Selector - only shown when fractions enabled */}
      {useFraction && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Select Fraction</h3>
          <div className="flex flex-wrap gap-2">
            {fractions.map((frac) => (
              <SelectableButton
                key={frac}
                onClick={() => setSelectedFraction(frac)}
                isActive={selectedFraction === frac}
                data-testid={`button-fraction-${frac.replace("/", "-")}`}
                className="font-mono flex-shrink-0"
              >
                {frac}
              </SelectableButton>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Amount Selected - with visual distinction */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-2">Amount</h3>
          <div className="flex gap-2">
            <ClickableButton
              onClick={() => setShowWholeNumberPicker(true)}
              data-testid="button-whole-number"
              className="flex-1 font-mono font-bold"
            >
              {wholeNumber}
            </ClickableButton>

            {useFraction && (
              <OutputDisplay
                data-testid="button-selected-fraction"
                className="flex-1 font-mono font-bold"
              >
                {selectedFraction || "0/0"}
              </OutputDisplay>
            )}
          </div>
        </div>

        {/* Done/Cancel Buttons - outer border only */}
        <div className="grid grid-cols-2 gap-2">
          <ClickableButton
            onClick={onCancel}
            data-testid="button-cancel"
            showInnerBorder={false}
          >
            Cancel
          </ClickableButton>

          <ClickableButton
            onClick={handleDone}
            data-testid="button-done"
            showInnerBorder={false}
          >
            Done
          </ClickableButton>
        </div>
      </div>
    </div>
  );
}
