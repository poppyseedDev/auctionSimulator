interface AuctionStatsProps {
  remainingTokens: number;
  clearingPrice: number;
}

export function AuctionStats({ remainingTokens, clearingPrice }: AuctionStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2">
    {remainingTokens === 0 ? (
        <div className="p-4 border">
            <h2 className="text-xl font-bold mb-2">Highest Bid</h2>
            <div className="text-3xl font-mono text-gray-600">
            {remainingTokens}
            </div>
        </div>
        ) : (
      <div className="p-4 border">
        <h2 className="text-xl font-bold mb-2">Unsold Tokens</h2>
        <div className="text-3xl font-mono text-gray-600">
          {remainingTokens}
        </div>
      </div>
    )}

      <div className="p-4 border ">
        <h2 className="text-xl font-bold mb-2">Clearing Price</h2>
        <div className="text-3xl font-mono text-gray-600">
          ${clearingPrice.toFixed(2)}
        </div>
      </div>
    </div>
  );
} 