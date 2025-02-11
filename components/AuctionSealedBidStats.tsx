interface AuctionStatsProps {
  availableTokens: number | string;
  initialTokens: number;
}

export function AuctionSealedBidStats({
  availableTokens,
  initialTokens,
}: AuctionStatsProps) {
  return (
    <div className="flex justify-around items-center">
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">Available Tokens</div>
        <div className="text-4xl font-bold">
          {availableTokens} / {initialTokens}
        </div>
        <div className="text-sm text-muted-foreground">
          {typeof availableTokens === 'string'
            ? '??'
            : ((availableTokens / initialTokens) * 100).toFixed(1)}
          % remaining
        </div>
      </div>
    </div>
  );
}
