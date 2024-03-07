import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css'
import { Toaster, toast } from 'sonner'

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register', {
        name,
        email,
        password
      });
      console.log('Signup response:', response.data);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      toast.success('Signup successful!')
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Failed to signup. Please try again later.');
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };
  return (
    <div className="signup-container">
      <Toaster richColors position="top-center"/>
      <h1>Sign Up</h1>
      <div>
        <label>name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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
      <div>
        <label>confirm password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className='sign-up-buttons-container'>
        <button className='sign-up-button' onClick={handleSignup}>sign up</button>
        <button className='login-button' onClick={handleLoginRedirect}>login</button>
      </div>
    </div>
  );
}

export default Signup;
