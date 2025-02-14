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
import { AuctionStats } from './AuctionStats';
import { BidDialog } from './BidDialog';
import { formatTime } from '@/lib/utils';
import { Settings } from '@/contexts/settigns-context';
import { User } from '@/contexts/auth-context';
import { AuctionTimer } from '../generalAuction/AuctionTimer';
import { useCountdown } from '@/hooks/use-countdown';
import { Button } from '../ui/button';
import { 
  calculateLinearPrice, 
  calculateExponentialPrice, 
  calculateCustomPrice 
} from '@/lib/price-calculator';

interface PricePoint {
  time: number;
  price: number;
}

export default function DutchAuction({ settings, user }: { settings: Settings, user: User }) {
  const AUCTION_DURATION = settings.totalTime * 60 * 1000;
  const PRICE_DROP = settings.priceDrop
  const INTERVAL = settings.interval
  const WHEN_TO_SHOW_TOKENS_INTERVAL = settings.intervalWhenToShowTokens
  const MIN_PRICE = settings.minPrice
  const INITIAL_PRICE = settings.initialPrice
  const INITIAL_TOKENS = settings.initialTokens
  const SEALED_BID = settings.sealedBid;
  const TOTAL_TOKENS = settings.initialTokens;

  const [currentPrice, setCurrentPrice] = useState(settings.initialPrice)
  const [timeUntilDrop, setTimeUntilDrop] = useState(settings.interval)
  const [timeUntilShowTokens, setTimeUntilShowTokens] = useState(settings.intervalWhenToShowTokens)
  const [progress, setProgress] = useState(100)
  const [progressTokenReveal, setProgressTokenReveal] = useState(100)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([{ time: 0, price: settings.initialPrice }])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [availableTokens, setAvailableTokens] = useState(settings.initialTokens)
  const [sealedAvailableTokens, setSealedAvailableTokens] = useState<
    string | number
  >(settings.initialTokens);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [endTime] = useState(
    () => new Date(new Date().getTime() + AUCTION_DURATION)
  );
  const timeLeft = useCountdown(endTime);

  // Add this new state to track the next price drop time
  const [nextDropTime] = useState(
    () => new Date(new Date().getTime() + INTERVAL * 1000)
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let elapsedTimer: NodeJS.Timeout;

    if (currentPrice > MIN_PRICE && availableTokens > 0 && !timeLeft.isExpired) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const nextDrop = nextDropTime.getTime();
        const timeUntilNextDrop = Math.max(0, Math.ceil((nextDrop - now) / 1000));

        setTimeUntilDrop(timeUntilNextDrop);
        setProgress((timeUntilNextDrop / INTERVAL) * 100);

        // If it's time for a price drop
        if (timeUntilNextDrop === 0) {
          const elapsedIntervals = Math.floor(elapsedTime / INTERVAL);
          const totalIntervals = Math.floor((settings.totalTime * 60) / INTERVAL);

          let newPrice;
          switch (settings.priceFunction) {
            case 'exponential':
              newPrice = calculateExponentialPrice(
                INITIAL_PRICE,
                MIN_PRICE,
                elapsedIntervals,
                totalIntervals
              );
              break;
            case 'custom':
              newPrice = calculateCustomPrice(
                INITIAL_PRICE,
                MIN_PRICE,
                elapsedIntervals,
                settings.customSlopes
              );
              break;
            case 'linear':
            default:
              newPrice = calculateLinearPrice(
                INITIAL_PRICE,
                MIN_PRICE,
                elapsedIntervals,
                totalIntervals
              );
          }

          setCurrentPrice(newPrice);
          setPriceHistory((prev) => [...prev, { time: elapsedTime, price: newPrice }]);
          nextDropTime.setTime(nextDropTime.getTime() + INTERVAL * 1000);
        }

        setTimeUntilShowTokens((prev) => {
          if (prev <= 1) {
            setSealedAvailableTokens(availableTokens);
            return WHEN_TO_SHOW_TOKENS_INTERVAL;
          }
        //   if (SEALED_BID && prev === WHEN_TO_SHOW_TOKENS_INTERVAL - 1) {
        //     setSealedAvailableTokens('??');
        //   }
          return prev - 1;
        });

        setProgressTokenReveal((prev) => {
          if (prev <= 0) return 100;
          return prev - 100 / WHEN_TO_SHOW_TOKENS_INTERVAL;
        });
      }, 1000);

      elapsedTimer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    // Add this check to reveal tokens when auction ends
    if (currentPrice <= MIN_PRICE || availableTokens === 0) {
      setSealedAvailableTokens(availableTokens);
    }

    return () => {
      clearInterval(timer);
      clearInterval(elapsedTimer);
    };
  }, [currentPrice, elapsedTime, availableTokens, SEALED_BID, timeLeft.isExpired, nextDropTime]);

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
      setSealedAvailableTokens('??');
    } else {
      setSealedAvailableTokens((prev) => prev - tokens);
    }
    setBidAmount('');
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <span>{settings.auctionType.toUpperCase()} Auction Simulator - {TOTAL_TOKENS} Tokens Available</span>

            {timeLeft.isExpired && (
              <div className="mt-2">
                <span className="text-red-500 text-sm font-normal bg-red-50 px-3 py-1">
                  Auction Ended
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
            <AuctionTimer {...timeLeft} />

          <AuctionStats
            availableTokens={sealedAvailableTokens}
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

          {(settings.sealedBid === true) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next token amount reveal:</span>
              <span>{timeUntilShowTokens}s</span>
            </div>
            <Progress value={progressTokenReveal} className="h-2" />
          </div>
          )}  

          {(currentPrice <= MIN_PRICE || availableTokens === 0) && (
            <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
              {availableTokens === 0
                ? 'Auction ended - All tokens sold'
                : 'Auction ended at minimum price'}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
            <div className="flex justify-center gap-4">
              <Button onClick={() => setIsDialogOpen(true)} disabled={currentPrice <= MIN_PRICE || availableTokens === 0}>
                Bid Now
              </Button>
            </div>

        </CardFooter>
      </Card>

      <BidDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentPrice={currentPrice}
        availableTokens={sealedAvailableTokens}
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
