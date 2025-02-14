'use client';

import { useSettings } from '@/contexts/settigns-context';
import DutchAuction from '@/components/DutchAuction/DutchAuction';
import ReverseAuction from '@/components/ReverseAuction/ReverseAuction';
import { useAuth } from '@/contexts/auth-context';

interface PricePoint {
  time: number;
  price: number;
}

export default function Page() {
  const { settings } = useSettings()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please register first</h2>
          <p className="text-gray-600">You need to be registered to access the auction</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {settings.auctionType.includes('dutch') && 
        <DutchAuction settings={settings} user={user} />
      }
      {settings.auctionType.includes('reverse') &&
        <ReverseAuction settings={settings} user={user} />
      }
    </div>
  )
}
