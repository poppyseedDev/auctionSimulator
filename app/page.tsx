'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { BidHistory, Bid } from '@/components/BidHistory';
import { AuctionStats } from '@/components/AuctionStats';
import { AuctionControls } from '@/components/AuctionControls';
import { BidDialog } from '@/components/BidDialog';

interface PricePoint {
  time: number;
  price: number;
}

export default function DutchAuction() {
  const [currentPrice, setCurrentPrice] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [timeUntilDrop, setTimeUntilDrop] = useState(10);
  const [progress, setProgress] = useState(100);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([
    { time: 0, price: 1000 },
  ]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [availableTokens, setAvailableTokens] = useState(1000);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const PRICE_DROP = 50;
  const INTERVAL = 10;
  const MIN_PRICE = 100;
  const INITIAL_PRICE = 1000;
  const INITIAL_TOKENS = 1000;

  const resetAuction = useCallback(() => {
    setCurrentPrice(INITIAL_PRICE);
    setTimeUntilDrop(INTERVAL);
    setIsRunning(false);
    setProgress(100);
    setPriceHistory([{ time: 0, price: INITIAL_PRICE }]);
    setElapsedTime(0);
    setAvailableTokens(INITIAL_TOKENS);
    setBids([]);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let elapsedTimer: NodeJS.Timeout;

    if (isRunning && currentPrice > MIN_PRICE && availableTokens > 0) {
      timer = setInterval(() => {
        setTimeUntilDrop((prev) => {
          if (prev <= 1) {
            setCurrentPrice((prevPrice) => {
              const newPrice = Math.max(prevPrice - PRICE_DROP, MIN_PRICE);
              setPriceHistory((prev) => [
                ...prev,
                { time: elapsedTime + INTERVAL, price: newPrice },
              ]);
              return newPrice;
            });
            return INTERVAL;
          }
          return prev - 1;
        });

        setProgress((prev) => {
          if (prev <= 0) return 100;
          return prev - 100 / INTERVAL;
        });
      }, 1000);

      elapsedTimer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
      clearInterval(elapsedTimer);
    };
  }, [isRunning, currentPrice, elapsedTime, availableTokens]);

  const toggleAuction = () => {
    setIsRunning((prev) => !prev);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBid = () => {
    const tokens = Number(bidAmount);
    if (tokens <= 0 || tokens > availableTokens) {
      return;
    }

    const newBid: Bid = {
      id: Date.now(),
      tokens,
      price: currentPrice,
      total: tokens * currentPrice,
      timestamp: new Date().toLocaleTimeString(),
    };

    setBids((prev) => [newBid, ...prev]);
    setAvailableTokens((prev) => prev - tokens);
    setBidAmount('');
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Dutch Auction Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <AuctionStats
            availableTokens={availableTokens}
            initialTokens={INITIAL_TOKENS}
            currentPrice={currentPrice}
            timeUntilDrop={timeUntilDrop}
            interval={INTERVAL}
            minPrice={MIN_PRICE}
            priceDrop={PRICE_DROP}
          />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next price drop in:</span>
              <span>{timeUntilDrop}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {(currentPrice <= MIN_PRICE || availableTokens === 0) && (
            <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
              {availableTokens === 0
                ? 'Auction ended - All tokens sold'
                : 'Auction ended at minimum price'}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <AuctionControls
            isRunning={isRunning}
            toggleAuction={toggleAuction}
            resetAuction={resetAuction}
            openBidDialog={() => setIsDialogOpen(true)}
            isDisabled={currentPrice <= MIN_PRICE || availableTokens === 0}
          />
        </CardFooter>
      </Card>

      <BidDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentPrice={currentPrice}
        availableTokens={availableTokens}
        bidAmount={bidAmount}
        onBidAmountChange={setBidAmount}
        onBidConfirm={handleBid}
      />

      <PriceHistoryChart
        priceHistory={priceHistory}
        minPrice={MIN_PRICE}
        initialPrice={INITIAL_PRICE}
        formatTime={formatTime}
      />
      <BidHistory bids={bids} />
    </div>
  );
}
