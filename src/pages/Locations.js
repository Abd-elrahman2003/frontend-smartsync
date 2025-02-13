import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../components/Shared/Sidebar";
import Tables from "../components/Shared/Tables";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import Buttons from "../components/Shared/Buttons";
import {
  useGetScreensQuery,
  useCreateScreenMutation,
  useUpdateScreenMutation,
  useDeleteScreenMutation,
} from "../Redux/Featuress/screens/screensApi";
import { toast } from "react-toastify";

const Location = ({toggleSidebar,isSidebarOpen}) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    route: "/",
    parentRoute: "",
    functions: "", // Keep as string for the API request
    name: "",
    type: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // RTK Query hooks
  const { data: screens = [], isLoading, isFetching, refetch } = useGetScreensQuery();
  const [createScreen] = useCreateScreenMutation();
  const [updateScreen] = useUpdateScreenMutation();
  const [deleteScreen] = useDeleteScreenMutation();

  const columns = ["route", "parentRoute", "functions", "name", "type"];

  // Filter routes with type "MAIN" for the dropdown
  const mainRoutes = screens.filter((screen) => screen.type === "MAIN");

  const handleAddClick = () => setOpenAddDialog(true);

  const handleAddSubmit = async () => {
    try {
      const payload = {
        ...newItem,
        parentRoute: newItem.parentRoute || null,
        functions: newItem.functions.split(",").map((f) => f.trim()).join(","), // Ensure correct formatting
      };

      await createScreen(payload);
      setOpenAddDialog(false);
      setNewItem({
        route: "/",
        parentRoute: "",
        functions: "",
        name: "",
        type: "",
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create screen.");
    }
  };

  const handleSearchClick = () => setOpenSearchDialog(true);

  const handleSearchSubmit = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = screens.filter((screen) =>
      Object.values(screen).some((value) =>
        value != null && value.toString().toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered);
    setOpenSearchDialog(false);
  };

  const handleAddDialogClose = () => {
    setNewItem({
      route: "/",
      parentRoute: "",
      functions: "",
      name: "",
      type: "",
    });
    setOpenAddDialog(false);
  };

  const handleSearchDialogClose = () => setOpenSearchDialog(false);

  const handleRefreshClick = async () => {
    try {
      await refetch(); // Trigger a refetch of the screens data
      setFilteredData(screens); // Update filteredData with the latest data
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  useEffect(() => {
    if (!isFetching) {
      setFilteredData(screens);
    }
  }, [isFetching, screens]);

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
          <Tables
            columns={columns}
            data={filteredData.length > 0 ? filteredData : screens}
            onEdit={(updatedItem) =>
              updateScreen({ route: updatedItem.route, ...updatedItem })
            }
            onDelete={(index) => deleteScreen(screens[index]?.route)}
          />
        </Box>
      </Box>
      <Footer />

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add Screen</DialogTitle>
        <DialogContent>
          {Object.keys(newItem).map((key) => {
            if (key === "parentRoute") {
              return (
                <TextField
                  key={key}
                  margin="dense"
                  label="Parent Route (optional)"
                  select
                  fullWidth
                  value={newItem.parentRoute}
                  onChange={(e) =>
                    setNewItem({ ...newItem, parentRoute: e.target.value })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {mainRoutes.map((route) => (
                    <MenuItem key={route.route} value={route.route}>
                      {route.route}
                    </MenuItem>
                  ))}
                </TextField>
              );
            } else if (key === "functions") {
              return (
                <FormControl fullWidth key={key} margin="dense" label = "Functions">
                  <InputLabel>Functions</InputLabel>
                  <Select
                    multiple
                    value={newItem.functions ? newItem.functions.split(",") : []}
                    onChange={(e) => {
                      const selectedFunctions = e.target.value;
                      setNewItem({
                        ...newItem,
                        functions: selectedFunctions.length > 0 ? selectedFunctions.join(",") : "",
                      });
                    }}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {["VIEW", "ADD", "DELETE", "UPDATE"].map((func) => (
                      <MenuItem key={func} value={func}>
                        {func}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              );
            } else {
              return (
                <TextField
                  key={key}
                  margin="dense"
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  type="text"
                  fullWidth
                  value={newItem[key]}
                  onChange={(e) =>
                    setNewItem({ ...newItem, [key]: e.target.value })
                  }
                />
              );
            }
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button onClick={handleAddSubmit} color="primary">
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

export default Location;
