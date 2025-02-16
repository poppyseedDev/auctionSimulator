'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountdown } from '@/hooks/use-countdown';
import { AuctionBidHistory } from '@/components/AuctionBidHistory';
import { AuctionPriceChart } from '@/components/AuctionPriceChart';
import { Bid } from '@/components/AuctionBidHistory';
import { Settings } from '@/contexts/settigns-context';
import { User } from '@/contexts/auth-context';
import { AuctionStats } from './AuctionStats';
import { AuctionTimer } from '../generalAuction/AuctionTimer';
import { AuctionEndAlert } from './AuctionEndAlert';
import { BidDialog } from './BidDialog';

export default function ReverseAuction({ settings, user }: { settings: Settings; user: User }) {
  const TOTAL_TOKENS = settings.initialTokens;
  const AUCTION_DURATION = settings.totalTime * 60 * 1000;
  const SEALED_BID = settings.sealedBid;

  const [endTime] = useState(() => new Date(new Date().getTime() + AUCTION_DURATION));
  const timeLeft = useCountdown(endTime);

  const [bids, setBids] = useState<Bid[]>([]);
  const [newBid, setNewBid] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const bidder = user.name;

  // Calculate winning bids, remaining tokens, and clearing price
  const { processedBids, remainingTokens, clearingPrice, totalProceeds } = useMemo(() => {
    // Sort bids by price per token (highest first)
    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
    let remainingTokens = TOTAL_TOKENS;
    let clearingPrice = settings.initialPrice;

    const processed = sortedBids.map((bid) => {
      const tokensWon = Math.min(bid.tokens, remainingTokens);
      const isWinning = tokensWon > 0;

      if (isWinning) {
        remainingTokens -= tokensWon;
        if (remainingTokens === 0) {
          clearingPrice = bid.amount; // This will end up being the lowest winning bid
        }
      }

      return {
        ...bid,
        isWinning,
        tokensWon: isWinning ? tokensWon : 0,
        finalPayment: isWinning ? tokensWon * clearingPrice : 0,
      };
    });

    const totalProceeds = processed.reduce((sum, bid) => sum + (bid.finalPayment || 0), 0);

    return {
      processedBids: processed,
      remainingTokens,
      clearingPrice,
      totalProceeds,
    };
  }, [TOTAL_TOKENS, settings.initialPrice, bids]);

  const handleBidConfirm = useCallback(
    (tokens: string, price: string) => {
      const pricePerToken = Number.parseFloat(price);
      const tokenCount = Number.parseInt(tokens);

      if (
        isNaN(pricePerToken) ||
        isNaN(tokenCount) ||
        tokenCount <= 0 ||
        pricePerToken <= 0 ||
        pricePerToken < settings.initialPrice ||
        !bidder.trim() ||
        timeLeft.isExpired
      ) {
        return;
      }

      const newBidEntry: Bid = {
        amount: pricePerToken,
        tokens: tokenCount,
        timestamp: new Date(),
        bidder: bidder.trim(),
        totalValue: pricePerToken * tokenCount,
      };

      setBids((prevBids) => [...prevBids, newBidEntry]);
      setNewBid('');
      setTokenAmount('');
      setIsDialogOpen(false);
    },
    [bidder, timeLeft.isExpired, settings.initialPrice]
  );

  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <span>Token Auction - {TOTAL_TOKENS} Tokens Available</span>
            {timeLeft.isExpired && (
              <div className="mt-2">
                <span className="text-red-500 text-sm font-normal bg-red-50 px-3 py-1">
                  Auction Ended
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className=" ">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <AuctionTimer {...timeLeft} />

            {(timeLeft.isExpired || !SEALED_BID) && (
              <AuctionStats remainingTokens={remainingTokens} clearingPrice={clearingPrice} />
            )}

            {timeLeft.isExpired ? (
              <AuctionEndAlert
                totalTokens={TOTAL_TOKENS}
                remainingTokens={remainingTokens}
                clearingPrice={clearingPrice}
                totalProceeds={totalProceeds}
              />
            ) : (
              <Button
                onClick={() => setIsDialogOpen(true)}
                disabled={timeLeft.isExpired}
                className="w-full"
              >
                Place Bid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <BidDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tokenAmount={tokenAmount}
        onTokenAmountChange={setTokenAmount}
        bidAmount={newBid}
        onBidAmountChange={setNewBid}
        onBidConfirm={handleBidConfirm}
        initialPrice={settings.initialPrice}
        remainingTokens={remainingTokens}
        totalTokens={TOTAL_TOKENS}
      />
      <AuctionPriceChart bids={bids} clearingPrice={clearingPrice} />
      <AuctionBidHistory bids={processedBids} />
    </div>
  );
}
