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
import {
  calculateLinearPrice,
  calculateExponentialPrice,
  calculateCustomPrice,
} from '@/lib/price-calculator';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Add this type before the Settings component
type PriceFunction = 'linear' | 'exponential' | 'custom';

export default function Settings() {
  const { settings, updateSettings, resetToDefaults } = useSettings();

  const calculatePriceDrop = () => {
    const totalIntervals = (settings.totalTime * 60) / settings.interval;
    if (totalIntervals === 0) return 0;
    
    const priceDrop = (settings.initialPrice - settings.minPrice) / totalIntervals;
    return isFinite(priceDrop) ? Number(priceDrop.toFixed(2)) : 0;
  };

  const handleChange =
    (key: keyof typeof settings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        updateSettings({ [key]: value });
      }
    };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const auctionType = e.target.value;
    updateSettings({
      auctionType,
      sealedBid: auctionType.includes('sealed')
    });
  };

  // Add this new handler
  const handlePriceFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ priceFunction: e.target.value as PriceFunction });
  };

  // Add this function to generate preview data
  const generatePreviewData = () => {
    const totalIntervals = Math.floor((settings.totalTime * 60) / settings.interval);
    const data = [];

    for (let i = 0; i <= totalIntervals; i++) {
      let price;
      switch (settings.priceFunction) {
        case 'exponential':
          price = calculateExponentialPrice(
            settings.initialPrice,
            settings.minPrice,
            i,
            totalIntervals
          );
          break;
        case 'custom':
          price = calculateCustomPrice(
            settings.initialPrice,
            settings.minPrice,
            i,
            settings.customSlopes
          );
          break;
        case 'linear':
        default:
          price = calculateLinearPrice(
            settings.initialPrice,
            settings.minPrice,
            i,
            totalIntervals
          );
      }
      // Convert interval to minutes
      const timeInMinutes = (i * settings.interval) / 60;
      data.push({
        time: Number(timeInMinutes.toFixed(1)),
        price: Number(price.toFixed(2)),
      });
    }
    return data;
  };

  // Add the preview chart component right after the price function selector
  const renderPricePreview = () => {
    if (settings.auctionType !== 'dutch' && settings.auctionType !== 'dutch-sealed') {
      return null;
    }

    return (
      <div className="grid gap-2">
        <Label>Price Decay Preview</Label>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generatePreviewData()} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time (minutes)', position: 'bottom' }}
              />
              <YAxis 
                domain={[settings.minPrice, settings.initialPrice]}
                label={{ value: 'Price ($)', angle: -90, position: 'left' }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2563eb" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
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
            <Link href="/auction">
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

            {(settings.auctionType === 'dutch' || settings.auctionType === 'dutch-sealed') && (
              <div className="grid gap-2">
                <Label htmlFor="priceFunction">Price Decay Function</Label>
                <select
                  id="priceFunction"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.priceFunction}
                  onChange={handlePriceFunctionChange}
                >
                  <option value="linear">Linear (Default)</option>
                  <option value="exponential">Exponential</option>
                  <option value="custom">Custom (Multi-slope Linear)</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Select how the price should decrease over time
                </p>
                {renderPricePreview()}
              </div>
            )}
            
            {settings.priceFunction === 'custom' && (
              <div className="grid gap-2">
                <Label>Price Slopes ($ per interval)</Label>
                <div className="space-y-2">
                  {settings.customSlopes.map((slope, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="number"
                        value={slope.rate}
                        onChange={(e) => {
                          const newSlopes = [...settings.customSlopes];
                          newSlopes[index].rate = Number(e.target.value);
                          updateSettings({ customSlopes: newSlopes });
                        }}
                        placeholder="Slope rate"
                      />
                      <Input
                        type="number"
                        value={slope.duration}
                        onChange={(e) => {
                          const newSlopes = [...settings.customSlopes];
                          newSlopes[index].duration = Number(e.target.value);
                          updateSettings({ customSlopes: newSlopes });
                        }}
                        placeholder="Duration (intervals)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

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

                {(settings.auctionType === 'dutch' ||
              settings.auctionType === 'dutch-sealed') && (
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
              )}

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="totalTime">Total Auction Time (minutes)</Label>
                  <Input
                    id="totalTime"
                    type="number"
                    value={settings.totalTime}
                    onChange={handleChange('totalTime')}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    Total duration of the auction
                  </p>
                </div>

                {(settings.auctionType === 'dutch-sealed') && (
                <div className="grid gap-2">
                  <Label htmlFor="interval">Time interval showing token amount left (seconds)</Label>
                  <Input
                    id="intervalWhenToShowTokens"
                    type="number"
                    value={settings.intervalWhenToShowTokens}
                    onChange={handleChange('intervalWhenToShowTokens')}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    Time interval between showing amount of tokens left.
                  </p>
                </div>
                )}

                {(settings.auctionType === 'dutch' ||
              settings.auctionType === 'dutch-sealed') && (
                <>
                <div className="grid gap-2">
                  <Label htmlFor="interval">Time Interval (seconds)</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {settings.interval} sec
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Time interval between drops. This is fixed to 12 seconds, since it mimics the ethereum block production.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Price Drop per Interval</Label>
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    ${calculatePriceDrop()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Amount the price will decrease every {settings.interval} seconds
                  </p>
                </div>
                </>
              )}

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
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Link href="/auction">
              <Button>Save & Return</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
