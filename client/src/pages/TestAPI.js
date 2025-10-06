import React, { useState } from "react";
import { Button, Container, Box, Typography, TextField, Paper } from "@mui/material";
import api from "../config/api";
import { config } from "../config/environment";

const TestAPI = () => {
  const [status, setStatus] = useState(null);
  const [cvList, setCvList] = useState([]);
  const [createdCv, setCreatedCv] = useState(null);

  const startGoogleLogin = () => {
    const base = (config && config.API_BASE_URL) || window.location.origin;
    window.location.href = base.replace(/\/$/, "") + "/auth/google";
  };

  const checkStatus = async () => {
    try {
      const res = await api.get("/auth/status");
      setStatus(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setStatus("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const doLogout = async () => {
    try {
      const res = await api.get("/auth/logout");
      setStatus(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setStatus("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const getCVs = async () => {
    try {
      const res = await api.get("/api/cv");
      setCvList(res.data);
    } catch (err) {
      setCvList([]);
      setStatus("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const createSampleCV = async () => {
    try {
      const sample = {
        personalInfo: { fullName: "Test User", email: "test@example.com" },
        education: [{ school: "ABC University", degree: "BSc" }],
      };
      const res = await api.post("/api/cv", sample);
      setCreatedCv(res.data);
    } catch (err) {
      setCreatedCv(null);
      setStatus("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          API Test / Auth Integration
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <Button variant="contained" onClick={startGoogleLogin}>
            Sign in with Google
          </Button>
          <Button variant="outlined" onClick={checkStatus}>
            Check Auth Status
          </Button>
          <Button variant="outlined" onClick={doLogout}>
            Logout
          </Button>
          <Button variant="outlined" onClick={getCVs}>
            Get CVs
          </Button>
          <Button variant="outlined" onClick={createSampleCV}>
            Create sample CV
          </Button>
        </Box>

        <Typography variant="subtitle1">Status:</Typography>
        <Paper sx={{ p: 2, whiteSpace: "pre-wrap", mb: 2 }} elevation={0}>
          {status || "No status yet"}
        </Paper>

        <Typography variant="subtitle1">CVs:</Typography>
        <Paper sx={{ p: 2, mb: 2 }} elevation={0}>
          {cvList.length ? (
            cvList.map((c) => (
              <Box key={c._id} sx={{ mb: 1 }}>
                <strong>{c.personalInfo?.fullName}</strong> - {c._id}
              </Box>
            ))
          ) : (
            <Box>No CVs</Box>
          )}
        </Paper>

        <Typography variant="subtitle1">Created CV:</Typography>
        <Paper sx={{ p: 2 }} elevation={0}>
          {createdCv ? JSON.stringify(createdCv, null, 2) : "No created CV"}
        </Paper>
      </Paper>
    </Container>
  );
};

export default TestAPI;
