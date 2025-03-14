import React from "react";
import {
  Box,
  Button,
} from "@mui/material";
import {
  FaSearch,
  FaSave,
  FaRedo,
  FaTrash,
  FaEdit,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

const ReturnedButtons = ({
  onSearchClick,
  onSaveClick,
  onResetClick,
  onPostClick,
  onDeleteClick,
  onUpdateClick,
  onUnpostClick,
  onReturnSearchClick, // Added new prop for return search functionality
  showActionButtons = false, // Default to false
  isPosted = false, // Default to false
}) => {
  const handleSaveClick = async () => {
    if (onSaveClick) {
      await onSaveClick(); // No need to update local state here
    }
  };

  const handleResetClick = () => {
    if (onResetClick) onResetClick();
  };
  
  const handleDeleteClick = () => {
    if (onDeleteClick) onDeleteClick();
  };

  const buttonStyles = {
    fontSize: { xs: "10px", sm: "12px", md: "14px" },
    padding: { xs: "4px 8px", sm: "6px 10px" },
    minWidth: "120px",
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1445, mt: 3 }}>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        {/* Return Search button - Always visible */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaSearch />}
          onClick={onReturnSearchClick}
          sx={buttonStyles}
        >
          Received Search
        </Button>

        {/* Search and Reset - Always visible */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaSearch />}
          onClick={onSearchClick}
          sx={buttonStyles}
        >
          Return Search
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<FaRedo />}
          onClick={handleResetClick}
          sx={buttonStyles}
        >
          Reset Order
        </Button>

        {!showActionButtons ? (
          // Before saving, show Return Order button
          <Button
            variant="contained"
            color="success"
            startIcon={<FaSave />}
            onClick={handleSaveClick}
            sx={buttonStyles}
          >
            Return Order
          </Button>
        ) : (
          // After saving, show appropriate buttons based on isPosted
          <Box sx={{ display: "flex", gap: 2 }}>
            {!isPosted ? (
              // Show Post, Delete, Update for non-posted orders
              <>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<FaPaperPlane />}
                  onClick={onPostClick}
                  sx={buttonStyles}
                >
                  Post
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<FaTrash />}
                  onClick={handleDeleteClick}
                  sx={buttonStyles}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FaEdit />}
                  onClick={onUpdateClick}
                  sx={buttonStyles}
                >
                  Update
                </Button>
              </>
            ) : (
              // Show only Unpost for posted orders
              <Button
                variant="contained"
                color="warning"
                startIcon={<FaPaperPlane />}
                onClick={onUnpostClick}
                sx={buttonStyles}
              >
                Unpost
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReturnedButtons;