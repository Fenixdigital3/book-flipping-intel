
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/types/api';
import { ExternalLink, TrendingUp, DollarSign, Package } from 'lucide-react';
import TrendModal from './TrendModal';

interface BookCardProps {
  book: Book;
  onViewDetails?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onViewDetails }) => {
  const [showTrendModal, setShowTrendModal] = useState(false);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  
  const profitMargin = book.price_spread && book.lowest_price 
    ? ((book.price_spread / book.lowest_price) * 100).toFixed(1)
    : null;

  const handleViewTrends = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTrendModal(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-3">
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">
                {book.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mb-1">{book.author}</p>
              <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
            </div>
            {book.image_url && (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-16 h-20 object-cover rounded border"
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Price Information */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Price Range:</span>
              <div className="text-right">
                {book.lowest_price && book.highest_price ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(book.lowest_price)} - {formatPrice(book.highest_price)}
                    </div>
                    {profitMargin && (
                      <Badge variant="secondary" className="text-xs">
                        {profitMargin}% spread
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No prices available</span>
                )}
              </div>
            </div>

            {/* Store Count */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>Available at {book.current_prices?.length || 0} stores</span>
              </div>
            </div>
          </div>

          {/* Current Prices Preview */}
          {book.current_prices && book.current_prices.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium">Current Prices:</h4>
              <div className="space-y-1">
                {book.current_prices.slice(0, 3).map((price, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{price.store_name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatPrice(price.price)}</span>
                      {price.url && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {book.current_prices.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{book.current_prices.length - 3} more stores
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleViewTrends}
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Trends
            </Button>
            {onViewDetails && (
              <Button 
                onClick={() => onViewDetails(book)}
                variant="default" 
                size="sm" 
                className="flex-1"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trend Modal */}
      <TrendModal
        bookId={book.id}
        bookTitle={book.title}
        isOpen={showTrendModal}
        onClose={() => setShowTrendModal(false)}
      />
    </>
  );
};

export default BookCard;
