import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
  email: '',
  password: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setApiError('');
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setApiError(message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  autoComplete="current-password"
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" fullWidth variant="contained" size="large">
                  Login
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
