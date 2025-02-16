import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuctionEndAlertProps {
  totalTokens: number;
  remainingTokens: number;
  clearingPrice: number;
  totalProceeds: number;
}

export function AuctionEndAlert({
  totalTokens,
  remainingTokens,
  clearingPrice,
  totalProceeds,
}: AuctionEndAlertProps) {
  return (
    <Alert>
      <AlertDescription className="space-y-2">
        <p>This auction has ended. {totalTokens - remainingTokens} tokens were sold.</p>
        <p className="font-semibold">Final clearing price: ${clearingPrice.toFixed(2)}</p>
        <p>Total auction proceeds: ${totalProceeds.toFixed(2)}</p>
      </AlertDescription>
    </Alert>
  );
}
