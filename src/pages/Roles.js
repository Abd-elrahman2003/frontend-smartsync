import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { Search, UserPlus } from "lucide-react";
import Sidebar from "../components/Shared/Sidebar";
import RolesTable from "../components/Shared/RolesTable";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetFormattedScreensQuery,
  useAssignPermissionsToRoleMutation,
} from "../Redux/Featuress/Roles/rolesApi";

const Roles = ({ toggleSidebar, isSidebarOpen }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [newRole, setNewRole] = useState("");
  const [expandedScreens, setExpandedScreens] = useState({}); // Track expanded screens

  // Fetch roles and formatted screens
  const { data: roles = [], isLoading: rolesLoading } = useGetRolesQuery();
  const { data: formattedScreens = [], isLoading: screensLoading } =
    useGetFormattedScreensQuery(selectedRoleId, { skip: !selectedRoleId });

  console.log("Formatted Screens:", formattedScreens);

  const [createRole] = useCreateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [assignPermissionsToRole] = useAssignPermissionsToRoleMutation();

  const columns = ["ID", "Role Name", "Permissions"];

  // Format role data for table display
  const formatRoleData = (rolesData) => {
    return rolesData.map((role) => ({
      ID: role.id,
      "Role Name": role.name,
      Permissions: "", // The icon will appear automatically in the table
    }));
  };

  const handleAddClick = () => setOpenAddDialog(true);

  const handleAddSubmit = async () => {
    if (!newRole) {
      toast.error("Role name cannot be empty!");
      return;
    }
    await createRole(newRole);
    setOpenAddDialog(false);
    setNewRole("");
  };

  const handleDeleteRole = async (roleName) => {
    await deleteRole(roleName);
  };

  // Open permissions dialog when clicking the Lock icon
  const handleLock = (role) => {
    if (!role || !role.ID) {
      toast.error("Invalid role selected!");
      return;
    }

    setSelectedRole(role["Role Name"]);
    setSelectedRoleId(role.ID);
    setOpenPermissionsDialog(true);
  };

  const handlePermissionsChange = (screen, action) => {
    setPermissions((prev) => ({
      ...prev,
      [screen]: {
        ...prev[screen],
        [action]: !prev[screen]?.[action],
      },
    }));
  };

  const handleSavePermissions = async () => {
    const permissionsPayload = {
      roleName: selectedRole,
      permissions: Object.entries(permissions)
        .map(([screen, actions]) => ({
          screen,
          actions: Object.entries(actions)
            .filter(([_, value]) => value)
            .map(([action]) => action),
        }))
        .filter((screen) => screen.actions.length > 0),
    };

    if (permissionsPayload.permissions.length === 0) {
      toast.error("At least one permission must be selected!");
      return;
    }

    await assignPermissionsToRole(permissionsPayload);
    setOpenPermissionsDialog(false);
  };

  // Toggle expanded screens
  const handleToggleExpand = (route) => {
    setExpandedScreens((prev) => ({
      ...prev,
      [route]: !prev[route],
    }));
  };

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

        <Box
          sx={{
            flex: 1,
            padding: theme.spacing(15),
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search..."
              onChange={() => {}}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<UserPlus size={20} />}
              onClick={handleAddClick}
            >
              Add Role
            </Button>
          </Box>

          <Box>
            {rolesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <RolesTable
                columns={columns}
                data={formatRoleData(roles)}
                onDelete={handleDeleteRole}
                onLock={handleLock}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Footer />

      {/* Add Role Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={openPermissionsDialog}
        onClose={() => setOpenPermissionsDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "15px",
            padding: "20px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", fontSize: "20px", textAlign: "center" }}
        >
          Manage Permissions for {selectedRole}
        </DialogTitle>
        <DialogContent>
          {screensLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {formattedScreens?.length === 0 ? (
                <Typography>No permissions available for this role</Typography>
              ) : (
                formattedScreens?.map((screen) => (
                  <Box
                    key={screen.Route}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {/* هنا التأكد من التحقق من الصلاحيات */}
                      <Checkbox
                        checked={screen.screens.every((sub) =>
                          Object.values(permissions[sub.Route] || {}).every(
                            (perm) => perm
                          )
                        )}
                        onChange={() =>
                          handlePermissionsChange(screen.Route, "selectAll")
                        }
                      />

                      <IconButton
                        onClick={() => handleToggleExpand(screen.Route)}
                        size="large"
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": { backgroundColor: "unset" },
                        }}
                      >
                        {expandedScreens[screen.Route] ? "-" : "+"}
                      </IconButton>

                      <Typography
                        variant="h6"
                        sx={{ ml: 1, fontWeight: "bold", color: "#333" }}
                      >
                        {screen.name}
                      </Typography>
                    </Box>

                    {expandedScreens[screen.Route] &&
                      screen.screens?.map((subScreen) => (
                        <Box key={subScreen.Route} sx={{ ml: 4, mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Checkbox
                              checked={Object.values(
                                permissions[subScreen.Route] || {}
                              ).every((perm) => perm)}
                              onChange={() =>
                                handlePermissionsChange(
                                  subScreen.Route,
                                  "toggle"
                                )
                              }
                            />

                            <IconButton
                              onClick={() =>
                                handleToggleExpand(subScreen.Route)
                              }
                              size="medium"
                              sx={{
                                color: theme.palette.primary.main,
                                "&:hover": { backgroundColor: "unset" },
                              }}
                            >
                              {expandedScreens[subScreen.Route] ? "-" : "+"}
                            </IconButton>

                            <Typography
                              variant="subtitle1"
                              sx={{ ml: 1, fontWeight: "bold", color: "#333" }}
                            >
                              {subScreen.name}
                            </Typography>
                          </Box>

                          {expandedScreens[subScreen.Route] && (
                            <Box
                              sx={{
                                ml: 4,
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {subScreen.access.map((access) => (
                                <FormControlLabel
                                  key={`${subScreen.Route}-${access.action}`}
                                  control={
                                    <Checkbox
                                      checked={
                                        permissions[subScreen.Route]?.[
                                          access.action
                                        ] || false
                                      }
                                      onChange={() =>
                                        handlePermissionsChange(
                                          subScreen.Route,
                                          access.action
                                        )
                                      }
                                      sx={{
                                        color: theme.palette.primary.main,
                                      }}
                                    />
                                  }
                                  label={
                                    access.action.charAt(0).toUpperCase() +
                                    access.action.slice(1)
                                  }
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                  </Box>
                ))
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPermissionsDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePermissions}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;
