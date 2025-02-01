import React from "react";
import { Box, Button } from "@mui/material";
import { FaPlus, FaSearch, FaRedo } from "react-icons/fa";

const Buttons = ({ onAddClick, onSearchClick, onRefreshClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<FaPlus />}
        onClick={onAddClick}
        sx={{
          fontSize: { xs: "10px", sm: "12px", md: "14px" },
          padding: { xs: "4px 8px", sm: "6px 10px" },
          minWidth: "60px",
        }}
      >
        Add
      </Button>
      <Button
        variant="contained"
        startIcon={<FaSearch />}
        onClick={onSearchClick}
        sx={{
          backgroundColor: "error.main",
          fontSize: { xs: "10px", sm: "12px", md: "14px" },
          padding: { xs: "4px 8px", sm: "6px 10px" },
          minWidth: "60px",
        }}
      >
        Search
      </Button>
      <Button
        variant="contained"
        startIcon={<FaRedo />}
        onClick={onRefreshClick}
        sx={{
          backgroundColor: "primary.main",
          fontSize: { xs: "10px", sm: "12px", md: "14px" },
          padding: { xs: "4px 8px", sm: "6px 10px" },
          minWidth: "60px",
        }}
      >
        Refresh
      </Button>
    </Box>
  );
};

export default Buttons;
