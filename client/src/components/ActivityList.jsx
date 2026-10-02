import {
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

const formatDate = (value) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString();
};

const ActivityList = ({ activities = [] }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Activity
      </Typography>

      {activities.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No recent activity for this board.
        </Typography>
      ) : (
        <List dense>
          {activities.map((activity) => (
            <ListItem key={activity._id} alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {activity.user?.name || 'System'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(activity.createdAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {activity.action}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ActivityList;
