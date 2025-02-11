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
  currentPrice: number;
  availableTokens: number | string;
  bidAmount: string;
  onBidAmountChange: (value: string) => void;
  onBidConfirm: () => void;
}

export function BidDialog({
  isOpen,
  onOpenChange,
  currentPrice,
  availableTokens,
  bidAmount,
  onBidAmountChange,
  onBidConfirm,
}: BidDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Current price is ${currentPrice} per token. Available tokens:{' '}
            {availableTokens}
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
          {bidAmount && (
            <div className="text-sm text-muted-foreground">
              Total cost: ${(Number(bidAmount) * currentPrice).toLocaleString()}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onBidConfirm}
            disabled={!bidAmount || Number(bidAmount) > Number(availableTokens)}
          >
            Confirm Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
