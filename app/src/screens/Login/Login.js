import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:3001/api/login' : 'http://localhost:3001/api/signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(url, payload);
      if (isLogin && response.data.user) {
        localStorage.setItem('userId', response.data.user.id);
        navigate('/dashboard');
      } else if (!isLogin) {
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo">SynergySphere</div>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <div className="form-footer">
          {isLogin ? (
            <>
              <a href="#">Forgot Password?</a>
              <p>
                Don't have an account? <button onClick={toggleForm}>Sign Up</button>
              </p>
            </>
          ) : (
            <p>
              Already have an account? <button onClick={toggleForm}>Login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
