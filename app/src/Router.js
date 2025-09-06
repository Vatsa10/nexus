import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './screens/Login/Login';
import Dashboard from './screens/Dashboard/Dashboard';
import ProjectDetail from './screens/Project/ProjectDetail'; // Corrected import
import TaskDetail from './screens/Task/TaskDetail';
import Profile from './screens/Profile/Profile';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/task/:id" element={<TaskDetail />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default Router;