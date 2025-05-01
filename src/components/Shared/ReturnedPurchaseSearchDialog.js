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

const ReturnedPurchaseSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewReturnPurchase,
  suppliers = [],
  stores = [],
  products = [],
  fetchReturnPurchases,
  currentPage = 1,
  setCurrentPage
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    receiveId: "",
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
        receiveId: filters.receiveId || "",
        supplierId: filters.supplierId || "",
        storeId: filters.storeId || "",
        dateFrom: filters.dateFrom || "",
        dateTo: filters.dateTo || "",
        productId: filters.productId || "",
        isPosted: filters.isPosted || "",
      });
      // Don't reset currentPage here, as it's now controlled by parent
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
    
    console.log(`Fetching return purchases for page: ${pageNum}, rows: ${rowsLimit}`);
      
    try {
      const response = await fetchReturnPurchases({
        id: searchFilters.id,
        receiveId: searchFilters.receiveId,
        supplierId: searchFilters.supplierId,
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
        
        // Enhanced purchase return data mapping
        const mappedReturnPurchases = response.orders.map(returnPurchase => {
          // Find associated receive details
          const receive = returnPurchase.receive || {};
          const supplier = suppliers.find(s => s.id === receive.supplierId);
          const store = stores.find(s => s.id === receive.storeId);
          
          return {
            id: returnPurchase.id,
            receiveId: returnPurchase.receiveId,
            date: returnPurchase.date,
            supplierId: receive.supplierId,
            supplierName: supplier ? supplier.fullName : 'Unknown Supplier',
            storeId: receive.storeId,
            storeName: store ? store.name : 'Unknown Store',
            isPosted: returnPurchase.post,
            note: returnPurchase.note || "",
            items: (returnPurchase.purchasereturnProduct || []).map(item => {
              const product = products.find(p => p.id === item.transaction.productId);
              
              return {
                id: item.transactionId,
                productId: item.transaction.productId,
                productName: product ? product.name : "Unknown Product",
                productCode: product ? product.code : "N/A",
                quantity: item.transaction.quantity,
                price: item.transaction.price,
                times: item.transaction.quantity * item.transaction.price
              };
            })
          };
        });
        
        setFilteredResults(mappedReturnPurchases);
        setTotalCount(response.totalOrders || 0);
        setTotalPages(response.totalPages || 1);
        
        setSearched(true);
        setIsLoading(false);
      }
    } catch (error) {
      // Only log and update state if not aborted
      if (error.name !== 'AbortError') {
        console.error('Error searching return purchases:', error);
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
    onFilterChange("receiveId", "");
    onFilterChange("supplierId", "");
    onFilterChange("storeId", "");
    onFilterChange("dateFrom", "");
    onFilterChange("dateTo", "");
    onFilterChange("productId", "");
    onFilterChange("isPosted", "");
    
    // Clear local search filters
    setSearchFilters({
      id: "",
      receiveId: "",
      supplierId: "",
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

  const handleViewClick = (returnPurchase) => {
    onViewReturnPurchase(returnPurchase);
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

  // Get supplier name by ID
  const getSupplierName = (supplierId) => {
    console.log("Looking for supplier with ID:", supplierId);
    console.log("Available suppliers:", suppliers);
    // Try to find by orgId first (since that's what's being used in mapping)
    const supplier = suppliers.find((s) => s.orgId === supplierId || s.id === supplierId);
    console.log("Found supplier:", supplier);
    return supplier ? supplier.fullName : "Unknown";
  };

  // Get store name by ID
  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : "Unknown";
  };

  // Calculate total amount for a return purchase
  const calculateTotalAmount = (returnPurchase) => {
    if (!returnPurchase.items || returnPurchase.items.length === 0) return "0.00";
    
    const total = returnPurchase.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + quantity * price;
    }, 0);
    
    return total.toFixed(2);
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
      <DialogTitle>Search Return Purchases</DialogTitle>
      <DialogContent>
        {/* Search Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Return Purchase ID"
                value={searchFilters.id}
                onChange={(e) => handleFilterChange("id", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Received Purchase ID"
                value={searchFilters.receiveId}
                onChange={(e) => handleFilterChange("receiveId", e.target.value)}
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
                No return purchases found matching your search criteria. 
                Try adjusting your filters or search terms.
              </Typography>
            )}

            {filteredResults.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={styles.headerCell}>ID</TableCell>
                      <TableCell sx={styles.headerCell}>Receive ID</TableCell>
                      <TableCell sx={styles.headerCell}>Supplier</TableCell>
                      <TableCell sx={styles.headerCell}>Store</TableCell>
                      <TableCell sx={styles.headerCell}>Date</TableCell>
                      <TableCell sx={styles.headerCell}>Items</TableCell>
                      <TableCell sx={styles.headerCell}>Total Amount</TableCell>
                      <TableCell sx={styles.headerCell}>Status</TableCell>
                      <TableCell sx={styles.headerCell}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((returnPurchase) => (
                      <TableRow
                        key={returnPurchase.id}
                        sx={styles.tableRow}
                        hover
                      >
                        <TableCell sx={styles.cell}>{returnPurchase.id}</TableCell>
                        <TableCell sx={styles.cell}>{returnPurchase.receiveId}</TableCell>
                        <TableCell sx={styles.cell}>
                          {getSupplierName(returnPurchase.supplierId)}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          {getStoreName(returnPurchase.storeId)}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          {formatDate(returnPurchase.date)}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          {returnPurchase.items?.length || 0}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          {calculateTotalAmount(returnPurchase)}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          <Box
                            sx={{
                              backgroundColor: returnPurchase.isPosted
                                ? theme.palette.success.light
                                : theme.palette.warning.light,
                              color: returnPurchase.isPosted
                                ? theme.palette.success.contrastText
                                : theme.palette.warning.contrastText,
                              borderRadius: "4px",
                              px: 1,
                              py: 0.5,
                              display: "inline-block",
                            }}
                          >
                            {returnPurchase.isPosted ? "Posted" : "Not Posted"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewClick(returnPurchase)}
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

export default ReturnedPurchaseSearchDialog;