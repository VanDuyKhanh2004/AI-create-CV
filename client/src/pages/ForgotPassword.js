import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import api from '../config/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Nếu email tồn tại, một email đặt lại mật khẩu đã được gửi.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Quên mật khẩu</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={20} /> : 'Gửi yêu cầu'}</Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
