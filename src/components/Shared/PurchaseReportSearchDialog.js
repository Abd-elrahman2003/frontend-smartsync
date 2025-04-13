import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Box,
  Autocomplete,
  IconButton
} from "@mui/material";
import { Search, X } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useGetProductsQuery } from "../../Redux/Featuress/Products/ProductsApi";

const PurchaseReportSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onSearch,
  isLoading,
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    code: "",
    name: "",
  });

  // Fetch products data for autocomplete
  const { data: productsData = { products: [] }, isLoading: productsLoading } = useGetProductsQuery();

  // Extract products from API response
  const products = productsData.products || [];

  // Reset filters when dialog opens
  useEffect(() => {
    if (open) {
      setSearchFilters({
        code: filters.code || "",
        name: filters.name || "",
      });
    }
  }, [open, filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchClick = () => {
    // Call the onSearch handler to submit search and keep dialog open until complete
    onSearch(searchFilters);
  };

  const handleClearClick = () => {
    // Clear local search filters
    setSearchFilters({
      code: "",
      name: "",
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      // Prevent closing by clicking outside when loading
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Search Purchase Report
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Search Filters */}
        <Box sx={{ p: 1 }}>
          {productsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.code || ""}
                  value={products.find((p) => p.code === searchFilters.code) || null}
                  onChange={(_, newValue) => {
                    if (newValue && newValue.code) {
                      handleFilterChange("code", newValue.code);
                    } else {
                      handleFilterChange("code", "");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Product Code" fullWidth size="small" />
                  )}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.name || ""}
                  value={products.find((p) => p.name === searchFilters.name) || null}
                  onChange={(_, newValue) => {
                    if (newValue && newValue.name) {
                      handleFilterChange("name", newValue.name);
                    } else {
                      handleFilterChange("name", "");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Product Name" fullWidth size="small" />
                  )}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleClearClick}
                  startIcon={<X size={16} />}
                  disabled={isLoading}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Search size={16} />}
                  onClick={handleSearchClick}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseReportSearchDialog;