import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const Progress = ({ value, label, showPercentage = false }) => {
  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      {label && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", mr: 2 }}>
          <LinearProgress variant="determinate" value={value} />
        </Box>

        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="textSecondary">
            {showPercentage ? `${Math.round(value)}%` : value}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Progress;
