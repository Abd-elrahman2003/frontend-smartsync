import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Autocomplete,
} from "@mui/material";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../components/Shared/Sidebar";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import OperationsButtons from "../components/Shared/OperationsButtons";
import PurchaseSearchDialog from "../components/Shared/PurchaseSearchDialog";
import Pagination from "../components/Common/Pagination";
import {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useTogglePostPurchaseMutation,
} from "../Redux/Featuress/Purchasing/purchasingApi";
import { useGetSuppliersQuery } from "../Redux/Featuress/Suppliers/supplierApi";
import { useGetStoresQuery } from "../Redux/Featuress/Store/storeApi";
import { useGetProductsQuery } from "../Redux/Featuress/Products/ProductsApi";
import { toast } from "react-toastify";

// Reusable Dialog Component
const ConfirmationDialog = ({ open, title, content, onConfirm, onCancel, confirmButtonColor, confirmText }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{content}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color={confirmButtonColor || "primary"} autoFocus>
        {confirmText || "Confirm"}
      </Button>
    </DialogActions>
  </Dialog>
);

const Purchasing = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    id: "",
    storeId: "",
    supplierId: ""
  });

  // Client-side state for current purchase order
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState({
    supplierId: "",
    storeId: "",
    note: "",
    date: new Date().toISOString().split('T')[0],
    items: [],
    isPosted: false,
    isSaved: false,
    id: null
  });

  // State for save button visibility and loading
  const [isSaving, setIsSaving] = useState(false);

  // State for server data (existing purchase orders)
  const [serverData, setServerData] = useState([]);
  const [activeDialog, setActiveDialog] = useState({ type: null, data: null });
  const [editData, setEditData] = useState({
    quantity: '',
    price: ''
  });

  // State for multiple items in a single dialog
  const [multipleItems, setMultipleItems] = useState([{
    productId: "",
    productName: "",
    productCode: "",
    quantity: "",
    price: ""
  }]);

  // Queries
  const {
    data: purchaseData = {},
    isLoading,
    isFetching,
    refetch
  } = useGetPurchasesQuery({
    page: currentPage,
    ...searchParams
  }, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: suppliersData = {},
    isLoading: isLoadingSuppliers
  } = useGetSuppliersQuery(1);

  const {
    data: storesData = {},
    isLoading: isLoadingStores
  } = useGetStoresQuery(1);

  const {
    data: productsData = {},
    isLoading: isLoadingProducts
  } = useGetProductsQuery(1);

  // Mutations
  const [createPurchase] = useCreatePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();
  const [deletePurchase] = useDeletePurchaseMutation();
  const [togglePostPurchase] = useTogglePostPurchaseMutation();

  const columns = ["productName", "productCode", "quantity", "price", "times"];

  // Memoized Styles
  const styles = useMemo(() => ({
    cell: { fontSize: "1rem" },
    headerCell: {
      fontSize: "1rem",
      color: theme.palette.common.white,
      fontWeight: 400,
    },
    tableRow: {
      '&:hover': { backgroundColor: theme.palette.action.hover }
    },
    iconButton: { fontSize: '19px' },
    productCode: {
      padding: '4px 8px',
      backgroundColor: theme.palette.grey[200],
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontWeight: 'medium',
      display: 'inline-block'
    }
  }), [theme]);

  // Dialog Handlers
  const handleDialogOpen = (type, rowData = null) => {
    setActiveDialog({ type, data: rowData });
    if (type === 'edit' && rowData) {
      setEditData({
        quantity: rowData.quantity || '',
        price: rowData.price || ''
      });
    }
  };

  const handleDialogClose = () => {
    setActiveDialog({ type: null, data: null });
    setEditData({ quantity: '', price: '' });
  };

  const handleOpenItemDialog = () => {
    setOpenItemDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
    setMultipleItems([{
      productId: "",
      productName: "",
      productCode: "",
      quantity: "",
      price: ""
    }]);
  };

  // Function to handle adding another item row
  const handleAddAnotherItem = () => {
    setMultipleItems([
      ...multipleItems,
      {
        productId: "",
        productName: "",
        productCode: "",
        quantity: "",
        price: ""
      }
    ]);
  };

  // Function to handle removing an item row
  const handleRemoveItemRow = (indexToRemove) => {
    setMultipleItems(multipleItems.filter((_, index) => index !== indexToRemove));
  };

  // Update the product change handler for multiple items
  const handleMultipleProductChange = (index, productId) => {
    const product = productsData.products?.find(p => p.id === productId);

    if (product) {
      const updatedItems = [...multipleItems];
      updatedItems[index] = {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        price: product.price,
        quantity: updatedItems[index].quantity || ""
      };
      setMultipleItems(updatedItems);
    }
  };

  // Update the quantity change handler for multiple items
  const handleQuantityChange = (index, value) => {
    const updatedItems = [...multipleItems];
    updatedItems[index].quantity = value;
    setMultipleItems(updatedItems);
  };

  // Handle submitting all items at once
  const handleSubmitAllItems = () => {
    // Validate items
    const validItems = multipleItems.filter(item =>
      item.productId && item.quantity && parseFloat(item.quantity) > 0
    );

    if (validItems.length === 0) {
      toast.error("Please add at least one valid item with product and quantity");
      return;
    }

    // Add all valid items to the current purchase order
    const itemsWithIds = validItems.map(item => ({
      ...item,
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      times: parseFloat(item.quantity) * parseFloat(item.price)
    }));

    setCurrentPurchaseOrder(prev => ({
      ...prev,
      items: [...prev.items, ...itemsWithIds]
    }));

    // Reset and close dialog
    setMultipleItems([{
      productId: "",
      productName: "",
      productCode: "",
      quantity: "",
      price: ""
    }]);

    setOpenItemDialog(false);
    toast.success(`${validItems.length} item(s) added to order`);
  };

  // Cell Renderer
  const renderCell = (row, col) => {
    switch (col) {
      case 'productCode':
        return (
          <Typography component="span" sx={styles.productCode}>
            {row.productCode || 'N/A'}
          </Typography>
        );
      case 'quantity':
      case 'price':
        return parseFloat(row[col]).toFixed(2);
      case 'times':
        return parseFloat(row.times || (row.quantity * row.price)).toFixed(2);
      default:
        return row[col];
    }
  };

  // Edit Dialog Content
  const renderEditDialog = () => (
    <Dialog open={activeDialog.type === 'edit'} onClose={handleDialogClose}>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
      <FormControl fullWidth margin="normal" disabled={currentPurchaseOrder.isPosted || isSaving}>
  <Autocomplete
    options={productsData.products || []}
    getOptionLabel={(option) => `${option.name} (${option.code})`}
    value={productsData.products?.find(p => p.id === activeDialog.data?.productId) || null}
    onChange={(_, newValue) => {
      if (newValue) {
        const product = newValue;
        setActiveDialog(prev => ({
          ...prev,
          data: {
            ...prev.data,
            productId: product.id,
            productName: product.name,
            productCode: product.code,
            price: product.price
          }
        }));
        setEditData(prev => ({
          ...prev,
          price: product.price
        }));
      }
    }}
    disabled={isLoadingProducts || currentPurchaseOrder.isPosted || isSaving}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Product"
      />
    )}
  />
</FormControl>
        
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Code: <span style={{ fontFamily: 'monospace' }}>{activeDialog.data?.productCode}</span>
        </Typography>
        
        <TextField
          fullWidth
          margin="normal"
          label="Quantity"
          type="number"
          value={editData.quantity}
          onChange={(e) => setEditData(prev => ({ ...prev, quantity: e.target.value }))}
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Price"
          type="number"
          value={editData.price}
          disabled={true}
          helperText="Price is fetched from product database"
        />
        
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Total: {(editData.quantity * editData.price).toFixed(2)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button onClick={handleEditItem} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );

  // Edit item in current order
  const handleEditItem = () => {
    if (!activeDialog.data || !editData.quantity) return;
  
    setCurrentPurchaseOrder(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === activeDialog.data.id) {
          return {
            ...item,
            productId: activeDialog.data.productId,
            productName: activeDialog.data.productName,
            productCode: activeDialog.data.productCode,
            quantity: editData.quantity,
            price: activeDialog.data.price,
            times: editData.quantity * activeDialog.data.price
          };
        }
        return item;
      });
  
      return {
        ...prev,
        items: updatedItems
      };
    });
  
    handleDialogClose();
    toast.success("Item updated");
  };

  // Remove item from current order
  const handleRemoveItem = (itemId) => {
    setCurrentPurchaseOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));

    toast.success("Item removed from order");
  };


  const handleFilterChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add this handler to load the selected purchase
  const handleViewPurchase = (purchase) => {
    setCurrentPurchaseOrder({
      id: purchase.id,
      supplierId: purchase.supplierId,
      storeId: purchase.storeId,
      note: purchase.note || '',
      date: purchase.date,
      items: purchase.items || [],
      isPosted: purchase.isPosted,
      isSaved: true
    });
    setSearchDialogOpen(false);
  };

  // Save the entire purchase order to the server
  const handleSaveOrder = async () => {
    if (!currentPurchaseOrder.supplierId || !currentPurchaseOrder.storeId || currentPurchaseOrder.items.length === 0) {
      toast.error("Please fill all required fields before saving.");
      return false;
    }

    try {
      setIsSaving(true);
      const dataToSend = {
        supplierId: currentPurchaseOrder.supplierId,
        storeId: currentPurchaseOrder.storeId,
        note: currentPurchaseOrder.note,
        date: currentPurchaseOrder.date,
        post: false,
        items: currentPurchaseOrder.items.map(item => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
        })),
      };

      const result = await createPurchase(dataToSend).unwrap(); // Save the order
      console.log("✅ Full API Response:", result); // Debugging

      const orderId = result.purchaseOrder?.id; // Extract ID from `purchaseOrder.id`

      if (!orderId) {
        toast.error("Failed to get order ID after saving. Check console.");
        return false;
      }

      setCurrentPurchaseOrder(prev => ({
        ...prev,
        id: orderId, // Save the correct ID
        isSaved: true,
      }));

      console.log("🔥 Updated currentPurchaseOrder ID:", orderId); // Debugging

      refetch();
      toast.success("Purchase order saved successfully!");
      return true;
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save purchase order");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Reset the current purchase order
  const handleResetOrder = () => {
    setCurrentPurchaseOrder({
      supplierId: "",
      storeId: "",
      note: "",
      date: new Date().toISOString().split('T')[0],
      items: [],
      isPosted: false,
      isSaved: false,
      id: null
    });

    toast.info("Order has been reset");
  };

  // Update the purchase order
  const handleUpdateOrder = async () => {
    if (!currentPurchaseOrder.id) {
      toast.error("Please save the order first before updating.");
      return;
    }

    try {
      const dataToSend = {
        headerId: currentPurchaseOrder.id,
        supplierId: currentPurchaseOrder.supplierId,
        storeId: currentPurchaseOrder.storeId,
        note: currentPurchaseOrder.note,
        date: currentPurchaseOrder.date,
        items: currentPurchaseOrder.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      };

      await updatePurchase(dataToSend).unwrap();
      refetch();
      toast.success("Purchase order updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update purchase order");
    }
  };

  // Delete the purchase order
  const handleDeleteOrder = async () => {
    if (!currentPurchaseOrder.id) {
      toast.error("Cannot delete. Save the order first.");
      return;
    }

    try {
      await deletePurchase(currentPurchaseOrder.id).unwrap();
      handleResetOrder(); // Reset form after deleting
      refetch();
      toast.success("Purchase order deleted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete purchase order");
    }
  };
  

  // Post the purchase order
  const handlePostOrder = async () => {
    if (!currentPurchaseOrder.id) {
      toast.error("Please save the order before posting.");
      return;
    }

    try {
      await togglePostPurchase(currentPurchaseOrder.id).unwrap();
      setCurrentPurchaseOrder(prev => ({ ...prev, isPosted: true }));
      refetch();
      toast.success("Purchase order posted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to post purchase order");
    }
  };

  // Unpost the purchase order
  const handleUnpostOrder = async () => {
    if (!currentPurchaseOrder.id) {
      toast.error("No order to unpost.");
      return;
    }

    try {
      await togglePostPurchase(currentPurchaseOrder.id).unwrap();
      setCurrentPurchaseOrder(prev => ({ ...prev, isPosted: false }));
      refetch();
      toast.success("Purchase order unposted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to unpost purchase order");
    }
  };

  // Search functionality
  const handleSearchClick = () => setSearchDialogOpen(true);
  //const handleSearchClick = () => setOpenSearchDialog(true);

  const handleSearchSubmit = () => {
    refetch();
    setOpenSearchDialog(false);
  };

  const handleRefreshClick = () => {
    setSearchParams({ id: "", storeId: "", supplierId: "" });
    refetch();
  };

  // Pagination
  const handleNextPage = () => {
    if (currentPage < (purchaseData?.totalPages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Load server data when available
  useEffect(() => {
    if (!isFetching && purchaseData?.purchases) {
      setServerData(purchaseData.purchases);
    }
  }, [isFetching, purchaseData]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Custom operations buttons rendering based on order state
  const renderOperationsButtons = () => {
    if (!currentPurchaseOrder.isSaved) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveOrder}
            disabled={isSaving || !currentPurchaseOrder.supplierId || !currentPurchaseOrder.storeId || currentPurchaseOrder.items.length === 0}
            sx={{ minWidth: 120 }}
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save Order"}
          </Button>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveOrder}
            disabled={isSaving}
            sx={{ minWidth: 120 }}
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save Order"}
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleUpdateOrder}
            sx={{ minWidth: 120, ml: 2 }}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteOrder}
            sx={{ minWidth: 120, ml: 2 }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostOrder}
            sx={{ minWidth: 120, ml: 2 }}
          >
            Post
          </Button>
        </Box>
      );
    }
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
        <Box sx={{ flex: 1, padding: theme.spacing(15), overflow: "auto" }}>
          {/* Custom Operations Buttons */}
          <OperationsButtons
            onSearchClick={handleSearchClick}
            onSaveClick={handleSaveOrder}
            onResetClick={handleResetOrder}
            onPostClick={handlePostOrder}
            onUnpostClick={handleUnpostOrder}
            onDeleteClick={handleDeleteOrder}
            onUpdateClick={handleUpdateOrder}
            showActionButtons={currentPurchaseOrder.isSaved} // Pass if order is saved
            isPosted={currentPurchaseOrder.isPosted} // Pass the posted status
          />

          {/* Purchase Form */}
          <Paper sx={{ p: 3, mb: 3, mt: 2, backgroundColor: 'white', boxShadow: 'none' }}>
            <Grid container spacing={2}>
              {/* Supplier Field */}
              <Grid item xs={12} md={4}>
  <Autocomplete
    options={suppliersData.suppliers || []}
    getOptionLabel={(option) => option.fullName}
    value={suppliersData.suppliers?.find(s => s.id === currentPurchaseOrder.supplierId) || null}
    onChange={(_, newValue) => setCurrentPurchaseOrder(prev => ({ 
      ...prev, 
      supplierId: newValue ? newValue.id : "" 
    }))}
    disabled={isLoadingSuppliers || currentPurchaseOrder.isPosted || isSaving}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Supplier"
        sx={{ height: '56px' }}
      />
    )}
  />
</Grid>

              {/* Store Field */}
              <Grid item xs={12} md={4}>
  <Autocomplete
    options={storesData.stores || []}
    getOptionLabel={(option) => option.name}
    value={storesData.stores?.find(s => s.id === currentPurchaseOrder.storeId) || null}
    onChange={(_, newValue) => setCurrentPurchaseOrder(prev => ({ 
      ...prev, 
      storeId: newValue ? newValue.id : "" 
    }))}
    disabled={isLoadingStores || currentPurchaseOrder.isPosted || isSaving}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Store"
        sx={{ height: '56px' }}
      />
    )}
  />
</Grid>

              {/* Note Field */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Note"
                  value={currentPurchaseOrder.note}
                  onChange={(e) => setCurrentPurchaseOrder(prev => ({ ...prev, note: e.target.value }))}
                  disabled={currentPurchaseOrder.isPosted || isSaving}
                  sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                />
              </Grid>

              {/* Date Field */}
              <Grid item xs={12} md={2}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  value={currentPurchaseOrder.date}
                  onChange={(e) => setCurrentPurchaseOrder(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  disabled={currentPurchaseOrder.isPosted || isSaving}
                  sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Button to open Add Item Dialog */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaPlus />}
              onClick={handleOpenItemDialog}
              disabled={currentPurchaseOrder.isPosted || isSaving}
            >
              Add Items to Order
            </Button>
          </Box>

          {/* Order Items Table */}
          <Box sx={{ padding: 1, mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    {columns.map((col) => (
                      <TableCell key={col} sx={styles.headerCell}>
                        {col === 'times' ? 'Total' : col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                      </TableCell>
                    ))}
                    <TableCell sx={styles.headerCell}>Edit</TableCell>
                    <TableCell sx={styles.headerCell}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPurchaseOrder.items.length > 0 ? (
                    currentPurchaseOrder.items.map((item) => (
                      <TableRow key={item.id} sx={styles.tableRow}>
                        {columns.map((col) => (
                          <TableCell key={col} sx={styles.cell}>
                            {renderCell(item, col)}
                          </TableCell>
                        ))}
                        <TableCell sx={styles.cell}>
                          <IconButton
                            color="primary"
                            onClick={() => handleDialogOpen('edit', item)}
                            disabled={currentPurchaseOrder.isPosted || isSaving}
                            sx={styles.iconButton}
                          >
                            <FaEdit />
                          </IconButton>
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          <IconButton
                            color="error"
                            onClick={() => handleDialogOpen('delete', item)}
                            disabled={currentPurchaseOrder.isPosted || isSaving}
                            sx={styles.iconButton}
                          >
                            <FaTrash />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 2} align="center">
                        No items in current order. Add some items to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Order Summary */}
            {currentPurchaseOrder.items.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="h6">
                  Total: {currentPurchaseOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                </Typography>
              </Box>
            )}

            {renderEditDialog()}

            <ConfirmationDialog
              open={activeDialog.type === 'delete'}
              title="Confirm Delete"
              content="Are you sure you want to delete this item from the order?"
              onConfirm={() => {
                handleRemoveItem(activeDialog.data.id);
                handleDialogClose();
              }}
              onCancel={handleDialogClose}
              confirmButtonColor="error"
              confirmText="Delete"
            />
          </Box>

          {/* Previous Orders (if needed) */}
          {serverData.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Previous Orders</Typography>
              {/* Table of previous orders would go here */}
              <Pagination
                currentPage={currentPage}
                totalPages={purchaseData?.totalPages || 1}
                onNext={handleNextPage}
                onPrev={handlePrevPage}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Footer />

      {/* Multi-Item Dialog */}
      <Dialog open={openItemDialog} onClose={handleCloseItemDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Purchase Items</DialogTitle>
        <DialogContent>
          {multipleItems.map((item, index) => (
            <Grid container spacing={2} sx={{ mt: index > 0 ? 3 : 1, pb: 2, borderBottom: index < multipleItems.length - 1 ? 1 : 0, borderColor: 'divider' }} key={index}>
              <Grid item xs={12} md={4}>
  <Autocomplete
    options={productsData.products || []}
    getOptionLabel={(option) => `${option.name} (${option.code})`}
    value={productsData.products?.find(p => p.id === item.productId) || null}
    onChange={(_, newValue) => {
      if (newValue) {
        handleMultipleProductChange(index, newValue.id);
      }
    }}
    disabled={isLoadingProducts || currentPurchaseOrder.isPosted || isSaving}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Product"
      />
    )}
  />
</Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  disabled={!item.productId || currentPurchaseOrder.isPosted || isSaving}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={item.price}
                  disabled={true}
                  helperText="Auto-filled from product database"
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
                {index > 0 && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItemRow(index)}
                    disabled={currentPurchaseOrder.isPosted || isSaving}
                  >
                    <FaTrash />
                  </IconButton>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2">
                    Total: {item.quantity && item.price ? (parseFloat(item.quantity) * parseFloat(item.price)).toFixed(2) : "0.00"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ))}

          <Button
            onClick={handleAddAnotherItem}
            color="primary"
            variant="outlined"
            startIcon={<FaPlus />}
            sx={{ mt: 2 }}
            disabled={currentPurchaseOrder.isPosted || isSaving}
          >
            Add Another Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitAllItems}
            color="primary"
            variant="contained"
            disabled={multipleItems.every(item => !item.productId || !item.quantity) || currentPurchaseOrder.isPosted || isSaving}
          >
            Add All Items to Order
          </Button>
        </DialogActions>
       </Dialog>
{/* Search Dialog */}
<PurchaseSearchDialog
  open={searchDialogOpen}
  onClose={() => setSearchDialogOpen(false)}
  filters={searchParams}
  onFilterChange={handleFilterChange}
  onViewPurchase={handleViewPurchase}
  suppliers={suppliersData.suppliers || []}
  stores={storesData.stores || []}
  products={productsData.products || []} // Add this line
  fetchPurchases={async (params) => {
    const result = await refetch(params);
    return result.data;
  }}
/>
     </Box>
                    );
                  };
                  
                  export default Purchasing;