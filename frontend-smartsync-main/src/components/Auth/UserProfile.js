import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Container, Avatar, Grid, IconButton } from "@mui/material";
import { Edit, PhotoCamera, ExitToApp } from "@mui/icons-material";
import Header from "../Shared/Header";
import Sidebar from "../Shared/Sidebar";
import Footer from "../Shared/Footer";
import { useNavigate } from "react-router-dom";
import { useUpdateNameMutation, useUpdateImageMutation } from "../../Redux/Featuress/auth/authApi";
import { toast } from "react-toastify";
import { logout } from "../../Redux/Featuress/auth/authSlice";
import { useDispatch } from "react-redux";

const UserProfile = ({ toggleSidebar, isSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    profilePhoto: user?.profilePhoto || null,
  });

  const [updateName] = useUpdateNameMutation();
  const [updateImage] = useUpdateImageMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        setUserData((prevData) => {
          const updatedData = {
            ...prevData,
            profilePhoto: reader.result || prevData.profilePhoto,
          };
          localStorage.setItem("user", JSON.stringify(updatedData));
          return updatedData;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Update name if changed
      if (
        (userData.firstName !== user.firstName || userData.lastName !== user.lastName) &&
        (userData.firstName && userData.lastName)
      ) {
        await updateName({ firstName: userData.firstName, lastName: userData.lastName }).unwrap();
      }

      // Update profile photo if changed
      if (userData.profilePhoto && userData.profilePhoto !== user.profilePhoto) {
        await updateImage({ profilePhoto: userData.profilePhoto }).unwrap();
      }

      // Update localStorage
      const updatedUser = {
        ...user,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePhoto: userData.profilePhoto,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please try again later.");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/signin");
    } else {
      setUserData({
        firstName: storedUser.firstName || "",
        lastName: storedUser.lastName || "",
        profilePhoto: storedUser.profilePhoto || null,
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

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
          <Box
            sx={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "#f4f6f8",
              borderRadius: "8px",
              padding: 3,
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 600, color: "#333", textAlign: "center" }}
            >
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
                  InputProps={{
                    startAdornment: <Edit sx={{ color: "#999", marginRight: 1 }} />,
                  }}
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
                  InputProps={{
                    startAdornment: <Edit sx={{ color: "#999", marginRight: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ marginTop: 3, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: "#555" }}>
                Profile Photo
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Avatar
                  src={userData.profilePhoto}
                  sx={{ width: 120, height: 120, marginBottom: 2 }}
                />
                <IconButton
                  component="label"
                  sx={{ border: "2px solid #999", borderRadius: "50%", padding: 1 }}
                >
                  <PhotoCamera sx={{ fontSize: 40, color: "#000" }} />
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                sx={{ padding: "8px 20px", fontWeight: 600 }}
              >
                Save Changes
              </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{ padding: "8px 20px", fontWeight: 600 }}
              >
                <ExitToApp sx={{ marginRight: 1 }} />
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer sx={{ paddingBottom: 3 }} />
    </Box>
  );
};

export default UserProfile;
