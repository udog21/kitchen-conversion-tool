interface AdBannerProps {
  type: "horizontal" | "square";
  className?: string;
}

export function AdBanner({ type, className = "" }: AdBannerProps) {
  const dimensions = type === "horizontal" 
    ? "h-12 w-full max-w-md" 
    : "h-64 w-full max-w-xs";

  return (
    <div
      className={`${dimensions} ${className} border border-muted bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground text-sm`}
      data-testid={`ad-banner-${type}`}
    >
      {/* TODO: Replace with actual ad network integration */}
      <span>Ad Space {type === "horizontal" ? "320x50" : "300x250"}</span>
    </div>
  );
}