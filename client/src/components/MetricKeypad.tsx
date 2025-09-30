import { useState } from "react";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { Delete } from "lucide-react";

interface MetricKeypadProps {
  initialValue: string;
  onDone: (value: string) => void;
  onCancel: () => void;
}

export function MetricKeypad({ initialValue, onDone, onCancel }: MetricKeypadProps) {
  const [value, setValue] = useState(initialValue);
  const [isFirstDigit, setIsFirstDigit] = useState(true);

  const handleDigit = (digit: string) => {
    if (isFirstDigit) {
      setValue(digit);
      setIsFirstDigit(false);
    } else {
      setValue(prev => prev + digit);
    }
  };

  const handleDecimal = () => {
    if (isFirstDigit) {
      setValue("0.");
      setIsFirstDigit(false);
    } else if (!value.includes(".")) {
      setValue(prev => prev + ".");
    }
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1) || "0");
    setIsFirstDigit(false);
  };

  const handleClear = () => {
    setValue("0");
    setIsFirstDigit(true);
  };

  const handleDone = () => {
    const finalValue = value || "0";
    onDone(finalValue);
  };

  return (
    <div className="space-y-4">
      {/* Display */}
      <OutputDisplay
        className="text-3xl font-mono font-bold"
      >
        {value || "0"}
      </OutputDisplay>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <ClickableButton
            key={digit}
            onClick={() => handleDigit(digit.toString())}
            data-testid={`button-digit-${digit}`}
            showInnerBorder={false}
            className="text-3xl font-mono font-bold"
          >
            {digit}
          </ClickableButton>
        ))}

        <ClickableButton
          onClick={handleDecimal}
          data-testid="button-decimal"
          showInnerBorder={false}
          className="text-3xl font-mono font-bold"
        >
          .
        </ClickableButton>

        <ClickableButton
          onClick={() => handleDigit("0")}
          data-testid="button-digit-0"
          showInnerBorder={false}
          className="text-3xl font-mono font-bold"
        >
          0
        </ClickableButton>

        <ClickableButton
          onClick={handleBackspace}
          data-testid="button-backspace"
          showInnerBorder={false}
          className="flex items-center justify-center text-2xl"
        >
          <Delete className="w-6 h-6" />
        </ClickableButton>
      </div>

      {/* Cancel/Clear/Done Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <ClickableButton
          onClick={onCancel}
          data-testid="button-cancel"
          showInnerBorder={false}
          className="text-base"
        >
          Cancel
        </ClickableButton>

        <ClickableButton
          onClick={handleClear}
          data-testid="button-clear"
          showInnerBorder={false}
          className="text-base"
        >
          Clear
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
  );
}
