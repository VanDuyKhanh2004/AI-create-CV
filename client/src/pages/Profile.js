import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import api from '../config/api';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement profile update API
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              bgcolor: "primary.main",
              fontSize: "2rem",
            }}
          >
            {user?.firstName?.charAt(0)}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account information and preferences
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                value={user?.role || "user"}
                disabled
                helperText="Your account role"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Auth Provider"
                value={user?.authProvider || "local"}
                disabled
                helperText="How you signed up"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Update Profile"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (user?.authProvider === 'google') {
                  toast.info('Tài khoản Google không thể đổi mật khẩu tại đây. Vui lòng quản lý mật khẩu qua Google.');
                  return;
                }
                setShowChange(true);
              }}
            >
              Change Password
            </Button>
          </Box>

          <Dialog open={showChange} onClose={() => setShowChange(false)}>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              {changeError && <Alert severity="error" sx={{ mb: 2 }}>{changeError}</Alert>}
              <TextField
                margin="normal"
                label="Current password"
                type="password"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                label="New password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowChange(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={async () => {
                  setChangeError('');
                  if (newPassword.length < 8) {
                    setChangeError('Mật khẩu mới phải có ít nhất 8 ký tự');
                    return;
                  }
                  setChanging(true);
                  try {
                    await api.post('/auth/change-password', { currentPassword, newPassword });
                    toast.success('Password changed');
                    setShowChange(false);
                    setCurrentPassword('');
                    setNewPassword('');
                  } catch (err) {
                    setChangeError(err.response?.data?.message || 'Failed to change password');
                  } finally {
                    setChanging(false);
                  }
                }}
                disabled={changing}
              >
                {changing ? <CircularProgress size={20} /> : 'Change'}
              </Button>
            </DialogActions>
          </Dialog>
        </form>

        <Alert severity="info" sx={{ mt: 3 }}>
          Some information cannot be changed for security reasons. Contact
          support if you need to update your email or role.
        </Alert>
      </Paper>
    </Container>
  );
};

export default Profile;


