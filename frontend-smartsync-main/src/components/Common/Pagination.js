import React from "react";
import { Box, Button, Typography } from "@mui/material";

const Pagination = ({ currentPage, totalPages, onNext, onPrev }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
      }}
    >
      <Button
        onClick={onPrev}
        disabled={currentPage === 1}
        variant="outlined"
      >
        Prev
      </Button>
      <Typography variant="body2">
        Page {currentPage} of {totalPages}
      </Typography>
      <Button
        onClick={onNext}
        disabled={currentPage === totalPages}
        variant="outlined"
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination;
