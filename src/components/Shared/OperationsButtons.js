import React, { useState } from "react";
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
} from "react-icons/fa";

const OperationsButtons = ({
  onSearchClick,
  onSaveClick,
  onResetClick,
  onPostClick,
  onDeleteClick,
  onUpdateClick,
  onUnpostClick,
}) => {
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  const handleSaveClick = async () => {
    if (onSaveClick) {
      const success = await onSaveClick(); // Wait for the response
      if (success) {
        setShowActionButtons(true); // Show Update, Delete, Post
      }
    }
  };

  const handlePostClick = () => {
    setIsPosted(true);
    if (onPostClick) onPostClick();
  };

  const handleUnpostClick = () => {
    setIsPosted(false);
    if (onUnpostClick) onUnpostClick();
  };

  const handleResetClick = () => {
    setShowActionButtons(false);
    setIsPosted(false);
    if (onResetClick) onResetClick();
  };
  
  const handleDeleteClick = () => {
    setShowActionButtons(false); // Switch back to Save Order button
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
        {/* Search and Reset */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaSearch />}
          onClick={onSearchClick}
          sx={buttonStyles}
        >
          Search
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
          // Before saving, show Save Order button
          <Button
            variant="contained"
            color="success"
            startIcon={<FaSave />}
            onClick={handleSaveClick}
            sx={buttonStyles}
          >
            Save Order
          </Button>
        ) : (
          // After saving, show Update, Delete, and Post buttons
          <Box sx={{ display: "flex", gap: 2 }}>
            {!isPosted ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<FaPaperPlane />}
                  onClick={handlePostClick}
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
              <Button
                variant="contained"
                color="warning"
                startIcon={<FaPaperPlane />}
                onClick={handleUnpostClick}
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

export default OperationsButtons;