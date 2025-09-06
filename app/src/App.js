import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Router from './Router';
import Navbar from './components/Navbar';
import { NotificationProvider, useNotification } from './components/NotificationProvider';

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';
  const { addNotification } = useNotification();

  useEffect(() => {
    const socket = io('http://localhost:3001'); // Connect to your backend Socket.IO server

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('taskCreated', (task) => {
      addNotification(`New Task Created: ${task.title}`, 'success');
    });

    socket.on('taskUpdated', (task) => {
      addNotification(`Task Updated: ${task.title}`, 'info');
    });

    socket.on('deadlineApproaching', (task) => {
      addNotification(`Deadline Approaching: ${task.message}`, 'warning', 5000);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {showNavbar && <Navbar />}
      <main>
        <Router />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;