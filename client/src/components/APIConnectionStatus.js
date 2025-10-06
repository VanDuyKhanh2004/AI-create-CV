import React, { useState, useEffect } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { testAPIConnection } from "../utils/apiTest";

const APIConnectionStatus = () => {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking API connection...");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testAPIConnection();
        if (result.success) {
          setStatus("connected");
          setMessage("API Connected");
        } else {
          setStatus("disconnected");
          setMessage("API Disconnected");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Connection Error");
      }
    };

    // Check connection after 3 seconds
    const timer = setTimeout(checkConnection, 3000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "success";
      case "disconnected":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Box sx={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
      <Chip
        label={message}
        color={getStatusColor()}
        size="small"
        variant="outlined"
      />
    </Box>
  );
};

export default APIConnectionStatus;
