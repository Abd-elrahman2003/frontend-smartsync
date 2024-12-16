import React, { useState } from "react";
import {
  Box,
  Button,
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
  TextField,
  // eslint-disable-next-line no-unused-vars
  Typography,
} from "@mui/material";
import { FaPlus, FaTrash, FaPen, FaSearch, FaFileImport, FaDownload } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import Progress from "../Common/Progress";
import Pagination from "../Common/Pagination";

const Tables = () => {
  const theme = useTheme();

  const initialData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Manager" : "User",
    store: `Store ${String.fromCharCode(65 + (i % 26))}`,
    description: `Description for user${i + 1}`,
  }));

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = currentPage * rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const exportToPDF = async () => {
    setIsLoading(true);

    const doc = new jsPDF();
    const tableColumn = ["ID", "Username", "Role", "Store", "Description"];
    const tableRows = data.map((row) => [
      row.id,
      row.username,
      row.role,
      row.store,
      row.description,
    ]);

    doc.text("User Data Table", 14, 10);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    setTimeout(() => {
      doc.save("table_data.pdf");
      setIsLoading(false);
    }, 1000);
  };

  const exportToExcel = async () => {
    setIsLoading(true);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    setTimeout(() => {
      XLSX.writeFile(workbook, "table_data.xlsx");
      setIsLoading(false);
    }, 1000);
  };

  const handleAddClick = () => setOpenAddDialog(true);
  const handleEditClick = (row) => {
    setEditData(row);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.secondary.main,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  };

  const handleSearchClick = () => setOpenSearchDialog(true);

  const handleAddSubmit = () => {
    setOpenAddDialog(false);
  };

  const handleEditSubmit = () => {
    setOpenEditDialog(false);
  };

  const handleSearchSubmit = () => {
    setOpenSearchDialog(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
     <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <Button
    variant="contained"
    color="primary"
    startIcon={<FaPlus />}
    onClick={handleAddClick}
    sx={{
      fontSize: { xs: "10px", sm: "12px", md: "14px" }, 
      padding: { xs: "4px 8px", sm: "6px 10px" }, 
      minWidth: "60px",
    }}
  >
    Add
  </Button>
  <Button
    variant="contained"
    color="primary"
    startIcon={<FaSearch />}
    onClick={handleSearchClick}
    sx={{
      fontSize: { xs: "10px", sm: "12px", md: "14px" },
      padding: { xs: "4px 8px", sm: "6px 10px" },
      minWidth: "60px",
    }}
  >
    Search
  </Button>
  <Button
    variant="contained"
    startIcon={<FaFileImport />}
    sx={{
      backgroundColor: theme.palette.error.main,
      fontSize: { xs: "10px", sm: "12px", md: "14px" },
      padding: { xs: "4px 8px", sm: "6px 10px" },
      minWidth: "60px",
    }}
  >
    Import
  </Button>
  <Button
    variant="contained"
    startIcon={<FaDownload />}
    onClick={exportToPDF}
    sx={{
      backgroundColor: theme.palette.error.main,
      fontSize: { xs: "10px", sm: "12px", md: "14px" },
      padding: { xs: "4px 8px", sm: "6px 10px" },
      minWidth: "60px",
    }}
  >
    Export PDF
  </Button>
  <Button
    variant="contained"
    startIcon={<FaDownload />}
    onClick={exportToExcel}
    sx={{
      backgroundColor: theme.palette.error.main,
      fontSize: { xs: "10px", sm: "12px", md: "14px" },
      padding: { xs: "4px 8px", sm: "6px 10px" },
      minWidth: "60px",
    }}
  >
    Export Excel
  </Button>
</Box>


      {isLoading ? (
        <Progress value={75} label="Uploading File" showPercentage={true} />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}>ID</TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}>Username</TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}>Role</TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}>Store</TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}>Description</TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: theme.palette.text.primary, fontSize: "18px" }}>{row.id}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, fontSize: "18px" }}>{row.username}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, fontSize: "18px" }}>{row.role}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, fontSize: "18px" }}>{row.store}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, fontSize: "18px" }}>{row.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(row)} sx={{ color: theme.palette.secondary.main }}>
                      <FaPen />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(row.id)} sx={{ color: theme.palette.error.main }}>
                      <FaTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={handleNextPage}
        onPrev={handlePrevPage}
      />

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField label="Username" fullWidth margin="normal" />
          <TextField label="Role" fullWidth margin="normal" />
          <TextField label="Store" fullWidth margin="normal" />
          <TextField label="Description" fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleAddSubmit} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField label="Username" value={editData?.username} fullWidth margin="normal" />
          <TextField label="Role" value={editData?.role} fullWidth margin="normal" />
          <TextField label="Store" value={editData?.store} fullWidth margin="normal" />
          <TextField label="Description" value={editData?.description} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleEditSubmit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSearchDialog} onClose={() => setOpenSearchDialog(false)}>
        <DialogTitle>Search</DialogTitle>
        <DialogContent>
          <TextField
            label="Search"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSearchDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSearchSubmit} color="primary">Search</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tables;
