import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"]
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-t-lg p-4 w-full max-w-sm animate-in slide-in-from-bottom-2"
        onClick={(e) => e.stopPropagation()}
        data-testid="decimal-keypad"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Enter Amount</h3>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="keypad-close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4 p-3 bg-muted rounded-md text-center">
          <span className="text-2xl font-mono" data-testid="keypad-display">{value}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {keys.flat().map((key) => (
            <Button
              key={key}
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold"
              onClick={() => {
                if (key === "⌫") {
                  handleBackspace();
                } else {
                  handleDigit(key);
                }
              }}
              data-testid={`key-${key === "⌫" ? "backspace" : key}`}
            >
              {key}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleClear} data-testid="key-clear">
            Clear
          </Button>
          <Button onClick={onClose} data-testid="key-done">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}