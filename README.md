# Task Management System

A full-stack Trello-style task management application built with Node.js, Express, MongoDB, React, and MUI. It allows users to create boards, organize lists, create tasks, assign team members, filter tasks, add comments, and review activity history.

## Features

- User authentication with JWT
- Board creation and ownership control
- List management inside boards
- Task creation, editing, deletion, and assignment
- Task filtering and pagination
- Comment support on tasks
- Activity timeline for each board
- Responsive UI with Material UI
- Centralized backend error handling

## Technologies

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- cors
- helmet
- express-rate-limit

### Frontend

- React
- Vite
- MUI
- Axios
- React Router

## Project Structure

```text
fullStack/
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── main.jsx
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── theme/
└── server/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── utils/
        └── validators/
```

## Database Model Relationships

- User → Board
- Board → List
- List → Task
- Task → User (assignment)
- Task → Comment
- Comment → User
- Board → ActivityLog
- User → ActivityLog

## Installation

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

## Environment Variables

Create a `.env` file in the server folder.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

Frontend environment:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Project

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

## Postman Collection

A ready-to-import collection is included at [postman_collection.json](postman_collection.json). Import it into Postman and set the authorization token variable after logging in.

## Main API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- GET /api/users/me

### Users

- GET /api/users

### Boards

- POST /api/boards
- GET /api/boards
- GET /api/boards/:id
- PUT /api/boards/:id
- DELETE /api/boards/:id
- GET /api/boards/:boardId/activity

### Lists

- POST /api/boards/:boardId/lists
- GET /api/boards/:boardId/lists
- GET /api/lists/:id
- PUT /api/lists/:id
- DELETE /api/lists/:id

### Tasks

- POST /api/lists/:listId/tasks
- GET /api/lists/:listId/tasks
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Comments

- POST /api/tasks/:taskId/comments
- GET /api/tasks/:taskId/comments
- PUT /api/comments/:id
- DELETE /api/comments/:id

## Authentication

The API uses JWT-based authentication. After login, the client receives a token and sends it in the Authorization header as a Bearer token. Protected routes validate the token and enforce ownership rules.

## Future Improvements

- Drag-and-drop Kanban board
- Team invites and roles
- Real-time updates with WebSockets
- Task labels and priorities
- Search and advanced filters
- Dark mode
- Upload attachments

## Notes

This project is intentionally beginner-friendly, clean, and focused on the core Task Management System workflow required for academic evaluation.
