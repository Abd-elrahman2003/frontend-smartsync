// SearchDialog.jsx
import React, { useState } from "react";
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
  Paper,
  Typography
} from "@mui/material";

const SearchDialog = ({ open, onClose, filters, onFilterChange, onSearch, categories, onViewCategory }) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearchClick = () => {
    const results = categories.filter(category => {
      const matchId = filters.id ? category.id.toString().startsWith(filters.id) : true;
      const matchName = filters.name ? category.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
      const matchIcon = filters.icon ? category.icon.toLowerCase().includes(filters.icon.toLowerCase()) : true;
      return matchId && matchName && matchIcon;
    });

    setFilteredResults(results);
    setSearched(true);
  };

  const handleClearClick = () => {
    onFilterChange("id", "");
    onFilterChange("name", "");
    onFilterChange("icon", "");
    setFilteredResults([]);
    setSearched(false);
  };

  const handleClose = () => {
    handleClearClick();
    onClose();
  };

  const handleViewClick = (category) => {
    onViewCategory(category);
    onClose();
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

        {searched && filteredResults.length === 0 && (
          <Typography variant="h6" align="center" color="textSecondary" sx={{ marginTop: 2 }}>
            No matching categories found.
          </Typography>
        )}

        {filteredResults.length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 2, maxHeight: 300, overflowY: "auto" }}>
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
                {filteredResults.map((category) => (
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
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", width: "100%" }}>
        <Button variant="outlined" onClick={handleClearClick} sx={{ width: "100px"}}>
          <X size={16} /> Clear
        </Button>
        <Button variant="contained" onClick={handleSearchClick} sx={{ width: "150px"}}>
          <Search size={16} /> Search
        </Button>
        <Button variant="outlined" onClick={handleClose} sx={{ width: "100px"}}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;