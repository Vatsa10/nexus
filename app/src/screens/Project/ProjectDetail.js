import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProjectDetail.css';
import TaskList from '../Task/TaskList';
import TaskCreation from '../Task/TaskCreation';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskCreation, setShowTaskCreation] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/projects/${id}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowTaskCreation = () => {
    setShowTaskCreation(true);
  };

  const handleCloseTaskCreation = () => {
    setShowTaskCreation(false);
    fetchTasks(); // Refresh tasks after creation
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="project-container">
      <header className="project-header">
        <h1>{project.name}</h1>
        <button className="new-task-btn" onClick={handleShowTaskCreation}>+ New Task</button>
      </header>
      <div className="project-content">
        <TaskList tasks={tasks} />
      </div>
      {showTaskCreation && <TaskCreation onClose={handleCloseTaskCreation} projectId={project.id} onTaskCreated={fetchTasks} />}
    </div>
  );
};

export default ProjectDetail;