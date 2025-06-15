
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArbitrageOpportunity } from '@/types/api';
import { TrendingUp, ExternalLink, ShoppingCart, DollarSign } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: ArbitrageOpportunity;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercentage = (percentage: number) => `${(percentage * 100).toFixed(1)}%`;
  
  const getProfitColor = (margin: number) => {
    if (margin >= 0.5) return 'text-emerald-600';
    if (margin >= 0.3) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getProfitBadgeColor = (margin: number) => {
    if (margin >= 0.5) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (margin >= 0.3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {opportunity.book_title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {opportunity.book_author}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ISBN: {opportunity.book_isbn}
            </p>
          </div>
          <Badge 
            className={`ml-2 ${getProfitBadgeColor(opportunity.profit_margin)}`}
            variant="outline"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {formatPercentage(opportunity.profit_margin)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Profit Summary */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800">
              Potential Profit
            </span>
            <div className={`flex items-center font-bold text-lg ${getProfitColor(opportunity.profit_margin)}`}>
              <DollarSign className="w-5 h-5" />
              {formatPrice(opportunity.profit)}
            </div>
          </div>
          <div className="text-xs text-emerald-700">
            {formatPercentage(opportunity.profit_margin)} margin
          </div>
        </div>

        {/* Buy/Sell Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Buy Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Buy from</span>
            </div>
            <div>
              <p className="font-medium">{opportunity.buy_store}</p>
              <p className="text-lg font-bold text-green-600">
                {formatPrice(opportunity.buy_price)}
              </p>
            </div>
            {opportunity.buy_url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => window.open(opportunity.buy_url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Deal
              </Button>
            )}
          </div>

          {/* Sell Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Sell to</span>
            </div>
            <div>
              <p className="font-medium">{opportunity.sell_store}</p>
              <p className="text-lg font-bold text-blue-600">
                {formatPrice(opportunity.sell_price)}
              </p>
            </div>
            {opportunity.sell_url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => window.open(opportunity.sell_url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Listing
              </Button>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {new Date(opportunity.last_updated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
