import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { Build, Speed, Security, CloudUpload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Build sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "AI-Powered CV Builder",
      description:
        "Create professional CVs with AI assistance and smart suggestions.",
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Quick & Easy",
      description: "Build your CV in minutes with our intuitive interface.",
    },
    {
      icon: <Security sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Secure & Private",
      description: "Your data is safe with enterprise-grade security.",
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Export & Share",
      description: "Download as PDF or share your CV with potential employers.",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom>
              AI-Powered CV Builder
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Create professional CVs with artificial intelligence assistance
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {isAuthenticated ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    {user?.profileImage && (
                      <img
                        src={user.profileImage}
                        alt="avatar"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          border: "2px solid white",
                        }}
                      />
                    )}
                    <Box textAlign="left">
                      <Typography variant="subtitle1">
                        {user?.firstName
                          ? `${user.firstName} ${user.lastName || ""}`
                          : user?.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ backgroundColor: "white", color: "primary.main" }}
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ backgroundColor: "white", color: "primary.main" }}
                    onClick={() => navigate("/register")}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: "white", color: "white" }}
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" textAlign="center" gutterBottom>
          Why Choose Our AI CV Builder?
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Powerful features to help you create the perfect CV
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: "100%", textAlign: "center" }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Paper sx={{ py: 6, mt: 4 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom>
              Ready to Build Your Professional CV?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of professionals who have already created their CVs
              with AI
            </Typography>
            {!isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/register")}
              >
                Start Building Now
              </Button>
            )}
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default Home;
