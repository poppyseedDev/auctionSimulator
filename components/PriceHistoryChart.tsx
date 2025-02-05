import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface PricePoint {
  time: number
  price: number
}

interface PriceHistoryChartProps {
  priceHistory: PricePoint[]
  minPrice: number
  initialPrice: number
  formatTime: (seconds: number) => string
}

export function PriceHistoryChart({ priceHistory, minPrice, initialPrice, formatTime }: PriceHistoryChartProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ChartContainer
            config={{
              price: {
                label: "Price ($)",
                color: "hsl(var(--primary))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={priceHistory}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis
                  dataKey="time"
                  tickFormatter={formatTime}
                  label={{ value: "Time Elapsed (min:sec)", position: "bottom", offset: 0 }}
                />
                <YAxis
                  domain={[minPrice - 50, initialPrice + 50]}
                  label={{ value: "Price ($)", angle: -90, position: "left" }}
                />
                <ChartTooltip />
                <Line type="stepAfter" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
