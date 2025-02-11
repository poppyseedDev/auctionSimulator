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
import { formatTime } from '@/lib/utils';
import { Settings } from '@/contexts/settigns-context';

interface PricePoint {
  time: number;
  price: number;
}

export default function DutchAuction({ settings }: { settings: Settings}) {
  const [currentPrice, setCurrentPrice] = useState(settings.initialPrice)
  const [isRunning, setIsRunning] = useState(false)
  const [timeUntilDrop, setTimeUntilDrop] = useState(settings.interval)
  const [progress, setProgress] = useState(100)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([{ time: 0, price: settings.initialPrice }])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [availableTokens, setAvailableTokens] = useState(settings.initialTokens)
  const [displayedAvailableTokens, setDisplayedAvailableTokens] = useState<
    string | number
  >(settings.initialTokens);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const PRICE_DROP = settings.priceDrop
  const INTERVAL = settings.interval
  const MIN_PRICE = settings.minPrice
  const INITIAL_PRICE = settings.initialPrice
  const INITIAL_TOKENS = settings.initialTokens
  const SEALED_BID = settings.sealedBid;

  const resetAuction = useCallback(() => {
    setCurrentPrice(INITIAL_PRICE);
    setTimeUntilDrop(INTERVAL);
    setIsRunning(false);
    setProgress(100);
    setPriceHistory([{ time: 0, price: INITIAL_PRICE }]);
    setElapsedTime(0);
    setAvailableTokens(INITIAL_TOKENS);
    setDisplayedAvailableTokens(INITIAL_TOKENS);
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

  const handleBid = () => {
    const tokens = Number(bidAmount);
    if (tokens <= 0 || tokens > availableTokens) {
      return;
    }

    const newBid: Bid = {
      id: Date.now(),
      tokens: SEALED_BID ? '??' : tokens,
      price: currentPrice,
      total: SEALED_BID ? '??' : tokens * currentPrice,
      timestamp: new Date().toLocaleTimeString(),
    };

    setBids((prev) => [newBid, ...prev]);
    setAvailableTokens((prev) => prev - tokens);
    if (SEALED_BID) {
      setDisplayedAvailableTokens('??');
    } else {
      setDisplayedAvailableTokens((prev) => prev - tokens);
    }
    setBidAmount('');
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {settings.auctionType.toUpperCase()} Auction Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <AuctionStats
            availableTokens={displayedAvailableTokens}
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
        availableTokens={displayedAvailableTokens}
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
