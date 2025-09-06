import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import ProjectCreation from '../Project/ProjectCreation';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showProjectCreation, setShowProjectCreation] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowProjectCreation = () => {
    setShowProjectCreation(true);
  };

  const handleCloseProjectCreation = () => {
    setShowProjectCreation(false);
    fetchProjects();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>SynergySphere</h1>
        <button className="new-project-btn" onClick={handleShowProjectCreation}>+ New Project</button>
      </header>
      <div className="project-list">
        {projects.map((project) => (
          <Link key={project.id} to={`/project/${project.id}`} className="project-card-link">
            <div className="project-card">
              <h2>{project.name}</h2>
              <p>{project.summary}</p>
            </div>
          </Link>
        ))}
      </div>
      {showProjectCreation && <ProjectCreation onClose={handleCloseProjectCreation} />}
    </div>
  );
};

export default Dashboard;
