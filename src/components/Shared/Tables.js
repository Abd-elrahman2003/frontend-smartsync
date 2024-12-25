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
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";

const Tables = ({ columns, data, onEdit, onDelete }) => {
  const theme = useTheme();
  const [editDialog, setEditDialog] = useState({ open: false, rowData: {} });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rowIndex: null });

  // Handle edit dialog submission
  const handleEditSubmit = () => {
    onEdit(editDialog.rowData); // Pass updated row data to the parent
    setEditDialog({ open: false, rowData: {} });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.rowIndex); // Pass the row index to the parent
    setDeleteDialog({ open: false, rowIndex: null });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {columns.map((col, index) => (
                <TableCell key={index} sx={{ color: theme.palette.common.white }}>
                  {col}
                </TableCell>
              ))}
              <TableCell sx={{ color: theme.palette.common.white }}>Edit</TableCell>
              <TableCell sx={{ color: theme.palette.common.white }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex}>{row[col]}</TableCell>
                ))}
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => setEditDialog({ open: true, rowData: row })}
                  >
                    <FaEdit />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialog({ open: true, rowIndex })}
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
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          {columns.map((col, index) => (
            <TextField
              key={index}
              label={col}
              fullWidth
              margin="normal"
              value={editDialog.rowData[col] || ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  rowData: { ...prev.rowData, [col]: e.target.value },
                }))
              }
            />
          ))}
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
          <Button
            onClick={() => setDeleteDialog({ open: false, rowIndex: null })}
            color="primary"
          >
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

export default Tables;
