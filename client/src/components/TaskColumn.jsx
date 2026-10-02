import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TaskCard from './TaskCard';

const TaskColumn = ({
  list,
  title,
  tasks = [],
  onAddTask,
  onEditList,
  onDeleteList,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onOpenDetails,
  isBoardOwner,
  currentUserId,
}) => {
  const columnTitle = title || list?.title || 'List';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        width: 320,
        minWidth: 320,
        minHeight: 260,
        maxHeight: 'calc(100vh - 280px)',
        overflowY: 'auto',
        backgroundColor: '#f1f3f5',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
          {columnTitle} <Typography component="span" variant="caption" color="text.secondary">{tasks.length}</Typography>
        </Typography>

        {(onEditList || onDeleteList) && (
          <Box sx={{ flexShrink: 0 }}>
            {onEditList && (
              <IconButton size="small" onClick={() => onEditList(list)} aria-label="edit list">
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDeleteList && (
              <IconButton size="small" color="error" onClick={() => onDeleteList(list?._id)} aria-label="delete list">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Stack>

      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No cards in this column
        </Typography>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onStatusChange={onStatusChange}
            onOpenDetails={onOpenDetails}
            isBoardOwner={isBoardOwner}
            currentUserId={currentUserId}
          />
        ))
      )}

      {onAddTask && (
        <Button
          startIcon={<AddIcon />}
          size="small"
          fullWidth
          sx={{ justifyContent: 'flex-start', mt: 0.5 }}
          onClick={() => onAddTask(list?._id)}
        >
          Add a task
        </Button>
      )}
    </Paper>
  );
};

export default TaskColumn;
