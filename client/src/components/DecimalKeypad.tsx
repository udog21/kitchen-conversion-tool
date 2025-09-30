import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { Delete } from "lucide-react";

interface DecimalKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  maxDecimalPlaces?: number;
}

export function DecimalKeypad({ value, onChange, onClose, maxDecimalPlaces = 2 }: DecimalKeypadProps) {
  const handleDigit = (digit: string) => {
    if (value === "0" && digit !== ".") {
      onChange(digit);
      return;
    }
    
    if (digit === "." && value.includes(".")) return;
    
    // Check decimal places
    if (value.includes(".")) {
      const decimalPart = value.split(".")[1];
      if (decimalPart && decimalPart.length >= maxDecimalPlaces && digit !== ".") {
        return;
      }
    }
    
    const newValue = value + digit;
    if (parseFloat(newValue) <= 9999) { // Reasonable upper limit
      onChange(newValue);
    }
  };

  const handleBackspace = () => {
    if (value.length > 1) {
      onChange(value.slice(0, -1));
    } else {
      onChange("0");
    }
  };

  const handleClear = () => {
    onChange("0");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-t-lg p-4 w-full max-w-sm animate-in slide-in-from-bottom-2"
        onClick={(e) => e.stopPropagation()}
        data-testid="decimal-keypad"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-center">Enter Amount</h3>
        </div>
        
        <OutputDisplay
          data-testid="keypad-display"
          className="text-2xl font-mono font-bold mb-4"
        >
          {value}
        </OutputDisplay>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <ClickableButton
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              data-testid={`key-${digit}`}
              showInnerBorder={false}
              className="text-2xl font-mono font-bold"
            >
              {digit}
            </ClickableButton>
          ))}

          <ClickableButton
            onClick={() => handleDigit(".")}
            data-testid="key-decimal"
            showInnerBorder={false}
            className="text-2xl font-mono font-bold"
          >
            .
          </ClickableButton>

          <ClickableButton
            onClick={() => handleDigit("0")}
            data-testid="key-0"
            showInnerBorder={false}
            className="text-2xl font-mono font-bold"
          >
            0
          </ClickableButton>

          <ClickableButton
            onClick={handleBackspace}
            data-testid="key-backspace"
            showInnerBorder={false}
            className="flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </ClickableButton>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ClickableButton
            onClick={handleClear}
            data-testid="key-clear"
            showInnerBorder={false}
            className="text-base"
          >
            Clear
          </ClickableButton>
          <ClickableButton
            onClick={onClose}
            data-testid="key-done"
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