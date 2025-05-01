import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";

// Reusable Dialog Component
const ConfirmationDialog = ({ open, title, content, onConfirm, onCancel, confirmButtonColor, confirmText }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{content}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color={confirmButtonColor} autoFocus>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

const PurchasingTable = ({ columns, data, onEdit, onDelete, onPost }) => {
  const theme = useTheme();
  const [activeDialog, setActiveDialog] = useState({ type: null, data: null });
  const [editData, setEditData] = useState({ 
    quantity: '', 
    price: ''
  });

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

  const handleEditSubmit = () => {
    const updated = {
      ...activeDialog.data,
      quantity: editData.quantity,
      price: editData.price,
      times: editData.quantity * editData.price
    };
    onEdit(updated);
    handleDialogClose();
  };

  // Cell Renderer
  const renderCell = (row, col) => {
    switch(col) {
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
        return parseFloat(row.times).toFixed(2);
      default:
        return row[col];
    }
  };

  // Edit Dialog Content
  const renderEditDialog = () => (
    <Dialog open={activeDialog.type === 'edit'} onClose={handleDialogClose}>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Product: {activeDialog.data?.productName}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
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
          onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Total: {(editData.quantity * editData.price).toFixed(2)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button onClick={handleEditSubmit} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ padding: 1, mt: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {columns.map((col) => (
                <TableCell key={col} sx={styles.headerCell}>
                  {col === 'times' ? 'Total' : col.charAt(0).toUpperCase() + col.slice(1)}
                </TableCell>
              ))}
              <TableCell sx={styles.headerCell}>Edit</TableCell>
              <TableCell sx={styles.headerCell}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow key={row.id} sx={styles.tableRow}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={styles.cell}>
                      {renderCell(row, col)}
                    </TableCell>
                  ))}
                  <TableCell sx={styles.cell}>
                    <IconButton
                      color="primary"
                      onClick={() => handleDialogOpen('edit', row)}
                      sx={styles.iconButton}
                    >
                      <FaEdit />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.cell}>
                    <IconButton
                      color="error"
                      onClick={() => handleDialogOpen('delete', row)}
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
                  No items found. Add some items to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {renderEditDialog()}

      <ConfirmationDialog
        open={activeDialog.type === 'delete'}
        title="Confirm Delete"
        content="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={() => {
          onDelete(activeDialog.data.parentId || activeDialog.data.id);
          handleDialogClose();
        }}
        onCancel={handleDialogClose}
        confirmButtonColor="error"
        confirmText="Delete"
      />
    </Box>
  );
};

export default PurchasingTable;