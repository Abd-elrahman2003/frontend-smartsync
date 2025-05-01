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

const SellingSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewSelling,
  customers = [],
  stores = [],
  products = [],
  fetchSellingOrders,
  currentPage = 1,
  setCurrentPage
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    customerId: null,
    storeId: "",
    status: "",
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Abort controller for fetch cancellation
  const [abortController, setAbortController] = useState(null);

  // Status options
  const statusOptions = [
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Completed" }
  ];

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
        customerId: filters.customerId || "",
        storeId: filters.storeId || "",
        status: filters.status || "",
      });
    }
  }, [open, filters]);

  // Calculate total pages when total count or rows per page changes
  useEffect(() => {
    if (totalCount > 0) {
      const calculatedPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      setTotalPages(calculatedPages);
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
  console.log(`Setting ${field} to:`, value);
  setSearchFilters((prev) => ({
    ...prev,
    [field]: value || null,
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
      
    try {
      const response = await fetchSellingOrders({
        id: searchFilters.id,
        customerId: searchFilters.customerId || undefined,
        fromStoreId: searchFilters.storeId,
        status: searchFilters.status, // Log the status explicitly
        page: pageNum,
        limit: rowsLimit,
        signal: controller.signal
      });
        
      // Make sure we're not already aborted before processing results
      if (!controller.signal.aborted) {
        if (response && response.orders) {
          // Enhance selling orders with customer and store names
          const enhancedSellings = response.orders.map((selling) => {
            console.log(`Fetching page data for page: ${pageNum}`);
          // More robust customer matching
          const matchedCustomer = customers.find(c => 
            c.id === selling.customerId || 
            (c.email === selling.customer?.email) ||
            (c.firstName === selling.customer?.firstName && c.lastName === selling.customer?.lastName)
          );
          const firstTransaction = selling.sellingProduct?.[0]?.transaction;
  
          // Extract storeId from the transaction's "from" property
          const storeId = firstTransaction?.from?.id;
          
          // Find store by the extracted ID
          const store = stores.find(s => s.id === storeId);
          
            
            return {
              ...selling,
              id: selling.id,
              storeId: storeId, 
              customerId: selling.customerId,
              ...selling,
              customerName: matchedCustomer 
              ? `${matchedCustomer.firstName} ${matchedCustomer.lastName}` 
              : selling.customer 
                ? `${selling.customer.firstName} ${selling.customer.lastName}` 
                : 'Unknown Customer',
              storeName: store ? store.name : 'Unknown Store',
              isPosted: selling.post,
              items: selling.sellingProduct?.map(sp => {
                const product = products.find(p => p.id === sp.transaction?.productId);
                
                return {
                  productId: sp.transaction?.productId,
                  productName: product ? product.name : 'Unknown Product',
                  productCode: product ? product.code : 'N/A',
                  quantity: sp.transaction?.quantity,
                  price: sp.transaction?.price
                };
              }) || []
            };
          });
            
          setFilteredResults(enhancedSellings);
          setTotalCount(response.totalOrders || 0);
        } else {
          setFilteredResults([]);
          setTotalCount(0);
        }
        setSearched(true);
        setIsLoading(false);
      }
    } catch (error) {
      // Only log and update state if not aborted
      if (error.name !== 'AbortError') {
        console.error('Error searching selling orders:', error);
        setFilteredResults([]);
        setTotalCount(0);
        setIsLoading(false);
      }
    }
  };

  const handleSearchClick = () => {
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
    onFilterChange("customerId", "");
    onFilterChange("storeId", "");
    onFilterChange("status", "");
    
    // Clear local search filters
    setSearchFilters({
      id: "",
      customerId: "",
      storeId: "",
      status: "",
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

  const handleViewClick = (selling) => {
    onViewSelling(selling);
    onClose();
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
    }
  };
  
  const handlePageClick = (pageNum) => {
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

  // Calculate total amount for a selling order
  const calculateTotalAmount = (items) => {
    if (!items || items.length === 0) return "0.00";
    
    const total = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
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
      if (i !== 1 && i !== totalPages) {
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
      <DialogTitle>Search Sales Orders</DialogTitle>
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
  options={customers}
  getOptionLabel={(option) => `${option.firstName} ${option.lastName}` || ""}
  value={customers.find((c) => c.id === searchFilters.customerId) || null}
  onChange={(_, newValue) => {
    const customerIdValue = newValue?.id || null; // Set to null if no value
    console.log("Selected customer ID:", customerIdValue);
    handleFilterChange("customerId", customerIdValue);
  }}
  renderInput={(params) => (
    <TextField {...params} label="Customer" size="small" />
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
<Autocomplete
  options={statusOptions}
  getOptionLabel={(option) => option.label}
  value={
    statusOptions.find((option) => option.value === searchFilters.status) || null
  }
  onChange={(_, newValue) =>
    handleFilterChange("status", newValue ? newValue.value : "")
  }
  renderInput={(params) => (
    <TextField 
      {...params} 
      label="Status" 
      size="small" 
      placeholder="Select Status"
    />
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
                No sales orders found matching your search criteria. 
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
                      <TableCell sx={styles.headerCell}>Customer</TableCell>
                      <TableCell sx={styles.headerCell}>Store</TableCell>
                      <TableCell sx={styles.headerCell}>Status</TableCell>
                      <TableCell sx={styles.headerCell}>Items</TableCell>
                      <TableCell sx={styles.headerCell}>Total Amount</TableCell>
                      <TableCell sx={styles.headerCell}>Posted</TableCell>
                      <TableCell sx={styles.headerCell}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((selling) => (
                      <TableRow
                        key={selling.id}
                        sx={styles.tableRow}
                        hover
                      >
                        <TableCell sx={styles.cell}>{selling.id}</TableCell>
                        <TableCell sx={styles.cell}>{formatDate(selling.date)}</TableCell>
                        <TableCell sx={styles.cell}>{selling.customerName}</TableCell>
                        <TableCell sx={styles.cell}>{selling.storeName}</TableCell>
                        <TableCell sx={styles.cell}>
                          <Box
                            sx={{
                              backgroundColor: 
                                selling.status === 'UNDER_REVIEW' ? theme.palette.warning.light :
                                selling.status === 'IN_PROGRESS' ? theme.palette.info.light :
                                selling.status === 'DONE' ? theme.palette.success.light :
                                theme.palette.grey[500],
                              color: 
                                selling.status === 'UNDER_REVIEW' ? theme.palette.warning.contrastText :
                                selling.status === 'IN_PROGRESS' ? theme.palette.info.contrastText :
                                selling.status === 'DONE' ? theme.palette.success.contrastText :
                                theme.palette.grey[50],
                              borderRadius: "4px",
                              px: 1,
                              py: 0.5,
                              display: "inline-block",
                            }}
                          >
                            {selling.status || 'UNKNOWN'}
                          </Box>
                        </TableCell>
                        <TableCell sx={styles.cell}>{selling.items?.length || 0}</TableCell>
                        <TableCell sx={styles.cell}>{calculateTotalAmount(selling.items)}</TableCell>
                        <TableCell sx={styles.cell}>
                          <Box
                            sx={{
                              backgroundColor: selling.isPosted
                                ? theme.palette.success.light
                                : theme.palette.warning.light,
                              color: selling.isPosted
                                ? theme.palette.success.contrastText
                                : theme.palette.warning.contrastText,
                              borderRadius: "4px",
                              px: 1,
                              py: 0.5,
                              display: "inline-block",
                            }}
                          >
                            {selling.isPosted ? "Posted" : "Not Posted"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewClick(selling)}
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

export default SellingSearchDialog;