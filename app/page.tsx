'use client';

import { useSettings } from '@/contexts/settigns-context';
import DutchAuction from '@/components/DutchAuction/DutchAuction';
import ReverseAuction from '@/components/ReverseAuction/ReverseAuction';

interface PricePoint {
  time: number;
  price: number;
}

export default function Page() {
  const { settings } = useSettings()
  return (
    <div>
      {settings.auctionType.includes('dutch') && 
        <DutchAuction settings={settings} />
      }
      {settings.auctionType.includes('reverse') &&
        <ReverseAuction settings={settings} />
      }
    </div>
  );
}
