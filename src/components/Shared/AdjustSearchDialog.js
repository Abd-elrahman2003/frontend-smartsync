import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Search, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@mui/material/styles";

const AdjustSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewAdjust,
  stores = [],
  products = [],
  fetchAdjusts,
  currentPage = 1,
  setCurrentPage
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    id: "",
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Abort controller for fetch cancellation
  const [abortController, setAbortController] = useState(null);

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
      setSearchFilters({
        id: filters.id || "",
        storeId: filters.storeId || "",
        dateFrom: filters.dateFrom || "",
        dateTo: filters.dateTo || "",
        productId: filters.productId || "",
        isPosted: filters.isPosted || "",
      });
    }
  }, [open, filters]);

  // Calculate total pages when total count or rows per page changes
  useEffect(() => {
    if (totalCount > 0) {
      const calculatedPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      setTotalPages(calculatedPages);
      console.log(`Total count: ${totalCount}, rowsPerPage: ${rowsPerPage}, totalPages calculated: ${calculatedPages}`);
    } else {
      setTotalPages(1);
    }
  }, [totalCount, rowsPerPage]);

  // Effect to trigger search when currentPage changes
  useEffect(() => {
    setTimeout(() => {
      fetchPageData(currentPage, rowsPerPage);
    }, 100);
  }, [currentPage]);
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Also inform parent component of filter changes
    if (onFilterChange) {
      onFilterChange(field, value);
    }
  };

  const fetchPageData = async (pageNum, rowsLimit) => {
    // Cancel any pending fetch first
    if (abortController) {
      abortController.abort();
    }
      
    // Create a new AbortController
    const controller = new AbortController();
    setAbortController(controller);
      
    setIsLoading(true);
    
    console.log(`Fetching page data for page: ${pageNum}, rows: ${rowsLimit}`);
      
    try {
      const response = await fetchAdjusts({
        id: searchFilters.id,
        storeId: searchFilters.storeId,
        dateFrom: searchFilters.dateFrom,
        dateTo: searchFilters.dateTo,
        productId: searchFilters.productId,
        isPosted: searchFilters.isPosted,
        page: pageNum,
        limit: rowsLimit,
        signal: controller.signal
      });
        
      // Make sure we're not already aborted before processing results
      if (!controller.signal.aborted) {
        console.log("API Response:", response);
        
        // Check for valid response structure
        if (response && response.orders) {
          // Enhance adjust orders with store names and product details
          const enhancedAdjusts = response.orders.map((adjust) => {
            const store = stores.find(s => s.id === adjust.storeId);
              
            return {
              ...adjust,
              storeName: store ? store.name : 'Unknown Store',
              isPosted: adjust.post, // Using 'post' field for status
              items: adjust.adjustProduct?.map(ap => {
                const product = products?.find(p => p.id === ap.transaction.productId);
                  
                return {
                  productId: ap.transaction.productId,
                  productName: product ? product.name : 'Unknown Product',
                  productCode: product ? product.code : 'N/A',
                  quantity: ap.transaction.quantity,
                  price: ap.transaction.price,
                  type: ap.transaction.type // ADJUST_ADD or ADUST_REMOVE
                };
              }) || []
            };
          });
            
          setFilteredResults(enhancedAdjusts);
          
          // Make sure to correctly handle the total count from response
          const count = response.totalOrders || 0;
          console.log(`Setting total count to: ${count}`);
          setTotalCount(count);
        } else {
          console.log("No orders found in response");
          setFilteredResults([]);
          setTotalCount(0);
        }
        setSearched(true);
        setIsLoading(false);
      }
    } catch (error) {
      // Only log and update state if not aborted
      if (error.name !== 'AbortError') {
        console.error('Error searching adjusts:', error);
        setFilteredResults([]);
        setTotalCount(0);
        setIsLoading(false);
      }
    }
  };

  const handleSearchClick = () => {
    console.log("Search button clicked");
    setCurrentPage(1); // Reset to first page when searching
    setSearched(true);
    fetchPageData(1, rowsPerPage);
  };

  const handleClearClick = () => {
    // Cancel any pending fetch
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    // Stop loading state if active
    if (isLoading) {
      setIsLoading(false);
    }
    
    // Clear filter values in parent component
    onFilterChange("id", "");
    onFilterChange("storeId", "");
    onFilterChange("dateFrom", "");
    onFilterChange("dateTo", "");
    onFilterChange("productId", "");
    onFilterChange("isPosted", "");
    
    // Clear local search filters
    setSearchFilters({
      id: "",
      storeId: "",
      dateFrom: "",
      dateTo: "",
      productId: "",
      isPosted: "",
    });
    
    setFilteredResults([]);
    setSearched(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleClose = () => {
    // Cancel any pending fetch
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    onClose();
  };

  const handleViewClick = (adjust) => {
    onViewAdjust(adjust);
    onClose();
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      console.log(`Moving to next page: ${nextPage}`);
      setCurrentPage(nextPage);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      console.log(`Moving to previous page: ${prevPage}`);
      setCurrentPage(prevPage);
    }
  };
  
  const handlePageClick = (pageNum) => {
    console.log(`Directly navigating to page: ${pageNum}`);
    setCurrentPage(pageNum);
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

  // Calculate total quantity and value for an adjust order
  const calculateSummary = (adjust) => {
    if (!adjust.items || adjust.items.length === 0) return { totalQuantity: 0, totalValue: 0 };
    
    const summary = adjust.items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const value = quantity * price;
      
      if (item.type === 'ADJUST_ADD') {
        acc.totalQuantity += quantity;
        acc.totalValue += value;
      } else if (item.type === 'ADUST_REMOVE') {
        acc.totalQuantity -= quantity;
        acc.totalValue -= value;
      }
      
      return acc;
    }, { totalQuantity: 0, totalValue: 0 });
    
    return summary;
  };
  
  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    // Always show first and last page, and up to 3 pages around current page
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

  // Determine adjustment type for display
  const getAdjustmentTypeDisplay = (adjust) => {
    if (!adjust.items || adjust.items.length === 0) return "N/A";
    
    const hasAdditions = adjust.items.some(item => item.type === 'ADJUST_ADD');
    const hasRemovals = adjust.items.some(item => item.type === 'ADUST_REMOVE');
    
    if (hasAdditions && hasRemovals) return "Mixed";
    if (hasAdditions) return "Addition";
    if (hasRemovals) return "Removal";
    return "N/A";
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Search Inventory Adjustments</DialogTitle>
      <DialogContent>
        {/* Search Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Adjustment ID"
                value={searchFilters.id}
                onChange={(e) => handleFilterChange("id", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.code} - ${option.name}` || ""}
                value={products.find((p) => p.id === searchFilters.productId) || null}
                onChange={(_, newValue) =>
                  handleFilterChange("productId", newValue ? newValue.id : "")
                }
                renderInput={(params) => (
                  <TextField {...params} label="Product" size="small" />
                )}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
                No adjustment orders found matching your search criteria. 
                Try adjusting your filters or search terms.
              </Typography>
            )}

            {filteredResults.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={styles.headerCell}>ID</TableCell>
                      <TableCell sx={styles.headerCell}>Date</TableCell>
                      <TableCell sx={styles.headerCell}>Store</TableCell>
                      <TableCell sx={styles.headerCell}>Type</TableCell>
                      <TableCell sx={styles.headerCell}>Items</TableCell>
                      <TableCell sx={styles.headerCell}>Net Quantity</TableCell>
                      <TableCell sx={styles.headerCell}>Net Value</TableCell>
                      <TableCell sx={styles.headerCell}>Status</TableCell>
                      <TableCell sx={styles.headerCell}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((adjust) => {
                      const summary = calculateSummary(adjust);
                      return (
                        <TableRow
                          key={adjust.id}
                          sx={styles.tableRow}
                          hover
                        >
                          <TableCell sx={styles.cell}>{adjust.id}</TableCell>
                          <TableCell sx={styles.cell}>{formatDate(adjust.date)}</TableCell>
                          <TableCell sx={styles.cell}>{adjust.storeName}</TableCell>
                          <TableCell sx={styles.cell}>{getAdjustmentTypeDisplay(adjust)}</TableCell>
                          <TableCell sx={styles.cell}>{adjust.items?.length || 0}</TableCell>
                          <TableCell sx={styles.cell}>{summary.totalQuantity.toFixed(2)}</TableCell>
                          <TableCell sx={styles.cell}>{summary.totalValue.toFixed(2)}</TableCell>
                          <TableCell sx={styles.cell}>
                            <Box
                              sx={{
                                backgroundColor: adjust.isPosted
                                  ? theme.palette.success.light
                                  : theme.palette.warning.light,
                                color: adjust.isPosted
                                  ? theme.palette.success.contrastText
                                  : theme.palette.warning.contrastText,
                                borderRadius: "4px",
                                px: 1,
                                py: 0.5,
                                display: "inline-block",
                              }}
                            >
                              {adjust.isPosted ? "Posted" : "Not Posted"}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewClick(adjust)}
                              size="small"
                            >
                              <Eye size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
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

export default AdjustSearchDialog;