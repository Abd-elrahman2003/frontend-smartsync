import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Search, X, Eye } from "lucide-react";
import Sidebar from "../components/Shared/Sidebar";
import CategoriesTable from "../components/Shared/CategoriesTable";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import Pagination from "../components/Common/Pagination";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../Redux/Featuress/categories/categoriesApi";
import { toast } from "react-toastify";

// SearchDialog Component
const SearchDialog = ({ 
  open, 
  onClose, 
  filters, 
  onFilterChange, 
  onViewCategory,
  categories 
}) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
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
    setPage(0);
    setIsLoading(false);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

// Main Category component
const Category = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newItem, setNewItem] = useState({
    name: "",
    icon: "",
  });
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    icon: ''
  });
  const [filteredData, setFilteredData] = useState([]);
  
  const { 
    data: categoriesData = {}, 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetCategoriesQuery(currentPage, {
    refetchOnMountOrArgChange: true
  });

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const columns = ["id", "name", "icon"];

  const handleAddClick = () => setOpenAddDialog(true);
  
  const handleViewCategory = (category) => {
    setFilteredData([category]); // Show only the selected category in the main table
  };

  const handleResetView = () => {
    setFilteredData(categoriesData?.categories || []);
  };

  const handleAddSubmit = async () => {
    if (!newItem.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await createCategory(newItem).unwrap();
      setOpenAddDialog(false);
      setNewItem({
        name: "",
        icon: "",
      });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create category.");
    }
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
    setNewItem({ name: "", icon: "" });
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isFetching && categoriesData?.categories) {
      setFilteredData(categoriesData.categories);
    }
  }, [isFetching, categoriesData]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: theme.palette.background.default,
    }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Box sx={{ flex: 1, padding: theme.spacing(15), overflow: "auto" }}>
          <Buttons
            onAddClick={handleAddClick}
            onSearchClick={() => setSearchDialogOpen(true)}
            onRefreshClick={refetch}
          />
          {filteredData.length === 1 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleResetView}
                sx={{
                  backgroundColor: "#EB5800",
                  color: "white",
                  "&:hover": { backgroundColor: "#c94700" },
                }}
              >
                Show All Categories
              </Button>
            </Box>
          )}
          <CategoriesTable
            columns={columns}
            data={filteredData}
            onEdit={updateCategory}
            onDelete={deleteCategory}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={categoriesData?.totalPages || 1}
            onNext={() => setCurrentPage(prev => prev + 1)}
            onPrev={() => setCurrentPage(prev => prev - 1)}
          />
        </Box>
      </Box>
      <Footer />

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            required
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Icon"
            type="text"
            fullWidth
            value={newItem.icon}
            onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit} 
            color="primary"
            disabled={!newItem.name.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onViewCategory={handleViewCategory}
        categories={categoriesData?.categories || []}
      />
    </Box>
  );
};

export default Category;