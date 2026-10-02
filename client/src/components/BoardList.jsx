import { Alert, Grid } from '@mui/material';
import BoardCard from './BoardCard';

const BoardList = ({ boards, currentUserId, onOpen, onEdit, onDelete }) => {
  if (!boards || boards.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No boards yet. Create your first board to get started.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {boards.map((board) => (
        <Grid item xs={12} sm={6} md={4} key={board._id}>
          <BoardCard
            board={board}
            currentUserId={currentUserId}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default BoardList;
