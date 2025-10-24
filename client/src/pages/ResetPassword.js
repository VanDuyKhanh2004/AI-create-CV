import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Mật khẩu đã được đặt lại. Hãy đăng nhập lại.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Đặt lại mật khẩu</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Mật khẩu mới" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={20} /> : 'Đặt lại mật khẩu'}</Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
