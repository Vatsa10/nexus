import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TaskList.css';

const TaskList = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="task-list-container">
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <h3>{task.title}</h3>
            <p>Assignee: {Array.isArray(task.assignee) ? task.assignee.join(', ') : task.assignee || 'N/A'}</p>
            <p>Due Date: {task.dueDate}</p>
            <Link to={`/task/${task.id}`} className="view-task-btn">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
