import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Autocomplete,
  Typography,
  Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Plus, Package, Trash2, Image } from "lucide-react";
import Sidebar from "../components/Shared/Sidebar";
import Tables from "../components/Shared/Tables";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import { toast } from "react-toastify";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductComponentsQuery,
  useAssignProductComponentMutation,
  useDeleteProductComponentMutation,
  useAddProductImageMutation,
  useDeleteProductImageMutation,
  useGetCategoriesQuery,
} from "../Redux/Featuress/Products/ProductsApi";

const Products = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openComponentsDialog, setOpenComponentsDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "",
    description: "",
    type: "",
    model: "",
    colors: ["", ""],
    thumbFile: null,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Queries
  const { data: productsData = {}, isLoading: productsLoading, refetch: refetchProducts } = useGetProductsQuery(selectedPage);
  const { data: categoriesData = { categories: [] }, isLoading: categoriesLoading } = useGetCategoriesQuery(1);
  const { data: componentsData = {}, isLoading: componentsLoading } = useGetProductComponentsQuery(
    selectedProduct ? { productId: selectedProduct.id, pageNumber: selectedPage } : {},
    { skip: !selectedProduct }
  );

  // Extract data from responses
  const { products = [], totalPages = 1 } = productsData;
  const categories = categoriesData.categories || [];
  const components = componentsData.getComponents || [];

  // Mutations
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [assignProductComponent] = useAssignProductComponentMutation();
  const [deleteProductComponent] = useDeleteProductComponentMutation();
  const [addProductImage] = useAddProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  const columns = ["ID", "Name", "Code", "Price", "Type", "Category", "Actions"];

  const formatProductData = (productsData) => {
    return productsData.map((product) => ({
      ID: product.id,
      Name: product.name,
      Code: product.code,
      Price: `$${product.price}`,
      Type: product.type,
      Category: categories.find((cat) => cat.id === product.categoryId)?.name || "N/A",
      Actions: (
        <Box>
          <IconButton onClick={() => handleEditClick(product)}>
            <Package size={20} color={theme.palette.primary.main} />
          </IconButton>
          <IconButton onClick={() => handleDeleteProduct(product.id)}>
            <Trash2 size={20} color="red" />
          </IconButton>
          <IconButton onClick={() => handleAddImage(product.id)}>
            <Image size={20} color="green" />
          </IconButton>
          <IconButton onClick={() => handleOpenComponentsDialog(product)}>
            <Package size={20} color={theme.palette.secondary.main} />
          </IconButton>
        </Box>
      ),
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData((prev) => ({
      ...prev,
      colors: newColors,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      thumbFile: e.target.files[0],
    }));
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      code: "",
      price: "",
      description: "",
      type: "",
      model: "",
      colors: ["", ""],
      thumbFile: null,
    });
    setSelectedCategory(null);
    setOpenAddDialog(true);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setUpdatedProduct(product);
    setOpenEditDialog(true);
  };

  const handleOpenComponentsDialog = (product) => {
    setSelectedProduct(product);
    setOpenComponentsDialog(true);
  };

  const handleAddSubmit = async () => {
    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("code", formData.code);
      submitFormData.append("price", formData.price);
      submitFormData.append("categoryId", selectedCategory?.id || "");
      submitFormData.append("description", formData.description);
      submitFormData.append("type", formData.type);
      submitFormData.append("model", formData.model);
      submitFormData.append("colors", JSON.stringify(formData.colors));

      if (formData.thumbFile) {
        submitFormData.append("thumbFile", formData.thumbFile);
      }

      await createProduct(submitFormData).unwrap();
      toast.success("Product created successfully!");
      setOpenAddDialog(false);
      refetchProducts(); // إعادة جلب البيانات بعد الإضافة
    } catch (error) {
      toast.error("Failed to create product.");
    }
  };

  const handleEditSubmit = async () => {
    try {
      await updateProduct({ productId: selectedProduct.id, updatedData: updatedProduct }).unwrap();
      toast.success("Product updated successfully!");
      setOpenEditDialog(false);
      refetchProducts(); // إعادة جلب البيانات بعد التحديث
    } catch (error) {
      toast.error("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully!");
      refetchProducts(); // إعادة جلب البيانات بعد الحذف
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

  const handleAssignComponent = async (componentId) => {
    try {
      await assignProductComponent({ productId: selectedProduct.id, componentId }).unwrap();
      toast.success("Component assigned successfully!");
    } catch (error) {
      toast.error("Failed to assign component.");
    }
  };

  const handleRemoveComponent = async (componentId) => {
    try {
      await deleteProductComponent({ productId: selectedProduct.id, componentId }).unwrap();
      toast.success("Component removed successfully!");
    } catch (error) {
      toast.error("Failed to remove component.");
    }
  };

  const handleAddImage = async (productId) => {
    if (!selectedImage) {
      toast.error("Please select an image first.");
      return;
    }
    try {
      await addProductImage({ productId, image: selectedImage }).unwrap();
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image.");
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteProductImage(imageId).unwrap();
      toast.success("Image deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete image.");
    }
  };

  const handlePageChange = (event, newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSelectedPage(newPage);
    } else {
      toast.error("Page not found.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <Box sx={{ flex: 1, padding: theme.spacing(15) }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button variant="contained" color="primary" startIcon={<Plus />} onClick={handleAddClick}>
              Add Product
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            {productsLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Tables columns={columns} data={formatProductData(products)} />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={selectedPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Footer />

      {/* Add Product Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
            />
            
            <TextField
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              fullWidth
            />
            
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleFormChange}
              fullWidth
            />
            
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name}
              value={selectedCategory}
              onChange={(_, newValue) => setSelectedCategory(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Category" fullWidth />
              )}
              loading={categoriesLoading}
              loadingText="Loading categories..."
              noOptionsText="No categories available"
            />
            
            <TextField
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
            />
            
            <TextField
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              fullWidth
            />
            
            <TextField
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleFormChange}
              fullWidth
            />
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Color 1"
                value={formData.colors[0]}
                onChange={(e) => handleColorChange(0, e.target.value)}
                fullWidth
              />
              <TextField
                label="Color 2"
                value={formData.colors[1]}
                onChange={(e) => handleColorChange(1, e.target.value)}
                fullWidth
              />
            </Box>
            
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              style={{ marginTop: theme.spacing(2) }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Product Name"
              fullWidth
              value={updatedProduct.name || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
            />
            <TextField
              label="Price"
              fullWidth
              type="number"
              value={updatedProduct.price || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
            />
            <TextField
              label="Type"
              fullWidth
              value={updatedProduct.type || ''}
              onChange={(e) => setUpdatedProduct({ ...updatedProduct, type: e.target.value })}
            />
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name}
              value={categories.find(cat => cat.id === updatedProduct.categoryId) || null}
              onChange={(_, newValue) => setUpdatedProduct({ ...updatedProduct, categoryId: newValue?.id })}
              renderInput={(params) => (
                <TextField {...params} label="Category" fullWidth />
              )}
              loading={categoriesLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Components Dialog */}
      <Dialog open={openComponentsDialog} onClose={() => setOpenComponentsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Components</DialogTitle>
        <DialogContent>
          {componentsLoading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ mt: 2 }}>
              {components.map((component) => (
                <Box key={component.id} sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  p: 1,
                  mb: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <Typography>{component.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleAssignComponent(component.id)}>
                      <Plus size={20} color={theme.palette.primary.main} />
                    </IconButton>
                    <IconButton onClick={() => handleRemoveComponent(component.id)}>
                      <Trash2 size={20} color="red" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              {components.length === 0 && (
                <Typography color="text.secondary">No components available</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComponentsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;