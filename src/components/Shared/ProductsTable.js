import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Package, Image } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductsTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onAddComponents,
  onDeleteComponent,
  components,
  selectedProductImages,
  imagePreviewOpen,
  setImagePreviewOpen,
  handleViewImages,
  onUploadImages,
  selectedProductId,
}) => {
  const theme = useTheme();

  // Function to show confirmation toast with Yes/Cancel options
  const showDeleteToast = (message, onConfirm) => {
    toast.warn(
      <div>
        <Typography>{message}</Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              onConfirm();
              toast.dismiss(); // Close the toast after confirmation
            }}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </Button>
        </Box>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  return (
    <Box sx={{ padding: 1 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{ fontSize: "1rem", color: "white", fontWeight: 400 }}
                >
                  {col}
                </TableCell>
              ))}
              <TableCell
                sx={{ fontSize: "1rem", color: "white", fontWeight: 400 }}
              >
                Photos
              </TableCell>
              <TableCell
                sx={{ fontSize: "1rem", color: "white", fontWeight: 400 }}
              >
                Edit
              </TableCell>
              <TableCell
                sx={{ fontSize: "1rem", color: "white", fontWeight: 400 }}
              >
                Delete
              </TableCell>
              <TableCell
                sx={{ fontSize: "1rem", color: "white", fontWeight: 400 }}
              >
                Components
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
             <TableRow
             key={row.id}
             sx={{
               "&:hover": { backgroundColor: theme.palette.action.hover },
             }}
           >
             <TableCell sx={{ fontSize: "16px" }}>{row.id}</TableCell>
             <TableCell sx={{ fontSize: "16px" }}>{row.name}</TableCell>
             <TableCell sx={{ fontSize: "16px" }}>{row.code}</TableCell>
             <TableCell sx={{ fontSize: "16px" }}>{row.price}</TableCell>
             <TableCell sx={{ fontSize: "16px" }}>{row.type}</TableCell>
             <TableCell sx={{ fontSize: "16px" }}>{row.category}</TableCell>
             <TableCell>
               {row.thumbLink ? (
                 <img
                   src={row.thumbLink}
                   alt="Product Thumbnail"
                   style={{
                     width: "200px",
                     height: "100%",
                     borderRadius: "4px",
                     objectFit: "cover",
                   }}
                 />
               ) : (
                 <Typography variant="body2" color="textSecondary">
                   No Image
                 </Typography>
               )}
             </TableCell>
             <TableCell>
               <IconButton
                 color="primary"
                 onClick={() => handleViewImages(row)}
               >
                 <Image />
               </IconButton>
             </TableCell>
             <TableCell>
               <IconButton
                 color="primary"
                 onClick={() => onEdit(row)}
                 sx={{ fontSize: "19px" }}
               >
                 <FaEdit />
               </IconButton>
             </TableCell>
             <TableCell>
               <IconButton
                 color="error"
                 onClick={() =>
                   showDeleteToast(
                     "Are you sure you want to delete this product?",
                     () => onDelete(row.id)
                   )
                 }
                 sx={{ fontSize: "19px" }}
               >
                 <FaTrash />
               </IconButton>
             </TableCell>
             <TableCell>
               <IconButton
                 color="primary"
                 onClick={() => onAddComponents(row)}
               >
                 <Package />
               </IconButton>
             </TableCell>
           </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Product Images</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
              p: 2,
            }}
          >
            {selectedProductImages.length > 0 ? (
              selectedProductImages.map((image, index) => (
                <img
                  key={index}
                  alt={`Product ${index + 1}`}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ))
            ) : (
              <Typography>No images available.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => onUploadImages(selectedProductId)}
            color="primary"
          >
            Upload More
          </Button>
          <Button onClick={() => setImagePreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsTable;