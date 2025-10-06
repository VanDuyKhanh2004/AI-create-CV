import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import { Edit, Delete, Visibility, MoreVert, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import api from "../config/api";
import { toast } from "react-toastify";

const CVList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedCV, setSelectedCV] = React.useState(null);

  const {
    data: cvs,
    isLoading,
    error,
  } = useQuery("cvs", async () => {
    const response = await api.get("/api/cv");
    return response.data;
  });

  const deleteCVMutation = useMutation(
    async (cvId) => {
      await api.delete(`/api/cv/${cvId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("cvs");
        toast.success("CV deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete CV");
      },
    }
  );

  const handleMenuOpen = (event, cv) => {
    setAnchorEl(event.currentTarget);
    setSelectedCV(cv);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCV(null);
  };

  const handleEdit = (cvParam) => {
    const cvToEdit = cvParam || selectedCV;
    if (!cvToEdit) return;
    navigate(`/cv/${cvToEdit._id}/edit`);
    handleMenuClose();
  };

  const handleView = (cvParam) => {
    const cvToView = cvParam || selectedCV;
    if (!cvToView) return;
    // Navigate to view CV page
    console.log("View CV:", cvToView._id);
    handleMenuClose();
  };

  const handleDelete = (cvParam) => {
    const cvToDelete = cvParam || selectedCV;
    if (!cvToDelete) return;
    if (window.confirm("Are you sure you want to delete this CV?")) {
      deleteCVMutation.mutate(cvToDelete._id);
    }
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Error loading CVs</Typography>
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
        <Typography variant="h4">My CVs</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/cv-builder")}
        >
          Create New CV
        </Button>
      </Box>

      {cvs && cvs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No CVs found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start building your first professional CV with AI assistance
          </Typography>
          <Button variant="contained" onClick={() => navigate("/cv-builder")}>
            Create Your First CV
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {cvs?.map((cv) => (
            <Grid item xs={12} sm={6} md={4} key={cv._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      {cv.personalInfo?.fullName || "Untitled CV"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, cv)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {cv.personalInfo?.jobTitle || "No job title"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {cv.personalInfo?.email || "No email"}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={cv.metadata?.status || "draft"}
                      size="small"
                      color={
                        cv.metadata?.status === "published"
                          ? "success"
                          : "default"
                      }
                    />
                    <Chip
                      label={`v${cv.metadata?.version || 1}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleView(cv)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(cv)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(selectedCV)}>
          <Visibility sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedCV)}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedCV)} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default CVList;
