import { useState, useEffect } from "react";
import { SelectableButton } from "./SelectableButton";
import { ClickableButton } from "./ClickableButton";

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
  
  const [fractionType, setFractionType] = useState<FractionType>(initialFractionType);
  const [wholeNumber, setWholeNumber] = useState(parsed.whole);
  const [selectedFraction, setSelectedFraction] = useState(
    parsed.numerator > 0 ? `${parsed.numerator}/${parsed.denominator}` : ""
  );
  const [showWholeNumberPicker, setShowWholeNumberPicker] = useState(false);

  // Update selected fraction when fraction type changes
  useEffect(() => {
    if (fractionType === "none") {
      setSelectedFraction("");
    } else {
      const fractions = getFractions(fractionType);
      // Try to keep a similar fraction value, or default to the last option
      if (!fractions.includes(selectedFraction)) {
        setSelectedFraction(fractions[fractions.length - 1] || "");
      }
    }
  }, [fractionType]);

  const handleDone = () => {
    let result = wholeNumber.toString();
    if (selectedFraction && fractionType !== "none") {
      result = wholeNumber > 0 ? `${wholeNumber} ${selectedFraction}` : selectedFraction;
    }
    onDone(result);
  };

  const handleWholeNumberSelect = (num: number) => {
    setWholeNumber(num);
    setShowWholeNumberPicker(false);
  };

  if (showWholeNumberPicker) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Select Whole Number</h3>
        
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
            <SelectableButton
              key={num}
              onClick={() => handleWholeNumberSelect(num)}
              isActive={wholeNumber === num}
              data-testid={`button-whole-${num}`}
              className="text-lg font-mono font-bold"
            >
              {num}
            </SelectableButton>
          ))}
        </div>

        <ClickableButton
          onClick={() => setShowWholeNumberPicker(false)}
          data-testid="button-back"
          className="w-full text-base"
        >
          Back
        </ClickableButton>
      </div>
    );
  }

  const fractionTypes: { value: FractionType; label: string }[] = [
    { value: "none", label: "no fraction" },
    { value: "halves", label: "halves" },
    { value: "thirds", label: "thirds" },
    { value: "quarters", label: "quarters" },
    { value: "eighths", label: "eighths" },
  ];

  const fractions = getFractions(fractionType);

  return (
    <div className="space-y-4">
      {/* Row 1: Fraction Type Selector */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Fraction Type</h3>
        <div className="flex flex-wrap gap-2">
          {fractionTypes.map((type) => (
            <SelectableButton
              key={type.value}
              onClick={() => setFractionType(type.value)}
              isActive={fractionType === type.value}
              data-testid={`button-fraction-type-${type.value}`}
              className="text-xs flex-shrink-0"
            >
              {type.label}
            </SelectableButton>
          ))}
        </div>
      </div>

      {/* Row 2: Fraction Selector */}
      {fractionType !== "none" && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Select Fraction</h3>
          <div className="flex flex-wrap gap-2">
            {fractions.map((frac) => (
              <SelectableButton
                key={frac}
                onClick={() => setSelectedFraction(frac)}
                isActive={selectedFraction === frac}
                data-testid={`button-fraction-${frac.replace("/", "-")}`}
                className="text-sm font-mono flex-shrink-0"
              >
                {frac}
              </SelectableButton>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Amount Selected - with visual distinction */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-2">Amount</h3>
          <div className="flex gap-2">
            <ClickableButton
              onClick={() => setShowWholeNumberPicker(true)}
              data-testid="button-whole-number"
              className="flex-1 text-lg font-mono font-bold"
            >
              {wholeNumber}
            </ClickableButton>

            {fractionType !== "none" && (
              <div className="flex-1 min-h-10" data-testid="button-selected-fraction">
                <svg 
                  viewBox="0 0 100 60" 
                  className="w-full h-full min-h-10"
                >
                  {/* Outer shell - Charcoal frame */}
                  <rect 
                    className="fill-transparent" 
                    style={{ strokeWidth: "2px", stroke: "#264653" }}
                    x="5" y="5" width="90" height="50" rx="8" ry="8"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Inner display area - Charcoal */}
                  <rect 
                    className="fill-transparent" 
                    style={{ strokeWidth: "2px", stroke: "#264653" }}
                    x="12" y="12" width="76" height="36" rx="6" ry="6"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Text - Persian green */}
                  <text 
                    className="font-semibold" 
                    style={{ fill: "#2A9D8F", fontSize: "11px" }}
                    x="50" y="30" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                  >
                    {selectedFraction || "0/0"}
                  </text>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Done/Cancel Buttons - outer border only */}
        <div className="grid grid-cols-2 gap-2">
          <ClickableButton
            onClick={onCancel}
            data-testid="button-cancel"
            showInnerBorder={false}
            className="text-base"
          >
            Cancel
          </ClickableButton>

          <ClickableButton
            onClick={handleDone}
            data-testid="button-done"
            showInnerBorder={false}
            className="text-base"
          >
            Done
          </ClickableButton>
        </div>
      </div>
    </div>
  );
}
