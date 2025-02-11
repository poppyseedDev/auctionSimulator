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
  id: number;
  tokens: number | string;
  price: number;
  total: number | string;
  timestamp: string;
}

interface BidHistoryProps {
  bids: Bid[];
}

export function BidHistory({ bids }: BidHistoryProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Bid History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Price per Token</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>{bid.timestamp}</TableCell>
                    <TableCell>{bid.tokens}</TableCell>
                    <TableCell>${bid.price}</TableCell>
                    <TableCell className="text-right">
                      ${bid.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {bids.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No bids yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
