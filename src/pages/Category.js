// Category.js
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
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newItem, setNewItem] = useState({
    name: "",
    icon: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchClick = () => setOpenSearchDialog(true);

  const handleSearchSubmit = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = categoriesData?.categories?.filter((category) =>
      Object.values(category).some((value) =>
        value != null && value.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered || []);
    setOpenSearchDialog(false);
  };

  const handleAddDialogClose = () => {
    setNewItem({
      name: "",
      icon: "",
    });
    setOpenAddDialog(false);
  };

  const handleSearchDialogClose = () => {
    setOpenSearchDialog(false);
    // Clear search if dialog is closed without searching
    if (!searchQuery) {
      setFilteredData(categoriesData?.categories || []);
    }
  };

  const handleRefreshClick = () => {
    setSearchQuery("");
    setFilteredData(categoriesData?.categories || []);
    refetch();
  };

  const handleNextPage = () => {
    if (currentPage < (categoriesData?.totalPages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleUpdateCategory = async (updatedItem) => {
    if (!updatedItem.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await updateCategory({
        id: updatedItem.id,
        name: updatedItem.name,
        icon: updatedItem.icon
      }).unwrap();
      
      // Update filtered data immediately
      setFilteredData(prevData =>
        prevData.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      
      // Update filtered data immediately
      setFilteredData(prevData => {
        const updatedData = prevData.filter(category => category.id !== id);
        // If we've removed all items and we're not on the first page, go back
        if (updatedData.length === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        return updatedData;
      });
      
      // Force a refetch to ensure data consistency
      refetch();
      
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete category");
    }
  };
  
  

  useEffect(() => {
    if (!isFetching && categoriesData?.categories) {
      // Only update filtered data if we're not currently filtering
      if (!searchQuery) {
        setFilteredData(categoriesData.categories);
      }
    }
  }, [isFetching, categoriesData, searchQuery]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Box sx={{ flex: 1, padding: theme.spacing(15), overflow: "auto" }}>
          <Buttons
            onAddClick={handleAddClick}
            onSearchClick={handleSearchClick}
            onRefreshClick={handleRefreshClick}
          />
          <CategoriesTable
            columns={columns}
            data={filteredData}
            onEdit={handleUpdateCategory}
            onDelete={(id) => handleDeleteCategory(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={categoriesData?.totalPages || 1}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
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
      <Dialog open={openSearchDialog} onClose={handleSearchDialogClose}>
        <DialogTitle>Search</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Search Query"
            type="text"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSearchDialogClose}>Cancel</Button>
          <Button onClick={handleSearchSubmit} color="primary">
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Category;