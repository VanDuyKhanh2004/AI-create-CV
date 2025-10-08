import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import api from "../config/api";
import { toast } from "react-toastify";
import GetAppIcon from "@mui/icons-material/GetApp";

const CVEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);

  const {
    data: cv,
    isLoading,
    error,
  } = useQuery(
    ["cv", id],
    async () => {
      const response = await api.get(`/api/cv/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
    }
  );

  const updateCVMutation = useMutation(
    async (updatedData) => {
      const response = await api.put(`/api/cv/${id}`, updatedData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cv", id]);
        toast.success("CV updated successfully");
      },
      onError: () => {
        toast.error("Failed to update CV");
      },
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSave = () => {
    if (cv) {
      updateCVMutation.mutate(cv);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Error loading CV</Alert>
      </Container>
    );
  }

  if (!cv) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">CV not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Edit CV</Typography>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 2 }}
            onClick={() => navigate("/cv-list")}
          >
            Back to List
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            sx={{ mr: 2 }}
            onClick={async () => {
              if (!cv?._id) return;
              try {
                const res = await fetch(
                  `${
                    process.env.REACT_APP_API_URL || "http://localhost:5000"
                  }/api/cv/${cv._id}/download`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
                if (!res.ok) {
                  alert("Failed to download PDF");
                  return;
                }
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `cv-${cv._id}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert("Error downloading PDF");
              }
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateCVMutation.isLoading}
          >
            {updateCVMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Box>
      </Box>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Personal Info" />
            <Tab label="Experience" />
            <Tab label="Education" />
            <Tab label="Skills" />
            <Tab label="Projects" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={cv.personalInfo?.fullName || ""}
                  onChange={(e) => {
                    // Handle personal info changes
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={cv.personalInfo?.jobTitle || ""}
                  onChange={(e) => {
                    // Handle job title changes
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={cv.personalInfo?.email || ""}
                  onChange={(e) => {
                    // Handle email changes
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={cv.personalInfo?.phone || ""}
                  onChange={(e) => {
                    // Handle phone changes
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={cv.personalInfo?.address || ""}
                  onChange={(e) => {
                    // Handle address changes
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Professional Summary"
                  multiline
                  rows={4}
                  value={cv.personalInfo?.summary || ""}
                  onChange={(e) => {
                    // Handle summary changes
                  }}
                />
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Work Experience
              </Typography>
              {cv.experience?.map((exp, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={exp.company || ""}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Position"
                          value={exp.position || ""}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={exp.description || ""}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              {cv.education?.map((edu, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="School"
                          value={edu.school || ""}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Degree"
                          value={edu.degree || ""}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={2}
                          value={edu.description || ""}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              {cv.skills?.map((skillGroup, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Category"
                      value={skillGroup.category || ""}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Skills:{" "}
                      {skillGroup.skills?.map((s) => s.name).join(", ") ||
                        "No skills listed"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {tabValue === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Projects
              </Typography>
              {cv.projects?.map((project, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Project Name"
                          value={project.name || ""}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Role"
                          value={project.role || ""}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={project.description || ""}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CVEdit;
