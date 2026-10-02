import { Button, Card, CardContent, CardActions, Chip, Stack, Typography } from '@mui/material';

const BoardCard = ({ board, currentUserId, onOpen, onEdit, onDelete }) => {
  const ownerId = board.owner?._id || board.owner;
  const isOwner =
    board.role === 'owner' ||
    (currentUserId && ownerId && ownerId.toString() === currentUserId.toString());

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
            {board.title}
          </Typography>
          <Chip label={isOwner ? 'Owner' : 'Member'} color={isOwner ? 'primary' : 'default'} size="small" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48, wordBreak: 'break-word' }}>
          {board.description || 'No description provided.'}
        </Typography>

        <Stack spacing={0.75} sx={{ mt: 2 }}>
          <Typography variant="body2">
            Created by {isOwner ? 'You' : board.owner?.name || 'Unknown'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role: {isOwner ? 'Owner' : 'Member'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tasks: {board.taskCount ?? 'Not available'}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions>
        <Button size="small" variant="contained" onClick={() => onOpen(board)}>
          Open
        </Button>
        {isOwner && (
          <>
            <Button size="small" variant="outlined" onClick={() => onEdit(board)}>
              Edit
            </Button>
            <Button size="small" color="error" onClick={() => onDelete(board._id)}>
              Delete
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default BoardCard;
