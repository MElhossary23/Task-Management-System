import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

const defaultValues = {
  title: '',
  description: '',
  status: 'To Do',
  assignedTo: '',
  dueDate: '',
  list: '',
};

const statusOptions = ['To Do', 'In Progress', 'Done'];

const TaskForm = ({ open, onClose, onSubmit, initialData, loading, users, lists }) => {
  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    if (open) {
      const selectedListId = initialData?.list?._id || initialData?.list || lists?.[0]?._id || '';

      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'To Do',
        assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || '',
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        list: selectedListId,
      });
    }
  }, [open, initialData, lists]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData?._id ? 'Edit Task' : 'Create Task'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />

            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="List"
              name="list"
              value={formData.list}
              onChange={handleChange}
            >
              {lists?.map((list) => (
                <MenuItem key={list._id} value={list._id}>
                  {list.title}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={users || []}
              getOptionLabel={(option) => option?.name ? `${option.name} (${option.email})` : ''}
              value={users?.find((user) => user._id === formData.assignedTo) || null}
              onChange={(event, newValue) => {
                setFormData((prev) => ({ ...prev, assignedTo: newValue?._id || '' }));
              }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField {...params} label="Assign to user" />
              )}
            />

            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? 'Saving...' : initialData?._id ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
