
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import OpportunityCard from '@/components/OpportunityCard';
import StatsCard from '@/components/StatsCard';
import { apiService } from '@/services/api';
import { Book, ArbitrageOpportunity, SearchFilters } from '@/types/api';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  AlertCircle,
  RefreshCw,
  Database
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [activeTab, setActiveTab] = useState('search');

  // Queries
  const {
    data: books = [],
    isLoading: booksLoading,
    refetch: refetchBooks,
    error: booksError
  } = useQuery({
    queryKey: ['books', searchFilters],
    queryFn: () => apiService.searchBooks(searchFilters),
    enabled: Object.keys(searchFilters).length > 0
  });

  const {
    data: opportunities = [],
    isLoading: opportunitiesLoading,
    refetch: refetchOpportunities
  } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => apiService.getArbitrageOpportunities(5.0, 0.2),
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    if (Object.keys(filters).length > 0) {
      setActiveTab('search');
    }
  };

  const handleTestScraper = async () => {
    try {
      toast({
        title: "Testing Scraper",
        description: "Running Amazon scraper test...",
      });
      
      const result = await apiService.testAmazonScraper();
      
      toast({
        title: "Scraper Test Complete",
        description: result.status === 'success' ? 
          "Test successful! Check console for details." : 
          `Test failed: ${result.error}`,
        variant: result.status === 'success' ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not connect to scraper service",
        variant: "destructive"
      });
    }
  };

  // Calculate stats
  const totalBooks = books.length;
  const avgProfit = opportunities.reduce((sum, opp) => sum + opp.profit, 0) / (opportunities.length || 1);
  const highProfitOpportunities = opportunities.filter(opp => opp.profit >= 10).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Book Arbitrage Intelligence
              </h1>
              <p className="text-lg text-muted-foreground">
                Find profitable book resale opportunities across online stores
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleTestScraper}>
                <Database className="w-4 h-4 mr-2" />
                Test Scraper
              </Button>
              <Button onClick={() => {
                refetchBooks();
                refetchOpportunities();
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Books Tracked"
              value={totalBooks.toLocaleString()}
              subtitle="In database"
              icon={BookOpen}
              className="border-l-4 border-l-blue-500"
            />
            <StatsCard
              title="Active Opportunities"
              value={opportunities.length}
              subtitle="Profitable deals"
              icon={TrendingUp}
              className="border-l-4 border-l-emerald-500"
            />
            <StatsCard
              title="Avg Profit"
              value={`$${avgProfit.toFixed(2)}`}
              subtitle="Per opportunity"
              icon={DollarSign}
              className="border-l-4 border-l-yellow-500"
            />
            <StatsCard
              title="High Value"
              value={highProfitOpportunities}
              subtitle="$10+ profit deals"
              icon={AlertCircle}
              className="border-l-4 border-l-purple-500"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={booksLoading} />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Book Search</span>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Opportunities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search Results</span>
                  {totalBooks > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({totalBooks} books found)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {booksLoading && (
                  <div className="flex justify-center items-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Searching books...</span>
                  </div>
                )}

                {booksError && (
                  <div className="text-center h-32 flex items-center justify-center">
                    <div className="text-red-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>Error loading books. Please check your connection.</p>
                    </div>
                  </div>
                )}

                {!booksLoading && !booksError && books.length === 0 && Object.keys(searchFilters).length > 0 && (
                  <div className="text-center h-32 flex items-center justify-center text-muted-foreground">
                    <div>
                      <BookOpen className="w-8 h-8 mx-auto mb-2" />
                      <p>No books found. Try adjusting your search criteria.</p>
                    </div>
                  </div>
                )}

                {!booksLoading && !booksError && books.length === 0 && Object.keys(searchFilters).length === 0 && (
                  <div className="text-center h-32 flex items-center justify-center text-muted-foreground">
                    <div>
                      <Search className="w-8 h-8 mx-auto mb-2" />
                      <p>Enter search criteria to find books and compare prices.</p>
                    </div>
                  </div>
                )}

                {books.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onViewDetails={(book) => {
                          toast({
                            title: "Book Details",
                            description: `Viewing details for "${book.title}"`,
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Arbitrage Opportunities</span>
                  {opportunities.length > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({opportunities.length} opportunities)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading && (
                  <div className="flex justify-center items-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading opportunities...</span>
                  </div>
                )}

                {opportunities.length === 0 && !opportunitiesLoading && (
                  <div className="text-center h-32 flex items-center justify-center text-muted-foreground">
                    <div>
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>No profitable opportunities found at the moment.</p>
                      <p className="text-sm mt-1">Try running the scraper to collect fresh data.</p>
                    </div>
                  </div>
                )}

                {opportunities.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opportunity, index) => (
                      <OpportunityCard
                        key={`${opportunity.book_id}-${index}`}
                        opportunity={opportunity}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
