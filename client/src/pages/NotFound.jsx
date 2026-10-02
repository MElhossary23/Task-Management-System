import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', px: 2 }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h3" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Page not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The page you are looking for does not exist.
          </Typography>
          <Button component={Link} to="/login" variant="contained">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default NotFoundPage;
