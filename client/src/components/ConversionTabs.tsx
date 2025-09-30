import { useState } from "react";

export type TabType = "temperature" | "volume-weight" | "substitutions";

interface ConversionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "temperature" as TabType, label: "Temperature" },
  { id: "volume-weight" as TabType, label: "Volume & Weight" },
  { id: "substitutions" as TabType, label: "Substitutions" },
];

export function ConversionTabs({ activeTab, onTabChange }: ConversionTabsProps) {
  return (
    <div className="flex bg-background">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          data-testid={`tab-${tab.id}`}
          className={`
            flex-1 px-4 py-3 font-medium transition-all duration-200 rounded-t-lg
            min-h-12 relative border-t border-l border-r
            ${
              activeTab === tab.id
                ? "bg-card text-foreground border-card-border border-b-0"
                : "bg-muted/30 text-muted-foreground border-card-border border-b hover-elevate"
            }
          `}
          style={{ fontSize: "13px" }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-conversion-accent rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}