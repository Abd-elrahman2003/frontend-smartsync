import React, { useState, useEffect } from "react";
import { Search, X, Eye } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Paper,
  Typography,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

const SellingSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewSelling,
  customers,
  stores,
  products,
  fetchSellingOrders,
}) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Local state to track Autocomplete values
  const [customerValue, setCustomerValue] = useState(null);
  const [storeValue, setStoreValue] = useState(null);
  const [statusValue, setStatusValue] = useState(null);
  
  // Local state for input values
  const [customerInputValue, setCustomerInputValue] = useState("");
  const [storeInputValue, setStoreInputValue] = useState("");
  const [statusInputValue, setStatusInputValue] = useState("");
  
  // Status options
  const statusOptions = ["UNDER_REVIEW", "IN_PROGRESS", "DONE"];
  
  // Ref for tracking fetch abort controller
  const [abortController, setAbortController] = useState(null);

  // Update local state when filters change or component mounts
  useEffect(() => {
    setCustomerValue(getCustomerById(filters.customerId));
    setStoreValue(getStoreById(filters.storeId));
    setStatusValue(filters.status || null);
  }, [filters.customerId, filters.storeId, filters.status, open]);

  // Search for selling orders when dialog opens
  useEffect(() => {
    if (open && (filters.id || filters.customerId || filters.storeId || filters.status)) {
      handleSearchClick();
    }
    
    // Clean up any pending fetch on unmount
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [open]);

  const handleSearchClick = async () => {
    // Cancel any pending fetch first
    if (abortController) {
      abortController.abort();
    }
    
    // Create a new AbortController
    const controller = new AbortController();
    setAbortController(controller);
    
    setIsLoading(true);
    setSearched(true);
    
    try {
      const response = await fetchSellingOrders({
        id: filters.id || undefined,
        customerId: filters.customerId || undefined,
        storeId: filters.storeId || undefined,
        status: filters.status || undefined,
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        signal: controller.signal // Pass the abort signal
      });

      // Make sure we're not already aborted before processing results
      if (!controller.signal.aborted) {
        if (response && response.orders) {
          // Enhance selling orders with customer and store names
          const enhancedSellings = response.orders.map((selling) => {
            const customer = customers && customers.length > 0 
              ? customers.find(c => c.id === selling.customerId) 
              : null;
            const store = stores && stores.length > 0 
              ? stores.find(s => s.id === selling.storeId) 
              : null;
            
            return {
              ...selling,
              customerName: customer ? customer.fullName : 'Unknown Customer',
              storeName: store ? store.name : '',
              isPosted: selling.post, // Using 'post' field for status
              Status: selling.status,
              items: selling.sellingProduct?.map(sp => {
                const product = products && products.length > 0 
                  ? products.find(p => p.id === sp.transaction?.productId) 
                  : null;
                
                return {
                  id: sp.transaction?.id,
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
          setTotalCount(response.totalOrders || enhancedSellings.length);
        } else {
          setFilteredResults([]);
          setTotalCount(0);
        }
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
    
    // Clear local Autocomplete values
    setCustomerValue(null);
    setStoreValue(null);
    setStatusValue(null);
    
    // Clear input values for Autocomplete fields
    setCustomerInputValue("");
    setStoreInputValue("");
    setStatusInputValue("");
    
    setFilteredResults([]);
    setSearched(false);
    setPage(0);
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
    const transformedSelling = {
      ...selling,
      date: selling.date ? new Date(selling.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: selling.items
    };
    
    onViewSelling(transformedSelling);
    onClose();
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Fetch new data when page changes
    if (searched) {
      // Cancel any pending fetch
      if (abortController) {
        abortController.abort();
      }
      
      // Create new controller
      const controller = new AbortController();
      setAbortController(controller);
      
      setIsLoading(true);
      
      fetchSellingOrders({
        id: filters.id || undefined,
        customerId: filters.customerId || undefined,
        storeId: filters.storeId || undefined,
        status: filters.status || undefined,
        page: newPage + 1, // Use newPage directly instead of relying on state
        limit: rowsPerPage,
        signal: controller.signal
      }).then(response => {
        if (!controller.signal.aborted && response && response.orders) {
          const enhancedSellings = response.orders.map((selling) => {
            const customer = customers && customers.length > 0 
              ? customers.find(c => c.id === selling.customerId) 
              : null;
            const store = stores && stores.length > 0 
              ? stores.find(s => s.id === selling.storeId) 
              : null;
            
            return {
              ...selling,
              customerName: customer ? customer.fullName : 'Unknown Customer',
              storeName: store ? store.name : '',
              isPosted: selling.post,
              items: selling.sellingProduct?.map(sp => {
                const product = products && products.length > 0 
                  ? products.find(p => p.id === sp.transaction?.productId) 
                  : null;
                
                return {
                  id: sp.transaction?.id,
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
          setIsLoading(false);
        }
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching page data:', error);
          setIsLoading(false);
        }
      });
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    
    // Fetch new data with updated rows per page
    if (searched) {
      // Cancel any pending fetch
      if (abortController) {
        abortController.abort();
      }
      
      // Create new controller
      const controller = new AbortController();
      setAbortController(controller);
      
      setIsLoading(true);
      
      fetchSellingOrders({
        id: filters.id || undefined,
        customerId: filters.customerId || undefined,
        storeId: filters.storeId || undefined,
        status: filters.status || undefined,
        page: 1, // First page when changing rows per page
        limit: newRowsPerPage, // Use newRowsPerPage directly
        signal: controller.signal
      }).then(response => {
        if (!controller.signal.aborted && response && response.orders) {
          const enhancedSellings = response.orders.map((selling) => {
            const customer = customers && customers.length > 0 
              ? customers.find(c => c.id === selling.customerId) 
              : null;
            const store = stores && stores.length > 0 
              ? stores.find(s => s.id === selling.storeId) 
              : null;
            
            return {
              ...selling,
              customerName: customer ? customer.fullName : 'Unknown Customer',
              storeName: store ? store.name : '',
              isPosted: selling.post,
              items: selling.sellingProduct?.map(sp => {
                const product = products && products.length > 0 
                  ? products.find(p => p.id === sp.transaction?.productId) 
                  : null;
                
                return {
                  id: sp.transaction?.id,
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
          setIsLoading(false);
        }
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching rows per page data:', error);
          setIsLoading(false);
        }
      });
    }
  };

  // Get customer object by ID
  const getCustomerById = (id) => {
    if (!id || !customers || !customers.length) return null;
    return customers.find(customer => customer.id === id) || null;
  };

  // Get store object by ID
  const getStoreById = (id) => {
    if (!id || !stores || !stores.length) return null;
    return stores.find(store => store.id === id) || null;
  };

  // Calculate total value for each selling order
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Search Sales Orders</DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", flexDirection: "row", gap: "20px", paddingTop: "16px", flexWrap: "wrap" }}>
          <TextField
            type="text"
            label="Order ID"
            value={filters.id || ""}
            onChange={(e) => onFilterChange("id", e.target.value)}
            style={{ flex: "1 1 150px" }}
          />
          
          <Autocomplete
            id="customer-autocomplete"
            options={customers || []}
            getOptionLabel={(option) => option?.fullName || ""}
            value={customerValue}
            onChange={(event, newValue) => {
              setCustomerValue(newValue);
              onFilterChange("customerId", newValue ? newValue.id : "");
            }}
            inputValue={customerInputValue}
            onInputChange={(event, newInputValue) => {
              setCustomerInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Customer" />
            )}
            style={{ flex: "1 1 150px" }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            freeSolo
            clearOnBlur={false}
            clearOnEscape
          />
          
          <Autocomplete
            id="store-autocomplete"
            options={stores || []}
            getOptionLabel={(option) => option?.name || ""}
            value={storeValue}
            onChange={(event, newValue) => {
              setStoreValue(newValue);
              onFilterChange("storeId", newValue ? newValue.id : "");
            }}
            inputValue={storeInputValue}
            onInputChange={(event, newInputValue) => {
              setStoreInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Store" />
            )}
            style={{ flex: "1 1 150px" }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            freeSolo
            clearOnBlur={false}
            clearOnEscape
          />
          
          <Autocomplete
            id="status-autocomplete"
            options={statusOptions}
            value={statusValue}
            onChange={(event, newValue) => {
              setStatusValue(newValue);
              onFilterChange("status", newValue || "");
            }}
            inputValue={statusInputValue}
            onInputChange={(event, newInputValue) => {
              setStatusInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Status" />
            )}
            style={{ flex: "1 1 150px" }}
            freeSolo
            clearOnBlur={false}
            clearOnEscape
          />
        </div>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        )}

        {!isLoading && searched && filteredResults.length === 0 && (
          <Typography 
            variant="h6" 
            align="center" 
            color="textSecondary" 
            sx={{ 
              marginTop: 2, 
              padding: 3, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 2 
            }}
          >
            No sales orders found matching your search criteria. 
            Try adjusting your filters or search terms.
          </Typography>
        )}

        {!isLoading && filteredResults.length > 0 && (
          <Paper sx={{ marginTop: 2 }}>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Posted?</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Total Value</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((selling) => (
                    <TableRow key={selling.id} hover>
                      <TableCell>{selling.id}</TableCell>
                      <TableCell>{new Date(selling.date).toLocaleDateString()}</TableCell>
                      <TableCell>{selling.customerId}</TableCell>
                      <TableCell>
                        <span style={{
                          backgroundColor: selling.isPosted ? '#4caf50' : '#ff9800',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {selling.isPosted ? 'POSTED' : 'UNPOSTED'}
                        </span>
                      </TableCell>
                      <TableCell> 
                      <span style={{
                          backgroundColor: 
                            selling.Status === 'UNDER_REVIEW' ? '#4caf50' : 
                            selling.Status === 'IN_PROGRESS' ? '#ff9800' :
                            selling.Status === 'DONE' ? '#f44336':
                            selling.Status === 'PROCESSING' ? '#2196f3' : '#757575',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                        {selling.Status || 'UNKNOWN'}
                        </span>
                        </TableCell>
                      <TableCell>{selling.items?.length || 0}</TableCell>
                      <TableCell>
                        {calculateOrderTotal(selling.items).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewClick(selling)}
                          startIcon={<Eye size={16} />}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
        <Button 
          variant="outlined" 
          onClick={handleClearClick} 
          startIcon={<X size={16} />}
        >
          Clear
        </Button>
        <div>
          <Button 
            variant="contained" 
            onClick={handleSearchClick} 
            startIcon={<Search size={16} />}
            disabled={isLoading}
            sx={{ mr: 1 }}
          >
            Search
          </Button>
          <Button variant="outlined" onClick={handleClose}>Close</Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default SellingSearchDialog;