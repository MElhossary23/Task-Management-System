import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const statusOptions = ['To Do', 'In Progress', 'Done'];

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenDetails,
  isBoardOwner,
  currentUserId,
}) => {
  const handleStatusChange = (event) => {
    onStatusChange(task, event.target.value);
  };
  const assignedUserId = task.assignedTo?._id || task.assignedTo;
  const canChangeStatus =
    isBoardOwner || assignedUserId?.toString() === currentUserId?.toString();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
              {task.title}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => onOpenDetails(task)} aria-label="view task details">
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
              {isBoardOwner && (
                <>
                  <IconButton size="small" onClick={() => onEdit(task)} aria-label="edit task">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(task._id)} aria-label="delete task">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {task.description || 'No description provided.'}
          </Typography>

          <Chip
            label={task.status || 'To Do'}
            color={
              task.status === 'Done'
                ? 'success'
                : task.status === 'In Progress'
                  ? 'warning'
                  : 'default'
            }
            size="small"
          />

          <Typography variant="caption" color="text.secondary">
            Assigned: {task.assignedTo?.name || 'Unassigned'}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </Typography>

          <FormControl size="small" fullWidth>
            <InputLabel id={`status-${task._id}`}>Status</InputLabel>
            <Select
              labelId={`status-${task._id}`}
              value={task.status || 'To Do'}
              label="Status"
              onChange={handleStatusChange}
              disabled={!canChangeStatus}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
