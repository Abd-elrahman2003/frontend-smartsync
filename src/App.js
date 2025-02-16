import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Signup from "./components/Auth/SignupPage";
import SignIn from "./components/Auth/SignInPage";
import ForgetPassword from "./components/Auth/ForgetPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import Home from "./components/Home/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProfile from "./components/Auth/UserProfile";
import Screen from "./pages/Screen";
import Locations from "./pages/Locations";
import Users from "./pages/Users";
import Category from "./pages/Category";
import Roles from "./pages/Roles";
import Store from "./pages/Store";

const App = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // If user data is found, set it to state
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }
  }, []); // Only runs once on initial render

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<UserProfile toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} />
        <Route path="/Screen" element={<Screen toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} />
        <Route path="/users" element={<Users toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} />
<<<<<<< HEAD
        <Route path="/locations" element={<Locations toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} />
=======
        <Route path="/category" element={<Category toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} /> {/* Add Category route */}
>>>>>>> b36e76e111befe2ad2e6a1162e6c71d2f2d41a0e
        <Route path="/roles" element={<Roles toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} />
        <Route path="/store" element={<Store toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />} />

        

        {/* Check directly for token in localStorage and redirect if not found */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Home toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} user={user} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
      </Routes>
      <ToastContainer position="top-center" autoClose={1500} />
    </ThemeProvider>
  );
};

export default App;
