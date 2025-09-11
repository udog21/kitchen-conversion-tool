import { useState } from 'react';
import { ConversionTabs, TabType } from '../ConversionTabs';

export default function ConversionTabsExample() {
  const [activeTab, setActiveTab] = useState<TabType>("imperial-metric");

  return <ConversionTabs activeTab={activeTab} onTabChange={setActiveTab} />;
}