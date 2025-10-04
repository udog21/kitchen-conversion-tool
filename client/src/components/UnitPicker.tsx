import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClickableButton } from "./ClickableButton";

interface UnitPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnit: string;
  onUnitChange: (unit: string) => void;
  units: string[];
  title: string;
}

export function UnitPicker({ 
  isOpen, 
  onClose, 
  currentUnit, 
  onUnitChange, 
  units,
  title 
}: UnitPickerProps) {
  // Define unit categories
  const volumeUnits = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon", "mL", "liter"];
  const weightUnits = ["ounce", "pound", "gram", "kilogram"];
  const imperialVolumeUnits = ["teaspoon", "tablespoon", "cup", "pint", "quart", "gallon"];
  const metricVolumeUnits = ["mL", "liter"];
  const imperialWeightUnits = ["ounce", "pound"];
  const metricWeightUnits = ["gram", "kilogram"];

  // Check if this is a measurement unit picker (vs ingredient picker)
  const isMeasurementPicker = units.some(unit => 
    volumeUnits.includes(unit) || weightUnits.includes(unit)
  );

  // Determine if current unit is volume or weight
  const isCurrentVolume = volumeUnits.includes(currentUnit);
  const isCurrentWeight = weightUnits.includes(currentUnit);
  
  // State for volume/weight toggle
  const [unitCategory, setUnitCategory] = useState<"volume" | "weight">(
    isCurrentVolume ? "volume" : "weight"
  );

  // State for search query (for ingredient picker)
  const [searchQuery, setSearchQuery] = useState("");

  // Reset toggle and search when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUnitCategory(isCurrentVolume ? "volume" : "weight");
      setSearchQuery("");
    }
  }, [isOpen, currentUnit]);

  const handleUnitSelect = (unit: string) => {
    onUnitChange(unit);
    onClose();
  };

  // Filter units based on category toggle (only if this is a measurement picker)
  // For ingredient picker, also filter by search query
  const filteredUnits = isMeasurementPicker 
    ? units.filter(unit => 
        unitCategory === "volume" ? volumeUnits.includes(unit) : weightUnits.includes(unit)
      )
    : units.filter(unit => 
        unit.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  const imperialOptions = isMeasurementPicker 
    ? filteredUnits.filter(unit => 
        unitCategory === "volume" 
          ? imperialVolumeUnits.includes(unit) 
          : imperialWeightUnits.includes(unit)
      )
    : [];
  
  const metricOptions = isMeasurementPicker 
    ? filteredUnits.filter(unit => 
        unitCategory === "volume" 
          ? metricVolumeUnits.includes(unit) 
          : metricWeightUnits.includes(unit)
      )
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Volume/Weight Toggle - only show for measurement pickers */}
          {isMeasurementPicker && (
            <div className="flex gap-2 justify-center">
              <ClickableButton
                onClick={() => setUnitCategory("volume")}
                showInnerBorder={unitCategory === "volume"}
                data-testid="toggle-volume"
                className="flex-1"
              >
                Volume
              </ClickableButton>
              <ClickableButton
                onClick={() => setUnitCategory("weight")}
                showInnerBorder={unitCategory === "weight"}
                data-testid="toggle-weight"
                className="flex-1"
              >
                Weight
              </ClickableButton>
            </div>
          )}

          {/* For measurement pickers, show grouped by imperial/metric */}
          {isMeasurementPicker && imperialOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Imperial</h3>
              <div className="grid grid-cols-2 gap-3">
                {imperialOptions.map((unit) => (
                  <ClickableButton
                    key={unit}
                    showInnerBorder={currentUnit === unit}
                    onClick={() => handleUnitSelect(unit)}
                    data-testid={`unit-option-${unit.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    variant="modal"
                  >
                    {unit.toLowerCase()}
                  </ClickableButton>
                ))}
              </div>
            </div>
          )}
          
          {isMeasurementPicker && metricOptions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Metric</h3>
              <div className="grid grid-cols-2 gap-3">
                {metricOptions.map((unit) => (
                  <ClickableButton
                    key={unit}
                    showInnerBorder={currentUnit === unit}
                    onClick={() => handleUnitSelect(unit)}
                    data-testid={`unit-option-${unit.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    variant="modal"
                  >
                    {unit.toLowerCase()}
                  </ClickableButton>
                ))}
              </div>
            </div>
          )}

          {/* For non-measurement pickers (like ingredients), show as simple list */}
          {!isMeasurementPicker && (
            <div className="space-y-4">
              {/* Search input for ingredients */}
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="ingredient-search-input"
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#F4A261] transition-colors"
              />
              
              {/* "anything" option at the top */}
              {filteredUnits.includes("anything") && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ClickableButton
                      showInnerBorder={currentUnit === "anything"}
                      onClick={() => handleUnitSelect("anything")}
                      data-testid="unit-option-anything"
                      variant="modal"
                    >
                      any ingredient
                    </ClickableButton>
                  </div>
                  {/* Separator line */}
                  <div className="border-t border-border"></div>
                </>
              )}
              
              {/* Other ingredients */}
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {filteredUnits.filter(unit => unit !== "anything").map((unit) => (
                  <ClickableButton
                    key={unit}
                    showInnerBorder={currentUnit === unit}
                    onClick={() => handleUnitSelect(unit)}
                    data-testid={`unit-option-${unit.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    variant="modal"
                  >
                    {unit.toLowerCase()}
                  </ClickableButton>
                ))}
              </div>
              
              {/* No results message */}
              {filteredUnits.filter(unit => unit !== "anything").length === 0 && searchQuery && (
                <div className="text-center text-muted-foreground py-4">
                  No ingredients found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}