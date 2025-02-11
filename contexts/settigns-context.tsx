'use client';

import { createContext, useContext, useState } from 'react';

export interface Settings {
  auctionType: string;
  initialPrice: number;
  minPrice: number;
  readonly priceDrop: number;
  interval: number;
  initialTokens: number;
  sealedBid: boolean;
  totalTime: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Settings = {
  auctionType: 'dutch',
  initialPrice: 1000,
  minPrice: 100,
  interval: 10,
  initialTokens: 1000,
  sealedBid: false,
  totalTime: 5, // in min
  get priceDrop() {
    return (this.initialPrice - this.minPrice) / (this.totalTime * 60 / this.interval);
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
