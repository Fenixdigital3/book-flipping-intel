
// TypeScript interfaces for API responses.

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  description?: string;
  image_url?: string;
  pages?: number;
  weight?: string;
  dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  current_prices: Price[];
  lowest_price?: number;
  highest_price?: number;
  price_spread?: number;
}

export interface Price {
  id: number;
  price: number;
  original_price?: number;
  currency: string;
  availability?: string;
  condition: string;
  shipping_cost: number;
  total_cost?: number;
  url?: string;
  store_name: string;
  store_code: string;
  last_updated: string;
  is_active: boolean;
}

export interface ArbitrageOpportunity {
  book_id: number;
  book_title: string;
  book_author: string;
  book_isbn: string;
  buy_price: number;
  sell_price: number;
  profit: number;
  profit_margin: number;
  buy_store: string;
  sell_store: string;
  buy_url?: string;
  sell_url?: string;
  last_updated: string;
}

export interface SearchFilters {
  query?: string;
  isbn?: string;
  author?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
}
