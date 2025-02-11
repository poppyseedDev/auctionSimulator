'use client';

import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import type React from 'react'; // Added import for React

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/settigns-context';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const { settings, updateSettings, resetToDefaults } = useSettings();

  const handleChange =
    (key: keyof typeof settings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        updateSettings({ [key]: value });
      }
    };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ auctionType: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Auction Settings</CardTitle>
              <CardDescription>
                Configure the parameters for your Dutch auction
              </CardDescription>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="auctionType">Auction Type</Label>
              <select
                id="auctionType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={settings.auctionType}
                onChange={handleSelectChange}
              >
                <option value="dutch">Dutch Auction</option>
                <option value="dutch-sealed">
                  Dutch Auction with Sealed Bids
                </option>
                <option value="reverse">Reverse Auction</option>
                <option value="reverse-sealed">
                  Sealed Bid Reverse Auction
                </option>
              </select>
              <p className="text-sm text-muted-foreground">
                Select the type of auction you want to run
              </p>
            </div>

            <Separator />

            {(settings.auctionType === 'dutch' ||
              settings.auctionType === 'dutch-sealed') && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="initialPrice">Initial Price ($)</Label>
                  <Input
                    id="initialPrice"
                    type="number"
                    value={settings.initialPrice}
                    onChange={handleChange('initialPrice')}
                    min={settings.minPrice}
                  />
                  <p className="text-sm text-muted-foreground">
                    The starting price of the auction
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minPrice">Minimum Price ($)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={settings.minPrice}
                    onChange={handleChange('minPrice')}
                    min={0}
                    max={settings.initialPrice}
                  />
                  <p className="text-sm text-muted-foreground">
                    The lowest price the auction can reach
                  </p>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="priceDrop">Price Drop Amount ($)</Label>
                  <Input
                    id="priceDrop"
                    type="number"
                    value={settings.priceDrop}
                    onChange={handleChange('priceDrop')}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    How much the price decreases each interval
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="interval">Time Interval (seconds)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={settings.interval}
                    onChange={handleChange('interval')}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    Time between price drops
                  </p>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="initialTokens">Initial Token Supply</Label>
                  <Input
                    id="initialTokens"
                    type="number"
                    value={settings.initialTokens}
                    onChange={handleChange('initialTokens')}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    Total number of tokens available at auction start
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Link href="/">
              <Button>Save & Return</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
