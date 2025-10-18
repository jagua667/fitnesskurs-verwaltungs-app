import React from "react";
import { Snackbar, Alert, Slide, Box } from "@mui/material";
import { CheckCircle, Info, Warning, Error as ErrorIcon } from "@mui/icons-material";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const iconMap = {
  success: <CheckCircle fontSize="inherit" />,
  info: <Info fontSize="inherit" />,
  warning: <Warning fontSize="inherit" />,
  error: <ErrorIcon fontSize="inherit" />,
};

const gradientMap = {
  success: "linear-gradient(45deg, #4caf50, #81c784)",
  info: "linear-gradient(45deg, #2196f3, #64b5f6)",
  warning: "linear-gradient(45deg, #ff9800, #ffb74d)",
  error: "linear-gradient(45deg, #f44336, #e57373)",
};

const NotificationSnackbar = ({ open, message, severity = "info", onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Box
        sx={{
          background: gradientMap[severity] || gradientMap.info,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          borderRadius: 2,
        }}
      >
        <Alert
          onClose={onClose}
          severity={severity}
          icon={iconMap[severity]}
          sx={{
            color: "white",
            background: "transparent",
            fontWeight: 500,
            fontSize: "0.95rem",
            letterSpacing: 0.2,
          }}
        >
          {message}
        </Alert>
      </Box>
    </Snackbar>
  );
};

export default NotificationSnackbar;

