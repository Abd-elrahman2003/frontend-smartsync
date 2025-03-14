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
import { FaSearch, FaEye } from "react-icons/fa";
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
  const [returnPurchases, setReturnPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      cursor: "pointer",
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
      setPage(1);
    }
  }, [open, filters]);

  // Effect to trigger search when page changes
  useEffect(() => {
    if (open) {
      handleSearch();
    }
  }, [page, open]);

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

  // Search function
  const handleSearch = async () =
    setLoading(true);
    try {
      // Format the search parameters for the API
      const searchParams = {
        page,
        id: searchFilters.id,
      receiveId: searchFilters.receiveId,
      supplierId: searchFilters.supplierId,
      storeId: searchFilters.storeId, > {
      dateFrom: searchFilters.dateFrom,
      dateTo: searchFilters.dateTo,
      productId: searchFilters.productId,
      isPosted: searchFilters.isPosted
      };

      // Update the current page in parent component
      if (setCurrentPage) {
        setCurrentPage(page);
      }

      // Using the provided fetchReturnPurchases function
      const result = await fetchReturnPurchases(searchParams);
      
      if (result && result.returnPurchases) {
        setReturnPurchases(result.returnPurchases);
        setTotalPages(result.totalPages || 1);
      } else if (result && result.orders) {
        // Map the orders to match the expected format in the component
        const mappedPurchases = result.orders.map(order => ({
          id: order.id,
          receiveId: order.receiveId || order.purchaseHeaderId,
          date: order.date,
          supplierId: order.orgId, // Assuming orgId is equivalent to supplierId
          storeId: order.purchasereturnProduct?.[0]?.transaction?.fromId || order.storeId || "", 
          isPosted: order.post,
          note: order.note || "",
          // Create the items array from purchasereturnProduct
          items: (order.purchasereturnProduct || []).map(item => ({
            id: item.id || `item-${item.productId}-${Date.now()}`,
            productId: item.transaction?.productId || item.productId,
            productName: item.product?.name || "Unknown Product",
            productCode: item.product?.code || "N/A",
            quantity: item.transaction?.quantity || item.quantity,
            price: item.transaction?.price || item.price,
            times: (item.transaction?.quantity || item.quantity) * (item.transaction?.price || item.price)
          }))
        }));
        
        setReturnPurchases(mappedPurchases);
        setTotalPages(result.totalPages || 1);
      } else {
        setReturnPurchases([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching return purchases:", error);
      setReturnPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
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

  // Get supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.fullName : "Unknown";
  };

  // Get store name by ID
  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : "Unknown";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
                getOptionLabel={(option) => option.fullName}
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
                getOptionLabel={(option) => option.name}
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
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaSearch />}
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
                    <TableCell sx={styles.headerCell}>View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnPurchases.length > 0 ? (
                    returnPurchases.map((returnPurchase) => (
                      <TableRow
                        key={returnPurchase.id}
                        sx={styles.tableRow}
                        onClick={() => onViewReturnPurchase(returnPurchase)}
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
                          {returnPurchase.items
                            ? returnPurchase.items
                                .reduce((sum, item) => {
                                  const quantity = parseFloat(item.quantity) || 0;
                                  const price = parseFloat(item.price) || 0;
                                  return sum + quantity * price;
                                }, 0)
                                .toFixed(2)
                            : "0.00"}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReturnPurchase(returnPurchase);
                            }}
                            size="small"
                          >
                            <FaEye />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2">
                          No return purchases found. Try adjusting your search filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {returnPurchases.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Button
                  disabled={page === 1}
                  onClick={handlePrevPage}
                  variant="outlined"
                  size="small"
                  sx={{ mx: 1 }}
                >
                  Previous
                </Button>
                <Typography variant="body2">
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  disabled={page === totalPages}
                  onClick={handleNextPage}
                  variant="outlined"
                  size="small"
                  sx={{ mx: 1 }}
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnedPurchaseSearchDialog;