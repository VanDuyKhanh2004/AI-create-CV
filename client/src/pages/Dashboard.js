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
} from "@mui/material";
import { Build, List, TrendingUp, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Build New CV",
      description: "Create a new CV with AI assistance",
      icon: <Build sx={{ fontSize: 40, color: "primary.main" }} />,
      action: () => navigate("/cv-builder"),
      buttonText: "Start Building",
    },
    {
      title: "View My CVs",
      description: "Manage and edit your existing CVs",
      icon: <List sx={{ fontSize: 40, color: "primary.main" }} />,
      action: () => navigate("/cv-list"),
      buttonText: "View CVs",
    },
    {
      title: "AI Optimization",
      description: "Optimize your CV with AI suggestions",
      icon: <TrendingUp sx={{ fontSize: 40, color: "primary.main" }} />,
      action: () => navigate("/cv-list"),
      buttonText: "Optimize",
    },
    {
      title: "Profile Settings",
      description: "Update your personal information",
      icon: <Person sx={{ fontSize: 40, color: "primary.main" }} />,
      action: () => navigate("/profile"),
      buttonText: "Settings",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready to build your next professional CV? Let's get started.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>{action.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button variant="contained" onClick={action.action} fullWidth>
                  {action.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No recent activity. Start by creating your first CV!
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => navigate("/cv-builder")}
        >
          Create Your First CV
        </Button>
      </Paper>
    </Container>
  );
};

export default Dashboard;


