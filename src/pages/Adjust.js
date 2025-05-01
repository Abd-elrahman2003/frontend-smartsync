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
import AdjustSearchDialog from "../components/Shared/AdjustSearchDialog";
import Pagination from "../components/Common/Pagination";
import {
  useGetAdjustsQuery,
  useCreateAdjustMutation,
  useUpdateAdjustMutation,
  useDeleteAdjustMutation,
  useTogglePostAdjustMutation,
} from "../Redux/Featuress/Adjust/adjustApi";
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

// Available adjust types for the dropdown
const ADJUST_TYPES = [
  { id: "ADJUST_ADD", label: "Add Stock" },
  { id: "ADUST_REMOVE", label: "Remove Stock" }
];

const Adjust = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    id: "",
    storeId: "",
    dateFrom: "",
    dateTo: ""
  });

  // Client-side state for current adjust order
  const [currentAdjustOrder, setCurrentAdjustOrder] = useState({
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

  // State for server data (existing adjust orders)
  const [serverData, setServerData] = useState([]);
  const [activeDialog, setActiveDialog] = useState({ type: null, data: null });
  const [editData, setEditData] = useState({
    quantity: '',
    price: '',
    type: 'ADJUST_ADD'
  });

  // State for multiple items in a single dialog
  const [multipleItems, setMultipleItems] = useState([{
    productId: "",
    productName: "",
    productCode: "",
    quantity: "",
    price: '',
    type: "ADJUST_ADD"
  }]);

  // Queries
  const {
    data: adjustData = {},
    isLoading,
    isFetching,
    refetch
  } = useGetAdjustsQuery({
    page: currentPage,
    id: searchParams.id,
    storeId: searchParams.storeId,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo
  }, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: storesData = {},
    isLoading: isLoadingStores
  } = useGetStoresQuery(1);

  const {
    data: productsData = {},
    isLoading: isLoadingProducts
  } = useGetProductsQuery(1);

  // Mutations
  const [createAdjust] = useCreateAdjustMutation();
  const [updateAdjust] = useUpdateAdjustMutation();
  const [deleteAdjust] = useDeleteAdjustMutation();
  const [postAdjustOrder] = useTogglePostAdjustMutation();

  const columns = ["productName", "productCode", "adjustType", "quantity", "price", "times"];

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
        price: rowData.price || '',
        type: rowData.type || 'ADJUST_ADD'
      });
    }
  };

  const handleDialogClose = () => {
    setActiveDialog({ type: null, data: null });
    setEditData({ quantity: '', price: '', type: 'ADJUST_ADD' });
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
      price: '',
      type: "ADJUST_ADD"
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
        price: '',
        type: "ADJUST_ADD"
      }
    ]);
  };

  const handleAdjustFilterChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
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
        ...updatedItems[index],
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

  // Update the adjust type change handler for multiple items
  const handleAdjustTypeChange = (index, typeId) => {
    const updatedItems = [...multipleItems];
    updatedItems[index].type = typeId;
    setMultipleItems(updatedItems);
  };

  // Handle submitting all items at once
  const handleSubmitAllItems = () => {
    // Validate items
    const validItems = multipleItems.filter(item =>
      item.productId && item.quantity && parseFloat(item.quantity) > 0 && item.type
    );

    if (validItems.length === 0) {
      toast.error("Please add at least one valid item with product, quantity, and adjustment type");
      return;
    }

    // Add all valid items to the current adjust order
    const itemsWithIds = validItems.map(item => ({
      ...item,
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      times: parseFloat(item.quantity) * parseFloat(item.price)
    }));

    setCurrentAdjustOrder(prev => ({
      ...prev,
      items: [...prev.items, ...itemsWithIds]
    }));

    // Reset and close dialog
    setMultipleItems([{
      productId: "",
      productName: "",
      productCode: "",
      quantity: "",
      price: '',
      type: "ADJUST_ADD"
    }]);

    setOpenItemDialog(false);
    toast.success(`${validItems.length} item(s) added to adjustment`);
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
      case 'adjustType':
        return row.type === 'ADJUST_ADD' ? 'Add Stock' : 'Remove Stock';
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
        <FormControl fullWidth margin="normal" disabled={currentAdjustOrder.isPosted || isSaving}>
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
            disabled={isLoadingProducts || currentAdjustOrder.isPosted || isSaving}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product"
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
          <Autocomplete
            options={ADJUST_TYPES}
            getOptionLabel={(option) => option.label}
            value={ADJUST_TYPES.find(type => type.id === editData.type) || ADJUST_TYPES[0]}
            onChange={(_, newValue) => {
              if (newValue) {
                setEditData(prev => ({
                  ...prev,
                  type: newValue.id
                }));
              }
            }}
            disabled={currentAdjustOrder.isPosted || isSaving}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Adjustment Type"
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
  
    setCurrentAdjustOrder(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === activeDialog.data.id) {
          return {
            ...item,
            productId: activeDialog.data.productId,
            productName: activeDialog.data.productName,
            productCode: activeDialog.data.productCode,
            quantity: editData.quantity,
            price: activeDialog.data.price,
            type: editData.type,
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
    setCurrentAdjustOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));

    toast.success("Item removed from adjustment");
  };

  // Add this handler to load the selected adjust order
  const handleViewAdjust = (adjust) => {
    setCurrentAdjustOrder({
      storeId: adjust.storeId,
      note: adjust.note,
      date: new Date(adjust.date).toISOString().split('T')[0],
      items: adjust.adjustProduct.map(ap => ({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId: ap.transaction.productId,
        productName: ap.transaction.product.name,
        productCode: ap.transaction.product.code,
        quantity: ap.transaction.quantity,
        price: ap.transaction.price,
        type: ap.transaction.type,
        times: ap.transaction.quantity * ap.transaction.price
      })),
      isPosted: adjust.post,
      isSaved: true,
      id: adjust.id
    });
    setSearchDialogOpen(false);
  };

  // Save the entire adjust order to the server
  const handleSaveOrder = async () => {
    if (!currentAdjustOrder.storeId || currentAdjustOrder.items.length === 0) {
      toast.error("Please fill all required fields before saving.");
      return false;
    }

    try {
      setIsSaving(true);
      const dataToSend = {
        storeId: currentAdjustOrder.storeId,
        note: currentAdjustOrder.note,
        date: currentAdjustOrder.date,
        items: currentAdjustOrder.items.map(item => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          type: item.type,
        })),
      };

      const result = await createAdjust(dataToSend).unwrap();
      const orderId = result.adjustOrder?.id;

      if (!orderId) {
        toast.error("Failed to get order ID after saving.");
        return false;
      }

      setCurrentAdjustOrder(prev => ({
        ...prev,
        id: orderId,
        isSaved: true,
      }));

      refetch();
      toast.success("Adjustment order saved successfully!");
      return true;
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save adjustment order");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Reset the current adjust order
  const handleResetOrder = () => {
    setCurrentAdjustOrder({
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

  // Update the adjust order
  const handleUpdateOrder = async () => {
    if (!currentAdjustOrder.id) {
      toast.error("Please save the order first before updating.");
      return;
    }

    try {
      const dataToSend = {
        headerId: currentAdjustOrder.id,
        storeId: currentAdjustOrder.storeId,
        note: currentAdjustOrder.note,
        date: currentAdjustOrder.date,
        items: currentAdjustOrder.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          type: item.type,
        })),
      };

      await updateAdjust(dataToSend).unwrap();
      refetch();
      toast.success("Adjustment order updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update adjustment order");
    }
  };

  // Delete the adjust order
  const handleDeleteOrder = async () => {
    if (!currentAdjustOrder.id) {
      toast.error("Cannot delete. Save the order first.");
      return;
    }

    try {
      await deleteAdjust(currentAdjustOrder.id).unwrap();
      handleResetOrder();
      refetch();
      toast.success("Adjustment order deleted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete adjustment order");
    }
  };
  
  // Post the adjust order
  const handlePostOrder = async () => {
    if (!currentAdjustOrder.id) {
      toast.error("Please save the order before posting.");
      return;
    }

    try {
      await postAdjustOrder(currentAdjustOrder.id).unwrap();
      setCurrentAdjustOrder(prev => ({ ...prev, isPosted: true }));
      refetch();
      toast.success("Adjustment order posted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to post adjustment order");
    }
  };

  // Search functionality
  const handleSearchClick = () => setSearchDialogOpen(true);

  const handleSearchSubmit = () => {
    refetch();
    setOpenSearchDialog(false);
  };

  const handleRefreshClick = () => {
    setSearchParams({ id: "", storeId: "" });
    refetch();
  };

  // Pagination
  const handleNextPage = () => {
    if (currentPage < (adjustData?.totalPages || 1)) {
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
    if (!isFetching && adjustData?.orders) {
      setServerData(adjustData.orders);
      
      // Ensure currentPage is within bounds
      if (currentPage > (adjustData.totalPages || 1)) {
        setCurrentPage(1);
      }
    }
  }, [isFetching, adjustData, currentPage]);

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
          {/* Custom Operations Buttons */}
          <OperationsButtons
            onSearchClick={handleSearchClick}
            onSaveClick={handleSaveOrder}
            onResetClick={handleResetOrder}
            onPostClick={handlePostOrder}
            onDeleteClick={handleDeleteOrder}
            onUpdateClick={handleUpdateOrder}
            showActionButtons={currentAdjustOrder.isSaved}
            isPosted={currentAdjustOrder.isPosted}
            // No unpost functionality for adjust orders based on the backend
            hideUnpost={true}
          />

          {/* Adjust Form */}
          <Paper sx={{ p: 3, mb: 3, mt: 2, backgroundColor: 'white', boxShadow: 'none' }}>
            <Grid container spacing={2}>
              {/* Store Field */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={storesData.stores || []}
                  getOptionLabel={(option) => option.name}
                  value={storesData.stores?.find(s => s.id === currentAdjustOrder.storeId) || null}
                  onChange={(_, newValue) => setCurrentAdjustOrder(prev => ({ 
                    ...prev, 
                    storeId: newValue ? newValue.id : "" 
                  }))}
                  disabled={isLoadingStores || currentAdjustOrder.isPosted || isSaving}
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
              <Grid item xs={12} md={3.5}>
                <TextField
                  fullWidth
                  label="Note"
                  value={currentAdjustOrder.note}
                  onChange={(e) => setCurrentAdjustOrder(prev => ({ ...prev, note: e.target.value }))}
                  disabled={currentAdjustOrder.isPosted || isSaving}
                  sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                />
              </Grid>

              {/* Date Field */}
              <Grid item xs={12} md={3}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  value={currentAdjustOrder.date}
                  onChange={(e) => setCurrentAdjustOrder(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  disabled={currentAdjustOrder.isPosted || isSaving}
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
              disabled={currentAdjustOrder.isPosted || isSaving}
            >
              Add Items
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
                        {col === 'adjustType' ? 'Adjust Type' : col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                      </TableCell>
                    ))}
                    <TableCell sx={styles.headerCell}>Edit</TableCell>
                    <TableCell sx={styles.headerCell}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentAdjustOrder.items.length > 0 ? (
                    currentAdjustOrder.items.map((item) => (
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
                            disabled={currentAdjustOrder.isPosted || isSaving}
                            sx={styles.iconButton}
                          >
                            <FaEdit />
                          </IconButton>
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          <IconButton
                            color="error"
                            onClick={() => handleDialogOpen('delete', item)}
                            disabled={currentAdjustOrder.isPosted || isSaving}
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
                        No items in current adjustment. Add some items to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Order Summary */}
            {currentAdjustOrder.items.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="h6">
                  Total Value: {currentAdjustOrder.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                </Typography>
              </Box>
            )}

            {renderEditDialog()}

            <ConfirmationDialog
              open={activeDialog.type === 'delete'}
              title="Confirm Delete"
              content="Are you sure you want to delete this item from the adjustment?"
              onConfirm={() => {
                handleRemoveItem(activeDialog.data.id);
                handleDialogClose();
              }}
              onCancel={handleDialogClose}
              confirmButtonColor="error"
              confirmText="Delete"
            />
          </Box>
        </Box>
      </Box>
      <Footer />

      {/* Multi-Item Dialog with Adjust Type Autocomplete */}
      <Dialog open={openItemDialog} onClose={handleCloseItemDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Adjustment Items</DialogTitle>
        <DialogContent>
          {multipleItems.map((item, index) => (
            <Grid container spacing={2} sx={{ mt: index > 0 ? 3 : 1, pb: 2, borderBottom: index < multipleItems.length - 1 ? 1 : 0, borderColor: 'divider' }} key={index}>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={productsData.products || []}
                  getOptionLabel={(option) => `${option.name} (${option.code})`}
                  value={productsData.products?.find(p => p.id === item.productId) || null}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      handleMultipleProductChange(index, newValue.id);
                    }
                  }}
                  disabled={isLoadingProducts || currentAdjustOrder.isPosted || isSaving}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Product"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={ADJUST_TYPES}
                  getOptionLabel={(option) => option.label}
                  value={ADJUST_TYPES.find(type => type.id === item.type) || ADJUST_TYPES[0]}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      handleAdjustTypeChange(index, newValue.id);
                    }
                  }}
                  disabled={currentAdjustOrder.isPosted || isSaving}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Adjust Type"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  disabled={!item.productId || currentAdjustOrder.isPosted || isSaving}
                />
              </Grid>
              <Grid item xs={12} md={2}>
  <TextField
    fullWidth
    label="Price"
    type="number"
    value={item.price}
    disabled={true}
    helperText="Auto-filled from product database"
  />
</Grid>
<Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center", gap: 1, mt: -5 }}>
  {index > 0 && (
    <IconButton
      color="error"
      onClick={() => handleRemoveItemRow(index)}
      disabled={currentAdjustOrder.isPosted || isSaving}
    >
      <FaTrash />
    </IconButton>
  )}
  <IconButton
    color="primary"
    variant="outlined"
    onClick={handleAddAnotherItem}
    disabled={currentAdjustOrder.isPosted || isSaving}
  >
    <FaPlus />
  </IconButton>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitAllItems}
            color="primary"
            variant="contained"
            disabled={multipleItems.every(item => !item.productId || !item.quantity) || currentAdjustOrder.isPosted || isSaving}
          >
            Add All Items
          </Button>
        </DialogActions>
      </Dialog>


      {/* Search Dialog */}
<AdjustSearchDialog
  open={searchDialogOpen}
  onClose={() => setSearchDialogOpen(false)}
  filters={searchParams}
  onFilterChange={handleAdjustFilterChange}
  onViewAdjust={handleViewAdjust}
  stores={storesData.stores || []}
  products={productsData.products || []}
  fetchAdjusts={async (params) => {
    if (params.page) {
      setCurrentPage(params.page);
    }
    
    setSearchParams((prev) => ({
      ...searchParams,
      ...params,
    }));
    
    const fetchResult = await refetch({
      ...params,
      page: params.page,
    });
    
    return fetchResult.data;
  }}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
/>
    </Box>
  );
};
    
export default Adjust;