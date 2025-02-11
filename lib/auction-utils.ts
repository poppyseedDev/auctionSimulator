export interface Bid {
  id: string;
  bidder: string;
  tokensWanted: number;
  pricePerToken: number;
  timestamp: Date;
  isWinning?: boolean;
  tokensWon?: number;
}

export interface AuctionResult {
  winningBids: Bid[];
  clearingPrice: number;
  remainingTokens: number;
  allBids: Bid[];
}

export function calculateAuctionResults(
  bids: Bid[],
  totalTokens: number
): AuctionResult {
  // Sort bids by price (highest to lowest)
  const sortedBids = [...bids].sort(
    (a, b) => b.pricePerToken - a.pricePerToken
  );

  let tokensAllocated = 0;
  let clearingPrice = 0;
  const processedBids: Bid[] = [];

  // Process bids and allocate tokens
  for (const bid of sortedBids) {
    const remainingTokens = totalTokens - tokensAllocated;

    if (remainingTokens > 0) {
      const tokensWon = Math.min(bid.tokensWanted, remainingTokens);
      tokensAllocated += tokensWon;

      processedBids.push({
        ...bid,
        isWinning: true,
        tokensWon,
      });

      // If this bid fills the last tokens, it sets the clearing price
      if (tokensAllocated >= totalTokens) {
        clearingPrice = bid.pricePerToken;
      }
    } else {
      processedBids.push({
        ...bid,
        isWinning: false,
        tokensWon: 0,
      });
    }
  }

  return {
    winningBids: processedBids.filter((bid) => bid.isWinning),
    clearingPrice,
    remainingTokens: totalTokens - tokensAllocated,
    allBids: processedBids,
  };
}
