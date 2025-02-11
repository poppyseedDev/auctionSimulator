import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableTokens: number | string;
  bidAmount: string;
  bidPrice: string;
  onBidAmountChange: (value: string) => void;
  onBidPriceChange: (value: string) => void;
  onBidConfirm: () => void;
}

export function BidDialogSealedBid({
  isOpen,
  onOpenChange,
  availableTokens,
  bidAmount,
  bidPrice,
  onBidAmountChange,
  onBidPriceChange,
  onBidConfirm,
}: BidDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Bid at any price. All available tokens: {availableTokens}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tokens">Number of tokens</Label>
            <Input
              id="tokens"
              type="number"
              value={bidAmount}
              onChange={(e) => onBidAmountChange(e.target.value)}
              placeholder="Enter amount"
              max={availableTokens}
              min={1}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Bid price per token ($)</Label>
            <Input
              id="price"
              type="number"
              value={bidPrice}
              onChange={(e) => onBidPriceChange(e.target.value)}
              placeholder="Enter bid price"
              min={0}
              step="0.01"
            />
          </div>
          {bidAmount && bidPrice && (
            <div className="text-sm text-muted-foreground">
              Total bid: $
              {(Number(bidAmount) * Number(bidPrice)).toLocaleString()}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onBidConfirm}
            disabled={
              !bidAmount ||
              !bidPrice ||
              Number(bidAmount) > Number(availableTokens) ||
              Number(bidPrice) <= 0
            }
          >
            Confirm Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
