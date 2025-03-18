import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  Autocomplete,
  Box,
  Alert,
} from "@mui/material";
import { Search, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import _ from "lodash";

const PurchaseSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewPurchase,
  suppliers = [],
  stores = [],
  products = [],
  fetchPurchases,
  currentPage = 1,
  setCurrentPage
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    supplierId: "",
    storeId: "",
    dateFrom: "",
    dateTo: "",
    productId: "",
    isPosted: "",
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [isManuallyChangingPage, setIsManuallyChangingPage] = useState(false);
  
  // Reference to store search filters for use in callbacks
  const searchFiltersRef = useRef(searchFilters);
  
  // Cache for storing fetched pages
  const pageCache = useRef(new Map());
  
  // Store all active abort controllers
  const activeRequestsRef = useRef(new Map());

  // Styles
  const styles = {
    cell: { fontSize: "0.9rem" },
    headerCell: {
      fontSize: "0.9rem",
      color: theme.palette.common.white,
      fontWeight: 500,
    },
    tableRow: {
      "&:hover": { backgroundColor: theme.palette.action.hover },
    },
  };

  // Reset filters when dialog opens
  useEffect(() => {
    if (open) {
      const newFilters = {
        id: filters.id || "",
        supplierId: filters.supplierId || "",
        storeId: filters.storeId || "",
        dateFrom: filters.dateFrom || "",
        dateTo: filters.dateTo || "",
        productId: filters.productId || "",
        isPosted: filters.isPosted || "",
      };
      setSearchFilters(newFilters);
      searchFiltersRef.current = newFilters;
      
      // Clear cache when dialog opens with new filters
      pageCache.current.clear();
    }
    
    // Cleanup function to abort all pending requests when dialog closes or unmounts
    return () => {
      abortAllRequests();
    };
  }, [open, filters]);

  // Update search filters ref whenever actual filters change
  useEffect(() => {
    searchFiltersRef.current = searchFilters;
  }, [searchFilters]);

  // Calculate total pages when total count or rows per page changes
  useEffect(() => {
    if (totalCount > 0) {
      const calculatedPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      setTotalPages(calculatedPages);
    } else {
      setTotalPages(1);
    }
  }, [totalCount, rowsPerPage]);

  // Main effect for fetching the current page data
  useEffect(() => {
    if (open && searched && currentPage > 0) {
      console.log(`Page changed to: ${currentPage}, isLoading: ${isLoading}`);
      
      // Check cache first
      const cacheKey = JSON.stringify({...searchFiltersRef.current, page: currentPage});
      const cachedData = pageCache.current.get(cacheKey);
      const isCacheValid = cachedData && (Date.now() - cachedData.timestamp) < 30000;
      
      if (isCacheValid) {
        // Use cached data without fetching
        console.log(`Using cached data for page ${currentPage}`);
        setFilteredResults(cachedData.enhancedPurchases);
        setTotalCount(cachedData.totalCount);
        setError(null);
        setIsLoading(false);
      } else if (!isLoading) {
        // Data not in cache, fetch it
        console.log(`Fetching main data for page: ${currentPage}`);
        setIsLoading(true);
        fetchPageData(currentPage);
      }
    }
  }, [currentPage, open, searched]);

  // Separate effect for prefetching - completely independent from main page fetching
  useEffect(() => {
    // Only prefetch if we're not manually changing pages, not loading, and not at the last page
    if (searched && !isLoading && !isManuallyChangingPage && currentPage < totalPages) {
      const nextPage = currentPage + 1;
      
      // Check if next page is already in cache
      const cacheKey = JSON.stringify({...searchFiltersRef.current, page: nextPage});
      const cachedData = pageCache.current.get(cacheKey);
      const isCacheValid = cachedData && (Date.now() - cachedData.timestamp) < 30000;
      
      if (!isCacheValid) {
        // Only prefetch if not in cache - use a separate function for prefetching
        console.log(`Initiating prefetch for page ${nextPage}`);
        prefetchPageData(nextPage);
      }
    }
  }, [currentPage, totalPages, searched, isLoading, isManuallyChangingPage]);

  // Abort all pending requests
  const abortAllRequests = useCallback(() => {
    activeRequestsRef.current.forEach((controller, key) => {
      console.log(`Aborting request: ${key}`);
      controller.abort();
    });
    activeRequestsRef.current.clear();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => {
      const updated = {
        ...prev,
        [field]: value,
      };
      // Update the ref immediately
      searchFiltersRef.current = updated;
      return updated;
    });
    
    // Also inform parent component of filter changes
    if (onFilterChange) {
      onFilterChange(field, value);
    }
  };

  // Main function to fetch the current page data
  const fetchPageData = async (pageNum) => {
    // Create a unique ID for this request
    const requestId = `main-${pageNum}-${Date.now()}`;
    
    // Create a new AbortController
    const controller = new AbortController();
    
    // Store the controller
    activeRequestsRef.current.set(requestId, controller);
    
    console.log(`Fetching page data for page: ${pageNum}, requestId: ${requestId}`);
      
    try {
      const response = await fetchPurchases({
        id: searchFiltersRef.current.id,
        supplierId: searchFiltersRef.current.supplierId,
        storeId: searchFiltersRef.current.storeId,
        dateFrom: searchFiltersRef.current.dateFrom,
        dateTo: searchFiltersRef.current.dateTo,
        productId: searchFiltersRef.current.productId,
        isPosted: searchFiltersRef.current.isPosted,
        page: pageNum,
        limit: rowsPerPage,
        signal: controller.signal
      });
        
      // Remove this controller from active requests
      activeRequestsRef.current.delete(requestId);
      
      // Check for valid response structure
      if (response && response.orders) {
        // Enhance purchase orders with supplier and store names
        const enhancedPurchases = response.orders.map((purchase) => {
          const supplier = suppliers.find(s => s.id === purchase.supplierId);
          const store = stores.find(s => s.id === purchase.storeId);
            
          return {
            ...purchase,
            supplierName: supplier ? supplier.fullName : 'Unknown Supplier',
            storeName: store ? store.name : 'Unknown Store',
            isPosted: purchase.post, // Using 'post' field for status
            items: Array.isArray(purchase.purchaseProduct) 
              ? purchase.purchaseProduct.map(pp => {
                  const product = products?.find(p => p.id === (pp.transaction?.productId || null));
                  
                  return {
                    productId: pp.transaction?.productId,
                    productName: product ? product.name : 'Unknown Product',
                    productCode: product ? product.code : 'N/A',
                    quantity: pp.transaction?.quantity || 0,
                    price: pp.transaction?.price || 0
                  };
                })
              : []
          };
        });
          
        // Cache the results
        const cacheKey = JSON.stringify({...searchFiltersRef.current, page: pageNum});
        pageCache.current.set(cacheKey, {
          enhancedPurchases,
          totalCount: response.totalOrders || 0,
          timestamp: Date.now()
        });
        
        // IMPORTANT: Only update UI if this page matches the current page
        if (pageNum === currentPage) {
          console.log(`Setting results for page ${pageNum}`);
          setFilteredResults(enhancedPurchases);
          setTotalCount(response.totalOrders || 0);
          setSearched(true);
          setIsLoading(false);
          setIsManuallyChangingPage(false);
        } else {
          console.log(`Ignoring results for page ${pageNum} as current page is now ${currentPage}`);
        }
      } else {
        console.log("No orders found in response");
        setFilteredResults([]);
        setTotalCount(0);
        setSearched(true);
        setIsLoading(false);
        setIsManuallyChangingPage(false);
      }
    } catch (error) {
      // Remove this controller from active requests
      activeRequestsRef.current.delete(requestId);
      
      // Only log and update state if not aborted
      if (error.name !== 'AbortError') {
        console.error('Error searching purchases:', error);
        setFilteredResults([]);
        setTotalCount(0);
        setIsLoading(false);
        setIsManuallyChangingPage(false);
        setError("Failed to fetch purchase orders. Please try again.");
      }
    }
  };

  // Completely separate function for prefetching that will never update UI state
  const prefetchPageData = async (pageNum) => {
    // Create a unique ID for this prefetch request
    const requestId = `prefetch-${pageNum}-${Date.now()}`;
    
    // Create a new AbortController
    const controller = new AbortController();
    
    // Store the controller
    activeRequestsRef.current.set(requestId, controller);
    
    try {
      console.log(`PREFETCHING data for page ${pageNum} (will not update UI)`);
      const response = await fetchPurchases({
        id: searchFiltersRef.current.id,
        supplierId: searchFiltersRef.current.supplierId,
        storeId: searchFiltersRef.current.storeId,
        dateFrom: searchFiltersRef.current.dateFrom,
        dateTo: searchFiltersRef.current.dateTo,
        productId: searchFiltersRef.current.productId,
        isPosted: searchFiltersRef.current.isPosted,
        page: pageNum,
        limit: rowsPerPage,
        signal: controller.signal
      });
        
      // Remove this controller from active requests
      activeRequestsRef.current.delete(requestId);
      
      // Only cache the results, never update UI
      if (response && response.orders) {
        // Process and enhance purchases
        const enhancedPurchases = response.orders.map((purchase) => {
          const supplier = suppliers.find(s => s.id === purchase.supplierId);
          const store = stores.find(s => s.id === purchase.storeId);
            
          return {
            ...purchase,
            supplierName: supplier ? supplier.fullName : 'Unknown Supplier',
            storeName: store ? store.name : 'Unknown Store',
            isPosted: purchase.post,
            items: Array.isArray(purchase.purchaseProduct) 
              ? purchase.purchaseProduct.map(pp => {
                  const product = products?.find(p => p.id === (pp.transaction?.productId || null));
                  
                  return {
                    productId: pp.transaction?.productId,
                    productName: product ? product.name : 'Unknown Product',
                    productCode: product ? product.code : 'N/A',
                    quantity: pp.transaction?.quantity || 0,
                    price: pp.transaction?.price || 0
                  };
                })
              : []
          };
        });
        
        // Cache the results
        const cacheKey = JSON.stringify({...searchFiltersRef.current, page: pageNum});
        pageCache.current.set(cacheKey, {
          enhancedPurchases,
          totalCount: response.totalOrders || 0,
          timestamp: Date.now()
        });
        
        console.log(`Prefetch complete for page ${pageNum} - cached only`);
      }
    } catch (error) {
      // Remove this controller from active requests
      activeRequestsRef.current.delete(requestId);
      
      // Only log errors for prefetch
      if (error.name !== 'AbortError') {
        console.error(`Prefetch error for page ${pageNum}:`, error);
      }
    }
  };

  const handleSearchClick = () => {
    console.log("Search button clicked");
    // Abort all pending requests
    abortAllRequests();
    
    // Clear cache when performing a new search
    pageCache.current.clear();
    
    // Reset to first page when searching
    setIsManuallyChangingPage(true);
    setCurrentPage(1); 
    
    setSearched(true);
    setError(null);
    
    // Fetch data for page 1
    setIsLoading(true);
    fetchPageData(1);
  };

  const handleClearClick = () => {
    // Abort all pending requests
    abortAllRequests();
    
    // Stop loading state if active
    setIsLoading(false);
    
    // Clear filter values in parent component
    Object.keys(searchFilters).forEach(key => {
      if (onFilterChange) {
        onFilterChange(key, "");
      }
    });
    
    // Clear local search filters
    const emptyFilters = {
      id: "",
      supplierId: "",
      storeId: "",
      dateFrom: "",
      dateTo: "",
      productId: "",
      isPosted: "",
    };
    
    setSearchFilters(emptyFilters);
    searchFiltersRef.current = emptyFilters;
    
    // Clear cache
    pageCache.current.clear();
    
    setFilteredResults([]);
    setSearched(false);
    
    // Reset to first page
    setIsManuallyChangingPage(true);
    setCurrentPage(1);
    
    setError(null);
  };

  const handleClose = () => {
    // Abort all pending requests
    abortAllRequests();
    onClose();
  };

  const handleViewClick = (purchase) => {
    onViewPurchase(purchase);
    onClose();
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      // Mark as manual page change
      isManualPageChange.current = true;
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      // Mark as manual page change
      isManualPageChange.current = true;
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handlePageClick = (pageNum) => {
    if (pageNum !== currentPage) {
      // Mark as manual page change
      isManualPageChange.current = true;
      setCurrentPage(pageNum);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Calculate total amount for a purchase order safely
  const calculateTotalAmount = (purchase) => {
    if (!purchase.items || !Array.isArray(purchase.items) || purchase.items.length === 0) return "0.00";
    
    const total = purchase.items.reduce((sum, item) => {
      const quantity = parseFloat(item?.quantity) || 0;
      const price = parseFloat(item?.price) || 0;
      return sum + quantity * price;
    }, 0);
    
    return total.toFixed(2);
  };
  
  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    
    // Always add page 1
    pageNumbers.push(1);
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) { // Avoid duplicating first and last page
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
    // Add last page if it's not the same as first page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers.map((pageNum, index) => {
      if (pageNum === '...') {
        return (
          <Typography key={`ellipsis-${index}`} variant="body2" sx={{ mx: 1 }}>
            ...
          </Typography>
        );
      }
      
      return (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "contained" : "outlined"}
          size="small"
          sx={{ minWidth: 30, mx: 0.5 }}
          onClick={() => handlePageClick(pageNum)}
        >
          {pageNum}
        </Button>
      );
    });
  };

  // Memoized table component to reduce re-renders
  const ResultsTable = React.memo(({ data, onViewClick }) => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={styles.headerCell}>ID</TableCell>
            <TableCell sx={styles.headerCell}>Date</TableCell>
            <TableCell sx={styles.headerCell}>Supplier</TableCell>
            <TableCell sx={styles.headerCell}>Store</TableCell>
            <TableCell sx={styles.headerCell}>Items</TableCell>
            <TableCell sx={styles.headerCell}>Total Amount</TableCell>
            <TableCell sx={styles.headerCell}>Status</TableCell>
            <TableCell sx={styles.headerCell}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((purchase) => (
            <TableRow
              key={purchase.id}
              sx={styles.tableRow}
              hover
            >
              <TableCell sx={styles.cell}>{purchase.id}</TableCell>
              <TableCell sx={styles.cell}>{formatDate(purchase.date)}</TableCell>
              <TableCell sx={styles.cell}>{purchase.supplierName}</TableCell>
              <TableCell sx={styles.cell}>{purchase.storeName}</TableCell>
              <TableCell sx={styles.cell}>{purchase.items?.length || 0}</TableCell>
              <TableCell sx={styles.cell}>{calculateTotalAmount(purchase)}</TableCell>
              <TableCell sx={styles.cell}>
                <Box
                  sx={{
                    backgroundColor: purchase.isPosted
                      ? theme.palette.success.light
                      : theme.palette.warning.light,
                    color: purchase.isPosted
                      ? theme.palette.success.contrastText
                      : theme.palette.warning.contrastText,
                      borderRadius: "4px",
                      px: 1,
                      py: 0.5,
                      display: "inline-block",
                    }}
                  >
                    {purchase.isPosted ? "Posted" : "Not Posted"}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => onViewClick(purchase)}
                    size="small"
                  >
                    <Eye size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ));
  
    // Improve performance by preventing unnecessary re-renders
    ResultsTable.displayName = 'ResultsTable';
  
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Search Purchase Orders</DialogTitle>
        <DialogContent>
          {/* Search Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Order ID"
                  value={searchFilters.id}
                  onChange={(e) => handleFilterChange("id", e.target.value)}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.fullName || ""}
                  value={suppliers.find((s) => s.id === searchFilters.supplierId) || null}
                  onChange={(_, newValue) =>
                    handleFilterChange("supplierId", newValue ? newValue.id : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Supplier" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={stores}
                  getOptionLabel={(option) => option.name || ""}
                  value={stores.find((s) => s.id === searchFilters.storeId) || null}
                  onChange={(_, newValue) =>
                    handleFilterChange("storeId", newValue ? newValue.id : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Store" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date From"
                  type="date"
                  value={searchFilters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date To"
                  type="date"
                  value={searchFilters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => `${option.name} (${option.code})`}
                  value={products.find((p) => p.id === searchFilters.productId) || null}
                  onChange={(_, newValue) =>
                    handleFilterChange("productId", newValue ? newValue.id : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Product" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={[
                    { id: "true", label: "Posted" },
                    { id: "false", label: "Not Posted" },
                  ]}
                  getOptionLabel={(option) => option.label}
                  value={
                    searchFilters.isPosted !== ""
                      ? {
                          id: searchFilters.isPosted,
                          label:
                            searchFilters.isPosted === "true" ? "Posted" : "Not Posted",
                        }
                      : null
                  }
                  onChange={(_, newValue) =>
                    handleFilterChange("isPosted", newValue ? newValue.id : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Status" size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined" 
                  onClick={handleClearClick} 
                  startIcon={<X size={16} />}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Search size={16} />}
                  onClick={handleSearchClick}
                  disabled={isLoading}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
  
          {/* Results Table */}
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!isLoading && searched && filteredResults.length === 0 && (
                <Typography 
                  variant="body1" 
                  align="center" 
                  color="textSecondary" 
                  sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}
                >
                  No purchase orders found matching your search criteria. 
                  Try adjusting your filters or search terms.
                </Typography>
              )}
  
              {filteredResults.length > 0 && (
                <ResultsTable 
                  data={filteredResults} 
                  onViewClick={handleViewClick} 
                />
              )}
  
              {/* Enhanced Pagination */}
              {filteredResults.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Typography variant="body2">
                    Showing {filteredResults.length} of {totalCount} results
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button 
                      variant="outlined"
                      disabled={currentPage <= 1}
                      onClick={handlePrevPage}
                      size="small"
                      startIcon={<ChevronLeft size={16} />}
                      sx={{ mr: 1 }}
                    >
                      Previous
                    </Button>
                    
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {renderPaginationNumbers()}
                    </Box>
                    
                    <Button 
                      variant="outlined"
                      disabled={currentPage >= totalPages}
                      onClick={handleNextPage}
                      size="small"
                      endIcon={<ChevronRight size={16} />}
                      sx={{ ml: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default PurchaseSearchDialog;