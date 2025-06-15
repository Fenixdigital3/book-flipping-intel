
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/api';
import { exportBooksToCsv } from '@/utils/csvExport';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  books: Book[];
  isLoading?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  books,
  isLoading = false,
  className = ''
}) => {
  const handleExport = () => {
    if (books.length === 0) return;
    
    exportBooksToCsv(books);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isLoading || books.length === 0}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Export Results ({books.length})
    </Button>
  );
};

export default ExportButton;
