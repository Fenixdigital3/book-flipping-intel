
import Papa from 'papaparse';
import { Book } from '@/types/api';

export interface ExportableBookData {
  isbn: string;
  title: string;
  author: string;
  lowest_price: number | null;
  highest_price: number | null;
  price_spread: number | null;
  retailers: string;
  profit_margin: number | null;
  category: string;
  publication_year: number | null;
}

export const convertBooksToExportData = (books: Book[]): ExportableBookData[] => {
  return books.map(book => {
    const retailers = book.current_prices.map(price => price.store_name).join(', ');
    
    // Calculate a simple profit margin estimate based on price spread
    const profitMargin = book.price_spread && book.lowest_price 
      ? ((book.price_spread / book.lowest_price) * 100) 
      : null;

    return {
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      lowest_price: book.lowest_price,
      highest_price: book.highest_price,
      price_spread: book.price_spread,
      retailers,
      profit_margin: profitMargin ? Math.round(profitMargin * 100) / 100 : null,
      category: book.category || '',
      publication_year: book.publication_year,
    };
  });
};

export const exportBooksToCsv = (books: Book[], filename?: string) => {
  const exportData = convertBooksToExportData(books);
  
  const csv = Papa.unparse(exportData, {
    header: true,
    columns: [
      'isbn',
      'title', 
      'author',
      'lowest_price',
      'highest_price',
      'price_spread',
      'retailers',
      'profit_margin',
      'category',
      'publication_year'
    ]
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const downloadFilename = filename || `books_export_${timestamp}.csv`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', downloadFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
