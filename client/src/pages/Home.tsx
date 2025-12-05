import { useState, useEffect } from "react";
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("volume-weight");
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        measurementSystem={measurementSystem}
        onSystemPickerOpen={() => setShowSystemPicker(true)}
      />

      <div className="max-w-4xl mx-auto pt-4">
        {/* Top Ad Banner */}
        <div className="p-4 flex justify-center">
          <AdBanner type="horizontal" />
        </div>

        {/* Main Content */}
        <div>
          {/* Conversion Tabs */}
          <ConversionTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Active Tab Content */}
          <div className="bg-card rounded-b-lg border-x border-b border-card-border min-h-96">
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Bottom Ad Banner */}
        <div className="p-4 flex justify-center">
          <AdBanner type="square" />
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