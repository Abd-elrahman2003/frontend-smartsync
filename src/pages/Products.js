import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Typography,
  Pagination,
  Grid,
  Stack,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Plus, Upload, Image, Package } from "lucide-react";
import { Upload as UploadIcon } from "@mui/icons-material";
import Sidebar from "../components/Shared/Sidebar";
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
  useAddProductImagesMutation,
  useGetProductImagesQuery,
  useGetCategoriesQuery,
} from "../Redux/Featuress/Products/ProductsApi";
import { FaEdit, FaTrash } from "react-icons/fa";
import imageCompression from "browser-image-compression"; // لضغط الصور

const Products = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openComponentsDialog, setOpenComponentsDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [fileName, setFileName] = useState("");
  const [components, setComponents] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // For actual files
  const [selectedProductImages, setSelectedProductImages] = useState([]);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // حالة التحميل عند الحفظ

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "",
    description: "",
    type: "",
    model: "",
    colors: [],
    thumbFile: null,
  });

  const typeOptions = ["CAMERA", "WIFI", "DEVICE"];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: productsData = { products: [], totalPages: 1 },
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useGetProductsQuery(selectedPage);

  const {
    data: categoriesData = { categories: [] },
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery(1);

  const { data: componentsData = {}, refetch: refetchProductComponents } =
    useGetProductComponentsQuery(
      selectedProduct
        ? { productId: selectedProduct.id, pageNumber: Number(selectedPage) }
        : {},
      { skip: !selectedProduct }
    );

  const { data: productImagesData, refetch: refetchImages } =
    useGetProductImagesQuery(selectedProductId, {
      skip: !selectedProductId,
    });

  const products = useMemo(() => productsData?.products || [], [productsData]);
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData.categories || [];

  useEffect(() => {
    if (selectedProduct && products.length > 0) {
      const filteredComponents = products.filter(
        (product) =>
          product.id !== selectedProduct.id &&
          !components.some((comp) => comp.id === product.id)
      );
      setAvailableComponents(filteredComponents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchImages = async () => {
      if (selectedProductId) {
        setIsLoadingImages(true);
        setSelectedProductImages([]);

        try {
          const { data } = await refetchImages();
          if (isMounted) {
            setSelectedProductImages(data?.images || []);
          }
        } catch (error) {
          console.error("Error fetching images:", error);
          if (isMounted) {
            setSelectedProductImages([]);
          }
        } finally {
          if (isMounted) {
            setIsLoadingImages(false);
          }
        }
      }
    };

    // تأخير الطلب بمقدار 300 مللي ثانية
    timeoutId = setTimeout(fetchImages, 300);

    // دالة التنظيف
    return () => {
      isMounted = false;
      clearTimeout(timeoutId); // إلغاء التأخير إذا تم تغيير selectedProductId
    };
  }, [selectedProductId, refetchImages]);

  useEffect(() => {
    return () => {
      // مسح الروابط المؤقتة عند إغلاق الدايلوج
      selectedProductImages.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [selectedProductImages]);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [assignProductComponent] = useAssignProductComponentMutation();
  const [deleteProductComponent] = useDeleteProductComponentMutation();
  const [addProductImages] = useAddProductImagesMutation();

  const columns = [
    "ID",
    "Name",
    "Code",
    "Price",
    "Type",
    "Category",
    "Product Image",
  ];

  const formatProductData = (productsData) => {
    return productsData.map((product) => ({
      id: product.id,
      name: product.name,
      code: product.code,
      price: product.price,
      type: product.type,
      category:
        categories.find((cat) => cat.id === product.categoryId)?.name || "N/A",
      thumbLink: product.thumbLink,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      type: event.target.value,
    }));
  };

  const handleColorsChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      colors: value,
    }));
  };

  const handleFilePhotosChange = async (e) => {
    const files = Array.from(e.target.files);
    const totalImagesAfterAdd = selectedProductImages.length + files.length;

    if (totalImagesAfterAdd > 3) {
      toast.error("Maximum 3 images allowed in total");
      return;
    }

    // Store the actual files
    setSelectedFiles(files);

    // Create preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedProductImages((prevImages) => [...prevImages, ...newImageUrls]);
  };

  const handleSaveImages = async () => {
    // بعد الحذف، سنرسل الصور المتبقية فقط
    setIsSaving(true);
    try {
      console.log("Updating Images:", selectedFiles);
  
      const response = await addProductImages({
        productId: selectedProductId,
        images: selectedFiles, // سيتم إرسال الصور المتبقية فقط
      }).unwrap();
  
      console.log("Update Response:", response);
  
      if (response.message === "Product images added successfully") {
        toast.success("Images updated successfully!");
        
        const { data } = await refetchImages();
  
        console.log("Fetched updated images:", data);
  
        if (data?.images) {
          setSelectedProductImages((prevImages) => [...prevImages, ...data.images]);
        }
        
        setSelectedFiles([]);
      }
      
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error?.data?.message || "Failed to update images");
    } finally {
      setIsSaving(false);
    }
};
  const handleDeleteImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setSelectedProductImages((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      return newUrls;
    });
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1, // الحد الأقصى لحجم الملف (1MB)
          maxWidthOrHeight: 1024, // الحد الأقصى للعرض أو الارتفاع
          useWebWorker: true, // استخدام Web Worker لتحسين الأداء
        };
        const compressedFile = await imageCompression(file, options);
        setFileName(compressedFile.name);
        setFormData((prev) => ({
          ...prev,
          thumbFile: compressedFile,
        }));
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Failed to compress image.");
      }
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      code: "",
      price: "",
      description: "",
      type: "",
      model: "",
      colors: [],
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

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully!");
      refetchProducts();
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

  const handleAddSubmit = async () => {
    setIsSaving(true); // تفعيل حالة التحميل
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

      await refetchProducts();
    } catch (error) {
      toast.error("Failed to create product.");
      console.error("Error creating product:", error);
    } finally {
      setIsSaving(false); // تعطيل حالة التحميل
    }
  };

  const handleEditSubmit = async () => {
    setIsSaving(true); // تفعيل حالة التحميل
    try {
      await updateProduct({
        productId: selectedProduct.id,
        updatedData: updatedProduct,
      }).unwrap();
      toast.success("Product updated successfully!");
      setOpenEditDialog(false);
      refetchProducts();
    } catch (error) {
      toast.error("Failed to update product.");
    } finally {
      setIsSaving(false); // تعطيل حالة التحميل
    }
  };

  const handlePageChange = (event, newPage) => {
    if (!totalPages || totalPages < 1) {
      toast.error("Total pages not available.");
      return;
    }

    if (newPage >= 1 && newPage <= totalPages) {
      setSelectedPage(newPage);
    } else {
      toast.error("Page not found.");
      console.error("Invalid Page Request:", newPage);
    }
  };

  useEffect(() => {
    refetchProducts(selectedPage);
  }, [selectedPage, refetchProducts]);

  const handleOpenComponentsDialog = async (product) => {
    setSelectedProduct(product);
    setOpenComponentsDialog(true);
    setIsLoading(true);

    if (product.id) {
      try {
        const result = await refetchProductComponents().unwrap();

        if (result?.components) {
          const currentComponents = result.components.map((comp) => ({
            id: comp.component?.id,
            componentId: comp.componentId || comp.component?.id,
            name: comp.component?.name || comp.name,
            quantity: comp.quantity || "",
            timeExpentency: comp.timeExpentency || "",
            component: comp.component || {
              id: comp.componentId,
              name: comp.name,
            },
          }));

          setComponents(currentComponents);

          const filteredAvailable = products.filter((p) => {
            if (p.id === product.id) return false;
            return !currentComponents.some(
              (comp) => comp.componentId === p.id || comp.component?.id === p.id
            );
          });

          setAvailableComponents(filteredAvailable);
        }
      } catch (error) {
        console.error("Error fetching components:", error);
        toast.error("this product doesn't have components");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseComponentsDialog = () => {
    setOpenComponentsDialog(false);
    setComponents([]);
  };

  const handleSelectComponent = (component) => {
    setComponents((prevComponents) => {
      const isAlreadyAdded = prevComponents.some(
        (c) =>
          c.componentId === component.id ||
          c.id === component.id ||
          c.component?.id === component.id
      );

      if (isAlreadyAdded) {
        toast.warning("This component is already added");
        return prevComponents;
      }

      return [
        ...prevComponents,
        {
          id: component.id,
          componentId: component.id,
          component: {
            id: component.id,
            name: component.name,
          },
          name: component.name,
          quantity: "",
          timeExpentency: "",
        },
      ];
    });

    setAvailableComponents((prev) => prev.filter((c) => c.id !== component.id));
  };

  const handleAddComponents = async () => {
    if (!components.length) {
      toast.error("Please select at least one component");
      return;
    }

    setIsLoading(true);

    try {
      const promises = components.map((component) =>
        assignProductComponent({
          productId: selectedProduct.id,
          componentId: component.componentId || component.id,
          quantity: component.quantity || "",
          timeExpentency: component.timeExpentency || "",
        }).unwrap()
      );

      await Promise.all(promises);

      const updatedData = await refetchProductComponents().unwrap();
      console.log("Updated Data:", updatedData);

      if (updatedData?.getComponents) {
        const updatedComponents = updatedData.getComponents.map((comp) => ({
          id: comp.componentId,
          componentId: comp.componentId,
          name: comp.component?.name,
          quantity: comp.quantity,
          timeExpentency: comp.timeExpentency,
          component: comp.component,
        }));

        setComponents(updatedComponents);

        const newAvailable = products.filter((p) => {
          if (p.id === selectedProduct.id) return false;
          return !updatedComponents.some(
            (comp) => comp.componentId === p.id || comp.component?.id === p.id
          );
        });

        setAvailableComponents(newAvailable);
      }

      toast.success("Components added successfully!");
    } catch (error) {
      console.error("Error adding components:", error);
      toast.error(error?.data?.message || "Failed to add components");

      setTimeout(() => {
        handleAddComponents();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComponent = async (productId, componentId) => {
    console.log("🔍 Deleting Component:", { productId, componentId });

    if (!componentId) {
      console.error("❌ Error: componentId is undefined!");
      toast.error("Error: Invalid component selected.");
      return;
    }

    try {
      await deleteProductComponent({ productId, componentId }).unwrap();

      setComponents((prev) =>
        prev.filter((c) => c.componentId !== componentId)
      );

      toast.success("Component removed successfully!");
    } catch (error) {
      toast.error("Failed to remove component.");
      console.error("❌ Error removing component:", error);
    }
  };

  const handleViewImages = async (product) => {
    setSelectedProductId(product.id); // تعيين ID المنتج المحدد
    setImagePreviewOpen(true); // فتح الدايلوج

    // مسح الصور القديمة فورًا
    setSelectedProductImages([]);
    setIsLoadingImages(true); // تفعيل حالة التحميل

    try {
      const { data } = await refetchImages(); // إعادة تحميل الصور
      setSelectedProductImages(data?.images || []); // تحديث الصور الجديدة
    } catch (error) {
      console.error("Error fetching product images:", error);
      setSelectedProductImages([]); // في حالة الخطأ، مسح الصور
    } finally {
      setIsLoadingImages(false); // تعطيل حالة التحميل
    }
  };

  const showDeleteToast = (message, onConfirm) => {
    toast.warn(
      <div>
        <Typography>{message}</Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              onConfirm();
              toast.dismiss();
            }}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </Button>
        </Box>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

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

        <Box sx={{ flex: 1, padding: theme.spacing(15) }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus />}
              onClick={handleAddClick}
              sx={{ py: 2 }}
            >
              Add Product
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            {productsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{ backgroundColor: theme.palette.primary.main }}
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col}
                            sx={{
                              fontSize: "1rem",
                              color: "white",
                              fontWeight: 400,
                            }}
                          >
                            {col}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: 400,
                          }}
                        >
                          Photos
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: 400,
                          }}
                        >
                          Edit
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: 400,
                          }}
                        >
                          Delete
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "1rem",
                            color: "white",
                            fontWeight: 400,
                          }}
                        >
                          Components
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formatProductData(products).map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <TableCell sx={{ fontSize: "16px" }}>
                            {row.id}
                          </TableCell>
                          <TableCell sx={{ fontSize: "16px" }}>
                            {row.name}
                          </TableCell>
                          <TableCell sx={{ fontSize: "16px" }}>
                            {row.code}
                          </TableCell>
                          <TableCell sx={{ fontSize: "16px" }}>
                            {row.price}
                          </TableCell>
                          <TableCell sx={{ fontSize: "16px" }}>
                            {row.type}
                          </TableCell>
                          <TableCell sx={{ fontSize: "16px" }}>
                            {row.category}
                          </TableCell>
                          <TableCell>
                            {row.thumbLink ? (
                              <img
                                src={row.thumbLink}
                                alt="Product Thumbnail"
                                style={{
                                  width: "100px",
                                  height: "100%",
                                  borderRadius: "4px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No Image
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewImages(row)}
                            >
                              <Image />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditClick(row)}
                              sx={{ fontSize: "19px" }}
                            >
                              <FaEdit />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() =>
                                showDeleteToast(
                                  "Are you sure you want to delete this product?",
                                  () => handleDeleteProduct(row.id)
                                )
                              }
                              sx={{ fontSize: "19px" }}
                            >
                              <FaTrash />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            {row.type === "WIFI" || row.type === "CAMERA" ? (
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenComponentsDialog(row)}
                              >
                                <Package />
                              </IconButton>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Not Available
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={selectedPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Footer />

      {/* Add Product Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Code"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  fullWidth
                >
                  {typeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={[]}
                  freeSolo
                  value={formData.colors}
                  onChange={handleColorsChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Colors"
                      placeholder="Add a color"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </Button>
                  {fileName && (
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      {fileName}
                    </Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddSubmit}
            variant="contained"
            color="primary"
            disabled={isSaving} // تعطيل الزر أثناء التحميل
          >
            {isSaving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="ID"
              fullWidth
              value={updatedProduct.id || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Product Name"
              fullWidth
              value={updatedProduct.name || ""}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, name: e.target.value })
              }
            />
            <TextField
              label="Price"
              fullWidth
              type="number"
              value={updatedProduct.price || ""}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, price: e.target.value })
              }
            />
            <TextField
              select
              label="Type"
              fullWidth
              value={updatedProduct.type || ""}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, type: e.target.value })
              }
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name}
              value={
                categories.find(
                  (cat) => cat.id === updatedProduct.categoryId
                ) || null
              }
              onChange={(_, newValue) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  categoryId: newValue?.id,
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Category" fullWidth />
              )}
              loading={categoriesLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={isSaving} // تعطيل الزر أثناء التحميل
          >
            {isSaving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Components Dialog */}
      <Dialog
        open={openComponentsDialog}
        onClose={handleCloseComponentsDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Add Components to {selectedProduct ? selectedProduct.name : ""}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Selected Components - Left Side */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#f8f9fa",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Selected Components
                </Typography>
                <Box
                  sx={{
                    overflow: "auto",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {isLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : components.length > 0 ? (
                    components.map((component) => (
                      <Paper
                        key={component.id}
                        sx={{
                          p: 2,
                          bgcolor: "white",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {component.component?.name}
                          </Typography>
                          <IconButton
                            color="error"
                            onClick={() => {
                              handleDeleteComponent(
                                selectedProduct.id,
                                component.componentId ||
                                  component.id ||
                                  component.component?.id
                              );
                            }}
                          >
                            <FaTrash />
                          </IconButton>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            label="Quantity"
                            type="number"
                            size="small"
                            value={component.quantity || ""}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (value > 0) {
                                setComponents((prev) =>
                                  prev.map((c) =>
                                    c.id === component.id
                                      ? { ...c, quantity: value }
                                      : c
                                  )
                                );
                              }
                            }}
                            sx={{ width: "45%" }}
                          />
                          <TextField
                            label="Time (hours)"
                            type="number"
                            size="small"
                            value={component.timeExpentency || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value >= 0) {
                                setComponents((prev) =>
                                  prev.map((c) =>
                                    c.id === component.id
                                      ? { ...c, timeExpentency: value }
                                      : c
                                  )
                                );
                              }
                            }}
                            sx={{ width: "45%" }}
                          />
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                    >
                      No components available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Available Components - Right Side */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Available Components
                </Typography>

                {/* Search Box */}
                <TextField
                  size="small"
                  placeholder="Search components..."
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = products.filter(
                      (product) =>
                        product.id !== selectedProduct?.id &&
                        !components.some((comp) => comp.id === product.id) &&
                        product.name.toLowerCase().includes(searchTerm)
                    );
                    setAvailableComponents(filtered);
                  }}
                />

                {/* Available Components List */}
                <Box sx={{ overflow: "auto", flex: 1 }}>
                  {availableComponents.map((component) => (
                    <Paper
                      key={component.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onClick={() => handleSelectComponent(component)}
                    >
                      <Typography>{component.name}</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                      >
                        Add
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComponentsDialog}>Cancel</Button>
          <Button
            onClick={handleAddComponents}
            variant="contained"
            color="primary"
            disabled={components.length === 0}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewOpen}
        onClose={() => {
          setImagePreviewOpen(false);
          setSelectedFiles([]);
          setSelectedProductImages([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Product Images</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Upload up to 3 images for your product. Each image should be less
              than 5MB.
            </Typography>
          </Box>

          {/* File Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Button
              color="primary"
              variant="contained"
              component="label"
              startIcon={<Upload />}
              disabled={selectedProductImages.length >= 3}
            >
              Choose Images
              <input
                type="file"
                hidden
                onChange={handleFilePhotosChange}
                accept="image/*"
                multiple
                max={3}
              />
            </Button>
          </Box>

          {/* Images Preview Grid */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              p: 2,
            }}
          >
            {isLoadingImages ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                  gridColumn: "1 / -1",
                }}
              >
                <CircularProgress />
              </Box>
            ) : selectedProductImages.length > 0 ? (
              selectedProductImages.map((image, index) => (
                <Paper
                  key={index}
                  elevation={3}
                  sx={{
                    position: "relative",
                    aspectRatio: "1",
                    overflow: "hidden",
                    borderRadius: 2,
                  }}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      p: 0.5,
                      bgcolor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "0 0 0 8px",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(index)}
                      sx={{
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.2)",
                        },
                      }}
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                  gridColumn: "1 / -1",
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  No images available. Click "Choose Images" to upload.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
  <Box sx={{ flex: 1 }}>
    <Typography variant="caption" color="text.secondary">
      {selectedProductImages.length}/3 images uploaded
    </Typography>
  </Box>
  <Button
    onClick={() => {
      setImagePreviewOpen(false);
      setSelectedFiles([]);
      setSelectedProductImages([]);
    }}
  >
    Cancel
  </Button>
  <Button
    onClick={handleSaveImages}
    variant="contained"
    color="primary"
    // نحذف الشرط disabled={selectedFiles.length === 0}
    // ونضيف شرط للتحقق من وجود تغييرات
    disabled={isSaving}
    startIcon={isSaving && <CircularProgress size={20} />}
  >
    {isSaving ? "Saving..." : "Save Images"}
  </Button>
</DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
