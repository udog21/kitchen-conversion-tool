import { useState } from "react";
import { ClickableButton } from "./ClickableButton";
import { Delete } from "lucide-react";

interface MetricKeypadProps {
  initialValue: string;
  onDone: (value: string) => void;
  onCancel: () => void;
}

export function MetricKeypad({ initialValue, onDone, onCancel }: MetricKeypadProps) {
  const [value, setValue] = useState(initialValue);

  const handleDigit = (digit: string) => {
    setValue(prev => prev + digit);
  };

  const handleDecimal = () => {
    if (!value.includes(".")) {
      setValue(prev => prev + ".");
    }
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1) || "0");
  };

  const handleDone = () => {
    const finalValue = value || "0";
    onDone(finalValue);
  };

  return (
    <div className="space-y-4">
      {/* Display */}
      <div className="text-center text-3xl font-mono font-bold text-foreground p-4 bg-muted rounded-lg min-h-16 flex items-center justify-center">
        {value || "0"}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <ClickableButton
            key={digit}
            onClick={() => handleDigit(digit.toString())}
            data-testid={`button-digit-${digit}`}
            className="text-lg font-mono font-bold"
          >
            {digit}
          </ClickableButton>
        ))}

        <ClickableButton
          onClick={handleDecimal}
          data-testid="button-decimal"
          className="text-lg font-mono font-bold"
        >
          .
        </ClickableButton>

        <ClickableButton
          onClick={() => handleDigit("0")}
          data-testid="button-digit-0"
          className="text-lg font-mono font-bold"
        >
          0
        </ClickableButton>

        <ClickableButton
          onClick={handleBackspace}
          data-testid="button-backspace"
          className="flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </ClickableButton>
      </div>

      {/* Done/Cancel Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <ClickableButton
          onClick={onCancel}
          data-testid="button-cancel"
          className="text-base"
        >
          Cancel
        </ClickableButton>

        <ClickableButton
          onClick={handleDone}
          data-testid="button-done"
          className="text-base"
        >
          Done
        </ClickableButton>
      </div>
    </div>
  );
}
