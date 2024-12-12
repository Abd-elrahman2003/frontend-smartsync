import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { ThemeProvider } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { useSignupUserMutation } from "../../Redux/Featuress/auth/authApi";
import { toast } from "react-toastify";
import theme from "../../theme";
import "react-toastify/dist/ReactToastify.css";
import zxcvbn from "zxcvbn";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER", // Default role
  });

  const [isAgreed, setIsAgreed] = useState(false); // Checkbox state

  const [signupUser, { isLoading }] = useSignupUserMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAgreed) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const passwordStrength = zxcvbn(formData.password);
    if (passwordStrength.score < 3) {
      toast.error("Password is not strong enough. Please use a stronger password.");
      return;
    }

    try {
      await signupUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }).unwrap();

      toast.success("Account created successfully!");
      navigate("/signin");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error?.data?.message || "Failed to create an account. Please try again."
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
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              letterSpacing: 1,
              fontSize: "1.8rem",
            }}
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
            {[{ label: "First Name", name: "firstName", type: "text", icon: <FiUser /> },
              { label: "Last Name", name: "lastName", type: "text", icon: <FiUser /> },
              { label: "Email Address", name: "email", type: "email", icon: <FiMail /> },
              { label: "Password", name: "password", type: "password", icon: <FiLock /> },
              {
                label: "Confirm Password",
                name: "confirmPassword",
                type: "password",
                icon: <FiLock />,
              },
            ].map((field, idx) => (
              <CardContent key={idx} sx={{ padding: "10px 0" }}>
                <Box display="flex" alignItems="center" mb={2}>
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
                    sx={{ color: "text.primary", fontSize: "1rem" }}
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

            <Box mt={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAgreed}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="textSecondary">
                    I agree to the{" "}
                    <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                      terms and conditions
                    </Link>.
                  </Typography>
                }
              />
            </Box>

            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "primary.main",
                  color: "#FFFFFF",
                  padding: "10px 0",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  "&:hover": { backgroundColor: "secondary.main" },
                }}
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Account"}
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
