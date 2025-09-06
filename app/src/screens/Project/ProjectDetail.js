import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProjectDetail.css';
import TaskList from '../Task/TaskList';
import TaskCreation from '../Task/TaskCreation';

const Project = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [showTaskCreation, setShowTaskCreation] = useState(false);

  useEffect(() => {
    // Fetch project details from the server based on the id
    // For now, we will use dummy data
    const projects = [
      { id: 1, name: 'Project Alpha' },
      { id: 2, name: 'Project Beta' },
      { id: 3, name: 'Project Gamma' },
    ];
    const currentProject = projects.find((p) => p.id === parseInt(id));
    setProject(currentProject);
  }, [id]);

  const handleShowTaskCreation = () => {
    setShowTaskCreation(true);
  };

  const handleCloseTaskCreation = () => {
    setShowTaskCreation(false);
    // Optionally, refresh tasks after creation
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
        <TaskList projectId={project.id} />
      </div>
      {showTaskCreation && <TaskCreation onClose={handleCloseTaskCreation} projectId={project.id} />}
    </div>
  );
};

export default Project;
