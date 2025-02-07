"use client"

import { useState, useCallback, useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCountdown } from "@/hooks/use-countdown"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Bid {
  amount: number // price willing to pay per token
  tokens: number // number of tokens requested
  timestamp: Date
  bidder: string
  totalValue: number // amount * tokens
  isWinning?: boolean
  tokensWon?: number
  finalPayment?: number // calculated at clearing price
}

const TOTAL_TOKENS = 1000
const AUCTION_DURATION = 5 * 60 * 1000 // 5 minutes

export default function TokenAuction() {
  const [endTime] = useState(() => new Date(new Date().getTime() + AUCTION_DURATION))
  const timeLeft = useCountdown(endTime)

  const [bids, setBids] = useState<Bid[]>([])
  const [newBid, setNewBid] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")
  const [bidder, setBidder] = useState("")

  // Calculate winning bids, remaining tokens, and clearing price
  const { processedBids, remainingTokens, clearingPrice, totalProceeds } = useMemo(() => {
    // Sort bids by price per token (highest first)
    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount)
    let remainingTokens = TOTAL_TOKENS
    let clearingPrice = 0

    const processed = sortedBids.map((bid) => {
      const tokensWon = Math.min(bid.tokens, remainingTokens)
      const isWinning = tokensWon > 0

      if (isWinning) {
        clearingPrice = bid.amount // This will end up being the lowest winning bid
        remainingTokens -= tokensWon
      }

      return {
        ...bid,
        isWinning,
        tokensWon: isWinning ? tokensWon : 0,
        finalPayment: isWinning ? tokensWon * clearingPrice : 0,
      }
    })

    const totalProceeds = processed.reduce((sum, bid) => sum + (bid.finalPayment || 0), 0)

    return {
      processedBids: processed,
      remainingTokens,
      clearingPrice,
      totalProceeds,
    }
  }, [bids])

  // Chart data showing price per token over time and clearing price
  const chartData = {
    labels: bids.map((bid) => bid.timestamp.toLocaleTimeString()),
    datasets: [
      {
        label: "Bid Price per Token",
        data: bids.map((bid) => bid.amount),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Clearing Price",
        data: bids.map(() => clearingPrice),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        borderDash: [5, 5],
        tension: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Bid Price History",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Price per Token ($)",
        },
      },
    },
  }

  const handleSubmitBid = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const pricePerToken = Number.parseFloat(newBid)
      const tokens = Number.parseInt(tokenAmount)

      if (
        isNaN(pricePerToken) ||
        isNaN(tokens) ||
        tokens <= 0 ||
        pricePerToken <= 0 ||
        !bidder.trim() ||
        timeLeft.isExpired
      ) {
        return
      }

      const newBidEntry: Bid = {
        amount: pricePerToken,
        tokens: tokens,
        timestamp: new Date(),
        bidder: bidder.trim(),
        totalValue: pricePerToken * tokens,
      }

      setBids((prevBids) => [...prevBids, newBidEntry])
      setNewBid("")
      setTokenAmount("")
    },
    [newBid, tokenAmount, bidder, timeLeft.isExpired],
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Token Auction - {TOTAL_TOKENS} Tokens Available</span>
            {timeLeft.isExpired && <span className="text-red-500 text-sm font-normal">Auction Ended</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className={`text-center p-4 rounded-lg ${timeLeft.isExpired ? "bg-red-100" : "bg-muted"}`}>
                <h2 className="text-2xl font-bold mb-2">Time Remaining</h2>
                <div className={`text-4xl font-mono ${timeLeft.isExpired ? "text-red-600" : ""}`}>
                  {timeLeft.isExpired
                    ? "ENDED"
                    : `${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="p-4 bg-muted rounded-lg">
                  <h2 className="text-xl font-bold mb-2">Tokens Remaining</h2>
                  <div className="text-3xl font-mono text-green-600">{remainingTokens}</div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h2 className="text-xl font-bold mb-2">Clearing Price</h2>
                  <div className="text-3xl font-mono text-green-600">${clearingPrice.toFixed(2)}</div>
                </div>
              </div>

              {timeLeft.isExpired ? (
                <Alert>
                  <AlertDescription className="space-y-2">
                    <p>This auction has ended. {TOTAL_TOKENS - remainingTokens} tokens were sold.</p>
                    <p className="font-semibold">Final clearing price: ${clearingPrice.toFixed(2)}</p>
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
                  <Button type="submit" disabled={timeLeft.isExpired} className="w-full">
                    Place Bid
                  </Button>
                </form>
              )}
            </div>

            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </CardContent>
    </Card>

    <Card className="w-full max-w-4xl">
        <CardHeader>
        <CardTitle className="text-2xl text-center">Bid History</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
          <div className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bidder</TableHead>
                  <TableHead className="text-right">Bid Price/Token</TableHead>
                  <TableHead className="text-right">Tokens Requested</TableHead>
                  <TableHead className="text-right">Bid Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Tokens Won</TableHead>
                  <TableHead className="text-right">Final Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedBids.map((bid, index) => (
                  <TableRow key={index} className={bid.isWinning ? "bg-green-50" : undefined}>
                    <TableCell className="font-medium">{bid.bidder}</TableCell>
                    <TableCell className="text-right">${bid.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{bid.tokens}</TableCell>
                    <TableCell className="text-right">${bid.totalValue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {bid.isWinning ? (
                        <span className="text-green-600">Winning</span>
                      ) : (
                        <span className="text-red-600">Not Winning</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{bid.tokensWon}</TableCell>
                    <TableCell className="text-right">${(bid.finalPayment || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

