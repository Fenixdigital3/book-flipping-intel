
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
import PaginationControls from '@/components/PaginationControls';
import SortingControls from '@/components/SortingControls';
import ExportButton from '@/components/ExportButton';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, PaginatedSearchParams } from '@/services/api';
import { Book, ArbitrageOpportunity, SearchFilters } from '@/types/api';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  AlertCircle,
  RefreshCw,
  Database,
  LogOut,
  User
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Redirect to auth modal if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setAuthModalOpen(true);
    }
  }, [authLoading, isAuthenticated]);

  // Calculate offset for API calls
  const offset = (currentPage - 1) * pageSize;

  // Build search parameters
  const searchParams: PaginatedSearchParams = {
    ...searchFilters,
    limit: pageSize,
    offset,
    order_by: sortBy,
    order_direction: sortDirection,
  };

  // Queries - only run if authenticated
  const {
    data: books = [],
    isLoading: booksLoading,
    refetch: refetchBooks,
    error: booksError
  } = useQuery({
    queryKey: ['books', searchParams],
    queryFn: () => apiService.searchBooksWithPagination(searchParams),
    enabled: Object.keys(searchFilters).length > 0 && isAuthenticated
  });

  const {
    data: opportunities = [],
    isLoading: opportunitiesLoading,
    refetch: refetchOpportunities
  } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => apiService.getArbitrageOpportunities(5.0, 0.2),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    enabled: isAuthenticated
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-neon-orange" />
          <p className="text-white font-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
          <div className="text-center glass-panel p-8 rounded-lg">
            <h1 className="text-2xl font-header mb-4 text-white">Please log in to continue</h1>
            <Button onClick={() => setAuthModalOpen(true)}>Login / Register</Button>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentPage(1); // Reset to first page on new search
    if (Object.keys(filters).length > 0) {
      setActiveTab('search');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when changing sort
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

  // Calculate stats - simplified for now since we don't have total count
  const totalBooks = books.length;
  const avgProfit = opportunities.reduce((sum, opp) => sum + opp.profit, 0) / (opportunities.length || 1);
  const highProfitOpportunities = opportunities.filter(opp => opp.profit >= 10).length;

  return (
    <div className="min-h-screen bg-deep-charcoal relative">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-charcoal via-glass-purple/5 to-deep-charcoal" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-header text-white mb-2 animate-glass-float">
                Book Arbitrage Intelligence
              </h1>
              <p className="text-lg text-white/70 font-body">
                Find profitable book resale opportunities across online stores
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-white/80 glass-panel px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-neon-lime" />
                <span className="font-body">{user?.email}</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleTestScraper}>
                  <Database className="w-4 h-4 mr-2 text-neon-orange" />
                  Test Scraper
                </Button>
                <Button variant="secondary" onClick={() => {
                  refetchBooks();
                  refetchOpportunities();
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Books Tracked"
              value={totalBooks.toLocaleString()}
              subtitle="In current results"
              icon={BookOpen}
              className="border-l-4 border-l-neon-orange"
            />
            <StatsCard
              title="Active Opportunities"
              value={opportunities.length}
              subtitle="Profitable deals"
              icon={TrendingUp}
              className="border-l-4 border-l-neon-lime"
            />
            <StatsCard
              title="Avg Profit"
              value={`$${avgProfit.toFixed(2)}`}
              subtitle="Per opportunity"
              icon={DollarSign}
              className="border-l-4 border-l-neon-orange"
            />
            <StatsCard
              title="High Value"
              value={highProfitOpportunities}
              subtitle="$10+ profit deals"
              icon={AlertCircle}
              className="border-l-4 border-l-glass-purple"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={booksLoading} />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 glass-panel">
            <TabsTrigger value="search" className="flex items-center space-x-2 data-[state=active]:bg-neon-orange data-[state=active]:text-white">
              <Search className="w-4 h-4" />
              <span className="font-medium">Book Search</span>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center space-x-2 data-[state=active]:bg-neon-lime data-[state=active]:text-deep-charcoal">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Opportunities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-neon-orange" />
                    <span>Search Results</span>
                    {totalBooks > 0 && (
                      <span className="text-sm text-white/60 ml-2 font-body">
                        ({totalBooks} books shown)
                      </span>
                    )}
                  </CardTitle>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Export Button */}
                    {books.length > 0 && (
                      <ExportButton 
                        books={books} 
                        isLoading={booksLoading}
                        className="w-full sm:w-auto"
                      />
                    )}
                    
                    {/* Sorting Controls */}
                    {books.length > 0 && (
                      <SortingControls
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {booksLoading && (
                  <div className="flex justify-center items-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2 text-neon-orange" />
                    <span className="text-white font-body">Searching books...</span>
                  </div>
                )}

                {booksError && (
                  <div className="text-center h-32 flex items-center justify-center">
                    <div className="text-red-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-body">Error loading books. Please check your connection.</p>
                    </div>
                  </div>
                )}

                {!booksLoading && !booksError && books.length === 0 && Object.keys(searchFilters).length > 0 && (
                  <div className="text-center h-32 flex items-center justify-center text-white/60">
                    <div>
                      <BookOpen className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-body">No books found. Try adjusting your search criteria.</p>
                    </div>
                  </div>
                )}

                {!booksLoading && !booksError && books.length === 0 && Object.keys(searchFilters).length === 0 && (
                  <div className="text-center h-32 flex items-center justify-center text-white/60">
                    <div>
                      <Search className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-body">Enter search criteria to find books and compare prices.</p>
                    </div>
                  </div>
                )}

                {books.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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

                    {/* Pagination Controls */}
                    <PaginationControls
                      currentPage={currentPage}
                      totalItems={1000} // TODO: We need to get total count from API
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-neon-lime" />
                  <span>Arbitrage Opportunities</span>
                  {opportunities.length > 0 && (
                    <span className="text-sm text-white/60 ml-2 font-body">
                      ({opportunities.length} opportunities)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading && (
                  <div className="flex justify-center items-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2 text-neon-orange" />
                    <span className="text-white font-body">Loading opportunities...</span>
                  </div>
                )}

                {opportunities.length === 0 && !opportunitiesLoading && (
                  <div className="text-center h-32 flex items-center justify-center text-white/60">
                    <div>
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-body">No profitable opportunities found at the moment.</p>
                      <p className="text-sm mt-1 font-body">Try running the scraper to collect fresh data.</p>
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

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
