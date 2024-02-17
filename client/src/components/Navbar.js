import './Navbar.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserInfo, signOut } from './authUtils';

function Navbar() {
  const [loggedIn, setLoggedIn] = useState(!!getUserInfo());

  useEffect(() => {
    setLoggedIn(!!getUserInfo());
  }, []);

  const handleSignOut = () => {
    signOut();
    setLoggedIn(false);
  };

  return (
    <nav className='nav'>
      <p><a href='/'>BoilerNow</a></p>
      <ul>
        <li><a href="/posts">Posts</a></li>
        <li><a href="/events">Events</a></li>
      </ul>
      <div className='nav-buttons'>
        {loggedIn ? (
          <button className="login" onClick={handleSignOut}>Sign Out</button>
        ) : (
          <Link to="/login"><button className="login">Login</button></Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;