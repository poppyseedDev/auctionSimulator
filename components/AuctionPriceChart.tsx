import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Bid {
  amount: number;
  timestamp: Date;
}

interface AuctionPriceChartProps {
  bids: Bid[];
  clearingPrice: number;
}

export function AuctionPriceChart({ bids, clearingPrice }: AuctionPriceChartProps) {
  const chartData = {
    labels: bids.map((bid) => bid.timestamp.toLocaleTimeString()),
    datasets: [
      {
        label: 'Bid Price per Token',
        data: bids.map((bid) => bid.amount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Clearing Price',
        data: bids.map(() => clearingPrice),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Bid Price History',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price per Token ($)',
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <Line data={chartData} options={chartOptions} />
      </CardContent>
    </Card>
  );
}
