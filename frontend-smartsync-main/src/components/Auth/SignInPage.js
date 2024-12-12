import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { FiMail, FiLock } from "react-icons/fi";
import { ThemeProvider } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { useSigninUserMutation } from "../../Redux/Featuress/auth/authApi";
import theme from "../../theme";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Redux/Featuress/auth/authSlice";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch=useDispatch()
  const [signinUser, { isLoading }] = useSigninUserMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await signinUser(formData).unwrap();
  
      // Dispatch the loginSuccess action
      dispatch(loginSuccess(response));
  
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
  
      navigate("/");
    } catch (error) {
      toast.error(
        error?.data?.message || "Invalid email or password. Please try again."
      );
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #e3f2fd, #e8eaf6)",
          padding: 3,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 500,
            padding: 4,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Welcome Back!
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            Sign in to your account and continue where you left off.
          </Typography>
          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
            {[
              { label: "Email Address", name: "email", type: "email", icon: <FiMail /> },
              { label: "Password", name: "password", type: "password", icon: <FiLock /> },
            ].map((field, idx) => (
              <CardContent key={idx} sx={{ padding: "6px 0" }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box
                    sx={{
                      marginRight: 1.5,
                      fontSize: "1.5rem",
                      color: "primary.main",
                    }}
                  >
                    {field.icon}
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ color: "text.primary" }}
                  >
                    {field.label}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  label={field.label}
                  type={field.type}
                  variant="outlined"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: theme.shape.borderRadius,
                      height: 50,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                      "& fieldset": {
                        borderColor: "secondary.main",
                      },
                    },
                  }}
                />
              </CardContent>
            ))}

            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "primary.main",
                  color: "#FFFFFF",
                  padding: "8px 0",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  "&:hover": { backgroundColor: "secondary.main" },
                }}
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </Button>
            </Box>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2">
                <Link
                  to="/forget-password"
                  style={{
                    color: theme.palette.text.primary,
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  Forgot Password?
                </Link>
              </Typography>
              <Typography
                color="textSecondary"
                mt={2}
                sx={{ marginTop: "1rem" }}
              >
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </form>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default SignInPage;
