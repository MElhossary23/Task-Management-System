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
};

const ListForm = ({ open, onClose, onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
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
      <DialogTitle>{initialData?._id ? 'Edit List' : 'Create List'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="List Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            autoFocus
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : initialData?._id ? 'Update List' : 'Create List'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ListForm;
