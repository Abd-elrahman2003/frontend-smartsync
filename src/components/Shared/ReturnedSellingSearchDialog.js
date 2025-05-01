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

const ReturnedSellingSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewReturnSelling,
  customers = [],
  stores = [],
  products = [],
  fetchReturnSellings,
  currentPage = 1,
  setCurrentPage
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    saleId: "",
    customerId: "",
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
  const [abortController, setAbortController] = useState(null);

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

  useEffect(() => {
    if (open) {
      setSearchFilters({
        id: filters.id || "",
        saleId: filters.saleId || "",
        customerId: filters.customerId || "",
        storeId: filters.storeId || "",
        dateFrom: filters.dateFrom || "",
        dateTo: filters.dateTo || "",
        productId: filters.productId || "",
        isPosted: filters.isPosted || "",
      });
    }
  }, [open, filters]);

  useEffect(() => {
    if (totalCount > 0) {
      const calculatedPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      setTotalPages(calculatedPages);
    } else {
      setTotalPages(1);
    }
  }, [totalCount, rowsPerPage]);

  useEffect(() => {
    setTimeout(() => {
      fetchPageData(currentPage, rowsPerPage);
    }, 100);
  }, [currentPage]);

  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (onFilterChange) {
      onFilterChange(field, value);
    }
  };

  const fetchPageData = async (pageNum, rowsLimit) => {
    if (abortController) {
      abortController.abort();
    }
      
    const controller = new AbortController();
    setAbortController(controller);
      
    setIsLoading(true);
    
    try {
      const response = await fetchReturnSellings({
        id: searchFilters.id,
        saleId: searchFilters.saleId,
        customerId: searchFilters.customerId,
        storeId: searchFilters.storeId,
        dateFrom: searchFilters.dateFrom,
        dateTo: searchFilters.dateTo,
        productId: searchFilters.productId,
        isPosted: searchFilters.isPosted,
        page: pageNum,
        limit: rowsLimit,
        signal: controller.signal
      });
        
      if (!controller.signal.aborted) {
        const mappedReturnSellings = response.orders.map(returnSelling => {
          const sale = returnSelling.sale || {};
          const customer = customers.find(c => c.id === sale.customerId);
          const store = stores.find(s => s.id === sale.storeId);
          
          return {
            id: returnSelling.id,
            saleId: returnSelling.saleId,
            date: returnSelling.date,
            customerId: sale.customerId,
            customerName: customer ? customer.fullName : 'Unknown Customer',
            storeId: sale.storeId,
            storeName: store ? store.name : 'Unknown Store',
            isPosted: returnSelling.post,
            note: returnSelling.note || "",
            items: (returnSelling.returnSaleProduct || []).map(item => {
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
        
        setFilteredResults(mappedReturnSellings);
        setTotalCount(response.totalOrders || 0);
        setTotalPages(response.totalPages || 1);
        
        setSearched(true);
        setIsLoading(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error searching return sellings:', error);
        setFilteredResults([]);
        setTotalCount(0);
        setIsLoading(false);
      }
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    setSearched(true);
    fetchPageData(1, rowsPerPage);
  };

  const handleClearClick = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    if (isLoading) {
      setIsLoading(false);
    }
    
    onFilterChange("id", "");
    onFilterChange("saleId", "");
    onFilterChange("customerId", "");
    onFilterChange("storeId", "");
    onFilterChange("dateFrom", "");
    onFilterChange("dateTo", "");
    onFilterChange("productId", "");
    onFilterChange("isPosted", "");
    
    setSearchFilters({
      id: "",
      saleId: "",
      customerId: "",
      storeId: "",
      dateFrom: "",
      dateTo: "",
      productId: "",
      isPosted: "",
    });
    
    setFilteredResults([]);
    setSearched(false);
    setCurrentPage(1);
  };

  const handleClose = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    onClose();
  };

  const handleViewClick = (returnSelling) => {
    onViewReturnSelling(returnSelling);
    onClose();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const calculateTotalAmount = (returnSelling) => {
    if (!returnSelling.items || returnSelling.items.length === 0) return "0.00";
    
    const total = returnSelling.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + quantity * price;
    }, 0);
    
    return total.toFixed(2);
  };
  
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    
    pageNumbers.push(1);
    
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }
    
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
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
      <DialogTitle>Search Return Sales</DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Return Sale ID"
                value={searchFilters.id}
                onChange={(e) => handleFilterChange("id", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Sale ID"
                value={searchFilters.saleId}
                onChange={(e) => handleFilterChange("saleId", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.fullName || ""}
                value={customers.find((c) => c.id === searchFilters.customerId) || null}
                onChange={(_, newValue) =>
                  handleFilterChange("customerId", newValue ? newValue.id : "")
                }
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
                No return sales found matching your search criteria. 
                Try adjusting your filters or search terms.
              </Typography>
            )}

            {filteredResults.length > 0 && (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell sx={styles.headerCell}>ID</TableCell>
                      <TableCell sx={styles.headerCell}>Sale ID</TableCell>
                      <TableCell sx={styles.headerCell}>Customer</TableCell>
                      <TableCell sx={styles.headerCell}>Store</TableCell>
                      <TableCell sx={styles.headerCell}>Date</TableCell>
                      <TableCell sx={styles.headerCell}>Items</TableCell>
                      <TableCell sx={styles.headerCell}>Total Amount</TableCell>
                      <TableCell sx={styles.headerCell}>Status</TableCell>
                      <TableCell sx={styles.headerCell}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((returnSelling) => (
                      <TableRow
                        key={returnSelling.id}
                        sx={styles.tableRow}
                        hover
                      >
                        <TableCell sx={styles.cell}>{returnSelling.id}</TableCell>
                        <TableCell sx={styles.cell}>{returnSelling.saleId}</TableCell>
                        <TableCell sx={styles.cell}>{returnSelling.customerName}</TableCell>
                        <TableCell sx={styles.cell}>{returnSelling.storeName}</TableCell>
                        <TableCell sx={styles.cell}>
                          {formatDate(returnSelling.date)}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          {returnSelling.items?.length || 0}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          {calculateTotalAmount(returnSelling)}
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          <Box
                            sx={{
                              backgroundColor: returnSelling.isPosted
                                ? theme.palette.success.light
                                : theme.palette.warning.light,
                              color: returnSelling.isPosted
                                ? theme.palette.success.contrastText
                                : theme.palette.warning.contrastText,
                              borderRadius: "4px",
                              px: 1,
                              py: 0.5,
                              display: "inline-block",
                            }}
                          >
                            {returnSelling.isPosted ? "Posted" : "Not Posted"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewClick(returnSelling)}
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

export default ReturnedSellingSearchDialog;