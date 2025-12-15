import { useEffect, useRef } from "react";

interface AdBannerProps {
  type: "horizontal" | "square";
  className?: string;
}

// Extend Window interface for AdSense
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

// Ad slot IDs - Set these in your AdSense account and add the slot IDs here
// To get your ad slot IDs:
// 1. Go to AdSense > Ads > By ad unit
// 2. Create new ad units (one for horizontal, one for square/rectangle)
// 3. Copy the ad slot ID (numbers only, e.g., "1234567890")
// 4. Replace the values below
// If you're using auto ads, you can leave these empty and AdSense will automatically place ads
const AD_SLOT_IDS = {
  horizontal: import.meta.env.VITE_ADSENSE_SLOT_HORIZONTAL || "",
  square: import.meta.env.VITE_ADSENSE_SLOT_SQUARE || "",
};

export function AdBanner({ type, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adPushed = useRef(false);

  useEffect(() => {
    // Only push ad once per component instance
    if (adPushed.current || !adRef.current) return;

    try {
      // Initialize AdSense ad
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
        adPushed.current = true;
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  const adSlotId = type === "horizontal" ? AD_SLOT_IDS.horizontal : AD_SLOT_IDS.square;
  
  // If no ad slot ID is provided, don't render the ad unit
  // AdSense auto ads will handle ad placement automatically if enabled
  if (!adSlotId) {
    return null;
  }

  const adConfig = type === "horizontal" 
    ? {
        "data-ad-slot": adSlotId,
        "data-ad-format": "auto",
        "data-full-width-responsive": "true",
        style: { display: "block", minWidth: "320px", minHeight: "50px" }
      }
    : {
        "data-ad-slot": adSlotId,
        "data-ad-format": "auto",
        "data-full-width-responsive": "true",
        style: { display: "block", minWidth: "300px", minHeight: "250px" }
      };

  return (
    <div
      ref={adRef}
      className={`${className} flex justify-center items-center`}
      data-testid={`ad-banner-${type}`}
    >
      <ins
        className="adsbygoogle"
        style={adConfig.style}
        data-ad-client="ca-pub-6161880957789716"
        {...adConfig}
      />
    </div>
  );
}