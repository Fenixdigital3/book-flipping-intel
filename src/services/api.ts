// API service for making requests to the FastAPI backend.

import { Book, ArbitrageOpportunity, SearchFilters } from '@/types/api';
import { AlertPreference, AlertPreferenceCreate, AlertPreferenceUpdate } from '@/types/alerts';

// Use Railway production URL or fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     import.meta.env.VITE_API_BASE_URL || 
                     'https://bookflip-backend.up.railway.app';

export interface PriceHistoryPoint {
  retailer: string;
  timestamp: string;
  price: number;
  original_price?: number;
  availability?: string;
  condition: string;
}

export interface PriceHistoryResponse {
  book_id: number;
  book_title: string;
  book_isbn: string;
  total_points: number;
  date_range: {
    start?: string;
    end?: string;
  };
  history: PriceHistoryPoint[];
}

export interface PriceStatistics {
  book_id: number;
  statistics: {
    period_days: number;
    data_points: number;
    average_price: number;
    min_price: number;
    max_price: number;
    price_range: number;
    volatility: number;
    trend_slope: number;
    trend_direction: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface PaginatedSearchParams extends SearchFilters {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface PaginatedBookResponse {
  books: Book[];
  total: number;
  offset: number;
  limit: number;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Fix headers type issue by using proper object construction
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options if they exist
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          throw new Error('Authentication required. Please log in.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Book endpoints
  async searchBooks(filters: SearchFilters): Promise<Book[]> {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('q', filters.query);
    if (filters.isbn) params.append('isbn', filters.isbn);
    if (filters.author) params.append('author', filters.author);
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('min_price', filters.min_price.toString());
    if (filters.max_price) params.append('max_price', filters.max_price.toString());

    const endpoint = `/api/books/search?${params.toString()}`;
    return this.makeRequest<Book[]>(endpoint);
  }

  async searchBooksWithPagination(params: PaginatedSearchParams): Promise<Book[]> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('q', params.query);
    if (params.isbn) searchParams.append('isbn', params.isbn);
    if (params.author) searchParams.append('author', params.author);
    if (params.category) searchParams.append('category', params.category);
    if (params.min_price) searchParams.append('min_price', params.min_price.toString());
    if (params.max_price) searchParams.append('max_price', params.max_price.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.order_by) searchParams.append('order_by', params.order_by);
    if (params.order_direction) searchParams.append('order_direction', params.order_direction);

    const endpoint = `/api/books/search?${searchParams.toString()}`;
    return this.makeRequest<Book[]>(endpoint);
  }

  async getBook(bookId: number): Promise<Book> {
    return this.makeRequest<Book>(`/api/books/${bookId}`);
  }

  async getBookByIsbn(isbn: string): Promise<Book> {
    return this.makeRequest<Book>(`/api/books/isbn/${isbn}`);
  }

  // Price endpoints
  async getArbitrageOpportunities(
    minProfit?: number,
    minMargin?: number
  ): Promise<ArbitrageOpportunity[]> {
    const params = new URLSearchParams();
    if (minProfit) params.append('min_profit', minProfit.toString());
    if (minMargin) params.append('min_margin', minMargin.toString());

    const endpoint = `/api/prices/opportunities?${params.toString()}`;
    return this.makeRequest<ArbitrageOpportunity[]>(endpoint);
  }

  // New Price History endpoints
  async getPriceHistory(
    bookId: number,
    options?: {
      retailer?: string;
      startDate?: string;
      endDate?: string;
      interval?: string;
      limit?: number;
    }
  ): Promise<PriceHistoryResponse> {
    const params = new URLSearchParams();
    
    if (options?.retailer) params.append('retailer', options.retailer);
    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);
    if (options?.interval) params.append('interval', options.interval);
    if (options?.limit) params.append('limit', options.limit.toString());

    const endpoint = `/api/prices/history/${bookId}?${params.toString()}`;
    return this.makeRequest<PriceHistoryResponse>(endpoint);
  }

  async getPriceStatistics(
    bookId: number,
    days: number = 30
  ): Promise<PriceStatistics> {
    const params = new URLSearchParams();
    params.append('days', days.toString());

    const endpoint = `/api/prices/statistics/${bookId}?${params.toString()}`;
    return this.makeRequest<PriceStatistics>(endpoint);
  }

  // Alert Preferences endpoints - updated to not require user_id
  async getAlertPreferences(): Promise<AlertPreference> {
    return this.makeRequest<AlertPreference>('/api/alerts/preferences');
  }

  async createAlertPreferences(data: AlertPreferenceCreate): Promise<AlertPreference> {
    return this.makeRequest<AlertPreference>('/api/alerts/preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlertPreferences(data: AlertPreferenceUpdate): Promise<AlertPreference> {
    return this.makeRequest<AlertPreference>('/api/alerts/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlertPreferences(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/alerts/preferences', {
      method: 'DELETE',
    });
  }

  // Scraper endpoints
  async scrapeBookByIsbn(isbn: string): Promise<any> {
    return this.makeRequest(`/api/scraper/scrape/isbn/${isbn}`, {
      method: 'POST',
    });
  }

  async scrapeSearchResults(query: string, maxResults?: number): Promise<any> {
    const params = maxResults ? `?max_results=${maxResults}` : '';
    return this.makeRequest(`/api/scraper/scrape/search/${encodeURIComponent(query)}${params}`, {
      method: 'POST',
    });
  }

  async testAmazonScraper(isbn?: string): Promise<any> {
    const params = isbn ? `?isbn=${isbn}` : '';
    return this.makeRequest(`/api/scraper/test/amazon${params}`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.makeRequest('/health');
  }
}

export const apiService = new ApiService();
