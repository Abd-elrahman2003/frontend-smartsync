import React, { useState } from "react";
import { Box, TextField, Button, Typography, Card, CardContent } from "@mui/material";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import theme from "../../theme"; 
import { useRequestResetPasswordMutation } from '../../Redux/Featuress/auth/authApi';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestResetPassword, { isLoading }] = useRequestResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await requestResetPassword({ email }).unwrap();
      setIsSubmitted(true); 
      toast.success("Password reset link sent successfully!");
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to send password reset link. Please try again."
      );
    }
  };

  return (
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
          maxWidth: 400,
          padding: 4,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          Forgot Password
        </Typography>

        {isSubmitted ? (
          <Typography variant="body1" align="center" color="success.main" mt={2}>
            A password reset link has been sent to your email!
          </Typography>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
            <CardContent sx={{ padding: "8px 0" }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Box
                  sx={{
                    marginRight: 1.5,
                    fontSize: "1.5rem",
                    color: "primary.main",
                  }}
                >
                  <FiMail />
                </Box>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ color: "text.primary" }}
                >
                  Email Address
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Enter your email"
                type="email"
                variant="outlined"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
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

            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "primary.main",
                  color: "#FFFFFF",
                  padding: "12px 0",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "secondary.main" },
                }}
                fullWidth
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Box>
          </form>
        )}

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="textSecondary">
            Remembered your password?{" "}
            <Link
              to="/signin"
              style={{
                textDecoration: "none",
                fontSize: "18px",
                fontWeight: "bold",
                color: theme.palette.primary.main,
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default ForgetPassword;
