
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { apiService } from '@/services/api';

interface SparklineProps {
  bookId: number;
  width?: number;
  height?: number;
  className?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ 
  bookId, 
  width = 128, 
  height = 64, 
  className = "w-32 h-16" 
}) => {
  const { data: priceHistory, isLoading } = useQuery({
    queryKey: ['sparkline', bookId],
    queryFn: () => apiService.getPriceHistory(bookId, {
      interval: 'daily',
      limit: 7,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process data for sparkline
  const chartData = React.useMemo(() => {
    if (!priceHistory?.history) return [];

    // Find the most frequent retailer
    const retailerCounts = priceHistory.history.reduce((acc, point) => {
      acc[point.retailer] = (acc[point.retailer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentRetailer = Object.entries(retailerCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    if (!mostFrequentRetailer) return [];

    // Filter and sort data for the most frequent retailer
    return priceHistory.history
      .filter(point => point.retailer === mostFrequentRetailer)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(point => ({
        price: point.price,
        timestamp: point.timestamp,
      }));
  }, [priceHistory]);

  // Don't render if loading or no data
  if (isLoading || chartData.length === 0) {
    return (
      <div className={`${className} bg-gray-100 rounded animate-pulse`} />
    );
  }

  // Determine trend color
  const isUpward = chartData.length > 1 && 
    chartData[chartData.length - 1].price > chartData[0].price;
  const trendColor = isUpward ? '#10B981' : '#EF4444'; // green-500 : red-500

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={trendColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
