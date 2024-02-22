import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
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
  
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setEmail('');
        setPassword('');
        alert('Login successful!');
        navigate('/profile');
      } else {
        alert('Incorrect email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to log in. Please try again later.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // const response = await axios.get('http://localhost:8000/auth/google');
      // console.log('Google login initiated:', response.data);
      window.open('http://localhost:8000/auth/google', '_blank');
    } catch (error) {
      console.error('Error initiating Google login:', error);
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
      <a href='/forgot-password'>forgot password</a>
      <button className='google-button' onClick={handleGoogleLogin}>Sign in with Google</button>
      <div className='login-buttons-container'>
        <button className='login-button' onClick={handleLogin}>login</button>
        <button className='sign-up-button' onClick={handleSignUpRedirect}>sign up</button>
      </div>
    </div>
  );
}

export default Login;
