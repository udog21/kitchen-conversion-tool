import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ConversionTabs, TabType } from "@/components/ConversionTabs";
import { TemperatureDisplay } from "@/components/TemperatureDisplay";
import { ConversionDisplay } from "@/components/ConversionDisplay";
import { SubstitutionsDisplay } from "@/components/SubstitutionsDisplay";
import { AdBanner } from "@/components/AdBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SystemPicker } from "@/components/SystemPicker";
import {
  type MeasurementSystem,
  getStoredSystem,
  storeSystem,
  detectSystemFromLocation,
} from "@/lib/systemDetection";

const LAST_TAB_STORAGE_KEY = "kitchen-conversion:last-tab";

const pathToTab = (path: string): TabType | null => {
  switch (path) {
    case "/temperature":
      return "temperature";
    case "/substitutions":
      return "substitutions";
    case "/volume-weight":
    case "/":
      return "volume-weight";
    default:
      return null;
  }
};

const tabToPath = (tab: TabType): string => {
  switch (tab) {
    case "temperature":
      return "/temperature";
    case "substitutions":
      return "/substitutions";
    case "volume-weight":
    default:
      return "/";
  }
};

export default function Home() {
  const [location, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // 1) Prefer tab derived from the current URL
    const tabFromPath = pathToTab(location);
    if (tabFromPath) {
      return tabFromPath;
    }

    // 2) Fallback to last tab from localStorage, if present
    try {
      const stored = window.localStorage.getItem(LAST_TAB_STORAGE_KEY);
      if (stored === "temperature" || stored === "volume-weight" || stored === "substitutions") {
        return stored;
      }
    } catch {
      // Ignore storage errors and fall through to default
    }

    // 3) Default
    return "volume-weight";
  });
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>("US");
  const [showSystemPicker, setShowSystemPicker] = useState(false);

  // Auto-detect system on mount
  useEffect(() => {
    const initializeSystem = async () => {
      // Check if user has a stored preference
      const stored = getStoredSystem();
      if (stored) {
        setMeasurementSystem(stored);
        return;
      }

      // Otherwise, detect from location
      const detected = await detectSystemFromLocation();
      setMeasurementSystem(detected);
      storeSystem(detected);
    };

    initializeSystem();
  }, []);

  const handleSystemChange = (system: MeasurementSystem) => {
    setMeasurementSystem(system);
    storeSystem(system);
  };

  // Keep active tab in sync when the URL changes (back/forward navigation, deep links)
  useEffect(() => {
    const tabFromPath = pathToTab(location);
    if (tabFromPath && tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
    }
  }, [location, activeTab]);

  // Persist last visited tab whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_TAB_STORAGE_KEY, activeTab);
    } catch {
      // Fail silently if storage is unavailable
    }
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    const targetPath = tabToPath(tab);
    if (location !== targetPath) {
      setLocation(targetPath);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "temperature":
        return <TemperatureDisplay />;
      case "volume-weight":
        return <ConversionDisplay system={measurementSystem} />;
      case "substitutions":
        return <SubstitutionsDisplay />;
      default:
        return null;
    }
  };

  const renderBeforeCopy = () => {
    switch (activeTab) {
      case "temperature":
        return (
          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              Oven temperature accuracy is crucial for successful baking, but many home ovens have significant temperature variations. 
              The temperature displayed on your oven's dial or digital display may not match the actual temperature inside the oven cavity. 
              Hot spots—areas that are consistently hotter or cooler than the set temperature—are common, especially in older ovens.
            </p>
            <p>
              To ensure accurate baking, use an oven thermometer or probe to measure the actual temperature at different positions. 
              Place the probe in the center of the oven, where most baking occurs, and compare the reading to your oven's setting. 
              If there's a discrepancy, you can adjust your recipes accordingly or have your oven calibrated by a professional.
            </p>
            <p>
              Many modern ovens offer fan or convection modes, which circulate hot air throughout the oven cavity. This creates more 
              even heat distribution and can reduce hot spots. When using convection mode, you typically need to reduce the temperature 
              by about 20°C (or 25°F) compared to conventional baking, as the moving air transfers heat more efficiently to your food. 
              Some ovens automatically adjust for this, but others require manual adjustment. Check your oven's manual to determine which applies.
            </p>
          </div>
        );
      case "volume-weight":
        return (
          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              Converting between volume measurements (cups, tablespoons, milliliters) and weight measurements (grams, ounces, pounds) 
              requires understanding ingredient density. Different ingredients have vastly different densities: a cup of flour weighs 
              significantly less than a cup of sugar, and a cup of water weighs differently than a cup of oil. This is why volume-to-weight 
              conversions are ingredient-specific.
            </p>
            <p>
              For accurate volume measurements, use proper technique. For dry ingredients like flour, spoon the ingredient into the 
              measuring cup and level it off with a straight edge—don't pack it down or scoop directly from the container, as this 
              compacts the ingredient and leads to inaccurate measurements. For liquids, use a clear measuring cup and read the measurement 
              at eye level, with the meniscus (the curved surface of the liquid) aligned with the measurement line.
            </p>
            <p>
              Weight measurements are generally more accurate and reliable than volume measurements, especially for baking. Professional 
              bakers almost exclusively use weight measurements because they eliminate the variability introduced by how ingredients are 
              packed, sifted, or measured. If precision matters for your recipe, invest in a kitchen scale and use weight measurements 
              whenever possible.
            </p>
          </div>
        );
      case "substitutions":
        return (
          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              Ingredient substitutions can save a recipe when you're missing a key ingredient, but not all substitutions are created equal. 
              Some ingredients can be swapped with minimal impact on flavor and texture, while others may significantly alter your final 
              dish. Understanding the role each ingredient plays in your recipe helps you choose appropriate substitutes.
            </p>
            <p>
              When substituting ingredients, consider both flavor and functional properties. For example, baking powder and baking soda 
              both leaven baked goods, but they work differently chemically and may require different amounts. Some substitutions work 
              well in certain contexts but not others. For example, buttermilk can replace regular milk in many recipes, but the added acidity may 
              affect the final texture or flavor profile.
            </p>
            <p>
              Always consider dietary restrictions and allergies when making substitutions. If you're cooking for someone with food 
              allergies or dietary restrictions, verify that substitute ingredients are safe for them. Some substitutions may also 
              affect cooking times or temperatures, so monitor your dish closely when using an unfamiliar substitute for the first time.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAfterCopy = () => {
    switch (activeTab) {
      case "temperature":
        return (
          <div className="space-y-3 text-foreground leading-relaxed">
            <p>
              <strong>How to use this converter:</strong> Enter the temperature you want to convert in the input field. Select whether 
              the input temperature is in Celsius (°C) or Fahrenheit (°F) using the unit toggle. Choose whether the input represents a 
              conventional oven or a fan/convection oven setting. The converter will display the equivalent temperature in your chosen 
              output unit and oven type.
            </p>
            <p>
              <strong>Important notes:</strong> When converting between conventional and fan/convection modes, this tool applies a fixed 
              adjustment: 20°C for Celsius recipes or 25°F for Fahrenheit recipes. However, some modern ovens automatically adjust for 
              convection mode, so check your oven's manual to see if you need to manually adjust temperatures. The conversions are 
              mathematically exact, but actual oven temperatures can vary. Always verify with an oven thermometer for critical baking.
            </p>
          </div>
        );
      case "volume-weight":
        return (
          <div className="space-y-3 text-foreground leading-relaxed">
            <p>
              <strong>How to use this converter:</strong> Tap the input amount button to enter your starting measurement using the 
              keypad. Select your input unit (volume or weight) and output unit from the unit pickers. If you're converting between 
              volume and weight (e.g., cups to grams), you must select a specific ingredient, as different ingredients have different 
              densities. The converter will instantly display the equivalent measurement in your chosen output unit.
            </p>
            <p>
              <strong>Limitations:</strong> Volume-to-weight conversions are based on average ingredient densities and may vary slightly 
              depending on factors like how the ingredient is packed, its moisture content, or brand-specific variations. For same-category 
              conversions (volume-to-volume or weight-to-weight), the conversions are mathematically precise. For cross-category conversions, 
              results are approximate and should be used as a starting point—adjust based on your specific ingredient and measurement technique.
            </p>
          </div>
        );
      case "substitutions":
        return (
          <div className="space-y-3 text-foreground leading-relaxed">
            <p>
              <strong>How to use this converter:</strong> Tap the "Replace" section to enter the amount and unit of the ingredient you 
              want to substitute. Select the ingredient from the picker. The converter will display one or more substitute options with 
              the appropriate scaled amounts. Each substitute includes special instructions or notes about how to use it effectively.
            </p>
            <p>
              <strong>Important considerations:</strong> Substitutions are categorized as "direct" (can be used in equal amounts) or 
              "near" (may require slight adjustments). Always read the special instructions for each substitute, as some may require 
              additional ingredients or technique changes. Test unfamiliar substitutions in small batches first, especially for baked 
              goods where precise chemistry matters. Some substitutions may affect cooking time, texture, or flavor—adjust your recipe 
              accordingly.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Combined sticky header + tab bar so they move together */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <SiteHeader
          measurementSystem={measurementSystem}
          onSystemPickerOpen={() => setShowSystemPicker(true)}
        />
        <div className="pt-6 pb-0 border-b border-border">
          <div className="max-w-4xl mx-auto px-4">
            <ConversionTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">

        {/* Tab Content Area */}
        <div className="pb-8 pt-2">
          {/* Before Copy - Things you should know */}
          <div className="mt-6 mb-6">
            {renderBeforeCopy()}
          </div>

          {/* Ad Slot */}
          <div className="mb-6 flex justify-center">
            <AdBanner type="horizontal" />
          </div>

          {/* Elevated Calculator Container */}
          <div className="bg-[#E9C46A]/10 rounded-xl border-2 border-[#E9C46A]/30 shadow-lg shadow-[#E9C46A]/10 p-6 mb-6">
            {renderTabContent()}
          </div>

          {/* After Copy - How to use this converter */}
          <div className="mb-6">
            {renderAfterCopy()}
          </div>
        </div>
      </div>

      {/* System Picker Modal */}
      <SystemPicker
        isOpen={showSystemPicker}
        onClose={() => setShowSystemPicker(false)}
        currentSystem={measurementSystem}
        onSystemChange={handleSystemChange}
      />
    </div>
  );
}