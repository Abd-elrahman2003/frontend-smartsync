import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { useGetLocationQuery } from "../../Redux/Featuress/locations/locationApis";

const StoreTable = ({ columns, data, onEdit, onDelete }) => {
  const theme = useTheme();
  const [editDialog, setEditDialog] = useState({ open: false, rowData: {} });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rowIndex: null });
  const [locationsPage, setLocationsPage] = useState(1);

  // Fetch locations for the dropdown
  const { 
    data: locationsData = [], 
    isLoading: isLoadingLocations 
  } = useGetLocationQuery({ page: locationsPage }, {
    refetchOnMountOrArgChange: true
  });

  // Ensure locations data is an array
  const locations = Array.isArray(locationsData) ? locationsData : [];

  // Create a mapping of location IDs to location names for display
  const [locationMap, setLocationMap] = useState({});

  useEffect(() => {
    if (locations.length > 0) {
      const newLocationMap = {};
      locations.forEach(location => {
        newLocationMap[location.id] = location.name;
      });
      setLocationMap(newLocationMap);
    }
  }, [locations]);

  const handleEditSubmit = () => {
    onEdit(editDialog.rowData);
    setEditDialog({ open: false, rowData: {} });
  };

  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.rowIndex);
    setDeleteDialog({ open: false, rowIndex: null });
  };

  const handleLocationChange = (e) => {
    setEditDialog((prev) => ({
      ...prev,
      rowData: { ...prev.rowData, locationsId: e.target.value },
    }));
  };

  const cellStyles = { fontSize: "1rem" };
  const headerCellStyles = {
    ...cellStyles,
    color: theme.palette.common.white,
    fontWeight: 400,
  };

  const getLocationName = (locationId) => {
    return locationMap[locationId] || locationId;
  };

  return (
    <Box sx={{ padding: 1 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {columns.map((col) => (
                <TableCell key={col} sx={headerCellStyles}>
                  {col === "locationsId" ? "Location" : col}
                </TableCell>
              ))}
              <TableCell sx={headerCellStyles}>Edit</TableCell>
              <TableCell sx={headerCellStyles}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                {columns.map((col) => (
                  <TableCell key={col} sx={cellStyles}>
                    {col === "locationsId" ? getLocationName(row[col]) : row[col]}
                  </TableCell>
                ))}
                <TableCell sx={cellStyles}>
                  <IconButton
                    color="primary"
                    onClick={() => setEditDialog({ open: true, rowData: row })}
                    sx={{ fontSize: '19px' }}
                  >
                    <FaEdit />
                  </IconButton>
                </TableCell>
                <TableCell sx={cellStyles}>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, rowIndex: row.id })}
                    sx={{ fontSize: '19px' }}
                  >
                    <FaTrash />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog with Location Dropdown */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, rowData: {} })}>
        <DialogTitle>Edit Store</DialogTitle>
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
          <TextField
            label="Address"
            fullWidth
            margin="normal"
            value={editDialog.rowData.address || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                rowData: { ...prev.rowData, address: e.target.value },
              }))
            }
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={editDialog.rowData.phone || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                rowData: { ...prev.rowData, phone: e.target.value },
              }))
            }
          />
          
          {/* Location Dropdown for Edit Dialog */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="edit-location-select-label">Location</InputLabel>
            <Select
              labelId="edit-location-select-label"
              id="edit-location-select"
              value={editDialog.rowData.locationsId || ""}
              label="Location"
              onChange={handleLocationChange}
              disabled={isLoadingLocations}
            >
              {isLoadingLocations ? (
                <MenuItem value="">
                  <em>Loading locations...</em>
                </MenuItem>
              ) : (
                [
                  <MenuItem key="none" value="">
                    <em>Select a location</em>
                  </MenuItem>,
                  ...locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))
                ]
              )}
            </Select>
          </FormControl>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, rowIndex: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "1.2rem" }}>
            Are you sure you want to delete this store?
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
    </Box>
  );
};

export default StoreTable;