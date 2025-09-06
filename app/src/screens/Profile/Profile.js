import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:3001/api/user/${userId}`);
      setUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
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
      const userId = localStorage.getItem('userId');
      await axios.put(`http://localhost:3001/api/user/${userId}`, { name, email });
      setIsEditing(false);
      fetchUser();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
        {isEditing ? (
          <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button onClick={handleEdit}>Edit</button>
        )}
      </div>
      <div className="profile-content">
        <div className="profile-info">
          <p>
            <span className="profile-label">Name:</span>
            {isEditing ? (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            ) : (
              <span>{user.name}</span>
            )}
          </p>
          <p>
            <span className="profile-label">Email:</span>
            {isEditing ? (
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            ) : (
              <span>{user.email}</span>
            )}
          </p>
        </div>
        <div className="profile-settings">
          <h3>Settings</h3>
          <div className="setting-item">
            <label htmlFor="notifications">Enable Notifications</label>
            <input type="checkbox" id="notifications" />
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;