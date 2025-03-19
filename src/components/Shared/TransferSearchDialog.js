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

const TransferSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewTransfer,
  stores = [],
  products = [],
  fetchTransfers,
  currentPage = 1,
  setCurrentPage
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    storeFromId: "",
    storeToId: "",
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
        storeFromId: filters.storeFromId || "",
        storeToId: filters.storeToId || "",
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
      const response = await fetchTransfers({
        id: searchFilters.id,
        storeFromId: searchFilters.storeFromId,
        storeToId: searchFilters.storeToId,
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
          // Enhance transfer orders with store names
          const enhancedTransfers = response.orders.map((transfer) => {
            const fromStore = stores.find(s => s.id === transfer.storeFromId);
            const toStore = stores.find(s => s.id === transfer.storeToId);
              
            return {
              ...transfer,
              fromStoreName: fromStore ? fromStore.name : 'Unknown Store',
              toStoreName: toStore ? toStore.name : 'Unknown Store',
              isPosted: transfer.post, // Using 'post' field for status
              items: transfer.transferProduct?.map(tp => {
                const product = products?.find(p => p.id === tp.transaction.productId);
                  
                return {
                  productId: tp.transaction.productId,
                  productName: product ? product.name : 'Unknown Product',
                  productCode: product ? product.code : 'N/A',
                  quantity: tp.transaction.quantity,
                  price: tp.transaction.price
                };
              }) || []
            };
          });
            
          setFilteredResults(enhancedTransfers);
          
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
        console.error('Error searching transfers:', error);
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
    onFilterChange("storeFromId", "");
    onFilterChange("storeToId", "");
    onFilterChange("dateFrom", "");
    onFilterChange("dateTo", "");
    onFilterChange("productId", "");
    onFilterChange("isPosted", "");
    
    // Clear local search filters
    setSearchFilters({
      id: "",
      storeFromId: "",
      storeToId: "",
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

  const handleViewClick = (transfer) => {
    onViewTransfer(transfer);
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

  // Calculate total quantity for a transfer
  const calculateTotalQuantity = (transfer) => {
    if (!transfer.items || transfer.items.length === 0) return "0";
    
    const total = transfer.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + quantity * price;
    }, 0);
    
    return total.toString();
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Search Transfer Orders</DialogTitle>
      <DialogContent>
        {/* Search Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Transfer ID"
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
                value={stores.find((s) => s.id === searchFilters.storeFromId) || null}
                onChange={(_, newValue) =>
                  handleFilterChange("storeFromId", newValue ? newValue.id : "")
                }
                renderInput={(params) => (
                  <TextField {...params} label="From Store" size="small" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={stores}
                getOptionLabel={(option) => option.name || ""}
                value={stores.find((s) => s.id === searchFilters.storeToId) || null}
                onChange={(_, newValue) =>
                  handleFilterChange("storeToId", newValue ? newValue.id : "")
                }
                renderInput={(params) => (
                  <TextField {...params} label="To Store" size="small" />
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
                No transfer orders found matching your search criteria. 
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
                      <TableCell sx={styles.headerCell}>From Store</TableCell>
                      <TableCell sx={styles.headerCell}>To Store</TableCell>
                      <TableCell sx={styles.headerCell}>Items</TableCell>
                      <TableCell sx={styles.headerCell}>Total Amount</TableCell>
                      <TableCell sx={styles.headerCell}>Status</TableCell>
                      <TableCell sx={styles.headerCell}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((transfer) => (
                      <TableRow
                        key={transfer.id}
                        sx={styles.tableRow}
                        hover
                      >
                        <TableCell sx={styles.cell}>{transfer.id}</TableCell>
                        <TableCell sx={styles.cell}>{formatDate(transfer.date)}</TableCell>
                        <TableCell sx={styles.cell}>{transfer.fromStoreName}</TableCell>
                        <TableCell sx={styles.cell}>{transfer.toStoreName}</TableCell>
                        <TableCell sx={styles.cell}>{transfer.items?.length || 0}</TableCell>
                        <TableCell sx={styles.cell}>{calculateTotalQuantity(transfer)}</TableCell>
                        <TableCell sx={styles.cell}>
                          <Box
                            sx={{
                              backgroundColor: transfer.isPosted
                                ? theme.palette.success.light
                                : theme.palette.warning.light,
                              color: transfer.isPosted
                                ? theme.palette.success.contrastText
                                : theme.palette.warning.contrastText,
                              borderRadius: "4px",
                              px: 1,
                              py: 0.5,
                              display: "inline-block",
                            }}
                          >
                            {transfer.isPosted ? "Posted" : "Not Posted"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewClick(transfer)}
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

export default TransferSearchDialog;