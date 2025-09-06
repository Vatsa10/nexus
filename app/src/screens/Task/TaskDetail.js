import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchTask();
    fetchUsers();
    fetchMessages();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/tasks/${id}`);
      setTask(response.data);
      setTitle(response.data.title);
      setDescription(response.data.description);
      setAssignee(Array.isArray(response.data.assignee)
        ? response.data.assignee.map(email => ({ value: email, label: email }))
        : (response.data.assignee ? [{ value: response.data.assignee, label: response.data.assignee }] : []));
      setDueDate(response.data.dueDate || '');
      setStatus(response.data.status);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      setUsers(response.data.map(user => ({ value: user.email, label: user.email, id: user.id })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/tasks/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    try {
      // For now, senderId is hardcoded. In a real app, this would come from auth context.
      const senderId = 1; // Assuming a logged-in user with ID 1 for testing
      await axios.post(`http://localhost:3001/api/tasks/${id}/messages`, {
        senderId,
        message: newMessage,
      });
      setNewMessage('');
      fetchMessages(); // Refresh messages after sending
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/tasks/${id}`, {
        title,
        description,
        assignee: assignee.map(a => a.value),
        dueDate,
        status,
      });
      setIsEditing(false);
      fetchTask();
    } catch (error) {
      console.error(error);
    }
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-detail-container">
      <div className="task-detail-header">
        {isEditing ? (
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        ) : (
          <h2>{task.title}</h2>
        )}
        {isEditing ? (
          <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button className="edit-task-btn" onClick={handleEdit}>Edit</button>
        )}
      </div>
      <div className="task-detail-content">
        <div className="task-detail-item">
          <span className="task-detail-label">Description:</span>
          {isEditing ? (
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          ) : (
            <p>{task.description}</p>
          )}
        </div>
        <div className="task-detail-item">
          <span className="task-detail-label">Assignee:</span>
          {isEditing ? (
            <Select
              options={users}
              onChange={setAssignee}
              value={assignee}
              isMulti
              isClearable
              placeholder="Select assignee(s)"
            />
          ) : (
            <p>{Array.isArray(task.assignee) ? task.assignee.join(', ') : task.assignee || 'N/A'}</p>
          )}
        </div>
        <div className="task-detail-item">
          <span className="task-detail-label">Due Date:</span>
          {isEditing ? (
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          ) : (
            <p>{task.dueDate}</p>
          )}
        </div>
        <div className="task-detail-item">
          <span className="task-detail-label">Status:</span>
          {isEditing ? (
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          ) : (
            <p>{task.status}</p>
          )}
        </div>
      </div>

      <div className="task-chat-section">
        <h3>Chat</h3>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <strong>{msg.senderName}:</strong> {msg.message}
              <span className="timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;