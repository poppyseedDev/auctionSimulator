import { ArrowDown } from "lucide-react"

interface AuctionStatsProps {
    availableTokens: number | string
    initialTokens: number
    currentPrice: number
    timeUntilDrop: number
    interval: number
    minPrice: number
    priceDrop: number
  }
  

  export function AuctionStats({ availableTokens, initialTokens, currentPrice, timeUntilDrop, interval, minPrice, priceDrop }: AuctionStatsProps) {
    return (
    <div className="flex justify-around items-center">
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">Available Tokens</div>
        <div className="text-4xl font-bold">
          {availableTokens} / {initialTokens}
        </div>
        <div className="text-sm text-muted-foreground">
          {typeof availableTokens === 'string' ? '??' : ((availableTokens / initialTokens) * 100).toFixed(1)}% remaining
        </div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">Current Price</div>
        <div
          className={`text-5xl font-bold transition-all duration-300 ${
            timeUntilDrop === interval ? "scale-110 text-primary" : ""
          }`}
        >
          ${currentPrice.toLocaleString()}
        </div>
        {currentPrice > minPrice && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <ArrowDown className="h-4 w-4" />
            <span>Next price: ${(currentPrice - priceDrop).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
    )
  }