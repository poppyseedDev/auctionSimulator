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
  tokenAmount: string;
  onTokenAmountChange: (value: string) => void;
  bidAmount: string;
  onBidAmountChange: (value: string) => void;
  onBidConfirm: (tokens: string, price: string) => void;
  initialPrice: number;
  remainingTokens: number;
  totalTokens: number;
}

export function BidDialog({
  isOpen,
  onOpenChange,
  tokenAmount,
  onTokenAmountChange,
  bidAmount,
  onBidAmountChange,
  onBidConfirm,
  initialPrice,
  remainingTokens,
  totalTokens,
}: BidDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Minimum price is ${initialPrice}. Unsold tokens: {remainingTokens}. Total tokens:{' '}
            {totalTokens}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tokens">Number of tokens</Label>
            <Input
              id="tokens"
              type="number"
              value={tokenAmount}
              onChange={(e) => onTokenAmountChange(e.target.value)}
              placeholder="Enter number of tokens"
              min="1"
              step="1"
            />
            {Number(tokenAmount) > totalTokens && (
              <p className="text-sm text-destructive">
                Cannot bid for more than {totalTokens} available tokens
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price per token</Label>
            <Input
              id="price"
              type="number"
              value={bidAmount}
              onChange={(e) => onBidAmountChange(e.target.value)}
              placeholder="Enter price per token"
              min={initialPrice}
              step="0.01"
            />
            {Number(bidAmount) <= initialPrice && bidAmount !== '' && (
              <p className="text-sm text-destructive">Price must be more than ${initialPrice}</p>
            )}
          </div>
          {tokenAmount && bidAmount && (
            <div className="text-sm text-muted-foreground">
              Total cost: ${(Number(tokenAmount) * Number(bidAmount)).toLocaleString()}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => onBidConfirm(tokenAmount, bidAmount)}
            disabled={!tokenAmount || !bidAmount || Number(tokenAmount) > totalTokens}
          >
            Confirm Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
