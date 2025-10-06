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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import api from "../config/api";
import { toast } from "react-toastify";

const steps = ["Basic Information", "Experience & Skills", "Generate CV"];

const CVBuilder = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    jobTitle: "",
    experience: "",
    skills: [],
    education: "",
    summary: "",
  });

  const generateCVMutation = useMutation(
    async (data) => {
      const response = await api.post("/api/ai/generate", data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("CV generated successfully!");
        // Navigate to CV edit page with generated CV id
        const id = data._id || data.cv?._id || data.id;
        if (id) {
          navigate(`/cv/${id}/edit`);
        } else {
          navigate("/cv-list");
        }
      },
      onError: (error) => {
        toast.error("Failed to generate CV");
        console.error("Generate CV error:", error);
      },
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setFormData({
      ...formData,
      skills: skills.filter((skill) => skill.length > 0),
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerate = () => {
    generateCVMutation.mutate(formData);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g., Software Developer, Marketing Manager"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g., 5"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's in Computer Science"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                name="skills"
                value={formData.skills.join(", ")}
                onChange={handleSkillsChange}
                placeholder="e.g., JavaScript, React, Node.js, Python"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Brief description of your professional background"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Job Title:</strong> {formData.jobTitle}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Experience:</strong> {formData.experience} years
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Education:</strong> {formData.education}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Skills:</strong> {formData.skills.join(", ")}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Summary:</strong> {formData.summary}
                </Typography>
              </CardContent>
            </Card>
            <Alert severity="info" sx={{ mb: 2 }}>
              Our AI will generate a professional CV based on your information.
              You can edit and customize it after generation.
            </Alert>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          AI CV Builder
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Let AI help you create a professional CV in minutes
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={generateCVMutation.isLoading}
              >
                {generateCVMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Generate CV"
                )}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CVBuilder;
