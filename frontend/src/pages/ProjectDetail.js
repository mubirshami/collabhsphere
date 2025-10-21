import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { API_URL, SOCKET_URL } from '../config';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { FiPlus, FiArrowLeft, FiMessageSquare, FiSend } from 'react-icons/fi';
import { format } from 'date-fns';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });
  const [toast, setToast] = useState({ type: '', message: '' });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchProject = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to load project' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks?projectId=${id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to load tasks' });
    }
  }, [id]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [id]);

  useEffect(() => {
    // initial data load
    fetchProject();
    fetchTasks();
    fetchMessages();

    // Initialize socket connection
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('join-project', id);

    const onReceive = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on('receive-message', onReceive);

    return () => {
      if (socketRef.current) {
        socket.off('receive-message', onReceive);
        socket.emit('leave-project', id);
        socket.disconnect();
      }
    };
  }, [id, fetchProject, fetchTasks, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tasks`, {
        ...taskForm,
        projectId: id
      });
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        assignedTo: '',
        dueDate: ''
      });
      fetchTasks();
      setToast({ type: 'success', message: 'Task created' });
    } catch (error) {
      console.error('Error creating task:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create task' });
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status });
      fetchTasks();
      setToast({ type: 'success', message: 'Task updated' });
    } catch (error) {
      console.error('Error updating task:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to update task' });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current.emit('send-message', {
      content: newMessage,
      projectId: id,
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar
    });

    setNewMessage('');
    setToast({ type: 'success', message: 'Message sent' });
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/workspaces/${project?.workspace._id}`)}
        >
          <FiArrowLeft /> Back to Workspace
        </button>

        <div className="project-detail-header">
          <div>
            <h1>{project?.name}</h1>
            <p>{project?.description || 'No description'}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setShowChat(!showChat)}>
              <FiMessageSquare /> {showChat ? 'Hide' : 'Show'} Chat
            </button>
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <FiPlus /> Add Task
            </button>
          </div>
        </div>

        <div className="project-content">
          <div className="tasks-section">
            <div className="kanban-board">
              {['Todo', 'In Progress', 'Done'].map((status) => (
                <div key={status} className="kanban-column">
                  <div className="kanban-header">
                    <h3>{status}</h3>
                    <span className="task-count">{getTasksByStatus(status).length}</span>
                  </div>
                  <div className="kanban-tasks">
                    {getTasksByStatus(status).map((task) => (
                      <div key={task._id} className="task-card">
                        <h4>{task.title}</h4>
                        {task.description && <p>{task.description}</p>}
                        <div className="task-meta">
                          <span className={`badge badge-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          {task.assignedTo && (
                            <span className="task-assignee">
                              {task.assignedTo.name}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="task-due-date">
                            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                        <div className="task-actions">
                          {status !== 'Todo' && (
                            <button
                              className="btn-task-action"
                              onClick={() =>
                                handleUpdateTaskStatus(
                                  task._id,
                                  status === 'In Progress' ? 'Todo' : 'In Progress'
                                )
                              }
                            >
                              ←
                            </button>
                          )}
                          {status !== 'Done' && (
                            <button
                              className="btn-task-action"
                              onClick={() =>
                                handleUpdateTaskStatus(
                                  task._id,
                                  status === 'Todo' ? 'In Progress' : 'Done'
                                )
                              }
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showChat && (
            <div className="chat-section">
              <div className="chat-header">
                <h3>
                  <FiMessageSquare /> Team Chat
                </h3>
              </div>
              <div className="chat-messages">
                {messages.map((message) => {
                  // Graceful fallback in case server sometimes sends flat user fields
                  const senderId = message.sender?._id ?? message.userId;
                  const senderName = message.sender?.name ?? message.userName ?? 'Unknown';
                  const senderAvatar = message.sender?.avatar ?? message.userAvatar;

                  return (
                    <div
                      key={message._id || message.createdAt}
                      className={`message ${senderId === user._id ? 'message-own' : ''}`}
                    >
                      <div className="message-avatar">
                        {senderAvatar && senderAvatar.startsWith('/uploads') ? (
                          <img
                            src={senderAvatar}
                            alt="avatar"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          senderName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">{senderName}</span>
                          <span className="message-time">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                        </div>
                        <div className="message-text">{message.content}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary">
                  <FiSend />
                </button>
              </form>
            </div>
          )}
        </div>

        {showTaskModal && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Task</h2>
                <button className="modal-close" onClick={() => setShowTaskModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      className="form-control"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Assign To (Optional)</label>
                  <select
                    className="form-control"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {project?.members?.map((member) => {
                      const memId = member._id || member.user?._id;
                      const memName = member.name || member.user?.name;
                      return (
                        <option key={memId} value={memId}>
                          {memName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date (Optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: '', message: '' })}
      />
    </>
  );
};

export default ProjectDetail;
