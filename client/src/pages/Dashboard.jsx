import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BoardForm from '../components/BoardForm';
import BoardList from '../components/BoardList';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { createBoard, deleteBoard, getBoards, updateBoard } from '../services/boardService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await getBoards();
      setBoards(response.data.boards || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleOpenBoard = (board) => {
    navigate(`/boards/${board._id}`);
  };

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setDialogOpen(true);
  };

  const handleEditBoard = (board) => {
    setEditingBoard(board);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBoard(null);
  };

  const handleBoardSubmit = async (formData) => {
    try {
      setSubmitLoading(true);

      if (editingBoard) {
        await updateBoard(editingBoard._id, formData);
      } else {
        await createBoard(formData);
      }

      await fetchBoards();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Board submission failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const confirmDelete = window.confirm('Delete this board?');

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteBoard(boardId);
      setBoards((prev) => prev.filter((board) => board._id !== boardId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete board');
    }
  };

  return (
    <MainLayout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h4">My Boards</Typography>
          <Button variant="contained" onClick={handleCreateBoard}>
            Create Board
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <BoardList
          boards={boards}
          currentUserId={currentUserId}
          onOpen={handleOpenBoard}
          onEdit={handleEditBoard}
          onDelete={handleDeleteBoard}
        />
      )}

      <BoardForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleBoardSubmit}
        initialData={editingBoard}
        loading={submitLoading}
      />
    </MainLayout>
  );
};

export default DashboardPage;
