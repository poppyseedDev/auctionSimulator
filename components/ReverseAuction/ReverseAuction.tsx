'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCountdown } from '@/hooks/use-countdown';
import { AuctionBidHistory } from '@/components/AuctionBidHistory';
import { AuctionPriceChart } from '@/components/AuctionPriceChart';
import { Bid } from '@/components/AuctionPriceChart';
import { Settings } from '@/contexts/settigns-context';


export default function ReverseAuction({ settings }: { settings: Settings}) {
  const TOTAL_TOKENS = settings.initialTokens;
  const AUCTION_DURATION = settings.totalTime * 60 * 1000;
  const SEALED_BID = settings.sealedBid;

  const [endTime] = useState(
    () => new Date(new Date().getTime() + AUCTION_DURATION)
  );
  const timeLeft = useCountdown(endTime);

  const [bids, setBids] = useState<Bid[]>([]);
  const [newBid, setNewBid] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [bidder, setBidder] = useState('');

  // Calculate winning bids, remaining tokens, and clearing price
  const { processedBids, remainingTokens, clearingPrice, totalProceeds } =
    useMemo(() => {
      // Sort bids by price per token (highest first)
      const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
      let remainingTokens = TOTAL_TOKENS;
      let clearingPrice = 0;

      const processed = sortedBids.map((bid) => {
        const tokensWon = Math.min(bid.tokens, remainingTokens);
        const isWinning = tokensWon > 0;

        if (isWinning) {
          clearingPrice = bid.amount; // This will end up being the lowest winning bid
          remainingTokens -= tokensWon;
        }

        return {
          ...bid,
          isWinning,
          tokensWon: isWinning ? tokensWon : 0,
          finalPayment: isWinning ? tokensWon * clearingPrice : 0,
        };
      });

      const totalProceeds = processed.reduce(
        (sum, bid) => sum + (bid.finalPayment || 0),
        0
      );

      return {
        processedBids: processed,
        remainingTokens,
        clearingPrice,
        totalProceeds,
      };
    }, [bids]);

  const handleSubmitBid = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const pricePerToken = Number.parseFloat(newBid);
      const tokens = Number.parseInt(tokenAmount);

      if (
        isNaN(pricePerToken) ||
        isNaN(tokens) ||
        tokens <= 0 ||
        pricePerToken <= 0 ||
        !bidder.trim() ||
        timeLeft.isExpired
      ) {
        return;
      }

      const newBidEntry: Bid = {
        amount: pricePerToken,
        tokens: tokens,
        timestamp: new Date(),
        bidder: bidder.trim(),
        totalValue: pricePerToken * tokens,
      };

      setBids((prevBids) => [...prevBids, newBidEntry]);
      setNewBid('');
      setTokenAmount('');
    },
    [newBid, tokenAmount, bidder, timeLeft.isExpired]
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
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div
                className={`text-center p-4 rounded-lg ${timeLeft.isExpired ? 'bg-red-100' : 'bg-muted'}`}
              >
                <h2 className="text-2xl font-bold mb-2">Time Remaining</h2>
                <div
                  className={`text-4xl font-mono ${timeLeft.isExpired ? 'text-red-600' : ''}`}
                >
                  {timeLeft.isExpired
                    ? 'ENDED'
                    : `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
                </div>
              </div>

              {(timeLeft.isExpired || !SEALED_BID) && (
                <div className="grid gap-4 grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Tokens Remaining</h2>
                    <div className="text-3xl font-mono text-green-600">
                      {remainingTokens}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Clearing Price</h2>
                    <div className="text-3xl font-mono text-green-600">
                      ${clearingPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {timeLeft.isExpired ? (
                <Alert>
                  <AlertDescription className="space-y-2">
                    <p>
                      This auction has ended. {TOTAL_TOKENS - remainingTokens}{' '}
                      tokens were sold.
                    </p>
                    <p className="font-semibold">
                      Final clearing price: ${clearingPrice.toFixed(2)}
                    </p>
                    <p>Total auction proceeds: ${totalProceeds.toFixed(2)}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={bidder}
                      onChange={(e) => setBidder(e.target.value)}
                      disabled={timeLeft.isExpired}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Number of Tokens"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      disabled={timeLeft.isExpired}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price per Token"
                      value={newBid}
                      onChange={(e) => setNewBid(e.target.value)}
                      disabled={timeLeft.isExpired}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={timeLeft.isExpired}
                    className="w-full"
                  >
                    Place Bid
                  </Button>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <AuctionPriceChart bids={bids} clearingPrice={clearingPrice} />
      <AuctionBidHistory bids={processedBids} />
    </div>
  );
}
