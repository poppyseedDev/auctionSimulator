import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Bid {
  amount: number;
  tokens: number;
  timestamp: Date;
  bidder: string;
  totalValue: number;
  isWinning?: boolean;
  tokensWon?: number;
  finalPayment?: number;
}

interface BidHistoryProps {
  bids: Bid[];
  hideBool: boolean;
}

export function AuctionBidHistory({ bids, hideBool }: BidHistoryProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Bid History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bidder</TableHead>
                  <TableHead className="text-right">Bid Price/Token</TableHead>
                  <TableHead className="text-right">Tokens Requested</TableHead>
                  <TableHead className="text-right">Bid Total</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Tokens Won</TableHead>
                  <TableHead className="text-right">Final Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid, index) => (
                  <TableRow
                    key={index}
                    className={bid.isWinning && hideBool ? 'bg-green-50' : undefined}
                  >
                    <TableCell className="font-medium">{bid.bidder}</TableCell>
                    <TableCell className="text-right">
                      ${hideBool ? bid.amount.toFixed(2) : '??'}
                    </TableCell>
                    <TableCell className="text-right">{bid.tokens}</TableCell>
                    <TableCell className="text-right">
                      ${hideBool ? bid.totalValue.toFixed(2) : '??'}
                    </TableCell>
                    <TableCell className="text-right">
                      {hideBool ? (
                        bid.isWinning ? (
                          <span className="text-green-600">Winning</span>
                        ) : (
                          <span className="text-red-600">Not Winning</span>
                        )
                      ) : (
                        <span className="text-gray-600">Undefined</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{hideBool ? bid.tokensWon : '??'}</TableCell>
                    <TableCell className="text-right">
                      ${hideBool ? bid.totalValue.toFixed(2) : '??'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
