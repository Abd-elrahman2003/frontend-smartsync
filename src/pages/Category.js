import React, { useEffect, useState } from "react";
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
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import Tables from "../components/Shared/Tables";
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from "../Redux/Featuress/categories/categoriesApi";
import { toast } from "react-toastify";

const Category = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // RTK Query hooks
  const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const columns = ["name", "icon"];

  const handleAddClick = () => setOpenAddDialog(true);

  const handleAddSubmit = async () => {
    try {
      await createCategory(newCategory);
      setOpenAddDialog(false);
      setNewCategory({
        name: "",
        icon: "",
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create category.");
    }
  };

  const handleSearchClick = () => setOpenSearchDialog(true);

  const handleSearchSubmit = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = categories.filter((category) =>
      Object.values(category).some((value) =>
        value != null && value.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered);
    setOpenSearchDialog(false);
  };

  const handleAddDialogClose = () => {
    setNewCategory({
      name: "",
      icon: "",
    });
    setOpenAddDialog(false);
  };

  const handleRefreshClick = async () => {
    try {
      await refetch(); // Trigger a refetch of the categories data
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleUpdateCategory = async () => {
    try {
      await updateCategory(editingCategory);
      setEditingCategory(null);
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = (categoryId) => {
    try {
      deleteCategory(categoryId);
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  // Update filtered data whenever the categories or search query changes
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredData(categories);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = categories.filter((category) =>
        Object.values(category).some((value) =>
          value != null && value.toString().toLowerCase().includes(lowercasedQuery)
        )
      );
      setFilteredData(filtered);
    }
  }, [categories, searchQuery]);

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
            onSearchClick={handleSearchClick} // Button for opening the search dialog
            onRefreshClick={handleRefreshClick}
          />
          <Tables
            columns={columns}
            data={filteredData} // Use filteredData to show search results
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </Box>
      </Box>
      <Footer />

      {/* Add Category Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Icon URL"
            type="text"
            fullWidth
            value={newCategory.icon}
            onChange={(e) =>
              setNewCategory({ ...newCategory, icon: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button onClick={handleAddSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Category Dialog */}
      <Dialog open={openSearchDialog} onClose={() => setOpenSearchDialog(false)}>
        <DialogTitle>Search Categories</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Search Query"
            type="text"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSearchDialog(false)}>Cancel</Button>
          <Button onClick={handleSearchSubmit} color="primary">
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editingCategory !== null} onClose={() => setEditingCategory(null)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            value={editingCategory?.name || ""}
            onChange={(e) =>
              setEditingCategory({ ...editingCategory, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Icon URL"
            type="text"
            fullWidth
            value={editingCategory?.icon || ""}
            onChange={(e) =>
              setEditingCategory({ ...editingCategory, icon: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCategory(null)}>Cancel</Button>
          <Button onClick={handleUpdateCategory} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Category;