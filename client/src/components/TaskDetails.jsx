import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import {
  createComment,
  deleteComment,
  getCommentsByTask,
  updateComment,
} from '../services/taskService';

const TaskDetails = ({ open, onClose, task }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!open || !task?._id) {
      setComments([]);
      return;
    }

    const loadComments = async () => {
      try {
        setLoading(true);
        const response = await getCommentsByTask(task._id);
        setComments(response.data.comments || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [open, task?._id]);

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    if (!commentContent.trim()) {
      setError('Comment content is required');
      return;
    }

    try {
      setLoading(true);

      if (editingComment) {
        await updateComment(editingComment._id, { content: commentContent });
      } else {
        await createComment(task._id, { content: commentContent });
      }

      const response = await getCommentsByTask(task._id);
      setComments(response.data.comments || []);
      setCommentContent('');
      setEditingComment(null);
      setError('');
      setSnackbar({
        open: true,
        message: editingComment ? 'Comment updated' : 'Comment added',
        severity: 'success',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      const response = await getCommentsByTask(task._id);
      setComments(response.data.comments || []);
      setSnackbar({ open: true, message: 'Comment deleted', severity: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete comment');
    }
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{task.title}</Typography>
        <IconButton onClick={onClose} aria-label="close task details">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body1">{task.description || 'No description provided.'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {task.status}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assigned to: {task.assignedTo?.name || 'Unassigned'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              List: {task.list?.title || 'Unknown list'}
            </Typography>
          </Stack>

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Comments
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No comments yet.
                </Typography>
              ) : (
                comments.map((comment) => (
                  <Card key={comment._id} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Typography variant="subtitle2">{comment.user?.name || 'User'}</Typography>
                        </Stack>

                        {comment.user?._id === user?._id && (
                          <Stack direction="row">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingComment(comment);
                                setCommentContent(comment.content);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="error" size="small" onClick={() => handleDeleteComment(comment._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {comment.content}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>

            <Box component="form" onSubmit={handleSubmitComment} sx={{ mt: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label={editingComment ? 'Edit comment' : 'Add comment'}
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  multiline
                  minRows={3}
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {editingComment && (
                    <Button
                      variant="text"
                      onClick={() => {
                        setEditingComment(null);
                        setCommentContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  )}

                  <Button variant="contained" type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingComment ? 'Update Comment' : 'Add Comment'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default TaskDetails;
