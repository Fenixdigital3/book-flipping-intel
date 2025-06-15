
"""
API service for making requests to the FastAPI backend.
"""

import { Book, ArbitrageOpportunity, SearchFilters } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
