# CollabSphere ⚡

A modern, real-time team collaboration platform built with the MERN stack. CollabSphere enables teams to manage workspaces, projects, and tasks while communicating through real-time chat.


## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Role-Based Access**: Admin and Member roles with different permissions
- **Workspace Management**: Create and manage multiple workspaces
- **Project Organization**: Organize work into projects within workspaces
- **Task Management**: Kanban-style board with drag-and-drop functionality
- **Real-Time Chat**: Project-specific chat using Socket.IO
- **Profile Management**: Update profile information and avatar
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Bcrypt.js** - Password hashing

### Frontend
- **React** - UI library
- **Context API** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **React Icons** - Icon library
- **date-fns** - Date formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd testingthing
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabsphere
JWT_SECRET=your_very_secure_random_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit the frontend `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

### 5. Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application should now be running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## 👥 Usage

### Getting Started

1. **Register an Account**
   - Navigate to http://localhost:3000/register
   - Fill in your details and choose a role (Admin or Member)
   - Click "Create Account"

2. **Create a Workspace**
   - After logging in, click "Create Workspace"
   - Add a name and description
   - Invite team members by email

3. **Create Projects**
   - Inside a workspace, click "Create Project"
   - Add project details
   - Start adding tasks!

4. **Manage Tasks**
   - Use the Kanban board to organize tasks
   - Drag tasks between Todo, In Progress, and Done columns
   - Assign tasks to team members
   - Set priorities and due dates

5. **Real-Time Chat**
   - Open any project and click "Show Chat"
   - Communicate with your team in real-time
   - Messages are project-specific

6. **Customize Your Profile**
   - Click the profile icon in the navbar
   - Update your name and avatar
   - Change your password if needed

7. **Toggle Dark Mode**
   - Click the sun/moon icon in the navbar
   - Your preference is saved automatically
