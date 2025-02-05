"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDown, Pause, Play, RotateCcw } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface PricePoint {
  time: number
  price: number
}

export default function DutchAuction() {
  const [currentPrice, setCurrentPrice] = useState(1000)
  const [isRunning, setIsRunning] = useState(false)
  const [timeUntilDrop, setTimeUntilDrop] = useState(10)
  const [progress, setProgress] = useState(100)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([{ time: 0, price: 1000 }])
  const [elapsedTime, setElapsedTime] = useState(0)

  const PRICE_DROP = 50 // Amount to decrease price by
  const INTERVAL = 10 // Seconds between price drops
  const MIN_PRICE = 100 // Minimum price
  const INITIAL_PRICE = 1000 // Starting price

  const resetAuction = useCallback(() => {
    setCurrentPrice(INITIAL_PRICE)
    setTimeUntilDrop(INTERVAL)
    setIsRunning(false)
    setProgress(100)
    setPriceHistory([{ time: 0, price: INITIAL_PRICE }])
    setElapsedTime(0)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    let elapsedTimer: NodeJS.Timeout

    if (isRunning && currentPrice > MIN_PRICE) {
      // Timer for price drops
      timer = setInterval(() => {
        setTimeUntilDrop((prev) => {
          if (prev <= 1) {
            setCurrentPrice((prevPrice) => {
              const newPrice = Math.max(prevPrice - PRICE_DROP, MIN_PRICE)
              setPriceHistory((prev) => [...prev, { time: elapsedTime + INTERVAL, price: newPrice }])
              return newPrice
            })
            return INTERVAL
          }
          return prev - 1
        })

        setProgress((prev) => {
          if (prev <= 0) return 100
          return prev - 100 / INTERVAL
        })
      }, 1000)

      // Timer for elapsed time
      elapsedTimer = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      clearInterval(timer)
      clearInterval(elapsedTimer)
    }
  }, [isRunning, currentPrice, elapsedTime])

  const toggleAuction = () => {
    setIsRunning((prev) => !prev)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Dutch Auction Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div
              className={`text-5xl font-bold transition-all duration-300 ${
                timeUntilDrop === INTERVAL ? "scale-110 text-primary" : ""
              }`}
            >
              ${currentPrice.toLocaleString()}
            </div>
            {currentPrice > MIN_PRICE && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <ArrowDown className="h-4 w-4" />
                <span>Next price: ${(currentPrice - PRICE_DROP).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next price drop in:</span>
              <span>{timeUntilDrop}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentPrice <= MIN_PRICE && (
            <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
              Auction ended at minimum price
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">Price History</div>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  price: {
                    label: "Price ($)",
                    color: "hsl(var(--primary))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <XAxis
                      dataKey="time"
                      tickFormatter={formatTime}
                      label={{ value: "Time Elapsed (min:sec)", position: "bottom", offset: 0 }}
                    />
                    <YAxis
                      domain={[MIN_PRICE - 50, INITIAL_PRICE + 50]}
                      label={{ value: "Price ($)", angle: -90, position: "left" }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Time:</div>
                                <div>{formatTime(payload[0].payload.time)}</div>
                                <div className="font-medium">Price:</div>
                                <div>${payload[0].payload.price}</div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line type="stepAfter" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={toggleAuction} disabled={currentPrice <= MIN_PRICE}>
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={resetAuction}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

