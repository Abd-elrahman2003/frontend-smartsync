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
  useDeleteProductImageMutation,
  useGetCategoriesQuery,
} from "../Redux/Featuress/Products/ProductsApi";

import {
  useAssignCameraMutation,
  useGetCameraAssignmentQuery,
  useDeleteCameraAssignmentMutation,
  useAssignWifiMutation,
  useGetWifiAssignmentQuery,
  useDeleteWifiAssignmentMutation,
} from "../Redux/Featuress/Iot/IotApi";
import { FaEdit, FaTrash } from "react-icons/fa";
import imageCompression from "browser-image-compression";

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedProductImages, setSelectedProductImages] = useState([]);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openAttachmentsDialog, setOpenAttachmentsDialog] = useState(false);
  const [selectedProductForAttachments, setSelectedProductForAttachments] =
    useState(null);

    const[isEditingAttachments,setIsEditingAttachments]=useState()

  const [showCameraData, setShowCameraData] = useState(false);
  const [showWifiData, setShowWifiData] = useState(false);
  const [hasCameraData, setHasCameraData] = useState(false);
const [hasWifiData, setHasWifiData] = useState(false);


  // فورم داتا للكاميرا
  const [cameraFormData, setCameraFormData] = useState({
    length: "",
    angle: "",
    resolution: "",
    storage: "",
    amber: "",
  });

  // فورم داتا للواي فاي
  const [wifiFormData, setWifiFormData] = useState({
    wallSensitivity: "",
    maxLength: "",
    scopes: [],
  });

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

  // eslint-disable-next-line no-unused-vars
  const { data: componentsData = {}, refetch: refetchProductComponents } =
    useGetProductComponentsQuery(
      selectedProduct
        ? { productId: selectedProduct.id, pageNumber: Number(selectedPage) }
        : {},
      { skip: !selectedProduct }
    );

  // eslint-disable-next-line no-unused-vars
  const { data: productImagesData, refetch: refetchImages } =
    useGetProductImagesQuery(selectedProductId, {
      skip: !selectedProductId,
    });

  const { data: cameraData, refetch: refetchCameraData } =
    useGetCameraAssignmentQuery(selectedProductForAttachments?.id, {
      skip:
        !selectedProductForAttachments ||
        selectedProductForAttachments?.type !== "CAMERA",
    });

  const { data: wifiData, refetch: refetchWifiData } =
    useGetWifiAssignmentQuery(selectedProductForAttachments?.id, {
      skip:
        !selectedProductForAttachments ||
        selectedProductForAttachments?.type !== "WIFI",
    });

  const products = useMemo(() => productsData?.products || [], [productsData]);
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData.categories || [];

  useEffect(() => {
    if (selectedProduct && products.length > 0) {
      const filteredComponents = products.filter(
        (product) =>
          product.id !== selectedProduct.id &&
          !components.some(
            (comp) => comp.componentId === product.id || comp.id === product.id
          )
      );
      setAvailableComponents(filteredComponents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, components]); // 🔹 أضف components هنا

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

    timeoutId = setTimeout(fetchImages, 300);

    // دالة التنظيف
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedProductId, refetchImages]);


 
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [assignProductComponent] = useAssignProductComponentMutation();
  const [deleteProductComponent] = useDeleteProductComponentMutation();
  const [addProductImages] = useAddProductImagesMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();
  const [assignCamera] = useAssignCameraMutation();
  const [assignWifi] = useAssignWifiMutation();
  const [deleteCamera] = useDeleteCameraAssignmentMutation();
  const [deleteWifi] = useDeleteWifiAssignmentMutation();

  const columns = [
    "ID",
    "Name",
    "Code",
    "Price",
    "Type",
    "Category",
    "Product Image",
    "Attachments",
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

    const newImageUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedFiles(files);

    setSelectedProductImages((prevImages) => [
      ...prevImages,
      ...newImageUrls.map((url) => ({ imageUrl: url })),
    ]);
  };

  const handleSaveImages = async () => {
    setIsSaving(true);
    try {
      const response = await addProductImages({
        productId: selectedProductId,
        images: selectedFiles,
      }).unwrap();

      if (response.message === "Product images added successfully") {
        toast.success("Images uploaded successfully!");

        const { data } = await refetchImages();
        setSelectedProductImages(data.images || []);

        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(error?.data?.message || "Failed to upload images.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteProductImage(imageId).unwrap();

      setSelectedProductImages((prevImages) =>
        prevImages.filter((image) => image.id !== imageId)
      );

      if (selectedProductImages.length - 1 === 0) {
        setTimeout(() => {
          setSelectedProductImages([]);
        }, 100);
      }

      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error(error?.data?.message || "Failed to delete image.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
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
    setIsSaving(true);
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

      // التحقق من نوع المنتج وفتح دايلوج الإرفاق المناسب
      if (formData.type === "CAMERA") {        
        setSelectedProductForAttachments({
          id: formData.id,
          type: "CAMERA",
        });
      } else if (formData.type === "WIFI") {
        setSelectedProductForAttachments({
          id: formData.id,
          type: "WIFI",
        });
      }
    } catch (error) {
      toast.error("Failed to create product.");
      console.error("Error creating product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async () => {
    setIsSaving(true);
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
      setIsSaving(false);
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

      const newComponents = [...selectedProduct.components, ...components];
      setSelectedProduct({ ...selectedProduct, components: newComponents });

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
    setSelectedProductId(product.id);
    setImagePreviewOpen(true);

    setSelectedProductImages([]);
    setIsLoadingImages(true);

    try {
      const { data } = await refetchImages();
      setSelectedProductImages(data?.images || []);
    } catch (error) {
      console.error("Error fetching product images:", error);
      setSelectedProductImages([]);
    } finally {
      setIsLoadingImages(false);
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

  const handleOpenAttachmentsDialog = async (product) => {
    setIsLoading(true);
    setSelectedProductForAttachments(product);
    let fetchedData = null;
  
    try {
      if (product.type === "CAMERA") {
        await refetchCameraData().unwrap(); 
        setTimeout(() => {
          fetchedData = cameraData; 
          if (fetchedData) {
            setHasCameraData(true);
            setCameraFormData({
              length: fetchedData.length || "",
              angle: fetchedData.angle || "",
              resolution: fetchedData.resolution || "",
              storage: fetchedData.storage || "",
              amber: fetchedData.amber || "",
            });
            console.log(fetchedData)
            setOpenAttachmentsDialog(true); 
          }
        }, 500); 
      } else if (product.type === "WIFI") {
        await refetchWifiData().unwrap();
        setTimeout(() => {
          fetchedData = wifiData;
          if (fetchedData) {
            setHasWifiData(true);
            setWifiFormData({
              wallSensitivity: fetchedData.wallSensitivity || "",
              maxLength: fetchedData.maxLength || "",
              scopes: fetchedData.scopes || [],
            });
            setOpenAttachmentsDialog(true);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching attachments data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleCloseAttachmentsDialog = () => {
    setOpenAttachmentsDialog(false);

    setCameraFormData({
      length: "",
      angle: "",
      resolution: "",
      storage: "",
      amber: "",
    });
    setWifiFormData({
      wallSensitivity: "",
      maxLength: "",
      scopes: [],
    });

    setShowCameraData(false);
    setShowWifiData(false);
  };

  const handleSaveAttachments = async () => {
    setIsLoading(true);
    try {
      if (selectedProductForAttachments?.type === "CAMERA") {
        const formattedCameraData = {
          length: parseFloat(cameraFormData.length) || 0,
          angle: parseFloat(cameraFormData.angle) || 0,
          resolution: cameraFormData.resolution || "",
          storage: cameraFormData.storage || "",
          amber: cameraFormData.amber || "",
        };
  
        await assignCamera({
          productId: selectedProductForAttachments.id,
          body: formattedCameraData,
        }).unwrap();
  
        setCameraFormData(formattedCameraData);
        setHasCameraData(true); // تحديث حالة وجود البيانات
        toast.success("Camera data saved successfully!");
      } else if (selectedProductForAttachments?.type === "WIFI") {
        const formattedWifiData = {
          wallSensitivity: parseFloat(wifiFormData.wallSensitivity) || 0,
          maxLength: parseFloat(wifiFormData.maxLength) || 0,
          scopes: wifiFormData.scopes.map((scope) => ({
            length: parseFloat(scope.length) || 0,
            force: parseFloat(scope.force) || 0,
          })),
        };
  
        await assignWifi({
          productId: selectedProductForAttachments.id,
          body: formattedWifiData,
        }).unwrap();
  
        setWifiFormData(formattedWifiData);
        setHasWifiData(true); // تحديث حالة وجود البيانات
        toast.success("Wifi data saved successfully!");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save data.");
    } finally {
      setIsLoading(false); // انتهاء التحميل
      handleCloseAttachmentsDialog();
    }
  };
  const handleDeleteAttachments = async () => {
    setIsLoading(true); // بدء التحميل
    try {
      if (selectedProductForAttachments?.type === "CAMERA") {
        await deleteCamera(selectedProductForAttachments.id).unwrap();
        setCameraFormData({
          length: "",
          angle: "",
          resolution: "",
          storage: "",
          amber: "",
        });
        setShowCameraData(false);
        setHasCameraData(false);
        toast.success("Camera data deleted successfully!");
      } else if (selectedProductForAttachments?.type === "WIFI") {
        await deleteWifi(selectedProductForAttachments.id).unwrap();
        setWifiFormData({
          wallSensitivity: "",
          maxLength: "",
          scopes: [],
        });
        setShowWifiData(false);
        setHasWifiData(false);
        toast.success("Wifi data deleted successfully!");
      }
    } catch (error) {
      console.error("❌ Delete Error:", error);
      toast.error(error?.data?.message || "Failed to delete data.");
    } finally {
      setIsLoading(false); // انتهاء التحميل
    }
  };
  const handleCameraFormChange = (e) => {
    const { name, value } = e.target;
    setCameraFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWifiFormChange = (e) => {
    const { name, value } = e.target;
    setWifiFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddScope = () => {
    setWifiFormData((prev) => ({
      ...prev,
      scopes: [...prev.scopes, { length: "", force: "" }],
    }));
  };

  const handleScopeChange = (index, field, value) => {
    setWifiFormData((prev) => {
      const newScopes = [...prev.scopes];
      newScopes[index] = { ...newScopes[index], [field]: value };
      return { ...prev, scopes: newScopes };
    });
  };

  const handleRemoveScope = (index) => {
    setWifiFormData((prev) => {
      const newScopes = prev.scopes.filter((_, i) => i !== index);
      return { ...prev, scopes: newScopes };
    });
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
                              onClick={() => handleOpenAttachmentsDialog(row)}
                              sx={{ marginLeft: "20px" }}
                            >
                              <Upload /> {/* أيقونة الإرفاق */}
                            </IconButton>
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
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenComponentsDialog(row)}
                            >
                              <Package />
                            </IconButton>
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
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* دايلوج إدخال البيانات الإضافية */}
      <Dialog 
  open={openAttachmentsDialog && !isLoading} 
  onClose={handleCloseAttachmentsDialog} 
  maxWidth="sm" 
  fullWidth
>
  <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", fontSize: "20px" }}>
    {selectedProductForAttachments?.type === "CAMERA" ? "Camera Attachments" : "WiFi Attachments"}
  </DialogTitle>

  <DialogContent>
    {isLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    ) : (
      <Box sx={{ mt: 2 }}>
        {/* بيانات الكاميرا */}
        {selectedProductForAttachments?.type === "CAMERA" && (
          <>
            {[
              { label: "Length", name: "length", type: "number" },
              { label: "Angle", name: "angle", type: "number" },
              { label: "Resolution", name: "resolution" },
              { label: "Storage", name: "storage" },
              { label: "Amber", name: "amber", type: "select", options: ["yes", "no"] }
            ].map(({ label, name, type, options }) => (
              <TextField
                key={name}
                label={label}
                name={name}
                type={type || "text"}
                value={cameraFormData[name]}
                onChange={handleCameraFormChange}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ readOnly: !isEditingAttachments }}
                select={type === "select"}
              >
                {options?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            ))}
          </>
        )}

        {/* بيانات الواي فاي */}
        {selectedProductForAttachments?.type === "WIFI" && (
          <>
            {[
              { label: "Wall Sensitivity", name: "wallSensitivity", type: "number" },
              { label: "Max Length", name: "maxLength", type: "number" }
            ].map(({ label, name, type }) => (
              <TextField
                key={name}
                label={label}
                name={name}
                type={type}
                value={wifiFormData[name]}
                onChange={handleWifiFormChange}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ readOnly: !isEditingAttachments }}
              />
            ))}

            {/* إدارة الـ Scopes */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Scopes</Typography>
            {wifiFormData.scopes.map((scope, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <TextField
                  label={`Scope ${index + 1} - Length`}
                  type="number"
                  value={scope.length}
                  onChange={(e) => handleScopeChange(index, "length", e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditingAttachments }}
                />
                <TextField
                  label={`Scope ${index + 1} - Force`}
                  type="number"
                  value={scope.force}
                  onChange={(e) => handleScopeChange(index, "force", e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: !isEditingAttachments }}
                />
                {isEditingAttachments && <Button color="error" onClick={() => handleRemoveScope(index)}>Remove</Button>}
              </Box>
            ))}

            {isEditingAttachments && <Button variant="outlined" onClick={handleAddScope}>Add Scope</Button>}
          </>
        )}
      </Box>
    )}
  </DialogContent>

  {/* الأزرار */}
  <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
    <Button variant="contained" color="error" onClick={handleDeleteAttachments} disabled={!hasCameraData && !hasWifiData}>
      Delete
    </Button>
    {isEditingAttachments ? (
      <Button variant="contained" color="primary" onClick={handleSaveAttachments}>
        Save
      </Button>
    ) : (
      <Button variant="outlined" color="primary" onClick={() => setIsEditingAttachments(true)}>
        Edit
      </Button>
    )}
    <Button variant="text" onClick={handleCloseAttachmentsDialog}>
      Close
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
            disabled={isSaving}
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
                    src={image.imageUrl}
                    alt="Product"
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
                      onClick={() => handleDeleteImage(image.id)}
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
          {/* زر الحفظ يظهر فقط عند رفع صور جديدة */}
          {selectedFiles.length > 0 && (
            <Button
              onClick={handleSaveImages}
              variant="contained"
              color="primary"
              disabled={selectedFiles.length === 0}
              startIcon={isSaving && <CircularProgress size={20} />}
            >
              {isSaving ? "Saving..." : "Save Images"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
