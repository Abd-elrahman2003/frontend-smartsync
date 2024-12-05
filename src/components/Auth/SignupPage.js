import React, { useState } from "react";
import { TextField, Button, Box, Typography, Card, CardContent } from "@mui/material";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { ThemeProvider } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import theme from "../../theme";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupPage = ({ setLoggedIn }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // مؤقتًا: تسجيل الدخول مباشرةً عند إرسال البيانات
    toast.success("Account created successfully!");
    setLoggedIn(true); 
    navigate("/"); 
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
            Create Your Account
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            Join us today and explore amazing features
          </Typography>
          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
            {[{ label: "Full Name", name: "name", type: "text", icon: <FiUser /> },
              { label: "Email Address", name: "email", type: "email", icon: <FiMail /> },
              { label: "Password", name: "password", type: "password", icon: <FiLock /> },
              { label: "Confirm Password", name: "confirmPassword", type: "password", icon: <FiLock /> }].map((field, idx) => (
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
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "& fieldset": { borderColor: "secondary.main" },
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
              >
                Create Account
              </Button>
            </Box>

            <Box textAlign="center" mt={3}>
              <Typography variant="body1" color="textSecondary">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </form>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default SignupPage;
