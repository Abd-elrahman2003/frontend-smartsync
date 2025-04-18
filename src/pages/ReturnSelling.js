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
import ReturnedSellingSearchDialog from "../components/Shared/ReturnedSellingSearchDialog";
import SaleSearchDialog from "../components/Shared/SellingSearchDialog";
import Pagination from "../components/Common/Pagination";
import {
    useGetSellingsQuery,
    useGetReturnSellingsQuery,
    useCreateReturnSellingMutation,
    useUpdateReturnSellingMutation,
    useDeleteReturnSellingMutation,
    useTogglePostReturnSellingMutation,
} from "../Redux/Featuress/Selling/sellingApi";
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

const ReturnSelling = ({ toggleSidebar, isSidebarOpen }) => {
    const theme = useTheme();
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openItemDialog, setOpenItemDialog] = useState(false);
    const [returnSearchDialogOpen, setReturnSearchDialogOpen] = useState(false);
    const [saleSearchDialogOpen, setSaleSearchDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [saleCurrentPage, setSaleCurrentPage] = useState(1);

    const [returnSearchParams, setReturnSearchParams] = useState({
        id: "",
        saleId: "",
        storeId: "",
        customerName: "",
        dateFrom: "",
        dateTo: "",
        productId: "",
        isPosted: ""
    });

    const [saleSearchParams, setSaleSearchParams] = useState({
        id: "",
        storeId: "",
        customerName: "",
        dateFrom: "",
        dateTo: "",
        productId: "",
        isPosted: ""
    });

    const [currentReturnOrder, setCurrentReturnOrder] = useState({
        saleId: "",
        customerName: "",
        storeId: "",
        note: "",
        date: new Date().toISOString().split('T')[0],
        items: [],
        isPosted: false,
        isSaved: false,
        id: null
    });

    const [isSaving, setIsSaving] = useState(false);
    const [serverData, setServerData] = useState([]);
    const [activeDialog, setActiveDialog] = useState({ type: null, data: null });
    const [editData, setEditData] = useState({
        quantity: '',
        price: ''
    });

    const [multipleItems, setMultipleItems] = useState([{
        productId: "",
        productName: "",
        productCode: "",
        quantity: "",
        price: ""
    }]);

    // Queries
    const {
        data: returnSaleData = {},
        isLoading: isLoadingReturns,
        isFetching: isFetchingReturns,
        refetch: refetchReturns
    } = useGetReturnSellingsQuery({
        page: currentPage,
        ...returnSearchParams
    }, {
        refetchOnMountOrArgChange: true
    });

    const {
        data: salesData = {},
        isLoading: isLoadingSales,
        refetch: refetchSales
    } = useGetSellingsQuery({
        page: saleCurrentPage,
        ...saleSearchParams
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
    const [createReturnSale] = useCreateReturnSellingMutation();
    const [updateReturnSale] = useUpdateReturnSellingMutation();
    const [deleteReturnSale] = useDeleteReturnSellingMutation();
    const [togglePostReturnSale] = useTogglePostReturnSellingMutation();

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

    // Multiple Items Handlers
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

    const handleRemoveItemRow = (indexToRemove) => {
        setMultipleItems(multipleItems.filter((_, index) => index !== indexToRemove));
    };

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

    const handleQuantityChange = (index, value) => {
        const updatedItems = [...multipleItems];
        updatedItems[index].quantity = value;
        setMultipleItems(updatedItems);
    };

    const handleSubmitAllItems = () => {
        const validItems = multipleItems.filter(item =>
            item.productId && item.quantity && parseFloat(item.quantity) > 0
        );

        if (validItems.length === 0) {
            toast.error("Please add at least one valid item with product and quantity");
            return;
        }

        const itemsWithIds = validItems.map(item => ({
            ...item,
            id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            times: parseFloat(item.quantity) * parseFloat(item.price)
        }));

        setCurrentReturnOrder(prev => ({
            ...prev,
            items: [...prev.items, ...itemsWithIds]
        }));

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

    // Filter change handlers
    const handleReturnFilterChange = (field, value) => {
        setReturnSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaleFilterChange = (field, value) => {
        setSaleSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Item Handlers
    const handleEditItem = () => {
        if (!activeDialog.data || !editData.quantity) return;

        setCurrentReturnOrder(prev => {
            const updatedItems = prev.items.map(item => {
                if (item.id === activeDialog.data.id) {
                    return {
                        ...item,
                        quantity: editData.quantity,
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

    const handleRemoveItem = (itemId) => {
        setCurrentReturnOrder(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));

        toast.success("Item removed from return order");
    };

    // View Handlers
    const handleViewReturnSale = (returnSale) => {
        setCurrentReturnOrder({
            saleHeaderId: returnSale.id,
            customerName: returnSale.customerName,
            storeId: returnSale.storeId,
            note: `Return for sale #${returnSale.id}`,
            date: new Date().toISOString().split('T')[0],
            items: returnSale.items.map(item => ({
                ...item,
                id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                quantity: item.quantity,
                times: item.quantity * item.price
            })),
            isPosted: false,
            isSaved: false,
            id: null
        });
        setReturnSearchDialogOpen(false);
    };

    const handleViewSale = (sale) => {
        setCurrentReturnOrder({
            sellingHeaderId: sale.id,
            customerId: sale.customerId,
            storeId: sale.storeId,
            note: `Return for sale #${sale.id}`,
            date: new Date().toISOString().split('T')[0],
            items: sale.items.map(item => ({
                ...item,
                id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                quantity: item.quantity,
                times: item.quantity * item.price
            })),
            isPosted: false,
            isSaved: false,
            id: null
        });
        setSaleSearchDialogOpen(false);
    };

    // Order Handlers
    const handleSaveOrder = async () => {
        if (!currentReturnOrder.saleId || !currentReturnOrder.customerName || !currentReturnOrder.storeId || currentReturnOrder.items.length === 0) {
            toast.error("Please fill all required fields before saving.");
            return false;
        }

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
                saleHeaderId: currentReturnOrder.saleId,
                customerName: currentReturnOrder.customerName,
                note: currentReturnOrder.note,
                items: currentReturnOrder.items
                    .filter(item => item.quantity && parseFloat(item.quantity) > 0)
                    .map(item => ({
                        productId: item.productId,
                        quantity: parseFloat(item.quantity)
                    }))
            };

            const result = await createReturnSale(dataToSend).unwrap();
            const orderId = result.returnOrder?.id;

            if (!orderId) {
                toast.error("Failed to get order ID after saving");
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

    const handleResetOrder = () => {
        setCurrentReturnOrder({
            saleId: "",
            customerName: "",
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

    const handleUpdateOrder = async () => {
        if (!currentReturnOrder.id) {
            toast.error("Please save the return order first before updating.");
            return;
        }

        try {
            const dataToSend = {
                headerId: currentReturnOrder.id,
                saleId: currentReturnOrder.saleId,
                customerName: currentReturnOrder.customerName,
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

            await updateReturnSale(dataToSend).unwrap();
            refetchReturns();
            toast.success("Return order updated successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update return order");
        }
    };

    const handleDeleteOrder = async () => {
        if (!currentReturnOrder.id) {
            toast.error("Cannot delete. Save the return order first.");
            return;
        }

        try {
            await deleteReturnSale(currentReturnOrder.id).unwrap();
            handleResetOrder();
            refetchReturns();
            toast.success("Return order deleted successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete return order");
        }
    };

    const handlePostOrder = async () => {
        if (!currentReturnOrder.id) {
            toast.error("Please save the return order before posting.");
            return;
        }

        try {
            await togglePostReturnSale(currentReturnOrder.id).unwrap();
            setCurrentReturnOrder(prev => ({ ...prev, isPosted: true }));
            refetchReturns();
            toast.success("Return order posted successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to post return order");
        }
    };

    const handleUnpostOrder = async () => {
        if (!currentReturnOrder.id) {
            toast.error("No return order to unpost.");
            return;
        }

        try {
            await togglePostReturnSale(currentReturnOrder.id).unwrap();
            setCurrentReturnOrder(prev => ({ ...prev, isPosted: false }));
            refetchReturns();
            toast.success("Return order unposted successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to unpost return order");
        }
    };

    // Search functionalities
    const handleReturnSearchClick = () => setReturnSearchDialogOpen(true);
    const handleSaleSearchClick = () => setSaleSearchDialogOpen(true);

    // Pagination
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, returnSaleData?.totalPages || 1));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Load server data
    useEffect(() => {
        if (!isFetchingReturns && returnSaleData?.returnSales) {
            setServerData(returnSaleData.returnSales);
        }
    }, [isFetchingReturns, returnSaleData]);

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
                        onReturnSearchClick={handleSaleSearchClick}
                        onSaveClick={handleSaveOrder}
                        onResetClick={handleResetOrder}
                        onPostClick={handlePostOrder}
                        onUnpostClick={handleUnpostOrder}
                        onDeleteClick={handleDeleteOrder}
                        onUpdateClick={handleUpdateOrder}
                        showActionButtons={currentReturnOrder.isSaved}
                        isPosted={currentReturnOrder.isPosted}
                    />

                    {/* Return Sale Form */}
                    <Paper sx={{ p: 3, mb: 3, mt: 2, backgroundColor: 'white', boxShadow: 'none' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Sale ID"
                                    value={currentReturnOrder.saleId}
                                    disabled={true}
                                    sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Customer Name"
                                    value={currentReturnOrder.customerName}
                                    onChange={(e) => setCurrentReturnOrder(prev => ({
                                        ...prev,
                                        customerName: e.target.value
                                    }))}
                                    disabled={currentReturnOrder.isPosted || isSaving}
                                    sx={{ '& .MuiInputBase-root': { height: '56px' } }}
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Autocomplete
                                    options={storesData.stores || []}
                                    getOptionLabel={(option) => option.name}
                                    value={storesData.stores?.find(s => s.id === currentReturnOrder.storeId) || null}
                                    onChange={(_, newValue) => setCurrentReturnOrder(prev => ({
                                        ...prev,
                                        storeId: newValue ? newValue.id : ""
                                    }))}
                                    disabled={isLoadingStores || currentReturnOrder.isPosted || isSaving || currentReturnOrder.saleId}
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
                                                No items in current return order. Select a sale or add items manually.
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

                    {/* Previous Return Orders */}
                    {serverData.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Previous Return Orders</Typography>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={returnSaleData?.totalPages || 1}
                                onNext={handleNextPage}
                                onPrev={handlePrevPage}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
            <Footer />

            {/* Return Sale Search Dialog */}
            <ReturnedSellingSearchDialog
                open={returnSearchDialogOpen}
                onClose={() => setReturnSearchDialogOpen(false)}
                filters={returnSearchParams}
                onFilterChange={handleReturnFilterChange}
                onViewReturnSelling={handleViewReturnSale}
                stores={storesData.stores || []}
                products={productsData.products || []}
                fetchReturnSellings={async (params) => {
                    if (params.page) {
                        setCurrentPage(params.page);
                    }

                    setReturnSearchParams({
                        ...returnSearchParams,
                        ...params
                    });

                    const fetchResult = await refetchReturns({
                        ...params,
                        page: params.page
                    });

                    return fetchResult.data;
                }}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />

            {/* Sale Search Dialog */}
            <SaleSearchDialog
                open={saleSearchDialogOpen}
                onClose={() => setSaleSearchDialogOpen(false)}
                filters={saleSearchParams}
                onFilterChange={handleSaleFilterChange}
                onViewSale={handleViewSale}
                stores={storesData.stores || []}
                products={productsData.products || []}
                //     fetchSales={async (params) => {
                //       if (params.page) {
                //         setSaleCurrentPage(params.page);
                //       }

                //       setSaleSearchParams({
                //         ...saleSearchParams,
                //         ...params
                //       });

                //       const fetchResult = await refetchSales({
                //         ...params,
                //         page: params.page
                //       });

                //       return fetchResult.data;
                //     }}
                //     currentPage={saleCurrentPage}
                //     setCurrentPage={setSaleCurrentPage}
                //   />

                fetchSellingOrders={async (params) => {
                    try {
                        // Use the same query structure as your useGetSellingsQuery
                        const result = await refetchSales({
                            page: params.page,
                            limit: params.limit,
                            id: params.id,
                            customerId: params.customerId,
                            storeId: params.storeId
                        });
                        return result.data;
                    } catch (error) {
                        console.error("Error fetching selling orders:", error);
                        return { orders: [], totalOrders: 0 };
                    }
                }}
            />

        </Box>
    );
};

export default ReturnSelling;