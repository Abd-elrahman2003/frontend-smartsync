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
import ReturnedButtons from "../components/Shared/ReturnedButtons";
import ReturnedPurchaseSearchDialog from "../components/Shared/ReturnedPurchaseSearchDialog";
import PurchaseSearchDialog from "../components/Shared/PurchaseSearchDialog";
import Pagination from "../components/Common/Pagination";
import {
  useGetPurchasesQuery,
  useGetReturnPurchasesQuery,
  useCreateReturnPurchaseMutation,
  useUpdateReturnPurchaseMutation,
  useDeleteReturnPurchaseMutation,
  useTogglePostReturnPurchaseMutation,
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

const ReturnPurchase = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [returnSearchDialogOpen, setReturnSearchDialogOpen] = useState(false);
  const [receiveSearchDialogOpen, setReceiveSearchDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1);
  
  // Separate search params for each dialog
  const [returnSearchParams, setReturnSearchParams] = useState({
    id: "",
    receiveId: "",
    storeId: "",
    supplierId: "",
    dateFrom: "",
    dateTo: "",
    productId: "",
    isPosted: ""
  });

  const [purchaseSearchParams, setPurchaseSearchParams] = useState({
    id: "",
    storeId: "",
    supplierId: "",
    dateFrom: "",
    dateTo: "",
    productId: "",
    isPosted: ""
  });

  // Client-side state for current return purchase order
  const [currentReturnOrder, setCurrentReturnOrder] = useState({
    receiveId: "",
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

  // State for server data (existing return orders)
  const [serverData, setServerData] = useState([]);
  const [activeDialog, setActiveDialog] = useState({ type: null, data: null });
  const [editData, setEditData] = useState({
    quantity: '',
    price: ''
  });

  // Separate queries with their own search params
  const {
    data: returnPurchaseData = {},
    isLoading: isLoadingReturns,
    isFetching: isFetchingReturns,
    refetch: refetchReturns
  } = useGetReturnPurchasesQuery({
    page: currentPage,
    id: returnSearchParams.id,
    receiveId: returnSearchParams.receiveId,
    supplierId: returnSearchParams.supplierId,  // Verify this is being used in the API
    storeId: returnSearchParams.storeId,        // Verify this is being used in the API
    dateFrom: returnSearchParams.dateFrom,
    dateTo: returnSearchParams.dateTo,
    productId: returnSearchParams.productId,
    isPosted: returnSearchParams.isPosted
  }, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: purchasesData = {},
    isLoading: isLoadingPurchases,
    refetch: refetchPurchases
  } = useGetPurchasesQuery({
    page: purchaseCurrentPage, // Use the new state variable
    id: purchaseSearchParams.id,
    supplierId: purchaseSearchParams.supplierId,
    storeId: purchaseSearchParams.storeId,
    dateFrom: purchaseSearchParams.dateFrom,
    dateTo: purchaseSearchParams.dateTo,
    productId: purchaseSearchParams.productId,
    isPosted: purchaseSearchParams.isPosted
  }, {
    refetchOnMountOrArgChange: true
  });
  
  // State for multiple items in a single dialog
  const [multipleItems, setMultipleItems] = useState([{
    productId: "",
    productName: "",
    productCode: "",
    quantity: "",
    price: ""
  }]);

  // Other queries
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
  const [createReturnPurchase] = useCreateReturnPurchaseMutation();
  const [updateReturnPurchase] = useUpdateReturnPurchaseMutation();
  const [deleteReturnPurchase] = useDeleteReturnPurchaseMutation();
  const [togglePostReturnPurchase] = useTogglePostReturnPurchaseMutation();

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

    // Add all valid items to the current return order
    const itemsWithIds = validItems.map(item => ({
      ...item,
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      times: parseFloat(item.quantity) * parseFloat(item.price)
    }));

    setCurrentReturnOrder(prev => ({
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
    toast.success(`${validItems.length} item(s) added to return order`);
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
      <DialogTitle>Edit Return Item</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Return Quantity"
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

  // Filter change handlers for each dialog
  const handleReturnFilterChange = (field, value) => {
    setReturnSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePurchaseFilterChange = (field, value) => {
    setPurchaseSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Edit item in current order
  const handleEditItem = () => {
    if (!activeDialog.data || !editData.quantity) return;
  
    setCurrentReturnOrder(prev => {
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
    setCurrentReturnOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));

    toast.success("Item removed from return order");
  };

  // Handler to load the selected return purchase
  const handleViewReturnPurchase = (returnPurchase) => {
    setCurrentReturnOrder({
      receiveId: returnPurchase.id,
      supplierId: returnPurchase.supplierId,
      storeId: returnPurchase.storeId,
      note: `Return for purchase #${returnPurchase.id}`,
      date: new Date().toISOString().split('T')[0],
      items: returnPurchase.items.map(item => ({
        ...item,
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        quantity: item.quantity, // Use the received quantity as a starting point
        times: item.quantity * item.price // Calculate the times value
      })),
      isPosted: false,
      isSaved: false,
      id: null
    });
    setReturnSearchDialogOpen(false);
  };

  // Handler to load received purchase data
  const handleViewReceivedPurchase = (receivedPurchase) => {
    // Pre-fill the return form with data from the received purchase
    setCurrentReturnOrder({
      receiveId: receivedPurchase.id,
      supplierId: receivedPurchase.supplierId,
      storeId: receivedPurchase.storeId,
      note: `Return for purchase #${receivedPurchase.id}`,
      date: new Date().toISOString().split('T')[0],
      items: receivedPurchase.items.map(item => ({
        ...item,
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        quantity: item.quantity, // Use the received quantity as a starting point
        times: item.quantity * item.price // Calculate the times value
      })),
      isPosted: false,
      isSaved: false,
      id: null
    });
    setReceiveSearchDialogOpen(false);
  };

  // Save the entire return purchase order to the server
  const handleSaveOrder = async () => {
    if (!currentReturnOrder.receiveId || !currentReturnOrder.supplierId || !currentReturnOrder.storeId || currentReturnOrder.items.length === 0) {
      toast.error("Please fill all required fields before saving.");
      return false;
    }

    // Check if any items have quantity
    const hasItemsWithQuantity = currentReturnOrder.items.some(item => 
      item.quantity && parseFloat(item.quantity) > 0
    );

    if (!hasItemsWithQuantity) {
      toast.error("Please add at least one item with quantity greater than 0");
      return false;
    }

    try {
      setIsSaving(true);
      const dataToSend = {
        purchaseHeaderId: currentReturnOrder.receiveId,
        note: currentReturnOrder.note,
        items: currentReturnOrder.items
          .filter(item => item.quantity && parseFloat(item.quantity) > 0)
          .map(item => ({
              productId: item.productId,
              quantity: parseFloat(item.quantity)
          }))
      };
      
      console.log(dataToSend);

      const result = await createReturnPurchase(dataToSend).unwrap();

      // Update how you access the ID and set the state:
      const orderId = result.returnOrder?.id;
      
      if (!orderId) {
        toast.error("Failed to get order ID after saving. Check console.");
        return false;
      }
      
      setCurrentReturnOrder(prev => ({
        ...prev,
        id: orderId,
        isSaved: true,
        isPosted: result.returnOrder.post
      }));

      refetchReturns();
      toast.success("Return order saved successfully!");
      return true;
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save return order");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Reset the current return purchase order
  const handleResetOrder = () => {
    setCurrentReturnOrder({
      receiveId: "",
      supplierId: "",
      storeId: "",
      note: "",
      date: new Date().toISOString().split('T')[0],
      items: [],
      isPosted: false,
      isSaved: false,
      id: null
    });

    toast.info("Return order has been reset");
  };

  // Update the return purchase order
  const handleUpdateOrder = async () => {
    if (!currentReturnOrder.id) {
      toast.error("Please save the return order first before updating.");
      return;
    }

    try {
      const dataToSend = {
        headerId: currentReturnOrder.id,
        receiveId: currentReturnOrder.receiveId,
        supplierId: currentReturnOrder.supplierId,
        storeId: currentReturnOrder.storeId,
        note: currentReturnOrder.note,
        date: currentReturnOrder.date,
        items: currentReturnOrder.items
          .filter(item => item.quantity && parseFloat(item.quantity) > 0)
          .map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
      };

      await updateReturnPurchase(dataToSend).unwrap();
      refetchReturns();
      toast.success("Return order updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update return order");
    }
  };

  // Delete the return purchase order
  const handleDeleteOrder = async () => {
    if (!currentReturnOrder.id) {
      toast.error("Cannot delete. Save the return order first.");
      return;
    }

    try {
      await deleteReturnPurchase(currentReturnOrder.id).unwrap();
      handleResetOrder();
      refetchReturns();
      toast.success("Return order deleted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete return order");
    }
  };

  // Post the return purchase order
  const handlePostOrder = async () => {
    if (!currentReturnOrder.id) {
      toast.error("Please save the return order before posting.");
      return;
    }

    try {
      await togglePostReturnPurchase(currentReturnOrder.id).unwrap();
      setCurrentReturnOrder(prev => ({ ...prev, isPosted: true }));
      refetchReturns();
      toast.success("Return order posted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to post return order");
    }
  };

  // Unpost the return purchase order
  const handleUnpostOrder = async () => {
    if (!currentReturnOrder.id) {
      toast.error("No return order to unpost.");
      return;
    }

    try {
      await togglePostReturnPurchase(currentReturnOrder.id).unwrap();
      setCurrentReturnOrder(prev => ({ ...prev, isPosted: false }));
      refetchReturns();
      toast.success("Return order unposted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to unpost return order");
    }
  };

  // Search functionalities
  const handleReturnSearchClick = () => setReturnSearchDialogOpen(true);
  const handleReceiveSearchClick = () => setReceiveSearchDialogOpen(true);

  // Pagination
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, returnPurchaseData?.totalPages || 1));
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Load server data when available
  useEffect(() => {
    if (!isFetchingReturns && returnPurchaseData?.returnPurchases) {
      setServerData(returnPurchaseData.returnPurchases);
    }
  }, [isFetchingReturns, returnPurchaseData]);

  if (isLoadingReturns) {
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
          <ReturnedButtons
            onSearchClick={handleReturnSearchClick}
            onReturnSearchClick={handleReceiveSearchClick}
            onSaveClick={handleSaveOrder}
            onResetClick={handleResetOrder}
            onPostClick={handlePostOrder}
            onUnpostClick={handleUnpostOrder}
            onDeleteClick={handleDeleteOrder}
            onUpdateClick={handleUpdateOrder}
            showActionButtons={currentReturnOrder.isSaved}
            isPosted={currentReturnOrder.isPosted}
          />

          {/* Return Purchase Form */}
          <Paper sx={{ p: 3, mb: 3, mt: 2, backgroundColor: 'white', boxShadow: 'none' }}>
            <Grid container spacing={2}>
              {/* Received Purchase ID Field (read-only) */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Received Purchase ID"
                  value={currentReturnOrder.receiveId}
                  disabled={true}
                  sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                />
              </Grid>

              {/* Supplier Field */}
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={suppliersData.suppliers || []}
                  getOptionLabel={(option) => option.fullName}
                  value={suppliersData.suppliers?.find(s => s.id === currentReturnOrder.supplierId) || null}
                  onChange={(_, newValue) => setCurrentReturnOrder(prev => ({ 
                    ...prev, 
                    supplierId: newValue ? newValue.id : "" 
                  }))}
                  disabled={isLoadingSuppliers || currentReturnOrder.isPosted || isSaving || currentReturnOrder.receiveId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier"
                      disabled={true}
                      sx={{ height: '56px' }}
                    />
                  )}
                />
              </Grid>

              {/* Store Field */}
              <Grid item xs={12} md={2}>
                <Autocomplete
                  options={storesData.stores || []}
                  getOptionLabel={(option) => option.name}
                  value={storesData.stores?.find(s => s.id === currentReturnOrder.storeId) || null}
                  onChange={(_, newValue) => setCurrentReturnOrder(prev => ({ 
                    ...prev, 
                    storeId: newValue ? newValue.id : "" 
                  }))}
                  disabled={isLoadingStores || currentReturnOrder.isPosted || isSaving || currentReturnOrder.receiveId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Store"
                      disabled={true}
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
                  value={currentReturnOrder.note}
                  onChange={(e) => setCurrentReturnOrder(prev => ({ ...prev, note: e.target.value }))}
                  disabled={currentReturnOrder.isPosted || isSaving}
                  sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                />
              </Grid>

              {/* Date Field */}
              <Grid item xs={12} md={2}>
                <TextField
                  name="date"
                  label="Return Date"
                  type="date"
                  value={currentReturnOrder.date}
                  onChange={(e) => setCurrentReturnOrder(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  disabled={currentReturnOrder.isPosted || isSaving}
                  sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Return Items Table */}
          <Box sx={{ padding: 1, mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    {columns.map((col) => (
                      <TableCell key={col} sx={styles.headerCell}>
                        {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                      </TableCell>
                    ))}
                    <TableCell sx={styles.headerCell}>Edit</TableCell>
                    <TableCell sx={styles.headerCell}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentReturnOrder.items.length > 0 ? (
                    currentReturnOrder.items.map((item) => (
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
                            disabled={currentReturnOrder.isPosted || isSaving}
                            sx={styles.iconButton}
                          >
                            <FaEdit />
                          </IconButton>
                        </TableCell>
                        <TableCell sx={styles.cell}>
                          <IconButton
                            color="error"
                            onClick={() => handleDialogOpen('delete', item)}
                            disabled={currentReturnOrder.isPosted || isSaving}
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
                        No items in current return order. Select a received purchase or add items manually.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Order Summary */}
            {currentReturnOrder.items.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="h6">
                  Total Return Amount: {
                    currentReturnOrder.items
                      .reduce((sum, item) => {
                        const quantity = parseFloat(item.quantity) || 0;
                        const price = parseFloat(item.price) || 0;
                        return sum + (quantity * price);
                      }, 0)
                      .toFixed(2)
                  }
                </Typography>
              </Box>
            )}

            {renderEditDialog()}

            <ConfirmationDialog
              open={activeDialog.type === 'delete'}
              title="Confirm Delete"
              content="Are you sure you want to delete this item from the return order?"
              onConfirm={() => {
                handleRemoveItem(activeDialog.data.id);
                handleDialogClose();
              }}
              onCancel={handleDialogClose}
              confirmButtonColor="error"
              confirmText="Delete"
            />
          </Box>

          {/* Previous Return Orders (if needed) */}
          {serverData.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Previous Return Orders</Typography>
              <Pagination
                currentPage={currentPage}
                totalPages={returnPurchaseData?.totalPages || 1}
                onNext={handleNextPage}
                onPrev={handlePrevPage}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Footer />

      {/* Return Purchase Search Dialog */}
<ReturnedPurchaseSearchDialog
  open={returnSearchDialogOpen}
  onClose={() => setReturnSearchDialogOpen(false)}
  filters={returnSearchParams}
  onFilterChange={handleReturnFilterChange}
  onViewReturnPurchase={handleViewReturnPurchase}
  suppliers={suppliersData.suppliers || []}
  stores={storesData.stores || []}
  products={productsData.products || []}
  fetchReturnPurchases={async (params) => {
    if (params.page) {
      setCurrentPage(params.page);
    }
    
    // Update the search params state
    setReturnSearchParams({
      ...returnSearchParams,
      ...params
    });
    
    console.log(`Fetching page data for page: ${params.page}`);
    const fetchResult = await refetchReturns({
      ...params,
      page: params.page
    });
    
    return fetchResult.data;
  }}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
/>

      {/* Purchase Search Dialog */}
      <PurchaseSearchDialog
  open={receiveSearchDialogOpen}
  onClose={() => setReceiveSearchDialogOpen(false)}
  filters={purchaseSearchParams}
  onFilterChange={handlePurchaseFilterChange}
  onViewPurchase={handleViewReceivedPurchase}
  suppliers={suppliersData.suppliers || []}
  stores={storesData.stores || []}
  products={productsData.products || []}
  fetchPurchases={async (params) => {
    if (params.page) {
      setPurchaseCurrentPage(params.page);
    }
    
    // Update the search params state
    setPurchaseSearchParams({
      ...purchaseSearchParams,
      ...params
    });
    
    //const adjustedPage = params.page ? params.page + 1 : purchaseCurrentPage + 1;

    // Use a different variable name to avoid the conflict
    console.log(`Fetching page data for page: ${params.page}`);
    const fetchResult = await refetchPurchases({
      ...params,
      page: params.page
    });
    
    return fetchResult.data;
  }}
  currentPage={purchaseCurrentPage}
  setCurrentPage={setPurchaseCurrentPage}
/>
    </Box>

  );
};

export default ReturnPurchase;