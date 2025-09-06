import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './TaskCreation.css';

const TaskCreation = ({ onClose, projectId, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('To Do');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users');
        setUsers(response.data.map(user => ({ value: user.email, label: user.email })));
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/tasks', {
        title,
        description,
        assignee: assignee.map(a => a.value),
        dueDate,
        status,
        projectId,
      });
      onTaskCreated(); // Call the callback to refresh the task list
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="assignee">Assignee</label>
            <Select
              id="assignee"
              options={users}
              onChange={setAssignee}
              value={assignee}
              isClearable
              isMulti
              placeholder="Select assignee(s)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Create</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreation;
