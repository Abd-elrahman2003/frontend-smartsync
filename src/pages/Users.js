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
  IconButton,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Search,
  UserPlus,
  BadgePlus,
  Save,
  Lock,
  BookOpen,
  Trash,
} from "lucide-react";
import Sidebar from "../components/Shared/Sidebar";
import Tables from "../components/Shared/Tables";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../Redux/Featuress/users/usersApi";

import {
  useGetFormattedScreensQuery,
  useAssignPermissionsMutation,
} from "../Redux/Featuress/permissions/permissionsApi";

import {
  useGetRolesQuery,
  useAssignRoleToUserMutation,
} from "../Redux/Featuress/Roles/rolesApi";

import { toast } from "react-toastify";

const Users = ({ toggleSidebar, isSidebarOpen, onLock }) => {
  const theme = useTheme();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [screenPermissions, setScreenPermissions] = useState({});
  const [expandedRoutes, setExpandedRoutes] = useState({});

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "",
    permissions: "",
    dashboardPermissions: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [openRolesDialog, setOpenRolesDialog] = useState(false);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Users API queries
  const {
    data: users = [],
    // eslint-disable-next-line no-unused-vars
    isFetching,
    refetch,
  } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [assignRoleToUser] = useAssignRoleToUserMutation();

  // Permissions API queries
  const { data: formattedScreens, isLoading: formattedScreensLoading } =
    useGetFormattedScreensQuery(selectedUserId, { skip: !selectedUserId });
  const [assignPermissions] = useAssignPermissionsMutation();

  const { data: roles = [], isLoading: rolesLoading } = useGetRolesQuery();

  useEffect(() => {
    if (formattedScreens) {
      const permissions = {};
      formattedScreens.forEach((screen) => {
        permissions[screen.Route] = {
          ...screen.access.reduce((acc, curr) => {
            acc[curr.action] = curr.checkbox;
            return acc;
          }, {}),
        };
        if (screen.screens) {
          screen.screens.forEach((subScreen) => {
            permissions[subScreen.Route] = {
              ...subScreen.access.reduce((acc, curr) => {
                acc[curr.action] = curr.checkbox;
                return acc;
              }, {}),
            };
          });
        }
      });
      setScreenPermissions(permissions);
    }
  }, [formattedScreens]);

  const formatUserData = (usersData) => {
    return usersData.map((user) => ({
      "First Name": user.firstName,
      "Last Name": user.lastName,
      Email: user.email,
      Roles: (
        <IconButton onClick={() => handleOpenRolesDialog(user)}>
          <BookOpen />
        </IconButton>
      ),
      Permissions: user.permissions,
      "Dashboard Permissions": user.dashboardPermissions,
      _original: user,
    }));
  };

  const columns = [
    "First Name",
    "Last Name",
    "Email",
    "Roles",
    "Permissions",
    "Dashboard Permissions",
  ];

  const handleAddClick = () => setOpenAddDialog(true);

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setOpenUpdateDialog(true);
  };

  const handlePasswordClick = (user) => {
    setSelectedUser(user);
    setOpenPasswordDialog(true);
  };
  const handleLock = (user) => {
    setSelectedUser(user);
    setSelectedUserId(user._original.id);
    setOpenPermissionsDialog(true);
  };

  const toggleExpand = (route) => {
    setExpandedRoutes((prev) => ({
      ...prev,
      [route]: !prev[route],
    }));
  };

  const toggleAllPermissions = (screen) => {
    const newPermissions = { ...screenPermissions };
    const allChecked = screen.screens.every((sub) =>
      Object.values(newPermissions[sub.Route] || {}).every((perm) => perm)
    );

    screen.screens.forEach((sub) => {
      newPermissions[sub.Route] = {};
      sub.access.forEach((access) => {
        newPermissions[sub.Route][access.action] = !allChecked;
      });
    });

    setScreenPermissions(newPermissions);
  };

  const toggleSubScreenPermissions = (subScreen) => {
    const newPermissions = { ...screenPermissions };
    const allChecked = Object.values(
      newPermissions[subScreen.Route] || {}
    ).every((perm) => perm);

    newPermissions[subScreen.Route] = {};
    subScreen.access.forEach((access) => {
      newPermissions[subScreen.Route][access.action] = !allChecked;
    });

    setScreenPermissions(newPermissions);
  };

  const handlePermissionChange = (route, action) => {
    setScreenPermissions((prev) => ({
      ...prev,
      [route]: {
        ...prev[route],
        [action]: !prev[route][action],
      },
    }));
  };

  const handlePermissionsSubmit = async () => {
    const permissionsPayload = {
      userId: selectedUserId,
      screensaccess: Object.entries(screenPermissions)
        .map(([route, actions]) => ({
          screen: route,
          actions: Object.entries(actions)
            .filter(([_, value]) => value)
            .map(([action]) => action),
        }))
        .filter((screen) => screen.actions.length > 0),
    };

    if (permissionsPayload.screensaccess.length === 0) {
      toast.error("At least one screen must have permissions.");
      return;
    }

    const hasViewPermission = permissionsPayload.screensaccess.some((screen) =>
      screen.actions.includes("VIEW")
    );

    if (!hasViewPermission) {
      toast.error("At least one screen must have VIEW permission.");
      return;
    }

    try {
      await assignPermissions(permissionsPayload).unwrap();
      setOpenPermissionsDialog(false);
      toast.success("Permissions updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update permissions.");
    }
  };

  const handleAddSubmit = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await createUser(newUser).unwrap();
      await refetch();
      setOpenAddDialog(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        roles: "",
        permissions: "",
        dashboardPermissions: "",
      });
      toast.success("User created successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user.");
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      const updatePayload = {
        id: selectedUser._original.id,
        firstName: selectedUser["First Name"],
        lastName: selectedUser["Last Name"],
        email: selectedUser["Email"],
        roles: selectedUser["Roles"],
      };

      await updateUser(updatePayload).unwrap();
      await refetch();
      setOpenUpdateDialog(false);
      toast.success("User information updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user information.");
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await updateUser({
        id: selectedUser._original.id,
        password: passwords.password,
      }).unwrap();
      setOpenPasswordDialog(false);
      setPasswords({ password: "", confirmPassword: "" });
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update password.");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(query)
      )
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (index) => {
    try {
      const userToDelete = users[index];
      await deleteUser(userToDelete.id).unwrap();
      await refetch();
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete user.");
    }
  };

  const handleOpenRolesDialog = (user) => {
    if (!user || (!user.id && !user._original?.id)) {
      toast.error("Please select a valid user first.");
      return;
    }

    setSelectedUser(user);
    setSelectedUserId(user.id || user._original?.id);

    setSelectedUserRoles(user.roles || []);
    const assignedRoles = new Set(user.roles || []);
    setAvailableRoles(roles.filter((role) => !assignedRoles.has(role.name)));

    setOpenRolesDialog(true);
  };

  const handleCloseRolesDialog = () => {
    setOpenRolesDialog(false);
  };

  const handleAddRoleToUser = (role) => {
    setSelectedUserRoles((prevRoles) => [...prevRoles, role]);
    setAvailableRoles((prevRoles) => prevRoles.filter((r) => r.id !== role.id));
  };

  const handleRemoveRoleFromUser = (role) => {
    setSelectedUserRoles((prevRoles) =>
      prevRoles.filter((r) => r.id !== role.id)
    );
    setAvailableRoles((prevRoles) => [...prevRoles, role]);
  };

  const handleSubmitRoles = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user first.");
      return;
    }

    const roleIds = selectedUserRoles.map((role) => role.id);

    try {
      await assignRoleToUser({ userId: selectedUserId, roleIds });

      toast.success("Roles assigned successfully!");
      setOpenRolesDialog(false);
    } catch (error) {
      toast.error("Failed to assign roles.");
    }
  };

  const renderActionButtons = (user) => {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton onClick={() => handleUpdateClick(user)} color="primary">
          <Save size={20} />
        </IconButton>
        <IconButton onClick={() => handlePasswordClick(user)} color="secondary">
          <Lock size={20} />
        </IconButton>
        <IconButton onClick={() => onLock(user)} color="info">
          {" "}
          {/* Use onLock here */}
          <Lock size={20} />
        </IconButton>
      </Box>
    );
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
        <Box sx={{ flex: 1, padding: theme.spacing(15), overflow: "auto" }}>
          {/* Controls Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Select Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {rolesLoading ? (
                    <MenuItem disabled>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <CircularProgress size={30} />
                      </Box>{" "}
                    </MenuItem>
                  ) : roles.length > 0 ? (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No roles available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
            ;
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <Search size={20} style={{ marginRight: 8 }} />
                  ),
                }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<UserPlus size={20} />}
                onClick={handleAddClick}
              >
                Add User
              </Button>
            </Box>
          </Box>

          <Tables
            columns={columns}
            data={formatUserData(searchQuery ? filteredData : users)}
            onDelete={handleDelete}
            onLock={handleLock}
            renderActions={renderActionButtons}
          />
        </Box>
      </Box>
      <Footer />

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="First Name"
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Last Name"
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Confirm Password"
            type="password"
            value={newUser.confirmPassword}
            onChange={(e) =>
              setNewUser({ ...newUser, confirmPassword: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update User Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
      >
        <DialogTitle>Update User Information</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="First Name"
            value={selectedUser?.["First Name"] || ""}
            onChange={(e) =>
              setSelectedUser({
                ...selectedUser,
                "First Name": e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Last Name"
            value={selectedUser?.["Last Name"] || ""}
            onChange={(e) =>
              setSelectedUser({
                ...selectedUser,
                "Last Name": e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            type="email"
            value={selectedUser?.["Email"] || ""}
            onChange={(e) =>
              setSelectedUser({
                ...selectedUser,
                Email: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateSubmit} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      >
        <DialogTitle>Update Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="New Password"
            type="password"
            value={passwords.password}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                password: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Confirm New Password"
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                confirmPassword: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPasswordDialog(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button onClick={handlePasswordSubmit} color="primary">
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* RolesDialog */}

      <Dialog
        open={openRolesDialog}
        onClose={handleCloseRolesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Manage Roles
        </DialogTitle>
        <DialogContent>
          {/* أدوار المستخدم */}
          {/* Your Roles */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            Your Roles
          </Typography>
          <Box
            sx={{
              minHeight: 100,
              backgroundColor: "#f1f1f1",
              padding: 2,
              borderRadius: 2,
            }}
          >
            {selectedUserRoles.length > 0 ? (
              selectedUserRoles.map((role) => (
                <Box
                  key={role.id}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Typography sx={{ fontSize: "16px", flexGrow: 1 }}>
                    {role.name}
                  </Typography>
                  <IconButton
                    onClick={() => handleRemoveRoleFromUser(role)}
                    sx={{ color: "red" }}
                  >
                    <Trash size={18} color="#e60a0a" />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "gray" }}>No assigned roles</Typography>
            )}
          </Box>

          {/* الأدوار المتاحة */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3, mb: 1 }}>
            Available Roles
          </Typography>
          <Box
            sx={{
              minHeight: 100,
              padding: 2,
              borderRadius: 2,
            }}
          >
            {rolesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : availableRoles.length > 0 ? (
              availableRoles.map((role) => (
                <Box
                  key={role.id}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Typography sx={{ fontSize: "16px", flexGrow: 1 }}>
                    {role.name}
                  </Typography>
                  <IconButton
                    onClick={() => handleAddRoleToUser(role)}
                    sx={{ color: "green" }}
                  >
                    <BadgePlus size={20} color={theme.palette.primary.main} />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "gray" }}>No available roles</Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
          <Button
            onClick={handleCloseRolesDialog}
            color="secondary"
            variant="outlined"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmitRoles}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
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
          User Permissions
        </DialogTitle>

        <DialogContent>
          {formattedScreensLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {formattedScreens?.map((screen) => (
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
                    {/* Checkbox لتحديد كل الصب-سكرينز */}
                    <Checkbox
                      checked={screen.screens.every((sub) =>
                        Object.values(screenPermissions[sub.Route] || {}).every(
                          (perm) => perm
                        )
                      )}
                      onChange={() => toggleAllPermissions(screen)}
                    />

                    {/* Expand Button */}
                    <IconButton
                      onClick={() => toggleExpand(screen.Route)}
                      size="large"
                      sx={{
                        color: (theme) => theme.palette.primary.main,
                        "&:hover": { backgroundColor: "unset" },
                      }}
                    >
                      {expandedRoutes[screen.Route] ? "-" : "+"}
                    </IconButton>

                    <Typography
                      variant="h6"
                      sx={{ ml: 1, fontWeight: "bold", color: "#333" }}
                    >
                      {screen.name}
                    </Typography>
                  </Box>

                  {/* Sub-screens */}
                  {expandedRoutes[screen.Route] &&
                    screen.screens?.map((subScreen) => (
                      <Box key={subScreen.Route} sx={{ ml: 4, mt: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          {/* Checkbox لتحديد جميع الصلاحيات لهذا الصب-سكرين */}
                          <Checkbox
                            checked={Object.values(
                              screenPermissions[subScreen.Route] || {}
                            ).every((perm) => perm)}
                            onChange={() =>
                              toggleSubScreenPermissions(subScreen)
                            }
                          />

                          {/* Expand Button للصب-سكرين */}
                          <IconButton
                            onClick={() => toggleExpand(subScreen.Route)}
                            size="medium"
                            sx={{
                              color: (theme) => theme.palette.primary.main,
                              "&:hover": { backgroundColor: "unset" },
                            }}
                          >
                            {expandedRoutes[subScreen.Route] ? "-" : "+"}
                          </IconButton>

                          <Typography
                            variant="subtitle1"
                            sx={{ ml: 1, fontWeight: "bold", color: "#333" }}
                          >
                            {subScreen.name}
                          </Typography>
                        </Box>

                        {/* عرض الصلاحيات عند التوسيع */}
                        {expandedRoutes[subScreen.Route] && (
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
                                      screenPermissions[subScreen.Route]?.[
                                        access.action
                                      ] || false
                                    }
                                    onChange={() =>
                                      handlePermissionChange(
                                        subScreen.Route,
                                        access.action
                                      )
                                    }
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.primary.main,
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
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setOpenPermissionsDialog(false)}
            sx={{
              backgroundColor: "#d32f2f",
              color: "white",
              borderRadius: "8px",
              padding: "8px 20px",
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePermissionsSubmit}
            disabled={formattedScreensLoading}
            sx={{
              backgroundColor: "#3f51b5",
              color: "white",
              borderRadius: "8px",
              padding: "8px 20px",
              "&:hover": { backgroundColor: "#3f51c4" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Users;
