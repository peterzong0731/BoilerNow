import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/login', {
        email,
        password
      });
      console.log('Login response:', response.data);
      setEmail('');
      setPassword('');
      alert('Login successful!');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Failed to log in. Please try again later.');
    }
  };

  const handleSignUpRedirect = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="login-container">
      <h1>Log In</h1>
      <div>
        <label>email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className='login-buttons-container'>
        <button className='login-button' onClick={handleLogin}>login</button>
        <button className='sign-up-button' onClick={handleSignUpRedirect}>sign up</button>
      </div>
    </div>
  );
}

export default Login;
