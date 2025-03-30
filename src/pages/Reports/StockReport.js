import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Paper,
  Button,
  useTheme,
  Pagination,
} from "@mui/material";
import { FaSearch, FaSync } from "react-icons/fa";
import Sidebar from "../../components/Shared/Sidebar";
import Header from "../../components/Shared/Header";
import Footer from "../../components/Shared/Footer";
import StockReportSearchDialog from "../../components/Shared/StockReportSearchDialog";
import { useGetStockReportQuery } from "../../Redux/Featuress/Reports/StockReport/stockReportApi";

const StockReport = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    storeName: "",
    categoryName: "",
    itemName: "",
  });

  // Query for stock report data
  const {
    data: stockReportData = {},
    isLoading,
    isFetching,
    refetch
  } = useGetStockReportQuery({
    page: currentPage,
    storeName: searchParams.storeName,
    categoryName: searchParams.categoryName,
    itemName: searchParams.itemName,
  }, {
    refetchOnMountOrArgChange: true
  });

  // State for server data
  const [reportData, setReportData] = useState([]);
  // State to track if we're waiting for search results
  const [isSearching, setIsSearching] = useState(false);

  // Memoized Styles
  const styles = useMemo(() => ({
    cell: { fontSize: "1rem" },
    headerCell: {
      fontSize: "1rem",
      color: theme.palette.common.white,
      fontWeight: 400,
    },
    tableRow: {
      backgroundColor: theme.palette.grey[100],
      '&:hover': { backgroundColor: theme.palette.action.hover },
    },
    footerRow: {
      backgroundColor: theme.palette.grey[50],
      borderTop: `2px solid ${theme.palette.divider}`,
    },
    footerCell: {
      fontSize: "1rem",
      fontWeight: "bold",
    }
  }), [theme]);
  
  // Handlers for search dialog
  const handleSearchClick = () => setSearchDialogOpen(true);

  const handleSearchDialogClose = () => {
    // Only close the dialog if we're not currently searching
    if (!isSearching) {
      setSearchDialogOpen(false);
    }
  };
  
  const handleFilterChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchSubmit = (newSearchParams) => {
    // Update search params
    setSearchParams(newSearchParams);
    
    // Set searching flag to true
    setIsSearching(true);
    
    // Ensure we're back to page 1 when applying new filters
    setCurrentPage(1);
    
    // Refetch data with new search parameters
    refetch();
  };

  const handleRefreshClick = () => {
    setSearchParams({
      storeName: "",
      categoryName: "",
      itemName: ""
    });
    refetch();
  };

  // Updated pagination handler
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Load data when available and handle search completion
  useEffect(() => {
    if (!isFetching && stockReportData?.data) {
      setReportData(stockReportData.data);
      
      // Ensure currentPage is within bounds
      if (currentPage > (stockReportData.totalPages || 1)) {
        setCurrentPage(1);
      }
      
      // If we were searching, we can now close the dialog and reset searching flag
      if (isSearching) {
        setIsSearching(false);
        setSearchDialogOpen(false);
      }
    }
  }, [isFetching, stockReportData, currentPage, isSearching]);

  // Table columns
  const columns = [
    "storeName", 
    "categoryName", 
    "itemName", 
    "itemPrice", 
    "quantity", 
    "totalValue"
  ];

  // Calculate column totals
  const columnTotals = useMemo(() => {
    if (!reportData.length) return {};
    
    return reportData.reduce((totals, row) => {
      totals.itemPrice = (totals.itemPrice || 0) + parseFloat(row.itemPrice);
      totals.quantity = (totals.quantity || 0) + row.quantity;
      totals.totalValue = (totals.totalValue || 0) + row.totalValue;
      return totals;
    }, {});
  }, [reportData]);

  // Cell renderer function
  const renderCell = (row, col) => {
    switch (col) {
      case 'itemPrice':
      case 'totalValue':
        return parseFloat(row[col]).toFixed(2);
      case 'quantity':
        return row[col].toLocaleString();
      default:
        return row[col];
    }
  };

  // Footer cell renderer function
  const renderFooterCell = (col) => {
    switch (col) {
      case 'itemName':
        return "Total";
      case 'itemPrice':
        return columnTotals.itemPrice ? columnTotals.itemPrice.toFixed(2) : "0.00";
      case 'quantity':
        return columnTotals.quantity ? columnTotals.quantity.toLocaleString() : "0";
      case 'totalValue':
        return columnTotals.totalValue ? columnTotals.totalValue.toFixed(2) : "0.00";
      default:
        return "";
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
          {/* Title and Search Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5"></Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaSearch />}
                onClick={handleSearchClick}
                sx={{ mr: 2 }}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaSync />}
                onClick={handleRefreshClick}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Stock Report Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    {columns.map((col) => (
                      <TableCell key={col} sx={styles.headerCell}>
                        {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.length > 0 ? (
                    <>
                      {reportData.map((row, index) => (
                        <TableRow key={index} sx={styles.tableRow}>
                          {columns.map((col) => (
                            <TableCell key={col} sx={styles.cell}>
                              {renderCell(row, col)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {/* Footer Row with Totals */}
                      <TableRow sx={{ 
                        backgroundColor: theme.palette.grey[100],
                        borderTop: `2px solid ${theme.palette.divider}`
                      }}>
                        {columns.map((col) => (
                          <TableCell key={`footer-${col}`} sx={styles.footerCell}>
                            {renderFooterCell(col)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        No stock report data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Updated Pagination to match Location page */}
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: theme.spacing(2) }}>
            <Pagination
              page={currentPage}
              count={stockReportData?.totalPages || 1}
              onChange={handlePageChange}
            />
          </Box>

          {/* Search Dialog - Pass isFetching to show loading state */}
          <StockReportSearchDialog
            open={searchDialogOpen}
            onClose={handleSearchDialogClose}
            filters={searchParams}
            onFilterChange={handleFilterChange}
            onSearch={handleSearchSubmit}
            isLoading={isFetching && isSearching}
          />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default StockReport;