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

const PurchaseSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onViewPurchase,
  suppliers,
  stores,
  products,
  fetchPurchases,
}) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Local state to track Autocomplete values
  const [supplierValue, setSupplierValue] = useState(null);
  const [storeValue, setStoreValue] = useState(null);
  
  // Local state for input values
  const [supplierInputValue, setSupplierInputValue] = useState("");
  const [storeInputValue, setStoreInputValue] = useState("");
  
  // Ref for tracking fetch abort controller
  const [abortController, setAbortController] = useState(null);

  // Update local state when filters change or component mounts
  useEffect(() => {
    setSupplierValue(getSupplierById(filters.supplierId));
    setStoreValue(getStoreById(filters.storeId));
  }, [filters.supplierId, filters.storeId, open]);

  // Search for purchases when dialog opens
  useEffect(() => {
    if (open && (filters.id || filters.supplierId || filters.storeId)) {
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
    try {
      const response = await fetchPurchases({
        id: filters.id,
        supplierId: filters.supplierId,
        storeId: filters.storeId,
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        signal: controller.signal // Pass the abort signal
      });

      // Make sure we're not already aborted before processing results
      if (!controller.signal.aborted) {
        // Updated to match the actual API response structure
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
            };
          });
          
          setFilteredResults(enhancedPurchases);
          setTotalCount(response.totalOrders || enhancedPurchases.length);
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
        console.error('Error searching purchases:', error);
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
    onFilterChange("supplierId", "");
    onFilterChange("storeId", "");
    
    // Clear local Autocomplete values
    setSupplierValue(null);
    setStoreValue(null);
    
    // Clear input values for Autocomplete fields
    setSupplierInputValue("");
    setStoreInputValue("");
    
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

  const handleViewClick = (purchase) => {
    const transformedPurchase = {
      ...purchase,
      date: purchase.date ? new Date(purchase.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: purchase.purchaseProduct.map(pp => {
        // Find the product name from the products prop
        const product = products?.find(p => p.id === pp.transaction.productId);
        
        return {
          productId: pp.transaction.productId,
          productName: product ? product.name : 'Unknown Product',
          productCode: product ? product.code : 'N/A',
          quantity: pp.transaction.quantity,
          price: pp.transaction.price
        };
      })
    };
    
    onViewPurchase(transformedPurchase);
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
      
      fetchPurchases({
        id: filters.id,
        supplierId: filters.supplierId,
        storeId: filters.storeId,
        page: newPage + 1,
        limit: rowsPerPage,
        signal: controller.signal
      }).then(response => {
        if (!controller.signal.aborted && response && response.orders) {
          const enhancedPurchases = response.orders.map((purchase) => {
            const supplier = suppliers.find(s => s.id === purchase.supplierId);
            const store = stores.find(s => s.id === purchase.storeId);
            
            return {
              ...purchase,
              supplierName: supplier ? supplier.fullName : 'Unknown Supplier',
              storeName: store ? store.name : 'Unknown Store',
              isPosted: purchase.post
            };
          });
          
          setFilteredResults(enhancedPurchases);
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
      
      fetchPurchases({
        id: filters.id,
        supplierId: filters.supplierId,
        storeId: filters.storeId,
        page: 1,
        limit: newRowsPerPage,
        signal: controller.signal
      }).then(response => {
        if (!controller.signal.aborted && response && response.orders) {
          const enhancedPurchases = response.orders.map((purchase) => {
            const supplier = suppliers.find(s => s.id === purchase.supplierId);
            const store = stores.find(s => s.id === purchase.storeId);
            
            return {
              ...purchase,
              supplierName: supplier ? supplier.fullName : 'Unknown Supplier',
              storeName: store ? store.name : 'Unknown Store',
              isPosted: purchase.post
            };
          });
          
          setFilteredResults(enhancedPurchases);
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

  // Get supplier object by ID
  const getSupplierById = (id) => {
    return suppliers.find(supplier => supplier.id === id) || null;
  };

  // Get store object by ID
  const getStoreById = (id) => {
    return stores.find(store => store.id === id) || null;
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Search Purchase Orders</DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", flexDirection: "row", gap: "20px", paddingTop: "16px" }}>
          <TextField
            type="text"
            label="Order ID"
            value={filters.id || ""}
            onChange={(e) => onFilterChange("id", e.target.value)}
            fullWidth
          />
          
          <Autocomplete
            id="supplier-autocomplete"
            options={suppliers}
            getOptionLabel={(option) => option.fullName || ""}
            value={supplierValue}
            onChange={(event, newValue) => {
              setSupplierValue(newValue);
              onFilterChange("supplierId", newValue ? newValue.id : "");
            }}
            inputValue={supplierInputValue}
            onInputChange={(event, newInputValue) => {
              setSupplierInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Supplier" fullWidth />
            )}
            fullWidth
            isOptionEqualToValue={(option, value) => option.id === value.id}
            freeSolo
            clearOnBlur={false}
            clearOnEscape
          />
          
          <Autocomplete
            id="store-autocomplete"
            options={stores}
            getOptionLabel={(option) => option.name || ""}
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
              <TextField {...params} label="Store" fullWidth />
            )}
            fullWidth
            isOptionEqualToValue={(option, value) => option.id === value.id}
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
            No purchase orders found matching your search criteria. 
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
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Store</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#1976d2", color: "white" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((purchase) => (
                    <TableRow key={purchase.id} hover>
                      <TableCell>{purchase.id}</TableCell>
                      <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>{purchase.storeName}</TableCell>
                      <TableCell>
                        <span style={{
                          backgroundColor: purchase.isPosted ? '#4caf50' : '#ff9800',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {purchase.isPosted ? 'POSTED' : 'UNPOSTED'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewClick(purchase)}
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

export default PurchaseSearchDialog;