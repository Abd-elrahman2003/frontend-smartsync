// Supplier.js
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
import SupplierTable from "../components/Shared/SupplierTable";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import Pagination from "../components/Common/Pagination";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../Redux/Featuress/Suppliers/supplierApi";
import { toast } from "react-toastify";

const Supplier = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newItem, setNewItem] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const { 
    data: suppliersData = {}, 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetSuppliersQuery(currentPage, {
    refetchOnMountOrArgChange: true
  });

  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const columns = ["id", "fullName", "phone", "email"];

  const handleAddClick = () => setOpenAddDialog(true);

  const handleAddSubmit = async () => {
    if (!newItem.fullName.trim() || !newItem.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      await createSupplier(newItem).unwrap();
      setOpenAddDialog(false);
      setNewItem({
        fullName: "",
        phone: "",
        email: "",
      });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create supplier.");
    }
  };

  const handleSearchClick = () => setOpenSearchDialog(true);

  const handleSearchSubmit = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = suppliersData?.suppliers?.filter((supplier) =>
      Object.values(supplier).some((value) =>
        value != null && value.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered || []);
    setOpenSearchDialog(false);
  };

  const handleAddDialogClose = () => {
    setNewItem({
      fullName: "",
      phone: "",
      email: "",
    });
    setOpenAddDialog(false);
  };

  const handleSearchDialogClose = () => {
    setOpenSearchDialog(false);
    if (!searchQuery) {
      setFilteredData(suppliersData?.suppliers || []);
    }
  };

  const handleRefreshClick = () => {
    setSearchQuery("");
    setFilteredData(suppliersData?.suppliers || []);
    refetch();
  };

  const handleNextPage = () => {
    if (currentPage < (suppliersData?.totalPages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };
  

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  

  const handleUpdateSupplier = async (updatedItem) => {
    if (!updatedItem.fullName.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      await updateSupplier({
        id: updatedItem.id,
        ...updatedItem
      }).unwrap();
      
      setFilteredData(prevData =>
        prevData.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update supplier");
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteSupplier(id).unwrap();
      
      setFilteredData(prevData => {
        const updatedData = prevData.filter(supplier => supplier.id !== id);
        if (updatedData.length === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        return updatedData;
      });
      
      refetch();
      
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete supplier");
    }
  };

  useEffect(() => {
    if (!isFetching && suppliersData?.suppliers) {
      if (!searchQuery) {
        setFilteredData(suppliersData.suppliers);
      }
    }
  }, [isFetching, suppliersData, searchQuery]);

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
          <SupplierTable
            columns={columns}
            data={filteredData}
            onEdit={handleUpdateSupplier}
            onDelete={(id) => handleDeleteSupplier(id)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={suppliersData?.totalPages || 1}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        </Box>
      </Box>
      <Footer />

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add Supplier</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            required
            value={newItem.fullName}
            onChange={(e) => setNewItem({ ...newItem, fullName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            type="text"
            fullWidth
            required
            value={newItem.phone}
            onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newItem.email}
            onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit} 
            color="primary"
            disabled={!newItem.fullName.trim() || !newItem.phone.trim()}
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

export default Supplier;