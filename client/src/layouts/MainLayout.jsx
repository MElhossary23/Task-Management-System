import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7ff' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {title}
          </Typography>

          {user && (
            <>
              <Button color="inherit" href="/dashboard" sx={{ mr: 1 }}>
                Dashboard
              </Button>

              <IconButton color="inherit" onClick={handleMenuOpen}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 14 }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>

              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout;
