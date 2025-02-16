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
import { FaEdit, FaTrash, FaLock } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";

const Tables = ({ columns, data, onEdit, onDelete, onLock }) => {
  const theme = useTheme();
  const [editDialog, setEditDialog] = useState({ open: false, rowData: {} });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, rowIndex: null });

  // Handle edit dialog submission
  const handleEditSubmit = () => {
    console.log(editDialog)
    onEdit(editDialog.route, editDialog.rowData);
    setEditDialog({ open: false, rowData: {} });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.rowIndex);
    setDeleteDialog({ open: false, rowIndex: null });
  };

  // Custom styles for larger font
  const cellStyles = {
    fontSize: '1rem',  // Increased font size
  };

  const headerCellStyles = {
    ...cellStyles,
    color: theme.palette.common.white,
    fontWeight: 400,     // Makes headers bolder
  };

  return (
    <Box sx={{ padding: 1 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {columns.map((col, index) => (
                <TableCell key={index} sx={headerCellStyles}>
                  {col}
                </TableCell>
              ))}
              <TableCell sx={headerCellStyles}>Edit</TableCell>
              <TableCell sx={headerCellStyles}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
              >
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} sx={cellStyles}>
                    {row[col]}
                    {/* Check if the column is "permission" and add lock icon */}
                    {col === "Permissions" && (
                      <IconButton
                        color="secondary"
                        onClick={() => onLock(row)} // Trigger the lock action
                        sx={{ marginLeft: 1, fontSize: '18px' }}
                      >
                        <FaLock />
                      </IconButton>
                    )}
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
                    onClick={() => setDeleteDialog({ open: true, rowIndex })}
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
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, rowData: {} })}
      >
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
          <Button 
            onClick={() => setEditDialog({ open: false, rowData: {} })} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            color="primary"
          >
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
          <DialogContentText sx={{ fontSize: '1.2rem' }}>
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
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tables;