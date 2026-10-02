import { useState } from 'react';
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

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

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
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
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate('/login', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
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
            Register
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
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  autoComplete="name"
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
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" fullWidth variant="contained" size="large">
                  Register
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Login here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
