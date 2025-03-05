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
  Grid,
  InputAdornment,
  Pagination,
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
import { Email, Person, Visibility, VisibilityOff } from "@mui/icons-material";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state

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
    data: usersData = { users: [], totalPages: 1 },
    refetch,
  } = useGetUsersQuery(
    { page: currentPage, searchParams: { firstName: searchQuery } },
    {
      refetchOnMountOrArgChange: true,
    }
  );

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

  useEffect(() => {
    if (openRolesDialog && selectedUser) {
      const userRoles = selectedUser.roles || [];
      setSelectedUserRoles(userRoles);
  
      const assignedRoles = new Set(userRoles.map((role) => role.id));
      setAvailableRoles(roles.filter((role) => !assignedRoles.has(role.id)));
    }
  }, [openRolesDialog, selectedUser, roles]);


  // أضف هذا داخل useEffect لمراقبة البيانات
useEffect(() => {
  console.log("Selected User:", selectedUser);
  console.log("Selected User Roles:", selectedUserRoles);
  console.log("Available Roles:", availableRoles);
}, [selectedUser, selectedUserRoles, availableRoles]);




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
      toast.error("Passwords do not match!", { autoClose: 4000 });
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
      toast.success("User created successfully!", { autoClose: 1500 });
    } catch (error) {
      const errorMessage = error?.data?.message || "Failed to create user.";

      if (errorMessage.includes("Email already exists")) {
        toast.error("This email is already in use. Please try another.", { autoClose: 3000 });
      } else if (errorMessage.includes("password is not strong enough")) {
        toast.error("Weak password! Use uppercase, lowercase, numbers & symbols.", { autoClose: 4000 });
      } else {
        toast.error(errorMessage, { autoClose: 2000 });
      }
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

    const filtered = usersData.users.filter((user) =>
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(query)
      )
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (index) => {
    try {
      const userToDelete = usersData.users[index];
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
  
    // تعيين المستخدم المحدد ومعرف المستخدم
    setSelectedUser(user);
    setSelectedUserId(user.id || user._original?.id);
  
    // استرجاع الأدوار الحالية للمستخدم
    const userRoles = user.roles || [];
    setSelectedUserRoles(userRoles);
  
    // تحديث الأدوار المتاحة بناءً على الأدوار المحددة
    const assignedRoles = new Set(userRoles.map((role) => role.id));
    setAvailableRoles(roles.filter((role) => !assignedRoles.has(role.id)));
  
    // فتح مربع الحوار
    setOpenRolesDialog(true);
  };
// إغلاق مربع الحوار
const handleCloseRolesDialog = () => {
  setOpenRolesDialog(false); // إغلاق مربع الحوار فقط
};

// إضافة دور للمستخدم
const handleAddRoleToUser = (role) => {
  setSelectedUserRoles((prevRoles) => [...prevRoles, role]);
  setAvailableRoles((prevRoles) => prevRoles.filter((r) => r.id !== role.id));
};

// إزالة دور من المستخدم
const handleRemoveRoleFromUser = (role) => {
  setSelectedUserRoles((prevRoles) => prevRoles.filter((r) => r.id !== role.id));
  setAvailableRoles((prevRoles) => [...prevRoles, role]);
};

// تعديل دالة handleSubmitRoles لإعادة تحميل بيانات المستخدم بعد التحديث
const handleSubmitRoles = async () => {
  if (!selectedUserId) {
    toast.error("Please select a user first.");
    return;
  }

  const roleIds = selectedUserRoles.map((role) => role.id);

  try {
    // إرسال الأدوار إلى الخادم
    const response = await assignRoleToUser({ userId: selectedUserId, roleIds }).unwrap();

    // طباعة الرد بالكامل
    console.log("Response from server:", response);

    // تحويل roleIds (الأرقام) إلى مصفوفة من الكائنات
    const updatedAssignedRoles = roleIds
      .map((roleId) => roles.find((role) => role.id === roleId))
      .filter((role) => role); // إزالة القيم غير المعرّفة (undefined)

    // تحديث الحالة
    setSelectedUserRoles(updatedAssignedRoles);

    // تحديث الأدوار المتاحة
    const assignedRoleIds = new Set(roleIds);
    setAvailableRoles(roles.filter((role) => !assignedRoleIds.has(role.id)));

    // إظهار رسالة نجاح
    toast.success(response.message || "Roles updated successfully!");

    // إغلاق مربع الحوار
    handleCloseRolesDialog();
  } catch (error) {
    // إظهار رسالة خطأ في حالة فشل الإرسال
    console.error("Error updating roles:", error);
    toast.error(error?.data?.message || "Failed to update roles.");
  }
};
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
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
            data={formatUserData(searchQuery ? filteredData : usersData.users)}
            onDelete={handleDelete}
            onLock={handleLock}
            renderActions={renderActionButtons}
          />

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={usersData.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Box>
      </Box>
      <Footer />

      {/* Add User Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Add New User
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="First Name"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Last Name"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={newUser.confirmPassword}
                onChange={(e) =>
                  setNewUser({ ...newUser, confirmPassword: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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
        {/* الأدوار المحددة للمستخدم */}
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
          {availableRoles.length > 0 ? (
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