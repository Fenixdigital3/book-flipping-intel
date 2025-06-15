
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/api';
import { ExternalLink, TrendingUp, DollarSign } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onViewDetails?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onViewDetails }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  const getProfitColor = (spread?: number) => {
    if (!spread) return 'text-gray-500';
    if (spread >= 10) return 'text-emerald-600';
    if (spread >= 5) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getProfitIcon = (spread?: number) => {
    if (!spread || spread < 5) return null;
    return <TrendingUp className="w-4 h-4 ml-1" />;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          {book.image_url && (
            <img
              src={book.image_url}
              alt={book.title}
              className="w-16 h-20 object-cover rounded border flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/64x80?text=Book';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {book.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {book.author}
            </p>
            {book.category && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {book.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Price Information */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {book.lowest_price && (
              <div>
                <span className="text-muted-foreground">Lowest: </span>
                <span className="font-medium text-green-600">
                  {formatPrice(book.lowest_price)}
                </span>
              </div>
            )}
            {book.highest_price && (
              <div>
                <span className="text-muted-foreground">Highest: </span>
                <span className="font-medium">
                  {formatPrice(book.highest_price)}
                </span>
              </div>
            )}
          </div>

          {/* Profit Potential */}
          {book.price_spread && book.price_spread > 0 && (
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-sm font-medium text-emerald-800">
                Profit Potential
              </span>
              <div className={`flex items-center font-bold ${getProfitColor(book.price_spread)}`}>
                <DollarSign className="w-4 h-4" />
                {formatPrice(book.price_spread)}
                {getProfitIcon(book.price_spread)}
              </div>
            </div>
          )}

          {/* Store Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{book.current_prices?.length || 0} stores tracked</span>
            <span>ISBN: {book.isbn}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetails?.(book)}
            >
              View Details
            </Button>
            {book.current_prices?.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const bestPrice = book.current_prices.find(p => p.price === book.lowest_price);
                  if (bestPrice?.url) {
                    window.open(bestPrice.url, '_blank');
                  }
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
