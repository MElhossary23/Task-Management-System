import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';

const TaskFilter = ({
  value,
  onChange,
  assignee,
  onAssigneeChange,
  assignees = [],
  currentUser,
}) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <FormControl sx={{ minWidth: 180 }} size="small">
        <InputLabel id="task-filter-label">Filter by status</InputLabel>
        <Select
          labelId="task-filter-label"
          value={value}
          label="Filter by status"
          onChange={(event) => onChange(event.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="To Do">To Do</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Done">Done</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 220 }} size="small">
        <InputLabel id="assignee-filter-label">Filter by user</InputLabel>
        <Select
          labelId="assignee-filter-label"
          value={assignee}
          label="Filter by user"
          onChange={(event) => onAssigneeChange(event.target.value)}
        >
          <MenuItem value="All">All users</MenuItem>
          {currentUser?._id && (
            <MenuItem value={currentUser._id}>
              My tasks ({currentUser.email})
            </MenuItem>
          )}
          <MenuItem value="Unassigned">Unassigned</MenuItem>
          {assignees
            .filter((user) => user._id !== currentUser?._id)
            .map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.email} ({user.name})
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default TaskFilter;
