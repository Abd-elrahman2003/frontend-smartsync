import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  Button,
  IconButton,
  Pagination,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../components/Shared/Sidebar";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import {
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from "../Redux/Featuress/locations/locationApis";
import { toast } from "react-toastify";

const Location = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [page, handlePageChange] = useState(1);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, rowData: {} });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rowIndex: null });
  const [newItem, setNewItem] = useState({
    name: "",
  });

  let { data: locations = [], isLoading, refetch } = useGetLocationQuery({ page });
  const [createLocation] = useCreateLocationMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const handleAddClick = () => setOpenAddDialog(true);
  const handleSearchClick = () => openSearchDialog(true);
  
  const handleRefreshClick = async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  const handleEditSubmit = async () => {
    try {
      await updateLocation({ id: editDialog.rowData.id, ...editDialog.rowData });
      setEditDialog({ open: false, rowData: {} });
      await refetch(); // Refetch after update
    } catch (error) {
      toast.error("Failed to update location");
    }
  };


  const handleDeleteConfirm = async () => {
    try {
      await deleteLocation(locations[deleteDialog.rowIndex]?.id);
      setDeleteDialog({ open: false, rowIndex: null });
      await refetch(); // Refetch after delete
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  const handleAddSubmit = async () => {
    try {
      await createLocation(newItem);
      setOpenAddDialog(false);
      await refetch(); // Refetch after create
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create location.");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: theme.palette.background.default,
    }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Box sx={{ flex: 1, padding: theme.spacing(15), overflow: "auto" }}>
          <Buttons
            onAddClick={handleAddClick}
            onSearchClick={handleSearchClick}
            onRefreshClick={handleRefreshClick}
          />
          
          <div style={{ padding: '16px' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}>
              <thead>
                <tr style={{ backgroundColor: theme.palette.primary.main }}>
                  <th style={{ 
                    padding: '16px', 
                    color: 'white', 
                    fontSize: '16px',
                    fontWeight: 500,
                    textAlign: 'left'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    color: 'white', 
                    fontSize: '16px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    Edit
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    color: 'white', 
                    fontSize: '16px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(locations) && locations.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    style={{ 
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s',
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '14px'
                    }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <IconButton
                        onClick={() => setEditDialog({ open: true, rowData: row })}
                        style={{ color: theme.palette.primary.main }}
                      >
                        <FaEdit />
                      </IconButton>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, rowIndex: rowIndex })}
                        style={{ color: theme.palette.error.main }}
                      >
                        <FaTrash />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Box sx={{ display: "flex", justifyContent: "center", marginTop: theme.spacing(2) }}>
          <Pagination
          page={page}
          count={10}
          onChange={(event, value) => handlePageChange(value)}
          />
          </Box>

        </Box>
      </Box>
      <Footer />

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, rowData: {} })}
      >
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editDialog.rowData.name || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                rowData: { ...prev.rowData, name: e.target.value },
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, rowData: {} })} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, rowIndex: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, rowIndex: null })} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog( false )}
      >
        <DialogTitle>Add Location</DialogTitle>
       
        <DialogActions>
              <TextField
                key={"name"}
                margin="dense"
                label={"name".charAt(0).toUpperCase() + "name".slice(1)}
                type="text"
                fullWidth
                value={newItem["name"]}
                onChange={(e) =>
                  setNewItem({ ...newItem, ["name"]: e.target.value })
                }
              />
          <Button onClick={handleAddSubmit} color="error" autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>



  );
};

export default Location;