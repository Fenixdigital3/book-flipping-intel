
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Calendar } from 'lucide-react';
import { apiService, PriceHistoryResponse, PriceStatistics } from '@/services/api';
import { format, parseISO } from 'date-fns';

interface TrendModalProps {
  bookId: number;
  bookTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

const TrendModal: React.FC<TrendModalProps> = ({
  bookId,
  bookTitle,
  isOpen,
  onClose,
}) => {
  const [selectedDays, setSelectedDays] = useState(30);

  // Fetch price history
  const {
    data: priceHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ['priceHistory', bookId, selectedDays],
    queryFn: () => apiService.getPriceHistory(bookId, {
      limit: 1000,
      startDate: new Date(Date.now() - selectedDays * 24 * 60 * 60 * 1000).toISOString(),
    }),
    enabled: isOpen,
  });

  // Fetch price statistics
  const {
    data: priceStats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['priceStatistics', bookId, selectedDays],
    queryFn: () => apiService.getPriceStatistics(bookId, selectedDays),
    enabled: isOpen,
  });

  // Process data for chart
  const chartData = React.useMemo(() => {
    if (!priceHistory?.history) return [];

    // Group by timestamp and create chart points
    const dataMap = new Map();
    
    priceHistory.history.forEach((point) => {
      const timestamp = point.timestamp;
      const dateKey = format(parseISO(timestamp), 'MMM dd, HH:mm');
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { timestamp: dateKey, fullTimestamp: timestamp });
      }
      
      dataMap.get(dateKey)[point.retailer] = point.price;
    });

    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime()
    );
  }, [priceHistory]);

  // Get unique retailers for chart lines
  const retailers = React.useMemo(() => {
    if (!priceHistory?.history) return [];
    return [...new Set(priceHistory.history.map(point => point.retailer))];
  }, [priceHistory]);

  // Chart colors for different retailers
  const retailerColors = {
    'Amazon': '#FF6B35',
    'Barnes & Noble': '#2E8B57',
    'ThriftBooks': '#4169E1',
    'BookOutlet': '#9932CC',
    'Default': '#6B7280',
  };

  const getRetailerColor = (retailer: string) => {
    return retailerColors[retailer as keyof typeof retailerColors] || retailerColors.Default;
  };

  // Render trend indicator
  const renderTrendIndicator = () => {
    if (!priceStats?.statistics) return null;
    
    const { trend_direction, trend_slope } = priceStats.statistics;
    
    if (trend_direction === 'increasing') {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Increasing</span>
        </div>
      );
    } else if (trend_direction === 'decreasing') {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">Decreasing</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-gray-600">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-medium">Stable</span>
        </div>
      );
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.dataKey}:</span>
              <span>${entry.value?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Price History: {bookTitle || priceHistory?.book_title || `Book #${bookId}`}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                ISBN: {priceHistory?.book_isbn || 'Loading...'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {renderTrendIndicator()}
            </div>
          </div>
        </DialogHeader>

        {/* Time period selector */}
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time Period:</span>
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={selectedDays === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDays(days)}
            >
              {days} days
            </Button>
          ))}
        </div>

        {/* Statistics Cards */}
        {priceStats?.statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Average Price</p>
              <p className="text-lg font-bold text-blue-700">
                ${priceStats.statistics.average_price}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Min Price</p>
              <p className="text-lg font-bold text-green-700">
                ${priceStats.statistics.min_price}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Max Price</p>
              <p className="text-lg font-bold text-red-700">
                ${priceStats.statistics.max_price}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Volatility</p>
              <div className="flex items-center space-x-1">
                <p className="text-lg font-bold text-purple-700">
                  ${priceStats.statistics.volatility}
                </p>
                <Badge variant={priceStats.statistics.volatility > 5 ? 'destructive' : 'secondary'}>
                  {priceStats.statistics.volatility > 5 ? 'High' : 'Low'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-80 w-full">
          {historyLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : historyError ? (
            <div className="flex items-center justify-center h-full text-red-600">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>Error loading price history</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>No price history available for this period</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="timestamp" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `$${value}`}
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                {retailers.map((retailer) => (
                  <Line
                    key={retailer}
                    type="monotone"
                    dataKey={retailer}
                    stroke={getRetailerColor(retailer)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Summary */}
        {priceHistory && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Showing {priceHistory.total_points} data points
              {priceHistory.date_range.start && priceHistory.date_range.end && (
                <> from {format(parseISO(priceHistory.date_range.start), 'MMM dd, yyyy')} to {format(parseISO(priceHistory.date_range.end), 'MMM dd, yyyy')}</>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrendModal;
