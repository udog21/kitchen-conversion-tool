import { useState, useEffect } from "react";
import { ClickableButton } from "./ClickableButton";
import { OutputDisplay } from "./OutputDisplay";
import { DecimalKeypad } from "./DecimalKeypad";
import { useAnalytics, useDebouncedConversionTracking } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

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
    let temp = parseFloat(inputTemp) || 0;
    
    // Step 1: Apply fan/convection adjustment in INPUT units (recipe-first approach)
    // This respects the recipe's original measurement system
    if (inputFan !== outputFan) {
      if (inputFan && !outputFan) {
        // Converting from fan to conventional: increase temperature
        temp = inputUnit === "C" ? temp + 20 : temp + 25;
      } else if (!inputFan && outputFan) {
        // Converting from conventional to fan: decrease temperature
        temp = inputUnit === "C" ? temp - 20 : temp - 25;
      }
    }
    
    // Step 2: Convert between units
    let result: number;
    if (inputUnit === "C" && outputUnit === "F") {
      result = (temp * 9/5) + 32;
    } else if (inputUnit === "F" && outputUnit === "C") {
      result = (temp - 32) * 5/9;
    } else {
      result = temp;
    }

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
              <div className="border-2 border-[#F4A261] rounded-lg p-1.5 flex">
                <button
                  onClick={() => setInputUnit("C")}
                  data-testid="input-unit-c"
                  className={cn(
                    "w-14 py-1.5 rounded-md text-xl font-semibold transition-all",
                    inputUnit === "C"
                      ? "border-2 border-[#F4A261] text-[#C34628]"
                      : "text-muted-foreground hover-elevate"
                  )}
                >
                  °C
                </button>
                <button
                  onClick={() => setInputUnit("F")}
                  data-testid="input-unit-f"
                  className={cn(
                    "w-14 py-1.5 rounded-md text-xl font-semibold transition-all",
                    inputUnit === "F"
                      ? "border-2 border-[#F4A261] text-[#C34628]"
                      : "text-muted-foreground hover-elevate"
                  )}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Oven Type Segmented Toggle */}
            <div className="border-2 border-[#F4A261] rounded-lg p-1.5 flex">
              <button
                onClick={() => setInputFan(false)}
                data-testid="input-oven-conventional"
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all",
                  !inputFan 
                    ? "border-2 border-[#F4A261] text-[#C34628]" 
                    : "text-muted-foreground hover-elevate"
                )}
              >
                Conventional
              </button>
              <button
                onClick={() => setInputFan(true)}
                data-testid="input-oven-fan"
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all",
                  inputFan 
                    ? "border-2 border-[#F4A261] text-[#C34628]" 
                    : "text-muted-foreground hover-elevate"
                )}
              >
                Fan/convection
              </button>
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
              <div className="border-2 border-[#F4A261] rounded-lg p-1.5 flex">
                <button
                  onClick={() => setOutputUnit("C")}
                  data-testid="output-unit-c"
                  className={cn(
                    "w-14 py-1.5 rounded-md text-xl font-semibold transition-all",
                    outputUnit === "C"
                      ? "border-2 border-[#F4A261] text-[#C34628]"
                      : "text-muted-foreground hover-elevate"
                  )}
                >
                  °C
                </button>
                <button
                  onClick={() => setOutputUnit("F")}
                  data-testid="output-unit-f"
                  className={cn(
                    "w-14 py-1.5 rounded-md text-xl font-semibold transition-all",
                    outputUnit === "F"
                      ? "border-2 border-[#F4A261] text-[#C34628]"
                      : "text-muted-foreground hover-elevate"
                  )}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Oven Type Segmented Toggle */}
            <div className="border-2 border-[#F4A261] rounded-lg p-1.5 flex">
              <button
                onClick={() => setOutputFan(false)}
                data-testid="output-oven-conventional"
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all",
                  !outputFan 
                    ? "border-2 border-[#F4A261] text-[#C34628]" 
                    : "text-muted-foreground hover-elevate"
                )}
              >
                Conventional
              </button>
              <button
                onClick={() => setOutputFan(true)}
                data-testid="output-oven-fan"
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all",
                  outputFan 
                    ? "border-2 border-[#F4A261] text-[#C34628]" 
                    : "text-muted-foreground hover-elevate"
                )}
              >
                Fan/convection
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>When converting between conventional and fan/convection modes, a fixed adjustment is first made to the input (recipe) temperature before it is converted to Celsius/Fahrenheit: 20°C for Celsius recipes, 25°F for Fahrenheit recipes. Check your oven's manual as some ovens do this adjustment automatically.</p>
        <p className="mt-3"></p>
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
