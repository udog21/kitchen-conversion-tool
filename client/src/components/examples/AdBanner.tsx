import { AdBanner } from '../AdBanner';

export default function AdBannerExample() {
  return (
    <div className="space-y-4">
      <AdBanner type="horizontal" />
      <AdBanner type="square" />
    </div>
  );
}