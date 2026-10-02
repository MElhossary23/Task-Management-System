import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ActivityList from '../components/ActivityList';
import ListForm from '../components/ListForm';
import TaskColumn from '../components/TaskColumn';
import TaskDetails from '../components/TaskDetails';
import TaskFilter from '../components/TaskFilter';
import TaskForm from '../components/TaskForm';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import {
  addBoardMember,
  createList,
  deleteList,
  getBoard,
  getBoardActivity,
  getBoardLists,
  removeBoardMember,
  updateList,
} from '../services/boardService';
import {
  createTask,
  deleteTask,
  getTasksByList,
  getUsers,
  updateTask,
} from '../services/taskService';

const statusOrder = ['To Do', 'In Progress', 'Done'];

const BoardDetailsPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tasksByList, setTasksByList] = useState({});
  const [tasksByStatus, setTasksByStatus] = useState({
    'To Do': [],
    'In Progress': [],
    Done: [],
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultTaskListId, setDefaultTaskListId] = useState('');
  const [listSubmitLoading, setListSubmitLoading] = useState(false);
  const [taskSubmitLoading, setTaskSubmitLoading] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const [boardResponse, listsResponse, usersResponse, activityResponse] = await Promise.all([
        getBoard(boardId),
        getBoardLists(boardId),
        getUsers(),
        getBoardActivity(boardId),
      ]);

      const fetchedLists = listsResponse.data.lists || [];
      const tasksForEachList = {};
      const tasksForEachStatus = {
        'To Do': [],
        'In Progress': [],
        Done: [],
      };

      if (fetchedLists.length > 0) {
        const tasksResults = await Promise.all(
          fetchedLists.map((list) =>
            getTasksByList(list._id, {
              status: filterStatus === 'All' ? undefined : filterStatus,
              page: 1,
              limit: 50,
            })
          )
        );

        tasksResults.forEach((result, index) => {
          const list = fetchedLists[index];
          const listTasks = (result.data.tasks || []).map((task) => ({
            ...task,
            list: task.list || { _id: list._id, title: list.title },
          }));

          tasksForEachList[list._id] = listTasks;

          listTasks.forEach((task) => {
            const nextStatus = task.status || 'To Do';
            if (tasksForEachStatus[nextStatus]) {
              tasksForEachStatus[nextStatus].push(task);
            }
          });
        });
      }

      setBoard(boardResponse.data.board);
      setLists(fetchedLists);
      setUsers(usersResponse.data.users || []);
      setActivity(activityResponse.data.activity || []);
      setTasksByList(tasksForEachList);
      setTasksByStatus(tasksForEachStatus);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load board details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId, filterStatus]);

  const handleCloseListDialog = () => {
    setListDialogOpen(false);
    setEditingList(null);
  };

  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setEditingTask(null);
    setDefaultTaskListId('');
  };

  const boardOwnerId = board?.owner?._id || board?.owner;
  const currentUserId = user?._id || user?.id;
  const isBoardOwner = Boolean(
    boardOwnerId && currentUserId && boardOwnerId.toString() === currentUserId.toString()
  );

  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      setError('Please enter a member email.');
      return;
    }

    try {
      setMemberActionLoading(true);
      await addBoardMember(boardId, { email: memberEmail });
      setMemberEmail('');
      await fetchBoardDetails();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add board member');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setMemberActionLoading(true);
      await removeBoardMember(boardId, memberId);
      await fetchBoardDetails();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove board member');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleCreateList = () => {
    setEditingList(null);
    setListDialogOpen(true);
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setListDialogOpen(true);
  };

  const handleListSubmit = async (formData) => {
    try {
      setListSubmitLoading(true);

      if (editingList) {
        await updateList(editingList._id, formData);
      } else {
        await createList(boardId, formData);
      }

      await fetchBoardDetails();
      handleCloseListDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'List submission failed');
    } finally {
      setListSubmitLoading(false);
    }
  };

  const handleDeleteList = async (listId) => {
    const confirmDelete = window.confirm('Delete this list?');

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteList(listId);
      setLists((prev) => prev.filter((list) => list._id !== listId));
      await fetchBoardDetails();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete list');
    }
  };

  const handleCreateTask = (listId = lists[0]?._id || '') => {
    setEditingTask(null);
    setTaskDialogOpen(true);
    setDefaultTaskListId(listId);
  };

  const handleOpenTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskSubmit = async (formData) => {
    try {
      setTaskSubmitLoading(true);

      const selectedListId = formData.list || lists[0]?._id;

      if (!selectedListId) {
        setError('Please create a list before adding a task.');
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null,
      };

      if (editingTask) {
        await updateTask(editingTask._id, {
          ...payload,
          list: selectedListId,
        });
      } else {
        await createTask(selectedListId, payload);
      }

      await fetchBoardDetails();
      handleCloseTaskDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Task submission failed');
    } finally {
      setTaskSubmitLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('Delete this task?');

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteTask(taskId);
      await fetchBoardDetails();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (task, nextStatus) => {
    try {
      await updateTask(task._id, { status: nextStatus });

      await fetchBoardDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const statusColumns = statusOrder.map((status) => ({
    status,
    tasks: tasksByStatus[status] || [],
  }));

  const assignableUsers = users.filter((userItem) => {
    const boardMemberIds = (board?.members || []).map((member) => member?._id || member);
    const ownerId = board?.owner?._id || board?.owner;
    return boardMemberIds.includes(userItem._id) || ownerId === userItem._id;
  });

  if (loading) {
    return (
      <MainLayout title="Board Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={board?.title || 'Board Details'}>
      <Stack spacing={3}>
        <Box>
          <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>

          {board && (
            <Box>
              <Typography variant="h4" gutterBottom>
                {board.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {board.description || 'No description provided for this board.'}
              </Typography>
            </Box>
          )}
        </Box>

        {board && (
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, backgroundColor: '#fff' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Board Members
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {(board.members || []).map((member) => (
                    <Chip
                      key={member._id}
                      label={`${member.name} (${member.email})`}
                      color={member._id === (board.owner?._id || board.owner) ? 'primary' : 'default'}
                      onDelete={
                        isBoardOwner && member._id !== (board.owner?._id || board.owner)
                          ? () => handleRemoveMember(member._id)
                          : undefined
                      }
                    />
                  ))}
                </Stack>
              </Box>

              {isBoardOwner && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    label="Add member by email"
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    sx={{ minWidth: 250 }}
                  />
                  <Button variant="contained" onClick={handleAddMember} disabled={memberActionLoading}>
                    Add
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          {isBoardOwner && (
            <>
              <Button variant="contained" onClick={handleCreateList}>
                Create List
              </Button>
              <Button variant="contained" color="secondary" onClick={handleCreateTask}>
                Create Task
              </Button>
            </>
          )}
          <TaskFilter
            value={filterStatus}
            onChange={setFilterStatus}
            assignee={filterAssignee}
            onAssigneeChange={setFilterAssignee}
            assignees={assignableUsers}
            currentUser={user}
          />
        </Stack>

        <Divider />

        <ActivityList activities={activity} />

        {lists.length === 0 ? (
          <Alert severity="info">No lists in this board yet.</Alert>
        ) : (
          <Stack direction="column" spacing={3} sx={{ pb: 1 }}>
            {lists.map((list) => (
              <Box
                key={list._id}
                sx={{
                  width: '100%',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: '#fafafa',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">{list.title}</Typography>
                  {isBoardOwner && (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => handleEditList(list)}>
                        Edit List
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => handleDeleteList(list._id)}>
                        Delete List
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', alignItems: 'flex-start' }}>
                  {statusOrder.map((status) => (
                    <TaskColumn
                      key={`${list._id}-${status}`}
                      title={status}
                      list={list}
                      tasks={(tasksByList[list._id] || []).filter((task) => {
                        const matchesStatus = (task.status || 'To Do') === status;
                        const assignedUserId = task.assignedTo?._id || task.assignedTo;
                        const matchesAssignee =
                          filterAssignee === 'All' ||
                          (filterAssignee === 'Unassigned'
                            ? !assignedUserId
                            : assignedUserId?.toString() === filterAssignee.toString());

                        return matchesStatus && matchesAssignee;
                      })}
                      onAddTask={isBoardOwner ? () => handleCreateTask(list._id) : undefined}
                      onEditList={isBoardOwner ? handleEditList : undefined}
                      onDeleteList={isBoardOwner ? handleDeleteList : undefined}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onOpenDetails={handleOpenTaskDetails}
                      isBoardOwner={isBoardOwner}
                      currentUserId={currentUserId}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <ListForm
        open={listDialogOpen}
        onClose={handleCloseListDialog}
        onSubmit={handleListSubmit}
        initialData={editingList}
        loading={listSubmitLoading}
      />

      <TaskForm
        open={taskDialogOpen}
        onClose={handleCloseTaskDialog}
        onSubmit={handleTaskSubmit}
        initialData={editingTask || { list: defaultTaskListId }}
        loading={taskSubmitLoading}
        users={assignableUsers}
        lists={lists}
      />

      <TaskDetails
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default BoardDetailsPage;
