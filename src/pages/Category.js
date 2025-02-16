//Category.js
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../components/Shared/Sidebar";
import CategoriesTable from "../components/Shared/CategoriesTable";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import Pagination from "../components/Common/Pagination";
import SearchDialog from "../components/Shared/SearchDialog";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../Redux/Featuress/categories/categoriesApi";
import { toast } from "react-toastify";

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

  const handleSearch = () => {
    const filtered = categoriesData?.categories?.filter(category => {
      const matchId = !filters.id || category.id.toString() === filters.id;
      const matchName = !filters.name || category.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchIcon = !filters.icon || category.icon.toLowerCase().includes(filters.icon.toLowerCase());
      return matchId && matchName && matchIcon;
    });
    
    setFilteredData(filtered || []);
    setSearchDialogOpen(false);
  };
  

  const handleClearFilters = () => {
    setFilters({ id: '', name: '', icon: '' });
    setFilteredData(categoriesData?.categories || []);
    setSearchDialogOpen(false);
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
        "&:hover": { backgroundColor: "#c94700" }, // لون أغمق عند التحويم
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
        onSearch={handleSearch}
        onClear={handleClearFilters}
        categories={categoriesData?.categories || []}
        onViewCategory={handleViewCategory}
      />
    </Box>
  );
};

export default Category;  