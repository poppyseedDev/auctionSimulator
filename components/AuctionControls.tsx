import { Pause, Play, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"

interface AuctionControlsProps {
    isRunning: boolean
    toggleAuction: () => void
    resetAuction: () => void
    openBidDialog: () => void
    isDisabled: boolean
  }
  
export function AuctionControls({ isRunning, toggleAuction, resetAuction, openBidDialog, isDisabled }: AuctionControlsProps) {
    return (
    <div className="flex justify-center gap-4">
      <Button onClick={toggleAuction} disabled={isDisabled}>
        {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
        {isRunning ? "Pause" : "Start"}
      </Button>
      <Button variant="secondary" onClick={openBidDialog} disabled={isDisabled}>
        Bid Now
      </Button>
      <Button variant="outline" onClick={resetAuction}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  )
}