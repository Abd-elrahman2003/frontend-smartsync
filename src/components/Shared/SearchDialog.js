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
} from "@mui/material";

const SearchDialog = ({ 
  open, 
  onClose, 
  filters, 
  onFilterChange, 
  onViewCategory,
  categoriesApi 
}) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch all categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchAllCategories();
    }
  }, [open]);

  const fetchAllCategories = async () => {
    setIsLoading(true);
    try {
      let pageNum = 1;
      let allData = [];
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `http://13.60.89.143:4500/api/v1/categories/${pageNum}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
          allData = [...allData, ...data.categories];
          pageNum++;
        } else {
          hasMore = false;
        }
      }

      setAllCategories(allData);
    } catch (error) {
      console.error('Error fetching all categories:', error);
    }
    setIsLoading(false);
  };

  const handleSearchClick = () => {
    const results = allCategories.filter(category => {
      const matchId = filters.id ? category.id.toString().startsWith(filters.id) : true;
      const matchName = !filters.name || category.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchIcon = !filters.icon || category.icon.toLowerCase().includes(filters.icon.toLowerCase());
      return matchId && matchName && matchIcon;
    });

    setFilteredResults(results);
    setSearched(true);
    setPage(0); // Reset to first page when new search is performed
  };

  const handleClearClick = () => {
    onFilterChange("id", "");
    onFilterChange("name", "");
    onFilterChange("icon", "");
    setFilteredResults([]);
    setSearched(false);
    setPage(0);
  };

  const handleClose = () => {
    handleClearClick();
    onClose();
  };

  const handleViewClick = (category) => {
    onViewCategory(category);
    onClose();
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredResults.slice(startIndex, endIndex);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Search Categories</DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", flexDirection: "row", gap: "20px", paddingTop: "16px" }}>
          <TextField
            type="number"
            label="Search by ID"
            value={filters.id || ""}
            onChange={(e) => onFilterChange("id", e.target.value)}
            fullWidth
          />
          <TextField
            type="text"
            label="Search by Name"
            value={filters.name || ""}
            onChange={(e) => onFilterChange("name", e.target.value)}
            fullWidth
          />
          <TextField
            type="text"
            label="Search by Icon"
            value={filters.icon || ""}
            onChange={(e) => onFilterChange("icon", e.target.value)}
            fullWidth
          />
        </div>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        )}

        {!isLoading && searched && filteredResults.length === 0 && (
          <Typography variant="h6" align="center" color="textSecondary" sx={{ marginTop: 2 }}>
            No matching categories found.
          </Typography>
        )}

        {!isLoading && filteredResults.length > 0 && (
          <Paper sx={{ marginTop: 2 }}>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#EB5800", color: "white" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#EB5800", color: "white" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#EB5800", color: "white" }}>Icon</TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#EB5800", color: "white" }}>View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentPageData().map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.icon}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewClick(category)}
                          sx={{
                            color: "#EB5800",
                            borderColor: "#EB5800",
                            "&:hover": { backgroundColor: "#EB5800", color: "white" }
                          }}
                        >
                          <Eye size={16} /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredResults.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                '.MuiTablePagination-select': {
                  color: '#EB5800',
                },
                '.MuiTablePagination-selectIcon': {
                  color: '#EB5800',
                },
              }}
            />
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", width: "100%" }}>
        <Button variant="outlined" onClick={handleClearClick} sx={{ width: "100px"}}>
          <X size={16} /> Clear
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSearchClick} 
          sx={{ width: "150px"}}
          disabled={isLoading}
        >
          <Search size={16} /> Search
        </Button>
        <Button variant="outlined" onClick={handleClose} sx={{ width: "100px"}}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;