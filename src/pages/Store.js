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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../components/Shared/Sidebar";
import StoreTable from "../components/Shared/StoreTable";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import Pagination from "../components/Common/Pagination";
import {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "../Redux/Featuress/Store/storeApi";
import { useGetLocationQuery } from "../Redux/Featuress/locations/locationApis";
import { toast } from "react-toastify";

const Store = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newItem, setNewItem] = useState({
    name: "",
    address: "",
    phone: "",
    locationsId: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const { 
    data: storesData = {}, 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetStoresQuery(currentPage, {
    refetchOnMountOrArgChange: true
  });

  // Using your existing locationsApi 
  const { data: locationsData = {}, isLoading: isLocationsLoading } = useGetLocationQuery({
    page: 1
  });

  // Extract the locations array
  const locations = locationsData?.locations || [];

  const [createStore] = useCreateStoreMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [deleteStore] = useDeleteStoreMutation();

  const columns = ["id", "name", "address", "phone", "locationsId"];

  const handleAddClick = () => setOpenAddDialog(true);

  const handleAddSubmit = async () => {
    if (!newItem.name.trim() || !newItem.address.trim() || !newItem.phone.trim() || !newItem.locationsId) {
      toast.error("All fields are required");
      return;
    }

    try {
      await createStore(newItem).unwrap();
      setOpenAddDialog(false);
      setNewItem({
        name: "",
        address: "",
        phone: "",
        locationsId: "",
      });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create store.");
    }
  };

  const handleSearchClick = () => setOpenSearchDialog(true);

  const handleSearchSubmit = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = storesData?.stores?.filter((store) =>
      Object.values(store).some((value) =>
        value != null && value.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered || []);
    setOpenSearchDialog(false);
  };

  const handleAddDialogClose = () => {
    setNewItem({
      name: "",
      address: "",
      phone: "",
      locationsId: "",
    });
    setOpenAddDialog(false);
  };

  const handleSearchDialogClose = () => {
    setOpenSearchDialog(false);
    if (!searchQuery) {
      setFilteredData(storesData?.stores || []);
    }
  };

  const handleRefreshClick = () => {
    setSearchQuery("");
    setFilteredData(storesData?.stores || []);
    refetch();
  };

  const handleNextPage = () => {
    if (currentPage < (storesData?.totalPages || 1)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleUpdateStore = async (updatedItem) => {
    if (!updatedItem.name.trim()) {
      toast.error("Store name is required");
      return;
    }

    try {
      await updateStore({
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
      toast.error(error?.data?.message || "Failed to update store");
    }
  };

  const handleDeleteStore = async (id) => {
    try {
      await deleteStore(id).unwrap();
      
      setFilteredData(prevData => {
        const updatedData = prevData.filter(store => store.id !== id);
        if (updatedData.length === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        return updatedData;
      });
      
      refetch();
      
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete store");
    }
  };

  useEffect(() => {
    if (!isFetching && storesData?.stores) {
      if (!searchQuery) {
        setFilteredData(storesData.stores);
      }
    }
  }, [isFetching, storesData, searchQuery]);

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
          <StoreTable
            columns={columns}
            data={filteredData}
            onEdit={handleUpdateStore}
            onDelete={(id) => handleDeleteStore(id)}
            locations={locations}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={storesData?.totalPages || 1}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        </Box>
      </Box>
      <Footer />

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add Store</DialogTitle>
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
            label="Address"
            type="text"
            fullWidth
            required
            value={newItem.address}
            onChange={(e) => setNewItem({ ...newItem, address: e.target.value })}
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
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={newItem.locationsId}
              label="Location"
              onChange={(e) => setNewItem({ ...newItem, locationsId: e.target.value })}
            >
              {isLocationsLoading ? (
                <MenuItem disabled>Loading locations...</MenuItem>
              ) : locations.length === 0 ? (
                <MenuItem disabled>No locations found</MenuItem>
              ) : (
                locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name || location.id}
                  </MenuItem>
                ))
              )}
            </Select>
            {!newItem.locationsId && <FormHelperText>Required</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit} 
            color="primary"
            disabled={!newItem.name.trim() || !newItem.address.trim() || !newItem.phone.trim() || !newItem.locationsId}
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

export default Store;