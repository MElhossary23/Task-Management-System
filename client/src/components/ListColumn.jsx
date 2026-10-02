import { Box, Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ListColumn = ({ list, onEdit, onDelete }) => {
  return (
    <Card sx={{ minHeight: 220 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
            {list.title}
          </Typography>

          <Box>
            <IconButton size="small" onClick={() => onEdit(list)} aria-label="edit list">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(list._id)} aria-label="delete list">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>

        <Button variant="outlined" size="small" fullWidth>
          Add Task
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListColumn;
