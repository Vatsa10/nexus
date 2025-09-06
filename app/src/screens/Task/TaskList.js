import React from 'react';
import { Link } from 'react-router-dom';
import './TaskList.css';

const TaskList = ({ tasks }) => {
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