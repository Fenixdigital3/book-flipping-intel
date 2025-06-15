
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortingControlsProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;
}

const sortOptions = [
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'publication_year', label: 'Publication Year' },
  { value: 'lowest_price', label: 'Lowest Price' },
  { value: 'highest_price', label: 'Highest Price' },
  { value: 'price_spread', label: 'Price Spread' },
];

const SortingControls: React.FC<SortingControlsProps> = ({
  sortBy,
  sortDirection,
  onSortChange,
}) => {
  const toggleDirection = () => {
    onSortChange(sortBy, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Sort by:</span>
      <Select
        value={sortBy}
        onValueChange={(value) => onSortChange(value, sortDirection)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select sort field" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleDirection}
        className="gap-1"
      >
        {getSortIcon()}
        {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      </Button>
    </div>
  );
};

export default SortingControls;
