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
import { useGetCategoriesQuery } from "../../Redux/Featuress/categories/categoriesApi";
import { useGetProductsQuery } from "../../Redux/Featuress/Products/ProductsApi";
import { useGetStoresQuery } from "../../Redux/Featuress/Store/storeApi";

const StockReportSearchDialog = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onSearch,
  isLoading, // Add this prop to indicate search in progress
}) => {
  const theme = useTheme();
  const [searchFilters, setSearchFilters] = useState({
    storeName: "",
    categoryName: "",
    itemName: "",
  });

  // Fetch categories, products, and stores data
  const { data: categoriesData = { categories: [] }, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: productsData = { products: [] }, isLoading: productsLoading } = useGetProductsQuery();
  const { data: storesData = { stores: [] }, isLoading: storesLoading } = useGetStoresQuery();

  // Extract data from API responses
  const categories = categoriesData.categories || [];
  const products = productsData.products || [];
  const stores = storesData.stores || [];

  // Reset filters when dialog opens
  useEffect(() => {
    if (open) {
      setSearchFilters({
        storeName: filters.storeName || "",
        categoryName: filters.categoryName || "",
        itemName: filters.itemName || "",
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
    // Call the new onSearch handler to submit search and keep dialog open until complete
    onSearch(searchFilters);
  };

  const handleClearClick = () => {
    // Clear local search filters
    setSearchFilters({
      storeName: "",
      categoryName: "",
      itemName: "",
    });
  };

  const isDataLoading = categoriesLoading || productsLoading || storesLoading;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      // Prevent closing by clicking outside when loading
      disableEscapeKeyDown={isLoading}
      disableBackdropClick={isLoading}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Search Stock Report
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Search Filters */}
        <Box sx={{ p: 1 }}>
          {isDataLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <Autocomplete
                  options={stores}
                  getOptionLabel={(option) => option.name || ""}
                  value={stores.find((s) => s.name === searchFilters.storeName) || null}
                  onChange={(_, newValue) =>
                    handleFilterChange("storeName", newValue ? newValue.name : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Store" fullWidth size="small" />
                  )}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name || ""}
                  value={categories.find((c) => c.name === searchFilters.categoryName) || null}
                  onChange={(_, newValue) =>
                    handleFilterChange("categoryName", newValue ? newValue.name : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Category" fullWidth size="small" />
                  )}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.name || ""}
                  value={products.find((p) => p.name === searchFilters.itemName) || null}
                  onChange={(_, newValue) => {
                    if (newValue && newValue.id) {
                      handleFilterChange("itemName", newValue.name);
                    } else {
                      handleFilterChange("itemName", "");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Product" fullWidth size="small" />
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

export default StockReportSearchDialog;