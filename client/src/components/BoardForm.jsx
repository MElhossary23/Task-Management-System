import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const defaultValues = {
  title: '',
  description: '',
};

const BoardForm = ({ open, onClose, onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
      });
    }
  }, [open, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData?._id ? 'Edit Board' : 'Create Board'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Board Title"
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
            rows={4}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : initialData?._id ? 'Update Board' : 'Create Board'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BoardForm;
