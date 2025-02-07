"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PriceHistoryChart } from "@/components/PriceHistoryChart"
import { BidHistory, Bid } from "@/components/BidHistory"
import { AuctionControls } from "@/components/AuctionControls"
import { BidDialog } from "@/components/BidDialog"
import { AuctionSealedBidStats } from "@/components/AuctionSealedBidStats"
import { formatTime } from "@/lib/utils"
import { BidDialogSealedBid } from "@/components/BidDialogSealedBid"

interface PricePoint {
  time: number
  price: number
}

export default function SealedBidReverseAuction() {
  const [currentPrice, setCurrentPrice] = useState(1000)
  const [isRunning, setIsRunning] = useState(false)
  const [availableTokens, setAvailableTokens] = useState(100)
  const [bids, setBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)

  const INITIAL_TOKENS = 100
  const MIN_PRICE = 100
  const INITIAL_PRICE = 1000

  const resetAuction = useCallback(() => {
    setCurrentPrice(INITIAL_PRICE)
    setIsRunning(false)
    setAvailableTokens(INITIAL_TOKENS)
    setBids([])
    setFinalPrice(null)
  }, [])

  const toggleAuction = () => {
    setIsRunning((prev) => !prev)
  }

  const handleBid = () => {
    const tokens = Number(bidAmount)
    if (tokens <= 0 || tokens > availableTokens || finalPrice !== null) {
      return
    }

    const newBid: Bid = {
      id: Date.now(),
      tokens: bidAmount,
      price: currentPrice,
      total: (tokens * currentPrice).toFixed(2),
      timestamp: new Date().toLocaleTimeString(),
    }

    setBids((prev) => [...prev, newBid])
    setAvailableTokens((prev) => prev - tokens)
    setBidAmount("")
    setIsDialogOpen(false)

    if (availableTokens === 0) {
      // End auction when all tokens are sold
      finalizeAuction()
    }
  }

  const finalizeAuction = () => {
    // Sort the bids in ascending order by price
    const sortedBids = [...bids].sort((a, b) => a.price - b.price)
    let tokensSold = 0

    // Allocate tokens based on bids
    sortedBids.forEach((bid) => {
      const tokensToSell = Math.min(bid.tokens, availableTokens)
      tokensSold += tokensToSell
      setAvailableTokens((prev) => prev - tokensToSell)
      if (tokensSold === INITIAL_TOKENS) {
        setFinalPrice(bid.price)  // The price of the last token sold
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sealed-Bid Reverse Auction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <AuctionSealedBidStats
            availableTokens={availableTokens}
            initialTokens={INITIAL_TOKENS}
          />

          {finalPrice !== null && (
            <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
              Auction ended at price: {finalPrice} per token. All winners pay this price.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <AuctionControls
            isRunning={isRunning}
            toggleAuction={toggleAuction}
            resetAuction={resetAuction}
            openBidDialog={() => setIsDialogOpen(true)}
            isDisabled={availableTokens === 0 || finalPrice !== null}
          />
        </CardFooter>
      </Card>

      <BidDialogSealedBid
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        availableTokens={availableTokens}
        bidAmount={bidAmount}
        onBidAmountChange={setBidAmount}
        onBidConfirm={handleBid}
      />

      <PriceHistoryChart
        priceHistory={[]} // No price history in reverse auction
        minPrice={MIN_PRICE}
        initialPrice={INITIAL_PRICE}
        formatTime={formatTime}
      />
      <BidHistory bids={bids} />
    </div>
  )
}
