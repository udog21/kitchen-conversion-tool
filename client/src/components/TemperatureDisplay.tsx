import { useState, useEffect } from "react";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DecimalKeypad } from "./DecimalKeypad";
import { useAnalytics, useDebouncedConversionTracking } from "@/hooks/use-analytics";

export function TemperatureDisplay() {
  const [inputTemp, setInputTemp] = useState("180");
  const [inputUnit, setInputUnit] = useState<"C" | "F">("C");
  const [inputFan, setInputFan] = useState(false);
  const [outputUnit, setOutputUnit] = useState<"C" | "F">("F");
  const [outputFan, setOutputFan] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  
  const { trackTabVisit, trackConversionEvent } = useAnalytics();

  useEffect(() => {
    trackTabVisit("Temperature Settings");
  }, [trackTabVisit]);

  const calculateConversion = (): string => {
    const temp = parseFloat(inputTemp) || 0;
    
    // Convert between units (no input modification)
    let result: number;
    if (inputUnit === "C" && outputUnit === "F") {
      result = (temp * 9/5) + 32;
    } else if (inputUnit === "F" && outputUnit === "C") {
      result = (temp - 32) * 5/9;
    } else {
      result = temp;
    }

    // Apply fan/convection adjustment based on oven type conversion
    // Only adjust if switching between fan and conventional ovens
    if (inputFan !== outputFan) {
      if (inputFan && !outputFan) {
        // Converting from fan to conventional: increase temperature
        result = outputUnit === "C" ? result + 20 : result + 25;
      } else if (!inputFan && outputFan) {
        // Converting from conventional to fan: decrease temperature
        result = outputUnit === "C" ? result - 20 : result - 25;
      }
    }
    // If both are fan or both are conventional: no adjustment needed

    return Math.round(result).toString();
  };

  const result = calculateConversion();

  useDebouncedConversionTracking(
    trackConversionEvent,
    "Temperature Settings",
    `${inputUnit}-to-${outputUnit}`,
    {
      temperature: inputTemp,
      inputUnit,
      inputFan,
      outputUnit,
      outputFan,
    },
    { result },
    [inputTemp, inputUnit, inputFan, outputUnit, outputFan]
  );

  return (
    <div className="space-y-6">
      {/* Conversion Display */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
        {/* Input Card */}
        <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[280px]">
          <div className="space-y-4">
            <div className="flex flex-row gap-2 flex-wrap">
              {/* Input Temperature */}
              <ClickableButton
                onClick={() => setShowKeypad(true)}
                data-testid="input-temperature-button"
                className="flex-1 font-mono font-bold text-xl"
              >
                {inputTemp}
              </ClickableButton>
              
              {/* Input Unit Toggle */}
              <div className="flex gap-2">
                <ClickableButton
                  onClick={() => setInputUnit("C")}
                  data-testid="input-unit-c"
                  className="w-16 text-xl"
                  showInnerBorder={inputUnit === "C"}
                >
                  °C
                </ClickableButton>
                <ClickableButton
                  onClick={() => setInputUnit("F")}
                  data-testid="input-unit-f"
                  className="w-16 text-xl"
                  showInnerBorder={inputUnit === "F"}
                >
                  °F
                </ClickableButton>
              </div>
            </div>

            {/* Fan Toggle */}
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
              <Label htmlFor="input-fan" className="text-sm font-semibold">
                Fan / convection
              </Label>
              <Switch
                id="input-fan"
                checked={inputFan}
                onCheckedChange={setInputFan}
                data-testid="input-fan-toggle"
                className="data-[state=checked]:bg-conversion-accent"
              />
            </div>
          </div>
        </div>
        
        {/* Equals Sign */}
        <div className="text-2xl sm:text-3xl text-muted-foreground font-light">=</div>
        
        {/* Output Card */}
        <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border w-full lg:w-auto lg:min-w-[280px]">
          <div className="space-y-4">
            <div className="flex flex-row gap-2 flex-wrap">
              {/* Output Temperature */}
              <OutputDisplay
                data-testid="output-temperature"
                className="flex-1 font-mono font-bold text-xl"
              >
                {result}
              </OutputDisplay>
              
              {/* Output Unit Toggle */}
              <div className="flex gap-2">
                <ClickableButton
                  onClick={() => setOutputUnit("C")}
                  data-testid="output-unit-c"
                  className="w-16 text-xl"
                  showInnerBorder={outputUnit === "C"}
                >
                  °C
                </ClickableButton>
                <ClickableButton
                  onClick={() => setOutputUnit("F")}
                  data-testid="output-unit-f"
                  className="w-16 text-xl"
                  showInnerBorder={outputUnit === "F"}
                >
                  °F
                </ClickableButton>
              </div>
            </div>

            {/* Fan Toggle */}
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
              <Label htmlFor="output-fan" className="text-sm font-semibold">
                Fan / convection
              </Label>
              <Switch
                id="output-fan"
                checked={outputFan}
                onCheckedChange={setOutputFan}
                data-testid="output-fan-toggle"
                className="data-[state=checked]:bg-conversion-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Fan/convection ovens cook hotter than conventional ovens. When converting from conventional to fan, the output is lowered by 20°C or 25°F. When converting from fan to conventional, it's raised by the same amount.
      </div>

      {/* Temperature Input Keypad */}
      {showKeypad && (
        <DecimalKeypad
          value={inputTemp}
          onChange={setInputTemp}
          onClose={() => setShowKeypad(false)}
          maxDecimalPlaces={0}
        />
      )}
    </div>
  );
}
