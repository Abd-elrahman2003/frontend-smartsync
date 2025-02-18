import React, { useState } from "react";
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
  FormHelperText,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";

const StoreTable = ({ columns, data, onEdit, onDelete, locations = [] }) => {
  const theme = useTheme();
  const [editDialog, setEditDialog] = useState({ open: false, rowData: {} });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rowIndex: null });

  const handleEditSubmit = () => {
    onEdit(editDialog.rowData);
    setEditDialog({ open: false, rowData: {} });
  };

  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.rowIndex);
    setDeleteDialog({ open: false, rowIndex: null });
  };

  const cellStyles = { fontSize: "1rem" };
  const headerCellStyles = {
    ...cellStyles,
    color: theme.palette.common.white,
    fontWeight: 400,
  };

  return (
    <Box sx={{ padding: 1 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {columns.map((col) => (
                <TableCell key={col} sx={headerCellStyles}>{col}</TableCell>
              ))}
              <TableCell sx={headerCellStyles}>Edit</TableCell>
              <TableCell sx={headerCellStyles}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                {columns.map((col) => (
                  <TableCell key={col} sx={cellStyles}>{row[col]}</TableCell>
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

      {/* Edit Dialog */}
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
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="edit-location-select-label">Location</InputLabel>
            <Select
              labelId="edit-location-select-label"
              id="edit-location-select"
              value={editDialog.rowData.locationsId || ""}
              label="Location"
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  rowData: { ...prev.rowData, locationsId: e.target.value },
                }))
              }
            >
              {locations.length === 0 ? (
                <MenuItem disabled>No locations found</MenuItem>
              ) : (
                locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name || location.id}
                  </MenuItem>
                ))
              )}
            </Select>
            {!editDialog.rowData.locationsId && <FormHelperText>Required</FormHelperText>}
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