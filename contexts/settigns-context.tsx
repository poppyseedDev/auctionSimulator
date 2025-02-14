'use client';

import { createContext, useContext, useState } from 'react';

export interface Settings {
  auctionType: string;
  initialPrice: number;
  minPrice: number;
  readonly priceDrop: number;
  interval: number;
  intervalWhenToShowTokens: number;
  initialTokens: number;
  sealedBid: boolean;
  totalTime: number;
  priceFunction: 'linear' | 'exponential' | 'custom';
  customSlopes: Array<{
    rate: number;
    duration: number;
  }>;
}

const AUCTION_INTERVAL = 12; // fixed to 12 seconds to mimic block production

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Settings = {
  auctionType: 'dutch',
  initialPrice: 1000,
  minPrice: 100,
  interval: AUCTION_INTERVAL,
  initialTokens: 1000,
  intervalWhenToShowTokens: 60,
  sealedBid: false,
  totalTime: 5, // in min
  priceDrop: 36,
  priceFunction: 'linear',
  customSlopes: [
    { rate: 1, duration: 10 },
    { rate: 2, duration: 10 },
  ],
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const calculatePriceDrop = (currentSettings: Settings) => {
    const totalIntervals = (currentSettings.totalTime * 60) / currentSettings.interval;
    if (totalIntervals === 0) return 0;
    
    const priceDrop = (currentSettings.initialPrice - currentSettings.minPrice) / totalIntervals;
    return isFinite(priceDrop) ? Number(priceDrop.toFixed(2)) : 0;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings };
      // Recalculate priceDrop whenever relevant settings change
      if ('initialPrice' in newSettings || 'minPrice' in newSettings || 'totalTime' in newSettings) {
        return {
          ...updatedSettings,
          priceDrop: calculatePriceDrop(updatedSettings)
        };
      }
      return updatedSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetToDefaults }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
