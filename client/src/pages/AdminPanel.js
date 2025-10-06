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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { People, Description, TrendingUp, Security } from "@mui/icons-material";
import { useQuery } from "react-query";
import api from "../config/api";

const AdminPanel = () => {
  const { data: allCVs, isLoading: cvsLoading } = useQuery(
    "admin-cvs",
    async () => {
      const response = await api.get("/api/cv/admin/all");
      return response.data;
    }
  );

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: <People sx={{ fontSize: 40, color: "primary.main" }} />,
      color: "primary",
    },
    {
      title: "Total CVs",
      value: allCVs?.length || "0",
      icon: <Description sx={{ fontSize: 40, color: "success.main" }} />,
      color: "success",
    },
    {
      title: "AI Generations",
      value: "5,678",
      icon: <TrendingUp sx={{ fontSize: 40, color: "warning.main" }} />,
      color: "warning",
    },
    {
      title: "Active Sessions",
      value: "89",
      icon: <Security sx={{ fontSize: 40, color: "error.main" }} />,
      color: "error",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your AI CV Builder platform
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {stat.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent CVs Table */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent CVs
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Owner</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cvsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                allCVs?.slice(0, 10).map((cv) => (
                  <TableRow key={cv._id}>
                    <TableCell>
                      {cv.personalInfo?.fullName || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {cv.personalInfo?.jobTitle || "No title"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cv.metadata?.status || "draft"}
                        color={
                          cv.metadata?.status === "published"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(cv.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="small">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Admin Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage user accounts and permissions
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="outlined">Manage Users</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure AI settings and platform options
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="outlined">Settings</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPanel;
