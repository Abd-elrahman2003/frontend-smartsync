import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  Grid,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Edit, PhotoCamera, Lock, LockOpen } from "@mui/icons-material";
import Header from "../Shared/Header";
import Sidebar from "../Shared/Sidebar";
import Footer from "../Shared/Footer";
import { useNavigate } from "react-router-dom";
import {
  useUpdateNameMutation,
  useUpdateImageMutation,
  useUpdatePasswordMutation,
} from "../../Redux/Featuress/auth/authApi";
import { toast } from "react-toastify";
import theme from "../../theme";

const UserProfile = ({ toggleSidebar, isSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    imageUrl: user?.imageUrl || null,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [updateName] = useUpdateNameMutation();
  const [updateImage] = useUpdateImageMutation();
  const [updatePassword] = useUpdatePasswordMutation();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setUserData((prevData) => {
          const updatedData = {
            ...prevData,
            imageUrl: base64Image,
          };
          localStorage.setItem("user", JSON.stringify(updatedData));
          return updatedData;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Update user name and image
      if (userData.firstName !== user.firstName || userData.lastName !== user.lastName) {
        await updateName({ firstName: userData.firstName, lastName: userData.lastName }).unwrap();
      }

      if (userData.imageUrl !== user.imageUrl) {
        await updateImage({ imageUrl: userData.imageUrl }).unwrap();
      }

      const updatedUser = {
        ...user,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Send the old password, new password, and confirmation to the backend
      if (userData.oldPassword && userData.newPassword && userData.newPassword === userData.confirmPassword) {
        // Send the password change request to the backend
        await updatePassword({
          oldPassword: userData.oldPassword, 
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword
        }).unwrap();
        toast.success("Password updated successfully!");
      } else if (userData.oldPassword || userData.newPassword || userData.confirmPassword) {
        // Handle mismatch
        setPasswordError("New password and confirmation do not match.");
        setLoading(false);
        return;
      }

      toast.success("Profile updated successfully!");
      navigate("/");

    } catch (error) {
      console.error("Error updating profile:", error); // Log error for further investigation
      toast.error(error?.data?.message || 'Error updating profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    if (storedUser) {
      setUserData({
        firstName: storedUser.firstName || "",
        lastName: storedUser.lastName || "",
        imageUrl: storedUser.imageUrl,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      if (storedLastUpdated) {
      }
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: "100vh" }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} />
        <Container
          sx={{
            display: "flex",
            flex: 1,
            paddingTop: 14,
            paddingLeft: isSidebarOpen ? 2 : 3,
            paddingRight: 2,
            justifyContent: "center",
            transition: "padding-left 0.3s",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 500, backgroundColor: "#f4f6f8", borderRadius: "8px", padding: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: "#333", textAlign: "center" }}>
              Update Profile
            </Typography>

            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label="First Name"
                  fullWidth
                  margin="normal"
                  value={userData.firstName}
                  onChange={handleChange}
                  name="firstName"
                  InputProps={{ startAdornment: <Edit sx={{ color: "#999", marginRight: 1 }} /> }}
                  InputLabelProps={{ sx: { color: "#000" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Last Name"
                  fullWidth
                  margin="normal"
                  value={userData.lastName}
                  onChange={handleChange}
                  name="lastName"
                  InputProps={{ startAdornment: <Edit sx={{ color: "#999", marginRight: 1 }} /> }}
                  InputLabelProps={{ sx: { color: "#000" } }}
                />
              </Grid>
            </Grid>

            {/* Password Update Fields */}
            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label="Old Password"
                  fullWidth
                  margin="normal"
                  type="password"
                  value={userData.oldPassword}
                  onChange={handleChange}
                  name="oldPassword"
                  InputProps={{ startAdornment: <Lock sx={{ color: "#999", marginRight: 1 }} /> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New Password"
                  fullWidth
                  margin="normal"
                  type="password"
                  value={userData.newPassword}
                  onChange={handleChange}
                  name="newPassword"
                  InputProps={{ startAdornment: <LockOpen sx={{ color: "#999", marginRight: 1 }} /> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm New Password"
                  fullWidth
                  margin="normal"
                  type="password"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  InputProps={{ startAdornment: <LockOpen sx={{ color: "#999", marginRight: 1 }} /> }}
                />
              </Grid>
            </Grid>

            {/* Password Error Message */}
            {passwordError && <Typography color="error" sx={{ textAlign: "center" }}>{passwordError}</Typography>}

            <Box sx={{ marginTop: 3, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: "#555" }}>Profile Photo</Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <Avatar src={userData.imageUrl} sx={{ width: 120, height: 120, marginBottom: 2 }} />
                <IconButton component="label" sx={{  color:theme.palette.primary.main, borderRadius: "50%" }}>
                  <PhotoCamera />
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                  />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                disabled={loading}
                sx={{ width: "100%" }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default UserProfile;
