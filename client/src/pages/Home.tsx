import { useState } from "react";
import { ConversionTabs, TabType } from "@/components/ConversionTabs";
import { ConversionDisplay } from "@/components/ConversionDisplay";
import { AdBanner } from "@/components/AdBanner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("imperial-metric");

  const renderTabContent = () => {
    switch (activeTab) {
      case "imperial-metric":
        return <ConversionDisplay />;
      case "volume-weight":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Volume ↔ Weight</h3>
            <p>Coming soon! Convert between volume and weight measurements for different ingredients.</p>
          </div>
        );
      case "substitutions":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Ingredient Substitutions</h3>
            <p>Coming soon! Find ingredient substitutions and conversion ratios.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <header className="flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Kitchen Conversions</h1>
        <ThemeToggle />
      </header>

      <div className="max-w-lg mx-auto">
        {/* Top Ad Banner */}
        <div className="p-4 flex justify-center">
          <AdBanner type="horizontal" />
        </div>

        {/* Main Content */}
        <div className="space-y-4">
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
    </div>
  );
}