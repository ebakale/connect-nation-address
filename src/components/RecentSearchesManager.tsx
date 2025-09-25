import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Clock, Trash2, RotateCcw, X, ChevronRight } from 'lucide-react';
import { useRecentSearches, RecentSearch } from '@/hooks/useRecentSearches';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

interface RecentSearchesManagerProps {
  onSearchSelect?: (query: string) => void;
  onClose?: () => void;
}

export const RecentSearchesManager: React.FC<RecentSearchesManagerProps> = ({ 
  onSearchSelect, 
  onClose 
}) => {
  const { recentSearches, loading, deleteSearch, clearAllSearches } = useRecentSearches();
  const { t } = useTranslation(['dashboard', 'common']);
  const [searchFilter, setSearchFilter] = useState('');

  // Filter searches based on search term
  const filteredSearches = recentSearches.filter(search =>
    search.search_query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSearchSelect = (query: string) => {
    if (onSearchSelect) {
      onSearchSelect(query);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleDelete = async (search: RecentSearch) => {
    await deleteSearch(search.id);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all recent searches?')) {
      await clearAllSearches();
    }
  };

  const formatSearchTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case 'address': return 'Address';
      case 'uac': return 'UAC';
      case 'coordinates': return 'Coordinates';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            {t('dashboard:recentSearches')}
          </h2>
          <p className="text-muted-foreground">{t('dashboard:recentSearchesDesc')}</p>
        </div>
        
        {recentSearches.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search filter */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter recent searches..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1"
          />
          {searchFilter && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSearchFilter('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <Separator />

      {/* Searches list */}
      {filteredSearches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {recentSearches.length === 0 ? 'No recent searches' : 'No searches match your filter'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {recentSearches.length === 0 
                ? 'Your recent address searches will appear here after you perform some searches.'
                : 'Try adjusting your search filter.'
              }
            </p>
            {searchFilter && (
              <Button onClick={() => setSearchFilter('')} variant="outline">
                Clear Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSearches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 cursor-pointer hover:bg-muted/50 rounded p-2 -m-2"
                    onClick={() => handleSearchSelect(search.search_query)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{search.search_query}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getSearchTypeLabel(search.search_type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatSearchTime(search.searched_at)}</span>
                          {search.results_count > 0 && (
                            <span>{search.results_count} result{search.results_count !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(search)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick stats */}
      {recentSearches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{recentSearches.length} total searches</span>
              <span>•</span>
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};